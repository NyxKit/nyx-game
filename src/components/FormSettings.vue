<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { NyxCheckbox, NyxForm, NyxFormField, NyxSlider } from 'nyx-kit/components'
import useSettingsStore from '@/stores/settings'
import { NyxShape } from 'nyx-kit/types'
import { watch } from 'vue'

const { isFullscreen, currentVolume } = storeToRefs(useSettingsStore())

watch(isFullscreen, async (newVal) => {
  if (newVal) {
    await document.documentElement.requestFullscreen()
  } else {
    await document.exitFullscreen()
  }
})

</script>

<template>
  <NyxForm>
    <NyxFormField label="Volume" #default="{ id }">
      <NyxSlider :for="id" v-model="currentVolume" :max="1" :min="0" :step="0.05" :shape="NyxShape.Rectangle" />
    </NyxFormField>
    <NyxFormField label="Fullscreen" #default="{ id }">
      <NyxCheckbox :for="id" v-model="isFullscreen" />
    </NyxFormField>
  </NyxForm>
</template>
