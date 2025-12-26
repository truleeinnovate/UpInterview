import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "./ui/button";

const RoundStatusReasonModal = ({
  isOpen,
  title,
  label,
  options = [],
  onClose,
  onConfirm,
  confirmLabel = "Confirm",
}) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [otherText, setOtherText] = useState("");

  useEffect(() => {
    if (isOpen) {
      setSelectedReason("");
      setOtherText("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const showOtherField =
    selectedReason === "Other" || selectedReason === "other";

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleConfirm = () => {
    if (!selectedReason) return;

    if (showOtherField && !otherText.trim()) {
      return;
    }

    const payload = {
      reason: selectedReason,
      comment: showOtherField ? otherText.trim() : undefined,
    };

    if (onConfirm) {
      onConfirm(payload);
    }
  };

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50 sm:px-4">
      <div className="bg-white p-5 rounded-lg shadow-md max-w-md w-full">
        <h3 className="text-lg font-semibold mb-3">{title}</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
          <select
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select a reason</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {showOtherField && (
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specify other reason
              </label>
              <input
                type="text"
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Enter reason..."
              />
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!selectedReason || (showOtherField && !otherText.trim())}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default RoundStatusReasonModal;
