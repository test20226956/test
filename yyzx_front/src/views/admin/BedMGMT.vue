<script setup>
const axios = inject('axios');
import qs from 'qs';
import {Edit, RefreshRight, Search,Switch} from "@element-plus/icons-vue";
import {reactive, ref, onMounted, inject} from "vue";
import {ElMessage} from "element-plus";
import dayjs from 'dayjs';
let currentPage = ref(1);
let pageSize = ref(10);
let total = ref(0);
const activeTab = ref('current');
const arr = ref(null)
const changeVisible = ref(false)
const changeForm = reactive({
  customerId:'',
  name: '',
  gender: '',
  oldBed: '',
  floor:'',
  newBuilding: '606',
  newRoomId: '',
  newRoomNumber: '',
  newBed: '',
  newStartDate: new Date().toISOString().slice(0, 10),
  newEndDate:''
})
const availableRooms = ref([])
const availableBeds = ref([])

const handleFloorChange = () => {
  // changeForm.newRoom = ''
  // changeForm.newBed = ''
  availableRooms.value = []
  availableBeds.value = []

  if (!changeForm.floor) return

  axios.get('/RoomController/searchRoom', { params: { floor: changeForm.floor } })
      .then(res => {
        if (res.data.status === 200) {
          availableRooms.value = res.data.data
        } else {
          ElMessage.error(res.data.msg)
        }
      })
      .catch(() => ElMessage.error('查询房间失败'))
}

const handleRoomChange = () => {
  // changeForm.newBed = ''
  availableBeds.value = []

  if (!changeForm.newRoom) return

  axios.get('/BedController/searchFreeBed', { params: { roomId: changeForm.newRoom } })
      .then(res => {
        if (res.data.status === 200) {
          availableBeds.value = res.data.data
        } else {
          ElMessage.error(res.data.msg)
        }
      })
      .catch(() => ElMessage.error('查询床位失败'))
}

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
  let url = 'BedRecordController/searchBedRecord';
  const data = {
    pageNum: currentPage.value,
    pageSize: pageSize.value,
    state: activeTab.value === 'current' ? 1 : 0,
    name: searchName.value,
    startTime: date.value ? dayjs(date.value).format('YYYY-MM-DD') : ''
  };
  console.log('搜索参数', data);
  axios.get(url,{ params: data }).then(response => {
    let rb = response.data;
    // console.log('返回数据');
    // console.log(rb);
    if (rb.status == 200) {
      arr.value = rb.data.map(item=>{
        const customerId = item.customer?.customerId || '';
        const name = item.customer?.name || '未知';
        const gender = item.customer?.gender === 0 ? '男' : '女';
        const age = item.age || '无';
        const building = item.room?.buildingNumber ?? '';
        const room = item.room?.roomNumber ?? '';
        const bed = item.bed?.bedNumber ?? '';
        const bedInfo = `${building}#${room}-${bed}`;
        const startTime = item.bedRecord?.startTime || '';
        const endTime = item.bedRecord?.endTime || '';
        const bedRecordId = item.bedRecord?.bedRecordId || '';

        return{
          customerId,
          name,
          age,
          gender,
          bed: bedInfo,
          startTime,
          endTime,
          bedRecordId
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

const handleReset = () => {
  searchName.value = ''
  date.value = null
  init() // 重新加载数据（会带上空的搜索条件）
}

onMounted(() => {
  init();
  changeForm.newStartDate = dayjs().format('YYYY-MM-DD')
});

const handleChange = (row) => {
  changeForm.customerId = row.customerId
  changeForm.name = row.name
  changeForm.gender = row.gender
  changeForm.oldBed = row.bed
  changeForm.newStartDate = dayjs().format('YYYY-MM-DD')
  changeVisible.value = true
}

const changeFormRef = ref(null)
const editFormRef = ref(null)


const changeRules = {
  floor: [{ required: true, message: '请选择楼层', trigger: 'change' }],
  newRoom: [{ required: true, message: '请选择房号', trigger: 'change' }],
  newBed: [{ required: true, message: '请选择床号', trigger: 'change' }],
  newEndDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }]
}

const editRules = {
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }]
}

const handleChangeCancel = () => {
  // 清空表单（如需保留填写内容则省略此步）
  resetChangeForm()
  changeVisible.value = false
}
const handleChangeConfirm = () => {
  // 这里只做示例：可在此添加验证和提交逻辑
  console.log('提交床位调换表单：', { ...changeForm })
  changeFormRef.value.validate((valid) => {
    if (!valid) return;

    const selectedRoom = availableRooms.value.find(r => r.roomId === changeForm.newRoom);
    const selectedBed = availableBeds.value.find(b => b.bedId === changeForm.newBed);

    const payload = {
      customerId: changeForm.customerId,
      floor: changeForm.floor,
      roomNumber: selectedRoom?.roomNumber,
      bedNumber: selectedBed?.bedNumber,
      endTime: dayjs(changeForm.newEndDate).format('YYYY-MM-DD'),
    };
    // 例如：axios.post('/bedChange', changeForm).then(...)
    axios.post(
        '/BedRecordController/changeBed',
        qs.stringify(payload),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    ).then(res => {
      if (res.data.status === 200) {
        ElMessage.success('床位调换成功');
        changeVisible.value = false;
        resetChangeForm();
        init(); // 刷新列表
      } else {
        ElMessage.error(res.data.msg || '提交失败');
      }
    }).catch(() => {
      ElMessage.error('网络错误');
    });
  });
  // 关闭弹窗并清空表单
  // resetChangeForm()
  // changeVisible.value = false
  // init();
}
// 表单重置函数
const resetChangeForm = () => {
  changeForm.name = ''
  changeForm.gender = ''
  changeForm.oldBed = ''
  changeForm.newBuilding = '606'
  changeForm.floor = ''
  changeForm.newRoom = ''
  changeForm.newBed = ''
  changeForm.newStartDate = ''
  changeForm.newEndDate = ''
}
// 修改信息
const handleEdit = (row) => {
  editForm.bedRecordId = row.bedRecordId
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
  console.log('编辑表单提交：', { ...editForm });
  editFormRef.value.validate((valid) => {
    if (!valid) return;

    const payload = {
      bedRecordId: editForm.bedRecordId,
      endTime: dayjs(editForm.endDate).format('YYYY-MM-DD')
    };

    axios.post(
        '/BedRecordController/editBedRecord',
        qs.stringify(payload), // 转为表单格式
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    )
        .then(res => {
          if (res.data.status === 200) {
            ElMessage.success('床位信息修改成功');
            editVisible.value = false;
            init(); // 刷新数据
          } else {
            ElMessage.error(res.data.msg || '修改失败');
          }
        })
        .catch(() => {
          ElMessage.error('网络异常，修改失败');
        });
  });
};
const handleTabChange = () => {
  currentPage.value = 1;
  init();
}

const searchName = ref('');
const searchDate = ref('');
const date = ref('');
const handleSearch = () => {
  currentPage.value = 1;
  init();
};
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
          placeholder="筛选该日期后开始使用的记录"
          style="width: 240px"
      />
      <el-button type="primary" plain @click="handleSearch">
        <el-icon style="margin-right: 5px;"><Search /></el-icon> 搜索
      </el-button>
      <el-button type="info" plain style="margin-left: 0px" @click="handleReset">
        <el-icon style="margin-right: 5px;"><RefreshRight/></el-icon> 重置
      </el-button>
    </div>

    <div class="table-container">
      <el-tabs v-model="activeTab" type="card" class="custom-tabs" style="padding-bottom: 0px" @tab-change="handleTabChange">
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
            <el-button type="primary" size="small" plain @click="handleChange(scope.row)" :disabled="activeTab !=='current'">
              <el-icon style="margin-right: 5px;"><Switch /></el-icon>调换
            </el-button>
            <!--            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>-->
            <el-button type="warning" size="small" plain @click="handleEdit(scope.row) " :disabled="activeTab !=='current'">
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
    <el-form :model="changeForm" label-width="100px" class="dialog-form" label-position="top" ref="changeFormRef" :rules="changeRules">
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="老人姓名：">
            <el-input v-model="changeForm.name" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
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
          <el-form-item label="楼层：" prop="floor">
            <el-select v-model="changeForm.floor" placeholder="请选择楼层" @change="handleFloorChange">
              <el-option v-for="f in [1, 2, 3, 4, 5, 6]" :key="f" :label="`${f}层`" :value="f" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="房号：" prop="newRoom">
            <el-select v-model="changeForm.newRoom" placeholder="请选择房号" :disabled="!changeForm.floor" @change="handleRoomChange">
              <el-option v-for="room in availableRooms" :key="room.roomId" :label="room.roomNumber" :value="room.roomId" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="床号：" prop="newBed">
            <el-select v-model="changeForm.newBed" placeholder="请选择床号" :disabled="!changeForm.newRoom">
              <el-option v-for="bed in availableBeds" :key="bed.bedId" :label="bed.bedNumber" :value="bed.bedId" />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="开始日期：" prop="newStartDate">
            <el-date-picker v-model="changeForm.newStartDate" disabled type="date" style="width: 100%;" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="结束日期：" prop="newEndDate">
            <el-date-picker v-model="changeForm.newEndDate" type="date" placeholder="请选择结束日期" style="width: 100%;" />
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
    <el-form :model="editForm" label-width="100px" class="dialog-form" label-position="top" ref="editFormRef" :rules="editRules">
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
            <el-date-picker v-model="editForm.startDate" disabled type="date" style="width: 100%;" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="当前床位使用结束日期：" prop="endDate">
            <el-date-picker v-model="editForm.endDate" type="date" style="width: 100%;" placeholder="请选择床位结束日期"/>
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
  //min-height: 100vh;
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
  //height: 100%;
  flex: 1;
  //flex-shrink: 0;
  background-color: white;
  border-radius: 8px;
  justify-content: center;
  padding: 10px;
  box-sizing: border-box;
  min-height: 200px;
}

.page-container{
  flex: 0 0 10%;
  width: 100%;
  border-radius: 8px;
  background-color: white;
  display: flex;
  justify-content: end;
  //align-content: center;
  box-sizing: border-box;
  padding: 0px 16px 0px 16px;
  //overflow-x: hidden;
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
