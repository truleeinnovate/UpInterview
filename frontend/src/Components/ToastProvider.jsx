import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ToastProvider = () => {
  return (
    <ToastContainer
      position="top-right"     // default fallback
      autoClose={3000}         // close after 3 sec
      hideProgressBar={false}
      newestOnTop={true}
      closeOnClick
      pauseOnHover
      draggable
      theme="light"          // "light", "dark", "colored"
    />
  );
};

export default ToastProvider;
