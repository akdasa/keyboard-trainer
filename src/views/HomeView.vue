<template>
  <div class="flex flex-col h-screen justify-center items-center ">
    <div class="m-4 chars">
      <KeyInfo
        v-for="key in db"
        :key="key.key"
        :char="key.key"
        :active="key.active"
        :progress="key.accuracy"
        :focus="key.focus"
      />
    </div>

    <div class="w-2/3 text">
      <span
        v-for="(char, idx) in text"
        :class="{'correct': pos>idx, 'active':pos===idx, 'error': pos===idx && isError}"
      >
        {{ char }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
// import Carret from "../components/Carret.vue"
// const carretLeft = ref<number>(0)
// const carretTop = ref<number>(0)
// import KeyProgress from "../components/KeyProgress.vue"

import { ref, computed, reactive } from "vue"
import KeyInfo from "../components/KeyInfo.vue"
import { KeyData } from "./statistics"
import { TextGenerator } from "./text"
import { chars } from "./words_en"

const pos = ref<number>(0)
const level = ref<number>(2)
const isError = ref<boolean>(false)

type t = { [key: string]: KeyData }

const db = reactive(chars.reduce(function(obj, char: string) {
    obj[char] = new KeyData(char);
    return obj;
}, {} as t)) as t;
chars.slice(0, level.value).forEach((x:string) => db[x].active = true)

var text = ref<string>("")
generateText(level.value)

function generateText(level: number) {
  const context = {
    allowedChars: chars.slice(0, level),
    keyData: db
  }
  const generator = new TextGenerator()
  text.value = generator.generate(context)
}


window.addEventListener("keypress", function(e) {
  const input = String.fromCharCode(e.keyCode)
  const char = text.value[pos.value] as string
  const dbKey = db[char]

  if (input === char) {
    isError.value = false
    pos.value += 1
    dbKey?.addHit()
    // var elements = document.getElementsByClassName('active')[0]
    // const left = elements.getBoundingClientRect().left
    // const top = elements.getBoundingClientRect().top
    // carretLeft.value = left
    // carretTop.value = top
  } else {
    isError.value = true
    if (dbKey && dbKey.active) {
      dbKey.addHit(true)
    }
  }

  if (pos.value >= text.value.length) {
    pos.value = 0
    text.value = ''

    const keysInFocus = Object.values(db).filter((x:KeyData) => x.focus).length;

    if (!keysInFocus) {
      level.value += 1
      const nextChar = chars[level.value-1] as string
      const dbKey2 = db[nextChar] as KeyData
      dbKey2.active = true
    } else {
      console.log("key in focus")
    }

    generateText(level.value)
  }

});
</script>

<style>

</style>

<style scoped>
.active {
  @apply rounded;
}


</style>