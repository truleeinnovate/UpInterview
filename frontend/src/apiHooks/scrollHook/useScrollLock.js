// v1.0.2 - Ashok - Implemented scroll lock hook for conditional scroll locking
// created by Ashok
// commented code to test performance impact because some pages do not have scrollbar
// v1.0.3 - Ashok - Improved scroll lock to handle multiple modals

import { useEffect } from "react";

// export const useScrollLock = (locked = false) => {
//   // useEffect(() => {
//   //   const originalStyle = window.getComputedStyle(document.body).overflow;

//   //   if (locked) {
//   //     document.body.style.overflow = "hidden";
//   //   } else {
//   //     document.body.style.overflow = originalStyle;
//   //   }

//   //   return () => {
//   //     document.body.style.overflow = originalStyle;
//   //   };
//   // }, [locked]);
// };

let lockCount = 0; // global counter for multiple modals

export const useScrollLock = (locked = false) => {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    // Helper: get scrollbar width
    const getScrollbarWidth = () => {
      return window.innerWidth - document.documentElement.clientWidth;
    };

    if (locked) {
      if (lockCount === 0) {
        const scrollbarWidth = getScrollbarWidth();

        // Prevent layout shift by adding padding
        if (scrollbarWidth > 0) {
          body.style.paddingRight = `${scrollbarWidth}px`;
        }

        html.style.overflow = "hidden";
        body.style.overflow = "hidden";
      }
      lockCount++;
    } else {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        html.style.overflow = "auto";
        body.style.overflow = "auto";
        body.style.paddingRight = ""; // reset
      }
    }

    // Cleanup on unmount
    return () => {
      if (locked) {
        lockCount = Math.max(0, lockCount - 1);
        if (lockCount === 0) {
          html.style.overflow = "auto";
          body.style.overflow = "auto";
          body.style.paddingRight = "";
        }
      }
    };
  }, [locked]);
};
