<template>
    <div class="region-data-picture">
        <div id="region-data-picture"></div>
            <div class="percentage" v-if="maxData.length">
                <ul class="titleUl">
                    <li>名称</li>
                    <li>数量</li>
                    <li>占比</li>
                </ul>
                <div class="proportion"  v-for="data in maxData" :key="data.name">
                    <ul>
                        <li>{{data.label}}</li>
                        <li>{{data.value}}</li>
                        <li>{{num <= 0 ? "0%" : (Math.round(data.value / num * 10000) / 100) + "%"}}</li>
                    </ul>
                </div>
            </div>
        <div class="chart-right">
            <choose-department-partyA-data
                :partyADepartmentData="partyADepartmentData"
                :loading="loading"
                :name="name"
                :partyADepartment="partyADepartment"/>
            <choose-department-partyB-data
                :partyBDepartmentData="partyBDepartmentData"
                :loading="loading"
                :name="name"
                :partyBDepartment="partyBDepartment"/>
        </div>
    </div>
</template>

<script>
import * as echarts from 'echarts';
// import $ from 'jquery';
import chooseDepartmentPartyAData from '../department-data-picture/choose-department-partyA-data.vue';
import chooseDepartmentPartyBData from '../department-data-picture/choose-department-partyB-data.vue';
import axios from 'axios';
import { appMapActions } from '@APP_VUEX';
import usaJson from './usaJson.json';
import chinese from './chinese.json';
var name;
export default {
    data () {
        return {
            areaData: [],
            // 甲方部门数据
            partyADepartmentData: [],
            // 乙方部门数据
            partyBDepartmentData: [],
            loading: false,
            partyADepartment: '全国地域甲方单位合同数据情况',
            partyBDepartment: '全国地域乙方单位合同数据情况',
            maxData: [],
            // 总数
            num: '',
            // 传入部门的name
            name: ''
        };
    },
    components: {
        chooseDepartmentPartyAData,
        chooseDepartmentPartyBData
    },
    methods: {
        ...appMapActions('home', ['getExportStatisticsData']),
        getDepartmentData (name, item) {
            axios.get(`/contract/area-data`, {
                params: {
                    state: name,
                    item: item
                }
            }).then(res => {
                if (item === 'party_a') {
                    this.partyADepartmentData = res.data.data.records;
                } else {
                    this.partyBDepartmentData = res.data.data.records;
                }
            });
        }
    },
    mounted () {
        var chartDom = document.getElementById('region-data-picture');
        var myChart = echarts.init(chartDom);
        var option;

        myChart.showLoading();
        axios.get(`/contract/area-statistics`, {
            params: {
                pageSize: 20
            }
        }).then(res => {
            // 初始进来显示全国
            this.getDepartmentData('all', 'party_a');
            this.getDepartmentData('all', 'party_b');
            this.name = 'all';
            this.num = res.data.data.total;
            res.data.data.stateData.forEach(item => {
                for (let key in chinese) {
                    if (item.state === key) {
                        this.areaData.push({
                            name: item.state,
                            value: item.amount,
                            label: chinese[key]
                        });
                    }
                }
            });
            this.maxData = this.areaData.sort((a, b) => b.value - a.value).slice(0, 3);
            myChart.hideLoading();
            echarts.registerMap('USA', usaJson, {
                Alaska: {
                    // 把阿拉斯加移到美国主大陆左下方
                    left: -131,
                    top: 25,
                    width: 15
                },
                Hawaii: {
                    left: -110,
                    top: 28,
                    width: 5
                },
                'Puerto Rico': {
                    // 波多黎各
                    left: -76,
                    top: 26,
                    width: 2
                }
            });
            option = {
                title: {
                    text: '各地域合同数据情况',
                    // subtext: 'Data from www.census.gov',
                    // sublink: 'http://www.census.gov/popest/data/datasets.html',
                    left: 32,
                    top: 20
                },
                // tooltip: {
                //     trigger: 'item',
                //     showDelay: 0,
                //     transitionDuration: 0.2,
                //     formatter: function (params) {
                //         const value = (params.value + '').split('.');
                //         const valueStr = value[0].replace(
                //             /(\d{1,3})(?=(?:\d{3})+(?!\d))/g,
                //             '$1,'
                //         );
                //         return params.seriesName + '<br/>' + params.data.label + ': ' + valueStr;
                //     }
                // },
                visualMap: {
                    show: false,
                    left: 'right',
                    min: 1,
                    max: 5000,
                    inRange: {
                        color: [
                            // '#313695',
                            // '#4575b4',
                            // '#74add1',
                            // '#abd9e9',
                            // '#e0f3f8',
                            // '#ffffbf',
                            // '#fee090',
                            // '#fdae61',
                            // '#f46d43',
                            // '#d73027',
                            // '#a50026'
                            '#eef0f8',
                            '#d1daf0',
                            '#a5b9e5',
                            '#5b83d7'
                        ]
                    },
                    text: ['High', 'Low'],
                    calculable: true
                },
                toolbox: {
                    show: true,
                    // orient: 'vertical',
                    // left: 'right',
                    top: 20,
                    right: 20,
                    feature: {
                        // dataView: { readOnly: false },
                        restore: {},
                        // saveAsImage: {},
                        myCsv: {
                            show: true,
                            title: '下载数据',
                            icon: 'path://M502.010485 765.939573c3.773953 3.719718 8.686846 5.573949 13.596669 5.573949 0.075725 0 0.151449-0.010233 0.227174-0.011256 0.329505 0.016373 0.654916 0.050142 0.988514 0.050142 0.706081 0 1.400906-0.042979 2.087545-0.116657 4.352121-0.366344 8.607028-2.190899 11.961426-5.496178l335.053985-330.166675c7.619538-7.509021 7.709589-19.773346 0.200568-27.393907s-19.774369-7.711636-27.39493-0.201591L536.193005 706.304358 536.193005 50.019207c0-10.698666-8.67252-19.371186-19.371186-19.371186s-19.371186 8.67252-19.371186 19.371186l0 657.032164-306.881342-302.44838c-7.618515-7.509021-19.883863-7.419993-27.393907 0.199545-7.509021 7.619538-7.419993 19.884886 0.199545 27.393907L502.010485 765.939573z M867.170139 711.020776c-10.698666 0-19.371186 8.67252-19.371186 19.371186l0 165.419494c0 13.054317-10.620895 23.675212-23.676236 23.675212L205.182103 919.486668c-13.054317 0-23.676236-10.620895-23.676236-23.675212L181.505867 730.391962c0-10.698666-8.67252-19.371186-19.371186-19.371186s-19.371186 8.67252-19.371186 19.371186l0 165.419494c0 34.416857 28.000728 62.416562 62.417585 62.416562l618.941638 0c34.417881 0 62.417585-27.999704 62.417585-62.416562L886.540302 730.391962C886.541325 719.693296 877.868805 711.020776 867.170139 711.020776z',
                            onclick: (params) => {
                                this.getExportStatisticsData({ type: 'region', _this: this, name: '各地域合同数据' });
                            }
                        }
                    }
                },
                series: [
                    {
                        name: 'USA region',
                        type: 'map',
                        roam: true,
                        map: 'USA',
                        label: {
                            show: false,
                            formatter: function (params) {
                                return params.data.label + '\n' + params.value;
                            }
                        },
                        itemStyle: {
                            normal: {
                                borderWidth: 1, // 边际线大小
                                borderColor: '#c6cde5', // 边界线颜色
                                areaColor: '#09295b'// 默认区域颜色
                            },
                            emphasis: {
                                show: true,
                                areaColor: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                                    { offset: 0, color: '#fe8652' },
                                    { offset: 1, color: '#feb041' }
                                ]), // 鼠标滑过区域颜色
                                label: {
                                    show: true,
                                    textStyle: {
                                        color: '#000'
                                    },
                                    formatter: function (params) {
                                        return params.data.label + '\n' + params.value;
                                    }
                                }
                            }

                        },
                        data: this.areaData
                    }
                ]
            };
            myChart.setOption(option);
            myChart.on('click', params => {
                // 判断是否相同点击
                if (name === params.data.label) {
                    this.partyADepartment = '全国地域甲方单位合同数据情况';
                    this.partyBDepartment = '全国地域乙方单位合同数据情况';
                    this.getDepartmentData('all', 'party_a');
                    this.getDepartmentData('all', 'party_b');
                    this.name = 'all';
                    name = '';
                } else {
                    this.partyADepartment = '选中地域甲方单位合同数据情况';
                    this.partyBDepartment = '选中地域乙方单位合同数据情况';
                    this.getDepartmentData(params.name, 'party_a');
                    this.getDepartmentData(params.name, 'party_b');
                    this.name = params.name;
                    // 存入点击的值
                    name = params.data.label;
                }
            });
        });

        option && myChart.setOption(option);
    }
};
</script>

<style lang="less" scoped src="./region-data-picture.less">
</style>