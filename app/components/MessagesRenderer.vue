<!-- MessageRenderer.vue -->
<template>
    <div class="flex-1 overflow-y-auto p-4" ref="chatContainer">
      <div v-for="(message, index) in messages" :key="index" class="mb-4">
        <div
          :class="[
            'p-3 rounded-lg',
            message.role === 'user'
              ? 'bg-gray-800 text-white'
              : 'bg-green-300 text-gray-900',
          ]"
        >
          <template v-for="(segment, segmentIndex) in processMessageContent(message.content)" >
            <span 
              v-if="!segment.isCode" 
              v-html="segment.content"
              :key="segmentIndex"
            />
            <beautify-code
              v-else
              :code="segment.code"
              :language="segment.language"
              :type="segment.type"
              :key="`code-${segmentIndex}`"
            />
          </template>
        </div>
      </div>
    </div>
  </template>
  <script setup>
  import { ref } from 'vue'
  import BeautifyCode from './BeautifyCode.vue'
  
  const props = defineProps({
    messages: {
      type: Array,
      required: true
    }
  })
  
  const chatContainer = ref(null)
  
  const parseContentWithCodes = (content, codesArray) => {
    const segments = []
    let lastIndex = 0
    const pattern = /code_(\d+)/g
    let match
    
    while ((match = pattern.exec(content)) !== null) {
      // Add text segment before code if exists
      if (match.index > lastIndex) {
        segments.push({
          isCode: false,
          content: content.slice(lastIndex, match.index)
        })
      }
      
      // Add code segment
      const codeIndex = parseInt(match[1])
      const codeSegment = codesArray[codeIndex]
      
      if (codeSegment) {
        segments.push({
          isCode: true,
          ...codeSegment
        })
      }
      
      lastIndex = match.index + match[0].length
    }
    
    // Add remaining text if any
    if (lastIndex < content.length) {
      segments.push({
        isCode: false,
        content: content.slice(lastIndex)
      })
    }
    
    return segments
  }
    
  const processMessageContent = (content) => {
    const { codes, html } = convertMarkdownToHtml(content)
    return parseContentWithCodes(html, codes)
  }
  </script>

  