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
  IndianRupee,
  Hash,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Wallet,
  Info,
  Tag,
  Layers
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SidebarPopup from "../../../../../Components/Shared/SidebarPopup/SidebarPopup";

const WalletTransactionPopup = ({ transaction, onClose }) => {
  const navigate = useNavigate();

  // Helper function to format transaction type for display
  const formatTransactionType = (type) => {
    if (!type) return "Unknown";
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Helper function to get transaction icon and color
  const getTransactionStyle = (type, effect) => {
    const t = (type || "").toLowerCase();
    const e = (effect || "").toUpperCase();

    if (t === 'credited' || t === 'credit' || t === 'topup' || e === 'CREDIT') {
      return {
        icon: <ArrowDownCircle className="w-6 h-6 text-green-500" />,
        bgGradient: 'from-green-50 to-emerald-50',
        borderColor: 'border-green-200',
        amountColor: 'text-green-600',
        prefix: '+'
      };
    }
    if (t === 'debited' || t === 'debit' || e === 'DEBIT') {
      return {
        icon: <ArrowUpCircle className="w-6 h-6 text-red-500" />,
        bgGradient: 'from-red-50 to-rose-50',
        borderColor: 'border-red-200',
        amountColor: 'text-red-600',
        prefix: '-'
      };
    }
    if (t === 'hold' || t === 'hold_adjust') {
      return {
        icon: <Clock className="w-6 h-6 text-yellow-500" />,
        bgGradient: 'from-yellow-50 to-amber-50',
        borderColor: 'border-yellow-200',
        amountColor: 'text-yellow-600',
        prefix: ''
      };
    }
    if (t === 'hold_release') {
      return {
        icon: <TrendingUp className="w-6 h-6 text-blue-500" />,
        bgGradient: 'from-blue-50 to-indigo-50',
        borderColor: 'border-blue-200',
        amountColor: 'text-blue-600',
        prefix: '+'
      };
    }
    if (t === 'refund') {
      return {
        icon: <ArrowDownCircle className="w-6 h-6 text-purple-500" />,
        bgGradient: 'from-purple-50 to-violet-50',
        borderColor: 'border-purple-200',
        amountColor: 'text-purple-600',
        prefix: ''
      };
    }
    return {
      icon: <Receipt className="w-6 h-6 text-gray-500" />,
      bgGradient: 'from-gray-50 to-slate-50',
      borderColor: 'border-gray-200',
      amountColor: 'text-gray-600',
      prefix: ''
    };
  };

  // Helper function to get status badge
  const getStatusBadge = (status) => {
    const statusStyles = {
      'completed': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200', icon: <CheckCircle className="w-4 h-4 mr-1.5" /> },
      'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200', icon: <Clock className="w-4 h-4 mr-1.5" /> },
      'failed': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200', icon: <AlertCircle className="w-4 h-4 mr-1.5" /> },
      'processing': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200', icon: <Clock className="w-4 h-4 mr-1.5" /> }
    };
    const style = statusStyles[status?.toLowerCase()] || statusStyles.pending;
    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${style.bg} ${style.text} ${style.border}`}>
        {style.icon}
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Pending'}
      </span>
    );
  };

  // Format reason for display
  const formatReason = (reason) => {
    if (!reason) return null;
    return reason
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Extract relevant metadata
  const metadata = transaction?.metadata || {};
  const txnStyle = getTransactionStyle(transaction?.type, transaction?.effect);

  // Check what details are available
  const hasAmountBreakdown = transaction?.gstAmount > 0 || (transaction?.serviceCharge != null && transaction?.serviceCharge > 0);
  // Check for payout breakdown (interviewer payouts have negative service charge = deduction)
  const hasPayoutBreakdown = transaction?.serviceCharge != null && transaction?.serviceCharge < 0;
  const hasBalanceImpact = transaction?.balanceBefore !== undefined || transaction?.balanceAfter !== undefined;
  const hasHoldBalanceImpact = transaction?.holdBalanceBefore !== undefined || transaction?.holdBalanceAfter !== undefined;
  const hasInterviewDetails = metadata.interviewId || metadata.roundId || metadata.requestId;


  return (
    <SidebarPopup
      title="Transaction Details"
      onClose={onClose || (() => navigate('/account-settings/wallet'))}
    >
      <div className="p-6">
        <div className="space-y-5">
          {/* Transaction Header Card */}
          <div className={`bg-gradient-to-br ${txnStyle.bgGradient} rounded-xl p-5 border ${txnStyle.borderColor}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  {txnStyle.icon}
                </div>
                <div>
                  <span className="text-lg font-semibold text-gray-800">
                    {formatTransactionType(transaction?.type)}
                  </span>
                  {transaction?.effect && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Effect: {transaction.effect}
                    </p>
                  )}
                </div>
              </div>
              {getStatusBadge(transaction?.status)}
            </div>

            {/* Amount Display */}
            <div className="bg-white/60 rounded-lg p-4 mt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                  <p className={`text-3xl font-bold ${txnStyle.amountColor}`}>
                    {txnStyle.prefix}₹{(transaction?.totalAmount || transaction?.amount || 0).toFixed(2)}
                  </p>
                </div>
                {transaction?.bucket && (
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Bucket</p>
                    <span className={`text-sm font-medium px-2.5 py-1 rounded-full ${transaction.bucket === 'AVAILABLE'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                      }`}>
                      {transaction.bucket}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Amount Breakdown Card */}
          {hasAmountBreakdown && (
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center">
                <IndianRupee className="w-5 h-5 mr-2 text-blue-600" />
                Amount Breakdown
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Base Amount</span>
                  <span className="text-sm font-semibold text-gray-900">
                    ₹{(transaction?.amount || 0).toFixed(2)}
                  </span>
                </div>

                {transaction?.gstAmount > 0 && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">GST (18%)</span>
                    <span className="text-sm font-medium text-gray-700">
                      ₹{transaction.gstAmount.toFixed(2)}
                    </span>
                  </div>
                )}

                {transaction?.serviceCharge > 0 && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Service Charge</span>
                    <span className="text-sm font-medium text-gray-700">
                      ₹{transaction.serviceCharge.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-semibold text-gray-800">Total</span>
                  <span className={`text-base font-bold ${txnStyle.amountColor}`}>
                    ₹{(transaction?.totalAmount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Payout Breakdown Card (for interviewer payouts with service charge deduction) */}
          {hasPayoutBreakdown && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-200 shadow-sm">
              <h3 className="text-base font-semibold text-green-800 mb-4 flex items-center">
                <IndianRupee className="w-5 h-5 mr-2 text-green-600" />
                Payout Breakdown
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-green-100">
                  <span className="text-sm text-gray-600">Gross Amount</span>
                  <span className="text-sm font-semibold text-gray-900">
                    ₹{(transaction?.amount || 0).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-green-100">
                  <span className="text-sm text-gray-600">
                    Service Charge {metadata.serviceChargePercent ? `(${metadata.serviceChargePercent}%)` : ''}
                  </span>
                  <span className="text-sm font-medium text-red-600">
                    - ₹{Math.abs(transaction?.serviceCharge || 0).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm font-semibold text-gray-800">Net Amount Credited</span>
                  <span className="text-base font-bold text-green-600">
                    + ₹{(transaction?.totalAmount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Balance Impact Card */}
          {(hasBalanceImpact || hasHoldBalanceImpact) && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
              <h3 className="text-base font-semibold text-blue-900 mb-4 flex items-center">
                <Wallet className="w-5 h-5 mr-2" />
                Balance Impact
              </h3>

              <div className="space-y-4">
                {/* Available Balance */}
                {hasBalanceImpact && (
                  <div className="bg-white/70 rounded-lg p-3">
                    <p className="text-xs font-medium text-blue-700 mb-2 uppercase tracking-wide">Available Balance</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Before</p>
                        <p className="text-sm font-semibold text-gray-700">
                          ₹{(transaction?.balanceBefore || 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-gray-400">→</div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">After</p>
                        <p className="text-sm font-semibold text-gray-900">
                          ₹{(transaction?.balanceAfter || 0).toFixed(2)}
                        </p>
                      </div>
                      <div className={`text-sm font-bold ${(transaction?.balanceAfter || 0) >= (transaction?.balanceBefore || 0)
                        ? 'text-green-600'
                        : 'text-red-600'
                        }`}>
                        {(transaction?.balanceAfter || 0) >= (transaction?.balanceBefore || 0) ? (
                          <TrendingUp className="w-5 h-5" />
                        ) : (
                          <TrendingDown className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Hold Balance */}
                {hasHoldBalanceImpact && (
                  <div className="bg-white/70 rounded-lg p-3">
                    <p className="text-xs font-medium text-yellow-700 mb-2 uppercase tracking-wide">Hold Balance</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Before</p>
                        <p className="text-sm font-semibold text-gray-700">
                          ₹{(transaction?.holdBalanceBefore || 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-gray-400">→</div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">After</p>
                        <p className="text-sm font-semibold text-gray-900">
                          ₹{(transaction?.holdBalanceAfter || 0).toFixed(2)}
                        </p>
                      </div>
                      <div className={`text-sm font-bold ${(transaction?.holdBalanceAfter || 0) <= (transaction?.holdBalanceBefore || 0)
                        ? 'text-green-600'
                        : 'text-yellow-600'
                        }`}>
                        {(transaction?.holdBalanceAfter || 0) > (transaction?.holdBalanceBefore || 0) ? (
                          <TrendingUp className="w-5 h-5" />
                        ) : (
                          <TrendingDown className="w-5 h-5" />
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Transaction Information Card */}
          <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
            <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Transaction Information
            </h3>

            <div className="space-y-3">
              {/* Transaction ID */}
              {transaction?.relatedInvoiceId && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Hash className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Reference ID</span>
                  </div>
                  <span className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-800">
                    {transaction.relatedInvoiceId.length === 24
                      ? `TXN-${transaction.relatedInvoiceId.slice(-8).toUpperCase()}`
                      : transaction.relatedInvoiceId}
                  </span>
                </div>
              )}

              {/* Date & Time */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Date & Time</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {new Date(transaction?.createdAt || transaction?.createdDate).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </span>
              </div>

              {/* Reason */}
              {transaction?.reason && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Tag className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Reason</span>
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    {formatReason(transaction.reason)}
                  </span>
                </div>
              )}

              {/* Description */}
              {transaction?.description && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Info className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Description</span>
                  </div>
                  <p className="text-sm text-gray-800 ml-6">
                    {transaction.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Interview/Round Details Card */}
          {hasInterviewDetails && (
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center">
                <Briefcase className="w-5 h-5 mr-2 text-indigo-600" />
                Interview Details
              </h3>

              <div className="space-y-3">
                {metadata.interviewId && (
                  <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Interview ID</span>
                    <span className="text-sm font-mono bg-indigo-100 px-2 py-0.5 rounded text-indigo-800">
                      {metadata.interviewId.slice(-8).toUpperCase()}
                    </span>
                  </div>
                )}

                {metadata.roundId && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Round ID</span>
                    <span className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-800">
                      {metadata.roundId.slice(-8).toUpperCase()}
                    </span>
                  </div>
                )}

                {metadata.requestId && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Request ID</span>
                    <span className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-800">
                      {metadata.requestId.slice(-8).toUpperCase()}
                    </span>
                  </div>
                )}

                {metadata.source && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Source</span>
                    <span className="text-sm font-medium text-gray-800">
                      {formatReason(metadata.source)}
                    </span>
                  </div>
                )}

                {metadata.interviewerContactId && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Interviewer</span>
                    <span className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-800">
                      {metadata.interviewerContactId.slice(-6).toUpperCase()}
                    </span>
                  </div>
                )}

                {metadata.refundReason && (
                  <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Refund Reason</span>
                    <span className="text-sm font-medium text-purple-800">
                      {formatReason(metadata.refundReason)}
                    </span>
                  </div>
                )}

                {metadata.refundedAt && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Refunded At</span>
                    <span className="text-sm text-gray-800">
                      {new Date(metadata.refundedAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}

                {metadata.refundDate && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Refund Date</span>
                    <span className="text-sm text-gray-800">
                      {new Date(metadata.refundDate).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}

                {metadata.originalTransactionId && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Original Transaction</span>
                    <span className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-800">
                      {metadata.originalTransactionId.slice(-8).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Additional Metadata Card (for payment/topup details) */}
          {(metadata.paymentId || metadata.orderId) && (
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h3 className="text-base font-semibold text-gray-800 mb-4 flex items-center">
                <CreditCard className="w-5 h-5 mr-2 text-green-600" />
                Payment Details
              </h3>

              <div className="space-y-3">
                {metadata.paymentId && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Payment ID</span>
                    <span className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-800">
                      {metadata.paymentId}
                    </span>
                  </div>
                )}

                {metadata.orderId && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Order ID</span>
                    <span className="text-sm font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-800">
                      {metadata.orderId}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </SidebarPopup>
  );
};

export default WalletTransactionPopup;
