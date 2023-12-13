// LineGraph.js
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
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function LineGraph({ lineGraphData }) {
  if (!lineGraphData || lineGraphData.length === 0) {
    return <p>No data available for line graph</p>;
  }

  const data = {
    labels: lineGraphData.map(item => item.year),
    datasets: [
      {
        label: 'Allocated',
        data: lineGraphData.map(item => item.allocated),
        borderColor: 'rgb(255, 99, 132)',
      backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderWidth: 2,
        fill: false,
      },
      {
        label: 'Used',
        data: lineGraphData.map(item => item.used),
        borderColor: 'rgb(53, 162, 235)',
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderWidth: 2,
        fill: false,
      },
    ],
  };

  const options = {
    scales: {
      x: {
        type: 'category',
        labels: lineGraphData.map(item => item.year),
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="line-graph">
      <Line data={data} options={options} />
    </div>
  );
}

export default LineGraph;
