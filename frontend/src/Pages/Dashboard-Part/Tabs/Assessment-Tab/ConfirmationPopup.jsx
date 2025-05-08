import React from 'react';
import { HiOutlineExclamationCircle } from 'react-icons/hi';

const ConfirmationPopup = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Yes, I'm sure",
  cancelText = "No, cancel",
  singleButton = false,
  onSingleButtonClick,
  singleButtonText = "OK",
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{ zIndex: "9999" }}
      className="fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex justify-center items-center"
    >
      <div className="absolute top-0 bg-white p-8 rounded-lg shadow-lg mt-16">
        <div className="text-center">
          <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400" />
          <h3 className="mb-5 text-lg font-normal text-gray-500">{title}</h3>
          <p className="mb-5 text-gray-500">{message}</p>
          <div className="flex justify-center gap-4">
            {singleButton ? (
              <button
                className="text-gray-600 hover:bg-gray-500 hover:text-white border rounded p-2"
                onClick={onSingleButtonClick}
              >
                {singleButtonText}
              </button>
            ) : (
              <>
                <button
                  className="text-gray-600 hover:bg-gray-500 hover:text-white border rounded p-2"
                  onClick={onConfirm}
                >
                  {confirmText}
                </button>
                <button
                  className="text-gray-600 hover:bg-gray-500 border hover:text-white rounded p-2"
                  onClick={onCancel}
                >
                  {cancelText}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPopup;