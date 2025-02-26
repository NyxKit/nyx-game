<script setup lang="ts">

</script>

<template>
  <main class="game"></main>
</template>

<style lang="scss" scoped>
main {
  width: 100%;
  height: 100%;
  position: relative;

  &::after {
    content: '';
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: -1;
    opacity: 0.05;
    background-image:
      linear-gradient(45deg, #b0b0b0 25%, transparent 25%),
      linear-gradient(-45deg, #b0b0b0 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #b0b0b0 75%),
      linear-gradient(-45deg, transparent 75%, #b0b0b0 75%);
    background-size: 2rem 2rem;
    background-position: 0 0, 0 1rem, 1rem -1rem, -1rem 0px;
  }
}
</style>
