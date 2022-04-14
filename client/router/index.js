import Vue from 'vue';
import VueRouter from 'vue-router';
import Contract from '../component-module/contract/contract.vue';
// import DataReport from '../component-module/data-report/data-report.vue';
Vue.use(VueRouter);
const routes = [
    {
        path: `/contract`,
        component: Contract
    },
    {
        path: `/datareport`,
        component: () => import('../component-module/data-report/data-report.vue'),
        children: [
            {
                path: '/datareport/department',
                // component: UploadReport
                component: () => import('../component-module/data-report/department-data-picture/department-data-picture.vue')
            },
            {
                path: '/datareport/region',
                component: () => import('../component-module/data-report/region-data-picture/region-data-picture.vue')
            },
            {
                path: '/datareport',
                redirect: `/datareport/department`
            }
        ]
    },
    {
        path: `/`,
        redirect: `/contract`
    }
];

const router = new VueRouter({
    mode: 'history',
    linkActiveClass: 'active',
    routes
});

export default router;
