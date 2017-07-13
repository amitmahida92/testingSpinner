
(function () {
    'use strict';

    angular.module('reportingDashboard').config(function ($httpProvider) {
        $httpProvider.interceptors.push(function ($q) {
            return {
                'request': function (config) {
                    if (config.url.toLowerCase().indexOf('service') != -1)
                        config.headers['Bos-SessionId'] = BOS_SESSIONID; return config || $q.when(config);
                },
                'response': function (response) {
                    if (response.headers('Bos-SessionId')) {
                        BOS_SESSIONID = response.headers('Bos-SessionId');
                    }

                    return response || $q.when(response);
                }
            }
        });
    });

    angular.module('reportingDashboard').config(function (ChartJsProvider) {
        ChartJsProvider.setOptions({ 
             maintainAspectRatio: true
            //TODO: global options for chart can be set from here and this code can be moved to other file. Nishit           
         });
    });

})();