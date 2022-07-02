<template>
  <div class="carret">|</div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
const props = defineProps<{
  left: number
  top: number
}>()

const carretLeft = computed(() => props.left + 'px')
const carretTop = computed(() => props.top + 'px')
</script>

<style class="scoped">
.carret {
  @apply text-2xl font-mono text-yellow-400;
  position: absolute;
  left: v-bind('carretLeft');
  top: v-bind('carretTop');
  transition:left .1s linear, top .1s linear;
}
</style>
