<template>
    <section>
        <!--头部高级查询工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="searchForm">
                <el-form-item>
                    <el-input v-model="searchForm.name" placeholder="潜在用户名称"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="getPotentialCustomers">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd">新增用户</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="planHandleAdd" :disabled="this.sels.length!==1">新增开发计划</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--潜在用户数据列表-->
        <el-table :data="potentialCustomers" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column type="index" width="70" label="编号">
            </el-table-column>
            <el-table-column prop="name" label="潜在用户"  >
            </el-table-column>
            <!--<el-table-column prop="linkMan" label="联系人"  >
            </el-table-column>-->
            <el-table-column prop="linkManTel" label="联系电话" width="120" >
            </el-table-column>
            <el-table-column prop="remark" label="客户描述"  >
            </el-table-column>
            <el-table-column prop="customerSource.name" label="客户来源"  >
            </el-table-column>
            <el-table-column  label="成功机率"  >
                <template scope="scope">
                    <!--成功机率百分比进度条显示-->
                    <el-progress :text-inside="true" :stroke-width="20"
                                 v-if="potentialCustomers[scope.$index].successRate>80
                                 &&potentialCustomers[scope.$index].successRate<=100"
                                 :percentage="potentialCustomers[scope.$index].successRate" status="success"></el-progress>
                    <el-progress :text-inside="true" :stroke-width="20"
                                 v-else-if="potentialCustomers[scope.$index].successRate>50
                                 &&potentialCustomers[scope.$index].successRate<=80"
                                 :percentage="potentialCustomers[scope.$index].successRate" status="warning"></el-progress>
                    <el-progress :text-inside="true" :stroke-width="20"
                                 v-else="potentialCustomers[scope.$index].successRate>0
                                 &&potentialCustomers[scope.$index].successRate<=50"
                                 :percentage="potentialCustomers[scope.$index].successRate" status="exception"></el-progress>
                </template>
            </el-table-column>
            <!--<el-table-column prop="inputUser.username" label="创建人"  >-->
            <!--</el-table-column>-->
            <el-table-column prop="inputTime" width="165" label="创建时间"  >
            </el-table-column>
            <el-table-column width="140" label="操作">
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
        <!--分页工具条-->
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
                <el-form-item label="潜在用户名称" prop="name">
                    <el-input v-model="form.name" auto-complete="off"></el-input>
                </el-form-item>
                <!--<el-form-item label="联系人" prop="name">
                    <el-input v-model="form.linkMan" auto-complete="off"></el-input>
                </el-form-item>-->
                <el-form-item label="联系电话" prop="linkManTel">
                    <el-input v-model="form.linkManTel" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="客户来源" prop="customerSource">
                    <el-select value-key="id" v-model="form.customerSource" placeholder="请选择客户来源">
                        <el-option
                                v-for="item in customerSources"
                                :key="item.id"
                                :label="item.name"
                                :value="item">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="客户描述" prop="remark">
                    <el-input v-model="form.remark" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="成功机率" prop="successRate">
                    <el-input v-model.number="form.successRate" auto-complete="off"></el-input>
                </el-form-item>
                <!--<el-form-item label="创建人" prop="inputUser">
                    <el-input v-model="form.inputUser.username" auto-complete="off"></el-input>
                </el-form-item>-->
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="formVisible = false">取消</el-button>
                <el-button type="primary" @click.native="submit"   :loading="addLoading">提交</el-button>
            </div>
        </el-dialog>

        <!--添加开发计划-->
        <el-dialog :title="planTitle" :visible.sync="planFormVisible" >
            <!--rules：主要用来做校验的（定义校验规则的）-->
            <!--ref="addForm"： 简单理解就是id=addForm-->
            <el-form :model="planForm" label-width="80px" :rules="planAddFormRules" ref="planAddForm">
                <el-form-item label="潜在用户" prop="name">
                    <el-input disabled="disabled" v-model="planForm.potentialCustomer.name" auto-complete="off"></el-input re>
                </el-form-item>
                <el-form-item label="计划主题" prop="name">
                    <el-input v-model="planForm.planSubject" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="计划时间" prop="name">
                    <!--<el-input v-model="planForm.planTime" auto-complete="off"></el-input>-->
                    <el-date-picker value-format="yyyy-MM-dd"
                                    v-model="planForm.planTime"
                                    @change="planDateChange"
                                    align="right"
                                    placeholder="选择日期"
                                    :picker-options="pickerOptions">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="计划内容" prop="name">
                    <el-input v-model="planForm.planDetails" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="计划实施方式" prop="name">
                    <el-select value-key="id" v-model="planForm.planType" placeholder="请选择计划实施方式">
                        <el-option
                                v-for="item in planTypes"
                                :key="item.id"
                                :label="item.name"
                                :value="item">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="planFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="planSubmit"   :loading="planAddLoading">提交</el-button>
            </div>
        </el-dialog>
    </section>
</template>

<script>
    export default {
        data() {
            //成功机率自定义验证规则
            var checkSuccessRate = (rule, value, callback) => {
                if (!value) {
                    return callback(new Error('成功率不能为空'));
                }
                setTimeout(() => {
                    if (!Number.isInteger(value)) {
                        callback(new Error('请输入数字值'));
                    } else {
                        if (value <= 0 || value >100) {
                            callback(new Error('成功率必须是1-100范围数字'));
                        } else {
                            callback();
                        }
                    }
                }, 1000);
            };
            return {
                //所有客户来源
                customerSources:[],
                //时间选择器(选择计划时间)
                pickerOptions: {
                    disabledDate(time) {
                        return time.getTime() < Date.now();
                    },
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
                //潜在用户数据列表
                potentialCustomers: [],
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
                planTitle:"",
                planTypes:[],
                //弹出框form表单中对应的数据
                form:{
                    id:"",
                    name:"",
                    linkMan:"",
                    linkManTel:"",
                    remark:"",
                    successRate:"",
                    inputUser:"",
                    inputTime:"",
                    customerSource:{}
                },
                planForm:{
                    //计划主题
                    planSubject:"",
                    //计划时间
                    planTime:"",
                    //计划内容
                    planDetails:"",
                    //计划实施方式
                    planType:"",
                    //潜在用户
                    potentialCustomer:{}
                },
                //弹出框是否显示  false代表不显示
                formVisible:false,
                //添加计划的弹出框是否显示
                planFormVisible:false,
                //添加是否显示加载框
                addLoading: false,
                planAddLoading: false,
                //添加潜在客户校验规则
                addFormRules: {
                    //潜在客户名称
                    name: [
                        { required: true, message: '请输入潜在用户姓名', trigger: 'blur' },
                        { min: 1, max: 5, message: '长度在 1 到 5 个字符', trigger: 'blur' }
                    ],
                    //联系电话
                    linkManTel: [
                        { required: true, message: '请输入联系电话', trigger: 'blur' },
                        { min: 7, max: 11, message: '长度在 7 到 11 位', trigger: 'blur' }
                    ],
                    //客户来源
                    customerSource: [
                    ],
                    //客户描述
                    remark: [
                    ],
                    //成功机率
                    successRate: [
                        //自定义验证
                        { validator: checkSuccessRate, trigger: 'blur' }
                    ]
                },
                planAddFormRules: {
                    planSubject: [
                        { required: true, message: '请输入潜在用户姓名', trigger: 'blur' }
                    ],
                    planSubject: [
                        { type: 'date', required: true, message: '请选择日期', trigger: 'change' }
                    ],
                    planSubject: [
                        { required: true, message: '请输入潜在用户姓名', trigger: 'blur' }
                    ],
                    planSubject: [
                        { required: true, message: '请输入潜在用户姓名', trigger: 'blur' }
                    ],
                    planSubject: [
                        { required: true, message: '请输入潜在用户姓名', trigger: 'blur' }
                    ],
                    planSubject: [
                        { required: true, message: '请输入潜在用户姓名', trigger: 'blur' }
                    ],
                }
            }
        },
        methods: {
            planDateChange(v){
                //日期选择器值变化时，赋值
                this.planForm.planTime=v;
            },
            //获取潜在用户列表
            getPotentialCustomers() {
                let param = {
                    currentPage: this.currentPage,
                    pageSize: this.pageSize,
                    name: this.searchForm.name
                };
                //开启加载框
                this.listLoading = true;
                this.$http.patch("/potentialCustomer/selectPageByQuery",param).then(res=>{
                    //console.debug(res);
                    this.potentialCustomers = res.data.result;
                    console.debug(this.potentialCustomers)
                    this.total = res.data.total;
                    this.listLoading = false;
                });
            },
            //当前页改变的时候，触发事件
            handleCurrentChange(v){
                //修改当前页
                this.currentPage = v;
                this.getPotentialCustomers();
                this.listLoading = true;
            },
            //每页条数改变的时候触发事件
            handleSizeChange(v){
                this.currentPage = 1;
                this.pageSize = v;
                this.getPotentialCustomers();
                this.listLoading = true;
            },
            //添加对应的事件
            handleAdd(){
                this.form={};
                //获取客户来源列表，预先加载
                this.getCustomerSources();
                this.formVisible = true;
                this.title="新增潜在用户";
            },
            planHandleAdd(){
                this.planForm={};
                //获取计划实施方式列表，加载到下拉列表
                this.getPlanTypes();
                //将该选择的潜在客户对象封装到添加表单，只读
                this.planForm.potentialCustomer = this.sels[0];
                this.planFormVisible = true;
                this.planTitle="新增开发计划";
            },
            //获取客户来源列表
            getCustomerSources(){
                //查询客户来源列表
                this.$http.patch("/systemDictionaryItem/selectCustomerSources").then(res=>{
                    //为下拉列表选项数组赋值
                    this.customerSources=res.data;
                });
            },
            //获取计划实施方式
            getPlanTypes(){
                //查询计划实施方式列表
                this.$http.patch("/systemDictionaryItem/selectPlanType").then(res=>{
                    console.debug(res.data)
                    //为下拉列表选项数组赋值
                    this.planTypes=res.data;
                });
            },
            //修改对应的事件
            handleEdit(i,r){
                this.form={};
                //获取客户来源列表，预先加载
                this.getCustomerSources();
                this.title = "修改潜在用户";
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
                        if (param.id) {
                            //保存数据
                            this.$http.post("/potentialCustomer/update", param).then(res => {
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
                                    //加载列表
                                    this.getPotentialCustomers();
                                } else {
                                    this.$notify.error({
                                        title: '错误',
                                        message: res.data.msg
                                    });
                                }
                            });
                        } else {
                            //保存数据
                            this.$http.put("/potentialCustomer/save", param).then(res => {
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
                                    //加载列表
                                    this.getPotentialCustomers();
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
            planSubmit() {
                //验证form表单
                this.$refs.planAddForm.validate((valid) => {
                    if (valid) {//校验通过之后就进入该代码块
                        //加载框
                        this.planAddLoading = true;

                        console.debug(this.planForm)
                        //获取form表单中的数据
                        let param = Object.assign({}, this.planForm);
                        //保存数据
                        this.$http.put("/customerDevPlan/save", param).then(res => {
                            //提交成功
                            if (res.data.success) {
                                //停止添加按钮的加载框
                                this.planAddLoading = false;
                                this.$message({
                                    message: '添加开发计划成功',
                                    type: 'success'
                                });
                                //弹出框关闭
                                this.planFormVisible = false;
                                //添加完开发计划重新加载，潜在用户列表
                                this.getPotentialCustomers();
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
            //删除按钮对应的事件
            handleDel(i,r){
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.$http.delete("/potentialCustomer/delete/"+r.id).then(res=>{
                        console.debug("我进来了")
                        if(res.data.success){
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                            this.getPotentialCustomers();
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
                console.debug(this.sels)
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.$http.patch("/potentialCustomer/batchDelete",this.sels).then(res=>{
                        if(res.data.success){
                            //NProgress.done();
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                            this.getPotentialCustomers();
                        }else{
                            this.$message.error(res.data.msg);
                        }
                    })
                }).catch(() => {
                });
            }
        },
        mounted() {
            this.getPotentialCustomers();
        }
    }
</script>

<style scoped>

</style>