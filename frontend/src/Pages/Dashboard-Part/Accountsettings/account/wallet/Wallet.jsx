//<----v1.0.0-----Venkatesh-----backend via TanStack Query added
// v1.0.1 - Ashok - Improved responsiveness
// v1.0.2 - Ashok - fixed style issues and loading view

import { useState, useEffect, useRef, useCallback } from "react";
import { RefreshCw, Search, ChevronRight } from "lucide-react";
import { ViewDetailsButton } from "../../common/Buttons";

import { Outlet, useNavigate, useOutletContext } from "react-router-dom";
import WalletBalancePopup from "./WalletBalancePopup";
import WalletTransactionPopup from "./WalletTransactionPopup";
import SidebarPopup from "../../../../../Components/Shared/SidebarPopup/SidebarPopup";
import { WalletTopupPopup } from "./WalletTopupPopup";
import { BankAccountsPopup } from "./BankAccountsPopup";
import { WithdrawalModal } from "./WithdrawalModal";
import { WithdrawalHistory } from "./WithdrawalHistory";
import "./topupAnimation.css";
import { usePermissionCheck } from "../../../../../utils/permissionUtils";
import { useWallet } from "../../../../../apiHooks/useWallet"; //<----v1.0.0-----
import { useWalletTransactions } from "../../../../../apiHooks/useWalletTransactions";

export const getTransactionTypeStyle = (type) => {
  const t = (type || "").toString().toLowerCase();
  switch (t) {
    case "credited":
    case "credit":
    case "topup":
    case "refund":
    case "payout":
    case "platform_fee":
      return "text-green-600";
    case "debited":
      return "text-red-600";
    case "hold":
    case "hold adjust":
    case "hold_adjust":
    case "hold release":
    case "hold_release":
      return "text-yellow-600";
    default:
      return "text-gray-600";
  }
};

// export const calculatePendingBalance = (walletBalance) => {
//   if (!walletBalance?.transactions) return 0;

//   return walletBalance.transactions.reduce((total, transaction) => {
//     if (transaction.type.toLowerCase() === "hold") {
//       return total + transaction.amount;
//     }
//     return total;
//   }, 0);
// };

const Wallet = () => {
  const { checkPermission, isInitialized } = usePermissionCheck();
  const { data: walletBalance, isLoading, refetch } = useWallet(); //<----v1.0.0-----
  const [isRefetching, setIsRefetching] = useState(false);
  console.log(" walletBalance", walletBalance);
  // --------------------FOR PADDING-------------------------
  const context = useOutletContext();
  const typeFrom = context?.typeFrom;
  // --------------------FOR PADDING-------------------------

  const handleRefetch = useCallback(async () => {
    setIsRefetching(true);
    try {
      await refetch();
    } catch (error) {
      console.error("Error refreshing wallet data:", error);
    } finally {
      setIsRefetching(false);
    }
  }, [refetch]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [viewingBalance, setViewingBalance] = useState(false);
  const [isTopupOpen, setIsTopupOpen] = useState(false);
  const [isBankAccountsOpen, setIsBankAccountsOpen] = useState(false);
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);
  const [isWithdrawalHistoryOpen, setIsWithdrawalHistoryOpen] = useState(false);
  const [isAllTransactionsOpen, setIsAllTransactionsOpen] = useState(false);
  const [txnSearchTerm, setTxnSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [txnPage, setTxnPage] = useState(0);
  const [allLoadedTxns, setAllLoadedTxns] = useState([]);
  const [animateTopUp, setAnimateTopUp] = useState(true);
  const topUpButtonRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    setAnimateTopUp(true);
    const animationTimer = setTimeout(() => {
      setAnimateTopUp(false);
    }, 20000);

    return () => clearTimeout(animationTimer);
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(txnSearchTerm);
      setTxnPage(0);
      setAllLoadedTxns([]);
    }, 400);
    return () => clearTimeout(timer);
  }, [txnSearchTerm]);

  // Fetch transactions from backend
  const TXN_PAGE_SIZE = 20;
  const {
    data: txnData,
    isLoading: txnLoading,
    isFetching: txnFetching,
  } = useWalletTransactions({
    page: txnPage,
    limit: TXN_PAGE_SIZE,
    search: debouncedSearch,
    enabled: isAllTransactionsOpen,
  });

  // Accumulate loaded transactions for "Load More"
  useEffect(() => {
    if (txnData?.transactions) {
      if (txnPage === 0) {
        setAllLoadedTxns(txnData.transactions);
      } else {
        setAllLoadedTxns((prev) => [...prev, ...txnData.transactions]);
      }
    }
  }, [txnData, txnPage]);

  // Permission check after all hooks
  if (!isInitialized || !checkPermission("Wallet")) {
    return null;
  }

  //const pendingBalance = calculatePendingBalance(walletBalance); //<----v1.0.0-----
  const walletTransactions = walletBalance?.transactions || [];

  const handleTopup = async (topupData) => {

    try {
      await refetch();
    } catch (error) {
      console.error("Error refreshing wallet data after topup:", error);
    }
  };

  const containerPadding = typeFrom === "account-settings" ? "px-4" : "px-[8%]";

  // Skeleton Loading Component for Wallet
  // v1.0.1 <--------------------------------------------------------------------------
  const WalletSkeleton = () => {
    return (
      // <div className="space-y-6 px-4 py-6">
      //   {/* Header skeleton */}
      //   <div className="flex justify-between items-center">
      //     <h2 className="text-2xl font-bold">Wallet</h2>
      //     <div className="flex space-x-3">
      //       <div className="h-10 w-20 bg-gray-200 skeleton-animation rounded-lg"></div>
      //       <div className="h-10 w-20 bg-gray-200 skeleton-animation rounded-lg"></div>
      //       <div className="h-10 w-10 bg-gray-200 skeleton-animation rounded-lg"></div>
      //     </div>
      //   </div>

      //   {/* Balance skeleton */}
      //   <div className="bg-white p-6 rounded-lg shadow">
      //     <div className="flex justify-between">
      //       <div>
      //         <div className="h-6 w-40 bg-gray-200 skeleton-animation rounded mb-3"></div>
      //         <div className="mt-3 flex items-center">
      //           <div className="h-10 w-32 bg-gray-200 skeleton-animation rounded mr-2"></div>
      //         </div>
      //         <div className="mt-2 flex space-x-4">
      //           <div className="h-4 w-32 bg-gray-200 skeleton-animation rounded"></div>
      //           <div className="h-4 w-32 bg-gray-200 skeleton-animation rounded"></div>
      //         </div>
      //       </div>
      //       <div className="text-right">
      //         <div className="h-4 w-32 bg-gray-200 skeleton-animation rounded mb-2"></div>
      //         <div className="h-8 w-24 bg-gray-200 skeleton-animation rounded"></div>
      //       </div>
      //     </div>
      //   </div>

      //   {/* Transactions skeleton */}
      //   <div className="bg-white p-6 rounded-lg shadow">
      //     <div className="flex justify-between items-center mb-4">
      //       <div className="h-6 w-40 bg-gray-200 skeleton-animation rounded"></div>
      //       <div className="h-6 w-32 bg-gray-200 skeleton-animation rounded"></div>
      //     </div>
      //     <div className="space-y-4">
      //       {[1, 2, 3].map((item) => (
      //         <div key={item} className="flex items-center justify-between border-b pb-4 last:border-b-0">
      //           <div>
      //             <div className="h-5 w-48 bg-gray-200 skeleton-animation rounded mb-2"></div>
      //             <div className="flex items-center space-x-2">
      //               <div className="h-4 w-32 bg-gray-200 skeleton-animation rounded"></div>
      //               <div className="h-4 w-16 bg-gray-200 skeleton-animation rounded"></div>
      //             </div>
      //           </div>
      //           <div className="flex items-center space-x-4">
      //             <div className="text-right">
      //               <div className="h-5 w-20 bg-gray-200 skeleton-animation rounded mb-1"></div>
      //               <div className="h-4 w-16 bg-gray-200 skeleton-animation rounded"></div>
      //             </div>
      //             <div className="h-8 w-8 bg-gray-200 skeleton-animation rounded"></div>
      //           </div>
      //         </div>
      //       ))}
      //     </div>
      //   </div>
      // </div>
      // <div className="space-y-6 px-4 py-6">
      <div className={`space-y-6 ${containerPadding} sm:px-4 py-6`}>
        {/* Header skeleton */}
        {/* <div className="flex sm:flex-col sm:justify-start justify-between sm:items-start items-center">
          <div className="sm:text-xl md:tex-xl text-2xl font-bold sm:mb-4 h-8 w-32 bg-gray-200 skeleton-animation rounded"></div>
          <div className="flex space-x-3">
            <div className="sm:px-2 px-4 sm:py-1 py-2 h-10 w-20 bg-gray-200 skeleton-animation rounded-lg"></div>
            <div className="sm:px-2 px-4 sm:py-1 py-2 h-10 w-20 bg-gray-200 skeleton-animation rounded-lg"></div>
            <div className="sm:px-2 sm:py-1 h-10 w-10 bg-gray-200 skeleton-animation rounded-lg"></div>
          </div>
        </div> */}
        <div className="flex sm:flex-col sm:justify-start justify-between sm:items-start items-center">
          <h2 className="sm:text-xl md:tex-xl text-2xl font-bold sm:mb-4">
            Wallet
          </h2>
          <div className="flex space-x-3">
            <button className="sm:px-2 px-4 sm:py-1 py-2 border border-custom-blue text-custom-blue text-sm hover:bg-custom-blue/90 hover:text-white rounded-lg">
              Bank Accounts
            </button>
            <button className="sm:px-2 px-4 sm:py-1 py-2 border border-custom-blue text-custom-blue text-sm hover:bg-custom-blue/90 hover:text-white rounded-lg">
              Withdraw
            </button>
            <button
              className={`sm:px-2 px-4 sm:py-1 py-2 bg-custom-blue text-white rounded-lg text-sm hover:bg-custom-blue/90
              }`}
            >
              Top Up
            </button>
          </div>
        </div>

        {/* Balance skeleton */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex sm:flex-col justify-between">
            <div>
              <div className="h-6 w-40 bg-gray-200 skeleton-animation rounded mb-3"></div>
              <div className="mt-3 flex items-center">
                <div className="h-10 w-32 bg-gray-200 skeleton-animation rounded mr-2"></div>
              </div>
              <div className="mt-2 flex sm:flex-col sm:space-x-0 space-x-4 text-sm">
                <div className="h-4 w-32 bg-gray-200 skeleton-animation rounded mb-2"></div>
                <div className="h-4 w-32 bg-gray-200 skeleton-animation rounded"></div>
              </div>
            </div>
            {/* <div className="sm:text-start text-right">
              <div className="h-4 w-32 bg-gray-200 skeleton-animation rounded mb-2"></div>
              <div className="h-8 w-24 bg-gray-200 skeleton-animation rounded"></div>
            </div> */}
            <div className="sm:text-start text-right">
              <p className="text-sm text-gray-500">Last updated:</p>
              <ViewDetailsButton className="mt-2" />
            </div>
          </div>
        </div>

        {/* Transactions skeleton */}
        <div className="bg-white p-6 rounded-lg shadow">
          {/* <div className="flex sm:flex-col sm:justify-start justify-between sm:items-start items-center mb-4">
            <div className="h-6 w-40 bg-gray-200 skeleton-animation rounded mb-2"></div>
            <div className="h-6 w-32 bg-gray-200 skeleton-animation rounded"></div>
          </div> */}
          <div className="flex sm:flex-col sm:justify-start justify-between sm:items-start items-center mb-4">
            <h3 className="text-lg font-medium">Transaction History</h3>
            <button className="text-custom-blue hover:text-custom-blue/80">
              Export Transactions
            </button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex items-center justify-between border-b pb-4 last:border-b-0"
              >
                <div>
                  <div className="h-5 w-48 bg-gray-200 skeleton-animation rounded mb-2"></div>
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-32 bg-gray-200 skeleton-animation rounded"></div>
                    <div className="h-4 w-16 bg-gray-200 skeleton-animation rounded"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="h-5 w-20 bg-gray-200 skeleton-animation rounded mb-1"></div>
                    <div className="h-4 w-16 bg-gray-200 skeleton-animation rounded"></div>
                  </div>
                  <div className="h-8 w-8 bg-gray-200 skeleton-animation rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  // v1.0.1 -------------------------------------------------------------------------->

  // Show skeleton if data is still loading
  if (isLoading) {
    return <WalletSkeleton />;
  }

  return (
    <>
      {/* v1.0.3 <----------------------------------------------------------------------- */}
      {/* <div className="space-y-6 px-[8%] sm:px-4 py-6"> */}
      <div className={`space-y-6 ${containerPadding} sm:px-4 py-6`}>
        <div className="flex sm:flex-col sm:justify-start justify-between sm:items-start items-center">
          <h2 className="sm:text-xl md:tex-xl text-2xl font-bold sm:mb-4">
            Wallet
          </h2>
          <div className="flex space-x-3">
            <button
              onClick={() => setIsBankAccountsOpen(true)}
              className="sm:px-2 px-4 sm:py-1 py-2 border border-custom-blue text-custom-blue text-sm hover:bg-custom-blue/90 hover:text-white rounded-lg"
            >
              Bank Accounts
            </button>
            <button
              onClick={() => setIsWithdrawalOpen(true)}
              className="sm:px-2 px-4 sm:py-1 py-2 border border-custom-blue text-custom-blue text-sm hover:bg-custom-blue/90 hover:text-white rounded-lg"
            >
              Withdraw
            </button>
            <button
              ref={topUpButtonRef}
              onClick={() => setIsTopupOpen(true)}
              className={`sm:px-2 px-4 sm:py-1 py-2 bg-custom-blue text-white rounded-lg text-sm hover:bg-custom-blue/90 ${animateTopUp ? "top-up-button-animation pulse-glow" : ""
                }`}
            >
              Top Up
            </button>
          </div>
        </div>

        {/* Balance */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex sm:flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">Available Balance</h3>
                <button
                  onClick={handleRefetch}
                  disabled={isRefetching}
                  title="Refresh balance"
                  className="p-1 text-gray-400 hover:text-custom-blue hover:bg-blue-50 rounded-full transition-colors duration-200 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
                </button>
              </div>
              <div className="mt-3 flex items-center">
                <span className="sm:text-xl text-3xl font-bold mr-2">
                  ₹
                  {walletBalance?.balance
                    ? walletBalance.balance.toFixed(2)
                    : "0.00"}
                </span>
                {/* <button
                  onClick={() => setIsTopupOpen(true)}
                  className="ml-3 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >   
                  Top Up
              </button>
              <button
                onClick={() => setIsBankAccountsOpen(true)}
                className="ml-2 px-3 py-1 border border-blue-600 text-blue-600 text-sm rounded hover:bg-blue-50"
              >
                Withdraw
              </button> */}
              </div>
              <div className="mt-2 flex sm:flex-col sm:space-x-0 space-x-4 text-sm">
                {/* <div>
                  <span className="text-gray-500">Pending Balance: </span>
                  <span className="text-sm font-medium">
                    ₹{pendingBalance.toFixed(2)}
                  </span>
                </div> */}
                <div>
                  <span className="text-gray-500">Hold Amount: </span>
                  <span className="text-sm font-medium text-yellow-600">
                    ₹
                    {walletBalance?.holdAmount
                      ? walletBalance?.holdAmount.toFixed(2)
                      : 0.0}
                  </span>
                </div>
              </div>
            </div>
            <div className="sm:text-start text-right">
              <p className="text-sm text-gray-500">
                Last updated:{" "}
                {walletBalance?.updatedAt
                  ? new Date(walletBalance.updatedAt).toLocaleString()
                  : "N/A"}
              </p>
              <ViewDetailsButton
                onClick={() => setViewingBalance(true)}
                className="mt-2"
              />
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex sm:flex-col sm:justify-start justify-between sm:items-start items-center mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-medium">Transaction History</h3>
              <button
                onClick={handleRefetch}
                disabled={isRefetching}
                title="Refresh transactions"
                className="p-1 text-gray-400 hover:text-custom-blue hover:bg-blue-50 rounded-full transition-colors duration-200 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <button className="text-custom-blue hover:text-custom-blue/80">
              Export Transactions
            </button>
          </div>
          {/* Show count info */}
          {walletTransactions.length > 10 && (
            <p className="text-xs text-gray-500 mb-2">Showing recent 10 of {walletTransactions.length} transactions</p>
          )}
          <div className="space-y-4">
            {walletTransactions && walletTransactions.length > 0 ? (
              [...walletTransactions]
                .sort((a, b) => {
                  const dateA = a.createdAt
                    ? new Date(a.createdAt)
                    : a.createdDate
                      ? new Date(a.createdDate)
                      : new Date(0);
                  const dateB = b.createdAt
                    ? new Date(b.createdAt)
                    : b.createdDate
                      ? new Date(b.createdDate)
                      : new Date(0);
                  return dateB - dateA; // Sort in descending order (newest first)
                })
                .slice(0, 10)
                .filter((transaction) => {
                  // Hide debited transactions with 0 amount (e.g., failed or zero-value settlements)
                  if (transaction.type === "debited" && (transaction.totalAmount === 0 || transaction.amount === 0)) {
                    return false;
                  }
                  return true;
                })
                .map((transaction) => {
                  // Extract round title from description if available
                  const getRoundTitle = (desc) => {
                    if (!desc) return null;
                    // Common patterns: "... for interview round <title>", "... round <title>"
                    const roundMatch = desc.match(/round\s+([^,]+)/i);
                    if (roundMatch) return roundMatch[1].trim();
                    return null;
                  };

                  // Get interview reference code
                  const getInterviewRef = (txn) => {
                    if (txn.relatedInvoiceId) {
                      // If it's an ObjectId-like string, show shortened version
                      if (txn.relatedInvoiceId.length === 24) {
                        return `TXN-${txn.relatedInvoiceId.slice(-6).toUpperCase()}`;
                      }
                      return txn.relatedInvoiceId;
                    }
                    if (txn.metadata?.requestId) {
                      return `REQ-${txn.metadata.requestId.slice(-6).toUpperCase()}`;
                    }
                    return null;
                  };

                  const roundTitle = getRoundTitle(transaction.description);
                  const interviewRef = getInterviewRef(transaction);
                  const hasGst = transaction.gstAmount != null && transaction.gstAmount > 0;

                  return (
                    <div
                      key={transaction._id}
                      className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors mb-3 last:mb-0"
                    >
                      {/* Top Row: Type Badge, Reference, Date */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xs font-medium px-2.5 py-1 rounded-full ${transaction.type === "credited" || transaction.type === "credit"
                              ? "bg-green-100 text-green-700"
                              : transaction.type === "debited"
                                ? "bg-red-100 text-red-700"
                                : transaction.type === "hold" || transaction.type === "hold_adjust"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : transaction.type === "hold_release"
                                    ? "bg-blue-100 text-blue-700"
                                    : transaction.type === "refund"
                                      ? "bg-purple-100 text-purple-700"
                                      : "bg-gray-100 text-gray-700"
                              }`}
                          >
                            {transaction.type
                              ? transaction.type
                                .split('_')
                                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(' ')
                              : "Unknown"}
                          </span>
                          {interviewRef && (
                            <span className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded">
                              {interviewRef}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {transaction.createdAt
                            ? new Date(transaction.createdAt).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                            : transaction.createdDate
                              ? new Date(transaction.createdDate).toLocaleString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                              : "N/A"}
                        </span>
                      </div>

                      {/* Middle Row: Description & Round Title */}
                      <div className="mb-3">
                        <p className="text-sm font-medium text-gray-800 line-clamp-1">
                          {(() => {
                            let desc = transaction.description || "Transaction";
                            // Replace ObjectId patterns (24 hex chars) in description with actual company name from metadata
                            if (transaction.metadata?.companyName) {
                              desc = desc.replace(/[a-f0-9]{24}/gi, transaction.metadata.companyName);
                            }
                            return desc;
                          })()}
                        </p>
                        {roundTitle && (
                          <p className="text-xs text-gray-500 mt-1">
                            <span className="font-medium">Round:</span> {roundTitle}
                          </p>
                        )}
                      </div>
                      {/* Bottom Row: Amount Breakdown & Actions */}
                      <div className="flex items-end justify-between">
                        <div className="flex items-center gap-4">
                          {/* Base Amount - For payouts with service charge deduction, show as Gross */}
                          <div>
                            <p className="text-xs text-gray-500">
                              {transaction.serviceCharge != null && transaction.serviceCharge < 0 ? "Gross" : "Amount"}
                            </p>
                            <p className="text-sm font-semibold text-gray-800">
                              ₹{(transaction.amount || 0).toFixed(2)}
                            </p>
                          </div>
                          {/* GST if available */}
                          {hasGst && (
                            <div>
                              <p className="text-xs text-gray-500">GST</p>
                              <p className="text-sm font-medium text-gray-600">
                                ₹{transaction.gstAmount.toFixed(2)}
                              </p>
                            </div>
                          )}
                          {/* Service Charge if available (negative value means deduction) */}
                          {(transaction.serviceCharge != null && transaction.serviceCharge !== 0) && (
                            <div>
                              <p className="text-xs text-gray-500">
                                Service {transaction.metadata?.serviceChargePercent ? `(${transaction.metadata.serviceChargePercent}%)` : ''}
                              </p>
                              <p className="text-sm font-medium text-red-500">
                                -₹{Math.abs(transaction.serviceCharge).toFixed(2)}
                              </p>
                            </div>
                          )}
                          {/* Total Amount */}
                          <div className="border-l pl-4 ml-2">
                            <p className="text-xs text-gray-500">Total</p>
                            <p
                              className={`text-base font-bold ${getTransactionTypeStyle(transaction.type)}`}
                            >
                              {transaction.effect === "CREDITED" || transaction.type === "credited" || transaction.type === "credit" || transaction.type === "hold_release"
                                ? "+"
                                : transaction.effect === "DEBITED" || transaction.type === "debited" || transaction.type === "hold"
                                  ? "-"
                                  : ""}
                              ₹{transaction.totalAmount ? transaction.totalAmount.toFixed(2) : "0.00"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${transaction.status === "completed"
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                              }`}
                          >
                            {transaction.status
                              ? transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)
                              : "Pending"}
                          </span>
                          <ViewDetailsButton
                            onClick={() => setSelectedTransaction(transaction)}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
            ) : (
              <div className="text-center py-4 text-gray-500">
                No transaction history available
              </div>
            )}

            {/* View All Transactions Button */}
            {walletTransactions.length > 10 && (
              <div className="flex justify-center mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setIsAllTransactionsOpen(true)}
                  className="flex items-center gap-2 text-sm font-medium text-custom-blue hover:text-custom-blue/80 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-300"
                >
                  View All Transactions
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
        {/* v1.0.3 <-----------------------------------------------------------------------> */}
      </div>

      {/* Popups */}
      {viewingBalance && walletBalance && (
        <WalletBalancePopup
          walletBalance={walletBalance}
          onClose={() => setViewingBalance(false)}
        />
      )}

      {selectedTransaction && (
        <WalletTransactionPopup
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )}

      {isTopupOpen && (
        <WalletTopupPopup
          onClose={() => setIsTopupOpen(false)}
          onTopup={handleTopup}
        />
      )}

      {isBankAccountsOpen && (
        <BankAccountsPopup
          onClose={() => setIsBankAccountsOpen(false)}
          onSelectAccount={(account) => {
            setIsBankAccountsOpen(false);
            setIsWithdrawalOpen(true);
          }}
        />
      )}

      {isWithdrawalOpen && (
        <WithdrawalModal
          onClose={() => setIsWithdrawalOpen(false)}
          onSuccess={(data) => {
            // If just showing history (from history button click)
            if (data?.showHistory) {
              //setIsWithdrawalOpen(false);
              setIsWithdrawalHistoryOpen(true);
            } else {
              // Normal withdrawal success flow
              refetch();
              setIsWithdrawalHistoryOpen(true);
            }
          }}
        />
      )}

      {isWithdrawalHistoryOpen && (
        <WithdrawalHistory onClose={() => setIsWithdrawalHistoryOpen(false)} />
      )}

      {/* All Transactions Sidebar */}
      {isAllTransactionsOpen && (
        <SidebarPopup
          title="All Transactions"
          onClose={() => {
            setIsAllTransactionsOpen(false);
            setTxnSearchTerm("");
            setDebouncedSearch("");
            setTxnPage(0);
            setAllLoadedTxns([]);
          }}
        >
          {/* Search */}
          <div className="px-4 pt-4 pb-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={txnSearchTerm}
                onChange={(e) => setTxnSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-custom-blue/20 focus:border-custom-blue"
              />
            </div>
            {txnData?.totalCount > 0 && (
              <p className="text-xs text-gray-500 mt-2">
                {txnData.totalCount} transaction{txnData.totalCount !== 1 ? 's' : ''} found
              </p>
            )}
          </div>

          <div className="px-4 pb-20 space-y-3">
            {txnLoading && txnPage === 0 ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-custom-blue"></div>
              </div>
            ) : allLoadedTxns.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {debouncedSearch ? "No transactions match your search" : "No transactions found"}
              </div>
            ) : (
              <>
                {allLoadedTxns.map((transaction) => {
                  const interviewRef = transaction.relatedInvoiceId
                    ? transaction.relatedInvoiceId.length === 24
                      ? `TXN-${transaction.relatedInvoiceId.slice(-6).toUpperCase()}`
                      : transaction.relatedInvoiceId
                    : transaction.metadata?.requestId
                      ? `REQ-${transaction.metadata.requestId.slice(-6).toUpperCase()}`
                      : null;

                  return (
                    <div
                      key={transaction._id}
                      className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedTransaction(transaction)}
                    >
                      {/* Type Badge & Date */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${transaction.type === "credited" || transaction.type === "credit"
                              ? "bg-green-100 text-green-700"
                              : transaction.type === "debited"
                                ? "bg-red-100 text-red-700"
                                : transaction.type === "hold" || transaction.type === "hold_adjust"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : transaction.type === "hold_release"
                                    ? "bg-blue-100 text-blue-700"
                                    : transaction.type === "refund"
                                      ? "bg-purple-100 text-purple-700"
                                      : "bg-gray-100 text-gray-700"
                              }`}
                          >
                            {transaction.type
                              ? transaction.type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
                              : "Unknown"}
                          </span>
                          {interviewRef && (
                            <span className="text-xs text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                              {interviewRef}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {transaction.createdAt
                            ? new Date(transaction.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                            : transaction.createdDate
                              ? new Date(transaction.createdDate).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                              : "N/A"}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-sm font-medium text-gray-800 line-clamp-1 mb-2">
                        {(() => {
                          let desc = transaction.description || "Transaction";
                          if (transaction.metadata?.companyName) {
                            desc = desc.replace(/[a-f0-9]{24}/gi, transaction.metadata.companyName);
                          }
                          return desc;
                        })()}
                      </p>

                      {/* Amount & Status */}
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-bold ${getTransactionTypeStyle(transaction.type)}`}>
                          {transaction.effect === "CREDITED" || transaction.type === "credited" || transaction.type === "credit" || transaction.type === "hold_release"
                            ? "+"
                            : transaction.effect === "DEBITED" || transaction.type === "debited" || transaction.type === "hold"
                              ? "-"
                              : ""}
                          ₹{transaction.totalAmount ? transaction.totalAmount.toFixed(2) : (transaction.amount || 0).toFixed(2)}
                        </p>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${transaction.status === "completed"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                            }`}
                        >
                          {transaction.status
                            ? transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)
                            : "Pending"}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Load More Button */}
                {txnData?.hasMore && (
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={() => setTxnPage((prev) => prev + 1)}
                      disabled={txnFetching}
                      className="flex items-center gap-2 text-sm font-medium text-custom-blue hover:text-custom-blue/80 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-300 disabled:opacity-50"
                    >
                      {txnFetching ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-custom-blue"></div>
                          Loading...
                        </>
                      ) : (
                        "Load More"
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </SidebarPopup>
      )}

      <Outlet />
    </>
  );
};

export default Wallet;
