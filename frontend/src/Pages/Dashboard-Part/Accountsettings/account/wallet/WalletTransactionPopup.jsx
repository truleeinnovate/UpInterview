import { Maximize, Minimize, X } from 'lucide-react';
import classNames from 'classnames';
import Modal from 'react-modal';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTransactionTypeStyle } from './Wallet';
// Modal.setAppElement('#root');

const WalletTransactionPopup = ({ transaction, onClose }) => {
  const navigate = useNavigate();
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  console.log("Transaction in popup:", transaction);

  const [loading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const modalClass = classNames(
    'fixed bg-white shadow-2xl border-l border-gray-200 overflow-y-auto',
    {
      'inset-0': isFullScreen,
      'inset-y-0 right-0 w-full  lg:w-1/2 xl:w-1/2 2xl:w-1/2': !isFullScreen
    }
  );

  return (
    <Modal
      isOpen={true}
      onRequestClose={() => navigate('/account-settings/wallet')}
      className={modalClass}
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
    // className={modalClass}

    >
      <div className={classNames('h-full', { 'max-w-6xl mx-auto px-6': isFullScreen })}>

        <div className="p-6 ">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-custom-blue">Edit Basic Details</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isFullScreen ? (
                  <Minimize className="w-5 h-5 text-gray-500" />
                ) : (
                  <Maximize className="w-5 h-5 text-gray-500" />
                )}
              </button>
              <button
              onClick={() => {
                navigate('/account-settings/wallet')
              }}
             
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Transaction ID</p>
              <p className="font-medium">INV-{transaction?.relatedInvoiceId.slice(-4) || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Amount</p>
              <p className={`text-xl font-bold 
              ${getTransactionTypeStyle(transaction?.type.toLowerCase()) }
              `}>
                {transaction?.type === 'credit' ? '+' : '-'}
                ${transaction?.amount.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <span className={`px-2 py-1 rounded-full text-sm ${transaction?.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                {transaction?.status.charAt(0).toUpperCase() + transaction?.status.slice(1)}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date</p>
              {new Date(transaction?.createdAt).toLocaleString('en-US', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}
            </div>
            <div>
              <p className="text-sm text-gray-500">Category</p>
              <p className="font-medium capitalize">{transaction?.type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Description</p>
              <p className="font-medium">{transaction?.description}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Metadata</p>
              <pre className="bg-gray-50 p-2 rounded mt-1 text-sm">
                {JSON.stringify(transaction?.metadata, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default WalletTransactionPopup
