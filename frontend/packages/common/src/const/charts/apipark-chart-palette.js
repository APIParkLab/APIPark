(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['exports', 'echarts'], factory);
    } else if (typeof exports === 'object' && typeof exports.nodeName !== 'string') {
        // CommonJS
        factory(exports, require('echarts'));
    } else {
        // Browser globals
        factory({}, root.echarts);
    }
}(this, function (exports, echarts) {
    var log = function (msg) {
        if (typeof console !== 'undefined') {
            console && console.error && console.error(msg);
        }
    };
    if (!echarts) {
        log('ECharts is not Loaded');
        return;
    }
    echarts.registerTheme('apipark chart palette', {
        "color": [
            "#4429e6",
            "#fd6280",
            "#28dbe2",
            "#ffc404",
            "#b92325",
            "#1b9f17",
            "#fe8705",
            "#97b552",
            "#95706d",
            "#dc69aa",
            "#07a2a4",
            "#9a7fd1",
            "#588dd5",
            "#f5994e",
            "#333333"
        ],
        "backgroundColor": "rgba(0,0,0,0)",
        "textStyle": {},
        "title": {
            "textStyle": {
                "color": "#333333"
            },
            "subtextStyle": {
                "color": "#999999"
            }
        },
        "line": {
            "itemStyle": {
                "borderWidth": "2"
            },
            "lineStyle": {
                "width": "2"
            },
            "symbolSize": "5",
            "symbol": "circle",
            "smooth": true
        },
        "radar": {
            "itemStyle": {
                "borderWidth": "2"
            },
            "lineStyle": {
                "width": "2"
            },
            "symbolSize": "5",
            "symbol": "circle",
            "smooth": true
        },
        "bar": {
            "itemStyle": {
                "barBorderWidth": "2",
                "barBorderColor": "rgba(255,255,255,0.3)"
            }
        },
        "pie": {
            "itemStyle": {
                "borderWidth": "2",
                "borderColor": "rgba(255,255,255,0.3)"
            }
        },
        "scatter": {
            "itemStyle": {
                "borderWidth": "2",
                "borderColor": "rgba(255,255,255,0.3)"
            }
        },
        "boxplot": {
            "itemStyle": {
                "borderWidth": "2",
                "borderColor": "rgba(255,255,255,0.3)"
            }
        },
        "parallel": {
            "itemStyle": {
                "borderWidth": "2",
                "borderColor": "rgba(255,255,255,0.3)"
            }
        },
        "sankey": {
            "itemStyle": {
                "borderWidth": "2",
                "borderColor": "rgba(255,255,255,0.3)"
            }
        },
        "funnel": {
            "itemStyle": {
                "borderWidth": "2",
                "borderColor": "rgba(255,255,255,0.3)"
            }
        },
        "gauge": {
            "itemStyle": {
                "borderWidth": "2",
                "borderColor": "rgba(255,255,255,0.3)"
            }
        },
        "candlestick": {
            "itemStyle": {
                "color": "#d87a80",
                "color0": "#2ec7c9",
                "borderColor": "#d87a80",
                "borderColor0": "#2ec7c9",
                "borderWidth": 1
            }
        },
        "graph": {
            "itemStyle": {
                "borderWidth": "2",
                "borderColor": "rgba(255,255,255,0.3)"
            },
            "lineStyle": {
                "width": 1,
                "color": "#aaaaaa"
            },
            "symbolSize": "5",
            "symbol": "circle",
            "smooth": true,
            "color": [
                "#4429e6",
                "#fd6280",
                "#28dbe2",
                "#ffc404",
                "#b92325",
                "#1b9f17",
                "#fe8705",
                "#97b552",
                "#95706d",
                "#dc69aa",
                "#07a2a4",
                "#9a7fd1",
                "#588dd5",
                "#f5994e",
                "#333333"
            ],
            "label": {
                "color": "#fefefe"
            }
        },
        "map": {
            "itemStyle": {
                "areaColor": "#dddddd",
                "borderColor": "#eeeeee",
                "borderWidth": 0.5
            },
            "label": {
                "color": "#d87a80"
            },
            "emphasis": {
                "itemStyle": {
                    "areaColor": "rgba(254,153,78,1)",
                    "borderColor": "#444",
                    "borderWidth": 1
                },
                "label": {
                    "color": "rgb(100,0,0)"
                }
            }
        },
        "geo": {
            "itemStyle": {
                "areaColor": "#dddddd",
                "borderColor": "#eeeeee",
                "borderWidth": 0.5
            },
            "label": {
                "color": "#d87a80"
            },
            "emphasis": {
                "itemStyle": {
                    "areaColor": "rgba(254,153,78,1)",
                    "borderColor": "#444",
                    "borderWidth": 1
                },
                "label": {
                    "color": "rgb(100,0,0)"
                }
            }
        },
        "categoryAxis": {
            "axisLine": {
                "show": true,
                "lineStyle": {
                    "color": "rgba(0,0,0,0.1)"
                }
            },
            "axisTick": {
                "show": true,
                "lineStyle": {
                    "color": "rgba(0,0,0,0.1)"
                }
            },
            "axisLabel": {
                "show": true,
                "color": "#333333"
            },
            "splitLine": {
                "show": false,
                "lineStyle": {
                    "color": [
                        "#eee"
                    ]
                }
            },
            "splitArea": {
                "show": false,
                "areaStyle": {
                    "color": [
                        "rgba(250,250,250,0.3)",
                        "rgba(200,200,200,0.3)"
                    ]
                }
            }
        },
        "valueAxis": {
            "axisLine": {
                "show": true,
                "lineStyle": {
                    "color": "rgba(0,0,0,0.1)"
                }
            },
            "axisTick": {
                "show": true,
                "lineStyle": {
                    "color": "rgba(0,0,0,0.1)"
                }
            },
            "axisLabel": {
                "show": true,
                "color": "#333"
            },
            "splitLine": {
                "show": true,
                "lineStyle": {
                    "color": [
                        "#eee"
                    ]
                }
            },
            "splitArea": {
                "show": true,
                "areaStyle": {
                    "color": [
                        "#ffffff",
                        "rgba(0,0,0,0.02)"
                    ]
                }
            }
        },
        "logAxis": {
            "axisLine": {
                "show": true,
                "lineStyle": {
                    "color": "rgba(0,0,0,0.1)"
                }
            },
            "axisTick": {
                "show": true,
                "lineStyle": {
                    "color": "rgba(0,0,0,0.1)"
                }
            },
            "axisLabel": {
                "show": true,
                "color": "#333"
            },
            "splitLine": {
                "show": true,
                "lineStyle": {
                    "color": [
                        "#eee"
                    ]
                }
            },
            "splitArea": {
                "show": true,
                "areaStyle": {
                    "color": [
                        "#ffffff",
                        "rgba(0,0,0,0.02)"
                    ]
                }
            }
        },
        "timeAxis": {
            "axisLine": {
                "show": true,
                "lineStyle": {
                    "color": "rgba(0,0,0,0.1)"
                }
            },
            "axisTick": {
                "show": true,
                "lineStyle": {
                    "color": "rgba(0,0,0,0.1)"
                }
            },
            "axisLabel": {
                "show": true,
                "color": "#333"
            },
            "splitLine": {
                "show": true,
                "lineStyle": {
                    "color": [
                        "#eee"
                    ]
                }
            },
            "splitArea": {
                "show": false,
                "areaStyle": {
                    "color": [
                        "rgba(250,250,250,0.3)",
                        "rgba(200,200,200,0.3)"
                    ]
                }
            }
        },
        "toolbox": {
            "iconStyle": {
                "borderColor": "#000000"
            },
            "emphasis": {
                "iconStyle": {
                    "borderColor": "#000000"
                }
            }
        },
        "legend": {
            "textStyle": {
                "color": "#333333"
            }
        },
        "tooltip": {
            "axisPointer": {
                "lineStyle": {
                    "color": "rgba(0,0,0,0.3)",
                    "width": "1"
                },
                "crossStyle": {
                    "color": "rgba(0,0,0,0.3)",
                    "width": "1"
                }
            }
        },
        "timeline": {
            "lineStyle": {
                "color": "#008acd",
                "width": 1
            },
            "itemStyle": {
                "color": "#008acd",
                "borderWidth": 1
            },
            "controlStyle": {
                "color": "#008acd",
                "borderColor": "#008acd",
                "borderWidth": 0.5
            },
            "checkpointStyle": {
                "color": "#2ec7c9",
                "borderColor": "#2ec7c9"
            },
            "label": {
                "color": "#008acd"
            },
            "emphasis": {
                "itemStyle": {
                    "color": "#a9334c"
                },
                "controlStyle": {
                    "color": "#008acd",
                    "borderColor": "#008acd",
                    "borderWidth": 0.5
                },
                "label": {
                    "color": "#008acd"
                }
            }
        },
        "visualMap": {
            "color": [
                "#ffffff",
                "#4429e6"
            ]
        },
        "dataZoom": {
            "backgroundColor": "rgba(47,69,84,0)",
            "dataBackgroundColor": "#efefff",
            "fillerColor": "rgba(182,162,222,0.2)",
            "handleColor": "#008acd",
            "handleSize": "100%",
            "textStyle": {
                "color": "#333333"
            }
        },
        "markPoint": {
            "label": {
                "color": "#fefefe"
            },
            "emphasis": {
                "label": {
                    "color": "#fefefe"
                }
            }
        }
    });
}));
