import { useEffect, useState } from "react";
import Card from "../common/Card";
import {
  AiOutlineTeam,
  AiOutlineCalendar,
  // AiOutlineFile,
  AiOutlineCheckSquare,
  AiOutlineCustomerService,
  AiOutlineUserSwitch,
} from "react-icons/ai";

function MetricsOverview() {
  const [metrics, setMetrics] = useState([
    {
      title: "Total Interviews",
      value: "12,843",
      description: "Across all tenants",
      icon: <AiOutlineCalendar size={24} />,
      trend: "up",
      trendValue: "15%",
      endpoint: "http://localhost:3000/admin/interviews",
    },
    {
      title: "Active Assessments",
      value: "456",
      description: "Live assessment sessions",
      icon: <AiOutlineCheckSquare size={24} />,
      trend: "up",
      trendValue: "8%",
      endpoint: "http://localhost:3000/admin/assessments",
    },
    {
      title: "Platform Users",
      value: "8,392",
      description: "Total registered users",
      icon: <AiOutlineTeam size={24} />,
      trend: "up",
      trendValue: "12%",
      endpoint: "http://localhost:3000/admin/users",
    },
    {
      title: "Outsource Interviews",
      value: "324",
      description: "Active freelance interviews",
      icon: <AiOutlineUserSwitch size={24} />,
      trend: "up",
      trendValue: "25%",
      endpoint: "http://localhost:3000/admin/outsource-interviewers",
    },
    {
      title: "Support Tickets",
      value: "24",
      description: "Unresolved tickets",
      icon: <AiOutlineCustomerService size={24} />,
      trend: "down",
      trendValue: "10%",
      endpoint: "http://localhost:3000/admin/support-users",
    },
  ]);

  useEffect(() => {
    async function fetchAllCardData() {
      const updatedMetrics = await Promise.all(
        metrics.map(async (card) => {
          try {
            const res = await fetch(card.endpoint);
            const data = await res.json();
            return {
              ...card,
              value: data.value,
            };
          } catch (error) {
            console.error(`Error fetching data for ${card.title}:`, error);
            return {
              ...card,
              value: 0,
            };
          }
        })
      );

      setMetrics(updatedMetrics);
    }

    fetchAllCardData();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
      {metrics.map((metric, index) => (
        <Card
          key={index}
          title={metric.title}
          value={metric.value}
          description={metric.description}
          icon={metric.icon}
          trend={metric.trend}
          trendValue={metric.trendValue}
          className="w-full"
        />
      ))}
    </div>
  );
}

export default MetricsOverview;
