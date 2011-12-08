z.Addon = Backbone.Model.extend({
    defaults: {},
    initialize: function() {
    }
});


z.PopularAddons = Backbone.Collection.extend({
    url: '/frank/addons/popular',
    model: z.Addon
});


z.AddonTileView = Backbone.View.extend({
    tagName: 'li',
    template: _.template($('#addon-tile-template').html()),
    initialize: function() {
      this.model.view = this;
      this.render();
    },
    render: function() {
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    }
});


z.AddonGridView = Backbone.View.extend({
  initialize: function() {
    var self = this;
    // grid contents
    this.model.bind('add', this.addOne, this);
    this.model.bind('reset', this.addAll, this);
    this.model.bind('all', this.render, this);
    this.model.fetch();
  },
  addOne: function(addon) {
    var view = new z.AddonTileView({model: addon});
    this.el.append(view.render().el);
  },
  addAll: function() {
    this.model.each(this.addOne, this);
  }
});