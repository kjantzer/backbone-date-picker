define(function(){

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