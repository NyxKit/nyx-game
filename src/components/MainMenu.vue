<script setup lang="ts">
import { NyxButton } from 'nyx-kit/components'
import { NyxSize, NyxTheme } from 'nyx-kit/types'
import useInterfaceStore from '@/stores/interface'
import IconGear from '@/components/icons/IconGear.vue'

const { togglePlaying, toggleHiscores, toggleSettings } = useInterfaceStore()

</script>

<template>
  <div class="main-menu">
    <section>
      <img src="@/assets/logo.svg" />
      <NyxButton
        class="button-play"
        :theme="NyxTheme.Primary"
        :size="NyxSize.XLarge"
        @click="togglePlaying"
      >Play</NyxButton>
    </section>
    <footer>
      <NyxButton :theme="NyxTheme.Secondary" @click="toggleHiscores">Hiscores</NyxButton>
      <NyxButton @click="toggleSettings"><IconGear class="icon-gear" /></NyxButton>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
.main-menu {
  display: flex;
  flex-direction: column;
}

section,
footer {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  padding: 1rem;
}

section {
  width: 100%;
  top: 50%;
  flex-direction: column;
  gap: 5rem;
  transform: translateY(-75%);
}

footer {
  bottom: 0;
  right: 0;
  display: flex;
  gap: 1rem;
}

h1 {
  font-size: 2rem;
}

img {
  max-height: 10rem;
}

.icon-gear {
  height: 0.9em;
  fill: var(--nyx-c-text-1);
}

.button-play {
  font-size: 1.5rem;
  font-weight: 600;
  letter-spacing: 3px;
  text-transform: uppercase;
}


</style>
