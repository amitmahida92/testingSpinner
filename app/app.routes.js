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
                     .when('/shareoftime', {
                        templateUrl: 'app/views/shareoftime.view.html',
                        controller: 'DashboardCtrl',
                        controllerAs: 'vm'
                    })
                    .otherwise({
                        redirectTo: '/dashboard'
                    });
            }]);
})();
