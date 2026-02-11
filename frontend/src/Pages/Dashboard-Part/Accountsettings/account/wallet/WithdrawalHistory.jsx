import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useUserProfile } from "../../../../../apiHooks/useUsers";
import { useWithdrawalRequests, useCancelWithdrawal, getWithdrawalStatusColor, formatWithdrawalMode } from "../../../../../apiHooks/useWithdrawal";
import SidebarPopup from "../../../../../Components/Shared/SidebarPopup/SidebarPopup";
import { Clock, CheckCircle, XCircle, AlertCircle, RefreshCw, Filter } from "lucide-react";
import LoadingButton from "../../../../../Components/LoadingButton";
import { useScrollLock } from "../../../../../apiHooks/scrollHook/useScrollLock";

export function WithdrawalHistory({ onClose }) {
  useScrollLock(true);
  const { userProfile } = useUserProfile();
  const ownerId = userProfile?.id || userProfile?._id; // Fixed: Check both id and _id

  // Debug logging to check if ownerId is correct
  // console.log("WithdrawalHistory Debug:", {
  //   ownerId,
  //   userProfile
  // });

  // State
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);

  // API hooks
  const { data, isLoading, refetch } = useWithdrawalRequests(ownerId, selectedStatus);
  const { mutate: cancelWithdrawal, isLoading: cancelling } = useCancelWithdrawal();

  const withdrawalRequests = data?.withdrawalRequests || [];

  // Debug logging for withdrawal data
  // console.log("Withdrawal requests data:", {
  //   data,
  //   withdrawalRequests,
  //   isLoading
  // });

  // Refetch data when component mounts
  useEffect(() => {
    if (ownerId) {
      refetch();
    }
  }, [ownerId]); // eslint-disable-line react-hooks/exhaustive-deps

  const statusFilters = [
    { value: null, label: "All", icon: Filter },
    { value: "pending", label: "Pending", icon: Clock },
    { value: "processing", label: "Processing", icon: RefreshCw },
    { value: "completed", label: "Completed", icon: CheckCircle },
    { value: "failed", label: "Failed", icon: XCircle },
    { value: "cancelled", label: "Cancelled", icon: AlertCircle }
  ];

  const handleCancelWithdrawal = (withdrawalId, withdrawalCode) => {
    if (window.confirm(`Are you sure you want to cancel withdrawal ${withdrawalCode}?`)) {
      cancelWithdrawal(
        {
          withdrawalRequestId: withdrawalId,
          reason: "User requested cancellation"
        },
        {
          onSuccess: () => {
            refetch();
            setSelectedWithdrawal(null);
          }
        }
      );
    }
  };

  const renderWithdrawalDetails = (withdrawal) => createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="bg-custom-blue from-custom-blue/80 to-custom-blue/20 px-6 py-4 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-white">Withdrawal Details</h3>
            <p className="text-blue-100 text-sm">{withdrawal.withdrawalCode}</p>
          </div>
          <button
            onClick={() => setSelectedWithdrawal(null)}
            className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1.5 transition-colors"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Amount Section */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 mb-1">Amount Requested</p>
                <p className="text-2xl font-bold text-gray-900">₹{withdrawal.amount.toFixed(2)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">You'll Receive</p>
                <p className="text-xl font-bold text-green-600">₹{withdrawal.netAmount?.toFixed(2) || withdrawal.amount.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
            <span className="text-sm text-gray-500">Status</span>
            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getWithdrawalStatusColor(withdrawal.status)}`}>
              {withdrawal.status.toUpperCase()}
            </span>
          </div>

          {/* Details Grid */}
          <div className="space-y-4">
            {/* Bank Account */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Bank Account</p>
                <p className="font-medium text-gray-900">{withdrawal.bankAccountId?.accountHolderName}</p>
                <p className="text-sm text-gray-600">
                  {withdrawal.bankAccountId?.bankName} - {withdrawal.bankAccountId?.maskedAccountNumber}
                </p>
              </div>
            </div>

            {/* Transfer Mode */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                <RefreshCw className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Transfer Mode</p>
                <p className="font-medium text-gray-900">{formatWithdrawalMode(withdrawal.mode)}</p>
              </div>
            </div>

            {/* Created Date */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Requested On</p>
                <p className="font-medium text-gray-900">{new Date(withdrawal.createdAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Expected Completion */}
            {withdrawal.expectedCompletionDate && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Expected Completion</p>
                  <p className="font-medium text-gray-900">{new Date(withdrawal.expectedCompletionDate).toLocaleString()}</p>
                </div>
              </div>
            )}

            {/* Completed Date */}
            {withdrawal.completedAt && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Completed On</p>
                  <p className="font-medium text-gray-900">{new Date(withdrawal.completedAt).toLocaleString()}</p>
                </div>
              </div>
            )}

            {/* UTR Number */}
            {withdrawal.razorpayUtr && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-700 font-medium">UTR Number</p>
                <p className="text-green-800 font-mono mt-1">{withdrawal.razorpayUtr}</p>
              </div>
            )}

            {/* Failure Reason */}
            {withdrawal.failureReason && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-red-700 font-medium">Failure Reason</p>
                </div>
                <p className="text-sm text-red-600">{withdrawal.failureReason}</p>
              </div>
            )}

            {/* Notes */}
            {withdrawal.notes && (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-500 mb-1">Notes</p>
                <p className="text-sm text-gray-700">{withdrawal.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
          {["pending", "queued"].includes(withdrawal.status) && (
            <LoadingButton
              onClick={() => handleCancelWithdrawal(withdrawal._id, withdrawal.withdrawalCode)}
              loading={cancelling}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
            >
              Cancel Withdrawal
            </LoadingButton>
          )}
          <button
            onClick={() => setSelectedWithdrawal(null)}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>,
    document.body
  );

  return (
    <>
      <SidebarPopup
        title="Withdrawal History"
        onClose={onClose}
      // headerAction={
      //   <button
      //     onClick={() => refetch()}
      //     className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm"
      //     title="Refresh withdrawal history"
      //   >
      //     <RefreshCw className="h-4 w-4" />
      //     <span className="font-medium">Refresh</span>
      //   </button>
      // }
      >
        <div className="flex flex-col h-full relative">
          {/* Filter Bar */}
          <div className="bg-white pb-4">
            <div className="flex justify-between items-center">
              <div className="relative">
                <button
                  onClick={() => setShowStatusFilter(!showStatusFilter)}
                  className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <Filter className="h-4 w-4" />
                  <span className="text-sm">
                    {statusFilters.find(f => f.value === selectedStatus)?.label}
                  </span>
                </button>

                {showStatusFilter && (
                  <div className="absolute mt-1 w-48 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
                    {statusFilters.map((filter) => (
                      <button
                        key={filter.value || 'all'}
                        onClick={() => {
                          setSelectedStatus(filter.value);
                          setShowStatusFilter(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 ${selectedStatus === filter.value ? 'bg-blue-50' : ''
                          }`}
                      >
                        <filter.icon className="h-4 w-4" />
                        <span>{filter.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => refetch()}
                className="flex items-center space-x-1 text-custom-blue hover:text-custom-blue/80"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="text-sm">Refresh</span>
              </button>
            </div>
          </div>

          {/* Withdrawals List - scrollable area with calculated height */}
          <div className="flex-1 overflow-y-auto space-y-4 mt-4" style={{ paddingBottom: withdrawalRequests.length > 0 ? '100px' : '16px' }}>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="text-gray-500">Loading withdrawal history...</div>
              </div>
            ) : withdrawalRequests.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500">
                  <p className="text-lg mb-2">No withdrawal requests found</p>
                  <p className="text-sm">Your withdrawal history will appear here</p>
                </div>
              </div>
            ) : (
              withdrawalRequests.map((withdrawal) => (
                <div
                  key={withdrawal._id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedWithdrawal(withdrawal)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium">{withdrawal.withdrawalCode}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getWithdrawalStatusColor(withdrawal.status)}`}>
                          {withdrawal.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Amount</p>
                          <p className="font-medium">₹{withdrawal.amount.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Net Amount</p>
                          <p className="font-medium text-green-600">
                            ₹{withdrawal.netAmount?.toFixed(2) || withdrawal.amount.toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Mode</p>
                          <p className="font-medium">{withdrawal.mode}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Date</p>
                          <p className="font-medium">
                            {new Date(withdrawal.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {withdrawal.bankAccountId && (
                        <div className="mt-2 text-sm">
                          <p className="text-gray-500">Bank Account</p>
                          <p className="text-gray-700">
                            {withdrawal.bankAccountId.bankName} - {withdrawal.bankAccountId.maskedAccountNumber}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="ml-4">
                      {withdrawal.status === "completed" ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : withdrawal.status === "failed" ? (
                        <XCircle className="h-6 w-6 text-red-500" />
                      ) : withdrawal.status === "cancelled" ? (
                        <AlertCircle className="h-6 w-6 text-gray-500" />
                      ) : (
                        <Clock className="h-6 w-6 text-yellow-500" />
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary Stats - Fixed at bottom */}
          {withdrawalRequests.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t px-4 py-6 z-10">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-500">Total Withdrawn</p>
                  <p className="text-lg font-bold text-green-600">
                    ₹{withdrawalRequests
                      .filter(w => w.status === "completed")
                      .reduce((sum, w) => sum + w.amount, 0)
                      .toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-lg font-bold text-yellow-600">
                    ₹{withdrawalRequests
                      .filter(w => ["pending", "processing", "initiated"].includes(w.status))
                      .reduce((sum, w) => sum + w.amount, 0)
                      .toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Requests</p>
                  <p className="text-lg font-bold">{withdrawalRequests.length}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </SidebarPopup>

      {/* Withdrawal Details Modal */}
      {selectedWithdrawal && renderWithdrawalDetails(selectedWithdrawal)}
    </>
  );
}
