import './assets/main.css'

import {createApp} from 'vue'
import {createPinia} from 'pinia'

import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import "bootstrap/dist/css/bootstrap.css"
import axios from '@/plugins/axios.js'


const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.mount('#app')

axios.defaults.baseURL = 'http://localhost:8080'
axios.defaults.withCredentials = true
