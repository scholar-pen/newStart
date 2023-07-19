import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Mqtt from '../components/Mqtt.vue'
import UserInfo from '../components/User.vue'
Vue.use(VueRouter)

const routes = [

]

const router = new VueRouter({
    routes: [{
        path: '/',
        redirect: '/login'
    },
    {
        path: '/login',
        component: Login
    },
    {
        path: '/home',
        component: Home,
        redirect: '/mqtt',
        children: [{
            path: '/mqtt',
            component: Mqtt
        },
        {
            path: '/user',
            component: UserInfo
        }
        ]
    }
    ]
})



export default router