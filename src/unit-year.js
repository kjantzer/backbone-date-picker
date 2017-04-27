define(['unit'], function(UnitView){

	return UnitView.extend({
		
		key: 'year',
		minLength: 4,
		maxLength: 4,
		
		format: function(val){
			return val === '' ? this.options.placeholder : val;
		},
		
		// `val` will always be a number string or empty string
		validate: function(val){
			if( !val || val.length !== 4 ) return false
			return true
		}
		
	})

});