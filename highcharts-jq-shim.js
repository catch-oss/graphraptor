// this file should be shimmed in as a dependency of highcharts
;(function (root, factory) {

    // AMD. Register as an anonymous module depending on jQuery.
    if (typeof define === 'function' && define.amd) define(['jquery'], factory);

    // Node, CommonJS-like
    else if (typeof exports === 'object') module.exports = factory(require('jquery'));

    // Browser globals (root is window)
    else {
        root.catch = (root.catch || {});
        root.catch.highchartsJqShim = factory(root.jQuery);
    }

}(this, function ($, undefined) {

    root.jQuery = $;
}))
