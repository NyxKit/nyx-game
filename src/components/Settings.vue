<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { NyxModal } from 'nyx-kit/components'
import { NyxSize } from 'nyx-kit/types'
import useInterfaceStore from '@/stores/interface'

const { isSettingsVisible } = storeToRefs(useInterfaceStore())

</script>

<template>
  <NyxModal v-model="isSettingsVisible">
    Settings
  </NyxModal>
</template>
