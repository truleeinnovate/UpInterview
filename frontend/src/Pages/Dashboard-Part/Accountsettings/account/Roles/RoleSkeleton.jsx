// // v1.0.0  -  mansoor  -  added this skeleton in the role.jsx file itself and removed in this place

// import React from 'react';
// const RoleSkeleton = () => {
//   return (
//     <div className="space-y-6 mb-4 skeleton-animation">
//       {/* Header skeleton */}
//       <div className="flex justify-between items-center mt-3 px-3">
//         <div className="h-6 bg-gray-200 rounded w-48"></div>
//         <div className="h-8 bg-gray-200 rounded w-24"></div>
//       </div>

//       {/* Main content skeleton */}
//       <div className="bg-white px-3 rounded-lg shadow py-3 mx-3">
//         <div className="flex justify-between items-center mb-4">
//           <div className="h-6 bg-gray-200 rounded w-32"></div>
//           <div className="h-4 bg-gray-200 rounded w-24"></div>
//         </div>

//         {/* Role cards skeleton */}
//         <div className="space-y-6">
//           {[1, 2, 3].map((index) => (
//             <div key={index} className="bg-white p-5 rounded-lg shadow">
//               <div className="flex justify-between items-start mb-4">
//                 <div className="flex-1">
//                   <div className="flex items-center gap-2 mb-1">
//                     <div className="h-5 bg-gray-200 rounded w-32"></div>
//                     <div className="h-4 bg-gray-200 rounded w-16"></div>
//                   </div>
//                   <div className="h-4 bg-gray-200 rounded w-64 mb-2"></div>
//                 </div>
//                 <div className="h-8 w-8 bg-gray-200 rounded"></div>
//               </div>

//               <div className="mt-4">
//                 <div className="h-5 bg-gray-200 rounded w-24 mb-3"></div>
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                   {[1, 2, 3].map((permIndex) => (
//                     <div key={permIndex} className="space-y-2">
//                       <div className="h-4 bg-gray-200 rounded w-20"></div>
//                       <div className="space-y-1">
//                         {[1, 2, 3].map((itemIndex) => (
//                           <div key={itemIndex} className="flex items-center">
//                             <div className="h-3 w-3 bg-gray-200 rounded mr-2"></div>
//                             <div className="h-3 bg-gray-200 rounded w-16"></div>
//                           </div>
//                         ))}
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RoleSkeleton; 

import React from 'react'

const RoleSkeleton = () => {
  return (
    <div>RoleSkeleton</div>
  )
}

export default RoleSkeleton