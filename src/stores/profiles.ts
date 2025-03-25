import { ref, watch } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { query } from 'firebase/firestore'
import { NyxCollection } from '@/types'
import { nyxDatabase } from '@/main'
import Profile from '@/classes/Profile'
import useAuthStore from '@/stores/auth'

const useProfilesStore = defineStore('profiles', () => {
  const { user } = storeToRefs(useAuthStore())
  const profiles = ref<Profile[]>([])
  const profile = ref<Profile|null>(null)

  const updateProfiles = (newVal: Profile|Profile[]) => {
    profiles.value = Array.isArray(newVal) ? newVal : [newVal]
  }

  const setProfile = (newVal: Profile|Profile[]) => {
    profile.value = Array.isArray(newVal) ? newVal[0] : newVal
  }

  const subscribeProfile = async (userId: string) => {
    await nyxDatabase.subscribe<Profile>({
      key: 'profile',
      docRef: nyxDatabase.getDocRef(NyxCollection.Profiles, userId, Profile.Converter),
      callback: setProfile,
      error: (error) => {
        console.error('Error in subscription to profile.', error)
      }
    })
  }

  const unsubscribeProfile = async () => {
    nyxDatabase.unsubscribe('profile', () => profile.value = null)
  }

  const subscribeProfiles = async () => {
    const collection = nyxDatabase.getCollectionRef(NyxCollection.Profiles)
    await nyxDatabase.subscribe<Profile>({
      key: 'profiles',
      queryRef: query(collection).withConverter(Profile.Converter),
      callback: updateProfiles,
      error: (error) => {
        console.error('Error in subscription to profiles.', error)
      }
    })
  }

  const unsubscribeProfiles = async () => {
    nyxDatabase.unsubscribe('profiles')
  }

  const updateProfile = async (profile: Profile) => {
    await nyxDatabase.setDocument(NyxCollection.Profiles, profile.id, profile, Profile.Converter)
  }

  const updateLastLogin = async () => {
    if (!profile.value) return
    profile.value.lastLoginAt = new Date()
    await updateProfile(profile.value)
  }

  watch(user, async (newVal, oldVal) => {
    if (newVal && newVal.uid !== oldVal?.uid) {
      await subscribeProfile(newVal.uid)
    } else {
      await unsubscribeProfile()
    }
  })

  watch(profile, async (newVal, oldVal) => {
    if (!newVal || !!oldVal) return
    await updateLastLogin()
  })

  return {
    profile,
    profiles,
    updateLastLogin,
    updateProfile,
    subscribeProfile,
    unsubscribeProfile,
    subscribeProfiles,
    unsubscribeProfiles
  }
})

export default useProfilesStore
