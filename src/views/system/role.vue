<template>
    <section>
        <!--头部高级查询工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="searchForm">
                <el-form-item>
                    <el-input v-model="searchForm.name" placeholder="角色"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="getRoles">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--角色数据列表-->
        <el-table :data="roles" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
                  style="width: 100%;">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column type="index" label="id" width="230">
            </el-table-column>
            <el-table-column prop="name" label="角色名称" width="230">
            </el-table-column>
            <el-table-column prop="sn" label="角色编号" width="230">
            </el-table-column>
            <el-table-column prop="permissions" :formatter="formatterPermission" label="权限名称" width="230" fixed="right">
            </el-table-column>
            <el-table-column label="操作" fixed="right">
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
            <el-form :model="form" label-width="90px" :rules="addFormRules" ref="addForm">
                <el-form-item label="角色名称" prop="name">
                    <el-input v-model="form.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="角色编号" prop="sn">
                    <el-input v-model="form.sn" auto-complete="off"></el-input>
                </el-form-item>
                <div style="text-align: center;">
                    <el-form-item prop="permissions" label="选择权限">
                        <!--<el-transfer style="text-align: left; display: inline-block; " :button-texts="['移除', '添加']"-->
                        <!--:props="{key: 'sn',label: 'name'}"-->
                        <!--v-model="form.permissions" :data="data" :titles="titles"></el-transfer>-->
                        <!-- @addBtn='add' @removeBtn='remove' -->
                        <tree-transfer :title="titles"
                                       :from_data='fromData'
                                       :to_data='toData'
                                       :defaultProps="{label:'label'}"
                                       :mode='mode'
                                       @addBtn='add' @removeBtn='remove'
                                       height='540px' filter>
                        </tree-transfer>
                    </el-form-item>
                </div>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="formVisible = false">取消</el-button>
                <el-button type="primary" @click.native="submit" :loading="addLoading">提交</el-button>
            </div>
        </el-dialog>
    </section>
</template>

<script>
    import treeTransfer from 'el-tree-transfer'

    export default {
        data() {
            return {
                mode: "transfer", // transfer addressList
                fromData: [
                    {
                        id: "1",
                        pid: "0",
                        label: "一级 1",
                        children: [
                            {
                                id: "1-1",
                                pid: "1",
                                label: "二级 1-1",
                                children: []
                            },
                            {
                                id: "1-2",
                                pid: "1",
                                label: "二级 1-2",
                                children: [
                                    {
                                        id: "1-2-1",
                                        pid: "1-2",
                                        children: [],
                                        label: "二级 1-2-1"
                                    },
                                    {
                                        id: "1-2-2",
                                        pid: "1-2",
                                        children: [],
                                        label: "二级 1-2-2"
                                    }
                                ]
                            }
                        ]
                    },
                ],
                toData: [],
                //权限列表准备的数据
                data: [],
                titles: ["未有权限", "已有权限"],
                //角色数据列表
                roles: [],
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
                    id: "",
                    name: "",
                    sn: "",
                    permissions: []
                },
                //弹出框是否显示  false代表不显示
                formVisible: false,
                //添加是否显示加载框
                addLoading: false,
                //校验规则
                addFormRules: {
                    name: [
                        {required: true, message: '请输入角色名称', trigger: 'blur'}
                    ],
                    sn: [
                        {required: true, message: '请输入角色编号', trigger: 'blur'}
                    ]
                }
            }
        },
        methods: {
            //格式化权限
            formatterPermission(row) {
                //获取角色拥有的权限
                let permissions = row.permissions;
                console.debug(row.permissions);
                //创建一个数组，表示拥有的权限
                let myPermissions = [];
                for (let i = 0; i < permissions.length; i++) {
                    //循环迭代每个权限
                    let p = permissions[i];
                    //添加
                    myPermissions.push(p.name);
                }
                return myPermissions.join(",");
            },
            //获取角色列表
            getRoles() {
                let param = {
                    currentPage: this.currentPage,
                    pageSize: this.pageSize,
                    name: this.searchForm.name
                };
                //开启加载框
                this.listLoading = true;
                this.$http.patch("/role/selectPageByQuery", param).then(res => {
                    this.roles = res.data.result;
                    this.total = res.data.total;
                    this.listLoading = false;
                });
            },
            //获取权限列表
            getPermission() {
                this.$http.patch("/permission/list").then(res => {
                    this.fromData = res.data;
                    this.data = res.data;
                });
            },
            //当前页改变的时候，触发事件
            handleCurrentChange(v) {
                //修改当前页
                this.currentPage = v;
                this.getRoles();
                this.listLoading = true;
            },
            //每页条数改变的时候触发事件
            handleSizeChange(v) {
                this.currentPage = 1;
                this.pageSize = v;
                this.getRoles();
                this.listLoading = true;
            },
            //添加对应的事件
            handleAdd() {
                this.form = {};
                this.formVisible = true;
                this.title = "新增角色";
            },
            //修改对应的事件
            handleEdit(i, r) {
                this.form = {};
                this.title = "修改角色";
                this.formVisible = true;
                //回显数据
                this.form = Object.assign({}, r);
                /* 手动回显，而不是动态绑定的方式回显 */
                let parentPer = [];
                let childPer = [];
                for (let permission of this.form.permissions) {
                    permission.pid === '0' ? parentPer.push(permission) : childPer.push(permission);
                }
                for (let parent of parentPer) {
                    parent.children = [];
                    for (let child of childPer) {
                        if (child.pid === parent.id.toString()) {
                            console.debug('11111');
                            parent.children.push(child);
                        }
                    }
                }
                console.debug(parentPer);
                this.toData = parentPer;
                console.debug(this.toData);
            },
            //提交数据
            submit() {
                //验证form表单
                this.$refs.addForm.validate((valid) => {
                    if (valid) {
                        this.addLoading = true;
                        let param = Object.assign({}, this.form);
                        param.permissions = this.toData;
                        if (param.id) {
                            this.$http.post("/role/update", param).then(res => {
                                if (res.data.success) {
                                    this.addLoading = false;
                                    this.$message({
                                        message: '修改成功',
                                        type: 'success'
                                    });
                                    this.addLoading = false;
                                    this.formVisible = false;
                                    this.$refs['addForm'].resetFields();
                                    this.getRoles();
                                } else {
                                    this.$notify.error({
                                        title: '错误',
                                        message: res.data.msg
                                    });
                                }
                            });
                        } else {
                            this.$http.put("/role/save", param).then(res => {
                                if (res.data.success) {
                                    this.addLoading = false;
                                    this.$message({
                                        message: '添加成功',
                                        type: 'success'
                                    });
                                    this.formVisible = false;
                                    this.$refs['addForm'].resetFields();
                                    this.getRoles();
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
                    this.$http.delete("/role/delete/" + r.id).then(res => {
                        if (res.data.success) {
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                            this.getRoles();
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
                    this.$http.patch("/role/batchDelete", this.sels).then(res => {
                        if (res.data.success) {
                            //NProgress.done();
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                            this.getRoles();
                        } else {
                            this.$message.error(res.data.msg);
                        }
                    })
                }).catch(() => {
                });
            },
            // 切换模式 现有树形穿梭框模式transfer 和通讯录模式addressList
            changeMode() {
                if (this.mode === "transfer") {
                    this.mode = "addressList";
                } else {
                    this.mode = "transfer";
                }
            },
            // 监听穿梭框组件添加
            add(fromData, toData, obj) {
                // 树形穿梭框模式transfer时，返回参数为左侧树移动后数据、右侧树移动后数据、移动的{keys,nodes,halfKeys,halfNodes}对象
                // 通讯录模式addressList时，返回参数为右侧收件人列表、右侧抄送人列表、右侧密送人列表
                console.log("fromData:", fromData);
                this.fromData = fromData;
                console.log("toData:", toData);
                this.toData = toData;
                console.log("obj:", obj);
            },
            // 监听穿梭框组件移除
            remove(fromData, toData, obj) {
                // 树形穿梭框模式transfer时，返回参数为左侧树移动后数据、右侧树移动后数据、移动的{keys,nodes,halfKeys,halfNodes}对象
                // 通讯录模式addressList时，返回参数为右侧收件人列表、右侧抄送人列表、右侧密送人列表
                console.log("fromData:", fromData);
                this.fromData = fromData;
                console.log("toData:", toData);
                this.toData = toData;
                console.log("obj:", obj);
            }
        },
        mounted() {
            this.getRoles();
            this.getPermission();
        },
        components: {treeTransfer},
    }

</script>

<style>

</style>