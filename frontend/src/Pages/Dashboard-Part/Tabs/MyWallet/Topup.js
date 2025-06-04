import React, { useEffect, useMemo, useState } from 'react'
import { handlePaymentInputChange, validateCardFields } from '../../../../utils/PaymentpageValidations';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { decryptData, } from '../../../../utils/PaymentCard';
import { handleAmountChange } from '../../../../utils/WalletDashboard';
import Cookies from 'js-cookie';
import { decodeJwt } from '../../../../utils/AuthCookieManager/jwtDecode';
import { config } from '../../../../config';

const Topup = () => {
    const authToken = Cookies.get("authToken");
    const tokenPayload = decodeJwt(authToken);
    const ownerId = tokenPayload?.userId;
    const tenantId = tokenPayload?.tenantId;

    const [paymentData, setPaymentData] = useState({
        balance: '',
        amountToAdd: '',
        cardNumber: '',
        cardHolderName: '',
        cardexpiry: '',
        cvv: ''
    });

    const [errors, setErrors] = useState({});
    const [isChecked, setIsChecked] = useState(false);
    const [cardsData, setCardsData] = useState([]);
    const [selectedCardIndex, setSelectedCardIndex] = useState(null);
    const { encryptedAmount } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const decodedAmount = encryptedAmount ? decodeURIComponent(encryptedAmount) : null;

    const userData = useMemo(() => location?.state.user || {}, [location?.state]);


    useEffect(() => {
        const processDecryption = async () => {
            try {

                if (encryptedAmount && encryptedAmount !== 'undefined') {

                    const decryptedAmount = await decryptData(decodeURIComponent(encryptedAmount));

                    console.log("decryptData", decryptedAmount);

                    if (!isNaN(decryptedAmount) && ownerId) {
                        setPaymentData((prev) => ({
                            ...prev,
                            balance: userData.balance || '0',
                            amountToAdd: `$ ${decryptedAmount}`
                        }));
                    } else {
                        if (!ownerId) {
                            console.error("Invalid decrypted amount or tenantId missing.");
                            // navigate('*');
                            navigate('/wallet-transcations');
                        }
                    }
                } else {
                    setPaymentData((prev) => ({
                        ...prev,
                        balance: userData.balance || '0',
                    }));
                }
            } catch (error) {
                console.error("Decryption error:", error);
                setPaymentData(prev => ({
                    ...prev,
                    balance: userData.balance || '0',
                }));
            }
        }
        processDecryption();

    }, [userData, encryptedAmount, navigate]);

    useEffect(() => {
        if (!ownerId) return;

        const fetchCardDetails = async () => {
            try {
                const response = await axios.post(`${config.REACT_APP_API_URL}/get-card-details`, { ownerId: ownerId });
                const { cards } = response.data.cardDetials[0];


                if (cards && cards.length > 0) {

                    const defaultCardIndex = cards.findIndex((card) => card.defaultCard === true);
                    const initialCard = defaultCardIndex !== -1 ? cards[defaultCardIndex] : cards[0];

                    // setCardsData(cards);
                    setSelectedCardIndex(defaultCardIndex !== -1 ? defaultCardIndex : 0);
                    setIsChecked(initialCard.defaultCard || false);

                    console.log("cards", initialCard.defaultCard);
                    setCardsData(cards);
                    setPaymentData((prevData) => ({
                        ...prevData,
                        cardNumber: initialCard.cardNumber.replace(/(\d{4})(?=\d)/g, "$1-") || '',
                        cardHolderName: initialCard.cardHolderName || '',
                        cardexpiry: initialCard.cardexpiry || '',
                        cvv: initialCard.cvv || '',

                    }));


                    setErrors({});
                }
            } catch (error) {
                console.error('Error fetching card details:', error);
            }
        };
        fetchCardDetails();

    }, [userData]);


    // Toggle default card selection
    const handleToggle = () => {
        setIsChecked((prev) => !prev);
    };


    const handleCardSelection = (index) => {
        setSelectedCardIndex(index);
        const selectedCard = cardsData[index];
        const { cardNumber, cardHolderName, cardexpiry, cvv, defaultCard } = selectedCard;

        setPaymentData((prevData) => ({
            ...prevData,
            cardNumber: cardNumber.replace(/(\d{4})(?=\d)/g, "$1-") || "",
            cardHolderName: cardHolderName || "",
            cardexpiry: cardexpiry || "",
            cvv: cvv || "",
        }));

        setIsChecked(defaultCard || false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const numericAmount = parseFloat(paymentData.amountToAdd.replace('$', '').trim());
        const decryptedAmount = parseFloat(decryptData(userData.encryptedAmount));

        if (!paymentData.amountToAdd || isNaN(numericAmount) || numericAmount <= 0) {
            setErrors(prev => ({ ...prev, amountToAdd: 'Please enter an amount greater than 0.' }));
            return;
        }

        if (numericAmount < decryptedAmount) {
            setErrors(prev => ({ ...prev, amountToAdd: `Amount should not be less than $ ${decryptedAmount}.` }));
            return;
        }

        const isValid = validateCardFields(setErrors, paymentData);
        console.log("Validation result:", isValid);

        if (!isValid) {
            console.log("Validation failed with errors:", errors);
            return;
        }


        const updatedCards = cardsData.map((card, index) => ({
            ...card,
            defaultCard: index === selectedCardIndex,
        }));
        setCardsData(updatedCards);

        try {

            // Step 1: Process the payment
            const updatedPaymentData = {
                ...paymentData,
                cardNumber: paymentData.cardNumber.replace(/-/g, ''),
                amountToAdd: numericAmount,
                isDefault: isChecked,
                ownerId,
                tenantId

            };

            const paymentResponse = await axios.post(`${config.REACT_APP_API_URL}/payment/submit`, {
                cardDetails: updatedPaymentData,
            });

            const { message, transactionId, status } = paymentResponse.data;

            if (status === 'paid') {
                alert('Payment successful.');

                const topupResponse = await axios.post(`${config.REACT_APP_API_URL}/top-up`, {
                    tenantId,
                    ownerId,
                    amount: parseFloat(updatedPaymentData.amountToAdd),
                    transactionId,
                    status,
                });

                if (topupResponse.status === 200) {
                    alert('Amount is added to wallet');
                    navigate('/wallet-transcations');
                    setPaymentData({
                        balance: '',
                        amountToAdd: '',
                        cardNumber: '',
                        cardHolderName: '',
                        cardexpiry: '',
                        cvv: '',
                    });
                    setErrors({});
                }
            } else if (status === 'failed') {
                alert('Transaction failed');
            }
        } catch (error) {
            console.error("Error occurred:", error);
        }
    };


    const isDisabled = errors.amountToAdd ||

        parseFloat(paymentData.amountToAdd.replace('$', '').trim()) < decodedAmount;


    return (
        <div className="bg-white p-1 flex flex-col gap-2  h-full  w-full">
            <h4 className="text-3xl  ps-4 pb-1 font-semibold">Top Up Your Wallet</h4>

            <div className='w-full me-10 items-center flex flex-col justify-center px-4'>

                <div
                    className="border-2   border-gray-400 rounded-md w-full sm:max-w-[98%] md:w-7/12 lg:w-8/12 xl:w-6/12"
                    style={{
                        maxHeight: "calc(100vh - 100px)", // Adjust based on header/footer
                        overflow: "hidden",
                    }}
                >
                    <div className=" pr-4 border-r-2 p-2 border-gray-300"
                        style={{
                            maxHeight: "calc(90vh - 100px)", // Adjust as needed
                            overflowY: "auto", // Enables scrolling inside
                        }}

                    >
                        <div className="flex  pt-2 flex-col w-full gap-3">
                            <div className="flex items-center ">
                                <label className="block w-2/6">Current Wallet Balance <span className="text-red-500">*</span></label>
                                <div className="flex ms-4 flex-col w-[70%]">
                                    <input
                                        type="text"
                                        name="balance"

                                        value={`$ ${paymentData.balance}` || ''}
                                        readOnly
                                        className="mt-1 block border-b-2 border-gray-500 focus:outline-none sm:text-lg font-semibold"
                                    />

                                </div>
                            </div>
                            <div className="flex items-center">
                                <label className="block w-2/6">Amount To Add <span className="text-red-500">*</span></label>
                                <div className="flex flex-col w-[70%] ms-4">
                                    <input
                                        type="text"
                                        name="amountToAdd"
                                        value={paymentData.amountToAdd}
                                        onChange={(e) => handleAmountChange(e.target.value, setPaymentData, setErrors, decodedAmount)}

                                        className="mt-1 block border-b-2 border-gray-500 focus:outline-none sm:text-sm"
                                        placeholder="Add Amount"
                                    />
                                    {errors.amountToAdd && <span className="text-red-500 text-sm pt-1">{errors.amountToAdd}</span>}
                                </div>
                            </div>
                        </div>

                        {/* Conditional rendering for cards */}
                        {cardsData.length > 0 && (
                            <div className="flex flex-col  mt-3">
                                <h5 className="text-lg font-medium pb-2">Select a Card:</h5>
                                <div className="flex flex-col ps-6 gap-2">
                                    {cardsData.map((card, index) => (
                                        <div key={index} className="flex  gap-2">
                                            <input
                                                type="radio"
                                                id={`card-${index}`}
                                                name="selectedCard"
                                                value={index}
                                                checked={selectedCardIndex === index}
                                                onChange={() => handleCardSelection(index)}
                                                className="hidden peer"
                                            />
                                            <label
                                                htmlFor={`card-${index}`}
                                                className="cursor-pointer flex items-center gap-2"
                                                name="selectedCard"
                                            >
                                                <span
                                                    className={`w-6 h-6 flex items-center justify-center rounded-full border-2  transition-all ${selectedCardIndex === index ? "bg-[#217989]  border-transparent" : "bg-gray-200 border-[#598d96]"
                                                        }`}
                                                >
                                                </span>
                                                {`${'X'.repeat(card.cardNumber.length - 4)} ${card.cardNumber.slice(-4)}`}
                                            </label>

                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {/* Payment Methods List */}
                        <div className='flex   pt-4'>
                            <div className='border-2 rounded-md p-4 border-gray-600 w-full'>
                                <h4 className="text-lg font-semibold">Checkout</h4>
                                <p className='text-sm text-gray-500 pt-1'>Please Enter your Credit Cart Details to Proceed with the Payment.</p>
                                <div className="gap-4 mt-2">
                                    <div className='mt-2'>
                                        <label className='text-lg text-gray-500'>Credit Number:<span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            name="cardNumber"
                                            placeholder='0000-0000-0000-0000'
                                            value={paymentData.cardNumber}
                                            onChange={(e) => handlePaymentInputChange(e.target, paymentData, setPaymentData, setErrors, errors)}

                                            className="block rounded-md p-2 h-10 w-full border border-gray-500 focus:outline-none"
                                            maxLength="19"
                                        />
                                        {errors.cardNumber && (
                                            <span className="text-red-500 text-sm pt-1">{errors.cardNumber}</span>
                                        )}
                                    </div>
                                    <div className='mt-2'>
                                        <label className='text-lg  text-gray-500'>Card Holder's Name:<span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            name="cardHolderName"
                                            placeholder="Enter Holder's Name"
                                            value={paymentData.cardHolderName}
                                            onChange={(e) => handlePaymentInputChange(e.target, paymentData, setPaymentData, setErrors, errors)}

                                            className="block p-2 w-full rounded-md h-10 border border-gray-500 focus:outline-none"
                                        />
                                        {errors.cardHolderName && (
                                            <span className="text-red-500 text-sm pt-1">{errors.cardHolderName}</span>
                                        )}
                                    </div>



                                    <div className='flex w-full pt-2  flex-col'>

                                        <div className="flex w-full items-center">
                                            <div className="flex flex-col w-1/2">
                                                <label className="md:text-lg sm:text-sm text-gray-500">
                                                    Expiration Date:<span className="text-red-500">*</span>
                                                </label>
                                                <div className="flex space-x-2 w-full">
                                                    <input
                                                        type="text"
                                                        name="cardexpiry"
                                                        value={paymentData.cardexpiry}
                                                        onChange={(e) => handlePaymentInputChange(e.target, paymentData, setPaymentData, setErrors, errors)}

                                                        placeholder="MM / YY"
                                                        className="border rounded-md w-full h-10 p-1 border-gray-500 focus:outline-none"
                                                    />
                                                </div>
                                                {errors.cardexpiry && (
                                                    <span className="text-red-500 text-sm pb-1">{errors.cardexpiry}</span>
                                                )}
                                            </div>

                                            <div className="flex flex-col w-1/2 ml-4">
                                                <label className="md:text-lg sm:text-sm ps-2 text-gray-500">
                                                    Verification Code (CVC)<span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="cvv"
                                                    placeholder="CVV"
                                                    value={paymentData.cvv}
                                                    onChange={(e) => handlePaymentInputChange(e.target, paymentData, setPaymentData, setErrors, errors)}

                                                    className="border rounded-md w-full h-10 p-1 border-gray-500 focus:outline-none"
                                                />
                                                {errors.cvv && (
                                                    <span className="text-red-500 text-sm pt-1 ps-3">{errors.cvv}</span>
                                                )}
                                            </div>
                                        </div>


                                        {cardsData.length === 0 ? "" :
                                            (
                                                <div className="flex items-center space-x-2 mt-4 ">

                                                    <button
                                                        onClick={cardsData.length > 1 ? handleToggle : undefined}
                                                        className={`w-12 h-6 flex items-center rounded-full cursor-pointer ${isChecked ? 'bg-green-500' : 'bg-gray-400'
                                                            } ${cardsData.length === 1 ? 'cursor-not-allowed opacity-50' : ''}`}
                                                    // className={`w-12 h-6 flex items-center rounded-full cursor-pointer ${isChecked ? 'bg-green-500' : 'bg-gray-400'}`}
                                                    >
                                                        <div
                                                            className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isChecked ? 'translate-x-6' : ''
                                                                }`}
                                                        ></div>
                                                    </button>
                                                    <label className="text-sm font-medium text-gray-700">SET AS DEFAULT</label>
                                                </div>
                                            )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Buttons */}
            <div
                className="flex w-full items-end justify-end gap-4 px-4 py-3 sm:px-10 sm:py-2 fixed bottom-0 right-0 "
            // className="flex  w-full  items-end justify-end pr-10  gap-4  "
            >
                <button
                    onClick={() => navigate('/wallet-transcations')}
                    className="px-6 py-2 border border-[#217989] bg-white text-black rounded-md hover:bg-gray-400"
                >
                    Cancel
                </button>
                <button

                    onClick={handleSubmit}
                    className="px-6 py-2 bg-[#217989] text-[#C7EBF2] rounded-md"
                    disabled={isDisabled}
                >
                    Top-up
                </button>
            </div>


        </div>
    )
}

export default Topup