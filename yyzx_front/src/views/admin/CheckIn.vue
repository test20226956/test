<script setup>
import {Plus, Search, RefreshRight, Edit, Delete} from "@element-plus/icons-vue";
import {ref, reactive, computed, inject, onMounted} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {ElMessage, ElLoading, FormItemProps, FormProps, ElMessageBox} from 'element-plus'
import qs from 'qs';

const route = useRoute();
const router = useRouter();
const axios = inject('axios');

//页面控制参数
let currentPage = ref(1);
let pageSize = ref(10);
let total = ref(0);
const size = ref('default');
const addDialogVisible = ref(false);
const editDialogVisible = ref(false);
const labelPosition = ref('right')

//数据参数
const searchCust = ref({
  name: '',
  startDate: '',
  state: "自理老人",
});

const floors = ref([2,3,4,5,6]);
const rooms = ref([]);
const beds = ref([]);

////创建ref型数据addedCust（要包括姓名、年龄、性别、身份证号、血型、联系人、联系电话、楼层、房间号、入住时间、合同到期时间）
const addedCust = ref({
  name: '',
  gender: '',
  bloodType: '',
  identity: '',
  password: '',
  tel: '',
  type: '自理老人',
});

//表单验证参数
const addformRules = reactive({
  name: [
    { required: true, message: '请输入客户姓名', trigger: 'blur' },
  ],
  gender: [
    { required: true, message: '请选择用户性别', trigger: 'blur' },
  ],
  identity: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入身份证号'));
        } else if (!/^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(value)) {
          callback(new Error('请输入正确的身份证号'));
        }else{
          callback();
        }
      }
    }
  ],
  type: [
    { required: true, message: '请选择客户状态', trigger: 'blur' },
  ],
  bloodType: [
    { required: true, message: '请选择血型', trigger: 'blur' },
  ],
  tel: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入联系电话'));
        } else if (value.length != 11) {
          callback(new Error('电话号码长度为11位'));
        }
        else {
          callback();
        }
      }
    }
  ]
});

const addFamily = ref({
  name: '',
  tel: '',
  relation: '',
});
const addFamilyRules = reactive({
  name: [
    { required: true, message: '请输入联系人', trigger: 'blur' },
  ],
  tel: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
      {
        validator: (rule, value, callback) => {
          if (!value) {
            callback(new Error('请输入联系电话'));
          } else if (value.length != 11) {
            callback(new Error('电话号码长度为11位'));
          }
        }
      }
  ],
  relation: [
    { required: true, message: '请输入关系', trigger: 'blur' },
  ]
});

const addedCheckReCord = ref({
  checkInTime: '',
  endTime: '',
});
const addCheckReCordRules = reactive({
  checkInTime: [
    { required: true, message: '请输入入住时间', trigger: 'blur' },
  ],
  endTime: [
    { required: true, message: '请输入合同到期时间', trigger: 'blur' },
    //checkOutTime要晚于checkInTime
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请选择合同到期时间'))
        } else if (value <= addedCheckReCord.value.checkInTime) {
          callback(new Error('合同到期时间必须晚于入住时间'))
        } else {
          callback()
        }
      }
    }
  ]
});

const addBed = ref({
  floor: '',
  room: '',
  bed: '',
});
const addBedRules = reactive({
  floor: [
    { required: true, message: '请输入楼层', trigger: 'blur' },
  ],
  room: [
    { required: true, message: '请输入房间号', trigger: 'blur' },
  ],
  bed: [
    { required: true, message: '请输入床位号', trigger: 'blur' },
  ]
})
//编辑数据参数
const editedCust = ref({
  name: '',
  gender: '',
  customerId: '',
  bloodType: '',
  identity: '',
  password: '',
  tel: '',
  type: '',
});

const editformRules = reactive({
  name: [
    { required: true, message: '请输入客户姓名', trigger: 'blur' },
  ],
  gender: [
    { required: true, message: '请选择用户性别', trigger: 'blur' },
  ],
  id: [
    { required: true, message: '请输入身份证号', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入身份证号'));
        } else if (!/^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(value)) {
          callback(new Error('请输入正确的身份证号'));
        }else{
          callback();
        }
      }
    }
  ],
  blood: [
    { required: true, message: '请选择血型', trigger: 'blur' },
  ],
  contact: [
    { required: true, message: '请输入联系人', trigger: 'blur' },
  ],
  tel: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请输入联系电话'));
        } else if (value.length != 11) {
          callback(new Error('电话号码长度为11位'));
        }
        else {
          callback();
        }
      }
    }
  ],
})

const editedRecord = ref({
  checkInTime: '',
  checkOutTime: '',
});
const editRecordRules = reactive({
  checkInTime: [
    { required: true, message: '请输入入住时间', trigger: 'blur' },
  ],
  checkOutTime: [
    { required: true, message: '请输入合同到期时间', trigger: 'blur' },
    //checkOutTime要晚于checkInTime
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback(new Error('请选择合同到期时间'))
        } else if (value <= editedRecord.value.checkInTime) {
          callback(new Error('合同到期时间必须晚于入住时间'))
        } else {
          callback()
        }
      }
    }
  ]
})

//创建客户列表供表格展示（要包括姓名、年龄、性别、身份证号、血型、联系人、联系电话、楼层、房间号、入住时间、合同到期时间）
const customerList = ref([]);

const handleSizeChange = (val) => {
  pageSize.value = val;
  searchCustByName() ;
  console.log(`${val} items per page`)
}
const handleCurrentChange = (val) => {
  currentPage.value = val;
  searchCustByName();
  console.log(`current page: ${val}`)
}

const bloodAtter = (row, column, cellValue) =>{
  return cellValue+'型'
}
const init = () => {
  let url = 'CustomerController/showSelfCust';
  if(searchCust.value.state=="护理老人") url = 'CustomerController/showCareCust';
  const data = {
    pageNum: currentPage.value,
    pageSize: pageSize.value
  };
  axios.get(url,{ params: data }).then(response => {
    let rb = response.data;
    if (rb.status == 200) {
      customerList.value = rb.data.map(item => {
        return {
          customerId: item.customer.customerId,
          age: item.age,
          name: item.customer.name,
          gender: item.customer.gender === 0 ? '男' : '女',
          type: item.customer.type === '1' ? '护理老人' : '自理老人',
          id: item.customer.identity,
          blood: item.customer.bloodType,
          tel: item.customer.tel,
          contact: item.family.name,
          floor: item.room.floor,
          room: item.room.roomNumber,
          bed: item.room.bedCount,
          checkInTime: item.checkInRecord.checkInTime,
          checkOutTime: item.checkInRecord.endTime,
        }
      })
      total.value = rb.total
    } else {
      alert(rb.msg);
    }
  }).catch(error => console.log(error));
}

const handleStateChange = () => {
  init()
}

// 根据楼层获取房间号
const errorRooms = ref('')
const showRoom = (floor) => {
  let data = {
    floor: floor
  };
  axios.get("/RoomController/searchRoom",{ params: data }).then(response => {
    let rb = response.data;
    if (rb.status == 200) {
      rooms.value = rb.data
    }else {
      ElMessage.error(rb.msg);
    }
  }).catch(error => console.log(error));
}

// 楼层选择变化处理
const handleFloorChange = (value) => {
  if (value) {
    showRoom(value)
  } else {
    rooms.value = []
  }
}

const showBed = (room) => {
  const data = {
    roomId : room.roomId,
  }
  axios.get('BedController/searchFreeBed',{ params: data }).then(response => {
    let rb = response.data;
    if (rb.status == 200) {
      beds.value = rb.data;
    }else {
      ElMessage.error(rb.msg);
    }
  }).catch(error => console.log(error))
}
const handleRoomChange = (value) => {
  if (value) {
    showBed(value)
  } else {
    beds.value = []
  }
}

const addBntVis = () => {
  addDialogVisible.value=true;
  addedCust.value = {};
  addedCust.value.type = '自理老人'
  addBed.value = {};
  addedCheckReCord.value = {};
}
const addCust = () => {
  addedCust.value.type = addedCust.value.type === '护理老人' ? '1' : '0';
  addedCust.value.gender = addedCust.value.gender === '男' ? 0 : 1;
  //密码为身份证号后六位
  addedCust.value.password = addedCust.value.identity.substring(addedCust.value.identity.length - 6);
  //验证三个表单的都不存在空数据
  const data = {
    customer: addedCust.value,
    family: addFamily.value,
    checkInRecord:{
      checkInTime: addedCheckReCord.value.checkInTime,
      endTime: addedCheckReCord.value.endTime,
    },
    room:{
      floor: addBed.value.floor,
      roomNumber: addBed.value.room.roomNumber,
    },
    bed:{
      bedNumber: addBed.value.bed.bedNumber,
    },
    bedRecord: {},
  };
  axios.post("/CustomerController/addCust", data).then((res) => {
    let rb = res.data;
    if (rb.status === 200) {
      ElMessage({ message: "添加成功", type: "success" });
      init();
      addDialogVisible.value = false;
    } else {
      addedCust.value.type = addedCust.value.type === '1' ? '护理老人' : '自理老人';
      addedCust.value.gender = addedCust.value.gender === 0 ? '男' : '女';
      ElMessage.error(rb.msg);
      console.log(rb.msg)
    }
  })
}

const searchCustById = () => {
  if (!addedCust.value.identity) {
    ElMessage.error('请输入身份证号')
    return
  }
  const data = {
    identity: addedCust.value.identity
  };
  axios.get('CustomerController/searchCustByIdentity',{ params: data }).then(response => {
    let rb = response.data;
    console.log(rb.data)
    if (rb.status == 200) {
      addedCust.value = rb.data
      addedCust.value.gender = addedCust.value.gender === 0 ? '男' : '女'
      addedCust.value.type = addedCust.value.type === '1' ? '护理老人' : '自理老人'
    } else {
      ElMessage.error(rb.msg);
    }
  }).catch(error => console.log(error));
}

const searchCustByName = () => {

  if(searchCust.value.name==''&&searchCust.value.startDate==''){
    init();
  }else{
    if (!(searchCust.value.name||searchCust.value.startDate)) {
    ElMessage.error('请输入搜索信息')
    return
    }
    const type = searchCust.value.state=="护理老人" ? 1 : 0;
    //将时间转为字符串“YYYY-mm-dd”的形式，如果月份和日期是一位数自动补0
    const year = searchCust.value.startDate.getFullYear()
    const month = String(searchCust.value.startDate.getMonth() + 1).padStart(2, '0')
    const day = String(searchCust.value.startDate.getDate()).padStart(2, '0')
    const startDate = `${year}-${month}-${day}`
    console.log(startDate)
    const data = {
      name: searchCust.value.name,
      checkInTime: startDate,
      type: type,
      pageSize : pageSize.value,
      pageNum : currentPage.value
    };
    axios.get('CustomerController/searchCust',{ params: data }).then(response => {
      let rb = response.data;
      if (rb.status == 200) {
        customerList.value = rb.data.map(item => {
          return {
            age: item.age,
            name: item.customer.name,
            gender: item.customer.gender === 0 ? '男' : '女',
            type: item.customer.type === 1 ? '护理老人' : '自理老人',
            id: item.customer.identity,
            blood: item.customer.bloodType,
            tel: item.customer.tel,
            contact: item.family.name,
            floor: item.room.floor,
            room: item.room.roomNumber,
            bed: item.room.bedCount,
            checkInTime: item.checkInRecord.checkInTime,
            checkOutTime: item.checkInRecord.endTime,
          }
        })
        total.value = rb.total
      }else {
        ElMessage.error(rb.msg);
      }
    }).catch(error => console.log(error));
  }

}

//获取本行的信息给编辑框
const getCust = (row) => {
  editedRecord.value.checkInTime = row.checkInTime;
  editedRecord.value.checkOutTime = row.checkOutTime;
  editedCust.value.name = row.name;
  editedCust.value.customerId = row.customerId;
  editedCust.value.gender = row.gender;
  editedCust.value.tel = row.tel;
  editedCust.value.identity = row.id;
  editedCust.value.type = row.type;
  editedCust.value.bloodType = row.blood;
  editedCust.value.password = row.password;
  editDialogVisible.value = true;
}

const edit = () => {
  editedCust.value.type = editedCust.value.type === '护理老人' ? '1' : '0';
  editedCust.value.gender = editedCust.value.gender === '男' ? 0 : 1;
  const data = {
    data : editedCust.value,
    endTime : editedRecord.value.checkOutTime,
  };
  console.log(data)
  axios.post("/CustomerController/editCust",data).then(response => {
    let rb = response.data;
    if (rb.status === 200) {
      ElMessage.success("修改成功");
      editDialogVisible.value = false;
      init();
    }else{
      editedCust.value.type = editedCust.value.type === '1' ? '护理老人' : '自理老人';
      editedCust.value.gender = editedCust.value.gender === 0 ? '男' : '女';
      ElMessage.error(rb.msg);
    }
  });
  init();
}

//确认是否删除函数，弹出确认框
const confirmDelete = (row) => {
  ElMessageBox.confirm("此操作将永久删除该老人信息, 是否继续?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      deleteRecord(row.customerId);
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "已取消删除",
      });
    });
}

const deleteRecord = (id) => {
  console.log(id)
  let url = `CustomerController/deleteCust?customerId=${id}`;
  axios.post(url).then((response) => {
    let rb = response.data;
    console.log(rb)
    if (rb.status == 200) {
      ElMessage("删除成功");
      init();
    }else{
      ElMessage(rb.msg);
    }
  });
};

onMounted(() => {
  handleStateChange()
})
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
          <el-select v-model="searchCust.state" placeholder="请选择老人类型" @change="handleStateChange" >
            <el-option label="自理老人" value="自理老人"></el-option>
            <el-option label="护理老人" value="护理老人"></el-option>
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
        <el-table-column prop="gender" label="性别" width="60" align="center" />
        <el-table-column prop="id" label="身份证号" width="165" align="center"/>
        <el-table-column prop="blood" label="血型" align="center" :formatter="bloodAtter"/>
        <el-table-column prop="contact" label="联系人" align="center"/>
        <el-table-column prop="tel" label="联系电话" align="center"/>
        <el-table-column prop="floor" label="楼层" align="center"/>
        <el-table-column prop="room" label="房间号" align="center"/>
        <el-table-column prop="bed" label="床位号" align="center"/>
        <el-table-column prop="checkInTime" label="入住时间" align="center"/>
        <el-table-column prop="checkOutTime" label="合同到期时间" align="center"/>
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
          :page-sizes="[10,5]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
      />
    </div>
  </div>
  <el-drawer v-model="addDialogVisible" v-if="addDialogVisible" title="添加客户" size="40%">
    <el-form
        :model="addedCust"
        :rules="addformRules"
        :label-position="labelPosition"
        label-width="auto">
      <el-form-item label="姓名" prop="name"style="width: 60%;">
        <el-input v-model="addedCust.name" placeholder="请输入姓名"></el-input>
      </el-form-item>
      <el-row>
        <el-col :span="12">
          <el-form-item label="身份证号" prop="identity">
            <el-input v-model="addedCust.identity" placeholder="请输入身份证号"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <!--          查询按钮，点击后触发search函数传递身份证号查询该身份证号的姓名、性别、年龄、血型、身份证号、联系人、联系电话,-->
          <el-button type="primary" plain @click="searchCustById">
            <el-icon style="margin-right: 5px;">
              <Search/>
            </el-icon>
            查询
          </el-button>
        </el-col>
      </el-row>
      <el-form-item label="性别" prop="gender"style="width: 60%;">
        <el-select v-model="addedCust.gender" placeholder="请选择性别">
          <el-option label="男" value="男"></el-option>
          <el-option label="女" value="女"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="血型" prop="bloodType">
        <el-select v-model="addedCust.bloodType" placeholder="请选择血型" style="width: 60%;">
          <el-option label="A型" value="A"></el-option>
          <el-option label="B型" value="B"></el-option>
          <el-option label="O型" value="O"></el-option>
          <el-option label="AB型" value="AB"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="老人类型" prop="type">
        <el-select v-model="addedCust.type" placeholder="请选择老人类型" style="width: 60%;">
          <el-option label="自理老人" value="自理老人"></el-option>
          <el-option label="护理老人" value="护理老人"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="联系电话" prop="tel">
        <el-input v-model="addedCust.tel" placeholder="请输入联系电话" style="width: 60%;"></el-input>
      </el-form-item>
    </el-form>
    <el-form
        :model="addFamily"
        :rules="addFamilyRules"
        :label-position="labelPosition"
        label-width="auto">
      <el-form-item label="联系人" prop="name">
        <el-input v-model="addFamily.name" placeholder="请输入联系人" style="width: 60%;"></el-input>
      </el-form-item>
      <el-form-item label="家属电话" prop="tel">
        <el-input v-model="addFamily.tel" placeholder="请输入家属电话" style="width: 60%;"></el-input>
      </el-form-item>
      <el-form-item label="关系" prop="relation">
        <el-input v-model="addFamily.relation" placeholder="请输入关系" style="width: 60%;"></el-input>
      </el-form-item>
    </el-form>
    <el-form
        :model="addBed"
        :rules="addBedRules"
        :label-position="labelPosition"
        label-width="auto">
      <!-- 楼层选择 -->
      <el-form-item label="楼层" prop="floor">
        <el-select
            v-model="addBed.floor"
            placeholder="请选择楼层"
            @change="handleFloorChange"
            style="width: 60%;"
        >
          <el-option
              v-for="floor in floors"
              :key="floor.value"
              :label="`第${floor}层`"
              :value="floor"
          />
        </el-select>
      </el-form-item>
      <!-- 房间号选择 -->
      <el-form-item label="房间号" prop="room">
        <el-select
            v-model="addBed.room"
            value-key="roomId"
            placeholder="请选择房间号"
            @change="handleRoomChange"
            :disabled="!addBed.floor"
            style="width: 60%;"
        >
          <el-option
              v-for="room in rooms"
              :key="room.roomId"
              :label="room.roomNumber"
              :value="room"
          />
        </el-select>
        <div v-if="errorRooms" class="error-message">{{ errorRooms }}</div>
      </el-form-item>
      <el-form-item label="床位编号" prop="bed" >
        <el-select
            v-model="addBed.bed"
            value-key="bedId"
            placeholder="请选择床位号"
            :disabled="!addBed.room"
            style="width: 60%;"
        >
          <el-option
              v-for="bed in beds"
              :key="bed.bedId"
              :label="bed.bedNumber"
              :value="bed"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <el-form
        :model="addedCheckReCord"
        :rules="addCheckReCordRules"
        :label-position="labelPosition"
        label-width="auto">
      <el-form-item label="入住时间" prop="checkInTime">
        <el-date-picker
            v-model="addedCheckReCord.checkInTime"
            type="date"
            placeholder="选择入住时间"
            value-format="YYYY-MM-DD"
            style="width: 60%;"
        />
      </el-form-item>
      <el-form-item label="到期时间" prop="endTime">
        <el-date-picker
            v-model="addedCheckReCord.endTime"
            type="date"
            placeholder="选择合同到期时间"
            value-format="YYYY-MM-DD"
            style="width: 60%;"
        />
      </el-form-item>
    </el-form>
    <!--    添加“老人入住信息”填写完毕，点击“添加”按钮，将填写的表单信息添加到数据库中。-->
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="addCust">添加</el-button>
      </div>
    </template>
  </el-drawer>
<!--  添加一个弹窗用于完成用户信息的修改，在点击修改按钮时自动传入该行的老人信息用于修改-->
  <el-dialog v-model="editDialogVisible" title="编辑老人信息" width="40%" v-if="editDialogVisible">
    <el-form
        :model="editedCust"
        :rules="editformRules"
        :label-position="labelPosition"
        label-width="auto">
      <el-form-item label="姓名" prop="name"style="width: 60%;">
        <el-input v-model="editedCust.name" placeholder="请输入姓名" disabled></el-input>
      </el-form-item>
      <el-form-item label="身份证号" prop="id" style="width: 60%;">
        <el-input v-model="editedCust.identity" placeholder="请输入身份证号" disabled></el-input>
      </el-form-item>
      <el-form-item label="性别" prop="gender"style="width: 60%;">
        <el-select v-model="editedCust.gender" placeholder="请选择性别">
          <el-option label="男" value="男"></el-option>
          <el-option label="女" value="女"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="血型" prop="blood">
        <el-select v-model="editedCust.bloodType" placeholder="请选择血型" style="width: 60%;">
          <el-option label="A型" value="A"></el-option>
          <el-option label="B型" value="B"></el-option>
          <el-option label="O型" value="O"></el-option>
          <el-option label="AB型" value="AB"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="老人类型" prop="type">
        <el-select v-model="editedCust.type" placeholder="请选择老人类型" style="width: 60%;">
          <el-option label="自理老人" value="自理老人"></el-option>
          <el-option label="护理老人" value="护理老人"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="联系电话" prop="tel">
        <el-input v-model="editedCust.tel" placeholder="请输入联系电话" style="width: 60%;"></el-input>
      </el-form-item>
    </el-form>
    <el-form
        :model="editedRecord"
        :rules="editRecordRules"
        :label-position="labelPosition"
        label-width="auto">
      <el-form-item label="入住时间" prop="checkInTime">
        <el-date-picker
            v-model="editedRecord.checkInTime"
            type="date"
            placeholder="选择入住时间"
            value-format="YYYY-MM-DD"
            style="width: 60%;"
            disabled
        />
      </el-form-item>
      <el-form-item label="到期时间" prop="checkOutTime">
        <el-date-picker
            v-model="editedRecord.checkOutTime"
            type="date"
            placeholder="选择合同到期时间"
            value-format="YYYY-MM-DD"
            style="width: 60%;"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="edit">修改</el-button>
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
</style>