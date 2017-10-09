(function () {
    'use strict';

    angular
        .module('reportingDashboard')
        .config(['$routeProvider',
            function ($routeProvider) {
                $routeProvider
                    .when('/dashboard', {
                        templateUrl: 'app/views/dashboard.view.html',
                        controller: 'DashboardCtrl',
                        controllerAs: 'vm'
                    })                     
                    .otherwise({
                        redirectTo: '/dashboard'
                    });
            }]);
})();
