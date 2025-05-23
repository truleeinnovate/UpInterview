import { XCircle } from 'lucide-react';
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import { config } from '../../../config.js'
import axios from "axios";
import { handleMembershipChange } from "../../../utils/PaymentpageValidations.js";
import { useCustomContext } from "../../../Context/Contextfetch";
import { decodeJwt } from "../../../utils/AuthCookieManager/jwtDecode";

// Function to load scripts dynamically
const loadScript = (src) => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            resolve(true);
        };
        script.onerror = () => {
            resolve(false);
        };
        document.body.appendChild(script);
    });
};

// Check if Razorpay is available in the window object
const isRazorpayAvailable = () => {
    return typeof window.Razorpay === 'function';
};

// Function to load the Razorpay script if not already available
const loadRazorpayScript = async () => {
    // If Razorpay is already available, return true immediately
    if (isRazorpayAvailable()) {
        return true;
    }
    
    // Otherwise, try to load the script with the latest version
    const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
    if (!res) {
        toast.error('Razorpay SDK failed to load. Please check your internet connection.');
        return false;
    }
    
    // Wait a moment for the script to initialize
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Verify that Razorpay is now available and has the required methods
    if (!isRazorpayAvailable()) {
        console.error('Razorpay is not available as a constructor after loading');
        toast.error('Payment gateway is not available. Please try again later.');
        return false;
    }
    
    // Additional check for required methods
    if (typeof window.Razorpay.createToken === 'undefined') {
        console.error('Razorpay tokenization methods not available');
        toast.error('Payment gateway initialization failed. Please refresh and try again.');
        return false;
    }
    
    return true;
};

const CardDetails = () => {
    console.log('card details')

    const authToken = Cookies.get("authToken");
    const tokenPayload = decodeJwt(authToken);


    const tenantId = tokenPayload?.tenantId;
    const ownerId = tokenPayload?.userId;

    const location = useLocation();
    const isUpgrading = location.state?.isUpgrading || false;
    const {
        userProfile,
    } = useCustomContext();

    const [cardDetails, setCardDetails] = useState({
        membershipType: "",
        addOn: "",
        autoRenew: true // Default to auto-renewal enabled
    });
    
    const [processing, setProcessing] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);


    const navigate = useNavigate();

    const [totalPaid, setTotalPaid] = useState(0);

    const [errors, setErrors] = useState({});
    const planDetails = useMemo(() => location.state?.plan || {}, [location.state]);
    const [pricePerMember, setPricePerMember] = useState({
        monthly: 0,
        annually: 0,
    });


    // Function to initialize Razorpay payment
    const initializeRazorpayPayment = async (orderData) => {
        // Ensure Razorpay is loaded before proceeding
        if (!isRazorpayAvailable()) {
            // Try loading it again if not available
            const isLoaded = await loadRazorpayScript();
            if (!isLoaded) {
                setProcessing(false);
                toast.error('Payment gateway failed to load. Please try again.');
                return; // Exit if loading fails
            }
        }
        
        console.log('Initializing Razorpay popup with data:', orderData);
    
    // Debug Razorpay key
    console.log('Razorpay key from response:', { 
        razorpayKeyId: orderData.razorpayKeyId,
        key_id: orderData.key_id,
        fromOrder: orderData.order?.key_id
    });
    
    // Get the amount from the order response
    // The backend should have converted it to cents already
    let amount;
    if (orderData.order?.amount) {
        // If we have the amount in the order object, use that
        amount = orderData.order.amount;
    } else if (orderData.amount) {
        // If we have the amount directly in the response
        amount = orderData.amount;
    } else {
        // Fallback to calculating it ourselves
        amount = Math.round(totalPaid * 100);
    }

    // Log the amount for debugging
    console.log('Payment amount in cents:', amount, '($' + (amount/100).toFixed(2) + ')');
        
        // Keep loading active while Razorpay payment window is open
        const options = {
            key: orderData.razorpayKeyId,
            amount: amount,
            currency: 'USD', // Explicitly setting USD currency for dollar payments
            name: "Upinterview",
            description: `${planDetails.name || 'Subscription Plan'} - $${(amount/100).toFixed(2)}`,
            order_id: orderData.orderId,
            // Customer details
            prefill: {
                name: userProfile?.name || '',
                email: userProfile?.email || '',
                contact: userProfile?.phone || ''
            },
            // Notes for the payment
            notes: {
                planId: planDetails.planId || planDetails.subscriptionPlanId || '',
                planName: planDetails.name || 'Subscription',
                billingCycle: cardDetails.membershipType || 'monthly',
                autoRenew: cardDetails.autoRenew ? '1' : '0',
                tenantId: tenantId,
                ownerId: ownerId,
                isSubscription: '1'
            },
            // Theme configuration
            theme: {
                color: "#3399cc"
            },
            // Enable card saving for future payments
            save: 1,
            // Enable recurring payments
            recurring: 1,
            modal: {
                // This will be called when the user closes the Razorpay popup
                // without completing the payment
                ondismiss: function() {
                    console.log('Payment popup closed by user');
                    
                    toast.info('Payment cancelled');
                    setButtonLoading(false);
                }
            },
            handler: async function (response) {
                try {
                    // No need to verify card details as we're using Razorpay's secure form

                    // Log payment response for debugging
                    console.log('Razorpay payment response:', response);
                    
                    // Extract card details from Razorpay response if available
                    // Razorpay might provide card details in the response that we can use
                    const cardInfo = response.razorpay_payment_id ? {
                        // We only store the last 4 digits for reference, not the full number
                        cardNumber: response.card?.last4 || '',
                        cardHolderName: userProfile?.name || '',
                        // We don't store CVV at all
                        // We don't need to store full expiry, just month/year if provided
                        expiryMonth: response.card?.expiry_month || '',
                        expiryYear: response.card?.expiry_year || '',
                        cardBrand: response.card?.network || '',
                        currency: 'USD'
                    } : null;
                    
                    // Prepare comprehensive data for verification and webhook processing
                    const verificationData = {
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_signature: response.razorpay_signature,
                        planDetails: {
                            ...planDetails,
                            // Ensure invoiceId is included when sending to backend
                            invoiceId: planDetails.invoiceId || ''
                        },
                        // Only include card info if we have it from Razorpay
                        ...(cardInfo && { 
                            cardDetails: cardInfo,
                            // Add token information for recurring payments
                            token: response.razorpay_payment_id ? {
                                card_id: response.razorpay_payment_id,
                                last4: response.card?.last4 || '',
                                network: response.card?.network || '',
                                type: response.card?.type || '',
                                recurring: true
                            } : null
                        }),
                        metadata: {
                            ownerId: ownerId,
                            tenantId: tenantId,
                            planId: planDetails.planId || '',
                            planName: planDetails.name || 'Subscription',
                            billingCycle: cardDetails.membershipType || 'monthly',
                            autoRenew: cardDetails.autoRenew,
                            invoiceId: planDetails.invoiceId || '' // Also include invoiceId in metadata
                        }
                    };
                    
                    console.log('Sending verification data to backend:', JSON.stringify(verificationData, null, 2));
                    
                    // Verify the payment signature with backend
                    const verifyResponse = await axios.post(
                        `${config.REACT_APP_API_URL}/payment/verify`, 
                        verificationData
                    );

                    console.log('Payment verification response:', verifyResponse.data);
        
                    // Check for successful payment - be more flexible with the response format
                    const isSuccess = verifyResponse.data.status === 'paid' || 
                                     verifyResponse.data.status === 'success' ||
                                     verifyResponse.data.message?.toLowerCase().includes('success');

                    if (isSuccess) {
                        // Set processing state to true only after successful payment
                        // This ensures the spinner is only shown after payment success
                        setProcessing(true);
                        
                        // Show success toast
                        toast.success("Payment successfully completed! Your subscription is now active.");
                        
                        // Log payment details for reference
                        console.log("Payment completed successfully:", {
                            paymentId: response.razorpay_payment_id,
                            orderId: response.razorpay_order_id
                        });
                        
                        // Delay navigation to allow toast to be visible
                        setTimeout(() => {
                            console.log('Navigating after successful payment');
                            // Only set processing to false right before navigation
                            setProcessing(false);
                            if (isUpgrading) {
                                navigate("/SubscriptionDetails");
                            } else {
                                navigate("/home");
                            }
                        }, 2000); // 2 second delay before navigation
                    } else {
                        setProcessing(false);
                        toast.error("Payment verification failed!");
                    }
                } catch (error) {
                    console.error("Error verifying payment:", error);
                    setProcessing(false);
                    toast.error("Payment verification failed. Please try again.");
                }
            }
        };

        try {
            // Double-check that Razorpay is available right before using it
            if (!isRazorpayAvailable()) {
                throw new Error('Razorpay is not available as a constructor');
            }
            
            // Create the Razorpay instance and open the payment form
            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            console.error('Error creating Razorpay instance:', error);
            toast.error('Unable to initialize payment gateway. Please try again later.');
            setButtonLoading(false);
        }
    };
    
    useEffect(() => {
        if (planDetails) {
            const { monthlyPrice, annualPrice } = planDetails;

            // Ensure prices are numbers and have proper defaults
            const monthly = parseFloat(monthlyPrice) || 0;
            const annual = parseFloat(annualPrice) || 0;

            console.log('Setting up plan details:', { monthly, annual, planDetails });

            // Set monthly and annual prices dynamically
            setPricePerMember({
                monthly: monthly,
                annually: annual,
            });

            // Default selection logic
            const defaultMembershipType = planDetails.billingCycle === "annual" ? "annual" : "monthly";
            
            // Update card details with membership type and user info
            setCardDetails(prevData => ({
                ...prevData,
                membershipType: defaultMembershipType,
                tenantId: tenantId || "",
                ownerId: ownerId || "",
                userType: planDetails.user?.userType || ""
            }));

            // Calculate the initial total using the same logic as updateTotalPaid
            const price = defaultMembershipType === "annual" ? annual : monthly;
            const discount = defaultMembershipType === "annual" 
                ? parseFloat(planDetails.annualDiscount) || 0 
                : parseFloat(planDetails.monthDiscount) || 0;
                
            const initialTotal = Math.max(0, price - discount);
            console.log('Initial total calculation:', { price, discount, initialTotal });
            
            setTotalPaid(initialTotal.toFixed(2));
        }
    }, [ownerId, planDetails, tenantId]);

    // Validate details before submitting to payment processor
    const validateCardDetailsBeforeSubmit = () => {
        const errors = {};

        if (!cardDetails.membershipType)
            errors.membershipType = "Membership Type is required";

        if (Object.keys(errors).length > 0) {
            setErrors(errors);
            return false;
        }

        // Additional pre-submission validation if needed
        if (totalPaid <= 0) {
            toast.error("Invalid payment amount");
            return false;
        }
        
        return true;
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate form fields
        if (!validateCardDetailsBeforeSubmit()) {
            return;
        }

        try {
            // Set button loading state to true when Pay button is clicked
            setButtonLoading(true);
            
            // Load Razorpay script
            const isScriptLoaded = await loadRazorpayScript();
            if (!isScriptLoaded) {
                toast.error('Payment gateway failed to load. Please try again.');
                setButtonLoading(false);
                return;
            }

            // No need to update card details as we're not collecting them anymore

            // Ensure totalAmount is a valid number and properly formatted
            const amountToCharge = parseFloat(totalPaid) || 0;
            console.log('Creating order with amount:', amountToCharge, 'USD');
            
            // Create order data object
            const orderData = {
                planDetails: {
                    ...planDetails,
                    // Ensure prices are numbers
                    monthlyPrice: parseFloat(planDetails.monthlyPrice) || 0,
                    annualPrice: parseFloat(planDetails.annualPrice) || 0,
                    monthDiscount: parseFloat(planDetails.monthDiscount) || 0,
                    annualDiscount: parseFloat(planDetails.annualDiscount) || 0,
                },
                ownerId,
                tenantId,
                planId: planDetails.planId || planDetails._id || '',
                membershipType: cardDetails.membershipType,
                userProfile,
                amount: amountToCharge, // Send amount in dollars, backend will convert to cents
                currency: 'USD',
                autoRenew: cardDetails.autoRenew,
                // Additional metadata for better tracking
                metadata: {
                    billingCycle: cardDetails.membershipType,
                    userId: ownerId,
                    timestamp: new Date().toISOString()
                }
            };
            
            console.log('Sending order to backend:', {
                amount: amountToCharge,
                currency: 'USD',
                membershipType: cardDetails.membershipType,
                planId: orderData.planId,
                autoRenew: cardDetails.autoRenew
            });

            // Send request to create order
            const orderResponse = await axios.post(
                `${config.REACT_APP_API_URL}/payment/create-order`,
                orderData
            );

            console.log('Order response:', orderResponse.data);

            // Check if this is a subscription or one-time payment
            if (orderResponse.data.isSubscription) {
                // Handle subscription flow - if we have isMockSubscription flag
                // if (orderResponse.data.isMockSubscription) {
                //     handleMockSubscription(orderResponse.data);
                //     return;
                // }
                
                // If we have authLink, we need to check if we should use popup or redirect
                if (orderResponse.data.authLink && orderResponse.data.authLink !== '#') {
                    // Save subscription info for confirmation later
                    localStorage.setItem('pendingSubscription', JSON.stringify({
                        subscriptionId: orderResponse.data.subscriptionId,
                        planId: planDetails.planId || planDetails._id || '',
                        membershipType: cardDetails.membershipType,
                        ownerId,
                        tenantId
                    }));
                    
                    // Redirect to Razorpay's authorization page for subscriptions
                    window.location.href = orderResponse.data.authLink;
                    return;
                }
                
                // For normal orders, open Razorpay popup
                if (orderResponse.data.orderId || orderResponse.data.order?.id) {
                    initializeRazorpayPayment(orderResponse.data);
                } else {
                    toast.error("Failed to create payment order. Please try again.");
                    setProcessing(false);
                }
            } else {
                // Regular payment flow - open Razorpay popup
                initializeRazorpayPayment(orderResponse.data);
            }
        } catch (error) {
            console.error("Error processing payment:", error);
            toast.error("Error processing payment: " + (error.response?.data?.message || error.message));
            setButtonLoading(false);
        }
    };
    
    // // Handle mock subscription during testing
    // const handleMockSubscription = async (subscriptionData) => {
    //     try {
    //         const { subscriptionId } = subscriptionData;
            
    //         toast.success("Test mode: Subscription created successfully");
            
    //         // For development/testing: simulate a successful subscription
    //         const verificationResponse = await axios.post(
    //             `${config.REACT_APP_API_URL}/payment/test-subscription-success`, 
    //             {
    //                 subscriptionId,
    //                 ownerId,
    //                 tenantId,
    //                 planId: planDetails.subscriptionPlanId,
    //                 membershipType: cardDetails.membershipType
    //             }
    //         );
    //             };

    //             // Log payment response for debugging
    //             console.log('Razorpay payment response:', response);
    //         setProcessing(false);
    //     }
    

    useEffect(() => {
        const checkSubscriptionStatus = async () => {
            // Check if we're returning from a subscription authorization
            const pendingSubscription = localStorage.getItem('pendingSubscription');
            const params = new URLSearchParams(window.location.search);
            const razorpayPaymentId = params.get('razorpay_payment_id');
            const razorpaySignature = params.get('razorpay_signature');
            
            if (pendingSubscription && (razorpayPaymentId || params.get('error_code'))) {
                const subscriptionData = JSON.parse(pendingSubscription);
                
                // Clear the pending subscription data
                localStorage.removeItem('pendingSubscription');
                
                // If we have a payment ID, verify the payment
                if (razorpayPaymentId && razorpaySignature) {
                    try {
                        toast.loading("Verifying subscription...");
                        
                        const verificationResponse = await axios.post(
                            `${config.REACT_APP_API_URL}/payment/verify-subscription`, 
                            {
                                razorpay_payment_id: razorpayPaymentId,
                                razorpay_subscription_id: subscriptionData.subscriptionId,
                                razorpay_signature: razorpaySignature,
                                ownerId: subscriptionData.ownerId,
                                tenantId: subscriptionData.tenantId,
                                planId: subscriptionData.planId,
                                membershipType: subscriptionData.membershipType
                            }
                        );
                        
                        toast.dismiss();
                        
                        if (verificationResponse.data.status === "success") {
                            toast.success("Subscription successfully activated!");
                            
                            // Send email notification
                            await axios.post(`${config.REACT_APP_API_URL}/emails/subscription/paid`, {
                                ownerId: subscriptionData.ownerId,
                                tenantId: subscriptionData.tenantId,
                            });
                            
                            // Navigate based on upgrade status
                            if (isUpgrading) {
                                navigate("/SubscriptionDetails");
                            } else {
                                navigate("/home");
                            }
                        } else {
                            toast.error("Subscription verification failed. Please contact support.");
                        }
                    } catch (error) {
                        console.error("Error verifying subscription:", error);
                        toast.error("Failed to verify subscription. Please contact support.");
                    }
                } else if (params.get('error_code')) {
                    // Handle payment failure
                    toast.error(`Payment failed: ${params.get('error_description') || 'Unknown error'}`); 
                }
            }
        };
        
        checkSubscriptionStatus();
    }, [isUpgrading, navigate]); // Added isUpgrading and navigate to dependency array

    return (
        <div className="flex pt-4 flex-col h-full w-full items-center bg-white">
            {/* Add ToastContainer to display toast notifications */}
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
            
            {processing ? (
                <div className="flex flex-col items-center justify-center h-screen">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#217989]"></div>
                    <p className="mt-4 text-lg font-medium text-gray-700">Processing your Home...</p>
                </div>
            ) : (
                <form
                    className="w-[70%] sm:w-[90%] md:w-[70%] flex flex-col mb-4 justify-center h-[70%] p-5 bg-white border-2 border-gray-300 rounded-md"
                    onSubmit={handleSubmit}
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold mb-2">
                        Upgrade to a Basic Membership
                    </h2>
                    <XCircle
                        onClick={() => navigate("/subscription-plans")}
                        className="h-7 w-7" />
                </div>
                <p className="text-gray-500  text-md mb-2">
                    Get all access and an extra 20% off when you subscribe annually
                </p>


                <div className="w-full flex gap-6">

                    <div className="w-9/12 md:w-7/12  sm:w-6/12">

                        <div className="bg-blue-50 p-4 mb-4 rounded-lg border border-blue-200">
                            <h3 className="text-lg font-medium text-blue-800 mb-2">Secure Payment</h3>
                            <p className="text-blue-600">
                                Your payment information will be securely collected by Razorpay's payment form.
                                No card details are stored on our servers.
                            </p>
                            
                            <div className="mt-3 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <span className="text-blue-600">Your payment is protected with industry-standard encryption</span>
                            </div>
                            
                            <div className="mt-3 flex justify-center">
                                <img alt="VisaCard" className="h-8 mx-1" src="https://dwglogo.com/wp-content/uploads/2016/08/Visa-logo-02.png" />
                                <img alt="MasterCard" className="h-8 mx-1" src="https://i.pinimg.com/736x/56/fd/48/56fd486a48ff235156b8773c238f8da9.jpg" />
                                <img alt="Razorpay" className="h-8 mx-1" src="https://razorpay.com/assets/razorpay-logo.svg" />
                            </div>
                        </div>

                        <div className="mt-6 mb-4 flex flex-col">
                            <span className="font-semibold text-lg"> {cardDetails.membershipType === "monthly"
                                ? `$${(pricePerMember.monthly - planDetails.monthDiscount || Math.round(pricePerMember.monthly))} / Month / User`
                                : `$${(pricePerMember.annually - planDetails.annualDiscount || Math.round(pricePerMember.annually))} / Annual / User`}
                            </span>

                            <span className="text-blue-400">Details</span>
                        </div>

                    </div>


                    <div className="w-1/2">

                        {/* Membership Type */}
                        <label className="block mb-1  text-lg font-medium text-gray-500">
                            Membership Type
                        </label>


                        <div className="flex flex-col gap-4   mb-4">

                            <div
                                className={`border p-2 flex items-center gap-2 rounded-md bg-gray-50
                                     ${cardDetails.membershipType === "monthly"
                                        ? "border-[#217989]"
                                        : "border-gray-300"
                                    }`}
                                onClick={() => handleMembershipChange("monthly", setCardDetails, pricePerMember, planDetails, setTotalPaid)}
                            >

                                <div className="flex  items-center">
                                    <input
                                        type="radio"
                                        name="membershipType"
                                        value="monthly"
                                        checked={cardDetails.membershipType === "monthly"}
                                        // onChange={(e) => setCardDetails((prevData) => ({ ...prevData, membershipType: e.target.value }))}
                                        readOnly

                                        className="mr-1 h-4 w-5"
                                    />

                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold">Pay Monthly</span>
                                    <span className="text-sm font-medium"> ${pricePerMember.monthly} / Month Per {planDetails.user?.userType === "individual" ? "Member" : "Organization"}</span>
                                </div>
                            </div>


                            <div
                                className={`border p-2 flex justify-between items-center gap-4 rounded-md bg-gray-50 
                                    ${cardDetails.membershipType === "annual"
                                        ? "border-[#217989]"
                                        : "border-gray-300"
                                    }`}
                                onClick={() => handleMembershipChange("annual", setCardDetails, pricePerMember, planDetails, setTotalPaid)}

                            >

                                <div className="flex gap-2  items-center"


                                >
                                    <input
                                        type="radio"
                                        name="membershipType"
                                        value="annual"
                                        checked={cardDetails.membershipType === "annual"}

                                        readOnly
                                        className="mr-1 h-4 w-5"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold">Pay Annually</span>
                                        <span className="text-sm font-medium"> ${Math.round(pricePerMember.annually / 12)} / Month Per {planDetails.user?.userType === "individual" ? "Member" : "Organization"}</span>
                                    </div>

                                </div>

                                <div>
                                    <span className="text-sm font-semibold">{planDetails.annualBadge}</span>
                                </div>


                            </div>

                        </div>

                        {/* Add-on */}
                        <label className="block mb-1 text-lg font-medium text-gray-700">
                            Add-ons
                        </label>
                        <div

                            className={`border p-4 flex   items-center gap-2 rounded-md bg-gray-50 ${cardDetails.addOn === "AI Particle Accelerator" ? "border-[#217989]" : "border-gray-300"
                                }`}
                            onClick={() =>
                                setCardDetails((prevData) => ({
                                    ...prevData,
                                    addOn: prevData.addOn === "AI Particle Accelerator" ? "" : "AI Particle Accelerator",
                                }))
                            }
                        >
                            <div className="flex  items-center mb-4 ">
                                <input
                                    type="radio"
                                    name="addOn"
                                    value="AI Particle Accelerator"
                                    checked={cardDetails.addOn === "AI Particle Accelerator"}
                                    // onChange={(e) => setCardDetails((prevData) => ({ ...prevData, addOn: e.target.value }))}
                                    readOnly
                                    className="mr-2"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold">AI Particle Accelerator</span>
                                    <span>$20,000,000 / Month Per Member</span>
                                </div>

                                <div className="flex flex-col text-sm">
                                    <span>Unlimited use of AI of Q&A,</span>
                                    <span>Autofill, writer, and more</span>
                                </div>


                            </div>


                        </div>

                        {errors.membershipType && (
                            <p className="text-red-500 text-sm pt-1">{errors.membershipType}</p>
                        )}

                        {/* Submit */}

                        <p className="text-xs md:text-sm text-gray-500 mt-4 m-2">
                            By continuing, {" "}
                            <span className="text-[#217989] ">
                                you agree to our terms and conditions
                            </span>
                            .
                        </p>
                        <button
                            type="submit"
                            className="w-full p-3 bg-[#217989] text-[#C7EBF2] font-medium rounded-lg"
                            disabled={buttonLoading || processing}
                        >
                            {buttonLoading ? "Processing..." : "Pay"}
                        </button>

                    </div>
                </div>
            </form>
            )}
        </div>
    );
};



export default CardDetails