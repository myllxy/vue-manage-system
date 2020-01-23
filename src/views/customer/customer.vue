<template>
    <section>
        <!-- 工具条 -->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="searchForm">
                <el-form-item>
                    <el-input v-model="searchForm.status" placeholder="客户状态"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="getCustomers">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd">新增</el-button>
                </el-form-item>
                <el-button class="el-icon-star-off" @click="showCustomerTraceHistoryDialog()">&nbsp;客户跟进</el-button>
                <!-- 只有市场部经理才能进行客户移交操作 -->
                <template v-if="getSessionItem()">
                    <el-button class="el-icon-share" @click="showCustomerTransferDialog()">&nbsp;客户移交</el-button>
                </template>
                <el-button class="el-icon-close" @click="add2ResourcePool()">&nbsp;放入资源池</el-button>
                <el-button class="el-icon-search" @click="reportCustomerSource()">&nbsp;客户来源报表</el-button>
            </el-form>
        </el-col>
        <!-- 列表 -->
        <el-table :data="customers" highlight-current-row v-loading="listLoading" @selection-change="changeSels"
                  style="width: 100%;">
            <el-table-column fixed type="selection" width="55">
            </el-table-column>
            <el-table-column type="index" width="100" label="id">
            </el-table-column>
            <el-table-column prop="name" label="客户名称" width="170">
            </el-table-column>
            <!-- :formatter将0\1分别转换成女和男显示 -->
            <el-table-column prop="gender" label="性别" :formatter="genderFormatter" width="170">
            </el-table-column>
            <el-table-column prop="tel" label="电话" width="170">
            </el-table-column>
            <el-table-column prop="seller.username" label="营销人员" width="170">
            </el-table-column>
            <el-table-column prop="customerSource.name" label="客户来源" width="170">
            </el-table-column>
            <el-table-column fixed="right" prop="status" label="客户状态" width="170">
                <template slot-scope="scope">
                    <span v-if="scope.row.status === '初始录入'" style="color:#37B328">
                        {{ scope.row.status }}</span>
                    <span v-if="scope.row.status === '已跟进'" style="color: #ff131a">
                        {{ scope.row.status }}</span>
                    <span v-if="scope.row.status === '已放入资源池'" style="color: #2b39ff">
                        {{ scope.row.status }}</span>
                </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="240">
                <template slot-scope="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!-- 工具条 -->
        <el-col :span="24" class="toolbar">
            <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange"
                           :page-size="pageSize"
                           :current-page="currentPage"
                           :total="total" style="float:right;">
            </el-pagination>
        </el-col>

        <!-- 新增与修改界面 -->
        <!-- 注意这个双向绑定 -->
        <el-dialog :title="title"
                   :visible.sync="addFormVisible">
            <el-form :model="addForm" label-width="80px" :rules="addFormRules" ref="addForm">
                <el-form-item label="客户名称" prop="name">
                    <el-input v-model="addForm.name" auto-complete="off"></el-input>
                </el-form-item>
                <!-- :label-position label-width必须在一起才能同时生效 -->
                <el-form-item label="性别" prop="gender" label-position="left" label-width="50px">
                    <el-radio v-model="addForm.gender" :label="1">男</el-radio>
                    <el-radio v-model="addForm.gender" :label="0">女</el-radio>
                </el-form-item>
                <el-form-item label="电话" prop="tel" label-position="left" label-width="50px">
                    <el-input v-model="addForm.tel" auto-complete="off"></el-input>
                </el-form-item>
                <!-- 只有市场部经理才能进行客户移交操作 -->
                <template v-if="getSessionItem()">
                    <el-form-item label="营销人员" prop="seller">
                        <el-select value-key="sn" v-model="addForm.seller" placeholder="请选择营销人员">
                            <el-option v-for="item in seller"
                                       :key="item.sn"
                                       :value="item"
                                       :label="item.username"></el-option>
                        </el-select>
                    </el-form-item>
                </template>
                <!-- 新增客户所有用户都可以选择营销人员 -->
                <template v-else-if="this.title==='新增客户'">
                    <el-form-item label="营销人员" prop="seller">
                        <el-select value-key="sn" v-model="addForm.seller" placeholder="请选择营销人员">
                            <!-- seller中相当于存储了label与value映射关系在页面刚刚加载的时候 -->
                            <!-- 而现在我拿到了addForm.seller,它被处理成一个编号即sn,根据映射规则就能拿到对应的username了 -->
                            <!-- 回显成功 -->
                            <el-option v-for="item in seller"
                                       :key="index.sn"
                                       :value="item"
                                       :label="item.username"></el-option>
                        </el-select>
                    </el-form-item>
                </template>
                <el-form-item label="客户来源" prop="customerSource">
                    <el-select value-key="requence" v-model="addForm.customerSource" placeholder="请选择客户来源">
                        <el-option v-for="item in customerSourceDic"
                                   :key="item.requence"
                                   :value="item"
                                   :label="item.name"></el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="addFormVisible = false">取消</el-button>
                <el-button type="primary" @click.native="submitConsumer" :loading="addLoading">提交</el-button>
            </div>
        </el-dialog>
        <!-- 客户跟进 -->
        <el-dialog :title="title"
                   :visible.sync="dialogVisible"
                   width="30%">
            <el-form :model="traceCusHisForm" label-width="80px" :rules="traceCusHisFormRules" ref="traceCusHisForm">
                <el-form-item label="跟进主题" prop="title">
                    <el-input v-model="traceCusHisForm.title" auto-complete="off"></el-input>
                </el-form-item>
                <!-- :label-position label-width必须在一起才能同时生效 -->
                <el-form-item label="跟进效果" prop="traceResult">
                    <el-radio v-model="traceCusHisForm.traceResult" :label="1">良</el-radio>
                    <el-radio v-model="traceCusHisForm.traceResult" :label="0">中</el-radio>
                    <el-radio v-model="traceCusHisForm.traceResult" :label="-1">差</el-radio>
                </el-form-item>
                <el-form-item label="跟进方式" prop="traceType">
                    <el-select value-key="requence" v-model="traceCusHisForm.traceType" placeholder="请选择跟进方式">
                        <el-option v-for="item in customerTraceTypeDic"
                                   :key="item.requence"
                                   :value="item"
                                   :label="item.name"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="跟进人" prop="traceUser">
                    <el-select value-key="sn" v-model="traceCusHisForm.traceUser" placeholder="请选择营销人员">
                        <el-option v-for="item in customerTraceUserDic"
                                   :key="item.sn"
                                   :value="item"
                                   :label="item.username"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="跟进时间" prop="traceTime">
                    <el-date-picker v-model="traceCusHisForm.traceTime" align="right" type="date"
                                    @change="getTime"
                                    value-format="yyyy-MM-dd"
                                    placeholder="请输入跟进时间">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="备注" prop="remark">
                    <el-input v-model="traceCusHisForm.remark" type="textarea" :rows="3" placeholder="请输入内容">
                    </el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click.native="submitConsumerTraceHistory" :loading="addLoading">提交
                </el-button>
            </div>
        </el-dialog>
        <!-- 客户来源报表 -->
        <el-dialog :title="title"
                   :visible.sync="customerSourceVisible"
                   @open="getCustomerSourcesEcharts()"
                   width="30%">
            <div style="width:450px ;height:250px" ref="chart"></div>
        </el-dialog>
        <!-- 客户移交 -->
        <el-dialog :title="title"
                   :visible.sync="transferVisible"
                   width="30%">
            <el-form :model="transferCustomerForm" label-width="100px" :rules="transferCustomerFormRules"
                     ref="transferCustomerForm">
                <el-form-item label="客户：" prop="customer">
                    {{transferCustomerForm.customer.name}}
                </el-form-item>
                <!-- :label-position label-width必须在一起才能同时生效 -->
                <el-form-item label="原营销人员：" prop="oldSeller">
                    <!-- 原营销人员不需要修改,显示出来就好了 -->
                    {{transferCustomerForm.oldSeller.username}}
                </el-form-item>
                <el-form-item label="移交时间" prop="traceTime">
                    <el-date-picker v-model="transferCustomerForm.transTime" align="right" type="date"
                                    @change="_getTime"
                                    value-format="yyyy-MM-dd"
                                    placeholder="请输入移交时间">
                    </el-date-picker>
                </el-form-item>
                <el-form-item label="新营销人员：" prop="newSeller">
                    <el-select value-key="sn" v-model="transferCustomerForm.newSeller" placeholder="请选择新营销人员">
                        <el-option v-for="item in seller"
                                   :key="item.sn"
                                   :value="item"
                                   :label="item.username"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="移交原因：" prop="traceUser">
                    <el-input v-model="transferCustomerForm.transReason" type="textarea" :rows="3"
                              placeholder="请输入移交原因">
                    </el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="transferVisible = false">取消</el-button>
                <el-button type="primary" @click.native="submitConsumerTransfer" :loading="addLoading">提交
                </el-button>
            </div>
        </el-dialog>

    </section>
</template>

<script>
    export default {
        data() {
            return {
                /* 查询addForm */
                searchForm: {
                    status: ''
                },
                value: "",
                /* 注意并不是全部而是当前页的客户数 */
                customers: [],
                total: 0,
                pageSize: 10,
                currentPage: 1,
                listLoading: false,
                /* 列表选中列 */
                sels: [],
                /* 客户来源数据字典 */
                customerSourceDic: [],
                /* 跟进方式数据字典 */
                customerTraceTypeDic: [],
                /* 跟进用户 */
                customerTraceUserDic: [],
                /* 营销人员 */
                seller: [],
                title: "",
                /* 客户新增修改弹出框是否显示 */
                addFormVisible: false,
                /* 客户跟进弹出框是否显示 */
                dialogVisible: false,
                /* 客户来源报表弹出框是否显示 */
                customerSourceVisible: false,
                /* 客户移交弹出框是否显示 */
                transferVisible: false,
                editLoading: false,
                editFormRules: {
                    name: [
                        {required: true, message: '请输入姓名', trigger: 'blur'}
                    ],
                    tel: [
                        {required: true, message: '请输入电话号', trigger: 'blur'}
                    ]
                },
                addLoading: false,
                /* 客户新增规则 */
                addFormRules: {
                    name: [
                        {required: true, message: '请输入姓名', trigger: 'blur'}
                    ],
                    tel: [
                        {required: true, message: '请输入电话号', trigger: 'blur'}
                    ]
                },
                /* 客户跟进规则 */
                traceCusHisFormRules: {
                    title: [
                        {required: true, message: '请输入主题', trigger: 'blur'}
                    ],
                },
                /* 客户新增界面数据 */
                /* 客户移交规则 */
                transferCustomerFormRules: {
                    transReason: [
                        {required: true, message: '请输入移交原因', trigger: 'blur'}
                    ],
                },
                /* 客户新增界面表单数据 */
                addForm: {
                    name: '',
                    gender: '',
                    tel: '',
                    seller: '',
                    customerSource: '',
                },
                /* 客户跟进界面表单数据 */
                traceCusHisForm: {
                    customer: '',
                    title: '',
                    traceResult: '',
                    traceType: '',
                    traceUser: '',
                    remark: '',
                    traceTime: ''
                },
                /* 客户移交界面表单数据 */
                transferCustomerForm: {
                    customer: '',
                    transReason: '',
                    oldSeller: '',
                    newSeller: ''
                },
                /* 客户来源的名字 */
                customerSourceName: [],
                /* 客户来源的名字出现次数 */
                customerSourceTime: [],
            }
        },
        methods: {
            /* 获取输入的时间 */
            getTime(v) {
                this.traceCusHisForm.traceTime = v;
            },
            _getTime(v) {
                this.transferCustomerForm.traceTime = v;
            },
            showCustomerTraceHistoryDialog() {
                this.title = '客户跟进';
                /* 代表一次只能跟进一个客户 */
                /* 并且只有初始录入的客户才能选择进行跟进 */
                if (this.sels.length !== 1) {
                    this.$confirm('请选中一个客户后再进行操作', '提示', {
                        type: 'warning'
                    });
                }
                else if (this.sels[0].status !== '初始录入') {
                    this.$confirm('只有状态为初始录入的客户才能选择进行跟进', '提示', {
                        type: 'warning'
                    });
                } else {
                    this.dialogVisible = true;
                }
            },
            showCustomerTransferDialog() {
                this.title = '客户移交';
                /* 代表一次只能移交一个客户 */
                if (this.sels.length === 1) {
                    this.transferCustomerForm.customer = this.sels[0];
                    this.transferCustomerForm.oldSeller = this.sels[0].seller;
                    this.transferVisible = true;
                } else {
                    this.$confirm('请选中一个客户后再进行操作', '提示', {
                        type: 'warning'
                    });
                }
            },
            reportCustomerSource() {
                this.$http.patch("/customer/list").then(res => {
                    this.customerSourceName = [];
                    this.customerSourceTime = [];
                    /* 这种东西我们一般将res打印出来找到我们需要的属性来填充就好了 */
                    let results = res.data;
                    let resultSet = new Set();
                    for (let result of results) {
                        /* 拿到所有客户来源的名字并去重 */
                        resultSet.add(result.customerSource.name);
                    }
                    let customerSourceName = '';
                    let customerSourceTime = 0;
                    for (let i of resultSet) {
                        for (let result of results) {
                            if (result.customerSource.name === i) {
                                customerSourceName = i;
                                customerSourceTime++;
                            }
                        }
                        this.customerSourceName.push(customerSourceName);
                        this.customerSourceTime.push(customerSourceTime);
                        customerSourceTime = 0;
                    }
                    this.customerSourceVisible = true;
                });
            },
            add2ResourcePool() {
                this.title = '放入资源池';
                /* 代表一次只能移交一个客户 */
                if (this.sels.length !== 1) {
                    this.$confirm('请选中一个客户后再进行操作', '提示', {
                        type: 'warning'
                    });
                }
                else if (this.sels[0].status !== '已放入资源池') {
                    this.$confirm('确认放入资源池?', '提示', {
                        type: 'warning'
                    }).then(() => {
                        let param = {};
                        param.status = '已放入资源池';
                        param.id = this.sels[0].id;
                        this.$http.post("/customer/update", param).then(res => {
                            if (res.data.success) {
                                this.$message({
                                    message: '放入成功',
                                    type: 'success'
                                });
                                this.getCustomers();
                            } else {
                                this.$message.error(res.data.msg);
                            }
                        })
                    }).catch(() => {
                    });
                } else {
                    this.$confirm('已在资源池中', '提示', {
                        type: 'warning'
                    });
                }
            },
            /* 后台查询客户来源数据字典返回给customerSourceDic */
            getCustomerSourceDic() {
                /* 在这里可以将传入的id写死为1 */
                /* 因为查的是数据字典 */
                this.$http.get("/systemDictionary/getDic/1").then(res => {
                    this.customerSourceDic = res.data;
                });
            },
            /* 后台查询营销人员返回给seller */
            getSeller() {
                this.$http.post("/employee/getEmployee").then(res => {
                    this.seller = res.data;
                });
            },
            getCusTraceHistory() {
                /* 跟进方式对应sn为2的数据字典 */
                this.$http.get("/systemDictionary/getDic/2").then(res => {
                    this.customerTraceTypeDic = res.data;
                });
                /* 跟进用户的下拉框 */
                this.$http.post("/employee/getEmployee").then(res => {
                    this.customerTraceUserDic = res.data;
                });
            },
            /* 性别格式化 */
            genderFormatter(row) {
                let result = row.gender;
                if (result === 0) {
                    return '女';
                } else if (result === 1) {
                    return '男';
                }
            },
            /* 当前页发生变化时,会触发这个函数 */
            handleCurrentChange(val) {
                this.currentPage = val;
                this.getCustomers();
            },
            /* 获取客户列表 */
            getCustomers() {
                /* 前台需要传给后台当前页和每页大小以及查询条件 */
                let param = {
                    /* 注意这些变量名必须和对应的query实体类中的属性名一致 */
                    currentPage: this.currentPage,
                    pageSize: this.pageSize,
                    status: this.searchForm.status
                };
                this.listLoading = true;
                this.$http.patch("/customer/selectPageByQuery", param).then(res => {
                    /* 这种东西我们一般将res打印出来找到我们需要的属性来填充就好了 */
                    this.customers = res.data.result;
                    this.total = res.data.total;
                    this.listLoading = false;
                });
            },
            getCustomerSourcesEcharts() {
                this.$nextTick(() => {
                    /* 基于准备好的dom，初始化echarts实例 */
                    let baseChart = this.$refs.chart;
                    let myChart = this.$echarts.init(baseChart);
                    /* 绘制图表 */
                    myChart.setOption({
                        title: {text: '客户来源报表'},
                        tooltip: {},
                        xAxis: {
                            data: this.customerSourceName
                        },
                        yAxis: {},
                        series: [{
                            name: '客户来源统计',
                            type: 'bar',
                            data: this.customerSourceTime
                        }]
                    });
                });
            },
            getSessionItem() {
                let user = sessionStorage.getItem("user");
                let userObj = eval('(' + user + ')');
                return userObj.username === 'employee_1';
            },
            handleDel(i, r) {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.$http.delete("/customer/delete/" + r.id).then(res => {
                        if (res.data.success) {
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                            this.getCustomers();
                        } else {
                            this.$message.error(res.data.msg);
                        }
                    })
                }).catch(() => {
                });
            },
            handleEdit(i, r) {
                this.title = "修改客户";
                if (r.status === '已放入资源池') {
                    this.$confirm('该客户已在资源池中,确认先让其回到初始录入状态再修改?', '提示', {
                        type: 'warning'
                    }).then(() => {
                        let param = {};
                        param.status = '初始录入';
                        param.id = r.id;
                        this.$http.post("/customer/update", param).then(res => {
                            if (res.data.success) {
                                this.getCustomers();
                                this.addLoading = false;
                                this.addFormVisible = true;
                                /* 回显数据 */
                                this.addForm = Object.assign({}, r);
                            } else {
                                this.$notify.error({
                                    title: '错误',
                                    message: res.data.msg
                                });
                            }
                        });
                    }).catch(() => {
                    });
                } else {
                    this.addLoading = false;
                    this.addFormVisible = true;
                    /* 回显数据 */
                    this.addForm = Object.assign({}, r);
                }
            },
            handleAdd() {
                /* 因为修改与新增用的同一个addForm */
                this.addForm = [];
                this.addFormVisible = true;
                this.title = "新增客户";
            },
            submitConsumerTraceHistory() {
                this.$refs.traceCusHisForm.validate((valid) => {
                    if (valid) {
                        // this.addLoading = true;
                        /* 获取traceCusHisForm表单中的数据 */
                        let param = Object.assign({}, this.traceCusHisForm);
                        /* 一次只能跟进一个客户 */
                        param.customer = this.sels[0];
                        /* 在customer.vue页面只能进行跟进,管理跟进用户需要在跟进用户信息管理页面 */
                        this.$http.put("/customertracehistory/save", param).then(res => {
                            if (res.data.success) {
                                this.addLoading = false;
                                this.$message({
                                    message: '跟进成功',
                                    type: 'success'
                                });
                                /* 跟进成功后修改客户信息管理中对应的客户状态为已跟进 */
                                param.status = '已跟进';
                                param.id = param.customer.id;
                                this.$http.post("/customer/update", param).then(res => {
                                    if (res.data.success) {
                                        this.$refs['traceCusHisForm'].resetFields();
                                        this.dialogVisible = false;
                                        this.getCustomers();
                                    }
                                });
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
            submitConsumerTransfer() {
                this.$refs.transferCustomerForm.validate((valid) => {
                    if (valid) {
                        this.addLoading = true;
                        /* 获取transferCustomerForm表单中的数据 */
                        let param = Object.assign({}, this.transferCustomerForm);
                        /* 一次只能移交一个客户 */
                        param.customer = this.sels[0];
                        param.transUser = eval('(' + sessionStorage.getItem("user") + ')');
                        console.debug(param);
                        this.$http.put("/customertransfer/save", param).then(res => {
                            if (res.data.success) {
                                this.addLoading = false;
                                let param2 = {};
                                param2.seller = param.newSeller;
                                param2.id = this.sels[0].id;
                                this.$http.post("/customer/update", param2).then(res => {
                                    if (res.data.success) {
                                        this.transferVisible = false;
                                        this.getCustomers();
                                        this.$message({
                                            message: '移交成功',
                                            type: 'success'
                                        });
                                    } else {
                                        this.$message.error(res.data.msg);
                                    }
                                });
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
            submitConsumer() {
                this.$refs.addForm.validate((valid) => {
                    if (valid) {
                        this.addLoading = true;
                        /* 获取addForm表单中的数据 */
                        let param = Object.assign({}, this.addForm);
                        if (param.id) {
                            /* 通过表单中是否有id来判断是新增还是修改 */
                            this.$http.post("/customer/update", param).then(res => {
                                /* 有id就代表是修改 */
                                if (res.data.success) {
                                    this.addLoading = false;
                                    this.$message({
                                        message: '提交成功',
                                        type: 'success'
                                    });
                                    this.addFormVisible = false;
                                    this.$refs['addForm'].resetFields();
                                    this.getCustomers();
                                } else {
                                    this.$notify.error({
                                        title: '错误',
                                        message: res.data.msg
                                    });
                                }
                            });
                        } else {
                            /* 没有id就代表是新增,因为id设置了主键自增 */
                            this.$http.put("/customer/save", param).then(res => {
                                if (res.data.success) {
                                    this.addLoading = false;
                                    this.$message({
                                        message: '提交成功',
                                        type: 'success'
                                    });
                                    this.addFormVisible = false;
                                    /* 重置addForm表单 */
                                    this.$refs['addForm'].resetFields();
                                    this.getCustomers();
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
            changeSels(sels) {
                this.sels = sels;
            },
            batchRemove() {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.$http.patch("/customer/batchDelete", this.sels).then(res => {
                        if (res.data.success) {
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                            this.getCustomers();
                        } else {
                            this.$message.error(res.data.msg);
                        }
                    })
                }).catch(() => {
                });
            }
        },
        mounted() {
            this.getCustomers();
            /* 在页面加载的时候就获取下拉框的数据 */
            this.getCustomerSourceDic();
            this.getSeller();
            this.getCusTraceHistory();
        }
    }
</script>
<style scoped>
</style>
