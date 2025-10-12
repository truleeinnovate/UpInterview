import { useState, useEffect } from "react";
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
  
  const renderWithdrawalDetails = (withdrawal) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full m-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold">Withdrawal Details</h3>
          <button
            onClick={() => setSelectedWithdrawal(null)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Withdrawal Code</p>
            <p className="font-medium">{withdrawal.withdrawalCode}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Amount</p>
            <p className="text-xl font-bold">₹{withdrawal.amount.toFixed(2)}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Net Amount (After Fees)</p>
            <p className="font-medium text-green-600">₹{withdrawal.netAmount?.toFixed(2) || withdrawal.amount.toFixed(2)}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Bank Account</p>
            <div className="mt-1">
              <p className="font-medium">{withdrawal.bankAccountId?.accountHolderName}</p>
              <p className="text-sm text-gray-600">
                {withdrawal.bankAccountId?.bankName} - {withdrawal.bankAccountId?.maskedAccountNumber}
              </p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Transfer Mode</p>
            <p className="font-medium">{formatWithdrawalMode(withdrawal.mode)}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getWithdrawalStatusColor(withdrawal.status)}`}>
              {withdrawal.status.toUpperCase()}
            </span>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Created At</p>
            <p className="font-medium">{new Date(withdrawal.createdAt).toLocaleString()}</p>
          </div>
          
          {withdrawal.expectedCompletionDate && (
            <div>
              <p className="text-sm text-gray-500">Expected Completion</p>
              <p className="font-medium">{new Date(withdrawal.expectedCompletionDate).toLocaleString()}</p>
            </div>
          )}
          
          {withdrawal.completedAt && (
            <div>
              <p className="text-sm text-gray-500">Completed At</p>
              <p className="font-medium">{new Date(withdrawal.completedAt).toLocaleString()}</p>
            </div>
          )}
          
          {withdrawal.razorpayUtr && (
            <div>
              <p className="text-sm text-gray-500">UTR Number</p>
              <p className="font-medium">{withdrawal.razorpayUtr}</p>
            </div>
          )}
          
          {withdrawal.failureReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700 font-medium">Failure Reason</p>
              <p className="text-sm text-red-600 mt-1">{withdrawal.failureReason}</p>
            </div>
          )}
          
          {withdrawal.notes && (
            <div>
              <p className="text-sm text-gray-500">Notes</p>
              <p className="text-sm text-gray-700">{withdrawal.notes}</p>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4 border-t">
            {["pending", "queued"].includes(withdrawal.status) && (
              <LoadingButton
                onClick={() => handleCancelWithdrawal(withdrawal._id, withdrawal.withdrawalCode)}
                loading={cancelling}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Cancel Withdrawal
              </LoadingButton>
            )}
            <button
              onClick={() => setSelectedWithdrawal(null)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
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
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2 ${
                          selectedStatus === filter.value ? 'bg-blue-50' : ''
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
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-4 z-10">
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
