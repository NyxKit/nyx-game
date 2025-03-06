import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { query, where } from 'firebase/firestore'
import { NyxCollection } from '@/types'
import Hiscore from '@/classes/Hiscore'
import { nyxDatabase } from '@/main'

const useHiscoresStore = defineStore('hiscores', () => {
  const hiscores = ref<Hiscore[]>([])

  const updateHiscores = (newVal: Hiscore|Hiscore[]) => {
    hiscores.value = Array.isArray(newVal) ? newVal : [newVal]
  }

  const subscribeHiscores = async () => {
    const collection = nyxDatabase.getCollectionRef(NyxCollection.Hiscores)
    nyxDatabase.subscribe<Hiscore>({
      key: 'hiscores',
      queryRef: query(collection).withConverter(Hiscore.Converter),
      callback: updateHiscores,
      error: (error) => {
        console.error('Error in subscription to hiscores', error)
      }
    })
  }

  const unsubscribeHiscores = async () => {
    nyxDatabase.unsubscribe('hiscores')
  }

  return { hiscores, subscribeHiscores, unsubscribeHiscores }
})

export default useHiscoresStore
