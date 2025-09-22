// v1.0.2 - Ashok - Implemented scroll lock hook for conditional scroll locking
// created by Ashok 
// commented code to test performance impact because some pages do not have scrollbar 

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
