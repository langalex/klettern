Handlebars.registerHelper('render_handlebars', function(name, context) {
  // we need the sub template compiled here
  // in order to be able to generate the top level template
  var subTemplate =  Handlebars.compile($('#' + name).html());
  var subTemplateContext = $.extend({},this,context.hash);
  return new Handlebars.SafeString(subTemplate(subTemplateContext));
});

(function() {
  var $container = $('#container'),
    store = hoodie.store,
    templates = {
      trackList: Handlebars.compile($("#track-list-template").html()),
      newTrackForm: Handlebars.compile($("#new-track-template").html()),
      trackListItem: Handlebars.compile($("#track-list-item-template").html())
    };

  initTrackForm();
  initTrackList();
  loadTracks();

  function initTrackForm() {
    $('#new-track').on('click', function() {
      hideAll();
      $container.find('#new-track-container').html(templates.newTrackForm()).show();
    });

    $container.on('submit', '#new-track-form', function(e) {
      e.preventDefault();
      var $form = $(this);
      var track = {
        name: $form.find('[name=name]').val(),
        rating: $form.find('[name=rating]').val()
      };
      store.add('track', track);
      hideAll();
      $container.find('#track-list-container').show();
    });
  }

  function initTrackList() {
    store.on('add:track', function(track) {
      $('#track-list').append(templates.trackListItem(track));
    });
  }

  function loadTracks() {
    store.findAll('track').done(function(tracks) {
      hideAll();
      $container.find('#track-list-container').html(templates.trackList({tracks: tracks})).show();
    });
  }

  function hideAll() {
    $container.children().hide();
  }
})();
