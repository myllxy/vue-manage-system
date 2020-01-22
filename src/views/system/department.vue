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
        <el-table :data="departments" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column type="index" width="70" label="编号">
            </el-table-column>
            <el-table-column prop="sn" label="部门编码"  >
            </el-table-column>
            <el-table-column prop="name" label="部门名称"  >
            </el-table-column>
            <el-table-column prop="manager.username" label="部门经理">
            </el-table-column>
            <el-table-column prop="parent.name" label="上级部门">
            </el-table-column>
            <el-table-column prop="tenant.companyName"  label="租户">
            </el-table-column>
            <el-table-column prop="state" label="状态"  sortable>
            </el-table-column>
            <el-table-column label="操作">
                <template scope="scope">
                    <el-button
                            size="mini"
                            type="text"
                            icon="el-icon-edit"
                            @click="handleEdit(scope.$index, scope.row)"
                    >编辑</el-button>
                    <!--<el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>-->
                    <el-button
                            size="mini"
                            type="text"
                            icon="el-icon-delete"
                            @click="handleDel(scope.$index,scope.row)"
                    >删除</el-button>
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
        <el-dialog :title="title" :visible.sync="formVisible" >
            <!--rules：主要用来做校验的（定义校验规则的）-->
            <!--ref="addForm"： 简单理解就是id=addForm-->
            <el-form :model="form" label-width="80px" :rules="addFormRules" ref="addForm">
                <el-form-item label="部门编码" prop="name">
                    <el-input v-model="form.sn" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="部门名称" prop="name">
                    <el-input v-model="form.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="部门经理" prop="name">
                    <!--<el-select v-model="form.manager" placeholder="请选择">
                    </el-select>-->
                    <el-input v-model="form.manager" auto-complete="off"></el-input>

                </el-form-item>
                <el-form-item label="上级部门" prop="name">
                    <!--<el-select v-model="form.parent" placeholder="请选择">
                    </el-select>-->
                    <el-input v-model="form.parent" auto-complete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="formVisible = false">取消</el-button>
                <el-button type="primary" @click.native="submit"   :loading="addLoading">提交</el-button>
            </div>
        </el-dialog>



    </section>
</template>

<script>
    export default {
        data() {
            return {
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
                searchForm:{
                    name:""
                },
                //弹出框对应的标题
                title:"",
                //弹出框form表单中对应的数据
                form:{
                    id:"",
                    sn:"",
                    name:"",
                    manager:"",
                    parent:"",



                },
                //弹出框是否显示  false代表不显示
                formVisible:false,
                //添加是否显示加载框
                addLoading: false,
                //校验规则
                addFormRules: {
                    name: [
                        { required: true, message: '请输入姓名', trigger: 'blur' }
                    ],
                    sn: [
                        { required: true, message: '请输入编码', trigger: 'blur' }
                    ],

                }

            }
        },
        methods: {
            //获取用户列表
            getDepartments() {
                let param = {
                    currentPage: this.currentPage,
                    pageSize: this.pageSize,
                    name: this.searchForm.name
                };
                //开启加载框
                this.listLoading = true;
                this.$http.patch("/department/selectPageByQuery",param).then(res=>{
                    console.debug(res);
                    this.departments = res.data.result;
                    this.total = res.data.total;
                    this.listLoading = false;
                });
            },
            //当前页改变的时候，触发事件
            handleCurrentChange(v){
                //修改当前页
                this.currentPage = v;
                this.getDepartments();
                this.listLoading = true;
            },
            //每页条数改变的时候触发事件
            handleSizeChange(v){
                this.currentPage = 1;
                this.pageSize = v;
                this.getDepartments();
                this.listLoading = true;
            },
            //添加对应的事件
            handleAdd(){
                this.form={};
                this.formVisible = true;
                this.title="新增员工";
            },
            //修改对应的事件
            handleEdit(i,r){
                this.form={};
                this.title = "修改员工";
                this.formVisible = true;
                //回显数据
                this.form = Object.assign({}, r);
            },
            //提交数据
            submit() {
                //验证form表单
                this.$refs.addForm.validate((valid) => {
                    if (valid) {//校验通过之后就进入该代码块
                        //加载框
                        this.addLoading = true;
                        //获取form表单中的数据
                        let param = Object.assign({}, this.form);
                        console.debug(param)
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
                        }
                    }
                });
            },
            //删除按钮对应的事件
            handleDel(i,r){
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.$http.delete("/department/delete/"+r.id).then(res=>{
                        if(res.data.success){
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                            this.getDepartments();
                        }else{
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
            selsChange(v){
                this.sels = v;
            },
            //批量删除
            batchRemove(){
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.$http.patch("/department/batchDelete",this.sels).then(res=>{
                        if(res.data.success){
                            //NProgress.done();
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                            this.getDepartments();
                        }else{
                            this.$message.error(res.data.msg);
                        }
                    })
                }).catch(() => {
                });
            }
        },
        mounted() {
            this.getDepartments();
        }
    }

</script>

<style scoped>

</style>