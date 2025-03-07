import { ref, computed } from 'vue'
import { defineStore, storeToRefs } from 'pinia'
import { query, where } from 'firebase/firestore'
import { NyxCollection } from '@/types'
import { nyxDatabase } from '@/main'
import Profile from '@/classes/Profile'
import useAuthStore from '@/stores/auth'

const useProfilesStore = defineStore('profiles', () => {
  const { user } = storeToRefs(useAuthStore())
  const profiles = ref<Profile[]>([])

  const updateProfiles = (newVal: Profile|Profile[]) => {
    profiles.value = Array.isArray(newVal) ? newVal : [newVal]
  }

  const subscribeProfiles = async () => {
    const collection = nyxDatabase.getCollectionRef(NyxCollection.Profiles)
    nyxDatabase.subscribe<Profile>({
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

  const addNewProfile = async (profile: Profile) => {
    await nyxDatabase.addDocument(NyxCollection.Profiles, profile, Profile.Converter)
  }

  const updateProfile = async (profile: Profile) => {
    await nyxDatabase.setDocument(NyxCollection.Profiles, profile.id, profile, Profile.Converter)
  }

  return { profiles, addNewProfile, updateProfile, subscribeProfiles, unsubscribeProfiles }
})

export default useProfilesStore
