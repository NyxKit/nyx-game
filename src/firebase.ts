import { getAnalytics } from 'firebase/analytics'
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { initializeFirestore } from 'firebase/firestore'
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
const auth = getAuth(firebaseApp)
const authProviderGoogle = new GoogleAuthProvider()

export { firestore, analytics, auth, NyxDatabase, authProviderGoogle }
