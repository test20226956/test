<template>
  <div class="layout">
    <!--  上面搜索栏-->
    <div class="search-div">

      <el-row :gutter="20">
        <el-col :span="5" class="search-col">
          <el-form-item class="search-item" label="级别名称">
            <el-input v-model="searchedLevel.name" placeholder="请输入级别名称"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="5" class="search-col">
          <el-form-item class="search-item" label="状态">
            <el-select v-model="searchedLevel.state" placeholder="请选择状态">
              <el-option label="启用" :value="1" />
              <el-option label="禁用" :value="0" />
              <el-option label="全部" :value="2" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="1.5" class="search-col">
          <el-button type="primary" plain @click="searchLevels">
            <el-icon style="margin-right: 5px;">
              <Search />
            </el-icon> 搜索
          </el-button>
        </el-col>
        <el-col :span="1.5" class="search-col">
          <el-button type="info" plain @click="resetTable">
            <el-icon style="margin-right: 5px;">
              <RefreshRight />
            </el-icon> 重置
          </el-button>
        </el-col>
      </el-row>
    </div>
    <!-- 护理级别表格 -->
    <div class="table-container">
      <!--  按钮  -->
      <div class="operation-button">
        <el-col :span="3">
          <!--  添加按钮  -->
          <el-button type="primary" plain @click="addDialogOpen">
            <el-icon style="margin-right: 5px;">
              <Plus />
            </el-icon> 新增
          </el-button>
        </el-col>
      </div>
      <!--表格-->
      <!-- 项目表格 -->
      <div class="main-table">
        <el-table :data="nursingLevelList"
                  style="width: 100%; overflow-y: auto; height: 100%; max-height: 55vh;" class="table"
                  @expand-change="handleExpand"
                  :row-key="row => row.nursingLevelId"
                  ref="tableRef"
        >
          <!-- 展开列 -->
          <el-table-column type="expand">
            <template #default="props" class="sub-table-container">
              <div class="sub-table">
                <!-- 子表格 -->
                <el-table :data="props.row.projects" size="small"
                          style="justify-content: center; width: 100%;">
                  <el-table-column prop="nursingProjectId" label="项目编号" width="180" align="center" />
                  <el-table-column prop="name" label="名称" width="180" align="center" />
                  <el-table-column prop="price" label="价格" width="180" align="center" />
                  <el-table-column prop="period" label="周期" width="180" align="center" />
                  <el-table-column prop="time" label="护理频次" width="180" align="center" />
                  <el-table-column prop="description" label="介绍" align="center" show-overflow-tooltip/>
                  <el-table-column label="操作" width="180" align="center">
                    <template v-slot="scope">
                      <el-button type="danger" size="small" plain
                                 @click="deleteProjectWhenExpand(scope.row, props.row)">
                        <el-icon style="margin-right: 5px;">
                          <Delete />
                        </el-icon> 删除
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </template>
          </el-table-column>
          <!-- 主表格列 -->
          <el-table-column prop="nursingLevelId" label="级别编号" width="180" align="center" />
          <el-table-column prop="name" label="名称" width="180" align="center" />
          <el-table-column prop="state" label="状态" width="180" align="center" >
            <template #default="scope">
              {{ scope.row.state === 0 ? '禁用' : '启用' }}
            </template>
          </el-table-column>
          <el-table-column></el-table-column>
          <el-table-column fixed="right" label="操作" width="180" align="center">
            <template v-slot="scope">
              <div style="text-align: right;">
                <el-button type="warning" size="small" plain @click="editDialogOpen(scope.row)">
                  <el-icon style="margin-right: 5px;">
                    <Edit />
                  </el-icon> 修改
                </el-button>
                <el-button type="danger" size="small" plain @click="deleteLevel(scope.row)">
                  <el-icon style="margin-right: 5px;">
                    <Delete />
                  </el-icon> 删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <!-- 分页 -->
    <div class="page-container">
      <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize" :page-sizes="[5,10]"
                     layout="total, sizes, prev, pager, next, jumper" :total="total" @size-change="handleSizeChange"
                     @current-change="handleCurrentChange" />
    </div>

    <!-- 添加级别对话框 -->
    <el-dialog v-model="addDialogVisible" v-if="addDialogVisible" title="添加级别" width="45%"
               :before-close="addDialogClose">
      <el-form ref="addFormRef" :model="addedLevel" :rules="addRules" label-width="auto" label-position="top">
        <el-form-item label="级别名称" prop="name">
          <el-input placeholder="请输入级别名称" v-model="addedLevel.name"></el-input>
        </el-form-item>
        <el-form-item label="状态" prop="state">
          <el-select v-model="addedLevel.state" placeholder="请选择状态">
            <el-option label="启用" :value="1"></el-option>
            <el-option label="禁用" :value="0"></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div class="dialog-footer">
        <el-button @click="addDialogClose()">取消</el-button>
        <el-button type="primary" @click="submitAdd()">确定</el-button>
      </div>
    </el-dialog>

    <!-- 修改级别对话框 -->
    <el-dialog v-model="editDialogVisible" v-if="editDialogVisible" title="级别配置" width="45%"
               :before-close="editDialogClose">
      <el-form
          ref="editFormRef"
          :model="editedLevel"
          :rules="editRules"
          label-width="auto"
          label-position="top"
      >
        <!-- 第一行：级别名称和状态 -->
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="级别名称" prop="name">
              <el-input placeholder="请输入级别名称" v-model="editedLevel.name"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="state">
              <el-select v-model="editedLevel.state" placeholder="请选择状态">
                <el-option label="启用" :value="1"></el-option>
                <el-option label="禁用" :value="0"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 第二行：添加按钮和搜索重置 -->
        <el-row :gutter="20">
          <el-col :span="4">
            <el-button type="primary" plain @click="proDialogOpen">
              <el-icon style="margin-right: 5px;">
                <Plus />
              </el-icon> 添加
            </el-button>
          </el-col>

          <el-col :span="9">
            <el-form label-position="left" label-width="auto">
              <el-form-item label="项目名称">
                <el-input v-model="searchAddedProName" placeholder="请输入项目名称" clearable></el-input>
              </el-form-item>
            </el-form>
          </el-col>
          <!--         <el-col :span="1.1">
                      <el-button type="primary" plain circle @click="searchAddedPro">
                        <el-icon>
                          <Search />
                        </el-icon>
                      </el-button>
                    </el-col> -->
          <el-col :span="1.1">
            <el-button type="primary" plain circle @click="resetAddedPro">
              <el-icon>
                <RefreshRight />
              </el-icon>
            </el-button>
          </el-col>
        </el-row>
        <!-- 第三行：当前级别的项目列表 -->
        <el-row>
          <el-table :data="displayedProjects" max-height="40vh">
            <el-table-column prop="nursingProjectId" label="项目编号" width="100" align="center"/>
            <el-table-column prop="name" label="名称" width="100" align="center"/>
            <el-table-column prop="price" label="价格" width="100" align="center"/>
            <el-table-column prop="period" label="周期" width="100" align="center"/>
            <el-table-column prop="time" label="护理频次" width="100" align="center"/>
            <el-table-column fixed="right" label="操作" min-width="100" align="center">
              <template v-slot="scope">
                <el-button type="danger" size="small" plain @click="deleteProjectWhenEdit(scope.row)">
                  <el-icon style="margin-right: 5px;"><Delete /></el-icon> 删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-row>
      </el-form>
      <div class="dialog-footer">
        <el-button @click="editDialogClose()">取消</el-button>
        <el-button type="primary" @click="submitEdit()">确定</el-button>
      </div>
    </el-dialog>


    <!-- 添加项目对话框 -->
    <el-dialog
        v-model="proDialogVisible"
        v-if="proDialogVisible"
        title="添加项目"
        width="45%"
        :before-close="proDialogClose"
    >
      <!-- 搜索界面 -->
      <el-row :gutter="16">
        <el-col :span="9">
          <el-form label-position="left" label-width="auto">
            <el-form-item label="项目名称">
              <el-input v-model="searchUnAddedProName" placeholder="请输入项目名称" clearable></el-input>
            </el-form-item>
          </el-form>
        </el-col>
        <el-button type="primary" plain circle @click="resetUnAddedPro">
          <el-icon>
            <RefreshRight />
          </el-icon>
        </el-button>
      </el-row>
      <!-- 未添加项目表格界面 -->
      <el-row>
        <el-table
            :data="searchUnAddedResult"
            height="50vh" max-height="50vh"
            @selection-change="unAddedSelectionChange"
            :row-key="row => row.nursingProjectId"
        >
          <el-table-column type="selection" width="55" :reserve-selection="true"/>
          <el-table-column prop="nursingProjectId" label="项目编号" width="100" align="center"/>
          <el-table-column prop="name" label="名称" width="120" align="center"/>
          <el-table-column prop="price" label="价格" width="120" align="center"/>
          <el-table-column prop="period" label="周期" width="120" align="center"/>
          <el-table-column prop="time" label="护理频次" align="center"/>
        </el-table>
      </el-row>
      <div class="dialog-footer">
        <el-button @click="proDialogClose()">取消</el-button>
        <el-button type="primary" @click="addPro">确定</el-button>
      </div>

    </el-dialog>

  </div>
</template>

<script setup>
import {
  Plus,
  Search,
  RefreshRight,
  Edit,
  Delete
} from '@element-plus/icons-vue'
import {
  ElMessage,
  ElMessageBox,
  ElStep
} from 'element-plus';
import {
  ref,
  inject,
  nextTick,
  computed
} from 'vue'
import qs from 'qs';
const axios = inject('axios');

// 搜索的级别
const searchedLevel = ref({
  name: '',
  state: 1,
})

// 表格ref
const tableRef = ref(null);

// 级别的列表（分页后）
const nursingLevelList = ref([]);

// 添加的级别
const addedLevel = ref({
  nursingLevelId: 0,
  name: '',
  state: 1,
});

// 添加级别对话框
const addDialogVisible = ref(false);

// 添加的表单
const addFormRef = ref(null);

// 添加级别规则
const addRules = ref({
  name: [{
    required: true,
    message: '请输入级别名称',
    trigger: 'blur'
  }, ],
  state: [{
    required: true,
    message: "请选择状态",
    trigger: 'blur'
  }, ],
});

// 修改的级别
const editedLevel = ref(null);

// 修改级别对话框
const editDialogVisible = ref(false);

// 修改的表单
const editFormRef = ref(null);

// 修改级别规则
const editRules = ref({
  name: [{
    required: true,
    message: '请输入级别名称',
    trigger: 'blur'
  }, ],
  state: [{
    required: true,
    message: "请选择状态",
    trigger: 'blur'
  }, ],
});

// 添加项目对话框
const proDialogVisible = ref(false);

// 是否需要访问后端来得到未添加的项目
const needFetchUnAdded = ref(true);

// 搜索的已经添加的项目
const searchAddedProName = ref('');

// 未添加的项目
const unAddedProList = ref([]);

// 搜索未添加的项目
const searchUnAddedProName = ref('');

// 未添加项目搜索结果 - 对不起只能这样了
// const searchUnAddedResult = computed(() => {
// 	  if (!searchUnAddedProName.value.trim()) {
// 	    return unAddedProList.value; // 没写关键词就返回全部
// 	  }

// 	  return unAddedProList.value.filter(item =>
// 	    item.name.includes(searchUnAddedProName.value.trim())
// 	  );
// })

const searchUnAddedResult = computed(() => {
  // 全部列表：已选 + 未选（搜索过）
  const selected = selectedUnAddedProList.value;
  const unselected = unAddedProList.value.filter(item =>
      searchUnAddedProName.value ? item.name.includes(searchUnAddedProName.value) : true
  );
  // 合并且去重（以 nursingProjectId 为键）
  const all = [...selected, ...unselected];
  const uniqueMap = new Map();
  all.forEach(item => {
    uniqueMap.set(item.nursingProjectId, item);
  });

  return Array.from(uniqueMap.values());
})

// 已选择的未添加的项目
const selectedUnAddedProList = ref([]);

// 自动计算展示用的项目列表
const displayedProjects = computed(() => {
  const keyword = searchAddedProName.value.trim().toLowerCase();
  if (!keyword) return editedLevel.value.projects || [];

  return (editedLevel.value.projects || []).filter(item =>
      item.name?.toLowerCase().includes(keyword)
  );
});

// 分页
let total = ref(400);
let currentPage = ref(1);
let pageSize = ref(5);

// 获取表格内容
const initTable = () => {
  let url = `NursingLevelController/searchNursingLevel?pageNum=${currentPage.value}&pageSize=${pageSize.value}`;
  axios.get(url).then(response => {
    let rb = response.data;
    if (rb.status === 200) {
      // ElMessage({
      //   message: '表格加载成功',
      //   type: 'success'
      // });
      console.log("获取表格内容");
      nursingLevelList.value = rb.data;
      total.value = rb.total;
    } else {
      ElMessage({message:rb.msg, type:'error'});
      nursingLevelList.value = rb.data;
      total.value = rb.total;
      console.log(rb.msg);
    }
  }).catch(error => {
    console.log(error);
  })
};
initTable();


// 展开时获取对应级别的项目列表
const handleExpand = (row, expandedRows) => {
  // 先检测是展开还是收起
  const isExpand = expandedRows.some(r => r.nursingLevelId === row.nursingLevelId);
  if(isExpand){
    console.log("展开");
    let projects = [];

    console.log("当前展开的行：", row)
    console.log("所有展开的行：", expandedRows)
    nursingLevelList.value.forEach((temp, index) => {
      if(temp.nursingLevelId === row.nursingLevelId){
        // 找到点击行，把数据赋值进去
        if(!nursingLevelList.value[index].projects != []){
          console.log("赋值");
          let id = nursingLevelList.value[index].nursingLevelId;
          let url = `NursingLevelController/showNursingPro?nursingLevelId=${id}`;
          let projects = [];
          axios.get(url).then(response => {
            let rb = response.data;
            if(rb.status === 200){
              projects = rb.data;
              console.log("得到了项目");
              console.log(projects);
              nursingLevelList.value[index].projects = projects;
            }else{
              console.log(rb.msg);
            }
          }).catch(error => {
            console.log(error);
          })

        }
      }
    })
  }else{
    console.log("收起");
  }
}

// 收回所有展开行
const collapseAll = () => {
  // 遍历所有行，逐一收起
  nursingLevelList.value.forEach(row => {
    tableRef.value.toggleRowExpansion(row, false)
  })
}

// 重置表格内容
const resetTable = () => {
  // 重置搜索框
  searchedLevel.value = {
    name: '',
    state: 1,
  }
  // 重置分页
  total.value = 400;
  currentPage.value = 1;
  pageSize.value = 5;
  if(nursingLevelList.value !== null){
    // 表格都收回
    collapseAll();
  }
  initTable();
}

// 搜索表格
const searchLevels = () => {
  console.log('search level');
  console.log(searchedLevel.value);
  let url =
      `NursingLevelController/searchNursingLevel?name=${searchedLevel.value.name}&state=${searchedLevel.value.state}&pageNum=${currentPage.value}&pageSize=${pageSize.value}`;
  // console.log(url);
  axios.get(url).then(response => {
    let rb = response.data;
    if (rb.status === 200) {
      // ElMessage({
      //   message: `搜索到${rb.total}条表项`,
      //   type: 'success'
      // });
      nursingLevelList.value = rb.data;
      total.value = rb.total;
    } else {
      ElMessage({message:rb.msg, type:'error'});
      nursingLevelList.value = rb.data;
      total.value = rb.total;

      console.log(rb.msg);
    }
  }).catch(error => {
    console.log(error);
  })
}

// 添加对话框打开
const addDialogOpen = () => {
  addDialogVisible.value = true;
}

// 添加对话框取消和关闭
const addDialogClose = () => {
  ElMessageBox.confirm('是否关闭该对话框？')
      .then(() => {
        addDialogVisible.value = false;
        addFormRef.value?.resetFields();
      }).catch((error) => {
    console.log(error);
  })
}

// 添加级别
const submitAdd = () => {
  console.log('add level');
  console.log(addedLevel.value);
  addFormRef.value.validate((valid) => {
    if (valid) {
      let url = `NursingLevelController/addNursingLevel`;
      axios.post(url, addedLevel.value).then(response => {
        let rb = response.data;
        if (rb.status === 200) {
          ElMessage({
            message: '添加成功',
            type: 'success'
          });
          resetTable();
          addDialogVisible.value = false;
          addFormRef.value?.resetFields();
        }
      }).catch(error => {
        ElMessage({message:rb.msg, type:'error'});
        console.log(error);
      })
    } else {
      console.log("添加级别时表单验证未通过");
      return false;
    }
  })
}

// 修改对话框打开
const editDialogOpen = (row) => {
  console.log("打开修改对话框");
  editDialogVisible.value = true;
  console.log("当前的nursingList:");
  console.log(nursingLevelList.value);
  console.log("点击的这一行：")
  console.log(row);
  // 赋值
  editedLevel.value = JSON.parse(JSON.stringify(row));
  console.log("修改的数据：")
  console.log(editedLevel.value);
  // 看一下有没有项目
  if(!editedLevel.value.projects || editedLevel.value.projects.length === 0){
    console.log("级别下项目为空，去找")
    let projects = [];
    let url = `NursingLevelController/showNursingPro?nursingLevelId=${row.nursingLevelId}`;
    axios.get(url).then(response => {
      let rb = response.data;
      if(rb.status === 200){
        projects = rb.data;
        console.log("找到了，是：")
        console.log(projects);
        editedLevel.value.projects = JSON.parse(JSON.stringify(projects));
        //   也给对应位置的列表赋值
        nursingLevelList.value.forEach((item, index) => {
          if(item.nursingLevelId === row.nursingLevelId){
            nursingLevelList.value[index].projects = JSON.parse(JSON.stringify(projects));
          }
        })
      }else{
        console.log("没找到")
        console.log(rb.msg);
        editedLevel.value.projects = JSON.parse(JSON.stringify(projects));
        //   也给对应位置的列表赋值
        nursingLevelList.value.forEach((item, index) => {
          if(item.nursingLevelId === row.nursingLevelId){
            nursingLevelList.value[index].projects = [];
          }
        })
      }
    }).catch(error => {
      console.log(error);
    })
  }

  console.log("当前修改的数据：");
  console.log(editedLevel.value);
  console.log("当前的总数据：");
  console.log(nursingLevelList.value);
  // 每次打开，都重置未添加的项目
  unAddedProList.value = [];
  needFetchUnAdded.value = true;
  console.log("当前可以添加的项目：");
  console.log(unAddedProList.value);
  console.log("是否需要调用后端去获得未添加的项目：");
  console.log(needFetchUnAdded.value);
}

// 修改对话框关闭
const editDialogClose = () => {
  console.log("关闭修改对话框");
  ElMessageBox.confirm('是否关闭该对话框？')
      .then(() => {
        console.log("确定关闭修改对话框");
        editDialogVisible.value = false;
        // 重置搜索
        searchAddedProName.value = '';
        console.log("当前修改的数据：");
        console.log(editedLevel.value);
        console.log("当前的总数据：");
        console.log(nursingLevelList.value);
        resetEditForm();
      }).catch((error) => {
    console.log(error);
  })
}

// 重置修改内容
const resetEditForm = () => {
  console.log("重置修改内容");
  editedLevel.value = {
    nursingLevelId: 0,
    name: '',
    state: 1,
    projects: [],
  }
  console.log("当前修改的数据：");
  console.log(editedLevel.value);
  console.log("当前的总数据：");
  console.log(nursingLevelList.value);
  editFormRef.value?.clearValidate();
  searchAddedProName.value = ''
}


// 搜索已经添加的项目
// const searchAddedPro = () => {
// 	console.log("搜索已经添加的项目");
// 	console.log("搜索的名称是：");
//   let searchName = searchAddedProName.value;
//   console.log(searchName);
//   // 先重置，再搜索
//   console.log("先进行了重置：");
//   resetAddedPro();
//   searchAddedProName.value = searchName;
//   console.log("搜索已经添加的项目");
//   if(editedLevel.value.projects === null || editedLevel.value.projects.length === 0){
//     console.log("修改的数据根本没有项目")
// 	// 如果根本没有就不需要去找了
//     ElMessage({message:'无数据', type:'info'});
//     return;
//   }
//   console.log("进行搜索");
//   const keyword = searchName.trim().toLowerCase();
//   editedLevel.value.projects = editedLevel.value.projects.filter(item => {
//     const matchName = keyword === '' || item.name.toLowerCase().includes(keyword);
//     console.log("找到的项目是：");
// 	console.log(matchName);
// 	return matchName;
//   })
// };

// 重置已经添加的项目
const resetAddedPro = () => {
  console.log("重置已经添加的项目");
  // console.log("从nursingLevelList里面找到已经添加的项目")
  // console.log("nursingLevelList的内容是：");
  // console.log(nursingLevelList.value);
  // nursingLevelList.value.forEach((item, index) => {
  //   if(item.nursingLevelId === editedLevel.value.nursingLevelId){
  //     console.log("找到了nursingLevelList中正在被修改的那一项，这里的项目为：");
  //     console.log(item.projects);
  //     editedLevel.value.projects = JSON.parse(JSON.stringify(item.projects));
  //  console.log("修改的级别下的项目为：");
  //  console.log(editedLevel.value);
  //   }
  // })
  searchAddedProName.value = '';
}

// 打开添加项目对话框
const proDialogOpen = () => {
  console.log("打开添加项目对话框")
  if(needFetchUnAdded.value === true){
    console.log("需要给表格赋值")
    // 去给表格赋值
    let url = `NursingLevelController/showUnNursingPro?nursingLevelId=${editedLevel.value.nursingLevelId}`;
    axios.get(url).then(response => {
      let rb = response.data;
      if(rb.status === 200){
        // 当已有数据时，需要再添加
        rb.data.forEach((item, index) => {
          unAddedProList.value.push(item);
        })
        console.log("可以添加的项目是：")
        console.log(unAddedProList.value);
        needFetchUnAdded.value = false;
      }else{
        console.log(rb.msg);
      }
    }).catch(error => {
      console.log(error);
    });
  }else{
    // 直接打开就好了，不需要赋值
    console.log("unadded列表里已有值")
    console.log(unAddedProList.value);
  }
  proDialogVisible.value = true;
}

// 选择未添加的项目
const unAddedSelectionChange = (rows) => {
  console.log("选择了一个未添加的项目，当前选择的所有项目是：");
  selectedUnAddedProList.value = rows;
  console.log(selectedUnAddedProList.value);
  console.log("当前所有项目是：");
  console.log(nursingLevelList.value);
}

// 给级别添加项目
const addPro = () => {
  console.log('是不是同一个 projects 引用：',
      editedLevel.value.projects ===
      nursingLevelList.value.find(i => i.nursingLevelId === editedLevel.value.nursingLevelId)?.projects);

  console.log("给级别添加项目，当前的nursingLevelList为：")
  console.log(nursingLevelList.value);
  console.log("当前修改的内容是：");
  console.log(editedLevel.value);
  if(selectedUnAddedProList.value.length === 0){
    ElMessage({message:'未添加任何项目', type:'info'})
  }
  selectedUnAddedProList.value.forEach((item, index) => {
    editedLevel.value.projects.push(item);
  })
  console.log(nursingLevelList.value);
  // 将未添加里面的的删去
  const selectedIds = new Set(selectedUnAddedProList.value.map(item => item.nursingProjectId));
  unAddedProList.value = unAddedProList.value.filter(item => !selectedIds.has(item.nursingProjectId));
  // 重置选择
  selectedUnAddedProList.value = [];
  proDialogVisible.value = false;
}

// 重置未添加项目的搜索
const resetUnAddedPro = () => {
  searchUnAddedProName.value = ''
}

// 关闭添加项目对话框
const proDialogClose = () => {
  ElMessageBox.confirm('是否关闭该对话框？')
      .then(() => {
        proDialogVisible.value = false;
        selectedUnAddedProList.value = [];
        //   重置的添加项目的搜索
        searchUnAddedProName.value = '';
      }).catch((error) => {
    console.log(error);
  })
}

// 在修改界面删除已经添加的项目
const deleteProjectWhenEdit = (row) => {
  ElMessageBox.confirm('是否删除？')
      .then(() => {
        const index = editedLevel.value.projects.findIndex(item => item.nursingProjectId === row.nursingProjectId);
        if (index !== -1) {
          const removed = editedLevel.value.projects.splice(index, 1)[0]; // 删除并返回被删除的对象
          unAddedProList.value.push(removed); // 加入未添加列表
        }
        console.log("删除");
        console.log(editedLevel.value.projects);
      }).catch((error) => {
    console.log(error);
  })

}

// 终于，可以，修改了！！
const submitEdit = () => {
  editFormRef.value.validate((valid) => {
    const levelData = {
      nursingLevelId: editedLevel.value.nursingLevelId,
      name: editedLevel.value.name,
      state: editedLevel.value.state,
    };
    const proData = {
      nursingLevelId: editedLevel.value.nursingLevelId,
      projectIds: editedLevel.value.projects.map(p => p.nursingProjectId),
    }
    if(valid){
      let url1 = `NursingLevelController/editNursingLevel`;
      axios.post(url1, levelData).then(response => {
        let rb = response.data;
        if(rb.status === 200){
          console.log("修改级别成功！");
        }else{
          console.log(rb.msg);
        }
      }).catch(error => {
        console.log(error);
      });
      let url2 = `NursingLevelController/changeLevelProject`;
      axios.post(url2, proData).then(response => {
        let rb = response.data;
        if(rb.status === 200){
          console.log("修改项目成功！");
          editDialogVisible.value = false;
          resetTable();
          resetEditForm();
        }else{
          console.log(rb.msg);
          ElMessage({message:rb.msg, type:'error'});
        }
      }).catch(error => {
        console.log(error);
      })
    }else{
      console.log("修改项目时表单验证未通过");
      return false;
    }
  })
}

// 删除级别
const deleteLevel = (row) => {
  console.log("delete level");
  console.log(row);
  ElMessageBox.confirm('确定删除这个级别？')
      .then(() => {
        let url = `NursingLevelController/deleteNursingLevel?nursingLevelId=${row.nursingLevelId}`;
        axios.post(url).then(response => {
          let rb = response.data;
          if(rb.status === 200){
            ElMessage({message:'删除成功', type:'success'});
            resetTable();
          }else{
            ElMessage({message:rb.msg, type:'error'});
            console.log(rb.msg);
          }
        }).catch(error => {
          console.log(error);
        })
      }).catch((error) => {
    console.log(error);
  })
}

// 在展开时删除级别下的项目
const deleteProjectWhenExpand = (proRow, lvRow) => {
  console.log('delete project when expand');
  ElMessageBox.confirm('确定删除这条表项？')
      .then(() => {
        let url = `NursingLevelController/deleteNursingPro?nursingProjectId=${proRow.nursingProjectId}&nursingLevelId=${lvRow.nursingLevelId}`;
        axios.post(url).then(response => {
          let rb = response.data;
          if(rb.status === 200){
            ElMessage({message:'删除成功', type:'success'});
            resetTable();
          }else{
            ElMessage({message:rb.msg, type:'error'});
            console.log(rb.msg);
          }
        }).catch(error => {
          console.log(error);
        })
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
  gap: 16px;
  /* 区块间距，替代 margin-bottom */
  background-color: #f0f2f5;
}

.search-div {
  width: 100%;
  flex: 0 0 15%;
  /* 高度为 20% */
  border: 1px solid ghostwhite;
  border-radius: 12px;
  /* 圆角半径，可根据需要调整 */
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.1);
  /* 阴影效果 */
  background-color: white;

  display: flex;
  align-content: center;
}

.search-div .el-row {
  width: 100%;
  display: flex;
  align-items: center;
  /* 垂直居中 */
}

.search-col {
  display: flex;
  /* 关键 */
  align-items: center;
  margin-left: 16px;
}

.search-item {
  margin-bottom: 0px;
}

.table-container {
  width: 100%;
  flex: 1;
  //border: 2px solid darkblue;
  background-color: white;
  border-radius: 8px;
  box-sizing: border-box;
  padding: 0 16px 0 16px;
}

.operation-button {
  display: flex;
  justify-content: flex-end;
  width: 100%;
  //padding: 0 16px 0 0;
  margin-top: 10px;
  margin-bottom: 10px;

}

.main-table {
  display: flex;
  justify-content: center;
}

.page-container {
  flex: 0 0 10%;
  width: 100%;
  border-radius: 8px;
  //border: 2px solid darkblue;
  background-color: white;
  display: flex;
  justify-content: end;
}

.el-pagination {
  padding: 0 16px 0 0;
}



.sub-table-container {
  width: 100%;
  background-color: #f4f6f8;
  /* 展开区域整体背景色 */
  box-sizing: border-box;
}

.sub-table {
  background-color: white;
  /* 子表格区域颜色 */
  padding: 12px 16px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}
</style>