<script setup>
import {Delete, Edit, Plus, RefreshRight, Search} from "@element-plus/icons-vue";
import { ref, reactive, computed, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElLoading,  FormItemProps, FormProps } from 'element-plus'

const route = useRoute();
const router = useRouter();
const axios = inject('axios');

let currentPage = ref(1);
let pageSize = ref(3);
let total = ref(0);
let proCurrentPage = ref(1);
let proPageSize = ref(3);
let proTotal = ref(0);
const size = ref('default');
const dialogVisible = ref(false);
const addDialogVisible = ref(false);
const labelPosition = ref('right')

const searchCust = ref({
  name: '',
});
const searchPro = ref({
  name: '',
});

const addedRe = ref({
  proName: '',
  times: '',
  nursingTime: '',
});
const addformRules = reactive({
  times: [
    { required: true, message: '请选择护理次数', trigger: 'blur' },
  ],
  nursingTime: [
    { required: true, message: '请选择护理时间', trigger: 'blur' },
  ],
});

const customerList = ref([]);
const proList = ref([]);

const handleSizeChange = (val) => {
  pageSize.value = val;
  init();
  console.log(`${val} items per page`)
}
const handleCurrentChange = (val) => {
  currentPage.value = val;
  init();
  console.log(`current page: ${val}`)
}
const handleProSizeChange = (val) => {
  proPageSize.value = val;
  getCustPro();
  console.log(`${val} items per page`)
}
const handleProCurrentChange = (val) => {
  proCurrentPage.value = val;
  getCustPro();
  console.log(`current page: ${val}`)
}

const init = () => {
  const userid = sessionStorage.getItem('userId');
  let url = 'UerController/showUserCust';
  const data = {
    userId : userid,
    pageNum: currentPage.value,
    pageSize: pageSize.value
  };
  axios.get(url,{ params: data }).then(response => {
    let rb = response.data;
    if (rb.status == 200) {
      console.log(rb.data)
      customerList.value = rb.data
      total.value = rb.total
    } else {
      alert(rb.msg);
    }
  }).catch(error => console.log(error));
}
init();

const searchCustByName = () => {
  const userid = sessionStorage.getItem('userId');
  const data = {
    userId : userid,
    name: searchCust.value.name,
    pageNum: currentPage.value,
    pageSize: pageSize.value
  };
  axios.get(url,{ params: data }).then(response => {
    let rb = response.data;
    if (rb.status == 200) {
      customerList.value = rb.data;
      total.value = rb.total
    }
  }).catch(error => console.log(error));
}

const showCustPro = (row) => {
  dialogVisible.value = true;
  custId.value = row.id;
  getCustPro();
}

const custId = ref('');
const getCustPro = () => {
  let url = 'UerController/showCustPro';
  const data = {
    customerId: custId.value,
    pageNum : proCurrentPage.value,
    pageSize: proPageSize.value,
  }
  axios.get(url,{ params: data }).then(response => {
    let rb = response.data;
    if (rb.status == 200) {
      proList.value = rb.data;
      proTotal.value = rb.total
    }
  }).catch(error => console.log(error));
}

const searchProByName = () => {
  let url = 'UerController/searchCustPro';
  const data = {
    customerId: custId.value,
    pageNum : proCurrentPage.value,
    pageSize: proPageSize.value,
    name: proName.value
  }
  axios.get(url,{ params: data }).then(response => {
    let rb = response.data;
    if (rb.status == 200) {
      proList.value = rb.data;
      proTotal.value = rb.total
    }else {
      alert(rb.msg);
    }
  })
}

const addNursingRe = () => {
  let url = "UserController/addCareRecord";
  let userid = sessionStorage.getItem("userid");
  let nursingRecord = {
    customerId: custId.value,
    time: addedRe.value.nursingTime,
    count: addedRe.value.times,
    userId : userid,
    nursingServiceId: careRecord.value
  };
  let data = {
    nursingRecord : nursingRecord,
  }
  axios.post(url,data).then(response => {
    let rb = response.data;
    if (rb.status == 200) {
      ElMessage("添加成功");
      init();
    }else {
      alert(rb.msg);
    }
  })
}
const careRecord = ref([]);
const getCareRecord =(row)=>{
  careRecord.value = row.id;
  addDialogVisible.value = true;
}
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
      <el-table :data="customerList" border style="width: 100%;">
        <el-table-column type="index" label="#" width="50" align="center"/>
        <el-table-column prop="name" label="客户姓名" align="center"/>
        <el-table-column prop="age" label="年龄" width="60" align="center"/>
        <el-table-column prop="gender" label="性别" width="60" align="center"/>
        <el-table-column prop="blood" label="血型" align="center"/>
        <el-table-column prop="contact" label="联系人" align="center"/>
        <el-table-column prop="tel" label="联系电话" align="center"/>
        <el-table-column prop="floor" label="楼层" align="center"/>
        <el-table-column prop="room" label="房间号" align="center"/>
        <el-table-column label="操作" width="180" align="center">
          <template #default="scope">
            <el-button type="warning" size="small" plain @click="showCustPro(scope.row)">
              <el-icon style="margin-right: 5px;"><Edit /></el-icon> 查看护理项目
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
  <el-dialog title="查看护理服务" v-model="dialogVisible" width="40%" @close="closeDialog">
    <el-row :gutter="20">
      <el-col :offset="2" :span="12" class="search-col">
        <el-form-item label="老人姓名">
          <el-input v-model="searchPro.name" placeholder="请输入老人姓名"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="6" class="search-col">
        <el-button type="primary" plain @click="searchProByName">
          <el-icon style="margin-right: 5px;">
            <Search/>
          </el-icon>
          搜索
        </el-button>
      </el-col>
    </el-row>
    <el-table :data="proList" border style="width: 100%;">
      <el-table-column type="index" label="#" width="50" align="center"/>
      <el-table-column prop="name" label="服务名称" align="center"/>
      <el-table-column prop="times" label="次数" width="60" align="center"/>
      <el-table-column prop="numState" label="数量状态" align="center">
        <template #default="scope">
          <!-- 使用v-if判断状态值 -->
          <el-tag
              v-if="scope.row.state === '数量正常'"
              type="success"
          >
            数量正常
          </el-tag>
          <el-tag
              v-else-if="scope.row.state === '欠费'"
              type="danger"
          >
            欠费
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="numState" label="到期状态" align="center">
        <template #default="scope">
          <!-- 使用v-if判断状态值 -->
          <el-tag
              v-if="scope.row.state === '未到期'"
              type="success"
          >
            未到期
          </el-tag>
          <el-tag
              v-else-if="scope.row.state === '到期'"
              type="danger"
          >
            到期
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120" align="center">
        <template #default="scope">
          <el-button type="warning" size="small" plain @click="getCareRecord(scope.row)">
            <el-icon style="margin-right: 5px;"><Edit /></el-icon> 添加护理记录
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
        v-model:current-page="proCurrentPage"
        v-model:page-size="proPageSize"
        :page-sizes="[3,5,7]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="proTotal"
        @size-change="handleProSizeChange"
        @current-change="handleProCurrentChange"
    />
    <el-dialog title="添加护理记录" v-model="addDialogVisible" width="30%" class="dialog-content">
      <el-form
          :model="addedRe"
          :rules="addformRules"
          :label-position="labelPosition"
          label-width="auto">
        <el-form-item label="护理项目" style="width: 60%;">
          <el-input v-model="addedRe.proName" placeholder="请输入姓名" disabled></el-input>
        </el-form-item>
        <el-form-item label="护理次数" style="width: 60%;">
          <el-input v-model="addedRe.times" placeholder="请输入服务次数"></el-input>
        </el-form-item>
        <el-form-item label="护理时间" style="width: 60%;" prop="nursingTime">
          <el-date-picker
              v-model="addedRe.nursingTime"
              type="date"
              placeholder="选择入住时间"
              value-format="YYYY-MM-DD"
              style="width: 60%;"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="addNursingRe">添加</el-button>
        </div>
      </template>
    </el-dialog>
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
</style>