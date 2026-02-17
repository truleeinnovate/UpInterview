import { useState } from "react";
import {
  X,
  Wallet,
  Building,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  AlertTriangle,
  IndianRupee,
  RefreshCw,
  Copy,
} from "lucide-react";
import { useProcessWithdrawal, useFailWithdrawal } from "../../apiHooks/superAdmin/useWithdrawalRequests";
import { notify } from "../../services/toastService";
import SidebarPopup from "../../Components/Shared/SidebarPopup/SidebarPopup";
import DropdownSelect from "../../Components/Dropdowns/DropdownSelect";
import { useScrollLock } from "../../apiHooks/scrollHook/useScrollLock";

const WithdrawalDetailsModal = ({ withdrawalRequest, isOpen, onClose, permissions }) => {
  //console.log("withdrawalRequest.bankAccountId", withdrawalRequest?.bankAccountId);
  useScrollLock(true)
  const [activeTab, setActiveTab] = useState("details");
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [showFailModal, setShowFailModal] = useState(false);

  // Process form state
  const [processData, setProcessData] = useState({
    transactionReference: "",
    actualMode: "IMPS",
    adminNotes: "",
  });

  // Fail form state
  const [failData, setFailData] = useState({
    failureReason: "",
    adminNotes: "",
  });

  // Transfer mode options for dropdown
  const transferModeOptions = [
    { value: "IMPS", label: "IMPS" },
    { value: "NEFT", label: "NEFT" },
    { value: "RTGS", label: "RTGS" },
    { value: "UPI", label: "UPI" },
  ];

  // Failure reason options for dropdown
  const failureReasonOptions = [
    { value: "Invalid bank account details", label: "Invalid bank account details" },
    { value: "Bank account verification failed", label: "Bank verification failed" },
    { value: "Insufficient information", label: "Insufficient information" },
    { value: "Technical error", label: "Technical error" },
    { value: "Other", label: "Other" },
  ];

  const { processWithdrawal, isProcessing } = useProcessWithdrawal();
  const { failWithdrawal, isFailing } = useFailWithdrawal();

  if (!isOpen || !withdrawalRequest) return null;

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'processing':
        return <AlertCircle className="h-5 w-5 text-blue-500" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    notify.info("Copied to clipboard");
  };

  const handleProcessSubmit = async () => {
    if (!processData.transactionReference) {
      notify.error("Transaction reference is required");
      return;
    }

    try {
      await processWithdrawal({
        withdrawalRequestId: withdrawalRequest._id,
        transactionReference: processData.transactionReference,
        processedBy: "admin",
        adminNotes: processData.adminNotes,
        actualMode: processData.actualMode,
      });
      setShowProcessModal(false);
      onClose();
    } catch (error) {
      console.error("Error processing withdrawal:", error);
    }
  };

  const handleFailSubmit = async () => {
    if (!failData.failureReason) {
      notify.error("Failure reason is required");
      return;
    }

    try {
      await failWithdrawal({
        withdrawalRequestId: withdrawalRequest._id,
        failureReason: failData.failureReason,
        failedBy: "admin",
        adminNotes: failData.adminNotes,
      });
      setShowFailModal(false);
      onClose();
    } catch (error) {
      console.error("Error failing withdrawal:", error);
    }
  };

  const DetailsTab = () => (
    <div className="space-y-6">
      {/* Amount Details */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Amount Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Requested Amount</p>
            <p className="text-xl font-bold flex items-center">
              <IndianRupee className="h-5 w-5" />
              {withdrawalRequest.amount?.toFixed(2) || "0.00"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Net Amount</p>
            <p className="text-xl font-bold text-green-600 flex items-center">
              <IndianRupee className="h-5 w-5" />
              {withdrawalRequest.netAmount?.toFixed(2) || "0.00"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Processing Fee</p>
            <p className="font-medium">₹{withdrawalRequest.processingFee?.toFixed(2) || "0.00"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Tax</p>
            <p className="font-medium">₹{withdrawalRequest.tax?.toFixed(2) || "0.00"}</p>
          </div>
        </div>
      </div>

      {/* User Details */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">User Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Owner ID</p>
            <div className="flex items-center gap-2">
              <p className="font-mono text-sm">{withdrawalRequest.ownerId}</p>
              <button
                onClick={() => copyToClipboard(withdrawalRequest.ownerId)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Tenant ID</p>
            <div className="flex items-center gap-2">
              <p className="font-mono text-sm">{withdrawalRequest.tenantId || "N/A"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Timeline</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Created:</span>
            <span className="font-medium">
              {new Date(withdrawalRequest.createdAt).toLocaleString()}
            </span>
          </div>
          {withdrawalRequest.completedAt && (
            <div className="flex items-center gap-3">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-gray-600">Completed:</span>
              <span className="font-medium">
                {new Date(withdrawalRequest.completedAt).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const BankTab = () => {
    return (
      <div className="space-y-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Building className="h-5 w-5" />
            Bank Account Details
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Account Holder</p>
              <p className="font-medium">
                {withdrawalRequest.bankAccountId?.accountHolderName ||
                  withdrawalRequest.metadata?.bankDetails?.accountHolderName || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Bank Name</p>
              <p className="font-medium">
                {withdrawalRequest.bankAccountId?.bankName ||
                  withdrawalRequest.metadata?.bankDetails?.bankName || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Account Number</p>
              <div className="flex items-center gap-2">
                <p className="font-medium font-mono">
                  {
                    withdrawalRequest.bankAccountId?.accountNumber ||
                    withdrawalRequest.metadata?.bankDetails?.accountNumber || "****"}
                </p>
                {withdrawalRequest.bankAccountId?.accountNumber && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(withdrawalRequest.bankAccountId.accountNumber);
                      notify.success("Account number copied!");
                    }}
                    className="p-1 hover:bg-gray-200 rounded"
                    title="Copy account number"
                  >
                    <Copy className="h-3 w-3 text-gray-500" />
                  </button>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Account Type</p>
              <p className="font-medium capitalize">
                {withdrawalRequest.bankAccountId?.accountType ||
                  withdrawalRequest.metadata?.bankDetails?.accountType || "N/A"}
              </p>
            </div>
            {(withdrawalRequest.bankAccountId?.routingNumber || withdrawalRequest.bankAccountId?.ifscCode) && (
              <div>
                <p className="text-sm text-gray-600">{(withdrawalRequest.bankAccountId?.ifscCode) ? "IFSC Code" : "Routing Number"}</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium font-mono">
                    {withdrawalRequest.bankAccountId?.ifscCode ||
                      withdrawalRequest.bankAccountId?.routingNumber || "N/A"}
                  </p>
                  {(withdrawalRequest.bankAccountId?.routingNumber || withdrawalRequest.bankAccountId?.ifscCode) && (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(withdrawalRequest.bankAccountId?.ifscCode ? withdrawalRequest.bankAccountId?.ifscCode : withdrawalRequest.bankAccountId?.routingNumber);
                        notify.success(withdrawalRequest.bankAccountId?.ifscCode ? "IFSC code copied!" : "Routing Number copied!");
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                      title={withdrawalRequest.bankAccountId?.ifscCode ? "Copy IFSC code" : "Copy Routing Number"}
                    >
                      <Copy className="h-3 w-3 text-gray-500" />
                    </button>
                  )}
                </div>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">SWIFT Code</p>
              <p className="font-medium font-mono">
                {withdrawalRequest.bankAccountId?.swiftCode || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* Verification Status Section */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Verification Status
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Verification Status</p>
              <div className="flex items-center gap-2">
                {withdrawalRequest.bankAccountId?.isVerified ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium text-green-700">Verified</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span className="font-medium text-yellow-700">Not Verified</span>
                  </>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Verification Method</p>
              <p className="font-medium capitalize">
                {withdrawalRequest.bankAccountId?.verificationMethod || "N/A"}
              </p>
            </div>
            {withdrawalRequest.bankAccountId?.verificationDate && (
              <div>
                <p className="text-sm text-gray-600">Verification Date</p>
                <p className="font-medium">
                  {new Date(withdrawalRequest.bankAccountId.verificationDate).toLocaleDateString()}
                </p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Default Account</p>
              <p className="font-medium">
                {withdrawalRequest.bankAccountId?.isDefault ? (
                  <span className="text-green-600">Yes</span>
                ) : (
                  <span className="text-gray-600">No</span>
                )}
              </p>
            </div>
          </div>
          {withdrawalRequest.bankAccountId?.metadata?.note && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">Verification Note</p>
              <p className="text-sm mt-1 p-2 bg-white rounded">
                {withdrawalRequest.bankAccountId.metadata.note}
              </p>
            </div>
          )}
        </div>

        {/* Account Activity Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Account Activity</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Created At</p>
              <p className="font-medium text-sm">
                {withdrawalRequest.bankAccountId?.createdAt
                  ? new Date(withdrawalRequest.bankAccountId.createdAt).toLocaleString()
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Updated</p>
              <p className="font-medium text-sm">
                {withdrawalRequest.bankAccountId?.updatedAt
                  ? new Date(withdrawalRequest.bankAccountId.updatedAt).toLocaleString()
                  : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Account Status</p>
              <div className="flex items-center gap-2">
                {withdrawalRequest.bankAccountId?.isActive ? (
                  <>
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="font-medium text-green-700">Active</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <span className="font-medium text-red-700">Inactive</span>
                  </>
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Account ID</p>
              <p className="font-mono text-xs text-gray-500">
                {withdrawalRequest.bankAccountId?._id || "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const MetadataTab = () => (
    <div className="space-y-6">
      {withdrawalRequest.metadata?.walletSnapshot && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Wallet Snapshot</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Balance</p>
              <p className="font-medium">
                ₹{withdrawalRequest.metadata.walletSnapshot.currentBalance?.toFixed(2) || "0.00"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Available</p>
              <p className="font-medium">
                ₹{withdrawalRequest.metadata.walletSnapshot.availableBalance?.toFixed(2) || "0.00"}
              </p>
            </div>
          </div>
        </div>
      )}

      {withdrawalRequest.metadata?.manualProcessing && (
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-4">Processing Details</h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Transaction Reference</p>
              <p className="font-mono font-medium">
                {withdrawalRequest.metadata.manualProcessing.transactionReference}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Processed By</p>
              <p className="font-medium">
                {withdrawalRequest.metadata.manualProcessing.processedBy}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Main Modal */}
      <SidebarPopup title=" Withdrawal Request Details" onClose={onClose}>
        {/* Status Bar */}
        <div className="bg-white px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon(withdrawalRequest.status)}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(withdrawalRequest.status)}`}>
                {withdrawalRequest.status?.toUpperCase()}
              </span>
            </div>

            {permissions?.Edit &&
              (withdrawalRequest.status === "pending" || withdrawalRequest.status === "processing") && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowProcessModal(true)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Process
                  </button>
                  <button
                    onClick={() => setShowFailModal(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Fail
                  </button>
                </div>
              )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab("details")}
              className={`px-6 py-3 font-medium transition-colors ${activeTab === "details"
                  ? "border-b-2 border-custom-blue text-custom-blue"
                  : "text-gray-600 hover:text-gray-900"
                }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab("bank")}
              className={`px-6 py-3 font-medium transition-colors ${activeTab === "bank"
                  ? "border-b-2 border-custom-blue text-custom-blue"
                  : "text-gray-600 hover:text-gray-900"
                }`}
            >
              Bank Information
            </button>
            <button
              onClick={() => setActiveTab("metadata")}
              className={`px-6 py-3 font-medium transition-colors ${activeTab === "metadata"
                  ? "border-b-2 border-custom-blue text-custom-blue"
                  : "text-gray-600 hover:text-gray-900"
                }`}
            >
              Metadata
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {activeTab === "details" && <DetailsTab />}
          {activeTab === "bank" && <BankTab />}
          {activeTab === "metadata" && <MetadataTab />}
        </div>
      </SidebarPopup>

      {/* Process Modal */}
      {showProcessModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Process Withdrawal</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Reference *
                </label>
                <input
                  type="text"
                  value={processData.transactionReference}
                  onChange={(e) => setProcessData({ ...processData, transactionReference: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter bank transaction reference"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transfer Mode
                </label>
                <DropdownSelect
                  value={transferModeOptions.find(opt => opt.value === processData.actualMode)}
                  onChange={(selectedOption) => setProcessData({ ...processData, actualMode: selectedOption.value })}
                  options={transferModeOptions}
                  placeholder="Select Transfer Mode"
                  isClearable={false}
                  menuPortalTarget={document.body}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={processData.adminNotes}
                  onChange={(e) => setProcessData({ ...processData, adminNotes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Any additional notes..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowProcessModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessSubmit}
                disabled={isProcessing}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 flex items-center gap-2"
              >
                {isProcessing && <RefreshCw className="h-4 w-4 animate-spin" />}
                Confirm Process
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fail Modal */}
      {showFailModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Mark as Failed</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Failure Reason *
                </label>
                <DropdownSelect
                  value={failureReasonOptions.find(opt => opt.value === failData.failureReason) || null}
                  onChange={(selectedOption) => setFailData({ ...failData, failureReason: selectedOption ? selectedOption.value : "" })}
                  options={failureReasonOptions}
                  placeholder="Select Reason"
                  isClearable={false}
                  menuPortalTarget={document.body}
                  hasError={!failData.failureReason && showFailModal}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Notes (Optional)
                </label>
                <textarea
                  value={failData.adminNotes}
                  onChange={(e) => setFailData({ ...failData, adminNotes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows="3"
                  placeholder="Additional details..."
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> This will refund the amount to user's wallet.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowFailModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleFailSubmit}
                disabled={isFailing}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 flex items-center gap-2"
              >
                {isFailing && <RefreshCw className="h-4 w-4 animate-spin" />}
                Confirm Failure
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default WithdrawalDetailsModal;
