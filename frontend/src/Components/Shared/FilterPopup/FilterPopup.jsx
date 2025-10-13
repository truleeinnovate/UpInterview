// v1.0.0 - Ashok - Issue fixed added note about that
/*
 * Popup Positioning Note:
 *
 * Problem:
 * When the filter popup was positioned using `position: fixed` together with `window.scrollY`,
 * the popup’s vertical position appeared inconsistent when the page or inner scrollable containers moved.
 * Specifically:
 * - If the page or table container was scrolled to the bottom, the popup would appear with a large gap
 *   below the filter icon, even though it should be immediately below it.
 * - This happened because `window.scrollY` adds the document scroll offset, but `position: fixed`
 *   already positions elements relative to the viewport. Adding scrollY caused double-counting.
 *
 * Solution:
 * - Remove `window.scrollY` from the top calculation.
 * - Use `getBoundingClientRect()` to get the filter icon's position relative to the viewport.
 * - Compute the popup top as:
 *     - `rect.bottom + 8` → default: popup opens below icon
 *     - If there’s not enough space below, open above: `rect.top - popupHeight - 8`
 * - Compute left position relative to viewport and clamp within window width.
 * - Keep `position: fixed` so popup stays aligned to the viewport, unaffected by inner scrollable containers.
 *
 * Result:
 * - Popup always opens next to the filter icon, regardless of scroll position.
 * - Prevents gaps or misalignment caused by scroll offsets.
 * - Ensures consistent UX even when inner containers or page scrollbars are present.
 */

import React, { useEffect, useRef } from "react";

export const FilterPopup = ({
  isOpen,
  onClose,
  onApply,
  onClearAll,
  filterIconRef,
  children,
}) => {
  const popupRef = useRef(null);
  // v1.0.0 <------------------------------------------------------------------
  // Position popup below filter icon and handle window resize
  // useEffect(() => {
  //   if (!isOpen || !filterIconRef?.current || !popupRef.current) return;

  //   const updatePopupPosition = () => {
  //     const rect = filterIconRef.current.getBoundingClientRect();
  //     const popup = popupRef.current;
  //     const popupWidth = 320; // 20rem = 320px

  //     // Calculate left position to ensure popup stays in viewport
  //     let leftPosition = rect.left + window.scrollX;
  //     if (leftPosition + popupWidth > window.innerWidth) {
  //       leftPosition = window.innerWidth - popupWidth - 16; // 16px padding
  //     }
  //     leftPosition = Math.max(16, leftPosition);

  //     // Calculate top position with viewport boundary check
  //     const popupHeight = popup.offsetHeight;
  //     const viewportHeight = window.innerHeight;
  //     const bottomSpace = viewportHeight - rect.bottom - window.scrollY - 16;

  //     let topPosition;
  //     if (bottomSpace < popupHeight && rect.top > popupHeight) {
  //       // Position above if not enough space below
  //       topPosition = rect.top + window.scrollY - popupHeight - 8;
  //     } else {
  //       // Position below
  //       topPosition = rect.bottom + window.scrollY + 8;
  //     }

  //     popup.style.position = 'fixed';
  //     popup.style.top = `${topPosition}px`;
  //     popup.style.left = `${leftPosition}px`;
  //     popup.style.width = `${popupWidth}px`;
  //     popup.style.zIndex = '1000';
  //   };

  //   // Initial position update
  //   updatePopupPosition();

  //   // Update on resize
  //   window.addEventListener('resize', updatePopupPosition);

  //   // Cleanup
  //   return () => {
  //     window.removeEventListener('resize', updatePopupPosition);
  //   };
  // }, [isOpen, filterIconRef]);

  useEffect(() => {
    if (!isOpen || !filterIconRef?.current || !popupRef.current) return;

    const updatePopupPosition = () => {
      const rect = filterIconRef.current.getBoundingClientRect();
      const popup = popupRef.current;
      const popupWidth = 320; // 20rem = 320px

      // Ensure popup fits in viewport horizontally
      let leftPosition = rect.left;
      if (leftPosition + popupWidth > window.innerWidth) {
        leftPosition = window.innerWidth - popupWidth - 16;
      }
      leftPosition = Math.max(16, leftPosition);

      const popupHeight = popup.offsetHeight;
      const viewportHeight = window.innerHeight;
      const bottomSpace = viewportHeight - rect.bottom - 16;

      let topPosition;
      if (bottomSpace < popupHeight && rect.top > popupHeight) {
        // Not enough space below, open above
        topPosition = rect.top - popupHeight - 8;
      } else {
        // Default: open below
        topPosition = rect.bottom + 8;
      }

      popup.style.position = "fixed";
      popup.style.top = `${topPosition}px`;
      popup.style.left = `${leftPosition}px`;
      popup.style.width = `${popupWidth}px`;
      popup.style.zIndex = "1000";
    };

    // Initial position
    updatePopupPosition();

    // Update on window resize
    window.addEventListener("resize", updatePopupPosition);

    return () => {
      window.removeEventListener("resize", updatePopupPosition);
    };
  }, [isOpen, filterIconRef]);
  // v1.0.0 ------------------------------------------------------------------>

  const handleClearAllClick = () => {
    if (onClearAll) {
      onClearAll();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={popupRef}
      className="bg-white rounded-lg shadow-xl z-50 flex flex-col border border-gray-200"
      style={{ height: "65vh" }} // Fixed height
    >
      {/* Header */}
      <div className="border-b p-3 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Filters</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      {/* Content - provided as children */}
      <div className="flex-1 p-3 overflow-y-auto">{children}</div>

      {/* Footer */}
      <div className="border-t p-3 flex justify-between">
        <button
          onClick={handleClearAllClick}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900"
        >
          Clear All
        </button>
        <div className="space-x-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
          <button
            onClick={onApply}
            className="px-3 py-1.5 text-sm font-medium text-white bg-custom-blue rounded-md hover:bg-custom-blue/90"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};
