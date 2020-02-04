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
                router>
            <template v-for="item in items">
                <!-- 如果有子级 -->
                <template v-if="item.subs&&item.hidden===false">
                    <el-submenu :index="item.index" :key="item.index">
                        <template slot="title">
                            <i :class="item.icon"></i>
                            <span slot="title">{{ item.title }}</span>
                        </template>
                        <template v-for="subItem in item.subs">
                            <el-menu-item
                                    v-if="subItem.hidden===false"
                                    :index="subItem.index"
                                    :key="subItem.index">
                                <template slot="title">{{ subItem.title }}</template>
                            </el-menu-item>
                        </template>
                    </el-submenu>
                </template>
                <!-- 如果没有子集 -->
                <!-- 这里显示的是系统首页,因为它没有子集 -->
                <template v-else-if="!item.subs">
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
                currentUserMenusName: [],
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
        methods: {
            /* 动态修改菜单 */
            dynamicChangeMenu() {
                for (let item of this.items) {
                    /* 系统首页不算在动态菜单的计算范围内 */
                    item.hidden = this.currentUserMenusName.indexOf(item.title) === -1 && item.title !== '系统首页';
                    /* 如果有子集 */
                    if (item.subs) {
                        for (let subItem of item.subs) {
                            /* 当当前集合不匹配或者父集合不匹配时 */
                            subItem.hidden = this.currentUserMenusName.indexOf(subItem.title) === -1 || item.hidden;
                        }
                    }
                }
            }
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
            /* 存储每个用户对应的菜单 */
            /* 直接拿到的是一个字符串需要先转换成json格式 */
            let user = JSON.parse(sessionStorage.getItem('user'));
            let currentUserMenus = user.systemMenus;
            this.currentUserMenusName = [];
            for (let currentUserMenu of currentUserMenus) {
                this.currentUserMenusName.push(currentUserMenu.name);
            }
            /* 根据获取的systemMenus动态修改菜单 */
            /* 将菜单动态修改放到created中 */
            this.dynamicChangeMenu();
        },
        mounted() {
            /*
              created:在模板渲染成html前调用，即通常初始化某些属性值，然后再渲染成视图。
              mounted:在模板渲染成html后调用，通常是初始化页面完成后，再对html的dom节点进行一些需要的操作。
             */
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
