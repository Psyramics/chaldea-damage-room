(function () {
  var app = window.ChaldeaDamageRoom || {};
  
  var ServantFullView = Backbone.View.extend({
  });
  
  var ServantListItemView = Backbone.View.extend({
    tagName: "li",
    template: _.template($('<li><a class="name"><%=name %></a><a class="remove">X</a></li>').html()),
    events: {
      "click .name"   : activate,
      "click .remove" : remove
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
      "":             "servants"
      "servants":     "servants",
      "servants/:id": "servants"
    },
    
    initialize: function () {
      this.container = new ServantListView({
        el: $('#servantList'),
        model: this.
    },
    
    servants: function (id) {
      
    }
  });
  
  if (typeof window.ChaldeaDamageRoom == 'undefined') {
    window.ChaldeaDamageRoom = app;
  }
})();