<script setup>
import {Edit, RefreshRight, Search} from "@element-plus/icons-vue";
import { ref, reactive, computed, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {ElMessage, ElLoading, FormItemProps, FormProps, ElMessageBox} from 'element-plus'

const route = useRoute();
const router = useRouter();
const axios = inject('axios');

let currentPage = ref(1);
let pageSize = ref(10);
let total = ref(0);
const size = ref('default');
const dialogVisible = ref(false);
const addDialogVisible = ref(false);
const labelPosition = ref('right')

const userId = ref(8);
const custId = ref('');
const searchCust = ref({
  name: '',
});

const searchRecord = ref({
  name: '',
  applyTime: '',
});
const customerList = ref([]);
const recordList = ref([]);

const bloodAtter = (row, column, cellValue) =>{
  return cellValue+'型'
}
const floorAtter = (row, column, cellValue) =>{
  return cellValue+'层'
}
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

const init = () => {
  const userid = userId.value;
  //const userid = sessionStorage.getItem('userId');
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
      ElMessage.error(rb.msg);
    }
  }).catch(error => console.log(error));
}
init();

const searchCustByName = () => {
  if(searchCust.value.name === '') init();
  else {
    const userid = userId.value;
    //const userid = sessionStorage.getItem('userId');
    const url = 'UserController/searchUserCust';
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
      }else{
        ElMessage.error(rb.msg);
      }
    }).catch(error => console.log(error));
  }
}

const showProRe = (row) => {
  custId.value = row.customerId;
  dialogVisible.value = true;
  searchRecord.value = {
    name: '',
    applyTime: ''
  }
  getRecord();
}

const getRecord = () => {
  const url = "UserController/showCareRecord";
  const data = {
    customerId : custId.value,
  }
  axios.get(url,{ params: data }).then(response => {
    let rb = response.data;
    if (rb.status == 200) {
      recordList.value = rb.data;
    }else{
      ElMessage.error(rb.msg);
    }
  }).catch(error => console.log(error));
}

const searchRecordByName = () => {
  const url = "UserController/searchCareRecord";
  const data = {
    customerId : custId.value,
    name : searchRecord.value.name,
    time : searchRecord.value.applyTime
  }
  axios.get(url,{ params: data }).then(response => {
    let rb = response.data;
    if (rb.status == 200) {
      recordList.value = rb.data;
    }else {
      alert(rb.msg);
    }
  }).catch(error => console.log(error));
}

const confirmDelete = (row) => {
  ElMessageBox.confirm("此操作将永久删除该护理记录, 是否继续?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
      .then(() => {
        deleteRecord(row.nursingRecordId);
      })
      .catch(() => {
        ElMessage({
          type: "info",
          message: "已取消删除",
        });
      });
}
const deleteRecord = (id) => {
  let url = `UserController/deleteCareRecord?ids=${id}`;
  axios.post(url).then(response => {
    if(response.data.status == 200){
      ElMessage.success("删除成功");
      getRecord();
    }else{
      ElMessage.error(response.data.msg);
    }
  }).catch(error => console.log(error));
}
</script>

<template>
  <div class="layout">
    <!--  上面搜索栏-->
    <div class="search-div">
      <el-row :gutter="20">
        <el-col :offset="2" :span="5" class="search-col">
          <el-form-item label="老人姓名">
            <el-input v-model="searchCust.name" placeholder="请输入老人姓名"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="2" class="search-col">
          <el-button type="primary" plain @click="searchCustByName">
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
            <el-button type="warning" size="small" plain @click="showProRe(scope.row)">
              <el-icon style="margin-right: 5px;"><Edit /></el-icon> 查看护理记录
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
  <el-dialog title="查看护理记录" v-model="dialogVisible" v-if="dialogVisible" width="40%">
    <el-row :gutter="20">
      <el-col :offset="1":span="8" class="search-col">
        <el-form-item label="项目名称">
          <el-input v-model="searchRecord.name" placeholder="请输入项目姓名"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="8" class="search-col">
        <el-form-item label="记录时间">
          <el-date-picker
            v-model="searchRecord.applyTime"
            type="date"
            placeholder="请选择日期"
            :size="size"
          />
        </el-form-item>
      </el-col>
      <el-col :span="3" class="search-col">
        <el-button type="primary" plain @click="searchRecordByName">
          <el-icon style="margin-right: 5px;">
            <Search/>
          </el-icon>
          搜索
        </el-button>
      </el-col>
      <el-col :span="3" class="search-col">
        <el-button type="info" plain @click="getRecord">
          <el-icon style="margin-right: 5px;">
            <RefreshRight/>
          </el-icon>
          重置
        </el-button>
      </el-col>
    </el-row>
    <el-table :data="recordList" border style="width: 100%;" width="300Px" height="240Px">
      <el-table-column type="index" label="#" width="80" align="center"/>
      <el-table-column prop="name" label="服务名称" align="center"/>
      <el-table-column prop="time" label="护理时间" width="150" align="center"/>
      <el-table-column label="操作" width="120" align="center">
        <template #default="scope">
          <el-button type="warning" size="small" plain @click="confirmDelete(scope.row)">
            <el-icon style="margin-right: 5px;"><Edit /></el-icon> 删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
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

.dialog-footer {
  text-align: right;
  margin-top: 20px;
}
</style>