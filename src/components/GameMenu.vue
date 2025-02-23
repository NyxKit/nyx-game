<script setup lang="ts">
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { NyxModal } from 'nyx-kit/components'
import { useKeyboardShortcuts } from 'nyx-kit/compositions'
import { NyxSize } from 'nyx-kit/types'
import useInterfaceStore from '@/stores/interface'

const { isPlaying, isGameMenuVisible, toggleGameMenu } = storeToRefs(useInterfaceStore())

useKeyboardShortcuts({
  'ESC': (_event) => toggleGameMenu()
})

</script>

<template>
  <NyxModal v-model="isGameMenuVisible">
    Game Menu
  </NyxModal>
</template>
