// /* eslint-disable react/prop-types */
// import React from "react";
// import { IoClose } from "react-icons/io5";
// import axios from "axios";
// import toast from "react-hot-toast";
// import { config } from "../../config";
// import { useUpdateInterviewerFeedback } from "../../apiHooks/superAdmin/useOutsourceInterviewers";

// const FeedbackStatusChangeModal = ({
//   showStatusModal,
//   statusOptions,
//   newStatus,
//   setNewStatus,
//   interviewer,
//   onClose,
// }) => {
//   console.log("check 4 :", newStatus);

//   const handleFormSubmit = async (e) => {
//     e.preventDefault();

//     // Ensure the latest state values are used
//     console.log("Updated Status Before API Call:", newStatus.status);

//     const updatedStatus = newStatus.status;
//     const updatedRating = newStatus.rating;
//     const updatedComments = newStatus.comments;

//     try {
//       const response = await axios.patch(
//         `${config.REACT_APP_API_URL}/outsourceInterviewers`,
//         {
//           contactId: interviewer._id,
//           givenBy: interviewer._id,
//           status: updatedStatus,
//           rating: updatedRating,
//           comments: updatedComments,
//         }
//       );

//       console.log("STATUS RESPONSE: ", response);

//       console.log("Feedback updated successfully", response.data);
//       toast.success("Feedback Updated Successfully!");
//       onClose();
//     } catch (error) {
//       console.error("Failed to update feedback", error);
//       toast.error("Error updating feedback");
//     }
//   };

//   return (
//     showStatusModal && (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
//         <div className="bg-white w-1/2 md:w-2/3 lg:w-1/2 h-full flex flex-col">
//           {/* Header */}
//           <div className="bg-custom-blue text-white sticky top-0 z-10 flex justify-between items-center p-4 border-b h-16">
//             <h2 className="text-lg font-semibold">Change Status</h2>
//             <button
//               onClick={onClose}
//               className="text-white hover:text-gray-200"
//             >
//               <IoClose size={20} />
//             </button>
//           </div>

//           {/* Form */}
//           <form className="p-6 h-full">
//             <div className="flex items-center mb-4">
//               <label className="block text-sm font-medium text-gray-700 w-[50%]">
//                 Select New Status <span className="text-red-500">*</span>
//               </label>
//               <select
//                 value={newStatus.status}
//                 required
//                 onChange={(e) =>
//                   setNewStatus({ ...newStatus, status: e.target.value })
//                 }
//                 className="block w-full px-3 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm"
//               >
//                 <option value="" hidden>
//                   New
//                 </option>
//                 {statusOptions.map((status) => (
//                   <option className="text-gray-700" key={status} value={status}>
//                     {status}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="flex items-center mb-4">
//               <label className="block text-sm font-medium text-gray-700 w-[50%]">
//                 Rating <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="number"
//                 value={newStatus.rating || ""}
//                 required
//                 onChange={(e) =>
//                   setNewStatus({
//                     ...newStatus,
//                     rating: parseFloat(e.target.value),
//                   })
//                 }
//                 className="block w-full px-3 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm"
//                 step="0.1"
//                 min="0"
//                 max="5"
//               />
//             </div>

//             <div className="flex mb-4">
//               <label className="block text-sm font-medium text-gray-700 w-[49%]">
//                 Notes
//               </label>
//               <div className="w-full">
//                 <textarea
//                   value={newStatus.comments || ""}
//                   onChange={(e) =>
//                     setNewStatus({ ...newStatus, comments: e.target.value })
//                   }
//                   className="block w-full px-3 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm h-40"
//                   placeholder="Enter your notes here..."
//                   maxLength={250}
//                 ></textarea>
//                 <div className="text-right text-sm text-gray-500">
//                   {newStatus.comments?.length || 0}/250
//                 </div>
//               </div>
//             </div>
//           </form>
//           <div className="sticky w-full bottom-0 z-10 flex justify-end gap-4 p-4 border-t bg-white">
//             <button
//               type="button"
//               onClick={handleFormSubmit}
//               className="px-4 py-2 bg-custom-blue text-white rounded-md hover:bg-custom-blue"
//             >
//               Save
//             </button>
//           </div>
//         </div>
//       </div>
//     )
//   );
// };

// export default FeedbackStatusChangeModal;

/* eslint-disable react/prop-types */
import React from "react";
import { IoClose } from "react-icons/io5";
import { useUpdateInterviewerFeedback } from "../../apiHooks/superAdmin/useOutsourceInterviewers";

const FeedbackStatusChangeModal = ({
  showStatusModal,
  statusOptions,
  newStatus,
  setNewStatus,
  interviewer,
  onClose,
}) => {
  const { mutate, isPending } = useUpdateInterviewerFeedback();

  const handleFormSubmit = (e) => {
    e.preventDefault();

    const payload = {
      contactId: interviewer._id,
      givenBy: interviewer._id,
      status: newStatus.status,
      rating: newStatus.rating,
      comments: newStatus.comments,
    };

    mutate(payload, {
      onSuccess: () => {
        onClose(); // Close modal after successful update
      },
    });
  };

  return (
    showStatusModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-end z-50">
        <div className="bg-white w-1/2 md:w-2/3 lg:w-1/2 h-full flex flex-col">
          {/* Header */}
          <div className="bg-custom-blue text-white sticky top-0 z-10 flex justify-between items-center p-4 border-b h-16">
            <h2 className="text-lg font-semibold">Change Status</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200"
            >
              <IoClose size={20} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="p-6 h-full">
            <div className="flex items-center mb-4">
              <label className="block text-sm font-medium text-gray-700 w-[50%]">
                Select New Status <span className="text-red-500">*</span>
              </label>
              <select
                value={newStatus.status}
                required
                onChange={(e) =>
                  setNewStatus({ ...newStatus, status: e.target.value })
                }
                className="block w-full px-3 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm"
              >
                <option value="" hidden>
                  New
                </option>
                {statusOptions.map((status) => (
                  <option className="text-gray-700" key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center mb-4">
              <label className="block text-sm font-medium text-gray-700 w-[50%]">
                Rating <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={newStatus.rating || ""}
                required
                onChange={(e) =>
                  setNewStatus({
                    ...newStatus,
                    rating: parseFloat(e.target.value),
                  })
                }
                className="block w-full px-3 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm"
                step="0.1"
                min="0"
                max="5"
              />
            </div>

            <div className="flex mb-4">
              <label className="block text-sm font-medium text-gray-700 w-[49%]">
                Notes
              </label>
              <div className="w-full">
                <textarea
                  value={newStatus.comments || ""}
                  onChange={(e) =>
                    setNewStatus({ ...newStatus, comments: e.target.value })
                  }
                  className="block w-full px-3 py-2.5 text-gray-900 border rounded-lg shadow-sm focus:ring-2 sm:text-sm h-40"
                  placeholder="Enter your notes here..."
                  maxLength={250}
                ></textarea>
                <div className="text-right text-sm text-gray-500">
                  {newStatus.comments?.length || 0}/250
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky w-full bottom-0 z-10 flex justify-end gap-4 p-4 border-t bg-white">
              <button
                type="submit"
                disabled={isPending}
                className={`px-4 py-2 text-white rounded-md ${
                  isPending
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-custom-blue hover:bg-custom-blue"
                }`}
              >
                {isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  );
};

export default FeedbackStatusChangeModal;
