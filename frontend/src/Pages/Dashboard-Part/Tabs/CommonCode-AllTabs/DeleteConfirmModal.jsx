// v1.0.0 - Ashok - fixed style issue

import { createPortal } from "react-dom";
import { Button } from "./ui/button";

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Item",
  entityName = "",
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm z-50 p-2">
      <div className="p-4 bg-white rounded-2xl shadow-2xl  w-[400px] overflow-hidden transform scale-95 animate-in fade-in-90 zoom-in-95">
        {/* Header */}
        {/* <div className="bg-gradient-to-r from-red-500 to-red-600 p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mx-auto mb-4">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
          <h3 className="text-white text-xl font-bold text-center">
            Confirm Deletion
          </h3>
        </div> */}

        {/* Content */}
        <div className="p-3">
          <p className="text-gray-600 text-center mb-4">
            Are you sure you want to permanently delete this {title}?
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center">
              <div className="bg-red-100 p-2 rounded-full mr-3">
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <span className="text-red-800 font-semibold truncate">
                {entityName}
              </span>
            </div>
            <p className="text-red-600 text-sm text-center mt-2">
              This action cannot be undone.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-6 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DeleteConfirmModal;
