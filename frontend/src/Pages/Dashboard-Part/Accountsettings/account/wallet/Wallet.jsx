//<----v1.0.0-----Venkatesh-----backend via TanStack Query added
// v1.0.1 - Ashok - Improved responsiveness

import { useState, useEffect, useRef } from "react";
import { ViewDetailsButton, EditButton } from "../../common/Buttons";

import { Outlet } from "react-router-dom";
import WalletBalancePopup from "./WalletBalancePopup";
import WalletTransactionPopup from "./WalletTransactionPopup";
import { WalletTopupPopup } from "./WalletTopupPopup";
import { BankAccountsPopup } from "./BankAccountsPopup";
import { WithdrawalModal } from "./WithdrawalModal";
import { WithdrawalHistory } from "./WithdrawalHistory";
import "./topupAnimation.css";
import { usePermissionCheck } from "../../../../../utils/permissionUtils";
import { useWallet } from "../../../../../apiHooks/useWallet"; //<----v1.0.0-----

export const getTransactionTypeStyle = (type) => {
  switch (type) {
    case "credit":
      return "text-green-600";
    case "debit":
      return "text-red-600";
    case "hold":
      return "text-yellow-600";
    default:
      return "text-gray-600";
  }
};

export const calculatePendingBalance = (walletBalance) => {
  if (!walletBalance?.transactions) return 0;

  return walletBalance.transactions.reduce((total, transaction) => {
    if (transaction.type.toLowerCase() === "hold") {
      return total + transaction.amount;
    }
    return total;
  }, 0);
};

const Wallet = () => {
  const { checkPermission, isInitialized } = usePermissionCheck();
  const { data: walletBalance, isLoading, refetch } = useWallet(); //<----v1.0.0-----
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [viewingBalance, setViewingBalance] = useState(false);
  const [isTopupOpen, setIsTopupOpen] = useState(false);
  const [isBankAccountsOpen, setIsBankAccountsOpen] = useState(false);
  const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);
  const [isWithdrawalHistoryOpen, setIsWithdrawalHistoryOpen] = useState(false);
  const [animateTopUp, setAnimateTopUp] = useState(true);
  const topUpButtonRef = useRef(null);

  useEffect(() => {
    setAnimateTopUp(true);
    const animationTimer = setTimeout(() => {
      setAnimateTopUp(false);
    }, 20000);

    return () => clearTimeout(animationTimer);
  }, []);

  // Permission check after all hooks
  if (!isInitialized || !checkPermission("Wallet")) {
    return null;
  }

  const pendingBalance = calculatePendingBalance(walletBalance); //<----v1.0.0-----
  const walletTransactions = walletBalance?.transactions || [];

  const handleTopup = async (topupData) => {
    console.log("Processing top-up:", topupData);

    try {
      console.log("Refreshing wallet data after topup");
      await refetch();
    } catch (error) {
      console.error("Error refreshing wallet data after topup:", error);
    }
  };

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
      <div className="space-y-6 px-4 py-6">
        {/* Header skeleton */}
        <div className="flex sm:flex-col sm:justify-start justify-between sm:items-start items-center">
          <div className="sm:text-xl md:tex-xl text-2xl font-bold sm:mb-4 h-8 w-32 bg-gray-200 skeleton-animation rounded"></div>
          <div className="flex space-x-3">
            <div className="sm:px-2 px-4 sm:py-1 py-2 h-10 w-20 bg-gray-200 skeleton-animation rounded-lg"></div>
            <div className="sm:px-2 px-4 sm:py-1 py-2 h-10 w-20 bg-gray-200 skeleton-animation rounded-lg"></div>
            <div className="sm:px-2 sm:py-1 h-10 w-10 bg-gray-200 skeleton-animation rounded-lg"></div>
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
            <div className="sm:text-start text-right">
              <div className="h-4 w-32 bg-gray-200 skeleton-animation rounded mb-2"></div>
              <div className="h-8 w-24 bg-gray-200 skeleton-animation rounded"></div>
            </div>
          </div>
        </div>

        {/* Transactions skeleton */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex sm:flex-col sm:justify-start justify-between sm:items-start items-center mb-4">
            <div className="h-6 w-40 bg-gray-200 skeleton-animation rounded mb-2"></div>
            <div className="h-6 w-32 bg-gray-200 skeleton-animation rounded"></div>
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
      <div className="space-y-6 px-4 py-6">
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
              className={`sm:px-2 px-4 sm:py-1 py-2 bg-custom-blue text-white rounded-lg text-sm hover:bg-custom-blue/90 ${
                animateTopUp ? "top-up-button-animation pulse-glow" : ""
              }`}
            >
              Top Up
            </button>
            <EditButton
              onClick={() => alert("Edit wallet settings")}
              className="sm:px-2 sm:py-1 bg-gray-100 rounded-lg"
            />
          </div>
        </div>

        {/* Balance */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex sm:flex-col justify-between">
            <div>
              <h3 className="text-lg font-medium">Available Balance</h3>
              <div className="mt-3 flex items-center">
                <span className="sm:text-xl text-3xl font-bold mr-2">
                  $
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
                <div>
                  <span className="text-gray-500">Pending Balance: </span>
                  <span className="text-sm font-medium">
                    ${pendingBalance.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Hold Amount: </span>
                  <span className="text-sm font-medium text-yellow-600">
                    $
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
            <h3 className="text-lg font-medium">Transaction History</h3>
            <button className="text-custom-blue hover:text-custom-blue/80">
              Export Transactions
            </button>
          </div>
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
                .map((transaction) => (
                  <div
                    key={transaction._id}
                    className="flex items-center justify-between border-b pb-4 last:border-b-0"
                  >
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm text-gray-500">
                          {transaction.createdAt
                            ? new Date(transaction.createdAt).toLocaleString()
                            : transaction.createdDate
                            ? new Date(transaction.createdDate).toLocaleString()
                            : "N/A"}
                        </p>
                        <span
                          className={`text-sm px-2 py-0.5 rounded-full ${
                            transaction.type === "credit"
                              ? "bg-green-100 text-green-800"
                              : transaction.type === "debit"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {transaction.type
                            ? transaction.type.charAt(0).toUpperCase() +
                              transaction.type.slice(1)
                            : "Unknown"}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p
                          className={`font-medium ${getTransactionTypeStyle(
                            transaction.type
                          )}`}
                        >
                          {transaction.type === "credit"
                            ? "+"
                            : transaction.type === "debit"
                            ? "-"
                            : "~"}
                          $
                          {transaction.amount
                            ? transaction.amount.toFixed(2)
                            : "0.00"}
                        </p>
                        <span
                          className={`text-sm px-2 py-1 rounded-full ${
                            transaction.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {transaction.status
                            ? transaction.status.charAt(0).toUpperCase() +
                              transaction.status.slice(1)
                            : "Pending"}
                        </span>
                      </div>
                      <ViewDetailsButton
                        onClick={() => setSelectedTransaction(transaction)}
                      />
                    </div>
                  </div>
                ))
            ) : (
              <div className="text-center py-4 text-gray-500">
                No transaction history available
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
          onSuccess={() => {
            refetch();
            setIsWithdrawalHistoryOpen(true);
          }}
        />
      )}

      {isWithdrawalHistoryOpen && (
        <WithdrawalHistory
          onClose={() => setIsWithdrawalHistoryOpen(false)}
        />
      )}
      <Outlet />
    </>
  );
};

export default Wallet;
