<template>
    <section>
        <!--头部高级查询工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="searchForm">
                <el-form-item>
                    <el-input v-model="searchForm.name" placeholder="部门名称"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="getDepartments">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--员工数据列表-->
        <el-table :data="departments" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
                  style="width: 100%;">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column type="index" width="100" label="id">
            </el-table-column>
            <el-table-column prop="name" label="部门名称" width="170">
            </el-table-column>
            <el-table-column prop="sn" label="部门编码" width="170">
            </el-table-column>
            <el-table-column prop="manager.username" label="部门经理" width="170">
            </el-table-column>
            <el-table-column prop="parent.name" label="上级部门" width="170">
                <template slot-scope="scope">
                    <span v-if="scope.row.parent !== null">{{ scope.row.parent.name }}</span>
                    <span v-if="scope.row.parent === null">无上级部门</span>
                </template>
            </el-table-column>
            <el-table-column prop="childrens" :formatter="departmentFormatter" label="子部门" width="170">
            </el-table-column>
            <el-table-column prop="tenant.companyName" label="租户" width="170">
            </el-table-column>
            <el-table-column fixed="right" prop="state" label="状态" width="170">
                <template scope="scope">
                    <span v-if="departments[scope.$index].state === -1" style="color: red;font-weight:bold">停用</span>
                    <span v-else="departments[scope.$index].state === 0" style="color: green;font-weight:bold">正常</span>
                </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="170">
                <template slot-scope="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!-- 底部工具条 -->
        <el-col :span="24" class="toolbar">
            <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
            <el-pagination
                    layout="total, sizes, prev, pager, next, jumper"
                    @current-change="handleCurrentChange"
                    @size-change="handleSizeChange"
                    :current-page="currentPage"
                    :page-sizes="pageSizes"
                    :page-size="pageSize"
                    :total="total"
                    style="float:right;">
            </el-pagination>
        </el-col>
        <el-dialog :title="title" :visible.sync="formVisible">
            <el-form :model="form" label-width="80px" :rules="addFormRules" ref="addForm">
                <el-form-item label="部门名称" prop="name">
                    <el-input v-model="form.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="部门编码" prop="sn">
                    <el-input v-model="form.sn" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="是否启用" prop="state" label-position="left" label-width="80px">
                    <el-radio v-model="form.state" :label="0">启用</el-radio>
                    <el-radio v-model="form.state" :label="-1">停用</el-radio>
                </el-form-item>
                <el-form-item label="部门经理" prop="manager.username">
                    <el-select value-key="sn" v-model="form.manager" placeholder="请选择部门经理">
                        <el-option v-for="item in departmentManager"
                                   :key="item.sn"
                                   :value="item"
                                   :label="item.username"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="上级部门" prop="parent.name">
                    <el-select value-key="sn" v-model="form.parent" placeholder="请选择上级部门">
                        <el-option v-for="item in superiorDepartment"
                                   :key="item.sn"
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
                /* 部门经理 */
                departmentManager: [],
                /* 上级部门名称 */
                superiorDepartment: [],
                //员工数据列表
                departments: [],
                //加载框
                listLoading: false,
                //列表选中行
                sels: [],
                //设置当前页
                currentPage: 1,
                //每页条数
                pageSize: 10,
                //选择每页条数
                pageSizes: [5, 10, 15, 20],
                //总条数
                total: 0,
                //高级查询form
                searchForm: {
                    name: ""
                },
                //弹出框对应的标题
                title: "",
                //弹出框form表单中对应的数据
                form: {
                    sn: "",
                    name: "",
                    manager: "",
                    parent: "",
                    state: ""
                },
                //弹出框是否显示  false代表不显示
                formVisible: false,
                //添加是否显示加载框
                addLoading: false,
                //校验规则
                addFormRules: {
                    name: [
                        {required: true, message: '请输入姓名', trigger: 'blur'}
                    ],
                    sn: [
                        {required: true, message: '请输入编码', trigger: 'blur'}
                    ],
                }
            }
        },
        methods: {
            /* 获取上级部门名称下拉框数据 */
            getSuperiorDepartment() {
                this.$http.post("/department/getDepartment").then(res => {
                    this.superiorDepartment = res.data;
                });
            },
            /* 获取部门经理下拉框数据 */
            getDepartmentManager() {
                this.$http.post("/employee/getEmployee").then(res => {
                    this.departmentManager = res.data;
                });
            },
            /* 格式化子部门 */
            departmentFormatter(row) {
                let childrens = row.childrens;
                if (childrens.length === 0) {
                    return '无子部门';
                }
                let myChildrens = [];
                for (let children of childrens) {
                    myChildrens.push(children.name);
                }
                return myChildrens.join(",");
            },
            //获取用户列表
            getDepartments() {
                let param = {
                    currentPage: this.currentPage,
                    pageSize: this.pageSize,
                    name: this.searchForm.name
                };
                //开启加载框
                this.listLoading = true;
                this.$http.patch("/department/selectPageByQuery", param).then(res => {
                    this.departments = res.data.result;
                    this.total = res.data.total;
                    this.listLoading = false;
                });
            },
            //当前页改变的时候，触发事件
            handleCurrentChange(v) {
                //修改当前页
                this.currentPage = v;
                this.getDepartments();
                this.listLoading = true;
            },
            //每页条数改变的时候触发事件
            handleSizeChange(v) {
                this.currentPage = 1;
                this.pageSize = v;
                this.getDepartments();
                this.listLoading = true;
            },
            //添加对应的事件
            handleAdd() {
                this.form = {};
                this.formVisible = true;
                this.title = "新增员工";
            },
            //修改对应的事件
            handleEdit(i, r) {
                this.form = {};
                this.title = "修改员工";
                this.formVisible = true;
                //回显数据
                this.form = Object.assign({}, r);
            },
            //提交数据
            submit() {
                //验证form表单
                this.$refs.addForm.validate((valid) => {
                    if (valid) {
                        // this.addLoading = true;
                        let param = Object.assign({}, this.form);
                        if (param.id) {
                            //保存数据
                            this.$http.post("/department/update", param).then(res => {
                                //提交成功
                                if (res.data.success) {
                                    //停止添加按钮的加载框
                                    this.addLoading = false;
                                    this.$message({
                                        message: '修改成功',
                                        type: 'success'
                                    });
                                    //弹出框关闭
                                    this.formVisible = false;
                                    /*//重置form表单
                                    this.$refs['addForm'].resetFields();*/
                                    //加载列表
                                    this.getDepartments();
                                } else {
                                    this.$notify.error({
                                        title: '错误',
                                        message: res.data.msg
                                    });
                                }
                            });
                        } else {
                            //保存数据
                            this.$http.put("/department/save", param).then(res => {
                                //提交成功
                                if (res.data.success) {
                                    //停止添加按钮的加载框
                                    this.addLoading = false;
                                    this.$message({
                                        message: '添加成功',
                                        type: 'success'
                                    });
                                    //弹出框关闭
                                    this.formVisible = false;
                                    this.$refs['addForm'].resetFields();
                                    //加载列表
                                    this.getDepartments();
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
            //删除按钮对应的事件
            handleDel(i, r) {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.$http.delete("/department/delete/" + r.id).then(res => {
                        if (res.data.success) {
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                            this.getDepartments();
                        } else {
                            this.$notify.error({
                                title: '错误',
                                message: res.data.msg
                            });
                        }
                    })
                }).catch(() => {
                });
            },
            //获取复选框选择数据
            selsChange(v) {
                this.sels = v;
            },
            //批量删除
            batchRemove() {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.$http.patch("/department/batchDelete", this.sels).then(res => {
                        if (res.data.success) {
                            //NProgress.done();
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                            this.getDepartments();
                        } else {
                            this.$message.error(res.data.msg);
                        }
                    })
                }).catch(() => {
                });
            }
        },
        mounted() {
            this.getDepartments();
            this.getDepartmentManager();
            this.getSuperiorDepartment();
        }
    }

</script>

<style scoped>

</style>