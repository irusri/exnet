jQuery.download = function(url, data, method){
	//url and data options required
	if( url && data ){
		//data can be string of parameters or array/object
		// data = typeof data == 'string' ? data : jQuery.param(data);
		var inputs = '';
		if ($.isPlainObject(data)) {
			for (key in data) {
				if ($.isArray(data[key])) {
					for (var i = 0; i < data[key].length; i++) {
						inputs += '<input type="hidden" name="'+key+'[]" value="'+data[key][i]+'" />';
					}
				} else if (typeof data[key] === 'string') {
					inputs += '<input type="hidden" name="'+key+'" value="'+data[key]+'" />';
				}
			}
		} else if (typeof data === 'string') {
			//split params into form inputs
			jQuery.each(data.split('&'), function(){ 
				var pair = this.split('=');
				inputs+='<input type="hidden" name="'+ pair[0] +'" value="'+ pair[1] +'" />'; 
			});
		}
		//send request
		jQuery('<form action="'+ url +'" method="'+ (method||'post') +'">'+inputs+'</form>')
		.appendTo('body').submit().remove();
	};
};