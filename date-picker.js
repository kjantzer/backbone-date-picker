define('model',[],function(){

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
define('unit',[],function(){

	return Backbone.View.extend({
	
		className: 'unit',
		
		events: {
			'mousewheel': 'onMouseWheel',
			'mouseenter': 'activate',
			'mouseleave': 'deactivate',
			'click': 'activate'
		},
		
		val: function(){
			return this.model.get(this.key)
		},
		
		format: function(val){
			return val === '' ? '__' : val;
		},
		
		validate: function(val){
			return false
		},
		
		initialize: function(opts){
			
			this.el.classList.add('unit-'+this.key)
			
			if( this.options.divider )
				this.el.dataset.divider = this.options.divider
			
			this._onType = this.onType.bind(this)
			
			this.delta = 0
			this.typedVal = '';
			
			this.listenTo(this.model, 'change:'+this.key, this.render)
		},
		
		render: function(){
			
			if( this.typedVal )
				this.$el.html( this.typedVal )
			else
				this.$el.html( this.format(this.val()) )
			
			return this;
		},
		
		onMouseWheel: function(e){
			
			clearTimeout(this.onMouseWheelTimeout)
			
			e.preventDefault()
			e.stopPropagation()
			
			e = e.originalEvent
			// var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
			var delta = e.wheelDelta
			
			// if scrolling switched directions, reset delta back to 0
			if( (this.delta < 0 && delta > 0) || (this.delta > 0 && delta < 0) )
				this.delta = 0;
				
			this.delta += delta;
			
			// if we've scrolled enough, trigger a value change
			if( Math.abs(this.delta) >= this.options.deltaThreshold ){
				
				this.delta < 0 ? this.decrease() : this.increase()
				
				// then reset the delta to begin counting the threshold again
				this.delta = 0;
			}
			
			// reset delta after scrolling has stopped
			this.onMouseWheelTimeout = setTimeout(function(){
				this.delta = 0;
			}.bind(this),100)
			
			return false;
		},
		
		decrease: function(){
			this.model.changeDate(this.key, -1)
		},
		
		increase: function(){
			this.model.changeDate(this.key, 1)
		},
		
		activate: function(){
			if( window.__activeDatePickerUnit ) window.__activeDatePickerUnit.deactivate()
			window.__activeDatePickerUnit = this;
			this.el.classList.add('active')
			window.addEventListener('keydown', this._onType)
		},
		
		deactivate: function(){
			if( window.__activeDatePickerUnit == this )
				window.__activeDatePickerUnit = null;
			this.el.classList.remove('active')
			window.removeEventListener('keydown', this._onType)
			
			this.useTypedValue()
		},
		
		isActive: function(){
			return this.el.classList.contains('active')
		},
		
		onType: function(e){
			
			// backspace
			if( e.which == 8 ){
				e.preventDefault()
				e.stopPropagation()
				this.typedVal = this.typedVal.substr(0, this.typedVal.length-1)
				this.render();
				return false;
			}
			
			// esc
			if( e.which == 27 ){
				e.preventDefault()
				e.stopPropagation()
				this.typedVal = '';
				this.parentView.reset()
				return false;
			}
			
			// tab, left arrow, right arrow, enter
			if( e.which == 9 || e.which == 37 || e.which == 39 || e.which == 13){
				e.preventDefault()
				e.stopPropagation()
				
				if( e.which == 13 )
					this.deactivate()
				else if( e.shiftKey || e.which == 37 )
					this.parentView.activatePrev()
				else
					this.parentView.activateNext()
				
				return false;
			}
			
			// only accept numbers
			// TODO: I think I need to get codes for number pad too
			if( e.which < 48 || e.which > 57 ) return;
			
			this.typedVal += String.fromCharCode(e.which) // keep as a string so the values concatenate
			
			this.render();
			
			if( this.maxLength && this.typedVal.length >= this.maxLength )
				this.useTypedValue()
			else if( !this.minLength || this.typedVal.length >= this.minLength )
				this._onTypeTimeout = setTimeout(this.useTypedValue.bind(this), this.options.typeDelay)
		},
		
		typedValueIsValid: function(){
			return this.validate(this.typedVal)
		},
		
		useTypedValue: function(){
			
			if( this.typedValueIsValid() ){
				this.model.setDate(this.key, this.typedVal)
				this.parentView.activateNext(false)
			}
			
			this.typedVal = '';
			this.render();
		}
	
	});

});
define('unit-year',['unit'], function(UnitView){

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
define('unit-month',['unit'], function(UnitView){

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
define('unit-date',['unit'], function(UnitView){

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
define('date-picker',[
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

//# sourceMappingURL=date-picker.js.map