<script setup>
import axios from "axios";
import {Delete, Edit, RefreshRight, Search, Wallet,ShoppingCart} from "@element-plus/icons-vue";
import {onMounted, ref} from "vue";
import {ElMessage, ElMessageBox} from "element-plus";
import dayjs from "dayjs";
// ---------------------分页------------------------
let currentPage = ref(1);
let pageSize = ref(10);
let total = ref(0);
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1
  initCareCustomers()
}
const handleCurrentChange = (val) => {
  currentPage.value = val;
  initCareCustomers()
}
// ---------------------查询所有级别----------------------
const levelOptions = ref([]);
const selectedLevelId = ref(null);

const fetchNursingLevels = async () => {
  try {
    const res = await axios.get('/NursingLevelController/searchNursingLevel');
    if (res.data.status === 200) {
      const levels = res.data.data || [];

      levels.unshift({
        nursingLevelId: 0,
        name: '无级别'
      });

      levelOptions.value = levels;
    }

  } catch (e) {
    console.error("获取护理级别失败", e);
  }
};
// ---------------------初始化、搜索和重置护理老人列表------------------------
const fetchedCustomers = ref([])
const searchCustname = ref('')

const initCareCustomers = async () => {
  try {
    let response;
    if(selectedLevelId.value === 0){
      response = await axios.get('/CustomerController/searchNoLevelCareCust', {
        params: {
          pageNum: currentPage.value,
          pageSize: pageSize.value,
          name: searchCustname.value
        }
      });
    }else {
      response = await axios.get('/CustomerController/searchCareCust', {
        params: {
          pageNum: currentPage.value,
          pageSize: pageSize.value,
          name: searchCustname.value,
          nursingLevelId: selectedLevelId.value ?? null
        }
      });
    }

    const res = response.data
    if (res.status === 200) {
      fetchedCustomers.value = res.data.map(item=>{
        const customerId = item.customer?.customerId || '';
        const name = item.customer?.name || '';
        const age = item.age??'';
        const bloodType = item.customer?.bloodType || '';
        const genderCode = item.customer?.gender;
        const gender = genderCode === 0 ? '男' : genderCode === 1 ? '女' : '';
        const nursingLevel = item.nursingLevel?.name || '';
        const nursingLevelId = item.nursingLevel?.nursingLevelId || '';
        const family = item.family?.name || '';
        const tel = item.family?.tel || '';
        const room = item.room?.roomNumber || '';
        const bed = item.bed?.bedNumber || '';
        const buildingNumber = item.room?.buildingNumber || '';
        const bedInfo = `${buildingNumber}#${room}-${bed}`;

        return {
          customerId,
          name,
          age,
          bloodType,
          gender,
          nursingLevel,
          family,
          tel,
          bedInfo,
          nursingLevelId
        }
      })
      total.value = res.total;
    } else {
      fetchedCustomers.value = []
      total.value = 0
      ElMessage.warning(res.msg || "查询失败")
    }
  } catch (e) {
    console.log(e.message);
    ElMessage.error("系统错误：" + e.message)
  }
}
onMounted(() => {
  initCareCustomers()
  fetchNursingLevels();
})

const handleSearch = () => {
  initCareCustomers()
};

const handleResetSearch = () => {
  selectedLevelId.value = ''
  searchCustname.value = '';
  initCareCustomers()
};
// ---------------------设置服务对象弹窗数据初始化------------------------------
const dialogVisible = ref(false)
const selectedCustomer = ref(null)

const unassignedServices = ref([])
const assignedServices = ref([])

// assignedServices.value =[
//   {nursingLevelId:1,name:'洗头',amount:5,amountState:'正常',endTime:'2025-6-27',timeState:'未到期'},
//   {nursingLevelId:1,name:'洗头',amount:0,amountState:'欠费',endTime:'2025-6-27',timeState:'未到期'}
// ]
//
// unassignedServices.value =[
//   {name:'洗头',price:'免费',period: '每天',time:30},
//   {name:'洗头',price:'免费',period: '每天',time:30}
// ]

const handleViewService = (customer) => {
  selectedCustomer.value = customer
  dialogVisible.value = true

  fetchAssigned();
  fetchUnassigned();
}
// ---------------------获取未购买的项目--------------------------
const unassignedPage = ref(1)
const unassignedPageSize = ref(10)
const unassignedTotal = ref(0)
const unassignedSearchName = ref('');


const handleUnassignedPageChange = (page) => {
  unassignedPage.value = page
  fetchUnassigned()
}
const fetchUnassigned = async () => {
  unassignedServices.value = []
  try {
    const res = await axios.get('/NursingProjectController/searchUnNursingPro', {
      params: {
        customerId:selectedCustomer.value.customerId,
        // pageNum: assignedPage.value,
        // pageSize: assignedPageSize.value,
        name: unassignedSearchName.value
      }
    });
    if (res.data.status === 200) {
      //   看后端具体返回结构
      unassignedServices.value = res.data.data.map(item=>{
        const nursingProjectId = item.nursingProjectId || '';
        const name = item.name || '';
        const price = item.price || '';
        const period = item.period || '';
        const time = item.time || '';
        return{
          nursingProjectId,
          name,
          price,
          period,
          time
        }
      })

      if(unassignedServices.value.length === 0){
        ElMessage.warning("暂无可购买项目");
      }

    } else {
      unassignedServices.value = [];
      ElMessage.warning(res.data.msg);

      // ElMessage.warning(res.data.msg);
      // unassignedTotal.value = 0
    }
  } catch (err) {
    console.error('获取未购买项目失败', err);
    ElMessage.error('无法获取未购买项目');
  }
}
const handleUnassignedSearch = () =>{
  fetchUnassigned()
}
const handleUnassignedSearchReset = () =>{
  unassignedSearchName.value = '';
  fetchUnassigned()
}

// ---------------------获取当前拥有的服务--------------------------
const assignedPage = ref(1)
const assignedPageSize = ref(10)
const assignedTotal = ref(0)

const handleAssignedPageChange = (page) => {
  assignedPage.value = page
  fetchAssigned()
}

const fetchAssigned = async () => {
  assignedServices.value = [];
  try {
    const res = await axios.get('/NursingServiceController/showNursingPro', {
      params: {
        customerId: selectedCustomer.value.customerId,
        // pageNum: assignedPage.value,
        // pageSize: assignedPageSize.value
      }
    });
    if (res.data.status === 200) {
      assignedServices.value = res.data.data.map(item=>{
        const nursingServiceId = item.nursingService?.nursingServiceId || '';
        const name = item.nursingProject?.name || '';
        const amount = item.nursingService?.amount??'';
        const amountState = amount<=0 ? '欠费':'正常';
        const endTime= item.nursingService?.endTime || '';
        const state = item.nursingService?.state??'';
        const timeState = item.nursingService?.state=== -1 ? '到期':'未到期';

        return{
          nursingServiceId,
          name,
          amount,
          amountState,
          endTime,
          state,
          timeState
        }
      })
      assignedTotal.value = res.data.total
    }else if(res.data.status === 500 && res.data.msg ==="查询失败"){
      ElMessage.warning('未查询到购买数据');
      assignedServices.value = []
      assignedTotal.value = 0
    } else {
      assignedServices.value = []
      assignedTotal.value = 0
      ElMessage.warning(res.data.msg);
    }
  } catch (err) {
    console.error('获取当前项目失败', err);
    ElMessage.error('无法获取当前项目');
  }
}

// ---------------------购买服务--------------------------
const purchaseDialogVisible = ref(false)
const purchaseFormRef = ref()

const purchaseForm = ref({
  name: '',
  amount: 1,
  nursingProjectId: null,
  endTime: dayjs().toDate()
})
const purchaseRules = {
  amount: [{ required: true, message: '请输入购买次数', type: 'number', min: 1, trigger: 'blur' }],
  endTime: [{ required: true, message: '请选择到期时间', type: 'date', trigger: 'change' }]
}

const handlePurchase = (row) => {
  purchaseForm.value.nursingProjectId = row.nursingProjectId
  purchaseForm.value.name = row.name
  purchaseForm.value.amount = 1
  // purchaseForm.value.endTime = dayjs().add(31, 'day').toDate()
  // purchaseForm.value.endTime = row.endTime
  purchaseDialogVisible.value = true
}

const handleCancelPurchase = () => {
  purchaseDialogVisible.value = false
}

const submitPurchase = () => {
  purchaseFormRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      await ElMessageBox.confirm(
          `确认要为“${purchaseForm.value.name}”购买 ${purchaseForm.value.amount} 次服务吗？`,
          '确认购买',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
      )
      const res = await axios.post('/NursingServiceController/addNursingPro',{
        customerId: selectedCustomer.value.customerId,
        nursingProjectId: purchaseForm.value.nursingProjectId,
        nursingLevelId: selectedCustomer.value.nursingLevelId,
        amount:purchaseForm.value.amount,
        endTime: dayjs(purchaseForm.value.endTime).format('YYYY-MM-DD'),

      })
      if(res.data.status ===200) {
        ElMessage.success('购买成功！')
        purchaseDialogVisible.value = false
        // 刷新服务列表
        fetchAssigned()
        fetchUnassigned()
      }else {
        ElMessage.warning(res.data.msg)
      }
    } catch (err) {
      console.error('添加失败', err)
      ElMessage.error('添加失败，请联系管理员')
    }
  })
}

// ---------------------------续费-----------------------------
const disabledBeforeToday = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 清除时间部分，仅比较日期
  return date < today; // 禁用今天之前的日期
};

const renewDialogVisible = ref(false)
const renewFormRef = ref()

const renewForm = ref({
  name: '',
  nursingServiceId: null,
  amount: 1,
  endTime: dayjs().add(31, 'day').toDate()
})

const renewRules = {
  amount: [{ required: true, message: '请输入续费次数', type: 'number', min: 1, trigger: 'blur' }],
  endTime: [{ required: true, message: '请选择到期时间', type: 'date', trigger: 'change' }]
}
const handleRenew = (row) => {
  renewForm.value.name = row.name
  renewForm.value.nursingServiceId = row.nursingServiceId
  renewForm.value.amount = 1
  renewForm.value.endTime = row.endTime;
  renewDialogVisible.value = true
}
const handleCancelRenew = () => {
  renewDialogVisible.value = false
}

const submitRenew = () => {
  renewFormRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      await ElMessageBox.confirm(
          `确认为“${renewForm.value.name}”续费 ${renewForm.value.amount} 次服务吗？`,
          '确认续费',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
      )

      const res = await axios.post('/NursingServiceController/editNursingPro', null,{
        params: {
          nursingServiceId: renewForm.value.nursingServiceId,
          amount: renewForm.value.amount,
          endTime: dayjs(renewForm.value.endTime).format('YYYY-MM-DD'),
        }
      })

      if (res.data.status === 200) {
        ElMessage.success('续费成功')
        renewDialogVisible.value = false
        fetchAssigned()
      } else {
        ElMessage.warning(res.data.msg)
      }
    } catch (err) {
      if (err !== 'cancel') {
        console.error('续费异常:', err)
        ElMessage.error('续费失败，请联系管理员')
      }
    }
  })
}
// ---------------------删除已有的服务--------------------------
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(
        `确认要移除服务“${row.name}”吗？`,
        '确认删除',
        {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
    )

    const res = await axios.post('/NursingServiceController/deleteNursingPro', null,{
      params:{
        nursingServiceId: row.nursingServiceId
      }
    })

    if (res.data.status === 200) {
      ElMessage.success('移除成功')
      fetchAssigned()
      fetchUnassigned()
    } else {
      ElMessage.warning(res.data.msg || '移除失败')
    }
  } catch (err) {
    if (err !== 'cancel') {
      console.error('删除失败:', err)
      ElMessage.error('删除失败，请联系管理员')
    }
  }
}

</script>

<template>
  <div class="layout">
    <div class="search-div">
      <el-form-item label="护理级别" style="margin-bottom: 0px">
        <el-select
            v-model="selectedLevelId"
            placeholder="选择护理级别"
            clearable
            style="width: 180px; margin-right: 10px"
        >
          <el-option
              v-for="level in levelOptions"
              :key="level.nursingLevelId"
              :label="level.name"
              :value="level.nursingLevelId"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="客户姓名" style="margin-bottom: 0px">
        <el-input
            v-model="searchCustname"
            placeholder="请输入客户姓名"
            clearable
            class="search-input"
        />
      </el-form-item>

      <el-button type="primary" plain @click="handleSearch">
        <el-icon style="margin-right: 5px;"><Search /></el-icon> 搜索
      </el-button>
      <el-button type="info" plain style="margin-left: 0px" @click="handleResetSearch">
        <el-icon style="margin-right: 5px;"><RefreshRight/></el-icon> 重置
      </el-button>
      <!--      <el-button type="primary" plain @click="handleSearch">搜索</el-button>-->
    </div>
    <div class="table-container">
      <el-table :data="fetchedCustomers" border style="width: 100%;height: 480px; ">
        <el-table-column type="index" label="#" width="50" align="center" />
        <el-table-column prop="name" label="客户姓名" min-width="160"  align="center" />
        <el-table-column prop="age" label="年龄" min-width="80"  align="center" />
        <el-table-column prop="gender" label="性别" min-width="80" align="center"/>
        <el-table-column prop="bloodType" label="血型" min-width="80" align="center" />
        <el-table-column prop="nursingLevel" label="护理级别" min-width="100" align="center" />
        <el-table-column prop="bedInfo" label="床位信息" min-width="100" align="center" />
        <el-table-column prop="family" label="联系人" min-width="160" align="center" />
        <el-table-column prop="tel" label="联系电话" min-width="160" align="center" />

        <el-table-column label="操作" min-width="180" align="center">
          <template #default="scope">
            <el-button type="primary" size="small" plain @click="handleViewService(scope.row)" :disabled="scope.row.nursingLevel === ''">
              <el-icon style="margin-right: 5px;"><Edit /></el-icon>查看护理服务
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

  <el-dialog
      v-model="dialogVisible"
      :title="`查看护理项目 - 客户${selectedCustomer?.name}`"
      width="1260px"
      class="assign-dialog-wrapper"
  >
    <div class="assign-dialog-body">
      <div class="assign-card">
        <!--        <div class="assign-title">可购买项目</div>-->
        <div class="assign-search-bar">
          <el-text style="font-size: 17px;width: 120px;">可购买项目</el-text>
          <el-input v-model="unassignedSearchName" placeholder="请输入项目名称" clearable style="width: 240px"/>
          <el-button type="primary" plain style="margin-left: 0px" @click="handleUnassignedSearch">搜索</el-button>
          <el-button type="info" plain @click="handleUnassignedSearchReset" style="margin-left: 0px">重置</el-button>
        </div>
        <el-table :data="unassignedServices" border size="small" style="width: 100%;height: 300px">
          <el-table-column type="index" label="#" min-width="30" align="center" />
          <el-table-column prop="name" label="项目名称" min-width="100" align="center" />
          <el-table-column prop="price" label="价格" min-width="100" align="center" />
          <el-table-column prop="period" label="执行频次" min-width="100" align="center" />
          <el-table-column prop="time" label="执行时间" min-width="100" align="center" />
          <el-table-column label="操作" min-width="80" align="center">
            <template #default="scope">
              <el-button size="small" type="primary" plain @click="handlePurchase(scope.row)">
                <el-icon style="margin-right: 5px;"><ShoppingCart /></el-icon>购买
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <!--        <el-pagination-->
        <!--            v-model:current-page="unassignedPage"-->
        <!--            :page-size="unassignedPageSize"-->
        <!--            layout="total, prev, pager, next"-->
        <!--            :total="unassignedTotal"-->
        <!--            small-->
        <!--            background-->
        <!--            @current-change="handleUnassignedPageChange"-->
        <!--        />-->

      </div>

      <div class="assign-card">
        <!--        <div class="assign-title">已购买项目</div>-->
        <div class="assign-search-bar">
          <el-text style="font-size: 17px;width: 120px;">已购买项目</el-text>
        </div>
        <el-table :data="assignedServices" border size="small" style="width: 100%;height: 300px">
          <el-table-column type="index" label="#" min-width="30" align="center" />
          <el-table-column prop="name" label="服务名称" min-width="100" align="center" />
          <el-table-column prop="amount" label="次数" min-width="50" align="center" />
          <!--          <el-table-column prop="amountState" label="数量状态" min-width="80" align="center" />-->
          <el-table-column prop="amountState" label="数量状态" min-width="80" align="center">
            <template #default="{ row }">
              <span>
                {{ row.amountState }}
                <span v-if="row.amountState === '欠费'" class="red-dot" />
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="endTime" label="到期时间" min-width="80" align="center" />
          <!--          <el-table-column prop="timeState" label="到期状态" min-width="80" align="center" />-->
          <el-table-column prop="timeState" label="到期状态" min-width="80" align="center">
            <template #default="{ row }">
              <span>
                {{ row.timeState }}
                <span v-if="row.timeState === '到期'" class="red-dot" />
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" min-width="160" align="center">
            <template #default="scope">
              <el-button size="small" type="primary" plain @click="handleRenew(scope.row)" :disabled="scope.row.amount>0 || scope.row.state === -1">
                <el-icon style="margin-right: 5px;"><Wallet /></el-icon>续费
              </el-button>
              <el-button size="small" type="danger" plain @click="handleDelete(scope.row)">
                <el-icon style="margin-right: 5px;"><Delete /></el-icon>删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>



        <!--        <el-pagination-->
        <!--            v-model:current-page="assignedPage"-->
        <!--            :page-size="assignedPageSize"-->
        <!--            layout="total, prev, pager, next"-->
        <!--            :total="assignedTotal"-->
        <!--            small-->
        <!--            background-->
        <!--            @current-change="handleAssignedPageChange"-->
        <!--        />-->
      </div>
    </div>
  </el-dialog>
  <!-- ------------------购买弹窗------------------- -->
  <el-dialog
      v-model="purchaseDialogVisible"
      title="确认购买服务"
      width="300px"
      :before-close="handleCancelPurchase"
  >
    <el-form :model="purchaseForm" :rules="purchaseRules" ref="purchaseFormRef" label-width="90px" label-position="top">
      <el-form-item label="服务名称:">
        <el-input v-model="purchaseForm.name" disabled style="width: 100%;"/>
      </el-form-item>
      <el-form-item label="购买次数:" prop="amount">
        <el-input-number v-model="purchaseForm.amount" :min="1" style="width: 100%;"/>
      </el-form-item>
      <el-form-item label="到期时间:" prop="endTime">
        <el-date-picker
            v-model="purchaseForm.endTime"
            type="date"
            placeholder="选择日期"
            :disabled-date="disabledBeforeToday"
            style="width: 100%;"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleCancelPurchase">取消</el-button>
      <el-button type="primary" @click="submitPurchase">确认购买</el-button>
    </template>
  </el-dialog>
  <!------------------续费弹窗----------------------->
  <el-dialog
      v-model="renewDialogVisible"
      title="确认续费服务"
      width="300px"
      :before-close="handleCancelRenew"
  >
    <el-form :model="renewForm" :rules="renewRules" ref="renewFormRef" label-width="90px" label-position="top">
      <el-form-item label="服务名称:">
        <el-input v-model="renewForm.name" disabled style="width: 100%;" />
      </el-form-item>
      <el-form-item label="续费次数:" prop="amount">
        <el-input-number v-model="renewForm.amount" :min="1" style="width: 100%;" />
      </el-form-item>
      <el-form-item label="到期时间:" prop="endTime">
        <el-date-picker
            v-model="renewForm.endTime"
            type="date"
            placeholder="选择日期"
            :disabled-date="disabledBeforeToday"
            style="width: 100%;"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="handleCancelRenew">取消</el-button>
      <el-button type="primary" @click="submitRenew">确认续费</el-button>
    </template>
  </el-dialog>


</template>

<style scoped>
.layout {
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
  overflow:hidden;
  background-color: #f0f2f5;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.search-div{
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
.search-input {
  width: 240px;
  display: flex;
  align-items: center;
}
.table-container{
  display: flex;
  width: 100%;
  flex: 1;
  background-color: white;
  border-radius: 8px;
  justify-content: center;
  padding: 10px;
  box-sizing: border-box;
  overflow-y: auto;
}

.page-container{
  flex: 0 0 10%;
  width: 100%;
  border-radius: 8px;
  background-color: white;
  display: flex;
  justify-content: end;
  box-sizing: border-box;
  padding: 0px 16px 0px 16px;
}

.assign-dialog-wrapper{
  padding: 24px 28px;
  box-sizing: border-box;
}

.assign-dialog-body {
  display: flex;
  box-sizing: border-box;
}

.assign-card {
  width: 50%;
  border: 1px solid #ebeef5;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  background-color: white;
  box-sizing: border-box;
  gap: 12px;
}

.assign-card .el-pagination {
  align-self: flex-end;
}

.assign-title {
  //flex: 0 0 10%;
  margin-bottom: 14px;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 10px;
  font-size: 17px;
}
.assign-search-bar {
  flex: 0 0 10%;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 10px;
}
.red-dot {
  position: relative;
  display: inline-block;
  width: 8px;
  height: 8px;
  background-color: red;
  border-radius: 50%;
  margin-left: 4px;
  box-shadow: 0 0 6px red;
  animation: pulse 1s infinite ease-in-out;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 6px red;
    opacity: 1;
  }
  50% {
    box-shadow: 0 0 12px red;
    opacity: 0.6;
  }
  100% {
    box-shadow: 0 0 6px red;
    opacity: 1;
  }
}


</style>
