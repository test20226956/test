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
        path:'/checkIn',
        component:CheckIn
      },{
        path:'/checkOut',
        component:CheckOut
      },{
        path:'/goOut',
        component:GoOut
      },{
        path:'/bedMap',
        component:BedMap
      },{
        path:'/bedMGMT',
        component:BedMGMT
      },{
        path:'/nursingLevel',
        component:NursingLevel
      },{
        path:'/nursingPro',
        component:NursingPro
      },{
        path:'/custNursingPro',
        component:CustNursingPro
      },{
        path:'/nursingRecord',
        component:NursingRecord
      },{
        path:'/dietCalendar',
        component:DietCalendar
      },{
        path:'/custDiet',
        component:CustDiet
      },{
        path:'/serviceCust',
        component:ServiceCust
      },{
        path:'/serviceFocus',
        component:ServiceFocus
      },{
        path:'/UserMGMT',
        component:UserMGMT
      },{
        path:'/CheckOutApply',
        component:CheckOutApply
      },{
        path:'/CustNursingRe',
        component:CustNursingRe
      },{
        path:'/DayNursing',
        component:DayNursing
      },{
        path:'/GoOutApply',
        component:GoOutApply
      },{
        path:'/Welcome',
        component:Welcome
      },
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
