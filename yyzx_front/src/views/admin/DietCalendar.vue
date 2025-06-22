<script setup>
import {ref,reactive} from "vue";

const activeDay = ref('mon') // 当前星期 tab

// 示例安排数据
const arrangedMeals = reactive({
  breakfast: [
    { name: '南瓜小米粥', enabled: true },
    { name: '煮鸡蛋', enabled: false }
  ],
  lunch: [
    { name: '红烧茄子', enabled: true },
    { name: '肉沫蒸蛋', enabled: true }
  ],
  dinner: [
    { name: '炒空心菜', enabled: false },
    { name: '清蒸鲈鱼', enabled: true }
    // { name: '炒空心菜', enabled: false },
    // { name: '清蒸鲈鱼', enabled: true },
    // { name: '炒空心菜', enabled: false },
    // { name: '清蒸鲈鱼', enabled: true }
  ]
})
</script>

<template>
  <el-row gutter="20" class="diet-calendar-layout">
    <!-- 左侧膳食周期 -->
    <el-col :span="16" class="diet-left">
      <!-- 上部：搜索和添加 -->
      <div class="diet-search-bar">
        <el-date-picker
            v-model="date"
            type="date"
            placeholder="请选择日期"
        />
        <el-button type="primary">搜索</el-button>
        <el-button type="success">添加膳食安排</el-button>
      </div>

      <!-- 下部：膳食安排列表 -->
      <div class="diet-arrangement">
        <!-- Tabs -->
        <el-tabs v-model="activeDay" type="card">
          <el-tab-pane label="日" name="sun"></el-tab-pane>
          <el-tab-pane label="一" name="mon"></el-tab-pane>
          <el-tab-pane label="二" name="tue"></el-tab-pane>
          <el-tab-pane label="三" name="wed"></el-tab-pane>
          <el-tab-pane label="四" name="thu"></el-tab-pane>
          <el-tab-pane label="五" name="fri"></el-tab-pane>
          <el-tab-pane label="六" name="sat"></el-tab-pane>
        </el-tabs>

        <!-- 三餐内容占位 -->
        <div class="diet-table-placeholder">
          <!-- 早餐、午餐、晚餐区域待实现 -->
          <div class="meal-section">
            <h4>早餐</h4>
            <el-table :data="arrangedMeals.breakfast" border size="small" style="width: 100%;">
              <el-table-column type="index" label="#" width="50" align="center" />
              <el-table-column prop="name" label="菜品" align="center" />
              <el-table-column label="状态" width="100" align="center">
                <template #default="scope">
                  <el-switch v-model="scope.row.enabled" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="160" align="center">
                <template #default="scope">
                  <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
                  <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 午餐 -->
          <div class="meal-section">
            <h4>午餐</h4>
            <el-table :data="arrangedMeals.lunch" border size="small" style="width: 100%;">
              <el-table-column type="index" label="#" width="50" align="center" />
              <el-table-column prop="name" label="菜品" align="center" />
              <el-table-column label="状态" width="100" align="center">
                <template #default="scope">
                  <el-switch v-model="scope.row.enabled" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="140" align="center">
                <template #default="scope">
                  <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
                  <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 晚餐 -->
          <div class="meal-section">
            <h4>晚餐</h4>
            <el-table :data="arrangedMeals.dinner" border size="small" style="width: 100%;">
              <el-table-column type="index" label="#" width="50" align="center" />
              <el-table-column prop="name" label="菜品" align="center" />
              <el-table-column label="状态" width="100" align="center">
                <template #default="scope">
                  <el-switch v-model="scope.row.enabled" />
                </template>
              </el-table-column>
              <el-table-column label="操作" width="160" align="center">
                <template #default="scope">
                  <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
                  <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
    </el-col>

    <!-- 右侧全部膳食 -->
    <el-col :span="8" class="diet-right">
      <!-- 搜索 + 添加 -->
      <div class="diet-right-header">
        <el-input
            v-model="dishSearch"
            placeholder="请输入膳食名称"
            class="diet-search-input"
            clearable
        />
        <el-button type="primary">添加膳食</el-button>
      </div>

      <!-- Tabs -->
      <el-tabs v-model="activeMealType" type="card" class="diet-right-tabs">
        <el-tab-pane label="早餐" name="breakfast"></el-tab-pane>
        <el-tab-pane label="午餐" name="lunch"></el-tab-pane>
        <el-tab-pane label="晚餐" name="dinner"></el-tab-pane>
      </el-tabs>

      <!-- 表格展示菜品 -->
      <el-table
          :data="filteredDishes"
          border
          size="small"
          style="width: 100%;"
      >
        <el-table-column type="index" label="#" width="50" align="center" />
        <el-table-column prop="name" label="菜品" align="center" />
        <el-table-column label="操作" width="140" align="center">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-col>
  </el-row>
</template>

<style scoped>
.diet-calendar-layout {
  height: 100%;
  padding: 16px;
  box-sizing: border-box;
  overflow:hidden;
  background-color: #f0f2f5;
}

.diet-left {
  display: flex;
  flex-direction: column;
  height: 100%;
}
.diet-right {
  border: 1px solid ghostwhite;
  border-radius: 12px; /* 圆角半径，可根据需要调整 */
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.1); /* 阴影效果 */
  background-color: white;
  padding: 16px;
  height: 100%;
}

.diet-search-bar {
  padding: 16px;
  display: flex;
  align-items: center;
  //padding-bottom: 16px;
  justify-content: flex-start;
  border: 1px solid ghostwhite;
  border-radius: 12px; /* 圆角半径，可根据需要调整 */
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.1); /* 阴影效果 */
  background-color: white;
  //padding:16px 12px 16px 12px;
  margin-bottom: 16px;
  gap: 16px;
}

.diet-arrangement {
  display: flex;
  flex-direction: column;
  //flex: 0 0 100%;
  flex: 1;
  border: 1px solid ghostwhite;
  border-radius: 12px; /* 圆角半径，可根据需要调整 */
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.1); /* 阴影效果 */
  background-color: white;
  padding: 16px;
  //background-color: #fff;
  height: 100%;
  //margin-bottom: 16px;
  box-sizing: border-box;
}

.diet-table-placeholder {
  //min-height: 400px;
  //background-color: white;
  //border: 1px dashed #bbb;
  //margin-top: 16px;
  display: flex;
  flex-direction: column;
  //align-items: center;
  justify-content: center;
  //color: #999;
  gap: 12px;
  max-height: 100%;
  box-sizing: border-box;
  //margin: 16px;
  //overflow-y: auto;
  //padding-right: 4px;
  //padding-bottom: 16px;
}



.diet-right-header {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.diet-search-input {
  flex: 1;
}
.diet-right-tabs {
  margin-bottom: 12px;
}
.meal-section {
  margin-top: 0px;
  //margin-bottom: 12px;
  width: 100%;
}

.meal-section h4 {
  font-weight: bold;
  //margin-bottom: 10px;
  text-align: left;
  margin-top: 0px;
}
</style>