// v1.0.0 - Ashok - Removed border left and set outline as none
// v1.0.1 - Ashok - Improved responsiveness and added common code to popup

import { Expand, Minimize, X } from "lucide-react";
import classNames from "classnames";
import { useState } from "react";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import { calculatePendingBalance } from "./Wallet";
// v1.0.1 <---------------------------------------------------------
import SidebarPopup from "../../../../../Components/Shared/SidebarPopup/SidebarPopup";
// v1.0.1 --------------------------------------------------------->
// Modal.setAppElement('#root');

const WalletBalancePopup = ({ walletBalance }) => {
  const navigate = useNavigate();
  const [isFullScreen, setIsFullScreen] = useState(false);

  // console.log('Wallet data in popup:', walletBalance);

  const pendingBalance = calculatePendingBalance(walletBalance);
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
      title="Wallet Details"
      onClose={() => navigate("/account-settings/wallet")}
    >
      <div className="sm:p-0 p-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Current Balance</h3>
            <div className="grid sm:grid-cols-1 grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Available</p>
                <p className="text-2xl font-bold">
                  ${walletBalance?.balance?.toFixed(2) || "0.00"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold">
                  ${pendingBalance > 0 ? pendingBalance : "0.00"}
                </p>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-4">Auto-Reload Settings</h3>
            <div className="space-y-2">
              <p>
                <span className="text-gray-500">Status:</span>{" "}
                <span
                  className={
                    walletBalance?.autoReloadSettings
                      ? walletBalance?.autoReloadSettings.enabled
                        ? "text-green-600"
                        : "text-red-600"
                      : "text-black"
                  }
                >
                  {walletBalance?.autoReloadSettings
                    ? walletBalance?.autoReloadSettings.enabled
                      ? "Enabled"
                      : "Disabled"
                    : "N/A"}
                </span>
              </p>
              <p>
                <span className="text-gray-500">Threshold:</span> $
                {walletBalance?.autoReloadSettings
                  ? walletBalance?.autoReloadSettings.threshold.toFixed(2)
                  : "N/A"}
              </p>
              <p>
                <span className="text-gray-500">Reload Amount:</span> $
                {walletBalance?.autoReloadSettings
                  ? walletBalance?.autoReloadSettings.reloadAmount.toFixed(2)
                  : "N/A"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </SidebarPopup>
    // v1.0.3 ------------------------------------------------------------->
  );
};

export default WalletBalancePopup;
