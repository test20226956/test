<script setup>
import { ref, onMounted,reactive } from 'vue'
import {
  Plus, Search, RefreshRight, Edit, Delete
} from '@element-plus/icons-vue'
import {ElMessage,ElMessageBox} from "element-plus";
import axios from "axios";
let currentPage = ref(1);
let pageSize = ref(10);
let total = ref(0);
// let arr = ref([]);

const arr = ref([
  {
    name: '张三',
    age: 78,
    gender: '男',
    roomInfo:'606#A702',
    flavor: ['低油', '低盐'],
    restraint: ['不吃辣', '不吃香菜'],
    comment: '无'
  },
  {
    name: '李四',
    age: 82,
    gender: '女',
    roomInfo:'606#A702',
    flavor: ['低油', '低盐'],
    restraint: ['不吃辣', '不吃香菜'],
    comment: '无'
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
const searchName = ref('');

const init = () => {
  let url = 'CustDietController/showCustDiet';
  const data = {
    cur: currentPage.value,
    pageSize: pageSize.value,
    name: searchName.value
  };
  axios.get(url,{ params: data }).then(response => {
    let rb = response.data;
    if (rb.status == 200) {
      arr.value = rb.data.map(item=>{
        const customerId = item.customer?.customerId || '';
        const name = item.customer?.name || '未知';
        const gender = item.customer?.gender === 0 ? '男' : '女';
        const age = item.age || '无';
        const building = item.room?.buildingNumber ?? '';
        const room = item.room?.roomNumber ?? '';
        const roomInfo = `${building}#${room}`;
        const flavor = item.customerDiet?.flavor ? item.customerDiet.flavor.split(',') : [];
        const restraint = item.customerDiet?.restraint ? item.customerDiet.restraint.split(',') : [];
        const comment  = item.customerDiet?.comment || '';
        const customerDietId = item.customerDiet?.customerDietId || '';

        return {
        //   需要查看JSON格式
          customerId,
          name,
          age,
          gender,
          roomInfo,
          flavor,
          restraint,
          comment,
          customerDietId
        };
      });
      total.value = rb.total;
    } else if(rb.status === 500 && rb.msg === '无数据') {
      arr.value = [];
      total.value = 0;
    }else{
      alert(rb.msg);
    }
  }).catch(error => {
    console.error('查询失败：', error);
  });
}

// const editDialogRef = ref(null)


const editForm = reactive({
  name: '',
  roomInfo:'',
  flavor: [],  // ["低油", "低盐"."低糖"]
  restraint: [],  // 忌口
  comment: ''
})

const handleEdit = (row) => {
  editForm.customerDietId = row.customerDietId
  editForm.name = row.name
  editForm.roomInfo = row.roomInfo
  editForm.flavor = [...(row.flavor || [])]
  editForm.restraint = [...(row.restraint || [])]
  editForm.comment = row.comment || ''
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
    const payload = {
      customerDietId: row.customerDietId,
      flavor: '',
      restraint: '',
      comment: ''
    };
    // 调用后端接口
    axios.post('/CustDiet/editCustDiet', payload).then(res => {
      if (res.data.status === 200) {
        ElMessage.success('重置成功');
        init(); // 刷新数据
      } else {
        ElMessage.error(res.data.msg || '重置失败');
      }
    }).catch(() => {
      ElMessage.error('网络错误，重置失败');
    });
  }).catch(() => {
    // 用户取消
    // ElMessage.info('已取消')
  })
}

// 控制对话框显示
const visible = ref(false)

// 表单数据


// 取消和确定（方法体可留空）
const handleCancel = () => {
  visible.value = false
}

const handleEditConfirm = () => {
  // 注意edit和reset的post请求可能需要改用qs，具体等后端实现
  const payload = {
    customerDietId: editForm.customerDietId,
    flavor: editForm.flavor.join(','),
    restraint: editForm.restraint.join(','),
    comment: editForm.comment || ''
  };
  axios.post('/CustDietController/editCustDiet', payload).then(res => {
    const { status, msg } = res.data;
    if (status === 200) {
      ElMessage.success('膳食配置修改成功');
      visible.value = false;
      init();  // 刷新数据
    } else {
      ElMessage.error(msg || '修改失败');
    }
  }).catch(() => {
    ElMessage.error('网络错误，请稍后重试');
  });
  // 提交处理逻辑
  visible.value = false
}
const handleSearch = () => {
  currentPage.value = 1; // 搜索时重置为第一页
  init();
};

const handleResetSearch = () => {
  searchName.value = '';
  currentPage.value = 1; // 重置也跳回第一页
  init();
};

// onMounted(() => {
//   init();
// });
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
      <el-button type="info" plain style="margin-left: 0px" @click="handleResetSearch">
        <el-icon style="margin-right: 5px;"><RefreshRight/></el-icon> 重置
      </el-button>
<!--      <el-button type="primary" plain @click="handleSearch">搜索</el-button>-->
    </div>
    <div class="table-container">
      <el-table :data="arr" border style="width: 100%; height:100%;">
        <el-table-column prop="name" label="客户姓名"  align="center" />
        <el-table-column prop="age" label="年龄" width="80" align="center" />
        <el-table-column prop="gender" label="性别" width="80" align="center" />
        <el-table-column prop="roomInfo" label="房间信息" width="80" align="center" />
        <el-table-column prop="flavor" label="口味"  align="center" />
        <el-table-column prop="restraint" label="忌口"  align="center" />
        <el-table-column prop="comment" label="备注"  align="center" />
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
        width="520px"
        class="diet-dialog"
        :close-on-click-modal="false"
    >
      <el-form label-width="90px" :model="editForm" class="form-wrapper">
        <el-form-item label="客户姓名">
          <el-input v-model="editForm.name" disabled />
        </el-form-item>

        <el-form-item label="房间信息">
          <el-input v-model="editForm.roomInfo" disabled />
        </el-form-item>

        <el-form-item label="口味偏好">
          <el-checkbox-group v-model="editForm.flavor">
            <el-checkbox label="低油" />
            <el-checkbox label="低盐" />
            <el-checkbox label="低糖" />
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="忌口">
          <el-checkbox-group v-model="editForm.restraint">
            <el-checkbox label="不吃辣" />
            <el-checkbox label="不吃香菜" />
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="备注">
          <el-input
              v-model="editForm.comment"
              type="textarea"
              :rows="3"
              placeholder="请输入备注信息"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancel">返回</el-button>
          <el-button type="primary" @click="handleEditConfirm">确定</el-button>
        </div>
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
  //box-sizing: border-box;
  //padding: 0px 16px 0px 16px;
}

.diet-dialog .el-form-item {
  margin-bottom: 20px;
}

.diet-dialog .el-input,
.diet-dialog .el-textarea {
  width: 100%;
}

.dialog-footer {
  text-align: right;
  padding: 10px 0 0;
}

</style>