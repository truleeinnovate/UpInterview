import { useEffect, useRef } from 'react'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

function TenantMetricsChart() {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)
  
  useEffect(() => {
    if (chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
      
      const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Interviews Conducted',
            data: [1850, 2100, 2400, 2800, 3200, 3500],
            borderColor: '#2563EB',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            fill: true,
            tension: 0.4
          },
          {
            label: 'Assessment Completions',
            data: [950, 1100, 1300, 1500, 1800, 2000],
            borderColor: '#7C3AED',
            backgroundColor: 'rgba(124, 58, 237, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      }
      
      const config = {
        type: 'line',
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: {
                usePointStyle: true,
                padding: 20,
                font: {
                  size: 12
                }
              }
            },
            tooltip: {
              mode: 'index',
              intersect: false,
              padding: 10,
              titleFont: {
                size: 14,
                weight: 'bold'
              },
              bodyFont: {
                size: 13
              }
            }
          },
          interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                drawBorder: false
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        }
      }
      
      chartInstance.current = new Chart(chartRef.current, config)
    }
    
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [])
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 h-72">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Platform Usage</h2>
      <div className="h-56">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  )
}

export default TenantMetricsChart