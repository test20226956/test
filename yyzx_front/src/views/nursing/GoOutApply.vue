<script setup>
import {Delete, Edit, Plus, RefreshRight, Search} from "@element-plus/icons-vue";
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
let reCurrentPage = ref(1);
let rePageSize = ref(3);
let reTotal = ref(0);
const size = ref('default');
const dialogVisible = ref(false);
const reDialogVisible = ref(false);
const labelPosition = ref('right')

//数据参数
const userId = ref(8)
const searchCust = ref({
  name: '',
});
const searchRecord = ref({
  time: '',
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
  outTime: '',
  expectedReturnTime: '',
  reason: '',
  customerId: ''
})
const recordFormRules = reactive({
  outTime: [
    { required: true, message: '请选择外出时间', trigger: 'blur' },
  ],
  expectedReturnTime: [
    { required: true, message: '请输入预计回院时间', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请选择合同到期时间'))
        } else if (value <= recordInfo.value.outTime) {
          callback(new Error('预计回院时间必须晚于外出时间'))
        } else {
          callback()
        }
      }
    }
  ],
  reason: [
    { required: true, message: '请输入外出原因', trigger: 'blur' },
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
  let url = 'GoOutController/showCust';
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
  if (!searchCust.value.name) {
    init();
  }else{
    const userid = userId.value;
    //const userId = sessionStorage.getItem('userId');
    if (!searchCust.value.name) {
      ElMessage.error('请输入搜索信息')
      return
    }
    const data = {
      userId : userid,
      name: searchCust.value.name,
      pageSize : pageSize.value,
      pageNum : currentPage.value
    };
    axios.get('GoOutController/searchCust',{ params: data }).then(response => {
      let rb = response.data;
      if (rb.status == 200) {
        customerList.value = rb.data;
        total.value = rb.total
      }else {
        ElMessage.error(rb.msg);
      }
    }).catch(error => console.log(error));
  }
}

const checkOutApp = (row) => {
  dialogVisible.value = true;
  recordInfo.value = row;
  recordInfo.value.fName = "小李";
  //recordInfo.value.applyUser = sessionStorage.getItem('userName');
}

const custId = ref('')
const getCheckOutApp = (row) => {
  reDialogVisible.value = true;
  custId.value = row.customerId;
  searchRecord.value.time = '';
  getRecordList();
}

const getRecordList = () => {
  const url = 'GoOutController/showCustGoOutRe';
  const data = {
    customerId: custId.value,
  };
  axios.get(url,{ params: data }).then(response => {
    let rb = response.data;
    if (rb.status == 200) {
      recordList.value = rb.data;
      reTotal.value = rb.total;
    }else {
      alert(rb.msg);
    }
  }).catch(error => console.log(error));
}

const searchRecordByTime = () => {
  if (!searchRecord.value.time) {
    ElMessage.error('请输入搜索信息')
    return
  }
  const url = 'GoOutController/searchCustGoOutRe';
  const data = {
    customerId: custId.value,
    outTime: searchRecord.value.time,
    pageNum: reCurrentPage.value,
    pageSize: rePageSize.value
  };
  axios.get(url,{ params: data }).then(response => {
    let rb = response.data;
    if (rb.status == 200) {
      recordList.value = rb.data;
      reTotal.value = rb.total;
    }else {
      alert(rb.msg);
    }
  }).catch(error => console.log(error));
}
const addApply = () => {
  const url = 'GoOutController/addGoOutRe';
  const userid = userId.value ;
  //const userid = sessionStorage.getItem('userId');
  const data = {
    customerId: recordInfo.value.customerId,
    outTime: recordInfo.value.outTime,
    expectedReturnTime: recordInfo.value.expectedReturnTime,
    nurseId: userid,
    reason: recordInfo.value.reason
  };
  axios.post(url,data).then(res =>{
    let data = res.data;
    if (data.status == 200) {
      ElMessage.success("申请成功");
      dialogVisible.value = false;
    }else {
      ElMessage.error(data.msg);
    }
  })
}

const back = (row) => {
  if(row.state==='通过'){
    const outRecordId = row.outRecordId;
    const url = `GoOutController/custGoOutCome?outRecordId=${outRecordId}`;
    axios.post(url).then(res =>{
      let data = res.data;
      if (data.status == 200) {
        ElMessage.success(data.msg);
      }else {
        ElMessage.error(data.msg);
      }
    })
  }else{
    ElMessage.error("该申请未通过无法完成该操作")
  }

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
              <el-icon style="margin-right: 5px;"><Edit /></el-icon> 外出申请
            </el-button>
            <el-button type="danger" size="small" plain @click="getCheckOutApp(scope.row)">
              <el-icon style="margin-right: 5px;"><Delete /></el-icon> 申请记录
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
  <el-dialog title="外出申请审批" v-model="dialogVisible" width="40%" class="dialog-content">
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
        房间号：{{recordInfo.room}}
      </el-col>
    </el-row>
    <el-row gutter="20" justify="start">
      <el-col :span="9" :offset="3" >
        性别：{{recordInfo.gender}}
      </el-col>
      <el-col :span="9" >
        床位：{{recordInfo.bed}}
      </el-col>
    </el-row>
    <el-row gutter="20" justify="start">
      <el-col :offset="3" :span="18" >
        申报人：{{recordInfo.fName}}
      </el-col>
    </el-row>
    <el-form
        :model="recordInfo"
        :rules="recordFormRules"
        :label-position="labelPosition"
        label-width="auto">
      <el-form-item label="外出时间" prop="outTime">
        <el-date-picker
            v-model="recordInfo.outTime"
            type="date"
            placeholder="选择外出时间"
            value-format="YYYY-MM-DD"
            style="width: 60%;"
        />
      </el-form-item>
      <el-form-item label="预计回院时间" prop="expectedReturnTime">
        <el-date-picker
            v-model="recordInfo.expectedReturnTime"
            type="date"
            placeholder="选择预计回院时间"
            value-format="YYYY-MM-DD"
            style="width: 60%;"
        />
      </el-form-item>
      <el-form-item label="外出原因" prop="reason">
        <el-input
            v-model="recordInfo.reason"
            style="width: 240px"
            :rows="2"
            type="textarea"
            placeholder="请输入外出原因"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="addApply">提交</el-button>
      </div>
    </template>
  </el-dialog>
  <el-dialog title="退住申请记录" v-model="reDialogVisible" width="51%" class="dialog-content">
    <el-row :gutter="20">
      <el-col :offset="2" :span="12" class="search-col">
        <el-form-item label="外出时间" prop="applyTime">
          <el-date-picker
              v-model="searchRecord.time"
              type="date"
              placeholder="选择外出时间"
              value-format="YYYY-MM-DD"
              style="width: 60%;"
          />
        </el-form-item>
      </el-col>
      <el-col :span="4" class="search-col">
        <el-button type="primary" plain @click="searchRecordByTime">
          <el-icon style="margin-right: 5px;">
            <Search/>
          </el-icon>
          搜索
        </el-button>
      </el-col>
      <el-col :span="4" class="search-col">
        <el-button type="info" plain @click="getRecordList">
          <el-icon style="margin-right: 5px;">
            <RefreshRight/>
          </el-icon>
          重置
        </el-button>
      </el-col>
    </el-row>
    <el-table :data="recordList" border style="width: 100%" height="280px">
      <el-table-column type="index" label="#" align="center" width="48px"/>
      <el-table-column prop="name" label="老人姓名" align="center" width="90px"/>
      <el-table-column prop="outTime" label="外出时间" width="100px" align="center"/>
      <el-table-column prop="expectedReturnTime" label="预计回院时间" width="110px" align="center" />
      <el-table-column prop="reason" label="外出原因" width="100px" align="center"/>
      <el-table-column prop="checkName" label="审核人" width="80px" align="center"/>
      <el-table-column prop="examineTime" label="审核时间" width="100px"align="center"/>
      <el-table-column prop="state" label="审核状态" width="90px" align="center" />
      <el-table-column label="操作" width="120" align="center">
        <template #default="scope">
          <el-button type="warning" size="small" plain @click="back(scope.row)">
            <el-icon style="margin-right: 5px;"><Edit /></el-icon> 回院登记
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