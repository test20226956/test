<script setup>
import axios from "axios";
import {Edit, RefreshRight, Search} from "@element-plus/icons-vue";
import {ref} from "vue";
// ---------------------初始化和搜索管家列表------------------------
const fetchedCaregivers = ref([
  {
    userId:1,
    userName:'貔貅',
    state:0,
    tel:'13950535126',
    email:'lyqwzs@qq.com',
    employmentDate:'2025-02-03'
  },{
    userId:2,
    userName:'修坯',
    state:1,
    tel:'18959367485',
    email:'zyqdmn@qq.com',
    employmentDate:'2025-04-05'
  }
])
</script>

<template>
  <div class="layout">
    <div class="search-div">
      <el-input
          v-model="searchNumber"
          placeholder="请输入管家编号"
          clearable
          class="search-input"
      />
      <el-input
          v-model="searchName"
          placeholder="请输入管家姓名"
          clearable
          class="search-input"
      />
      <el-button type="primary" plain @click="handleSearch">
        <el-icon style="margin-right: 5px;"><Search /></el-icon> 搜索
      </el-button>
      <el-button type="info" plain style="margin-left: 0px" @click="handleResetSearch">
        <el-icon style="margin-right: 5px;"><RefreshRight/></el-icon> 重置
      </el-button>
      <!--      <el-button type="primary" plain @click="handleSearch">搜索</el-button>-->
    </div>
    <div class="table-container">
      <el-table :data="fetchedCaregivers" border style="width: 100%; height:100%;">
        <el-table-column type="index" label="#" width="50" align="center" />
        <el-table-column prop="userId" label="管家编号" width="100"  align="center" />
        <el-table-column prop="userName" label="管家姓名" width="160"  align="center" />
        <el-table-column prop="state" label="状态" width="80" align="center" />
        <el-table-column prop="tel" label="手机号" width="160" align="center" />
        <el-table-column prop="email" label="邮箱" width="160" align="center" />
        <el-table-column prop="employmentDate" label="入职日期"  align="center" />
        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
            <el-button type="primary" size="small" plain @click="handleSetCust(scope.row)">
              <el-icon style="margin-right: 5px;"><Edit /></el-icon>设置服务对象
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
  //padding: 0 16px 0 16px;
  //box-sizing: border-box;
}
.search-input {
  width: 240px;
  display: flex;
  align-items: center;
  margin-left: 16px;
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
</style>