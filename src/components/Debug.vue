<script setup lang="ts">
import useGameStore from '@/stores/game'
import { storeToRefs } from 'pinia'
import { NyxButton, NyxCard, NyxForm, NyxFormField, NyxInput, NyxSelect, NyxCheckbox, NyxModal } from 'nyx-kit/components'
import { NyxPosition, NyxSize, NyxTheme, NyxInputType } from 'nyx-kit/types'
import { useTeleportPosition } from 'nyx-kit/compositions'
import { computed, ref, toRaw, useTemplateRef, type DefineComponent, onMounted, onUnmounted, watch } from 'vue'
import { GameState } from '@/types'
import type { GameScene } from '@/scenes'
import config from '@/config'

const gameStore = useGameStore()
const { debug, playerPosition, hp, score, state, energy, currentScene } = storeToRefs(gameStore)
const { setPlayerHp, setPlayerEnergy } = gameStore

const nyxButton = useTemplateRef<DefineComponent>('nyxButton')
const nyxCard = useTemplateRef<DefineComponent>('nyxCard')

const isConfigModalVisible = ref(false)
const isDebugPanelVisible = ref(false)

const { cssVariables } = useTeleportPosition(nyxButton, nyxCard, {
  gap: ref(NyxSize.XLarge),
  position: ref(NyxPosition.TopLeft),
  offsetX: -5,
  offsetY: -10
})

const toggleDebug = (value?: boolean) => {
  isConfigModalVisible.value = false
  isDebugPanelVisible.value = value === undefined ? !isDebugPanelVisible.value : value
  nyxButton.value?.$el?.blur()
}

const computedScore = computed({
  get: () => score.value.toString(),
  set: (value: string) => score.value = parseInt(value)
})

const computedHp = computed({
  get: () => hp.value.toString(),
  set: (value: string) => setPlayerHp(parseInt(value))
})

const computedEnergy = computed({
  get: () => energy.value.toString(),
  set: (value: string) => setPlayerEnergy(parseInt(value))
})

const pos = computed(() => ({
  x: parseFloat(playerPosition.value.x.toFixed(2)),
  y: parseFloat(playerPosition.value.y.toFixed(2))
}))

const gameStateOptions = computed(() => Object.values(GameState).map((state) => ({ label: state, value: state })))

const addAsteroid = () => {
  const scene = toRaw(currentScene.value) as GameScene
  if (!scene) return
  scene.spawnAsteroid()
}

const disableDebug = () => {
  debug.value.isEnabled = false
}

watch(state, () => isConfigModalVisible.value = false)

</script>

<template>
  <div class="debug">
    <NyxButton
      ref="nyxButton"
      class="debug__button"
      :theme="NyxTheme.Danger"
      :size="NyxSize.Small"
      tabindex="-1"
      @click="toggleDebug"
    >Debog</NyxButton>
    <NyxModal v-model="isConfigModalVisible" title="Config">
      <pre>{{ config }}</pre>
    </NyxModal>
    <Teleport to="body">
      <NyxCard
        class="debug__card"
        :class="{ 'debug__card--visible': isDebugPanelVisible }"
        :size="NyxSize.Large"
        :style="cssVariables"
        ref="nyxCard"
      >
        <NyxForm class="debug__card-content">
          <span class="debug__card-position"><pre>x: {{ pos.x }}</pre><pre>y: {{ pos.y }}</pre></span>
          <NyxFormField label="HP" #default="{ id }">
            <NyxInput class="debug__card-input" :id="id" v-model="computedHp" :type="NyxInputType.Number" :max="100" />
          </NyxFormField>
          <NyxFormField label="Energy" #default="{ id }">
            <NyxInput class="debug__card-input" :id="id" v-model="computedEnergy" :type="NyxInputType.Number" />
          </NyxFormField>
          <NyxFormField label="Score" #default="{ id }">
            <NyxInput class="debug__card-input" :id="id" v-model="computedScore" :type="NyxInputType.Number" />
          </NyxFormField>
          <NyxFormField label="State" #default="{ id }" v-if="false">
            <NyxSelect :id="id" v-model="state" :options="gameStateOptions" />
          </NyxFormField>
          <NyxFormField #default="{ id }">
            <NyxCheckbox :id="id" v-model="debug.isImmortal" label="Immortality" />
          </NyxFormField>
          <NyxFormField #default="{ id }">
            <NyxCheckbox :id="id" v-model="debug.hasInfiniteEnergy" label="Infinite Energy" />
          </NyxFormField>
          <NyxFormField #default="{ id }">
            <NyxCheckbox :id="id" v-model="debug.hasInfiniteStamina" label="Infinite Stamina" />
          </NyxFormField>
          <NyxFormField #default="{ id }">
            <NyxCheckbox :id="id" v-model="debug.isCollisionDisabled" label="Disable Collision" />
          </NyxFormField>
          <NyxButton class="debug__card-button" @click="addAsteroid">Spawn Asteroid</NyxButton>
          <NyxButton class="debug__card-button" @click="isConfigModalVisible = true">View config</NyxButton>
          <NyxButton class="debug__card-button" @click="disableDebug">Disable debug</NyxButton>
        </NyxForm>
      </NyxCard>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
  .debug {
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 100;
    padding: var(--nyx-pad-lg);

    &__button {
      width: 7.5rem;
    }
  }

  .debug__card {
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease-in-out;
    position: fixed;
    top: var(--top, 0);
    left: var(--left, 0);
    z-index: 200;
    padding-top: 2rem;

    &--visible {
      opacity: 1;
      pointer-events: auto;
    }

    &-content {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      padding: 0;
    }

    &-button {
      margin: 0.5rem 0;
    }

    &-input {
      text-align: right;
    }

    &-position {
      display: flex;
      gap: 0.5rem;
      font-size: 12px;
      background-color: var(--nyx-c-bg);
      padding: 1rem;
      border-radius: 0.5rem;

      pre {
        flex: 1;
      }
    }

    &-connection {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: var(--nyx-c-bg);
      padding: 1rem;
      border-radius: 0.5rem;
      font-size: 12px;
    }
  }
</style>
