<template>
    <div id="partyB"></div>
</template>

<script>
import * as echarts from 'echarts';
import { appMapActions } from '@APP_VUEX';
var myChart;
export default {
    props: {
        partyBDepartmentData: {
            type: Array,
            default: () => []
        },
        loading: {
            type: Boolean,
            default: false
        },
        partyBDepartment: {
            type: String
        },
        name: {
            type: String
        }
    },
    data () {
        return {

        };
    },
    watch: {
        partyBDepartmentData: {
            handler (newValue, oldValue) {
                this.partyAChearts(newValue);
            },
            deep: true
            // immediate: true
        }
    },
    methods: {
        ...appMapActions('home', ['getExportStatisticsData']),
        partyAChearts (partyAData) {
            var chartDom = document.getElementById('partyB');
            myChart = echarts.init(chartDom);
            var option;
            // prettier-ignore
            let dataAxis = [];
            // prettier-ignore
            let data = [];
            partyAData.forEach(item => {
                dataAxis.push(item.partyB);
                data.push(item.amount);
            });

            option = {
                grid: {
                    containLabel: true,
                    // left: 20,
                    bottom: 20
                },
                toolbox: {
                    feature: {
                        // saveAsImage: {
                        //     iconStyle: {
                        //     // color: '#84879a'
                        //     }
                        // }
                        myCsv: {
                            show: true,
                            title: '下载数据',
                            icon: 'path://M502.010485 765.939573c3.773953 3.719718 8.686846 5.573949 13.596669 5.573949 0.075725 0 0.151449-0.010233 0.227174-0.011256 0.329505 0.016373 0.654916 0.050142 0.988514 0.050142 0.706081 0 1.400906-0.042979 2.087545-0.116657 4.352121-0.366344 8.607028-2.190899 11.961426-5.496178l335.053985-330.166675c7.619538-7.509021 7.709589-19.773346 0.200568-27.393907s-19.774369-7.711636-27.39493-0.201591L536.193005 706.304358 536.193005 50.019207c0-10.698666-8.67252-19.371186-19.371186-19.371186s-19.371186 8.67252-19.371186 19.371186l0 657.032164-306.881342-302.44838c-7.618515-7.509021-19.883863-7.419993-27.393907 0.199545-7.509021 7.619538-7.419993 19.884886 0.199545 27.393907L502.010485 765.939573z M867.170139 711.020776c-10.698666 0-19.371186 8.67252-19.371186 19.371186l0 165.419494c0 13.054317-10.620895 23.675212-23.676236 23.675212L205.182103 919.486668c-13.054317 0-23.676236-10.620895-23.676236-23.675212L181.505867 730.391962c0-10.698666-8.67252-19.371186-19.371186-19.371186s-19.371186 8.67252-19.371186 19.371186l0 165.419494c0 34.416857 28.000728 62.416562 62.417585 62.416562l618.941638 0c34.417881 0 62.417585-27.999704 62.417585-62.416562L886.540302 730.391962C886.541325 719.693296 877.868805 711.020776 867.170139 711.020776z',
                            onclick: (params) => {
                                this.getExportStatisticsData({
                                    type: this.partyBDepartment.includes('地域') ? 'region' : 'department',
                                    _this: this,
                                    name: this.partyBDepartment,
                                    item: 'party_b',
                                    typeParam: this.name
                                });
                            }
                        }
                    },
                    right: 20,
                    top: 15
                },
                // 标题
                title: {
                    text: this.partyBDepartment,
                    left: 20,
                    top: 20
                },
                tooltip: {},
                xAxis: {
                    type: 'value',
                    axisTick: {
                        show: false
                    },
                    axisLine: {
                        show: false
                    }
                },
                yAxis: {
                    type: 'category',
                    axisLine: {
                        show: false
                    },
                    axisTick: {
                        show: true
                    },
                    triggerEvent: true,
                    // axisLabel: {
                    //     color: '#84879a'
                    // },
                    axisLabel: {
                        color: '#84879a',
                        formatter: function (params) {
                            var val = '';
                            if (params.length > 20) {
                                val = params.substr(0, 20) + '...';
                                return val;
                            } else {
                                return params;
                            }
                        }
                    },
                    data: dataAxis.reverse()
                },
                series: [
                    {
                        type: 'bar',
                        // showBackground: true
                        itemStyle: {
                            color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                                { offset: 0, color: '#83bff6' },
                                { offset: 1, color: '#188df0' }
                            ])
                        },
                        emphasis: {
                            itemStyle: {
                                color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                                    { offset: 0, color: '#fe8652' },
                                    { offset: 1, color: '#feb041' }
                                ])
                            }
                        },
                        data: data.reverse()
                    }
                ]
            };

            // 注册 mouseover 事件，类目轴名称切换为自定义颜色
            // myChart.on('mouseover', params => {
            //     if (params.componentType === 'yAxis') { // 进入y轴文字回调
            //     // 获取鼠标当前在那一块数据上，对数据进行特殊处理
            //         const yAxisName = params.value;
            //         const yAxisItem = {
            //             value: yAxisName,
            //             textStyle: {
            //                 color: '#fe8652'
            //             }
            //         };
            //         // 上述代码执行效果为：修改文字的字体颜色
            //         // 下面代码为：循环dataAxis数据，查找当前鼠标停留位置对应数据的下标index
            //         const index = dataAxis.findIndex(item => {
            //             return item === yAxisName || item.value === yAxisName;
            //         });
            //         // 处理好数据并且找到下标，对原数据替换
            //         dataAxis.splice(index, 1, yAxisItem);
            //         option.yAxis.data = JSON.parse(JSON.stringify(dataAxis));
            //         // 使用echarts方法setOption对图表进行更新达到hover字体然后变色效果
            //         myChart.setOption(option);
            //     } else if (params.componentType === 'series') { // 进入y轴柱子回调
            //     // 获取鼠标当前在那一块数据上，对数据进行特殊处理 params.dataIndex==当前数据下标
            //         const yAxisName = typeof (dataAxis[params.dataIndex]) === 'string'
            //             ? dataAxis[params.dataIndex] : dataAxis[params.dataIndex].value;
            //         const yAxisItem = {
            //             value: yAxisName,
            //             textStyle: {
            //                 color: '#fe8652'
            //             }
            //         };
            //         // 上述代码执行效果为:先对源数据yAxisItem进行修改
            //         // 下面代码为:对源数据dataAxis替换,并且替换option内的数据
            //         dataAxis.splice(params.dataIndex, 1, yAxisItem);
            //         option.yAxis.data = JSON.parse(JSON.stringify(dataAxis));
            //         // 使用echarts方法setOption对图表进行更新达到hover柱子然后y轴文字变色效果
            //         myChart.setOption(option);
            //     }
            // });

            // // 注册 mouseout 事件，类目轴名称恢复默认颜色.与上述mouseover移入时的处理方式一样就不写详细注释了
            // myChart.on('mouseout', params => {
            //     if (params.componentType === 'yAxis') { // 移出y轴文字回调
            //         const yAxisName = params.value;// 获取移出具体数据
            //         // 查找该数据的下标
            //         const index = dataAxis.findIndex(item => {
            //             return item === yAxisName || item.value === yAxisName;
            //         });
            //         dataAxis.splice(index, 1, yAxisName);// 替换dataAxis源数据
            //         option.yAxis.data = JSON.parse(JSON.stringify(dataAxis));// 替换option源数据
            //         myChart.setOption(option);// 更新图表
            //     } else if (params.componentType === 'series') { // 移出y轴柱子回调
            //     // 获取移出具体数据
            //         const yAxisName = typeof (dataAxis[params.dataIndex]) === 'string'
            //             ? dataAxis[params.dataIndex] : dataAxis[params.dataIndex].value;
            //         const yAxisItem = yAxisName;
            //         dataAxis.splice(params.dataIndex, 1, yAxisItem);// 替换dataAxis源数据
            //         option.yAxis.data = JSON.parse(JSON.stringify(dataAxis));// 替换option源数据
            //         myChart.setOption(option);// 更新图表
            //     }
            // });
            option && myChart.setOption(option);
        }
    },
    mounted () {

    }
};
</script>

<style lang="less" scoped src="./choose-department-partyB-data.less">
    
</style>