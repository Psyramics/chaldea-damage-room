(function () {
  var app = window.ChaldeaDamageRoom || {};
  
  var ServantRouteView = Backbone.View.extend({
    el: $('#servContainer'),
    events: {
      "click #addServ button": "addServant",
    },
    initialize: function () {
      this.dropdown = $('#addServSelect');
      
      for (var k in app.data.servants) {
        dropdown.append('<option value="'+k+'">'+app.data.servants[k].name+'</option>');
      }
    },
    addServant: function () {
      app.collections.Servant.create({id: dropdown.value()});
    }
  });
  
  var ServantDetailView = Backbone.View.extend({
    el: $('#servDetail')
  });
  
  var ServantListItemView = Backbone.View.extend({
    tagName: "li",
    template: _.template($('<li><a class="name"><%=name %></a><a class="remove">X</a></li>').html()),
    events: {
      "click .name"   : 'activate',
      "click .remove" : 'remove'
    },
    activate: function () {
      Backbound.Router.navigate("servants/"+this.model.id, {trigger: true});
    },
    remove: function () {
      if (Backbone.history.getFragment() == 'servants/'+this.model.id) {
        Backbone.Router.navigate("", {trigger: true, replace: true});
      }
      this.model.destroy();
    },
  });
  
  var ServantRouter = Backbone.Router.extend({
    routes: {
      "":             "servants",
      "servants":     "servants",
      "servants/:id": "servants"
    },
    
    initialize: function () {
    },
    
    servants: function (id) {
      
    }
  });
  
  if (typeof window.ChaldeaDamageRoom == 'undefined') {
    window.ChaldeaDamageRoom = app;
  }
})();