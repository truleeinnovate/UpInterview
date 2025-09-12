//<-----v1.0.0-----Venkatesh---add scroll into view for error msg
// v1.0.1 - Ashok - Added border and text color for cancel button
// v1.0.2 - Ashok - Removed border left and set outline as none for modal
// v1.0.2 - Ashok - Improved responsiveness and added common code to popup

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { validateBankAccount } from "../../../../../utils/BankAccountValidation"; //<-----v1.0.0------
import { scrollToFirstError } from "../../../../../utils/ScrollToFirstError/scrollToFirstError"; //<-----v1.0.0-----

import SidebarPopup from "../../../../../Components/Shared/SidebarPopup/SidebarPopup";
import InputField from "../../../../../Components/FormFields/InputField.jsx";
import DropdownSelect from "../../../../../Components/Dropdowns/DropdownSelect.jsx";

export function BankAccountsPopup({ onClose, onSave }) {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [errors, setErrors] = useState({}); //<-----v1.0.0-----
  const [newAccount, setNewAccount] = useState({
    accountName: "",
    accountNumber: "",
    confirmAccountNumber: "",
    routingNumber: "",
    bankName: "",
    accountType: "checking",
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

  const handleSubmit = (e) => {
    e.preventDefault();

    //<-----v1.0.0-----
    const validationErrors = validateBankAccount(newAccount);
    setErrors(validationErrors);
    console.log("Validation Errors:", validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      scrollToFirstError(validationErrors, fieldRefs);
      return;
    }
    //-----v1.0.0----->

    // If validation passes, add the new account
    const account = {
      id: Date.now(),
      ...newAccount,
      confirmAccountNumber: undefined, // Don't store confirmation field
    };
    setAccounts([...accounts, account]);
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
  };

  const handleRemoveAccount = (id) => {
    setAccounts(accounts.filter((account) => account.id !== id));
  };

  const renderAccountForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
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
                setNewAccount({ ...newAccount, accountType: opt?.value || "checking" })
              }
              options={[
                { value: "checking", label: "Checking" },
                { value: "savings", label: "Savings" },
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
            label="Routing Number"
            required
            name="routingNumber"
            inputRef={fieldRefs.routingNumber}
            value={newAccount.routingNumber}
            onChange={(e) =>
              setNewAccount({ ...newAccount, routingNumber: e.target.value })
            }
            error={errors.routingNumber}
          />
          {/*<-----v1.0.0-----*/}
        </div>

        <div>
          <InputField
            label="SWIFT/BIC Code"
            required
            name="swiftCode"
            inputRef={fieldRefs.swiftCode}
            value={newAccount.swiftCode}
            onChange={(e) =>
              setNewAccount({ ...newAccount, swiftCode: e.target.value })
            }
            error={errors.swiftCode}
          />
          {/*<-----v1.0.0-----*/}
          <p className="mt-1 text-sm text-gray-500">
            8-11 characters. You can find it on your bank statement
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
          // v1.0.1 <-----------------------------------------------------------------------
          // className="px-4 py-2 text-gray-700 hover:text-gray-900"
          className="px-4 py-2 text-custom-blue border border-custom-blue rounded-lg"
          // v1.0.1 ----------------------------------------------------------------------->
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/80"
        >
          Add Account
        </button>
      </div>
    </form>
  );

  const renderAccountsList = () => (
    <div className="space-y-4">
      {accounts.map((account) => (
        <div key={account.id} className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-medium">{account.accountName}</h4>
                {account.isDefault && (
                  <span className="px-2 py-1 bg-blue-100 text-custom-blue rounded-full text-xs">
                    Default
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">{account.bankName}</p>
              <p className="text-sm text-gray-500">
                {account.accountType.charAt(0).toUpperCase() +
                  account.accountType.slice(1)}{" "}
                Account
              </p>
              <p className="text-sm text-gray-500">
                ••••{account.accountNumber.slice(-4)}
              </p>
              <p className="text-sm text-gray-500">
                {account.address.city}, {account.address.state}{" "}
                {account.address.zipCode}
              </p>
            </div>
            <button
              onClick={() => handleRemoveAccount(account.id)}
              className="text-red-600 hover:text-red-800"
            >
              Remove
            </button>
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
    </div>
  );


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

        {isAddingAccount ? renderAccountForm() : renderAccountsList()}
      </div>
    </SidebarPopup>
  );
  // v1.0.2 ---------------------------------------------------------------------->
}
