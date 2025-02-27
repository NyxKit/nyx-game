<script setup lang="ts">
import { NyxButton } from 'nyx-kit/components'
import { NyxSize, NyxTheme } from 'nyx-kit/types'
import useInterfaceStore from '@/stores/interface'
import IconGear from '@/components/icons/IconGear.vue'
import useGameStore from '@/stores/game'

const { toggleHiscores, toggleSettings } = useInterfaceStore()
const { togglePlaying } = useGameStore()

</script>

<template>
  <div class="main-menu">
    <section>
      <img src="@/assets/logo.svg" />
      <nav>
        <NyxButton
          class="button-play"
          :theme="NyxTheme.Primary"
          :size="NyxSize.XLarge"
          @click="togglePlaying"
        >Play</NyxButton>
        <NyxButton :size="NyxSize.Small" @click="toggleHiscores">Hiscores</NyxButton>
        <NyxButton :size="NyxSize.Small" @click="toggleSettings">Settings</NyxButton>
      </nav>
    </section>
    <footer>

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
  padding: 2rem;
}

section {
  width: 100%;
  top: 50%;
  flex-direction: column;
  gap: 5rem;
  transform: translateY(-50%);
}

nav {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

footer {
  bottom: 0;
  right: 0;
  display: flex;
  gap: 2rem;
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
  font-weight: 600;
  letter-spacing: 4px;
}


</style>
