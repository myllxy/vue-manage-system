<template>
    <section>
        <!-- 头部高级查询工具条 -->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="searchForm">
                <el-form-item>
                    <el-input v-model="searchForm.name" placeholder="菜单名"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="getMenus">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!-- 员工数据列表 -->
        <el-table :data="menus" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
                  style="width: 100%;">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column type="index" label="编号" width="100" prop="id">
            </el-table-column>
            <el-table-column prop="name" label="菜单名" width="170">
            </el-table-column>
            <el-table-column prop="sn" label="菜单编号" width="170">
            </el-table-column>
            <el-table-column prop="parent.name" label="父菜单" width="170">
                <template slot-scope="scope">
                    <span v-if="scope.row.parent !== null">{{ scope.row.parent.name }}</span>
                    <span v-if="scope.row.parent === null">无父菜单</span>
                </template>
            </el-table-column>
            <el-table-column prop="icon" label="图标" width="170">
            </el-table-column>
            <el-table-column prop="url" label="地址" width="170">
            </el-table-column>
            <el-table-column prop="intro" label="简介" width="170">
            </el-table-column>
            <el-table-column label="操作" fixed="right" width="240">
                <template scope="scope">
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
        <!-- 添加（编辑）界面 -->
        <el-dialog :title="title" :visible.sync="formVisible">
            <el-form :model="form" label-width="80px" :rules="addFormRules" ref="form">
                <el-form-item label="菜单名" prop="name">
                    <el-input v-model="form.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="菜单编号" prop="sn">
                    <el-input v-model="form.sn" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="菜单图标" prop="icon">
                    <el-input v-model="form.icon" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="菜单地址" prop="url">
                    <el-input v-model="form.url" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="菜单简介" prop="intro">
                    <el-input v-model="form.intro" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="父菜单" prop="parent.name">
                    <el-select value-key="sn" v-model="form.parent" placeholder="请选择父菜单">
                        <el-option v-for="item in parentMenus"
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
                /* 父菜单 */
                parentMenus: [],
                /* 菜单数据列表 */
                menus: [],
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
                    name: "",
                },
                //弹出框对应的标题
                title: "",
                //弹出框form表单中对应的数据
                form: {
                    name: "",
                    sn: "",
                    parent: "",
                    icon: "",
                    url: "",
                    intro: ""
                },
                //弹出框是否显示  false代表不显示
                formVisible: false,
                //添加是否显示加载框
                addLoading: false,
                //校验规则
                addFormRules: {
                    name: [
                        {required: true, message: '请输入姓名', trigger: 'blur'}
                    ]
                }
            }
        },
        methods: {
            /* 系统菜单下拉框 */
            getParentMenus() {
                this.$http.get("/systemMenu/getMenus").then(res => {
                    this.parentMenus = res.data;
                });
            },
            getMenus() {
                let param = {
                    currentPage: this.currentPage,
                    pageSize: this.pageSize,
                    name: this.searchForm.name
                };
                this.listLoading = true;
                this.$http.patch("/systemMenu/selectPageByQuery", param).then(res => {
                    this.menus = res.data.result;
                    this.total = res.data.total;
                    this.listLoading = false;
                });
            },
            //当前页改变的时候，触发事件
            handleCurrentChange(v) {
                //修改当前页
                this.currentPage = v;
                this.getMenus();
                this.listLoading = true;
            },
            //每页条数改变的时候触发事件
            handleSizeChange(v) {
                this.currentPage = 1;
                this.pageSize = v;
                this.getMenus();
                this.listLoading = true;
            },
            handleAdd() {
                this.getParentMenus();
                this.form = [];
                this.formVisible = true;
                this.title = "新增菜单";
            },
            handleEdit(i, r) {
                this.getParentMenus();
                this.form = [];
                this.title = "修改菜单";
                this.formVisible = true;
                this.form = Object.assign({}, r);
            },
            submit() {
                this.$refs.form.validate((valid) => {
                    if (valid) {
                        this.addLoading = true;
                        let param = Object.assign({}, this.form);
                        if (param.id) {
                            this.$http.post("/systemMenu/update", param).then(res => {
                                if (res.data.success) {
                                    this.addLoading = false;
                                    this.$message({
                                        message: '修改成功',
                                        type: 'success'
                                    });
                                    this.formVisible = false;
                                    this.$refs['form'].resetFields();
                                    this.getMenus();
                                } else {
                                    this.$notify.error({
                                        title: '错误',
                                        message: res.data.msg
                                    });
                                }
                            });
                        } else {
                            this.$http.put("/systemMenu/save", param).then(res => {
                                if (res.data.success) {
                                    this.addLoading = false;
                                    this.$message({
                                        message: '添加成功',
                                        type: 'success'
                                    });
                                    this.formVisible = false;
                                    this.$refs['form'].resetFields();
                                    this.getMenus();
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
                    this.$http.delete("/systemMenu/delete/" + r.id).then(res => {
                        if (res.data.success) {
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                            this.getMenus();
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
                    this.$http.patch("/systemMenu/batchDelete", this.sels).then(res => {
                        if (res.data.success) {
                            //NProgress.done();
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                            this.getMenus();
                        } else {
                            this.$message.error(res.data.msg);
                        }
                    })
                }).catch(() => {
                });
            }
        },
        mounted() {
            this.getMenus();
        }
    }

</script>

<style scoped>

</style>