var DEBUG = false;
var BOS_SESSIONID = 0;
var POP_SUMMARY = '';
var MAX_INACTIVE_INTERVAL = 5;
var DATE_FORMAT = 'YYYY-MM-DD';
var COMPLAINCE_PERCENTAGE = 90;
var RED_COLOR = {
    backgroundColor: '#F44336',
    pointBackgroundColor: '#F44336'
};
var BLUE_COLOR = {
    backgroundColor: '#0d65b6',
    pointBackgroundColor: '#0d65b6'
};
var GREEN_COLOR = "#9be52a";
var DARK_GREEN_COLOR = "#008000";
var SERVICE_BASE_URL = 'https://cc-dashboard.uat.develop.farm/'; // 'http://172.16.5.32:8081/';
var INITIAL_CONFIG_URL =  false ? 'Service/popboard/config' : 'data/config.json'; //  'config';
var INITIAL_CONFIG_URL_BOS = '../../Service/popboard/config'; // 'http://172.16.3.241:8082/Service/popboard/';
var CCP_LINK = '/Service/popboard/ccplink?campaignId=';
var SMART_CONTENT_LINK = 'https://smartcontent.jcdecaux.com/api/v2/smartbrics/';
var TOASTER_TIME_INTERVAL = 5000; // This will be duration of the toast
var CHART_HOVER_TOOLTIP = DEBUG ? 'data/hover_tooltip.json' : '../../Service/popboard/zendesk/ticket';

var HTTP_METHOD = DEBUG ? "GET" : "POST";
var CONFIG_URL = SERVICE_BASE_URL + (DEBUG ? INITIAL_CONFIG_URL : INITIAL_CONFIG_URL_BOS);
var frontEndVersion = "1.0.1.36 campaign compliance";
// smart content sample url
// http://smartcontent.jdecaux.com/api/v2/smartbrics/sm_1234532/reporting