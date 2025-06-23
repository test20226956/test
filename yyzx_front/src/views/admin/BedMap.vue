<script setup>
import { ref, watch, onMounted } from 'vue'

const floorList = ['一楼', '二楼', '三楼']
const selectedFloor = ref('三楼') // 默认值

const summary = ref({
  total: 100,
  empty: 13,
  occupied: 65,
  out: 22,
})

const roomLayout = ref([
  { roomNumber: '320', top: 20, left: 800 },
  { roomNumber: '311', top: 400, left: 500 },
  // 继续补全其他房间布局信息
])

const hoveredRoom = ref(null)
const hoveredRoomBeds = ref([])

// 切换楼层
const handleFloorChange = (val) => {
  hoveredRoom.value = null
  hoveredRoomBeds.value = []
  fetchRoomData(val)
}

// 模拟悬停拉取床位信息
watch(hoveredRoom, (val) => {
  if (val) {
    fetchBedStatus(val)
  } else {
    hoveredRoomBeds.value = []
  }
})

// 假设从后端获取床位情况
const fetchBedStatus = (roomNumber) => {
  // 模拟请求
  hoveredRoomBeds.value = [
    { bedId: 1, name: '小张', statusClass: 'occupied' },
    { bedId: 2, name: '', statusClass: 'empty' },
    { bedId: 3, name: '小李', statusClass: 'out' },
  ]
}

const fetchRoomData = (floor) => {
  // 后续对接API加载每层roomLayout与summary数据
}

onMounted(() => {
  fetchRoomData(selectedFloor.value)
})
</script>

<template>
  <div class="bed-map-layout">
    <!-- 楼层选择 -->
    <el-select v-model="selectedFloor" @change="handleFloorChange" placeholder="请选择楼层" class="floor-select">
      <el-option v-for="floor in floorList" :key="floor" :label="floor" :value="floor" />
    </el-select>

    <!-- 床位统计 -->
    <div class="bed-summary">
      <span><i class="el-icon-bed" /> 总床数：{{ summary.total }}</span>
      <span style="color: green">空闲：{{ summary.empty }}</span>
      <span style="color: red">有人：{{ summary.occupied }}</span>
      <span style="color: #409EFF">外出：{{ summary.out }}</span>
    </div>

    <!-- 示意图区域 -->
    <div class="map-container">
      <!-- 固定结构SVG或div画图，可后期更换 -->
      <div
          v-for="room in roomLayout"
          :key="room.roomNumber"
          class="room-block"
          :class="{ active: hoveredRoom === room.roomNumber }"
          @mouseenter="hoveredRoom = room.roomNumber"
          @mouseleave="hoveredRoom = null"
          :style="{ top: room.top + 'px', left: room.left + 'px' }"
      >
        {{ room.roomNumber }}
      </div>
    </div>

    <!-- 悬停展示床位状态 -->
    <div class="tooltip-box" v-if="hoveredRoomBeds.length > 0">
      <strong>{{ hoveredRoom }} 房床位情况</strong>
      <div v-for="bed in hoveredRoomBeds" :key="bed.bedId" :class="'bed-status ' + bed.statusClass">
        {{ bed.name || '空闲' }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.bed-map-layout {
  padding: 20px;
}

.floor-select {
  margin-bottom: 10px;
}

.bed-summary span {
  margin-right: 20px;
  font-weight: bold;
}

.map-container {
  position: relative;
  width: 1000px;
  height: 600px;
  background: #f9f9f9;
  border: 1px solid #ddd;
  margin-top: 20px;
}

.room-block {
  position: absolute;
  width: 60px;
  height: 40px;
  border: 2px solid black;
  text-align: center;
  line-height: 40px;
  background-color: white;
  cursor: pointer;
}

.room-block.active {
  background-color: #e6f7ff;
  border-color: #409EFF;
}

.tooltip-box {
  position: absolute;
  top: 100px;
  right: 20px;
  background: white;
  border: 1px solid #ccc;
  padding: 10px;
  box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
}

.bed-status {
  margin-top: 5px;
}

.bed-status.occupied {
  color: red;
}

.bed-status.empty {
  color: green;
}

.bed-status.out {
  color: #409EFF;
}
</style>