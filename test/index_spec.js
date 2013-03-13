var Validates = component('form-validator');

describe('Form Validation Component', function(){

  beforeEach(function(){
    var el = $('<form>');
    el.append('<input type="text" name="Foo" />');
    el.append('<input type="text" name="Bar" />');
    el.append('<button type="submit" class="js-submit">Submit</button>');
    el.append('<button type="submit" class="js-cancel">Cancel</button>');

    var group = $('<div class="js-validate-group">');
    group.append('<input name="Baz" type="radio" value="1" checked>');
    group.append('<input name="Baz" type="radio" value="2">');

    el.append(group);

    this.validates = new Validates({
      schema: {
        'Foo': function(val) {
          return val === 'One';
        },
        'Bar': function(val) {
          return val === 'Two';
        }
      },
      messages:{
        'Foo': function(){
          return 'Foo is invalid';
        },
        'Bar': function(){
          return 'Bar is invalid';
        }
      },
      el: el
    });
  });

  it('should be created', function(){
    expect(this.validates).to.not.equal(undefined);
  });

  it('should fire a submit method when clicking submit button', function(){
    var method = sinon.stub(this.validates, 'submit');
    //this.validates.el.find('.js-submit').click();
    // expect(method.called).to.equal(true);
  });

  it('should validate invalid data', function(){
    var errors = this.validates.validate({
      'Foo': false,
      'Bar': false
    });
    expect(errors.length).to.equal(2);
  });

  it('should validate valid data', function(){
    var errors = this.validates.validate({
      'Foo': 'One',
      'Bar': 'Two'
    });
    expect(errors.length).to.equal(0);
  });

  it('should transform the form to JSON', function(){
    this.validates.field('Foo').val('Bar');
    this.validates.field('Bar').val('Baz');

    var data = this.validates.toJSON();

    var equal = _.isEqual(data, {
      'Foo': 'Bar',
      'Bar': 'Baz',
      'Baz': '1'
    });

    expect(equal).to.equal(true);
  });
});