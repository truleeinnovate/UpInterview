// import React, { useState, useEffect } from 'react';
// import AuthCookieManager from '../utils/AuthCookieManager/AuthCookieManager';

// const PermissionRequestModal = ({ isOpen, onClose, onPermissionsGranted }) => {
//   const [notificationPermission, setNotificationPermission] = useState(false);
//   const [isRequesting, setIsRequesting] = useState(false);
//   const [hasRequested, setHasRequested] = useState(false);

//   useEffect(() => {
//     if (isOpen) {
//       // Check current notification permission when modal opens
//       const currentPermissions = AuthCookieManager.checkBrowserPermissions();
//       setNotificationPermission(currentPermissions.notifications);
//     }
//   }, [isOpen]);

//   const handleRequestNotificationPermission = async () => {
//     setIsRequesting(true);
//     try {
//       const granted = await AuthCookieManager.requestNotificationPermission();
//       setNotificationPermission(granted);
//       setHasRequested(true);
      
//       if (granted && onPermissionsGranted) {
//         onPermissionsGranted({ notifications: granted });
//       }
//     } catch (error) {
//       console.error('Error requesting notification permission:', error);
//     } finally {
//       setIsRequesting(false);
//     }
//   };

//   const handleClose = () => {
//     setHasRequested(false);
//     onClose();
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
//         <h2 className="text-xl font-semibold mb-4">Notification Permission Required</h2>
        
//         <div className="space-y-4 mb-6">
//           <div className="flex items-center justify-between">
//             <span>Browser Notifications</span>
//             <span className={`px-2 py-1 rounded text-sm ${
//               notificationPermission ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//             }`}>
//               {notificationPermission ? 'Granted' : 'Not Granted'}
//             </span>
//           </div>
//         </div>

//         {hasRequested && (
//           <div className="mb-4 p-3 bg-blue-50 rounded">
//             <p className="text-sm text-blue-800">
//               {notificationPermission 
//                 ? 'Notification permission granted successfully!' 
//                 : 'Notification permission was denied. You can enable it later in your browser settings.'
//               }
//             </p>
//           </div>
//         )}

//         <div className="flex space-x-3">
//           <button
//             onClick={handleRequestNotificationPermission}
//             disabled={isRequesting || notificationPermission}
//             className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
//           >
//             {isRequesting ? 'Requesting...' : notificationPermission ? 'Permission Granted' : 'Request Permission'}
//           </button>
          
//           <button
//             onClick={handleClose}
//             className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
//           >
//             Close
//           </button>
//         </div>
        
//         <p className="text-xs text-gray-600 mt-4">
//           Browser notifications are needed to receive important updates about interviews, assessments, and other activities. 
//           You can change this later in your browser settings.
//         </p>
//       </div>
//     </div>
//   );
// };

// export default PermissionRequestModal; 