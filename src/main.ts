import 'nyx-kit/style.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { NyxKit } from 'nyx-kit'
import App from './App.vue'
import { initializeApp } from 'firebase/app'
import { initializeFirestore } from 'firebase/firestore'
import { getAnalytics } from 'firebase/analytics'
import NyxDatabase from './classes/NyxDatabase'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const firebaseApp = initializeApp(firebaseConfig)
const firestore = initializeFirestore(firebaseApp, { ignoreUndefinedProperties: true })
const analytics = getAnalytics(firebaseApp)

const nyxDatabase = new NyxDatabase()

const app = createApp(App)
  .use(createPinia())
  .use(NyxKit, { pixel: true })
  .mount('#app')

export { app, firestore, analytics, nyxDatabase }
