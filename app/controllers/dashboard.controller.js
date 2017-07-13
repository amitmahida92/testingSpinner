(function () {
    'use strict';

    angular.module('reportingDashboard').controller('DashboardCtrl', DashboardCtrl);

    DashboardCtrl.$inject = ['filterService', 'configureOptions', 'Webworker'];

    function DashboardCtrl(filterService, configureOptions, Webworker) {
        var vm = this;



        vm.DASHBOARD_TYPES = [{
            id: 1,
            name: "Frame Dashboard",
            image: 'logo0.png',
            routeURL: 'dashboard'
        },
        {
            id: 2,
            name: "Share Of Time",
            image: 'logo1.png',
            routeURL: 'shareoftime'
        }]


        // Show/Hide flags
        vm.showTitle = false;
        vm.hideWatermark = false;
        vm.showCampaign = false;
        vm.showPlayer = false;
        vm.showDay = false;
        vm.showHour = false;

        vm.showFilter = true;

        // Chart Object
        vm.campaignData = {};
        vm.playerData = {};
        vm.dayData = {};
        vm.hourData = {};

        //Filter Object//

        vm.filterObject = {}
        vm.cachedFilterObject = {}

        // Chart Options
        vm.campaignOptions = _.clone(configureOptions.HORIZONTAL_BAR);
        vm.barOptions = _.clone(configureOptions.BAR_PLAYER);
        vm.dayOptions = _.clone(configureOptions.BAR_DAY);
        vm.hourOptions = _.clone(configureOptions.HOUR_BAR);

        // For Gauge Chart (Remove this if you use some other plugin/directive or whatever)
        vm.defaultGuageColors = [BLUE_COLOR, "#E0E0E0"];
        vm.selectedGuageColors = [GREEN_COLOR, "#E0E0E0"];
        vm.sampleOptions = configureOptions.DOUGHNUT;

        // Filter data selected by User//
        vm.selectedProductFormats = [];
        vm.selectedSpecialists = [];
        vm.selectedChannel = [];
        vm.isFrameDashbaord = false;







        //------------------------------------------------------------------------------------------------------------------
        //                                              Chart Click Events
        //------------------------------------------------------------------------------------------------------------------

        //Doughnut Chart Click

        vm.onChannelClick = function (channelid) {
            if (vm.selectedChannel.length > 0) {
                if (_.includes(vm.selectedChannel, channelid)) {
                    var index = _.indexOf(vm.selectedChannel, channelid);
                    vm.selectedChannel.splice(index, 1)
                }
                else {
                    vm.selectedChannel.push(channelid)
                }
            }
            else {
                vm.selectedChannel.push(channelid);
            }

            getSummaries();
        }


        // First Chart
        vm.onCampaignClick = function (points, evt) {
            if (points.length > 0) {
                var campaignId = points[0]['_chart'].config.data.datasets[points[0]['_datasetIndex']].campaignDetails[points[0]['_index']].id; // Value of particluar bar
                vm.selectedCampaign = campaignId
                //-- Clear the Children Graph and Children Request Parameters//
                vm.selectedFrame = null
                vm.selectedDay = null
                //-----------------------------------------------------------//

                vm.playerData = {};
                getSummaries();
            } else {
                return false;
            }
        }

        // Second Chart
        vm.onPlayerClick = function (points, evt) {
            if (points.length > 0) {

                var frameId = points[0]['_chart'].config.data.datasets[points[0]['_datasetIndex']].playerDetails[points[0]['_index']].id; // Value of particluar bar
                vm.selectedFrame = frameId
                //-- Clear the Children Graph and Children Request Parameters//                
                vm.selectedDay = null
                //-----------------------------------------------------------//
                vm.dayData = [];
                getSummaries();
            } else {
                return false;
            }
        }

        // Third Chart
        vm.onDayClick = function (points, evt) {
            if (points.length > 0) {
                var dayId = points[0]['_chart'].config.data.datasets[points[0]['_datasetIndex']].dayDetails[points[0]['_index']].id; // Value of particluar bar
                vm.selectedDay = dayId
                vm.hourData = [];

                getSummaries();
            } else {
                return false;
            }
        }


        //Select Dashboard Type//

        vm.selectDashBoardType = function () {
            generateChart('campaign', vm.campaignSummary);
            generateChart('player', vm.frameSummary);
            generateChart('day', vm.daySummary);
            generateChart('hour', vm.spanSummary);
            highlightSelectedBar();
            setInformationToolTip();
        }


        //-----------------------------------------------------------------------------------------------------------------------//


        //------------------------------------------------------------------------------------------------------------------
        //                                              Code to fill the drop downs
        //------------------------------------------------------------------------------------------------------------------
        vm.loadProductFormat = function ($query) {
            if ($query == '')
                return vm.productFormats;
            else {
                return vm.productFormats.filter(function (productFormat) {
                    return productFormat.productFormatName.toLowerCase().indexOf($query.toLowerCase()) != -1;
                });
            }
        }

        vm.loadSpecialist = function ($query) {
            if ($query == '')
                return vm.specialists;
            else {
                return vm.specialists.filter(function (specialist) {
                    return specialist.organisationName.toLowerCase().indexOf($query.toLowerCase()) != -1;
                });
            }
        }

        vm.removeTags = function (index, arr) {
            arr.splice(index, 1);
            getSummaries();
        }
        vm.onAddTags = function () {
            getSummaries();
        }
        //------------------------------------------------------------------------------------------------------------------



        function getInitialConfig() {
            var initalConfigData = filterService.getInitialConfig().then(function (data) {
                var configData = data.data;
                // vm.userBundle = data.data.userBundle;

                // configureOptions.HORIZONTAL_BAR.scales.xAxes[0].scaleLabel.labelString = vm.userBundle["popboard.frame.xAxis.label"];
                // configureOptions.HORIZONTAL_BAR.scales.yAxes[0].scaleLabel.labelString = vm.userBundle["popboard.frame.yAxis.label"];

                // configureOptions.BAR_PLAYER.scales.xAxes[0].scaleLabel.labelString = vm.userBundle["popboard.player.xAxis.label"];
                // configureOptions.BAR_PLAYER.scales.yAxes[0].scaleLabel.labelString = vm.userBundle["popboard.player.yAxis.label"];

                // configureOptions.BAR_DAY.scales.xAxes[0].scaleLabel.labelString = vm.userBundle["popboard.date.xAxis.label"];
                // configureOptions.BAR_DAY.scales.yAxes[0].scaleLabel.labelString = vm.userBundle["popboard.date.yAxis.label"];

                // configureOptions.HOUR_BAR.scales.xAxes[0].scaleLabel.labelString = vm.userBundle["popboard.time.xAxis.label"];
                // configureOptions.HOUR_BAR.scales.yAxes[0].scaleLabel.labelString = vm.userBundle["popboard.time.yAxis.label"];


                if (configData.complainceLevel)
                    COMPLAINCE_PERCENTAGE = configData.complainceLevel
                vm.datePicker = {
                    date: {
                        startDate: configData.defaultStartDate,
                        endDate: configData.defaultEndDate
                    }
                };
                if (configData.serviceCalls)
                    loadServiceCallKeys(configData.serviceCalls)
                if (configData.specialists)
                    vm.specialists = configData.specialists;
                if (configData.productFormats)
                    vm.productFormats = configData.productFormats;

                MAX_INACTIVE_INTERVAL = configData.systemData.maxInactiveInterval || MAX_INACTIVE_INTERVAL;
                startKeepAliveService();
                getSummaries();
            });
            setTimeout(function () {
                $('#my-drop-btn').dropdown({
                    belowOrigin: true // Displays dropdown below the button
                });
            });
            setInformationToolTip();

        }


        function setInformationToolTip() {
            vm.frame_CampaignInformation = frame_CampaignInformation;
            vm.sot_CampaignInformation = sot_CampaignInformation;
            vm.frame_PlayerInformation = frame_PlayerInformation;
            vm.sot_PlayerInformation = sot_PlayerInformation;
            vm.frame_DayInformation = frame_DayInformation;
            vm.sot_DayInformation = sot_DayInformation;
            vm.frame_DateInformation = frame_DateInformation;
            vm.sot_DateInformation = sot_DateInformation;
            vm.Dashboard = Dashboard;
        }

        function loadServiceCallKeys(serviceCallKeys) {
            var key;
            for (key in serviceCallKeys) {
                window[key] = (typeof SERVICE_BASE_URL != 'undefined' ? SERVICE_BASE_URL : '') + serviceCallKeys[key];
            };
        }

        function formatHours(hour) {
            if (hour < 10) {
                hour = "0" + hour + ":00";
            } else {
                hour = hour + ":00";
            }
            return hour;
        }

        function generateChart(type, chartData) {
            switch (type) {
                case 'campaign':
                    vm.campaignData = {
                        labels: [],
                        datasets: [{
                            backgroundColor: [],
                            data: []
                        }]

                    };
                    vm.campaignDetails = {
                        campaignDetails: []
                    }

                    vm.campaignOptions.size.height = calculateHeightForCampaign(vm.campaignOptions.size.height, chartData.length);

                    _.forEach(chartData, function (obj) {
                        vm.campaignData.labels.push(obj.label);
                        if (vm.isFrameDashbaord) {
                            vm.campaignData.datasets[0].data.push(obj.value);
                            if (obj.value < COMPLAINCE_PERCENTAGE)
                                vm.campaignData.datasets[0].backgroundColor.push(RED_COLOR);
                            else
                                vm.campaignData.datasets[0].backgroundColor.push(BLUE_COLOR);
                        }
                        else {
                            vm.campaignData.datasets[0].data.push(obj.avgValue);
                            if (obj.failed)
                                vm.campaignData.datasets[0].backgroundColor.push(RED_COLOR);
                            else
                                vm.campaignData.datasets[0].backgroundColor.push(BLUE_COLOR);

                        }

                        vm.campaignDetails.campaignDetails.push(obj);



                    });
                    vm.hideWatermark = true;
                    vm.showCampaign = true;
                    break;
                case 'player':
                    vm.playerData = {
                        labels: [],
                        datasets: [{
                            backgroundColor: []
                            ,
                            borderWidth: 1,
                            data: []
                        }]
                    };
                    vm.playerDetails = {
                        playerDetails: []
                    };
                    // vm.barOptions.size.width = (document.getElementById("campaign").style.width != "" ? document.getElementById("campaign").style.width : vm.barOptions.size.width);
                    vm.barOptions.size.width = calculateWidthForCampaign(vm.barOptions.size.width, chartData.length);
                    _.forEach(chartData, function (obj) {
                        vm.playerData.labels.push(obj.label);

                        if (vm.isFrameDashbaord) {
                            vm.playerData.datasets[0].data.push(obj.value);
                            if (obj.value < COMPLAINCE_PERCENTAGE)
                                vm.playerData.datasets[0].backgroundColor.push(RED_COLOR);
                            else
                                vm.playerData.datasets[0].backgroundColor.push(BLUE_COLOR);
                        }
                        else {
                            vm.playerData.datasets[0].data.push(obj.avgValue);
                            if (obj.failed)
                                vm.playerData.datasets[0].backgroundColor.push(RED_COLOR);
                            else
                                vm.playerData.datasets[0].backgroundColor.push(BLUE_COLOR);

                        }
                        vm.playerDetails.playerDetails.push(obj)
                    });

                    vm.showPlayer = true;
                    vm.showDay = false;
                    vm.showHour = false;
                    break;
                case 'day':
                    vm.dayData = {
                        labels: [],
                        datasets: [{
                            backgroundColor: [],
                            borderWidth: 1,
                            data: []
                        }]
                    };
                    vm.dayDetails = {
                        dayDetails: []
                    }
                    vm.dayOptions.size.width = calculateWidthForCampaign(vm.dayOptions.size.width, chartData.length);
                    _.forEach(chartData, function (obj) {
                        vm.dayData.labels.push(obj.label);

                        if (vm.isFrameDashbaord) {
                            vm.dayData.datasets[0].data.push(obj.value);

                            if (obj.value < COMPLAINCE_PERCENTAGE)
                                vm.dayData.datasets[0].backgroundColor.push(RED_COLOR);
                            else
                                vm.dayData.datasets[0].backgroundColor.push(BLUE_COLOR);
                        }
                        else {
                            vm.dayData.datasets[0].data.push(obj.avgValue);
                            if (obj.failed)
                                vm.dayData.datasets[0].backgroundColor.push(RED_COLOR);
                            else
                                vm.dayData.datasets[0].backgroundColor.push(BLUE_COLOR);

                        }
                        vm.dayDetails.dayDetails.push(obj);
                    });

                    vm.showDay = true;
                    vm.showHour = false;
                    break;
                case 'hour':
                    vm.hourData = {
                        labels: [],
                        datasets: [{
                            backgroundColor: [],
                            borderWidth: 1,
                            data: []
                        }]
                    };

                    _.forEach(chartData, function (obj) {
                        vm.hourData.labels.push(obj.label);
                        vm.hourData.datasets[0].data.push(obj.value);
                        if (obj.value < COMPLAINCE_PERCENTAGE)
                            vm.hourData.datasets[0].backgroundColor.push(RED_COLOR);
                        else
                            vm.hourData.datasets[0].backgroundColor.push(BLUE_COLOR);
                    });

                    vm.showHour = true;
                    break;
            }
        }

        function getSummaries() {

            createFilterOject()
            var filterChanged = isFilterChanged();
            var requestParameter = {}


            if (vm.datePicker.date) {
                requestParameter["startDate"] = vm.filterObject.startDate;
                requestParameter["endDate"] = vm.filterObject.endDate;
            }
            if (vm.filterObject.specialists)
                requestParameter["specialists"] = JSON.stringify(vm.filterObject.specialists);
            if (vm.filterObject.productFormats)
                requestParameter["productFormats"] = JSON.stringify(vm.filterObject.productFormats);
            if (vm.filterObject.channels)
                requestParameter["channels"] = JSON.stringify(vm.filterObject.channels);

            requestParameter["filterChange"] = filterChanged;

            if (vm.selectedCampaign != null)
                requestParameter["campaignId"] = vm.selectedCampaign;
            if (vm.selectedFrame != null)
                requestParameter["extendedCodeId"] = vm.selectedFrame;
            if (vm.selectedDay != null)
                requestParameter["dayId"] = vm.selectedDay;


            filterService.getSummaries(requestParameter).then(function (data) {
                vm.cachedFilterObject = _.cloneDeep(vm.filterObject);
                var data = data.data;

                if (data.channelSummary && data.channelSummary.length > 0) {
                    console.log(vm.selectedChannel)
                    vm.channelSummary = data.channelSummary;

                    vm.channelSummary = _.map(vm.channelSummary, function (obj) {
                        return ((vm.selectedChannel.indexOf(obj.id) === -1) ? angular.extend(obj, { guageColors: vm.defaultGuageColors }) : angular.extend(obj, { guageColors: vm.selectedGuageColors }));
                    });

                }


                if (data.campaignSummary) {
                    if (data.campaignSummary.length > 0) {
                        vm.campaignOptions.size = _.clone(configureOptions.HORIZONTAL_BAR.size); // after change in filter need to reset size
                        vm.campaignSummary = data.campaignSummary;
                        generateChart('campaign', vm.campaignSummary);
                    }
                    else {
                        vm.campaignData = {};
                        vm.showCampaign = false;
                    }
                }
                if (data.frameSummary) {
                    if (data.frameSummary.length > 0) {
                        vm.barOptions.size = _.clone(configureOptions.BAR_PLAYER.size); // after change in filter need to reset size
                        vm.frameSummary = data.frameSummary;
                        generateChart('player', vm.frameSummary);
                    }
                    else {
                        vm.playerData = {};
                        vm.showPlayer = false
                    }
                }
                if (data.daySummary) {
                    if (data.daySummary.length > 0) {
                        vm.dayOptions.size = _.clone(configureOptions.BAR_DAY.size);
                        vm.daySummary = data.daySummary;
                        generateChart('day', vm.daySummary);
                    }
                    else {
                        vm.dayData = {};
                        vm.showDay = false;
                    }

                }
                if (data.spanSummary) {
                    if (data.spanSummary.length > 0) {
                        vm.spanSummary = data.spanSummary;
                        generateChart('hour', vm.spanSummary);
                    }
                    else {
                        vm.hourData = {}
                        vm.showHour = false
                    }
                }
                highlightSelectedBar();
            });


        }

        function highlightSelectedBar() {

            if (!_.isUndefined(vm.selectedCampaign) && !_.isNull(vm.selectedCampaign)) {
                if (!_.isEmpty(vm.campaignData)) {
                    vm.campaignData.datasets[0].backgroundColor = [];
                    _.forEach(vm.campaignDetails.campaignDetails, function (obj, key) {
                        if (vm.isFrameDashbaord) {
                            if (obj.value < COMPLAINCE_PERCENTAGE)
                                vm.campaignData.datasets[0].backgroundColor.push(RED_COLOR);
                            else
                                vm.campaignData.datasets[0].backgroundColor.push(BLUE_COLOR);
                        }
                        else {
                            if (obj.failed)
                                vm.campaignData.datasets[0].backgroundColor.push(RED_COLOR);
                            else
                                vm.campaignData.datasets[0].backgroundColor.push(BLUE_COLOR);
                        }
                    });

                    var index = _.findIndex(vm.campaignDetails.campaignDetails, function (o) { return o.id == vm.selectedCampaign; });
                    vm.campaignData.datasets[0].backgroundColor[index] = GREEN_COLOR;
                }
            }
            if (!_.isUndefined(vm.selectedFrame) && !_.isNull(vm.selectedFrame)) {
                if (!_.isEmpty(vm.playerData)) {
                    vm.playerData.datasets[0].backgroundColor = [];
                    _.forEach(vm.playerDetails.playerDetails, function (obj, key) {
                        if (vm.isFrameDashbaord) {
                            if (obj.value < COMPLAINCE_PERCENTAGE)
                                vm.playerData.datasets[0].backgroundColor.push(RED_COLOR);
                            else
                                vm.playerData.datasets[0].backgroundColor.push(BLUE_COLOR);
                        }
                        else {
                            if (obj.failed)
                                vm.playerData.datasets[0].backgroundColor.push(RED_COLOR);
                            else
                                vm.playerData.datasets[0].backgroundColor.push(BLUE_COLOR);
                        }
                    });
                    var index = _.findIndex(vm.playerDetails.playerDetails, function (o) { return o.id == vm.selectedFrame; });
                    vm.playerData.datasets[0].backgroundColor[index] = GREEN_COLOR;
                }

            }
            if (!_.isUndefined(vm.selectedDay) && !_.isNull(vm.selectedDay)) {
                if (!_.isEmpty(vm.dayData)) {
                    vm.dayData.datasets[0].backgroundColor = [];
                    _.forEach(vm.dayDetails.dayDetails, function (obj, key) {
                        if (vm.isFrameDashbaord) {
                            if (obj.value < COMPLAINCE_PERCENTAGE)
                                vm.dayData.datasets[0].backgroundColor.push(RED_COLOR);
                            else
                                vm.dayData.datasets[0].backgroundColor.push(BLUE_COLOR);
                        }
                        else {
                            if (obj.failed)
                                vm.dayData.datasets[0].backgroundColor.push(RED_COLOR);
                            else
                                vm.dayData.datasets[0].backgroundColor.push(BLUE_COLOR);
                        }
                    });
                    var index = _.findIndex(vm.dayDetails.dayDetails, function (o) { return o.id == vm.selectedDay; });
                    vm.dayData.datasets[0].backgroundColor[index] = GREEN_COLOR;
                }
            }
        }


        function clearChartData() {
            vm.campaignData = {};
            vm.playerData = {};
            vm.dayData = {};
            vm.hourData = {}
        }

        function isFilterChanged() {

            if (Object.keys(vm.cachedFilterObject).length > 0) {
                if (JSON.stringify(vm.filterObject) == JSON.stringify(vm.cachedFilterObject))
                    return false;
                else
                    return true;
            }
            else
                return true;
        }

        function startKeepAliveService() {
            Webworker.create(keepAlive, { async: true })
                .run(MAX_INACTIVE_INTERVAL, BOS_SESSIONID, calculateURL())
                .then(function (result) {
                });
        }

        function keepAlive(interval, bosSessionId, url) {
            setInterval(function () {
                var xmlHttp = new XMLHttpRequest();
                xmlHttp.onreadystatechange = function () {

                    //if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                    //    callback(xmlHttp.responseText);
                }
                xmlHttp.open("GET", url, true); // true for asynchronous 
                xmlHttp.setRequestHeader("Bos-SessionId", bosSessionId);
                console.log("Keep alive called");
                xmlHttp.send(null);
            }, interval * 1000);

        }

        function calculateURL() {
            var generatedURL = "";
            if (parseInt(window.location.pathname.indexOf('StockManager')) > 0) {
                generatedURL = window.location.origin + '/StockManager' + SESSION_URL.split(".").join("");
            } else {
                generatedURL = window.location.origin + '/' + SESSION_URL;
            }
            return generatedURL;
        }

        function createFilterOject() {
            //vm.datePicker
            //vm.selectedProductFormats = [];
            //vm.selectedSpecialists = [];
            //vm.selectedChannel = [];
            vm.filterObject = {}

            if (vm.datePicker.date) {
                vm.filterObject["startDate"] = vm.datePicker.date.startDate;
                vm.filterObject["endDate"] = vm.datePicker.date.endDate;
            }
            if (vm.selectedSpecialists && vm.selectedSpecialists.length > 0) {
                var specialists = [];
                _.forEach(vm.selectedSpecialists, function (obj) {
                    specialists.push(obj.organisationId);
                })
                vm.filterObject["specialists"] = specialists
            }
            if (vm.selectedProductFormats && vm.selectedProductFormats.length > 0) {
                var productFormats = [];
                _.forEach(vm.selectedProductFormats, function (obj) {
                    productFormats.push(obj.productFormatId);
                })
                vm.filterObject["productFormats"] = productFormats
            }
            if (vm.selectedChannel && vm.selectedChannel.length > 0)
                vm.filterObject["channels"] = vm.selectedChannel
        }




        function calculateHeightForCampaign(defaultHeight, totalRecords) {

            var _defaultHeight = defaultHeight;
            return ((totalRecords * 18) < _defaultHeight ? _defaultHeight : defaultHeight += (totalRecords * 22))
        }

        function calculateWidthForCampaign(defaultWidth, totalRecords) {
            var _defaultWidth = defaultWidth;
            return ((totalRecords * 14) < _defaultWidth ? _defaultWidth : defaultWidth += (totalRecords * 15))
        }


        //------------------------------------------------------------------------------------------------------------------
        //                                            Date Range Configuration 
        //------------------------------------------------------------------------------------------------------------------

        var DATERANGEPICKER = {
            locale: {
                separator: ' : ',
                format: DATE_FORMAT
            },
            ranges: {
                'Today': [moment(), moment()],
                'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            },
            alwaysShowCalendars: true,
            opens: 'center',
            eventHandlers: {
                'apply.daterangepicker': function (ev, picker) {
                    vm.datePicker = {
                        date: {
                            startDate: vm.datePicker.date.startDate.format(DATE_FORMAT),
                            endDate: vm.datePicker.date.endDate.format(DATE_FORMAT)
                        }
                    };

                    getSummaries();
                }
            }
        }
        // Configuration for DateRangePicker

        vm.datePickerOptions = DATERANGEPICKER;

        vm.datePicker = {
            date: {
                startDate: moment.Today,
                endDate: moment.Today
            }
        };

        vm.showHideFilters = function () {
            if (vm.showFilter) {
                $('#filtersArea').slideUp();
                vm.showFilter = false;
            } else {
                $('#filtersArea').slideDown("slow");
                vm.showFilter = true;
            }
        }

        //------------------------------------------------------------------------------------------------------------------------

        getInitialConfig();



    }
})();