<script setup>
import { ref } from 'vue';
import {useRouter} from 'vue-router';
import {
  Document,
  Menu as IconMenu,
  Location,
  Setting,
} from '@element-plus/icons-vue'
const router = useRouter();
const isCollapse = ref(true)
const handleOpen = (key, keyPath) => {
  console.log(key, keyPath)
}
const handleClose = (key, keyPath) => {
  console.log(key, keyPath)
}
const toform = () =>{
  router.push('/menu/form');
}


const toDayNursing = () => {
  router.push("/Nursing/DayNursing");
}

const toCustNursing = () =>{
  router.push("/framework/CustNursing");
}
const toGoOutApply = () =>{
  router.push("/framework/GoOutApply")
}

const toCheckOutApply = () =>{
  router.push("/framework/CheckOutApply")
}
</script>

<template>
  <el-radio-group v-model="isCollapse" style="margin-bottom: 20px">
    <el-radio-button :value="false">expand</el-radio-button>
    <el-radio-button :value="true">collapse</el-radio-button>
  </el-radio-group>
  <el-menu
      default-active="2"
      class="el-menu-vertical-demo"
      :collapse="isCollapse"
      @open="handleOpen"
      @close="handleClose"
  >
    <el-sub-menu index="1">
      <template #title>
        <el-icon><location /></el-icon>
        <span>健康管家</span>
      </template>
        <el-menu-item index="1-1" @click="toDayNursing">日常护理</el-menu-item>
        <el-menu-item index="1-2" @click="toCustNursing">服务对象护理记录</el-menu-item>
    </el-sub-menu>
    <el-menu-item index="2">
      <template #title>
        <el-icon><icon-menu /></el-icon>
        <span>用户管理</span>
      </template>
      <el-menu-item index="2-1" @click="toGoOutApply">外出申请</el-menu-item>
      <el-menu-item index="2-2" @click="toCheckOutApply">退住申请</el-menu-item>
    </el-menu-item>
  </el-menu>
</template>

<style scoped>
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}
</style>