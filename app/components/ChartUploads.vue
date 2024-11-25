<!-- ChartUploads.vue -->
<template>
    <div class="chart-container">
      <Pie v-if="chartData" :data="chartData" :options="chartOptions" />
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  import { Pie } from 'vue-chartjs'
  import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js'
  
  ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale)
  
  const { data: metricsData } = await useFetch('/api/metrics')
  
  const generateColors = (count) => {
    return Array.from({ length: count }, (_, i) => `hsl(${(i * 360) / count}, 70%, 50%)`)
  }
  
  const chartData = computed(() => {
    if (!metricsData.value) return null
  
    const subjects = metricsData.value.subjects.filter(subject => 
      metricsData.value.quizzes.some(quiz => 
        quiz.subject === subject._id && 
        quiz.statusHistory.some(status => status.status === 'UPLOADED')
      )
    )
  
    const labels = subjects.map(subject => subject.name)
    const data = subjects.map(subject => 
      metricsData.value.quizzes.filter(quiz => 
        quiz.subject === subject._id && 
        quiz.statusHistory.some(status => status.status === 'UPLOADED')
      ).length
    )
  
    return {
      labels,
      datasets: [{
        backgroundColor: generateColors(subjects.length),
        data
      }]
    }
  })
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false
  }
  </script>
  
  <style scoped>

  </style>