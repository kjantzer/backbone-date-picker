define(['unit'], function(UnitView){

	return UnitView.extend({
		
		key: 'month',
		maxLength: 2,
		
		format: function(val){
			if( _.isFunction(this.options.format) )
				return this.options.format(val)
			else if( val === '' )
				return this.options.placeholder
			else if( this.options.format == 'long' )
				return moment.months()[val]
			else if( this.options.format == 'short' )
				return moment.monthsShort()[val]
			else
				return _.lpad(val+1, 2, '0')
		},
		
		// `val` will always be a number string or empty string
		validate: function(val){
			if( !val || val.length > 2 ) return false
			return true
		}
		
	})

});