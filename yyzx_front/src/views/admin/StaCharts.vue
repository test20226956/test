<template>
  <div class="layout">
    <div class="overview">
      <el-card class="overview-card">
        <div class="overview-data">
          <el-text>客户数</el-text>
          <el-text style="font-size: 20px;">{{ staData.totalCust }}</el-text>
        </div>
        <div class="overview-data-icon">
          <el-icon style="font-size: 30px;" >
            <User />
          </el-icon>
        </div>
      </el-card>
      <el-card class="overview-card">
        <div class="overview-data">
          <el-text>护工数</el-text>
          <el-text style="font-size: 20px;">{{ staData.totalNurse }}</el-text>
        </div>
        <div class="overview-data-icon">
          <el-icon style="font-size: 30px;">
            <UserFilled />
          </el-icon>
        </div>
      </el-card>
      <el-card class="overview-card">
        <div class="overview-data">
          <el-text>今日入住客户</el-text>
          <el-text style="font-size: 20px;">{{ staData.checkInToday }}</el-text>
        </div>
        <div class="overview-data-icon">
          <el-icon style="font-size: 30px;">
            <CircleCheck />
          </el-icon>
        </div>
      </el-card>
      <el-card class="overview-card">
        <div class="overview-data">
          <el-text>今日退住客户</el-text>
          <el-text style="font-size: 20px;">{{ staData.checkOutToday }}</el-text>
        </div>
        <div class="overview-data-icon">
          <el-icon style="font-size: 30px;">
            <CircleClose />
          </el-icon>
        </div>
      </el-card>
    </div>
    <div class="charts">
      <div class="charts-column">
        <el-card class="echart-card">
          <div class="service-head">
            <el-text class="echart-title">全院床位统计</el-text>
          </div>
          <div class="echart">
            <v-chart :option="bedStaOption" autoresize style="width: 100%; height: 100%;" />
          </div>
        </el-card>
        <el-card class="echart-card">
          <div class="service-head">
            <el-text class="echart-title">楼层床位空闲率</el-text>
          </div>
          <div class="echart">
            <v-chart v-if="floorBedOption?.series?.length" :option="floorBedOption"
                     style="width: 100%; height: 100%;" />
          </div>
        </el-card>
      </div>

      <div class="charts-column">
        <el-card class="echart-card">
          <div class="service-head">
            <el-text class="echart-title">近{{days}}日业务统计</el-text>
            <div style="display: flex; gap: 10px; align-items: center; flex: 1; justify-content: right;">
              <el-select v-model="days" placeholder="近几日" @change="fetchChartData" style="width: 100px;">
                <el-option v-for="n in [3,7, 10, 15]" :key="n" :label="`近${n}日`" :value="n" />
              </el-select>
              <el-select v-model="selectedLevel" placeholder="项目级别" @change="fetchChartData"
                         @visible-change="loadLevels" style="width: 120px;">
                <el-option label="全部级别" value="all"/>
                <el-option v-for="item in levelOptions" :key="item.nursingLevelId" :label="item.name"
                           :value="item.nursingLevelId" />
              </el-select>
            </div>
          </div>
          <div class="echart">
            <v-chart :option="lineChartOption" autoresize style="width: 100%; height: 100%;" />
          </div>
        </el-card>
        <div style="flex: 1;">

        </div>
        <!-- <el-card>
          <div class="echart-title">业务统计{{ checkInNum }}</div>
        </el-card> -->
      </div>

      <div class="charts-column">
        <el-card class="echart-card">
          <div class="service-head" style="flex: 0 0 10%;">
            <el-text class="echart-title">近7日热门项目 Top10</el-text>
          </div>
          <div style="height: 100%;margin-top: 0;">
            <!-- <v-chart :option="popularChartOption" :style="{ height: chartHeight, width: '100%' }" /> -->
            <v-chart :option="popularChartOption" :style="{ height: '100%', width: '100%' }" />
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  reactive,
  onMounted,
  computed,
  nextTick
} from 'vue'
import axios from 'axios'
import {
  ElMessage
} from "element-plus";
import {
  User,
  UserFilled,
  CircleCheck,
  CircleClose
} from '@element-plus/icons-vue'
// ----------------------数据统计overview部分--------------------
const staData = ref({
  checkInToday: 0,
  checkOutToday: 0,
  totalCust: 0,
  totalNurse: 0
})

const fetchOverviewData = async () => {
  try {
    const res = await axios.get('/ChartController/dataCount');
    console.log("res:", res);
    if (res.data.status === 200) {
      console.log("获取数据成功")
      staData.value = res.data.data;
    } else {
      ElMessage.warning(res.data.msg || '数据统计获取失败');
    }
  } catch (err) {
    console.error(err);
    ElMessage.error('数据统计接口异常，请联系管理员');
  }
}

onMounted(() => {
  fetchOverviewData();
  fetchBedSta();
  fetchFloorBedSta();
  fetchPopularProjects();
  fetchChartData();
})

// ------------------------床位统计------------------------、
const bedSta = ref({})

const fetchBedSta = async () => {
  try {
    const res = await axios.get('/BedController/allBed')
    if (res.data.status === 200) {
      bedSta.value = res.data.data
    } else {
      ElMessage.warning(res.data.msg || '床位统计获取失败')
    }
  } catch (e) {
    ElMessage.error('床位统计接口异常，请联系管理员')
  }
}


const bedStaOption = computed(() => ({
  tooltip: {
    trigger: 'item'
  },
  // legend: {
  // 	bottom: '0%',
  // 	left: 'center'
  // },
  legend: {
    left: 'left', // 靠左对齐
    top: 'center', // 垂直居中
    orient: 'vertical' // 垂直排列
  },
  color: ['#a6badf ', '#d2798c', '#e7e4f8'], // 绿红蓝
  series: [{
    name: '床位使用情况',
    type: 'pie',
    radius: ['40%', '70%'],
    avoidLabelOverlap: false,
    label: {
      show: true,
      formatter: '{b}: {d}%',
    },
    data: [{
      value: bedSta.value.free,
      name: '空闲'
    },
      {
        value: bedSta.value.taken,
        name: '有人'
      },
      {
        value: bedSta.value.goOut,
        name: '外出'
      }
    ]
  }]
}))
// -----------------------楼层床位使用情况--------------------
const floorBedSta = ref([])

const fetchFloorBedSta = async () => {
  try {
    const res = await axios.get('/ChartController/floorBed')
    if (res.data.status === 200) {
      floorBedSta.value = res.data.data
    } else {
      ElMessage.warning(res.data.msg || '获取楼层床位数据失败')
    }
  } catch (e) {
    ElMessage.error('楼层床位接口异常')
  }
}

const floorBedOption = computed(() => {
  const xData = floorBedSta.value.map(item => `${item.floor}层`)
  const freeBeds = floorBedSta.value.map(item => item.status.free)
  const usedBeds = floorBedSta.value.map(item => item.status.taken + item.status.goOut)
  const emptyRate = floorBedSta.value.map(item =>
      item.status.total > 0 ? (item.status.free / item.status.total * 100).toFixed(2) : 0
  )

  return {
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      top: '0'
    },
    grid:{
      top:'30%',
      bottom:'15%'
    },
    xAxis: {
      type: 'category',
      data: xData
    },
    yAxis: [{
      type: 'value',
      name: '床位数量',
      position: 'left',
      minInterval: 1
    },
      {
        type: 'value',
        name: '空床率 (%)',
        position: 'right',
        axisLabel: {
          formatter: '{value}%'
        }
      }
    ],
    series: [{
      name: '未使用床位',
      type: 'bar',
      stack: 'total',
      data: freeBeds,
      itemStyle: {
        color: '#a6badf'
      }
    },
      {
        name: '已使用床位',
        type: 'bar',
        stack: 'total',
        data: usedBeds,
        itemStyle: {
          color: '#d2798c'
        }
      },
      {
        name: '空床率（%）',
        type: 'line',
        yAxisIndex: 1,
        data: emptyRate,
        itemStyle: {
          color: '#96e2d3'
        },
        lineStyle: {
          width: 2
        },
        smooth: true
      }
    ]
  }
})

// --------------------------热门项目排列-------------------------
const topN = ref(10)
const popularProjects = ref([])

const chartHeight = computed(() => {
  const count = Array.isArray(popularProjects.value) ? popularProjects.value.length : 0;
  return Math.max(300, 50 * count) + 'px';
});

const fetchPopularProjects = async () => {
  try {
    const res = await axios.get('/ChartController/popularProjects', {
      params: {
        topN: topN.value
      }
    })
    if (res.data.status === 200) {
      popularProjects.value = res.data.data
    } else {
      ElMessage.warning(res.data.msg || '查询失败')
    }
  } catch (err) {
    ElMessage.error('网络异常，无法获取热门项目')
  }
}

const getHeatColor = (index) => {
  const colors = [
    '#b34557', // 红
    '#d2798c',
    '#eab7ca',
    '#f1ccde',
    '#f4dced',
    '#e7e4f8',
    '#a6badf',
    '#6892c5',
    '#4675b0',
    '#28437d'
  ]
  return index < 10 ? colors[index] : '#C0C4CC' // 11+ 用灰色
}

const popularChartOption = computed(() => {
  const sorted = [...popularProjects.value];

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '5%',
      right: '5%',
      top: '0%',
      bottom: '0%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      show: false,
      splitLine: {
        show: false
      }
    },
    yAxis: {
      type: 'category',
      inverse: true,
      data: sorted.map((item, index) => `Top${index + 1} ${item.nursingPro}`),
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        fontSize: 14,
        color: '#333',
        interval: 0
      }
    },
    series: [{
      name: '使用次数',
      type: 'bar',
      barWidth: '30',
      barGap:'20',
      data: sorted.map((item, index) => ({
        value: item.count,
        itemStyle: {
          color: getHeatColor(index)
        }
      })),
      label: {
        show: true,
        position: 'right',
        fontSize: 13,
        color: '#555',
        formatter: '{c}'
      },
      itemStyle: {
        borderRadius: [6, 6, 6, 6]
      }
    }]
  };
});


// ----------------------------业务统计--------------------------
const chartRef = ref(null)
let chartInstance = null

// 折线图筛选项
const days = ref(3)
const levelOptions = ref([])
const selectedLevel = ref('all')
const levelLoaded = ref(false)

// 折线图数据
const dailyData = ref([])

// 加载等级列表（点击才加载）
const loadLevels = async () => {
  if (levelLoaded.value) return
  try {
    const res = await axios.get('/NursingLevelController/showOk')
    if (res.data.status === 200) {
      levelOptions.value = res.data.data
      levelLoaded.value = true
    } else {
      ElMessage.warning(res.data.msg || '获取等级失败')
    }
  } catch (e) {
    console.error(e);
    ElMessage.error('网络异常')
  }
}

// 获取统计数据
const fetchChartData = async () => {
  const levelParam = selectedLevel.value === 'all' ? null : selectedLevel.value;

  try {
    const res = await axios.get('/ChartController/dailyCount', {
      params: {
        days: days.value,
        nursingLevelId: levelParam // 不主动设 ''
      }
    });
    if (res.data.status === 200) {
      dailyData.value = res.data.data.reverse()
      await nextTick()
      renderChart()
    } else {
      ElMessage.warning(res.data.msg || '查询失败')
    }
  } catch (e) {
    console.error(e);
    ElMessage.error('网络异常')
  }
}
// 渲染图表
const renderChart = () => {
  if (!chartRef.value) {
    console.warn('chartRef is null')
    return
  }
  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
  }
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      // top:'0%',
      // bottom: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dailyData.value.map(item => item.date),
      axisLabel: {
        rotate: 45
      }
    },
    yAxis: {
      type: 'value',
      name: '数量'
    },
    series: [{
      data: dailyData.value.map(item => item.nursingNum),
      type: 'line',
      smooth: true,
      lineStyle: {
        width: 2
      },
      itemStyle: {
        color: '#409EFF'
      },
      areaStyle: {
        color: 'rgba(64,158,255,0.2)'
      }
    }]
  }
  chartInstance.setOption(option)
}

const lineChartOption = computed(() => ({
  tooltip: {
    trigger: 'axis'
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '0%',
    top:'5%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: dailyData.value.map(item => item.date),
    axisLabel: {
      // rotate: 45
    }
  },
  yAxis: {
    type: 'value',
    name: '数量'
  },
  series: [{
    data: dailyData.value.map(item => item.nursingNum),
    type: 'line',
    smooth: true,
    lineStyle: {
      width: 2
    },
    itemStyle: {
      color: '#409EFF'
    },
    areaStyle: {
      color: 'rgba(64,158,255,0.2)'
    }
  }]
}))
</script>

<style scoped>
.layout {
  display: flex;
  flex-direction: column;
  background-color: #F4F5FB;
  padding: 30px;
  height: 100%;
  box-sizing: border-box;
  /* overflow-y: hidden; */
  gap: 30px;
  //overflow-x: auto;
}

.overview {
  flex: 0 0 15%;
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  gap: 30px;
  //overflow: auto;
}

.overview-card {
  flex: 1;
  border-radius: 12px !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  padding: 0;
}

.overview-card ::v-deep(.el-card__body) {
  height: 100%;
  display: flex;
  flex-direction: row;
  box-sizing: border-box;
  padding: 0px;
}

.overview-data {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  //background-color: thistle;
  //border-radius: 12px;
  //box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  gap: 5px;
}

.overview-data-icon {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #a6badf;
  color: whitesmoke;
  /* background-color: azure; */

}

.charts {
  display: flex;
  flex-direction: row;
  flex: 1;
  gap: 30px;
  box-sizing: border-box;
  //overflow: auto;
}

.charts-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.echart-card {
  height: 100%;
  flex: 1;
  border-radius: 12px !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.echart-card ::v-deep(.el-card__body) {
  height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  gap: 16px;
}

.echart {
  flex: 1;
  box-sizing: border-box;
  /* background-color: azure; */
  box-sizing: border-box;
  //overflow: hidden;
}

.service-head{
  /* background-color: thistle; */
  flex: 0 0 20%;
  align-content: center;
  display: flex;

  /* justify-content: center; */
}
.echart-title{
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50; /* 深灰蓝色，更现代感 */
  /* margin-bottom: 12px; */
  padding-left: 8px;
  border-left: 4px solid #4675b0; /* 蓝色高亮条 */
  line-height: 1.5;
  overflow: hidden;
}
</style>