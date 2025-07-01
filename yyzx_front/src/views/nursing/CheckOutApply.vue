<script setup>
import {Document, Edit, Plus, RefreshRight, Search} from "@element-plus/icons-vue";
import { ref, reactive, computed, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage} from 'element-plus'

const route = useRoute();
const router = useRouter();
const axios = inject('axios');

//页面控制参数
let currentPage = ref(1);
let pageSize = ref(10);
let total = ref(0);
const size = ref('default');
const dialogVisible = ref(false);
const reDialogVisible = ref(false);
const labelPosition = ref('right')

const userId = ref(sessionStorage.getItem('userId'));
//数据参数
const searchCust = ref({
  name: '',
});

const customerList = ref([])
const recordList = ref([])
const recordInfo = ref({
  name: '',
  floor: '',
  age: '',
  gender: '',
  roomNumber: '',
  bedNumber: '',
  fName: '',
  applyTime: '',
  type: '',
  reason: '',
  state: '',
  customerId: ''
})
const recordFormRules = reactive({
  applyTime: [
    { required: true, message: '请选择退住时间', trigger: 'blur' },
  ],
  type: [
    { required: true, message: '请选择退住类型', trigger: 'blur' },
  ],
  reason: [
      { required: true, message: '请输入退住原因', trigger: 'blur' },
  ],
})

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
const bloodAtter = (row, column, cellValue) =>{
  return cellValue+'型'
}
const floorAtter = (row, column, cellValue) =>{
  return cellValue+'层'
}

const init = () => {
  //const userid = sessionStorage.getItem('userId');
  const userid = userId.value;
  console.log(userid)
  let url = 'CheckOutController/showCust';
  const data = {
    userId : userid,
    pageNum: currentPage.value,
    pageSize: pageSize.value
  };
  axios.get(url,{ params: data }).then(response => {
    let rb = response.data;
    if (rb.status == 200) {
      customerList.value = rb.data
      total.value = rb.total
    } else {
      ElMessage.error(rb.msg);
    }
  }).catch(error => console.log(error));
}
init();

const searchCustByName = () => {
  if(searchCust.value.name==''){
    init();
  }else {
    if (!searchCust.value.name) {
      ElMessage.error('请输入搜索信息')
      return
    }
    //const userid = sessionStorage.getItem('userId');
    const userid = userId.value;
    const data = {
      userId : userid,
      name: searchCust.value.name,
      pageSize : pageSize.value,
      pageNum : currentPage.value
    };
    axios.get('CheckOutController/searchCust',{ params: data }).then(response => {
      let rb = response.data;
      if (rb.status == 200) {
        customerList.value = rb.data;
        total.value = rb.total
      }else {
        alert(rb.msg);
      }
    }).catch(error => console.log(error));
  }

}

const checkOutApp = async (row) => {
  dialogVisible.value = true;
  recordInfo.value = row;
  recordInfo.value.nName = "小李";
}

const getCheckOutApp = (row) => {
  reDialogVisible.value = true;
  const url = 'CheckOutController/showCustCheckOutRe';
  const data = {
    customerId: row.customerId
  };
  axios.get(url,{ params: data }).then(response => {
    let rb = response.data;
    if (rb.status == 200) {
      recordList.value = rb.data;
    }else {
      ElMessage.error(rb.msg);
    }
  }).catch(error => console.log(error));
}

const addApply = () => {
  const url = 'CheckOutController/addCheckOutRe';
  const userid = userId.value;
  //const userid = sessionStorage.getItem('userId');
  const outRecord = {
    customerId: recordInfo.value.customerId,
    type: recordInfo.value.type,
    applyTime: recordInfo.value.applyTime,
    nurseId: userid,
    reason: recordInfo.value.reason
  };
  console.log(outRecord)
  axios.post(url,outRecord).then(res =>{
    let data = res.data;
    if (data.status == 200) {
      ElMessage.success("申请成功");
      dialogVisible.value = false;
    }else {
      ElMessage.error(data.msg);
    }
  })
}

const reset = () => {
  pageSize.value = 10;
  currentPage.value = 1;
  init();
  searchCust.value.name = '';
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
        <el-table-column type="index" label="#" align="center"/>
        <el-table-column prop="name" label="客户姓名" width="100" align="center"/>
        <el-table-column prop="age" label="年龄" width="60" align="center"/>
        <el-table-column prop="gender" label="性别" width="60" align="center" />
        <el-table-column prop="identity" label="身份证号" width="180" align="center"/>
        <el-table-column prop="bloodType" label="血型" align="center" :formatter="bloodAtter"/>
        <el-table-column prop="fName" label="联系人" align="center"/>
        <el-table-column prop="tel" label="联系电话" align="center" width="180"/>
        <el-table-column prop="floor" label="楼层" align="center" :formatter="floorAtter"/>
        <el-table-column prop="roomNumber" label="房间号" align="center"/>
        <el-table-column prop="checkInTime" label="入住时间" width="160" align="center"/>
        <el-table-column prop="endTime" label="合同到期时间" width="160" align="center"/>
        <el-table-column label="操作" width="240" align="center">
          <template #default="scope">
            <el-button type="warning" size="small" plain @click="checkOutApp(scope.row)">
              <el-icon style="margin-right: 5px;"><Edit /></el-icon> 退住申请
            </el-button>
            <el-button type="primary" size="small" plain @click="getCheckOutApp(scope.row)">
              <el-icon style="margin-right: 5px;"><Document /></el-icon> 查看申请记录
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
  <el-dialog title="退住申请" v-model="dialogVisible" width="35%" class="dialog-content">
    <!--    以文字的形式展示record中的信息，不需要输入和修改-->
    <el-row gutter="20" justify="start">
      <el-col :span="9" :offset="3" >
        老人姓名：{{recordInfo.name}}
      </el-col>
      <el-col :span="9" >
        楼层：{{recordInfo.floor}}
      </el-col>
    </el-row>
    <el-row gutter="20"  justify="start">
      <el-col :span="9" :offset="3" >
        年龄：{{recordInfo.age}}
      </el-col>
      <el-col :span="9" >
        房间号：{{recordInfo.roomNumber}}
      </el-col>
    </el-row>
    <el-row gutter="20" justify="start">
      <el-col :span="9" :offset="3" >
        性别：{{recordInfo.gender}}
      </el-col>
      <el-col :span="9" >
        床位：{{recordInfo.bedNumber}}
      </el-col>
    </el-row>
    <el-row gutter="20" justify="start">
      <el-col :offset="3" :span="18" >
        申报人：{{recordInfo.nName}}
      </el-col>
    </el-row>
    <el-row gutter="20" justify="start">
      <el-col :offset="3" :span="18" >
        <el-form
            :model="recordInfo"
            :rules="recordFormRules"
            :label-position="labelPosition"
            label-width="auto">
          <el-form-item label="申报时间" prop="applyTime">
            <el-date-picker
                v-model="recordInfo.applyTime"
                type="date"
                placeholder="选择退住时间"
                value-format="YYYY-MM-DD"
                style="width: 80%;"
            />
          </el-form-item>
          <el-form-item label="退住类型" prop="type">
            <el-select v-model="recordInfo.type" placeholder="请选择老人类型" style="width: 80%;">
              <el-option label="正常退住" value="0"></el-option>
              <el-option label="死亡退住" value="1"></el-option>
              <el-option label="保留床位" value="2"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="退住原因" prop="checkOutTime">
            <el-input
                v-model="recordInfo.reason"
                style="width: 300px"
                :rows="2"
                type="textarea"
                placeholder="请输入退住原因"
            />
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>


    <template #footer>
      <div class="dialog-footer">
        <el-button @click="addApply">提交</el-button>
      </div>
    </template>
  </el-dialog>
  <el-dialog title="退住申请记录" v-model="reDialogVisible" width="40%" class="dialog-content">
    <el-table :data="recordList" border style="width: 100%;">
      <el-table-column type="index" label="#" align="center"/>
      <el-table-column prop="name" label="老人姓名" align="center"/>
      <el-table-column prop="applyTime" label="申请时间" width="100" align="center"/>
      <el-table-column prop="type" label="申请类型" align="center" />
      <el-table-column prop="reason" label="退住原因" align="center"/>
      <el-table-column prop="checkName" label="审核人" align="center"/>
      <el-table-column prop="examineTime" label="审核时间" align="center"/>
      <el-table-column prop="state" label="审核状态" align="center" />
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

.table-container{
  width: 100%;
  flex: 1;
  //border: 2px solid darkblue;
  background-color: white;
  border-radius: 8px;
  padding: 0 16px 0 16px;
  box-sizing: border-box;
}

.dialog-footer {
  text-align: right;
  margin-top: 20px;
}

.dialog-content {
  text-align: left;
}
.dialog-content .el-row {
  margin-bottom: 15px;
}

.dialog-content .el-col {
  text-align: left;
}
</style>