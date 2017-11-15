/* global $ */
import Ember from 'ember';
import layout from './template';
import ThemedComponent from 'nullbase-theme-service/mixins/nb-themed-component';
import autosize from '../../util/autosize';
import _ from "npm:lodash";

var uniqID = {
  counter: 0,
  get: function ( prefix ) {
    if ( !prefix ) {
      prefix = "uniqid";
    }
    var id = prefix + "" + uniqID.counter++;
    if ( $("#" + id).length === 0 ) {
      return id;
    }
    else {
      return uniqID.get();
    }

  }
};
export default Ember.Component.extend(ThemedComponent, {
  gestures: Ember.inject.service(),
  layout: layout,
  autocomplete: "off",
  _themeProperties: [
    'attrs.focused-underline-color',
    'attrs.underline-color',
    'attrs.underline-error-color',
    'attrs.focused-underline-error-color',
    'attrs.focused-label-color',
    'attrs.label-color',
    'attrs.error-label-color',
    'attrs.focused-error-label-color',
    'attrs.text-color',
    'attrs.error-text-color',
    'attrs.hint-text-color'
  ],
  tagName: 'nb-input',
  type: "text",
  isMemo: Ember.computed.equal('type', 'memo'),
  error: false,
  errorString: Ember.computed('error', 'showErrors', function () {
    if ( this.get("showErrors") ) {
      if ( _.isString(this.get('error')) ) {
        return this.get('error');
      }
      if ( _.isArray(this.get('error')) ) {
        return _.join(this.get('error'), ', ');
      }
    }
    return "";
  }),
  value: '',
  showErrors: false,
  monospace: false,
  classNames: ['selectable'],
  classNameBindings: [ 'hasIcon:icon', 'monospace:monospace', 'hasText:has-text:no-text', 'focused:focused:not-focused', 'hasLabel:has-label:no-label', 'hasError:has-error:no-error', 'type' ],
  hasText: Ember.computed.bool('value'),
  hasLabel: Ember.computed.bool('label'),
  description: "",
  focusedDescriptionProperty: "",
  rows: 1,
  passwordToggleTitle:"Show Masked",
  copyFieldTitle:"Copy to clipboard",
  hasError: Ember.computed('error', 'showErrors', function () {
    return (this.get('error') && this.get('error').length && this.get('showErrors'));
  }),
  hasIcon: Ember.computed('icon', function () {
    return this.get('icon') !== '';
  }),
  icon: "",
  passwordVisible: false,
  textAreaChangedObserver: Ember.observer('value', function () {

    setTimeout(() =>{
      if ( this.get('type') === 'memo' ) {
        if(!this.get('tearDown')) {
          this.$('textarea').trigger('inview');
        }

      }
    },10)

  }),
  actions: {
    togglePasswordVisible(){

      if ( this.$('input').prop('type') === 'text' ) {
        this.set('passwordVisible', false);
        this.$('input').prop('type', 'password');

      }
      else {
        this.$('input').prop('type', 'text');
        this.set('passwordVisible', true);
      }
      this.$('input').focus();
    },
    copyField( e ){

      e.preventDefault();
      e.stopPropagation();
      if ( !this.get('type') === "memo" ) {
        let $inputElement = $('input', this.get('element'));
        if ( $('input', this.get('element')).prop('type') === 'text' ) {

        }
        else {

          $inputElement.prop('type', 'text');

        }
        $('#copyNode').text($inputElement.val());
      }
      else {
        $('#copyNode').text(this.get('value'));
      }


      // "Optional" Select some text
      var range = document.createRange();
      range.selectNodeContents(document.getElementById('copyNode'));
      var sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);

      // Use try & catch for unsupported browser
      try {

        // The important part (copy selected text)
        var successful = document.execCommand('copy');

        // "Optional" remove selected text
        //     sel.removeAllRanges();
        $('#copyNode').text("");
        if ( successful ) {
          this.sendAction('attrs.on-copied', 'success');
          /*  self.notifications.info(self.get('i18n').t("Common.Messages.FieldCopied"), {
           autoClear: true,
           clearDuration: 3000
           });*/

        }

        else {
          this.sendAction('attrs.on-copied', 'failed');
          /*self.notifications.error(self.get('i18n').t("Common.Messages.FieldNotCopied"), {
           autoClear: true,
           clearDuration: 3000
           });*/
        }
      } catch ( err ) {
        this.sendAction('attrs.on-copied', 'failed');
        /*
         self.notifications.info(self.get('i18n').t('Common.Messages.ManualCopyInstructions'), {
         autoClear: true,
         clearDuration: 3000
         });
         */
      }

    }
  },
  inputClasses: Ember.computed('inputClass', function () {
    var used = (this.get('value') || (this.get('isMemo') && this.get('readonly'))) ? ' used' : '';
    return this.get('inputClass') + used;
  }),


  willDestroyElement: function () {

    this._super(...arguments);
    let gestures = this.get('gestures');
    let icon = this.$('.icon').get(0);
    if ( this.get('type') === 'memo' ) {
      try {
        autosize.destroy(this.$('textarea'));
      }
      catch(e){

      }

    }
    if ( icon ) {
      gestures.removeEventListener(icon, 'down', this._down);
      gestures.removeEventListener(icon, 'up', this._up);
    }
  },
  didInsertElement: function () {
    var self = this;
    this._super(...arguments);
    let gestures = this.get('gestures');
    $('input,textarea', self.get('element')).on('blur', function () {
      Ember.run(this, function () {
        self.set('focusedDescriptionProperty', "");
        self.set('focused', false);
        $('.bottom-bar', self.get('element')).removeClass('focused');
        if ( !$('input', self.get('element')).val() ) {
          $('label:first-of-type', self.get('element')).removeClass('active');
        }
        if ( $(this).val() || (self.get('isMemo') && self.get('readonly')) ) {
          $(this).addClass('used');
        }
        else {
          $(this).removeClass('used');
        }

      });


    });
    $('input, textarea', self.get('element')).on('focus', function () {
      Ember.run(function () {
        self.set('focusedDescriptionProperty', self.get('description'));
        self.set('focused', true);
        $('.bottom-bar', self.get('element')).addClass('focused');

      });


    });


    this._down = function ( inEvent ) {

      inEvent.preventDefault();
      inEvent.stopImmediatePropagation();
      $('input', self.get('element')).focus();

    };
    self._up = function ( e ) {
      e.preventDefault();
      e.stopImmediatePropagation();
    };

    Ember.run.scheduleOnce('afterRender', function () {
      if ( $('.icon', self.get('element')).get(0) ) {
        gestures.addEventListener($('.icon', self.get('element')).get(0), 'down', self._down);
        gestures.addEventListener($('.icon', self.get('element')).get(0), 'up', self._up);
      }
    });
    if ( this.get('type') === 'memo' ) {
      autosize(this.$('textarea'));

    }
    var inView = function ( /*e,isInView*/ ) {


      autosize.update(self.$('textarea'));
    };
    self.$('textarea').bind('inview', inView);

  }

});
