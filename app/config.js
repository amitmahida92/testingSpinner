
var DEBUG = true;
var BOS_SESSIONID = 0;
var POP_SUMMARY = '';
var MAX_INACTIVE_INTERVAL = 5;
var DATE_FORMAT = 'YYYY-MM-DD';
var COMPLAINCE_PERCENTAGE = 90;
var RED_COLOR = "#F44336";
var BLUE_COLOR = "#0d65b6";
var GREEN_COLOR = "#9be52a";
var SERVICE_BASE_URL = ''; // 'http://campaign-compliance.dev.aws.jcdecaux.co.uk:8190/';
var INITIAL_CONFIG_URL =  false ? 'Service/popboard/config' : 'data/config.json'; //  'config';
var INITIAL_CONFIG_URL_BOS = '../../Service/popboard/config'; // 'http://172.16.3.241:8082/Service/popboard/';
var TOASTER_TIME_INTERVAL = 5000; // This will be duration of the toast
var CHART_HOVER_TOOLTIP = DEBUG ? 'data/hover_tooltip.json' : '../../Service/popboard/zendesk/ticket';

var HTTP_METHOD = DEBUG ? "GET" : "POST";
var CONFIG_URL = SERVICE_BASE_URL + (DEBUG ? INITIAL_CONFIG_URL : INITIAL_CONFIG_URL_BOS);
var frontEndVersion = "1.0.1.24 campaign compliance";
