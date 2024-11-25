<template>
  <div
    class="flex overscroll-contain flex-col bg-gray-900 min-h-screen"
    style="scrollbar-width: none"
  >
    <FancyText v-if="!messages.length" />
    <div class="flex-1 overflow-y-auto p-4" ref="chatContainer">
      <MessagesRenderer :messages="messages" />
      <div
        v-if="isThinking & (messages.at(-1)?.role != 'assistant')"
        class="p-3 rounded-lg bg-green-300 text-gray-900"
      >
        <span class="typing-indicator">Thinking...</span>
      </div>
    </div>
    <div class="p-4 bg-gray-800 sticky bottom-0">
      <form @submit.prevent="sendMessage()" class="flex flex-col">
        <div class="flex mb-2">
          <input
            v-model="userInput"
            type="text"
            placeholder="Type your message..."
            class="flex-1 p-2 rounded-l-lg bg-gray-700 text-white focus:outline-none"
            :disabled="isThinking"
          />
          <button
            type="submit"
            class="px-4 py-2 bg-green-300 text-gray-900 rounded-r-lg hover:bg-green-400 focus:outline-none disabled:opacity-50"
            :disabled="isThinking || !userInput.trim()"
          >
            {{ isThinking ? "Thinking..." : "Send" }}
          </button>
        </div>
        <div class="flex w-full justify-between">
          <div class="flex items-center text-white">
            <label class="mr-2">
              <input type="checkbox" v-model="highCreativity" class="mr-1" />
              High Creativity
            </label>
            <label class="mr-2" @click="switchModel">
              <img src="/icons/Sync.svg" alt="" class="size-6 inline-block" />
              Switch Model
            </label>
            <label class="mr-2">
              <input type="checkbox" v-model="longer" class="mr-1" />
              Longer Responses
            </label>
          </div>
          <div class="relative">
            <button
              type="button"
              @click="showChatList = !showChatList"
              class="flex items-center px-4 py-2 border-2 border-green-300 rounded-lg bg-gray-900 text-green-300 hover:bg-gray-700 transition duration-200 ease-in-out"
            >
              <span class="mr-2">Chat</span>
              <svg
                v-if="!showChatList"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                class="size-5"
              >
                <path
                  fill-rule="evenodd"
                  d="M6 4.75A.75.75 0 0 1 6.75 4h10.5a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 4.75ZM6 10a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75A.75.75 0 0 1 6 10Zm0 5.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75a.75.75 0 0 1-.75-.75ZM1.99 4.75a1 1 0 0 1 1-1H3a1 1 0 0 1 1 1v.01a1 1 0 0 1-1 1h-.01a1 1 0 0 1-1-1v-.01ZM1.99 15.25a1 1 0 0 1 1-1H3a1 1 0 0 1 1 1v.01a1 1 0 0 1-1 1h-.01a1 1 0 0 1-1-1v-.01ZM1.99 10a1 1 0 0 1 1-1H3a1 1 0 0 1 1 1v.01a1 1 0 0 1-1 1h-.01a1 1 0 0 1-1-1V10Z"
                  clip-rule="evenodd"
                />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                class="size-5"
              >
                <path
                  d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"
                />
              </svg>
            </button>
            <div
              v-if="showChatList"
              class="absolute top-0 right-0 p-5 rounded-lg -translate-y-full w-60 bg-gray-800 shadow-lg"
            >
              <h3 class="text-lg text-green-300 mb-3">Chat History</h3>
              <ul class="divide-y divide-gray-700">
                <li v-if="!chats.length" class="text-gray-400 text-center py-2">
                  Your chats appear here
                </li>
                <li
                  v-for="chat in chats"
                  :key="chat.id"
                  @click="changeChatIdQuery(chat.id)"
                  class="text-white text-sm py-2 cursor-pointer hover:bg-green-900 rounded transition duration-200 ease-in-out"
                  :class="[
                    {
                      'bg-green-600': chat.id === currentChatId,
                    },
                  ]"
                >
                  {{ chat.title }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
  
<script setup>
import { ref, onMounted, nextTick } from "vue";

const showChatList = ref(false);
const query = useRoute().query;
const { data: chats } = await useFetch("/api/chat/");

const messages = ref([]);
const userInput = ref("");
const isThinking = ref(false);

const chatContainer = ref(null);
const highCreativity = ref(true);
const model = ref("gemma2-9b-it");
const longer = ref(true);

const scrollToBottom = () => {
  nextTick(() => {
    if (chatContainer.value) {
      chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
  });
};

const switchModel = function () {
  model.value = "gemma2-9b-it" ? "llama-3.1-8b-instant" : "gemma2-9b-it";
};

function changeChatIdQuery (id){
  useRouter().replace({ query: {...query, id } });
}



const currentChatId = computed(()=> query.id);
const fetchChatMessages = async()=> {
  const chatMessages = await $fetch(`/api/chat/${currentChatId.value}`);
  messages.value = chatMessages.messages;
}

watch(currentChatId,fetchChatMessages);

const sendMessage = async (customMessage) => {
  if (!userInput.value.trim()) return;

  const userMessage = {
    role: "user",
    content: customMessage || userInput.value.trim(),
  };
  messages.value.push(userMessage);
  userInput.value = "";
  scrollToBottom();

  isThinking.value = true;

  const creativityLevel = highCreativity.value ? "high" : "low";

  try {
    const response = await fetch(
      `/api/chat/${currentChatId.value}/?creativity=${creativityLevel}&stream=true&long=${longer.value}&model=${model.value}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    messages.value.push({
      role: "assistant",
      content: "",
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (isThinking.value) {
        isThinking.value = false;
      }
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split("\n").filter((line) => line.trim() !== "");

      for (const line of lines) {
        messages.value.at(-1).content += line;

        scrollToBottom();
       
      }
    }
  } catch (error) {
    console.error("Error:", error);
    messages.value.push({
      role: "assistant",
      content: "An error occurred. Please try again.",
    });
  } finally {
    scrollToBottom();
  }
};


const initiateChat = async () => {
  if(!query.id){
    const uniqueChatId = `c-${Date.now()}`
    changeChatIdQuery(uniqueChatId)
  }else{
    await fetchChatMessages()
  }

  
}
onMounted(async () => {
  await initiateChat();
  scrollToBottom();

  if (query.url) {
    await sendMessage(
      `Hey I am on this page ${decodeURIComponent(
        query.url
      )}. Tell me something.`
    );
  }
});
</script>
  
  <style scoped>
.typing-indicator {
  display: inline-block;
  width: 50px;
  height: 12px;
  background-color: #e2e8f0;
  border-radius: 5px;
  animation: typing 1.5s infinite ease-in-out;
}

@keyframes typing {
  0% {
    opacity: 0.2;
  }
  20% {
    opacity: 1;
  }
  100% {
    opacity: 0.2;
  }
}
</style>

