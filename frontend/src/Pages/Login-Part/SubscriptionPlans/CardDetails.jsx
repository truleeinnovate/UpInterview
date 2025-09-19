// v1.0.0 - Ashok - changed logo url from local to cloud storage url
import { XCircle } from 'lucide-react';
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import { config } from '../../../config.js'
import axios from "axios";
import { handleMembershipChange } from "../../../utils/PaymentpageValidations.js";
//import { useCustomContext } from "../../../Context/Contextfetch";
import { decodeJwt } from "../../../utils/AuthCookieManager/jwtDecode";
import { useUserProfile } from "../../../apiHooks/useUsers.js";
import { useSubscription } from "../../../apiHooks/useSubscription";
import Loading from '../../../Components/Loading.js';
// import logo from "../../../Pages/Dashboard-Part/Images/upinterviewLogo.webp";


// Simple function to load Razorpay script
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
            console.log('Razorpay script loaded successfully');
            resolve(true);
        };
        script.onerror = () => {
            console.error('Failed to load Razorpay script');
            resolve(false);
        };
        document.body.appendChild(script);
    });
};

const CardDetails = () => {
    console.log('card details')

    const authToken = Cookies.get("authToken");
    const tokenPayload = decodeJwt(authToken);


    const tenantId = tokenPayload?.tenantId;
    const ownerId = tokenPayload?.userId;

    const location = useLocation();
    const isUpgrading = location.state?.isUpgrading || false;
    // const {
    //     userProfile,
    // } = useCustomContext();



    const [cardDetails, setCardDetails] = useState({
        membershipType: "",
        addOn: "",
        autoRenew: true // Default to auto-renewal enabled
    });

    const [processing, setProcessing] = useState(false);
    const [buttonLoading, setButtonLoading] = useState(false);


    const navigate = useNavigate();
    const { subscriptionData, createSubscription, verifySubscriptionPayment, refetchSubscription } = useSubscription();

    const [totalPaid, setTotalPaid] = useState(0);

    const [errors, setErrors] = useState({});
    const planDetails = useMemo(() => location.state?.plan || {}, [location.state]);
    const [pricePerMember, setPricePerMember] = useState({
        monthly: 0,
        annually: 0,
    });


    const { userProfile} = useUserProfile(ownerId)
    const [userProfileData, setUserProfile] = useState([])

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
    }, [ownerId, userProfile]);

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
            console.log('Creating order with amount:', amountToCharge, 'INR');

            // Create order data object
            const orderData = {
                planDetails: {
                    ...planDetails,
                    // Ensure prices are numbers
                    monthlyPrice: parseFloat(planDetails.monthlyPrice) || 0,
                    annualPrice: parseFloat(planDetails.annualPrice) || 0,
                    monthDiscount: parseFloat(planDetails.monthDiscount) || 0,
                    annualDiscount: parseFloat(planDetails.annualDiscount) || 0,
                    razorpayPlanIds: planDetails.razorpayPlanIds || {}
                },
                ownerId,
                tenantId,
                planId: planDetails.planId || planDetails._id || '',
                membershipType: cardDetails.membershipType,
                userProfile,
                // Send the amount in INR
                amount: amountToCharge,
                currency: 'INR',
                autoRenew: true, // Always set to true since we're only using subscriptions
                // Additional metadata for better tracking
                metadata: {
                    billingCycle: cardDetails.membershipType,
                    ownerId: ownerId,
                    tenantId: tenantId,
                    planId: planDetails.planId || planDetails._id || '',
                    planName: planDetails.name || 'Subscription Plan',
                    autoRenew: cardDetails.autoRenew,
                    // Include Razorpay plan ID for the selected billing cycle if available
                    razorpayPlanId: (planDetails.razorpayPlanIds &&
                        planDetails.razorpayPlanIds[cardDetails.membershipType]) || '',
                    timestamp: new Date().toISOString()
                }
            };

            console.log('Sending order to backend:', {
                amount: amountToCharge,
                currency: 'INR',
                membershipType: cardDetails.membershipType,
                planId: orderData.planId,
                autoRenew: true
            });

            // Create Razorpay subscription/order via hook mutation
            const orderResponse = await createSubscription(orderData);

            console.log('Order response:', orderResponse);

            // Check if this is a subscription or one-time payment
            if (orderResponse.isSubscription) {
                console.log('Processing subscription response:', orderResponse);

                // Save subscription info for confirmation later
                localStorage.setItem('pendingSubscription', JSON.stringify({
                    subscriptionId: orderResponse.subscriptionId,
                    planId: planDetails.planId || planDetails._id || '',
                    membershipType: cardDetails.membershipType,
                    ownerId,
                    tenantId,
                    autoRenew: cardDetails.autoRenew
                }));

                if (orderResponse.orderId) {
                    try {
                        // First, make sure the Razorpay script is loaded
                        const scriptLoaded = await loadRazorpayScript();
                        if (!scriptLoaded) {
                            throw new Error('Failed to load Razorpay script');
                        }

                        // Prepare options for Razorpay checkout
                        // Make sure amount is exactly the same as in the order (no modifications)
                        console.log('Order amount from backend:', orderResponse.amount);

                        const options = {
                            key: orderResponse.razorpayKeyId,
                            subscription_id: orderResponse.subscriptionId,
                            order_id: orderResponse.orderId,
                            // Don't include amount here as it's already in the order
                            // amount: orderResponse.data.amount,
                            currency: 'INR',//orderResponse.data.currency || 
                            name: "UpInterview",
                            description: `${cardDetails.membershipType} Subscription for ${planDetails.name} - ₹${(orderResponse.amount / 100).toFixed(2)}`,
                            // v1.0.0 <--------------------------------------------------------------------------------------------------------------------
                            // image: logo,
                            image: "https://res.cloudinary.com/dnlrzixy8/image/upload/v1756099243/upinterviewLogo_ng1wit.webp",
                            // v1.0.0 -------------------------------------------------------------------------------------------------------------------->
                            prefill: {
                                name: userProfileData?.name || "",
                                email: userProfileData?.email || "",
                                contact: userProfileData?.phone || "",
                            },
                            notes: {
                                ownerId: ownerId,
                                planId: planDetails._id,
                                membershipType: cardDetails.membershipType,
                            },
                            theme: {
                                color: "#3399cc",
                            },
                            handler: async function (response) {
                                try {
                                    // Handle successful payment
                                    console.log("Payment successful:", response);
                                    setProcessing(true);

                                    // Prepare verification data
                                    const verificationData = {
                                        razorpay_payment_id: response.razorpay_payment_id,
                                        razorpay_order_id: orderResponse.orderId,
                                        razorpay_signature: response.razorpay_signature,
                                        razorpay_subscription_id: orderResponse.subscriptionId,
                                        ownerId: cardDetails.ownerId,
                                        tenantId: tenantId,
                                        planId: planDetails.planId,
                                        membershipType: cardDetails.membershipType,
                                        autoRenew: cardDetails.autoRenew,
                                        invoiceId: planDetails.invoiceId || subscriptionData?.invoiceId,
                                    };

                                    // Log to verify invoiceId is included
                                    console.log('Including invoiceId in verification data:', planDetails.invoiceId);

                                    console.log('Sending verification data:', verificationData);

                                    // Verify payment with backend via hook mutation
                                    const verifyResponse = await verifySubscriptionPayment(verificationData);

                                    console.log('Payment verification response:', verifyResponse);

                                    if (verifyResponse.status === 'paid' ||
                                        verifyResponse.status === 'success' ||
                                        verifyResponse.message?.toLowerCase().includes('success')) {

                                        // 1) Quick refetch right away
                                        try {
                                            await refetchSubscription();
                                        } catch (e) {
                                            console.warn('Refetch subscription failed (non-blocking):', e?.message);
                                        }

                                        // 2) Wait for webhook to finish (receipt/invoice + ACTIVE), up to 60s
                                        try {
                                            const timeoutMs = 60000; // max wait 60s
                                            const pollMs = 2000; // poll every 2s
                                            const start = Date.now();
                                            let isReady = false;
                                            while (Date.now() - start < timeoutMs) {
                                                const result = await refetchSubscription();
                                                const fresh = result?.data || result; // TanStack returns {data}
                                                const isActive = (fresh?.status || '').toLowerCase() === 'active';
                                                const hasDocs = !!(fresh?.receiptId || fresh?.invoiceId);
                                                if (isActive && hasDocs) {
                                                    isReady = true;
                                                    break;
                                                }
                                                await new Promise(r => setTimeout(r, pollMs));
                                            }
                                            if (!isReady) {
                                                console.warn('Webhook not confirmed within timeout. Proceeding to success page.');
                                            }
                                        } catch (e) {
                                            console.warn('Error while waiting for webhook completion (non-blocking):', e?.message);
                                        }

                                        
                                        // 3) Navigate to success page only after webhook wait
                                        navigate('/subscription-success', {
                                            state: {
                                                paymentId: response.razorpay_payment_id,
                                                subscriptionId: orderResponse.subscriptionId,
                                                orderId: response.razorpay_order_id,
                                                isUpgrading: isUpgrading,
                                                planName: planDetails.name,
                                                membershipType: cardDetails.membershipType,
                                                nextRoute: isUpgrading ? '/account-settings/subscription' : '/home'
                                            }
                                        });

                                        toast.success("Payment successfully completed!");
                                        setProcessing(false);

                                        axios.post(`${config.REACT_APP_API_URL}/emails/send-signup-email`, {
                                                    tenantId: tenantId,
                                                    ownerId: ownerId,
                                        }).catch((err) => console.error('Email error:', err));
                                        await axios.post(`${process.env.REACT_APP_API_URL}/emails/subscription/paid`, {
                                                ownerId,
                                                tenantId,
                                                // ccEmail: "shaikmansoor1200@gmail.com",
                                        });

                                    } else {
                                        setProcessing(false);
                                        toast.error('Payment verification failed');
                                    }
                                } catch (error) {
                                    console.error('Error verifying payment:', error);
                                    setProcessing(false);
                                    toast.error('Error verifying payment. Please try again.');
                                }
                                //         planName: planDetails.name,
                                //         billingCycle: cardDetails.membershipType,
                                //     },
                                // });
                            },
                            modal: {
                                ondismiss: function () {
                                    console.log('Payment cancelled by user');
                                    toast.info('Payment cancelled');
                                    setProcessing(false);
                                }
                            }
                        };

                        console.log('Opening Razorpay checkout with options:', options);

                        // Create and open Razorpay checkout in one step
                        const rzp1 = new window.Razorpay(options);
                        rzp1.open();
                    } catch (error) {
                        console.error('Error with Razorpay checkout:', error);
                        toast.error(`Payment error: ${error.message}`);
                        setProcessing(false);
                    }
                } else {
                    toast.error("Failed to create subscription. Please try again.");
                    setProcessing(false);
                }
            } else {
                // Regular payment flow - open Razorpay popup
                //initializeRazorpayPayment(orderResponse.data);
            }
        } catch (error) {
            console.error("Error processing payment:", error);
            toast.error("Error processing payment: " + (error.response?.data?.message || error.message));
            setButtonLoading(false);
        }
    };




    // useEffect(() => {
    //     const checkSubscriptionStatus = async () => {
    //         // Check if we're returning from a subscription authorization
    //         const pendingSubscription = localStorage.getItem('pendingSubscription');
    //         const params = new URLSearchParams(window.location.search);
    //         const razorpayPaymentId = params.get('razorpay_payment_id');
    //         const razorpaySignature = params.get('razorpay_signature');

    //         if (pendingSubscription && (razorpayPaymentId || params.get('error_code'))) {
    //             const subscriptionData = JSON.parse(pendingSubscription);

    //             // Clear the pending subscription data
    //             localStorage.removeItem('pendingSubscription');

    //             // If we have a payment ID, verify the payment
    //             if (razorpayPaymentId && razorpaySignature) {
    //                 try {
    //                     toast.loading("Verifying subscription...");

    //                     const verificationResponse = await axios.post(
    //                         `${process.env.REACT_APP_API_URL}/payment/verify-subscription`, 
    //                         {
    //                             razorpay_payment_id: razorpayPaymentId,
    //                             razorpay_subscription_id: subscriptionData.subscriptionId,
    //                             razorpay_signature: razorpaySignature,
    //                             ownerId: subscriptionData.ownerId,
    //                             tenantId: subscriptionData.tenantId,
    //                             planId: subscriptionData.planId,
    //                             membershipType: subscriptionData.membershipType
    //                         }
    //                     );

    //                     toast.dismiss();

    //                     if (verificationResponse.data.status === "success") {
    //                         toast.success("Subscription successfully activated!");

    //                         // Navigate based on upgrade status
    //                         if (isUpgrading) {
    //                             navigate("/account-settings/subscription");
    //                         } else {
    //                             navigate("/home");
    //                         }
    //                     } else {
    //                         toast.error("Subscription verification failed. Please contact support.");
    //                     }
    //                 } catch (error) {
    //                     console.error("Error verifying subscription:", error);
    //                     toast.error("Failed to verify subscription. Please contact support.");
    //                 }
    //             } else if (params.get('error_code')) {
    //                 // Handle payment failure
    //                 toast.error(`Payment failed: ${params.get('error_description') || 'Unknown error'}`);
    //             }
    //         }
    //     };

    //     checkSubscriptionStatus();
    // }, [isUpgrading, navigate]); // Added isUpgrading and navigate to dependency array


    return (
        <>
            

            <div
                className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50 pt-4"
            >
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                />

                {processing ? (
                    <Loading message="Processing your Home..." />
                ) : (
                    <form
                        className="bg-white border border-gray-300 rounded-md flex flex-col mb-4 justify-center p-4 sm:p-4 md:p-4 lg:p-8 w-full max-w-lg sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl h-auto"
                        onSubmit={handleSubmit}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-xl sm:text-lg md:text-xl font-semibold">Upgrade to a Basic Membership</h2>
                            <XCircle
                                onClick={() => navigate("/subscription-plans")}
                                className="h-7 w-7"
                            />
                        </div>
                        <p className="text-gray-500 text-md mb-2 sm:text-sm md:text-md">
                            Get all access and an extra 20% off when you subscribe annually
                        </p>

                        <div className="w-full flex gap-6 flex-col sm:flex-col md:flex-row lg:flex-row xl:flex-row 2xl:flex-row sm:gap-4 md:gap-6">
                            <div className="w-full md:w-7/12 lg:w-8/12 sm:w-full">
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                                    <h3 className="text-lg sm:text-base font-medium text-custom-blue mb-2">Secure Payment</h3>
                                    <p className="text-custom-blue text-sm sm:text-xs">
                                        Your payment information will be securely collected by Razorpay's payment form. No card details are stored on our servers.
                                    </p>
                                    <div className="mt-3 flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-custom-blue mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        <span className="text-custom-blue text-sm sm:text-xs">Your payment is protected with industry-standard encryption</span>
                                    </div>
                                    <div className="mt-3 flex justify-center gap-2 sm:gap-1">
                                        <img alt="VisaCard" className="h-8 w-12 sm:h-5 sm:w-8 md:h-8 md:w-12 mx-1" src="https://img.icons8.com/?size=100&id=13608&format=png&color=000000" />
                                        <img alt="MasterCard" className="h-8 w-12 sm:h-5 sm:w-8 md:h-8 md:w-12 mx-1" src="https://i.pinimg.com/736x/56/fd/48/56fd486a48ff235156b8773c238f8da9.jpg" />
                                        <img alt="Razorpay" className="h-8 w-12 sm:h-5 sm:w-8 md:h-8 md:w-12 mx-1" src="https://razorpay.com/assets/razorpay-logo.svg" />
                                    </div>
                                </div>
                                <div className="mt-6 mb-4 flex flex-col">
                                    <span className="font-semibold text-lg sm:text-base">
                                        {cardDetails.membershipType === "monthly"
                                            ? `$${(pricePerMember.monthly - planDetails.monthDiscount || Math.round(pricePerMember.monthly))} / Month / User`
                                            : `$${(pricePerMember.annually - planDetails.annualDiscount || Math.round(pricePerMember.annually))} / Annual / User`}
                                    </span>
                                    <span className="text-custom-blue text-sm sm:text-xs">Details</span>
                                </div>
                            </div>

                            <div className="w-full md:w-5/12 lg:w-4/12 sm:w-full">
                                <label className="block mb-1 text-lg font-medium text-gray-500 sm:text-base">
                                    Membership Type
                                </label>

                                <div className="flex flex-col gap-4 mb-4">
                                    <div
                                        className={`border p-2 flex items-center gap-2 rounded-md bg-gray-50
                                            ${cardDetails.membershipType === "monthly" ? "border-[#217989]" : "border-gray-300"}
                                             sm:gap-2 md:gap-4`}
                                        onClick={() => handleMembershipChange("monthly", setCardDetails, pricePerMember, planDetails, setTotalPaid)}
                                    >
                                        <input
                                            type="radio"
                                            name="membershipType"
                                            value="monthly"
                                            checked={cardDetails.membershipType === "monthly"}
                                            readOnly
                                            className="mr-1 h-4 w-4 sm:h-3 sm:w-3"
                                        />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold">Pay Monthly</span>
                                            <span className="text-sm font-medium">
                                                ${pricePerMember.monthly} / Month Per {planDetails.user?.userType === "individual" ? "Member" : "Organization"}
                                            </span>
                                        </div>
                                    </div>

                                    <div
                                        className={`border p-2 flex justify-between items-center gap-4 rounded-md bg-gray-50
                                            ${cardDetails.membershipType === "annual" ? "border-[#217989]" : "border-gray-300"}
                                             sm:gap-2 md:gap-4`}
                                        onClick={() => handleMembershipChange("annual", setCardDetails, pricePerMember, planDetails, setTotalPaid)}
                                    >
                                        <div className='flex items-center sm:gap-2 md:gap-4'>
                                            <input
                                                type="radio"
                                                name="membershipType"
                                                value="annual"
                                                checked={cardDetails.membershipType === "annual"}
                                                readOnly
                                                className="mr-1 h-4 w-4 sm:h-3 sm:w-3"
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold">Pay Annually</span>
                                                <span className="text-sm font-medium">
                                                    ${Math.round(pricePerMember.annually / 12)} / Month Per {planDetails.user?.userType === "individual" ? "Member" : "Organization"}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-sm font-semibold">{planDetails.annualBadge}</span>
                                        </div>
                                    </div>
                                </div>

                                {errors.membershipType && (
                                    <p className="text-red-500 text-sm pt-1">{errors.membershipType}</p>
                                )}

                                <p className="text-xs md:text-sm text-gray-500 mt-4 m-2">
                                    By continuing, <span className="text-[#217989]">you agree to our terms and conditions</span>.
                                </p>
                                <button
                                    type="submit"
                                    className={`w-full p-3 sm:p-2 bg-[#217989] text-[#C7EBF2] font-medium rounded-lg ${buttonLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                                    disabled={buttonLoading}
                                >
                                    {buttonLoading ? "Processing..." : "Pay"}
                                </button>
                            </div>
                        </div>
                    </form>
                )}
            </div>

        </>
    );
};

export default CardDetails;