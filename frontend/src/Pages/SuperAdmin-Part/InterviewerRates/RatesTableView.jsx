// v1.0.0 - Ashok - Added Api Call for fetching rate cards data and improved code
import { useEffect, useState } from "react";
import DataTable from "../../../Components/SuperAdminComponents/common/DataTable";
import StatusBadge from "../../../Components/SuperAdminComponents/common/StatusBadge";
import { AiOutlineEdit, AiOutlineEye, AiOutlineDelete } from "react-icons/ai";
import axios from "axios";
import { config } from "../../../config";

function RatesTableView({ filterCategory, onEdit, onView }) {
  // v1.0.0 <--------------------------------------------------------
  const [rateCards, setRateCards] = useState([
    // {
    //   id: 1,
    //   category: "Software Development",
    //   technology: "Full-Stack Developer",
    //   levels: [
    //     {
    //       level: "Junior",
    //       rateRange: {
    //         inr: { min: 1250, max: 2100 },
    //         usd: { min: 15, max: 25 },
    //       },
    //     },
    //     {
    //       level: "Mid-Level",
    //       rateRange: {
    //         inr: { min: 1900, max: 3000 },
    //         usd: { min: 23, max: 35 },
    //       },
    //     },
    //     {
    //       level: "Senior",
    //       rateRange: {
    //         inr: { min: 2100, max: 3400 },
    //         usd: { min: 25, max: 40 },
    //       },
    //     },
    //   ],
    //   discountMockInterview: 10,
    //   defaultCurrency: "INR",
    //   isActive: true,
    //   createdAt: "2025-06-01T10:00:00Z",
    // },
    // {
    //   id: 2,
    //   category: "Software Development",
    //   technology: "Frontend Developer (React, Angular, Vue)",
    //   levels: [
    //     {
    //       level: "Junior",
    //       rateRange: {
    //         inr: { min: 1200, max: 2000 },
    //         usd: { min: 14, max: 24 },
    //       },
    //     },
    //     {
    //       level: "Mid-Level",
    //       rateRange: {
    //         inr: { min: 1800, max: 2800 },
    //         usd: { min: 22, max: 33 },
    //       },
    //     },
    //     {
    //       level: "Senior",
    //       rateRange: {
    //         inr: { min: 2000, max: 3200 },
    //         usd: { min: 24, max: 38 },
    //       },
    //     },
    //   ],
    //   discountMockInterview: 15,
    //   defaultCurrency: "INR",
    //   isActive: true,
    //   createdAt: "2025-06-01T11:00:00Z",
    // },
    // {
    //   id: 3,
    //   category: "Data & AI",
    //   technology: "Data Scientist / AI-ML Engineer",
    //   levels: [
    //     {
    //       level: "Junior",
    //       rateRange: {
    //         inr: { min: 1800, max: 2800 },
    //         usd: { min: 22, max: 33 },
    //       },
    //     },
    //     {
    //       level: "Mid-Level",
    //       rateRange: {
    //         inr: { min: 2800, max: 4000 },
    //         usd: { min: 34, max: 48 },
    //       },
    //     },
    //     {
    //       level: "Senior",
    //       rateRange: {
    //         inr: { min: 3500, max: 5000 },
    //         usd: { min: 42, max: 60 },
    //       },
    //     },
    //   ],
    //   discountMockInterview: 20,
    //   defaultCurrency: "USD",
    //   isActive: true,
    //   createdAt: "2025-06-01T12:00:00Z",
    // },
    // {
    //   id: 4,
    //   category: "DevOps & Cloud",
    //   technology: "Cloud Architect (AWS/Azure/GCP)",
    //   levels: [
    //     {
    //       level: "Junior",
    //       rateRange: {
    //         inr: { min: 1800, max: 2800 },
    //         usd: { min: 22, max: 33 },
    //       },
    //     },
    //     {
    //       level: "Mid-Level",
    //       rateRange: {
    //         inr: { min: 3000, max: 4200 },
    //         usd: { min: 36, max: 50 },
    //       },
    //     },
    //     {
    //       level: "Senior",
    //       rateRange: {
    //         inr: { min: 4000, max: 5500 },
    //         usd: { min: 48, max: 65 },
    //       },
    //     },
    //   ],
    //   discountMockInterview: 12,
    //   defaultCurrency: "USD",
    //   isActive: true,
    //   createdAt: "2025-06-01T13:00:00Z",
    // },
    // {
    //   id: 5,
    //   category: "Specialized Skills",
    //   technology: "Blockchain Developer",
    //   levels: [
    //     {
    //       level: "Junior",
    //       rateRange: {
    //         inr: { min: 1800, max: 2800 },
    //         usd: { min: 22, max: 33 },
    //       },
    //     },
    //     {
    //       level: "Mid-Level",
    //       rateRange: {
    //         inr: { min: 3000, max: 4200 },
    //         usd: { min: 36, max: 50 },
    //       },
    //     },
    //     {
    //       level: "Senior",
    //       rateRange: {
    //         inr: { min: 4200, max: 6000 },
    //         usd: { min: 50, max: 72 },
    //       },
    //     },
    //   ],
    //   discountMockInterview: 25,
    //   defaultCurrency: "USD",
    //   isActive: false,
    //   createdAt: "2025-06-01T14:00:00Z",
    // },
  ]);

  useEffect(() => {
    // Fetch rate cards from API
    const fetchRateCards = async () => {
      try {
        const response = await axios.get(
          `${config.REACT_APP_API_URL}/rate-cards`
        );
        console.log("Fetched rate cards at Table:", response.data);
        setRateCards(response.data);
      } catch (error) {
        console.error("Error fetching rate cards:", error);
      }
    };

    fetchRateCards();
  }, []); // Add dependency array to avoid infinite calls
  // v1.0.0 <-------------------------------------------------------->

  const filteredRateCards =
    filterCategory === "all"
      ? rateCards
      : rateCards?.filter((card) => card.category === filterCategory);

  const formatCurrency = (amount, currency) => {
    const symbol = currency === "USD" ? "$" : "₹";
    return `${symbol}${amount.toLocaleString()}`;
  };

  const getRateRangeDisplay = (levels, currency) => {
    const juniorRate = levels.find((l) => l.level === "Junior");
    const seniorRate = levels.find((l) => l.level === "Senior");

    if (!juniorRate || !seniorRate) return "N/A";

    const currencyKey = currency.toLowerCase();
    const minRate = juniorRate.rateRange[currencyKey].min;
    const maxRate = seniorRate.rateRange[currencyKey].max;

    return `${formatCurrency(minRate, currency)} - ${formatCurrency(
      maxRate,
      currency
    )}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const columns = [
    {
      field: "technology",
      header: "Technology / Role",
      render: (row) => (
        <div>
          <div className="font-medium text-gray-900">{row?.technology}</div>
          <div className="text-sm text-gray-500">{row?.category}</div>
        </div>
      ),
    },
    {
      field: "rateRange",
      header: "Rate Range",
      render: (row) => (
        <div>
          <div className="font-medium">
            {getRateRangeDisplay(row?.levels, row?.defaultCurrency)}
          </div>
          <div className="text-xs text-gray-500">per hour</div>
        </div>
      ),
    },
    {
      field: "levels",
      header: "Experience Levels",
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row?.levels?.map((level, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-teal-100 text-teal-800"
            >
              {level?.level}
            </span>
          ))}
        </div>
      ),
    },
    // v1.0.0 <------------------------------------------------------
    // {
    //   field: "discountMockInterview",
    //   header: "Mock Interview Discount",
    //   render: (row) => `${row?.discountMockInterview}%`,
    // },
    // v1.0.0 ------------------------------------------------------>
    {
      field: "defaultCurrency",
      header: "Currency",
      render: (row) => (
        <span className="font-mono text-sm">{row?.defaultCurrency}</span>
      ),
    },
    {
      field: "isActive",
      header: "Status",
      render: (row) => (
        <StatusBadge
          status={row?.isActive ? "active" : "inactive"}
          text={row?.isActive ? "Active" : "Inactive"}
        />
      ),
    },
    {
      field: "createdAt",
      header: "Created",
      render: (row) => formatDate(row?.createdAt),
    },
    {
      field: "actions",
      header: "Actions",
      sortable: false,
      render: (row) => (
        <div className="flex space-x-2">
          {/* v1.0.0 <------------------------------------------------------------------- */}
          <button
            onClick={() => onView(row)}
            className="p-2 text-teal-600 hover:text-teal-900 rounded-full hover:bg-teal-50"
            title="View Details"
          >
            <AiOutlineEye size={18} />
          </button>
          <button
            onClick={() => onEdit(row)}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-50"
            title="Edit Rate Card"
          >
            <AiOutlineEdit size={18} />
          </button>
          
          {/* <button
            className="p-2 text-red-600 hover:text-red-900 rounded-full hover:bg-red-50"
            title="Delete Rate Card"
          >
            <AiOutlineDelete size={18} />
          </button> */}
          {/* v1.0.0 <------------------------------------------------------------------- */}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Total Rate Cards</div>
          <div className="text-xl font-semibold">
            {filteredRateCards?.length}
          </div>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Active</div>
          <div className="text-xl font-semibold text-teal-600">
            {filteredRateCards?.filter((card) => card?.isActive)?.length}
          </div>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Categories</div>
          <div className="text-xl font-semibold">
            {filterCategory === "all"
              ? new Set(rateCards?.map((card) => card?.category))?.size
              : 1}
          </div>
        </div>
        {/* v1.0.0 <------------------------------------------------------------------------ */}
        {/* <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Avg Mock Discount</div>
          <div className="text-xl font-semibold">
            {Math.round(
              filteredRateCards?.reduce(
                (sum, card) => sum + card.discountMockInterview,
                0
              ) / filteredRateCards?.length
            )}
            %
          </div>
        </div> */}
        {/* v1.0.0 ------------------------------------------------------------------------> */}
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredRateCards}
          searchable={true}
          pagination={true}
        />
      </div>
    </div>
  );
}

export default RatesTableView;
