<template>
    <div class="sidebar">
        <el-menu
            class="sidebar-el-menu"
            :default-active="onRoutes"
            :collapse="collapse"
            background-color="#324157"
            text-color="#bfcbd9"
            active-text-color="#20a0ff"
            unique-opened
            router
        >
            <template v-for="item in items">
                <template v-if="item.subs">
                    <el-submenu :index="item.index" :key="item.index">
                        <template slot="title">
                            <i :class="item.icon"></i>
                            <span slot="title">{{ item.title }}</span>
                        </template>
                        <template v-for="subItem in item.subs">
                            <el-submenu
                                v-if="subItem.subs"
                                :index="subItem.index"
                                :key="subItem.index"
                            >
                                <template slot="title">{{ subItem.title }}</template>
                                <el-menu-item
                                    v-for="(threeItem,i) in subItem.subs"
                                    :key="i"
                                    :index="threeItem.index"
                                >{{ threeItem.title }}</el-menu-item>
                            </el-submenu>
                            <el-menu-item
                                v-else
                                :index="subItem.index"
                                :key="subItem.index"
                            >{{ subItem.title }}</el-menu-item>
                        </template>
                    </el-submenu>
                </template>
                <template v-else>
                    <el-menu-item :index="item.index" :key="item.index">
                        <i :class="item.icon"></i>
                        <span slot="title">{{ item.title }}</span>
                    </el-menu-item>
                </template>
            </template>
        </el-menu>
    </div>
</template>

<script>
import bus from '../common/bus';
export default {
    data() {
        return {
            collapse: false,
            items: [
                {
                    icon: 'el-icon-lx-home',
                    index: 'dashboard',
                    title: '系统首页'
                },
                {
                    icon: 'el-icon-lx-settings',
                    index: 'system',
                    title: '系统管理',
                    subs: [
                        {
                            index: 'employee',
                            title: '员工管理'
                        },
                        {
                            index: 'department',
                            title: '部门管理'
                        },
                        {
                            index: 'role',
                            title: '角色管理'
                        },
                        {
                            index: 'permission',
                            title: '权限管理'
                        },

                        {
                            index: 'resource',
                            title: '资源管理'
                        },
                        {
                            index: 'systemDictionary',
                            title: '数据字典管理'
                        },
                        {
                            index: 'systemMenu',
                            title: '系统菜单管理'
                        },
                        {
                            index: 'systemLog',
                            title: '系统日志管理'
                        },
                        {
                            index: 'systemServer',
                            title: '查看系统状况'
                        }
                    ]
                },
                {
                    icon: 'el-icon-lx-recharge',
                    index: 'marketing',
                    title: '营销管理',
                    subs: [
                        {
                            index: 'PotentialCustomer',
                            title: '潜在客户管理'
                        },
                        {
                            index: 'CustomerDevPlan',
                            title: '客户开发计划'
                        },
                    ]
                },
                {
                    icon: 'el-icon-lx-group',
                    index: 'customerIng',
                    title: '客户管理',
                    subs: [
                        {
                            index: 'customer',
                            title: '客户信息管理'
                        },
                        {
                            index: 'customerHistory',
                            title: '客户跟进历史'
                        },
                        {
                            index: 'customerTransfer',
                            title: '客户移交记录'
                        },
                    ]
                },
                {
                    icon: 'el-icon-lx-news',
                    index: 'order',
                    title: '订单合同管理',
                    subs: [
                        {
                            index: 'Order',
                            title: '订单管理'
                        },
                        {
                            index: 'Contract',
                            title: '合同管理'
                        },
                        {
                            index: 'ContractPayDetail',
                            title: '付款详情'
                        },
                    ]
                },
                {
                    icon: 'el-icon-lx-service',
                    index: 'afterSale',
                    title: '售后管理',
                    subs: [
                        {
                            index: 'bill',
                            title: '明细管理'
                        },
                        {
                            index: 'details',
                            title: '保修管理'
                        },
                    ]
                },
            ]
        };
    },
    computed: {
        onRoutes() {
            return this.$route.path.replace('/', '');
        }
    },
    created() {
        // 通过 Event Bus 进行组件间通信，来折叠侧边栏
        bus.$on('collapse', msg => {
            this.collapse = msg;
            bus.$emit('collapse-content', msg);
        });
    }
};
</script>

<style scoped>
.sidebar {
    display: block;
    position: absolute;
    left: 0;
    top: 70px;
    bottom: 0;
    overflow-y: scroll;
}
.sidebar::-webkit-scrollbar {
    width: 0;
}
.sidebar-el-menu:not(.el-menu--collapse) {
    width: 250px;
}
.sidebar > ul {
    height: 100%;
}
</style>
