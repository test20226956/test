<script setup>
import {Document, Edit, Plus, RefreshRight, Search} from "@element-plus/icons-vue";
import { ref, reactive, computed, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElLoading,  FormItemProps, FormProps } from 'element-plus'

const route = useRoute();
const router = useRouter();
const axios = inject('axios');

let currentPage = ref(1);
let pageSize = ref(10);
let total = ref(0);
let proCurrentPage = ref(1);
let proPageSize = ref(5);
let proTotal = ref(0);
const size = ref('default');
const dialogVisible = ref(false);
const addDialogVisible = ref(false);
const labelPosition = ref('right')
const userId = ref(sessionStorage.getItem('userId'));

const bloodAtter = (row, column, cellValue) =>{
  return cellValue+'型'
}
const floorAtter = (row, column, cellValue) =>{
  return cellValue+'层'
}

const searchCust = ref({
  name: '',
});
const searchPro = ref({
  name: '',
});

const addedRe = ref({
  proName: '',
  times: '',
  nursingTime: '',
  nursingServiceId: '',
});
const addformRules = reactive({
  times: [
    { required: true, message: '请选择护理次数', trigger: 'blur' },
  ],
  nursingTime: [
    { required: true, message: '请选择护理时间', trigger: 'blur' },
  ],
});

const customerList = ref([]);
const proList = ref([]);

const handleSizeChange = (val) => {
  pageSize.value = val;
  searchCustByName();
  console.log(`${val} items per page`)
}
const handleCurrentChange = (val) => {
  currentPage.value = val;
  searchCustByName();
  console.log(`current page: ${val}`)
}
const handleProSizeChange = (val) => {
  proPageSize.value = val;
  getCustPro();
  console.log(`${val} items per page`)
}
const handleProCurrentChange = (val) => {
  proCurrentPage.value = val;
  getCustPro();
  console.log(`current page: ${val}`)
}

const init = () => {
  //const userid = sessionStorage.getItem('userId');
  const userid = userId.value ;
  let url = 'UserController/showUserCust';
  const data = {
    userId : userid,
    pageNum: currentPage.value,
    pageSize: pageSize.value
  };
  axios.get(url,{ params: data }).then(response => {
    let rb = response.data;
    if (rb.status == 200) {
      console.log(rb.data)
      customerList.value = rb.data
      total.value = rb.total
    } else {
      alert(rb.msg);
    }
  }).catch(error => console.log(error));
}
init();

const searchCustByName = () => {
  if(searchCust.value.name == ''){
    init();
  }else{
    let url = 'UserController/searchUserCust';
    const userid = userId.value ;
    //const userid = sessionStorage.getItem('userId');
    const data = {
      userId : userid,
      name: searchCust.value.name,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    };
    axios.get(url,{ params: data }).then(response => {
      let rb = response.data;
      if (rb.status == 200) {
        customerList.value = rb.data;
        total.value = rb.total
      }
    }).catch(error => console.log(error));
  }
}

const showCustPro = (row) => {
  dialogVisible.value = true;
  searchPro.value.name = '';
  custId.value = row.customerId;
  getCustPro();
}

const custId = ref('');
const getCustPro = () => {
  let url = 'UserController/showCustPro';
  const data = {
    customerId: custId.value,
    pageNum : proCurrentPage.value,
    pageSize: proPageSize.value,
  }
  axios.get(url,{ params: data }).then(response => {
    let rb = response.data;
    if (rb.status == 200) {
      proList.value = rb.data;
      proTotal.value = rb.total
    }
  }).catch(error => console.log(error));
}

const searchProByName = () => {
  let url = 'UserController/searchCustPro';
  const data = {
    customerId: custId.value,
    pageNum : proCurrentPage.value,
    pageSize: proPageSize.value,
    name: searchPro.value.name
  }
  axios.get(url,{ params: data }).then(response => {
    let rb = response.data;
    if (rb.status == 200) {
      proList.value = rb.data;
      proTotal.value = rb.total
    }else {
      alert(rb.msg);
    }
  })
}

const addNursingRe = () => {
  let url = "UserController/addCareRecord";
  //let userid = sessionStorage.getItem("userid");
  const userid = userId.value;
  let nursingRecord = {
    customerId: custId.value,
    time: addedRe.value.nursingTime,
    count: addedRe.value.times,
    userId : userid,
    nursingServiceId: addedRe.value.nursingServiceId
  };
  axios.post(url,nursingRecord).then(response => {
    let rb = response.data;
    if (rb.status == 200) {
      ElMessage.success("添加成功");
      addDialogVisible.value = false;
    }else {
      ElMessage.error(rb.msg);
    }
  })
}
const careRecord = ref([]);
const getCareRecord =(row)=>{
  addedRe.value.times = '';
  addedRe.value.nursingTime = '';
  addedRe.value.proName = row.name;
  addedRe.value.nursingServiceId = row.nursingServiceId;
  addDialogVisible.value = true;
}

const reset = () => {
  searchCust.value.name = '';
  pageSize.value = 10;
  currentPage.value = 1;
  init();
}
</script>

<template>
  <div class="layout">
    <!--  上面搜索栏-->
    <div class="search-div">
      <el-row :gutter="20">
        <el-col :span="14" class="search-col">
          <el-form-item label="老人姓名">
            <el-input v-model="searchCust.name" placeholder="请输入老人姓名"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="5" class="search-col">
          <el-button type="primary" plain @click="searchCustByName">
            <el-icon style="margin-right: 5px;">
              <Search/>
            </el-icon>
            搜索
          </el-button>
        </el-col>
        <el-col :span="5" class="search-col">
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
      <el-table :data="customerList" border style="width: 100%;">
        <el-table-column type="index" label="#" width="50" align="center"/>
        <el-table-column prop="name" label="客户姓名" align="center"/>
        <el-table-column prop="age" label="年龄" width="60" align="center"/>
        <el-table-column prop="gender" label="性别" width="60" align="center"/>
        <el-table-column prop="bloodType" label="血型" align="center" :formatter="bloodAtter"/>
        <el-table-column prop="fName" label="联系人" align="center"/>
        <el-table-column prop="tel" label="联系电话" align="center"/>
        <el-table-column prop="floor" label="楼层" align="center" :formatter="floorAtter"/>
        <el-table-column prop="roomNumber" label="房间号" align="center"/>
        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
            <el-button type="primary" size="small" plain @click="showCustPro(scope.row)">
              <el-icon style="margin-right: 5px;"><Document /></el-icon> 查看护理项目
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <div class="page-container">
      <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10,5]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>
  </div>
  <el-dialog title="查看护理服务" v-model="dialogVisible" v-if="dialogVisible" width="40%" >
    <el-row :gutter="20">
      <el-col :span="12" class="search-col">
        <el-form-item label="项目名称">
          <el-input v-model="searchPro.name" placeholder="请输入项目名称"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="4" class="search-col">
        <el-button type="primary" plain @click="searchProByName">
          <el-icon style="margin-right: 5px;">
            <Search/>
          </el-icon>
          搜索
        </el-button>
      </el-col>
      <el-col :span="4" class="search-col">
        <el-button type="info" plain @click="getCustPro">
          <el-icon style="margin-right: 5px;">
            <RefreshRight/>
          </el-icon>
          重置
        </el-button>
      </el-col>
    </el-row>
    <el-table :data="proList" border style="width: 100%;">
      <el-table-column type="index" label="#" width="50" align="center"/>
      <el-table-column prop="name" label="服务名称" align="center"/>
      <el-table-column prop="amount" label="次数" width="60" align="center"/>
      <el-table-column prop="numState" label="数量状态" align="center">
        <template #default="scope">
          <!-- 使用v-if判断状态值 -->
          <el-tag
              v-if="scope.row.state === '数量正常'"
              type="success"
          >
            数量正常
          </el-tag>
          <el-tag
              v-else-if="scope.row.state === '欠费'"
              type="danger"
          >
            欠费
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="timeStatus" label="到期状态" align="center">
        <template #default="scope">
          <!-- 使用v-if判断状态值 -->
          <el-tag
              v-if="scope.row.timeStatus === '未到期'"
              type="success"
          >
            未到期
          </el-tag>
          <el-tag
              v-else-if="scope.row.timeStatus === '到期'"
              type="danger"
          >
            到期
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" align="center">
        <template #default="scope">
          <el-button type="warning" size="small" plain @click="getCareRecord(scope.row)">
            <el-icon style="margin-right: 5px;"><Edit /></el-icon> 添加护理记录
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
        v-model:current-page="proCurrentPage"
        v-model:page-size="proPageSize"
        :page-sizes="[3,5]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="proTotal"
        @size-change="handleProSizeChange"
        @current-change="handleProCurrentChange"
    />
    <el-dialog title="添加护理记录" v-model="addDialogVisible" v-if="addDialogVisible" width="30%" class="dialog-content">
      <el-form
          :model="addedRe"
          :rules="addformRules"
          :label-position="labelPosition"
          label-width="auto">
        <el-form-item label="护理项目" style="width: 60%;">
          <el-input v-model="addedRe.proName" placeholder="请输入姓名" disabled></el-input>
        </el-form-item>
        <el-form-item label="护理次数" style="width: 60%;">
          <el-input v-model="addedRe.times" placeholder="请输入服务次数"></el-input>
        </el-form-item>
        <el-form-item label="护理时间" style="width: 80%;" prop="nursingTime">
          <el-date-picker
              v-model="addedRe.nursingTime"
              type="date"
              placeholder="选择护理时间"
              value-format="YYYY-MM-DD"
              style="width: 60%;"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addNursingRe">添加</el-button>
        </div>
      </template>
    </el-dialog>
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
  margin-top: 40px;
}

.table-search{
  margin-top: 15px;
  margin-bottom: 15px;
}

.dialog-footer {
  text-align: right;
  margin-top: 20px;
}
</style>