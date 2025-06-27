<script setup>
import pic1 from '@/assets/4.png'
import pic2 from '@/assets/5.png'
import pic3 from '@/assets/6.png'
const getSrc = (item) =>{
  switch(item){
    case 1: {
      return pic1
    }
    case 2:{
      return pic2
    }
    case 3:{
      return pic3
    }
  }
}
</script>

<template>
  <div class="up">
    <h1 style="text-align: left">颐养中心系统</h1>
  </div>
  <div class="middle">
    <el-carousel :interval="5000" arrow="always" style="width: 70%;" height="500px">
      <el-carousel-item v-for="item in 3" :key="item" style="height: 500px;">
        <img :src="getSrc(item)" class="carousel-img">
      </el-carousel-item>
    </el-carousel>
  </div>
  <div class="down">
    联系我们：1234567890
    <br />
    邮箱：zytd@notanemial.com
  </div>

</template>

<style scoped>
.up{
  padding: 16px 16px 0 16px;
  height: 10vh;
  background-color: white;
  display: flex;
  flex-direction: column;
  color: #a6bdad;
  justify-content: center;
}
.middle{
  height: 225px;
  height: 450px;
  background-color:  #f2f2f2;
  justify-content: center;
  display: flex;
}
.up h1 {
  font-size: 2.1rem; /* 或 2.5rem / 40px 等 */

  font-weight: bold;
}

.down {
  background-color: white;
  display: flex;
  justify-content: center;    /* 水平居中 */
  align-items: flex-end;      /* 让内容靠底部 */
  height: 15vh;
  color: #6d7e72;

}

.carousel-img {
  width: 100%;
  height: 100%;
  object-fit: contain
}


</style>