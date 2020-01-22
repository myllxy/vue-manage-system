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
                    <el-button type="primary" v-on:click="getContractPayDetails">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!-- 列表 -->
        <el-table :data="contractPayDetails" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
                  style="width: 100%;">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column type="index" label="id" sortable>
            </el-table-column>
            <el-table-column prop="contract.sn" label="所属合同">
            </el-table-column>
            <el-table-column prop="payTime"  label="付款时间">
            </el-table-column>
            <el-table-column prop="money" label="付款金额">
            </el-table-column>
            <el-table-column prop="scale" label="所占比例">
            </el-table-column>
            <!--:formatter="formatIsPayment"-->
            <el-table-column prop="isPayment"  label="是否付款">
                <template scope="scope">
                    <span v-if="contractPayDetails[scope.$index].isPayment == 1"  style="color: #11b95c">已支付</span>
                    <span v-else="contractPayDetails[scope.$index].isPayment == 0"  style="color:#ff4d51">未支付</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="273">
                <template scope="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 工具条 -->
        <el-col :span="24" class="toolbar">
            <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
            <!-- 因为部门的数量不多,所以我们直接固定pageSize就好了 -->
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange"
                           :page-size="pageSize"
                           :current-page="currentPage"
                           :total="total" style="float:right;">
            </el-pagination>
        </el-col>

        <!-- 新增与修改界面 -->
        <el-dialog :title="title" :visible.sync="formVisible">
            <el-form :model="contractPayDetail" label-width="80px" :rules="addFormRules" ref="addForm">
                <el-form-item label="所属合同" prop="contract">
                    <el-select value-key="id" v-model="contractPayDetail.contract"  @blur="getSum()" placeholder="请选择合同">
                        <el-option v-for="item in contractPayDetaillist"
                                   :key="item.id"
                                   :value="item"
                                   :label="item.sn"></el-option>
                    </el-select>
                </el-form-item>
                 <el-form-item label="付款时间">
                     <el-date-picker
                             v-model="contractPayDetail.payTime"
                             @change="dateChangepayTime"
                             type="date"
                             value-format="yyyy-MM-dd"
                             placeholder="选择日期">
                     </el-date-picker>
                 </el-form-item>
                <el-form-item label="付款金额" prop="money">
                    <el-input v-model.number="contractPayDetail.money" @input.native="getScale()" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="所占比例" prop="scale">
                    <el-input v-model="contractPayDetail.scale" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="是否付款" prop="isPayment">
                    <el-select v-model="contractPayDetail.isPayment" placeholder="请选择">
                        <el-option
                                v-for="item in options"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value">
                        </el-option>
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
                    beginTime: "",
                    endTime: "",
                },
                /*查询列表*/
                contractPayDetails: [],
                /*所属合同集合*/
                contractPayDetaillist: [],
                customerlist:[],
                /*分页*/
                total: 0,
                pageSize: 10,
                currentPage: 1,
                listLoading: false,
                /* 列表选中列 */
                sels: [],
                title: "",
                /*新增和修改*/
                contractPayDetail: {
                    contract: "",
                    id: "",
                    payTime: "",
                    money: "",
                    scale: "",
                    isPayment:"",
                },
                /* 弹出框是否显示 */
                formVisible: false,
                addLoading: false,
                /*验证规则*/
                addFormRules: {
                    money: [
                        {type: 'number',required: true, message: '付款金额', trigger: 'blur'}
                    ],
                   /* scale: [
                        {required: true, message: '所占比例', trigger: 'blur'}
                    ],*/
                   /* isPayment: [
                          {required: true, message: '是否付款', trigger: 'blur'}
                      ]*/
                },
                myContractId:"",
                mySum:"",
                //是否付款下拉框
                options: [{
                    value: '1',
                    label: '已支付'
                }, {
                    value: '0',
                    label: '未支付'
                }]

            }
        },
        methods: {
            //获取总金额
            getSum(){
                let mysum = this.contractPayDetail.contract.sum;
                return mysum;
            },
            /*付款比例自动产生*/
            getScale(){
                let c = this.getSum();
                let myScale = (this.contractPayDetail.money/c).toFixed(1);

               this.contractPayDetail.scale = myScale;
            },
            /*是否付款有数字转为汉字*/
            /*formatIsPayment(v){
                if(v.isPayment == 0){return "未支付"}
                else {return "已支付"}
            },*/
            getContractList(){
                this.$http.patch("/contract/list").then(res => {
                    this.contractPayDetaillist = res.data;
                });

            },
            /*时期格式化*/
            dateChangebeginTime(val) {
                this.searchForm.beginTime = val;
            },

            dateChangeendTime(val) {
                this.searchForm.endTime = val;
            },
            dateChangepayTime(val){
                this.contractPayDetail.payTime = val;
            },
            /* 当前页发生变化时,会触发这个函数 */
            handleCurrentChange(val) {
                this.currentPage = val;
                this.getContractPayDetails();
            },
            /* 获取付款详细列表 */
            getContractPayDetails() {
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
                this.$http.patch("/contractPayDetail/selectPageByQuery", para).then(res => {
                    /* 这种东西我们一般将res打印出来找到我们需要的属性来填充就好了 */
                /*    console.debug(res);*/
                    this.contractPayDetails = res.data.result;
                    this.total = res.data.total;
                    this.listLoading = false;
                });
            },
            /*删除*/
            handleDel(i, r) {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.$http.delete("/contractPayDetail/delete/" + r.id).then(res => {
                        if (res.data.success) {
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                            this.getContractPayDetails();
                        } else {
                            this.$message.error(res.data.msg);
                        }
                    })
                }).catch(() => {
                });
            },
            /*编辑*/
            handleEdit(i, r) {
                this.contractPayDetail ={};
                console.debug(r);
               /* if(r.isPayment == 0){return "未支付"}
                else {return "已支付"}*/
                this.getContractList();
                this.title = "修改订单";
                this.formVisible = true;
                /* 回显数据 */
                this.contractPayDetail = Object.assign({}, r);
                if(this.contractPayDetail.isPayment == 0){return this.contractPayDetail.isPayment = "未支付"}
                else {return this.contractPayDetail.isPayment = "已支付"}

            },
            /*添加*/
            handleAdd() {
                this.contractPayDetail ={};
                this.getContractList();
                this.formVisible = true;
                this.title = "新增付款明细";
            },
            /* 新增与提交 */
            submit() {
                this.$refs.addForm.validate((valid) => {
                    if (valid) {
                        this.addLoading = true;
                        /* 获取form表单中的数据 */
                        let param = Object.assign({}, this.contractPayDetail);
                        /* 通过表单中是否有id来判断是新增还是修改 */
                        if (param.id) {
                            /* 有id就代表是修改 */
                            this.$http.post("/contractPayDetail/update", param).then(res => {
                                if (res.data.success) {
                                    this.addLoading = false;
                                    this.$message({
                                        message: '提交成功',
                                        type: 'success'
                                    });
                                    this.formVisible = false;
                                    this.$refs['addForm'].resetFields();
                                    this.getContractPayDetails();
                                } else {
                                    this.$notify.error({
                                        title: '错误',
                                        message: res.data.msg
                                    });
                                }
                            });
                        } else {
                            /* 没有id就代表是新增,因为id设置了主键自增 */
                            this.$http.put("/contractPayDetail/save", param).then(res => {
                                if (res.data.success) {
                                    this.addLoading = false;
                                    this.$message({
                                        message: '提交成功',
                                        type: 'success'
                                    });
                                    this.formVisible = false;
                                    /* 重置form表单 */
                                    this.$refs['addForm'].resetFields();
                                    this.getContractPayDetails();
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
            /*列改变*/
            selsChange: function (sels) {
                this.sels = sels;
            },
            /*批量删除*/
            batchRemove() {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.$http.patch("/contractPayDetail/batchDelete", this.sels).then(res => {
                        if (res.data.success) {
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                            this.getContractPayDetails();
                        } else {
                            this.$message.error(res.data.msg);
                        }
                    })
                }).catch(() => {
                });
            }
        },
        mounted() {
            this.getContractPayDetails();
        }
    }

</script>

<style scoped>

</style>