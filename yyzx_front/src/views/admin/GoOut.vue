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
let pageSize = ref(10);
let total = ref(0);
const size = ref('default');
const reDialogVisible = ref(false);
const labelPosition = ref('right')

const checkOutList = ref([])
const searchCheckOut = ref({
  name: '',
  state: '全部',
  checkOutTime: '',
})
const recordInfo = ref({
  checkOutRecordId : '',
  customerId : '',
  customerName: '',
  age: '',
  gender: '',
  floor: '',
  roomNumber: '',
  bedNumber: '',
  nurseName: '',
  expectedReturnTime: '',
  reason: '',
  outTime: '',
})

const handleSizeChange = (val) => {
  pageSize.value = val;
  searchCheckOutRe();
  console.log(`${val} items per page`)
}
const handleCurrentChange = (val) => {
  currentPage.value = val;
  searchCheckOutRe();
  console.log(`current page: ${val}`)
}

const init = () => {
  let url = 'GoOutController/searchGoOut';
  console.log(url)
  const data = {
    pageNum: currentPage.value,
    pageSize: pageSize.value
  };
  axios.get(url,{ params: data }).then(response => {
    let rb = response.data;
    if (rb.status == 200) {
      console.log(rb.data)
      checkOutList.value = rb.data.map(item => {
        return {
          customerId: item.customerId,
          outRecordId : item.outRecordId,
          age: item.age,
          name: item.customerName,
          gender: item.gender === 0 ? '男' : '女',
          //如果状态为0则表示为未审批，1显示为通过，2表示为审批未通过
          state: item.state === 0 ? '已提交' : item.state === 1 ? '通过' : '未通过',
          applyUser: item.nurseName,
          applyTime: item.applyTime,
          reason: item.reason,
          checkOutTime: item.outTime,
          expectedReturnTime: item.expectedReturnTime,
        }
      })
      total.value = rb.total
    } else {
      alert(rb.msg);
    }
  }).catch(error => console.log(error));
}
init();

const searchCheckOutRe = () => {
  let url = 'GoOutController/searchGoOut';
  // const year = searchCheckOut.value.applyTime.getFullYear()
  // const month = String(searchCheckOut.value.applyTime.getMonth() + 1).padStart(2, '0')
  // const day = String(searchCheckOut.value.applyTime.getDate()).padStart(2, '0')
  // searchCheckOut.value.applyTime = `${year}-${month}-${day}`
  const data = {
    pageNum: currentPage.value,
    pageSize: pageSize.value,
    customerName: searchCheckOut.value.name,
    state: searchCheckOut.value.state === '已提交' ? 0 : searchCheckOut.value.state === '通过' ? 1 : searchCheckOut.value.state ==='未通过' ? 2 : '',
    applyTime: searchCheckOut.value.checkOutTime
  };
  axios.get(url,{ params: data }).then(response => {
    let rb = response.data;
    if (rb.status == 200) {
      checkOutList.value = rb.data.map(item => {
        return {
          customerId: item.customerId,
          outRecordId : item.outRecordId,
          age: item.age,
          name: item.customerName,
          gender: item.gender === 0 ? '男' : '女',
          //如果状态为0则表示为未审批，1显示为通过，2表示为审批未通过
          state: item.state === 0 ? '已提交' : item.state === 1 ? '通过' : '未通过',
          applyUser: item.nurseName,
          reason: item.reason,
          checkOutTime: item.outTime,
          applyTime: item.applyTime,
          expectedReturnTime: item.expectedReturnTime,
        }
      })
      total.value = rb.total
    }else {
      ElMessage.error(rb.msg);
    }
  })
}

const stateChenge = () => {
  if(searchCheckOut.value.state == '全部') init();
  else{
    let url = 'GoOutController/searchGoOut';
    const data = {
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      state: searchCheckOut.value.state === '已提交' ? 0 : searchCheckOut.value.state === '通过' ? 1 : searchCheckOut.value.state ==='未通过' ? 2 : '',
    };
    axios.get(url,{ params: data }).then(response => {
      let rb = response.data;
      if (rb.status == 200) {
        checkOutList.value = rb.data.map(item => {
          return {
            customerId: item.customerId,
            outRecordId : item.outRecordId,
            age: item.age,
            name: item.customerName,
            gender: item.gender === 0 ? '男' : '女',
            //如果状态为0则表示为未审批，1显示为通过，2表示为审批未通过
            state: item.state === 0 ? '已提交' : item.state === 1 ? '通过' : '未通过',
            applyUser: item.nurseName,
            reason: item.reason,
            checkOutTime: item.outTime,
            applyTime: item.applyTime,
            expectedReturnTime: item.expectedReturnTime,
          }
        })
        total.value = rb.total
      }else {
        ElMessage.error(rb.msg);
      }
    })
  }
}

const getCheckOutRe = (row) => {
  if(row.state == '已提交'){
    reDialogVisible.value=true;
    const url = 'GoOutController/getRecord';
    const data = {
      outRecordId: row.outRecordId,
    };
    axios.get(url,{ params: data }).then(response => {
      let rb = response.data;
      if (rb.status == 200) {
        recordInfo.value = rb.data
        recordInfo.value.type = recordInfo.value.type === 0 ? '正常退住' : recordInfo.value.type === 1 ? '死亡退住' : '保留床位';
        recordInfo.value.gender = recordInfo.value.gender === 0 ? '男' : '女';
      }else {
        ElMessage.error(rb.msg);
      }
    })
  }else{
    ElMessage.error('该申请已完成审批');
  }

}

const pass = () =>{
  const userid = sessionStorage.getItem('userId');
  const url = `GoOutController/checkGoOut?state=1&outRecordId=${recordInfo.value.outRecordId}&adminId=${userid}`;
  axios.post(url).then(res =>{
    let rb = res.data;
    if (rb.status == 200) {
      ElMessage.success("审批成功");
      reDialogVisible.value=false;
      init();
    }else {
      ElMessage.error(rb.msg);
    }
  })
}
const notPass = () =>{
  const userid = sessionStorage.getItem('userId');
  const url = `GoOutController/checkGoOut?state=2&outRecordId=${recordInfo.value.outRecordId}&adminId=${userid}`;
  axios.post(url).then(res =>{
    let rb = res.data;
    if (rb.status == 200) {
      ElMessage.success("审批成功");
      reDialogVisible.value=false;
      init();
    }else {
      ElMessage.error(rb.msg);
    }
  })
}

const reset = () => {
 pageSize.value = 10;
 currentPage.value = 1;
 init();
 searchCheckOut.value.checkOutTime = '';
 searchCheckOut.value.name = '';
 searchCheckOut.value.state = '全部';
}
</script>

<template>
  <div class="layout">
    <!--  上面搜索栏-->
    <div class="search-div">
      <el-row :gutter="20">
        <el-col :span="8" class="search-col">
          <el-form-item label="老人姓名">
            <el-input v-model="searchCheckOut.name" placeholder="请输入老人姓名"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8" class="search-col">
          <el-form-item label="申请日期">
            <el-date-picker
                v-model="searchCheckOut.checkOutTime"
                type="date"
                placeholder="请选择查询起始日期"
                :size="size"
            />
          </el-form-item>
        </el-col>
        <el-col :span="3" class="search-col">
          <el-button type="primary" plain @click="searchCheckOutRe">
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
        <el-col class="table-search" style="margin-bottom: 0px">
<!--          <el-select v-model="searchCheckOut.state" placeholder="请选择老人类型" @change="stateChenge">-->
<!--            <el-option label="全部" value="全部"></el-option>-->
<!--            <el-option label="已提交" value="已提交"></el-option>-->
<!--            <el-option label="通过" value="通过"></el-option>-->
<!--            <el-option label="未通过" value="未通过"></el-option>-->
<!--          </el-select>-->
          <el-tabs v-model="searchCheckOut.state" type="card" class="state-tabs" @tab-change="stateChenge">
            <el-tab-pane label="全部" name="全部"></el-tab-pane>
            <el-tab-pane label="已提交" name="已提交"></el-tab-pane>
            <el-tab-pane label="通过" name="通过"></el-tab-pane>
            <el-tab-pane label="未通过" name="未通过"></el-tab-pane>
          </el-tabs>

        </el-col>
      </el-row>
      <el-table :data="checkOutList" border style="width: 100%;overflow-y: auto">
        <el-table-column type="index" label="#" align="center"/>
        <el-table-column prop="name" label="老人姓名" width="150" align="center"/>
        <el-table-column prop="age" label="年龄" width="80" align="center"/>
        <el-table-column prop="gender" label="性别" width="80" align="center" />
        <el-table-column prop="applyUser" label="申请人" width="150" align="center"/>
        <el-table-column prop="reason" label="外出原因"  align="center"/>
        <el-table-column prop="applyTime" label="申请时间" width="150" align="center" />
        <el-table-column prop="checkOutTime" label="外出时间" width="150" align="center" />
        <el-table-column prop="expectedReturnTime" label="回院时间" width="150" align="center"/>
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
      <div class="page-container">
        <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[10,5]"
                       layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
                       @current-change="handleCurrentChange" />
      </div>
    </div>
  </div>
  <el-dialog title="外出申请审批" v-model="reDialogVisible" width="30%" class="dialog-content">
    <!--    以文字的形式展示record中的信息，不需要输入和修改-->
    <el-row gutter="20" justify="start">
      <el-col :span="9" :offset="3" >
        老人姓名：{{recordInfo.customerName}}
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
        申报人：{{recordInfo.nurseName}}
      </el-col>
    </el-row>
    <el-row gutter="20" justify="start">
      <el-col :offset="3" :span="18" >
        外出时间：{{recordInfo.outTime}}
      </el-col>
    </el-row>
    <el-row gutter="20" justify="start">
      <el-col :offset="3" :span="18" >
        回院时间：{{recordInfo.expectedReturnTime}}
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
  box-sizing: border-box;
  padding: 0 16px 0 16px;
  //overflow-y: hidden;
  overflow-y: auto;
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