<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { NyxModal, NyxTable } from 'nyx-kit/components'
import { NyxSize } from 'nyx-kit/types'
import useHiscoresStore from '@/stores/hiscores'
import useInterfaceStore from '@/stores/interface'

const { hiscores } = storeToRefs(useHiscoresStore())
const { isHiscoresVisible } = storeToRefs(useInterfaceStore())

const data = computed(() => hiscores.value
  .map((hiscore) => ({ name: hiscore.name, country: hiscore.country,score: hiscore.score }))
  .sort((a, b) => b.score - a.score))

</script>

<template>
  <NyxModal v-model="isHiscoresVisible" :size="NyxSize.Large" customClass="view-hiscores">
    <NyxTable v-model="data" :size="NyxSize.Small" gridTemplateColumns="1fr 1fr 10rem" header="sticky" />
  </NyxModal>
</template>

<style lang="scss">
.view-hiscores .nyx-modal__body {
  padding: 0;
}
</style>
