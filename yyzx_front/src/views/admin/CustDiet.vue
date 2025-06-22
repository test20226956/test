<script setup>
import { ref, onMounted,reactive } from 'vue'
import {
  Plus, Search, RefreshRight, Edit, Delete
} from '@element-plus/icons-vue'
import {ElMessage,ElMessageBox} from "element-plus";
let currentPage = ref(1);
let pageSize = ref(3);
let total = ref(0);
// let arr = ref([]);

const arr = ref([
  {
    name: '张三',
    age: 78,
    gender: '男',
    floor: '6楼',
    room: 'A603',
    taste: ['低油', '低盐'],
    taboo: ['不吃辣', '不吃香菜'],
    remark: '无'
  },
  {
    name: '李四',
    age: 82,
    gender: '女',
    floor: '4楼',
    room: 'B403',
    taste: ['低油', '低盐', '低糖'],
    taboo: ['不吃辣'],
    remark: '无'
  }
])

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
  let url = 'CustDietController/showCustDiet';
  const data = {
    cur: currentPage.value,
    pageSize: pageSize.value
  };
  axios.get(url,{ params: data }).then(response => {
    let rb = response.data;
    if (rb.status == 200) {
      arr.value = rb.data.map(item=>{
        const cust = item.CustDietDTO.Cust || {}
        const diet = item.CustDietDTO.CustDiet || {}
        return {
        //   需要查看JSON格式
        }
      })
    } else {
      alert(rb.msg);
    }
  }).catch(error => console.log(error));
}

// const editDialogRef = ref(null)

const handleEdit = (row) => {
  form.name = row.name
  form.floor = row.floor
  form.room = row.room
  form.flavor = [...(row.taste || [])]
  form.restraint = [...(row.taboo || [])]
  form.comment = row.remark || ''
  visible.value = true
}

// 重置：比如清除某些字段或调用后端接口重置配置
const handleReset = (row) => {
  console.log('重置数据：', row)
  // 可加弹窗确认
  ElMessageBox.confirm(
      `确定要重置 ${row.name} 的膳食设置吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(() => {
    // 执行实际重置逻辑，如发请求
    console.log(`已重置 ${row.name}`)
    ElMessage.success('重置成功')
  }).catch(() => {
    // 用户取消
    // ElMessage.info('已取消')
  })
}

// 控制对话框显示
const visible = ref(false)

// 表单数据
const form = reactive({
  name: '',
  floor: '',
  room: '',
  flavor: [],  // ["低油", "低盐"."低糖"]
  restraint: [],  // 忌口
  comment: ''
})

// 取消和确定（方法体可留空）
const handleCancel = () => {
  visible.value = false
}

const handleConfirm = () => {
  // 提交处理逻辑
  visible.value = false
}
</script>

<template>
  <div class="layout">
    <!--  上面搜索栏-->
    <div class="search-div">
      <el-input
          v-model="searchName"
          placeholder="请输入客户姓名"
          clearable
          class="search-input"
      />

      <el-button type="primary" plain @click="handleSearch">
        <el-icon style="margin-right: 5px;"><Search /></el-icon> 搜索
      </el-button>
<!--      <el-button type="primary" plain @click="handleSearch">搜索</el-button>-->
    </div>
    <div class="table-container">
      <el-table :data="arr" border style="width: 100%; height:100%;">
        <el-table-column prop="name" label="客户姓名"  align="center" />
        <el-table-column prop="age" label="年龄" width="80" align="center" />
        <el-table-column prop="gender" label="性别" width="80" align="center" />
        <el-table-column prop="floor" label="楼层" width="80" align="center" />
        <el-table-column prop="room" label="房间号" width="80" align="center" />
        <el-table-column prop="taste" label="口味"  align="center" />
        <el-table-column prop="taboo" label="忌口"  align="center" />
        <el-table-column prop="remark" label="备注"  align="center" />
        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
            <el-button type="warning" size="small" plain @click="handleEdit(scope.row)">
              <el-icon style="margin-right: 5px;"><Edit /></el-icon>编辑
            </el-button>
<!--            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>-->
            <el-button type="info" size="small" plain @click="handleReset(scope.row)">
              <el-icon style="margin-right: 5px;"><RefreshRight/></el-icon> 重置
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
    <el-dialog
        v-model="visible"
        title="膳食配置"
        width="500px"
        :close-on-click-modal="false"
    >
      <el-form label-width="80px" :model="form" class="form-wrapper">
        <el-form-item label="老人姓名：">
          <el-input v-model="form.name" disabled />
        </el-form-item>

        <el-form-item label="楼层号：">
          <el-input v-model="form.floor" disabled style="width: 45%;" />
          <span style="display: inline-block; width: 10px;"></span>
          <span>房间号：</span>
          <el-input v-model="form.room" disabled style="width: 45%;" />
        </el-form-item>

        <el-form-item label="口味：">
          <el-checkbox-group v-model="form.flavor">
            <el-checkbox label="低油" />
            <el-checkbox label="低盐" />
            <el-checkbox label="低糖" />
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="忌口：">
          <el-checkbox-group v-model="form.restraint">
            <el-checkbox label="不吃辣" />
            <el-checkbox label="不吃香菜" />
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="备注：">
          <el-input v-model="form.comment" type="textarea" :rows="3" placeholder="请输入" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="handleCancel">返回</el-button>
        <el-button type="primary" @click="handleConfirm">确定</el-button>
      </template>
    </el-dialog>
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
}

</style>