import { useState } from 'react'
import Modal from 'react-modal'
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom'
import { XMarkIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/outline'

export function BankAccountsPopup({ onClose, onSave }) {
  const navigate = useNavigate();
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [accounts, setAccounts] = useState([])
  const [isAddingAccount, setIsAddingAccount] = useState(false)
  const [newAccount, setNewAccount] = useState({
    accountName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    routingNumber: '',
    bankName: '',
    accountType: 'checking',
    swiftCode: '',
    isDefault: false
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (newAccount.accountNumber !== newAccount.confirmAccountNumber) {
      alert('Account numbers do not match')
      return
    }

    const account = {
      id: Date.now(),
      ...newAccount,
      confirmAccountNumber: undefined // Don't store confirmation field
    }
    setAccounts([...accounts, account])
    setNewAccount({
      accountName: '',
      accountNumber: '',
      confirmAccountNumber: '',
      routingNumber: '',
      bankName: '',
      accountType: 'checking',
      swiftCode: '',
      isDefault: false
    })
    setIsAddingAccount(false)
  }

  const handleRemoveAccount = (id) => {
    setAccounts(accounts.filter(account => account.id !== id))
  }

  const renderAccountForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Account Holder Information</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account Holder Name
          </label>
          <input
            type="text"
            value={newAccount.accountName}
            onChange={(e) => setNewAccount({ ...newAccount, accountName: e.target.value })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-custom-blue focus:ring-custom-blue"
            required
          />
          <p className="mt-1 text-sm text-gray-500">Enter the name exactly as it appears on your bank account</p>
        </div>
      </div>

      {/* Bank Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Bank Account Details</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bank Name
          </label>
          <input
            type="text"
            value={newAccount.bankName}
            onChange={(e) => setNewAccount({ ...newAccount, bankName: e.target.value })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-custom-blue focus:ring-custom-blue"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account Type
          </label>
          <select
            value={newAccount.accountType}
            onChange={(e) => setNewAccount({ ...newAccount, accountType: e.target.value })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-custom-blue focus:ring-custom-blue"
          >
            <option value="checking">Checking</option>
            <option value="savings">Savings</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Account Number
          </label>
          <input
            type="text"
            value={newAccount.accountNumber}
            onChange={(e) => setNewAccount({ ...newAccount, accountNumber: e.target.value })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-custom-blue focus:ring-custom-blue"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Account Number
          </label>
          <input
            type="text"
            value={newAccount.confirmAccountNumber}
            onChange={(e) => setNewAccount({ ...newAccount, confirmAccountNumber: e.target.value })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-custom-blue focus:ring-custom-blue"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Routing Number
          </label>
          <input
            type="text"
            value={newAccount.routingNumber}
            onChange={(e) => setNewAccount({ ...newAccount, routingNumber: e.target.value })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-custom-blue focus:ring-custom-blue"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SWIFT/BIC Code
          </label>
          <input
            type="text"
            value={newAccount.swiftCode}
            onChange={(e) => setNewAccount({ ...newAccount, swiftCode: e.target.value })}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-custom-blue focus:ring-custom-blue"
          />
          <p className="mt-1 text-sm text-gray-500">Required for international transfers</p>
        </div>
      </div>

      {/* Default Account Setting */}
      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={newAccount.isDefault}
            onChange={(e) => setNewAccount({ ...newAccount, isDefault: e.target.checked })}
            className="rounded border-gray-300 text-custom-blue focus:ring-custom-blue"
          />
          <span className="text-sm text-gray-700">Set as default account for receiving payments</span>
        </label>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => setIsAddingAccount(false)}
          className="px-4 py-2 text-gray-700 hover:text-gray-900"
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
      {accounts.map(account => (
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
                {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)} Account
              </p>
              <p className="text-sm text-gray-500">
                ••••{account.accountNumber.slice(-4)}
              </p>
              <p className="text-sm text-gray-500">
                {account.address.city}, {account.address.state} {account.address.zipCode}
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
  )

  const handleClose = () => {
      navigate('/account-settings/wallet');
    };
  
    const modalClass = classNames(
      'fixed bg-white shadow-2xl border-l border-gray-200',
      {
        'inset-0': isFullScreen,
        'inset-y-0 right-0 w-full lg:w-1/2 xl:w-1/2 2xl:w-1/2': !isFullScreen
      }
    );

  return (
    <Modal
      isOpen={true}
      onRequestClose={handleClose}
      className={modalClass}
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
    >
      <div className={classNames('flex flex-col h-full', { 'max-w-6xl mx-auto px-6': isFullScreen })}> 
        <div className="px-4 pt-4 sm:p-6 flex justify-between items-center bg-white z-50">
          <h2 className="text-2xl font-semibold text-custom-blue">Bank Accounts</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 text-gray-600 hover:text-gray-800"
            >
              {isFullScreen ? (
                <ArrowsPointingInIcon className="h-5 w-5" />
              ) : (
                <ArrowsPointingOutIcon className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-800"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="p-4 sm:p-6 flex-grow overflow-y-auto space-y-6">
          <div className="p-4 sm:p-6 flex-grow overflow-y-auto space-y-6">
            <div className="bg-blue-50 border-l-4 border-custom-blue p-4 rounded-r-lg">
              <p className="text-sm text-custom-blue">
                Add your bank account details to receive payments for completed interviews. Payments are processed within 2-3 business days.
              </p>
            </div>

            {isAddingAccount ? renderAccountForm() : renderAccountsList()}
          </div>
        </div>
      </div>
    </Modal>
  )
}