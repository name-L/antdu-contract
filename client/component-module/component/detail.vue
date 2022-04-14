<template>
    <div class="page-detail">
        <ef-scrollbar>
            <div class="page-detail-content">
                <div class="add-title">
                    <span class="add-title-content"></span>
                    <span class="cancel-button" @click="handleBack">
                        <i></i>
                    </span>
                </div>
                <div class="detail-content">
                    <div class="contract-content">
                        <hr />
                        <ul>
                            <template v-for="(item, index) in titleList">
                                <li :key="index" v-if="!!detailContent[item.key]&&item.key==='signingDate'">
                                    <span>{{item.title}}</span>
                                    <a :href="detailContent.url" target="_blank">{{ content(item) }}</a>
                                </li>
                                <li :key="index" v-if="!!detailContent[item.key]&&item.key!=='signingDate'">{{ content(item) }}</li>
                            </template>
                        </ul>
                        <div class="content-body">
                            {{ detailContent.content }}
                        </div>
                    </div>
                </div>
            </div>
        </ef-scrollbar>
    </div>
</template>

<script>
import moment from 'moment';
import efScrollbar from '../../component-base/scrollar/ef-scrollar.vue';
export default {
    props: {
        detailContent: {
            type: Object
        }
    },
    data () {
        return {
            titleList: [
                {
                    key: 'signingDate',
                    title: '时间：'
                },
                {
                    key: 'partyA',
                    title: '甲方：'
                },
                {
                    key: 'partyB',
                    title: '乙方：'
                },
                {
                    key: 'amount',
                    title: '合同金额：'
                },
                {
                    key: 'contractNum',
                    title: '合同号：'
                }
            ]
        };
    },
    components: {
        efScrollbar
    },
    mounted () {},
    computed: {
        content () {
            return function (data) {
                let value = '';
                if (data.key === 'signingDate') {
                    value = moment(this.detailContent[data.key]).format('YYYY-MM-DD');
                } else if (data.key === 'amount') {
                    value = data.title + this.outputMoney(this.detailContent[data.key]);
                } else {
                    value = data.title + this.detailContent[data.key];
                }

                return value;
            };
        }
    },
    watch: {},
    methods: {
        // 返回
        handleBack () {
            this.$emit('handleBack', 'index');
        },
        outputMoney (num) {
            // if ((num + '').Trim() === '') {

            // return '';

            // }
            if (isNaN(num)) {
                return '';
            }
            num = num + '';
            if (/^.*\..*$/.test(num)) {
                let pointIndex = num.lastIndexOf('.');
                let intPart = num.substring(0, pointIndex);
                let pointPart = num.substring(pointIndex + 1, num.length);
                intPart = intPart + '';
                while (/(-?\d+)(\d{3})/.test(intPart)) {
                    intPart = intPart.replace(/(-?\d+)(\d{3})/, '$1,$2');
                }
                num = intPart + '.' + pointPart;
            } else {
                num = num + '';
                while (/(-?\d+)(\d{3})/.test(num)) {
                    num = num.replace(/(-?\d+)(\d{3})/, '$1,$2');
                }
            }
            num = '$' + num;
            return num;
        }
    },
    destroyed () {}
};
</script>

<style lang='less' rel='stylesheet/less' src='./detail.less' scoped>
</style>
