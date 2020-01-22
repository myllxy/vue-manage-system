<template>
	<section>
		<!--头部高级查询工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="searchForm">
				<el-form-item>
					<el-input v-model="searchForm.name" placeholder="角色"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getRole">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleAdd">新增</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--角色数据列表-->
		<el-table :data="roles" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column type="index" >
			</el-table-column>
			<el-table-column prop="name" label="角色名称">
			</el-table-column>
			<el-table-column prop="sn" label="角色编号">
			</el-table-column>
			<el-table-column prop="permissions" :formatter="formatterPermission" label="权限名称">
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
			<el-form :model="form" label-width="90px" :rules="addFormRules" ref="addForm">
				<el-form-item label="角色名称" prop="name">
					<el-input v-model="form.name" auto-complete="off"></el-input>
				</el-form-item>
				<el-form-item label="角色编号" prop="sn">
					<el-input v-model="form.sn" auto-complete="off"></el-input>
				</el-form-item>
				<div style="text-align: center;" >
					<el-form-item  prop="permissions" label="选择权限">
						<el-transfer  style="text-align: left; display: inline-block; " :button-texts="['移除', '添加']" @change="handleChange"  :props="{key: 'id',label: 'name'}" v-model="form.permissions" :data="data"  :titles="titles"></el-transfer>
					</el-form-item>
				</div>
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
                //权限列表准备的数据
                data:[],
                titles:["全部权限","已有权限"],
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
                searchForm:{
                    name:"",
                },
                //弹出框对应的标题
                title:"",
                //弹出框form表单中对应的数据
                form:{
                    id:"",
                    name:"",
                    permissions:[]
                },
                //弹出框是否显示  false代表不显示
                formVisible:false,
                //添加是否显示加载框
                addLoading: false,
                //校验规则
                addFormRules: {
                    name: [
                        { required: true, message: '请输入角色名称', trigger: 'blur' }
                    ],
                    sn: [
                        { required: true, message: '请输入角色编号', trigger: 'blur' }
                    ]
                }

			}
		},
		methods: {
            //格式化权限
            formatterPermission(row, column) {
                //获取角色拥有的权限
                var permissions = row.permissions;
                //创建一个数组，表示拥有的权限
                let myPermissions = [];
                for(let i=0;i<permissions.length;i++){
                    //循环迭代每个权限
                    let p = permissions[i];
                    //添加
                    myPermissions.push(p.name);
                }
                return myPermissions.join(",");
            },
            //获取角色列表
            getRole() {
                let param = {
                    currentPage: this.currentPage,
                    pageSize: this.pageSize,
					name: this.searchForm.name
                };
                //开启加载框
                this.listLoading = true;
                this.$http.patch("/role/listByPage",param).then(res=>{
                    console.debug(res);
                    this.roles = res.data.result;
                    this.total = res.data.total;
                    this.listLoading = false;
                });
            },
            //获取权限列表
            getPermission(){
                this.$http.patch("/permission/list").then(res=>{
                    // this.roles = res.data.result;
                    this.data = res.data;
                });
            },
    		//当前页改变的时候，触发事件
            handleCurrentChange(v){
                //修改当前页
                this.currentPage = v;
                this.getRole();
                this.listLoading = true;
			},
            //每页条数改变的时候触发事件
            handleSizeChange(v){
                this.currentPage = 1;
                this.pageSize = v;
                this.getRole();
                this.listLoading = true;
			},
            //添加对应的事件
            handleAdd(){
                this.form={};
                this.formVisible = true;
                this.title="新增角色";
            },
            //修改对应的事件
            handleEdit(i,r){
                this.form={};
                this.title = "修改角色";
                this.formVisible = true;
                //回显数据
                this.form = Object.assign({}, r);
                let permissions = this.form.permissions;
                //定义一个数组，来装回显的id
                let permissionsArray = [];
                //循环迭代所有的权限
                for(let i=0;i<permissions.length;i++) {
                    //拿到权限具体的对象
                    var p = permissions[i];
                    permissionsArray.push(p.id);
                }
                //给权限重新赋值
                this.form.permissions = permissionsArray;
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
                        //新增一个数组，来装权限对应的对象
                        let mypermissions = [];
                        //拿到已有权限的id  格式[1,2]  我要把这种格式转为上面的格式
                        let permissions = param.permissions;
                        for(var i=0;i<permissions.length;i++){
                            let p = permissions[i];
                            //创建一个对象
                            let obj = {
                                id:p
                            }
                            mypermissions.push(obj);
                        }
                        param.permissions = mypermissions;
                        if (param.id) {
                            //保存数据
                            this.$http.post("/role/update", param).then(res => {
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
                                    this.getRole();
                                } else {
                                    this.$notify.error({
                                        title: '错误',
                                        message: res.data.msg
                                    });
                                }
                            });
                        } else {
                            //保存数据
                            this.$http.put("/role/save", param).then(res => {
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
                                    this.getRole();
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
                    this.$http.delete("/role/delete/"+r.id).then(res=>{
                        if(res.data.success){
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                            this.getRole();
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
                    this.$http.patch("/role/batchDelete",this.sels).then(res=>{
                        if(res.data.success){
                            //NProgress.done();
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                            this.getRole();
                        }else{
                            this.$message.error(res.data.msg);
                        }
                    })
                }).catch(() => {
                });
            }
        },
		mounted() {
            //加载角色列表
			this.getRole();
            //加载权限
            this.getPermission();
		}
	}

</script>

<style>

</style>