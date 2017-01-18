/*!
 * Center-Loader PACKAGED v1.0.0
 * http://plugins.rohitkhatri.com/center-loader/
 * MIT License
 * by Rohit Khatri
 */

$.fn.loader = function(action,spinner) {
	var action = action || 'show';
	if(!spinner) {
		spinner = '<img style="height:50px; width:50px;" src="img/load/loading2.gif">';
	}
	if(action === 'show') {
		if(this.find('.loader').length == 0) {
            parent_position = this.css('position');
			old_display = this.css('display');
			this.css('position','relative');
			this.css('display','block');
            mapWidth = myMap.getSize().x;
            mapHeight = myMap.getSize().y;
			$loader = $('<div class="loader"></div>').css({
				'position': 'absolute',
				// 'width': '50px',
				// 'height': '50px',
				// 'background-color': 'rgba(255,255,255,0)',
				// 'border-radius': '3px'
			});
			$loader.attr('parent_position',parent_position);
			$spinner = $(spinner).css({
                // 'position': 'absolute',
		    	// 'color': '#f9d61e',
			});
			$loader.html($spinner);
            marginLeft = $loader.width()/2;
            marginTop = $loader.height()/2;
            $loader.css({
                'left': mapWidth/2 - marginLeft + 'px',
                'top': mapHeight/2 - marginTop + 'px',
			})
			this.prepend($loader);
		}
	} else if(action === 'hide') {
		this.css('position', old_display);
		this.find('.loader').remove();
	}
};