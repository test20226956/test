<template>
  <div class="layout">
    <!--  上面搜索栏-->
    <div class="search-div">

      <el-row :gutter="20">
        <el-col :span="5" class="search-col">
          <el-form-item class="search-item" label="客户姓名">
            <el-input v-model="searchedCustomer.name" placeholder="请输入客户姓名"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="5" class="search-col">
          <el-form-item class="search-item" label="护理级别">
            <el-select
                v-model="searchedCustomer.nursingLevelId"
                placeholder="请选择护理级别"
            >
              <el-option
                  v-for="level in searchableLevelList"
                  :key="level.nursingLevelId"
                  :label="level.name"
                  :value="level.nursingLevelId"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="1.5" class="search-col">
          <el-button type="primary" plain @click="searchCustomers">
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
    <!-- 客户护理表格 -->
    <div class="table-container">
      <!--表格-->
      <!-- 项目表格 -->
      <div class="main-table">
        <el-table :data="customerNursingList">
          <el-table-column prop="customer.customerId" label="客户编号" align="center"></el-table-column>
          <el-table-column prop="customer.name" label="姓名" align="center"></el-table-column>
          <el-table-column prop="age" label="年龄" align="center"></el-table-column>
          <el-table-column prop="customer.gender" label="性别" align="center">
            <template #default="scope">
              {{ scope.row.customer.gender === 0 ? '男' : '女' }}
            </template>
          </el-table-column>
          <el-table-column prop="room.roomNumber" label="房间号" align="center"></el-table-column>
          <el-table-column prop="bed.bedNumber" label="床号" align="center"></el-table-column>
          <el-table-column prop="nursingLevel?.name" label="护理级别" align="center">
            <template #default="scope">
              <el-tag
                  :style="scope.row.nursingLevel?.name
    ? { backgroundColor: '#f0f4f1', color: '#9db7a5', borderColor: '#9db7a5' }
    : { backgroundColor: '#fcf5eb', color: '#e5a13c', borderColor: '#e5a13c' }"
              >{{scope.row.nursingLevel?.name ? scope.row.nursingLevel.name : '无级别'}}</el-tag>
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" min-width="180" align="center">
            <template v-slot="scope">
              <el-button type="danger" size="small" plain @click="deleteLevel(scope.row)" v-if="scope.row.nursingLevel?.name">
                <el-icon style="margin-right: 5px;"><Delete /></el-icon> 删除
              </el-button>
              <el-button type="warning" size="small" plain @click="setDialogOpen(scope.row)" v-else>
                <el-icon style="margin-right: 5px;"><Plus /></el-icon> 设置
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <!-- 分页 -->
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
    <!-- 给客户设置级别弹窗 -->
    <el-dialog
        v-model="dialogVisible"
        v-if="dialogVisible"
        title="设置护理级别"
        width="55%"
        :before-close="setDialogClose"
    >
      <!-- 第一行：选择护理级别 -->
      <el-row>
        <el-col :span="6" style="text-align: left;">
          <el-form-item label="护理级别">
            <el-select
                v-model="setting.nursingLevelId"
                placeholder="请选择状态"
                @change="handleLevelChange"
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
      </el-row>
      <!-- 第二行：项目表格 -->
      <el-row>
        <el-table :data="nursingServiceList" width="100%" max-height="60vh">
          <el-table-column prop="nursingProjectId" label="项目编号" width="80px" align="center"></el-table-column>
          <el-table-column prop="name" label="项目名称" width="80px" align="center"></el-table-column>
          <el-table-column prop="price" label="价格" width="100px" align="center"></el-table-column>
          <el-table-column prop="period" label="执行周次" width="80px" align="center"></el-table-column>
          <el-table-column prop="time" label="执行次数" width="80px" align="center"></el-table-column>
          <el-table-column prop="purchaseTime" label="购买日期" width="100px" align="center"></el-table-column>
          <el-table-column prop="amount" label="购买数量" align="center" width="100px">
            <template v-slot="scope">
              <el-form :model="scope.row" label-width="0" inline style="width: 100%;" :rules="amountRules" ref="amountRef">
                <el-form-item prop="amount" style="width: 100%;" >
                    <el-input type="number" v-model="scope.row.amount" style="width: 100%; box-sizing: border-box;"/>
                </el-form-item>
              </el-form>
            </template>
          </el-table-column>
          <el-table-column prop="endTime" label="结束时间" align="center" width="150px">
              <template v-slot="scope">
                <el-form :model="scope.row" :rules="timeRules" ref="timeRef">
                  <el-form-item prop="endTime">
                    <el-date-picker
                        v-model="scope.row.endTime"
                        type="date"
                        placeholder="请选择结束日期"
                        :disabled-date="disabledDate"
                        :shortcuts="shortcuts"
                        value-format="YYYY-MM-DD"
                    ></el-date-picker>
                  </el-form-item>
                </el-form>
              </template>
          </el-table-column>
        </el-table>
      </el-row>
      <div class="dialog-footer" style="margin-top: 10px">
        <el-button @click="setDialogClose()">取消</el-button>
        <el-button type="primary" @click="addLevel()">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import {
  Plus, Search, RefreshRight, Edit, Delete
} from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus';
import {ref, inject, computed} from 'vue'
import qs from 'qs';
const axios = inject('axios');
import dayjs from 'dayjs'

// 搜索的客户
const searchedCustomer = ref({
  name:'',
  nursingLevelId:0,
})

// 搜索的护理级别
const nursingLevelList = ref([]);

// 派生一个带“无级别”的选项列表，仅用于搜索
const searchableLevelList = computed(() => {
  return [{ nursingLevelId: 0, name: '无级别' }, ...nursingLevelList.value];
});

// 客户列表
const customerNursingList = ref([]);

// 弹窗
const dialogVisible = ref(false);

// 设置的护理级别
const setting = ref({
  customerId:0,
  nursingLevelId: null
});
// 护理级别下的项目
const nursingServiceList = ref([]);

// 两个表单
const amountRef = ref(null);
const timeRef = ref(null);

// 禁用日期
const disabledDate = (time) => {
  return time.getTime() < Date.now()
}

// 表单数量验证
const amountRules = ref({
  amount:[
    {required: true, message:"请输入数量", trigger: 'blur'},
    {
      validator: (rule, value, callback) => {
        if (value === '' || value === null || value === undefined) {
          callback(new Error("请输入数字"));
        } else if (!/^\d+$/.test(value)) {
          callback(new Error("请输入正整数"));
        } else {
          callback();
        }
      }

    }
  ],
})

// 日期表单验证
const timeRules = ref({
  endTime:[
    {required: true, message:'请选择结束日期', trigger:'blur'},
  ]
});

// 快捷日期选择
const shortcuts = [
  {
    text: '三月后',
    value: () => {
      const date = new Date()
      date.setMonth(date.getMonth() + 3)
      return date
    },
  },
  {
    text: '一月后',
    value: () => {
      const date = new Date()
      date.setMonth(date.getMonth() + 1)
      return date
    },

  }
]

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

// 获取客户护理列表和级别
// 获取客户列表
const initCustomer = () => {
  let url = `CustomerController/showCareCust?pageNum=${currentPage.value}&pageSize=${pageSize.value}`;
  axios.get(url).then(response => {
    let rb = response.data;
    if(rb.status === 200){
      customerNursingList.value = rb.data;
      total.value = rb.total;
      ElMessage({message:'客户表格加载成功', type:'success'});
      console.log(customerNursingList.value);
    }else{
      console.log(rb.msg);
    }
  }).catch(error => {
    console.log(error);
  });
}
// 初始化护理级别
const initLevel = () => {
  // 获取护理级别列表
  let url = `NursingLevelController/showOk`;
  axios.get(url).then(response => {
    let rb = response.data;
    if(rb.status === 200){
      console.log("加载护理级别成功！");
      nursingLevelList.value = rb.data;
    }else{
      console.log(rb.msg);
    }
  }).catch(error => {
    console.log(error);
  })
}
const initTable = () => {
  initCustomer();
  initLevel();
}
initTable();

// 搜索
const searchCustomers = () => {
  console.log('search customers!');
  if(searchedCustomer.value.nursingLevelId === 0){
    console.log("搜索无级别的！");
    let url1 = `NursingProjectController//searchNoLevelCareCust?name=${searchedCustomer.value.name}&pageNum=${currentPage.value}&pageSize=${pageSize.value}`
  }
  let url = `CustomerController/searchCareCust?name=${searchedCustomer.value.name}&nursingLevelId=${searchedCustomer.value.nursingLevelId}&pageNum=${currentPage.value}&pageSize=${pageSize.value}`;
  axios.get(url).then(response => {
    let rb = response.data;
    if(rb.status === 200){
      customerNursingList.value = rb.data;
      total.value = rb.total;
      ElMessage({message:`查找到${total.value}条数据`, type:'success'});
    }else{
      console.log(rb.msg);
      if(rb.msg === '查不到符合条件的记录'){
        ElMessage({message:'无数据', type:'success'});
        customerNursingList.value = [];
      }
    }
  }).catch(error => {
    console.log(error);
  })
}

// 重置
const resetTable = () => {
  initTable();
  searchedCustomer.value = {
    name:'',
    nursingLevelId:null
  }
}

// 删除客户级别
const deleteLevel = (row) => {
  console.log(`delete ${row.customer.name}'s nursing level`);
  ElMessageBox.confirm(`确定删除${row.customer.name}的护理级别？`)
      .then(() => {
        let url = `NursingServiceController/deleteNursingLevel?customerId=${row.customer.customerId}`
        axios.post(url).then(response => {
          let rb = response.data;
          if(rb.status === 200){
            ElMessage({message:'删除成功', type:'success'});
            resetTable();
          }else{
            console.log(rb.msg);
          }
        }).catch(error => {
          console.log(error);
        })
      }).catch(error => {
        console.log(error);
  })

}

// 打开设置护理级别弹窗
const setDialogOpen = (row) => {
  dialogVisible.value = true;
  // 知道是给哪个客户设置护理级别
  setting.value.customerId = row.customer.customerId;
}

// 关闭设置护理级别弹窗
const setDialogClose = () => {
  ElMessageBox.confirm('是否关闭该对话框？')
      .then(() => {
        dialogVisible.value = false;
        // 重置表单
        setting.value.customerId = null;
        setting.value.nursingLevelId = null;
      }).catch((error) => {
    console.log(error);
  })
}

// 根据级别去后端找对应项目
const handleLevelChange = () => {
  // 要给得到的项目设置三个属性：amount, purchaseTime, endTime
  let id = setting.value.nursingLevelId;
  let url = `NursingLevelController/showNursingPro?nursingLevelId=${id}`;
  axios.get(url).then(response => {
    let rb = response.data;
    if(rb.status === 200){
      console.log("获取项目成功");
      nursingServiceList.value = rb.data;
      console.log(nursingServiceList.value);
      // 当前日期
      const now = new Date();
      // 设置购买时间
      const purchaseTime = dayjs(now).format('YYYY-MM-DD');

      // 设置结束时间（三个月后）
      const end = new Date(now);
      end.setMonth(end.getMonth() + 3);
      const endTime = dayjs(end).format('YYYY-MM-DD');
    //   增加属性
      nursingServiceList.value.forEach((item, index) => {
        nursingServiceList.value[index].amount = 1;
        nursingServiceList.value[index].purchaseTime = purchaseTime;
        nursingServiceList.value[index].endTime = endTime;
      })
    }else{
      console.log(rb.msg);
      if(rb.msg === '该护理级别下没有可用项目'){
        nursingServiceList.value = [];
      }
    }
  }).catch(error => {
    console.log(error);
  })
}

// 给客户设置级别和项目
const addLevel = () => {
  if(nursingServiceList.value.length === 0){
    ElMessage({message:'请选择有项目的级别', type:'error'});
    return;
  }
  let sentServiceList = nursingServiceList.value
      .filter(item => item.amount > 0)
      .map(item => ({
        nursingServiceId: 0,
        customerId: setting.value.customerId,
        nursingLevelId: setting.value.nursingLevelId,
        nursingProjectId: item.nursingProjectId,
        amount: item.amount,
        purchaseTime: item.purchaseTime,
        endTime: item.endTime
      }));
  if(amountRef.value.validate() && timeRef.value.validate()){
    let url1 = `NursingLevelController/addCustNursingLevel?customerId=${setting.value.customerId}&nursingLevelId=${setting.value.nursingLevelId}`;
    axios.post(url1).then(response => {
      let rb = response.data;
      if(rb.status === 200){
        ElMessage({message:'级别设置成功', type:'success'});
      }else{
        console.log(rb.msg);
      }
    }).catch(error => {
      console.log(error);
    })
    // 如果一个项目都不要
    if(sentServiceList.length !== 0){
      let url2 = `NursingServiceController/batchAdd`;
      axios.post(url2, sentServiceList).then(response => {
        let rb = response.data;
        if(rb.status === 200){
          ElMessage({message:'添加成功', type:'success'});
          dialogVisible.value = false;
          setting.value = {
            customerId: null,
            nursingLevelId: null,
          }
          initTable();
        }else{
          console.log(rb.msg);
        }
      }).catch(error => {
        console.log(error);
      })
    }else{
      dialogVisible.value = false;
      setting.value = {
        customerId: null,
        nursingLevelId: null,
      }
      initTable();
    }
  }
}

</script>

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
  margin-left: 16px;
}
.search-item{
  margin-bottom: 0px;
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