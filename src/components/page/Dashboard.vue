<template>
    <div>
        <el-row :gutter="20">
            <el-col :span="8">
                <el-card shadow="hover" class="mgb20" style="height:252px;">
                    <div class="user-info">
                        <img src="../../assets/img/img.jpg" class="user-avator" alt/>
                        <div class="user-info-cont">
                            <div class="user-info-name">{{name}}</div>
                            <div>{{role}}</div>
                        </div>
                    </div>
                    <div class="user-info-list">
                        当前系统时间<span style="color: red"> {{ nowDate + ' ' + nowTime + ' ' + nowWeek }}</span>
                    </div>
                    <div class="user-info-list">
                        本次登录地点：<span>东莞</span>

                    </div>
                </el-card>
                <el-card shadow="hover" style="height:322px;">
                    <div slot="header" class="clearfix">
                        <span>客户开发计划完成度</span>
                        <el-button style="float: right; padding: 5px 0" type="text">查看详情</el-button>
                    </div>
                    微信营销
                    <el-progress :percentage="71.3" color="#42b983"></el-progress>
                    朋友介绍
                    <el-progress :percentage="24.1" color="#f1e05a"></el-progress>
                    电话营销
                    <el-progress :percentage="13.7"></el-progress>
                    上门拜访
                    <el-progress :percentage="5.9" color="#f56c6c"></el-progress>
                </el-card>
            </el-col>
            <el-col :span="16">
                <el-row :gutter="20" class="mgb20">
                    <el-col :span="8">
                        <el-card shadow="hover" :body-style="{padding: '0px'}">
                            <div class="grid-content grid-con-1">

                            </div>
                        </el-card>
                    </el-col>
                    <el-col :span="8">
                        <el-card shadow="hover" :body-style="{padding: '0px'}">
                            <div class="grid-content grid-con-2">
                                <i class="el-icon-lx-notice grid-con-icon"></i>
                                <div class="grid-cont-right">
                                    <div class="grid-num">321</div>
                                    <div>系统消息</div>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                    <el-col :span="8">
                        <el-card shadow="hover" :body-style="{padding: '0px'}">
                            <div class="grid-content grid-con-3">
                                <i class="el-icon-lx-goods grid-con-icon"></i>
                                <div class="grid-cont-right">
                                    <div class="grid-num">5000</div>
                                    <div>数量</div>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
                <el-card shadow="hover" style="height:473px;">
                    <div slot="header" class="clearfix">
                        <span>系统信息</span>
                        <el-button style="float: right; padding: 3px 0" type="text">查看详情</el-button>
                    </div>
                    <el-table :show-header="false" :data="todoList" style="width:100%;">
                        <el-table-column width="40">
                            <template slot-scope="scope">
                                <el-checkbox v-model="scope.row.status"></el-checkbox>
                            </template>
                        </el-table-column>
                        <el-table-column>
                            <template slot-scope="scope">
                                <div
                                        class="todo-item"
                                        :class="{'todo-item-del': scope.row.status}"
                                >{{scope.row.title}}
                                </div>
                            </template>
                        </el-table-column>
                        <el-table-column width="60">
                            <template>
                                <i class="el-icon-delete"></i>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-card>
            </el-col>
        </el-row>
        <!--<el-row :gutter="20">
            <el-col :span="12">
                <el-card shadow="hover">
                    <schart ref="bar" class="schart" canvasId="bar" :options="options"></schart>
                </el-card>
            </el-col>
            <el-col :span="12">
                <el-card shadow="hover">
                    <schart ref="line" class="schart" canvasId="line" :options="options2"></schart>
                </el-card>
            </el-col>
        </el-row>-->
    </div>
</template>

<script>

    export default {
        name: 'dashboard',
        data() {
            return {
                nowDate: "",    // 当前日期
                nowTime: "",    // 当前时间
                nowWeek: "",     // 当前星期
                name: localStorage.getItem('ms_username'),
                todoList: [
                    {
                        title: '2020年1月14日需要开发14个客户',
                        status: false
                    },
                    {
                        title: '2020年1月13日需要开发13个客户',
                        status: false
                    },
                    {
                        title: '2020年1月12日需要开发12个客户',
                        status: false
                    },
                    {
                        title: '2020年1月11日要需开发11个客户',
                        status: false
                    },
                    {
                        title: '2020年1月10日要需开发10个客户',
                        status: true
                    },
                    {
                        title: '2020年1月09日需要开发9个客户',
                        status: true
                    },
                    {
                        title: '2020年1月08日需要开发8个客户',
                        status: true
                    },
                    {
                        title: '2020年1月07日要开发7个客户',
                        status: true
                    }
                ],
            };
        },

        computed: {
            role() {
                return this.name === 'admin' ? '超级管理员' : '普通用户';
            }
        },


        methods: {
            currentTime() {
                setInterval(this.getDate, 500);
            },
            getDate: function () {
                var _this = this;
                let yy = new Date().getFullYear();
                let mm = new Date().getMonth() + 1;
                let dd = new Date().getDate();
                let week = new Date().getDay();
                let hh = new Date().getHours();
                let mf =
                    new Date().getMinutes() < 10
                        ? "0" + new Date().getMinutes()
                        : new Date().getMinutes();
                let ss = new Date().getSeconds()
                if (week == 1) {
                    this.nowWeek = "星期一";
                } else if (week == 2) {
                    this.nowWeek = "星期二";
                } else if (week == 3) {
                    this.nowWeek = "星期三";
                } else if (week == 4) {
                    this.nowWeek = "星期四";
                } else if (week == 5) {
                    this.nowWeek = "星期五";
                } else if (week == 6) {
                    this.nowWeek = "星期六";
                } else {
                    this.nowWeek = "星期日";
                }
                _this.nowTime = hh + ":" + mf + ":" + ss;
                _this.nowDate = yy + "年" + mm + "月" + dd + "日";
            }


        },
        mounted() {
            this.currentTime();
        },
        // 销毁定时器
        beforeDestroy: function () {
            if (this.getDate) {
                console.log("销毁定时器")
                clearInterval(this.getDate); // 在Vue实例销毁前，清除时间定时器
            }
        }
    };
</script>


<style scoped>
    .el-row {
        margin-bottom: 20px;
    }

    .grid-content {
        display: flex;
        align-items: center;
        height: 100px;
    }

    .grid-cont-right {
        flex: 1;
        text-align: center;
        font-size: 14px;
        color: #999;
    }

    .grid-num {
        font-size: 30px;
        font-weight: bold;
    }

    .grid-con-icon {
        font-size: 50px;
        width: 100px;
        height: 100px;
        text-align: center;
        line-height: 100px;
        color: #fff;
    }

    .grid-con-1 .grid-con-icon {
        background: rgb(45, 140, 240);
    }

    .grid-con-1 .grid-num {
        color: rgb(45, 140, 240);
    }

    .grid-con-2 .grid-con-icon {
        background: rgb(100, 213, 114);
    }

    .grid-con-2 .grid-num {
        color: rgb(45, 140, 240);
    }

    .grid-con-3 .grid-con-icon {
        background: rgb(242, 94, 67);
    }

    .grid-con-3 .grid-num {
        color: rgb(242, 94, 67);
    }

    .user-info {
        display: flex;
        align-items: center;
        padding-bottom: 20px;
        border-bottom: 2px solid #ccc;
        margin-bottom: 20px;
    }

    .user-avator {
        width: 120px;
        height: 120px;
        border-radius: 50%;
    }

    .user-info-cont {
        padding-left: 50px;
        flex: 1;
        font-size: 14px;
        color: #999;
    }

    .user-info-cont div:first-child {
        font-size: 30px;
        color: #222;
    }

    .user-info-list {
        font-size: 14px;
        color: #999;
        line-height: 25px;
    }

    .user-info-list span {
        margin-left: 70px;
    }

    .mgb20 {
        margin-bottom: 20px;
    }

    .todo-item {
        font-size: 14px;
    }

    .todo-item-del {
        text-decoration: line-through;
        color: #999;
    }

    .schart {
        width: 100%;
        height: 300px;
    }
</style>
