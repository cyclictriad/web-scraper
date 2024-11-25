<template>
  <div class="flex items-center justify-center max-h-min bg-gray-900">
    <div class="text-center">
      <h1 class="text-5xl font-bold text-green-300 min-h-[135px]">
        <span class="inline-block overflow-hidden">
          <img v-if="currentPhraseIndex===5" src="/icons/Data.gif" alt=""  class="inline-block"/>
          <img v-if="currentPhraseIndex===4" src="/icons/Cloud.gif" alt="" class="inline-block" />
          <img v-if="currentPhraseIndex===2" src="/icons/Chart.gif" alt="" class="inline-block"/>
          <img v-if="currentPhraseIndex===3" src="/icons/Scan.gif" alt="" class="inline-block"/>
          <img v-if="currentPhraseIndex===1" src="/icons/Doc.gif" alt="" class="inline-block"/>

          <span
            class="animate-typing"
            v-for="(char, index) in displayText"
            :key="index"
            :style="{ animationDelay: `${index * 100}ms` }"
          >
            {{ char }}
          </span>
          <img src="/icons/spider.gif" v-if="currentPhraseIndex===0" alt="" class="inline-block rotate-90" />
        </span>
      </h1>
    </div>
  </div>
</template>
  
  <script setup>
import { ref, onMounted } from "vue";

const phrases = [
  "Crawl Pages",
  "Process Documents",
  "Present Data",
  "Scanning Data",
  "Cloud Contents",
  "Analyze Data",
];

const displayText = ref("");
const currentPhraseIndex = ref(0);

const animateText = () => {
  const typePhrase = () => {
    const currentPhrase = phrases[currentPhraseIndex.value];
    let charIndex = 0;

    const typeChar = () => {
      if (charIndex < currentPhrase.length) {
        displayText.value += currentPhrase[charIndex];
        charIndex++;
        setTimeout(typeChar, 50);
      } else {
        setTimeout(erasePhrase, 1000);
      }
    };

    typeChar();
  };

  const erasePhrase = () => {
    if (displayText.value.length > 0) {
      displayText.value = displayText.value.slice(0, -1);
      setTimeout(erasePhrase, 50);
    } else {
      currentPhraseIndex.value =
        (currentPhraseIndex.value + 1) % phrases.length;
      setTimeout(typePhrase, 500);
    }
  };

  typePhrase();
};

onMounted(() => {
  animateText();
});
</script>
  
  <style scoped>
.animate-typing {
  display: inline-block;
  opacity: 0;
  animation: typing 0.1s linear forwards;
}

@keyframes typing {
  to {
    opacity: 1;
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(-25%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}
</style>