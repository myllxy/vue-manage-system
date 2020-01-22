<template>
    <div class="reg">
        <!--:model="tenant" 数据双向绑定-->
        <!--ref="tenantForm" id="tenantForm",给form去一个名字-->
        <!--:rules="formRules" 校验规则-->
        <el-form :model="employee" ref="tenantForm" :rules="formRules" label-position="left" label-width="100px" class="demo-ruleForm login-container">
            <h3 class="title">公司入驻</h3>
            <el-form-item prop="companyName"label="公司名称">
                <el-input type="text" v-model="employee.companyName" auto-complete="off" placeholder="请输入公司名称！"></el-input>
            </el-form-item>
            <el-form-item prop="companyNum" label="公司座机">
                <el-input type="text" v-model="employee.companyNum" auto-complete="off" placeholder="请输入座机！"></el-input>
            </el-form-item>
            <el-form-item prop="address" label="公司地址">
                <el-input type="text" style="width: 77%" v-model="employee.address" auto-complete="off" placeholder="请输入地址！"></el-input>
                <el-button type="primary" @click="baiduVisible=true">选择地址</el-button>
            </el-form-item>
            <el-form-item prop="username" label="公司账号">
                <el-input type="text" v-model="employee.username" auto-complete="off" placeholder="请输入账号！"></el-input>
            </el-form-item>
            <el-form-item prop="tel" label="手机号码">
                <el-input type="text" v-model="employee.tel" auto-complete="off" placeholder="请输入电话！"></el-input>
            </el-form-item>
            <el-form-item prop="email" label="电子邮件">
                <el-input type="text" v-model="employee.email" auto-complete="off" placeholder="请输入邮件！"></el-input>
            </el-form-item>
            <el-form-item prop="password" label="输入密码">
                <el-input type="password" v-model="employee.password" auto-complete="off" placeholder="请输入密码！"></el-input>
            </el-form-item>
            <el-form-item prop="comfirmPassword" label="确认密码">
                <el-input type="password" v-model="employee.comfirmPassword" auto-complete="off" placeholder="请输入确认密码！"></el-input>
            </el-form-item>
            <el-form-item  label="公司Logo">
                <!--<el-input type="text" v-model="employee.logo" auto-complete="off" placeholder="请输入logo！"></el-input>-->
                <el-upload
                        class="upload-demo"
                        action="http://localhost/file/upload"
                        :on-remove="handleRemove"
                        :auto-upload="false"
                        :on-success="handleSuccess"
                        :file-list="fileList"
                        list-type="picture">
                    <el-button  type="primary">点击上传</el-button>
                    <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                </el-upload>
            </el-form-item>
            <el-form-item style="width:100%;">
                <el-button type="primary" style="width:100%;" @click.native.prevent="settledIn" >入驻</el-button>
            </el-form-item>
        </el-form>

        <el-dialog title="选择地址" :visible.sync="baiduVisible" >
            <baidu-map :center="center" :zoom="11">
                <bm-auto-complete v-model="keyword" :sugStyle="{zIndex: 2100}">
                    <input  id="searchInput" type="text" placeholder="请输入关键字" class="searchinput"/>
                    <el-button type="primary" @click="selectAdrressConfirm">确定</el-button>
                </bm-auto-complete>
                <bm-view class="map"></bm-view>
                <bm-local-search :keyword="keyword" :auto-viewport="true" :panel="false"></bm-local-search>
            </baidu-map>
        </el-dialog>
    </div>
</template>

<script>
	export default {
		data() {
            var validatorPassword = (rule, value, callback) => {
               if (value === '') {
                    callback(new Error('请输入密码'));
                } else if(value!=this.employee.password) {
                    callback(new Error('两次密码不一致!'));
                }else{
                    callback();
			    }
            }
            return {
                keyword:"",
                center:"成都",
                baiduVisible:false,
                fileList: [],
                employee:{
                    companyName: '',
                    companyNum: '',
                    address: '',
                    logo:'',
                    username:'',
                    tel:'',
                    email:'',
                    password:'',
                    comfirmPassword:''
				},
                formRules: {
                    companyName: [
                        { required: true, message: '请输入公司名称!', trigger: 'blur' }
                    ],
                    companyNum: [
                        { required: true, message: '请输入公司座机!', trigger: 'blur' }
                    ],
                    address: [
                        { required: true, message: '请输入公司地址!', trigger: 'blur' }
                    ],
                    /*logo: [
                        { required: true, message: '请输入公司logo!', trigger: 'blur' }
                    ],*/
                    username: [
                        { required: true, message: '请输入账号!', trigger: 'blur' }
                    ],
                    tel: [
                        { required: true, message: '请输入电话!', trigger: 'blur' }
                    ],
                    email: [
                        { type: 'email',required: true, message: '请输入邮箱!', trigger: 'blur' }
                    ],
                    password: [
                        { required: true, message: '请输入密码!', trigger: 'blur' }
                    ]
					,
                    comfirmPassword: [
                        {validator:validatorPassword,required: true, trigger: 'blur' } //自定义校验规则
                    ]
                }
            };
		},
		methods: {
            selectAdrressConfirm(){
                let address = document.getElementById("searchInput").value;
                this.employee.address = address;

                this.baiduVisible = false;

            },
            handleRemove(file, fileList) {
            },
            handleSuccess(response, file, fileList) {
                // console.log(response,file,fileList);
                this.employee.logo = response;
            },
		    //入驻
            settledIn(){
                this.$refs.tenantForm.validate((valid) => {
                        //校验表单成功后才做一下操作
                        if (valid) {

                            let param = Object.assign({}, this.employee);
                            //新增realName属性
                            param.realName = param.companyName;

                            //创建一个租户对象
                            let tenant = {
                                companyName: param.companyName,
                                companyNum:param.companyNum,
                                address:param.address,
                                logoUrl:param.logo,
                                sysUsername:param.username,
								sysPassword:param.password
                            };
                            param.tenant = tenant;
                            console.debug(param)
                            this.$http.put("/tenant/saveTenant", param).then(res => {
                                if(res.data.success){
                                    //跳转到登录界面
                                    this.$router.push({ path: '/login' });
								}else{
                                    this.$notify.error({
                                        title: '错误',
                                        message: res.data.msg
                                    });
								}

                            });
						}
                });
			}
		},
		mounted() {
		}
	}

</script>

<style  scoped>


    .map{
        width: 100%;
        height: 400px;
    }
    .searchinput{
        width: 300px;
        box-sizing: border-box;
        padding: 9px;
        border: 2px solid #dddee1;
        line-height: 20px;
        font-size: 16px;
        height: 38px;
        color: #333;
        position: relative;
        border-radius: 8px;
    }


    .reg {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        background-image: url("../assets/img/login-bg.jpg");
        background-size: cover;
    }
</style>