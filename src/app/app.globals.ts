import { environment } from './../environments/environment';
/**
 * Global configuration object
 */
export let GLOBAL;
const SERVICE_BASE_URL = 'https://cc-dashboard.uat.develop.farm/'; // 'http://172.16.5.32:8081/';
GLOBAL = {
    BOS_SESSION_ID: 0,
    SERVICE_BASE_URL: SERVICE_BASE_URL,
    HTTP_METHOD: '',
    fronEndVersion: '2.0.0',
    CONFIG_URL: SERVICE_BASE_URL + 'Service/popboard/config',
    CHART_HOVER_TOOLTIP_URL: SERVICE_BASE_URL + 'Service/popboard/zendesk/ticket',
    CCP_LINK: SERVICE_BASE_URL + '/Service/popboard/ccplink?campaignId=',
    SMART_CONTENT_LINK: SERVICE_BASE_URL + 'https://smartcontent.jcdecaux.com/api/v2/smartbrics/',
    TOASTER_TIME_INTERVAL: 5000 // This will be duration of the toast

};
if (environment.production) {
    GLOBAL['HTTP_METHOD'] = 'POST';
} else {
    GLOBAL['HTTP_METHOD'] = 'GET';
}
