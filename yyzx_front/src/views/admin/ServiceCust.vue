<script setup>
import axios from "axios";
import {Delete, Edit, RefreshRight, Search} from "@element-plus/icons-vue";
import {onMounted, ref} from "vue";
import {ElMessage, ElMessageBox} from "element-plus";
// ---------------------分页------------------------
let currentPage = ref(1);
let pageSize = ref(10);
let total = ref(0);
const handleSizeChange = (val) => {
  pageSize.value = val;
  currentPage.value = 1
  initCaregivers()
}
const handleCurrentChange = (val) => {
  currentPage.value = val;
  initCaregivers()
}
// ---------------------初始化、搜索和重置管家列表------------------------
const fetchedCaregivers = ref(null)
const searchAccount = ref('')
const searchName = ref('')
const formatState = (row) => {
  return row.state === 0 ? '空闲' : '有客户'
}

const initCaregivers = async () => {
  try {
    const response = await axios.get('/UserController/searchUser', {
      params: {
        pageNum: currentPage.value,
        pageSize: pageSize.value,
        account: searchAccount.value,
        userName: searchName.value
      }
    })

    const res = response.data
    if (res.status === 200) {
      fetchedCaregivers.value = res.data
      total.value = res.total
    } else{
      fetchedCaregivers.value = []
      total.value = 0
      ElMessage.warning(res.msg || "未查询到管家数据")
    }
  } catch (e) {
    ElMessage.error("系统错误，请管理员联系")
  }
}
onMounted(() => {
  initCaregivers()
})

const handleSearch = () => {
  initCaregivers()
};

const handleResetSearch = () => {
  searchName.value = '';
  searchAccount.value = '';
  initCaregivers()
};
// ---------------------设置服务对象弹窗数据初始化------------------------------
const dialogVisible = ref(false)
const selectedCaregiver = ref(null)

const unassignedCustomers = ref([])
const assignedCustomers = ref([])

const handleSetCust = (caregiver) => {
  selectedCaregiver.value = caregiver
  dialogVisible.value = true

  fetchAssigned();
  fetchUnassigned();
}
// ---------------------获取未分配的客户、搜索、重置--------------------------
const unassignedPage = ref(1)
const unassignedPageSize = ref(10)
const unassignedTotal = ref(0)
const unassignedSearchName = ref('');


const handleUnassignedPageChange = (page) => {
  unassignedPage.value = page
  fetchUnassigned()
}
const fetchUnassigned = async () => {
  try {
    const res = await axios.get('/CustomerController/searchUnCust', {
      params: {
        pageNum: assignedPage.value,
        pageSize: assignedPageSize.value,
        name: unassignedSearchName.value
      }
    });
    if (res.data.status === 200) {
      //   看后端具体返回结构
      unassignedCustomers.value = res.data.data.map(item => {
        const customerId = item.customer.customerId || '';
        const name = item.customer.name || '未知';
        const nursingLevel = item.checkInRecord.nursingLevelId || '';
        const room = item.room.roomNumber ?? '';
        const bed = item.bed.bedNumber ?? '';
        const building = '606'
        const bedInfo = `${building}#${room}-${bed}`;
        return {
          customerId,
          name,
          nursingLevel,
          bedInfo
        }
      })
      unassignedTotal.value = res.data.total;
      if (unassignedTotal.value === 0) {
        ElMessage.warning("暂无客户缺少健康管家");
      }
    } else {
      unassignedCustomers.value = [];
      unassignedTotal.value = 0;
      ElMessage.warning(res.data.msg);
    }
  } catch (err) {
    console.error('获取未服务对象失败', err);
    ElMessage.error('无法获取未服务对象');
  }
}
const handleUnassignedSearch = () => {
  fetchUnassigned()
}
const handleUnassignedSearchReset = () => {
  unassignedSearchName.value = '';
  fetchUnassigned()
}

// ---------------------获取当前服务对象--------------------------
const assignedPage = ref(1)
const assignedPageSize = ref(10)
const assignedTotal = ref(0)

const handleAssignedPageChange = (page) => {
  assignedPage.value = page
  fetchAssigned()
}

const fetchAssigned = async () => {
  try {
    const res = await axios.get('/UserController/showUserCust', {
      params: {
        userId: selectedCaregiver.value.userId,
        pageNum: assignedPage.value,
        pageSize: assignedPageSize.value
      }
    });
    if (res.data.status === 200) {
      assignedCustomers.value = res.data.data.map(item => {
        const customerId = item.customerId || '';
        const name = item.name || '未知';
        const nursingLevel = item.nursingLevelId || '';
        const room = item.roomNumber ?? '';
        const bed = item.bedNumber ?? '';
        const building = '606'
        const bedInfo = `${building}#${room}-${bed}`;
        return {
          customerId,
          name,
          nursingLevel,
          bedInfo
        }
      })
      assignedTotal.value = res.data.total
      if (assignedTotal.value === 0) {
        ElMessage.warning("未查询到服务对象");
      }
    } else {
      assignedCustomers.value = []
      assignedTotal.value = 0
      ElMessage.warning("当前暂无服务对象");
    }
  } catch (err) {
    console.error('获取当前服务对象失败', err);
    ElMessage.error('无法获取当前服务对象');
  }
}
// ---------------------添加服务对象--------------------------

// 批量添加
// const selectedUnassigned = ref([]);
// const handleUnassignedSelectionChange = (selection) => {
//   selectedUnassigned.value = selection;
// };
// const assignSelectedCustomers = async () => {
//   if (!selectedUnassigned.value.length) {
//     ElMessage.warning("请先选择客户");
//     return;
//   }
//
//   const customerIdList = selectedUnassigned.value.map(item => item.customerId);
//   try {
//     const res = await axios.post('/UserController/addUserCust', {
//       userId: selectedCaregiver.value.userId,
//       customerIds: customerIdList
//     });
//
//     if (res.data.status === 200) {
//       ElMessage.success(res.data.msg || '添加成功');
//       fetchAssigned();   // 刷新右表
//       fetchUnassigned(); // 刷新左表
//     } else {
//       ElMessage.warning(res.data.msg || '添加失败');
//     }
//   } catch (err) {
//     console.error('添加服务对象失败', err);
//     ElMessage.error('添加失败，请稍后重试');
//   }
// };

const assignCustomer = async (row) => {
  try {
    const confirm = await ElMessageBox.confirm(
        `是否确定添加客户 "${row.name}" 为服务对象？`,
        '添加确认',
        {
          confirmButtonText: '确认',
          cancelButtonText: '取消',
          type: 'warning'
        }
    );
    if (confirm) {
      const res = await axios.post('/UserController/addUserCust', null, {
        params: {
          userId: selectedCaregiver.value.userId,
          customerId: row.customerId
        }
      });

      if (res.data.status === 200) {
        ElMessage.success(res.data.msg || '添加成功');
        fetchAssigned();   // 刷新右表
        fetchUnassigned(); // 刷新左表
      } else {
        ElMessage.warning(res.data.msg || '添加失败');
      }
    }
  } catch (err) {
    if (err !== 'cancel') {
      console.error('添加服务对象失败', err);
      ElMessage.error('添加失败，请联系管理员');
    }
  }
}
// ---------------------移除服务对象--------------------------
const unassignCustomer = async (customer) => {
  try {
    const confirm = await ElMessageBox.confirm(
        `是否确定移除客户"${customer.name}"？`,
        '删除确认',
        {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
    );
    if (confirm) {
      const res = await axios.post('/UserController/deleteUserCust', null, {
        params: {
          userId: selectedCaregiver.value.userId,
          customerId: customer.customerId
        }
      });
      if (res.data.status === 200) {
        ElMessage.success(res.data.msg || '移除成功');
        fetchAssigned();
        fetchUnassigned();
      } else {
        ElMessage.warning(res.data.msg || '移除失败');
      }
    }
  } catch (err) {
    if (err !== 'cancel') {
      console.error('移除服务对象失败', err);
      ElMessage.error('移除失败，请联管理员');
    }
  }
}
</script>

<template>
  <div class="layout">
    <div class="search-div">
      <el-form-item label="管家编号" style="margin-bottom: 0px">
        <el-input
            v-model="searchAccount"
            placeholder="请输入管家编号"
            clearable
            class="search-input"
        />
      </el-form-item>
      <el-form-item label="管家姓名" style="margin-bottom: 0px">
        <el-input
            v-model="searchName"
            placeholder="请输入管家姓名"
            clearable
            class="search-input"
            style="margin-left: 0px"
        />
      </el-form-item>


      <el-button type="primary" plain @click="handleSearch">
        <el-icon style="margin-right: 5px;">
          <Search/>
        </el-icon>
        搜索
      </el-button>
      <el-button type="info" plain style="margin-left: 0px" @click="handleResetSearch">
        <el-icon style="margin-right: 5px;">
          <RefreshRight/>
        </el-icon>
        重置
      </el-button>
      <!--      <el-button type="primary" plain @click="handleSearch">搜索</el-button>-->
    </div>
    <div class="table-container">
      <el-table :data="fetchedCaregivers" border style="width: 100%;height: 480px; ">
        <el-table-column type="index" label="#" width="50" align="center"/>
        <el-table-column prop="account" label="管家编号" width="100" align="center"/>
        <el-table-column prop="userName" label="管家姓名" width="160" align="center"/>
        <!--        <el-table-column prop="state" label="状态" width="80" align="center" :formatter="formatState"/>-->
        <el-table-column prop="tel" label="手机号" width="160" align="center"/>
        <el-table-column prop="email" label="邮箱" width="160" align="center"/>
        <el-table-column prop="employmentDate" label="入职日期" min-width="160" align="center"/>
        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
            <el-button type="primary" size="small" plain @click="handleSetCust(scope.row)"
                       :disabled="scope.row.state === 0">
              <el-icon style="margin-right: 5px;">
                <Edit/>
              </el-icon>
              设置服务对象
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
      :title="`设置服务对象 - 管家${selectedCaregiver?.userName}`"
      width="1200px"
      class="assign-dialog-wrapper"
  >
    <div class="assign-dialog-body">
      <!-- 左侧：未绑定客户 -->
      <div class="assign-card">
        <!--        <div class="assign-title">未分配客户</div>-->
        <div class="assign-search-bar">
          <el-text style="font-size: 17px;width: 120px;">未分配客户</el-text>
          <el-input v-model="unassignedSearchName" placeholder="请输入客户姓名" clearable style="width: 240px"/>
          <el-button type="primary" plain style="margin-left: 0px" @click="handleUnassignedSearch">搜索</el-button>
          <el-button type="info" plain @click="handleUnassignedSearchReset" style="margin-left: 0px">重置</el-button>
          <!--          <el-button type="success" plain  @click="assignSelectedCustomers" :disabled="selectedUnassigned.length === 0" style="margin-left: 0px">添加为客户</el-button>-->
        </div>
        <el-table :data="unassignedCustomers" border size="small" style="width: 100%;height: 300px">
          <!--          <el-table-column type="selection" width="50" />-->
          <el-table-column type="index" label="#" min-width="50" align="center"/>
          <el-table-column prop="name" label="客户姓名" min-width="100" align="center"/>
          <el-table-column prop="nursingLevel" label="护理级别" min-width="80" align="center"/>
          <el-table-column prop="bedInfo" label="床位信息" min-width="100" align="center"/>
          <el-table-column label="操作" min-width="120" align="center">
            <template #default="scope">
              <el-button size="small" type="success" @click="assignCustomer(scope.row)">添加为服务对象</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
            v-model:current-page="unassignedPage"
            :page-size="unassignedPageSize"
            layout="total, prev, pager, next"
            :total="unassignedTotal"
            small
            background
            @current-change="handleUnassignedPageChange"
        />

      </div>

      <!-- 右侧：当前客户 -->
      <div class="assign-card">
        <!--        <div class="assign-title">当前服务对象</div>-->
        <div class="assign-search-bar">
          <el-text style="font-size: 17px;width: 120px">当前服务对象</el-text>
        </div>
        <el-table :data="assignedCustomers" border size="small" style="width: 100%;height: 300px">
          <el-table-column type="index" label="#" min-width="50" align="center"/>
          <el-table-column prop="name" label="客户姓名" min-width="100" align="center"/>
          <el-table-column prop="nursingLevel" label="护理级别" min-width="80" align="center"/>
          <el-table-column prop="bedInfo" label="床位信息" min-width="100" align="center"/>
          <el-table-column label="操作" min-width="60" align="center">
            <template #default="scope">
              <el-button size="small" type="danger" plain @click="unassignCustomer(scope.row)">
                <el-icon style="margin-right: 5px;">
                  <Delete/>
                </el-icon>
                移除
              </el-button>
            </template>
          </el-table-column>
        </el-table>


        <el-pagination
            v-model:current-page="assignedPage"
            :page-size="assignedPageSize"
            layout="total, prev, pager, next"
            :total="assignedTotal"
            small
            background
            @current-change="handleAssignedPageChange"
        />
      </div>
    </div>
  </el-dialog>


</template>

<style scoped>
.layout {
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
  overflow: hidden;
  background-color: #f0f2f5;
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.search-input {
  width: 240px;
  display: flex;
  align-items: center;
}

.table-container {
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

.page-container {
  flex: 0 0 10%;
  width: 100%;
  border-radius: 8px;
  background-color: white;
  display: flex;
  justify-content: end;
  box-sizing: border-box;
  padding: 0px 16px 0px 16px;
}

.assign-dialog-wrapper {
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

.assign-search-bar {
  flex: 0 0 10%;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
  border-bottom: 1px solid #e4e7ed;
  padding-bottom: 10px;
}


</style>
