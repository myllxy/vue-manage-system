import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            redirect: '/dashboard'
        },
        // 锁屏
        {
            path: '/lock',
            hidden: true,
            meta: {title: '锁屏页'},
            component: () => import('../components/common/lock')
        },
        {
            path: '/',
            component: () => import('../components/common/Home.vue'),
            meta: {title: '自述文件'},
            children: [
                {
                    path: '/dashboard',
                    component: () => import('../components/page/Dashboard'),
                    meta: {title: '系统首页'}
                },
                {
                    path: '/employee',
                    component: () => import('../views/system/employee'),
                    meta: {title: '员工管理'}
                },
                {
                    path: '/department',
                    component: () => import('../views/system/department'),
                    meta: {title: '部门管理'}
                },
                {
                    path: '/role',
                    component: () => import('../views/system/role'),
                    meta: {title: '角色管理'}
                },
                {
                    path: '/permission',
                    component: () => import('../views/system/permission'),
                    meta: {title: '权限管理'}
                },
                {
                    path: '/resource',
                    component: () => import('../views/system/resource'),
                    meta: {title: '资源管理'}
                },
                {
                    path: '/systemDictionary',
                    component: () => import('../views/system/systemDictionary'),
                    meta: {title: '数据字典管理'}
                },
                {
                    path: '/systemMenu',
                    component: () => import('../views/system/systemMenu'),
                    meta: {title: '系统菜单管理'}
                },
                {
                    path: '/systemLog',
                    component: () => import('../views/system/systemLog'),
                    meta: {title: '系统日志管理'}
                },
                {
                    path: '/systemServer',
                    component: () => import('../views/system/systemServer'),
                    meta: {title: '查看系统状况'}
                },
                {
                    path: '/CustomerDevPlan',
                    component: () => import('../views/marketing/CustomerDevPlan'),
                    meta: {title: '客户开发计划'}
                },
                {
                    path: '/PotentialCustomer',
                    component: () => import('../views/marketing/PotentialCustomer'),
                    meta: {title: '潜在客户管理'}
                },
                {
                    path: '/customer',
                    component: () => import('../views/customer/customer'),
                    meta: {title: '客户信息管理'}
                },
                {
                    path: '/customerHistory',
                    component: () => import('../views/customer/customerHistory'),
                    meta: {title: '客户跟进历史'}
                },
                {
                    path: '/customerTransfer',
                    component: () => import('../views/customer/customerTransfer'),
                    meta: {title: '客户移交记录'}
                },
                {
                    path: '/Order',
                    component: () => import('../views/order/Order'),
                    meta: {title: '订单管理'}
                },
                {
                    path: '/Contract',
                    component: () => import('../views/order/Contract'),
                    meta: {title: '合同管理'}
                },
                {
                    path: '/ContractPayDetail',
                    component: () => import('../views/order/ContractPayDetail'),
                    meta: {title: '付款详情'}
                },
                {
                    path: '/bill',
                    component: () => import('../views/afterSale/bill'),
                    meta: {title: '明细管理'}
                },
                {
                    path: '/details',
                    component: () => import('../views/afterSale/details'),
                    meta: {title: '保修管理'}
                },

                /* {
                     // 权限页面
                     path: '/permission',
                     component: () => import(/!* webpackChunkName: "permission" *!/ '../components/page/Permission.vue'),
                     meta: { title: '权限测试', permission: true }
                 },*/
                {
                    path: '/404',
                    component: () => import(/* webpackChunkName: "404" */ '../components/page/404.vue'),
                    meta: {title: '404'}
                },
                {
                    path: '/403',
                    component: () => import(/* webpackChunkName: "403" */ '../components/page/403.vue'),
                    meta: {title: '403'}
                }
            ]
        },
        {
            path: '/login',
            component: () => import(/* webpackChunkName: "login" */ '../login/Login.vue'),
            meta: {title: '登录'}
        },
        {
            path: '/RegTenent',
            component: () => import(/* webpackChunkName: "login" */ '../login/RegTenent'),
            meta: {title: '公司注册'}
        },
        {
            path: '*',
            redirect: '/404'
        }
    ]
});
