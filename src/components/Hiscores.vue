<script setup lang="ts">
import { computed, onBeforeMount, onBeforeUnmount, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { NyxModal, NyxTable } from 'nyx-kit/components'
import { NyxSize } from 'nyx-kit/types'
import { useHiscores } from '@/compositions'
import { useInterfaceStore } from '@/stores'

const { isHiscoresVisible } = storeToRefs(useInterfaceStore())
const { hiscoresData } = useHiscores()

</script>

<template>
  <NyxModal v-model="isHiscoresVisible" :size="NyxSize.Large" customClass="view-hiscores">
    <NyxTable v-model="hiscoresData" :size="NyxSize.Small" gridTemplateColumns="1fr 1fr 10rem" header="sticky" />
  </NyxModal>
</template>

<style lang="scss">
.view-hiscores .nyx-modal__body {
  padding: 0;
}
</style>
