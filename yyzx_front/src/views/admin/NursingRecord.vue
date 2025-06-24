<template>
  <div class="layout">
    <!-- 左边：客户信息 -->
    <div class="left">
      <!-- 左边主要信息 -->
      <div class="left-customer">
        <!-- 标题 -->
        <div class="title">
          <el-icon size="20px"><UserFilled /></el-icon>
          <h3>客户信息</h3>
        </div>
        <!-- 搜索 -->
        <div class="search-div">
          <el-row :gutter="10">
            <el-col :span="10" class="search-col">
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
              <el-button type="primary" plain circle @click="searchCustomer">
                <el-icon><Search /></el-icon>
              </el-button>
            </el-col>
            <el-col :span="1.1" class="search-col">
              <el-button type="info" plain circle @click="resetTable">
                <el-icon><RefreshRight/></el-icon>
              </el-button>
            </el-col>
          </el-row>
        </div>
        <!-- 表格 -->
        <div class="main-table">
          <el-table :data="customerNursingList">
            <el-table-column prop="customer.customerId" label="客户编号" align="center"></el-table-column>
            <el-table-column prop="age" label="年龄" align="center"></el-table-column>
            <el-table-column prop="customer.gender" label="性别" align="center">
              <template #default="scope">
                {{ scope.row.customer.gender === 0 ? '男' : '女' }}
              </template>
            </el-table-column>
            <el-table-column prop="room.roomNumber" label="房间号" align="center"></el-table-column>
            <el-table-column prop="bed.bedNumber" label="床号" align="center"></el-table-column>
            <el-table-column prop="nursingLevel.name" label="护理级别" align="center">
              <template #default="scope">
                <el-tag>{{scope.row.nursingLevel.name}}</el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
      <!-- 左边分页 -->
      <div class="page-container"></div>
    </div>
    <!-- 右边：护理记录 -->
    <div class="right">
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
            <el-col :span="3" style="text-align: left;">
              <el-text style="font-size: 18px; color: #9db7a5;">
                客户信息
              </el-text>
            </el-col>
          </el-row>
          <!-- 第二行：姓名和年龄 -->
          <el-row :gutter="20" v-if="selectedCustomer">
            <el-col :span="12" style="text-align: left;">
              姓名：{{ selectedCustomer.customer?.name || '暂无' }}
            </el-col>
            <el-col :span="12" style="text-align: left;">
              年龄：{{selectedCustomer.age || '暂无' }}
            </el-col>
          </el-row>
          <!--第三行：性别和护理级别 -->
          <el-row :gutter="20" v-if="selectedCustomer">
            <el-col :span="12" style="text-align: left;">
              性别：{{selectedCustomer.customer?.gender===0 ? '男' : '女' || '暂无' }}
            </el-col>
            <el-col :span="12" style="text-align: left;">
              护理级别：{{selectedCustomer.nursingLevel?.name || '暂无' }}
            </el-col>
          </el-row>
          <!-- 第四行：房间号和床号 -->
          <el-row :gutter="20" v-if="selectedCustomer">
            <el-col :span="12" style="text-align: left;">
              房间号：{{selectedCustomer.room?.roomNumber || '暂无' }}
            </el-col>
            <el-col :span="12" style="text-align: left;">
              床号：{{selectedCustomer.bed?.bedNumber || '暂无' }}
            </el-col>
          </el-row>
        </div>
        <!-- 搜索 -->
        <div class="search-div">
          <el-row :gutter="10">
            <!-- 搜索护工姓名 -->
            <el-col :span="6" class="search-col">
              <el-form-item class="search-item" label="护工姓名">
                <el-input v-model="searchedRecord.nurse.name" placeholder="请输入护工姓名"></el-input>
              </el-form-item>
            </el-col>
            <!-- 搜索项目名称 -->
            <el-col :span="6" class="search-col">
              <el-form-item class="search-item" label="项目名称">
                <el-input v-model="searchedRecord.nursingProject.name" placeholder="请输入项目名称"></el-input>
              </el-form-item>
            </el-col>
            <!-- 搜索日期 -->
            <el-col :span="8" class="search-col">
              <el-form-item class="search-item" label="护理开始日期">
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
              <el-button type="primary" plain @click="searchProjects">
                <el-icon style="margin-right: 5px;"><Search /></el-icon> 搜索
              </el-button>
            </el-col>
            <el-col :span="1.5" class="search-col" @click="resetTable">
              <el-button type="info" plain>
                <el-icon style="margin-right: 5px;"><RefreshRight/></el-icon> 重置
              </el-button>
            </el-col>
          </el-row>
        </div>
        <!-- 表格 -->
      </div>
      <div class="page-container">
      </div>
    </div>

  </div>
</template>

<script setup>
import {
  UserFilled, List, Search, RefreshRight
} from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus';
import {ref, inject} from 'vue'
import qs from 'qs';
const axios = inject('axios');

// 搜索的客户
const searchedCustomer = ref({
  name:'',
  nursingLevelId: 0,
});

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

selectedCustomer.value = {
  customer:{
    name:'AAA',
    gender: 0,
  },
  age: 88,
  bed:{
    bedNumber:'203'
  },
  room:{
    roomNumber:'505'
  },
  nursingLevel:{
    name:'lv. 1'
  }
}

// 记录列表
const recordList = ref([]);

// 初始化：获取客户列表和护理级别信息
const initTable = () => {
  // 获取客户列表
  let url = `CustNursingController/showCustomerNursing`;
}

// 分页
let total = ref(400);
let currentPage = ref(1);
let pageSize = ref(5);



// 分页
const handleCurrentChange = (val) => {
  console.log(`current page is : ${val}`);
  initTable();
}

const handleSizeChange = (val) => {
  console.log(`${val} items per page`);
  initTable();
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
  width: 550px;
  height: 100%;
  flex: 1;
  display: flex;
  align-content: center;
  flex-direction: column;
  gap: 16px; /* 区块间距，替代 margin-bottom */
  box-sizing: border-box;
}
.left-customer{
  width: 100%;
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
  flex: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-content: center;
  gap: 16px; /* 区块间距，替代 margin-bottom */
  box-sizing: border-box;
}
.right-record{
  width: 100%;
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