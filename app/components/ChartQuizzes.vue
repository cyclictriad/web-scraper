<!-- QuizzesPerSubjectChart.vue -->
<template>
    <div class="chart-container">
      <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue'
  import { Bar } from 'vue-chartjs'
  import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
  
  ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)
  
  const { data: metricsData } = await useFetch('/api/metrics')
  
  const chartData = computed(() => {
    if (!metricsData.value) return null
  
    const labels = metricsData.value.subjects.map(subject => subject.name)
    const data = metricsData.value.subjects.map(subject => 
      metricsData.value.quizzes.filter(quiz => quiz.subject === subject._id).length
    )
  
    return {
      labels,
      datasets: [{
        label: 'Quizzes per Subject',
        backgroundColor: '#8e5ea2',
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