// v1.0.0 - Ashok - fixed z-index issue for confirmation modal
// v1.0.1 - Ashok - Improved responsiveness

// v1.0.0 <----------------------------------------------------------
import { createPortal } from "react-dom";
// v1.0.0 ---------------------------------------------------------->
const ConfirmationModal = ({
  show,
  userName,
  newStatus,
  onCancel,
  onConfirm,
}) => {
  if (!show) return null;

  return createPortal(
    //  <div className="absolute w-[100%] h-[100%] inset-0 z-50 flex items-center justify-center">
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[999]">
      {/* v1.0.1 <---------------------------------------------------------------------------------------------- */}
      <div className="bg-white border border-gray-300 p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        {/* v1.0.1 ----------------------------------------------------------------------------------------------> */}
        <h3 className="text-lg font-medium mb-2">Confirm Status Change</h3>
        <p className="mb-2">
          Are you sure you want to change the status of{" "}
          <span className="font-bold">
            {userName} to {newStatus}
          </span>
          ?
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-custom-blue text-white rounded-md"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmationModal;
