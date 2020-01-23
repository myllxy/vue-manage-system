<template>
    <div class="app-container">
        <!-- 工具条 -->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="searchForm">
                <el-form-item>
                    <el-input v-model="searchForm.customer" placeholder="客户名"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="getCustomersTrans">查询</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!-- 列表 -->
        <el-table :data="customertransfer" highlight-current-row v-loading="listLoading"
                  @selection-change="selsChange">
            <el-table-column fixed type="selection">
            </el-table-column>
            <el-table-column type="index" label="id">
            </el-table-column>
            <el-table-column prop="transTime" label="移交时间">
            </el-table-column>
            <el-table-column prop="customer.name" label="跟进客户">
            </el-table-column>
            <el-table-column prop="transUser.realName" label="移交人员">
            </el-table-column>
            <el-table-column prop="oldSeller.realName" label="原营销人员">
            </el-table-column>
            <el-table-column prop="newSeller.realName" label="新营销人员">
            </el-table-column>
            <el-table-column fixed="right" prop="transReason" label="移交原因">
            </el-table-column>
            <el-table-column fixed="right" label="操作">
                <template slot-scope="scope">
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
    </div>
</template>

<script>
    export default {
        data() {
            return {
                /* 查询form */
                searchForm: {
                    customer: ""
                },
                customertransfer: [],
                total: 0,
                pageSize: 10,
                currentPage: 1,
                listLoading: false,
                /* 列表选中列 */
                sels: [],
                addLoading: false,
            }
        },
        methods: {
            /* 当前页发生变化时,会触发这个函数 */
            handleCurrentChange(val) {
                this.currentPage = val;
                this.getCustomersTrans();
            },
            /* 获取客户跟进历史列表 */
            getCustomersTrans() {
                /* 前台需要传给后台当前页和每页大小以及查询条件 */
                let param = {
                    /* 注意这些变量名必须和对应的query实体类中的属性名一致 */
                    currentPage: this.currentPage,
                    pageSize: this.pageSize,
                    customer: this.searchForm.customer
                };
                this.listLoading = true;
                this.$http.patch("/customertransfer/selectPageByQuery", param).then(res => {
                    this.customertransfer = res.data.result;
                    this.total = res.data.total;
                    this.listLoading = false;
                });
            },
            handleDel(i, r) {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.$http.delete("/customertransfer/delete/" + r.id).then(res => {
                        if (res.data.success) {
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                            this.getCustomersTrans();
                        } else {
                            this.$message.error(res.data.msg);
                        }
                    })
                }).catch(() => {
                });
            },
            selsChange: function (sels) {
                this.sels = sels;
            },
            batchRemove() {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.$http.patch("/customertransfer/batchDelete", this.sels).then(res => {
                        if (res.data.success) {
                            this.$message({
                                message: '删除成功',
                                type: 'success'
                            });
                            this.getCustomersTrans();
                        } else {
                            this.$message.error(res.data.msg);
                        }
                    })
                }).catch(() => {
                });
            }
        },
        mounted() {
            this.getCustomersTrans();
        }
    }

</script>
<style scoped>
</style>