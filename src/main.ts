import 'nyx-kit/style.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { NyxKit } from 'nyx-kit'
import App from './App.vue'
import { NyxDatabase } from './firebase' // Not ideal, but we need to setup firebase, which is handled in this file

const app = createApp(App)
  .use(createPinia())
  .use(NyxKit, { pixel: true })
  .mount('#app')

const nyxDatabase = new NyxDatabase()

export { app, nyxDatabase }
