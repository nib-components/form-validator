var Errors      = require('./errors');
var methods     = require('./methods');
var debug       = require('debug')('Schema');

module.exports = function(attributes, schema) {
  var errors = new Errors();

  _.each(schema, function(rules, attribute){
    var value = attributes[attribute];

    // Use a custom methods method
    if (typeof rules === 'function') {
      if (rules.call(this, value, attributes) === false) {
        return errors.add(attribute, 'custom');
      }
      return; // It's valid
    }

    _.each(rules, function(ruleValue, type){

      var method = methods[type];
      var valid = false;

      // Allow the rule value to be a function
      if( !method && typeof ruleValue === 'function') {
        valid = ruleValue(value, attributes);
        if(valid === false) {
          errors.add(attribute, type);
        }
        return;
      }

      // The rule type isn't in the validation object
      // and a custom validation rule wasn't used
      if( !method ) {
        throw new Error('Invalid validation type. Validation method doesn\'t exist: ' + type);
      }

      // If the rule value is a boolean we'll check
      // that the validation test returns the same boolean
      // For example, a number rule may be set to false
      else if(ruleValue === true || ruleValue === false) {
        valid = method(value, ruleValue, attributes) === ruleValue;
      }

      // Otherwise the rule value is being used as options
      // for the validation method
      else {
        valid = method(value, ruleValue, attributes);
      }

      if (valid === false) {
        errors.add(attribute, type);
      }
    });

  });

  return errors;
};