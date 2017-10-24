(function () {
    'use strict';

    angular.module('reportingDashboard').controller('DashboardCtrl', DashboardCtrl);

    DashboardCtrl.$inject = ['filterService', 'configureOptions', 'Webworker', '$linq'];

    /**
     * 
     * @param {any} filterService
     * @param {any} configureOptions
     * @param {any} Webworker
     */
    function DashboardCtrl(filterService, configureOptions, Webworker, $linq) {
        var vm = this;

        vm.fullscreenFor = '';
        vm.isZendeskTicketAvailable = false;


        var chachedCampaignSummaryForMultipleChannels = [];
        var chachedCampaignSummaryForMultipleSpecialists = [];
        var chachedCampaignSummaryForMultipleMarketingNames = [];

        vm.channelSummaryByAudience = [];
        vm.channelSummaryByCampaign = [];


        vm.selectedCampaign = '';
        var tempSelectedFrame = '';


        // Chart summary variables
        vm.campaignSummary = [];
        vm.cachedCampaignSummary = [];
        vm.frameSummary = [];
        vm.cachedFrameSummary = [];
        vm.chachedChannelSummaryByAudience = [];
        vm.chachedChannelSummaryByImpression = [];
        vm.daySummary = [];
        vm.spanSummary = [];
        var resolutionCounter = 0;
        vm.smartContentURL = ''; // url for smart content

        // External link to ccp
        vm.ccpLink = CCP_LINK;

        vm.frontEndVersion = frontEndVersion;

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
            }
        ];

        vm.graphOptions = [{
                id: 1,
                name: "Frame",
            },
            {
                id: 2,
                name: "SoT"
            },
            {
                id: 3,
                name: "Impressions"
            }
        ];

        // Show/Hide flags
        vm.showTitle = false;
        vm.hideWatermark = false;
        vm.showCampaign = false;
        vm.showPlayer = false;
        vm.showDay = false;
        vm.showHour = false;
        vm.campaignSummaryCheck = false; // summary toggle
        vm.showFilter = true;

        // Chart Object
        vm.campaignData = {};
        vm.playerData = {};
        vm.dayData = {};
        vm.hourData = {};

        // Filter Object

        vm.filterObject = {};
        vm.cachedFilterObject = {};

        // Chart Options
        vm.campaignOptions = _.clone(configureOptions.HORIZONTAL_BAR);
        vm.impressionsOptions = _.clone(configureOptions.HORIZONTAL_STACKED_BAR);
        vm.barOptions = _.clone(configureOptions.BAR_PLAYER);
        vm.dayOptions = _.clone(configureOptions.BAR_DAY);
        vm.hourOptions = _.clone(configureOptions.HOUR_BAR);

        // For Gauge Chart (Remove this if you use some other plugin/directive or whatever)
        vm.defaultGuageColors = [BLUE_COLOR, "#E0E0E0"];
        vm.selectedGuageColors = [GREEN_COLOR, "#E0E0E0"];
        vm.sampleOptions = configureOptions.DOUGHNUT;

        // Chart level filters
        vm.campaign = {
            compaliant: true,
            noncompaliant: true,
            compliantCount: 0,
            noncompliantCount: 0,
        };
        vm.player = {
            compaliant: true,
            noncompaliant: true,
            compliantCount: 0,
            noncompliantCount: 0
        };
        vm.day = {
            compaliant: true,
            noncompaliant: true,
            compliantCount: 0,
            noncompliantCount: 0
        };
        vm.hour = {
            compaliant: true,
            noncompaliant: true,
            compliantCount: 0,
            noncompliantCount: 0
        };

        // For selected campaign bottom section
        vm.campaignBar = {};

        //------------------------------------------------------------------------------------------------------------------
        //                                            Date Range Configuration
        //------------------------------------------------------------------------------------------------------------------

        var DateRangePicker = {
            maxDate: new Date(),
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
                            startDate: (typeof vm.datePicker.date.startDate == 'string' ? vm.datePicker.date.startDate : vm.datePicker.date.startDate.format(DATE_FORMAT)),
                            endDate: (typeof vm.datePicker.date.endDate == 'string' ? vm.datePicker.date.endDate : vm.datePicker.date.endDate.format(DATE_FORMAT))
                        }
                    };
                    vm.showPlayer = false;
                    vm.showDay = false;
                    vm.showHour = false;
                    getSummaries();
                }
            }
        };

        // Configuration for DateRangePicker

        vm.datePickerOptions = DateRangePicker;
        vm.datePicker = {
            date: {
                startDate: moment.Today,
                endDate: moment.Today
            }
        };

        /**
         * @desc This function filters campaigns with respect to business areas.
         * @param {any} channelid 
         * @param {any} channelValue 
         * @returns void
         * @author Amit Mahida
         */
        function onChannelClick(channelid, channelValue) {
            if (channelValue == 0) {
                // Amit : CC-206 : Campaign Compliance Gauge should not be clickable which has 0.00% data.	                
                return;
            }

            if (vm.filters.channels.length > 0) {
                if (_.includes(vm.filters.channels, channelid)) {
                    var index = _.indexOf(vm.filters.channels, channelid);
                    vm.filters.channels.splice(index, 1);
                } else {
                    vm.filters.channels.push(channelid);
                }
            } else {
                vm.filters.channels.push(channelid);
            }

            vm.channelSummaryByCampaign = _.map(vm.channelSummaryByCampaign, function (obj) {
                return ((vm.filters.channels.indexOf(obj.id) === -1) ? angular.extend(obj, {
                    guageColors: vm.defaultGuageColors
                }) : angular.extend(obj, {
                    guageColors: vm.selectedGuageColors
                }));
            });
            applyFilter('channels');
        }

        /**
         * @desc It handles the mutual filters if applied any and generates/ regenerates the charts again.  
         * @param {any} compaliant 
         * @param {any} noncompaliant 
         * @param {any} chart 
         * @param {any} flag 
         */
        function compliantcheck(compaliant, noncompaliant, chart, flag) {
            var data = [];
            if (chart === 'campaign') {
                data = _.cloneDeep(vm.campaignSummary);
                if (!compaliant) {
                    data = vm.campaignSummary.filter(function (obj) {
                        return obj.failedAudience == true;
                    });
                }

                if (!noncompaliant) {
                    data = vm.campaignSummary.filter(function (obj) {
                        return obj.failedAudience == false;
                    });
                }

                if (!compaliant && !noncompaliant) {
                    data = [];
                }

                if (vm.selectedCampaign != '') {
                    var isSearchedCampaignInNewData = data.filter(function (obj) {
                        return obj.id.indexOf(vm.selectedCampaign.toUpperCase()) > -1;
                    });
                    // var isAllSelectedCampaignHasNullAvgValue = true;
                    // isSearchedCampaignInNewData.forEach(function (element) {
                    //     if (element.avgValue != 0) {
                    //         isAllSelectedCampaignHasNullAvgValue = false;
                    //     }
                    // });

                    if (isSearchedCampaignInNewData.length == 0) {
                        vm.showPlayer = false;
                        vm.showDay = false;
                        vm.showHour = false;
                        vm.campaignBar.selectedFrame = '';
                        vm.selectedFrame = '';
                    } else {
                        // && !isAllSelectedCampaignHasNullAvgValue
                        if (vm.selectedCampaign != '') {
                            if (tempSelectedFrame != '') {
                                vm.campaignBar.selectedFrame = _.clone(tempSelectedFrame);
                                vm.selectedFrame = _.clone(tempSelectedFrame);
                                vm.showPlayer = true;
                                setTimeout(function () {
                                    $('#player').height('367');
                                }, 200);
                                vm.showDay = true;
                                if (vm.selectedDay != '') {
                                    vm.showHour = true;
                                }
                            }
                            if (vm.frameSummary.length > 0 && vm.selectedFrame == '') {
                                vm.showPlayer = true;
                            }
                        } else {
                            vm.selectedCampaign = '';
                            vm.selectedFrame = '';
                            tempSelectedFrame = '';
                            vm.selectedDay = '';
                            vm.campaignBar.selectedCampaign = '';
                            vm.campaignBar.selectedFrame = '';
                            vm.campaignBar.advertiserName = '';
                            vm.campaignBar.brandName = '';
                            vm.showPlayer = false;
                            vm.showDay = false;
                            vm.showHour = false;
                        }
                    }
                }
                generateChart('campaign', data, flag);
            }

            if (chart == "player") {

                data = _.cloneDeep(vm.frameSummary);

                if (!compaliant) {
                    data = vm.frameSummary.filter(function (obj) {
                        return obj.failedAudience == true;
                    });
                }

                if (!noncompaliant) {
                    data = vm.frameSummary.filter(function (obj) {
                        return obj.failedAudience == false;
                    });
                }

                if (!compaliant && !noncompaliant) {
                    data = [];
                }

                if (vm.selectedFrame != '') {
                    var isSearchedPlayerInNewData = data.filter(function (obj) {
                        return obj.id.indexOf(vm.selectedFrame.toUpperCase()) > -1;
                    });

                    if (isSearchedPlayerInNewData.length == 0) {
                        vm.showDay = false;
                        vm.showHour = false;
                    } else {
                        if (vm.selectedFrame != '') {
                            vm.showPlayer = true;
                            vm.showDay = true;
                            if (vm.selectedDay != '') {
                                vm.showHour = true;
                            }
                        }
                    }
                }
                generateChart('player', data, false);
            }

            if (chart == "day") {

                data = _.cloneDeep(vm.daySummary);

                if (!compaliant) {
                    data = vm.daySummary.filter(function (obj) {
                        return obj.failedAudience == true;
                    });
                }

                if (!noncompaliant) {
                    data = vm.daySummary.filter(function (obj) {
                        return obj.failedAudience == false;
                    });
                }

                if (!compaliant && !noncompaliant) {
                    data = [];
                }

                if (vm.selectedDay != '') {
                    var isSearchedDayInNewData = data.filter(function (obj) {
                        return obj.id.indexOf(vm.selectedDay.toUpperCase()) > -1;
                    });
                    if (isSearchedDayInNewData.length == 0) {
                        vm.showHour = false;
                    } else {
                        if (vm.selectedDay != '') {
                            vm.showHour = true;
                        }
                    }
                }
                generateChart('day', data, false);
            }

            if (chart == "hour") {

                data = _.cloneDeep(vm.spanSummary);

                if (!compaliant) {
                    data = vm.spanSummary.filter(function (obj) {
                        return obj.failedAudience == true;
                    });
                }

                if (!noncompaliant) {
                    data = vm.spanSummary.filter(function (obj) {
                        return obj.failedAudience == false;
                    });
                }

                if (!compaliant && !noncompaliant) {
                    data = [];
                }

                generateChart('hour', data, false);
            }

            highlightSelectedBar();
            setToolTips();
        }

        /**
         * @desc It makes server call to get frames for selected campaign. 
         * @desc It also makes server call for zendesk ticket for non compliant campaigns.
         * @param {any} points
         * @param {any} evt
         * @returns void
         * @author Amit Mahida
         */
        function onCampaignClick(points, evt) {
            if (points.length > 0 && (vm.campaign.compaliant || vm.campaign.noncompaliant)) { // condition added for CC-115

                $('#compliance-tooltip').hide();
                var campaign = points[0]['_chart'].config.data.datasets[points[0]['_datasetIndex']].campaignDetails[points[0]['_index']];

                if (campaign.audienceValue == 0) {
                    return false;
                }

                vm.selectedCampaign = campaign.id;
                vm.campaignBar.selectedCampaign = _.cloneDeep(vm.selectedCampaign);
                vm.campaignBar.brandName = campaign.brandName;
                vm.campaignBar.advertiserName = campaign.advertiserName;

                vm.selectedDay = '';

                vm.playerData = {};
                vm.player.compaliant = true;
                vm.player.noncompaliant = true;

                vm.selectedFrame = '';
                tempSelectedFrame = '';

                getSummaries();
                var campaignId = vm.selectedCampaign.split(':')[1];
                vm.smartContentURL = 'https://smartcontent.jcdecaux.com/api/v2/smartbrics/' + campaignId + '/reporting';

                if (campaignId && campaign.failedAudience) {
                    var params = {
                        "id": campaignId,
                        "startDate": vm.datePicker.date.startDate
                    };
                    filterService.getTooltipData(params).then(function (response) {
                        if (response) {
                            var campaignData = response.data[campaignId];
                            if (campaignData && campaignData.length > 0) {
                                vm.isZendeskTicketAvailable = true;
                                vm.zendeskTableHeaders = Object.keys(campaignData[0]);
                                vm.zendeskTableBody = campaignData;
                            } else {
                                $('#compliance-tooltip').hide();
                                vm.isZendeskTicketAvailable = false;
                            }
                        } else {
                            $('#compliance-tooltip').hide();
                            vm.isZendeskTicketAvailable = false;
                        }
                    });
                } else {
                    vm.isZendeskTicketAvailable = false;
                }
            } else {
                return false;
            }
        }

        /**
         * @desc It makes server call to get frames for selected campaign, when clicked on impressions. 
         * @desc It also makes server call for zendesk ticket for non compliant campaigns.
         * @param {any} points
         * @param {any} evt
         * @returns void
         * @author Nishit
         */
        function onImpressionClick(points, evt) {
            if (points.length > 0 && (vm.campaign.compaliant || vm.campaign.noncompaliant)) { // condition added for CC-115

                $('#compliance-tooltip').hide();
                var campaign = points[0]['_chart'].config.data.datasets[points[0]['_datasetIndex']]; // .data[points[0]['_index']];

                // Amit : CC-308 : In Audience Summary graph, If colemete bar color is green then user can't click on that.
                // if (campaign.data[points[0]['_index']] == 0) {
                //     return false;
                // }                
                vm.selectedCampaign = campaign.id[points[0]['_index']];
                vm.campaignBar.selectedCampaign = _.cloneDeep(vm.selectedCampaign);
                vm.campaignBar.brandName = campaign.brandName[points[0]['_index']];
                vm.campaignBar.advertiserName = campaign.advertiserName[points[0]['_index']];

                vm.selectedDay = '';

                vm.playerData = {};
                vm.player.compaliant = true;
                vm.player.noncompaliant = true;

                vm.selectedFrame = '';
                tempSelectedFrame = '';

                getSummaries();
                var campaignId = vm.selectedCampaign.split(':')[1];
                vm.smartContentURL = SMART_CONTENT_LINK + campaignId + '/reporting';
                if (campaignId && campaign.failedAudience[points[0]['_index']]) {
                    var params = {
                        "id": campaignId,
                        "startDate": vm.datePicker.date.startDate
                    };
                    filterService.getTooltipData(params).then(function (response) {
                        if (response) {
                            var campaignData = response.data[campaignId];
                            if (campaignData && campaignData.length > 0) {
                                vm.isZendeskTicketAvailable = true;
                                vm.zendeskTableHeaders = Object.keys(campaignData[0]);
                                vm.zendeskTableBody = campaignData;
                            } else {
                                $('#compliance-tooltip').hide();
                                vm.isZendeskTicketAvailable = false;
                            }
                        } else {
                            $('#compliance-tooltip').hide();
                            vm.isZendeskTicketAvailable = false;
                        }
                    });
                } else {
                    vm.isZendeskTicketAvailable = false;
                }
            } else {
                return false;
            }
        }

        /**
         * @desc It makes server call to get frames for selected player.
         * @desc It also makes server call for zendesk ticket for non compliant frames. 
         * @param {any} points 
         * @param {any} evt 
         * @returns boolean
         */
        function onPlayerClick(points, evt) {
            if (points.length > 0) {
                $('#player-tooltip').hide();
                var player = points[0]['_chart'].config.data.datasets[points[0]['_datasetIndex']].playerDetails[points[0]['_index']];

                if (player.audienceValue == 0) {
                    return false;
                }

                vm.selectedFrame = player.id;
                tempSelectedFrame = _.clone(player.id);
                vm.campaignBar.selectedFrame = _.cloneDeep(vm.selectedFrame);
                vm.selectedDay = '';
                vm.dayData = [];
                vm.day.compaliant = true;
                vm.day.noncompaliant = true;
                vm.selectedDay = '';
                getSummaries();

                var displayUnitId = player.label;

                if (displayUnitId && player.failedAudience) {
                    var params = {
                        "id": displayUnitId,
                        "startDate": vm.datePicker.date.startDate
                    };
                    filterService.getTooltipData(params).then(function (response) {

                        if (response) {
                            var frameData = response.data[displayUnitId];
                            if (frameData && frameData.length > 0) {
                                vm.isZendeskTicketAvailable = true;
                                vm.zendeskTableHeaders = Object.keys(frameData[0]);
                                vm.zendeskTableBody = frameData;
                            } else {
                                $('#compliance-tooltip').hide();
                                vm.isZendeskTicketAvailable = false;
                                // Materialize.toast(response.message, TOASTER_TIME_INTERVAL, 'rounded');
                            }
                        } else {
                            $('#compliance-tooltip').hide();
                            vm.isZendeskTicketAvailable = false;
                            // Materialize.toast(response.message, TOASTER_TIME_INTERVAL, 'rounded');
                        }
                    });
                } else {
                    vm.isZendeskTicketAvailable = false;
                }
            } else {
                return false;
            }
        }

        /**
         * 
         * @param {any} points 
         * @param {any} evt 
         * @returns 
         */
        function onDayClick(points, evt) {
            if (points.length > 0) {
                var dayDetails = points[0]['_chart'].config.data.datasets[points[0]['_datasetIndex']].dayDetails[points[0]['_index']];

                if (dayDetails.audienceValue == 0) {
                    return false;
                }
                var dayId = dayDetails.id; // Value of particluar bar
                vm.selectedDay = dayId;
                vm.hourData = [];
                vm.hour.compaliant = true;
                vm.hour.noncompaliant = true;
                getSummaries();
            } else {
                return false;
            }
        }


        // Code to fill the drop downs    

        /**
         * @desc
         * @param {any} $query 
         * @returns 
         */
        function loadmarketingNames($query) {
            if ($query == '')
                return vm.marketingNames;
            else {
                return vm.marketingNames.filter(function (marketingName) {
                    return marketingName.marketingName.toLowerCase().indexOf($query.toLowerCase()) != -1;
                });
            }
        }

        /**
         * @desc
         * @param {any} $query 
         * @returns 
         */
        function loadSpecialist($query) {
            if ($query == '')
                return vm.specialists;
            else {
                return vm.specialists.filter(function (specialist) {
                    return specialist.organisationName.toLowerCase().indexOf($query.toLowerCase()) != -1;
                });
            }
        }

        /**
         * @desc
         * @param {any} index 
         * @param {any} arr 
         */
        function removeTags(index, arr) {

            checkAllcheckBoxes();
            setTimeout(function () {
                if (arr === "marketingNames") {
                    $("#" + arr + " li").filter(function () {
                        return $.text([this]) === vm.filters.marketingNames[index].marketingName;
                    }).trigger('click');
                } else {
                    $("#" + arr + " li").filter(function () {
                        return $.text([this]) === vm.filters.specialists[index].organisationName;
                    }).trigger('click');
                }
                $("body").trigger('click');
            }.bind(this), 0);
        }

        /**
         * @desc This function filters both summary charts based on selected filters
         * @author Amit Mahida
         * @param {*} data 
         */
        function filterSummaries(data) {
            var totalCampaigns = _.groupBy(data, 'businessAreaCode');
            var compliantCampaignsForBusinessArea, totalCampaignsForBusinessArea;
            var percentage = 0;

            // black charts (Audience Compliance)
            for (var index = 0; index < vm.channelSummaryByAudience.length; index++) {
                var inelement = vm.channelSummaryByAudience[index];

                if (totalCampaigns[inelement.id]) {
                    totalCampaignsForBusinessArea = totalCampaigns[inelement.id];
                    var sumOfActual = 0,
                        sumOfTarget = 0;

                    if (totalCampaignsForBusinessArea.length > 0) {
                        for (var index2 = 0; index2 < totalCampaignsForBusinessArea.length; index2++) {
                            var inelement1 = totalCampaignsForBusinessArea[index2];
                            sumOfActual += inelement1.audienceValue;
                            sumOfTarget += inelement1.value;
                        }
                    }
                    percentage = (sumOfTarget == 0) ? 0 : ((sumOfActual / sumOfTarget) * 100);
                    vm.channelSummaryByAudience[index].percentage = percentage > 100 ? 100 : percentage;
                    vm.channelSummaryByAudience[index].percentageDisplay = percentage > 100 ? 100 : parseFloat(percentage).toFixed(2);
                } else {
                    vm.channelSummaryByAudience[index].percentage = 0;
                    vm.channelSummaryByAudience[index].percentageDisplay = 0;
                }
            }

            // blue charts (Campaign Compliance)
            for (var index1 = 0; index1 < vm.channelSummaryByCampaign.length; index1++) {
                var inelement2 = vm.channelSummaryByCampaign[index1];
                if (totalCampaigns[inelement2.id]) {
                    totalCampaignsForBusinessArea = totalCampaigns[inelement2.id];
                    if (totalCampaignsForBusinessArea.length > 0) {
                        compliantCampaignsForBusinessArea = totalCampaignsForBusinessArea.filter(function (obj) {
                            return obj.failedAudience == false;
                        });
                        percentage = (compliantCampaignsForBusinessArea.length / totalCampaignsForBusinessArea.length) * 100;
                        vm.channelSummaryByCampaign[index1].value = percentage > 100 ? 100 : parseFloat(percentage).toFixed(2);
                    }
                } else {
                    vm.channelSummaryByCampaign[index1].value = 0;
                }
            }
        }

        /**
         * This function resets the state of chart level checkbox filters
         * @returns void
         */
        function checkAllcheckBoxes() {
            vm.player.compaliant = true;
            vm.player.noncompaliant = true;
            vm.campaign.compaliant = true;
            vm.campaign.noncompaliant = true;
            vm.day.compaliant = true;
            vm.day.noncompaliant = true;
            vm.hour.compaliant = true;
            vm.hour.noncompaliant = true;
        }

        /**
         * This function prepared information tooltip on each section
         * @return void
         */
        function setToolTips() {

            if (!_.isUndefined(vm.userBundle)) {
                $("#dashBoardToolTip").attr("data-tooltip", vm.userBundle['common.dashboard.tooltip']);
                $("#dashBoardToolTip").tooltip();

                $("#gaugetooltip").attr("data-tooltip", vm.userBundle['common.gauge.tooltip']);
                $("#gaugetooltip").tooltip();

                $("#gaugetooltip_audience").attr("data-tooltip", vm.userBundle['common.gauge.tooltip.audience']);
                $("#gaugetooltip_audience").tooltip();

                // campaign
                $("#framecampaigntooltip").attr("data-tooltip", vm.userBundle['popboard.frame.campaign.tooltip']);
                $("#framecampaigntooltip").tooltip();

                $("#sotcampaigntooltip").attr("data-tooltip", vm.userBundle['popboard.sot.campaign.tooltip']);
                $("#sotcampaigntooltip").tooltip();

                $("#impressionscampaigntooltip").attr("data-tooltip", vm.userBundle['popboard.impressions.campaign.tooltip']);
                $("#impressionscampaigntooltip").tooltip();

                // player
                $("#frameplayertooltip").attr("data-tooltip", vm.userBundle['popboard.frame.player.tooltip']);
                $("#frameplayertooltip").tooltip();

                $("#sotplayertooltip").attr("data-tooltip", vm.userBundle['popboard.sot.player.tooltip']);
                $("#sotplayertooltip").tooltip();

                $("#impressionsplayertooltip").attr("data-tooltip", vm.userBundle['popboard.impressions.player.tooltip']);
                $("#impressionsplayertooltip").tooltip();


                //Date
                $("#framedatetooltip").attr("data-tooltip", vm.userBundle['popboard.frame.date.tooltip']);
                $("#framedatetooltip").tooltip();

                $("#sotdatetooltip").attr("data-tooltip", vm.userBundle['popboard.sot.date.tooltip']);
                $("#sotdatetooltip").tooltip();

                $("#impressionstdatetooltip").attr("data-tooltip", vm.userBundle['popboard.impressions.date.tooltip']);
                $("#impressionstdatetooltip").tooltip();

                // Time
                $("#frametimetooltip").attr("data-tooltip", vm.userBundle['popboard.frame.time.tooltip']);
                $("#frametimetooltip").tooltip();

                $("#sottimetooltip").attr("data-tooltip", vm.userBundle['popboard.sot.time.tooltip']);
                $("#sottimetooltip").tooltip();

                $("#impressionstimetooltip").attr("data-tooltip", vm.userBundle['popboard.impressions.time.tooltip']);
                $("#impressionstimetooltip").tooltip();
            }
        }

        /**
         * This function makes server call to get initial configuration data
         * @return void
         */
        function getInitialConfig() {
            var initalConfigData = filterService.getInitialConfig().then(function (data) {

                vm.configData = data.data;
                vm.userBundle = data.data.userBundle;
                setToolTips();

                configureOptions.HOUR_BAR.scales.xAxes[0].scaleLabel.labelString = vm.userBundle["popboard.time.xAxis.label"];
                configureOptions.HOUR_BAR.scales.yAxes[0].scaleLabel.labelString = vm.userBundle["popboard.time.yAxis.label"];

                configureOptions.HORIZONTAL_BAR.scales.xAxes[0].scaleLabel.labelString = vm.userBundle["popboard.campaign.xAxis.label"];
                configureOptions.HORIZONTAL_BAR.scales.yAxes[0].scaleLabel.labelString = vm.userBundle["popboard.campaign.yAxis.label"];

                configureOptions.BAR_PLAYER.scales.xAxes[0].scaleLabel.labelString = vm.userBundle["popboard.player.xAxis.label"];
                configureOptions.BAR_PLAYER.scales.yAxes[0].scaleLabel.labelString = vm.userBundle["popboard.player.yAxis.label"];

                configureOptions.BAR_DAY.scales.xAxes[0].scaleLabel.labelString = vm.userBundle["popboard.date.xAxis.label"];
                configureOptions.BAR_DAY.scales.yAxes[0].scaleLabel.labelString = vm.userBundle["popboard.date.yAxis.label"];

                if (vm.configData.complainceLevel) {
                    COMPLAINCE_PERCENTAGE = vm.configData.complainceLevel;
                }
                //CC-22
                vm.datePicker = {
                    date: {
                        startDate: moment(new Date(new Date().setDate(new Date().getDate() - 7))).format(DATE_FORMAT),
                        endDate: moment(new Date(new Date().setDate(new Date().getDate() - 1))).format(DATE_FORMAT)
                    }
                };

                if (vm.configData.serviceCalls) {
                    loadServiceCallKeys(vm.configData.serviceCalls);
                }

                if (vm.configData.specialists) {
                    vm.specialists = vm.configData.specialists;
                }

                if (vm.configData.marketingNames) {
                    vm.marketingNames = _.sortBy(vm.configData.marketingNames, [function (o) {
                        return o.marketingName;
                    }]);
                }


                MAX_INACTIVE_INTERVAL = vm.configData.systemData.maxInactiveInterval || MAX_INACTIVE_INTERVAL;

                getSummaries();

            });

            setTimeout(function () {
                $('#my-drop-btn').dropdown({
                    belowOrigin: true // Displays dropdown below the button
                });
                $('select').material_select();
            });
        }

        /**
         * This function loads the application service call urls
         * @param {any} serviceCallKeys 
         */
        function loadServiceCallKeys(serviceCallKeys) {
            var key;
            for (key in serviceCallKeys) {
                window[key] = (typeof SERVICE_BASE_URL != 'undefined' ? SERVICE_BASE_URL : '') + serviceCallKeys[key];
            }
        }

        /**
         * @desc This function generates summary charts with their respective configurations
         * @param {any} type 
         * @param {any} chartData 
         * @param {any} toggleOtherCharts 
         */
        function generateChart(type, chartData, toggleOtherCharts) {
            var campaignId = '',
                campaignData = '';
            switch (type) {
                case 'campaign':
                    vm.campaignData = {
                        labels: [],
                        datasets: [{
                            backgroundColor: [],
                            data: [],
                            compliantcheck: [],
                            brandName: [],
                            advertiserName: []
                        }]
                    };

                    vm.impressionsData = {
                        labels: [],
                        data: [
                            [],
                            []
                        ],
                        colors: [{
                            backgroundColor: []
                        }, {
                            backgroundColor: []
                        }]
                    };

                    vm.campaign.compliantCount = 0;
                    vm.campaign.noncompliantCount = 0;

                    vm.campaignDetails = {
                        campaignDetails: []
                    };

                    vm.impressionsDetails = [{
                        advertiserName: [],
                        brandName: [],
                        id: [],
                        failedAudience: [],
                        difference: []
                    }]

                    vm.campaignOptions.animation = {
                        onProgress: function (chart) {
                            var sourceCanvas = this.chart.ctx.canvas;
                            var copyHeight = this.scales['x-axis-0'].height - 4;
                            var copyWidth = sourceCanvas.width;
                            var targetCtx = document.getElementById("campaignXAxis").getContext("2d");
                            targetCtx.canvas.width = sourceCanvas.width;
                            targetCtx.canvas.style.width = sourceCanvas.scrollWidth + 'px';
                            targetCtx.canvas.height = copyHeight;
                            targetCtx.drawImage(sourceCanvas, 0, 0, copyWidth, copyHeight, 0, 0, copyWidth, copyHeight);
                            vm.campaignYAxisLabel = this.chart.options.scales.yAxes[0].scaleLabel.labelString;
                            // Amit : resolution patch 1366*768 px
                            if (resolutionCounter <= 2) {
                                $('.chart-container').width($('.chart-container').width() - 1);
                                $('.chart-container').width($('.chart-container').width() + 1);
                            }

                            resolutionCounter++;
                        },
                        onComplete: function (chart) {
                            var sourceCanvas = this.chart.ctx.canvas;
                            var copyHeight = this.scales['x-axis-0'].height - 4;
                            var copyWidth = sourceCanvas.width;
                            var targetCtx = document.getElementById("campaignXAxis").getContext("2d");
                            targetCtx.canvas.width = sourceCanvas.width;
                            targetCtx.canvas.style.width = sourceCanvas.scrollWidth + 'px';
                            targetCtx.canvas.height = copyHeight;
                            targetCtx.drawImage(sourceCanvas, 0, 0, copyWidth, copyHeight, 0, 0, copyWidth, copyHeight);
                            vm.campaignYAxisLabel = this.chart.options.scales.yAxes[0].scaleLabel.labelString;

                            //Amit : resolution patch 1366*768 px
                            if (resolutionCounter <= 2) {
                                $('.chart-container').width($('.chart-container').width() - 1);
                                $('.chart-container').width($('.chart-container').width() + 1);
                            }
                            resolutionCounter++;
                        }
                    };


                    vm.impressionsOptions.animation = {
                        onProgress: function (chart) {
                            var sourceCanvas = this.chart.ctx.canvas;
                            var copyHeight = this.scales['x-axis-0'].height - 4;
                            var copyWidth = sourceCanvas.width;
                            var targetCtx = document.getElementById("campaignXAxis2").getContext("2d");
                            targetCtx.canvas.width = sourceCanvas.width;
                            targetCtx.canvas.style.width = sourceCanvas.scrollWidth + 'px';
                            targetCtx.canvas.height = copyHeight;
                            targetCtx.drawImage(sourceCanvas, 0, 0, copyWidth, copyHeight, 0, 0, copyWidth, copyHeight);
                            vm.campaignAudienceYAxisLabel = this.chart.options.scales.yAxes[0].scaleLabel.labelString;

                        },
                        onComplete: function (chart) {
                            var sourceCanvas = this.chart.ctx.canvas;
                            var copyHeight = this.scales['x-axis-0'].height - 4;
                            var copyWidth = sourceCanvas.width;
                            var targetCtx = document.getElementById("campaignXAxis2").getContext("2d");
                            targetCtx.canvas.width = sourceCanvas.width;
                            targetCtx.canvas.style.width = sourceCanvas.scrollWidth + 'px';
                            targetCtx.canvas.height = copyHeight;
                            targetCtx.drawImage(sourceCanvas, 0, 0, copyWidth, copyHeight, 0, 0, copyWidth, copyHeight);
                            vm.campaignAudienceYAxisLabel = this.chart.options.scales.yAxes[0].scaleLabel.labelString;
                        }
                    };

                    vm.campaignOptions.size.height = calculateHeightForCampaign(_.clone(configureOptions.HORIZONTAL_BAR.size.height), chartData.length);
                    vm.impressionsOptions.size.height = _.cloneDeep(vm.campaignOptions.size.height);

                    if (chartData.length > 1185) {
                        Materialize.toast("Please decrease the date range to view the graph", TOASTER_TIME_INTERVAL, 'rounded');
                        return;
                    }

                    chartData = _.sortBy(chartData, 'avgValue').reverse();

                    _.forEach(chartData, function (obj) {
                        vm.campaignData.labels.push(obj.label);
                        vm.campaignData.datasets[0].advertiserName.push(obj.advertiserName);
                        vm.campaignData.datasets[0].brandName.push(obj.brandName);

                        vm.campaignData.datasets[0].data.push(obj.avgValue);

                        if (obj.failedAudience) {
                            ++vm.campaign.noncompliantCount;
                            vm.campaignData.datasets[0].backgroundColor.push(RED_COLOR);
                            vm.campaignData.datasets[0].compliantcheck.push(false);
                        } else {
                            vm.campaignData.datasets[0].backgroundColor.push(BLUE_COLOR);
                            vm.campaignData.datasets[0].compliantcheck.push(true);
                            ++vm.campaign.compliantCount;
                        }
                        vm.campaignDetails.campaignDetails.push(obj);
                    });

                    // CC-226
                    chartData = _.sortBy(chartData, 'value').reverse();

                    _.forEach(chartData, function (obj) {
                        vm.impressionsData.labels.push(obj.label)
                        obj['difference'] = obj.audienceValue - obj.value;

                        vm.impressionsData.colors[0].backgroundColor.push(BLUE_COLOR.backgroundColor);

                        if (obj.difference > 0) {
                            vm.impressionsData.data[0].push((obj.value).toFixed(2));
                            vm.impressionsData.colors[1].backgroundColor.push(DARK_GREEN_COLOR);
                            vm.impressionsData.data[1].push(obj.difference.toFixed(2));
                        } else {
                            vm.impressionsData.data[0].push((obj.value + obj.difference).toFixed(2));
                            vm.impressionsData.colors[1].backgroundColor.push(RED_COLOR.backgroundColor);
                            vm.impressionsData.data[1].push((obj.difference * -1).toFixed(2));
                        }

                        // for data override
                        vm.impressionsDetails[0].advertiserName.push(obj.advertiserName);
                        vm.impressionsDetails[0].brandName.push(obj.brandName);
                        vm.impressionsDetails[0].id.push(obj.id);
                        vm.impressionsDetails[0].failedAudience.push(obj.failedAudience);
                        vm.impressionsDetails[0].difference.push(obj.difference);
                    });

                    vm.campaignOptions.tooltips = {
                        enabled: true,
                        mode: 'index',
                        position: 'average',
                        displayColors: true
                    };

                    vm.impressionsOptions.tooltips = {
                        enabled: true,
                        mode: 'index',
                        position: 'average',
                        yAlign: 'top',
                        displayColors: true
                    };

                    if (toggleOtherCharts) {
                        vm.hideWatermark = true;
                        vm.showCampaign = true;
                    }

                    break;
                case 'player':
                    vm.playerData = {
                        labels: [],
                        datasets: [{
                            backgroundColor: [],
                            borderWidth: 1,
                            data: [],
                            compliantcheck: []
                        }]
                    };

                    vm.player.compliantCount = 0;
                    vm.player.noncompliantCount = 0;

                    vm.playerDetails = {
                        playerDetails: []
                    };
                    vm.width = calculateWidthForPlayer(chartData.length);
                    chartData = _.sortBy(chartData, 'audienceValue').reverse();

                    _.forEach(chartData, function (obj) {

                        vm.playerData.labels.push(obj.label);
                        vm.playerData.datasets[0].data.push(obj.audienceValue);
                        if (obj.failedAudience) {
                            vm.playerData.datasets[0].backgroundColor.push(RED_COLOR);
                            vm.playerData.datasets[0].compliantcheck.push(false);
                            ++vm.player.noncompliantCount;
                        } else {
                            vm.playerData.datasets[0].backgroundColor.push(BLUE_COLOR);
                            vm.playerData.datasets[0].compliantcheck.push(true);
                            ++vm.player.compliantCount;
                        }

                        vm.playerDetails.playerDetails.push(obj);
                    });

                    if (toggleOtherCharts) {
                        vm.showPlayer = true;
                        vm.showDay = false;
                        vm.showHour = false;
                    }

                    vm.barOptions.animation = {
                        onComplete: function (chart) {
                            var sourceCanvas = this.chart.ctx.canvas;
                            var copyHeight = sourceCanvas.height;
                            var copyWidth = this.scales['y-axis-0'].width + 5;
                            var targetCtx = document.getElementById("playerAxis").getContext("2d");
                            targetCtx.canvas.width = copyWidth;
                            targetCtx.canvas.style.height = sourceCanvas.offsetHeight + 'px';
                            targetCtx.canvas.height = copyHeight;
                            targetCtx.drawImage(sourceCanvas, 0, 0, copyWidth, copyHeight, 0, 0, copyWidth, copyHeight);
                            vm.playerXAxisLabel = this.chart.options.scales.xAxes[0].scaleLabel.labelString;
                        },
                        onProgress: function (chart) {
                            var sourceCanvas = this.chart.ctx.canvas;
                            var copyHeight = sourceCanvas.height;
                            var copyWidth = this.scales['y-axis-0'].width + 5;
                            var targetCtx = document.getElementById("playerAxis").getContext("2d");
                            targetCtx.canvas.width = copyWidth;
                            targetCtx.canvas.style.height = sourceCanvas.offsetHeight + 'px';
                            targetCtx.canvas.height = copyHeight;
                            targetCtx.drawImage(sourceCanvas, 0, 0, copyWidth, copyHeight, 0, 0, copyWidth, copyHeight);
                            vm.playerXAxisLabel = this.chart.options.scales.xAxes[0].scaleLabel.labelString;
                        }
                    };

                    vm.barOptions.tooltips = {
                        enabled: false,
                        mode: 'index',
                        position: 'average',
                        custom: function (tooltipModel) {
                            var chart = this._chart;
                            frameTooltip(tooltipModel, chart);
                        }
                    };
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
                    vm.day.compliantCount = 0;
                    vm.day.noncompliantCount = 0;

                    vm.dayDetails = {
                        dayDetails: []
                    };

                    vm.dayChartWidth = calculateWidthForPlayer(chartData.length);

                    vm.dayOptions.animation = {
                        onProgress: function (chart) {
                            var sourceCanvas = this.chart.ctx.canvas;
                            var copyHeight = sourceCanvas.height;
                            var copyWidth = this.scales['y-axis-0'].width;
                            var targetCtx = document.getElementById("dayAxis").getContext("2d");
                            targetCtx.canvas.width = copyWidth;
                            targetCtx.canvas.style.height = sourceCanvas.offsetHeight + 'px';
                            targetCtx.canvas.height = copyHeight;
                            targetCtx.drawImage(sourceCanvas, 0, 0, copyWidth, copyHeight, 0, 0, copyWidth, copyHeight);
                            vm.dayXAxisLabel = this.chart.options.scales.xAxes[0].scaleLabel.labelString;
                        },
                        onComplete: function (chart) {
                            var sourceCanvas = this.chart.ctx.canvas;
                            var copyHeight = sourceCanvas.height;
                            var copyWidth = this.scales['y-axis-0'].width;
                            var targetCtx = document.getElementById("dayAxis").getContext("2d");
                            targetCtx.canvas.width = copyWidth;
                            targetCtx.canvas.style.height = sourceCanvas.offsetHeight + 'px';
                            targetCtx.canvas.height = copyHeight;
                            targetCtx.drawImage(sourceCanvas, 0, 0, copyWidth, copyHeight, 0, 0, copyWidth, copyHeight);
                            vm.dayXAxisLabel = this.chart.options.scales.xAxes[0].scaleLabel.labelString;
                        }
                    };

                    vm.dayOptions.size.width = calculateWidthForCampaign(vm.dayOptions.size.width, chartData.length);
                    _.forEach(chartData, function (obj) {
                        vm.dayData.labels.push(obj.label);
                        vm.dayData.datasets[0].data.push(obj.audienceValue);

                        if (obj.failedAudience) {
                            vm.dayData.datasets[0].backgroundColor.push(RED_COLOR);
                            vm.day.noncompliantCount++;
                        } else {
                            vm.dayData.datasets[0].backgroundColor.push(BLUE_COLOR);
                            vm.day.compliantCount++;
                        }
                        vm.dayDetails.dayDetails.push(obj);
                    });

                    if (toggleOtherCharts) {
                        vm.showDay = true;
                        vm.showHour = false;
                    }
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
                    vm.hour.compliantCount = 0;
                    vm.hour.noncompliantCount = 0;

                    vm.hourDetails = {
                        hourDetails: []
                    };

                    // Commented the below code based on Ravi R confirmation as he wanted sorting by Hour
                    // chartData = _.sortBy(chartData, 'value').reverse(); // for hour data we will not get avgValue, Nishit, CCP-290

                    _.forEach(chartData, function (obj) {
                        vm.hourData.labels.push(obj.label);


                        vm.hourData.datasets[0].data.push(obj.audienceValue);

                        if (obj.failedAudience) {
                            vm.hourData.datasets[0].backgroundColor.push(RED_COLOR);
                            ++vm.hour.compliantCount;
                        } else {
                            vm.hourData.datasets[0].backgroundColor.push(BLUE_COLOR);
                            if (!angular.isUndefined(obj.failedAudience))
                                ++vm.hour.noncompliantCount;
                        }
                        vm.hourDetails.hourDetails.push(obj);
                    });

                    if (toggleOtherCharts)
                        vm.showHour = true;

                    break;
            }
        }

        /**
         * @desc
         * @param {any} id 
         */
        function closeTooltip(id) {
            $('#' + id).hide();
        }

        /**
         * This function retrives all summary chart's data from the server
         * @returns void
         */
        function getSummaries() {
            createFilterOject();
            var filterChanged = isFilterChanged();
            var requestParameter = {};

            if (vm.datePicker.date) {
                requestParameter.startDate = vm.filterObject.startDate;
                requestParameter.endDate = vm.filterObject.endDate;
            }

            requestParameter.filterChange = filterChanged;

            if (!_.isUndefined(vm.selectedCampaign) && vm.selectedCampaign != '') {
                requestParameter.campaignId = vm.selectedCampaign;
            }

            if (!_.isUndefined(vm.selectedFrame) && vm.selectedFrame != '') {
                requestParameter.extendedCodeId = vm.selectedFrame;
            } else {
                if (!_.isUndefined(tempSelectedFrame) && tempSelectedFrame != '') {
                    requestParameter.extendedCodeId = tempSelectedFrame;
                    vm.selectedFrame = tempSelectedFrame;
                }
            }

            if (!_.isUndefined(vm.selectedDay) && vm.selectedDay != '')
                requestParameter.dayId = vm.selectedDay;

            if (_.isUndefined(requestParameter.startDate) || _.isUndefined(requestParameter.endDate)) {
                return;
            }
            filterService.getSummaries(requestParameter).then(function (response) {
                vm.cachedFilterObject = _.cloneDeep(vm.filterObject);
                if (response && response.data) {
                    var data = response.data;
                    if (data.channelSummary && data.channelSummary.length > 0) {
                        vm.channelSummaryByCampaign = data.channelSummaryByAudience;
                        vm.channelSummaryByAudience = data.channelSummaryByImpression;

                        vm.channelSummaryByCampaign = _.map(vm.channelSummaryByCampaign, function (obj) {
                            return ((vm.filters.channels.indexOf(obj.id) === -1) ? angular.extend(obj, {
                                guageColors: vm.defaultGuageColors
                            }) : angular.extend(obj, {
                                guageColors: vm.selectedGuageColors
                            }));
                        });

                        vm.channelSummaryByAudience = _.map(vm.channelSummaryByAudience, function (obj) {
                            var percentage;

                            if (parseFloat(obj.value)) {
                                percentage = parseFloat(((obj.audienceValue * 100) / obj.value).toFixed(2));
                                percentage = (isNaN(percentage) ? "0.00" : percentage);
                            } else {
                                percentage = "0.00";
                            }
                            var moreData = {
                                percentageDisplay: percentage,
                                percentage: (percentage > 100 ? 100 : percentage),
                            };
                            return (angular.extend(obj, {
                                guageColors: vm.impressionGaugeColors
                            }, moreData));
                        });

                        vm.chachedChannelSummaryByAudience = _.cloneDeep(vm.channelSummaryByCampaign);
                        vm.chachedChannelSummaryByImpression = _.cloneDeep(vm.channelSummaryByAudience);
                    }
                    if (data.campaignSummary) {
                        if (data.campaignSummary.length > 0) {
                            vm.campaignOptions.size = _.clone(configureOptions.HORIZONTAL_BAR.size); // after change in filter need to reset size
                            vm.campaignSummary = _.map(data.campaignSummary, function (obj) {
                                obj.value = parseFloat(obj.value);
                                obj.avgValue = parseFloat(obj.avgValue);
                                obj.audienceValue = parseFloat(obj.audienceValue);
                                return obj;
                            });
                            vm.cachedCampaignSummary = _.cloneDeep(vm.campaignSummary);
                            vm.compliantcheck(vm.campaign.compaliant, vm.campaign.noncompaliant, 'campaign', true);
                        } else {
                            vm.campaignSummary = [];
                            vm.campaignData = {};
                            vm.showCampaign = false;
                            vm.campaignBar = {};
                        }
                    }
                    if (data.frameSummary) {
                        if (data.frameSummary.length > 0) {
                            vm.frameSummary = _.map(data.frameSummary, function (obj) {
                                obj.value = parseFloat(obj.value);
                                obj.avgValue = parseFloat(obj.avgValue);
                                obj.audienceValue = parseFloat(obj.audienceValue);
                                return obj;
                            });
                            vm.cachedFrameSummary = _.cloneDeep(vm.frameSummary);
                            applyAllFiltersExcept();
                            generateChart('player', vm.frameSummary, true);
                            vm.showPlayer = true;
                        } else {
                            vm.playerData = {};
                            vm.showPlayer = false;
                        }
                    }
                    if (data.daySummary) {
                        if (data.daySummary.length > 0) {
                            vm.dayOptions.size = _.clone(configureOptions.BAR_DAY.size);
                            vm.daySummary = _.map(data.daySummary, function (obj) {
                                obj.value = parseFloat(obj.value);
                                obj.avgValue = parseFloat(obj.avgValue);
                                obj.audienceValue = parseFloat(obj.audienceValue);
                                return obj;
                            });
                            generateChart('day', vm.daySummary, true);
                            vm.showDay = true;
                        } else {
                            vm.dayData = {};
                            vm.showDay = false;
                        }

                    }
                    if (data.spanSummary) {
                        if (data.spanSummary.length > 0) {
                            vm.dayOptions.size = _.clone(configureOptions.BAR_DAY.size);
                            vm.spanSummary = _.map(data.spanSummary, function (obj) {
                                obj.value = parseFloat(obj.value);
                                obj.avgValue = parseFloat(obj.avgValue);
                                obj.audienceValue = parseFloat(obj.audienceValue);
                                return obj;
                            });
                            generateChart('hour', vm.spanSummary, true);
                            vm.showHour = true;
                        } else {
                            vm.hourData = {};
                            vm.showHour = false;
                        }
                    }

                    applyAllFiltersExcept();
                    highlightSelectedBar();
                }

            });
        }

        /**
         * @param {any} bodyItem 
         * @returns html
         * @author Amit Mahida
         */
        function getBody(bodyItem) {
            return bodyItem.lines;
        }

        /**
         * @desc This function generates tooltip on the fly for player chart
         * @param {any} tooltipModel 
         * @param {any} chart 
         * @author Amit Mahida
         */
        function frameTooltip(tooltipModel, chart) {
            var tooltipEl;
            if (tooltipModel.dataPoints) {
                var tooltipData = vm.frameSummary.filter(function (obj) {
                    return obj.label == tooltipModel.dataPoints[0].xLabel;
                });

                if (tooltipData.length > 0) {
                    tooltipData = tooltipData[0].tooltipData;
                } else {
                    return;
                }

                tooltipEl = document.getElementById('player-tooltip');

                // Set Text
                if (tooltipModel.body) {
                    var titleLines = "Campaign" + tooltipModel.title[0]; //tooltipModel.title || [];
                    var bodyLines = tooltipModel.body.map(getBody);

                    var innerHtml = ' ';

                    tooltipData.forEach(function (body) {
                        var colors = tooltipModel.labelColors[0];
                        var style = 'background:' + colors.backgroundColor;
                        style += '; border-color:' + colors.borderColor;
                        style += '; border-width: 2px';
                        var span = '<span class="chartjs-tooltip-key" style="' + style + '"></span>';
                        innerHtml += '<tr><td style="font-weight:600;color: #fcfcfc;">' + body.key + ' </td></tr>';
                        innerHtml += '<tr><td style="color: #fcfcfc;">' + body.value + ' </td></tr>';
                    });
                    innerHtml += '</tbody>';

                    var tableRoot = tooltipEl.querySelector('table');
                    tableRoot.innerHTML = innerHtml;
                }
                var position = chart.canvas.getBoundingClientRect();
                // Display, position, and set styles for font
                tooltipEl.style.opacity = 1;
                // tooltipEl.style.position = 'relative';
                tooltipEl.style.left = position.left + tooltipModel.caretX - 126 + 'px';
                tooltipEl.style.top = position.top - 50 + 'px';
                tooltipEl.style.fontFamily = tooltipModel._fontFamily;
                tooltipEl.style.fontSize = tooltipModel.fontSize;
                tooltipEl.style.fontStyle = tooltipModel._fontStyle;
                tooltipEl.style.padding = tooltipModel.yPadding + 'px ' + tooltipModel.xPadding + 'px';
                tooltipEl.style.display = 'flex';
                tooltipEl.style.height = 'auto';
            } else {
                tooltipEl = document.getElementById('player-tooltip');
                tooltipEl.style.display = 'none';
            }
        }

        /**
         * @desc This function handles the state of selected bar from the summary chart
         */
        function highlightSelectedBar() {
            var index;
            if (!_.isUndefined(vm.selectedCampaign) &&
                !_.isNull(vm.selectedCampaign) &&
                !_.isEmpty(vm.selectedCampaign)) {
                if (!_.isEmpty(vm.campaignData)) {

                    // below code is needed, when you select another bar need to reset background color for previous bar
                    vm.campaignData.datasets[0].backgroundColor = [];
                    _.forEach(vm.campaignDetails.campaignDetails, function (obj, key) {
                        if (obj.failedAudience) {
                            vm.campaignData.datasets[0].backgroundColor.push(RED_COLOR);
                            vm.campaignData.datasets[0].compliantcheck.push(false);
                        } else {
                            vm.campaignData.datasets[0].backgroundColor.push(BLUE_COLOR);
                            vm.campaignData.datasets[0].compliantcheck.push(true);
                        }
                    });

                    index = _.findIndex(vm.campaignDetails.campaignDetails, function (o) {
                        return o.id == vm.selectedCampaign;
                    });
                    if (index > -1) {
                        vm.campaignData.datasets[0].backgroundColor[index] = GREEN_COLOR;
                        vm.campaignBar.selectedCampaign = vm.selectedCampaign.split(':')[0];
                        vm.campaignBar.brandName = vm.campaignData.datasets[0].brandName[index];
                        vm.campaignBar.advertiserName = vm.campaignData.datasets[0].advertiserName[index];
                    } else {
                        vm.campaignBar.selectedCampaign = null;
                        vm.campaignBar.selectedFrame = null; // when no campaign is selected no frame should be selected
                        vm.campaignBar.brandName = null;
                        vm.campaignBar.advertiserName = null;
                    }

                }

                if (!_.isEmpty(vm.impressionsData)) {

                    // below code is needed, when you select another bar need to reset background color for previous bar
                    vm.impressionsData.colors = [{
                        backgroundColor: []
                    }, {
                        backgroundColor: []
                    }]
                    var allImpressionsData = vm.impressionsDetails[0].id;

                    _.forEach(allImpressionsData, function (data, index) {
                        vm.impressionsData.colors[0].backgroundColor[index] = BLUE_COLOR.backgroundColor;

                        if (vm.impressionsDetails[0].difference[index] > 0) {
                            vm.impressionsData.colors[1].backgroundColor[index] = DARK_GREEN_COLOR;
                        } else {
                            vm.impressionsData.colors[1].backgroundColor[index] = RED_COLOR.backgroundColor;
                        }
                    });

                    index = _.findIndex(allImpressionsData, function (o) {
                        return o == vm.selectedCampaign;
                    });
                    if (index > -1) {
                        vm.impressionsData.colors[0].backgroundColor[index] = GREEN_COLOR;
                        // vm.impressionsData.colors[1].backgroundColor[index] = GREEN_COLOR;
                        vm.campaignBar.selectedCampaign = vm.selectedCampaign.split(':')[0];
                        vm.campaignBar.brandName = vm.impressionsDetails[0].brandName[index];
                        vm.campaignBar.advertiserName = vm.impressionsDetails[0].advertiserName[index];
                    } else {
                        vm.campaignBar.selectedCampaign = null;
                        vm.campaignBar.selectedFrame = null; // when no campaign is selected no frame should be selected
                        vm.campaignBar.brandName = null;
                        vm.campaignBar.advertiserName = null;
                    }
                }
            }
            if (!_.isUndefined(vm.selectedFrame) &&
                !_.isNull(vm.selectedFrame) &&
                !_.isEmpty(vm.selectedFrame)) {
                if (!_.isEmpty(vm.playerData)) {
                    // below code is needed, when you select another bar need to reset background color for previous bar
                    vm.playerData.datasets[0].backgroundColor = [];
                    _.forEach(vm.playerDetails.playerDetails, function (obj, key) {
                        if (obj.failedAudience) {
                            vm.playerData.datasets[0].backgroundColor.push(RED_COLOR);
                            vm.playerData.datasets[0].compliantcheck.push(false);
                        } else {
                            vm.playerData.datasets[0].backgroundColor.push(BLUE_COLOR);
                            vm.playerData.datasets[0].compliantcheck.push(true);
                        }
                    });
                    index = _.findIndex(vm.playerDetails.playerDetails, function (o) {
                        return o.id == vm.selectedFrame;
                    });
                    if (index > -1) {
                        vm.playerData.datasets[0].backgroundColor[index] = GREEN_COLOR;
                        vm.campaignBar.selectedFrame = vm.selectedFrame;
                    } else {
                        vm.campaignBar.selectedFrame = null;
                    }
                }

            }
            if (!_.isUndefined(vm.selectedDay) && !_.isNull(vm.selectedDay) &&
                !_.isEmpty(vm.selectedDay)) {
                if (!_.isEmpty(vm.dayData)) {
                    // below code is needed, when you select another bar need to reset background color for previous bar
                    vm.dayData.datasets[0].backgroundColor = [];
                    _.forEach(vm.dayDetails.dayDetails, function (obj, key) {
                        if (obj.failedAudience) {
                            vm.dayData.datasets[0].backgroundColor.push(RED_COLOR);
                        } else {
                            vm.dayData.datasets[0].backgroundColor.push(BLUE_COLOR);
                        }
                    });
                    index = _.findIndex(vm.dayDetails.dayDetails, function (o) {
                        return o.id == vm.selectedDay;
                    });
                    if (index > -1)
                        vm.dayData.datasets[0].backgroundColor[index] = GREEN_COLOR;
                }
            }
        }

        /**
         * This fucntion resets current state and data of all charts
         * @author Amit Mahida
         */
        function resetCharts() {
            vm.fullscreenFor = '';
            vm.selectedCampaign = '';
            vm.selectedFrame = '';
            vm.selectedDay = '';
            vm.showPlayer = false;
            vm.showDay = false;
            vm.showHour = false;
            vm.frameSummary = [];
            vm.daySummary = [];
            vm.spanSummary = [];
            resetFilters();
        }

        function resetFilters() {
            vm.filters = {
                specialists: [],
                marketingNames: [],
                channels: [],
                campaignRef: ''
            };
        }

        /**
         * @desc
         * @returns 
         */
        function isFilterChanged() {
            if (Object.keys(vm.cachedFilterObject).length > 0) {
                if (JSON.stringify(vm.filterObject) == JSON.stringify(vm.cachedFilterObject)) {
                    return false;
                } else {
                    resetCharts();
                    return true;
                }
            } else {
                resetCharts();
                return true;
            }
        }

        /**
         * @desc
         */
        function createFilterOject() {
            vm.filterObject = {};

            if (vm.datePicker.date) {
                vm.filterObject.startDate = vm.datePicker.date.startDate;
                vm.filterObject.endDate = vm.datePicker.date.endDate;
            }
        }

        /**
         * @desc
         * @param {any} defaultHeight 
         * @param {any} totalRecords 
         * @returns 
         */
        function calculateHeightForCampaign(defaultHeight, totalRecords) {
            var _defaultHeight = defaultHeight;
            return ((totalRecords * 16) < _defaultHeight ? _defaultHeight : defaultHeight += (totalRecords * 17)); // made 17 from 22 for CC-157, Nishit
        }

        /**
         * @desc
         * @param {any} defaultWidth 
         * @param {any} totalRecords 
         * @returns 
         */
        function calculateWidthForCampaign(defaultWidth, totalRecords) {
            var _defaultWidth = defaultWidth;
            return ((totalRecords * 31) < _defaultWidth ? _defaultWidth : defaultWidth += (totalRecords * 38)); // Nishit, CCP-291, CC-23
        }

        /**
         * @desc
         * @param {any} totalRecords 
         * @returns 
         */
        function calculateWidthForPlayer(totalRecords) {
            if (totalRecords <= 4) {
                return totalRecords * 150;
            } else if (totalRecords <= 300) {
                return totalRecords * 110;
            } else if (totalRecords <= 500) {
                return totalRecords * 100;
            } else {
                return totalRecords * 50;
            }
        }

        /**
         * @description
         * 
         */
        function showHideFilters() {
            if (vm.showFilter) {
                $('#filtersArea').slideUp();
                vm.showFilter = false;
            } else {
                $('#filtersArea').slideDown("slow");
                vm.showFilter = true;
            }
        }

        function refreshCharts() {
            $('#campaign').width($('#campaign').width() - 1);
            $('#campaign').width($('#campaign').width() + 1);
            $('#campaignAudience').height($('#campaignAudience').height() - 1);
            $('#campaignAudience').height($('#campaignAudience').height() + 1);
            $('#player').width($('#player').width() - 1);
            $('#player').width($('#player').width() + 1);
            $('#day').width($('#day').width() - 1);
            $('#day').width($('#day').width() + 1);
        }

        function isFiltersApplied(filterName) {
            var alreadyHaveFilters = false;
            for (var key in vm.filters) {
                if (vm.filters.hasOwnProperty(key)) {
                    var filter = vm.filters[key];
                    if (!_.isUndefined(filterName)) {
                        if (!_.isUndefined(filter) && filter.length > 0 && key !== filterName) {
                            alreadyHaveFilters = true;
                        }
                    } else {
                        if (!_.isUndefined(filter) && filter.length > 0) {
                            alreadyHaveFilters = true;
                        }
                    }

                }
            }
            return alreadyHaveFilters;
        }

        function applyAllFiltersExcept(filterName) {
            var tempCampaignSummary = _.cloneDeep(vm.cachedCampaignSummary);
            for (var key in vm.filters) {
                if (vm.filters.hasOwnProperty(key)) {
                    var filter = vm.filters[key];

                    var exceptFlag = !_.isUndefined(filterName) ? (key !== filterName) : true;
                    if (!_.isUndefined(filter) && filter.length > 0 && exceptFlag) {
                        switch (key) {
                            case 'campaignRef':
                                var substringArray = _.map(['SM', 'SB', 'BK'], function (substring) {
                                    return filter.toUpperCase().indexOf(substring) > -1;
                                });

                                if (substringArray.indexOf(true) > -1) {
                                    tempCampaignSummary = tempCampaignSummary.filter(function (obj) {
                                        return obj.id.indexOf(filter.toUpperCase()) > -1;
                                    });
                                }

                                break;

                            case 'channels':

                                var selectedChannels = _.cloneDeep(filter);
                                tempCampaignSummary = $linq.Enumerable()
                                    .From(tempCampaignSummary)
                                    .Where(function (obj) {
                                        return _.includes(selectedChannels, obj.businessAreaCode);
                                    }).ToArray();

                                break;
                            case 'marketingNames':

                                var selectedMarketingNames = [];
                                filter.forEach(function (element) {
                                    selectedMarketingNames.push(element.marketingNameId.toString());
                                });
                                tempCampaignSummary = $linq.Enumerable()
                                    .From(tempCampaignSummary)
                                    .Where(function (obj) {
                                        return _.intersection(selectedMarketingNames, obj.marketingNameCode).length > 0;
                                    }).ToArray();

                                vm.frameSummary = $linq.Enumerable()
                                    .From(vm.cachedFrameSummary)
                                    .Where(function (obj) {
                                        return _.intersection(selectedMarketingNames, obj.marketingNameCode).length > 0;
                                    }).ToArray();

                                break;
                            case 'specialists':

                                var selectedSpecialists = [];
                                filter.forEach(function (element) {
                                    selectedSpecialists.push(element.organisationId);
                                });
                                tempCampaignSummary = $linq.Enumerable()
                                    .From(tempCampaignSummary)
                                    .Where(function (obj) {
                                        return _.includes(selectedSpecialists, obj.specialistCode)
                                    }).ToArray();

                                break;

                            default:
                                break;
                        }
                    }

                }
            }
            vm.campaignSummary = _.cloneDeep(tempCampaignSummary);
        }

        function applyFilter(filterName) {

            var tempCampaignSummary = [];

            if (isFiltersApplied(filterName)) {
                tempCampaignSummary = _.cloneDeep(vm.campaignSummary);
            } else {
                tempCampaignSummary = _.cloneDeep(vm.cachedCampaignSummary);
            }

            switch (filterName) {
                case 'campaignRef':
                    if (vm.filters[filterName] && vm.filters[filterName].trim().length >= 1) {
                        var substringArray = _.map(['SM', 'SB', 'BK'], function (substring) {
                            return vm.filters[filterName].toUpperCase().indexOf(substring) > -1;
                        });
                        if (substringArray.indexOf(true) > -1) {
                            if (isFiltersApplied(filterName)) {
                                applyAllFiltersExcept();
                            } else {
                                vm.campaignSummary = vm.cachedCampaignSummary.filter(function (obj) {
                                    return obj.id.indexOf(vm.filters[filterName].toUpperCase()) > -1;
                                });
                            }
                        } else {
                            console.log('Please enter valid campaign Reference');
                        }
                    } else {
                        if (!isFiltersApplied(filterName)) {
                            vm.channelSummaryByCampaign = _.cloneDeep(vm.chachedChannelSummaryByAudience);
                            vm.channelSummaryByAudience = _.cloneDeep(vm.chachedChannelSummaryByImpression);
                            vm.campaignSummary = _.cloneDeep(vm.cachedCampaignSummary);
                        } else {
                            applyAllFiltersExcept(filterName);
                        }
                        filterSummaries(vm.campaignSummary);
                    }
                    break;
                case 'channels':

                    var selectedChannels = _.cloneDeep(vm.filters[filterName]);
                    if (selectedChannels.length === 1) {
                        chachedCampaignSummaryForMultipleChannels = _.cloneDeep(tempCampaignSummary);
                    } else {
                        if (selectedChannels.length !== 0) {
                            tempCampaignSummary = _.cloneDeep(chachedCampaignSummaryForMultipleChannels);
                        }
                    }
                    vm.campaignSummary = $linq.Enumerable()
                        .From(tempCampaignSummary)
                        .Where(function (obj) {
                            return _.includes(selectedChannels, obj.businessAreaCode);
                        }).ToArray();


                    if (selectedChannels.length === 0) {
                        chachedCampaignSummaryForMultipleChannels = [];
                        if (!isFiltersApplied(filterName)) {
                            vm.campaignSummary = _.cloneDeep(vm.cachedCampaignSummary);
                        } else {
                            applyAllFiltersExcept(filterName);
                        }
                        filterSummaries(vm.campaignSummary);
                    }

                    break;
                case 'marketingNames':

                    var selectedMarketingNames = [];
                    vm.filters[filterName].forEach(function (element) {
                        selectedMarketingNames.push(element.marketingNameId.toString());
                    });

                    if (selectedMarketingNames.length === 1) {
                        chachedCampaignSummaryForMultipleMarketingNames = _.cloneDeep(tempCampaignSummary);
                    } else {
                        if (selectedMarketingNames.length !== 0) {
                            tempCampaignSummary = _.cloneDeep(chachedCampaignSummaryForMultipleMarketingNames);
                        }
                    }
                    vm.campaignSummary = $linq.Enumerable()
                        .From(tempCampaignSummary)
                        .Where(function (obj) {
                            return _.intersection(selectedMarketingNames, obj.marketingNameCode).length > 0;
                        }).ToArray();

                    vm.frameSummary = $linq.Enumerable()
                        .From(vm.cachedFrameSummary)
                        .Where(function (obj) {
                            return _.intersection(selectedMarketingNames, obj.marketingNameCode).length > 0;
                        }).ToArray();

                    if (selectedMarketingNames.length == 0) {
                        chachedCampaignSummaryForMultipleMarketingNames = [];
                        vm.frameSummary = _.cloneDeep(vm.cachedFrameSummary);
                        if (!isFiltersApplied(filterName)) {
                            vm.campaignSummary = _.cloneDeep(vm.cachedCampaignSummary);
                        } else {
                            applyAllFiltersExcept(filterName);
                        }
                        filterSummaries(vm.campaignSummary);
                    }
                    vm.compliantcheck(vm.campaign.compaliant, vm.campaign.noncompaliant, 'player', true);

                    break;
                case 'specialists':

                    var selectedSpecialists = [];
                    vm.filters[filterName].forEach(function (element) {
                        selectedSpecialists.push(element.organisationId);
                    });
                    if (selectedSpecialists.length === 1) {
                        chachedCampaignSummaryForMultipleSpecialists = _.cloneDeep(tempCampaignSummary);
                    } else {
                        if (selectedSpecialists.length !== 0) {
                            tempCampaignSummary = _.cloneDeep(chachedCampaignSummaryForMultipleSpecialists);
                        }
                    }
                    vm.campaignSummary = $linq.Enumerable()
                        .From(tempCampaignSummary)
                        .Where(function (obj) {
                            return _.includes(selectedSpecialists, obj.specialistCode)
                        }).ToArray();

                    if (selectedSpecialists.length == 0) {
                        chachedCampaignSummaryForMultipleSpecialists = [];
                        if (!isFiltersApplied(filterName)) {
                            vm.campaignSummary = _.cloneDeep(vm.cachedCampaignSummary);
                        } else {
                            applyAllFiltersExcept(filterName);
                        }
                        filterSummaries(vm.campaignSummary);
                    }

                    break;

                default:
                    break;
            }

            if (filterName !== 'channels') {
                if (!isFiltersApplied('channels')) {
                    filterSummaries(vm.cachedCampaignSummary);
                } else {
                    filterSummaries(vm.campaignSummary);
                }

            }
            vm.compliantcheck(vm.campaign.compaliant, vm.campaign.noncompaliant, 'campaign', true);
            refreshCharts();
        }

        // two way binded functions
        vm.showHideFilters = showHideFilters;
        vm.onChannelClick = onChannelClick;
        vm.compliantcheck = compliantcheck;
        vm.onCampaignClick = onCampaignClick;
        vm.onImpressionClick = onImpressionClick;
        vm.onPlayerClick = onPlayerClick;
        vm.onDayClick = onDayClick;
        vm.loadmarketingNames = loadmarketingNames;
        vm.loadSpecialist = loadSpecialist;
        vm.removeTags = removeTags;
        vm.closeTooltip = closeTooltip;
        vm.applyFilter = applyFilter;
        vm.refreshCharts = refreshCharts;
        getInitialConfig();
    }
})();