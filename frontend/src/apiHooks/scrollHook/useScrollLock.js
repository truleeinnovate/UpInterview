// v1.0.0 - Ashok - Implemented scroll lock hook for conditional scroll locking
// created by Ashok 
// v1.0.1 - Ashok - Commented for testing because some pages don't have scrollbar


import { useEffect } from "react";

export const useScrollLock = (locked = false) => {
  // useEffect(() => {
  //   const originalStyle = window.getComputedStyle(document.body).overflow;

  //   if (locked) {
  //     document.body.style.overflow = "hidden";
  //   } else {
  //     document.body.style.overflow = originalStyle;
  //   }

  //   return () => {
  //     document.body.style.overflow = originalStyle;
  //   };
  // }, [locked]);
};
