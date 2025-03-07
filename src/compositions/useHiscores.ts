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
      return { name: profile?.fullName, version: hiscore.version, score: hiscore.score }
    }).sort((a, b) => b.score - a.score)
  })

  onBeforeMount(() => {
    profilesStore.subscribeProfiles()
    hiscoresStore.subscribeHiscores()
  })

  onBeforeUnmount(() => {
    hiscoresStore.unsubscribeHiscores()
    profilesStore.unsubscribeProfiles()
  })

  return { hiscoresData }
}

export default useHiscores
