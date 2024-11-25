<!-- SubjectsPerCourseChart.vue -->
<template>
    <div class="chart-container w-full">
      <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import { Bar } from 'vue-chartjs'
  import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
  
  ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)
  
  const { data: metricsData } = await useFetch('/api/metrics')
  
  const chartData = computed(() => {
    if (!metricsData.value) return null
  
    const labels = metricsData.value.courses.map(course => course.name)
    const data = metricsData.value.courses.map(course => 
      metricsData.value.subjects.filter(subject => subject.course === course._id).length
    )
  
    return {
      labels,
      datasets: [{
        label: 'Subjects per Course',
        backgroundColor: '#f87979',
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