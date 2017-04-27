define(function(){

	return Backbone.Model.extend({
		
		initialize: function(attr){
			
			this.date = attr.val ? moment(attr.val) : moment().startOf('year')
			this.set('original_val', attr.val)
			this.updateAttrs()
			
		},
		
		dateValue: function(){
			return this.date.format('YYYY-MM-DD')
		},
		
		updateAttrs: function(){
			var val = this.get('val')
			this.set({
				'val': val ? this.dateValue() : '',
				'year': val ? this.date.year() : '',
				'month': val ? this.date.month() : '',
				'date': val ? this.date.date() : ''
			})
		},
		
		changeDate: function(key, val){
			if( key == 'date' ) key = 'day'
			this.date.add(val, key);
			this.save()
		},
		
		setDate: function(key, val){
			
			if( key == 'month' && _.isString(val) )
				val = parseInt(val) - 1; // months are zero indexed
			
			this.date.set(key, val);
			this.save()
		},
		
		save: function(){
			this.set('val', this.dateValue())
			this.updateAttrs()
		},
		
		reset: function(){
			this.set('val', this.get('original_val'))
			if( this.get('val') )
				this.date = moment(this.get('val'))
			this.updateAttrs()
		}
	
	});

});