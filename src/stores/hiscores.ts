import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { addDoc, query, where } from 'firebase/firestore'
import { GameMode, NyxCollection } from '@/types'
import Hiscore from '@/classes/Hiscore'
import { nyxDatabase } from '@/main'

const useHiscoresStore = defineStore('hiscores', () => {
  const hiscores = ref<Hiscore[]>([])
  const hasDebugged = ref(false)

  const updateHiscores = (newVal: Hiscore|Hiscore[]) => {
    hiscores.value = Array.isArray(newVal) ? newVal : [newVal]
  }

  const subscribeHiscores = async () => {
    const collection = nyxDatabase.getCollectionRef(NyxCollection.Hiscores)
    const queryWhere = where('hasDebugged', '==', false)
    nyxDatabase.subscribe<Hiscore>({
      key: 'hiscores',
      queryRef: query(collection, queryWhere).withConverter(Hiscore.Converter),
      callback: updateHiscores,
      error: (error) => {
        console.error('Error in subscription to hiscores.', error)
      }
    })
  }

  const unsubscribeHiscores = async () => {
    nyxDatabase.unsubscribe('hiscores')
  }

  const addNewHiscore = async (userId: string, score: number) => {
    const hiscore = new Hiscore({ score, userId, hasDebugged: hasDebugged.value })
    const hiscoreId = await nyxDatabase.addDocument(NyxCollection.Hiscores, hiscore, Hiscore.Converter)
    hasDebugged.value = false
    hiscore.id = hiscoreId
    return hiscore
  }

  return { hiscores, hasDebugged, addNewHiscore, subscribeHiscores, unsubscribeHiscores }
})

export default useHiscoresStore
