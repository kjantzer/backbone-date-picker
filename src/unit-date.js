define(['unit'], function(UnitView){

	return UnitView.extend({
		
		key: 'date',
		maxLength: 2,
		
		format: function(val){
			if( _.isFunction(this.options.format) )
				return this.options.format(val)
			else if( val === '' )
				return this.options.placeholder
			else
				return _.lpad(val, 2, '0')
		},
		
		// `val` will always be a number string or empty string
		validate: function(val){
			if( !val || val.length > 2 ) return false
			return true
		}
		
	})

});