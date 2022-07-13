<template>
  <span
    :class="{'key':active, 'focus':focus}"
  >
    {{ char }}
  </span>
</template>

<script setup lang="ts">
import { computed} from "vue"
const props = defineProps<{
  char: string,
  active: boolean,
  progress: number,
  focus: boolean
}>()

// https://www.npmjs.com/package/javascript-color-gradient
const colors = [
  "#ff1a00",
  "#ff3300",
  "#ff4d00",
  "#ff6600",
  "#ff8000",
  "#ff9900",
  "#ffb300",
  "#ffcc00",
  "#ffe600",
  "#ffff00",
  "#e6ff00",
  "#ccff00",
  "#b3ff00",
  "#99ff00",
  "#80ff00",
  "#66ff00",
  "#4dff00",
  "#33ff00",
  "#1aff00",
  "#00ff00"
]
const progressColor = computed(() => colors[Math.ceil(props.progress * 19)])
</script>

<style>
.key {
  color: v-bind('progressColor');
  animation: color 1s linear;
}
.active {
  @apply text-stone-100;
}
.focus {
  @apply underline;
}
</style>
