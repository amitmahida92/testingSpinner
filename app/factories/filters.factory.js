(function () {
    'use strict';

    angular.module('reportingDashboard').factory('filterService', filterService);

    filterService.$inject = ['$http', '$q'];


    function filterService($http, $q) {

        var service = {
            getInitialConfig: getInitialConfig,
            getSummaries: getSummaries,
            getTooltipData: getTooltipData
        };

        function getTooltipData(params) {            
            return $http({
                method: HTTP_METHOD,
                url: CHART_HOVER_TOOLTIP,
                data: $.param(params),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                ignoreLoadingBar: true
            }).then(function (response) {
                if (response.data.status == 'OK') {
                    return response.data;
                } else {
                    Materialize.toast('Data is not available. Service returns KO', TOASTER_TIME_INTERVAL, 'rounded');
                    return;
                }
            }).catch(handleError);

        }

        function getInitialConfig() {
            var param = {
                action: 'getConfig'
            };
            return $http({
                method: HTTP_METHOD,
                url: CONFIG_URL,
                data: $.param(param),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).then(function (response) {
                if (response.data.status == 'OK') {
                    return response.data;
                } else {
                    Materialize.toast('Data is not available. Service returns KO', TOASTER_TIME_INTERVAL, 'rounded');
                    return;
                }
            }).catch(handleError);
        }

        function handleError(response) {
            Materialize.toast('Data is not available. Service returns KO', TOASTER_TIME_INTERVAL, 'rounded'); // 4000 is the duration of the toast
            console.error("Error in fetching data from the service");
        }

        function getSummaries(requestParams) {            
            return $http({
                method: HTTP_METHOD,
                url: POP_SUMMARY,
                data: $.param(requestParams),
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).then(function (response) {
                if (response.data.status == 'OK')
                    return response.data;
                else {
                    Materialize.toast('Data is not available. Service returns KO', TOASTER_TIME_INTERVAL, 'rounded');
                    return;
                }
            }).catch(handleError);

        }

        return service;

    }

})();