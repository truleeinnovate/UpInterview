// DateChangeConfirmationModal.jsx
import { useEffect, useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";
import { useInterviewPolicies } from "../../../../../apiHooks/useInterviewPolicies";

const SettlementPolicyWarning = ({ dateTime, roundStatus }) => {
  const { getSettlementPolicy, isLoading } = useInterviewPolicies();
  const [policyData, setPolicyData] = useState(null);
  const [hoursBefore, setHoursBefore] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!dateTime || !roundStatus) return;

    getSettlementPolicy({
      isMockInterview: false,
      roundStatus,
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
  } = policyData;

  const isFree = firstRescheduleFree || feePercentage === 0;

  return (
    <div className="space-y-4">
      <p className="text-gray-700 text-sm">
        You are about to <strong>reschedule</strong> a confirmed{" "}
        <strong>external interview</strong>.
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm font-semibold text-blue-900 mb-1">
          ⏱ Rescheduled{" "}
          {hoursBefore >= 24 ? "more than 24 hours" : `${hoursBefore} hours`}{" "}
          before the interview
        </p>
        <p className="text-sm text-blue-800">
          Policy applied:{" "}
          <span className="font-medium capitalize">
            {policyName.replace(/_/g, " ")}
          </span>
        </p>
      </div>

      {isFree ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800 font-semibold">No Charges Applied</p>
          <p className="text-sm text-green-700 mt-1">
            {firstRescheduleFree
              ? "This is your first reschedule — no fees will be deducted."
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
            <p>• GST: {interviewerPayoutPercentage}%</p>
            <p>
              • You will be refunded: <strong>{100 - feePercentage}%</strong>
            </p>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 italic">
        Proceeding will clear current interviewers and apply the policy
        immediately.
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
}) => {
  if (!isOpen) return null;

  const isExternal = selectedInterviewType === "External";
  const isInternal = selectedInterviewType === "Internal";
  const isRequestSent = status === "RequestSent";
  const isScheduledOrReschedule = ["Scheduled", "Rescheduled"].includes(status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white w-full max-w-xl rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">
            Confirm Interview Change
          </h3>
        </div>

        {/* Body */}
        <div className="px-6 py-6 max-h-[60vh] overflow-y-auto">
          {/* Case 1: External + RequestSent */}
          {isExternal && isRequestSent && (
            <div className="text-sm text-gray-700 leading-relaxed space-y-4">
              <p>
                Interview invitations have already been successfully sent to the
                selected interviewers.
              </p>
              <p>
                Modifying the date, time, or interview type will{" "}
                <strong>automatically cancel</strong> all existing invitations.
              </p>
              <p>
                You will need to select new interviewers and send fresh
                invitations afterward.
              </p>
              <p className="font-medium">Are you sure you wish to proceed?</p>
            </div>
          )}

          {/* Case 2: External + Scheduled/Reschedule → Show Policy */}
          {isExternal && isScheduledOrReschedule && (
            <SettlementPolicyWarning
              dateTime={combinedDateTime}
              roundStatus={status}
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
                You will need to reselect interviewers to continue scheduling.
              </p>
              <p className="font-medium">Do you wish to proceed?</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-6 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition"
          >
            {isExternal && isRequestSent
              ? "Proceed & Cancel Invitations"
              : isExternal && isScheduledOrReschedule
                ? "Proceed & Apply Policy"
                : "Proceed & Clear Interviewers"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateChangeConfirmationModal;
