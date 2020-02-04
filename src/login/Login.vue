<template>
    <div class="login-wrap">
        <div class="ms-login">
            <div class="ms-title">后台管理系统</div>
            <el-form :model="ruleForm2" :rules="rules2" ref="ruleForm2" label-position="left" label-width="65px"
                     class="ms-content">
                <el-form-item prop="account" label="账号：">
                    <el-input type="text" v-model="ruleForm2.account" auto-complete="off" placeholder="账号">
                        <!--<el-button slot="prepend" icon="el-icon-lx-people"></el-button>-->
                    </el-input>
                </el-form-item>
                <el-form-item prop="checkPass" label="密码：">
                    <el-input type="password" v-model="ruleForm2.checkPass" auto-complete="off" placeholder="密码">
                    </el-input>
                </el-form-item>
                <el-checkbox v-model="checked" checked class="remember">记住密码</el-checkbox>
                <div class="login-btn">
                    <el-form-item style="width:100%;">
                        <el-button type="primary" style="width:47%;" @click.native.prevent="handleSubmit2"
                                   :loading="logining">登录系统
                        </el-button>
                        <el-button type="primary" style="width:47%;" @click.native.prevent="handleRegTenent">公司入驻
                        </el-button>
                    </el-form-item>
                </div>
            </el-form>
        </div>
    </div>
</template>

<script>
    export default {
        data() {
            return {
                logining: false,
                ruleForm2: {
                    account: 'employee_1',
                    checkPass: 'admin'
                },
                rules2: {
                    account: [
                        {required: true, message: '请输入账号', trigger: 'blur'},
                        //{ validator: validaePass }
                    ],
                    checkPass: [
                        {required: true, message: '请输入密码', trigger: 'blur'},
                        //{ validator: validaePass2 }
                    ]
                },
                checked: true
            }
                ;
        },
        methods: {
            handleRegTenent() {
                alert(111111111)
                //跳转到入驻界面
                //this.$router.push({ path: '/RegTenent' });
            },
            handleSubmit2(ev) {
                var _this = this;
                this.$refs.ruleForm2.validate((valid) => {
                    if (valid) {
                        //_this.$router.replace('/table');
                        this.logining = true;
                        //NProgress.start();
                        var loginParams = {username: this.ruleForm2.account, password: this.ruleForm2.checkPass};
                        this.$http.post("/login", loginParams).then(data => {
                            this.logining = false;
                            //NProgress.done();
                            let {msg, success, object} = data.data;
                            if (!success) {
                                this.$message({
                                    message: msg,
                                    type: 'error'
                                });
                            } else {
                                sessionStorage.setItem('user', JSON.stringify(object.object));
                                //存储sessionId
                                sessionStorage.setItem('sessionId', object.sessionId);
                                this.$router.push({path: '/Dashboard'});
                            }
                        });
                    } else {
                        console.log('error submit!!');
                        return false;
                    }
                });
            }
        }
    }
</script>

<style scoped>
    .login-wrap {
        position: relative;
        width: 100%;
        height: 100%;
        background-image: url("../assets/img/login-bg.jpg");
        background-size: 100%;
    }

    .ms-title {
        width: 100%;
        line-height: 50px;
        text-align: center;
        font-size: 20px;
        color: #fff;
        border-bottom: 1px solid #ddd;
    }

    .ms-login {
        position: absolute;
        left: 50%;
        top: 50%;
        width: 350px;
        margin: -190px 0 0 -175px;
        border-radius: 5px;
        background: rgba(255, 255, 255, 0.3);
        overflow: hidden;
    }

    .ms-content {
        padding: 30px 30px;
    }

    .login-btn {
        text-align: center;
    }

    .login-btn button {
        width: 100%;
        height: 36px;
        margin-bottom: 10px;
    }

    .login-tips {
        font-size: 12px;
        line-height: 30px;
        color: #fff;
    }
</style>