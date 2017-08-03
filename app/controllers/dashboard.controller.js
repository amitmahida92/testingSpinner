(function () {
    'use strict';

    angular.module('reportingDashboard').controller('DashboardCtrl', DashboardCtrl);

    DashboardCtrl.$inject = ['filterService', 'configureOptions', 'Webworker'];

    function DashboardCtrl(filterService, configureOptions, Webworker) {
        var vm = this;
        var requireWorker;

        vm.frontEndVersion = frontEndVersion;
        vm.DASHBOARD_TYPES = [
            {
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

        vm.graphOptions = [
            {
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
        vm.selectedMarketingNames = [];
        vm.selectedSpecialists = [];
        vm.selectedChannel = [];
        vm.isFrameDashbaord = 3; // default selection for graph

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
        //                                              Chart Click Events
        //------------------------------------------------------------------------------------------------------------------

        // Doughnut Chart Click

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
            checkAllcheckBoxes(); //CCP-308, Nishit
        }

        vm.compaliantcheck = function (compaliant, noncompaliant, chart) {

            if (chart === 'campaign') {

                var data = _.cloneDeep(vm.campaignSummary);

                if (vm.isFrameDashbaord != 3) {
                    if (!compaliant) {
                        var data = vm.campaignSummary.filter(function (obj) {
                            return obj.failed == true;
                        });
                    }

                    if (!noncompaliant) {
                        var data = vm.campaignSummary.filter(function (obj) {
                            return obj.failed == false;
                        });
                    }
                } else {
                    if (!compaliant) {
                        var data = vm.campaignSummary.filter(function (obj) {
                            return obj.failedAudience == true;
                        });
                    }

                    if (!noncompaliant) {
                        var data = vm.campaignSummary.filter(function (obj) {
                            return obj.failedAudience == false;
                        });
                    }
                }

                if (!compaliant && !noncompaliant) {
                    var data = [];
                }

                generateChart('campaign', data, false);

            }


            if (chart == "player") {

                var data = _.cloneDeep(vm.frameSummary);

                if (vm.isFrameDashbaord != 3) {
                    if (!compaliant) {
                        var data = vm.frameSummary.filter(function (obj) {
                            return obj.failed == true;
                        });
                    }

                    if (!noncompaliant) {
                        var data = vm.frameSummary.filter(function (obj) {
                            return obj.failed == false;
                        });
                    }
                } else {
                    if (!compaliant) {
                        var data = vm.frameSummary.filter(function (obj) {
                            return obj.failedAudience == true;
                        });
                    }

                    if (!noncompaliant) {
                        var data = vm.frameSummary.filter(function (obj) {
                            return obj.failedAudience == false;
                        });
                    }

                }



                if (!compaliant && !noncompaliant) {
                    var data = [];
                }

                generateChart('player', data, false);

            }

            if (chart == "day") {

                var data = _.cloneDeep(vm.daySummary);

                if (vm.isFrameDashbaord != 3) {
                    if (!compaliant) {
                        var data = vm.daySummary.filter(function (obj) {
                            return obj.failed == true;
                        });
                    }

                    if (!noncompaliant) {
                        var data = vm.daySummary.filter(function (obj) {
                            return obj.failed == false;
                        });
                    }

                } else {

                    if (!compaliant) {
                        var data = vm.daySummary.filter(function (obj) {
                            return obj.failedAudience == true;
                        });
                    }

                    if (!noncompaliant) {
                        var data = vm.daySummary.filter(function (obj) {
                            return obj.failedAudience == false;
                        });
                    }
                }

                if (!compaliant && !noncompaliant) {
                    var data = [];
                }

                generateChart('day', data, false);

            }

            if (chart == "hour") {

                var data = _.cloneDeep(vm.spanSummary);

                if (vm.isFrameDashbaord != 3) {
                    if (!compaliant) {
                        var data = vm.spanSummary.filter(function (obj) {
                            return obj.failed == true;
                        });
                    }

                    if (!noncompaliant) {
                        var data = vm.spanSummary.filter(function (obj) {
                            return obj.failed == false;
                        });
                    }
                } else {
                    if (!compaliant) {
                        var data = vm.spanSummary.filter(function (obj) {
                            return obj.failedAudience == true;
                        });
                    }

                    if (!noncompaliant) {
                        var data = vm.spanSummary.filter(function (obj) {
                            return obj.failedAudience == false;
                        });
                    }
                }

                if (!compaliant && !noncompaliant) {
                    var data = [];
                }

                generateChart('hour', data, false);

            }

            highlightSelectedBar();
            setToolTips();
        }


        // First Chart
        vm.onCampaignClick = function (points, evt) {
            if (points.length > 0) {

                $('#compliance-tooltip').hide();

                //CCP-295, Nishit
                if (vm.isFrameDashbaord == 1 && points[0]['_chart'].config.data.datasets[points[0]['_datasetIndex']].campaignDetails[points[0]['_index']].value == 0) {
                    return false;
                }

                if (vm.isFrameDashbaord == 2 && points[0]['_chart'].config.data.datasets[points[0]['_datasetIndex']].campaignDetails[points[0]['_index']].avgValue == 0) {
                    return false;
                }

                if (vm.isFrameDashbaord == 3 && points[0]['_chart'].config.data.datasets[points[0]['_datasetIndex']].campaignDetails[points[0]['_index']].audienceValue == 0) {
                    return false;
                }

                vm.selectedCampaign = points[0]['_chart'].config.data.datasets[points[0]['_datasetIndex']].campaignDetails[points[0]['_index']].id;
                vm.campaignBar.selectedCampaign = _.cloneDeep(vm.selectedCampaign);
                vm.campaignBar.brandName = points[0]['_chart'].config.data.datasets[points[0]['_datasetIndex']].campaignDetails[points[0]['_index']].brandName;
                vm.campaignBar.advertiserName = points[0]['_chart'].config.data.datasets[points[0]['_datasetIndex']].campaignDetails[points[0]['_index']].advertiserName;
                //-- Clear the Children Graph and Children Request Parameters//
                vm.selectedFrame = null
                vm.selectedDay = null
                //-----------------------------------------------------------//

                vm.playerData = {};
                vm.player.compaliant = true;
                vm.player.noncompaliant = true;
                getSummaries();
            } else {
                return false;
            }
        }

        // Second Chart
        vm.onPlayerClick = function (points, evt) {
            if (points.length > 0) {
                $('#player-tooltip').hide();

                //CCP-295, Nishit

                if (vm.isFrameDashbaord == 1 && points[0]['_chart'].config.data.datasets[points[0]['_datasetIndex']].playerDetails[points[0]['_index']].value == 0) {
                    return false;
                }

                if (vm.isFrameDashbaord == 2 && points[0]['_chart'].config.data.datasets[points[0]['_datasetIndex']].playerDetails[points[0]['_index']].avgValue == 0) {
                    return false;
                }

                if (vm.isFrameDashbaord == 3 && points[0]['_chart'].config.data.datasets[points[0]['_datasetIndex']].playerDetails[points[0]['_index']].audienceValue == 0) {
                    return false;
                }

                vm.selectedFrame = points[0]['_chart'].config.data.datasets[points[0]['_datasetIndex']].playerDetails[points[0]['_index']].id; // Value of particluar bar
                vm.campaignBar.vm.selectedFrame = _.cloneDeep(vm.selectedFrame);
                //-- Clear the Children Graph and Children Request Parameters
                vm.selectedDay = null
                //-----------------------------------------------------------//
                vm.dayData = [];
                vm.day.compaliant = true;
                vm.day.noncompaliant = true;
                getSummaries();
            } else {
                return false;
            }
        }

        // Third Chart
        vm.onDayClick = function (points, evt) {
            if (points.length > 0) {

                //CCP-295, Nishit

                if (vm.isFrameDashbaord == 1 && points[0]['_chart'].config.data.datasets[points[0]['_datasetIndex']].dayDetails[points[0]['_index']].value == 0) {
                    return false;
                }

                if (vm.isFrameDashbaord == 2 && points[0]['_chart'].config.data.datasets[points[0]['_datasetIndex']].dayDetails[points[0]['_index']].avgValue == 0) {
                    return false;
                }

                if (vm.isFrameDashbaord == 3 && points[0]['_chart'].config.data.datasets[points[0]['_datasetIndex']].dayDetails[points[0]['_index']].audienceValue == 0) {
                    return false;
                }


                var dayId = points[0]['_chart'].config.data.datasets[points[0]['_datasetIndex']].dayDetails[points[0]['_index']].id; // Value of particluar bar
                vm.selectedDay = dayId
                vm.hourData = [];
                vm.hour.compaliant = true;
                vm.hour.noncompaliant = true;
                getSummaries();
            } else {
                return false;
            }
        }

        //Select Dashboard Type//

        vm.selectDashBoardType = function () {


            if (vm.isFrameDashbaord != 3) {

                // vm.selectedChannel = []; commented for issue 6 by Rushita
                // vm.channelSummary = _.map(vm.channelSummary, function (obj) {
                //     return ((vm.selectedChannel.indexOf(obj.id) === -1) ? angular.extend(obj, { guageColors: vm.defaultGuageColors }) : angular.extend(obj, { guageColors: vm.selectedGuageColors }));
                // });
                vm.summary = vm.channelSummary;
            } else {

                // vm.selectedChannel = []; commented for issue 6 by Rushita
                // vm.channelSummaryByAudience = _.map(vm.channelSummaryByAudience, function (obj) {
                //     return ((vm.selectedChannel.indexOf(obj.id) === -1) ? angular.extend(obj, { guageColors: vm.defaultGuageColors }) : angular.extend(obj, { guageColors: vm.selectedGuageColors }));
                // });
                vm.summary = vm.channelSummaryByAudience;
            }

            vm.channelSummaryByImpression = vm.channelSummaryByImpression

            if (vm.campaignSummary)
                vm.compaliantcheck(vm.campaign.compaliant, vm.campaign.noncompaliant, 'campaign');
            if (vm.frameSummary)
                vm.compaliantcheck(vm.player.compaliant, vm.player.noncompaliant, 'player');
            if (vm.daySummary)
                vm.compaliantcheck(vm.day.compaliant, vm.day.noncompaliant, 'day');
            if (vm.spanSummary)
                vm.compaliantcheck(vm.hour.compaliant, vm.hour.noncompaliant, 'hour');

            highlightSelectedBar();
            setToolTips();
        }


        //-----------------------------------------------------------------------------------------------------------------------//


        //------------------------------------------------------------------------------------------------------------------
        //                                              Code to fill the drop downs
        //------------------------------------------------------------------------------------------------------------------
        vm.loadmarketingNames = function ($query) {
            if ($query == '')
                return vm.marketingNames;
            else {
                return vm.marketingNames.filter(function (marketingName) {
                    return marketingName.marketingName.toLowerCase().indexOf($query.toLowerCase()) != -1;
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
            checkAllcheckBoxes();
            getSummaries();
        }
        vm.onAddTags = function (data) {
            checkAllcheckBoxes();
            getSummaries();
        }
        //------------------------------------------------------------------------------------------------------------------

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

        function setToolTips() {

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


        function getInitialConfig() {
            var initalConfigData = filterService.getInitialConfig().then(function (data) {

                vm.configData = data.data;
                vm.userBundle = data.data.userBundle;
                //data-tooltip="{{vm.userBundle['common.dashboard.tooltip']}}"


                setToolTips();
                configureOptions.HOUR_BAR.scales.xAxes[0].scaleLabel.labelString = vm.userBundle["popboard.time.xAxis.label"];
                configureOptions.HOUR_BAR.scales.yAxes[0].scaleLabel.labelString = vm.userBundle["popboard.time.yAxis.label"];

                configureOptions.HORIZONTAL_BAR.scales.xAxes[0].scaleLabel.labelString = vm.userBundle["popboard.campaign.xAxis.label"];
                configureOptions.HORIZONTAL_BAR.scales.yAxes[0].scaleLabel.labelString = vm.userBundle["popboard.campaign.yAxis.label"];

                configureOptions.BAR_PLAYER.scales.xAxes[0].scaleLabel.labelString = vm.userBundle["popboard.player.xAxis.label"];
                configureOptions.BAR_PLAYER.scales.yAxes[0].scaleLabel.labelString = vm.userBundle["popboard.player.yAxis.label"];

                configureOptions.BAR_DAY.scales.xAxes[0].scaleLabel.labelString = vm.userBundle["popboard.date.xAxis.label"];
                configureOptions.BAR_DAY.scales.yAxes[0].scaleLabel.labelString = vm.userBundle["popboard.date.yAxis.label"];




                if (vm.configData.complainceLevel)
                    COMPLAINCE_PERCENTAGE = vm.configData.complainceLevel;

                vm.datePicker = {
                    date: {
                        startDate: vm.configData.defaultStartDate,
                        endDate: vm.configData.defaultEndDate
                    }
                };

                if (vm.configData.serviceCalls)
                    loadServiceCallKeys(vm.configData.serviceCalls)
                if (vm.configData.specialists)
                    vm.specialists = vm.configData.specialists;
                if (vm.configData.marketingNames)
                    vm.marketingNames = vm.configData.marketingNames;

                MAX_INACTIVE_INTERVAL = vm.configData.systemData.maxInactiveInterval || MAX_INACTIVE_INTERVAL;
                startKeepAliveService();
                getSummaries();
            });
            setTimeout(function () {
                $('#my-drop-btn').dropdown({
                    belowOrigin: true // Displays dropdown below the button
                });
                $('select').material_select();

            });

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

        function generateChart(type, chartData, toggleOtherCharts) {
            switch (type) {
                case 'campaign':
                    vm.campaignData = {
                        labels: [],
                        datasets: [{
                            backgroundColor: [],
                            data: [],
                            compaliantcheck: []
                        }]
                    };
                    vm.campaign.compliantCount = 0;
                    vm.campaign.noncompliantCount = 0;

                    vm.campaignDetails = {
                        campaignDetails: []
                    };

                    vm.campaignOptions.size.height = calculateHeightForCampaign(_.clone(configureOptions.HORIZONTAL_BAR.size.height), chartData.length);

                    if (vm.isFrameDashbaord == 1)
                        chartData = _.sortBy(chartData, 'value').reverse();
                    else if (vm.isFrameDashbaord == 2)
                        chartData = _.sortBy(chartData, 'avgValue').reverse();
                    else
                        chartData = _.sortBy(chartData, 'audienceValue').reverse();

                    _.forEach(chartData, function (obj) {
                        vm.campaignData.labels.push(obj.label);

                        if (vm.isFrameDashbaord == 1)
                            vm.campaignData.datasets[0].data.push(obj.value);
                        else if (vm.isFrameDashbaord == 2)
                            vm.campaignData.datasets[0].data.push(obj.avgValue);
                        else
                            vm.campaignData.datasets[0].data.push(obj.audienceValue);

                        if (vm.isFrameDashbaord != 3) {
                            if (obj.failed) {
                                ++vm.campaign.noncompliantCount;
                                vm.campaignData.datasets[0].backgroundColor.push(RED_COLOR);
                                vm.campaignData.datasets[0].compaliantcheck.push(false);
                            }
                            else {
                                vm.campaignData.datasets[0].backgroundColor.push(BLUE_COLOR);
                                vm.campaignData.datasets[0].compaliantcheck.push(true);
                                ++vm.campaign.compliantCount;
                            }
                        } else {
                            if (obj.failedAudience) {
                                ++vm.campaign.noncompliantCount;
                                vm.campaignData.datasets[0].backgroundColor.push(RED_COLOR);
                                vm.campaignData.datasets[0].compaliantcheck.push(false);
                            }
                            else {
                                vm.campaignData.datasets[0].backgroundColor.push(BLUE_COLOR);
                                vm.campaignData.datasets[0].compaliantcheck.push(true);
                                ++vm.campaign.compliantCount;
                            }
                        }
                        vm.campaignDetails.campaignDetails.push(obj);

                    });

                    if (toggleOtherCharts) {
                        vm.hideWatermark = true;
                        vm.showCampaign = true;
                    }


                    function getCampaignId(title) {
                        var n = title.split(" ");
                        var temp = n[n.length - 1].trim().split(':');
                        return temp[temp.length - 1];
                    }

                    var campaignId = '', campaignData = '';
                    vm.campaignOptions.tooltips = {
                        enabled: true,
                        mode: 'index',
                        position: 'nearest',
                        custom: function (tooltipModel) {

                            if (tooltipModel.title && tooltipModel.dataPoints.length > 0
                                && vm.campaignData.datasets[0].compaliantcheck[tooltipModel.dataPoints[0].index] === false) {
                                var chart = this._chart;
                                if (getCampaignId(tooltipModel.title[0]) != campaignId) {
                                    var params = {
                                        "id": getCampaignId(tooltipModel.title[0]),
                                        "startDate": vm.datePicker.date.startDate
                                    };
                                    campaignId = params.id;
                                    filterService.getTooltipData(params).then(function (response) {

                                        if (response) {
                                            campaignData = response.data[campaignId];
                                            if (campaignData && campaignData.length > 0) {
                                                // Tooltip Element
                                                var tooltipEl = document.getElementById('compliance-tooltip');

                                                function getBody(bodyItem) {
                                                    return bodyItem.lines;
                                                }

                                                // Set Text
                                                if (tooltipModel.body) {
                                                    var titleLines = "Campaign" + campaignId; //tooltipModel.title || [];
                                                    var bodyLines = tooltipModel.body.map(getBody);

                                                    var innerHtml = '<thead>';
                                                    innerHtml += '<tr><th>Campaign</th><th>' + campaignId + '</th></tr>';
                                                    innerHtml += '</thead><tbody>';

                                                    campaignData.forEach(function (body, i) {
                                                        var colors = tooltipModel.labelColors[0];
                                                        var style = 'background:' + colors.backgroundColor;
                                                        style += '; border-color:' + colors.borderColor;
                                                        style += '; border-width: 2px';
                                                        var span = '<span class="chartjs-tooltip-key" style="' + style + '"></span>';
                                                        var buildBody = Object.keys(body);
                                                        buildBody.forEach(function (inBody, inIndex) {
                                                            if (inBody != 'url') {
                                                                innerHtml += '<tr><td style="color: rgba(255, 0, 0, 1);font-weight:600;">' + inBody + ' </td><td> ' + body[inBody] + '</td></tr>';
                                                            } else {
                                                                innerHtml += '<tr><td style="color: rgba(255, 0, 0, 1);font-weight:600;">' + inBody + ' </td><td><a target="_blank" href="' + body[inBody] + '"> ' + body[inBody] + '</a></td></tr>';
                                                            }

                                                        });
                                                    });
                                                    innerHtml += '</tbody>';

                                                    var tableRoot = tooltipEl.querySelector('table');
                                                    tableRoot.innerHTML = innerHtml;
                                                }

                                                // Display, position, and set styles for font
                                                tooltipEl.style.opacity = 1;
                                                tooltipEl.style.display = 'block';
                                                tooltipEl.style.fontFamily = tooltipModel._fontFamily;
                                                tooltipEl.style.fontSize = tooltipModel.fontSize;
                                                tooltipEl.style.fontStyle = tooltipModel._fontStyle;
                                                tooltipEl.style.padding = tooltipModel.yPadding + 'px ' + tooltipModel.xPadding + 'px';

                                            } else {
                                                $('#compliance-tooltip').hide();
                                                Materialize.toast(response.message, TOASTER_TIME_INTERVAL, 'rounded');
                                            }
                                        } else {
                                            $('#compliance-tooltip').hide();
                                            Materialize.toast(response.message, TOASTER_TIME_INTERVAL, 'rounded');
                                        }
                                    });

                                }
                            }
                        },
                        // callbacks: {
                        //     title: function (tooltipItem) {
                        //         return 'Nishit'
                        //     },
                        //     label: function (tooltipItem, data) {
                        //         return "Nishit Test"
                        //     }
                        // }
                    };

                    break;
                case 'player':
                    vm.playerData = {
                        labels: [],
                        datasets: [{
                            backgroundColor: [],
                            borderWidth: 1,
                            data: [],
                            compaliantcheck: []
                        }]
                    };

                    vm.player.compliantCount = 0;
                    vm.player.noncompliantCount = 0;

                    vm.playerDetails = {
                        playerDetails: []
                    };
                    // vm.barOptions.size.width = (document.getElementById("campaign").style.width != "" ? document.getElementById("campaign").style.width : vm.barOptions.size.width);
                    vm.barOptions.size.width = calculateWidthForCampaign(vm.barOptions.size.width, chartData.length);

                    if (vm.isFrameDashbaord == 1)
                        chartData = _.sortBy(chartData, 'value').reverse();
                    else if (vm.isFrameDashbaord == 2)
                        chartData = _.sortBy(chartData, 'avgValue').reverse();
                    else
                        chartData = _.sortBy(chartData, 'audienceValue').reverse();

                    _.forEach(chartData, function (obj) {

                        vm.playerData.labels.push(obj.label);

                        if (vm.isFrameDashbaord == 1)
                            vm.playerData.datasets[0].data.push(obj.value);
                        else if (vm.isFrameDashbaord == 2)
                            vm.playerData.datasets[0].data.push(obj.avgValue);
                        else
                            vm.playerData.datasets[0].data.push(obj.audienceValue);

                        if (vm.isFrameDashbaord != 3) {
                            if (obj.failed) {
                                vm.playerData.datasets[0].backgroundColor.push(RED_COLOR);
                                vm.playerData.datasets[0].compaliantcheck.push(false);
                                ++vm.player.noncompliantCount; //CCP-307 Nishit
                            } else {
                                vm.playerData.datasets[0].backgroundColor.push(BLUE_COLOR);
                                vm.playerData.datasets[0].compaliantcheck.push(true);
                                ++vm.player.compliantCount;
                            }
                        } else {
                            if (obj.failedAudience) {
                                vm.playerData.datasets[0].backgroundColor.push(RED_COLOR);
                                vm.playerData.datasets[0].compaliantcheck.push(false);
                                ++vm.player.noncompliantCount;
                            } else {
                                vm.playerData.datasets[0].backgroundColor.push(BLUE_COLOR);
                                vm.playerData.datasets[0].compaliantcheck.push(true);
                                ++vm.player.compliantCount;
                            }
                        }

                        vm.playerDetails.playerDetails.push(obj)
                    });

                    if (toggleOtherCharts) {
                        vm.showPlayer = true;
                        vm.showDay = false;
                        vm.showHour = false;
                    }


                    var campaignId = '', campaignData = '';
                    vm.barOptions.tooltips = {
                        enabled: true,
                        mode: 'index',
                        position: 'nearest',
                        custom: function (tooltipModel, data) {

                            if (tooltipModel.title && tooltipModel.dataPoints.length > 0
                                && vm.playerData.datasets[0].compaliantcheck[tooltipModel.dataPoints[0].index] === false) {
                                var chart = this._chart;
                                if (getCampaignId(tooltipModel.title[0]) != campaignId) {
                                    var params = {
                                        "id": tooltipModel.title[0],
                                        "startDate": vm.datePicker.date.startDate
                                    };
                                    campaignId = params.id;
                                    filterService.getTooltipData(params).then(function (response) {

                                        campaignData = response.data[campaignId];
                                        if (campaignData && campaignData.length > 0) {
                                            // Tooltip Element
                                            var tooltipEl = document.getElementById('player-tooltip');

                                            function getBody(bodyItem) {
                                                return bodyItem.lines;
                                            }

                                            // Set Text
                                            if (tooltipModel.body) {
                                                var titleLines = "Campaign" + campaignId; //tooltipModel.title || [];
                                                var bodyLines = tooltipModel.body.map(getBody);

                                                var innerHtml = '<thead>';
                                                innerHtml += '<tr><th>Player</th><th>' + campaignId + '</th></tr>';
                                                innerHtml += '</thead><tbody>';

                                                campaignData.forEach(function (body, i) {
                                                    var colors = tooltipModel.labelColors[0];
                                                    var style = 'background:' + colors.backgroundColor;
                                                    style += '; border-color:' + colors.borderColor;
                                                    style += '; border-width: 2px';
                                                    var span = '<span class="chartjs-tooltip-key" style="' + style + '"></span>';
                                                    var buildBody = Object.keys(body);
                                                    buildBody.forEach(function (inBody, inIndex) {
                                                        if (inBody != 'url') {
                                                            innerHtml += '<tr><td style="color: rgba(255, 0, 0, 1);font-weight:600;">' + inBody + ' </td><td> ' + body[inBody] + '</td></tr>';
                                                        } else {
                                                            innerHtml += '<tr><td style="color: rgba(255, 0, 0, 1);font-weight:600;">' + inBody + ' </td><td><a target="_blank" href="' + body[inBody] + '"> ' + body[inBody] + '</a></td></tr>';
                                                        }

                                                    });
                                                });
                                                innerHtml += '</tbody>';

                                                var tableRoot = tooltipEl.querySelector('table');
                                                tableRoot.innerHTML = innerHtml;
                                            }

                                            // Display, position, and set styles for font
                                            tooltipEl.style.opacity = 1;
                                            tooltipEl.style.display = 'block';
                                            tooltipEl.style.fontFamily = tooltipModel._fontFamily;
                                            tooltipEl.style.fontSize = tooltipModel.fontSize;
                                            tooltipEl.style.fontStyle = tooltipModel._fontStyle;
                                            tooltipEl.style.padding = tooltipModel.yPadding + 'px ' + tooltipModel.xPadding + 'px';

                                        } else {
                                            $('#player-tooltip').hide();
                                            Materialize.toast(response.message, TOASTER_TIME_INTERVAL, 'rounded');
                                        }

                                    });

                                }
                            }
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
                    }

                    vm.dayOptions.size.width = calculateWidthForCampaign(vm.dayOptions.size.width, chartData.length);
                    _.forEach(chartData, function (obj) {
                        vm.dayData.labels.push(obj.label);


                        if (vm.isFrameDashbaord == 1)
                            vm.dayData.datasets[0].data.push(obj.value);
                        else if (vm.isFrameDashbaord == 2)
                            vm.dayData.datasets[0].data.push(obj.avgValue);
                        else
                            vm.dayData.datasets[0].data.push(obj.audienceValue);

                        if (vm.isFrameDashbaord != 3) {

                            if (obj.failed) {
                                vm.dayData.datasets[0].backgroundColor.push(RED_COLOR);
                                vm.day.noncompliantCount++;
                            } else {
                                vm.dayData.datasets[0].backgroundColor.push(BLUE_COLOR);
                                vm.day.compliantCount++;
                            }
                        } else {

                            if (obj.failedAudience) {
                                vm.dayData.datasets[0].backgroundColor.push(RED_COLOR);
                                vm.day.noncompliantCount++;
                            } else {
                                vm.dayData.datasets[0].backgroundColor.push(BLUE_COLOR);
                                vm.day.compliantCount++;
                            }
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
                    }

                    // Commented the below code based on Ravi R confirmation as he wanted sorting by Hour
                    // chartData = _.sortBy(chartData, 'value').reverse(); // for hour data we will not get avgValue, Nishit, CCP-290

                    _.forEach(chartData, function (obj) {
                        vm.hourData.labels.push(obj.label);

                        if (vm.isFrameDashbaord != 3)
                            vm.hourData.datasets[0].data.push(obj.value);
                        else
                            vm.hourData.datasets[0].data.push(obj.audienceValue);

                        if (vm.isFrameDashbaord != 3) {
                            if (obj.failed) {
                                vm.hourData.datasets[0].backgroundColor.push(RED_COLOR);
                                ++vm.hour.compliantCount;
                            }
                            else {
                                vm.hourData.datasets[0].backgroundColor.push(BLUE_COLOR);
                                if (!angular.isUndefined(obj.failed))
                                    ++vm.hour.noncompliantCount;
                            }
                        } else {

                            if (obj.failedAudience) {
                                vm.hourData.datasets[0].backgroundColor.push(RED_COLOR);
                                ++vm.hour.compliantCount;
                            }
                            else {
                                vm.hourData.datasets[0].backgroundColor.push(BLUE_COLOR);
                                if (!angular.isUndefined(obj.failedAudience))
                                    ++vm.hour.noncompliantCount;
                            }
                        }
                        vm.hourDetails.hourDetails.push(obj)
                    });

                    if (toggleOtherCharts)
                        vm.showHour = true;

                    break;
            }
        }

        vm.closeTooltip = function (id) {
            $('#' + id).hide();
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
            if (vm.filterObject.marketingNames)
                requestParameter["marketingNames"] = JSON.stringify(vm.filterObject.marketingNames);
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

                    vm.channelSummary = data.channelSummary;
                    vm.channelSummaryByAudience = data.channelSummaryByAudience;
                    vm.channelSummaryByImpression = data.channelSummaryByImpression;

                    vm.channelSummary = _.map(vm.channelSummary, function (obj) {
                        return ((vm.selectedChannel.indexOf(obj.id) === -1) ? angular.extend(obj, { guageColors: vm.defaultGuageColors }) : angular.extend(obj, { guageColors: vm.selectedGuageColors }));
                    });

                    vm.channelSummaryByAudience = _.map(vm.channelSummaryByAudience, function (obj) {
                        return ((vm.selectedChannel.indexOf(obj.id) === -1) ? angular.extend(obj, { guageColors: vm.defaultGuageColors }) : angular.extend(obj, { guageColors: vm.selectedGuageColors }));
                    });

                    vm.channelSummaryByImpression = _.map(vm.channelSummaryByImpression, function (obj) {
                        var percentage;

                        if (parseFloat(obj.value)) {
                            percentage = parseFloat(((obj.audienceValue * 100) / obj.value).toFixed(2));
                            percentage = (isNaN(percentage) ? "0.00" : percentage);
                        } else {
                            percentage = "0.00";
                        }

                        var moreData = {
                            percentageDisplay: _.cloneDeep(percentage),
                            percentage: (percentage > 100 ? 100 : percentage),
                        }
                        return (angular.extend(obj, { guageColors: vm.impressionGaugeColors }, moreData));
                    });

                    if (vm.isFrameDashbaord != 3)
                        vm.summary = vm.channelSummary;
                    else
                        vm.summary = vm.channelSummaryByAudience;

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

                        generateChart('campaign', vm.campaignSummary, true);
                    }
                    else {
                        vm.campaignData = {};
                        vm.showCampaign = false;
                    }
                }
                if (data.frameSummary) {
                    if (data.frameSummary.length > 0) {
                        vm.barOptions.size = _.clone(configureOptions.BAR_PLAYER.size); // after change in filter need to reset size
                        vm.frameSummary = _.map(data.frameSummary, function (obj) {
                            obj.value = parseFloat(obj.value);
                            obj.avgValue = parseFloat(obj.avgValue);
                            obj.audienceValue = parseFloat(obj.audienceValue);
                            return obj;
                        });

                        generateChart('player', vm.frameSummary, true);
                    }
                    else {
                        vm.playerData = {};
                        vm.showPlayer = false
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
                    }
                    else {
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

                        if (vm.isFrameDashbaord != 3) {
                            if (obj.failed) {
                                vm.campaignData.datasets[0].backgroundColor.push(RED_COLOR);
                                vm.campaignData.datasets[0].compaliantcheck.push(false);
                            }
                            else {
                                vm.campaignData.datasets[0].backgroundColor.push(BLUE_COLOR);
                                vm.campaignData.datasets[0].compaliantcheck.push(true);
                            }
                        } else {
                            if (obj.failedAudience) {
                                vm.campaignData.datasets[0].compaliantcheck.push(false);
                                vm.campaignData.datasets[0].backgroundColor.push(RED_COLOR);
                            }
                            else {
                                vm.campaignData.datasets[0].backgroundColor.push(BLUE_COLOR);
                                vm.campaignData.datasets[0].compaliantcheck.push(true);
                            }
                        }
                    });

                    var index = _.findIndex(vm.campaignDetails.campaignDetails, function (o) { return o.id == vm.selectedCampaign; });
                    if (index > -1){
                        vm.campaignData.datasets[0].backgroundColor[index] = GREEN_COLOR;
                    } else {
                        vm.campaignBar.selectedCampaign = null;
                        vm.campaignBar.brandName = null;
                        vm.campaignBar.advertiserName = null;
                    }

                }
            }
            if (!_.isUndefined(vm.selectedFrame) && !_.isNull(vm.selectedFrame)) {
                if (!_.isEmpty(vm.playerData)) {
                    vm.playerData.datasets[0].backgroundColor = [];
                    _.forEach(vm.playerDetails.playerDetails, function (obj, key) {

                        if (vm.isFrameDashbaord != 3) {
                            if (obj.failed) {
                                vm.playerData.datasets[0].backgroundColor.push(RED_COLOR);
                                vm.playerData.datasets[0].compaliantcheck.push(false);
                            } else {
                                vm.playerData.datasets[0].backgroundColor.push(BLUE_COLOR);
                                vm.playerData.datasets[0].compaliantcheck.push(true);
                            }
                        } else {
                            if (obj.failedAudience) {
                                vm.playerData.datasets[0].backgroundColor.push(RED_COLOR);
                                vm.playerData.datasets[0].compaliantcheck.push(false);
                            } else {
                                vm.playerData.datasets[0].backgroundColor.push(BLUE_COLOR);
                                vm.playerData.datasets[0].compaliantcheck.push(true);
                            }
                        }

                    });
                    var index = _.findIndex(vm.playerDetails.playerDetails, function (o) { return o.id == vm.selectedFrame; });
                    if (index > -1)
                        vm.playerData.datasets[0].backgroundColor[index] = GREEN_COLOR;
                    else
                        vm.campaignBar.selectedFrame = null;
                }

            }
            if (!_.isUndefined(vm.selectedDay) && !_.isNull(vm.selectedDay)) {
                if (!_.isEmpty(vm.dayData)) {
                    vm.dayData.datasets[0].backgroundColor = [];
                    _.forEach(vm.dayDetails.dayDetails, function (obj, key) {

                        if (vm.isFrameDashbaord != 3) {

                            if (obj.failed) {
                                vm.dayData.datasets[0].backgroundColor.push(RED_COLOR);

                            } else {
                                vm.dayData.datasets[0].backgroundColor.push(BLUE_COLOR);

                            }
                        } else {

                            if (obj.failedAudience) {
                                vm.dayData.datasets[0].backgroundColor.push(RED_COLOR);

                            } else {
                                vm.dayData.datasets[0].backgroundColor.push(BLUE_COLOR);

                            }
                        }


                    });
                    var index = _.findIndex(vm.dayDetails.dayDetails, function (o) { return o.id == vm.selectedDay; });
                    if (index > -1)
                        vm.dayData.datasets[0].backgroundColor[index] = GREEN_COLOR;
                }
            }

            if (!_.isUndefined(vm.selectedDay) && !_.isNull(vm.selectedDay)) {
                if (!_.isEmpty(vm.dayData)) {
                    vm.dayData.datasets[0].backgroundColor = [];
                    _.forEach(vm.dayDetails.dayDetails, function (obj, key) {

                        if (vm.isFrameDashbaord != 3) {

                            if (obj.failed) {
                                vm.dayData.datasets[0].backgroundColor.push(RED_COLOR);

                            } else {
                                vm.dayData.datasets[0].backgroundColor.push(BLUE_COLOR);

                            }
                        } else {

                            if (obj.failedAudience) {
                                vm.dayData.datasets[0].backgroundColor.push(RED_COLOR);

                            } else {
                                vm.dayData.datasets[0].backgroundColor.push(BLUE_COLOR);

                            }
                        }


                    });
                    var index = _.findIndex(vm.dayDetails.dayDetails, function (o) { return o.id == vm.selectedDay; });
                    if (index > -1)
                        vm.dayData.datasets[0].backgroundColor[index] = GREEN_COLOR;
                }
            }
        }


        function clearChartData() {
            vm.campaignData = {};
            vm.playerData = {};
            vm.dayData = {};
            vm.hourData = {};
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
            // Webworker.create(keepAlive, { async: true })
            //     .run(MAX_INACTIVE_INTERVAL, BOS_SESSIONID, calculateURL())
            //     .then(function (result) {
            //     });

            requireWorker = Webworker.create(keepAlive, {
                async: true
            });
            requireWorker.run(MAX_INACTIVE_INTERVAL, BOS_SESSIONID, calculateURL()).then(function (result) { });

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
            //vm.selectedMarketingNames = [];
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
            if (vm.selectedMarketingNames && vm.selectedMarketingNames.length > 0) {
                var marketingNames = [];
                _.forEach(vm.selectedMarketingNames, function (obj) {
                    marketingNames.push(obj.marketingNameId);
                })
                vm.filterObject["marketingNames"] = marketingNames;
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
            return ((totalRecords * 28) < _defaultWidth ? _defaultWidth : defaultWidth += (totalRecords * 38)) // Nishit, CCP-291
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
                            startDate: (typeof vm.datePicker.date.startDate == 'string' ? vm.datePicker.date.startDate : vm.datePicker.date.startDate.format(DATE_FORMAT)),
                            endDate: (typeof vm.datePicker.date.endDate == 'string' ? vm.datePicker.date.endDate : vm.datePicker.date.endDate.format(DATE_FORMAT))
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