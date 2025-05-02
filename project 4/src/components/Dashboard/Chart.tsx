import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarElement
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { ChartData } from '../../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartProps {
  data: ChartData[];
  type?: 'bar' | 'line';
  showRatings?: boolean;
}

const Chart: React.FC<ChartProps> = ({ data = [], type = 'line', showRatings = false }) => {
  const isDarkMode = document.documentElement.classList.contains('dark');

  // Get session ratings from localStorage
  const sessionRatings = React.useMemo(() => {
    const ratings = JSON.parse(localStorage.getItem('session_ratings') || '[]');
    return ratings.map((rating: any) => ({
      date: new Date(rating.date).toLocaleTimeString(),
      rating: rating.rating,
      duration: rating.duration / 60, // Convert seconds to minutes
      notes: rating.notes
    }));
  }, []);

  if (!data.length && !sessionRatings.length) {
    return (
      <div className="flex items-center justify-center h-[300px] bg-gray-50 dark:bg-dark-700 rounded-xl">
        <p className="text-gray-500 dark:text-gray-400">Aucune donnée disponible</p>
      </div>
    );
  }

  const chartData = showRatings ? {
    labels: sessionRatings.map(r => r.date),
    datasets: [
      {
        label: 'Note de concentration',
        data: sessionRatings.map(r => r.rating),
        borderColor: isDarkMode ? 'rgb(167, 139, 250)' : 'rgb(139, 92, 246)',
        backgroundColor: isDarkMode ? 'rgba(167, 139, 250, 0.1)' : 'rgba(139, 92, 246, 0.1)',
        borderWidth: 2,
        pointRadius: 6,
        pointBackgroundColor: isDarkMode ? 'rgb(167, 139, 250)' : 'rgb(139, 92, 246)',
        pointBorderColor: isDarkMode ? '#1e293b' : 'white',
        pointBorderWidth: 2,
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Durée (minutes)',
        data: sessionRatings.map(r => r.duration),
        borderColor: isDarkMode ? 'rgb(52, 211, 153)' : 'rgb(16, 185, 129)',
        backgroundColor: isDarkMode ? 'rgba(52, 211, 153, 0.1)' : 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        pointRadius: 6,
        pointBackgroundColor: isDarkMode ? 'rgb(52, 211, 153)' : 'rgb(16, 185, 129)',
        pointBorderColor: isDarkMode ? '#1e293b' : 'white',
        pointBorderWidth: 2,
        tension: 0.4,
        fill: true,
        yAxisID: 'y1',
      }
    ]
  } : {
    labels: data.map(item => item.date),
    datasets: [
      {
        label: 'Tâches ajoutées',
        data: data.map(item => item.added),
        borderColor: isDarkMode ? 'rgb(167, 139, 250)' : 'rgb(139, 92, 246)',
        backgroundColor: isDarkMode ? 'rgba(167, 139, 250, 0.1)' : 'rgba(139, 92, 246, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
        fill: true,
      },
      {
        label: 'Tâches terminées',
        data: data.map(item => item.completed),
        borderColor: isDarkMode ? 'rgb(52, 211, 153)' : 'rgb(16, 185, 129)',
        backgroundColor: isDarkMode ? 'rgba(52, 211, 153, 0.1)' : 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.4,
        fill: true,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          color: isDarkMode ? '#e2e8f0' : '#1f2937',
          font: {
            size: 12,
            family: "'Outfit', system-ui, sans-serif"
          }
        }
      },
      tooltip: {
        backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: isDarkMode ? '#e2e8f0' : '#1f2937',
        bodyColor: isDarkMode ? '#e2e8f0' : '#1f2937',
        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        titleFont: {
          size: 14,
          weight: '600',
          family: "'Outfit', system-ui, sans-serif"
        },
        bodyFont: {
          size: 12,
          family: "'Outfit', system-ui, sans-serif"
        },
        callbacks: showRatings ? {
          afterBody: (context: any) => {
            const index = context[0].dataIndex;
            const notes = sessionRatings[index].notes;
            return notes ? [`Notes: ${notes}`] : [];
          }
        } : undefined,
        displayColors: true,
        usePointStyle: true,
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: isDarkMode ? '#94a3b8' : '#64748b',
          font: {
            size: 12,
            family: "'Outfit', system-ui, sans-serif"
          },
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          color: isDarkMode ? '#94a3b8' : '#64748b',
          font: {
            size: 12,
            family: "'Outfit', system-ui, sans-serif"
          },
          stepSize: showRatings ? 1 : undefined,
          max: showRatings ? 5 : undefined
        }
      },
      ...(showRatings ? {
        y1: {
          position: 'right' as const,
          beginAtZero: true,
          grid: {
            display: false,
          },
          ticks: {
            color: isDarkMode ? '#94a3b8' : '#64748b',
            font: {
              size: 12,
              family: "'Outfit', system-ui, sans-serif"
            }
          }
        }
      } : {})
    }
  };

  return (
    <div style={{ height: '400px' }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default Chart;