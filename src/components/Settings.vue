<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { NyxCheckbox, NyxForm, NyxFormField, NyxModal, NyxSlider } from 'nyx-kit/components'
import useInterfaceStore from '@/stores/interface'
import useSettingsStore from '@/stores/settings'
import { NyxShape } from 'nyx-kit/types'

const { isFullscreen, musicVolume, sfxVolume } = storeToRefs(useSettingsStore())

</script>

<template>
  <NyxForm>
    <NyxFormField label="Music" #default="{ id }">
      <NyxSlider :for="id" v-model="musicVolume" :max="1" :min="0" :step="0.05" :shape="NyxShape.Rectangle" />
    </NyxFormField>
    <NyxFormField label="SFX" #default="{ id }">
      <NyxSlider :for="id" v-model="sfxVolume" :max="1" :min="0" :step="0.05" :shape="NyxShape.Rectangle" />
    </NyxFormField>
    <NyxFormField label="Fullscreen" #default="{ id }">
      <NyxCheckbox :for="id" v-model="isFullscreen" />
    </NyxFormField>
  </NyxForm>
</template>
