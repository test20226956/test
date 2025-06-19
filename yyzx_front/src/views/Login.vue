<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <div class="card-header">
          颐养中心系统登录
        </div>
      </template>

      <el-form
          :model="formData"
          :rules="formRules"
          ref="formRef"
          label-width="80px"
          class="login-form"
      >
        <el-form-item
            label="用户编号"
            prop="userCode"
            class="form-item"
        >
          <el-input v-model="formData.userCode" placeholder="请输入6-12位数字编号" />
        </el-form-item>

        <el-form-item
            label="密码"
            prop="password"
            class="form-item"
        >
          <el-input
              v-model="formData.password"
              type="password"
              placeholder="请输入6-16位密码"
          />
        </el-form-item>

        <el-form-item
            class="submit-btn"
        >
          <el-button
              type="primary"
              @click="login"
              class="logbtn"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElLoading } from 'element-plus'
import qs from 'qs';

const router = useRouter();
const axios = inject('axios');

// 响应式数据
const formData = ref({
  userCode: '',
  password: '',
})

// 表单验证规则
const formRules = reactive({
  userCode: [
    { required: true, message: '请输入用户编号', trigger: 'blur' },
    { pattern: /^\d{4,12}$/, message: '请输入4-12位数字', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 4, max: 12, message: '密码长度4-12位', trigger: 'blur' }
  ],
})

const login = () => {
  if (isFormInvalid.value) {
    ElMessage.warning('请检查输入内容')
    return
  }
  let url = 'UserController/login';
  axios.post(url, qs.stringify(user.value)).then(response => {
    let rb = response.data;
    if (rb.status == 200) {
      // 取得登录成功的用户的令牌
      let user = rb.data;
      // 把用户对象变成JSON字符串
      // let userJson=JSON.stringify(user);
      // 把用户令牌存入前端Session中
      sessionStorage.setItem('user', user);
      // 登录成功
      router.push('/framwork');

    } else {
      // 登录失败
      alert(rb.msg);
    }
  }).catch(error => console.log(error));
}

</script>

<style scoped>
.login-container {
  position: absolute;
  left: 950px;
  top: 235px;
  height: 300px;
  padding: 20px;
}

.login-card {
  width: 400px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  padding: 15px 20px;
  background-color: #f0f2f5;
  color: dodgerblue;
  font-size: 18px;
  font-weight: bold;
}

.login-form {
  padding: 30px 25px 25px;
}

/* 新增表单项间距 */
.form-item {
  margin-bottom: 25px;
}

/* 调整按钮间距和样式 */
.submit-btn {
  margin-top:40px;
  text-align: center;
}

.logbtn {
  width: 80%;
  height: 40px;
  font-size: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 优化输入框样式 */
.login-form .el-input {
  width: 100%;
}

/* 优化错误提示位置 */
.login-form .el-form-item__error {
  position: absolute;
  left: 0;
  bottom: -28px;
  font-size: 12px;
  color: #f56c6c;
}

/* 响应式优化 */
@media (max-width: 480px) {
  .login-card {
    width: 90%;
  }
  .login-form {
    padding: 25px 20px;
  }
}
</style>
