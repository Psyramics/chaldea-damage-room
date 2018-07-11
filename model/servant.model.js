(function () {
  var app = window.ChaldeaDamageRoom || {};
  
  app.model = app.model || {};
  app.model.Servant = Backbone.Model.extend({
	  defaults: {
      id: 2,
      level: 1,
      hp: 0,
      atk: 0,
      np: 1,
      np_interlude: false,
      skill1: 1,
      skill1_interlude: false,
      skill2: 1,
      skill2_interlude: false,
      skill3: 1,
      skill3_interlude: false
	  },
    constructor: function () {
      Backbone.Model.apply(this, arguments);
      ServantLoader(arguments[0]);
    }
	});
  
  var ServantData = {};
  function ServantLoader (name, callback) {
    if (typeof ServantData[name] != 'undefined') {
      callback(ServantData[name]);
      return;
    }
    
    var files = [
      'saber.json',
    ];
    for (var i = 0; i < files.length; i++) {
      jQuery.get('data/'+files[i]).done(function (data, text, jqXHR) {
        console.log(data);
      }));
    }
  }
  
  if (typeof window.ChaldeaDamageRoom == 'undefined') {
    window.ChaldeaDamageRoom = app;
  }
})();