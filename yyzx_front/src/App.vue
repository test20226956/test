<template>
  <router-view/>
</template>

<script setup>
import axios from 'axios';
import { provide } from 'vue';
import { useRouter } from 'vue-router';
// 在主组件中写baseURL就可以了
axios.defaults.baseURL = 'http://localhost:9000/'


// //请求拦截器和响应拦截器的全局设置 - 一定要写在provide函数之前
// axios.interceptors.request.use(function(config) {
//   console.log("在发送请求之前做些什么");
//   // 获得令牌
//   let token = sessionStorage.getItem("token");
//   console.log(token);
//   // 把令牌加入请求的头部报文中
//   // 把请求对象的头部报文中增加一个键，名为token
//   // 如果token存在再存 null在js里等价于false
//   if(token){
//     config.headers['token'] = token;
//   }
//
//   return config;
// }, function(error) {
//   console.log("对请求错误做些什么");
//   return Promise.reject(error);
// });
// const router = useRouter();
// // 响应拦截器
// axios.interceptors.response.use(function(response) {
//   console.log("在响应之前做些什么");
//   console.log(response);
//   console.log(response.data);
//   // 根据响应对象做出相应动作
//   // 使用三等号，先判断类型
//   if(response.data === 'invalid token'){
//     // 令牌无效 可以给出提示，也可以打开一个专门的页面给出提示和返回首页
//     router.push({
//       path:'/pageError',
//       query:{
//         tokenType:'invalid',
//       }
//     });
//   }else if(response.data == 'expired token'){
//     router.push({
//       path:'/pageError',
//       query:{
//         tokenType:'expired',
//       }
//     })
//   }
//   return response;
// }, function(error) {
//   console.log("对响应错误做些什么");
//   return Promise.reject(error);
// });



// 全局注入axios
provide('axios', axios);
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;
  width:100%;
}
body{
  height: 100%;
  width: 100%;
  /* 还有外边距 */
  margin: 0;
}
html{
  height: 100%;
  width: 100%;
}
</style>
