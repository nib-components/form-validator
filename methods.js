/*
  These methods are the validation methods
  that are available in the forms. Addding a new
  validation method is as easy as exporting another
  function. The function must be lowercase as the
  backend likes to lower case all attributes on HTML
  elements so when we try to do validation via data
  attributes it will lowercase them.
 */

var patterns = {
  email: /^([a-zA-Z0-9_\.\-\+]+)@([\da-z\.\-]+)\.([a-z\.]{2,6})$/,
  url: /^(https?:\/\/)?([\da-z\.\-]+)\.([a-z\.]{2,6})([\/\w \.\-]*)*\/?$/,
  alphanumeric: /^\w+$/,
  hex: /^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/,
  dateofbirth: /^\d{1,2}\/\d{1,2}\/\d{4}$/
};

/**
 * Simple required method. We add this as a validation
 * method so that we don't have to do anything special
 * to check for required fields in the validator
 * @param  {String} val
 * @return {Boolean}
 */
exports.required = function(val) {
  return val !== null && val !== undefined && val !== "";
};

/**
 * Check to see if the value submit matches to required value
 * @param  {String} val
 * @param  {String} ruleValue Value from the form submit
 * @return {Boolean}
 */
exports.equals = function(val, ruleValue) {
  return val === ruleValue;
};

/**
 * Username is a customer number or an email address
 * @param  {String} val
 * @return {Boolean}
 */
exports.username = function(val) {
  if( val ) {
    if(val.indexOf('@') === -1) {
      return exports.number(val);
    }
    else {
      return exports.email(val);
    }
  }
};

/**
 * Simple date format checker. Most of the forms
 * on the site use this style for dates.
 * @param  {String} val
 * @return {Boolean}
 */
exports.dateofbirth = function(val) {
  if(val) {
    return patterns.dateofbirth.test(val) && moment(val, 'DD/MM/YYYY').isValid();
  }
};

/**
 * Simple date format checker. Most of the forms
 * on the site use this style for dates.
 * @param  {String} val
 * @return {Boolean}
 */
exports.over16 = function(val) {
  if(val) {
    var birthYear = moment(val, 'DD/MM/YYYY');
    return moment().diff(birthYear, 'years', true) >= 16;
  }
};


/**
 * Check if a string is an email address
 * @param  {String}   val
 * @return {Boolean}
 */
exports.email = function(val) {
  return _.isString(val) && patterns.email.test(val);
};

/**
 * Check if a string is a valid URL
 * @param  {String} val
 * @return {Boolean}
 */
exports.url = function(val) {
  return val && patterns.url.test(val);
};

/**
 * Check if a string is alphanumeric
 * @param  {String} val
 * @return {Boolean}
 */
exports.alphanumeric = function(val) {
  return _.isString(val) && patterns.alphanumeric.test(val);
};

/**
 * Check if a string is hexidecimal
 * @param  {String} val
 * @return {Boolean}
 */
exports.hex = function(val) {
  return _.isString(val) && patterns.hex.test(val);
};

/**
 * Check if the value is a string
 * @param  val
 * @return {Boolean}
 */
exports.string = function(val) {
  return _.isString(val);
};

/**
 * Check if a value is number. Converts value to a number
 * and checks to see if it is a valid number
 * @param  {String} val
 * @return {Boolean}
 */
exports.number = function(val) {
  return _.isNumber(val) || !isNaN(parseFloat(val));
};

/**
 * Check if a value is an array
 * @param  {Any} val
 * @return {Boolean}
 */
exports.array = function(val) {
  return _.isArray(val);
};

/**
 * Check if passed in value is, or can be converted
 * to, a valid date
 * @param  {Any} val
 * @return {Boolean}
 */
exports.date = function(val) {
  return val && ( _.isDate(val) || !isNaN(Date.parse(val)) );
};

/**
 * Check if the value is a valid boolean
 * @param  {Any} val
 * @return {Boolean}
 */
exports.boolean = function(val) {
  return val === true || val === false;
};

/**
 * Check if a number is below a value
 * @param  {String|Number} val
 * @param  {Number} num Maximum value
 * @return {Boolean}
 */
exports.max = function(val, num) {
  return val && val <= num;
};

/**
 * Check if a number is a at least num
 * @param  {String|Number} val
 * @param  {Number} num
 * @return {Boolean}
 */
exports.min = function(val, num) {
  return val && val >= num;
};

/**
 * Check the length of the value
 * @param  {String|Array} val
 * @param  {Number} length
 * @return {Boolean}
 */
exports.length = function(val, length) {
  return val && val.length && val.length === Number(length);
};

/**
 * Check the minimum length of a number or string
 * @param  {String|Array} val
 * @param  {Number} length
 * @return {Boolean}
 */
exports.minlength = function(val, length) {
  return val && val.length && val.length >= length;
};

/**
 * Check the minimum length
 * @param  {String|Array} val
 * @param  {Number} length
 * @return {Boolean}
 */
exports.maxlength = function(val, length) {
  return val && val.length && val.length <= length;
};

/**
 * Check if a value is within a range
 * @param  {String|Number} val
 * @param  {Object} options Requires a from and to
 * @return {Boolean}
 */
exports.range = function(val, options) {
  return val && (options.from <= val && val <= options.to);
};

/**
 * Check if a value exists within an array
 * @param  {Any} val
 * @param  {Array} values
 * @return {Boolean}
 */
exports['in'] = function(val, values) {
  return values.indexOf(val) > -1;
};

/**
 * Check if one field matches another
 * @param  {String} Value of field
 * @param  {String} field Field to match
 * @param   {Object} attributes All of the data
 * @return {Boolean}
 */
exports.matches = function(val, field, attributes) {
  return _.isEqual(val, attributes[field]);
};