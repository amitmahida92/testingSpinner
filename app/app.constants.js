(function () {
    'use strict';

    angular.module('reportingDashboard').constant('configureOptions', {
        DOUGHNUT: {
            legend: {
                display: false
            },
            cutoutPercentage: 70,
            rotation: 0.7 * Math.PI,
            circumference: 1.6 * Math.PI,
            responsive: true,
            tooltips: {
                enabled: false
            }
        },
        HORIZONTAL_BAR: {
            responsive: true,
            maintainAspectRatio: false,
            onResize: function (chart, size) {
                // This will be called when we resize the chart and can be helpful to calculate the height and width for chart
            },
            legend: {
                display: false
            },
            scales: {
                xAxes: [{       
                    stacked: true,             
                    scaleLabel: {
                        display: true,
                        labelString: ''
                    },
                    position: 'top'
                }],
                yAxes: [{
                    stacked: true,
                    scaleLabel: {
                        display: true,
                        labelString: ''
                    },
                    ticks: {
                        suggestedMin: 0,
                        suggestedMax: 100,
                    },
                    // categorySpacing: 30, // spacing beterrn bars
                    // barPercentage: 0.35, // accepts value between 0 to 1
                    barThickness: 15 // need to make global
                }]
            },
            size: {
                height: 364
            }
        },
        HORIZONTAL_STACKED_BAR: {
            responsive: true,
            maintainAspectRatio: false,
            onResize: function (chart, size) {
                // This will be called when we resize the chart and can be helpful to calculate the height and width for chart
            },
            legend: {
                display: false
            },
            scales: {
                xAxes: [{
                    stacked: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Compliance'
                    },
                    position: 'top'
                }],
                yAxes: [{
                    stacked: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Campaign'
                    },
                    // ticks: {
                    //     suggestedMin: 0,
                    //     suggestedMax: 100,
                    // },
                    // categorySpacing: 30, // spacing beterrn bars
                    // barPercentage: 0.35, // accepts value between 0 to 1
                    barThickness: 15 // need to make global
                }]
            },
            size: {
                height: 364,
            }
        },
        BAR_PLAYER: {
            responsive: true,
            maintainAspectRatio: false,            
            legend: {
                display: false
            },
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Player'
                    },
                    barThickness: 15 // need to make global
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Performance'
                    },
                    ticks: {
                        suggestedMin: 0,
                        suggestedMax: 50,
                    }
                }]
            },
            size: {
                width: 739, // randonly taken values, seems to work in most of resolutions
                height: 387 // randonly taken values, seems to work in most of resolutions
            }
        },
        BAR_DAY: {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                display: false
            },
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Date'
                    },
                     barThickness: 15 // need to make global
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Performance'
                    },
                    ticks: {
                        suggestedMin: 0,
                        suggestedMax: 100,
                    }
                }]
            },
            size: {
                width: 739, // randonly taken values, seems to work in most of resolutions
                height: 387 // randonly taken values, seems to work in most of resolutions
            }
        },
        HOUR_BAR: {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                display: false
            },
            scales: {
                xAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Time'
                    },
                    barThickness: 15 // need to make global
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Performance'
                    },
                    ticks: {
                        suggestedMin: 0,
                        suggestedMax: 200,
                    }
                }]
            }
        }
    });
})();