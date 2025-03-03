import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import LOCAL_HOST from '../../../utils/apicalls';
import { MdKeyboardArrowRight } from 'react-icons/md';
import {  handlePaymentInputChange, paymentMethods, validatePaymentForm } from '../../../utils/PaymentpageValidations';

import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement , useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe("pk_test_51QeA2Z4IKSSQsqfWIOoS32OZCE1okPuQZ6iqLvBv0RGZGofqg3FHP3xhF1THjADGd2aLbeI22ScUiqvfFmTXy6pI00l3IJCgb9"); 



const Addpayment = () => {
    const [paymentData, setPaymentData] = useState({
        balance: '',
        amountToAdd: '',
        paymentMethod: '',
        cardNumber: '',
        cardHolderName: '',
        expirationDate: { month: '', year: '' },
        cvc: ''
    });

    const [selectedMethod, setSelectedMethod] = useState('');
    const [errors, setErrors] = useState({
        balance: '',
        amountToAdd: '',
        paymentMethod: '',
    });

    const navigate = useNavigate();


    // Stripe integration variables
    const stripe = useStripe();
    const elements = useElements();


    
// payment validation

  const validatePaymentForm = (paymentData,setErrors) => {
    const errors = {};
  
     // Validate balance
     if (!paymentData.balance || isNaN(paymentData.balance)) {
      errors.balance = 'Balance is required and must be a number.';
  }
  
  // Validate amountToAdd
  if (!paymentData.amountToAdd || isNaN(paymentData.amountToAdd) || parseFloat(paymentData.amountToAdd) <= 0) {
      errors.amountToAdd = 'Amount to add is required and must be greater than zero.';
  }
  
    // Payment method-specific validations
    
      const cardNumber = paymentData.cardNumber.replace(/\D/g, ''); 
        if (!cardNumber || cardNumber.length !== 16 || isNaN(cardNumber)) {
            errors.cardNumber = 'Valid 16-digit card number is required.';
        }
        if (!paymentData.cardHolderName) {
            errors.cardHolderName = 'Card holder name is required.';
        }
        
      // Ensure month and year are properly selected
      if (!paymentData.expirationDate?.month || paymentData.expirationDate.month === "") {
          errors.expirationDateMonth = 'Please select a valid month.';
      }
  
      if (!paymentData.expirationDate?.year || paymentData.expirationDate.year === "") {
          errors.expirationDateYear = 'Please select a valid year.';
      }
  
  
        if (!paymentData.cvc || paymentData.cvc.length !== 3 || isNaN(paymentData.cvc)) {
            errors.cvc = 'Valid 3-digit CVC is required.';
        }
    
  
    
    setErrors(errors);
  
    return Object.keys(errors).length === 0; 
    };
  
  



    const handlePaymentMethodSelect = (method) => {
        // Update the selected payment method
        setSelectedMethod(method);
        setPaymentData({ ...paymentData, paymentMethod: method });
    };


     // Generate dynamic months
     const gen_months = Array.from({ length: 12 }, (_, index) => ({
        value: (index + 1).toString().padStart(2, '0'),
        label: new Date(0, index).toLocaleString('default', { month: 'long' }),
    }));

    // Generate dynamic years (current year to 10 years later)
    const currentYear = new Date().getFullYear();
    const gen_years = Array.from({ length: 10 }, (_, index) => ({
        value: (currentYear + index).toString(),
        label: (currentYear + index).toString(),
    }));
    

   console.log("pay out side",paymentData )
   
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validatePaymentForm(paymentData, setErrors, selectedMethod)) {
            return;
        }

        // try {
        //     const response = await axios.post(`${LOCAL_HOST}/create-payment-intent`, {
        //         amountToAdd: paymentData.amountToAdd,
        //         paymentMethod: paymentData.paymentMethod,
        //         paymentDetails:paymentData
        //     });

        //     // console.log("pay inside side",paymentData )

        //     if (response.status === 201) {
        //         const { clientSecret, transactionId } = response.data;
        //         console.log("pay  inside inside side",paymentData )

        //         const card_details = {
        //               type: 'card',
        //     card: {
        //         number: paymentData.cardNumber, // Custom input for card number
        //         exp_month: paymentData.expirationDate?.month, // Custom input for expiration month
        //         exp_year: paymentData.expirationDate?.year,   // Custom input for expiration year
        //         cvc: paymentData.cvc,                        // Custom input for CVC
        //     },
        //         }

        //         if (selectedMethod === 'Credit/Debit Card' && stripe && elements) {
        //             const cardElement = elements.getElement(CardElement)

        //             console.log("elementssss",elements);
        //             console.log("card elementssss",CardElement);
                    
        //             if (!cardElement) {
        //                 setErrors({ ...errors, paymentMethod: 'Card details are missing.' });
        //                 // alert('Please fill in card details.');
        //                 console.log("pay  inside side",paymentData )
        //                 return;
        //             }

        //             const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        //                 payment_method: {
        //                     card: cardElement,
        //                     billing_details: {
        //                         name: paymentData.cardHolderName,
        //                     },
        //                 },
        //             });

        //             if (error) {
        //                 setErrors({ ...errors, paymentMethod: 'Payment failed, please try again.' });
        //                 alert(error.message);
        //             } else if (paymentIntent.status === 'succeeded') {
        //                 alert('Payment successful');
        //                 await axios.put(`${LOCAL_HOST}/confirm-payment`, {
        //                     transactionId,
        //                     status: 'success',
        //                     paymentDetails: paymentIntent,
        //                 });
        //                 navigate('/payments-details');
        //             }
        //         }
        //     }
        // } catch (error) {
        //     console.error('Payment Error:', error);
        //     setErrors({ ...errors, paymentMethod: 'An error occurred, please try again.' });
        // }
    };
   



    return (
        <div className="bg-white p-6 flex flex-col gap-8 mt-4 h-full w-full">
            <h4 className="text-xl font-semibold">Top Up Your Wallet</h4>

            <div className="border-2 border-gray-400 p-4 rounded-md flex">
                {/* Left Section: Payment Methods */}
                <div className="w-full pr-4 border-r-2 border-gray-300">
                    <div className="flex items-center pt-4 flex-row w-full">
                        <div className="flex w-1/2 items-center">
                            <label className="block">Current Wallet Balance <span className="text-red-500">*</span></label>
                            <div className="flex ms-4 flex-col w-[70%]">
                                <input
                                    type="text"
                                    name="balance"
                                    value={paymentData.balance}
                                    onChange={(e) =>handlePaymentInputChange(e.target,paymentData,setPaymentData,setErrors,errors)}
                                    required
                                    className="mt-1 block border-b-2 border-gray-500 focus:outline-none sm:text-sm"
                                />
                                {errors.balance && <span className="text-red-500 text-sm pt-1">{errors.balance}</span>}
                            </div>
                        </div>
                        <div className="flex items-center w-1/2">
                            <label className="block">Amount To Add <span className="text-red-500">*</span></label>
                            <div className="flex flex-col w-[70%] ms-4">
                                <input
                                    type="text"
                                    name="amountToAdd"
                                    value={paymentData.amountToAdd}
                                    onChange={(e) =>handlePaymentInputChange(e.target,paymentData,setPaymentData,setErrors,errors)}
                                    required
                                    className="mt-1 block border-b-2 border-gray-500 focus:outline-none sm:text-sm"
                                    placeholder="Add Amount"
                                />
                                {errors.amountToAdd && <span className="text-red-500 text-sm pt-1">{errors.amountToAdd}</span>}
                            </div>
                        </div>
                    </div>

                    {/* Payment Methods List */}
                    <div className='flex  w-full  pt-9'>
                       
                            <div className="flex w-1/5 gap-y-12 flex-col ">
                                {paymentMethods.map((method) => (
                                    <div
                                    key={method.name}
                                    className={`flex items-center w-full justify-between cursor-pointer p-2 ${
                                        selectedMethod === method.name ? 'bg-teal-50  w-full h-16' : ''
                                    }`}
                                    onClick={() => handlePaymentMethodSelect(method.name)}
                                    >
                                        <div className="flex items-center">
                                            <img
                                                src={method.imgSrc}
                                                alt={method.name}
                                                className="h-15 w-14"
                                            />
                                            <label className="ml-4 text-lg">{method.name}</label>
                                        </div>
                                        <MdKeyboardArrowRight className="h-7 w-7" />
                                    </div>
                                ))}
                                {errors.paymentMethod && (
                                    <span className="text-red-500 text-sm">{errors.paymentMethod}</span>
                                )}
                            </div>
                       

                        <div className="w-1/2 mx-auto flex">
                            {selectedMethod === 'Credit/Debit Card' && (
                                <div className='border-2 rounded-md p-6 border-gray-600 w-full'>
                                    <h4 className="text-lg font-semibold">Checkout</h4>
                                    <p className='text-sm text-gray-500 pt-1'>Please Enter your Credit Cart Details to Proceed with the Payment.</p>
                                    <div className="gap-4 mt-4">
                                        <div className='mt-4'>
                                            <label className='text-lg text-gray-500'>Credit Number:<span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                name="cardNumber"
                                                placeholder='0000-0000-0000-0000'
                                                value={paymentData.cardNumber}
                                                onChange={(e) =>handlePaymentInputChange(e.target,paymentData,setPaymentData,setErrors,errors)}
                                                className="block rounded-md p-2 h-10 w-full border border-gray-500 focus:outline-none"
                                                maxLength="19"
                                            />
                                             {errors.cardNumber && (
                                                <span className="text-red-500 text-sm pt-1">{errors.cardNumber}</span>
                                            )}
                                        </div>
                                        <div className='mt-4'>
                                            <label className='text-lg  text-gray-500'>Card Holder's Name:<span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                name="cardHolderName"
                                                placeholder="Enter Holder's Name"
                                                value={paymentData.cardHolderName}
                                                onChange={(e) =>handlePaymentInputChange(e.target,paymentData,setPaymentData,setErrors,errors)}
                                                className="block p-2 w-full rounded-md h-10 border border-gray-500 focus:outline-none"
                                            />
                                            {errors.cardHolderName && (
                                                <span className="text-red-500 text-sm pt-1">{errors.cardHolderName}</span>
                                            )}
                                        </div>


                                        <div className='flex items-center  pt-6 '>
                                            <div className='flex w-full  flex-col'>
                                            
                                            <div className='flex items-center'>
                                                <div className='flex flex-col '>   
                                            <label  className='md:text-lg sm:text-sm text-gray-500 pb-3'>Expiration Date:<span className="text-red-500">*</span></label>
                                            <div className="flex ">

                                                <select
                                                    name="expirationDateMonth"
                                                    onChange={(e) =>handlePaymentInputChange(e.target,paymentData,setPaymentData,setErrors,errors)}
                                                    value={paymentData.expirationDate?.month || ""}
                                                    className="border mr-4 rounded-md sm:w-20 md:w-48 h-10 p-1   border-gray-500 focus:outline-none"
                                                >
                                                      <option value="">Month</option>
                                    {gen_months.map((months) => (
                                        <option key={months.value} value={months.value}>
                                            {months.label}
                                        </option>
                                    ))}
                                                </select>
                                               
                                                <select
                                                    name="expirationDateYear"
                                                    value={paymentData.expirationDate?.year || ""}
                                                    onChange={(e) =>handlePaymentInputChange(e.target,paymentData,setPaymentData,setErrors,errors)}
                                                    className="border rounded-md sm:w-20  md:w-48 h-10 p-1 border-gray-500 focus:outline-none"
                                                >
                                                    <option value="">Year</option>
                                    {gen_years.map((year) => (
                                        <option key={year.value} value={year.value}>
                                            {year.label}
                                        </option>
                                    ))}
                                                </select>
                                                </div>

                                                
                                                {(errors.expirationDateMonth || errors.expirationDateYear) && (
                                                    <span className="text-red-500 text-sm">{errors.expirationDateMonth || errors.expirationDateYear}</span>
                                                )}
                                                </div>

                                                <div className='w-full '>
                                                <div className='flex flex-col mt-4'>
                                                <label  className='md:text-lg sm:text-sm ps-2 text-gray-500'>Verification Code (CVC)<span className="text-red-500">*</span></label>

                                                <input
                                                type="text"
                                                name="cvc"
                                                placeholder='CVV'
                                                value={paymentData.cvc}
                                                onChange={(e) =>handlePaymentInputChange(e.target,paymentData,setPaymentData,setErrors,errors)}
                                                className=" border ms-2 rounded-md sm:w-20 md:w-60 h-10 p-1 border-gray-500 focus:outline-none"
                                            />
                                            </div>
                                              {errors.cvc && (
                                                    <span className="text-red-500 text-sm pt-1 ps-3">{errors.cvc}</span>
                                                )}
                                            </div>
                                            </div>
                        
                                            </div>
                                       
                                        <div >
                                            
                                        </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Right Section: Payment Details */}
                            {selectedMethod === 'UPI' && <h4 className="text-lg font-semibold">Enter UPI Details</h4>}
                            {selectedMethod === 'Net Banking' && (
                                <h4 className="text-lg font-semibold">Enter Net Banking Details</h4>
                            )}
                            {selectedMethod === 'PayPal' && <h4 className="text-lg font-semibold">Enter PayPal Details</h4>}

                        </div>
                    </div>


                </div>



            </div>

            {/* Bottom Buttons */}
            <div className="flex fixed bottom-0 right-4 mb-4 gap-4 mt-6">
                <button
                    onClick={() => navigate('/payments-details')}
                    className="px-4 py-2 border border-[#217989] bg-white text-black rounded-md hover:bg-gray-400"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-[#217989] text-[#C7EBF2] rounded-md"
                >
                    Top-up
                </button>
            </div>
        </div>
    );
};


const StripeWrapper = () => (
    <Elements stripe={stripePromise}>
        <Addpayment />
    </Elements>
);

export default StripeWrapper;
