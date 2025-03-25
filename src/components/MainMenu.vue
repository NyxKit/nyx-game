<script setup lang="ts">
import { NyxButton, NyxAvatar } from 'nyx-kit/components'
import { NyxSize, NyxTheme, type HexCode } from 'nyx-kit/types'
import useInterfaceStore from '@/stores/interface'
import useGameStore from '@/stores/game'
import useProfilesStore from '@/stores/profiles'
import { GameState } from '@/types'
import useAuthStore from '@/stores/auth'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { profile } = storeToRefs(useProfilesStore())
const { toggleHiscores, toggleSettings } = useInterfaceStore()
const { setGameState } = useGameStore()
const { loginWithGoogle, logout } = authStore
const { isLoggedIn } = storeToRefs(authStore)

//@ts-expect-error: TODO: Fix this
const avatarColor: HexCode = '#71657A'

const params = new URLSearchParams(document.location.search)
const isDebugUrl = import.meta.env.DEV && !!params.get('debug')

</script>

<template>
  <div class="main-menu">
    <header v-if="profile">
      <NyxAvatar
        :src="profile.photoUrl ?? undefined"
        :name="profile.displayName ?? undefined"
        :size="NyxSize.Small"
        :color="avatarColor"
      />
    </header>
    <section>
      <img src="@/assets/logo.png" />
      <nav v-if="isLoggedIn || isDebugUrl">
        <NyxButton
          class="button-play"
          :theme="NyxTheme.Primary"
          :size="NyxSize.XLarge"
          @click="setGameState(GameState.Playing)"
        >Play</NyxButton>
        <NyxButton :size="NyxSize.Small" @click="toggleHiscores">Hiscores</NyxButton>
        <NyxButton :size="NyxSize.Small" @click="toggleSettings">Settings</NyxButton>
        <NyxButton :size="NyxSize.Small" @click="logout">Logout</NyxButton>
      </nav>
      <nav v-else>
        <NyxButton :size="NyxSize.XLarge" @click="loginWithGoogle">Login</NyxButton>
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

header {
  position: fixed;
  top: 0;
  right: 0;
  padding: 2rem;
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
  top: 1rem;
  flex-direction: column;
  // transform: translateY(-50%);
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
  max-width: 30rem;
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
