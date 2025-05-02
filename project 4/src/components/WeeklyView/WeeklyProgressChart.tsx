import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format, startOfWeek, addDays, subDays, subMonths, subYears, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Task } from '../../types';
import Button from '../ui/Button';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface WeeklyProgressChartProps {
  tasks: Task[];
}

type TimeRange = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL';

const WeeklyProgressChart: React.FC<WeeklyProgressChartProps> = ({ tasks }) => {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1W');
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  const getDateRange = (range: TimeRange) => {
    const now = new Date();
    switch (range) {
      case '1D':
        return { start: startOfWeek(now), days: 1 };
      case '1W':
        return { start: startOfWeek(now), days: 7 };
      case '1M':
        return { start: subMonths(now, 1), days: 30 };
      case '3M':
        return { start: subMonths(now, 3), days: 90 };
      case '6M':
        return { start: subMonths(now, 6), days: 180 };
      case '1Y':
        return { start: subYears(now, 1), days: 365 };
      case 'ALL':
        const oldestTask = tasks.reduce((oldest, task) => {
          const taskDate = new Date(task.createdAt);
          return taskDate < oldest ? taskDate : oldest;
        }, new Date());
        const daysDiff = Math.ceil((now.getTime() - oldestTask.getTime()) / (1000 * 60 * 60 * 24));
        return { start: oldestTask, days: daysDiff };
    }
  };

  const { start, days } = getDateRange(selectedRange);
  const dates = Array.from({ length: days }, (_, i) => addDays(start, i));
  
  const calculateDayProgress = (date: Date) => {
    const dayTasks = tasks.filter(task => {
      const taskDate = new Date(task.dueDate || '');
      return isWithinInterval(taskDate, {
        start: date,
        end: addDays(date, 1)
      });
    });
    
    if (dayTasks.length === 0) return 0;
    const completedTasks = dayTasks.filter(task => task.completed);
    return (completedTasks.length / dayTasks.length) * 100;
  };

  const data = {
    labels: dates.map(date => format(date, selectedRange === '1D' ? 'HH:mm' : 'dd MMM', { locale: fr })),
    datasets: [
      {
        label: 'Progression (%)',
        data: dates.map(date => calculateDayProgress(date)),
        borderColor: isDarkMode ? 'rgb(167, 139, 250)' : 'rgb(139, 92, 246)',
        backgroundColor: isDarkMode ? 'rgba(167, 139, 250, 0.1)' : 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointRadius: 6,
        pointBackgroundColor: isDarkMode ? 'rgb(167, 139, 250)' : 'rgb(139, 92, 246)',
        pointBorderColor: isDarkMode ? '#1e293b' : 'white',
        pointBorderWidth: 2,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
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
          family: "'SF Pro Display', system-ui, sans-serif"
        },
        bodyFont: {
          size: 12,
          family: "'SF Pro Display', system-ui, sans-serif"
        },
        callbacks: {
          label: (context: any) => `Progression: ${Math.round(context.raw)}%`
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: isDarkMode ? '#a78bfa' : '#8b5cf6',
          font: {
            size: 12,
            family: "'SF Pro Display', system-ui, sans-serif"
          }
        }
      },
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: isDarkMode ? 'rgba(167, 139, 250, 0.1)' : 'rgba(139, 92, 246, 0.1)',
        },
        ticks: {
          color: isDarkMode ? '#a78bfa' : '#8b5cf6',
          font: {
            size: 12,
            family: "'SF Pro Display', system-ui, sans-serif"
          },
          callback: (value: number) => `${value}%`
        }
      }
    }
  };

  const timeRanges: { value: TimeRange; label: string }[] = [
    { value: '1D', label: '1 jour' },
    { value: '1W', label: '1 semaine' },
    { value: '1M', label: '1 mois' },
    { value: '3M', label: '3 mois' },
    { value: '6M', label: '6 mois' },
    { value: '1Y', label: '1 an' },
    { value: 'ALL', label: 'Tout' }
  ];

  return (
    <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm p-6 border border-violet-100 dark:border-violet-800">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h3 className="text-lg font-medium text-violet-900 dark:text-violet-100">
          Progression des tâches
        </h3>
        
        <div className="flex flex-wrap gap-2">
          {timeRanges.map(({ value, label }) => (
            <Button
              key={value}
              variant={selectedRange === value ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedRange(value)}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="h-[200px]">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default WeeklyProgressChart;