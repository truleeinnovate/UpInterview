// // v1.0.0 - Ashok - Improved responsiveness

// v1.0.1 - Ashok - UI polish: better spacing, rounded corners, shadow, transitions

import React from "react";
import { AlertCircle } from "lucide-react";

const ConfirmationPopup = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Yes, I'm sure",
  cancelText = "No, cancel",
  singleButton = false,
  onSingleButtonClick,
  singleButtonText = "OK",
}) => {
  if (!isOpen) return null;

  return (
    // v1.0.1 <--------------------------------------------------------------------------------
    <div
      style={{ zIndex: "9999" }}
      className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity"
    >
      {/* Added max-w-md for responsive width, smoother UI */}
      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all scale-100 hover:scale-[1.01]">
        <div className="text-center">
          {/* Made icon slightly larger + margin adjustments */}
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />

          {/* Title: bold, darker gray */}
          <h3 className="mb-3 text-xl font-semibold text-gray-800">{title}</h3>

          {/* Message: softer gray + better readability */}
          <p className="mb-6 text-sm text-gray-600">{message}</p>

          {/* Buttons: spacing + styling improvements */}
          <div className="flex justify-center gap-3">
            {singleButton ? (
              <button
                className="px-5 py-2 rounded-xl bg-custom-blue text-white font-medium  focus:outline-none focus:ring-2  transition"
                onClick={onSingleButtonClick}
              >
                {singleButtonText}
              </button>
            ) : (
              <>
                <button
                  className="px-5 py-2 rounded-xl bg-custom-blue text-white font-medium  focus:outline-none focus:ring-2  transition"
                  onClick={onConfirm}
                >
                  {confirmText}
                </button>
                <button
                  className="px-5 py-2 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 transition"
                  onClick={onCancel}
                >
                  {cancelText}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
    // v1.0.1 -------------------------------------------------------------------------------->
  );
};

export default ConfirmationPopup;

// import React from 'react';
// const ConfirmationPopup = ({
//   isOpen,
//   title,
//   message,
//   onConfirm,
//   onCancel,
//   confirmText = "Yes, I'm sure",
//   cancelText = "No, cancel",
//   singleButton = false,
//   onSingleButtonClick,
//   singleButtonText = "OK",
// }) => {
//   if (!isOpen) return null;

//   return (
//     // v1.0.0 <--------------------------------------------------------------------------------
//     <div
//       style={{ zIndex: "9999" }}
//       className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center"
//     >
//       <div className="bg-white p-8 rounded-lg shadow-lg m-4">
//         <div className="text-center">
//           <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-red-500" />
//           <h3 className="mb-5 text-lg font-normal text-gray-500">{title}</h3>
//           <p className="mb-5 text-gray-500">{message}</p>
//           <div className="flex justify-center gap-4">
//             {singleButton ? (
//               <button
//                 className="text-white bg-custom-blue  hover:bg-gray-500 hover:text-white border rounded p-2"
//                 onClick={onSingleButtonClick}
//               >
//                 {singleButtonText}
//               </button>
//             ) : (
//               <>
//                 <button
//                   className="text-white bg-custom-blue border rounded p-2"
//                   onClick={onConfirm}
//                 >
//                   {confirmText}
//                 </button>
//                 <button
//                   className="text-white bg-red-500 hover:bg-gray-500 border hover:text-white rounded p-2"
//                   onClick={onCancel}
//                 >
//                   {cancelText}
//                 </button>
//               </>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//     // v1.0.0 -------------------------------------------------------------------------------->
//   );
// };

// export default ConfirmationPopup;
