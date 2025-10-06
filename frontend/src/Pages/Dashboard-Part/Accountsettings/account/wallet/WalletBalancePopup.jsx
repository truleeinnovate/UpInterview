// v1.0.0 - Ashok - Removed border left and set outline as none
// v1.0.1 - Ashok - Improved responsiveness and added common code to popup

import { Wallet, TrendingUp, CreditCard, Shield, DollarSign, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { calculatePendingBalance } from "./Wallet";
// v1.0.1 <---------------------------------------------------------
import SidebarPopup from "../../../../../Components/Shared/SidebarPopup/SidebarPopup";
// v1.0.1 --------------------------------------------------------->
// Modal.setAppElement('#root');

const WalletBalancePopup = ({ walletBalance, onClose }) => {
  const navigate = useNavigate();

  const pendingBalance = calculatePendingBalance(walletBalance);
  const totalBalance = (walletBalance?.balance || 0) + (walletBalance?.holdAmount || 0);
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

  return (
    // v1.0.3 <-------------------------------------------------------------
    <SidebarPopup
      title="Wallet Balance"
      onClose={onClose || (() => navigate("/account-settings/wallet"))}
    >
      <div className="p-6">
        <div className="space-y-6">
          {/* Main Balance Card */}
          <div className="bg-custom-blue/10 rounded-xl p-6 border border-blue-100">
            <div className="flex items-center mb-4">
              <Wallet className="w-6 h-6 text-custom-blue mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Balance Overview</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Available Balance */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Available</span>
                  ₹
                </div>
                <p className="text-2xl font-bold text-green-600">
                  ₹{(walletBalance?.balance || 0).toFixed(2)}
                </p>
              </div>
              
              {/* On Hold */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">On Hold</span>
                  <Shield className="w-4 h-4 text-yellow-500" />
                </div>
                <p className="text-2xl font-bold text-yellow-600">
                  ₹{(walletBalance?.holdAmount || 0).toFixed(2)}
                </p>
              </div>
              
              {/* Total Balance */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Total</span>
                  <TrendingUp className="w-4 h-4 text-custom-blue" />
                </div>
                <p className="text-2xl font-bold text-custom-blue">
                  ₹{totalBalance.toFixed(2)}
                </p>
              </div>
            </div>
          </div>


          {/* Pending Balance Info (if any) */}
          {pendingBalance > 0 && (
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Pending Balance: ₹{pendingBalance.toFixed(2)}
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    This amount is being processed and will be added to your available balance soon.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </SidebarPopup>
    // v1.0.3 ------------------------------------------------------------->
  );
};

export default WalletBalancePopup;
