// import { useState } from 'react'
import { ViewDetailsButton, EditButton } from '../../common/Buttons'
// import { WalletBalancePopup } from './WalletBalancePopup'
// import { WalletTransactionPopup } from './WalletTransactionPopup'

// import axios from 'axios'
// import Cookies from "js-cookie";
import { Outlet, useNavigate } from 'react-router-dom'
import { useCustomContext } from '../../../../../Context/Contextfetch';

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
  const {walletBalance} = useCustomContext();
  const navigate = useNavigate();

  console.log("walletBalance ", walletBalance);
  
  
  // const [isLoading, setIsLoading] = useState(true);

  // const userId = Cookies.get("userId");
  // console.log("user", userId);
  // // /get-top-up/:ownerId

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       setIsLoading(true);
  //       const wallet_res = await axios.get(`${config.REACT_APP_API_URL}/get-top-up/${userId}`);
  //       // Find user based on userId

  //       const walletDetailsArray = wallet_res.data.walletDetials;

  //       console.log("walletDetailsArray", walletDetailsArray);


  //       const walletDetails = Array.isArray(walletDetailsArray) && walletDetailsArray.length > 0
  //         ? walletDetailsArray[0]
  //         : {};

  //       // const walletDetails = wallet_res.data;  

  //       // const user = allUsers_data.find(user => user._id === "67d77741a9e3fc000cbf61fd");

  //       console.log("walletDetails", walletDetails);


  //       if (userId) {
  //         setWalletBalance(walletDetails);

  //       }

  //     } catch (error) {
  //       console.error('Error fetching data:', error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   if (userId) {
  //     fetchData();
  //   }
  // }, [userId]);




  // if (!walletBalance) {
  //   return <div className='flex justify-center items-center w-full h-full'>Loading wallet data...</div>;
  // }

 
  const pendingBalance = calculatePendingBalance(walletBalance);


  return (
    <>
    <div >
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Wallet</h2>
        {/* <EditButton
          onClick={() => alert('Edit wallet settings')}
          className="bg-gray-100 rounded-lg"
        /> */}
      </div>

      {/* Balance Card */}
      <div className="bg-white p-6 rounded-lg shadow mb-6 mt-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium">Available Balance</h3>
            <p className="text-3xl font-bold mt-2">
              ${walletBalance?.balance?.toFixed(2) ?? "0.00"}
              <span className="text-sm text-gray-500 ml-2">{walletBalance?.currency || 'USD'}</span>
            </p>
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-sm text-gray-500">Pending Balance:</span>
              <span className="text-sm font-medium text-yellow-600">
                ${pendingBalance > 0 ? pendingBalance : '0.00'}
              </span>
              <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">
                Hold
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">
              Last updated: {new Date(walletBalance?.updatedAt).toLocaleString('en-US', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}
            </p>
            <ViewDetailsButton
              onClick={() => navigate(`wallet-details/${walletBalance._id}`)}
              className="mt-2"
            />
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Transaction History</h3>
          <button className="text-blue-600 hover:text-blue-800">
            Export Transactions
          </button>
        </div>
        <div className="space-y-4">
          {walletBalance?.transactions  ?
          
          walletBalance?.transactions.map(transaction => (
            <div key={transaction._id} className="flex items-center justify-between border-b pb-4 last:border-b-0">
              <div>
                <p className="font-medium">{transaction.description || "N/A"}</p>
                <div className="flex items-center space-x-2">
                  <p className="text-sm text-gray-500">
                    {new Date(transaction.createdAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'numeric',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </p>
                  <span className={`text-sm px-2 py-0.5 rounded-full ${transaction.type.toLowerCase() === 'credit' ? 'bg-green-100 text-green-800' :
                    transaction.type.toLowerCase() === 'debit' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                    {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className={`font-medium ${getTransactionTypeStyle(transaction.type.toLowerCase())}`}>
                    {transaction.type.toLowerCase() === 'credit' ? '+' : transaction.type.toLowerCase() === 'debit' ? '-' : '~'}
                    ${transaction?.amount.toFixed(2)}
                  </p>
                  <span className={`text-sm px-2 py-1 rounded-full ${transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                  </span>
                </div>
                <ViewDetailsButton onClick={() => 
                  navigate(`/account-settings/wallet/wallet-transaction/${transaction._id}`)
                  // setSelectedTransaction(transaction)
                  } 
                  />
              </div>
            </div>
          ))
          : <p className='flex justify-center items-center w-full h-full'>transactions Not found</p>
          }
        </div>
      </div>

      {/* Popups */}
      {/* {viewingBalance && (
        <WalletBalancePopup
          walletBalance={walletBalance}
          onClose={() => setViewingBalance(false)}
        />
      )} */}
      {/* 
      {selectedTransaction && (
        <WalletTransactionPopup
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
        />
      )} */}
    </div>
<Outlet />
    </>
  )
}

export default Wallet