import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
} from 'chart.js';
import { DiaperLog } from '../types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip
);

interface UsageChartProps {
  logs: DiaperLog[];
}

const UsageChart: React.FC<UsageChartProps> = ({ logs }) => {
  const chartData = useMemo(() => {
    const labels: string[] = [];
    const dataPoints: number[] = [];
    
    const today = new Date();
    
    const logsByDay = new Map<string, number>();
    logs.forEach(log => {
      const date = new Date(log.timestamp);
      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      logsByDay.set(key, (logsByDay.get(key) || 0) + 1);
    });

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      
      const dayName = date.toLocaleDateString('he-IL', { weekday: 'short' });
      labels.push(dayName);

      const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      dataPoints.push(logsByDay.get(key) || 0);
    }

    return {
      labels,
      datasets: [
        {
          label: 'חיתולים ביום',
          data: dataPoints,
          backgroundColor: 'rgba(20, 184, 166, 0.6)',
          borderColor: 'rgb(13, 148, 136)',
          borderWidth: 1,
          borderRadius: 4,
          barPercentage: 0.6,
        },
      ],
    };
  }, [logs]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        rtl: true,
        bodyFont: { family: "'Assistant', sans-serif" },
        titleFont: { family: "'Assistant', sans-serif" },
        displayColors: false,
        callbacks: {
            label: function(context: any) {
                return `חיתולים: ${context.parsed.y}`;
            }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
            color: '#f1f5f9' // slate-100
        },
        ticks: {
          stepSize: 1,
          precision: 0,
          font: { family: "'Assistant', sans-serif" },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
            font: { family: "'Assistant', sans-serif" },
        }
      },
    },
  };

  return <Bar options={options as any} data={chartData} />;
};

export default UsageChart;
