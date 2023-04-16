$(function() {
  startBlinking();

  if (condition == 'human') {
    setupEditorHumanOnly();
  } else if (condition == 'machine') {
    setupEditorMachineOnly();
  } else {
    setupEditor();
  }

  /* Enable controls */
  ctrl = getControl(); // &ctrl=show
  if (ctrl == 'show'){
    $('#setting-btn').css('display', 'inline');
    $('#setting-btn').click(function(e) {
      $('#control').toggleClass('show');
    });
    $('#finish-btn').prop('disabled', false);
    $('#finish-replay-btn').prop('disabled', false);
  }

  let accessCode = getAccessCode();
  startSession(accessCode);

  /* Enable tooltips */
  $('[data-toggle="tooltip"]').tooltip();

  /* Make shortcuts draggable */
  if ($("#shortcuts").length) {
    $("#shortcuts").draggable({containment: 'window'});
  }

  /* Manage suggestions in dropdown */
  $(document).click(function(e) {
    // Close dropdown if mouse clicked elsewhere
    // Check if click was triggered on or within frontend-overlay
    if ($(e.target).closest("#frontend-overlay").length > 0) {
      return false;
    } else {
      hideDropdownMenu(EventSource.USER);
    }
  });

  // Navigate dropdown menu using arrow keys
  tab = 9, enter = 13, esc = 27, left = 37, up = 38, right = 39, down = 40;
  $(document).keydown(function(e) {
    if ($('#frontend-overlay').hasClass('hidden')) {
      // Reopen dropdown menu
      if (e.shiftKey && e.key === 'Tab') {
        showDropdownMenu(EventSource.USER, is_reopen=true);
        e.preventDefault();
      }
      return;
    } else {
      switch (e.which) {
        case up:
          previousItem = $('.dropdown-item').get(currentIndex);
          $(previousItem).removeClass('sudo-hover');
          currentIndex = currentIndex - 1;
          if (currentIndex < 0) {
            currentIndex = numItems - 1;
          }
          currentItem = $('.dropdown-item').get(currentIndex);
          $(currentItem).addClass('sudo-hover');

          logEvent(EventName.SUGGESTION_UP, EventSource.USER);
          break;

        case down:
          previousItem = $('.dropdown-item').get(currentIndex);
          $(previousItem).removeClass('sudo-hover');
          currentIndex = currentIndex + 1;
          if (currentIndex == numItems) {
            currentIndex = 0;
          }
          currentItem = $('.dropdown-item').get(currentIndex);
          $(currentItem).addClass('sudo-hover');

          logEvent(EventName.SUGGESTION_DOWN, EventSource.USER);
          break;

        case esc:
          logEvent(EventName.SUGGESTION_CLOSE, EventSource.USER);
          hideDropdownMenu(EventSource.USER);
          break;

        case tab:
          break;

        default:
          hideDropdownMenu(EventSource.USER);
          return;
      }
      e.preventDefault();
      return;
    }
  });

  /* Handle buttons */
  $('#shortcuts-close-btn').click(function(e) {
    closeShortcuts();
  });
  $('#shortcuts-open-btn').click(function(e) {
    openShortcuts();
  });
  $('#finish-btn').click(function(e) {
    endSession();
  });
  $('#finish-replay-btn').click(function(e) {
    endSessionWithReplay();
  });
});
