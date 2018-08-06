(function () {
  var app = window.ChaldeaDamageRoom || {};
  
  app.model = app.model || {};
  app.model.Servant = Backbone.Model.extend({
	  defaults: {
      id: 2,
      level: 1,
      fouhp: 0,
      fouatk: 0,
      nplvl: 1,
      npstr: 0,
      skill1lvl: 1,
      skill1str: 0,
      skill2lvl: 1,
      skill2str: 0,
      skill3lvl: 1,
      skill3str: 0,
      data: {}
	  },
    constructor: function () {
      var self = this;
      Backbone.Model.apply(this, arguments);
      console.log(arguments);
    }
	}); 
  var servCollection = Backbone.Collection.extend({
    model: app.model.Servant
  });
  
  app.collections = app.collections || {};
  app.collections.Servant = new servCollection;
  app.data = app.data || {};
  app.data.servants = {};
  
  var ServantData = {};
  var files = [
    'servants',
  ];
  for (var i = 0; i < files.length; i++) {
    jQuery.get('data/'+files[i]+'.json').done(function (data, text, jqXHR) {
      app.data.servants = data;
    });
  }
})();