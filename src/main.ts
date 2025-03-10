import 'nyx-kit/style.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { NyxKit } from 'nyx-kit'
import App from './App.vue'
import NyxDatabase from './classes/NyxDatabase'

const nyxDatabase = new NyxDatabase()

const app = createApp(App)
  .use(createPinia())
  .use(NyxKit, { pixel: true })
  .mount('#app')

export { app, nyxDatabase }
