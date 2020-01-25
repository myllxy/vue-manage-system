<template>
    <section>
        <!--头部高级查询工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="searchForm">
                <el-form-item>
                    <el-input v-model="searchForm.planSubject" placeholder="用户开发计划主题"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="getCustomerDevPlans">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="success" :disabled="disabled" @click="handleFormalCustomer">转正</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--客户开发计划数据列表-->
        <el-table :data="customerDevPlans" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column type="index" width="70" label="编号">
            </el-table-column>
            <el-table-column prop="planSubject" label="计划主题"  >
            </el-table-column>
            <el-table-column prop="planTime" label="计划时间" width="120" >
            </el-table-column>
            <el-table-column prop="planDetails" label="计划内容">
            </el-table-column>
            <el-table-column prop="planType.name" label="计划实施方式">
            </el-table-column>
            <el-table-column prop="potentialCustomer.name" label="潜在用户">
            </el-table-column>
            <el-table-column label="开发状态">
                <template scope="scope">
                    <span v-if="customerDevPlans[scope.$index].developStatus===-1" style="color: red">开发失败</span>
                    <span v-else-if="customerDevPlans[scope.$index].developStatus===0" style="color:orange ">开发中</span>
                    <span v-else="customerDevPlans[scope.$index].developStatus===1" style="color: greenyellow">开发成功</span>
                </template>
            </el-table-column>
            <el-table-column prop="inputTime" label="创建时间">
            </el-table-column>
            <el-table-column width="200" label="操作">
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

        <!--修改客户开发计划-->
        <el-dialog :title="title" :visible.sync="formVisible" >
            <!--rules：主要用来做校验的（定义校验规则的）-->
            <!--ref="addForm"： 简单理解就是id=addForm-->
            <el-form :model="form" label-width="80px" :rules="addFormRules" ref="addForm">
                <el-form-item label="潜在用户" prop="name">
                    <el-input disabled="disabled" v-model="form.potentialCustomer.name" auto-complete="off"></el-input re>
                </el-form-item>
                <el-form-item label="计划主题" prop="planSubject">
                    <el-input v-model="form.planSubject" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="计划时间" prop="planTime">
                    <!--<el-input v-model="form.planTime" auto-complete="off"></el-input>-->
                    <el-date-picker value-format="yyyy-MM-dd"
                                    v-model="form.planTime"
                                    @change="planDateChange"
                                    align="right"
                                    placeholder="选择日期"
                                    :picker-options="pickerOptions">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="计划内容" prop="planDetails">
                    <el-input v-model="form.planDetails" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="计划实施方式" prop="planType">
                    <el-select value-key="id" v-model="form.planType" placeholder="请选择计划实施方式">
                        <el-option
                                v-for="item in planTypes"
                                :key="item.id"
                                :label="item.name"
                                :value="item">
                        </el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="开发状态" prop="developStatus">
                    <el-radio-group v-model="form.developStatus" size="small">
                        <el-radio-button label="-1" checked>开发失败</el-radio-button>
                        <el-radio-button label="0">开发中</el-radio-button>
                        <el-radio-button label="1">开发成功</el-radio-button>
                    </el-radio-group>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="formVisible = false">取消</el-button>
                <el-button type="primary" @click.native="submit"   :loading="addLoading">提交</el-button>
            </div>
        </el-dialog>

        <!-- 转正客户新增与修改界面 -->
        <el-dialog :title="customerTitle"
                   :visible.sync="customerFormVisible">
            <el-form :model="customerForm" label-width="80px" :rules="customerAddFormRules" ref="customerAddForm">
                <el-form-item label="已有信息">
                    <hr style="background-color:dodgerblue;height: 1px;width:100%;border: none;margin-top: 15px"/>
                </el-form-item>
                <el-form-item label="客户名称" prop="name">
                    <el-input disabled="disabled" v-model="customerForm.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="电话" prop="tel" label-position="left" label-width="50px">
                    <el-input disabled="disabled" v-model="customerForm.tel" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="客户来源" prop="customerSource">
                    <el-select disabled="disabled" v-model="customerForm.customerSource" placeholder="请选择客户来源">
                        <el-option v-for="(item, index) in customer_customerSource"
                                   :key="index"
                                   :value="item.value"
                                   :label="item.label"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="补充信息">
                    <hr style="background-color:dodgerblue;height: 1px;width:100%;border: none;margin-top: 15px"/>
                </el-form-item>
                <!-- :label-position label-width必须在一起才能同时生效 -->
                <el-form-item label="性别" prop="gender" label-position="left" label-width="50px">
                    <el-radio v-model="customerForm.gender" :label="1">男</el-radio>
                    <el-radio v-model="customerForm.gender" :label="0">女</el-radio>
                </el-form-item>
                <el-form-item label="营销人员" prop="seller">
                    <el-select v-model="customerForm.seller" placeholder="请选择营销人员">
                        <!-- seller中相当于存储了label与value映射关系在页面刚刚加载的时候 -->
                        <!-- 而现在我拿到了form.seller,它被处理成一个编号即sn,根据映射规则就能拿到对应的username了 -->
                        <!-- 回显成功 -->
                        <el-option v-for="(item, index) in seller"
                                   :key="index"
                                   :value="item.value"
                                   :label="item.label"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="customerFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="submitConsumer" :loading="customerAddLoading">提交</el-button>
            </div>
        </el-dialog>
    </section>
</template>

<script>
    export default {
        data() {
            return {
                //是否禁用转正按钮,默认显示
                disabled:true,
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
                customerDevPlans: [],
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
                    planSubject:""
                },
                //弹出框对应的标题
                title:"",
                //添加客户弹出框的标题
                customerTitle:"",
                /* 营销人员 */
                seller: [],
                /* 客户来源数据字典 */
                customer_customerSource: [],
                //计划实施方式
                planTypes:[],
                //转正弹出框的加载框
                customerAddLoading:false,
                //弹出框form表单中对应的数据
                form:{
                    id:"",
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
                //添加客户表单
                customerForm:{
                    //用户名
                    name: '',
                    gender: '',
                    //联系电话
                    tel: '',
                    seller: '',
                    //客户来源
                    customerSource: ''
                },
                //弹出框是否显示  false代表不显示
                formVisible:false,
                //添加客户转正的弹出框
                customerFormVisible:false,
                //添加是否显示加载框
                addLoading: false,
                //校验规则
                addFormRules: {
                    planSubject: [
                        { required: true, message: '请输入计划主题', trigger: 'blur' }
                    ],
                    planDetails: [
                        { required: true, message: '请输入计划内容', trigger: 'blur' }
                    ]
                },
                customerAddFormRules: {
                }
            }
        },
        methods: {
            /* 后台查询客户来源数据字典返回给customer_customerSource */
            getcustomerSources() {
                /* 在这里可以将传入的id写死为1 */
                /* 因为查的是数据字典 */
                this.$http.get("/systemDictionary/getDic/1").then(res => {
                    for (let result of res.data) {
                        this.customer_customerSource.push({
                            /* requence就是数据字典明细中的数据字典序号,根据该序号就能找到数据字典明细值 */
                            /* 这里用value标签接收,因为在customer中保存的实际上是数据字典序列,
                               只有查的时候才替换成数据字典明细值 */
                            value: result.requence,
                            label: result.name
                        });
                    }
                });
            },
            /* 后台查询营销人员返回给seller */
            getSeller() {
                this.$http.post("/employee/getEmployee").then(res => {
                    for (let result of res.data) {
                        this.seller.push({
                            value: result.sn,
                            label: result.username
                        });
                    }
                });
            },
            getPlanTypes(){
                //查询计划实施方式列表
                this.$http.patch("/systemDictionaryItem/selectPlanType").then(res=>{
                    console.debug(res.data)
                    //为下拉列表选项数组赋值
                    this.planTypes=res.data;
                });
            },
            //提交转正信息
            submitConsumer() {
                this.$refs.customerAddForm.validate((valid) => {
                    if (valid) {
                        this.customerAddLoading = true;
                        /* 获取form表单中的数据 */
                        let param = Object.assign({}, this.customerForm);
                        /* 新增、修改与提交 */
                        /* 通过requence来查找整个对象 */
                        this.$http.get("/systemDictionaryItem/get/" + param.customerSource).then(res => {
                            param.customerSource = res.data;
                            this.$http.get("/employee/getEmployeeBySn/" + param.seller).then(res => {
                                param.seller = res.data;

                                /* 没有id就代表是新增,因为id设置了主键自增 */
                                this.$http.put("/customer/save", param).then(res => {
                                    if (res.data.success) {
                                        this.customerAddLoading = false;
                                        this.$message({
                                            message: '客户转正成功',
                                            type: 'success'
                                        });
                                        //关闭弹出框
                                        this.customerFormVisible = false;
                                        //删除当前选中行开发计划
                                        this.formalCustomerRemove()
                                        //删除转正之前的潜在用户
                                        this.PotentialCustomerDel(this.sels[0]);

                                    } else {
                                        this.$notify.error({
                                            title: '客户转正错误',
                                            message: res.data.msg
                                        });
                                    }
                                });

                            });
                        });
                    }
                });
            },
            //删除转正之前的开发计划
            PotentialCustomerDel(r){
                this.$http.delete("/potentialCustomer/delete/"+r.potentialCustomer.id).then(res=>{
                    if(res.data.success){
                    }else{
                        this.$notify.error({
                            title: '错误',
                            message: res.data.msg
                        });
                    }
                })
            },
            //弹出转正客户弹框
            //将潜在客户和正式客户相同的信息显示，只读
            handleFormalCustomer() {
                /*每次转正先清空表单*/
                this.customerForm = {};
                this.customerFormVisible = true;
                this.customerTitle = "潜在客户转正";
                /* 获取营销人员列表*/
                this.getSeller();
                //获取客户来源列表
                this.getcustomerSources();
                //将已有的客户信息默认回显
                let row = this.sels[0];
                this.customerForm.name=row.potentialCustomer.name;
                this.customerForm.tel=row.potentialCustomer.linkManTel;
                this.customerForm.customerSource=row.potentialCustomer.customerSource.requence;
            },
            planDateChange(v){
                console.debug(v)
                //日期选择器值变化时，赋值
                this.form.planTime=v;
            },
            //获取潜在用户列表
            getCustomerDevPlans() {
                let param = {
                    currentPage: this.currentPage,
                    pageSize: this.pageSize,
                    planSubject: this.searchForm.planSubject
                };
                //开启加载框
                this.listLoading = true;
                this.$http.patch("/customerDevPlan/selectPageByQuery",param).then(res=>{
                    console.debug(res);
                    this.customerDevPlans = res.data.result;
                    //console.debug(this.customerDevPlans)
                    this.total = res.data.total;
                    this.listLoading = false;
                });
            },
            //当前页改变的时候，触发事件
            handleCurrentChange(v){
                //修改当前页
                this.currentPage = v;
                this.getCustomerDevPlans();
                this.listLoading = true;
            },
            //每页条数改变的时候触发事件
            handleSizeChange(v){
                this.currentPage = 1;
                this.pageSize = v;
                this.getCustomerDevPlans();
                this.listLoading = true;
            },
            //修改开发计划
            handleEdit(i,r){
                this.form={};
                //获取计划实施方式列表，加载到下拉列表
                this.getPlanTypes();
                this.title = "修改客户开发计划";
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
                            this.$http.post("/customerDevPlan/update", param).then(res => {
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
                                    this.getCustomerDevPlans();
                                } else {
                                    this.$notify.error({
                                        title: '错误',
                                        message: res.data.msg
                                    });
                                }
                            });
                        } else {
                            //保存数据
                            this.$http.put("/customerDevPlan/save", param).then(res => {
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
                                    this.getCustomerDevPlans();
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
                    this.$http.delete("/customerDevPlan/delete/"+r.id).then(res=>{
                        console.debug("我进来了")
                        if(res.data.success){
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                            this.getCustomerDevPlans();
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
                //如果选择数量不为1，就隐藏
                if(this.sels.length!==1){
                    this.disabled=true;
                }else{//若是选中一个
                    //如果开发状态不是1(即不是开发完成)，也要隐藏转正按钮
                    console.debug(this.sels)
                    if(this.sels[0].developStatus!==1){
                        this.disabled=true;
                    }else{
                        this.disabled=false;
                    }
                }

            },
            //转正后将开发计划删除
            formalCustomerRemove(){
                //删除当前选中行，已转正的潜在用户开发计划
                this.$http.patch("/customerDevPlan/batchDelete",this.sels).then(res=>{
                    if(res.data.success){
                        //删除成功重新加载
                        this.getCustomerDevPlans();
                    }else{
                        this.$message.error(res.data.msg);
                    }
                })
            },
            //批量删除
            batchRemove(){
                console.debug(this.sels)
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.$http.patch("/customerDevPlan/batchDelete",this.sels).then(res=>{
                        if(res.data.success){
                            //NProgress.done();
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                            this.getCustomerDevPlans();
                        }else{
                            this.$message.error(res.data.msg);
                        }
                    })
                }).catch(() => {
                });
            }
        },
        mounted() {
            this.getCustomerDevPlans();

        }
    }
</script>

<style scoped>

</style>