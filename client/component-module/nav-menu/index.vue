<template>
    <div class="body-content">
        <el-menu
            :default-active="activeIndex"
            class="el-menu-demo"
            mode="horizontal"
            @select="handleSelect"
            background-color="#fff"
            text-color="#818496"
            active-text-color="#587cbd">
            <el-menu-item><i class="logo"></i></el-menu-item>
            <el-menu-item index="/contract">{{$t('main.home.contractList')}}</el-menu-item>
            <el-menu-item index="/datareport">{{$t('main.home.dataReport')}}</el-menu-item>
            <el-menu-item index="3">{{$t('main.home.informationImport')}}
                <input
                    type="file" 
                    @change="uploadTxt"
                    multiple="multiplt"
                    ref="importFile"
                    :autofocus="true"
                    class="add-file-right-input"
                    style="display:none;"
                    accept=".xls,.json">
            </el-menu-item>
            <!-- <el-menu-item index="4">信息导出</el-menu-item> -->
            <!-- <router-link
                :to="item.path"
                tag="li"
                activeClass=""
                v-for="item in routerList"
                :key="item.path">
                {{ item.text }}
            </router-link> -->
        </el-menu>
        <router-view></router-view>
    </div>
</template>

<script>
import { appMapMutations } from '@APP_VUEX';
import axios from 'axios';
export default {
    data () {
        return {
            activeIndex: '/contract',
            routerList: [
                {
                    path: '/contract',
                    text: '合同列表'
                },
                {
                    path: '/datareport',
                    text: '数据报表'
                },
                {
                    path: '',
                    text: '信息导入'
                },
                {
                    path: '',
                    text: '信息导出'
                }
            ],
            file: [] // 文件
        };
    },
    methods: {
        ...appMapMutations('home', ['setExportInformation']),
        handleSelect (key, keyPath) {
            console.log(key, keyPath);
            switch (key) {
            case '3':
                this.$refs.importFile.click();
                break;
            case '4':
                this.setExportInformation(true);
                break;
            default:
                this.$router.push(key);
                break;
            }
        },
        // 上传文件
        uploadTxt () {
            this.file = this.$refs.importFile.files[0];
            this.addFile();
            this.$refs.importFile.value = ''; // 清空Input
        },
        // 上传文件请求
        addFile () {
            const formData = new FormData();
            formData.append('file', this.file);
            axios.post('/contract/import-contract-content', formData).then(res => {
                if (res.data.success) {
                    this.$message.success(this.$t('main.home.uploadSuccess'));
                } else {
                    this.$message.error(res.data.msg);
                }
            });
        }
    }
};
</script>

<style lang="less" src="./index.less" scoped>
    
</style>