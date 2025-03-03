import React, { useState } from 'react'
import axios from 'axios';
import Cookies from 'js-cookie';

const PaymentmethodsComponent = () => {
    const [walletData, setWalletData] = useState([]);
    const [userData] = useState({ tenantId: 'tent_27' });
    const [loading, setLoading] = useState(true);
  const ownerId = Cookies.get("userId");
    useState(() => {
        const fetchData = async () => {
            try {
                const { tenantId } = userData;
                const wallet_response = await axios.get(`${process.env.REACT_APP_API_URL}/get-top-up/${ownerId}`);
                const Sub_Wallet_data = wallet_response.data.walletDetials[0] || [];
                setWalletData(Sub_Wallet_data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);


  
  return (
    <div className="fixed top-24 left-0 ml-64 right-0">
        <div className='mx-10'>
        <div className="text-xl font-semibold  text-[#217989] ">Payment Methods</div>
          <div className="mt-4 flex items-center justify-between ">
            <div className='border border-[#217989] text-[#217989] text-base font-semibold px-4 rounded-md py-2 '>
              wallet Balance $ {walletData.balance || "N/A"}
            </div>
            <div>
              <button className='bg-[#217989] px-4 text-lg rounded-md py-2 text-white'>
                Add Payment Method
              </button>
            </div>
          </div>

          <div>
            <h4 className='text-lg font-semibold'>Payment method list</h4>

            <div className="border flex items-center justify-between border-gray-500 rounded-sm px-4 ">
              {/* Payment Method and Card Details */}
              <div className="flex w-full h-full ">
                {/* Payment Method */}
                <div className="flex flex-wrap md:flex-nowrap items-stretch w-full border-gray-500 h-auto md:h-full">
                  {/* Payment Method */}
                  <div className="flex items-center gap-2 md:gap-4 py-2 md:py-0 border-r-2 border-gray-500 w-full md:w-1/3">
                    <img
                      className="h-6 md:h-10 w-auto max-w-[50px] md:max-w-[64px] border p-1 rounded-sm object-contain"
                      src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/2560px-Google_Pay_Logo.svg.png"
                      alt="Google Pay"
                    />
                    <span className="font-medium text-sm md:text-base text-gray-700">Google Pay</span>
                  </div>

                  {/* Card Details */}
                  <div className="flex items-center py-3 md:py-5 border-r-2 border-gray-500 px-2 md:px-4 w-full md:w-1/3">
                    <p className="font-medium text-sm md:text-base text-gray-700">**********4789</p>
                  </div>
                </div>
                {/* Button Section */}
                <div className="flex items-center justify-end w-1/3 ml-4">
                  <button className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-1 px-4 rounded-md">
                    Default
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
        </div>
  )
}

export default PaymentmethodsComponent