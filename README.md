# Date Picker 0.1.0

> An inline date picker based on and Moment.js and Backbone.js

![Screenshot](http://i.imgur.com/ef380D7.png)

### [Demo & documentation](http://kjantzer.github.io/backbone-date-picker/)

### Overview

There are a lot of date pickers that use a calendar approach, but this plugin attempts to keep the process as simple and minimal as possible by letting the user edit the date in line.

Once hovered over a date unit, a user can type the number they want or use the scroll wheel to quickly change the value.

Pressing tab, shift+tab, or left/right arrow keys will navigate between the different units. Hitting esc will reset the value (while editing and before picker is saved)

***

### Example Usage

```
new DatePicker({
    appendTo: '#demo1',
    format:'m/d/y'
})
```

#### Month and year only 

```
new DatePicker({
    appendTo: '#demo4',
    format:'my',
    m: {format: 'long'},
    val: new Date()
})
```

***

### Options

```
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
}
```