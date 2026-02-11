// v1.0.0 - Ashok - fixed z-index issue subscription popup using createPortal
// v1.0.1 - Ashok - changed logo url from local to cloud storage url

import { XCircle } from "lucide-react";
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { handleMembershipChange } from "../../../../../utils/PaymentpageValidations.js";
import { useSubscription } from "../../../../../apiHooks/useSubscription";

import { useUserProfile } from "../../../../../apiHooks/useUsers.js";

// import logo from "../../../../../Pages/Dashboard-Part/Images/upinterviewLogo.webp";
// v1.0.0 <---------------------------------------------------------------
import { createPortal } from "react-dom";
import Loading from "../../../../../Components/Loading.js";
import { notify } from "../../../../../services/toastService.js";
// v1.0.0 --------------------------------------------------------------->

// Loading Skeleton for Subscription Card Details
const SubscriptionCardDetailsSkeleton = () => {
  return (
    <div className="w-[70%] sm:w-[90%] md:w-[70%] flex flex-col mb-4 justify-center h-[70%] p-5 bg-white border border-gray-300 rounded-md">
      <div className="skeleton-animation">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 bg-gray-200 rounded w-48"></div>
          <div className="h-7 w-7 bg-gray-200 rounded"></div>
        </div>

        {/* Description skeleton */}
        <div className="h-4 bg-gray-200 rounded w-80 mb-6"></div>

        {/* Content skeleton */}
        <div className="w-full flex gap-6">
          <div className="w-9/12 md:w-7/12 sm:w-6/12">
            {/* Secure payment section skeleton */}
            <div className="bg-blue-50 p-4 mb-4 rounded-lg border border-blue-200">
              <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>

            {/* Price section skeleton */}
            <div className="mt-6 mb-4">
              <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          </div>

          <div className="w-1/2">
            {/* Membership type skeleton */}
            <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="space-y-4">
              {[1, 2].map((item) => (
                <div key={item} className="border p-2 rounded-md bg-gray-50">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-gray-200 rounded"></div>
                    <div className="space-y-1">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Button skeleton */}
            <div className="mt-6">
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Simple function to load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      // console.log("Razorpay script loaded successfully");
      resolve(true);
    };
    script.onerror = () => {
      console.error("Failed to load Razorpay script");
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

const SubscriptionCardDetails = () => {
  // console.log("card details");

  const {
    subscriptionData,
    ownerId,
    tenantId,
    userType,
    createSubscription,
    verifySubscriptionPayment,
    refetchSubscription,
    forceRefreshSubscription,
  } = useSubscription();

  const location = useLocation();
  const isUpgrading = location.state?.isUpgrading || false;
  // const {
  //     userProfile,
  // } = useCustomContext();

  const [cardDetails, setCardDetails] = useState({
    membershipType: "",
    addOn: "",
    autoRenew: true, // Default to auto-renewal enabled
  });

  const [processing, setProcessing] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  // Payment method state: "card", "upi", or "emandate" (Net Banking)
  const [paymentMethod, setPaymentMethod] = useState("card");

  const navigate = useNavigate();

  const [totalPaid, setTotalPaid] = useState(0);

  const [errors, setErrors] = useState({});
  const planDetails = useMemo(
    () => location.state?.plan || {},
    [location.state]
  );
  // console.log("planDetails", planDetails);
  const [pricePerMember, setPricePerMember] = useState({
    monthly: 0,
    annually: 0,
  });

  const { userProfile } = useUserProfile(ownerId);
  const [userProfileData, setUserProfile] = useState([]);

  // Fetch user profile data from contacts API
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (userProfile) {
          setUserProfile({
            name: `${userProfile.firstName} ${userProfile.lastName}`,
            email: userProfile.email,
            phone: userProfile.phone,
          });
          // console.log("User profile fetched:", userProfile);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("Failed to fetch user profile data");
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

      // console.log("Setting up plan details:", { monthly, annual, planDetails });

      // Set monthly and annual prices dynamically
      setPricePerMember({
        monthly: monthly,
        annually: annual,
      });

      // Default selection logic
      const defaultMembershipType =
        planDetails.billingCycle === "annual" ? "annual" : "monthly";

      // Update card details with membership type and user info
      setCardDetails((prevData) => ({
        ...prevData,
        membershipType: defaultMembershipType,
        tenantId: tenantId || "",
        ownerId: ownerId || "",
        userType: userType || planDetails.user?.userType || "",
      }));

      // Calculate the initial total - NO discount applied (fixed at 0)
      const price = defaultMembershipType === "annual" ? annual : monthly;
      const initialTotal = Math.max(0, price);
      // console.log("Initial total calculation (no discount):", {
      //   price,
      //   discount: 0, // Fixed at 0 for now
      //   initialTotal,
      // });

      setTotalPaid(initialTotal.toFixed(2));
    }
  }, [ownerId, planDetails, tenantId, userType]);

  // Get available payment methods based on subscription amount
  // UPI Autopay: max ₹5,000 (RBI limit)
  // eMandate (Net Banking): up to ₹10 lakh, AFA required for > ₹15,000
  // Card: No limit
  const getAvailablePaymentMethods = () => {
    const amount = parseFloat(totalPaid);
    return [
      {
        id: "card",
        name: "Credit/Debit Card",
        available: true,
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        ),
        subtitle: "Visa, Mastercard, RuPay"
      },
      {
        id: "upi",
        name: "UPI Autopay",
        available: amount <= 5000,
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        ),
        subtitle: "GPay, PhonePe, Paytm",
        limit: "Max ₹5,000"
      },
      {
        id: "emandate",
        name: "Net Banking",
        available: true,
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        ),
        subtitle: "eMandate via Bank",
        note: amount > 15000 ? "OTP required" : null
      },
    ];
  };

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
        toast.error("Payment gateway failed to load. Please try again.");
        setButtonLoading(false);
        return;
      }

      // No need to update card details as we're not collecting them anymore

      // Ensure totalAmount is a valid number and properly formatted
      const amountToCharge = parseFloat(totalPaid) || 0;
      // console.log("Creating order with amount:", amountToCharge, "INR");
      // console.log("Discount values - Fixed at 0 for both monthly and annual");

      // Create order data object
      const orderData = {
        planDetails: {
          ...planDetails,
          // Ensure prices are numbers
          monthlyPrice: parseFloat(planDetails.monthlyPrice) || 0,
          annualPrice: parseFloat(planDetails.annualPrice) || 0,
          monthDiscount: 0, // Fixed at 0 for now
          annualDiscount: 0, // Fixed at 0 for now 
          razorpayPlanIds: planDetails.razorpayPlanIds || {},
        },
        ownerId,
        tenantId,
        planId: planDetails.planId || planDetails._id || "",
        membershipType: cardDetails.membershipType,
        userProfile,
        amount: amountToCharge,
        currency: "INR",
        autoRenew: true, // Always set to true since we're only using subscriptions
        // Payment method selected by user: "card", "upi", or "emandate"
        paymentMethod: paymentMethod,
        // Additional metadata for better tracking
        metadata: {
          billingCycle: cardDetails.membershipType,
          ownerId: ownerId,
          tenantId: tenantId,
          planId: planDetails.planId || planDetails._id || "",
          planName: planDetails.name || "Subscription Plan",
          autoRenew: cardDetails.autoRenew,
          // Include Razorpay plan ID for the selected billing cycle if available
          razorpayPlanId:
            (planDetails.razorpayPlanIds &&
              planDetails.razorpayPlanIds[cardDetails.membershipType]) ||
            "",
          timestamp: new Date().toISOString(),
        },
      };

      // console.log("Sending order to backend:", {
      //   amount: amountToCharge,
      //   currency: "INR",
      //   membershipType: cardDetails.membershipType,
      //   planId: orderData.planId,
      //   autoRenew: true,
      // });

      // Create Razorpay subscription/order via hook mutation
      const orderResponse = await createSubscription(orderData);

      // console.log("Order response:", orderResponse);

      // Check if this is a subscription or one-time payment
      if (orderResponse.isSubscription) {
        // console.log("Processing subscription response:", orderResponse);

        // Save subscription info for confirmation later
        localStorage.setItem(
          "pendingSubscription",
          JSON.stringify({
            subscriptionId: orderResponse.subscriptionId,
            planId: planDetails.planId || planDetails._id || "",
            membershipType: cardDetails.membershipType,
            ownerId,
            tenantId,
            autoRenew: cardDetails.autoRenew,
          })
        );

        if (orderResponse.orderId) {
          try {
            // First, make sure the Razorpay script is loaded
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
              throw new Error("Failed to load Razorpay script");
            }

            // Prepare options for Razorpay checkout
            // Make sure amount is exactly the same as in the order (no modifications)
            // console.log("Order amount from backend:", orderResponse.amount);
            const options = {
              key: orderResponse.razorpayKeyId,
              subscription_id: orderResponse.subscriptionId,
              order_id: orderResponse.orderId,
              // Don't include amount here as it's already in the order
              // amount: orderResponse.data.amount,
              currency: "INR", //orderResponse.data.currency ||
              name: "UpInterview",
              description: `${cardDetails.membershipType} Subscription for ${planDetails.name
                } - ₹${(orderResponse.amount / 100).toFixed(2)}`,
              // v1.0.1 <----------------------------------------------------------------------------------------
              // image: logo,
              image:
                "https://res.cloudinary.com/dnlrzixy8/image/upload/v1756099243/upinterviewLogo_ng1wit.webp",
              // v1.0.1 ---------------------------------------------------------------------------------------->
              prefill: {
                name: userProfileData?.name || "",
                email: userProfileData?.email || "",
                contact: userProfileData?.phone || "",
              },
              notes: {
                ownerId: ownerId,
                planId: planDetails._id,
                membershipType: cardDetails.membershipType,
                paymentMethod: paymentMethod, // Track selected payment method
              },
              theme: {
                color: "#3399cc",
              },
              // Payment method configuration for subscriptions
              // Note: Razorpay subscriptions only support Card and eMandate (Nach) for recurring payments
              // UPI Autopay requires special enablement and works differently
              method: paymentMethod === "card"
                ? {
                  card: true,
                  upi: false,
                  netbanking: false,
                  emandate: false,
                  wallet: false,
                  emi: false,
                  paylater: false,
                }
                : paymentMethod === "emandate"
                  ? {
                    card: false,
                    upi: false,
                    netbanking: true,
                    emandate: true,
                    wallet: false,
                    emi: false,
                    paylater: false,
                  }
                  : {
                    // For UPI - enable both UPI and Card as fallback (UPI may not be available for subscriptions)
                    card: true,
                    upi: true,
                    netbanking: false,
                    emandate: false,
                    wallet: false,
                    emi: false,
                    paylater: false,
                  },
              handler: async function (response) {
                try {
                  // Handle successful payment
                  // console.log("Payment successful:", response);
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
                    invoiceId:
                      planDetails.invoiceId || subscriptionData?.invoiceId, // Include the invoiceId passed from SubscriptionPlan.jsx or fallback from subscription
                  };

                  // Log to verify invoiceId is included
                  // console.log(
                  //   "Including invoiceId in verification data:",
                  //   planDetails.invoiceId
                  // );

                  // console.log("Sending verification data:", verificationData);

                  // Verify payment with backend via hook mutation
                  const verifyResponse = await verifySubscriptionPayment(
                    verificationData
                  );

                  // console.log("Payment verification response:", verifyResponse);

                  if (
                    verifyResponse.status === "paid" ||
                    verifyResponse.status === "success" ||
                    verifyResponse.message?.toLowerCase().includes("success")
                  ) {

                    // 1) Add a small delay to ensure backend has processed the payment
                    await new Promise(r => setTimeout(r, 1000));

                    // 2) Force refresh with complete cache invalidation
                    try {
                      // Use forceRefreshSubscription to completely bypass cache
                      const result = await forceRefreshSubscription();
                      // console.log('Initial force refresh result:', result);
                    } catch (e) {
                      console.warn('Initial force refresh failed:', e?.message);
                    }

                    // 3) Wait for webhook completion (ACTIVE + receipt/invoice), up to 60s
                    try {
                      const timeoutMs = 60000; // max wait 60s
                      const pollMs = 2000; // poll every 2s
                      const start = Date.now();
                      let isReady = false;
                      let attempts = 0;

                      while (Date.now() - start < timeoutMs) {
                        attempts++;
                        // console.log(`Polling attempt ${attempts}...`);

                        // Force complete cache refresh each time
                        const result = await forceRefreshSubscription();
                        const fresh = result?.data || result;

                        // console.log('Subscription status:', fresh?.status);
                        // console.log('Has receipt/invoice:', !!(fresh?.receiptId || fresh?.invoiceId));
                        // console.log('Full subscription data:', fresh);

                        const isActive = (fresh?.status || '').toLowerCase() === 'active';
                        const hasDocs = !!(fresh?.receiptId || fresh?.invoiceId);

                        if (isActive && hasDocs) {
                          isReady = true;
                          // console.log('Subscription is ready with active status and documents!');
                          break;
                        }

                        // Wait before next poll
                        await new Promise(r => setTimeout(r, pollMs));
                      }

                      if (!isReady) {
                        const latestData = await forceRefreshSubscription();
                        console.warn('Webhook not confirmed within timeout. Current subscription data:', latestData);
                      }
                    } catch (e) {
                      console.warn('Error while waiting for webhook completion:', e?.message);
                    }

                    // 4) Final force refresh before navigation to ensure latest data
                    try {
                      await forceRefreshSubscription();
                      // console.log('Final force refresh completed before navigation');
                    } catch (e) {
                      console.warn('Final force refresh failed:', e?.message);
                    }

                    // 3) Navigate to success page after webhook wait
                    navigate("/subscription-success", {
                      state: {
                        paymentId: response.razorpay_payment_id,
                        subscriptionId: orderResponse.subscriptionId,
                        orderId: response.razorpay_order_id,
                        isUpgrading: isUpgrading,
                        planName: planDetails.name,
                        membershipType: cardDetails.membershipType,
                        nextRoute: isUpgrading
                          ? "/SubscriptionDetails"
                          : "/account-settings/subscription",
                      },
                    });

                    notify.success("Payment successfully completed!");
                    setProcessing(false);

                    // axios
                    //   .post(
                    //     `${process.env.REACT_APP_API_URL}/emails/send-signup-email`,
                    //     {
                    //       tenantId: tenantId,
                    //       ownerId: ownerId,
                    //     }
                    //   )
                    //   .catch((err) => console.error("Email error:", err));
                    await axios.post(
                      `${process.env.REACT_APP_API_URL}/emails/subscription/paid`,
                      {
                        ownerId,
                        tenantId,

                        // ccEmail: "shaikmansoor1200@gmail.com",
                      }
                    );
                  } else {
                    setProcessing(false);
                    toast.error("Payment verification failed");
                  }
                } catch (error) {
                  console.error("Error verifying payment:", error);
                  setProcessing(false);
                  toast.error("Error verifying payment. Please try again.");
                }
                //         planName: planDetails.name,
                //         billingCycle: cardDetails.membershipType,
                //     },
                // });
              },
              modal: {
                ondismiss: function () {
                  // console.log("Payment cancelled by user");
                  toast.info("Payment cancelled");
                  setProcessing(false);
                },
              },
            };

            // console.log("Opening Razorpay checkout with options:", options);

            // Create and open Razorpay checkout in one step
            const rzp1 = new window.Razorpay(options);
            rzp1.open();
          } catch (error) {
            console.error("Error with Razorpay checkout:", error);
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
      toast.error(
        "Error processing payment: " +
        (error.response?.data?.message || error.message)
      );
      setButtonLoading(false);
    }
  };

  // v1.0.0 <---------------------------------------------------------
  return createPortal(
    // v1.0.0 --------------------------------------------------------->
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50 p-4">
      {/* Add ToastContainer to display toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />

      {processing ? (
        <Loading message="Processing your payment..." />
      ) : (
        // v1.0.2 <---------------------------------------------------------------------------------------------------
        <form
          className="relative w-full max-w-4xl flex flex-col bg-white border border-gray-300 rounded-lg shadow-lg overflow-y-auto"
          style={{ maxHeight: "90vh" }}
          onSubmit={handleSubmit}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white z-10 px-6 pt-5 pb-3 border-b border-gray-100">
            <div className="flex items-start justify-between">
              <div className="pr-8">
                <h2 className="text-lg lg:text-xl font-semibold text-gray-800">
                  {`Upgrade to a ${planDetails.name} ${cardDetails.membershipType === "monthly" ? "Monthly" : "Annual"
                    } Membership`}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Get all access and an extra 20% off when you subscribe annually
                </p>
              </div>
              <button
                type="button"
                className="flex-shrink-0"
                onClick={() => navigate("/account-settings/subscription")}>
                <XCircle className="h-6 w-6 text-gray-400 hover:text-gray-600 transition-colors" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="px-6 py-5 flex sm:flex-col flex-row gap-6">
            {/* Left Column - Secure Payment Info */}
            <div className="sm:w-full w-1/2">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="text-lg font-medium text-custom-blue mb-2">
                  Secure Payment
                </h3>
                <p className="text-sm text-custom-blue">
                  Your payment information will be securely collected by
                  Razorpay's payment form. No card details are stored on our
                  servers.
                </p>

                <div className="mt-3 flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-custom-blue flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span className="text-sm text-custom-blue">
                    Your payment is protected with industry-standard encryption
                  </span>
                </div>

                <div className="mt-4 flex justify-center gap-2">
                  <img
                    alt="VisaCard"
                    className="h-8"
                    src="https://img.icons8.com/?size=100&id=13608&format=png&color=000000"
                  />
                  <img
                    alt="MasterCard"
                    className="h-8"
                    src="https://i.pinimg.com/736x/56/fd/48/56fd486a48ff235156b8773c238f8da9.jpg"
                  />
                  <img
                    alt="Razorpay"
                    className="h-8"
                    src="https://razorpay.com/assets/razorpay-logo.svg"
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-col">
                <span className="font-semibold text-lg text-gray-800">
                  {cardDetails.membershipType === "monthly"
                    ? `₹${Math.round(pricePerMember.monthly)} / Month / User`
                    : `₹${Math.round(pricePerMember.annually)} / Annual / User`}
                </span>
                <span className="text-blue-400 text-sm cursor-pointer">Details</span>
              </div>
            </div>

            {/* Right Column - Membership & Payment */}
            <div className="sm:w-full w-1/2">
              {/* Membership Type */}
              <label className="block mb-2 text-base font-medium text-gray-500">
                Membership Type
              </label>

              <div className="flex flex-col gap-3 mb-5">
                <div
                  className={`border p-3 flex items-center gap-3 rounded-lg cursor-pointer transition-all ${cardDetails.membershipType === "monthly"
                    ? "border-[#217989] bg-blue-50"
                    : "border-gray-300 bg-gray-50 hover:border-gray-400"
                    }`}
                  onClick={() =>
                    handleMembershipChange(
                      "monthly",
                      setCardDetails,
                      pricePerMember,
                      planDetails,
                      setTotalPaid
                    )
                  }
                >
                  <input
                    type="radio"
                    name="membershipType"
                    value="monthly"
                    checked={cardDetails.membershipType === "monthly"}
                    readOnly
                    className="h-4 w-4 accent-custom-blue flex-shrink-0"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">Pay Monthly</span>
                    <span className="text-xs text-gray-600">
                      ₹{pricePerMember.monthly} / Month Per{" "}
                      {planDetails.user?.userType === "individual"
                        ? "Member"
                        : "Organization"}
                    </span>
                  </div>
                </div>

                <div
                  className={`border p-3 flex items-center justify-between rounded-lg cursor-pointer transition-all ${cardDetails.membershipType === "annual"
                    ? "border-[#217989] bg-blue-50"
                    : "border-gray-300 bg-gray-50 hover:border-gray-400"
                    }`}
                  onClick={() =>
                    handleMembershipChange(
                      "annual",
                      setCardDetails,
                      pricePerMember,
                      planDetails,
                      setTotalPaid
                    )
                  }
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="membershipType"
                      value="annual"
                      checked={cardDetails.membershipType === "annual"}
                      readOnly
                      className="h-4 w-4 accent-custom-blue flex-shrink-0"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">
                        Pay Annually
                      </span>
                      <span className="text-xs text-gray-600">
                        ₹{Math.round(pricePerMember.annually / 12)} / Month Per{" "}
                        {planDetails.user?.userType === "individual"
                          ? "Member"
                          : "Organization"}
                      </span>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-[#217989] bg-teal-50 px-2 py-1 rounded">
                    {planDetails.annualDiscount}% off
                  </span>
                </div>
              </div>

              {/* Payment Method Selection */}
              <label className="block mb-2 text-base font-medium text-gray-500">
                Payment Method
              </label>
              <div className="flex flex-col gap-2 mb-4">
                {getAvailablePaymentMethods().map((method) => (
                  <div
                    key={method.id}
                    onClick={() => method.available && setPaymentMethod(method.id)}
                    className={`border p-3 rounded-lg cursor-pointer flex items-center justify-between transition-all ${paymentMethod === method.id
                      ? "border-[#217989] bg-blue-50"
                      : method.available
                        ? "border-gray-300 bg-gray-50 hover:border-gray-400"
                        : "border-gray-200 bg-gray-100 cursor-not-allowed opacity-50"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === method.id}
                        disabled={!method.available}
                        readOnly
                        className="accent-custom-blue h-4 w-4 flex-shrink-0"
                      />
                      <div className="flex-shrink-0">{method.icon}</div>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{method.name}</span>
                        <span className="text-xs text-gray-500">{method.subtitle}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      {!method.available && method.limit && (
                        <span className="text-xs text-red-500">{method.limit}</span>
                      )}
                      {method.available && method.note && (
                        <span className="text-xs text-orange-500">{method.note}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {errors.membershipType && (
                <p className="text-red-500 text-sm pt-1">
                  {errors.membershipType}
                </p>
              )}

              {/* Submit */}
              <p className="text-xs text-gray-500 mt-4 mb-3">
                By continuing,{" "}
                <span className="text-[#217989]">
                  you agree to our terms and conditions
                </span>
                .
              </p>
              <button
                type="submit"
                className="w-full p-3 bg-[#217989] text-[#C7EBF2] font-semibold rounded-lg hover:bg-[#1a6170] transition-colors"
                disabled={buttonLoading || processing}
              >
                {buttonLoading ? "Processing..." : "Pay"}
              </button>
            </div>
          </div>
        </form>
        // v1.0.2 --------------------------------------------------------------------------------------------------->
      )}
      {/* v1.0.0 <-------------------------------------------------------------------------------------- */}
    </div>,
    document.body
    // v1.0.0 --------------------------------------------------------------------------------------->
  );
};

export default SubscriptionCardDetails;
