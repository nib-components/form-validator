var Tip = require('tip');
var getAttributes = require('attributes');
var validate = require('./validator');
var debug = require('debug')('FormValidator');

/**
 * Form validator
 * This is a view that controls the validation
 * for a form. It takes a form Element in options
 * and will bind to the submit event of the form.
 * It validates the form against set rules.
 *
 * Elements with a data-validates-* attributes
 * will be used to build up the schema - the rules
 * used for validation. The 3rd part of the data
 * attribute should be a method defined in the methods
 * module. eg. data-validates-number="true"
 * 
 * @param {Object} options
 */
function FormValidator(options){
  this.el = $(options.el);
  this.messages = options.messages || this.messages || this.getMessages();
  this.schema = options.schema || this.schema || this.getRules();
  this.bindEvents();
  this._errorMessages = {};
}

_.extend(FormValidator.prototype, Backbone.Events, {

  /**
   * Bind to the submit and cancel events on the form
   * 
   * @return {[type]} [description]
   */
  bindEvents: function() {
    this.el.on('click', '.js-submit', this._onSubmit.bind(this));
    this.el.on('click', '.js-cancel', this._onCancel.bind(this));
  },

  /**
   * Get the rules from the data attribute of the fields
   * 
   * @return {Object} The rules object used by the validator
   */
  getRules: function() {
    this.schema = {};
    this.fields().each(this.getRulesFromElement.bind(this));
    this.groups().each(this.getRulesFromElement.bind(this));
    return this.schema;
  },

  /**
   * Get the rules for a single element. Uses data attributes
   * to determine the rules.
   * 
   * @param  {Number}   index   Index in the node list
   * @param  {Element}  el     Element with data attributes. Could be a control or a div
   * @return {void}
   */
  getRulesFromElement: function(index, el){
    var attrs = getAttributes(el);
    var fieldName = el.getAttribute('name') || el.getAttribute('data-validate-group');
    var rules = {};
    _.each(attrs, function(value, name){
      if( name.indexOf('data-validates') !== 0 ) return;
      var rule = name.replace('data-validates-', '');
      rules[rule] = value;
    });
    this.schema[fieldName] = rules;
  },

  /**
   * Get the validation message for each element
   * 
   * @return {Object}
   */
  getMessages: function(){
    this.messages = {};
    this.fields().each(this.getMessagesFromElement.bind(this));
    this.groups().each(this.getMessagesFromElement.bind(this));
    return this.messages;
  },

  /**
   * Get the validation message for the element with the data-validates-*
   * attribute. Each element can only have one validation message for now.
   * 
   * @param  {Number}   index   Index in the node list
   * @param  {Element}  el      Element with validation
   * @return {Object}           Hash of messages with the field name as the key
   */
  getMessagesFromElement: function(index, el) {
    var message = el.getAttribute('data-validate-message');
    var name = el.getAttribute('name') || el.getAttribute('data-validate-group');
    if( !message ) return;
    this.messages[name] = message;
  },

  /**
   * Validate an object of data against the validation rules for this form
   * 
   * @param  {Object}   data    Data to validate. Usually an object representing form values
   * @return {Errors}
   */
  validate: function(data) {
    return validate(data, this.schema);
  },

  /**
   * Checks to see if a single field is valid
   * @param  {String}  name Field name
   * @return {Boolean}
   */
  isValid: function(name) {
    var data = this.getFieldData(name);
    var errors = this.validate(data);
    return errors.get(name) === false;
  },

  /**
   * Returns the form as an object. Each field in the form
   * should be represented. The name of the field is the key
   * and the value of the field is the object value. This
   * is sent to the validator
   * 
   * @return {Object} Key/Value representation of the form
   */
  toJSON: function(){
    var data = this.el.serializeArray();
    var ret = {};

    this.fields().each(function(){
      ret[this.getAttribute('name')] = null;
    });

    _(data).each(function(field){
      ret[field.name] = field.value;
    });

    this.el.find(':radio:checked, :checkbox:checked').each(function(){
      ret[this.getAttribute('name')] = $(this).val();
    });

    debug("toJSON", ret);
    return ret;
  },

  /**
   * Get the element for a field. Takes a field name
   * and returns the DOM element
   * @param  {String} name Input name attribute
   * @return {Element}
   */
  field: function(name) {
    var field = this.el.find('[name="'+name+'"]');
    if(field.length === 0) return false;
    return field;
  },

  /**
   * Get the validation group. Groups are defined by using the data
   * attribute with a value equal to the field name they are validating.
   * 
   * @param  {String}   name    Field name
   * @return {jQuery}           Returns false if no element is found
   */
  group: function(name) {
    var group = this.el.find('[data-validate-group="'+name+'"]');
    if(group.length === 0) return false;
    return group;
  },

  /**
   * Returns an array of all of the field elements in the
   * form. All of these fields are the ones which will be 
   * considered when validating and serializing to JSON.
   * 
   * @return {Array} jQuery Object
   */
  fields: function(){
    return this.el.find('[name]');
  },

  /**
   * Return a list of all of the validation groups
   * 
   * @return {Array} jQuery object
   */
  groups: function(){
    return this.el.find('[data-validate-group]');
  },

  /**
   * Submit the form, validating it first and 
   * halting the submission if the form is not valid
   * 
   * @param  {Event} event Submit event
   * @return {void}
   */
  submit: function(event){

    /**
     * Stops the validation tooltips showing
     * if the form is in mobile-mode. We'll need
     * to clean this up.
     * @TODO
     */
    // if( this.el.width() < 480 ) {
    //   return;
    // }

    var data = this.toJSON();
    var errors = this.validate(data);

    if(errors.length) {
      event.preventDefault();
      this.showErrors(errors);
      this.trigger('error', event, errors, data);
    }
    else {
      this.trigger('submit', event, data);
    }
  },

  /**
   * Event handler for the submit action
   * 
   * @param  {Event} event
   * @return {void}
   */
  _onSubmit: function(event) {
    this.submit(event);
  },

  /**
   * Event handler for the cancel on the form. Not all
   * forms have a cancel button but they are used in models.
   * Simply emits an event so that parent views can listen 
   * for a cancel and destroy the form
   * 
   * @param  {Event} event 
   * @return {void}
   */
  _onCancel: function(event) {
    event.preventDefault();
    this.trigger('cancel');
  },

  /**
   * Takes an Errors object and shows all of the errors
   * in the form.
   * 
   * @param  {Errors} errors Errors object usually created by the validate method
   * @return {void}
   */
  showErrors: function(errors) {
    var messages = this.messages;
    var self = this;
    errors.each(function(types, attr){
      var message = _.result(messages, attr);
      var field = self.group(attr) || self.field(attr);
      if( !field ) {
        throw new Error("No element for field: " + attr);
      }
      debug("Showing error for %s, %s, %s", attr, message, field);
      self.showError(attr, message, field);
    });
  },

  /**
   * Get all of the related fields for a field. These fields
   * will also be validated when the original field is validated
   * 
   * @param  {String} name field name
   * @return {Array}      Array of field names
   */
  getRelatedFields: function(name) {
    var field = this.field(name);
    var relatedFields = field.attr('data-validate-fields');
    return relatedFields ? relatedFields.split('|') : [];
  },

  /**
   * Get all of the data for a single field needed to validate
   * it, including any data of related fields
   * 
   * @param  {String} name field name
   * @return {Object}
   */
  getFieldData: function(name) {
    var data = {};
    var self = this;
    var fields = this.getRelatedFields(name);
    data[name] = this.field(name).val();
    fields.forEach(function(field){
      data[field] = self.field(field).val();
    });
    return data;
  },

  /**
   * Show a single error message
   * 
   * @param  {String} name    Name attribute of the invalid field
   * @param  {String} message The message to show
   * @param  {Element} el     The DOM element of the invalid field 
   * @return {void}
   */
  showError: function(name, message, el){
    // There is an error message for this field
    // already visible, don't need to do anything
    if( this._errorMessages[name] ) return;

    var self = this;
    el.addClass('is-invalid');

    var fields = this.getRelatedFields(name);
    fields.push(name);
    // Revalidate this field whenever it changes
    // When it becomes valid, we remove the message
    fields.forEach(this._bindValidationEvents.bind(this));

    var error = new Tip({
      target: el,
      content: message,
      position: 'east',
      width: 200
    });

    error.show();
    this._errorMessages[name] = error;
  },

  /**
   * Added events for when the fields changes to revalidate itself
   * and its related fields. This is removed when the field becomes valid
   * 
   * @param  {String} name field name
   * @return {void}
   */
  _bindValidationEvents: function(name){
    var self = this;
    this.field(name).on('change.validate keyup.validate', function(event) {
      if(event.which === 9) return;
      var data = self.getFieldData(name);
      var errors = self.validate(data);
      for(var key in data) {
        if( errors.get(key) === false ) {
          self.removeError(key);
        }
      }
    });
  },

  /**
   * Remove an error for a field.
   * 
   * @param  {String} name The field name with the error to remove
   * @return {void}
   */
  removeError: function(name){
    var el = this.field(name);
    var group = this.group(name);
    if( group ) group.removeClass('is-invalid');
    el.removeClass('is-invalid');
    el.off('.validate');
    if( this._errorMessages[name] ) {
      this._errorMessages[name].hide();
      delete this._errorMessages[name];
    }
  },

  /**
   * Remove all error messages from the form and
   * destroy the form
   * 
   * @return {void}
   */
  remove: function(){
    this.trigger('remove');
    _(this._errorMessages).each(function(tip){
      tip.hide();
    });
    this._errorMessages = null;
  }
  
});

/**
 * Factory method to easily create form validators
 * on all selectors. This is used at a global scope
 * on the page to create validators without needing
 * views for each form
 * 
 * @param  {Object} options
 */
FormValidator.create = function(options) {
  $(options.selector).each(function(){
    return new FormValidator({
      el: this
    });
  });
};

/*
 * Export
 */

module.exports = FormValidator;