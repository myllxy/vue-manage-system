<template>
    <section>
        <!-- 工具条 -->
        <el-col :span="24" class="toolbar" style="padding-bottom:0px;">
            <el-form :inline="true" :model="searchForm">
                <el-form-item>
                    <el-input v-model="searchForm.name" placeholder="保修员工"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-input v-model="searchForm.client" placeholder="保修客户"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="getBills">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!-- 列表 -->
        <el-table @row-click="billsRow" :data="bills" highlight-current-row v-loading="listLoading"
                  @selection-change="selsChange"
        >
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column type="index" width="200" label="保修单号">
            </el-table-column>
            <el-table-column prop="name" label="保修员" width="200" sortable>
            </el-table-column>
            <el-table-column prop="client" label="保修客户" width="200" sortable>
            </el-table-column>
            <el-table-column prop="mins" label="保修时间" width="200" sortable>
            </el-table-column>
            <el-table-column label="操作" width="273">
                <template scope="scope">
                    <el-button type="info" size="small" @click="detailslist=true">保单明细</el-button>
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
        <el-dialog title="编辑" :visible.sync="formVisible">
            <el-form :model="form" label-width="80px" :rules="addFormRules" ref="addForm">
                <!--el-table-column selection-->
                <!-- <el-form-item label="保修单号" prop="id" >
                     <el-input v-model="form.id" auto-complete="off"></el-input>
                 </el-form-item>-->
                <el-form-item label="保修员" prop="name">
                    <el-input v-model="form.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="保修客户" prop="client">
                    <el-input v-model="form.client" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="保修时间" prop="mins">
                    <el-date-picker
                            v-model="form.mins"
                            type="date"
                            @change="billMins"
                            placeholder="选择日期时间"
                            align="right"
                            value-format="yyyy-MM-dd"
                            :picker-options="pickerOptions">
                    </el-date-picker>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="formVisible = false">取消</el-button>
                <el-button type="primary" @click.native="submit" :loading="addLoading">提交</el-button>
            </div>
        </el-dialog>
        <!--  一对多 的 保修单对相应保修，明细 Table 保修 明细-->
        <el-dialog title="保修明细" :visible.sync="detailslist">
           <!-- <el-form :model="form111" label-width="80px" >-->
            <el-table :data="detai">
                <el-table-column type="index" label="保修单号" width="120"></el-table-column>
                <el-table-column property="timen" label="保修时间" width="120"></el-table-column>
                <el-table-column property="staff" label="保修员工"></el-table-column>
                <el-table-column property="contents" label="保修内容"></el-table-column>
                <el-table-column property="status" label="维修情况">
                    <template scope="scope">
                        <span v-if="detai[scope.$index].status==1" style="color: #11b95c">已解决</span>
                        <span v-else="detai[scope.$index].status==0" style="color: red">未解决</span>
                    </template>
                </el-table-column>
                <!--<el-table-column property="status" label="维修情况" >
                    <template scope="scope">
                        <el-select v-model="value"  placeholder="请选择">
                            <el-option
                                    v-for="item in options"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value">
                            </el-option>
                        </el-select>
                    </template>
                </el-table-column>-->
            </el-table>

        </el-dialog>
    </section>
</template>

<script>
    export default {
        data() {
            return {
                value:"",
                form111:{value:""},
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
                // 定义明细 属性 往里填充数据，
                detai: [],
                detailslist: false,
                /* 查询form */
                searchForm: {
                    name: "",
                    client:'',
                },
                /* 注意并不是全部而是当前页的部门数 */

                bills: [],
                total: 0,
                /* 部门数少,因此不需要pageSize下拉框 */
                pageSize: 20,
                currentPage: 1,
                listLoading: false,
                /* 列表选中列 */
                sels: [],
                title: "",
                form: {
                    id: "",
                    name: "",
                    client: "",
                    mins: "",
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
                    client: '',
                    name:'',
                    mins:"",
                }

            }
        },
        methods: {
            selectBD(x){
                this.form111.value=x;
                console.debug(this.form111.value)
            },

            // 保修时间
            billMins(val) {
                this.form.mins = val;
            },

            billsRow(row) {
                console.debug(row)
                let rd = row.details;
                // 取出数据赋值
                this.detai = rd;
            },
            billsDetalis(row) {
                this.title = "保单明细";
                this.formVisible = true;
                /* 回显数据 */
                this.form = Object.assign({}, r);
                console.debug(row)
            },
            /*  deatilscon(){
                 return details.contents;
              },*/
            /* 当前页发生变化时,会触发这个函数 */
            handleCurrentChange(val) {
                //console.debug(val);
                this.currentPage = val;
                this.getBills();
            },
            /* 获取部门列表 */
            getBills() {
                /* 前台需要传给后台当前页和每页大小以及查询条件 */
                let para = {
                    /* 注意这些变量名必须和对应的query实体类中的属性名一致 */
                    currentPage: this.currentPage,
                    pageSize: this.pageSize,
                    name: this.searchForm.name,
                    client: this.searchForm.client
                };
                this.listLoading = true;
                this.$http.patch("/bill/selectPageByQuery", para).then(res => {
                    /* 这种东西我们一般将res打印出来找到我们需要的属性来填充就好了 */
                    console.debug(res);
                    this.bills = res.data.result;
                    this.total = res.data.total;
                    this.listLoading = false;
                });
            },
            handleDel(i, r) {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.$http.delete("/bill/delete/" + r.id).then(res => {
                        if (res.data.success) {
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                            this.getBills();
                        } else {
                            this.$message.error(res.data.msg);
                        }
                    })
                }).catch(() => {
                });
            },
            handleEdit(i, r) {
                this.title = "修改保单";
                this.formVisible = true;
                /* 回显数据 */
                this.form = Object.assign({}, r);
            },
            handleAdd() {
                this.form = [];
                this.formVisible = true;
                this.title = "新增保单";

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
                            this.$http.post("/bill/update", param).then(res => {
                                if (res.data.success) {
                                    this.addLoading = false;
                                    this.$message({
                                        message: '提交成功',
                                        type: 'success'
                                    });
                                    this.formVisible = false;
                                    this.$refs['addForm'].resetFields();
                                    this.getBills();
                                } else {
                                    this.$notify.error({
                                        title: '错误',
                                        message: res.data.msg
                                    });
                                }
                            });
                        } else {
                            /* 没有id就代表是新增,因为id设置了主键自增 */
                            this.$http.put("/bill/save", param).then(res => {
                                if (res.data.success) {
                                    this.addLoading = false;
                                    this.$message({
                                        message: '提交成功',
                                        type: 'success'
                                    });
                                    this.formVisible = false;
                                    /* 重置form表单 */
                                    this.$refs['addForm'].resetFields();
                                    this.getBills();
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
                    this.$http.patch("/bill/ba" +
                        "tchDelete", this.sels).then(res => {
                        if (res.data.success) {
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                            this.getBills();
                        } else {
                            this.$message.error(res.data.msg);
                        }
                    })
                }).catch(() => {
                });
            }
        },
        mounted() {
            this.getBills();
        }
    }

</script>

<style scoped>

</style>