import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "./ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { useInterviewPolicies } from "../../../../apiHooks/useInterviewPolicies";
import DropdownSelect from "../../../../Components/Dropdowns/DropdownSelect";

// Policy warning component for cancellation (similar to SettlementPolicyWarning in DateChangeConfirmationModal)
const CancellationPolicyWarning = ({ dateTime, roundStatus, interviewerType }) => {
  const { getSettlementPolicy, isLoading } = useInterviewPolicies();
  const [policyData, setPolicyData] = useState(null);
  const [hoursBefore, setHoursBefore] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!dateTime || !roundStatus) return;

    getSettlementPolicy({
      isMockInterview: false,
      roundStatus: "Cancelled", // Always use Cancelled for cancellation policy
      dateTime,
    })
      .then((res) => {
        if (res?.success) {
          setPolicyData(res.policy);
          setHoursBefore(Math.round(res.hoursBefore));
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true));
  }, [dateTime, roundStatus, getSettlementPolicy]);

  // Only show for External interviews
  if (interviewerType !== "External") {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600 mb-2" />
        <p className="text-sm text-gray-600">Calculating cancellation policy…</p>
      </div>
    );
  }

  if (error || !policyData) {
    return (
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 p-3 rounded-lg mb-4">
        <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-amber-800">
          Unable to determine the cancellation policy at this time. Proceeding may
          result in applicable charges.
        </p>
      </div>
    );
  }

  const {
    policyName,
    feePercentage = 0,
    interviewerPayoutPercentage = 0,
    platformFeePercentage = 0,
    gstIncluded = true,
  } = policyData;

  const isFullRefund = feePercentage === 0;
  const refundPercentage = 100 - feePercentage;

  return (
    <div className="space-y-3 mb-4">
      <p className="text-gray-700 text-sm">
        You are about to <strong>cancel</strong> a confirmed{" "}
        <strong>external interview</strong>.
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm font-semibold text-blue-900 mb-1">
          ⏱ Cancelled{" "}
          {hoursBefore >= 24 ? "more than 24 hours" : `${hoursBefore} hours`}{" "}
          before the interview
        </p>
        <p className="text-sm text-blue-800">
          Policy applied:{" "}
          <span className="font-medium capitalize">
            {policyName?.replace(/_/g, " ")}
          </span>
        </p>
      </div>

      {isFullRefund ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-green-800 font-semibold">No Charges Applied</p>
          <p className="text-sm text-green-700 mt-1">
            As per the policy, the full amount will be refunded to you.
          </p>
        </div>
      ) : (
        <div className="bg-orange-50 border border-orange-300 rounded-lg p-3 space-y-2">
          <p className="font-semibold text-orange-900">
            Deduction: {feePercentage}% of the total paid amount
          </p>
          <div className="text-sm text-orange-800 space-y-1">
            <p>• Interviewer will receive: <strong>{interviewerPayoutPercentage}%</strong></p>
            {/* <p>• Platform fee: <strong>{platformFeePercentage}%</strong></p> */}
            {gstIncluded && <p>• GST: Included in the above amounts</p>}
            <p className="pt-1 border-t border-orange-200 mt-1">
              • You will be refunded: <strong>{refundPercentage}%</strong>
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 italic">
        Proceeding will cancel the interview and apply the policy immediately.
      </p>
    </div>
  );
};

const RoundStatusReasonModal = ({
  isOpen,
  title,
  label,
  options = [],
  onClose,
  onConfirm,
  confirmLabel = "Confirm",
  // New props for policy display
  roundData = null,
  showPolicyInfo = false,
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
    selectedReason === "Other" || selectedReason === "other" || selectedReason === "__other__";

  // Convert options to react-select format
  const dropdownOptions = options.map((opt) => ({
    value: opt.value,
    label: opt.label,
  }));

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

  // Extract dateTime from roundData for policy display
  const getDateTimeFromRound = () => {
    if (!roundData) return null;
    // Try common dateTime properties
    return roundData.dateTime || roundData.scheduledDateTime || roundData.date;
  };

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50 sm:px-4">
      <div className="bg-white p-5 rounded-lg shadow-md max-w-md w-full max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-3">{title}</h3>

        {/* Policy Info Section for Cancellation */}
        {showPolicyInfo && roundData && (
          <CancellationPolicyWarning
            dateTime={getDateTimeFromRound()}
            roundStatus={roundData.status}
            interviewerType={roundData.interviewerType}
          />
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
          <DropdownSelect
            value={dropdownOptions.find((opt) => opt.value === selectedReason) || null}
            onChange={(selected) => setSelectedReason(selected?.value || "")}
            options={dropdownOptions}
            placeholder="Select a reason"
            isClearable
            menuPortalTarget={document.body}
          />

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
