<script setup>

import {Delete, Edit, Plus, RefreshRight, Search} from "@element-plus/icons-vue";
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
        <el-col :span="5" class="search-col">
          <el-form-item label="入住日期">
            <el-date-picker
                v-model="searchCust.startDate"
                type="date"
                placeholder="请选择查询起始日期"
                :size="size"
            />
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
      <el-row>
        <!--        新增下拉选择框选择老人类型-->
        <el-col :span="2" :offset="1" class="table-search">
          <el-select v-model="searchCust.state" placeholder="请选择老人类型">
            <el-option label="自理老人" value=0></el-option>
            <el-option label="护理老人" value=1></el-option>
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
      <el-table :data="customerList" border style="width: 100%;">
        <el-table-column prop="name" label="客户姓名" align="center"/>
        <el-table-column prop="age" label="年龄" width="60" align="center"/>
        <el-table-column prop="gender" label="性别" width="60" align="center"/>
        <el-table-column prop="id" label="身份证号" width="165" align="center"/>
        <el-table-column prop="blood" label="血型" align="center"/>
        <el-table-column prop="contact" label="联系人" align="center"/>
        <el-table-column prop="tel" label="联系电话" align="center"/>
        <el-table-column prop="floor" label="楼层" align="center"/>
        <el-table-column prop="room" label="房间号" align="center"/>
        <el-table-column prop="bed" label="床位号" align="center"/>
        <el-table-column prop="checkInTime" label="入住时间" align="center"/>
        <el-table-column prop="chheckOutTime" label="合同到期时间" align="center"/>
        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
            <el-button type="warning" size="small" plain @click="getCust(scope.row)">
              <el-icon style="margin-right: 5px;"><Edit /></el-icon> 修改
            </el-button>
            <el-button type="danger" size="small" plain @click="confirmDelete(scope.row)">
              <el-icon style="margin-right: 5px;"><Delete /></el-icon> 删除
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

</style>