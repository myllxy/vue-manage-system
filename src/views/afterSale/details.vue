<template>
    <section>
        <!-- 工具条 -->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="searchForm">
                <el-form-item>
                    <el-input v-model="searchForm.staff" placeholder="保修人员"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="getDetailss">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!-- 列表 -->
        <el-table :data="detailss" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
                  style="width: 100%;">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column type="index" width="100" label="维修单号">
            </el-table-column>
            <el-table-column prop="staff" label="保修人员" width="200" sortable>
            </el-table-column>
            <el-table-column prop="timen" label="保修时间" width="200" sortable>
            </el-table-column>
            <el-table-column prop="contents" label="保修内容" width="200" sortable>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="200" sortable>
                <template scope="scope">
                <span v-if="detailss[scope.$index].status==1" style="color: #11b95c">已解决</span>
                <span v-else="detailss[scope.$index].status==0" style="color: red">未解决</span>
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
        <el-dialog title="明细管理" :visible.sync="formVisible">
            <el-form :model="form" label-width="80px" :rules="addFormRules" ref="addForm">
                <el-form-item label="保修人员" prop="staff">
                    <el-input v-model="form.staff" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="保修时间" prop="timen">
                        <el-date-picker
                                v-model="form.timen"
                                type="date"
                                @change="billMins"
                                placeholder="选择日期时间"
                                align="right"
                                value-format="yyyy-MM-dd"
                                :picker-options="pickerOptions">
                        </el-date-picker>
                </el-form-item>
                <el-form-item label="保修内容" prop="contents">
                    <el-input v-model="form.contents" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="保修状态" prop="status">
                    <el-select v-model="form.status" placeholder="请选择">
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
                // 保修状态
                options: [{
                    value: '1',
                    label: '未解决'
                }, {
                    value: '0',
                    label: '已解决'
                },],
                // 保修时间
                pickerOptions: {
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
                    staff: "",
                    status:'',
                    timen:'',
                },
                /* 注意并不是全部而是当前页的部门数 */
                detailss: [],
                total: 0,
                /* 部门数少,因此不需要pageSize下拉框 */
                pageSize: 20,
                currentPage: 1,
                listLoading: false,
                /* 列表选中列 */
                sels: [],
                title: "",
                form: {
                    staff: ""
                },
                /* 弹出框是否显示 */
                formVisible: false,
                editFormVisible: false,//编辑界面是否显示
                editLoading: false,
                editFormRules: {
                    name: [
                        {required: true, message: '请输入姓名', trigger: 'blur'}
                    ]
                },
                addLoading: false,
                addFormRules: {
                    name: [
                        {required: true, message: '请输入姓名', trigger: 'blur'}
                    ]
                },
                /* 新增界面数据 */
                addForm: {
                    staff: '',
                    timen: '',
                    contents: '',
                    status: '',
                }

            }
        },
        methods: {

            // 保修时间
            billMins(val) {
                this.form.timen = val;
            },
            /* 当前页发生变化时,会触发这个函数 */
            handleCurrentChange(val) {
                console.debug(val);
                this.currentPage = val;
                this.getDetailss();
            },
            /* 获取部门列表 */
            getDetailss() {
                /* 前台需要传给后台当前页和每页大小以及查询条件 */
                let para = {
                    /* 注意这些变量名必须和对应的query实体类中的属性名一致 */
                    currentPage: this.currentPage,
                    pageSize: this.pageSize,
                    staff: this.searchForm.staff

                };
                this.listLoading = true;
                this.$http.patch("/details/selectPageByQuery", para).then(res => {
                    /* 这种东西我们一般将res打印出来找到我们需要的属性来填充就好了 */
                    console.debug(res);
                    this.detailss = res.data.result;
                    this.total = res.data.total;
                    this.listLoading = false;
                });
            },
            handleDel(i, r) {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.$http.delete("/details/delete" + r.id).then(res => {
                        if (res.data.success) {
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                            this.getDetailss();
                        } else {
                            this.$message.error(res.data.msg);
                        }
                    })
                }).catch(() => {
                });
            },
            handleEdit(i, r) {
                this.title = "修改部门";
                this.formVisible = true;
                /* 回显数据 */
                this.form = Object.assign({}, r);
            },
            handleAdd() {
                this.form=[];
                this.formVisible = true;
                this.title = "新增部门";
            },
            /* 新增与提交 */
            submit() {
                this.$refs.addForm.validate((valid) => {
                    if (valid) {
                        this.addLoading = true;
                        /* 获取form表单中的数据 */
                        let param = Object.assign({}, this.form);
                        /* 通过表单中是否有id来判断是新增还是修改 */
                        if (param.id) {
                            /* 有id就代表是修改 */
                            this.$http.post("/details/update", param).then(res => {
                                if (res.data.success) {
                                    this.addLoading = false;
                                    this.$message({
                                        message: '提交成功',
                                        type: 'success'
                                    });
                                    this.formVisible = false;
                                    this.$refs['addForm'].resetFields();
                                    this.getDetailss();
                                } else {
                                    this.$notify.error({
                                        title: '错误',
                                        message: res.data.msg
                                    });
                                }
                            });
                        } else {
                            /* 没有id就代表是新增,因为id设置了主键自增 */
                            this.$http.put("/details/save", param).then(res => {
                                if (res.data.success) {
                                    this.addLoading = false;
                                    this.$message({
                                        message: '提交成功',
                                        type: 'success'
                                    });
                                    this.formVisible = false;
                                    /* 重置form表单 */
                                    this.$refs['addForm'].resetFields();
                                    this.getDetailss();
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
            selsChange: function (sels) {
                this.sels = sels;
            },
            batchRemove() {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.$http.patch("/details/batchDelete", this.sels).then(res => {
                        if (res.data.success) {
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                            this.getDetailss();
                        } else {
                            this.$message.error(res.data.msg);
                        }
                    })
                }).catch(() => {
                });
            }
        },
        mounted() {
            this.getDetailss();
        }
    }

</script>

<style scoped>

</style>