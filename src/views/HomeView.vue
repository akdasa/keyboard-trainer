<template>
  <div class="flex flex-col h-screen justify-center items-center">
    <div class="m-4 chars">
      <KeyInfo
        v-for="key in chars"
        :key="key"
        :char="key"
        :active="context.get(key)?.active ?? false"
        :progress="context.get(key)?.accuracy ?? 0"
        :focus="context.get(key)?.focus ?? false"
      />
    </div>

    <div class="w-2/3 text">
      <span
        v-for="(char, idx) in text"
        :key="idx"
        :class="{
          correct: pos > idx,
          active: pos === idx,
          error: pos === idx && isError,
        }"
      >
        {{ char }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue"
import KeyInfo from "../components/KeyInfo.vue"
import { TextGenerator, Context } from "./text"
import { chars } from "./words_en"

const pos = ref<number>(0)
const level = ref<number>(12)
const isError = ref<boolean>(false)

const context = reactive(new Context())
chars.forEach((x) => context.set(x))
chars
  .slice(0, level.value)
  .forEach((x: string) => {
    const key = context.get(x)
    if (key) { key.active = true }
  })

const text = ref<string>("")
generateText(level.value)

function generateText(level: number) {
  const generator = new TextGenerator()
  text.value = generator.generate(context)
}

window.addEventListener("keypress", function (e) {
  const input = String.fromCharCode(e.keyCode)
  const char = text.value[pos.value] as string
  const dbKey = context.get(char)

  if (input === char) {
    isError.value = false
    pos.value += 1
    dbKey?.addHit()
  } else {
    isError.value = true
    if (dbKey && dbKey.active) {
      dbKey.addHit(true)
    }
  }

  if (pos.value >= text.value.length) {
    pos.value = 0
    text.value = ""

    const keysInFocus = context.getActive().filter((x) => x.focus).length > 0

    if (!keysInFocus) {
      level.value += 1
      const nextChar = chars[level.value - 1] as string
      const dbKey2 = context.get(nextChar)
      if (dbKey2) {
        dbKey2.active = true
      }
    } else {
      console.log("key in focus")
    }

    generateText(level.value)
  }
})
</script>

<style></style>

<style scoped>
.active {
  @apply rounded;
}
</style>
