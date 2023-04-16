/***************************************************************/
/****** Development ********************************************/
/***************************************************************/
const debug = false;
const serverURL = 'http://127.0.0.1:5555';
const frontendURL = 'http://127.0.0.1:8000';
var contactEmail = 'YOUR_EMAIL_ADDRESS';
var isCounterEnabled = true;
var sortSuggestions = true;

/***************************************************************/
/****** Session ************************************************/
/***************************************************************/
var session = null;  // Changed when refreshed
var sessionId = '';  // Changed when refreshed
var example = '';
var exampleActualText = '';
var stop = new Array();
var engine = '';
var promptLength = 0;
var promptText = 0;

/***************************************************************/
/****** Editor *************************************************/
/***************************************************************/
var quill;
var Delta = Quill.import('delta');

let items = null;
let numItems = 0;

let currentIndex = 0;
let currentHoverIndex = '';
let prevCursorIndex = 0;

var originalSuggestions = [];

/***************************************************************/
/****** Reply **************************************************/
/***************************************************************/
let speedUpReplayTime = 5;
let slowDownSuggestionTime = 2000;
let maximumElapsedTime = 1000;

SUCCESS = 1
FAILURE = 0

/***************************************************************/
/****** Logging ************************************************/
/***************************************************************/
const EventName = {
  SYSTEM_INITIALIZE: 'system-initialize',
  TEXT_INSERT: 'text-insert',
  TEXT_DELETE: 'text-delete',
  CURSOR_BACKWARD: 'cursor-backward',
  CURSOR_FORWARD: 'cursor-forward',
  CURSOR_SELECT: 'cursor-select',
  SUGGESTION_GET: 'suggestion-get',
  SUGGESTION_OPEN: 'suggestion-open',
  SUGGESTION_REOPEN: 'suggestion-reopen',
  SUGGESTION_UP: 'suggestion-up',
  SUGGESTION_DOWN: 'suggestion-down',
  SUGGESTION_HOVER: 'suggestion-hover',
  SUGGESTION_SELECT: 'suggestion-select',
  SUGGESTION_CLOSE: 'suggestion-close',
  SKIP: 'skip',

  // Filtering
  SUGGESTION_FAIL: 'suggestion-fail',
}

const EventSource = {
  USER: 'user',
  API: 'api',
}

const ReplayableEvents = [
  EventName.SYSTEM_INITIALIZE,
  EventName.TEXT_INSERT, EventName.TEXT_DELETE,
  EventName.CURSOR_FORWARD, EventName.CURSOR_BACKWARD, EventName.CURSOR_SELECT,
  EventName.SUGGESTION_GET, EventName.SUGGESTION_OPEN, EventName.SUGGESTION_REOPEN,
  EventName.SUGGESTION_UP, EventName.SUGGESTION_DOWN, EventName.SUGGESTION_HOVER,
  EventName.SUGGESTION_SELECT, EventName.SUGGESTION_CLOSE,
];

Object.freeze(EventName);
Object.freeze(EventSource);

function sourceToEventSource(source) {
  if (source == 'user') {
    return EventSource.USER;
  }
  else if (source == 'api') {
    return EventSource.API;
  }
  else {
    alert('Unknown source: ' + source);
  }
}

/***************************************************************/
/****** Condition (interface) **********************************/
/***************************************************************/

let urlString = window.location.href;
let url = new URL(urlString);
let condition = url.searchParams.get("cond");

if (condition == 'human') {
  console.log('Condition (URL): human-only');
  $('#shortcuts').addClass('hidden');

} else if (condition == 'machine') {
  console.log('Condition (URL): machine-only');

} else {
  console.log('Condition (URL): human-and-machine');
}
