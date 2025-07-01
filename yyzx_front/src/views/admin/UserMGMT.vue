<script setup>
import { ref, reactive, computed, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {ElMessage, ElLoading, FormItemProps, FormProps, ElMessageBox} from 'element-plus'
import {Delete, Edit, Plus, RefreshRight, Search} from "@element-plus/icons-vue";

const route = useRoute()
const router = useRouter()
const axios = inject('axios');

//页面控制参数
let currentPage = ref(1);
let pageSize = ref(5);
let total = ref(0);
const size = ref('default');
const addDialogVisible = ref(false);
const editDialogVisible = ref(false);
const labelPosition = ref('right')

const searchUser = ref({
  name: '',
  employmentDate: '',
  type: '',
});
const userList = ref([
    {
      id: 1,
      account: 'admin',
      password: '123456',
      name: '管理员',
      tel: '12345678901',
      emaill: '<EMAIL>',
      empolymentDate: '2021-01-01',
      type: 0,
    },
]);

const addedUser = ref({
  account: '',
  password: '',
  userName: '',
  tel: '',
  email: '',
  employmentDate: '',
  type: 1,
});
const addformRules = reactive({
  userName: [
    { required: true, message: '请输入客户姓名', trigger: 'blur' },
  ],
  account: [
    { required: true, message: '请输入客户编号', trigger: 'blur' },
  ],
  password: [
      //用户密码不为空，且用户密码在8-16位之间
      { required: true, message: '请输入密码', trigger: 'blur' },
      {
        validator: (rule, value, callback) => {
          if (!value) {
            callback(new Error('请输入密码'));
          } else if (value.length < 8 || value.length > 16) {
            callback(new Error('密码长度在8-16位之间'));
          }
          else {
            callback();
          }
        }
      }
  ],
  tel: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入联系电话'));
        } else if (value.length != 11) {
          callback(new Error('电话号码长度为11位'));
        }
        else {
          callback();
        }
      }
    }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入邮箱'));
        } else if (!/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(value)) {
          callback(new Error('请输入正确的邮箱'));
        }
      }
    }
  ],
  employmentDate: [
      { required: true, message: '请选择入职时间', trigger: 'blur' },
  ]
});

const editedUser = ref({
  account: '',
  password: '',
  userName: '',
  tel: '',
  email: '',
  employmentDate: '',
  type: 1,
});
const editformRules = reactive({
  userName: [
    { required: true, message: '请输入客户姓名', trigger: 'blur' },
  ],
  account: [
    { required: true, message: '请输入客户编号', trigger: 'blur' },
  ],
  password: [
    //用户密码不为空，且用户密码在8-16位之间
    { required: true, message: '请输入密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入密码'));
        } else if (value.length < 8 || value.length > 16) {
          callback(new Error('密码长度在8-16位之间'));
        }
        else {
          callback();
        }
      }
    }
  ],
  tel: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入联系电话'));
        } else if (value.length != 11) {
          callback(new Error('电话号码长度为11位'));
        }
        else {
          callback();
        }
      }
    }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入邮箱'));
        } else if (!/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(value)) {
          callback(new Error('请输入正确的邮箱'));
        }
      }
    }
  ],
  type: [
    { required: true, message: '请选择用户类型', trigger: 'blur' },
  ],
  empolymentDate: [
    { required: true, message: '请选择入职时间', trigger: 'blur' },
  ]
});
const handleSizeChange = (val) => {
  pageSize.value = val;
  searchUserByName();
  console.log(`${val} items per page`)
}
const handleCurrentChange = (val) => {
  console.log('current page:', val);
  currentPage.value = val;
  searchUserByName();
  console.log(`current page: ${val}`)
}
const init = () => {
  let url = 'UserController/showUser';
  const data = {
    pageNum: currentPage.value,
    pageSize: pageSize.value
  };
  axios.get(url,{ params: data }).then(response => {
    let rb = response.data;
    console.log(rb.data)
    if (rb.status == 200) {
      userList.value = rb.data
      total.value = rb.total;
    } else {
      ElMessage.error(rb.msg);
    }
  }).catch(error => console.log(error));
}
init();
const searchUserByName = () => {
  if(searchUser.value.name == ''&& searchUser.value.employmentDate == '') init();
  else{
    if(searchUser.value.employmentDate != ''){
      const data = {
        userName: searchUser.value.name,
        employmentDate: searchUser.value.employmentDate,
        currentPage: currentPage.value,
        pageSize: pageSize.value
      };
      axios.get('/UserController/searchUser', {params: data}).then(res => {
        if(res.data.status === 200){
          userList.value = res.data.data;
          total.value = res.data.total;
        }else{
          ElMessage.error(res.data.msg);
        }
      }).catch(err => {
        ElMessage.error(err.message);
      })
    }else{
      const data = {
        userName: searchUser.value.name,
        currentPage: currentPage.value,
        pageSize: pageSize.value
      };
      axios.get('/UserController/searchUser', {params: data}).then(res => {
        if(res.data.status === 200){
          userList.value = res.data.data;
          total.value = res.data.total;
        }else{
          ElMessage.error(res.data.msg);
        }
      }).catch(err => {
        ElMessage.error(err.message);
      })
    }
  }
}
const addBntVis = () => {
  addDialogVisible.value=true;
  addedUser.value = {};
}
const addUser = () => {
  addedUser.value.type = 1;
  axios.post('/UserController/addUser',addedUser.value).then(res => {
    if (res.data.status == 200) {
      ElMessage.success(res.data.msg);
      addDialogVisible.value = false;
      init();
    }else {
      ElMessage.error(res.data.msg);
    }
  })
}

const confirmDelete = (row) => {
  ElMessageBox.confirm("此操作将永久删除该员工信息, 是否继续?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
      .then(() => {
        deleteRecord(row.userId);
      })
      .catch(() => {
        ElMessage({
          type: "info",
          message: "已取消删除",
        });
      });
}
const deleteRecord = (id) => {
  let url = `/UserController/deleteUser?userId=${id}`;
  axios.post( url).then(res => {
    if (res.data.status == 200) {
      ElMessage.success(res.data.msg);
      init();
    }
  })
}
const editBntVis = (row) => {
  editDialogVisible.value=true;
  editedUser.value = row;
}
const editUser = () => {
  axios.post('/UserController/editUser',editedUser.value).then(res => {
    if (res.data.status == 200) {
      ElMessage.success(res.data.msg);
      editDialogVisible.value = false;
      searchUserByName();
    }else{
      ElMessage.error(res.data.msg);
    }
  })
}
const reset = () => {
  pageSize.value = 10;
  currentPage.value = 1;
  init();
  searchUser.value.type = '全部';
  searchUser.value.name = '';
  searchUser.value.employmentDate = '';
}
</script>

<template>
  <div class="layout">
    <!--  上面搜索栏-->
    <div class="search-div">
      <el-row :gutter="20">
        <el-col :span="8" class="search-col">
          <el-form-item label="用户姓名">
            <el-input v-model="searchUser.name" placeholder="请输入用户姓名"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8" class="search-col">
          <el-form-item label="入职日期">
            <el-date-picker
                v-model="searchUser.employmentDate"
                type="date"
                placeholder="请选择查询起始日期"
                :size="size"
                value-format="YYYY-MM-DD"
            />
          </el-form-item>
        </el-col>
        <el-col :span="3" class="search-col">
          <el-button type="primary" plain @click="searchUserByName">
            <el-icon style="margin-right: 5px;">
              <Search/>
            </el-icon>
            搜索
          </el-button>
        </el-col>
        <el-col :span="3" class="search-col">
          <el-button type="info" plain @click="reset">
            <el-icon style="margin-right: 5px;">
              <RefreshRight/>
            </el-icon>
            重置
          </el-button>
        </el-col>
      </el-row>
    </div>
    <div class="table-container">
      <el-row>
        <!--        新增下拉选择框选择老人类型-->
        <el-col :span="2" :offset="22" class="table-search">
          <el-button type="primary" plain @click="addBntVis">
            <el-icon style="margin-right: 5px;">
              <Plus/>
            </el-icon>
            新增
          </el-button>
        </el-col>
      </el-row>
      <el-table :data="userList" border style="width: 100%;">
        <el-table-column prop="account" label="编号" align="center"/>
        <el-table-column prop="userName" label="姓名" align="center"/>
        <el-table-column prop="tel" label="联系电话" align="center"/>
        <el-table-column prop="email" label="邮箱" align="center"/>
        <el-table-column prop="employmentDate" label="入职时间" align="center"/>
        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
            <el-button type="warning" size="small" plain @click="editBntVis(scope.row)">
              <el-icon style="margin-right: 5px;"><Edit /></el-icon> 修改
            </el-button>
            <el-button type="danger" size="small" plain @click="confirmDelete(scope.row)">
              <el-icon style="margin-right: 5px;"><Delete /></el-icon> 删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="page-container">
      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5,10]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>
  </div>
  <el-dialog v-model="editDialogVisible" title="编辑健康管家信息" width="35%">
    <el-form
        :model="editedUser"
        :rules="editformRules"
        :label-position="labelPosition"
        label-width="auto">
      <el-form-item label="姓名" prop="name"style="width: 60%;">
        <el-input v-model="editedUser.userName" placeholder="请输入姓名" disabled></el-input>
      </el-form-item>
      <el-form-item label="员工编号" prop="account" style="width: 60%;">
        <el-input v-model="editedUser.account" placeholder="请输入员工编号" disabled></el-input>
      </el-form-item>
      <el-form-item label="账号密码" prop="password">
        <el-input v-model="editedUser.password" placeholder="请输入账号密码" style="width: 60%;"></el-input>
      </el-form-item>
      <el-form-item label="联系电话" prop="tel">
        <el-input v-model="editedUser.tel" placeholder="请输入联系电话" style="width: 60%;"></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="editedUser.email" placeholder="请输入邮箱" style="width: 60%;"></el-input>
      </el-form-item>
      <el-form-item label="入职时间" prop="checkOutTime" >
        <el-date-picker
            v-model="editedUser.empolymentDate"
            type="date"
            placeholder="选择合同到期时间"
            value-format="YYYY-MM-DD"
            style="width: 60%;"
            disabled
        />
      </el-form-item>
    </el-form>
    <el-button type="primary" @click="editUser">编辑</el-button>
  </el-dialog>
  <el-dialog v-model="addDialogVisible" title="添加健康管家信息" width="35%">
    <el-form
        :model="addedUser"
        :rules="addformRules"
        :label-position="labelPosition"
        label-width="auto">
      <el-form-item label="姓名" prop="userName"style="width: 60%;">
        <el-input v-model="addedUser.userName" placeholder="请输入姓名"></el-input>
      </el-form-item>
      <el-form-item label="员工编号" prop="account" style="width: 60%;">
        <el-input v-model="addedUser.account" placeholder="请输入员工编号"></el-input>
      </el-form-item>
      <el-form-item label="账号密码" prop="password">
        <el-input v-model="addedUser.password" placeholder="请输入账号密码" style="width: 60%;"></el-input>
      </el-form-item>
      <el-form-item label="联系电话" prop="tel">
        <el-input v-model="addedUser.tel" placeholder="请输入联系电话" style="width: 60%;"></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="addedUser.email" placeholder="请输入邮箱" style="width: 60%;"></el-input>
      </el-form-item>
      <el-form-item label="入职时间" >
        <el-date-picker
            v-model="addedUser.employmentDate"
            type="date"
            placeholder="选择合同到期时间"
            value-format="YYYY-MM-DD"
            style="width: 60%;"
        />
      </el-form-item>
    </el-form>
    <el-button type="primary" @click="addUser">添加</el-button>
  </el-dialog>
</template>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px 10px 0 10px;
  margin: 0 0 0 0;
  box-sizing: border-box;
  gap: 16px; /* 区块间距，替代 margin-bottom */
  background-color: #f0f2f5;
}
.search-div {
  width: 100%;
  flex: 0 0 15%;
  border-radius: 12px;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.1);
  background-color: white;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 16px;
  padding: 0 30px 0 30px;
  box-sizing: border-box;
}
.table-container{
  width: 100%;
  flex: 1;
  //border: 2px solid darkblue;
  background-color: white;
  border-radius: 8px;
}
.page-container {
  flex: 0 0 10%;
  width: 100%;
  border-radius: 8px;
  background-color: white;
  display: flex;
  justify-content: end;
  //align-content: center;
  box-sizing: border-box;
  padding: 0px 16px 0px 16px;
  //overflow-x: hidden;
  //flex-direction: column;
}
.search-col{
  display: flex;            /* 关键 */
  align-items: center;
  margin-top: 30px;
}

.table-search{
  margin-top: 15px;
  margin-bottom: 15px;
}
</style>