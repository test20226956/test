<script setup>
  import AdminRouter from "@/components/AdminRouter.vue";
  import NursingRouter from "@/components/NursingRouter.vue";
  import HeaderRouter from "@/components/HeaderRouter.vue";
  import {computed, ref} from "vue";

  const type = computed(() =>{
    //这里应该根据用户类型来进行判断
    // sessionStorage.getItem('')
    return false;
  })

  const adminRouterRef = ref(null);
  const nursingRouterRef = ref(null);
  const headerRouterRef = ref(null);

  const asideWidth = computed(() => isCollapse.value ? '64px' : '200px')

  const isCollapse = computed(() => {
    return headerRouterRef.value?.isCollapse ?? ref(true)
  })
</script>

<template>
  <el-container class="main">
    <el-header class="up">
      <header-router ref="headerRouterRef"></header-router>
    </el-header>
    <el-container class="down">
      <el-aside class="left" :width="asideWidth">
        <nursing-router ref="nursingRouterRef" v-if="type" :isCollapse="isCollapse" class="menu"></nursing-router>
        <admin-router ref="adminRouterRef" v-else :isCollapse="isCollapse" class="menu"></admin-router>

      </el-aside>
      <el-main class="right">
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>


<style scoped>
  .main{
    height: 100%;
    width: 100%;
    overflow: hidden;
  }
  .up{
    //border: 2px solid darkblue;
    display: flex;
    margin: 0 0 0 0;
    padding: 0 0 0 0;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* 阴影效果 */
    position: relative;
  }
  .down{
    //border: 2px solid darkblue;
    display: flex;
    height: 0;
  }
  .left{
    transition: width 0.3s;
    //border: 2px solid darkblue;
    overflow-x: hidden;
    overflow-y: auto;
    background-color: #e1e9e3;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    position: relative;
    height: 100%;
  }
  .right{
    width: 80%;
    height: 100%;
    //border: 2px solid darkblue;
    margin: 0 0 0 0;
    padding: 0 0 0 0;
    //overflow: hidden;
    overflow-x: hidden;
    overflow-y: auto;
  }
  .menu{
  }

</style>