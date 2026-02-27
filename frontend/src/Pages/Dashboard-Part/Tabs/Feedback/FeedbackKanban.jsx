
/* eslint-disable react/prop-types */

// v1.0.0-----Venkatesh---in kanban view 4 cards shown in 2xl grid and add effectivePermissions_RoleName === "Individual_Freelancer" || effectivePermissions_RoleName === "Individual"
// v1.0.1 - Ashok - fixed style issue
// v1.0.2 - Updated - Added horizontal recommendation columns with proper layout

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Pencil,
} from "lucide-react";
import { Star } from "lucide-react";
import Cookies from "js-cookie";
import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode";
import { capitalizeFirstLetter } from "../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter";

const FeedbackKanban = ({ feedbacks, loading, onView, onEdit }) => {
  const [filteredData, setFilteredData] = useState([]);

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);

  useEffect(() => {
    if (feedbacks) {
      setFilteredData(feedbacks);
    }
  }, [feedbacks]);

  // Define columns horizontally - draft first, then all recommendations
  const columns = [
    {
      id: "draft",
      title: "Pending Review",
      status: "draft",
      bgColor: "bg-yellow-50",
      headerColor: "bg-yellow-100",
      textColor: "text-yellow-800",
      borderColor: "border-yellow-200"
    },
    {
      id: "strong-hire",
      title: "Strong Hire",
      recommendation: "Strong Hire",
      bgColor: "bg-green-50",
      headerColor: "bg-green-100",
      textColor: "text-green-800",
      borderColor: "border-green-200"
    },
    {
      id: "hire",
      title: "Hire",
      recommendation: "Hire",
      bgColor: "bg-blue-50",
      headerColor: "bg-blue-100",
      textColor: "text-blue-800",
      borderColor: "border-blue-200"
    },
    {
      id: "maybe",
      title: "Maybe",
      recommendation: "Maybe",
      bgColor: "bg-purple-50",
      headerColor: "bg-purple-100",
      textColor: "text-purple-800",
      borderColor: "border-purple-200"
    },
    {
      id: "no-hire",
      title: "No Hire",
      recommendation: "No Hire",
      bgColor: "bg-red-50",
      headerColor: "bg-red-100",
      textColor: "text-red-800",
      borderColor: "border-red-200"
    },
  ];

  const getColumnItems = (column) => {
    return filteredData.filter((item) => {
      // Check by status first (for draft)
      if (column.status) {
        return item.status === column.status;
      }

      // Check by recommendation from overallImpression
      if (column.recommendation) {
        const recommendation = item.overallImpression?.recommendation;

        if (!recommendation) return false;

        // Case-insensitive comparison
        return recommendation.toLowerCase() === column.recommendation.toLowerCase();
      }

      return false;
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case "draft":
        return <Clock className="w-3 h-3 text-yellow-500" />;
      case "cancelled":
        return <XCircle className="w-3 h-3 text-red-500" />;
      default:
        return <AlertCircle className="w-3 h-3 text-gray-500" />;
    }
  };

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case "Strong Hire":
        return "bg-green-100 text-green-800 border-green-300";
      case "Hire":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Maybe":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "No Hire":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-2.5 h-2.5 ${i <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
        />,
      );
    }
    return stars;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return "N/A";
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full h-[calc(100vh-9rem)] bg-gray-50 rounded-xl p-6 overflow-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-48 bg-gray-200 skeleton-animation rounded"></div>
          <div className="h-8 w-24 bg-gray-200 skeleton-animation rounded"></div>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex-shrink-0 w-80">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
                <div className="h-10 w-full bg-gray-200 skeleton-animation rounded mb-4"></div>
                <div className="space-y-3">
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-200 skeleton-animation rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full h-[calc(100vh-8rem)]  overflow-y-auto bg-gray-50 rounded-xl p-4 overflow-hidden flex flex-col "
    >
      {/* Header */}
      <motion.div
        className="flex items-end  mb-6 flex-shrink-0"
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      > <motion.span
        className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-gray-600 shadow-sm border border-gray-200"
        whileHover={{ scale: 1.05 }}
      >
          Total: {feedbacks?.length || 0} Feedbacks
        </motion.span>
      </motion.div>

      {/* Pending Review Column */}
      <div className=" w-full h-[300px] mb-2">
        <div className="h-full w-full flex flex-col  bg-yellow-50 rounded-lg border border-yellow-200">
          {/* Column Header */}
          <div className="bg-yellow-100 rounded-t-lg p-2 border-b border-yellow-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-yellow-800">Pending Review</h3>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-white text-yellow-800 border border-yellow-200">
                {getColumnItems(columns[0]).length}
              </span>
            </div>
          </div>

          {/* Column Content */}
          <div className="flex w-[600px] h-[600px] p-3  overflow-y-auto">
            <div className="">
              {getColumnItems(columns[0]).map((item) => (
                <FeedbackCard
                  key={item._id}
                  item={item}
                  onView={onView}
                  onEdit={onEdit}
                  tokenPayload={tokenPayload}
                />
              ))}
              {getColumnItems(columns[0]).length === 0 && (
                <div className="bg-white/50 rounded-lg p-4 text-center border border-dashed border-yellow-300">
                  <p className="text-sm text-gray-500">No feedback items</p>
                  <p className="text-xs text-gray-400 mt-1">Drag items here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Strong Hire row */}
      <div className=" w-full h-[300px] mb-2">
        <div className="h-full w-full flex flex-col  bg-green-50 rounded-lg border border-green-200">
          <div className="bg-green-100 rounded-t-lg p-3 border-b border-green-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-green-800">Strong Hire</h3>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-white text-green-800 border border-green-200">
                {getColumnItems(columns[1]).length}
              </span>
            </div>
          </div>
          <div className="flex w-[600px] h-[600px] p-3  overflow-y-auto">
            <div >
              {getColumnItems(columns[1]).map((item) => (
                <FeedbackCard
                  key={item._id}
                  item={item}
                  onView={onView}
                  onEdit={onEdit}
                  tokenPayload={tokenPayload}
                />
              ))}
              {getColumnItems(columns[1]).length === 0 && (
                <div className="bg-white/50 rounded-lg p-4 text-center border border-dashed border-green-300">
                  <p className="text-sm text-gray-500">No feedback items</p>
                  <p className="text-xs text-gray-400 mt-1">Drag items here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hire row */}
      <div className=" w-full h-[300px] mb-2">
        <div className="h-full w-full flex flex-col  bg-blue-50 rounded-lg border border-blue-200">
          <div className="bg-blue-100 rounded-t-lg p-3 border-b border-blue-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-blue-800">Hire</h3>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-white text-blue-800 border border-blue-200">
                {getColumnItems(columns[2]).length}
              </span>
            </div>
          </div>
          <div className="flex w-[600px] h-[600px] p-3  overflow-y-auto">
            <div className="space-y-3">
              {getColumnItems(columns[2]).map((item) => (
                <FeedbackCard
                  key={item._id}
                  item={item}
                  onView={onView}
                  onEdit={onEdit}
                  tokenPayload={tokenPayload}
                />
              ))}
              {getColumnItems(columns[2]).length === 0 && (
                <div className="bg-white/50 rounded-lg p-4 text-center border border-dashed border-blue-300">
                  <p className="text-sm text-gray-500">No feedback items</p>
                  <p className="text-xs text-gray-400 mt-1">Drag items here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Maybe row */}
      <div className=" w-full h-[300px] mb-2">
        <div className="h-full w-full flex flex-col overflow-x-auto  bg-purple-50 rounded-lg border border-purple-200">
          <div className="bg-purple-100 rounded-t-lg p-3 border-b border-purple-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-purple-800">Maybe</h3>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-white text-purple-800 border border-purple-200">
                {getColumnItems(columns[3]).length}
              </span>
            </div>
          </div>
          <div className="flex w-[600px] h-[600px] p-3  overflow-x-auto">
            <div className="">
              {getColumnItems(columns[3]).map((item) => (
                <FeedbackCard
                  key={item._id}
                  item={item}
                  onView={onView}
                  onEdit={onEdit}
                  tokenPayload={tokenPayload}
                />
              ))}
              {getColumnItems(columns[3]).length === 0 && (
                <div className="bg-white/50 rounded-lg p-4 text-center border border-dashed border-purple-300">
                  <p className="text-sm text-gray-500">No feedback items</p>
                  <p className="text-xs text-gray-400 mt-1">Drag items here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* No Hire row */}
      <div className=" w-full h-[300px] mb-2">
        <div className="h-full w-full flex flex-col  bg-red-50 rounded-lg border border-red-200">
          <div className="bg-red-100 rounded-t-lg p-3 border-b border-red-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-red-800">No Hire</h3>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-white text-red-800 border border-red-200">
                {getColumnItems(columns[4]).length}
              </span>
            </div>
          </div>
          <div className="flex w-[600px] h-[600px] p-3  overflow-y-auto">
            <div className="space-y-3">
              {getColumnItems(columns[4]).map((item) => (
                <FeedbackCard
                  key={item._id}
                  item={item}
                  onView={onView}
                  onEdit={onEdit}
                  tokenPayload={tokenPayload}
                />
              ))}
              {getColumnItems(columns[4]).length === 0 && (
                <div className="bg-white/50 rounded-lg p-4 text-center border border-dashed border-red-300">
                  <p className="text-sm text-gray-500">No feedback items</p>
                  <p className="text-xs text-gray-400 mt-1">Drag items here</p>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* </div> */}
        {/* </div> */}
      </div>
    </motion.div>
  );
};

// Extract Feedback Card as a separate component for reusability
const FeedbackCard = ({ item, onView, onEdit, tokenPayload }) => {
  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case "Strong Hire":
        return "bg-green-100 text-green-800 border-green-300";
      case "Hire":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Maybe":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "No Hire":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-2.5 h-2.5 ${i <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
            }`}
        />
      );
    }
    return stars;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "submitted":
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case "draft":
        return <Clock className="w-3 h-3 text-yellow-500" />;
      default:
        return <AlertCircle className="w-3 h-3 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return "N/A";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer"
      whileHover={{ scale: 1.02 }}
      onClick={() => onView(item)}
    >
      {/* Header with Avatar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center min-w-0 flex-1">
          <div className="w-6 h-6 bg-[#217989] rounded-full flex items-center justify-center text-white text-[10px] font-medium flex-shrink-0">
            {capitalizeFirstLetter(item.candidateId?.FirstName?.[0] || "U")}
          </div>
          <div className="ml-2 min-w-0">
            <p className="font-medium text-xs text-gray-900 truncate">
              {capitalizeFirstLetter(item.candidateId?.FirstName || "")}{" "}
              {capitalizeFirstLetter(item.candidateId?.LastName || "")}
            </p>
            <p className="text-[9px] text-gray-500 truncate">
              {item.positionId?.title || "No Position"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-0.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            className="text-custom-blue hover:bg-custom-blue/10 p-0.5 rounded transition-colors"
            onClick={() => onView(item)}
            title="View Details"
          >
            <Eye className="w-3 h-3" />
          </button>

          {item.status === "draft" && item?.ownerId?._id === tokenPayload?.userId && (
            <button
              className="text-green-600 hover:bg-green-50 p-0.5 rounded transition-colors"
              onClick={() => onEdit(item)}
              title="Edit Feedback"
            >
              <Pencil className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Interviewer and Date */}
      <div className="grid grid-cols-2 gap-1 text-[9px] mb-2">
        <div>
          <p className="text-gray-500">Interviewer</p>
          <p className="font-medium text-gray-800 truncate">
            {capitalizeFirstLetter(item.interviewerId?.firstName || "N/A")}
          </p>
        </div>
        <div>
          <p className="text-gray-500">Date</p>
          <p className="font-medium text-gray-800 truncate">
            {formatDate(item.interviewRoundId?.dateTime)}
          </p>
        </div>
      </div>

      {/* Rating and Status */}
      <div className="flex items-center justify-between mb-2">
        {item.overallImpression?.overallRating > 0 ? (
          <div className="flex items-center">
            <span className="text-[9px] text-gray-500 mr-0.5">Rating:</span>
            <div className="flex">
              {renderStars(item.overallImpression.overallRating)}
            </div>
          </div>
        ) : (
          <div></div>
        )}
        <div className="flex items-center">
          {getStatusIcon(item.status)}
          <span className="text-[9px] text-gray-600 ml-0.5 capitalize">
            {item.status}
          </span>
        </div>
      </div>

      {/* Recommendation Badge */}
      {item.overallImpression?.recommendation && (
        <div className="mb-2">
          <span
            className={`inline-flex px-1.5 py-0.5 text-[8px] font-semibold rounded-full border ${getRecommendationColor(
              item.overallImpression.recommendation,
            )}`}
          >
            {item.overallImpression.recommendation}
          </span>
        </div>
      )}

      {/* Comments */}
      {item.generalComments && (
        <div className="mt-1">
          <p className="text-[9px] text-gray-500 mb-0.5">Comments</p>
          <p className="text-[9px] text-gray-700 line-clamp-2 italic">
            "{capitalizeFirstLetter(item.generalComments)}"
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default FeedbackKanban;

// /* eslint-disable react/prop-types */

// // v1.0.0-----Venkatesh---in kanban view 4 cards shown in 2xl grid and add effectivePermissions_RoleName === "Individual_Freelancer" || effectivePermissions_RoleName === "Individual"
// // v1.0.1 - Ashok - fixed style issue

// import React, { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import {
//   Eye,
//   CheckCircle,
//   Clock,
//   XCircle,
//   AlertCircle,
//   Pencil,
// } from "lucide-react";
// import { Star } from "lucide-react";
// import Cookies from "js-cookie";
// import { decodeJwt } from "../../../../utils/AuthCookieManager/jwtDecode";
// import { capitalizeFirstLetter } from "../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter";

// const FeedbackKanban = ({ feedbacks, loading, onView, onEdit }) => {
//   const [filteredData, setFilteredData] = useState([]);

//   const authToken = Cookies.get("authToken");
//   const tokenPayload = decodeJwt(authToken);
//   // console.log("tokenPayload", tokenPayload);
//   useEffect(() => {
//     if (feedbacks) {
//       setFilteredData(feedbacks);
//     }
//   }, [feedbacks]);

//   const columns = [
//     { id: "draft", title: "Pending Review", status: "draft" },
//     { id: "completed", title: "Completed", status: "submitted" },
//     { id: "maybe", title: "Maybe", recommendation: "Maybe" },
//   ];

//   const getColumnItems = (column) => {
//     return filteredData.filter((item) => {
//       if (column.status) {
//         return item.status === column.status;
//       }
//       if (column.recommendation) {
//         if (Array.isArray(column.recommendation)) {
//           return column.recommendation.includes(item.recommendation);
//         }
//         return item.recommendation === column.recommendation;
//       }
//       return false;
//     });
//   };

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case "completed":
//         return <CheckCircle className="w-4 h-4 text-green-500" />;
//       case "draft":
//         return <Clock className="w-4 h-4 text-yellow-500" />;
//       case "cancelled":
//         return <XCircle className="w-4 h-4 text-red-500" />;
//       default:
//         return <AlertCircle className="w-4 h-4 text-gray-500" />;
//     }
//   };

//   const getRecommendationColor = (recommendation) => {
//     switch (recommendation) {
//       case "Yes":
//         return "bg-green-50 text-green-700 border-green-200";
//       case "No":
//         return "bg-red-50 text-red-700 border-red-200";
//       case "Maybe":
//         return "bg-yellow-50 text-yellow-700 border-yellow-200";
//       default:
//         return "bg-gray-50 text-gray-700 border-gray-200";
//     }
//   };

//   const renderStars = (rating) => {
//     const stars = [];
//     for (let i = 1; i <= 5; i++) {
//       stars.push(
//         <Star
//           key={i}
//           className={`w-3 h-3 ${
//             i <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
//           }`}
//         />,
//       );
//     }
//     return stars;
//   };

//   if (loading) {
//     return (
//       <motion.div
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//         transition={{ duration: 0.3 }}
//         className="w-full h-[calc(100vh-9rem)] bg-gray-50 rounded-xl p-6 overflow-y-auto pb-10"
//       >
//         <div className="flex items-center justify-between mb-6">
//           <div className="h-8 w-1/4 bg-gray-200 skeleton-animation rounded"></div>
//           <div className="h-8 w-20 bg-gray-200 skeleton-animation rounded"></div>
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 w-full">
//           {[...Array(6)].map((_, index) => (
//             <motion.div
//               key={index}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: index * 0.1 }}
//               className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 flex flex-col h-full"
//             >
//               <div className="flex justify-between items-start mb-4 gap-2">
//                 <div className="flex-1 min-w-0 space-y-2">
//                   <div className="h-6 w-3/4 bg-gray-200 skeleton-animation rounded"></div>
//                   <div className="h-4 w-1/2 bg-gray-200 skeleton-animation rounded"></div>
//                 </div>
//                 <div className="flex gap-2">
//                   <div className="h-8 w-8 bg-gray-200 skeleton-animation rounded-lg"></div>
//                   <div className="h-8 w-8 bg-gray-200 skeleton-animation rounded-lg"></div>
//                 </div>
//               </div>
//               <div className="mt-auto space-y-3">
//                 <div className="grid grid-cols-2 gap-2">
//                   <div className="space-y-1">
//                     <div className="h-3 w-16 bg-gray-200 skeleton-animation rounded"></div>
//                     <div className="h-4 w-full bg-gray-200 skeleton-animation rounded"></div>
//                   </div>
//                   <div className="space-y-1">
//                     <div className="h-3 w-16 bg-gray-200 skeleton-animation rounded"></div>
//                     <div className="h-4 w-full bg-gray-200 skeleton-animation rounded"></div>
//                   </div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-2">
//                   <div className="h-6 w-16 bg-gray-200 skeleton-animation rounded-full"></div>
//                   <div className="h-6 w-16 bg-gray-200 skeleton-animation rounded-full"></div>
//                 </div>
//                 <div className="grid grid-cols-2 gap-2">
//                   <div className="space-y-1">
//                     <div className="h-3 w-16 bg-gray-200 skeleton-animation rounded"></div>
//                     <div className="h-4 w-full bg-gray-200 skeleton-animation rounded"></div>
//                   </div>
//                 </div>
//               </div>
//             </motion.div>
//           ))}
//         </div>
//       </motion.div>
//     );
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5 }}
//       className="w-full h-[calc(100vh-12rem)] bg-gray-50 rounded-xl px-6 pt-3 overflow-auto"
//     >
//       <div className="h-full w-full pb-8">
//         <motion.div
//           className="flex items-center justify-between mb-4"
//           initial={{ x: -20, opacity: 0 }}
//           animate={{ x: 0, opacity: 1 }}
//           transition={{ duration: 0.3 }}
//         >
//           <h3 className="text-xl font-semibold text-gray-800">All Feedback</h3>
//           <motion.span
//             className="px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-gray-600 shadow-sm border border-gray-200"
//             whileHover={{ scale: 1.05 }}
//           >
//             {feedbacks?.length} Feedback
//           </motion.span>
//         </motion.div>
//         <div className="overflow-x-auto">
//           <div className="w-full overflow-x-auto">
//             <div className="flex gap-4 pb-4" style={{ minWidth: "1200px" }}>
//               {columns.map((column) => (
//                 <div
//                   key={column.id}
//                   className="flex-1 min-w-0"
//                   style={{ minWidth: "240px" }}
//                 >
//                   <div className="bg-white border border-gray-200 rounded-lg p-3">
//                     <div className="flex items-center justify-between mb-3">
//                       <h3 className="font-medium text-gray-900">
//                         {column.title}
//                       </h3>
//                       <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full">
//                         {getColumnItems(column).length}
//                       </span>
//                     </div>
//                     <div className="space-y-2">
//                       {getColumnItems(column).map((item) => (
//                         <div
//                           key={item._id}
//                           className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
//                         >
//                           <div className="flex items-center justify-between mb-2">
//                             <div className="flex items-center">
//                               <div className="w-6 h-6 bg-[#217989] rounded-full flex items-center justify-center text-white text-xs font-medium">
//                                 {capitalizeFirstLetter(
//                                   item.candidateId?.FirstName[0],
//                                 )}
//                               </div>
//                               <span className="ml-2 font-medium text-sm text-gray-900 truncate max-w-[168px]">
//                                 {capitalizeFirstLetter(
//                                   item.candidateId?.FirstName,
//                                 ) +
//                                   " " +
//                                   capitalizeFirstLetter(
//                                     item.candidateId?.LastName,
//                                   )}
//                               </span>
//                             </div>
//                             <div className="inline-flex items-center justify-start space-x-2 mt-3">
//                               <button
//                                 className="text-custom-blue hover:bg-custom-blue/10  p-2 rounded-lg"
//                                 onClick={() => onView(item)}
//                               >
//                                 <Eye className="w-4 h-4 inline text-custom-blue" />
//                               </button>
//                               {item.status === "draft" &&
//                                 item?.ownerId?._id === tokenPayload.userId && (
//                                   <>
//                                     <button
//                                       className="text-green-500 hover:bg-green-50 p-2 rounded-lg"
//                                       onClick={() => onEdit(item)}
//                                     >
//                                       <Pencil className="w-4 h-4 inline text-green-500" />
//                                     </button>
//                                   </>
//                                 )}
//                             </div>
//                           </div>
//                           <div className="grid grid-cols-2">
//                             <p className="text-sm text-gray-500">Position</p>
//                             <p
//                               className="text-sm text-gray-800 font-medium mb-2 truncate max-w-[140px]"
//                               title={capitalizeFirstLetter(
//                                 item.positionId?.title,
//                               )}
//                             >
//                               {capitalizeFirstLetter(item.positionId?.title) ||
//                                 "N/A"}
//                             </p>
//                           </div>
//                           <div className="grid grid-cols-2">
//                             <p className="text-sm text-gray-500">Candidate</p>
//                             <p className="text-sm text-gray-800 font-medium mb-2 truncate max-w-[140px]">
//                               <span className="truncate">
//                                 {capitalizeFirstLetter(
//                                   item.interviewerId?.firstName,
//                                 ) +
//                                   " " +
//                                   capitalizeFirstLetter(
//                                     item.interviewerId?.lastName,
//                                   )}
//                               </span>
//                             </p>
//                           </div>
//                           <div className="grid grid-cols-2">
//                             <p className="text-sm text-gray-500">Date</p>
//                             <p className="text-sm text-gray-800 font-medium mb-2 truncate max-w-[140px]">
//                               <span className="truncate">
//                                 {item.interviewRoundId?.dateTime || "N/A"}
//                               </span>
//                             </p>
//                           </div>
//                           {item.overallImpression?.overallRating > 0 && (
//                             <div className="grid grid-cols-2">
//                               <p className="text-sm text-gray-500">Rating</p>
//                               <p className="text-sm text-gray-800 font-medium truncate max-w-[140px]">
//                                 <div className="flex">
//                                   {renderStars(
//                                     item.overallImpression?.overallRating,
//                                   )}
//                                 </div>
//                               </p>
//                             </div>
//                           )}
//                           <div className="grid grid-cols-2 mt-2">
//                             <p className="text-sm text-gray-500">
//                               Recommendation
//                             </p>
//                             <p className="text-sm text-gray-800 font-medium mb-2 truncate max-w-[140px]">
//                               <div
//                                 className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getRecommendationColor(
//                                   item.overallImpression?.recommendation,
//                                 )}`}
//                               >
//                                 {item.overallImpression?.recommendation}
//                               </div>
//                             </p>
//                           </div>
//                           {item.generalComments && (
//                             <div
//                               className="grid grid-cols-2"
//                               title={capitalizeFirstLetter(
//                                 item.generalComments,
//                               )}
//                             >
//                               <p className="text-sm text-gray-500">Comments</p>
//                               <p className="text-sm text-gray-800 font-medium mb-2 truncate max-w-[140px]">
//                                 {capitalizeFirstLetter(item.generalComments)}
//                               </p>
//                             </div>
//                           )}
//                           {/* <div className="grid grid-cols-2">
//                             <p className="text-sm text-gray-500">Status</p>
//                             <p className="text-sm text-gray-800 font-medium mb-2 truncate max-w-[140px]">
//                               {getStatusIcon(item.interviewRoundId?.status)}
//                               <span>{item.interviewRoundId?.status}</span>
//                             </p>
//                           </div> */}
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </motion.div>
//   );
// };

// export default FeedbackKanban;
