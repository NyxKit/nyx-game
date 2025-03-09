import Profile from '@/classes/Profile'
import { auth, authProviderGoogle } from '@/firebase'
import { nyxDatabase } from '@/main'
import { NyxCollection } from '@/types'
import { signInWithPopup, signOut, type User, onAuthStateChanged } from 'firebase/auth'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import useProfilesStore from './profiles'

export default defineStore('auth', () => {
  const user = ref<User|null>(null)
  const isLoggedIn = computed(() => user.value !== null)

  const onLogin = async () => {
    if (!user.value) throw new Error('User not logged in.')
    const profile = await nyxDatabase.getDocument(NyxCollection.Profiles, user.value.uid, Profile.Converter, true)
    const newProfile = new Profile({
      id: user.value.uid,
      displayName: user.value.displayName,
      email: user.value.email,
      phoneNumber: user.value.phoneNumber,
      photoUrl: user.value.photoURL,
      createdAt: profile ? profile.createdAt : new Date(),
      updatedAt: profile ? profile.updatedAt : new Date()
    })
    nyxDatabase.setDocument(NyxCollection.Profiles, user.value.uid, newProfile, Profile.Converter)
  }

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, authProviderGoogle)
      user.value = result.user
      await onLogin()
    } catch (error) {
      console.error(error)
    }
  }

  const logout = async () => {
    await signOut(auth)
    user.value = null
  }

  const watchAuthState = () => {
    onAuthStateChanged(auth, (firebaseUser) => {
      user.value = firebaseUser ?? null
    })
  }

  return { user, isLoggedIn, loginWithGoogle, logout, watchAuthState }
})
