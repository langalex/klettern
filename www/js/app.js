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
      track: Handlebars.compile($("#track-template").html()),
      climbListItem: Handlebars.compile($('#climb-list-item-template').html())
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
  initClimbForm();

  function initClimbForm() {
    $container.on('click', '#new-climb-form button[rel=climbed], #new-climb-form button[rel=failed]', function(e) {
      e.preventDefault();
      var trackId = $(this).closest('[data-track-id]').data('track-id'),
        status = $(this).attr('rel');
      store.add('climb', {status: status, trackId: trackId});

      return false;
    });

    store.on('add:climb', function(climb) {
      containers.track.find('[rel=previous-climbs]').prepend(templates.climbListItem(climb));
    });
  }

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
    store.on('remove:track', function(track) {
      $('#track-list #track-' + track.id).remove();
    });

    $container.on('click', '.track-list-item a[rel=track-show]', function(e) {
      e.preventDefault();
      var trackId = $(this).attr('href');
      showTrackListItem(trackId);
    });

    $container.on('click', '.track-list-item a[rel=track-remove]', function(e) {
      e.preventDefault();
      var trackId = $(this).attr('href');
      store.remove('track', trackId);
    });
  }

  function showTrackListItem(trackId) {
    $nav.find('li').removeClass('active');
    $.when(findTrack(trackId), findClimbs(trackId)).then(function(track, climbs) {
      showContainer(containers.track, templates.track($.extend(track, {climbs: climbs.sort(byCreatedAt)})));

      function byCreatedAt(a, b) {
        return b.$createdAt - a.$createdAt;
      }
    });

    function findTrack(trackId) {
      return store.find('track', trackId);
    }

    function findClimbs(trackId) {
      return store.findAll(function (object) {
        return object.trackId === trackId;
      });
    }
  }

  function loadTracks() {
    store.findAll('track').done(function(tracks) {
      showContainer(containers.trackList, templates.trackList({
        tracks: tracks.sort(byName)}));
    });

    function byName(a, b) {
      return a.name.toLowerCase() > b.name.toLowerCase();
    }
  }
})();
