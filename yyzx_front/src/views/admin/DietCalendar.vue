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
                <el-table-column prop="name" label="菜品" align="center" />
                <el-table-column label="状态" width="100" align="center">
                  <template #default="scope">
                    <el-switch v-model="scope.row.enabled" />
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="160" align="center">
                  <template #default="scope">
                    <el-button type="warning" size="small" plain @click="handleEdit(scope.row)">
                      <el-icon style="margin-right: 5px;"><Edit /></el-icon> 编辑
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
          <el-button type="primary" plain @click="handleAdd" style="margin-left: 0px">
            <el-icon style="margin-right: 5px;"><Plus /></el-icon> 添加膳食
          </el-button>
        </div>

        <el-tabs v-model="activeMealType" type="card" class="diet-right-tabs">
          <el-tab-pane label="早餐" name="breakfast" />
          <el-tab-pane label="午餐" name="lunch" />
          <el-tab-pane label="晚餐" name="dinner" />
        </el-tabs>

        <el-table :data="filteredDishes" border size="small" style="width: 100%;" />
      </div>
    </div>
  </div>
</template>

<script setup>
import {onMounted, ref, watch} from 'vue'
import {Search, Plus, Edit, Delete} from '@element-plus/icons-vue'
import dayjs from "dayjs";

const date = ref(null)
const dishSearch = ref('')
const activeDay = ref('mon')
const activeMealType = ref('lunch')

const arrangedMeals = ref(null)

const filteredDishes = ref([])

const mealNames = {
  breakfast: '早餐',
  lunch: '午餐',
  dinner: '晚餐'
}

const handleSearch = () => {}
const handleAdd = () => {}
const handleEdit = (row) => {}
const handleDelete = (row) => {}

const getWeekdayName = (date) =>{
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  return days[new Date(date).getDay()]
}

onMounted(() => {
  initDietArrange()
})

const initDietArrange = () => {
  const today = new Date()
  date.value = today

  // 激活当前星期 tab
  activeDay.value = getWeekdayName(today)

  fetchDietArrangement(today)
}

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

const fetchDietArrangement = async (targetDate) => {
  const formatted = dayjs(date.value).format('YYYY-MM-DD')

  // TODO: 替换为实际请求
  console.log('Fetching diet for date:', formatted)

  // 假设返回结构：
  arrangedMeals.value = {
    breakfast: [{ name: '红烧茄子', enabled: true }],
    lunch: [{ name: '鱼香肉丝', enabled: false }],
    dinner: [{ name: '青菜豆腐汤', enabled: true }]
  }
}
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
  flex: 2;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  min-width: 0;
}

/* 搜索条 */
.diet-search-bar {
  display: flex;
  gap: 16px;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 12px;
  background: white;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid ghostwhite;
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
  flex: 1;
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
