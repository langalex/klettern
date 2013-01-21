Handlebars.registerHelper('render_handlebars', function(name, context) {
  // we need the sub template compiled here
  // in order to be able to generate the top level template
  var subTemplate =  Handlebars.compile($('#' + name).html());
  var subTemplateContext = $.extend({},this,context.hash);
  return new Handlebars.SafeString(subTemplate(subTemplateContext));
});

(function() {
  var $container = $('#container'),
    $nav = $('.navbar'),
    store = hoodie.store,
    templates = {
      trackList: Handlebars.compile($("#track-list-template").html()),
      newTrackForm: Handlebars.compile($("#new-track-template").html()),
      trackListItem: Handlebars.compile($("#track-list-item-template").html()),
      track: Handlebars.compile($("#track-template").html())
    },
    containers = {
      trackList: $container.find('#track-list-container'),
      newTrack: $container.find('#new-track-container'),
      track: $container.find('#track-container')
    };

  initNavigation();
  initTrackForm();
  initTrackList();
  loadTracks();

  function showContainer(container, html) {
    $container.children().hide();
    if(html) {
      container.html(html);
    }
    container.show();
  }

  function initNavigation() {
    $nav.find('a[rel=new-track]').on('click', function() {
      showContainer(containers.newTrack, templates.newTrackForm());
    });
    $nav.find('a[rel=track-list]').on('click', function() {
      loadTracks();
    });
    $nav.find('a').on('click', function() {
      $nav.find('li').removeClass('active');
      $(this).parent('li').addClass('active');
    });
  }

  function initTrackForm() {
    $container.on('submit', '#new-track-form', function(e) {
      e.preventDefault();
      var $form = $(this);
      var track = {
        name: $form.find('[name=name]').val(),
        rating: $form.find('[name=rating]:checked').val()
      };
      store.add('track', track);
      showContainer(containers.trackList);
    });
  }

  function initTrackList() {
    store.on('add:track', function(track) {
      $('#track-list').append(templates.trackListItem(track));
    });

    $container.on('click', '.track-list-item', function(e) {
      var trackId = $(this).find('a[rel=track]').attr('href');
      e.preventDefault();
      showTrackListItem(trackId);
    });
  }

  function showTrackListItem(trackId) {
    store.find('track', trackId).done(function(track) {
      showContainer(containers.track, templates.track(track));
    });

  }

  function loadTracks() {
    store.findAll('track').done(function(tracks) {
      showContainer(containers.trackList, templates.trackList({tracks: tracks}));
    });
  }
})();
