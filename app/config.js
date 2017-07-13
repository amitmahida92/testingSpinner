
var DEBUG = true;
var BOS_SESSIONID = 0;
var MAX_INACTIVE_INTERVAL = 5;
var DATE_FORMAT = 'YYYY-MM-DD';
var COMPLAINCE_PERCENTAGE = 90;
var RED_COLOR = "#F44336";
var BLUE_COLOR = "#0d65b6";
var GREEN_COLOR = "#9be52a";
var SERVICE_BASE_URL = '';
var INITIAL_CONFIG_URL = 'data/config.json';
var INITIAL_CONFIG_URL_BOS = '../../Service/popboard/config';
var TOASTER_TIME_INTERVAL = 5000; // This will be duration of the toast

var HTTP_METHOD = DEBUG ? "GET" : "POST";
var CONFIG_URL = SERVICE_BASE_URL + (DEBUG ? INITIAL_CONFIG_URL : INITIAL_CONFIG_URL_BOS);



