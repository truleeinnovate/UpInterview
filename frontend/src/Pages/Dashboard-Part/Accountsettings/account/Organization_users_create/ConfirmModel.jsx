// ConfirmationModal.jsx
const ConfirmationModal = ({ 
  show, 
  userName, 
  newStatus, 
  onCancel, 
  onConfirm 
}) => {
  if (!show) return null;

  return (
    
    // <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    // <div className="fixed inset-0 z-50 flex items-start justify-center pt-32 bg-black bg-opacity-50">

 <div className="absolute w-[100%] h-[100%] inset-0 z-50 flex items-center justify-center">
      <div className="bg-white border border-gray-300 p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-lg font-medium mb-2">Confirm Status Change</h3>
        <p className="mb-2">
          Are you sure you want to change the status of <span className="font-bold">{userName} to {newStatus}</span>?
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
    </div>
  );
};

export default ConfirmationModal;