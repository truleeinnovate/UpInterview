import { toast } from "react-toastify";

export const notify = {
  // ✅ General Success/Info/Error → Top-Right
  success: (msg) =>
    toast.success(msg, {
      position: "top-right",
    }),
  warning: (msg) =>
    toast.warning(msg, {
      position: "top-right",
    }),

  error: (msg, options = {}) =>
    toast.error(msg, {
      position: "top-right",
      ...options,
    }),

  info: (msg) =>
    toast.info(msg, {
      position: "top-right",
    }),

  // 🚨 Critical Alerts → Top-Center
  critical: (msg) =>
    toast.error(msg, {
      position: "top-center",
      autoClose: 5000,
      theme: "colored",
    }),

  // ⏰ Meeting Timer Alerts → Top-Center, persistent (user must close manually via X)
  meetingAlert: (msg) =>
    toast.warning(msg, {
      position: "top-center",
      autoClose: false,
      closeOnClick: false,
      closeButton: true,
      draggable: false,
      theme: "colored",
      style: { width: "fit-content", whiteSpace: "nowrap" },
    }),

  // ✋ Hand Raise Alerts → Top-Center, auto-close after 3 seconds
  handRaise: (msg) =>
    toast.info(msg, {
      position: "top-center",
      autoClose: 3000,
      closeOnClick: true,
      closeButton: true,
      draggable: false,
      theme: "colored",
      style: { width: "fit-content", whiteSpace: "nowrap" },
    }),

  // 🕒 Background Info → Bottom-Right
  background: (msg) =>
    toast.info(msg, {
      position: "bottom-right",
    }),
};

//Example code to use toast in any component

// import React from "react";
// import { notify } from "./toastService";

// const ExampleComponent = () => {
//   const handleSave = () => {
//     // form save logic...
//     notify.success("Form saved successfully ✅");
//   };

//   const handleEdit = () => {
//     // edit logic...
//     notify.info("Changes updated ✏️");
//   };

//   const handleError = () => {
//     notify.error("Something went wrong ❌");
//   };

//   const handleSubscriptionExpired = () => {
//     notify.critical("⚠️ Your subscription has expired. Please renew.");
//   };

//   const handleBackgroundTask = () => {
//     notify.background("Report exported in background 📄");
//   };

//   return (
//     <div className="p-4 flex flex-col gap-2">
//       <button onClick={handleSave}>Save Form</button>
//       <button onClick={handleEdit}>Edit Form</button>
//       <button onClick={handleError}>Trigger Error</button>
//       <button onClick={handleSubscriptionExpired}>Subscription Expired</button>
//       <button onClick={handleBackgroundTask}>Background Task</button>
//     </div>
//   );
// };

// export default ExampleComponent;