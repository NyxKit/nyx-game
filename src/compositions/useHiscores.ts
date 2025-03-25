import { useHiscoresStore } from '@/stores'
import useProfilesStore from '@/stores/profiles'
import { storeToRefs } from 'pinia'
import { computed, onBeforeMount, onBeforeUnmount } from 'vue'

const useHiscores = () => {
  const hiscoresStore = useHiscoresStore()
  const profilesStore = useProfilesStore()
  const { hiscores } = storeToRefs(hiscoresStore)
  const { profiles } = storeToRefs(profilesStore)

  const hiscoresData = computed(() => {
    return hiscores.value.map((hiscore) => {
      const profile = profiles.value.find((profile) => profile.id === hiscore.userId)
      return { name: profile?.fullName, score: hiscore.score, version: hiscore.version }
    }).sort((a, b) => b.score - a.score)
  })

  onBeforeMount(async () => {
    await profilesStore.subscribeProfiles()
    await hiscoresStore.subscribeHiscores()
  })

  onBeforeUnmount(async () => {
    await hiscoresStore.unsubscribeHiscores()
    await profilesStore.unsubscribeProfiles()
  })

  return { hiscoresData }
}

export default useHiscores
