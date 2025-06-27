<script setup>
import {useRoute} from "vue-router";
import {computed, ref} from "vue";
import {Expand} from "@element-plus/icons-vue";

const route = useRoute();
const breadcrumbs =  computed(()=>{
  return route.meta.breadcrumb || ['首页']
})
const isCollapse = ref(true)
const isCo = () => {
  if (isCollapse.value == false) isCollapse.value = true;
  else isCollapse.value = false;
}

defineExpose({isCollapse})
</script>

<template>
  <div class="header_bar">
    <!-- 左边图标：20% -->
    <div class="left_icon">
      <img src="@/assets/logo.png" alt="logo" />
    </div>

    <!-- 右边区域：80% -->
    <div class="right_area">
      <!-- 面包屑靠左 -->
      <div class="breadcrumb_area">
        <el-icon @click="isCo" class="icon" size="25">
          <Expand/>
        </el-icon>

        <el-breadcrumb separator="/" class="center_breadcrumb">
          <el-breadcrumb-item
              v-for="(crumb, index) in breadcrumbs"
              :key="index"
          >
            {{ crumb }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <!-- 头像靠右 -->
      <div class="right_avatar">
        <el-dropdown>
          <span class="el-dropdown-link">
            <el-avatar src="@/assets/logo.png" alt="logo"/>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>个人中心</el-dropdown-item>
              <el-dropdown-item>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<style scoped>
.header_bar {
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #9db7a5;
}

.left_icon {
  width: 200px;
}

.left_icon img {
  height: 40px;
}

.right_area {
  flex:1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.breadcrumb_area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.center_breadcrumb {
  display: flex;
  align-items: center;
}

.right_avatar {
  display: flex;
  align-items: center;
  padding-right: 20px;
}
</style>