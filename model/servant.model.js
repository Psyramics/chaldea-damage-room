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
      skill3str: 0
	  },
    constructor: function () {
      var self = this;
      Backbone.Model.apply(this, arguments);
      ServantLoader(arguments[0], function (data) {
        self.data = data;
      });
    }
	});
  
  var ServantData = {};
  function ServantLoader (name, callback) {
    if (typeof ServantData[name] != 'undefined') {
      callback(ServantData[name]);
      return;
    }
    
    var files = [
      'servants',
    ];
    for (var i = 0; i < files.length; i++) {
      jQuery.get('data/'+files[i]+'.json').done(function (data, text, jqXHR) {
        console.log(data);
      }));
    }
  }
  
  if (typeof window.ChaldeaDamageRoom == 'undefined') {
    window.ChaldeaDamageRoom = app;
  }
})();