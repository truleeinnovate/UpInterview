// v1.0.0 - Ashok - Improved code and added API call for fetching rate cards
// v1.0.1 - Ashok - Added delete button to implement delete action
// v1.0.2 - Ashok - Handled more items to display for technology

import { useEffect, useState } from "react";
import StatusBadge from "../../../Components/SuperAdminComponents/common/StatusBadge";
import { Pencil, Eye, Trash, Plus } from "lucide-react";
import axios from "axios";
import { config } from "../../../config";
// v1.0.1 <------------------------------------------------------------
import toast from "react-hot-toast";
import { useScrollLock } from "../../../apiHooks/scrollHook/useScrollLock";
import { notify } from "../../../services/toastService";
// v1.0.1 ------------------------------------------------------------>
import { formatDateTime } from "../../../utils/dateFormatter";

function RatesKanbanView({ filterCategory, onEdit, onView }) {
  // v1.0.0 <------------------------------------------------------
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
    //   category: "Software Development",
    //   technology: "Backend Developer (Java, .NET, Python, Node.js)",
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
    //         inr: { min: 2200, max: 3600 },
    //         usd: { min: 26, max: 42 },
    //       },
    //     },
    //   ],
    //   discountMockInterview: 12,
    //   defaultCurrency: "INR",
    //   isActive: true,
    //   createdAt: "2025-06-01T12:00:00Z",
    // },
    // {
    //   id: 4,
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
    //   createdAt: "2025-06-01T13:00:00Z",
    // },
    // {
    //   id: 5,
    //   category: "Data & AI",
    //   technology: "Data Engineer",
    //   levels: [
    //     {
    //       level: "Junior",
    //       rateRange: {
    //         inr: { min: 1500, max: 2400 },
    //         usd: { min: 18, max: 28 },
    //       },
    //     },
    //     {
    //       level: "Mid-Level",
    //       rateRange: {
    //         inr: { min: 2200, max: 3400 },
    //         usd: { min: 26, max: 40 },
    //       },
    //     },
    //     {
    //       level: "Senior",
    //       rateRange: {
    //         inr: { min: 2800, max: 4200 },
    //         usd: { min: 34, max: 50 },
    //       },
    //     },
    //   ],
    //   discountMockInterview: 15,
    //   defaultCurrency: "USD",
    //   isActive: true,
    //   createdAt: "2025-06-01T14:00:00Z",
    // },
    // {
    //   id: 6,
    //   category: "DevOps & Cloud",
    //   technology: "DevOps Engineer",
    //   levels: [
    //     {
    //       level: "Junior",
    //       rateRange: {
    //         inr: { min: 1600, max: 2600 },
    //         usd: { min: 19, max: 31 },
    //       },
    //     },
    //     {
    //       level: "Mid-Level",
    //       rateRange: {
    //         inr: { min: 2500, max: 3800 },
    //         usd: { min: 30, max: 45 },
    //       },
    //     },
    //     {
    //       level: "Senior",
    //       rateRange: {
    //         inr: { min: 3000, max: 4500 },
    //         usd: { min: 36, max: 54 },
    //       },
    //     },
    //   ],
    //   discountMockInterview: 18,
    //   defaultCurrency: "USD",
    //   isActive: true,
    //   createdAt: "2025-06-01T15:00:00Z",
    // },
    // {
    //   id: 7,
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
    //   createdAt: "2025-06-01T16:00:00Z",
    // },
  ]);

  useEffect(() => {
    // Fetch rate cards from API
    const fetchRateCards = async () => {
      try {
        const response = await axios.get(
          `${config.REACT_APP_API_URL}/rate-cards`
        );
        console.log("Fetched rate cards at Kanban:", response.data);
        setRateCards(response.data);
      } catch (error) {
        console.error("Error fetching rate cards:", error);
      }
    };

    fetchRateCards();
  }, []); // Add dependency array to avoid infinite calls

  // v1.0.0 ------------------------------------------------------>

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
      setDeleteTarget(null); // close modal
    } catch (error) {
      notify.error("Failed to delete rate card");
      console.error("Error deleting rate card:", error);
    } finally {
      setLoading(false);
    }
  };
  // v1.0.1 ------------------------------------------------------------------------->

  const categories = [
    "Software Development",
    "Data & AI",
    "Cloud & DevOps",
    "Testing & Quality",
    "Specialized",
  ];

  const filteredCategories =
    filterCategory === "all" ? categories : [filterCategory];

  const getRateCardsByCategory = (category) => {
    return rateCards?.filter((card) => card?.category === category);
  };

  const formatCurrency = (amount, currency) => {
    const symbol = currency === "USD" ? "$" : "₹";
    return `${symbol}${amount?.toLocaleString()}`;
  };

  // const getRateRangeDisplay = (levels, currency) => {
  //   const juniorRate = levels?.find((l) => l?.level === "Junior");
  //   const seniorRate = levels?.find((l) => l?.level === "Senior");

  //   if (!juniorRate || !seniorRate) return "N/A";

  //   const currencyKey = currency.toLowerCase();
  //   const minRate = juniorRate?.rateRange[currencyKey]?.min;
  //   const maxRate = seniorRate?.rateRange[currencyKey]?.max;

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

  const RateCard = ({ rateCard }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4
            className="font-medium text-gray-900 text-sm leading-tight mb-1 truncate cursor-default"
            title={
              Array.isArray(rateCard?.roleName)
                ? rateCard?.roleName?.join(", ")
                : rateCard?.roleName
            }
          >
            {rateCard?.roleName && rateCard?.roleName?.length > 0 ? (
              <>
                {rateCard?.roleName[0]}
                {rateCard?.roleName?.length > 1 && (
                  <span className="text-gray-500">
                    {" "}
                    +{rateCard?.roleName?.length - 1} more
                  </span>
                )}
              </>
            ) : (
              "—"
            )}
          </h4>
          {/* v1.0.2 --------------------------------------------------------------------> */}
          <div className="flex items-center space-x-2">
            <StatusBadge
              status={rateCard?.isActive ? "active" : "inactive"}
              text={rateCard?.isActive ? "Active" : "Inactive"}
            />
            <span className="text-xs text-gray-500 font-mono">
              {rateCard?.defaultCurrency}
            </span>
          </div>
        </div>
        <div className="flex space-x-1 ml-2">
          {/* v1.0.0 ----------------------------------------------------------------------> */}
          <button
            onClick={() => onView(rateCard)}
            className="p-1 text-teal-600 hover:text-teal-900 rounded hover:bg-teal-50"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          {/* v1.0.1 <---------------------------------------------------------------------- */}
          <button
            onClick={() => onEdit(rateCard)}
            className="p-1 text-gray-600 hover:text-gray-900 rounded hover:bg-gray-50"
            title="Edit Rate Card"
          >
            <Pencil className="h-4 w-4" />
          </button>
          {/* v1.0.1 ----------------------------------------------------------------------> */}
          <button
            onClick={() => setDeleteTarget(rateCard)} // open modal
            className="p-1 text-red-600 hover:text-red-900 rounded hover:bg-red-50"
            title="Delete Rate Card"
          >
            <Trash className="h-4 w-4" />
          </button>
          {/* v1.0.0 ------------------------------------------------------------------------> */}
        </div>
      </div>

      <div className="space-y-2">
        <div>
          <div className="text-xs text-gray-500">Rate Range</div>
          <div className="text-sm font-medium text-gray-900">
            {getRateRangeDisplay(rateCard?.levels, rateCard?.defaultCurrency)}
          </div>
          <div className="text-xs text-gray-500">per hour</div>
        </div>

        <div>
          <div className="text-xs text-gray-500 mb-1">Experience Levels</div>
          <div className="flex flex-wrap gap-1">
            {rateCard?.levels?.map((level, index) => (
              <span
                key={index}
                className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-teal-100 text-teal-800"
              >
                {level?.level}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          {/* v1.0.0 <---------------------------------------------------- */}
          {/* <div>
            <div className="text-xs text-gray-500">Mock Discount</div>
            <div className="text-sm font-medium text-gray-900">
              {rateCard.discountMockInterview}%
            </div>
          </div> */}
          {/* v1.0.0 ----------------------------------------------------> */}
          <div className="text-xs text-gray-400">
            {formatDateTime(rateCard?.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-4">
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Total Rate Cards</div>
          <div className="text-xl font-semibold">{rateCards?.length}</div>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Active</div>
          <div className="text-xl font-semibold text-gray-500">
            {rateCards?.filter((card) => card?.isActive)?.length}
          </div>
        </div>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Categories</div>
          <div className="text-xl font-semibold">
            {filteredCategories?.length}
          </div>
        </div>
        {/* v1.0.0 <------------------------------------------------------------------------ */}
        {/* <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200">
          <div className="text-xs text-gray-500">Avg Mock Discount</div>
          <div className="text-xl font-semibold">
            {Math.round(
              rateCards.reduce(
                (sum, card) => sum + card.discountMockInterview,
                0
              ) / rateCards.length
            )}
            %
          </div>
        </div> */}
        {/* v1.0.0 <------------------------------------------------------------------------ */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCategories?.map((category) => {
          const categoryCards = getRateCardsByCategory(category);

          return (
            <div key={category} className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-medium text-gray-900">{category}</h3>
                  <p className="text-sm text-gray-500">
                    {categoryCards?.length} rate cards
                  </p>
                </div>
                <button
                  className="p-2 text-teal-600 hover:text-teal-900 rounded-full hover:bg-white"
                  title="Add Rate Card"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {categoryCards?.length > 0 ? (
                  categoryCards?.map((rateCard) => (
                    <RateCard key={rateCard?._id} rateCard={rateCard} />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No rate cards in this category</p>
                    <button className="mt-2 text-custom-blue hover:text-custom-blue text-sm font-medium">
                      Add First Rate Card
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
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
                Are you sure you want to delete
                {/* v1.0.2 <-------------------------------------------------------------- */}
                <span className="font-medium">
                  {Array.isArray(deleteTarget?.technology)
                    ? deleteTarget.technology[0]
                    : deleteTarget?.technology}
                </span>
                ?
                {/* v1.0.2 --------------------------------------------------------------> */}
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

export default RatesKanbanView;
