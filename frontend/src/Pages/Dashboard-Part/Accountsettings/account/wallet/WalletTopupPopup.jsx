//<----v1.0.0-----Venkatesh-----backend via TanStack Query added
import { useState, useEffect } from 'react'
import Modal from 'react-modal'
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom'
 
import Cookies from 'js-cookie'
import toast from 'react-hot-toast'
import { XMarkIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/outline'
import { decodeJwt } from "../../../../../utils/AuthCookieManager/jwtDecode.js";
import { useUserProfile } from '../../../../../apiHooks/useUsers.js';
import logo from '../../../../../Pages/Dashboard-Part/Images/upinterviewLogo.webp'
import { useVerifyWalletPayment, useCreateWalletOrder } from '../../../../../apiHooks/useWallet.js';

export function WalletTopupPopup({ onClose, onTopup }) {
  const navigate = useNavigate();
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [amount, setAmount] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState(null)
  
  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  
  
  const tenantId = tokenPayload?.tenantId;
  const ownerId = tokenPayload?.userId;
  //<----v1.0.0-----
  const verifyWalletPayment = useVerifyWalletPayment();
  const createWalletOrder = useCreateWalletOrder();
  //----v1.0.0----->

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  const { userProfile } = useUserProfile()//<----v1.0.0-----

  const [userDetails, setUserProfile] = useState([])
  
  // Fetch user profile data from contacts API
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (userProfile) {
          setUserProfile({
            name: `${userProfile.firstName} ${userProfile.lastName}`,
            email: userProfile.email,
            phone: userProfile.phone
          });
          console.log('User profile fetched:', userProfile);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Failed to fetch user profile data');
      }
    };

    fetchUserProfile();
  }, [ownerId,userProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsProcessing(true)
    setError(null)

    try {
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Please enter a valid amount')
      }

      if (!ownerId) {
        throw new Error('User not logged in')
      }

      //<----v1.0.0-----
      // Create order from backend via TanStack Query
      const orderData = await createWalletOrder.mutateAsync({
        amount: parseFloat(amount),
        currency: 'USD',
        ownerId: ownerId,
        tenantId: tenantId || 'default'
      })

      const { orderId, key_id } = orderData

      // Initialize Razorpay payment
      const options = {
        key: key_id,
        amount: parseFloat(amount) * 100, // Amount in paisa
        currency: 'USD',
        name: 'UpInterview',
        image: logo,
        description: 'Wallet Top-up',
        order_id: orderId,
        handler: async function (response) {
          try {
            console.log('Razorpay success callback received:', {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature?.substring(0, 10) + '...'
            });
            
            // Verify payment with backend via TanStack Query mutation
            const verification = await verifyWalletPayment.mutateAsync({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              ownerId: ownerId,
              tenantId: tenantId || 'default',
              amount: parseFloat(amount),
              description: 'Wallet Top-up via Razorpay'
            });

            console.log('Payment verification response:', verification);

            if (verification?.success) {
              // Update UI with new wallet data
              onTopup({
                amount: parseFloat(amount),
                paymentMethod: 'credit_card',
                type: 'credit',
                transactionId: response.razorpay_payment_id,
                timestamp: new Date(),
              });
              
              toast.success('Wallet top-up successful!');
              onClose();
            } else {
              //console.error('Backend did not confirm success:', verification);//----v1.0.0----->
              setError('Payment verification failed. Please try again.');
              setIsProcessing(false);
            }
          } catch (error) {
            console.error('Payment verification failed:', error);

            // More detailed error feedback
            if (error.response) {
              // The request was made and the server responded with a status code
              // that falls out of the range of 2xx
              console.error('Server error data:', error.response.data);
              setError(`Payment verification failed: ${error.response.data.error || 'Server error'}`);
            } else if (error.request) {
              // The request was made but no response was received
              setError('Payment verification failed: No response from server');
            } else {
              // Something happened in setting up the request that triggered an Error
              setError(`Payment verification failed: ${error.message}`);
            }
            setIsProcessing(false);
          }
        },
        prefill: {
          name: userDetails?.name || "",
          email: userDetails?.email || "",
          contact: userDetails?.phone || "",
        },
        theme: {
          color: '#3B82F6' // Blue color that matches UI
        },
        modal: {
          ondismiss: function() {
            setIsProcessing(false)
          }
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
      
    } catch (error) {
      console.error('Top-up failed:', error)
      setError(error.response?.data?.error || error.message || 'Top-up failed')
      setIsProcessing(false)
    }
  }

  const predefinedAmounts = [100, 500, 1000, 5000]

  const handleClose = () => {
    navigate('/account-settings/wallet');
  };

  const modalClass = classNames(
    'fixed bg-white shadow-2xl border-l border-gray-200',
    {
      'inset-0': isFullScreen,
      'inset-y-0 right-0 w-full lg:w-1/2 xl:w-1/2 2xl:w-1/2': !isFullScreen
    }
  );

  return (
    <Modal
      isOpen={true}
      onRequestClose={handleClose}
      className={modalClass}
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
    >
      <div className={classNames('flex flex-col h-full', { 'max-w-6xl mx-auto px-6': isFullScreen })}>
        <div className="px-4 pt-4 sm:p-6 flex justify-between items-center bg-white z-50">
          <h2 className="text-2xl font-semibold text-custom-blue">Wallet Top-up</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 text-gray-600 hover:text-gray-800"
            >
              {isFullScreen ? (
                <ArrowsPointingInIcon className="h-5 w-5" />
              ) : (
                <ArrowsPointingOutIcon className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-800"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="p-4 sm:p-6 flex-grow overflow-y-auto space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Amount
              </label>
              <div className="grid grid-cols-2 gap-4 mb-4">
                {predefinedAmounts.map((presetAmount) => (
                  <button
                    key={presetAmount}
                    type="button"
                    onClick={() => setAmount(presetAmount.toString())}
                    className={`p-4 text-center border rounded-lg hover:border-custom-blue ${
                      amount === presetAmount.toString() ? 'border-custom-blue bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    ${presetAmount.toLocaleString()}
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 rounded-md border border-gray-300 shadow-sm focus:border-custom-blue focus:ring-custom-blue"
                    placeholder="Enter amount"
                    min="1"
                    step="0.01"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <div className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-center">
                  <div className="h-4 w-4 text-custom-blue bg-custom-blue rounded-full"></div>
                  <span className="ml-3">Credit Card</span>
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Top up your wallet securely using your credit card
                </p>
              </div>
            </div>

            <div className="border-t pt-4">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                  {error}
                </div>
              )}
              <div className="mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-medium">${parseFloat(amount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Processing Fee</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <div className="flex justify-between text-base font-medium mt-2 pt-2 border-t">
                  <span>Total</span>
                  <span>${parseFloat(amount || 0).toLocaleString()}</span>
                </div>
              </div>
            
            </div>
            <div className="flex justify-end items-center">
              <button
                type="submit"
                disabled={!amount || isProcessing}
                className="w-32 px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/80 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Top Up Now'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
    </Modal>
  )
}