<template>
    <section>
        <!--头部高级查询工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="searchForm">
                <el-form-item>
                    <el-input v-model="searchForm.username" placeholder="账号"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="getEmployee">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--员工数据列表-->
        <el-table :data="employees" highlight-current-row v-loading="listLoading" @selection-change="selsChange">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column type="index" width="100">
            </el-table-column>
            <el-table-column prop="username" label="账号" width="170">
            </el-table-column>
            <el-table-column prop="sn" label="编号" width="170">
            </el-table-column>
            <el-table-column prop="realName" label="姓名" width="170">
            </el-table-column>
            <el-table-column prop="tel" label="电话" width="170">
            </el-table-column>
            <el-table-column prop="email" label="邮箱" width="170">
            </el-table-column>
            <el-table-column prop="department.name" label="部门" width="170">
            </el-table-column>
            <el-table-column label="角色" prop="roles" :formatter="roleFormatter" width="170">
            </el-table-column>
            <el-table-column prop="inputTime" label="录入时间" width="170">
            </el-table-column>
            <el-table-column prop="state" label="状态" width="170" fixed="right">
                <template scope="scope">
                    <span v-if="employees[scope.$index].state === -1" style="color: red;font-weight:bold">离职</span>
                    <span v-else="employees[scope.$index].state === 0" style="color: green;font-weight:bold">正常</span>
                </template>
            </el-table-column>
            <el-table-column label="操作" width="170" fixed="right">
                <template slot-scope="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
        <!--底部工具条-->
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
        <!--添加（编辑）界面-->
        <el-dialog :title="title" :visible.sync="formVisible">
            <!--rules：主要用来做校验的（定义校验规则的）-->
            <!--ref="addForm"： 简单理解就是id=addForm-->
            <el-form :model="form" label-width="80px" :rules="addFormRules" ref="addForm">
                <el-form-item label="账号" prop="username">
                    <el-input v-model="form.username" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="编号" prop="sn">
                    <el-input v-model="form.sn" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="姓名" prop="realName">
                    <el-input v-model="form.realName" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="电话" prop="tel">
                    <el-input v-model="form.tel" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="form.email" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="所属部门" prop="department">
                    <el-select value-key="sn" v-model="form.department" placeholder="请选择部门" filterable>
                        <el-option v-for="item in employeeDepartment"
                                   :key="item.sn"
                                   :value="item"
                                   :label="item.name"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="角色" prop="roles">
                    <el-select value-key="sn" v-model="form.roles" placeholder="请选择角色" multiple filterable>
                        <el-option v-for="item in employeeRoles"
                                   :key="item.sn"
                                   :value="item"
                                   :label="item.name"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="状态" prop="state" label-position="left" label-width="80px">
                    <el-radio v-model="form.state" :label="0">正常</el-radio>
                    <el-radio v-model="form.state" :label="-1">离职</el-radio>
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
                /* 员工所属部门 */
                employeeDepartment: [],
                /* 员工对应角色 */
                employeeRoles: [],
                //员工数据列表
                employees: [],
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
                    username: "",
                },
                //弹出框对应的标题
                title: "",
                //弹出框form表单中对应的数据
                form: {
                    id: "",
                    username: "",
                    realName: "",
                    tel: "",
                    email: "",
                    state: "",
                    roles: ""
                },
                //弹出框是否显示  false代表不显示
                formVisible: false,
                //添加是否显示加载框
                addLoading: false,
                //校验规则
                addFormRules: {
                    username: [
                        {required: true, message: '请输入用户名', trigger: 'blur'}
                    ],
                    realName: [
                        {required: true, message: '请输入姓名', trigger: 'blur'}
                    ]
                }

            }
        },
        methods: {
            /* 获取员工部门下拉框值 */
            getEmployeeDepartment() {
                this.$http.post("/department/getDepartment").then(res => {
                    this.employeeDepartment = res.data;
                });
            },
            getEmployeeRoles() {
                this.$http.get("/role/getRoles").then(res => {
                    this.employeeRoles = res.data;
                });
            },
            roleFormatter(row) {
                let roles = row.roles;
                let myRole = [];
                for (let role of roles) {
                    myRole.push(role.name);
                }
                return myRole.join(',');
            },
            getEmployee() {
                let param = {
                    currentPage: this.currentPage,
                    pageSize: this.pageSize,
                    username: this.searchForm.username
                };
                this.listLoading = true;
                this.$http.patch("/employee/selectPageByQuery", param).then(res => {
                    this.employees = res.data.result;
                    this.total = res.data.total;
                    this.listLoading = false;
                });
            },
            handleCurrentChange(v) {
                this.currentPage = v;
                this.getEmployee();
                this.listLoading = true;
            },
            handleSizeChange(v) {
                this.currentPage = 1;
                this.pageSize = v;
                this.getEmployee();
                this.listLoading = true;
            },
            handleAdd() {
                this.form = {};
                this.formVisible = true;
                this.title = "新增员工";
            },
            handleEdit(i, r) {
                this.form = {};
                this.title = "修改员工";
                this.formVisible = true;
                this.form = Object.assign({}, r);
            },
            submit() {
                this.$refs.addForm.validate((valid) => {
                    if (valid) {
                        this.addLoading = true;
                        let param = Object.assign({}, this.form);
                        if (param.id) {
                            this.$http.post("/employee/update", param).then(res => {
                                if (res.data.success) {
                                    this.addLoading = false;
                                    this.$message({
                                        message: '修改成功',
                                        type: 'success'
                                    });
                                    this.formVisible = false;
                                    this.$refs['addForm'].resetFields();
                                    this.getEmployee();
                                } else {
                                    this.$notify.error({
                                        title: '错误',
                                        message: res.data.msg
                                    });
                                }
                            });
                        } else {
                            this.$http.put("/employee/save", param).then(res => {
                                if (res.data.success) {
                                    this.addLoading = false;
                                    this.$message({
                                        message: '添加成功',
                                        type: 'success'
                                    });
                                    this.formVisible = false;
                                    this.$refs['addForm'].resetFields();
                                    this.getEmployee();
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
            handleDel(i, r) {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.$http.delete("/employee/delete/" + r.id).then(res => {
                        if (res.data.success) {
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                            this.getEmployee();
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
            selsChange(v) {
                this.sels = v;
            },
            batchRemove() {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.$http.patch("/employee/batchDelete", this.sels).then(res => {
                        if (res.data.success) {
                            //NProgress.done();
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                            this.getEmployee();
                        } else {
                            this.$message.error(res.data.msg);
                        }
                    })
                }).catch(() => {
                });
            }
        },
        mounted() {
            this.getEmployee();
            this.getEmployeeDepartment();
            this.getEmployeeRoles();
        }
    }

</script>

<style scoped>

</style>