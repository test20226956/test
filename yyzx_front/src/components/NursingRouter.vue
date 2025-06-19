<script setup>
import { ref, computed } from 'vue';
import {useRouter} from 'vue-router';
import {
  Document,
  Menu as IconMenu,
  Expand,
  FirstAidKit,
  User,
} from '@element-plus/icons-vue'
const router = useRouter();
const handleOpen = (key, keyPath) => {
  console.log(key, keyPath)
}
const handleClose = (key, keyPath) => {
  console.log(key, keyPath)
}

const toDayNursing = () => {
  router.push("/framework/dayNursing");
}

const toCustNursing = () =>{
  router.push("/framework/custNursingRe");
}
const toGoOutApply = () =>{
  router.push("/framework/goOutApply");
}

const toCheckOutApply = () =>{
  router.push("/framework/checkOutApply");
}
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
  <el-menu
      default-active="2"
      class="el-menu-vertical-demo"
      :collapse="isCollapse"
      @open="handleOpen"
      @close="handleClose"
      :style="{width: isCollapse.value ? '64px' : '200px'}"
      :popper-offset="isCollapse.value ? 0 : -136"
  >
    <el-sub-menu index="1">
      <template #title>
        <el-icon><FirstAidKit/></el-icon>
        <span>健康管家</span>
      </template>
      <el-menu-item index="1-1" @click="toDayNursing">日常护理</el-menu-item>
      <el-menu-item index="1-2" @click="toCustNursing">服务对象护理记录</el-menu-item>
    </el-sub-menu>
    <el-sub-menu index="2">
      <template #title>
        <el-icon><User/></el-icon>
        <span>用户管理</span>
      </template>
      <el-menu-item index="2-1" @click="toGoOutApply">外出申请</el-menu-item>
      <el-menu-item index="2-2" @click="toCheckOutApply">退住申请</el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>

<style scoped>
.el-menu-vertical-demo:not(.el-menu--collapse) {
  //width: 200px;
  min-height: 400px;
}
.el-menu-vertical-demo{
  background-color: #e1e9e3;
}
:deep(.el-menu-item){
  background-color: #f0f4f1;
  transition: background-color 0.3s;
}
:deep(.el-menu-item:hover){
  background-color: #e8eeea; /* 想要的背景色 */
  transition: background-color 0.3s;
}
:deep(.el-menu-item.is-active) {
  color: #9db7a5;
  font-weight: bold;         /* 可选：让激活项加粗 */
}
:deep(.el-sub-menu__title:hover) {
  background-color: #a5bdac !important;
  color: white; /* 可选：改变文字颜色 */
}
.icon {
  position: fixed; /* 固定位置 */
  top: 18px;       /* 距离顶部30px */
  left: 150px;      /* 距离左侧20px */
  margin: 0;       /* 移除原有margin */
}
</style>


