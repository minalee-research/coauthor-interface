// Get arguments from URL
function getCondition(){
  let urlString = window.location.href;
  let url = new URL(urlString);
  let condition = url.searchParams.get("cond");

  // If it is the interactive QA domain, always set it to be "human"
  if (domain == "interactiveqa"){
    condition = "human";
  }

  return condition;
}

function getControl(){
  let urlString = window.location.href;
  let url = new URL(urlString);
  let ctrl = url.searchParams.get("ctrl");
  return ctrl;
}

function getExpertise(){
  let urlString = window.location.href;
  let url = new URL(urlString);
  let level = url.searchParams.get("level");
  return level;
}

function getAccessCode(){
  let urlString = window.location.href;
  let url = new URL(urlString);
  let accessCode = url.searchParams.get("access_code");
  return accessCode;
}

function getSessionId(){
  let urlString = window.location.href;
  let url = new URL(urlString);
  let sessionId = url.searchParams.get("session_id");
  return sessionId;
}

function getStartEnd(){
  let urlString = window.location.href;
  let url = new URL(urlString);
  let start = url.searchParams.get("start");
  let end = url.searchParams.get("end");
  if (start == null) {
    start = 0;
  }
  if (end == null) {
    end = -1;
  }
  return {
    'start': start,
    'end': end,
  }
}

function getMode(){
  // For replay, whether it is final or not.
  let urlString = window.location.href;
  let url = new URL(urlString);
  let mode = url.searchParams.get("mode");
  return mode;
}

function setCtrl(
  n,
  max_tokens,
  temperature,
  top_p,
  presence_penalty,
  frequency_penalty,
){
  $("#ctrl-n").val(n);
  $("#ctrl-max_tokens").val(max_tokens);
  $("#ctrl-temperature").val(temperature);
  $("#ctrl-top_p").val(top_p);
  $("#ctrl-presence_penalty").val(presence_penalty);
  $("#ctrl-frequency_penalty").val(frequency_penalty);
}

function setPrompt(prompt){
  setText(prompt);
  setCursorAtTheEnd();

  // Log initial state
  logEvent(EventName.SYSTEM_INITIALIZE, EventSource.API);
}

function openShortcuts(){
  $('#shortcuts').css('display', 'inline');
}

function closeShortcuts(){
  $('#shortcuts').css('display', 'none');
}

function startTimer(timeInSeconds){

  if (timeInSeconds === 0){
    $('.countdown').html('00:00');
    if (domain == 'metaphor') {
    } else {
      $('#finish-btn').prop('disabled', false);
      $('#finish-replay-btn').prop('disabled', false);
    }

    return;
  }
  var minutes = timeInSeconds / 60;
  var seconds = timeInSeconds % 60;
  var timerStr = minutes + ':' + seconds;

  var interval = setInterval(function() {
    var timer = timerStr.split(':');
    var minutes = parseInt(timer[0], 10);
    var seconds = parseInt(timer[1], 10);
    --seconds;
    minutes = (seconds < 0) ? --minutes : minutes;
    seconds = (seconds < 0) ? 59 : seconds;
    seconds = (seconds < 10) ? '0' + seconds : seconds;

    minutes = minutes.toString();
    seconds = seconds.toString();
    if (minutes.length == 1) {
      minutes = '0' + minutes;
    }
    if (seconds.length == 1) {
      seconds = '0' + seconds;
    }

    $('.countdown').html(minutes + ':' + seconds);
    if ((seconds == 0) && (minutes == 0)) {
      if (domain == 'metaphor') {
        alert('Your time is up! Please click the "Finish session" button on the bottom to save this session.');
        $('#finish-btn').prop('disabled', false);
        $('#finish-btn').removeClass('btn-inactive');
        $('#finish-btn').addClass('btn-active');
      } else {
        $('#finish-btn').prop('disabled', false);
        $('#finish-replay-btn').prop('disabled', false);
      }
    }
    if (minutes < 0) clearInterval(interval);
    if ((seconds <= 0) && (minutes <= 0)) clearInterval(interval);
    timerStr = minutes + ':' + seconds;
  }, 1000);
}

function startBlinking(){
  $('#robot').addClass('blink');

  if (domain.indexOf('copywriting') >= 0){
    $('#loading-signal').removeClass('do-not-display');
  }
}

function stopBlinking(){
  $('#robot').removeClass('blink');

  if (domain.indexOf('copywriting') >= 0){
    $('#loading-signal').addClass('do-not-display');
  }
}

function resetCounter(){
  contentLength = 0;
  $('#counter').html('0');

  $('#counter').removeClass('counter-under');
  $('#counter').removeClass('counter-good');
  $('#counter').removeClass('counter-over');
}

function updateCounter(){
  let content = getText();
  let contentLength = -1;

  // Prompt is deleted (number of characters)
  if (content.length < promptLength){
    promptLength = 0;
    alert('Since the given prompt is deleted, we will just show the total number of words in the editor from now on.');
  } else {
    content = content.substring(promptLength);
  }

  contentLength = content.split(/[ ]+/).length - 1;
  $('#counter').html(contentLength);

  $('#counter').removeClass('counter-under');
  $('#counter').removeClass('counter-good');
  $('#counter').removeClass('counter-over');

  if (contentLength < 40) {
    $('#counter').addClass('counter-under');
  } else if (contentLength <= 100) {
    $('#counter').addClass('counter-good');
  } else {
    $('#counter').addClass('counter-over');
  }
}
