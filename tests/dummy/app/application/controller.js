import Ember from 'ember';

export default Ember.Controller.extend({
  appState: Ember.inject.service('app-state'),
  errorArray:["some error","another error dude."],
  actions:{

  }
});
