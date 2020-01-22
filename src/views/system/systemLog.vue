<template>
	<div class="app-container">
		<!--头部高级查询工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="searchForm">
				<el-form-item>
					<el-input v-model="searchForm.opUser" placeholder="用户名"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getSystemLog">查询</el-button>
				</el-form-item>
				<el-form-item>
					<!--@click="handleAdd"-->
					<el-button type="primary" >导出</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--员工数据列表-->
		<el-table :data="systemLogs" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
			<el-table-column type="selection" width="55">
			</el-table-column>
			<el-table-column type="index" >
			</el-table-column>
			<el-table-column prop="opIp" label="操作地址(IP)"  >
			</el-table-column>
			<el-table-column prop="opUser" label="操作人员"  >
			</el-table-column>
			<el-table-column prop="function" label="操作类型"  >
			</el-table-column>
			<el-table-column prop="params" label="操作参数"  >
			</el-table-column>
			<el-table-column prop="opTime" label="操作时间"  >
			</el-table-column>
			<el-table-column label="操作">
				<template scope="scope">
					<el-button size="small" @click="handleEdit(scope.$index, scope.row)">详情</el-button>

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
		<!--<!--添加（编辑）界面-->
		<!--<el-dialog :title="title" v-model="formVisible" >
			&lt;!&ndash;rules：主要用来做校验的（定义校验规则的）&ndash;&gt;
			&lt;!&ndash;ref="addForm"： 简单理解就是id=addForm&ndash;&gt;
			<el-form :model="form"  label-width="80px" >
				<el-form-item label="操作人员" prop="opUser">
					{{form.opUser}}
				</el-form-item>
				<el-form-item label="操作地址(IP)" prop="opIp">
					{{form.opIp}}
				</el-form-item>
				<el-form-item label="操作类型" prop="function">
					{{form.function}}
				</el-form-item>
				<el-form-item label="操作参数" prop="params">
					{{form.params}}
				</el-form-item>
				<el-form-item label="操作日期" prop="opUser">
					{{form.opTime}}
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="formVisible = false">关闭</el-button>
			</div>
		</el-dialog>-->



		<!-- 操作日志详细 -->
		<el-dialog title="操作日志详细" :visible.sync="formVisible" width="700px">
			<el-form ref="form" :model="form" label-width="100px" size="mini">
				<el-row>
					<el-col :span="12">
						<el-form-item label="操作模块："></el-form-item>
						<el-form-item
								label="登录信息："
						>{{ form.opUser }} / {{ form.opIp }}</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="请求地址："></el-form-item>
						<el-form-item label="请求方式："></el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="操作方法：">{{ form.function }}</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="请求参数：">{{ form.params }}</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="返回参数："></el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="操作状态：">
							<!--<div v-if="form.status === 0">正常</div>
							<div v-else-if="form.status === 1">失败</div>-->
						</el-form-item>
					</el-col>
					<el-col :span="12">
						<el-form-item label="操作时间：">{{ (form.opTime) }}</el-form-item>
					</el-col>
					<el-col :span="24">
						<el-form-item label="异常信息：" ></el-form-item>
					</el-col>
				</el-row>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click.native="formVisible = false">关 闭</el-button>
			</div>

		</el-dialog>



	</div>
</template>

<script>
	export default {
		data() {
			return {
				//日志数据列表
                systemLogs: [],
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
                    opUser:"",


                },
                //弹出框对应的标题
                title:"",
                //弹出框form表单中对应的数据
                form:{
                    id:"",
                    opUser:"",
                    function:"",
                    params:"",
                    opTime:"",
                    opIp:"",
                },
                //弹出框是否显示  false代表不显示
                formVisible:false,
                //添加是否显示加载框
                /*addLoading: false,*/
                //校验规则
                /*addFormRules: {
                    name: [
                        { required: true, message: '请输入姓名', trigger: 'blur' }
                    ]
                }*/

			}
		},
		methods: {
            //获取用户列表
            getSystemLog() {
                let param = {
                    currentPage: this.currentPage,
                    pageSize: this.pageSize,
                    opUser: this.searchForm.opUser
                };
                //开启加载框
                this.listLoading = true;
                this.$http.patch("/systemLog/selectPageByQuery",param).then(res=>{
                    console.debug(res);
                    this.systemLogs = res.data.result;
                    this.total = res.data.total;
                    this.listLoading = false;
                });
            },
    		//当前页改变的时候，触发事件
            handleCurrentChange(v){
                //修改当前页
                this.currentPage = v;
                this.getSystemLog();
                this.listLoading = true;
			},
            //每页条数改变的时候触发事件
            handleSizeChange(v){
                this.currentPage = 1;
                this.pageSize = v;
                this.getSystemLog();
                this.listLoading = true;
			},
            //导出对应的事件
            /*handleAdd(){
                this.form={};
                this.formVisible = true;
                this.title="新增员工";
            },*/
            //修改对应的事件
            handleEdit(i,r){
                console.debug(i)
                /*this.title = "日志详情";*/
                this.formVisible = true;
                //回显数据
                this.form = Object.assign({}, r);

            },
            /*//提交数据
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
                            this.$http.post("/employee/update", param).then(res => {
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
                                    /!*!//重置form表单
                                    this.$refs['addForm'].resetFields();*!/
                                    //加载列表
                                    this.getEmployee();
                                } else {
                                    this.$notify.error({
                                        title: '错误',
                                        message: res.data.msg
                                    });
                                }
                            });
                        } else {
                            //保存数据
                            this.$http.put("/employee/save", param).then(res => {
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
                                    /!*!//重置form表单
                                    this.$refs['addForm'].resetFields();*!/
                                    //加载列表
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
            },*/
            /*//删除按钮对应的事件
            handleDel(i,r){
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.$http.delete("/systemLog/delete/"+r.id).then(res=>{
                        if(res.data.success){
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                            this.getSystemLog();
                        }else{
                            this.$notify.error({
                                title: '错误',
                                message: res.data.msg
                            });
                        }
                    })
                }).catch(() => {
                });
            },*/
            //获取复选框选择数据
            selsChange(v){
                this.sels = v;
            },
            //批量删除
            batchRemove(){
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.$http.patch("/systemLog/batchDelete",this.sels).then(res=>{
                        if(res.data.success){
                            //NProgress.done();
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                            this.getSystemLog();
                        }else{
                            this.$message.error(res.data.msg);
                        }
                    })
                }).catch(() => {
                });
            }
        },
		mounted() {
			this.getSystemLog();
		}
	}

</script>

<style >
	.app-container {
		padding: 20px;
	}
</style>