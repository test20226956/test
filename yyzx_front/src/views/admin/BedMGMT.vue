<script setup>
import {Edit, RefreshRight, Search,Switch} from "@element-plus/icons-vue";
import {reactive, ref} from "vue";
let currentPage = ref(1);
let pageSize = ref(3);
let total = ref(0);
const arr = ref([
  {
    name: '张三',
    age: 78,
    gender: '男',
    bed: 'A603',
    startTime:'2025-03-27',
    endTime:'2024-07-23'
  },
  {
    name: '李四',
    age: 82,
    gender: '女',
    bed:'A703',
    startTime:'2025-03-27',
    endTime:'2024-07-23'
  }
])
const changeVisible = ref(false)
const changeForm = reactive({
  name: '',
  gender: '',
  oldBed: '',
  newBuilding: '606',
  newRoom:'',
  newBed:'',
  newStartDate:'',
  newEndDate:''
})
const editVisible = ref(false)

const editForm = reactive({
  name: '',
  gender: '',
  bedInfo: '',
  startDate: '',
  endDate: ''
})
const handleSizeChange = (val) => {
  pageSize.value = val;
  init();
  // console.log(`${val} items per page`)
}
const handleCurrentChange = (val) => {
  currentPage.value = val;
  init();
  // console.log(`current page: ${val}`)
}
const init = () => {
  let url = 'BedController/showAllBedRecord';
  const data = {
    cur: currentPage.value,
    pageSize: pageSize.value
  };
  axios.get(url,{ params: data }).then(response => {
    let rb = response.data;
    if (rb.status == 200) {
      arr.value = rb.data.map(item=>{

      })
    } else {
      alert(rb.msg);
    }
  }).catch(error => console.log(error));
}

const handleChange = (row) => {
  changeForm.name = row.name
  changeForm.gender = row.gender
  changeForm.oldBed = row.bed
  changeVisible.value = true
}
const handleChangeCancel = () => {
  // 清空表单（如需保留填写内容则省略此步）
  resetChangeForm()
  changeVisible.value = false
}
const handleChangeConfirm = () => {
  // 这里只做示例：可在此添加验证和提交逻辑
  console.log('提交床位调换表单：', { ...changeForm })

  // 例如：axios.post('/bedChange', changeForm).then(...)

  // 关闭弹窗并清空表单
  resetChangeForm()
  changeVisible.value = false
  // init();
}
// 表单重置函数
const resetChangeForm = () => {
  changeForm.name = ''
  changeForm.gender = ''
  changeForm.oldBed = ''
  changeForm.newBuilding = '606'
  changeForm.newRoom = ''
  changeForm.newBed = ''
  changeForm.newStartDate = ''
  changeForm.newEndDate = ''
}
// 修改信息
const handleEdit = (row) => {
  editForm.name = row.name
  editForm.gender = row.gender
  editForm.bedInfo = row.bed
  editForm.startDate = row.startTime
  editForm.endDate = row.endTime
  editVisible.value = true
}

const handleEditCancel = () => {
  editVisible.value = false
}

const handleEditConfirm = () => {
  console.log('编辑表单提交：', { ...editForm })

  // 例如提交：axios.post('/editBedRecord', editForm).then(...)

  editVisible.value = false
}
</script>

<template>
  <el-row class="layout">
    <div class="search-div">
      <el-input
          v-model="searchName"
          placeholder="请输入客户姓名"
          clearable
          style="width: 240px;"

      />
      <el-date-picker
          v-model="date"
          type="date"
          placeholder="请选择日期"
          style="width: 240px"
      />
      <el-button type="primary" plain @click="handleSearch">
        <el-icon style="margin-right: 5px;"><Search /></el-icon> 搜索
      </el-button>
    </div>

    <div class="table-container">
      <el-tabs v-model="activeTab" type="card" class="custom-tabs" style="padding-bottom: 0px">
        <el-tab-pane label="正在使用" name="current"></el-tab-pane>
        <el-tab-pane label="历史使用" name="history"></el-tab-pane>
      </el-tabs>
      <el-table :data="arr" border style="width:100%;flex: 1">
        <el-table-column type="index" label="#" width="50" align="center" />
        <el-table-column prop="name" label="客户姓名" width="100" align="center" />
        <el-table-column prop="age" label="年龄" align="center" />
        <el-table-column prop="gender" label="性别" align="center" />
        <el-table-column prop="bed" label="床位信息" align="center" />
        <el-table-column prop="startTime" label="床位开始使用时间"  align="center" />
        <el-table-column prop="endTime" label="床位结束使用时间"  align="center" />
        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
            <el-button type="primary" size="small" plain @click="handleChange(scope.row)">
              <el-icon style="margin-right: 5px;"><Switch /></el-icon>调换
            </el-button>
            <!--            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>-->
            <el-button type="warning" size="small" plain @click="handleEdit(scope.row)">
              <el-icon style="margin-right: 5px;"><Edit/></el-icon>修改
            </el-button>
            <!--            <el-button size="small" type="warning" @click="handleReset(scope.row)">重置</el-button>-->
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
  </el-row>

  <el-dialog
      v-model="changeVisible"
      title="床位调换"
      width="600px"
      :close-on-click-modal="false"
  >
    <el-form :model="changeForm" label-width="100px" class="dialog-form" label-position="top">
      <el-row :gutter="20">
        <el-col :span="12" class="changeForm-col">
          <el-form-item label="老人姓名：">
            <el-input v-model="changeForm.name" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12" class="changeForm-col">
          <el-form-item label="旧床位：">
            <el-input v-model="changeForm.oldBed" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="性别：">
            <el-input v-model="changeForm.gender" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="新楼栋：">
            <el-select v-model="changeForm.newBuilding" placeholder="请选择楼栋">
              <el-option label="606" value="606" />
<!--              <el-option label="607" value="607" />-->
              <!-- 其他楼栋可添加 -->
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="新房号：">
            <el-select v-model="changeForm.newRoom" placeholder="请选择房号">
              <el-option label="B401" value="B401" />
              <el-option label="B402" value="B402" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="当前床位使用起始日期：">
            <el-date-picker v-model="changeForm.newStartDate" type="date" placeholder="请选择日期" style="width: 100%;" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="新床号：">
            <el-select v-model="changeForm.newBed" placeholder="请选择床号">
              <el-option label="1" value="1" />
              <el-option label="2" value="2" />
              <el-option label="3" value="3" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="当前床位使用结束日期：">
            <el-date-picker v-model="changeForm.newEndDate" type="date" placeholder="请选择日期" style="width: 100%;" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
      <el-button @click="handleChangeCancel">返回</el-button>
      <el-button type="primary" @click="handleChangeConfirm">确定</el-button>
      </div>
    </template>
  </el-dialog>
<!--修改床位信息对话框-->
  <el-dialog
      v-model="editVisible"
      title="修改信息"
      width="600px"
      :close-on-click-modal="false"
  >
    <el-form :model="editForm" label-width="100px" class="dialog-form" label-position="top">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="老人姓名：">
            <el-input v-model="editForm.name" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="性别：">
            <el-input v-model="editForm.gender" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="床位信息：">
        <el-input v-model="editForm.bedInfo" disabled />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="当前床位使用开始日期：">
            <el-date-picker v-model="editForm.startDate" type="date" style="width: 100%;" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="当前床位使用结束日期：">
            <el-date-picker v-model="editForm.endDate" type="date" style="width: 100%;" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleEditCancel">返回</el-button>
        <el-button type="primary" @click="handleEditConfirm">确定</el-button>
      </div>
    </template>
  </el-dialog>

  </template>

<style scoped>
.layout {
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
  //overflow:hidden;
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
  padding: 0 16px 0 16px;
  box-sizing: border-box;
}
.table-container{
  display: flex;
  flex-direction: column;
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
  align-content: center;
  box-sizing: border-box;
  padding: 0px 16px 0px 16px;
  overflow-x: hidden;
  //flex-direction: column;
}

.changeForm-col{
  display: flex;
  justify-content: center;
}

.dialog-form .el-form-item {
  margin-bottom: 20px;
}

.dialog-footer {
  text-align: right;
  margin-top: 20px;
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  padding-bottom: 8px;
}

</style>