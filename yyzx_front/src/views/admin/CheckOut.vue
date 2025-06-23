<script setup>
import {Delete, Edit, Plus, RefreshRight, Search} from "@element-plus/icons-vue";
import { ref, reactive, computed, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElLoading,  FormItemProps, FormProps } from 'element-plus'

const route = useRoute()
const router = useRouter()
const axios = inject('axios');

//页面控制参数
let currentPage = ref(1);
let pageSize = ref(3);
let total = ref(0);
const size = ref('default');
const reDialogVisible = ref(false);
const labelPosition = ref('right')

const checkOutList = ref([])
const searchCheckOut = reactive({
  name: '',
  state: '',
  checkOutTime: '',
})
const recordInfo = ref({
  id : '',
  name: '',
  age: '',
  gender: '',
  floor: '',
  room: '',
  bed: '',
  applyUser: '',
  applyType: '',
  reason: '',
  checkOutTime: '',
})

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
const typeAtter = (row, column, cellValue) =>{
  console.log(cellValue)
  return cellValue === 0 ? '审核通过' : '审核未通过'
}
const sexAtter = (row, column, cellValue) =>{
  return cellValue === 0 ? '男' : '女'
}
const init = () => {
  let url = 'CheckOutController/searchCheckOut';
  console.log(url)
  const data = {
    pageNum: currentPage.value,
    pageSize: pageSize.value
  };
  axios.get(url,{ params: data }).then(response => {
    let rb = response.data;
    if (rb.status == 200) {
      console.log(rb.data)
      checkOutList.value = rb.data
      total.value = rb.total
    } else {
      alert(rb.msg);
    }
  }).catch(error => console.log(error));
}
init();

const searchCheckOutRe = () => {
  let url = 'CheckOutController/showCheckOut';
  console.log(url)
  const data = {
    pageNum: currentPage.value,
    pageSize: pageSize.value,
    name: searchCheckOut.name,
    state: searchCheckOut.state,
    checkOutTime: searchCheckOut.checkOutTime
  };
  axios.get(url,{ params: data }).then(response => {
    let rb = response.data;
    if (rb.status == 200) {
      checkOutList.value = rb.data
    }else {
      alert(rb.msg);
    }
  })
}

const stateChenge = () => {
  if(searchCheckOut.state == 3) init();
  else{
    let url = 'CheckOutController/searchCheckOut';
    const data = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      state: searchCheckOut.state,
    };
    axios.get(url,{ params: data }).then(response => {
      let rb = response.data;
      if (rb.status == 200) {
        checkOutList.value = rb.data
      }else {
        alert(rb.msg);
      }
    })
  }
}

const getCheckOutRe = (row) => {
  reDialogVisible.value=true;
  const url = 'CheckOutController/getRecord';
  const data = {
    id: row.id
  };
  axios.get(url,{ params: data }).then(response => {
    let rb = response.data;
    if (rb.status == 200) {
      recordInfo.value = rb.data
    }else {
      alert(rb.msg);
    }
  })
}

const pass = () =>{
  const userid = sessionStorage.getItem('userId');
  const data={
    state : 1,
    checkOutRecordId : recordInfo.value.id,
    adminId : userid,
  }
  axios.get("CheckOutController/checkCheckOut",{params:data}).then(res =>{
    let rb = response.data;
      if (rb.status == 200) {
        ElMessage.success("审批成功");
      }else {
        alert(rb.msg);
      }
  })
}
const notPass = () =>{
  const userid = sessionStorage.getItem('userId');
  const data={
    state : 2,
    checkOutRecordId : recordInfo.value.id,
    adminId : userid,
  }
  axios.get("CheckOutController/checkCheckOut",{params:data}).then(res =>{
    let rb = response.data;
    if (rb.status == 200) {
      ElMessage.success("审批成功");
    }else {
      alert(rb.msg);
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
          <el-form-item label="老人姓名">
            <el-input v-model="searchCheckOut.name" placeholder="请输入老人姓名"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="5" class="search-col">
          <el-form-item label="申请日期">
            <el-date-picker
                v-model="searchCheckOut.checkOutTime"
                type="date"
                placeholder="请选择查询起始日期"
                :size="size"
            />
          </el-form-item>
        </el-col>
        <el-col :span="2" class="search-col">
          <el-button type="primary" plain @click="searchCheckOutRe">
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
          <el-select v-model="searchCheckOut.state" placeholder="请选择老人类型" @change="stateChenge">
            <el-option label="全部" value="2"></el-option>
            <el-option label="未审批" value=0></el-option>
            <el-option label="已通过" value=1></el-option>
            <el-option label="已通过" value=3></el-option>
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
      <el-table :data="checkOutList" border style="width: 100%;">
        <el-table-column prop="name" label="老人姓名" align="center"/>
        <el-table-column prop="age" label="年龄" width="60" align="center"/>
        <el-table-column prop="gender" label="性别" width="60" align="center" :formatter="sexAtter"/>
        <el-table-column prop="applyUser" label="申请人" width="100" align="center"/>
        <el-table-column prop="applyType" label="申请类型" align="center" :formatter="typeAtter"/>
        <el-table-column prop="reason" label="退住原因" align="center"/>
        <el-table-column prop="checkOutTime" label="退住时间" align="center"/>
        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
            <el-button type="warning" size="small" plain @click="getCheckOutRe(scope.row)">
              <el-icon style="margin-right: 5px;"><Edit /></el-icon> 审批
            </el-button>
          </template>
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
  <el-dialog title="退住申请审批" v-model="reDialogVisible" width="40%" class="dialog-content">
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
        申报人：{{recordInfo.applyUser}}
      </el-col>
    </el-row>
    <el-row gutter="20" justify="start">
      <el-col :offset="3" :span="18" >
        申报时间：{{recordInfo.checkOutTime}}
      </el-col>
    </el-row>
    <el-row gutter="20" justify="start">
      <el-col :offset="3" :span="18" >
        退住类型：{{recordInfo.applyType}}
      </el-col>
    </el-row>
    <el-row gutter="20" justify="start">
      <el-col :offset="3" :span="18">
        退住原因：{{recordInfo.reason}}
      </el-col>
    </el-row>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="pass">通过</el-button>
        <el-button type="primary" @click="notPass">未通过</el-button>
      </div>
    </template>
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

.dialog-content {
  text-align: left;
}
.dialog-content .el-row {
  margin-bottom: 15px;
}

.dialog-content .el-col {
  text-align: left;
}
.dialog-footer {
  text-align: right;
  margin-top: 20px;
}
</style>