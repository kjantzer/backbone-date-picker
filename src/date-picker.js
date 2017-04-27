/*
	Backbone.js Date Picker
	
	@author Kevin Jantzer, Blackstone Audio Inc.
	@since 2017-04-26
	
	@TODO
	- add ability to scroll a unit and only change that unit (right now, if scrolling from Dec to Jan, the year will change)
	- add support for time?
	- method for "setting" the date after initialization
	- add date range limiting (min and/or max)
	- add option for turning scroll feature off?
*/
define([
	'model',
	'unit-year',
	'unit-month',
	'unit-date'
], function(Model, YearView, MonthView, DateView){

	return Backbone.View.extend({
	
		className: 'datepicker',
		
		events: {
			'mouseenter': 'onHover',
			'mouseleave': 'blur'
		},
		
		appendTo: function(el){
			if( _.isString(el) )
				el = document.querySelector(el)
			this.render().$el.appendTo(el)
		},
		
		defaultOpts: {
			appendTo: null,
			val: '',
			format: 'y-m-d',
			valFormat: 'YYYY-MM-DD',
			className: '',
			deltaThreshold: 70, // how much scrolling is needed to change values
			typeDelay: 340, // how long between keystrokes before using value
			navLink: true, // when navigating units and reaching the end, will jump to next date picker if right next
			saveOnBlur: true,
			onSave: null,
			onBlur: null,
			
			// options for each unit
			y: {
				placeholder: 'yyyy'
			}, 
			m: {
				format: '', // short, long, fn()
				placeholder: 'mm'
			},
			d: {
				format: '', // fn()
				placeholder: 'dd'
			}
		},
		
		initialize: function(){
			
			if( !window.moment ) return;
			
			this.el.datepicker = this;
			
			this.options = _.extend({}, this.defaultOpts, this.options)
			this.format = this.options.format.toLowerCase().split('')
			this.unitViews = []
			this.model = new Model({val: this.options.val})
			
			if( this.options.className )
				this.el.classList.add(this.options.className)
				
			if( this.options.appendTo )
				this.appendTo(this.options.appendTo)
		},
		
		render: function(){
			
			if( !window.moment ){
				this.$el.html('missing moment.js')
				return this;
			}
			
			window.dp = this; // TEMP
			
			// only render once
			if( this.unitViews.length == 0 )
				this.format.forEach(this.renderUnit.bind(this))
			
			return this
		},
		
		renderUnit: function(key){
			var View;
			switch(key){
				case 'y': View = YearView; break;
				case 'm': View = MonthView; break;
				case 'd': View = DateView; break;
			}
			
			if( !View ){
				this.divider = key
				return;
			}
			
			var opts = _.extend({
				divider: this.divider,
				deltaThreshold: this.options.deltaThreshold,
				typeDelay: this.options.typeDelay,
				model: this.model
			}, this.defaultOpts[key], this.options[key])
			
			var view = new View(opts)
			view.parentView = this
			this.$el.append( view.render().el )
			
			this.unitViews.push(view)
			
			this.divider = ''
		},
		
		activeView: function(){
			var view
			this.unitViews.forEach(function(v){
				if( v.isActive() ) view = v
			})
			return view
		},
		
		_activate: function(jump, loop){
			var view = this.activeView();
			var indx = this.unitViews.indexOf(view)
			
			if( view ){
				view.deactivate()
				indx += jump
			}else{
				indx = 0;
			}
			
			if( indx > this.unitViews.length - 1){
				if( loop === false ) return
				if( this.options.navLink && this.el.nextElementSibling && this.el.nextElementSibling.datepicker ){
					this.blur();
					this.el.nextElementSibling.datepicker.focus()
					return;
				}
				indx = 0
			}else if( indx < 0 ){
				if( loop === false ) return
				if( this.options.navLink && this.el.previousElementSibling && this.el.previousElementSibling.datepicker ){
					this.blur();
					this.el.previousElementSibling.datepicker.focusLast()
					return;
				}
				indx = this.unitViews.length - 1
			}
			
			view = this.unitViews[indx]
			view && view.activate()
		},
		
		activateNext: function(loop){
			this._activate(1, loop)
		},
		
		activatePrev: function(loop){
			this._activate(-1, loop)
		},
		
		focus: function(num){
			this.blur()
			this.unitViews[num||0].activate()
		},
		
		focusLast: function(){
			this.focus(this.unitViews.length-1)
		},
		
		blur: function(){
			
			if( !window.moment ) return;
			
			var view = this.activeView()
			view && view.deactivate()
			
			this.el.classList.remove('editing');
			
			// value is different than last time so trigger a save request
			if( this.model.get('val') != this.options.val ){
				
				// if the value is the same as the original, dont consider unsaved
				if( this.model.get('val') === this.model.get('original_val') )
					this.el.classList.remove('unsaved');
				else
					this.el.classList.add('unsaved');
				
				this.options.val = this.model.dateValue()
				
				if( this.options.saveOnBlur )
					this.save();
				
				if( this.options.onSave )
					this.options.onSave(this, this.value())
			}
			
			if( this.options.onBlur ){
				this.options.onBlur(this)
			}
			
		},
		
		value: function(){
			return this.model.date.format(this.options.valFormat)
		},
		
		reset: function(){
			this.model.reset()
			if( this.model.get('val') === this.model.get('original_val') )
				this.el.classList.remove('unsaved');
		},
		
		save: function(){
			this.model.set('original_val', this.model.get('val'))
			this.el.classList.remove('unsaved');
		},
		
		onHover: function(){
			this.el.classList.add('editing');
		}
	
	});

});