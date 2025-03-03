import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";


// Register the required components
ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({skillsTabData}) => {
  const calculateCategoryRatings =()=>{
    const categoryRatings = skillsTabData.map(category=>{
      const totalRatings = category.skillsList.reduce((acc,skill)=>acc+skill.rating,0)
      const avgRating = category.skillsList.length>0 ? totalRatings/category.skillsList.length : 0 
      return {
        category:category.category,
        avgRating,
      }
    })

    const totalAvgRating = categoryRatings.reduce((acc,cat)=>acc+cat.avgRating,0)
    const percentages = categoryRatings.map((cat)=>({
        category:cat.category,
        percentage: totalAvgRating > 0? Math.round((cat.avgRating/totalAvgRating)* 100,3) : 0,
    }))
    return percentages
  }
 
  
  const data = {
    labels: calculateCategoryRatings().map(cat=>cat.category), 
    datasets: [
      {
        data: calculateCategoryRatings().map(cat=>cat.percentage) || [40,30,20,20],
        backgroundColor: [
          "#F8D9A0", // Mandatory skills color
          "#B0C9F3", // Optional skills color
          "#D3A8E0", // Technical skills color
          "#A8E4E7", // Soft skills color
        ],
        borderWidth: 2, // For cleaner arcs
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "right", // Position of legend
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          font: { size: 16 },
          // Custom callback to display percentages in the legend
          generateLabels: (chart) => {
            const { labels } = chart.data;
            const data = chart.data.datasets[0].data;
            const colors = chart.data.datasets[0].backgroundColor;
            return labels.map((label, index) => ({
              text: `${label} ${data[index]}%`, // Append percentage to label
              fillStyle: colors[index], // Set legend color
              strokeStyle: colors[index],
              pointStyle: "circle", // Circle legend point
            }));
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.label}: ${context.raw}%`;
          },
        },
      },
    },
    cutout: "70%", // To make it look like a doughnut chart
  };

  const centerText = {
    id: "centerText",
    beforeDraw(chart) {
      const {
        ctx,
        chartArea: { width, height },
      } = chart;

      ctx.save();
      ctx.font = "bold 20px Arial";
      ctx.fillStyle = "#000"; // Text color
      ctx.textAlign = "center";
      ctx.fillText("Overall", width / 2, height / 2 - 10);
      ctx.fillText("Impression", width / 2, height / 2 + 20);
    },
  };

      return <Doughnut data={data} options={options} plugins={[centerText]} />
};

export default DoughnutChart;
