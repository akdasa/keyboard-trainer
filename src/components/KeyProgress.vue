<template>
  <kbd
    v-for="key in keys"
    :key="key.key"
    :class="{'key':true, 'active':key.active}"
  >
    {{ key.key }}
  </kbd>
</template>

<script setup lang="ts">
import { ref } from "vue"
interface IKeyStatistics {
  key: string
  active: boolean
}
const props = defineProps<{
  keys: IKeyStatistics[]
}>()

</script>

<style scoped>
.key {
}
.active {
  @apply text-stone-100;
}
</style>
