<template>
  <div class="bed-map-page">
    <!-- 楼层选择 -->
    <div class="bed-map-header">
      <el-form-item label="楼层" style="margin-bottom: 0px">
        <el-select v-model="selectedFloor" placeholder="请选择楼层" style="width: 240px;">
          <el-option v-for="floor in floors" :key="floor.value" :label="floor.label" :value="floor.value" />
        </el-select>
      </el-form-item>
      <div class="bed-map-stats">
        <span><i class="icon bed-icon all" /> 总床数：{{ stats.total || 0 }}</span>
        <span><i class="icon bed-icon free" /> 空闲：{{ stats.free || 0 }}</span>
        <span><i class="icon bed-icon occupied" /> 有人：{{ stats.occupied || 0}}</span>
        <span><i class="icon bed-icon out" /> 外出：{{ stats.goOut || 0}}</span>
      </div>
    </div>

    <!-- 房间网格图 -->
    <div class="bed-map-grid">
      <div
          v-for="room in rooms"
          :key="room.gridArea"
          class="room-box"
          :class="room.type"
          :style="{
          gridArea: room.gridArea,
          gridRow: room.rowSpan ? `span ${room.rowSpan}` : undefined}"
          @mouseenter="(e) => hoverRoom(room, e)"
          @mouseleave="() => hoverRoom(null)"
      >
        {{ room.label }}
      </div>
    </div>

    <!-- 悬浮信息框 -->
    <div v-if="hoveredRoom" class="room-tooltip" :style="tooltipStyle">
      <div class="tooltip-title">{{ hoveredRoom.label }} 房间床位</div>
      <div v-for="(bed, index) in hoveredRoom.beds" :key="index" class="tooltip-bed">
        <i :class="['tooltip-icon', bed.status]" /> {{ bed.name }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, watch, onMounted } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
// ------------------------------楼层布局------------------------------------
const allGridAreas = [
  'r101' ,'r102' ,'r103' ,'r104' ,'r105' ,'r106' ,'r107' ,'r108' ,'r109' ,'r110' ,'r111' ,'r112',
  'corridor',
  'r301' ,'r302' ,'r303' ,'r304' ,'r305' ,'r306' ,'r307' ,'r308' ,'r309' ,'r311' ,'r312',
  'r409' ,'r411' ,
  'r509' ,'r511' ,
]

// 楼层数据（2-6层）
const selectedFloor = ref(2)
const floors = [
  { label: '二楼', value: 2 },
  { label: '三楼', value: 3 },
  { label: '四楼', value: 4 },
  { label: '五楼', value: 5 },
  { label: '六楼', value: 6 }
]
// bedSta
const stats = ref({
  total: 0,
  free: 0,
  occupied: 0,
  goOut: 0
})


const rooms = ref([])
const hoveredRoom = ref(null)
const tooltipStyle = ref({})

const fetchRooms = async () => {
  try {
    const res = await axios.get('/RoomController/searchRoom', {
      params: { floor: selectedFloor.value }
    })

    const roomMap = new Map()

    if (res.data.status === 200) {
      console.log("查询成功")
      const backendRooms = res.data.data

      backendRooms.forEach(r => {
        const id = r.loc
        const room_number = r.roomNumber
        // 特殊房间样式设置
        if(room_number === '卫生间'){
          roomMap.set(id, { label: '卫生间', type: 'toilet', gridArea: r.loc })
        }else if(room_number === '洗衣房'){
          roomMap.set(id, { label: '洗衣房', type: 'laundry', gridArea: r.loc })
        }else if(room_number === '公共浴室'){
          roomMap.set(id, { label: '公共浴室', type: 'bathroom', gridArea: r.loc })
        }else if(room_number === '活动室'){
          roomMap.set(id, { label: '活动室', type: 'activity', gridArea: r.loc })
        }else if(room_number === '楼梯间'){
          roomMap.set(id, { label: '楼梯间', type: 'staircase', gridArea: r.loc })
        }else if(room_number === '护士站'){
          roomMap.set(id, { label: '护士站', type: 'nurseStation', gridArea: r.loc })
        }else if(room_number === '公共餐厅'){
          roomMap.set(id, { label: '公共餐厅', type: 'restaurant', gridArea: r.loc })
        }
        if (!roomMap.has(id)) {
          roomMap.set(id, {
            label: r.roomNumber,
            type: 'room',
            gridArea: r.loc,
            beds: Array(r.bedCount).fill().map((_, i) => ({
              name: '空闲',
              status: 'free'
            }))
          })
        }
      })
    } else {
      ElMessage.error(res.data.msg)
    }

    rooms.value = allGridAreas.map(id => {
      if (id === 'corridor') {
        return {
          label: '',
          type: 'spacer',
          gridArea: id
        }
      }
      return roomMap.get(id) || {
        label: '未使用的房间',
        type: 'empty',
        gridArea: id
      }
    })
  } catch (err) {
    ElMessage.error('请求失败')
  }
}

let hoverTimeout = null
const hoverRoom = async (room, event) => {
  clearTimeout(hoverTimeout)

  const tooltipAllowedTypes = ['room']

  if (!room || !tooltipAllowedTypes.includes(room.type)) {
    hoveredRoom.value = null
    return
  }

  hoveredRoom.value = {
    ...room,
    beds: []  // 初始空
  }

  await nextTick()

  const targetRect = event.target.getBoundingClientRect()
  const parentRect = document.querySelector('.bed-map-page').getBoundingClientRect()
  tooltipStyle.value = {
    top: `${targetRect.top - parentRect.top + targetRect.height + 8}px`,
    left: `${Math.min(targetRect.left - parentRect.left, parentRect.width - 180)}px`
  }

  // 悬浮时向后端请求床位
  try {
    const res = await axios.get('/BedController/searchBedByRoomAndFloor', {
      params: {
        roomNumber: room.label,
        floor:selectedFloor.value
      }
    })

    if (res.data.status === 200 && Array.isArray(res.data.data)) {
      if(hoveredRoom.value && hoveredRoom.value.label === room.label){
        hoveredRoom.value.beds = res.data.data.map((bed, i) => {
          let status = 'free'
          if (bed.available === 0) status = 'free'
          else if (bed.available === 1) status = 'occupied'
          else if (bed.available === 2) status = 'out'
          return {
            name: bed.customer_name ?? `床位${bed.bed_number}`,
            status
          }
        })
      }
    } else {
      ElMessage.warning(res.data.msg || '床位数据加载失败');
      if (hoveredRoom.value && hoveredRoom.value.label === room.label) {
        hoveredRoom.value.beds = []  // 合理：确实无数据，就设为空
      }
    }
  } catch (err) {
    ElMessage.error(err || '系统错误，请管理员联系');
    hoveredRoom.value.beds = []
  }
}

const fetchBedStats = async () => {
  try {
    const res = await axios.get('/BedController/searchBedSta', {
      params: { floor: selectedFloor.value }
    })

    if (res.data.status === 200 && res.data.data?.floorStats) {
      stats.value = {
        total: res.data.data.floorStats.total,
        free: res.data.data.floorStats.free,
        occupied: res.data.data.floorStats.taken,
        out: res.data.data.floorStats.goOut
      }
    } else {
      ElMessage.warning(res.data.msg || '床位统计数据获取失败');
      stats.value = { total: 0, free: 0, occupied: 0, goOut: 0 }
    }
  } catch (err) {
    ElMessage.error('请求床位统计信息失败');
    stats.value = { total: 0, free: 0, occupied: 0, goOut: 0 }
  }
}
onMounted(() => {
  fetchRooms()
  fetchBedStats()
})

watch(selectedFloor, () => {
  fetchRooms()
  fetchBedStats()
})
</script>

<style scoped>
.bed-map-page {
  width: 100%;
  padding: 16px;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background-color: #f0f2f5;
  position: relative;
  overflow-x: auto;
}

/* 顶部区域 */
.bed-map-header {
  flex: 0 0 15%;
  border-radius: 12px;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.1);
  background-color: white;
  padding: 0 30px 0 30px;
  display: flex;
  margin-bottom: 16px;
  //align-content: center;
  align-items: center;
}

.bed-map-stats {
  flex: 1;
  display: flex;
  justify-content: center;
  gap: 16px;
  font-size: 14px;
  margin-top: 8px;
}

.bed-icon {
  display: inline-block;
  width: 14px;
  height: 14px;
  margin-right: 4px;
  border-radius: 2px;
}

/* 网格容器 */
.bed-map-grid {
  width: 100%;
  flex: 1;
  display: grid;
  align-content: center;
  justify-content: center;
  grid-template-areas:
    "r101 r102 r103 r104 r105 r106 r107 r108 r109 r110 r111 r112"
    "corridor corridor corridor corridor corridor corridor corridor corridor corridor corridor corridor corridor"
    "r301 r302 r303 r304 r305 r306 r307 r308 r309 .     r311 r312"
    ".    .    .    .    .    .    .    .    r409 .     r411 ."
    ".    .    .    .    .    .    .    .    r509 .     r511 .";
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: 70px 70px 70px 70px 70px;
  grid-auto-rows: 70px;
  gap: 12px;
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
  overflow-x: auto;
  box-sizing: border-box;
}

.bed-icon.all {
  background: black;
}
.bed-icon.free {
  background: green;
}
.bed-icon.occupied {
  background: darkred;
}
.bed-icon.out {
  background: dodgerblue;
}


/* 房间格子样式 */
.room-box {
  height: 60px;
  border: 1px solid #333;
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
  line-height: 60px;
  background: white;
  cursor: pointer;
  transition: 0.2s;
  min-width: 70px;
}

.room-box:hover {
  background: #e6f7ff;
  border-color: #409eff;
}

/* 不同类型房间颜色 */
.room-box.activity {
  border: 2px solid #FFCC80;
  //color: #FFCC80;
  font-weight: bold;
  background: repeating-linear-gradient(
      45deg,
      #FFCC80,
      #FFCC80 5px,
      #ffffff 5px,
      #ffffff 10px
  );
}
.room-box.laundry {
  border: 2px solid thistle;
  //color: #A5D6A7;
  font-weight: bold;
  background: repeating-linear-gradient(
      45deg,
      thistle,
      thistle 5px,
      #ffffff 5px,
      #ffffff 10px
  );
}
.room-box.toilet {
  border: 2px solid #B0BEC5;
  //color: #B0BEC5;
  font-weight: bold;
  background: repeating-linear-gradient(
      45deg,
      #B0BEC5,
      #B0BEC5 5px,
      #ffffff 5px,
      #ffffff 10px
  );
}

.room-box.bathroom {
  border: 2px solid #4FC3F7;
  //color: #4FC3F7;
  font-weight: bold;
  background: repeating-linear-gradient(
      45deg,
      #4FC3F7,
      #4FC3F7 5px,
      #ffffff 5px,
      #ffffff 10px
  );
}

.room-box.staircase {
  border: 2px solid #C8E6C9;
  //color: #757575;
  font-weight: bold;
  background: repeating-linear-gradient(
      45deg,
      #C8E6C9,
      #C8E6C9 5px,
      #ffffff 5px,
      #ffffff 10px
  );
}

.room-box.nurseStation {
  border: 2px solid #81D4FA;
  //color: #81D4FA;
  font-weight: bold;
  background: repeating-linear-gradient(
      45deg,
      #81D4FA,
      #81D4FA 5px,
      #ffffff 5px,
      #ffffff 10px
  );
}

.room-box.restaurant {
  border: 2px solid #FFF59D;
  //color: #FFF59D;
  font-weight: bold;
  background: repeating-linear-gradient(
      45deg,
      #FFF59D,
      #FFF59D 5px,
      #ffffff 5px,
      #ffffff 10px
  );
}

.room-box.forbidden {
  background: repeating-linear-gradient(
      45deg,
      #f44336,
      #f44336 5px,
      #ffffff 5px,
      #ffffff 10px
  );
  color: transparent;
  border: 1px solid #f44336;
}

.room-box.spacer {
  background: transparent;
  border: none;
  cursor: default;
  pointer-events: none;
}

.room-box.empty {
  background-color: #f9f9f9;
  border: 1px dashed #ccc;
  color: #aaa;
  cursor: default;
}

.room-tooltip {
  position: absolute;
  background: white;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-size: 14px;
  width: 160px;
  z-index: 1000;
}

.tooltip-title {
  font-weight: bold;
  margin-bottom: 8px;
}

.tooltip-bed {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.tooltip-icon {
  width: 14px;
  height: 14px;
  margin-right: 6px;
  border-radius: 2px;
  display: inline-block;
}

.tooltip-icon.occupied {
  background-color: darkred;
}
.tooltip-icon.free {
  background-color: green;
}
.tooltip-icon.out {
  background-color: dodgerblue;
}
</style>
