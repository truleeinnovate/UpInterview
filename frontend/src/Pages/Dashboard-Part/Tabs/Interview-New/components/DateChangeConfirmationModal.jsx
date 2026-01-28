// DateChangeConfirmationModal.jsx
// v1.1.0 - Added support for Cancel/NoShow actions with reason dropdown, policy only for External
import { useEffect, useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { useInterviewPolicies } from "../../../../../apiHooks/useInterviewPolicies";
import DropdownSelect from "../../../../../Components/Dropdowns/DropdownSelect";
import {
  CANCEL_OPTIONS,
  NO_SHOW_OPTIONS,
  REJECT_OPTIONS,
  EVALUATED_OPTIONS,
  ROUND_OUTCOME_OPTIONS,
  COMPLETE_OPTIONS,
  WITHDRAW_OPTIONS, // Use consistent imports from roundHistoryOptions
} from "../../../../../utils/roundHistoryOptions";

// Policy warning component - only for External interviews
const SettlementPolicyWarning = ({ dateTime, roundStatus, actionType }) => {
  const { getSettlementPolicy, isLoading } = useInterviewPolicies();
  const [policyData, setPolicyData] = useState(null);
  const [hoursBefore, setHoursBefore] = useState(null);
  const [error, setError] = useState(false);

  // Determine the round status to use for policy lookup
  const policyRoundStatus =
    actionType === "Cancel"
      ? "Cancelled"
      : actionType === "NoShow"
        ? "NoShow"
        : roundStatus;

  // Action label for display
  const actionLabel =
    actionType === "Cancel"
      ? "Cancelled"
      : actionType === "NoShow"
        ? "Marked as No Show"
        : "Rescheduled";

  useEffect(() => {
    if (!dateTime || !policyRoundStatus) return;

    getSettlementPolicy({
      isMockInterview: false,
      roundStatus: policyRoundStatus,
      dateTime,
    })
      .then((res) => {
        if (res?.success) {
          setPolicyData(res.policy);
          setHoursBefore(res.hoursBefore); // Keep full decimal for accurate display
          // console.log("Settlement Policy response", res);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true));
  }, [dateTime, policyRoundStatus, getSettlementPolicy]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600 mb-2" />
        <p className="text-sm text-gray-600">Calculating settlement policy…</p>
      </div>
    );
  }

  if (error || !policyData) {
    return (
      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 p-4 rounded-lg">
        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-amber-800">
          Unable to determine the settlement policy at this time. Proceeding may
          result in applicable charges.
        </p>
      </div>
    );
  }

  const {
    policyName,
    feePercentage,
    firstRescheduleFree,
    interviewerPayoutPercentage,
    platformFeePercentage = 5,
    gstIncluded = true,
  } = policyData;

  const isFree = firstRescheduleFree || feePercentage === 0;

  // Format hours display
  const formatTimeBefore = (hours) => {
    if (hours >= 24) return "more than 24 hours";
    if (hours >= 1)
      return `${Math.round(hours)} hour${Math.round(hours) === 1 ? "" : "s"} `;
    const minutes = Math.ceil(hours * 60);
    if (minutes <= 0) return "less than a minute";
    return `${minutes} minute${minutes === 1 ? "" : "s"} `;
  };

  return (
    <div className="space-y-4">
      <p className="text-gray-700 text-sm">
        You are about to{" "}
        <strong>
          {actionType === "Cancel"
            ? "cancel"
            : actionType === "NoShow"
              ? "mark as no show"
              : "reschedule"}
        </strong>{" "}
        a confirmed <strong>external interview</strong>.
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm font-semibold text-blue-900 mb-1">
          ⏱ {actionLabel} {formatTimeBefore(hoursBefore)} before the interview
        </p>
        <p className="text-sm text-blue-800">
          Policy applied:{" "}
          <span className="font-medium capitalize">
            {policyName?.replace(/_/g, " ")}
          </span>
        </p>
      </div>

      {isFree ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-semibold">No Charges Applied</p>
          <p className="text-sm text-green-700 mt-1">
            {firstRescheduleFree
              ? "This is your first action — no fees will be deducted."
              : "As per the policy, the full amount will be refunded to you."}
          </p>
        </div>
      ) : (
        <div className="bg-orange-50 border border-orange-300 rounded-lg p-4 space-y-2">
          <p className="font-semibold text-orange-900">
            Deduction: {feePercentage}% of the total paid amount
          </p>
          <div className="text-sm text-orange-800 space-y-1">
            <p>• Interviewer will receive: {interviewerPayoutPercentage}%</p>
            {gstIncluded && <p>• GST: Included in the above amounts</p>}
            <p>
              • You will be refunded: <strong>{100 - feePercentage}%</strong>
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 italic">
        Proceeding will apply the policy immediately.
      </p>
    </div>
  );
};

const DateChangeConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  selectedInterviewType,
  status,
  combinedDateTime,
  // New props for Cancel/NoShow/Reject actions
  actionType = null, // "Cancel" | "NoShow" | "Reject" | null (for reschedule)
  isLoading = false, // Loading state for confirm button
}) => {
  const [selectedReason, setSelectedReason] = useState("");
  const [otherText, setOtherText] = useState("");
  const [roundOutcome, setRoundOutcome] = useState("");

  // console.log("selectedInterviewType", selectedInterviewType);
  // console.log("status", status);
  // console.log("combinedDateTime", combinedDateTime);
  // console.log("actionType", actionType);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedReason("");
      setOtherText("");
      setRoundOutcome("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isExternal = selectedInterviewType === "External";
  const isInternal = selectedInterviewType === "Internal";
  const isRequestSent = status === "RequestSent";
  const isScheduledOrReschedule = ["Scheduled", "Rescheduled"].includes(status);

  // Check if this is a Cancel, NoShow, Reject, or Evaluated action
  const isCancelAction = actionType === "Cancel";
  const isNoShowAction = actionType === "NoShow";
  const isRejectAction = actionType === "Reject";
  const isEvaluatedAction = actionType === "Evaluated";
  const isWithdrawAction = actionType === "Withdraw";

  const requiresReason =
    isCancelAction ||
    isNoShowAction ||
    isRejectAction ||
    isEvaluatedAction ||
    isWithdrawAction;

  // Get the appropriate options for the dropdown
  const reasonOptions = isCancelAction
    ? CANCEL_OPTIONS
    : isNoShowAction
      ? NO_SHOW_OPTIONS
      : isRejectAction
        ? REJECT_OPTIONS
        : isEvaluatedAction
          ? EVALUATED_OPTIONS
          : isWithdrawAction
            ? WITHDRAW_OPTIONS
            : [];

  const dropdownOptions = reasonOptions.map((opt) => ({
    value: opt.value,
    label: opt.label,
  }));

  const showOtherField =
    selectedReason === "other" ||
    selectedReason === "Other" ||
    selectedReason === "__other__";

  const handleClose = () => {
    setSelectedReason("");
    setOtherText("");
    setRoundOutcome("");
    if (onClose) onClose();
  };

  const handleConfirm = () => {
    if (requiresReason && !selectedReason) return;
    if (showOtherField && !otherText.trim()) return;
    if (isEvaluatedAction && !roundOutcome) return;

    const payload = requiresReason
      ? {
          reason: selectedReason,
          comment: showOtherField ? otherText.trim() : undefined,
          ...(isEvaluatedAction && { roundOutcome }),
        }
      : {};

    if (onConfirm) onConfirm(payload);
  };

  // Determine title based on action type
  const getTitle = () => {
    if (isCancelAction) return "Cancel Round";
    if (isNoShowAction) return "Mark as No Show";
    if (isRejectAction) return "Reject Candidate";
    if (isEvaluatedAction) return "Mark as Evaluated";
    if (isWithdrawAction) return "Withdraw Application";
    if (actionType === "Complete") return "Complete Interview";
    if (actionType === "Select") return "Select Candidate";
    return "Confirm Interview Change";
  };

  // Determine confirm button text
  const getConfirmButtonText = () => {
    if (isLoading) return null; // Will show loader
    if (isCancelAction) return "Confirm Cancel";
    if (isNoShowAction) return "Confirm No Show";
    if (isRejectAction) return "Confirm Reject";
    if (isEvaluatedAction) return "Confirm Evaluation";
    if (isWithdrawAction) return "Confirm Withdraw";
    if (actionType === "Complete") return "Confirm Completion";
    if (actionType === "Select") return "Confirm Selection";
    if (isExternal && isRequestSent) return "Proceed & Cancel Invitations";
    if (isExternal && isScheduledOrReschedule) return "Proceed & Apply Policy";
    return "Proceed & Clear Interviewers";
  };

  // Check if confirm should be disabled
  const isConfirmDisabled =
    isLoading ||
    (requiresReason && !selectedReason) ||
    (showOtherField && !otherText.trim()) ||
    (isEvaluatedAction && !roundOutcome);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">{getTitle()}</h3>
        </div>

        {/* Body */}
        <div className="px-6 py-6 max-h-[60vh] overflow-y-auto space-y-4">
          {/* Cancel/NoShow/Reject/Evaluated Actions */}
          {(isCancelAction ||
            isNoShowAction ||
            isRejectAction ||
            isEvaluatedAction ||
            isWithdrawAction) && (
            <>
              {/* Show policy warning ONLY for External Cancel action */}
              {isExternal && isCancelAction && (
                <SettlementPolicyWarning
                  dateTime={combinedDateTime}
                  roundStatus={status}
                  actionType={actionType}
                />
              )}

              {/* For Internal, NoShow, Reject, or Evaluated show simple message */}
              {(isInternal ||
                isRejectAction ||
                isNoShowAction ||
                isEvaluatedAction) && (
                <div className="text-sm text-gray-700 leading-relaxed">
                  <p>
                    You are about to{" "}
                    <strong>
                      {isCancelAction
                        ? "cancel"
                        : isNoShowAction
                          ? "mark as no show"
                          : isRejectAction
                            ? "reject"
                            : isWithdrawAction
                              ? "withdraw"
                              : "mark as evaluated"}
                    </strong>{" "}
                    this {isRejectAction ? "candidate" : "round"}.
                  </p>
                </div>
              )}

              {/* Reason Dropdown - Always show for these actions */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for{" "}
                  {isCancelAction
                    ? "Cancellation"
                    : isNoShowAction
                      ? "No Show"
                      : isRejectAction
                        ? "Rejection"
                        : isWithdrawAction
                          ? "Withdrawal"
                          : "Evaluation"}
                </label>
                <DropdownSelect
                  options={dropdownOptions}
                  value={
                    dropdownOptions.find(
                      (opt) => opt.value === selectedReason,
                    ) || null
                  }
                  onChange={(selectedOption) => {
                    setSelectedReason(selectedOption?.value || "");
                  }}
                  placeholder="Select a reason"
                  isClearable
                  menuPortalTarget={document.body}
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                  }}
                />
              </div>

              {/* Other reason text field */}
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

              {/* Round Outcome Dropdown - Only for Evaluated action */}
              {isEvaluatedAction && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Round Outcome <span className="text-red-500">*</span>
                  </label>
                  <DropdownSelect
                    options={ROUND_OUTCOME_OPTIONS}
                    value={
                      ROUND_OUTCOME_OPTIONS.find(
                        (opt) => opt.value === roundOutcome,
                      ) || null
                    }
                    onChange={(selectedOption) => {
                      setRoundOutcome(selectedOption?.value || "");
                    }}
                    placeholder="Select outcome"
                    isClearable
                    menuPortalTarget={document.body}
                    styles={{
                      menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                  />
                </div>
              )}
            </>
          )}

          {/* Simple Confirmation for Complete/Select */}
          {(actionType === "Complete" || actionType === "Select") && (
            <div className="text-sm text-gray-700 leading-relaxed">
              <p>
                Are you sure you want to{" "}
                <strong>
                  {actionType === "Complete" ? "complete" : "select"}
                </strong>{" "}
                this interview?
              </p>
              {actionType === "Complete" && (
                <p className="mt-2 text-gray-500 text-xs">
                  This will mark all rounds as completed.
                </p>
              )}
            </div>
          )}

          {/* Reschedule/Date Change Actions (original behavior) */}
          {!requiresReason &&
            actionType !== "Complete" &&
            actionType !== "Select" && (
              <>
                {/* Case 1: External + RequestSent */}
                {isExternal && isRequestSent && (
                  <div className="text-sm text-gray-700 leading-relaxed space-y-4">
                    <p>
                      Interview invitations have already been successfully sent
                      to the selected interviewers.
                    </p>
                    <p>
                      Modifying the date, time, or interview type will{" "}
                      <strong>automatically cancel</strong> all existing
                      invitations.
                    </p>
                    <p>
                      You will need to select new interviewers and send fresh
                      invitations afterward.
                    </p>
                    <p className="font-medium">
                      Are you sure you wish to proceed?
                    </p>
                  </div>
                )}

                {/* Case 2: External + Scheduled/Reschedule → Show Policy */}
                {isExternal && isScheduledOrReschedule && (
                  <SettlementPolicyWarning
                    dateTime={combinedDateTime}
                    roundStatus={status}
                    actionType={null}
                  />
                )}

                {/* Case 3: Internal Interview */}
                {isInternal && (
                  <div className="text-sm text-gray-700 leading-relaxed space-y-4">
                    <p>
                      Changing the interview date, time, or type will remove the
                      currently assigned interviewers.
                    </p>
                    <p>
                      You will need to reselect interviewers to continue
                      scheduling.
                    </p>
                    <p className="font-medium">Do you wish to proceed?</p>
                  </div>
                )}
              </>
            )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            className={`px-6 py-2.5 rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              isCancelAction ||
              isNoShowAction ||
              isEvaluatedAction ||
              isRejectAction ||
              isWithdrawAction
                ? "bg-red-600 text-white hover:bg-red-700"
                : "bg-custom-blue text-white hover:bg-custom-blue/90"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              getConfirmButtonText()
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateChangeConfirmationModal;
