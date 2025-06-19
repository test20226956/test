import { createRouter, createWebHashHistory } from 'vue-router'
import BedMap from '../views/admin/BedMap.vue'
import BedMGMT from '../views/admin/BedMGMT.vue'
import CheckIn from "@/views/admin/CheckIn.vue";
import CheckOut from "@/views/admin/CheckOut.vue";
import CustDiet from "@/views/admin/CustDiet.vue";
import CustNursingPro from "@/views/admin/CustNursingPro.vue";
import DietCalendar from "@/views/admin/DietCalendar.vue";
import GoOut from "@/views/admin/GoOut.vue";
import NursingLevel from "@/views/admin/NursingLevel.vue";
import NursingPro from "@/views/admin/NursingPro.vue";
import NursingRecord from "@/views/admin/NursingRecord.vue";
import ServiceCust from "@/views/admin/ServiceCust.vue";
import ServiceFocus from "@/views/admin/ServiceFocus.vue";
import UserMGMT from "@/views/admin/UserMGMT.vue";
import CheckOutApply from "@/views/nursing/CheckOutApply.vue";
import CustNursingRe from "@/views/nursing/CustNursingRe.vue";
import DayNursing from "@/views/nursing/DayNursing.vue";
import GoOutApply from "@/views/nursing/GoOutApply.vue";
import Framework from "@/views/Framework.vue";
import Login from "@/views/Login.vue";
import Welcome from "@/views/Welcome.vue";

const routes = [
  // {
  //   path: '/',
  //   name: 'home',
  //   component: HomeView
  // },
  // {
  //   path: '/about',
  //   name: 'about',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import(/* webpackChunkName: "about" */ '../views/AboutView.vue')
  // }
  {
    path:'/',
    name:'Framework',
    component: Framework,
  },
  {
    path:'/login',
    component: Login
  },
  {
    path:'/framework',
    component:Framework,
    children:[
      {
        path:'/framework/checkIn',
        component:CheckIn,
        meta:{
          breadcrumb: ['首页','客户管理','入住登记']
        }
      },{
        path:'/framework/checkOut',
        component:CheckOut,
        meta:{
          breadcrumb: ['首页','客户管理','退住登记']
        }
      },{
        path:'/framework/goOut',
        component:GoOut,
        meta:{
          breadcrumb: ['首页','客户管理','外出登记']
        }
      },{
        path:'/framework/bedMap',
        component:BedMap,
        meta:{
          breadcrumb: ['首页','床位管理','床位示意图']
        }
      },{
        path:'/framework/bedMGMT',
        component:BedMGMT,
        meta:{
          breadcrumb: ['首页','床位管理','床位管理']
        }
      },{
        path:'/framework/nursingLevel',
        component:NursingLevel,
        meta:{
          breadcrumb: ['首页','护理管理','护理级别']
        }
      },{
        path:'/framework/nursingPro',
        component:NursingPro,
        meta:{
          breadcrumb: ['首页','护理管理','护理项目']
        }
      },{
        path:'/framework/custNursingPro',
        component:CustNursingPro,
        meta:{
          breadcrumb: ['首页','护理管理','客户护理设置']
        }
      },{
        path:'/framework/nursingRecord',
        component:NursingRecord,
        meta:{
          breadcrumb: ['首页','护理管理','护理记录']
        }
      },{
        path:'/framework/dietCalendar',
        component:DietCalendar,
        meta:{
          breadcrumb: ['首页','膳食管理','膳食日历']
        }
      },{
        path:'/framework/custDiet',
        component:CustDiet,
        meta:{
          breadcrumb: ['首页','膳食管理','膳食配置']
        }
      },{
        path:'/framework/serviceCust',
        component:ServiceCust,
        meta:{
          breadcrumb: ['首页','健康管家','设置服务对象']
        }
      },{
        path:'/framework/serviceFocus',
        component:ServiceFocus,
        meta:{
          breadcrumb: ['首页','健康管家','服务关注']
        }
      },{
        path:'/framework/userMGMT',
        component:UserMGMT,
        meta:{
          breadcrumb: ['首页','用户管理','基础数据维护']
        }
      },{
        path:'/framework/checkOutApply',
        component:CheckOutApply,
        meta:{
          breadcrumb: ['首页','用户管理','退住申请']
        }
      },{
        path:'/framework/goOutApply',
        component:GoOutApply,
        meta:{
          breadcrumb: ['首页','用户管理','外出申请']
        }
      },{
        path:'/framework/custNursingRe',
        component:CustNursingRe,
        meta:{
          breadcrumb: ['首页','健康管家','服务对象护理记录']
        }
      },{
        path:'/framework/dayNursing',
        component:DayNursing,
        meta:{
          breadcrumb: ['首页','健康管家','日常护理']
        }
      },{
        path:'/welcome',
        component:Welcome,
        meta:{breadcrumb:'首页'}
      },
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
