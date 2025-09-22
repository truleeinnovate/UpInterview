import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useUserProfile } from "../../../../../apiHooks/useUsers";
import { useBankAccounts } from "../../../../../apiHooks/useBankAccount";
import { useCreateWithdrawal, calculateWithdrawalFees } from "../../../../../apiHooks/useWithdrawal";
import { useWallet } from "../../../../../apiHooks/useWallet";
import SidebarPopup from "../../../../../Components/Shared/SidebarPopup/SidebarPopup";
import { ChevronDown, AlertCircle, Info, CreditCard, Clock, Shield } from "lucide-react";
import LoadingButton from "../../../../../Components/LoadingButton";

export function WithdrawalModal({ onClose, onSuccess }) {
  const { userProfile } = useUserProfile();
  const ownerId = userProfile?.id;
  const tenantId = userProfile?.tenantId;
  
  // API hooks
  const { data: walletData } = useWallet();
  const { data: bankAccounts = [], isLoading: loadingAccounts } = useBankAccounts(ownerId);
  const { mutate: createWithdrawal, isLoading: processingWithdrawal } = useCreateWithdrawal();
  
  // State
  const [amount, setAmount] = useState("");
  const [selectedBankAccount, setSelectedBankAccount] = useState(null);
  const [withdrawalMode, setWithdrawalMode] = useState("IMPS");
  const [notes, setNotes] = useState("");
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  const [showModeDropdown, setShowModeDropdown] = useState(false);
  const [fees, setFees] = useState(null);
  const [errors, setErrors] = useState({});
  
  // Get verified bank accounts only
  const verifiedAccounts = bankAccounts.filter(acc => acc.isVerified && acc.isActive);
  const availableBalance = walletData?.balance - (walletData?.holdAmount || 0);
  
  // Calculate fees when amount changes
  useEffect(() => {
    const amountNum = parseFloat(amount);
    if (amountNum && amountNum > 0) {
      setFees(calculateWithdrawalFees(amountNum));
    } else {
      setFees(null);
    }
  }, [amount]);
  
  // Set default bank account
  useEffect(() => {
    if (verifiedAccounts.length > 0 && !selectedBankAccount) {
      const defaultAccount = verifiedAccounts.find(acc => acc.isDefault) || verifiedAccounts[0];
      setSelectedBankAccount(defaultAccount);
    }
  }, [verifiedAccounts, selectedBankAccount]);
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    } else if (parseFloat(amount) < 100) {
      newErrors.amount = "Minimum withdrawal amount is ₹100";
    } else if (parseFloat(amount) > availableBalance) {
      newErrors.amount = `Insufficient balance. Available: ₹${availableBalance?.toFixed(2)}`;
    }
    
    if (!selectedBankAccount) {
      newErrors.bankAccount = "Please select a bank account";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    const withdrawalData = {
      ownerId,
      tenantId,
      amount: parseFloat(amount),
      bankAccountId: selectedBankAccount._id,
      mode: withdrawalMode,
      notes
    };
    
    createWithdrawal(withdrawalData, {
      onSuccess: (data) => {
        toast.success(`Withdrawal request created successfully!`);
        if (onSuccess) {
          onSuccess(data);
        }
        onClose();
      },
      onError: (error) => {
        console.error("Withdrawal error:", error);
      }
    });
  };
  
  const withdrawalModes = [
    { 
      value: "IMPS", 
      label: "IMPS", 
      description: "Instant (24x7)",
      timeline: "Within 30 minutes"
    },
    { 
      value: "UPI", 
      label: "UPI", 
      description: "Instant",
      timeline: "Within 15 minutes"
    },
    { 
      value: "NEFT", 
      label: "NEFT", 
      description: "Standard",
      timeline: "2-4 hours"
    },
    { 
      value: "RTGS", 
      label: "RTGS", 
      description: "For large amounts",
      timeline: "30-60 minutes"
    }
  ];
  
  return (
    <SidebarPopup title="Withdraw Funds" onClose={onClose}>
      <div className="sm:p-0 p-4 flex-1 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Available Balance Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600 mb-1">Available Balance</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{availableBalance?.toFixed(2) || "0.00"}
                </p>
              </div>
              <CreditCard className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          {/* Withdrawal Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Withdrawal Amount <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                ₹
              </span>
              <input
                type="number"
                min="100"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full pl-8 pr-3 py-2 border ${
                  errors.amount ? 'border-red-500' : 'border-gray-300'
                } rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-blue`}
                placeholder="Enter amount"
              />
            </div>
            {errors.amount && (
              <p className="mt-1 text-sm text-red-500">{errors.amount}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">Minimum withdrawal: ₹100</p>
          </div>
          
          {/* Fee Breakdown */}
          {fees && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-2">
              <div className="flex items-center space-x-2 mb-2">
                <Info className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Fee Breakdown</span>
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">₹{fees.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Processing Fee (2%):</span>
                  <span className="text-red-600">- ₹{fees.processingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GST (18%):</span>
                  <span className="text-red-600">- ₹{fees.tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-1 flex justify-between font-medium">
                  <span className="text-gray-700">You'll Receive:</span>
                  <span className="text-green-600 text-lg">₹{fees.netAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Bank Account Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bank Account <span className="text-red-500">*</span>
            </label>
            {verifiedAccounts.length === 0 ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-700">No verified bank accounts found</p>
                    <p className="text-xs text-red-600 mt-1">
                      Please add and verify a bank account before making a withdrawal
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowBankDropdown(!showBankDropdown)}
                  className={`w-full px-3 py-2 border ${
                    errors.bankAccount ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg text-left flex justify-between items-center hover:bg-gray-50`}
                >
                  {selectedBankAccount ? (
                    <div>
                      <p className="font-medium">{selectedBankAccount.accountHolderName}</p>
                      <p className="text-sm text-gray-500">
                        {selectedBankAccount.bankName} - {selectedBankAccount.maskedAccountNumber}
                      </p>
                    </div>
                  ) : (
                    <span className="text-gray-400">Select bank account</span>
                  )}
                  <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${
                    showBankDropdown ? 'transform rotate-180' : ''
                  }`} />
                </button>
                
                {showBankDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                    {verifiedAccounts.map((account) => (
                      <button
                        key={account._id}
                        type="button"
                        onClick={() => {
                          setSelectedBankAccount(account);
                          setShowBankDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0 ${
                          selectedBankAccount?._id === account._id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div>
                          <p className="font-medium">{account.accountHolderName}</p>
                          <p className="text-sm text-gray-500">
                            {account.bankName} - {account.maskedAccountNumber}
                          </p>
                          {account.isDefault && (
                            <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {errors.bankAccount && (
              <p className="mt-1 text-sm text-red-500">{errors.bankAccount}</p>
            )}
          </div>
          
          {/* Transfer Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transfer Mode
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowModeDropdown(!showModeDropdown)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-left flex justify-between items-center hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">
                      {withdrawalModes.find(m => m.value === withdrawalMode)?.label}
                    </p>
                    <p className="text-sm text-gray-500">
                      {withdrawalModes.find(m => m.value === withdrawalMode)?.timeline}
                    </p>
                  </div>
                </div>
                <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${
                  showModeDropdown ? 'transform rotate-180' : ''
                }`} />
              </button>
              
              {showModeDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                  {withdrawalModes.map((mode) => (
                    <button
                      key={mode.value}
                      type="button"
                      onClick={() => {
                        setWithdrawalMode(mode.value);
                        setShowModeDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0 ${
                        withdrawalMode === mode.value ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{mode.label}</p>
                          <p className="text-sm text-gray-500">{mode.description}</p>
                        </div>
                        <span className="text-xs text-gray-400">{mode.timeline}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* Notes (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-blue"
              placeholder="Add any notes for this withdrawal"
              rows="3"
            />
          </div>
          
          {/* Security Note */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Shield className="h-5 w-5 text-gray-500 mt-0.5" />
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">Security & Processing</p>
                <ul className="space-y-1 text-xs">
                  <li>• Withdrawals are processed within the selected timeline</li>
                  <li>• Bank verification may take 1-2 business days</li>
                  <li>• All transactions are secured with bank-grade encryption</li>
                  <li>• You'll receive SMS/Email updates on withdrawal status</li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-custom-blue border border-custom-blue rounded-lg hover:bg-blue-50"
            >
              Cancel
            </button>
            <LoadingButton
              type="submit"
              loading={processingWithdrawal}
              disabled={!selectedBankAccount || !amount || processingWithdrawal}
              className="px-6 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processingWithdrawal ? "Processing..." : "Withdraw Funds"}
            </LoadingButton>
          </div>
        </form>
      </div>
    </SidebarPopup>
  );
}
