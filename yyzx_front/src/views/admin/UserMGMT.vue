<script setup>
import { ref, reactive, computed, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElLoading,  FormItemProps, FormProps } from 'element-plus'
import {Delete, Edit, Plus, RefreshRight, Search} from "@element-plus/icons-vue";

const route = useRoute()
const router = useRouter()
const axios = inject('axios');

//页面控制参数
let currentPage = ref(1);
let pageSize = ref(3);
let total = ref(0);
const size = ref('default');
const addDialogVisible = ref(false);
const editDialogVisible = ref(false);
const labelPosition = ref('right')

const searchUser = reactive({
  name: '',
  account: '',
  type: '',
});
const userList = ref([]);

const addedUser = ref({
  account: '',
  password: '',
  name: '',
  tel: '',
  emaill: '',
  empolymentDate: '',
  type: 0,
});
const addformRules = reactive({
  name: [
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
  emaill: [
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

const editedUser = ref({
  account: '',
  password: '',
  name: '',
  tel: '',
  emaill: '',
  empolymentDate: '',
  type: 0,
});
const editformRules = reactive({
  name: [
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
  emaill: [
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
  init();
  console.log(`${val} items per page`)
}
const handleCurrentChange = (val) => {
  currentPage.value = val;
  init();
  console.log(`current page: ${val}`)
}
const init = () => {
  let url = 'UserController/showUser';
  const data = {
    cur: currentPage.value,
    pageSize: pageSize.value
  };
  axios.get(url,{ params: data }).then(response => {
    let rb = response.data;
    if (rb.status == 200) {
      userList.value = rb.data
    } else {
      alert(rb.msg);
    }
  }).catch(error => console.log(error));
}
const searchUserByName = () => {
  axios.get('/UserController/searchUser', {
    params: {
      name: searchUser.name,
      account: searchUser.account,
      type: searchUser.type,
      currentPage: currentPage.value,
      pageSize: pageSize.value
    }
  }).then(res => {
    userList.value = res.data.data;
    total.value = res.data.total;
  }).catch(err => {
    ElMessage.error(err.message);
  })
}
const addBntVis = () => {
  addDialogVisible.value=true;
 addedUser.value = {};
}
const addUser = () => {
  axios.post('/UserController/addUser',{

  }).then(res => {
    if (res.data.status == 200) {
      ElMessage.success(res.data.msg);
      addDialogVisible.value = false;
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
        deleteRecord(row.id);
      })
      .catch(() => {
        ElMessage({
          type: "info",
          message: "已取消删除",
        });
      });
}
const deleteRecord = (id) => {
  axios.get('/UserController/deleteUser', {
    params: {
      id: id
    }
  }).then(res => {
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
  axios.post('/UserController/editUser',{

  }).then(res => {
    if (res.data.status == 200) {
      ElMessage.success(res.data.msg);
      editDialogVisible.value = false;
    }
  })
}
</script>

<template>
  <div class="layout">
    <!--  上面搜索栏-->
    <div class="search-div">
      <el-row :gutter="20">
        <el-col :offset="2" :span="5" class="search-col">
          <el-form-item label="用户姓名">
            <el-input v-model="searchUser.name" placeholder="请输入用户姓名"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="5" class="search-col">
          <el-form-item label="用户编号">
            <el-input v-model="searchUser.account" placeholder="请输入用户编号"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="2" class="search-col">
          <el-button type="primary" plain @click="searchUserByName">
            <el-icon style="margin-right: 5px;">
              <Search/>
            </el-icon>
            搜索
          </el-button>
        </el-col>
        <el-col :span="2" class="search-col">
          <el-button type="info" plain>
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
        <el-col :span="2" :offset="1" class="table-search">
          <el-select v-model="searchCust.type" placeholder="请选择老人类型">
            <el-option label="管理员" value=0></el-option>
            <el-option label="健康管家" value=1></el-option>
          </el-select>
        </el-col>
        <el-col :span="2" :offset="18" class="table-search">
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
        <el-table-column prop="name" label="姓名" align="center"/>
        <el-table-column prop="tel" label="联系电话" align="center"/>
        <el-table-column prop="bed" label="邮箱" align="center"/>
        <el-table-column prop="checkInTime" label="入职时间" align="center"/>
        <el-table-column label="操作" width="180" align="center">
          <el-button type="warning" size="small" plain @click="editBntVis(scope.row)">
            <el-icon style="margin-right: 5px;"><Edit /></el-icon> 修改
          </el-button>
          <el-button type="danger" size="small" plain @click="confirmDelete(scope.row)">
            <el-icon style="margin-right: 5px;"><Delete /></el-icon> 删除
          </el-button>
        </el-table-column>
      </el-table>
    </div>
    <div class="page-container">
      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[3,5,7]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>
  </div>
  <el-dialog v-model="editDialogVisible" title="编辑老人信息" width="50%">
    <el-form
        :model="editedUser"
        :rules="editformRules"
        :label-position="labelPosition"
        label-width="auto">
      <el-form-item label="姓名" prop="name"style="width: 60%;">
        <el-input v-model="editedUser.name" placeholder="请输入姓名" disabled></el-input>
      </el-form-item>
      <el-form-item label="员工编号" prop="account">
        <el-input v-model="editedUser.account" placeholder="请输入员工编号" disabled></el-input>
      </el-form-item>
      <el-form-item label="账号密码" prop="password">
        <el-input v-model="editedUser.password" placeholder="请输入账号密码" style="width: 60%;"></el-input>
      </el-form-item>
      <el-form-item label="联系电话" prop="tel">
        <el-input v-model="editedUser.tel" placeholder="请输入联系电话" style="width: 60%;"></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="editedUser.emaill" placeholder="请输入邮箱" style="width: 60%;"></el-input>
      </el-form-item>
      <el-form-item label="到期时间" prop="checkOutTime">
        <el-date-picker
            v-model="editedUser.empolymentDate"
            type="date"
            placeholder="选择合同到期时间"
            value-format="YYYY-MM-DD"
            style="width: 60%;"
        />
      </el-form-item>
    </el-form>
    <el-button type="primary" @click="editUser">编辑</el-button>
  </el-dialog>
  <el-dialog v-model="addDialogVisible" title="添加健康管家信息" width="50%">
    <el-form
        :model="addedUser"
        :rules="addformRules"
        :label-position="labelPosition"
        label-width="auto">
      <el-form-item label="姓名" prop="name"style="width: 60%;">
        <el-input v-model="addedUser.name" placeholder="请输入姓名" disabled></el-input>
      </el-form-item>
      <el-form-item label="员工编号" prop="account">
        <el-input v-model="addedUser.account" placeholder="请输入员工编号" disabled></el-input>
      </el-form-item>
      <el-form-item label="账号密码" prop="password">
        <el-input v-model="addedUser.password" placeholder="请输入账号密码" style="width: 60%;"></el-input>
      </el-form-item>
      <el-form-item label="联系电话" prop="tel">
        <el-input v-model="addedUser.tel" placeholder="请输入联系电话" style="width: 60%;"></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="addedUser.emaill" placeholder="请输入邮箱" style="width: 60%;"></el-input>
      </el-form-item>
      <el-form-item label="到期时间" prop="checkOutTime">
        <el-date-picker
            v-model="addedUser.empolymentDate"
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
.search-div{
  width: 100%;
  flex: 0 0 15%; /* 高度为 20% */
  border: 1px solid ghostwhite;
  border-radius: 12px; /* 圆角半径，可根据需要调整 */
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.1); /* 阴影效果 */
  background-color: white;
}
.table-container{
  width: 100%;
  flex: 1;
  //border: 2px solid darkblue;
  background-color: white;
  border-radius: 8px;
}
.page-container{
  flex: 0 0 10%;
  width: 100%;
  border-radius: 8px;
  //border: 2px solid darkblue;
  display: flex;
  justify-content: center;
  background-color: white;

}
.search-col{
  display: flex;            /* 关键 */
  align-items: center;
  margin-top: 40px;
}

.table-search{
  margin-top: 15px;
  margin-bottom: 15px;
}
</style>