import Profile from '@/classes/Profile'
import { nyxDatabase } from '@/main'
import { NyxCollection } from '@/types'
import { signOut, type User, onAuthStateChanged } from 'firebase/auth'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

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
      isSuperUser: !!profile?.isSuperUser,
      createdAt: profile ? profile.createdAt : new Date(),
      updatedAt: profile ? profile.updatedAt : new Date()
    })
    await nyxDatabase.setDocument(NyxCollection.Profiles, user.value.uid, newProfile, Profile.Converter)
  }

  const loginWithGoogle = async () => {
    try {
      const result = await nyxDatabase.signIn()
      user.value = result.user
      await onLogin()
    } catch (error) {
      console.error(error)
    }
  }

  const logout = async () => {
    await signOut(nyxDatabase.auth)
    user.value = null
  }

  const watchAuthState = (callback?: (user: User|null) => void) => {
    onAuthStateChanged(nyxDatabase.auth, (firebaseUser) => {
      user.value = firebaseUser ?? null
      callback?.(user.value)
    })
  }

  return { user, isLoggedIn, loginWithGoogle, logout, watchAuthState }
})
