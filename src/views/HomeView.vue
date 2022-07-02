<template>
  <div class="flex flex-col h-screen justify-center items-center ">
    <div class="m-4 opacity-50">
      <KeyInfo
        v-for="key in db"
        :key="key.key"
        :char="key.key"
        :active="key.active"
        :progress="key.progress"
      />
    </div>

    <div class="w-2/3 paragraph">
      <span
        v-for="(char, idx) in text"
        :class="{'correct': pos>idx, 'active':pos===idx, 'error': pos===idx && isError}"
      >
        {{ char }}
      </span>
    </div>

    <div class="w-2/3 mt-8">
      <div v-for="message in generatorsMessage">
        {{message}}
      </div>
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
import { TextGenerator, IGenerationContext } from "./text"

const pos = ref<int>(0)
const level = ref<int>(5)
const isError = ref<bool>(false)
const generatorsMessage = ref<string>([])

const chars = [
  "а", "о", "т", "е", "и", "н", "л", "р", "к", "у", "м",
  "в", "с", "я", "ь", "ы", "д", "й", "ю", "г", "ч", "ш",
  "х", "з", "б", "п", "ж", "щ", "ц", "ф", "ъ", "э", "ё"
]

const db = reactive(chars.reduce(function(obj, char) {
    obj[char] = new KeyData(char);
    return obj;
}, {}));
chars.slice(0, level.value).forEach(x => db[x].active = true)

// Generate a random word with a minimum of 5 characters, a maximum of 10 letters,
// and that cannot be a match to any of the input dictionaries words.
// const constraints = {
//   minLength: 3,
//   maxLength: 10,
//   allowDuplicates: true
// };

var text = ref<string>("")
generateText(level.value)

function generateText(level) {
  const context = {
    allowedChars: chars.slice(0, level),
    keyData: db
  }
  const generator = new TextGenerator()
  text.value = generator.generate(context)
  generatorsMessage.value = generator.message(context)

  // const usedChars = chars.slice(0, level)

  // if (level <= 5) {
  //   for (var w=0; w<=15; w++) {
  //     const wordLength = Math.random() * 6

  //     for (var i=0; i<=wordLength; i++) {
  //       const randomElement = usedChars[Math.floor(Math.random() * usedChars.length)];
  //       text.value += randomElement
  //     }
  //     text.value += " "
  //   }

  // } else {
  //   const filteredWords = words.filter(
  //     w => w.split('').filter(c => usedChars.indexOf(c) < 0).length === 0
  //   )
  //   const chain = new Foswig(3, filteredWords);
  //   for (var i=0; i<15; i++) {
  //     const word = chain.generate(constraints);
  //     text.value += word + " "
  //   }
  // }
}


window.addEventListener("keypress", function(e) {
  const input = String.fromCharCode(e.keyCode)
  const char = text.value[pos.value]
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
    dbKey?.addHit(true)
  }

  if (pos.value >= text.value.length) {
    level.value += 1
    pos.value = 0
    text.value = ''

    const nextChar = chars[level.value-1]
    const dbKey2 = db[nextChar]
    dbKey2.active = true

    generateText(level.value)
  }

});
</script>

<style>
body {
  @apply bg-stone-700 font-mono text-stone-400;
}

@keyframes "blink" {
  from, to {
    @apply bg-blue-600;
  }
  50% {
    @apply bg-transparent;
  }
}
</style>

<style scoped>
body {
  @apply bg-stone-700
}

.paragraph {
  @apply text-2xl font-mono text-stone-400;
}
.correct {
  @apply text-stone-100;
}
.active {
  @apply rounded;
  animation: 1s blink step-end infinite;
}

.error {
  @apply text-red-600;
}
</style>