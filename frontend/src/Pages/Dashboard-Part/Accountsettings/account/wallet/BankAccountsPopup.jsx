//<-----v1.0.0-----Venkatesh---add scroll into view for error msg
// v1.0.1 - Ashok - Added border and text color for cancel button
// v1.0.2 - Ashok - Removed border left and set outline as none for modal
// v1.0.2 - Ashok - Improved responsiveness and added common code to popup

import { useState, useRef } from "react";
import { validateBankAccount } from "../../../../../utils/BankAccountValidation"; //<-----v1.0.0------
import { scrollToFirstError } from "../../../../../utils/ScrollToFirstError/scrollToFirstError"; //<-----v1.0.0-----
import { useUserProfile } from "../../../../../apiHooks/useUsers.js";
import { useBankAccounts, useAddBankAccount, useVerifyBankAccount, useDeleteBankAccount } from "../../../../../apiHooks/useBankAccount";


import SidebarPopup from "../../../../../Components/Shared/SidebarPopup/SidebarPopup";
import InputField from "../../../../../Components/FormFields/InputField.jsx";
import DropdownSelect from "../../../../../Components/Dropdowns/DropdownSelect.jsx";
import LoadingButton from "../../../../../Components/LoadingButton.jsx";

export function BankAccountsPopup({ onClose, onSelectAccount }) {
  const { userProfile, isLoading: profileLoading } = useUserProfile();
  const ownerId = userProfile?.id || userProfile?._id;
  const tenantId = userProfile?.tenantId;
  
  // Debug logging
  console.log("UserProfile:", userProfile);
  console.log("OwnerId:", ownerId);
  console.log("TenantId:--------------------", tenantId);
  
  // API hooks
  const { data: bankAccounts = [], isLoading: loadingAccounts, refetch } = useBankAccounts(ownerId);
  const { mutate: addBankAccount, isLoading: addingAccount } = useAddBankAccount();
  const { mutate: verifyBankAccount, isLoading: verifyingAccount } = useVerifyBankAccount();
  const { mutate: deleteBankAccount, isLoading: deletingAccount } = useDeleteBankAccount();
  
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [errors, setErrors] = useState({}); //<-----v1.0.0-----
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [newAccount, setNewAccount] = useState({
    accountName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    routingNumber: "",
    bankName: "",
    accountType: "savings",
    swiftCode: "",
    isDefault: false,
  });
  //<-----v1.0.0-----
  const fieldRefs = {
    accountName: useRef(null),
    accountNumber: useRef(null),
    confirmAccountNumber: useRef(null),
    routingNumber: useRef(null),
    bankName: useRef(null),
    accountType: useRef(null),
    swiftCode: useRef(null),
  };
  //-----v1.0.0----->

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if ownerId is available
    if (!ownerId) {
      console.error("OwnerId is missing. UserProfile might not be loaded yet.");
      setErrors({ general: "User profile not loaded. Please refresh and try again." });
      return;
    }

    //<-----v1.0.0-----
    const validationErrors = validateBankAccount(newAccount);
    setErrors(validationErrors);
    console.log("Validation Errors:", validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      scrollToFirstError(validationErrors, fieldRefs);
      return;
    }
    //-----v1.0.0----->

    // Prepare data for backend
    const bankAccountData = {
      ownerId: ownerId,
      tenantId: tenantId || null,
      accountHolderName: newAccount.accountName,
      bankName: newAccount.bankName,
      accountType: newAccount.accountType,
      accountNumber: newAccount.accountNumber,
      routingNumber: newAccount.routingNumber,
      ifscCode: newAccount.swiftCode, // Using SWIFT code field for IFSC in Indian context
      swiftCode: newAccount.swiftCode,
      isDefault: newAccount.isDefault,
    };

    // Debug log the data being sent
    console.log("Submitting bank account data:", bankAccountData);

    // Add the new account to database
    addBankAccount(bankAccountData, {
      onSuccess: () => {
        // Reset form
        setNewAccount({
          accountName: "",
          accountNumber: "",
          confirmAccountNumber: "",
          routingNumber: "",
          bankName: "",
          accountType: "checking",
          swiftCode: "",
          isDefault: false,
        });
        setIsAddingAccount(false);
        setErrors({});
        // Refetch accounts
        refetch();
      },
      onError: (error) => {
        console.error("Error adding bank account:", error);
      }
    });
  };

  const handleRemoveAccount = (accountId) => {
    if (window.confirm("Are you sure you want to remove this bank account?")) {
      deleteBankAccount(
        { bankAccountId: accountId, ownerId },
        {
          onSuccess: () => {
            refetch();
          }
        }
      );
    }
  };

  const handleVerifyAccount = (accountId) => {
    verifyBankAccount(accountId, {
      onSuccess: () => {
        refetch();
      }
    });
  };

  const handleSelectAccount = (account) => {
    setSelectedAccountId(account._id);
    if (onSelectAccount) {
      onSelectAccount(account);
    }
  };

  const renderAccountForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General Error Message */}
      {errors.general && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
          <p className="text-sm text-red-700">{errors.general}</p>
        </div>
      )}
      
      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Account Holder Information</h3>
        <div>
          <InputField
            label="Account Holder Name"
            required
            name="accountName"
            inputRef={fieldRefs.accountName}
            value={newAccount.accountName}
            onChange={(e) =>
              setNewAccount({ ...newAccount, accountName: e.target.value })
            }
            error={errors.accountName}
          />
          {/*<-----v1.0.0-----*/}
          <p className="mt-1 text-sm text-gray-500">
            Enter the name exactly as it appears on your bank account
          </p>
        </div>
      </div>

      {/* Bank Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Bank Account Details</h3>
        <div>
          <InputField
            label="Bank Name"
            required
            name="bankName"
            inputRef={fieldRefs.bankName}
            value={newAccount.bankName}
            onChange={(e) =>
              setNewAccount({ ...newAccount, bankName: e.target.value })
            }
            error={errors.bankName}
          />
          {/*<-----v1.0.0-----*/}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account Type <span className="text-red-500">*</span>
          </label>
          <div ref={fieldRefs.accountType}>
            <DropdownSelect
              isSearchable={false}
              value={newAccount.accountType ? { value: newAccount.accountType, label: newAccount.accountType.charAt(0).toUpperCase() + newAccount.accountType.slice(1) } : null}
              onChange={(opt) =>
                setNewAccount({ ...newAccount, accountType: opt?.value || "savings" })
              }
              options={[
                { value: "checking", label: "Checking" },
                { value: "savings", label: "Savings" },
                { value: "current", label: "Current" },
              ]}
              placeholder="Select Account Type"
              menuPortalTarget={document.body}
              menuPosition="fixed"
            />
          </div>
          {errors.accountType && (
            <p className="text-red-500 text-sm mt-2 font-medium">{errors.accountType}</p>
          )}
          {/*<-----v1.0.0-----*/}
        </div>

        <div>
          <InputField
            label="Account Number"
            required
            name="accountNumber"
            inputRef={fieldRefs.accountNumber}
            value={newAccount.accountNumber}
            onChange={(e) =>
              setNewAccount({ ...newAccount, accountNumber: e.target.value })
            }
            error={errors.accountNumber}
          />
          {/*<-----v1.0.0-----*/}
        </div>

        <div>
          <InputField
            label="Confirm Account Number"
            required
            name="confirmAccountNumber"
            inputRef={fieldRefs.confirmAccountNumber}
            value={newAccount.confirmAccountNumber}
            onChange={(e) =>
              setNewAccount({ ...newAccount, confirmAccountNumber: e.target.value })
            }
            error={errors.confirmAccountNumber}
          />
          {/*<-----v1.0.0-----*/}
        </div>

        <div>
          <InputField
            label="Routing Number / IFSC Code"
            required
            name="routingNumber"
            inputRef={fieldRefs.routingNumber}
            placeholder="e.g., 021000021 (US) or HDFC0001234 (India)"
            value={newAccount.routingNumber}
            onChange={(e) =>
              setNewAccount({ ...newAccount, routingNumber: e.target.value })
            }
            error={errors.routingNumber}
          />
          <p className="mt-1 text-sm text-gray-500">
            US: 9-digit routing number | India: 11-character IFSC code
          </p>
          {/*<-----v1.0.0-----*/}
        </div>

        <div>
          <InputField
            label="SWIFT/BIC Code (Optional)"
            required={false}
            name="swiftCode"
            placeholder="e.g., CHASUS33XXX (US) or HDFCINBBXXX (India)"
            inputRef={fieldRefs.swiftCode}
            value={newAccount.swiftCode}
            onChange={(e) =>
              setNewAccount({ ...newAccount, swiftCode: e.target.value.toUpperCase() })
            }
            error={errors.swiftCode}
          />
          {/*<-----v1.0.0-----*/}
          <p className="mt-1 text-sm text-gray-500">
            8-11 characters (Bank Code + Country + Location + Optional Branch)
          </p>
        </div>
      </div>

      {/* Default Account Setting */}
      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            name="isDefault"
            checked={newAccount.isDefault}
            onChange={(e) =>
              setNewAccount({ ...newAccount, isDefault: e.target.checked })
            }
            className="rounded border-gray-300 text-custom-blue focus:ring-custom-blue"
          />
          <span className="text-sm text-gray-700">
            Set as default account for receiving payments
          </span>
        </label>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => setIsAddingAccount(false)}
          className="px-4 py-2 text-custom-blue border border-custom-blue rounded-lg hover:bg-custom-blue/80"
        >
          Cancel
        </button>
        <LoadingButton
          type="submit"
          loading={addingAccount}
          className="px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/80"
        >
          {addingAccount ? "Adding..." : "Add Account"}
        </LoadingButton>
      </div>
    </form>
  );

  const renderAccountsList = () => {
    if (loadingAccounts) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-500">Loading bank accounts...</div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {bankAccounts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-4">No bank accounts added yet</p>
            <button
              onClick={() => setIsAddingAccount(true)}
              className="px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/80"
            >
              Add Your First Bank Account
            </button>
          </div>
        ) : (
          <>
            {bankAccounts.map((account) => (
              <div 
                key={account._id} 
                className={`bg-gray-50 p-4 rounded-lg border-2 transition-all ${
                  selectedAccountId === account._id ? 'border-custom-blue' : 'border-transparent'
                } ${account.canWithdraw?.() ? 'cursor-pointer hover:border-gray-300' : 'opacity-75'}`}
                onClick={() => account.canWithdraw?.() && handleSelectAccount(account)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium">{account.accountHolderName}</h4>
                      {account.isDefault && (
                        <span className="px-2 py-1 bg-blue-100 text-custom-blue rounded-full text-xs">
                          Default
                        </span>
                      )}
                      {account.isVerified ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          Verified
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                          Pending Verification
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{account.bankName}</p>
                    <p className="text-sm text-gray-500">
                      {account.accountType?.charAt(0).toUpperCase() +
                        account.accountType?.slice(1) || 'Checking'} Account
                    </p>
                    <p className="text-sm text-gray-500">
                      {account.maskedAccountNumber || `••••${account.accountNumber?.slice(-4) || ''}`}
                    </p>
                    {account.ifscCode && (
                      <p className="text-sm text-gray-500">IFSC: {account.ifscCode}</p>
                    )}
                  </div>
                  <div className="flex flex-col space-y-2">
                    {!account.isVerified && (
                      <LoadingButton
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVerifyAccount(account._id);
                        }}
                        loading={verifyingAccount}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                      >
                        Verify
                      </LoadingButton>
                    )}
                    <LoadingButton
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveAccount(account._id);
                      }}
                      loading={deletingAccount}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Remove
                    </LoadingButton>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-end items-center">
              <button
                onClick={() => setIsAddingAccount(true)}
                className="w-44 px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/80"
              >
                Add Bank Account
              </button>
            </div>
          </>
        )}
      </div>
    );
  };


  // v1.0.2 <----------------------------------------------------------------------
  return (
    <SidebarPopup title="Bank Accounts" onClose={onClose}>
      <div className="sm:p-0 p-4 flex-1 overflow-y-auto space-y-6">
        <div className="bg-blue-50 border-l-4 border-custom-blue p-4 rounded-r-lg">
          <p className="text-sm text-custom-blue">
            Add your bank account details to receive payments for completed
            interviews. Payments are processed within 2-3 business days.
          </p>
        </div>

        {/* Show loading state while profile is loading */}
        {profileLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-500">Loading user profile...</div>
          </div>
        ) : (
          isAddingAccount ? renderAccountForm() : renderAccountsList()
        )}
      </div>
    </SidebarPopup>
  );
  // v1.0.2 ---------------------------------------------------------------------->
}
