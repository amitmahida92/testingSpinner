import { environment } from './../environments/environment';
/**
 * Global configuration object
 */
export let GLOBAL;
const SERVICE_BASE_URL = 'assets/';
GLOBAL = {
    SERVICE_BASE_URL: SERVICE_BASE_URL,
    HTTP_METHOD: '',
    fronEndVersion: '2.0.0',
    CONFIG_URL: SERVICE_BASE_URL + 'data/json/config_v0.19.json'
};
if (environment.production) {
    GLOBAL['HTTP_METHOD'] = 'POST';
} else {
    GLOBAL['HTTP_METHOD'] = 'GET';
}
