;(function (root, factory) {

    // AMD. Register as an anonymous module depending on jQuery.
    if (typeof define === 'function' && define.amd)
        define(
            [
                'jquery',
                '../highcharts/highcharts',
                '../moment/moment'
            ],
            factory
        );

    // Node, CommonJS-like
    else if (typeof exports === 'object')
        module.exports = factory(
            require('jquery'),
            require('../highcharts/highcharts'),
            require('../moment/moment')
        );

    // Browser globals (root is window)
    else {
        root.graphraptor = factory(
            root.jQuery,
            root.Highcharts,
            root.moment
        );
    }

}(this, function($, Highcharts, moment, undefined) {

    var threeLabels = function(elem){
        var labels = $(elem).find('.highcharts-xaxis-labels text[y!=-9999]');
        labels.css('display','none');
        if(!$(elem).data('noLabels')){
            labels.first().css('display','block');
            labels.last().css('display','block');
            $(labels[Math.floor(labels.length/2)]).css('display','block');
        }
    }

    // Create the defaults once
    var pluginName = "graph",
        defaults = {
            data: {},
            url: null,
            showAverage: false,
            title: "",
            unit: "",
            dataType: "",
            graphType: "line"
        };

    // The actual plugin constructor
    function Plugin ( element, options ) {
        this.element = element;
        this.settings = $.extend( {}, defaults, options, $(element).data());
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    // Avoid Plugin.prototype conflicts
    $.extend(Plugin.prototype, {
        init: function () {
            this.draw();
        },
        makeGraph: function () {

            var self = this,
                el = $(this.element),
                keys = [],
                values = [],
                average = 0;

            $.each(this.settings.data, function(key,value) {
                keys.push(key);
                values.push(value);
                average += value;
            });

            keys = $.map(keys,function(key) {
                return moment(key).format('D\xA0MMM')
            })

            average = average/keys.length;
            keys = [''].concat(keys);
            values = [null].concat(values).concat([null]);

            //If there was no values to start with, the length will now be
            // 2. There is no data to display, so we must return to Avoid
            // the while loop being infinate
            if(values.length == 2){
                return;
            }

            var lastDay = values.length-1;
            while(lastDay > 0 && [null, undefined].indexOf(values[lastDay]) != -1){
                lastDay--;
            }

            var averageLine = []
            if (this.settings.showAverage) {
                averageLine.push({
                    color:"#b7b7b7",
                    dashStyle: "LongDash",
                    value:average,
                    width:2
                });
            }

            Highcharts.setOptions({
                chart: {
                    backgroundColor: el.data('background') || "#F9F9F9"
                }
            });

            el.highcharts({
                credits: {
                    enabled: false
                },
                chart: {
                    events: {
                        redraw: function(){
                            threeLabels(this.container);
                        }
                    }
                },
                xAxis: {
                    plotLines: this.settings.graphType =='line' ? [{
                        color:"#00a7e5",
                        dashStyle: "LongDash",
                        value:lastDay,
                        width:2
                    }] : [],
                    tickWidth: 0,
                    tickmarkPlacement: 'on',
                    min:1,
                    max:values.length-2,
                    labels: {
                        overflow:'justify',
                        maxStaggerLines: 1,
                        style: {
                            fontSize: "15px",
                            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
                        }
                    },
                    categories: keys//['',"1/10/2014", "2/10/2014", "3/10/2014", "4/10/2014", "5/10/2014", "6/10/2014", "7/10/2014", "8/10/2014", "9/10/2014", "10/10/2014", "11/10/2014", "12/10/2014", "13/10/2014", "14/10/2014", "15/10/2014", "16/10/2014", "19/10/2014", "21/10/2014", "23/10/2014", "24/10/2014", "25/10/2014", "26/10/2014", "27/10/2014", "30/10/2014", "31/10/2014"]
                },
                yAxis: {
                    gridLineWidth: 0,
                    minorGridLineWidth: 0,
                    plotLines: [{
                        color:"black",
                        value:0,
                        width:2
                    }].concat(this.settings.graphType =='line' ? averageLine : []),
                    min: 0,
                    labels:{
                        enabled: this.settings.graphType == 'line',
                        style: {
                            fontSize: "15px",
                            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif'
                        },
                        format: "{value}" + (this.settings.unit=="MB" ? "MB" : (" "+this.settings.unit))
                    },
                    title:{
                        style:{
                            fontSize: "18px"
                        },
                        text: ''//this.settings.dataType
                    }
                },
                title: {
                    text: ""//this.settings.title//'Such MBs'
                },
                legend: {
                    enabled: false
                },
                tooltip: {
                    enabled: this.settings.graphType == 'line',
                    style:{
                        fontSize:"15px",
                        fontWeight:"bold",
                    },
                    headerFormat:"",
                    useHTML:true,
                    formatter:function(){
                    return "<center style='padding:0 20px'><strong style='font-size:18px'>"+this.y+(self.settings.unit=="MB"?"MB":(" "+self.settings.unit))+"</strong><br/>"+"<span style='color:#b7b7b7'>"+this.x+"</span></center>"
                    }
                },
                navigation: {
                    buttonOptions: {
                        enabled: false
                    }
                },
                series: [{
                    pointPadding: 0,
                    groupPadding: 0.1,
                    color:"#007dc5",
                    animation: false,
                    type: this.settings.graphType,//'line',
                    name: this.settings.dataType,//'Data',
                    data: values,//[null,3.66,22.98,55.06,16.65,23.39,11.72,5.59,11.76,41.8,10.56,41.32,23.78,2.73,12.37,70.86,0.08,20.18,92.25,7.84,73.25,20.14,48.14,95.83,103.06,0.01,null],
                    marker: {
                        radius: 6
                    }
                }]
            });
            el.find('.highcharts-container').data('noLabels',el.data('noLabels'));
            threeLabels(el);
        },
        draw: function() {
            if (this.settings.url) {
                var self = this;
                $.getJSON(this.settings.url)
                    .done(function(data){
                        self.settings.data = data;
                        self.makeGraph();
                    })
                    .fail(function(data){
                        console.error("Graph data request failed ",data);
                    });
            }
            else {
                self.makeGraph();
            }
        },
        update: function() {

            // update settings
            this.settings.url = $(this.element).attr('data-url');

            // do the drawing
            this.draw();
        }
    });

    // A really lightweight plugin wrapper around the constructor,
    // preventing against multiple instantiations
    $.fn[ pluginName ] = function ( options, params ) {

        this.each(function() {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin(this, options));
            } else if (options == 'update') {
                $.data(this, "plugin_" + pluginName).update(params);
            }
        });

        // chain jQuery functions
        return this;
    };

}));
