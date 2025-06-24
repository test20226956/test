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
        <el-table-column type="index" label="#" align="center"/>
        <el-table-column prop="name" label="客户姓名" align="center"/>
        <el-table-column prop="age" label="年龄" width="60" align="center"/>
        <el-table-column prop="gender" label="性别" width="60" align="center"/>
        <el-table-column prop="id" label="身份证号" width="165" align="center"/>
        <el-table-column prop="blood" label="血型" align="center"/>
        <el-table-column prop="contact" label="联系人" align="center"/>
        <el-table-column prop="tel" label="联系电话" align="center"/>
        <el-table-column prop="floor" label="楼层" align="center"/>
        <el-table-column prop="room" label="房间号" align="center"/>
        <el-table-column prop="checkInTime" label="入住时间" align="center"/>
        <el-table-column prop="chheckOutTime" label="合同到期时间" align="center"/>
        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
            <el-button type="warning" size="small" plain @click="checkOutApp(scope.row)">
              <el-icon style="margin-right: 5px;"><Edit /></el-icon> 退住申请
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
    <el-form
        :model="recordInfo"
        :rules="addformRules"
        :label-position="labelPosition"
        label-width="auto">
      <el-form-item label="申报时间" prop="applyTime">
        <el-date-picker
            v-model="recordInfo.applyTime"
            type="date"
            placeholder="选择入住时间"
            value-format="YYYY-MM-DD"
            style="width: 60%;"
        />
      </el-form-item>
      <el-form-item label="退住类型" prop="type">
        <el-select v-model="recordInfo.type" placeholder="请选择老人类型" style="width: 60%;">
          <el-option label="正常退住" value="0"></el-option>
          <el-option label="死亡退住" value="1"></el-option>
          <el-option label="保留床位" value="2"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="退住原因" prop="checkOutTime">
        <el-input
            v-model="recorInfo.reason"
            style="width: 240px"
            :rows="2"
            type="textarea"
            placeholder="Please input"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="addApply">提交</el-button>
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