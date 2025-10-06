import { 
  Calendar, 
  CreditCard, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Receipt, 
  FileText, 
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Hash,
  User,
  Briefcase
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SidebarPopup from "../../../../../Components/Shared/SidebarPopup/SidebarPopup";
// Modal.setAppElement('#root');

const WalletTransactionPopup = ({ transaction, onClose }) => {
  const navigate = useNavigate();
  
  // Helper function to get transaction icon and color
  const getTransactionIcon = (type) => {
    const iconMap = {
      'credit': <ArrowDownCircle className="w-5 h-5 text-green-500" />,
      'debit': <ArrowUpCircle className="w-5 h-5 text-red-500" />,
      'hold': <Clock className="w-5 h-5 text-yellow-500" />,
      'refund': <ArrowDownCircle className="w-5 h-5 text-blue-500" />,
      'top-up': <CreditCard className="w-5 h-5 text-green-500" />
    };
    return iconMap[type?.toLowerCase()] || <Receipt className="w-5 h-5 text-gray-500" />;
  };

  // Helper function to get status badge
  const getStatusBadge = (status) => {
    const statusStyles = {
      'completed': { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle className="w-4 h-4 mr-1" /> },
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock className="w-4 h-4 mr-1" /> },
      'failed': { bg: 'bg-red-100', text: 'text-red-800', icon: <AlertCircle className="w-4 h-4 mr-1" /> },
      'processing': { bg: 'bg-blue-100', text: 'text-blue-800', icon: <Clock className="w-4 h-4 mr-1" /> }
    };
    const style = statusStyles[status?.toLowerCase()] || statusStyles.pending;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${style.bg} ${style.text}`}>
        {style.icon}
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  // Extract relevant metadata
  const metadata = transaction?.metadata || {};
  const hasInterviewDetails = metadata.interviewId || metadata.roundId || metadata.isMockInterview !== undefined;

  return (
    <SidebarPopup
      title="Transaction Details"
      onClose={onClose || (() => navigate('/account-settings/wallet'))}
    >
      <div className="p-6">
        <div className="space-y-6">
          {/* Transaction Header Card */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                {getTransactionIcon(transaction?.type)}
                <span className="ml-2 text-lg font-semibold text-gray-800 capitalize">
                  {transaction?.type} Transaction
                </span>
              </div>
              {getStatusBadge(transaction?.status)}
            </div>
            
            {/* Amount Display */}
            <div className="text-center py-4">
              <p className="text-sm text-gray-600 mb-1">Amount</p>
              <p className={`text-3xl font-bold ${
                transaction?.type === 'credit' || transaction?.type === 'top-up' || transaction?.type === 'refund'
                  ? 'text-green-600' 
                  : transaction?.type === 'hold' 
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}>
                {transaction?.type === 'credit' || transaction?.type === 'top-up' || transaction?.type === 'refund' ? '+' : 
                 transaction?.type === 'hold' ? '' : '-'}
                ₹{(transaction?.amount || 0).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Basic Details Card */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Transaction Information
            </h3>
            
            <div className="space-y-3">
              {/* Transaction ID */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Hash className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Reference ID</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {transaction?.relatedInvoiceId ? `INV-${transaction.relatedInvoiceId.slice(-8).toUpperCase()}` : "N/A"}
                </span>
              </div>
              
              {/* Date & Time */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Date & Time</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {new Date(transaction?.createdAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </span>
              </div>
              
              {/* Description */}
              {transaction?.description && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <FileText className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Description</span>
                  </div>
                  <p className="text-sm text-gray-900 ml-6">
                    {transaction.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Interview Details (if applicable) */}
          {hasInterviewDetails && (
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-indigo-600" />
                Interview Details
              </h3>
              
              <div className="space-y-3">
                {metadata.isMockInterview !== undefined && (
                  <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Interview Type</span>
                    <span className="text-sm font-semibold text-indigo-900">
                      {metadata.isMockInterview ? "Mock Interview" : "Regular Interview"}
                    </span>
                  </div>
                )}
                
                {metadata.hourlyRate && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Hourly Rate</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ₹{metadata.hourlyRate}/hr
                    </span>
                  </div>
                )}
                
                {metadata.duration && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Duration</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {metadata.duration}
                    </span>
                  </div>
                )}
                
                {metadata.mockInterviewDiscount && (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Applied Discount</span>
                    <span className="text-sm font-semibold text-green-900">
                      {metadata.mockInterviewDiscount}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Balance Impact (if applicable) */}
          {(metadata.prevBalance !== undefined || metadata.newBalance !== undefined) && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center">
                <DollarSign className="w-4 h-4 mr-1" />
                Balance Impact
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-blue-700">Previous Balance</p>
                  <p className="text-sm font-bold text-blue-900">
                    ₹{(metadata.prevBalance || 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-blue-700">New Balance</p>
                  <p className="text-sm font-bold text-blue-900">
                    ₹{(metadata.newBalance || 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </SidebarPopup>
  )
}

export default WalletTransactionPopup
