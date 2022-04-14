<template>
    <h1>{{$t(content)}}</h1>
</template>

<script>
    import SocketManage from '@component-util/socket-push';

    // 设定 login 页的地址（上下文）
    SocketManage.setup({ redirectToUrlAfterClose: `${window.Util.ctxPath}/login` });

    export default {
        props: {
            content: {
                type: String
            }
        },
        methods: {},
        mounted () {
            setTimeout(() => {
                this.socket_root = SocketManage.getPushServer('/', `${window.Util.ctxPath}/socket.io`);
                this.socket_main = SocketManage.getPushServer('/main', `${window.Util.ctxPath}/socket.io`);
                this.socket_main.on('mw-offline', (mkey) => {
                    console.info('micro webapp (%s) offline', mkey);
                }).on('mw-online', (mkey, entryPath, hash) => {
                    console.info('micro webapp (%s) online, path & hash-info: ', mkey, entryPath, hash);
                }).on('mw-update', (mkey, entryPath, newHash, oldHash) => {
                    console.info(
                        'micro webapp (%s) updated, path & hash-info(new, old): ', mkey, entryPath, newHash, oldHash
                    );
                }).on('disconnect', () => {
                    this.socket_main.isNextConnect = true;
                }).on('connect', () => {
                    this.socket_main.isNextConnect && this.socket_main.emit('fetch-online', (data) => {
                        console.info('current online micro webapp data: ', data);
                    });
                });
            }, 1000);
            setTimeout(() => {
                this.socket_page = SocketManage.getPushServer('/page', `${window.Util.ctxPath}/socket.io`);
            }, 2000);
        }
    };
</script>

<style lang="less" rel="stylesheet/less" src="./label-page.less"></style>