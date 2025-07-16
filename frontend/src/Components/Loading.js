// import React from "react";

// const Loading = ({ message = "Loading...", size = "medium", className = "" }) => {
//   const sizeClasses = {
//     // small: "w-4 h-4",
//     // medium: "w-8 h-8",
//     large: "w-12 h-12"
//   };

//   return (
//     <div className={`flex flex-col items-center justify-center min-h-screen bg-gray-50 ${className}`}>
//       <div className="flex flex-col items-center space-y-4">
//         <div className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-200 border-t-custom-blue`}></div>
//         {message && (
//           <p className="text-gray-600 text-sm font-medium">{message}</p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Loading;

// import React from 'react';

// const Loading = ({ message = "Loading..." }) => {
//   return (
//     <div className="fixed inset-0 flex items-center justify-center z-50">
//       <div className="flex flex-col items-center space-y-4">
//         <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-custom-blue"></div>
//         <p className="text-center text-gray-600">{message}</p>
//       </div>
//     </div>
//   );
// };

// export default Loading;

import React from "react";

const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-25 backdrop-blur-md flex flex-col items-center justify-center space-y-4">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-custom-blue border-t-transparent"></div>
      <p className="text-center text-gray-700 text-sm font-medium">{message}</p>
    </div>
  );
};

export default Loading;

