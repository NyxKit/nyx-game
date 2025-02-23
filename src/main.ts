import 'nyx-kit/style.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { NyxKit } from 'nyx-kit'

import App from './App.vue'

const app = createApp(App)

app.use(createPinia())
app.use(NyxKit)

app.mount('#app')
