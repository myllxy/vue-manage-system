<template>
    <div class="app-container">
        <!-- 工具条 -->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="searchForm">
                <el-form-item>
                    <el-date-picker
                            v-model="searchForm.date_range_start"
                            type="date"
                            value-format="yyyy-MM-dd"
                            @change="getTimeStart"
                            placeholder="开始日期">
                    </el-date-picker>
                    <el-date-picker
                            v-model="searchForm.date_range_end"
                            type="date"
                            value-format="yyyy-MM-dd"
                            @change="getTimeEnd"
                            placeholder="结束日期">
                    </el-date-picker>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="getCustomersTraceHistory">查询</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!-- 列表 -->
        <el-table :data="customerstracehistory" highlight-current-row v-loading="listLoading"
                  @selection-change="selsChange"
                  style="width: 100%;">
            <el-table-column fixed type="selection" width="55">
            </el-table-column>
            <el-table-column type="index" width="100" label="id">
            </el-table-column>
            <el-table-column prop="traceTime" label="跟进时间" width="170">
            </el-table-column>
            <!-- :formatter将0\1分别转换成女和男显示 -->
            <el-table-column prop="customer.name" label="跟进客户" width="170">
            </el-table-column>
            <el-table-column prop="title" label="跟进主题" width="170">
            </el-table-column>
            <el-table-column prop="traceType.name" label="跟进方式" width="170">
            </el-table-column>
            <el-table-column prop="traceResult" label="跟进效果" :formatter="traceResultFormatter" width="170">
            </el-table-column>
            <el-table-column prop="traceUser.realName" label="跟进人" width="170">
            </el-table-column>
            <el-table-column prop="remark" label="备注" width="170">
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="220">
                <template slot-scope="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 工具条 -->
        <el-col :span="24" class="toolbar">
            <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange"
                           :page-size="pageSize"
                           :current-page="currentPage"
                           :total="total" style="float:right;">
            </el-pagination>
        </el-col>

        <!-- 修改界面 -->
        <el-dialog :title="title" :visible.sync="formVisible">
            <el-form :model="form" label-width="80px" :rules="formRules" ref="form">
                <el-form-item label="跟进时间" prop="traceTime">
                    <el-date-picker v-model="form.traceTime" align="right" type="date"
                                    @change="getTime"
                                    value-format="yyyy-MM-dd"
                                    placeholder="请输入跟进时间">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="跟进主题" prop="title">
                    <el-input v-model="form.title" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="跟进效果" prop="traceResult">
                    <el-radio v-model="form.traceResult" :label="1">良</el-radio>
                    <el-radio v-model="form.traceResult" :label="0">中</el-radio>
                    <el-radio v-model="form.traceResult" :label="-1">差</el-radio>
                </el-form-item>
                <el-form-item label="跟进方式" prop="traceType">
                    <el-select value-key="requence" v-model="form.traceType" placeholder="请选择跟进方式">
                        <el-option v-for="item in traceTypeDic"
                                   :key="item.requence"
                                   :value="item"
                                   :label="item.name"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="跟进人" prop="traceUser">
                    <el-select value-key="sn" v-model="form.traceUser" placeholder="请选择营销人员">
                        <el-option v-for="item in traceUser_"
                                   :key="item.sn"
                                   :value="item"
                                   :label="item.username"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="备注" prop="remark">
                    <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="请输入内容">
                    </el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="formVisible = false">取消</el-button>
                <el-button type="primary" @click.native="submitConsumerTraceHistory" :loading="addLoading">提交
                </el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                /* 查询form */
                searchForm: {
                    date_range_start: '',
                    date_range_end: ''
                },
                /* 注意并不是全部而是当前页的客户数 */
                customerstracehistory: [],
                /* 跟进方式数据字典 */
                traceTypeDic: [],
                /* 跟进人 */
                traceUser_: [],
                total: 0,
                /* 客户数少,因此不需要pageSize下拉框 */
                pageSize: 10,
                currentPage: 1,
                listLoading: false,
                /* 列表选中列 */
                sels: [],
                title: "",
                form: {
                    customer: '',
                    id: '',
                    remark: '',
                    title: '',
                    traceResult: '',
                    traceTime: '',
                    traceType: '',
                    traceUser: ''
                },
                /* 弹出框是否显示 */
                formVisible: false,
                editLoading: false,
                addLoading: false,
                formRules: {
                    name: [
                        {required: true, message: '请输入姓名', trigger: 'blur'}
                    ]
                },
            }
        },
        methods: {
            /* 获取输入的时间 */
            getTimeStart(v) {
                this.searchForm.date_range_start = v;
            },
            getTimeEnd(v) {
                this.searchForm.date_range_end = v;
            },
            getTime(v) {
                this.form.traceTime = v;
            },
            /* 跟进效果格式化 */
            traceResultFormatter(row) {
                let result = row.traceResult;
                if (result === -1) {
                    return '差';
                } else if (result === 0) {
                    return '中';
                } else if (result === 1) {
                    return '良';
                }
            },
            /* 当前页发生变化时,会触发这个函数 */
            handleCurrentChange(val) {
                this.currentPage = val;
                this.getCustomersTraceHistory();
            },
            /* 获取客户跟进历史列表 */
            getCustomersTraceHistory() {
                /* 前台需要传给后台当前页和每页大小以及查询条件 */
                let param = {
                    /* 注意这些变量名必须和对应的query实体类中的属性名一致 */
                    currentPage: this.currentPage,
                    pageSize: this.pageSize,
                    date_range_start: this.searchForm.date_range_start,
                    date_range_end: this.searchForm.date_range_end
                };
                this.listLoading = true;
                this.$http.patch("/customertracehistory/selectPageByQuery", param).then(res => {
                    /* 这种东西我们一般将res打印出来找到我们需要的属性来填充就好了 */
                    this.customerstracehistory = res.data.result;
                    this.total = res.data.total;
                    this.listLoading = false;
                });
            },
            getTraceType() {
                /* 在这里可以将传入的id写死为2 */
                /* 因为查的是数据字典 */
                this.$http.get("/systemDictionary/getDic/2").then(res => {
                    this.traceTypeDic = res.data;
                });
            },
            /* 后台查询营销人员返回给traceUser_ */
            getTraceUser() {
                this.$http.post("/employee/getEmployee").then(res => {
                    this.traceUser_ = res.data;
                });
            },
            handleDel(i, r) {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.$http.delete("/customertracehistory/delete/" + r.id).then(res => {
                        if (res.data.success) {
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                            this.getCustomersTraceHistory();
                        } else {
                            this.$message.error(res.data.msg);
                        }
                    })
                }).catch(() => {
                });
            },
            handleEdit(i, r) {
                this.title = "修改跟进客户";
                this.formVisible = true;
                /* 回显数据 */
                this.form = Object.assign({}, r);
            },
            /* 修改提交 */
            submitConsumerTraceHistory() {
                this.$refs.form.validate((valid) => {
                    if (valid) {
                        this.addLoading = true;
                        /* 获取form表单中的数据 */
                        let param = Object.assign({}, this.form);
                        this.$http.post("/customertracehistory/update", param).then(res => {
                            if (res.data.success) {
                                this.addLoading = false;
                                this.$message({
                                    message: '提交成功',
                                    type: 'success'
                                });
                                this.formVisible = false;
                                this.$refs['form'].resetFields();
                                this.getCustomersTraceHistory();
                            } else {
                                this.$notify.error({
                                    title: '错误',
                                    message: res.data.msg
                                });
                            }
                        });
                    }
                });
            },
            selsChange: function (sels) {
                this.sels = sels;
            },
            batchRemove() {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.$http.patch("/customertracehistory/batchDelete", this.sels).then(res => {
                        if (res.data.success) {
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                            this.getCustomersTraceHistory();
                        } else {
                            this.$message.error(res.data.msg);
                        }
                    })
                }).catch(() => {
                });
            }
        },
        mounted() {
            this.getCustomersTraceHistory();
            this.getTraceType();
            this.getTraceUser();
        }
    }

</script>
<style scoped>
</style>