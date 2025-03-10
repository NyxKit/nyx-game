<script setup lang="ts">
import { computed, ref } from 'vue'
import { NyxButton, NyxModal, NyxTable, NyxTableCell } from 'nyx-kit/components'
import { NyxSize, NyxVariant } from 'nyx-kit/types'
import attributions from '@/data/attributions.json'

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
    <NyxModal
      v-model="isCreditsModalVisible"
      title="Credits"
      :size="NyxSize.Large"
    >
      <p>
        Special thanks to our esteemed testers, Jeroen Vanlessen and Tibo Swinnen, who bravely subjected themselves to
        the countless bugs, crashes, and questionable design choices that this game had to offer. Their patience,
        resilience, and willingness to repeatedly drift into asteroid swarms, miscalculate beam shots, and accidentally
        turn the entire screen into a blinding explosion of space debris have been invaluable.
      </p>
      <p>Without them, this game would still be a flaming mess. With them, it is now a slightly less flaming mess.</p>
      <p>May their keyboards rest in peace. 🫡</p>
      <NyxTable
        v-if="false"
        class="credits__table"
        v-model="attributions"
        :size="NyxSize.Small"
        :columnTitles="['Asset', 'Author', 'License']"
        :gridTemplateColumns="'50% 25% 25%'"
      >
        <template #default="{ item }">
          <NyxTableCell><a :href="item.assetUrl" target="_blank">{{ item.assetName }}</a></NyxTableCell>
          <NyxTableCell><a :href="item.authorUrl" target="_blank">{{ item.authorName }}</a></NyxTableCell>
          <NyxTableCell><a :href="item.licenseUrl" target="_blank">{{ item.licenseName }}</a></NyxTableCell>
        </template>
      </NyxTable>
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

    &__table {
      margin-top: 2rem;
      font-size: 0.75em;
    }

    p {
      font-size: 0.75em;
    }
  }
</style>
