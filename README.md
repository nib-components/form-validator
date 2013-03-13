# Form Validator

Add validation to forms using data attributes or using a schema. Error messages are
automatically created using the tip component.

    var Validator = require('form-validator');
    var form = new Validator({
      el: document.getElementById('blah')
    });

This will create a new validator that will trigger when the user clicks a `.js-submit`
element within the form. If no schema or messages are passed in it will try to build
them from data attributes on the form.

To automatically add validation to any form you can set up a method that is called on 
every page:

    var Validator = require('form-validator');
    Validator.create('.js-validate-form');

This will add validation to any form with that class and it will create a schema from 
data attributes.

## Available Methods

See `methods.js` for the available built-in validation rules.

## Manual Validation

To manually create a schema for more complicated or custom forms just create it within a view.

    function View(options) {
      this.el = options.el;
      this.validator = new Validator({ 
        el: this.el,
        schema: this.schema,
        messages: this.messages
      });
    }

    View.prototype.schema = {
      'name': {
        'required': true,
        'string': true
      },
      'postcode': function(val, data) {
        return data.country === 'Australia' && val.length === 4;
      }
    };

    View.prototype.messages = {
      'name': 'Please enter your name',
      'postcode': 'Please enter a valid postcode'
    };

This allows you to setup a form without needing data attributes and allows you to create
custom messages and validation rules.

The schema takes a field name and an object with keys that map to validation methods:

    'name': {
      'required': true,
      'string': true
    }

The names of the validation rules must be defined in `methods.js`.

## Custom Validation Rules

When manually passing in the schema you can create custom validation on the fly by passing
a function.

    schema: {
      'name': function(val, data){
        return val === 'Jerry';
      }
    }

The function will be passed the value for the field as well as all of the data submitted. This
function must return true or false.