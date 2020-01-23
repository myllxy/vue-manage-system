<template>
    <section>
        <!-- 工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="searchForm">
                <el-date-picker
                        v-model="searchForm.beginTime"
                        type="date"
                        @change="dateChangebeginTime"
                        value-format="yyyy-MM-dd"
                        placeholder="开始日期">
                </el-date-picker>

                <el-date-picker
                        v-model="searchForm.endTime"
                        align="right"
                        @change="dateChangeendTime"
                        value-format="yyyy-MM-dd"
                        placeholder="结束日期"
                        :picker-options="pickerOptions">
                </el-date-picker>

                <el-form-item>
                    <el-input v-model="searchForm.sn" placeholder="定金单号"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="getOrders">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!-- 列表 -->
        <el-table :data="orders" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
                  style="width: 100%;">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column type="index" label="id" sortable>
            </el-table-column>
            <el-table-column prop="sn" label="定金单号">
            </el-table-column>
            <el-table-column prop="signTime" label="签订时间">
            </el-table-column>
            <el-table-column prop="sum" label="定金金额">
            </el-table-column>
            <el-table-column prop="intro" label="摘要">
            </el-table-column>
            <el-table-column prop="seller.username" label="营销人员">
            </el-table-column>
            <el-table-column prop="customer.name" label="定金客户">
            </el-table-column>
            <el-table-column label="操作" width="273">
                <template scope="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                    <el-button type="success" size="small" @click="addContract(scope.$index, scope.row)">生成合同
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 工具条 -->
        <el-col :span="24" class="toolbar">
            <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
            <!-- 分页查询 -->
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange"
                           :page-size="pageSize"
                           :current-page="currentPage"
                           :total="total" style="float:right;">
            </el-pagination>
        </el-col>

        <!-- 新增与修改界面 -->
        <el-dialog :title="title" :visible.sync="formVisible">
            <el-form :model="order" label-width="80px" :rules="addFormRules" ref="addForm">
                <el-form-item label="订金单号" prop="sn">
                    <el-input v-model="order.sn" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="订单日期">
                    <el-date-picker
                            v-model="order.signTime"
                            @change="dateChangesignTime"
                            type="date"
                            value-format="yyyy-MM-dd"
                            placeholder="选择日期">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="定金金额" prop="sum">
                    <el-input v-model.number="order.sum" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="摘要" prop="intro">
                    <el-input v-model="order.intro" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="营销人员" prop="seller">
                    <el-select value-key="id" v-model="order.seller" placeholder="请选择营销人员">
                        <el-option v-for="item in sellerlist"
                                   :key="item.sn"
                                   :value="item"
                                   :label="item.username"></el-option>
                    </el-select>
                </el-form-item>

                <el-form-item label="定金客户" prop="customer">
                    <el-select value-key="id" v-model="order.customer" placeholder="请选择定金客户">
                        <el-option v-for="item in customerlist"
                                   :key="item.id"
                                   :value="item"
                                   :label="item.name"></el-option>
                    </el-select>
                </el-form-item>

            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="formVisible = false">取消</el-button>
                <el-button type="primary" @click.native="submit" :loading="addLoading">提交</el-button>
            </div>
        </el-dialog>
    </section>
</template>

<script>
    export default {
        data() {
            return {
                /* 日期*/
                pickerOptions: {
                    disabledDate(time) {
                        return time.getTime() > Date.now();
                    },
                    shortcuts: [{
                        text: '今天',
                        onClick(picker) {
                            picker.$emit('pick', new Date());
                        }
                    }, {
                        text: '昨天',
                        onClick(picker) {
                            const date = new Date();
                            date.setTime(date.getTime() - 3600 * 1000 * 24);
                            picker.$emit('pick', date);
                        }
                    }, {
                        text: '一周前',
                        onClick(picker) {
                            const date = new Date();
                            date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
                            picker.$emit('pick', date);
                        }
                    }]
                },

                /* 查询form */
                searchForm: {
                    /* custom:"",*/
                    sn: "",
                    beginTime: "",
                    endTime: "",
                },
                /* 订单,不是合同 */
                orders: [],
                /*营销人员*/
                sellerlist: [],
                /*订单客户*/
                customerlist: [],
                /*分页*/
                total: 0,
                pageSize: 10,
                currentPage: 1,
                listLoading: false,
                /* 列表选中列 */
                sels: [],
                title: "",
                /*新增*/
                order: {
                    signTime: "",
                    id: "",
                    sum: "",
                    intro: "",
                    seller: "",
                    customer: "",
                },
                /* 弹出框是否显示 */
                formVisible: false,
                addLoading: false,
                addFormRules: {
                    sum: [
                        {type: 'number', required: true, message: '定金金额', trigger: 'blur'}
                    ],
                    intro: [
                        {required: true, message: '摘要', trigger: 'blur'}
                    ]
                },
            }
        },
        methods: {
            /*生成合同按钮*/
            addContract(i, r) {
                //给customer重新赋值
                this.order = Object.assign({}, r);
                let myCustomer = {id: this.order.customer.id};
                let mySeller = {id: this.order.seller.id};
                this.order.customer = myCustomer;
                this.order.seller = mySeller;
                this.order.sum = "";
                this.order.id = "";
                let param = this.order;
                this.$http.put("/contract/save", param).then(res => {
                    if (res.data.success) {
                        this.addLoading = false;
                        this.$message({
                            message: '提交成功',
                            type: 'success'
                        });
                    } else {
                        this.$notify.error({
                            title: '错误',
                            message: res.data.msg
                        });
                    }
                });

            },
            /* 后台查询emplyee.list返回给order */
            getSellerList() {
                this.$http.post("/employee/getEmployee").then(res => {
                    this.sellerlist = res.data;
                });
            },
            /* 后台查询customer.list返回给order */
            getCustomerList() {
                this.$http.patch("/customer/list").then(res => {
                    this.customerlist = res.data;
                    console.debug(this.customerlist);
                });
            },
            /*时期格式化*/
            dateChangebeginTime(val) {
                this.searchForm.beginTime = val;
            },

            dateChangeendTime(val) {
                this.searchForm.endTime = val;
            },
            dateChangesignTime(val) {
                this.order.signTime = val;
            },
            /* 当前页发生变化时,会触发这个函数 */
            handleCurrentChange(val) {
                this.currentPage = val;
                this.getOrders();
            },
            /* 获取订单列表 */
            getOrders() {
                /* 前台需要传给后台当前页和每页大小以及查询条件 */
                let para = {
                    /* 注意这些变量名必须和对应的query实体类中的属性名一致 */
                    currentPage: this.currentPage,
                    pageSize: this.pageSize,
                    beginTime: this.searchForm.beginTime,
                    endTime: this.searchForm.endTime,
                    sn: this.searchForm.sn
                };
                this.listLoading = true;
                this.$http.patch("/order/selectPageByQuery", para).then(res => {
                    this.orders = res.data.result;
                    this.total = res.data.total;
                    this.listLoading = false;
                });
            },
            /*删除*/
            handleDel(i, r) {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.$http.delete("/order/delete/" + r.id).then(res => {
                        if (res.data.success) {
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                            this.getOrders();
                        } else {
                            this.$message.error(res.data.msg);
                        }
                    })
                }).catch(() => {
                });
            },
            /*编辑*/
            handleEdit(i, r) {
                this.order = {};
                this.title = "修改订单";
                this.formVisible = true;
                this.order = Object.assign({}, r);
            },
            /* 新增订单 */
            handleAdd() {
                this.order = {};
                this.formVisible = true;
                this.title = "新增订单";
                /* sn自动生成，通过随机数赋值 */
                this.order.sn = Math.round(Math.random() * 1000000);
            },
            /* 提交 */
            submit() {
                this.$refs.addForm.validate((valid) => {
                    if (valid) {
                        this.addLoading = true;
                        /* 获取form表单中的数据 */
                        let param = Object.assign({}, this.order);
                        /* 通过表单中是否有id来判断是新增还是修改 */
                        if (param.id) {
                            /* 有id就代表是修改 */
                            this.$http.post("/order/update", param).then(res => {
                                if (res.data.success) {
                                    this.addLoading = false;
                                    this.$message({
                                        message: '提交成功',
                                        type: 'success'
                                    });
                                    this.formVisible = false;
                                    this.$refs['addForm'].resetFields();
                                    this.getOrders();
                                } else {
                                    this.$notify.error({
                                        title: '错误',
                                        message: res.data.msg
                                    });
                                }
                            });
                        } else {
                            /* 没有id就代表是新增,因为id设置了主键自增 */
                            this.$http.put("/order/save", param).then(res => {
                                if (res.data.success) {
                                    this.addLoading = false;
                                    this.$message({
                                        message: '提交成功',
                                        type: 'success'
                                    });
                                    this.formVisible = false;
                                    /* 重置form表单 */
                                    this.$refs['addForm'].resetFields();
                                    this.getOrders();
                                } else {
                                    this.$notify.error({
                                        title: '错误',
                                        message: res.data.msg
                                    });
                                }
                            });
                        }
                    }
                });
            },
            /* 获取行的变化 */
            selsChange: function (sels) {
                this.sels = sels;
            },
            /* 批量删除 */
            batchRemove() {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.$http.patch("/order/batchDelete", this.sels).then(res => {
                        if (res.data.success) {
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                            this.getOrders();
                        } else {
                            this.$message.error(res.data.msg);
                        }
                    })
                }).catch(() => {
                });
            }
        },
        mounted() {
            this.getOrders();
            this.getSellerList();
            this.getCustomerList();
        }
    }
</script>
<style scoped>
</style>