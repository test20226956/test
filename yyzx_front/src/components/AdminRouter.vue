<script setup>
import {ref, computed} from 'vue';
import {useRouter} from 'vue-router';
import {
  Document,
  Menu as IconMenu,
  Location,
  Setting, Expand,
  User,
  FirstAidKit, Bowl,Avatar,Edit,OfficeBuilding,
} from '@element-plus/icons-vue'

const router = useRouter();
// const isCollapse = ref(true)
const handleOpen = (key, keyPath) => {
  console.log(key, keyPath)
}
const handleClose = (key, keyPath) => {
  console.log(key, keyPath)
}

const toCheckIn = () => {
  router.push("/framework/checkIn");
}

const toCheckOut = () => {
  router.push("/framework/checkOut");
}
const toGoOut = () => {
  router.push("/framework/goOut");
}

const toBedMap = () => {
  router.push("/framework/bedMap");
}

const toBedMGMT = () => {
  router.push("/framework/bedMGMT");
}

const toNursingLevel = () => {
  router.push("/framework/nursingLevel");
}

const toNursingPro = () => {
  router.push("/framework/nursingPro");
}

const toNursingRecord = () => {
  router.push("/framework/nursingRecord");
}

const toDietCalendar = () => {
  router.push("/framework/dietCalendar");
}

const toCustDiet = () => {
  router.push("/framework/custDiet");
}

const toServiceFocus = () => {
  router.push("/framework/serviceFocus");
}

const toCustNursingPro = () => {
  router.push("/framework/custNursingPro");
}

const toServiceCust = () => {
  router.push("/framework/serviceCust");
}

const toUserMGMT = () => {
  router.push("/framework/userMGMT");
}

const activeIndex = ref('1')
// const isCo = () =>{
//   if(isCollapse.value==false) isCollapse.value=true;
//   else isCollapse.value=false;
// }
// 暴露宽度属性给父组件使用
// const asideWidth = computed(() => isCollapse.value ? '64px' : '200px')
// defineExpose({ asideWidth, isCollapse })

defineProps({
  isCollapse:{
    type: Boolean,
    required : true
  },
})
</script>

<template>
<!--  <el-icon @click="isCo"-->
<!--           class="icon"-->
<!--           size="25"-->
<!--  >-->
<!--    <Expand />-->
<!--  </el-icon>-->
  <el-scrollbar height="100%">
    <el-menu
        default-active="2"
        class="el-menu-vertical-demo"
        :collapse="isCollapse"
        @open="handleOpen"
        @close="handleClose"
        :style="{width: isCollapse.value ? '64px' : '200px'}"
        :popper-offset="isCollapse.value ? 0 : -136"
    >
      <el-sub-menu class="sub-menu" index="1">
        <template #title>
          <el-icon>
            <User/>
          </el-icon>
          <span>客户管理</span>
        </template>
        <el-menu-item class="item" index="1-1" @click="toCheckIn">入住登记</el-menu-item>
        <el-menu-item class="item" index="1-2" @click="toCheckOut">退住登记</el-menu-item>
        <el-menu-item class="item" index="1-3" @click="toGoOut">外出登记</el-menu-item>
      </el-sub-menu>
      <el-sub-menu class="sub-menu" index="2">
        <template #title>
          <el-icon>
            <OfficeBuilding/>
          </el-icon>
          <span>床位管理</span>
        </template>
        <el-menu-item class="item" index="2-1" @click="toBedMap">床位示意图</el-menu-item>
        <el-menu-item class="item" index="2-2" @click="toBedMGMT">床位管理</el-menu-item>
      </el-sub-menu>
      <el-sub-menu class="sub-menu" index="3">
        <template #title>
          <el-icon>
            <Edit/>
          </el-icon>
          <span>护理管理</span>
        </template>
        <el-menu-item class="item" index="3-1" @click="toNursingLevel">护理级别</el-menu-item>
        <el-menu-item class="item" index="3-2" @click="toNursingPro">护理项目</el-menu-item>
        <el-menu-item class="item" index="3-3" @click="toCustNursingPro">客户护理设置</el-menu-item>
        <el-menu-item class="item" index="3-4" @click="toNursingRecord">护理记录</el-menu-item>
      </el-sub-menu>
      <el-sub-menu class="sub-menu" index="4">
        <template #title>
          <el-icon>
            <Bowl/>
          </el-icon>
          <span>膳食管理</span>
        </template>
        <el-menu-item class="item" index="4-1" @click="toDietCalendar">膳食日历</el-menu-item>
        <el-menu-item class="item" index="4-2" @click="toCustDiet">膳食配置</el-menu-item>
      </el-sub-menu>
      <el-sub-menu class="sub-menu" index="5">
        <template #title>
          <el-icon>
            <FirstAidKit/>
          </el-icon>
          <span>健康管家</span>
        </template>
        <el-menu-item class="item" index="5-1" @click="toServiceFocus">服务关注</el-menu-item>
        <el-menu-item class="item" index="5-2" @click="toServiceCust">设置服务对象</el-menu-item>
      </el-sub-menu>
      <el-sub-menu class="sub-menu" index="6">
        <template #title>
          <el-icon>
            <Avatar/>
          </el-icon>
          <span>用户管理</span>
        </template>
        <el-menu-item class="item" index="6-1" @click="toUserMGMT">基础数据维护</el-menu-item>
      </el-sub-menu>
    </el-menu>
  </el-scrollbar>

</template>

<style scoped>
.el-menu-vertical-demo:not(.el-menu--collapse) {
  //width: 200px;
  min-height: 400px;
}
.el-menu-vertical-demo{
  background-color: #e1e9e3;
}

/* 展开时 - 主菜单默认文字和图标颜色 */
.el-menu:not(.el-menu--collapse) .el-sub-menu__title {
  color: #5a6e63;
}
.el-menu:not(.el-menu--collapse) .el-sub-menu__title .el-icon {
  color: #5a6e63;
}

/* 展开时 - 主菜单 hover 效果 */
.el-menu:not(.el-menu--collapse) .el-sub-menu__title:hover {
  background-color: #e8eeea;
  color: #8ea195;
}
.el-menu:not(.el-menu--collapse) .el-sub-menu__title:hover .el-icon {
  color: #8ea195;
}

/* 展开时 - 主菜单激活状态 */
.el-menu:not(.el-menu--collapse) .el-sub-menu.is-active > .el-sub-menu__title {
  background-color: #a6bdad !important;
  color: #ffffff !important;
}
.el-menu:not(.el-menu--collapse) .el-sub-menu.is-active > .el-sub-menu__title .el-icon {
  color: #ffffff !important;
}

/* 展开时 - 子菜单默认颜色 */
.el-menu:not(.el-menu--collapse) .el-menu-item {
  color: #5a6e63;
}
.el-menu:not(.el-menu--collapse) .el-menu-item .el-icon {
  color: #5a6e63;
}

/* 展开时 - 子菜单 hover 效果 */
.el-menu:not(.el-menu--collapse) .el-menu-item:hover {
  background-color: #e8eeea;
  color: #8ea195;
}
.el-menu:not(.el-menu--collapse) .el-menu-item:hover .el-icon {
  color: #8ea195;
}

/* 展开时 - 子菜单激活项样式（可选） */
.el-menu:not(.el-menu--collapse) .el-menu-item.is-active {
  background-color: #a6bdad;
  color: #ffffff;
  font-weight: bold;
}
.el-menu:not(.el-menu--collapse) .el-menu-item.is-active .el-icon {
  color: #ffffff;
}
.icon {
  position: fixed; /* 固定位置 */
  top: 18px;       /* 距离顶部30px */
  left: 150px;      /* 距离左侧20px */
  margin: 0;       /* 移除原有margin */
}
</style>