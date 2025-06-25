<template>
  <div class="layout">
    <!-- 左边：客户信息 -->
    <div class="left" :style="leftStyle">
      <!-- 左边主要信息 -->
      <div class="left-customer">
        <!-- 标题 -->
        <div class="title">
          <el-icon size="20px"><UserFilled /></el-icon>
          <h3>客户信息</h3>
          <!-- 箭头按钮容器放在最右边 -->
          <div class="toggle-arrow" @click="showMore">
            <el-icon v-if="!isDetailView"><ArrowLeft /></el-icon>
            <el-icon v-else><ArrowRight /></el-icon>
          </div>
        </div>
        <!-- 搜索 -->
        <div class="search-div" v-if="!isDetailView">
          <el-row :gutter="10">
            <el-col :span="8" class="search-col">
              <el-form-item class="search-item" label="客户">
                <el-input v-model="searchedCustomer.name" placeholder="客户名称"></el-input>
              </el-form-item>
            </el-col>
            <el-col :span="8" class="search-col">
              <el-form-item class="search-item" label="级别">
                <el-select
                    v-model="searchedCustomer.state"
                    placeholder="护理级别"
                >
                  <el-option
                      v-for="level in nursingLevelList"
                      :key="level.nursingLevelId"
                      :label="level.name"
                      :value="level.nursingLevelId"
                  ></el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="1.1" class="search-col">
              <el-button type="primary" plain circle @click="searchCustomers">
                <el-icon><Search /></el-icon>
              </el-button>
            </el-col>
            <el-col :span="1.1" class="search-col">
              <el-button type="info" plain circle @click="resetCustomers">
                <el-icon><RefreshRight/></el-icon>
              </el-button>
            </el-col>
          </el-row>
        </div>
        <!-- 表格 -->
        <div class="main-table">
          <el-table :data="customerNursingList" @row-click="handleRowClick" highlight-current-row>
            <el-table-column prop="customer.customerId" label="客户编号" align="center"></el-table-column>
            <el-table-column prop="customer.name" label="姓名" align="center"></el-table-column>
            <el-table-column prop="age" label="年龄" align="center" v-if="!isDetailView"></el-table-column>
            <el-table-column prop="customer.gender" label="性别" align="center" v-if="!isDetailView">
              <template #default="scope">
                {{ scope.row.customer.gender === 0 ? '男' : '女' }}
              </template>
            </el-table-column>
            <el-table-column prop="room.roomNumber" label="房间号" align="center" v-if="!isDetailView"></el-table-column>
            <el-table-column prop="bed.bedNumber" label="床号" align="center" v-if="!isDetailView"></el-table-column>
            <el-table-column prop="nursingLevel.name" label="护理级别" align="center">
              <template #default="scope">
                <el-tag :style="{ backgroundColor: '#f0f4f1', color: '#9db7a5', borderColor: '#9db7a5' }">{{scope.row.nursingLevel.name}}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <!-- 左边分页 -->
      <div class="page-container">
        <el-pagination
            v-model:current-page="customerCurrentPage"
            v-model:page-size="customerPageSize"
            :page-sizes="[3,5,7]"
            :layout="customerPaginationLayout"
            :total="customerTotal"
            @size-change="handleCustomerSizeChange"
            @current-change="handleCustomerCurrentChange"
        />
      </div>
    </div>
    <!-- 右边：护理记录 -->
    <div class="right" :style="rightStyle">
      <!-- 右边主要信息 -->
      <div class="right-record">
        <!-- 标题 -->
        <div class="title">
          <el-icon size="20px"><List /></el-icon>
          <h3>护理记录</h3>
        </div>
        <!-- 护理卡片 -->
        <div class="customer-card">
          <!-- 第一行：标题 -->
          <el-row>
            <el-col :span="5" style="text-align: left;">
              <el-text style="font-size: 18px; color: #9db7a5;">
                客户信息
              </el-text>
            </el-col>
          </el-row>
          <!-- 第二行：姓名和年龄 -->
          <el-row :gutter="20">
            <el-col :span="12" style="text-align: left;">
              姓名：{{ selectedCustomer?.customer?.name || '暂无' }}
            </el-col>
            <el-col :span="12" style="text-align: left;">
              年龄：{{selectedCustomer?.age || '暂无' }}
            </el-col>
          </el-row>
          <!--第三行：性别和护理级别 -->
          <el-row :gutter="20">
            <el-col :span="12" style="text-align: left;">
              性别：{{
                selectedCustomer?.customer?.gender === 0
                    ? '男'
                    : selectedCustomer?.customer?.gender === 1
                        ? '女'
                        : '暂无'
              }}
            </el-col>
            <el-col :span="12" style="text-align: left;">
              护理级别：{{selectedCustomer?.nursingLevel?.name || '暂无' }}
            </el-col>
          </el-row>
          <!-- 第四行：房间号和床号 -->
          <el-row :gutter="20">
            <el-col :span="12" style="text-align: left;">
              房间号：{{selectedCustomer?.room?.roomNumber || '暂无' }}
            </el-col>
            <el-col :span="12" style="text-align: left;">
              床号：{{selectedCustomer?.bed?.bedNumber || '暂无' }}
            </el-col>
          </el-row>
        </div>
        <!-- 搜索 -->
        <div class="search-div" v-if="isDetailView">
          <el-row :gutter="10">
            <!-- 搜索项目名称 -->
            <el-col :span="9" class="search-col">
              <el-form-item class="search-item" label="项目名称">
                <el-input v-model="searchedRecord.nursingProject.name" placeholder="请输入项目名称"></el-input>
              </el-form-item>
            </el-col>
            <!-- 搜索日期 -->
            <el-col :span="9" class="search-col">
              <el-form-item class="search-item" label="记录开始日期">
                <el-date-picker
                    v-model="searchedRecord.nursingRecord.time"
                    type="date"
                    placeholder="请选择开始日期"
                    :disabled-date="disabledDate"
                    :shortcuts="shortcuts"
                ></el-date-picker>
              </el-form-item>
            </el-col>
            <el-col :span="1.5" class="search-col">
              <el-button type="primary" plain circle @click="searchRecords">
                <el-icon><Search /></el-icon>
              </el-button>
            </el-col>
            <el-col :span="1.5" class="search-col">
              <el-button type="info" plain circle @click="resetRecords">
                <el-icon><RefreshRight/></el-icon>
              </el-button>
            </el-col>
          </el-row>
        </div>
        <!-- 表格 -->
        <div class="main-table">
          <el-table :data="recordList">
            <el-table-column prop="nursingRecord.nursingRecordId" label="记录编号" width="100px" align="center"></el-table-column>
            <el-table-column prop="nursingProject.name" label="项目名称" align="center" width="100px"></el-table-column>
            <el-table-column prop="nursingRecord.count" label="数量" align="center" width="100px" v-if="isDetailView"></el-table-column>
            <el-table-column prop="nursingRecord.description" label="内容" align="center" width="100px" v-if="isDetailView"></el-table-column>
            <el-table-column prop="nurse.name" label="护工" align="center" width="100px"></el-table-column>
            <el-table-column prop="nurse.tel" label="护工手机号" align="center" v-if="isDetailView" width="120px"></el-table-column>
            <el-table-column prop="nursingRecord.time" label="护理时间" align="center" v-if="isDetailView" width="100px"></el-table-column>
            <el-table-column fixed="right" label="操作" align="center">
              <template v-slot="scope">
                <el-button type="danger" size="small" plain @click="deleteRecord(scope.row)">
                  <el-icon style="margin-right: 5px;"><Delete /></el-icon> 删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <div class="page-container">
        <el-pagination
            v-model:current-page="recordCurrentPage"
            v-model:page-size="recordPageSize"
            :page-sizes="[3,5,7]"
            :layout="recordPaginationLayout"
            :total="recordTotal"
            @size-change="handleRecordSizeChange"
            @current-change="handleRecordCurrentChange"
        />
      </div>
    </div>

  </div>
</template>

<script setup>
import {
  UserFilled, List, Search, RefreshRight, ArrowLeft, ArrowRight
} from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus';
import {ref, inject, computed} from 'vue'
import qs from 'qs';
const axios = inject('axios');

// 搜索的客户
const searchedCustomer = ref({
  name:'',
  nursingLevelId: 0,
});

// 客户表是否展开
const isDetailView = ref(false);
// 左右缩小和展开
const leftStyle = computed(() => ({
  flex: isDetailView.value ? 1 : 2,
  transition: 'all 0.3s'
}));
// 分页根据展开变化
const customerPaginationLayout = computed(() =>
    isDetailView.value ? 'prev, pager, next' : 'total, sizes, prev, pager, next'
)
const recordPaginationLayout = computed(() =>
    !isDetailView.value ? 'prev, pager, next' : 'total, sizes, prev, pager, next'
)


const rightStyle = computed(() => ({
  flex: isDetailView.value ? 2 : 1,
  transition: 'all 0.3s'
}));

// 搜索的记录
const searchedRecord = ref({
  nurse:{
    name:'',
  },
  nursingProject:{
    name:'',
  },
  nursingRecord:{
    time:'',
  }
});

// 搜索的日期
const disabledDate = (time) => {
  return time.getTime() > Date.now()
};

// 快捷日期选择
const shortcuts = [
  {
    text: '今天',
    value: new Date(),
  },
  {
    text: '昨天',
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() - 3600 * 1000 * 24)
      return date
    },
  },
  {
    text: '一周前',
    value: () => {
      const date = new Date()
      date.setTime(date.getTime() - 3600 * 1000 * 24 * 7)
      return date
    },
  },
  {
    text: '一月前',
    value: () => {
      const date = new Date()
      date.setMonth(date.getMonth() - 1) // ✅ 向前一个月
      return date
    },
  },
  {
    text: '三月前',
    value: () => {
      const date = new Date()
      date.setMonth(date.getMonth() - 3) // ✅ 向前三个月
      return date
    },
  },
]

// 搜索的护理级别信息， 需要级别编号和级别名称，放在select组件的option里
const nursingLevelList = ref([]);

// 客户列表
const customerNursingList = ref([
  {
    customer: {
      customerId: 'C001',
      name: '张三',
      gender: 0 // 0 表示男，1 表示女
    },
    age: 75,
    room: {
      roomNumber: '301'
    },
    bed: {
      bedNumber: '1A'
    },
    nursingLevel: {
      name: '一级护理'
    }
  },
  {
    customer: {
      customerId: 'C002',
      name: '李四',
      gender: 1
    },
    age: 82,
    room: {
      roomNumber: '302'
    },
    bed: {
      bedNumber: '2B'
    },
    nursingLevel: {
      name: '二级护理'
    }
  },
  {
    customer: {
      customerId: 'C003',
      name: '王五',
      gender: 0
    },
    age: 79,
    room: {
      roomNumber: '303'
    },
    bed: {
      bedNumber: '3C'
    },
    nursingLevel: {
      name: '特级护理'
    }
  }
]);

// 选中的客户
const selectedCustomer = ref(null);

// 记录列表
const recordList = ref([]);

// 分页
let customerTotal = ref(400);
let customerCurrentPage = ref(1);
let customerPageSize = ref(5);

let recordTotal = ref(400);
let recordCurrentPage = ref(1);
let recordPageSize = ref(5);



// 初始化：获取客户列表和护理级别信息
// 获取客户列表
const initCustomer = () => {
  // 获取客户列表
  let url = `CustomerController/showCustomerNursing?pageNum=${customerCurrentPage}&pageSize=${customerPageSize}`;
  axios.get(url).then(response => {
    let rb = response.data;
    if(rb.status === 200){
      customerNursingList.value = rb.data;
      customerTotal.value = rb.total;
      ElMessage({message:'客户表格加载成功', type:'success'});
      console.log(customerNursingList.value);
    }else{
      console.log(rb.msg);
    }
  }).catch(error => {
    console.log(error);
  });
};

// 初始化护理级别
const initLevel = () => {
  // 获取护理级别列表
  let url = `NUsingLevelController/showOk`;
  axios.get(url).then(response => {
    let rb = repsonse.data;
    if(rb.status === 200){
      console.log("加载护理级别成功！");
      nursingLevelList.value = rb.data;
    }else{
      console.log(rb.msg);
    }
  }).catch(error => {
    cosnole.log(error);
  })
}
// 初始化表格
const initTable = () => {
  initCustomer();
  initLevel();
}

const showMore = () => {
  if(isDetailView.value === false){
    isDetailView.value = true;
  }else{
    isDetailView.value = false;
  }
}

// 查找客户
const searchCustomers = () => {

}

// 重置查找结果

// 客户表格点击
const handleRowClick = (row) => {
  selectedCustomer.value = row;
  console.log(selectedCustomer.value);
}

// 点击过后在记录表格里加载相应数据
const getRecords = () => {
  console.log(`get records form ${selectedCustomer.value.customer.customerId}`);
  let url = `/NursingRecordController/showNursingRecord?custId=${selectedCustomer.value.customer.customerId}&cur=${customerCurrentPage}&pageSize=${customerPageSize}`;
  axios.get(url).then(response => {
    let rb = response.data;
    if(rb.status === 200){
      recordList.value = rb.data;
      ElMessage({message:'表格加载成功', type:'success'});
      console.log("获取表格内容");
      recordTotal.value = rb.total;
    }else{
      console.log(rb.msg)
    }
  }).catch(error => {
    console.log(error);
  })
}

// 查找记录
const searchRecords = () => {

}

// 删除记录
const deleteRecord = (row) => {
  ElMessageBox.confirm('确定删除这条记录？')
  then(() => {
    let url = `NursingRecordController/deleteNursingRecord`;
    axios.post(url, row.nursingRecord.nursingRecordId).then(response => {
      let rb = response.data;
      if(rb.status === 200){
        ElMessage({message:'删除成功', type:'success'});
        getRecords();
      }else{
        console.log(rb.msg);
      }
    }).catch(error => {
      console.log(error);
    })
  })
}

// 客户分页
const handleCustomerCurrentChange = (val) => {
  console.log(`current customer page is : ${val}`);
  initCustomer();
}

const handleCustomerSizeChange = (val) => {
  console.log(`${val} items per customer page`);
  initCustomer();
}

// 记录分页
const handleRecordCurrentChange = (val) => {
  console.log(`current record page is : ${val}`);
  initRecord();
}

const handleRecordSizeChange = (val) => {
  console.log(`${val} items per record page`);
  initRecord();
}

</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: row;
  height: 100%;
  padding: 16px 10px 0 10px;
  margin: 0 0 0 0;
  box-sizing: border-box;
  gap: 16px; /* 区块间距，替代 margin-bottom */
  background-color: #f0f2f5;
}
.left{
  /* width: 600px; */
  height: 100%;
  transition: all 0.3s;
  display: flex;
  align-content: center;
  flex-direction: column;
  gap: 16px; /* 区块间距，替代 margin-bottom */
  box-sizing: border-box;
  min-width: 0;
}
.left-customer{
  width: auto;
  height: 90%;
  border: 1px solid ghostwhite;
  border-radius: 12px; /* 圆角半径，可根据需要调整 */
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.1); /* 阴影效果 */
  background-color: white;
  display: flex;
  flex-direction: column;
  align-content: center;
  box-sizing: border-box;
  padding: 16px 16px 16px 16px;
}
.right{
  height: 100%;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-content: center;
  gap: 16px; /* 区块间距，替代 margin-bottom */
  box-sizing: border-box;
  min-width: 0;
}
.right-record{
  width: auto;
  height: 90%;
  border: 1px solid ghostwhite;
  border-radius: 12px; /* 圆角半径，可根据需要调整 */
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.1); /* 阴影效果 */
  background-color: white;
  box-sizing: border-box;
  padding: 16px 16px 16px 16px;
  flex-direction: row;
}
.title{
  display: flex;
  flex-direction: row;
  height: 10%;
  overflow: hidden;
  gap: 6px; /* 图标和文字之间的间距，可调 */
  align-items: center;
  align-content: center;
}
.title h3{
  margin: 0;
  font-size: 20px;
}

.toggle-arrow {
  margin-left: auto;
  cursor: pointer;
  display: flex;
  align-items: end;
}

.search-div{
  width: 100%;
  flex: 0 0 10%;
  display: flex;
  align-content: center;
}
.search-div .el-row {
  width: 100%;
  display: flex;
  align-items: center;      /* 垂直居中 */
}
.search-col{
  display: flex;            /* 关键 */
  align-items: center;
  margin-left: 0;
  padding: 0;
}
.search-item{
  margin-bottom: 0px;
}

/* 客户信息卡片 */
.customer-card{
  border: 1px solid #9db7a5;
  border-radius: 12px;
  background-color: #f0f4f1;
  //height: 25%;
  height: 130px;
  box-sizing: border-box;
  padding: 10px 16px 16px 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  overflow-y: hidden;
  margin-bottom: 10px;
}

.table-container{
  width: 100%;
  flex: 1;
  //border: 2px solid darkblue;
  background-color: white;
  border-radius: 8px;
  box-sizing: border-box;
  padding: 0 16px 0 16px;
}
.operation-button{
  display: flex;
  justify-content: flex-end;
  width: 100%;
  //padding: 0 16px 0 0;
  margin-top: 10px;
  margin-bottom: 10px;

}
.main-table{
  display: flex;
  justify-content: center;
}

.page-container{
  flex: 0 0 10%;
  width: 100%;
  border-radius: 8px;
  //border: 2px solid darkblue;
  background-color: white;
  display: flex;
  justify-content: end;
}

.el-pagination{
  padding: 0 16px 0 0;
}

</style>