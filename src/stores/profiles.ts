import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { query, where } from 'firebase/firestore'
import { NyxCollection } from '@/types'
import { nyxDatabase } from '@/main'
import Profile from '@/classes/Profile'

const useProfilesStore = defineStore('profiles', () => {
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
        console.error('Error in subscription to profiles', error)
      }
    })
  }

  const unsubscribeProfiles = async () => {
    nyxDatabase.unsubscribe('profiles')
  }

  return { profiles, subscribeProfiles, unsubscribeProfiles }
})

export default useProfilesStore
