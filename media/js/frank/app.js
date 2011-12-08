
var coll = new z.PopularAddons();
// coll.fetch();

window.App = new z.AddonGridView({
  el: $('ul#popular'),
  model: coll
});
