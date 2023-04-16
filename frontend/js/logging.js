var logs = [];  // Save all activity logs

function getSuggestionState(){
  // TODO Overwite for different output interfaces
  let suggestions = new Array();
  $.each($('#frontend-overlay > .dropdown-item'), function(index, item) {
    suggestions.push({
      'index': $(item).data('index'),
      'original': $(item).data('original'),
      'trimmed': $(item).data('trimmed'),
      'probability': $(item).data('probability'),
      'source': $(item).data('source'),  // Could be empty
    });
  });

  return suggestions;
}

function getOriginalSuggestions(){
  let processedOriginalSuggestions = new Array();
  for (let i = 0; i < originalSuggestions.length; i++) {
    originalSuggestion = originalSuggestions[i];
    processedOriginalSuggestions.push({
      'original': originalSuggestion['original'],
      'trimmed': originalSuggestion['trimmed'],
      'probability': originalSuggestion['probability'],
      'source': originalSuggestion['source'],
    })
  }
  return processedOriginalSuggestions;
}

function logEvent(eventName, eventSource, textDelta='', cursorRange=''){
  if (eventName.length == 0 | eventSource.length == 0) {
    if (debug) {
      alert('Wrong event name or event source!');
      console.log(eventName, eventSource, textDelta, cursorRange);
    }
    return;
  }

  if (eventName == EventName.SKIP) {
    return;
  }

  timestamp = $.now();
  lastActivity = timestamp;

  let log = {
    'eventName': eventName,
    'eventSource': eventSource,
    'eventTimestamp': timestamp,

    // Metadata
    'textDelta': textDelta,
    'cursorRange': cursorRange,

    // Snapshot
    'currentDoc': '',  // Do not save
    'currentCursor': getCursorIndex(),

    'currentSuggestions': [],
    'currentSuggestionIndex': currentIndex,
    'currentHoverIndex': currentHoverIndex,  // only valid when eventName == SUGGESTION_HOVER

    'currentN': $("#ctrl-n").val(),
    'currentMaxToken': $("#ctrl-max_tokens").val(),
    'currentTemperature': $("#ctrl-temperature").val(),
    'currentTopP': $("#ctrl-top_p").val(),
    'currentPresencePenalty': $("#ctrl-presence_penalty").val(),
    'currentFrequencyPenalty': $("#ctrl-frequency_penalty").val(),

    // Store original suggestions that may include empty strings, duplicates, and toxic language
    'originalSuggestions': [],
  }

  if (eventName == EventName.SYSTEM_INITIALIZE) {
    log['currentDoc'] = quill.getContents()['ops'][0]['insert'];
  }

  if (eventName == EventName.SUGGESTION_OPEN) {
    log['currentSuggestions'] = getSuggestionState();
    log['originalSuggestions'] = getOriginalSuggestions();
  }

  if (eventName == EventName.SUGGESTION_FAIL) {
    log['originalSuggestions'] = getOriginalSuggestions();
  }

  logs.push(log);
  if (debug) {
    console.log(log['eventName']);
  }
}

function showLog(replayLog) {
  if (debug) {
    console.log(replayLog.eventName);
  }

  n = replayLog.currentN;
  max_tokens = replayLog.currentMaxToken;
  temperature = replayLog.currentTemperature;
  top_p = replayLog.currentTopP;
  presence_penalty = replayLog.currentPresencePenalty;
  frequency_penalty = replayLog.currentFrequencyPenalty;

  setCtrl(
    n,
    max_tokens,
    temperature,
    top_p,
    presence_penalty,
    frequency_penalty
  )
  try {
    switch(replayLog.eventName) {
      case EventName.SYSTEM_INITIALIZE:
        setText(replayLog.currentDoc);
        setCursor(replayLog.currentCursor);
        break;
      case EventName.TEXT_INSERT:
        var ops = replayLog.textDelta.ops;
        quill.updateContents(ops);
        setCursor(replayLog.currentCursor);
        break;
      case EventName.TEXT_DELETE:
        var ops = replayLog.textDelta.ops;
        quill.updateContents(ops);
        setCursor(replayLog.currentCursor);

        break;
      case EventName.CURSOR_FORWARD:
        setCursor(replayLog.currentCursor);
        break;
      case EventName.CURSOR_BACKWARD:
        setCursor(replayLog.currentCursor);
        break;
      case EventName.CURSOR_SELECT:
        setCursor(replayLog.currentCursor);
        break;
      case EventName.SUGGESTION_GET:
        // Spin icon to indicate loading
        showLoadingSignal();
        break;
      case EventName.SUGGESTION_OPEN:
        hideLoadingSignal();
        addSuggestionsToDropdown(replayLog.currentSuggestions);
        showDropdownMenu(replayLog.eventSource, is_reopen=false);
        break;
      case EventName.SUGGESTION_REOPEN:
        showDropdownMenu(replayLog.eventSource, is_reopen=true);
        break;
      case EventName.SUGGESTION_UP:
        $('.dropdown-item').removeClass('sudo-hover');

        currentSuggestionIndex = replayLog.currentSuggestionIndex;
        currentSuggestion = $('.dropdown-item')[currentSuggestionIndex];
        $(currentSuggestion).addClass('sudo-hover');
        break;
      case EventName.SUGGESTION_DOWN:
        $('.dropdown-item').removeClass('sudo-hover');

        currentSuggestionIndex = replayLog.currentSuggestionIndex;
        currentSuggestion = $('.dropdown-item')[currentSuggestionIndex];
        $(currentSuggestion).addClass('sudo-hover');
        break;
      case EventName.SUGGESTION_HOVER:
        $('.dropdown-item').removeClass('sudo-hover');

        currentHoverIndex = replayLog.currentHoverIndex;
        currentSuggestion = $('.dropdown-item')[currentHoverIndex];
        $(currentSuggestion).addClass('sudo-hover');
        break;
      case EventName.SUGGESTION_SELECT:
        currentSuggestion = $('.dropdown-item.sudo-hover')
        $(currentSuggestion).removeClass('sudo-hover').addClass('sudo-click');
        break;
      case EventName.SUGGESTION_CLOSE:
        hideDropdownMenu(replayLog.eventSource);
        break;
      case EventName.BUTTON_GENERATE:
        // Spin icon to indicate loading
        showLoadingSignal();
        break;
      default:
        $('.dropdown-item').removeClass('sudo-hover');
        $('.dropdown-item').removeClass('sudo-click');
    }
  } catch (e) {
    console.log('Ignored error:', e);
  }

}
