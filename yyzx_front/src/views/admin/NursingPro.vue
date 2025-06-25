<template>
  <div class="layout">
    <!--  上面搜索栏-->
    <div class="search-div">

      <el-row :gutter="20">
        <el-col :span="5" class="search-col">
          <el-form-item class="search-item" label="项目名称">
            <el-input v-model="searchedProject.name" placeholder="请输入项目名称"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="5" class="search-col">
          <el-form-item class="search-item" label="状态">
            <el-select
                v-model="searchedProject.state"
                placeholder="请选择状态"
            >
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
              <el-option label="全部" :value="2" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="1.5" class="search-col">
          <el-button type="primary" plain @click="searchProjects">
            <el-icon style="margin-right: 5px;"><Search /></el-icon> 搜索
          </el-button>
        </el-col>
        <el-col :span="1.5" class="search-col">
          <el-button type="info" plain @click="resetTable">
            <el-icon style="margin-right: 5px;"><RefreshRight/></el-icon> 重置
          </el-button>
        </el-col>
      </el-row>
    </div>
    <!-- 护理项目表格 -->
    <div class="table-container">
      <!--  按钮  -->
      <div class="operation-button">
        <el-col :span="3">
          <!--  添加按钮  -->
          <el-button type="primary" plain @click="openAdd">
            <el-icon style="margin-right: 5px;"><Plus /></el-icon> 新增
          </el-button>
        </el-col>
      </div>
      <!--表格-->
      <!-- 项目表格 -->
      <div class="main-table">
        <el-table :data="nursingProjectList" style="width: 100%;" border class="table">
          <el-table-column prop="nursingProjectId" label="项目编号" width="180" align="center"/>
          <el-table-column prop="name" label="名称" width="180" align="center"/>
          <el-table-column prop="price" label="价格" width="180" align="center"/>
          <el-table-column prop="period" label="周期" width="180" align="center"/>
          <el-table-column prop="time" label="护理频次" width="180" align="center"/>
          <el-table-column prop="description" label="介绍" width="180" align="center"/>
          <el-table-column fixed="right" label="操作" min-width="180" align="center">
            <template v-slot="scope">
              <el-button type="warning" size="small" plain @click="openEdit(scope.row)">
                <el-icon style="margin-right: 5px;"><Edit /></el-icon> 修改
              </el-button>
              <el-button type="danger" size="small" plain @click="deleteProject(scope.row)">
                <el-icon style="margin-right: 5px;"><Delete /></el-icon> 删除
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

    <!-- 添加对话框 -->
    <el-dialog
        v-model="dialogVisible"
        v-if="dialogVisible"
        :title="dialogTitle"
        width="45%"
        :before-close="dialogClose"
    >
      <el-form
          ref="formRef"
          :model="addedProject"
          :rules="addRules"
          label-width="auto"
          label-position="top"
      >
        <!-- 第一行：项目名称 -->
        <el-row>
          <el-col :span="24">
            <el-form-item label="项目名称" prop="name">
              <el-input  placeholder="请输入项目名称" v-model="addedProject.name"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 第二行：状态和价格 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="状态" prop="state">
              <el-select
                  v-model="addedProject.state"
                  placeholder="请选择状态"
              >
                <el-option label="启用" :value="1"></el-option>
                <el-option label="禁用" :value="0"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="价格" prop="price">
              <el-input placeholder="请输入价格" v-model="addedProject.price"></el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 第三行：执行周期和执行次数 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="执行周期" prop="period">
              <el-input placeholder="请输入执行周期" v-model="addedProject.period"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="执行次数" prop="time">
              <el-input placeholder="请输入执行次数" v-model.number="addedProject.time" type="number">
                <template #append>次</template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 第四行：描述 -->
        <el-row>
          <el-col :span="24">
            <el-form-item label="描述" prop="description">
              <el-input
                  v-model="addedProject.description"
                  :autosize="{minRows: 2}"
                  type="textarea"
                  placeholder="请输入介绍"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div class="dialog-footer">
        <el-button @click="dialogClose()">取消</el-button>
        <el-button type="primary" @click="submitForm()">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import {
  Plus, Search, RefreshRight, Edit, Delete
} from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus';
import {ref, inject} from 'vue'
import qs from 'qs';
const axios = inject('axios');

// 搜索的项目
const searchedProject = ref({
  nursingProjectId: 1,
  state: 1,
  time: 0,
  name:'',
  price:'',
  period:'',
  description:''
})

// 项目的列表（分页后）
const nursingProjectList = ref([]);

// 对话框显示
const dialogVisible = ref(false);

// 对话框名称
const dialogTitle = ref('');

// 添加和修改的项目
const addedProject = ref ({
  nursingProjectId: 1,
  state: 1,
  time: 0,
  name:'',
  price:'',
  period:'',
  description:''
});

// 表单ref
const formRef = ref(null);

// 表单规则
const addRules = ref({
  name:[
    {required: true, message:"请输入项目名称", trigger: 'blur'},
  ],
  state:[
    {required: true, message:"请选择状态", trigger: 'blur'},
  ],
  price:[
    {required: true, message:"请输入价格", trigger: 'blur'},
  ],
  period:[
    {required: true, message:"请输入执行周期", trigger: 'blur'},
  ],
  time:[
    {required: true, message:"请输入执行次数", trigger: 'blur'},
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

// 分页
let total = ref(400);
let currentPage = ref(1);
let pageSize = ref(5);

// 获取表格内容
const initTable = () => {
  let url = `NursingProjectController/searchNursingPro?pageNum=${currentPage.value}&pageSize=${pageSize.value}`;
  axios.get(url).then(response =>{
    let rb = response.data;
    if(rb.status === 200){
      ElMessage({message:'表格加载成功', type:'success'});
      console.log("获取表格内容");
      nursingProjectList.value = rb.data;
      total.value = rb.total;
    }else{
      if(rb.msg === '无数据'){
        ElMessage({message:`无数据`, type:'success'});
        nursingProjectList.value = rb.data;
        total.value = rb.total;
      }
      console.log(rb.msg);
    }
  }).catch(error => {
    console.log(error);
  })
}
initTable();

// 重置表格
const resetTable = () => {
  // 还重置搜索的内容
  searchedProject.value = {
    nursingProjectId: 1,
    state: 1,
    time: 0,
    name:'',
    price:'',
    period:'',
    description:''
  };
  total.value = 400;
  currentPage.value = 1;
  pageSize.value = 5;
  initTable();
}

// 搜索
const searchProjects = () => {
  console.log("搜索项目：");
  console.log(searchedProject.value);
  let url = `NursingProjectController/searchNursingPro?name=${searchedProject.value.name}&state=${searchedProject.value.state}&cur=${currentPage.value}&pageSize=${pageSize.value}`;
  axios.get(url).then(response => {
    let rb = response.data;
    if(rb.status === 200){
      ElMessage({message:`搜索到${rb.total}条表项`, type:'success'});
      nursingProjectList.value = rb.data;
      total.value = rb.total;
    }else{
      if(rb.msg === '无数据'){
        ElMessage({message:`无数据`, type:'success'});
        nursingProjectList.value = rb.data;
        total.value = rb.total;
      }
      console.log(rb.msg);
    }
  }).catch(error => {
    console.log(error)
  })
}

// 添加和修改的提交
const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      if (dialogTitle.value === "添加项目") {
        console.log("add project");
        let url = `NursingProjectController/addNursingPro`;
        axios.post(url, addedProject.value).then(response => {
          let rb = response.data;
          if (rb.status === 200) {
            ElMessage({message: '添加成功', type: 'success'});
            resetTable();
            resetForm();
            dialogVisible.value = false;
          } else {
            console.log(rb.msg);
          }
        }).catch(error => {
          console.log(error);
        });
      } else {
        console.log("edit project");
        let url = `NursingProjectController/editNursingPro`;
        axios.post(url, addedProject.value).then(response => {
          let rb = response.data;
          if (rb.status === 200) {
            ElMessage({message: '修改成功', type: 'success'});
            resetTable();
            resetForm();
            dialogVisible.value = false;
          } else {
            console.log(rb.msg);
          }
        }).catch(error => {
          console.log(error);
        })
      }

    } else {
      console.log("添加项目时表单验证未通过");
      return false;
    }
  })

}
// 打开添加对话框
const openAdd = () => {
  dialogTitle.value = "添加项目";
  dialogVisible.value = true;
  console.log(addedProject.value);
}

// 打开修改对话框
const openEdit = (row) => {
  dialogTitle.value = "修改项目";
  dialogVisible.value = true;
  addedProject.value = {...row};
  console.log(row);
}

// 重置表单和表单验证规则
const resetForm = () => {
  addedProject.value = {
    nursingProjectId:'',
    state: 1,
    time: 0,
    name:'',
    price:'',
    period:'',
    description:''
  };
  formRef.value?.clearValidate();
}

// 对话框关闭和取消
const dialogClose = () => {
  ElMessageBox.confirm('是否关闭该对话框？')
      .then(() => {
        dialogVisible.value = false;
        // 重置表单和表单验证规则，不能使用reset，因为添加和修改使用一个表单
        // formRef.value?.resetFields();
        resetForm();
      }).catch((error) => {
    console.log(error);
  })
}


// 删除表项
const deleteProject = (row) => {
  ElMessageBox.confirm('确定删除这条表项？')
      .then(() => {
        let url = `NursingProjectController/deleteNursingPro?nursingProjectId=${row.nursingProjectId}`;
        console.log(`delete project ${row.nursingProjectId}`);
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
        });
      }).catch((error) => {
    console.log(error);
  })

}

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