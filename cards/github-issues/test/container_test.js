module("Github::Issues Acceptances");
import { inCard, TestService } from 'helpers/card_test_helpers';
import Conductor from 'conductor';

var conductor, card;

if (/phantom/i.test(navigator.userAgent)) { return; }

module("Github::Issues Acceptances", {
  setup: function() {
    conductor = new Conductor({
      testing: true,
      conductorURL: '/vendor/conductor.js.html'
    });

    Conductor.services['test'] = TestService;

    Conductor.services['repository'] = Conductor.Oasis.Service.extend({
      requests: {
        getRepository: function(promise) {
          promise.resolve('emberjs/ember.js');
        }
      }
    });

    Conductor.services['unauthenticatedGithubApi'] = Conductor.Oasis.Service.extend({
      requests: {
        ajax: function(promise, ajaxOpts) {
          promise.resolve([]);
        }
      }
    });

    Conductor.services['identity'] = Conductor.Oasis.Service.extend({
      requests: {
        currentUser: function(promise) {
          promise.resolve(null);
        }
      }
    });

    card = conductor.load('/cards/github-issues/card.js', 1, {
      capabilities: ['test', 'repository', 'unauthenticatedGithubApi', 'identity']
    });

    card.promise.then(null, Conductor.error);
    card.appendTo('#qunit-fixture');
  },

  teardown: function() {

  }
});

asyncTest("it renders", 1, function(){
  inCard(card, function(card, resolver){
    function wait() {
      var promise, obj = {}, helperName;

      return new Ember.RSVP.Promise(function(resolve) {
        var watcher = setInterval(function() {
          var routerIsLoading = card.App.__container__.lookup('router:main').router.isLoading;
          if (routerIsLoading) { return; }
          if (Ember.run.hasScheduledTimers() || Ember.run.currentRunLoop) { return; }
          clearInterval(watcher);
          Ember.run(function() {
            resolve();
          });
        }, 10);
      });
    }
    card.render().then(function(){
      wait().then(function(){
        equal($('h3:last').text(), 'Github Issues for emberjs/ember.js');
        start();
        resolver.resolve();
      });
    }, function(e){
      ok(false, e);
      resolver.reject();
    });

  }).then(null, console.error);
});
