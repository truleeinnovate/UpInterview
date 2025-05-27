import { Maximize, Minimize, X } from 'lucide-react';
import classNames from 'classnames';
import { useState } from 'react';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import { useCustomContext } from '../../../../../Context/Contextfetch';
import { calculatePendingBalance } from './Wallet';
Modal.setAppElement('#root');

const  WalletBalancePopup = ({ onClose }) =>  {
  const { walletBalance } = useCustomContext();
  const navigate = useNavigate();
  const [isFullScreen, setIsFullScreen] = useState(false);


  const pendingBalance = calculatePendingBalance(walletBalance);
  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       setIsLoading(true);
  //       const wallet_res = await axios.get(`${process.env.REACT_APP_API_URL}/get-top-up/${userId}`);
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

  const modalClass = classNames(
    'fixed bg-white shadow-2xl border-l border-gray-200 overflow-y-auto',
    {
      'inset-0': isFullScreen,
      'inset-y-0 right-0 w-full  lg:w-1/2 xl:w-1/2 2xl:w-1/2': !isFullScreen
    }
  );
  return (
    <Modal
      isOpen={true}
      onRequestClose={() => navigate('/account-settings/wallet')}
      className={modalClass}
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
    // className={modalClass}

    >
      <div className={classNames('h-full', { 'max-w-6xl mx-auto px-6': isFullScreen })}>
        <div className="p-6 ">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-custom-blue">Wallet Details</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isFullScreen ? (
                  <Minimize className="w-5 h-5 text-gray-500" />
                ) : (
                  <Maximize className="w-5 h-5 text-gray-500" />
                )}
              </button>
              <button
                onClick={() => {
                  navigate('/account-settings/wallet')
                  // navigate('/account-settings/my-profile/basic')
                  // setUserData(formData)
                  // setIsBasicModalOpen(false);
                }}


                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Current Balance</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Available</p>
                  <p className="text-2xl font-bold">${walletBalance?.balance?.toFixed(2) || "0.00"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pending</p>
                  <p className="text-2xl font-bold">${pendingBalance > 0 ? pendingBalance : "0.00"}</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Auto-Reload Settings</h3>
              <div className="space-y-2">
                <p>
                  <span className="text-gray-500">Status:</span>{' '}
                  <span className={walletBalance?.autoReloadSettings ? walletBalance?.autoReloadSettings.enabled ? 'text-green-600' : 'text-red-600' : 'text-black'}>
                    {walletBalance?.autoReloadSettings ? walletBalance?.autoReloadSettings.enabled ? 'Enabled' : 'Disabled' : "N/A"}
                  </span>
                </p>
                <p>
                  <span className="text-gray-500">Threshold:</span>{' '}
                  ${walletBalance?.autoReloadSettings ? walletBalance?.autoReloadSettings.threshold.toFixed(2) : "N/A"}
                </p>
                <p>
                  <span className="text-gray-500">Reload Amount:</span>{' '}
                  ${walletBalance?.autoReloadSettings ? walletBalance?.autoReloadSettings.reloadAmount.toFixed(2) : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}


export default WalletBalancePopup