/*
jQuery Pop Menu
Version: beta
Author: Guc. http://www.gucheen.pro
Based on jQuery 2.0.3
*/

(function ($) {

    $.fn.popmenu = function (options) {

        var settings = $.extend({
            'controller': true,
            'width': '300px',
            'background': '#34495e',
            'focusColor': '#1abc9c',
            'borderRadius': '10px',
            'top': '50',
            'left': '0',
            'iconSize': '300px',
            'color': '#fff',
            'border': '0px'
        }, options);
        if (settings.controller === true) {
            var temp_display = 'none';
        } else {
            var temp_display = 'block';
        }
        var tar = $(this);
        var tar_body = tar.children('#layerContainer');
      
        var tar_ctrl = tar.children('.layer_pop_ctrl');

        function setIt() {
            tar_body.css({
                'display': temp_display,
                'position': 'absolute',
                'margin-top': -settings.top,
                'margin-left': -settings.left,
                'background': settings.background,
                'width': settings.width,
                'float': 'left',
                'padding': '5',
                'border-radius': settings.borderRadius,
                'border': settings.border,
                'z-index':1000
            });
          
            tar_ctrl.hover(function () {
                tar_ctrl.css('cursor', 'pointer');
            }, function () {
                tar_ctrl.css('cursor', 'default')
            });
            tar_ctrl.click(function (e) {
                e.preventDefault();
                tar_body.show('fast');
                $(document).mouseup(function (e) {
                    var _con = tar_body;
                    if (!_con.is(e.target) && _con.has(e.target).length === 0) {
                        _con.hide();
                    }
                    //_con.hide(); some functions you want

                });

            });
           
        }
        return setIt();
    };

}(jQuery));
