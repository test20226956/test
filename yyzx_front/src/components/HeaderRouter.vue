<script setup>
import {useRoute, useRouter} from "vue-router";
import {computed, inject, ref} from "vue";
import {Expand, Message} from "@element-plus/icons-vue";
import logo from '@/assets/hospital.svg'
import {ElMessage} from "element-plus";

const route = useRoute();
const router = useRouter();
const axios = inject('axios');
const breadcrumbs = computed(() => {
  return route.meta.breadcrumb || ['首页']
})
const isCollapse = ref(true)
const dialogVisible = ref(false) // 新增对话框显示状态
const isCo = () => {
  if (isCollapse.value == false) isCollapse.value = true;
  else isCollapse.value = false;
}
const toWelcome = () => {
  router.push('/framework/welcome')
}

const logout = () =>{
  // 清除旧会话
  sessionStorage.clear();
  router.push("/login");
}

const callList = ref([]);
const callNumber = ref(0);
const userId = ref(sessionStorage.getItem('userId'))
const getNews = () => {
  let url = 'CustomerController/listCall';
  const data = {
    userId: userId.value,
  };
  axios.get(url,{ params: data }).then(response => {
    let rb = response.data;
    if (rb.status == 200){
      callNumber.value = rb.data.total;
      callList.value = rb.data.list.map(item => {
        return {
          name: item.customer.name,
          callId: item.call.callId ,
        }
      })
    }else{
      ElMessage.error(rb.msg);
    }
  })
}
getNews();
// 点击消息图标显示对话框
const showMessages = () => {
  if(dialogVisible.value==false) dialogVisible.value = true
  else dialogVisible.value = false
}

// 处理消息点击事件
const handleMessageClick = (message) => {
  const url = `CustomerController/noCall?callId=${message}`;
  axios.post( url).then(response => {
    let rb = response.data;
    if (rb.status == 200){
      getNews();
    }else{
      ElMessage.error(rb.msg);
    }
  })
}

defineExpose({isCollapse})
</script>

<template>
  <div class="header_bar">
    <!-- 左边图标：20% -->
    <div class="left_icon">
      <img :src=logo alt="logo" @click="toWelcome"/>
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
<!--      添加一个消息查看图标显示未读消息数目-->

      <!-- 头像靠右 -->
      <div class="right_avatar">
        <div class="right_news"  @click="showMessages">
          <el-popover
              class="box-item"
              title="我的消息"
              content="Bottom Right prompts info"
              placement="bottom-end"
              :visible="dialogVisible"
              :width="200"
          >
            <template #reference>
              <el-badge :value="callNumber" class="item" :max="99" >
                <el-icon class="icon" size="25">
                  <Message/>
                </el-icon>
              </el-badge>
            </template>
            <ul class="infinite-list" style="overflow: auto">
              <li v-for="i in callList" :key="i.callId" class="infinite-list-item" @click="handleMessageClick(i.callId)">{{ i.name }}找你！</li>
            </ul>
          </el-popover>
        </div>
        <el-dropdown>
          <span class="el-dropdown-link">
            <el-avatar src="@/assets/logo.png" alt="logo"/>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="logout">退出登录</el-dropdown-item>
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
  margin-top: 20px;
  width: 100%;
  height: 100%;
  object-fit: contain;
  transform: scale(1.5);
}

.right_area {
  margin-left: 10px;
  flex: 1;
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

.right_news {
  margin-top: 5px;
  padding-right: 30px;
}

.infinite-list .infinite-list-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  /* 上边框作为分割线 */
  border-top: 1px solid #e0e0e0;
  /* 如果你之前有 margin:5px，可以考虑改成 padding 来避免间隙问题 */
  margin: 0;
  padding: 5px 0;
}
.infinite-list {
  height: 300px;
  padding: 0;
  margin: 0;
  list-style: none;
}
</style>