import React, { useEffect, useRef } from 'react';

export const FilterPopup = ({
  isOpen,
  onClose,
  onApply,
  onClearAll,
  filterIconRef,
  children,
}) => {
  const popupRef = useRef(null);

  // Position popup below filter icon and handle window resize
  useEffect(() => {
    if (!isOpen || !filterIconRef?.current || !popupRef.current) return;

    const updatePopupPosition = () => {
      const rect = filterIconRef.current.getBoundingClientRect();
      const popup = popupRef.current;
      const popupWidth = 320; // 20rem = 320px

      // Calculate left position to ensure popup stays in viewport
      let leftPosition = rect.left + window.scrollX;
      if (leftPosition + popupWidth > window.innerWidth) {
        leftPosition = window.innerWidth - popupWidth - 16; // 16px padding
      }
      leftPosition = Math.max(16, leftPosition);

      // Calculate top position with viewport boundary check
      const popupHeight = popup.offsetHeight;
      const viewportHeight = window.innerHeight;
      const bottomSpace = viewportHeight - rect.bottom - window.scrollY - 16;

      let topPosition;
      if (bottomSpace < popupHeight && rect.top > popupHeight) {
        // Position above if not enough space below
        topPosition = rect.top + window.scrollY - popupHeight - 8;
      } else {
        // Position below
        topPosition = rect.bottom + window.scrollY + 8;
      }

      popup.style.position = 'fixed';
      popup.style.top = `${topPosition}px`;
      popup.style.left = `${leftPosition}px`;
      popup.style.width = `${popupWidth}px`;
      popup.style.zIndex = '1000';
    };

    // Initial position update
    updatePopupPosition();

    // Update on resize
    window.addEventListener('resize', updatePopupPosition);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updatePopupPosition);
    };
  }, [isOpen, filterIconRef]);

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
      style={{ height: '65vh' }} // Fixed height
    >
      {/* Header */}
      <div className="border-b p-3 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Filters</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {/* Content - provided as children */}
      <div className="flex-1 p-3 overflow-y-auto">
        {children}
      </div>

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