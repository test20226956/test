<template>
  <div class="diet-calendar-layout">
    <div class="diet-main-layout">
      <!-- 左侧：膳食周期 -->
      <div class="diet-left">
        <!-- 搜索栏 -->
        <div class="diet-search-bar">
          <el-date-picker v-model="date" type="date" placeholder="请选择日期" />
          <el-button type="primary" plain @click="handleSearch">
            <el-icon><Search /></el-icon> 搜索
          </el-button>
          <el-button type="primary" plain @click="handleAdd" style="margin-left: 0px">
            <el-icon><Plus /></el-icon> 添加膳食安排
          </el-button>
        </div>

        <!-- 膳食安排部分 -->
        <div class="diet-arrangement">
          <el-tabs v-model="activeDay" type="card">
            <el-tab-pane label="日" name="sun" />
            <el-tab-pane label="一" name="mon" />
            <el-tab-pane label="二" name="tue" />
            <el-tab-pane label="三" name="wed" />
            <el-tab-pane label="四" name="thu" />
            <el-tab-pane label="五" name="fri" />
            <el-tab-pane label="六" name="sat" />
          </el-tabs>

          <div class="diet-table-placeholder">
            <div class="meal-section" v-for="(data, meal) in arrangedMeals" :key="meal">
              <h4 style="width: 100%;text-align: left;">{{ mealNames[meal] }}</h4>
              <el-table :data="data" border size="small" style="width: 100%;">
                <el-table-column type="index" label="#" width="50" align="center" />
                <el-table-column prop="mealName" label="菜品" align="center" />
                <el-table-column label="状态" width="100" align="center">
                  <template #default="scope">
                    <el-switch
                        :model-value="scope.row.state"
                        :active-value="1"
                        :inactive-value="0"
                        :disabled="scope.row.mealState === 0 || dayjs(scope.row.date).isBefore(dayjs().startOf('day'))"
                        @change="(val) => handleToggleState(val, scope.row)"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="160" align="center">
                  <template #default="scope">
                    <el-button type="warning" size="small" plain @click="handleChange(scope.row)" :disabled="scope.row.state === 1 || dayjs(scope.row.date).isBefore(dayjs().startOf('day'))">
                      <el-icon style="margin-right: 5px;"><Edit /></el-icon> 调换
                    </el-button>
                    <el-button type="danger" size="small" plain @click="handleDelete(scope.row)">
                      <el-icon style="margin-right: 5px;"><Delete /></el-icon> 删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：所有膳食 -->
      <div class="diet-right">
        <div class="diet-right-header">
          <el-input v-model="dishSearch" placeholder="请输入膳食名称" class="diet-search-input" clearable />
          <el-button type="primary" plain @click="handleMealSearch" style="margin-left: 0px">
            <el-icon style="margin-right: 5px;"><Search /></el-icon> 搜索
          </el-button>
          <el-button type="primary" plain @click="handleMealAdd" style="margin-left: 0px">
            <el-icon style="margin-right: 5px;"><Plus /></el-icon> 添加膳食
          </el-button>
        </div>

        <!--        <el-tabs v-model="activeMealType" type="card" class="diet-right-tabs">-->
        <!--          <el-tab-pane label="早餐" name="breakfast" />-->
        <!--          <el-tab-pane label="午餐" name="lunch" />-->
        <!--          <el-tab-pane label="晚餐" name="dinner" />-->
        <!--        </el-tabs>-->

        <el-tabs v-model="activeCategory" type="card" class="diet-right-tabs">
          <el-tab-pane label="主食" name="staple" />
          <el-tab-pane label="荤菜" name="meat" />
          <el-tab-pane label="素菜" name="vegetable" />
          <el-tab-pane label="水果" name="fruit" />
          <el-tab-pane label="汤" name="soup" />
          <el-tab-pane label="点心" name="dessert" />
        </el-tabs>

        <el-table :data="filteredDishes" border size="small" style="width: 100%;">
          <el-table-column type="index" label="#" width="50" align="center" />
          <el-table-column prop="name" label="膳食名称" align="center" />
          <el-table-column label="操作" width="160" align="center">
            <template #default="scope">
              <el-button type="warning" size="small" plain @click="handleMealEdit(scope.row)">
                <el-icon style="margin-right: 5px;"><Edit /></el-icon> 编辑
              </el-button>
              <el-button type="danger" size="small" plain @click="handleMealDelete(scope.row)">
                <el-icon style="margin-right: 5px;"><Delete /></el-icon> 删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
  <el-dialog
      v-model="editMealVisible"
      title="膳食编辑"
      width="400px"
      :close-on-click-modal="false"
  >
    <el-form :model="editMealForm" label-width="80px" label-position="top" ref="editFormRef" :rules="editRules">
      <el-form-item label="类别："prop="type">
        <el-select v-model="editMealForm.type" placeholder="请选择类别" style="width: 100%;">
          <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="名称：" prop="name">
        <el-input v-model="editMealForm.name" placeholder="请输入名称" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleEditMealCancel">返回</el-button>
        <el-button type="primary" @click="handleEditMealConfirm">确定</el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog
      v-model="changeDietVisible"
      title="调换膳食"
      width="400px"
      :close-on-click-modal="false"
  >
    <el-form :model="changeDietForm" label-width="80px" label-position="top" ref="changeDietFormRef" :rules="editRules">
      <el-form-item label="类别："prop="mealType">
        <el-select v-model="changeDietForm.mealType" placeholder="请选择膳食类别" style="width: 100%;">
          <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="膳食"prop="mealId">
        <el-select v-model="changeDietForm.mealId" placeholder="请选择膳食" style="width: 100%;" :disabled="changeDietForm.mealType === ''">
          <el-option
              v-for="item in dishOptions"
              :key="item.mealId"
              :label="item.name"
              :value="item.mealId"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleChangeCancel">返回</el-button>
        <el-button type="primary" @click="handleChangeConfirm">确定</el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog
      v-model="addDietVisible"
      title="添加膳食安排"
      width="400px"
      :close-on-click-modal="false"
  >
    <el-form :model="addDietForm" label-width="80px" label-position="top" :rules="editRules" ref="addFormRef">
      <el-form-item label="日期：" prop="date">
        <el-date-picker v-model="addDietForm.date" type="date" style="width: 100%;" />
      </el-form-item>

      <el-form-item label="餐别：" prop="meal">
        <el-radio-group v-model="addDietForm.meal">
          <el-radio label="breakfast" >早餐</el-radio>
          <el-radio label="lunch" >午餐</el-radio>
          <el-radio label="dinner" >晚餐</el-radio>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="类别：" prop="type">
        <el-select v-model="addDietForm.type" placeholder="请选择膳食类别" style="width: 100%;">
          <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="膳食：" prop="mealId">
        <el-select v-model="addDietForm.mealId" placeholder="请选择膳食" style="width: 100%;" :disabled="addDietForm.type === ''">
          <el-option
              v-for="item in dishOptions"
              :key="item.mealId"
              :label="item.name"
              :value="item.mealId"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleAddCancel">返回</el-button>
        <el-button type="primary" @click="handleAddConfirm">确定</el-button>
      </div>
    </template>
  </el-dialog>

  <el-dialog
      v-model="addMealVisible"
      title="添加膳食"
      width="400px"
      :close-on-click-modal="false"
  >
    <el-form :model="addMealForm" label-width="80px" label-position="top" :rules="editRules" ref="editFormRef">
      <el-form-item label="类别：" prop="type">
        <el-select v-model="addMealForm.type" placeholder="请选择类别" style="width: 100%;">
          <el-option
              v-for="item in categoryOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="名称：" prop="name">
        <el-input v-model="addMealForm.name" placeholder="请输入名称" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="addMealVisible = false">返回</el-button>
        <el-button type="primary" @click="handleAddMealConfirm">确定</el-button>
      </div>
    </template>
  </el-dialog>

</template>

<script setup>
import axios from "axios";
import {computed, onMounted, reactive, ref, watch,nextTick} from 'vue'
import {Search, Plus, Edit, Delete} from '@element-plus/icons-vue'
import dayjs from "dayjs";
import {ElMessage, ElMessageBox} from "element-plus";

// const  allDishes = ref([
//   {"meal_id": 1, "name": "米饭", "type": 0},
//   {"meal_id": 2, "name": "番茄炒蛋", "type": 1},
//   {"meal_id": 3, "name": "炒青菜", "type": 2},
//   {"meal_id": 4, "name": "苹果", "type": 3},
//   {"meal_id": 5, "name": "紫菜蛋花汤", "type": 4},
//   {"meal_id": 6, "name": "蛋挞", "type": 5},
//   {"meal_id": 7, "name": "红烧鸡腿", "type": 1},
//   {"meal_id": 8, "name": "花卷", "type": 0},
//   {"meal_id": 9, "name": "凉拌黄瓜", "type": 2},
//   {"meal_id": 10, "name": "香蕉", "type": 3}
// ])
// const filteredDishes = computed(() =>
//     allDishes.value.filter(dish =>
//         dish.type === categoryMap[activeCategory.value] &&
//         dish.name.includes(dishSearch.value)
//     )
// )

const categoryOptions = [
  { label: '主食', value: 1 },
  { label: '荤菜', value: 2 },
  { label: '素菜', value: 3 },
  { label: '水果', value: 4 },
  { label: '汤', value: 5 },
  { label: '点心', value: 6 }
]

const mealNames = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐'
}

// ------------------------初始化和搜索---------------------------
const date = ref(null)
const activeDay = ref('mon')
const arrangedMeals = ref(null)

const fetchDietArrangement = async (targetDate) => {
  const formatted = dayjs(targetDate).format('YYYY-MM-DD');
  try {
    const res = await axios.get('/DietController/showDiet', {
      params: { date: formatted }
    });

    if (res.data.status === 200) {
      const raw = res.data.data || [];

      // 分类到三类餐段
      arrangedMeals.value = {
        breakfast: raw.filter(item => item.type === 0),
        lunch: raw.filter(item => item.type === 1),
        dinner: raw.filter(item => item.type === 2)
      };
    } else {
      arrangedMeals.value = {
        breakfast: [], lunch: [], dinner: []
      };
      ElMessage.warning(res.data.msg);
    }
  } catch (err) {
    // console.error('系统错误，请联系管理员，', err);
    arrangedMeals.value = {
      breakfast: [], lunch: [], dinner: []
    };
    ElMessage.error('系统错误，请联系管理员');
  }
}

const getWeekdayName = (date) =>{
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  return days[new Date(date).getDay()]
}
const initDietArrange = () => {
  const today = new Date();
  date.value = today;
  activeDay.value = getWeekdayName(today);
  fetchDietArrangement(today);
};

onMounted(() => {
  initDietArrange()
})

const handleSearch = () => {
  if (!date.value) {
    ElMessage.warning("请先选择日期");
    return;
  }
  fetchDietArrangement(date.value);
};

// 日期选择器 change 事件（自动触发）
watch(date, (newDate) => {
  if (!newDate) return
  activeDay.value = getWeekdayName(newDate)
  fetchDietArrangement(newDate)
})

// 切换 Tab 时（主动设置 date）
watch(activeDay, (newDay) => {
  if (!date.value) return
  const current = new Date(date.value)
  const currentWeekday = getWeekdayName(current)
  if (newDay !== currentWeekday) {
    // 让日期跳到本周对应那一天
    const delta = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'].indexOf(newDay) - current.getDay()
    const newDate = new Date(current)
    newDate.setDate(current.getDate() + delta)
    date.value = newDate
  }
})


// ------------------------添加膳食安排---------------------------
const addDietVisible = ref(false)
const addFormRef = ref()
const mealTypeMap = {
  breakfast: 0,
  lunch: 1,
  dinner: 2
}
const addDietForm = reactive({
  date: null,
  meal: 'breakfast',  // 默认早餐
  type: '',
  mealId: ''
})

const handleAdd = () => {
  addDietForm.date = date.value
  addDietForm.meal = 'breakfast'
  addDietForm.type = ''
  addDietForm.mealId = ''
  dishOptions.value = []
  // addFormRef.value?.clearValidate();
  addDietVisible.value = true
}

const handleAddCancel = () => {
  addDietVisible.value = false
}

watch(() => addDietForm.type, async (newType) => {
  if (newType === '') return
  try {
    const res = await axios.get('/DietController/searchFood', {
      params: {
        type: newType,
        name: ''
      }
    })
    dishOptions.value = res.data.status === 200 ? res.data.data : []
  } catch (err) {
    dishOptions.value = []
    console.error('加载膳食失败', err)
  }
})

const handleAddConfirm = async () => {
  try {
    await addFormRef.value.validate()
    const res = await axios.post('/DietController/addDiet', {
      date: dayjs(addDietForm.date).format('YYYY-MM-DD'),
      type: mealTypeMap[addDietForm.meal],
      mealId: addDietForm.mealId,
      state: 1  // 默认添加为启用状态
    })
    if (res.data.status === 200) {
      ElMessage.success('添加成功')
      addDietVisible.value = false
      fetchDietArrangement(date.value)
    } else {
      ElMessage.warning(res.data.msg)
    }
  } catch (err) {
    console.error('添加失败', err)
    ElMessage.error('添加失败，请联系管理员')
  }
}
// ------------------------调换停用的膳食安排---------------------------
const changeDietVisible = ref(false)
const changeDietFormRef = ref(null)
const changeDietForm = reactive({
  dietCycleId:'',
  state:'',
  type:'',
  mealId:'',
  mealType: ''
})
const handleChange = (row) => {
  console.log(row);
  changeDietForm.dietCycleId = row.dietCycleId;
  changeDietForm.state = row.state;
  // changeDietForm.mealType = row.mealType;
  changeDietForm.type = row.type;
  // changeDietForm.mealId = row.mealId;
  changeDietForm.date = row.date;
  changeDietVisible.value = true;
}

const handleChangeCancel = () =>{
  // changeDietFormRef.value?.clearValidate()
  changeDietForm.mealType = ''
  changeDietVisible.value = false
}

const dishOptions = ref([]);

watch(() => changeDietForm.mealType, async (newType) => {
  changeDietForm.mealId = '';
  if (newType === '') return;
  try {
    const res = await axios.get('/DietController/searchFood', {
      params: {
        type: newType,
        name: ''
      }
    });
    if (res.data.status === 200) {
      dishOptions.value = res.data.data;
    } else {
      dishOptions.value = [];
      // dishOptions.value = fetchAllDishes()
    }
  } catch (err) {
    console.error('获取菜品失败', err);
    dishOptions.value = [];
  }
});

const handleChangeConfirm = async () => {
  try {
    const res = await axios.post('/DietController/editDiet', {
      dietCycleId: changeDietForm.dietCycleId,
      mealId: changeDietForm.mealId,
      date: changeDietForm.date,
      type: changeDietForm.type,
      state: 1
    });
    if (res.data.status === 200) {
      ElMessage.success('调换成功');
      changeDietVisible.value = false;
      fetchDietArrangement(date.value);  // 刷新数据
    } else {
      ElMessage.warning(res.data.msg);
    }
  } catch (err) {
    console.error('调换失败', err);
    ElMessage.error('调换失败，请联系管理员');
  }
};

// -----------------------切换膳食安排状态------------------------
const handleToggleState = async (newState, row) => {
  const action = newState === 1 ? '启用' : '停用';
  try {
    await ElMessageBox.confirm(
        `确认要${action}该膳食吗？`,
        '状态切换确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
    );

    // 用户点击确认后再发送请求
    const res = await axios.post('/DietController/editDiet', {
      mealId: row.mealId,
      date: row.date,
      type: row.type,
      dietCycleId: row.dietCycleId,
      state: newState
    });

    if (res.data.status === 200) {
      row.state = newState;
      ElMessage.success(`膳食已${action}`);
    } else {
      ElMessage.warning(res.data.msg || `膳食${action}失败`);
    }
  } catch (err) {
    // 用户点击取消或请求失败
    row.state = row.state; // 不改动原值
    if (err !== 'cancel') {
      console.error(`${action}失败`, err);
      ElMessage.error(`${action}失败，请联系管理员`);
    }
  }
};
// ------------------------删除膳食安排---------------------------
const handleDelete = async (row) => {
  try {
    const confirm = await ElMessageBox.confirm(
        '确定要删除该膳食安排吗？',
        '删除确认',
        {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
    );
    if (confirm) {
      const res = await axios.post('/DietController/deleteDiet', null,{params:{
          dietCycleId: row.dietCycleId
        }
      });
      if (res.data.status === 200) {
        ElMessage.success('删除成功');
        fetchDietArrangement(date.value);  // 刷新数据
      } else {
        ElMessage.warning(res.data.msg || '删除失败');
      }
    }
  } catch (err) {
    // 点击“取消”不会触发这里，但网络/后端错误会
    console.error('删除失败', err);
    ElMessage.error('删除失败，请联系管理员');
  }
};
// ------------------------初始化和搜索膳食列表---------------------------
const dishSearch = ref('')
const activeCategory = ref('staple')
const filteredDishes = ref(null)
const categoryMap = {
  staple: 1,
  meat: 2,
  vegetable: 3,
  fruit: 4,
  soup: 5,
  dessert: 6
}

const fetchAllDishes = async () => {
  try {
    const res = await axios.get('/DietController/searchFood', {
      params: {
        type: categoryMap[activeCategory.value],
        name: dishSearch.value
      }
    })
    if (res.data.status === 200) {
      filteredDishes.value = res.data.data
    } else {
      filteredDishes.value = []
      ElMessage.warning(res.data.msg || '删除失败');
      console.warn('获取膳食失败：', res.data.msg)
    }
  } catch (e) {
    ElMessage.error('删除失败，请联系管理员');
    console.error('请求膳食失败', e)
    filteredDishes.value = []
  }
}

onMounted(() => {
  fetchAllDishes()
})

const handleMealSearch = () =>{
  fetchAllDishes()
}

watch(activeCategory, () => {
  fetchAllDishes()
})

// ------------------------编辑膳食信息---------------------------
const editMealVisible =ref(false)
const editFormRef = ref(null)
const editRules = {
  date: [{ required: true, message: '请选择日期', trigger: 'change' }],
  meal: [{ required: true, message: '请选择餐别', trigger: 'change' }],
  mealId: [{ required: true, message: '请选择膳食', trigger: 'change' }],
  name: [{ required: true, message: '请输入膳食名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择膳食类别', trigger: 'change' }],
  mealType: [{ required: true, message: '请选择膳食类别', trigger: 'change' }],
}
const editMealForm = reactive({
  mealId:'',
  name:'',
  type:''
})
const handleMealEdit = (row) =>{
  editMealForm.name = row.name
  editMealForm.type = row.type
  editMealForm.mealId = row.mealId
  editMealVisible.value = true
}

const handleEditMealCancel = () =>{
  editMealVisible.value = false
}

const handleEditMealConfirm = async () => {
  try {
    await editFormRef.value.validate();

    const res = await axios.post('/DietController/editFood', {
      mealId: editMealForm.mealId,
      name: editMealForm.name,
      type: editMealForm.type
    });

    if (res.data.status === 200) {
      ElMessage.success('编辑成功');
      editMealVisible.value = false;
      fetchAllDishes();  // 刷新右侧膳食列表
    } else {
      ElMessage.warning(res.data.msg || '编辑失败');
    }
  } catch (err) {
    console.error('编辑失败', err);
    ElMessage.error('编辑失败，请联系管理员');
  }
};
// ------------------------添加膳食---------------------------
const addMealVisible = ref(false)

const addMealForm = reactive({
  name: '',
  type: ''
})

const handleMealAdd = () => {
  addMealForm.name = ''
  addMealForm.type = ''
  addMealVisible.value = true
  editFormRef.value?.clearValidate();
}

const handleAddMealConfirm = async () => {
  try {
    await editFormRef.value.validate();

    const res = await axios.post('/DietController/addFood', {
      name: addMealForm.name,
      type: addMealForm.type
    });

    if (res.data.status === 200) {
      ElMessage.success('添加成功');
      addMealVisible.value = false;
      fetchAllDishes();
    } else {
      ElMessage.warning(res.data.msg || '添加失败');
    }
  } catch (err) {
    console.error('添加膳食失败', err);
    ElMessage.error('添加失败，请联系管理员');
  }
};

// ------------------------删除膳食---------------------------
const handleMealDelete = async (row) => {
  try {
    const confirm = await ElMessageBox.confirm(
        `确定要删除「${row.name}」这个膳食吗？`,
        '删除确认',
        {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'warning'
        }
    );

    if (confirm) {
      const res = await axios.post('/DietController/deleteFood', null, {
        params:{
          mealId: row.mealId
        }}
      )
      if (res.data.status === 200) {
        ElMessage.success('删除成功');
        fetchAllDishes();  // 重新加载列表
        fetchDietArrangement(date.value);
      } else {
        ElMessage.warning(res.data.msg || '删除失败');
      }
    }
  } catch (err) {
    // 用户点“取消”不会触发这里，只有错误才会触发
    console.error('删除失败', err);
    ElMessage.error('删除失败，请联系管理员');
  }
};


</script>

<style scoped>

/* 最外层 */
.diet-calendar-layout {
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
  background-color: #f0f2f5;
  overflow: hidden;
}

/* 左右布局容器 */
.diet-main-layout {
  display: flex;
  flex-direction: row;
  height: 100%;
  width: 100%;
  gap: 16px;
  min-width: 0;
}

/* 左侧区域 */
.diet-left {
  flex: 3;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  min-width: 0;
}

/* 搜索条 */
.diet-search-bar {
  flex: 0 0 10%;
  display: flex;
  gap: 16px;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid ghostwhite;
  align-items: center;
}

/* 膳食安排容器 */
.diet-arrangement {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid ghostwhite;
  overflow: hidden;
  min-height: 0;
}

/* 表格滚动容器 */
.diet-table-placeholder {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  min-height: 0;
}

/* 每个表格块 */
.meal-section {
  flex: none;
  width: 100%;
}

.meal-section h4 {
  font-weight: bold;
  margin: 0 0 8px 0;
}

/* 右侧区域 */
.diet-right {
  flex: 2;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid ghostwhite;
  box-sizing: border-box;
  overflow: hidden;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

/* 搜索栏 */
.diet-right-header {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.diet-search-input {
  flex: 1;
}

/* 表格填满剩余高度（可选） */
.diet-right-tabs {
  margin-bottom: 8px;
}
</style>
