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
import axios from "axios";
import { config } from "../../../config";

function MetricsOverview() {
  const [metrics, setMetrics] = useState([
    {
      title: "Total Interviews",
      value: "12,843",
      description: "Across all tenants",
      icon: <AiOutlineCalendar size={24} />,
      trend: "up",
      trendValue: "15%",
      endpoint: `${config.REACT_APP_API_URL}/interview/all-interviews`,
    },
    {
      title: "Active Assessments",
      value: "456",
      description: "Live assessment sessions",
      icon: <AiOutlineCheckSquare size={24} />,
      trend: "up",
      trendValue: "8%",
      endpoint: `${config.REACT_APP_API_URL}/assessments/all-assessments`,
    },
    {
      title: "Platform Users",
      value: "8,392",
      description: "Total registered users",
      icon: <AiOutlineTeam size={24} />,
      trend: "up",
      trendValue: "12%",
      endpoint: `${config.REACT_APP_API_URL}/users/platform-users`,
    },
    {
      title: "Outsource Interviews",
      value: "324",
      description: "Active freelance interviews",
      icon: <AiOutlineUserSwitch size={24} />,
      trend: "up",
      trendValue: "25%",
      endpoint: `${config.REACT_APP_API_URL}/outsourceInterviewers/all-interviews`,
    },
    {
      title: "Support Tickets",
      value: "24",
      description: "Unresolved tickets",
      icon: <AiOutlineCustomerService size={24} />,
      trend: "down",
      trendValue: "10%",
      endpoint: `${config.REACT_APP_API_URL}/all-tickets`,
    },
  ]);

  useEffect(() => {
    async function fetchAllCardData() {
      const updatedMetrics = await Promise.all(
        metrics.map(async (card) => {
          try {
            const res = await axios.get(card?.endpoint);
            return {
              ...card,
              value: res.data.metric.value,
              title: res.data.metric.title,
              trend: res.data.metric.trend,
              trendValue: res.data.metric.trendValue,
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

// import { useEffect, useState } from "react";
// import Card from "../common/Card";
// import {
//   AiOutlineTeam,
//   AiOutlineCalendar,
//   AiOutlineCheckSquare,
//   AiOutlineCustomerService,
//   AiOutlineUserSwitch,
// } from "react-icons/ai";
// import axios from "axios";
// import { config } from "../../../config";

// // 🔸 Define metric template outside component
// const metricsTemplate = [
//   {
//     key: "total-interviews",
//     title: "Total Interviews",
//     value: null,
//     description: "Across all tenants",
//     icon: <AiOutlineCalendar size={24} />,
//     trend: null,
//     trendValue: null,
//     endpoint: `${config.REACT_APP_API_URL}/interview/all-interviews`,
//   },
//   {
//     key: "active-assessments",
//     title: "Active Assessments",
//     value: null,
//     description: "Live assessment sessions",
//     icon: <AiOutlineCheckSquare size={24} />,
//     trend: null,
//     trendValue: null,
//     endpoint: `${config.REACT_APP_API_URL}/assessments/all-assessments`,
//   },
//   {
//     key: "platform-users",
//     title: "Platform Users",
//     value: null,
//     description: "Total registered users",
//     icon: <AiOutlineTeam size={24} />,
//     trend: null,
//     trendValue: null,
//     endpoint: `${config.REACT_APP_API_URL}/users/platform-users`,
//   },
//   {
//     key: "outsource-interviews",
//     title: "Outsource Interviews",
//     value: null,
//     description: "Active freelance interviews",
//     icon: <AiOutlineUserSwitch size={24} />,
//     trend: null,
//     trendValue: null,
//     endpoint: `${config.REACT_APP_API_URL}/outsourceInterviewers/all-interviews`,
//   },
//   {
//     key: "support-tickets",
//     title: "Support Tickets",
//     value: null,
//     description: "Unresolved tickets",
//     icon: <AiOutlineCustomerService size={24} />,
//     trend: null,
//     trendValue: null,
//     endpoint: `${config.REACT_APP_API_URL}/all-tickets`,
//   },
// ];

// function MetricsOverview() {
//   const [metrics, setMetrics] = useState(metricsTemplate);

//   useEffect(() => {
//     let isMounted = true; // Prevent state updates if unmounted

//     async function fetchAllCardData() {
//       const updatedMetrics = await Promise.all(
//         metricsTemplate.map(async (card) => {
//           try {
//             const res = await axios.get(card.endpoint);
//             const metric = res?.data?.metric;

//             if (!metric) throw new Error("Invalid metric data");

//             return {
//               ...card,
//               title: metric.title || card.title,
//               value: metric.value ?? "--",
//               trend: metric.trend ?? null,
//               trendValue: metric.trendValue ?? null,
//             };
//           } catch (error) {
//             console.error(
//               `Error fetching data for ${card.title}:`,
//               error.message
//             );
//             return {
//               ...card,
//               value: "--",
//               trend: null,
//               trendValue: null,
//             };
//           }
//         })
//       );

//       if (isMounted) setMetrics(updatedMetrics);
//     }

//     fetchAllCardData();

//     return () => {
//       isMounted = false;
//     };
//   }, []);

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
//       {metrics.map((metric) => (
//         <Card
//           key={metric.key}
//           title={metric.title}
//           value={metric.value !== null ? metric.value : "Loading..."}
//           description={metric.description}
//           icon={metric.icon}
//           trend={metric.trend}
//           trendValue={metric.trendValue}
//           className="w-full"
//         />
//       ))}
//     </div>
//   );
// }

// export default MetricsOverview;
