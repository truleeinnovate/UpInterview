import { useState, useEffect, useRef } from 'react'
import { ViewDetailsButton, EditButton } from '../../common/Buttons'

import axios from 'axios'
import Cookies from "js-cookie";
import { Outlet } from 'react-router-dom'
// Removed useCustomContext import as we're fetching data directly
import WalletBalancePopup from './WalletBalancePopup';
import WalletTransactionPopup from './WalletTransactionPopup';
import { WalletTopupPopup } from './WalletTopupPopup'
import { BankAccountsPopup } from './BankAccountsPopup'
import { decodeJwt } from "../../../../../utils/AuthCookieManager/jwtDecode.js";
import './topupAnimation.css';

export const getTransactionTypeStyle = (type) => {
  switch (type) {
    case 'credit':
      return 'text-green-600'
    case 'debit':
      return 'text-red-600'
    case 'hold':
      return 'text-yellow-600'
    default:
      return 'text-gray-600'
  }
}

export const calculatePendingBalance = (walletBalance) => {
  if (!walletBalance?.transactions) return 0;
  
  return walletBalance.transactions.reduce((total, transaction) => {
    if (transaction.type.toLowerCase() === 'hold') {
      return total + transaction.amount;
    }
    return total;
  }, 0);
};



const Wallet = () => {
  // Remove unused navigate - fixing lint error
  // const navigate = useNavigate();

  const authToken = Cookies.get("authToken");
    const tokenPayload = decodeJwt(authToken);
    
    
    const userId = tokenPayload?.userId;

  const [walletBalance, setWalletBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [viewingBalance, setViewingBalance] = useState(false);
  const [isTopupOpen, setIsTopupOpen] = useState(false);
  const [isBankAccountsOpen, setIsBankAccountsOpen] = useState(false);
  const [animateTopUp, setAnimateTopUp] = useState(true);
  const topUpButtonRef = useRef(null);
  
  // Function to fetch wallet data directly
  const fetchWalletData = async () => {
    try {
      setIsLoading(true)
      if (!userId) {
        console.error('User ID not found');
        setIsLoading(false);
        return
      }

      console.log('Fetching wallet data for user:', userId);
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/wallet/${userId}`);
      
      if (response.data && response.data.walletDetials && response.data.walletDetials.length > 0) {
        console.log('Wallet data received:', response.data.walletDetials[0]);
        // Set wallet balance to the first wallet object in the array
        setWalletBalance(response.data.walletDetials[0]);
      } else {
        console.warn('No wallet data found or empty wallet data');
        setWalletBalance(null);
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
      setWalletBalance(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Get wallet transactions from the fetched data
  const walletTransactions = walletBalance?.transactions || [];

  // Fetch wallet data on component mount
  useEffect(() => {
    fetchWalletData();
  }, []);
  
  console.log("walletBalance ", walletBalance);
  
  // Start animation on page load and stop after 20 seconds
  useEffect(() => {
    setAnimateTopUp(true);
    const animationTimer = setTimeout(() => {
      setAnimateTopUp(false);
    }, 20000);
    
    return () => clearTimeout(animationTimer);
  }, []);
 
  const pendingBalance = calculatePendingBalance(walletBalance);

  const handleTopup = async (topupData) => {
    console.log('Processing top-up:', topupData);
    
    try {
      if (!userId) {
        console.error('User ID not found');
        return;
      }

      // Show success message
      // alert(`Successfully added $${topupData.amount.toFixed(2)} to your wallet!`);
      
      console.log('Refreshing wallet data after topup');
      await fetchWalletData();
    } catch (error) {
      console.error('Error refreshing wallet data after topup:', error);
    }
  };

  const handleSaveBankAccounts = (accounts) => {
    // In a real application, this would make an API call
    console.log('Saving bank accounts:', accounts)
  }


  // Show loading state if data is still loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wallet data...</p>
        </div>
      </div>
    );
  }
  

  

  return (
    <>
    <div className="space-y-6 px-4 py-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Wallet</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setIsBankAccountsOpen(true)}
            className="px-4 py-2 border border-custom-blue text-custom-blue text-sm hover:bg-custom-blue/90 hover:text-white rounded-lg"
          >
            Withdraw
          </button>
          <button
            ref={topUpButtonRef}
            onClick={() => setIsTopupOpen(true)}
            className={`px-4 py-2 bg-custom-blue text-white rounded-lg text-sm hover:bg-custom-blue/90 ${animateTopUp ? 'top-up-button-animation pulse-glow' : ''}`}
          >
            Top Up
          </button>
          <EditButton 
            onClick={() => alert('Edit wallet settings')} 
            className="bg-gray-100 rounded-lg"
          />
        </div>
      </div>

      {/* Balance */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between">
          <div>
            <h3 className="text-lg font-medium">Available Balance</h3>
            <div className="mt-3 flex items-center">
              <span className="text-3xl font-bold mr-2">
                ${walletBalance?.balance ? walletBalance.balance.toFixed(2) : '0.00'}
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
            <div className="mt-2 flex space-x-4 text-sm">
              <div>
                <span className="text-gray-500">Pending Balance: </span>
                <span className="text-sm font-medium">
                 ${pendingBalance.toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Hold Amount: </span>
                <span className="text-sm font-medium text-yellow-600">
                  ${pendingBalance.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              Last updated: {walletBalance?.updatedAt ? new Date(walletBalance.updatedAt).toLocaleString() : 'N/A'}
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
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Transaction History</h3>
          <button className="text-custom-blue hover:text-custom-blue/80">
            Export Transactions
          </button>
        </div>
        <div className="space-y-4">
          {walletTransactions && walletTransactions.length > 0 ? (
            [...walletTransactions]
              .sort((a, b) => {
                const dateA = a.createdAt ? new Date(a.createdAt) : a.createdDate ? new Date(a.createdDate) : new Date(0);
                const dateB = b.createdAt ? new Date(b.createdAt) : b.createdDate ? new Date(b.createdDate) : new Date(0);
                return dateB - dateA; // Sort in descending order (newest first)
              })
              .map(transaction => (
              <div key={transaction._id} className="flex items-center justify-between border-b pb-4 last:border-b-0">
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm text-gray-500">
                      {transaction.createdAt ? new Date(transaction.createdAt).toLocaleString() : transaction.createdDate ? new Date(transaction.createdDate).toLocaleString() : 'N/A'}
                    </p>
                    <span className={`text-sm px-2 py-0.5 rounded-full ${
                      transaction.type === 'credit' ? 'bg-green-100 text-green-800' :
                      transaction.type === 'debit' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transaction.type ? transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1) : 'Unknown'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className={`font-medium ${getTransactionTypeStyle(transaction.type)}`}>
                      {transaction.type === 'credit' ? '+' : transaction.type === 'debit' ? '-' : '~'}
                      ${transaction.amount ? transaction.amount.toFixed(2) : '0.00'}
                    </p>
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {transaction.status ? transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1) : 'Pending'}
                    </span>
                  </div>
                  <ViewDetailsButton onClick={() => setSelectedTransaction(transaction)} />
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
          onSave={handleSaveBankAccounts}
        />
      )}
    <Outlet />
    </>
  )
}

export default Wallet