<script setup lang="ts">
import { ref } from 'vue'
import { NyxButton, NyxModal } from 'nyx-kit/components'
import { NyxSize, NyxVariant } from 'nyx-kit/types'

const isCreditsModalVisible = ref(false)
const toggleCredits = () => isCreditsModalVisible.value = !isCreditsModalVisible.value

</script>

<template>
  <div class="credits">
    <NyxButton
      ref="nyxButton"
      class="debug__button"
      :size="NyxSize.Small"
      :variant="NyxVariant.Outline"
      tabindex="-1"
      @click="toggleCredits"
    >Credits</NyxButton>
    <NyxModal v-model="isCreditsModalVisible" title="Credits">
      <p>
        Special thanks to our esteemed testers, Jeroen Vanlessen and Tibo Swinnen, who bravely subjected themselves to
        the countless bugs, crashes, and questionable design choices that this game had to offer. Their patience,
        resilience, and willingness to repeatedly drift into asteroid swarms, miscalculate beam shots, and accidentally
        turn the entire screen into a blinding explosion of space debris have been invaluable.
      </p>
      <p>Without them, this game would still be a flaming mess. With them, it is now a slightly less flaming mess.</p>
      <p>May their keyboards rest in peace. 🫡</p>
    </NyxModal>
  </div>
</template>

<style lang="scss" scoped>
  .credits {
    position: fixed;
    left: 50%;
    bottom: 0;
    transform: translate(-50%, 0);
    z-index: 100;
    padding: var(--nyx-pad-lg);

    &__button {
      width: 7.5rem;
    }
  }
</style>
