// v1.0.0 - Ashok - Added Api Call for fetching rate cards data and improved code
// v1.0.1 - Ashok - Added delete button and functionality to implement delete action
// v1.0.2 - Ashok - Improved displaying table data
import { useEffect, useState } from "react";
import DataTable from "../../../Components/SuperAdminComponents/common/DataTable";
import StatusBadge from "../../../Components/SuperAdminComponents/common/StatusBadge";
import { Pencil, Eye, Trash } from "lucide-react";
import axios from "axios";
import { config } from "../../../config";
// v1.0.1 <------------------------------------------------------------
import toast from "react-hot-toast";
import { useScrollLock } from "../../../apiHooks/scrollHook/useScrollLock";
import { notify } from "../../../services/toastService";
// v1.0.1 ------------------------------------------------------------>
import { formatDateTime } from "../../../utils/dateFormatter.js";

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

  // v1.0.1 <-----------------------------------------------------------------------
  const [deleteTarget, setDeleteTarget] = useState(null); // track which card is selected
  const [loading, setLoading] = useState(false);

  // Using this disable the outer scrollbar for better UX
  useScrollLock(deleteTarget);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setLoading(true);

      await axios.delete(
        `${config.REACT_APP_API_URL}/rate-cards/${deleteTarget._id}`
      );

      setRateCards(rateCards.filter((card) => card._id !== deleteTarget._id));
      notify.success("Rate card deleted successfully");
      setDeleteTarget(null);
    } catch (error) {
      notify.error("Failed to delete rate card");
      console.error("Error deleting rate card:", error);
    } finally {
      setLoading(false);
    }
  };

  // v1.0.1 ------------------------------------------------------------------------->

  const filteredRateCards =
    filterCategory === "all"
      ? rateCards
      : rateCards?.filter((card) => card.category === filterCategory);

  const formatCurrency = (amount, currency) => {
    const symbol = currency === "USD" ? "$" : "₹";
    return `${symbol}${amount.toLocaleString()}`;
  };


  // const getRateRangeDisplay = (levels, currency) => {
  //   const juniorRate = levels.find((l) => l.level === "Junior");
  //   const seniorRate = levels.find((l) => l.level === "Senior");

  //   if (!juniorRate || !seniorRate) return "N/A";

  //   const currencyKey = currency.toLowerCase();
  //   const minRate = juniorRate.rateRange[currencyKey].min;
  //   const maxRate = seniorRate.rateRange[currencyKey].max;

  //   return `${formatCurrency(minRate, currency)} - ${formatCurrency(
  //     maxRate,
  //     currency
  //   )}`;
  // };

  const getRateRangeDisplay = (levels = [], currency = "INR") => {
    const juniorRate = levels?.find((l) => l?.level === "Junior");
    const seniorRate = levels?.find((l) => l?.level === "Senior");

    if (!juniorRate || !seniorRate) return "N/A";

    const currencyKey = currency?.toLowerCase?.();

    const juniorCurrency = juniorRate?.rateRange?.[currencyKey];
    const seniorCurrency = seniorRate?.rateRange?.[currencyKey];

    if (!juniorCurrency || !seniorCurrency) return "N/A";

    const minRate = juniorCurrency?.min;
    const maxRate = seniorCurrency?.max;

    if (minRate == null || maxRate == null) return "N/A";

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
    // v1.0.2 <-------------------------------------------------------------------------
    // {
    //   field: "technology",
    //   header: "Technology / Role",
    //   render: (row) => (
    //     <div>
    //       <div className="font-medium text-gray-900">{row?.technology}</div>
    //       <div className="text-sm text-gray-500">{row?.category}</div>
    //     </div>
    //   ),
    // },
    {
      field: "technology",
      header: "Technology / Role",
      render: (row) => (
        <div>
          <div
            className="font-medium text-gray-900 truncate max-w-[200px] cursor-default"
            title={
              Array.isArray(row?.roleName)
                ? row?.roleName?.join(", ")
                : row?.roleName
            }
          >
            {Array.isArray(row?.roleName) && row?.roleName?.length > 0 ? (
              <>
                {row?.roleName[0]}
                {row?.roleName?.length > 1 && (
                  <span className="text-gray-500">
                    +{row?.roleName?.length - 1} more
                  </span>
                )}
              </>
            ) : (
              row?.roleName || "—"
            )}
          </div>
          <div className="text-sm text-gray-500">{row?.category || "—"}</div>
        </div>
      ),
    },
    // v1.0.2 ------------------------------------------------------------------------->

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
      render: (row) => formatDateTime(row?.createdAt),
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
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(row)}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-50"
            title="Edit Rate Card"
          >
            <Pencil className="h-4 w-4" />
          </button>
          {/* v1.0.1 <------------------------------------------------------------------------ */}
          <button
            onClick={() => setDeleteTarget(row)} // open modal
            className="p-2 text-red-600 hover:text-red-900 rounded-full hover:bg-red-50"
            title="Delete Rate Card"
          >
            <Trash className="h-4 w-4" />
          </button>
          {/* v1.0.1 ------------------------------------------------------------------------> */}
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
          <div className="text-xl font-semibold text-gray-500">
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
      {/* v1.0.1 <------------------------------------------------------------------------ */}
      {/* Delete Confirmation Modal */}
      <div>
        {deleteTarget && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
              <h2 className="text-lg font-semibold text-gray-800">
                Confirm Delete
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                Are you sure you want to delete{" "}
                {/* v1.0.2 <-------------------------------------------------------- */}
                <span className="font-medium">
                  {/* {deleteTarget?.technology[0]} */}
                  {Array.isArray(deleteTarget?.technology)
                    ? deleteTarget.technology[0]
                    : deleteTarget?.technology}
                </span>
                ?
                {/* v1.0.2 --------------------------------------------------------> */}
                This action cannot be undone.
              </p>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700"
                  disabled={loading}
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* v1.0.1 ------------------------------------------------------------------------> */}
    </div>
  );
}

export default RatesTableView;
