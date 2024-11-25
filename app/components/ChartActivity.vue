<template>
  <div class="chart-container h-[400px] w-full">
    <Line v-if="chartData" :data="chartData" :options="chartOptions" />
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  TimeScale,
  CategoryScale
} from 'chart.js'
import 'chartjs-adapter-date-fns'

ChartJS.register(
  CategoryScale,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  TimeScale
)

const { data: metricsData } = await useFetch('/api/metrics')

const chartData = computed(() => {
  if (!metricsData.value) return null

  // Create a map to store counts for each date
  const dateMap = new Map()

  metricsData.value.quizzes.forEach(quiz => {
    quiz.statusHistory.forEach(status => {
      const date = new Date(status.at).toISOString().split('T')[0]
      if (!dateMap.has(date)) {
        dateMap.set(date, {
          date,
          pdfCount: 0,
          metaCount: 0,
          uploadCount: 0
        })
      }
      const counts = dateMap.get(date)
      if (status.status === 'PDF') counts.pdfCount++
      else if (status.status === 'META') counts.metaCount++
      else if (status.status === 'UPLOADED') counts.uploadCount++
    })
  })

  // Convert map to array and sort by date
  const processedData = Array.from(dateMap.values())
    .sort((a, b) => new Date(a.date) - new Date(b.date))

  return {
    labels: processedData.map(d => d.date),
    datasets: [
      {
        label: 'PDF Processing',
        borderColor: '#3e95cd',
        backgroundColor: '#3e95cd',
        data: processedData.map(d => d.pdfCount),
        tension: 0.1,
        pointRadius: 3,
        fill: false
      },
      {
        label: 'Metadata Processing',
        borderColor: '#8e5ea2',
        backgroundColor: '#8e5ea2',
        data: processedData.map(d => d.metaCount),
        tension: 0.1,
        pointRadius: 3,
        fill: false
      },
      {
        label: 'Uploads',
        borderColor: '#3cba9f',
        backgroundColor: '#3cba9f',
        data: processedData.map(d => d.uploadCount),
        tension: 0.1,
        pointRadius: 3,
        fill: false
      }
    ]
  }
})

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index'
  },
  scales: {
    x: {
      type: 'time',
      time: {
        unit: 'day',
        displayFormats: {
          day: 'MMM d, yyyy'
        }
      },
      title: {
        display: true,
        text: 'Date'
      }
    },
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Number of Activities'
      },
      ticks: {
        stepSize: 1,
        precision: 0
      }
    }
  },
  plugins: {
    tooltip: {
      callbacks: {
        title: (context) => {
          return new Date(context[0].label).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        }
      }
    },
    legend: {
      position: 'top',
      align: 'center'
    }
  }
}))
</script>

<style scoped>
.chart-container {
  padding: 1rem;
  background: transparent;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>