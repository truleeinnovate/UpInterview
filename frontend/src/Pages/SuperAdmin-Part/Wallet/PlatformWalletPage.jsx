import React from "react";
import { Wallet as WalletIcon } from "lucide-react";
import { usePlatformWallet } from "../../../apiHooks/superAdmin/usePlatformWallet";

const PlatformWalletPage = () => {
  const { data: wallet, isLoading, isError, error } = usePlatformWallet();

  if (isLoading) {
    return (
      <div className="px-4 py-6">
        <div className="h-8 w-40 bg-gray-200 skeleton-animation rounded mb-4" />
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <div className="h-6 w-32 bg-gray-200 skeleton-animation rounded" />
          <div className="h-6 w-48 bg-gray-200 skeleton-animation rounded" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-4 py-6">
        <p className="text-red-600">
          Failed to load platform wallet: {error?.message || "Unknown error"}
        </p>
      </div>
    );
  }

  const balance = wallet?.balance ?? 0;
  const holdAmount = wallet?.holdAmount ?? 0;
  const transactions = Array.isArray(wallet?.transactions)
    ? wallet.transactions
    : [];

  const sortedTransactions = [...transactions].sort((a, b) => {
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
    return dateB - dateA;
  });

  return (
    <div className="px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-custom-blue flex items-center">
          <WalletIcon className="h-6 w-6 mr-2" />
          Platform Wallet
        </h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-medium">Available Balance</h3>
            <p className="mt-3 text-3xl font-bold">
              ₹{Number(balance).toFixed(2)}
            </p>
            <div className="mt-2 text-sm text-gray-600 space-y-1">
              <p>
                <span className="font-medium">Hold Amount: </span>
                <span className="text-yellow-600">
                  ₹{Number(holdAmount).toFixed(2)}
                </span>
              </p>
              <p className="text-xs text-gray-500">
                This wallet represents the platform's own balance from
                commissions and GST.
              </p>
            </div>
          </div>
          <div className="sm:text-right text-left">
            <p className="text-sm text-gray-500">Wallet Code</p>
            <p className="mt-1 font-mono text-sm">
              {wallet?.walletCode || "N/A"}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Owner Type: {wallet?.ownerType || "PLATFORM"}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Transaction History</h3>
        </div>
        {sortedTransactions.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No transactions found for platform wallet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Description</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Bucket</th>
                  <th className="py-2 pr-4 text-right">Amount (₹)</th>
                  <th className="py-2 pr-4 text-right">Service Fee (₹)</th>
                  <th className="py-2 pr-4 text-right">GST (₹)</th>
                  <th className="py-2 pr-4">Reason</th>
                </tr>
              </thead>
              <tbody>
                {sortedTransactions.map((tx) => (
                  <tr key={tx._id} className="border-b last:border-b-0">
                    <td className="py-2 pr-4 whitespace-nowrap text-gray-600">
                      {tx.createdAt || tx.createdDate
                        ? new Date(tx.createdAt || tx.createdDate).toLocaleString()
                        : "N/A"}
                    </td>
                    <td className="py-2 pr-4 max-w-xs truncate">
                      {tx.description || "-"}
                    </td>
                    <td className="py-2 pr-4 capitalize">
                      {tx.type || "-"}
                    </td>
                    <td className="py-2 pr-4">
                      {tx.bucket || "-"}
                    </td>
                    <td className="py-2 pr-4 text-right font-medium">
                      {tx.amount != null ? Number(tx.amount).toFixed(2) : "0.00"}
                    </td>
                    <td className="py-2 pr-4 text-right text-gray-700">
                      {tx.serviceCharge != null
                        ? Number(tx.serviceCharge).toFixed(2)
                        : "0.00"}
                    </td>
                    <td className="py-2 pr-4 text-right text-gray-700">
                      {tx.gstAmount != null
                        ? Number(tx.gstAmount).toFixed(2)
                        : "0.00"}
                    </td>
                    <td className="py-2 pr-4 whitespace-nowrap text-gray-700">
                      {tx.reason || tx.metadata?.businessType || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlatformWalletPage;
