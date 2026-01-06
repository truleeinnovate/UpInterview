import React, { useState } from "react";
import {
  Wallet as WalletIcon,
  Calendar,
  ArrowUpCircle,
  Clock,
  CheckCircle,
  AlertCircle,
  IndianRupee,
  Filter,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Briefcase,
  TrendingUp,
  Eye,
} from "lucide-react";
import { usePlatformWallet } from "../../../apiHooks/superAdmin/usePlatformWallet";
import DropdownSelect from "../../../Components/Dropdowns/DropdownSelect";

// Filter options for transaction types
const filterOptions = [
  { value: "all", label: "All Transactions" },
  { value: "commission", label: "Commissions Only" },
  { value: "gst", label: "GST Only" },
];

// Format reason for display
const formatReason = (reason) => {
  if (!reason) return "-";
  return reason
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// Get badge style based on transaction reason
const getTransactionBadgeStyle = (type, reason) => {
  if (reason === "PLATFORM_COMMISSION") {
    return {
      bg: "bg-purple-100",
      text: "text-purple-700",
      border: "border-purple-200",
      icon: <Briefcase className="w-3 h-3 mr-1" />,
      label: "Commission",
    };
  }
  if (reason === "PLATFORM_GST") {
    return {
      bg: "bg-blue-100",
      text: "text-blue-700",
      border: "border-blue-200",
      icon: <IndianRupee className="w-3 h-3 mr-1" />,
      label: "GST",
    };
  }

  switch (type) {
    case "platform_fee":
      return {
        bg: "bg-green-100",
        text: "text-green-700",
        border: "border-green-200",
        icon: <ArrowUpCircle className="w-3 h-3 mr-1" />,
        label: "Platform Fee",
      };
    case "credited":
      return {
        bg: "bg-green-100",
        text: "text-green-700",
        border: "border-green-200",
        icon: <ArrowUpCircle className="w-3 h-3 mr-1" />,
        label: "Credited",
      };
    default:
      return {
        bg: "bg-gray-100",
        text: "text-gray-700",
        border: "border-gray-200",
        icon: null,
        label: type?.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") || "Transaction",
      };
  }
};

// Transaction Card Component
const TransactionCard = ({ transaction, isExpanded, onToggle }) => {
  const badgeStyle = getTransactionBadgeStyle(transaction.type, transaction.reason);
  const hasGst = transaction.gstAmount != null && transaction.gstAmount > 0;
  const hasServiceCharge = transaction.serviceCharge != null && transaction.serviceCharge > 0;

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors mb-3 last:mb-0">
      {/* Main Row */}
      <div className="p-4 cursor-pointer" onClick={onToggle}>
        {/* Top Row: Badge, Status, Date */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <span
              className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
            >
              {badgeStyle.icon}
              {badgeStyle.label}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded font-medium ${transaction.status === "completed"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                }`}
            >
              {transaction.status?.charAt(0).toUpperCase() + transaction.status?.slice(1) || "Pending"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(transaction.createdAt || transaction.createdDate)}
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-700 mb-3 line-clamp-1">
          {transaction.description || "No description"}
        </p>

        {/* Amount Breakdown Row */}
        <div className="flex items-end justify-between">
          <div className="flex items-center gap-6">
            {/* Amount / Service Fee */}
            {hasServiceCharge ? (
              <div>
                <p className="text-xs text-gray-500">Service Fee</p>
                <p className="text-sm font-semibold text-purple-600">
                  ₹{transaction.serviceCharge.toFixed(2)}
                </p>
              </div>
            ) : hasGst ? (
              <div>
                <p className="text-xs text-gray-500">GST</p>
                <p className="text-sm font-semibold text-blue-600">
                  ₹{transaction.gstAmount.toFixed(2)}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-xs text-gray-500">Amount</p>
                <p className="text-sm font-semibold text-gray-800">
                  ₹{(transaction.amount || 0).toFixed(2)}
                </p>
              </div>
            )}

            {/* Total */}
            <div className="border-l pl-4 ml-2">
              <p className="text-xs text-gray-500">Total Credited</p>
              <p className="text-base font-bold text-green-600">
                +₹{(transaction.totalAmount || transaction.amount || 0).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Reason Badge */}
          <div className="text-right">
            <p className="text-xs text-gray-400 mb-1">Reason</p>
            <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
              {formatReason(transaction.reason)}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50 rounded-b-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-500 mb-1">Transaction ID</p>
              <p className="font-mono text-xs text-gray-700 truncate">{transaction._id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Invoice ID</p>
              <p className="font-mono text-xs text-gray-700 truncate">{transaction.relatedInvoiceId || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Bucket</p>
              <p className="text-xs font-medium text-gray-700">{transaction.bucket || "-"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Effect</p>
              <p className="text-xs font-medium text-gray-700">{transaction.effect || "-"}</p>
            </div>

            {/* Balance Impact */}
            {transaction.balanceBefore !== undefined && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Balance Before</p>
                <p className="text-xs font-semibold text-gray-700">
                  ₹{(transaction.balanceBefore || 0).toFixed(2)}
                </p>
              </div>
            )}
            {transaction.balanceAfter !== undefined && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Balance After</p>
                <p className="text-xs font-semibold text-green-600">
                  ₹{(transaction.balanceAfter || 0).toFixed(2)}
                </p>
              </div>
            )}

            {/* Metadata */}
            {transaction.metadata?.roundId && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Round ID</p>
                <p className="font-mono text-xs text-gray-700 truncate">{transaction.metadata.roundId}</p>
              </div>
            )}
            {transaction.metadata?.interviewId && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Interview ID</p>
                <p className="font-mono text-xs text-gray-700 truncate">{transaction.metadata.interviewId}</p>
              </div>
            )}
            {transaction.metadata?.interviewerOwnerId && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Interviewer ID</p>
                <p className="font-mono text-xs text-gray-700 truncate">{transaction.metadata.interviewerOwnerId}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Main Component
const PlatformWalletPage = () => {
  const { data: wallet, isLoading, isError, error, refetch, isRefetching } = usePlatformWallet();
  const [expandedId, setExpandedId] = useState(null);
  const [filterType, setFilterType] = useState("all");

  const handleToggle = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Get transactions
  const transactions = Array.isArray(wallet?.transactions) ? wallet.transactions : [];

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter((tx) => {
      if (filterType === "all") return true;
      if (filterType === "commission") return tx.reason === "PLATFORM_COMMISSION";
      if (filterType === "gst") return tx.reason === "PLATFORM_GST";
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || a.createdDate || 0);
      const dateB = new Date(b.createdAt || b.createdDate || 0);
      return dateB - dateA;
    });

  // Calculate totals
  const totalCommissions = transactions
    .filter((tx) => tx.reason === "PLATFORM_COMMISSION")
    .reduce((sum, tx) => sum + (tx.serviceCharge || tx.amount || 0), 0);

  const totalGst = transactions
    .filter((tx) => tx.reason === "PLATFORM_GST")
    .reduce((sum, tx) => sum + (tx.gstAmount || tx.amount || 0), 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-gray-600">Loading platform wallet...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center text-red-600">
          <AlertCircle className="w-8 h-8 mx-auto mb-3" />
          <p>Failed to load platform wallet</p>
          <p className="text-sm mt-1">{error?.message || "Unknown error"}</p>
          <button
            onClick={() => refetch()}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const balance = wallet?.balance ?? 0;
  const holdAmount = wallet?.holdAmount ?? 0;

  return (
    <div className="px-6 py-6 w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
            <WalletIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Platform Wallet</h1>
            <p className="text-sm text-gray-500">
              Platform's earnings from commissions and GST
            </p>
          </div>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 w-full">
        {/* Available Balance */}
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2 opacity-90">
            <WalletIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Available Balance</span>
          </div>
          <p className="text-3xl font-bold">₹{Number(balance).toFixed(2)}</p>
        </div>

        {/* Hold Amount */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2 opacity-90">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Hold Amount</span>
          </div>
          <p className="text-3xl font-bold">₹{Number(holdAmount).toFixed(2)}</p>
        </div>

        {/* Total Commissions */}
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2 opacity-90">
            <Briefcase className="w-4 h-4" />
            <span className="text-sm font-medium">Total Commissions</span>
          </div>
          <p className="text-3xl font-bold">₹{totalCommissions.toFixed(2)}</p>
        </div>

        {/* Total GST */}
        <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-5 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-2 opacity-90">
            <IndianRupee className="w-4 h-4" />
            <span className="text-sm font-medium">Total GST Collected</span>
          </div>
          <p className="text-3xl font-bold">₹{totalGst.toFixed(2)}</p>
        </div>
      </div>

      {/* Wallet Info */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-6 flex-wrap">
          <div>
            <p className="text-xs text-gray-500">Wallet Code</p>
            <p className="font-mono text-sm font-medium text-gray-700">
              {wallet?.walletCode || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Currency</p>
            <p className="text-sm font-medium text-gray-700">
              {wallet?.currency || "INR"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Owner Type</p>
            <p className="text-sm font-medium text-gray-700">
              {wallet?.isCompany ? "PLATFORM" : wallet?.ownerType || "PLATFORM"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-sm text-green-600 font-medium">Active</span>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gray-400" />
            Transaction History
          </h2>
          <div className="flex items-center gap-2 min-w-[200px]">
            <Filter className="w-4 h-4 text-gray-400" />
            <DropdownSelect
              value={filterOptions.find(opt => opt.value === filterType)}
              onChange={(selected) => setFilterType(selected?.value || "all")}
              options={filterOptions}
              isSearchable={false}
              placeholder="Filter by type"
              menuPlacement="auto"
            />
          </div>
        </div>

        {/* Transactions List */}
        <div className="p-4">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <WalletIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No transactions found</p>
            </div>
          ) : (
            filteredTransactions.map((transaction) => (
              <TransactionCard
                key={transaction._id}
                transaction={transaction}
                isExpanded={expandedId === transaction._id}
                onToggle={() => handleToggle(transaction._id)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 rounded-b-xl text-sm text-gray-500 flex items-center justify-between">
          <span>
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </span>
          <span className="flex items-center gap-1 text-xs">
            <Eye className="w-3.5 h-3.5" />
            Click on a transaction to expand details
          </span>
        </div>
      </div>
    </div>
  );
};

export default PlatformWalletPage;
