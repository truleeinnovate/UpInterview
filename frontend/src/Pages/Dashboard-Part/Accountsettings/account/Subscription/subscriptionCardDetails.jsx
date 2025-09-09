// v1.0.0 - Ashok - fixed z-index issue subscription popup using createPortal
// v1.0.1 - Ashok - changed logo url from local to cloud storage url

import { XCircle } from "lucide-react";
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { handleMembershipChange } from "../../../../../utils/PaymentpageValidations.js";
//import { useCustomContext } from "../../../Context/Contextfetch";
import { useSubscription } from "../../../../../apiHooks/useSubscription";

import { useUserProfile } from "../../../../../apiHooks/useUsers.js";

// import logo from "../../../../../Pages/Dashboard-Part/Images/upinterviewLogo.webp";
// v1.0.0 <---------------------------------------------------------------
import { createPortal } from "react-dom";
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
      console.log("Razorpay script loaded successfully");
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
  console.log("card details");

  const {
    subscriptionData,
    ownerId,
    tenantId,
    userType,
    createSubscription,
    verifySubscriptionPayment,
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

  const navigate = useNavigate();

  const [totalPaid, setTotalPaid] = useState(0);

  const [errors, setErrors] = useState({});
  const planDetails = useMemo(
    () => location.state?.plan || {},
    [location.state]
  );
  console.log("planDetails", planDetails);
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
          console.log("User profile fetched:", userProfile);
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

      console.log("Setting up plan details:", { monthly, annual, planDetails });

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

      // Calculate the initial total using the same logic as updateTotalPaid
      const price = defaultMembershipType === "annual" ? annual : monthly;
      const discount =
        defaultMembershipType === "annual"
          ? parseFloat(planDetails.annualDiscount) || 0
          : parseFloat(
              planDetails.monthDiscount ?? planDetails.monthlyDiscount
            ) || 0;

      const initialTotal = Math.max(0, price - discount);
      console.log("Initial total calculation:", {
        price,
        discount,
        initialTotal,
      });

      setTotalPaid(initialTotal.toFixed(2));
    }
  }, [ownerId, planDetails, tenantId, userType]);

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
      console.log("Creating order with amount:", amountToCharge, "INR");

      // Create order data object
      const orderData = {
        planDetails: {
          ...planDetails,
          // Ensure prices are numbers
          monthlyPrice: parseFloat(planDetails.monthlyPrice) || 0,
          annualPrice: parseFloat(planDetails.annualPrice) || 0,
          monthDiscount: parseFloat(planDetails.monthDiscount) || 0,
          annualDiscount: parseFloat(planDetails.annualDiscount) || 0,
          razorpayPlanIds: planDetails.razorpayPlanIds || {},
        },
        ownerId,
        tenantId,
        planId: planDetails.planId || planDetails._id || "",
        membershipType: cardDetails.membershipType,
        userProfile,
        // Send the amount in INR
        amount: amountToCharge,
        currency: "INR",
        autoRenew: true, // Always set to true since we're only using subscriptions
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

      console.log("Sending order to backend:", {
        amount: amountToCharge,
        currency: "INR",
        membershipType: cardDetails.membershipType,
        planId: orderData.planId,
        autoRenew: true,
      });

      // Create Razorpay subscription/order via hook mutation
      const orderResponse = await createSubscription(orderData);

      console.log("Order response:", orderResponse);

      // Check if this is a subscription or one-time payment
      if (orderResponse.isSubscription) {
        console.log("Processing subscription response:", orderResponse);

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
            console.log("Order amount from backend:", orderResponse.amount);
            const options = {
              key: orderResponse.razorpayKeyId,
              subscription_id: orderResponse.subscriptionId,
              order_id: orderResponse.orderId,
              // Don't include amount here as it's already in the order
              // amount: orderResponse.data.amount,
              currency: "INR", //orderResponse.data.currency ||
              name: "UpInterview",
              description: `${cardDetails.membershipType} Subscription for ${
                planDetails.name
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
                    invoiceId:
                      planDetails.invoiceId || subscriptionData?.invoiceId, // Include the invoiceId passed from SubscriptionPlan.jsx or fallback from subscription
                  };

                  // Log to verify invoiceId is included
                  console.log(
                    "Including invoiceId in verification data:",
                    planDetails.invoiceId
                  );

                  console.log("Sending verification data:", verificationData);

                  // Verify payment with backend via hook mutation
                  const verifyResponse = await verifySubscriptionPayment(
                    verificationData
                  );

                  console.log("Payment verification response:", verifyResponse);

                  if (
                    verifyResponse.status === "paid" ||
                    verifyResponse.status === "success" ||
                    verifyResponse.message?.toLowerCase().includes("success")
                  ) {
                    toast.success("Payment successfully completed!");

                    // Navigate to success page
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

                    axios
                      .post(
                        `${process.env.REACT_APP_API_URL}/emails/send-signup-email`,
                        {
                          tenantId: tenantId,
                          ownerId: ownerId,
                        }
                      )
                      .catch((err) => console.error("Email error:", err));
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
                  console.log("Payment cancelled by user");
                  toast.info("Payment cancelled");
                  setProcessing(false);
                },
              },
            };

            console.log("Opening Razorpay checkout with options:", options);

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
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50  pt-4">
      {/* Add ToastContainer to display toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />

      {processing ? (
        <SubscriptionCardDetailsSkeleton />
      ) : (
        // v1.0.2 <---------------------------------------------------------------------------------------------------
        <form
          className="relative w-[70%] sm:w-[90%] sm:h-[90%] md:h-[90%] md:w-[70%] flex flex-col mb-4 sm:justify-normal md:justify-normal lg:justify-normal justify-center h-[70%] p-5 bg-white border border-gray-300 rounded-md sm:overflow-y-auto md:overflow-y-auto"
          onSubmit={handleSubmit}
        >
          <div className="flex items-center justify-between">
            <h2 className="sm:text-lg md:text-lg lg:text-xl xl:text-xl 2xl:text-xl font-semibold mb-2">
              {`Upgrade to a ${planDetails.name} ${
                cardDetails.membershipType === "monthly" ? "Monthly" : "Annual"
              } Membership`}
            </h2>
            <button
            className="absolute sm:top-2 sm:right-2 top-4 right-6"
            onClick={() => navigate("/account-settings/subscription")}>
              <XCircle className="h-7 w-7" />
            </button>
          </div>
          <p className="text-gray-500  text-md mb-2">
            Get all access and an extra 20% off when you subscribe annually
          </p>

          <div className="w-full flex sm:flex-col md:flex-col gap-6">
            <div className="w-9/12 sm:w-full md:w-full">
              <div className="bg-blue-50 p-4 mb-4 rounded-lg border border-blue-200">
                <h3 className="text-lg font-medium text-blue-800 mb-2">
                  Secure Payment
                </h3>
                <p className="text-blue-600">
                  Your payment information will be securely collected by
                  Razorpay's payment form. No card details are stored on our
                  servers.
                </p>

                <div className="mt-3 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-500 mr-2"
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
                  <span className="text-blue-600">
                    Your payment is protected with industry-standard encryption
                  </span>
                </div>

                <div className="mt-3 flex justify-center">
                  <img
                    alt="VisaCard"
                    className="h-8 mx-1"
                    src="https://img.icons8.com/?size=100&id=13608&format=png&color=000000"
                  />
                  <img
                    alt="MasterCard"
                    className="h-8 mx-1"
                    src="https://i.pinimg.com/736x/56/fd/48/56fd486a48ff235156b8773c238f8da9.jpg"
                  />
                  <img
                    alt="Razorpay"
                    className="h-8 mx-1"
                    src="https://razorpay.com/assets/razorpay-logo.svg"
                  />
                </div>
              </div>

              <div className="mt-6 mb-4 flex flex-col">
                <span className="font-semibold text-lg">
                  {" "}
                  {cardDetails.membershipType === "monthly"
                    ? `$${
                        pricePerMember.monthly - planDetails.monthDiscount ||
                        Math.round(pricePerMember.monthly)
                      } / Month / User`
                    : `$${
                        pricePerMember.annually - planDetails.annualDiscount ||
                        Math.round(pricePerMember.annually)
                      } / Annual / User`}
                </span>

                <span className="text-blue-400">Details</span>
              </div>
            </div>

            <div className="sm:w-full md:w-full w-1/2">
              {/* Membership Type */}
              <label className="block mb-1  text-lg font-medium text-gray-500">
                Membership Type
              </label>

              <div className="flex flex-col gap-4   mb-4">
                <div
                  className={`border p-2 flex items-center gap-2 rounded-md bg-gray-50
                                     ${
                                       cardDetails.membershipType === "monthly"
                                         ? "border-[#217989]"
                                         : "border-gray-300"
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
                    <span className="text-sm font-medium">
                      {" "}
                      ${pricePerMember.monthly} / Month Per{" "}
                      {planDetails.user?.userType === "individual"
                        ? "Member"
                        : "Organization"}
                    </span>
                  </div>
                </div>

                <div
                  className={`border p-2 flex justify-between items-center gap-4 rounded-md bg-gray-50 
                ${
                  cardDetails.membershipType === "annual"
                    ? "border-[#217989]"
                    : "border-gray-300"
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
                  <div className="flex gap-2  items-center">
                    <input
                      type="radio"
                      name="membershipType"
                      value="annual"
                      checked={cardDetails.membershipType === "annual"}
                      readOnly
                      className="mr-1 h-4 w-5"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">
                        Pay Annually
                      </span>
                      <span className="text-sm font-medium">
                        {" "}
                        ${Math.round(pricePerMember.annually / 12)} / Month Per{" "}
                        {planDetails.user?.userType === "individual"
                          ? "Member"
                          : "Organization"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-semibold">
                      {planDetails.annualBadge}
                    </span>
                  </div>
                </div>
              </div>

              {/* Add-on */}
              {/* <label className="block mb-1 text-lg font-medium text-gray-700">
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


                        </div> */}

              {errors.membershipType && (
                <p className="text-red-500 text-sm pt-1">
                  {errors.membershipType}
                </p>
              )}

              {/* Submit */}

              <p className="text-xs md:text-sm text-gray-500 mt-4 m-2">
                By continuing,{" "}
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
        // v1.0.2 --------------------------------------------------------------------------------------------------->
      )}
      {/* v1.0.0 <-------------------------------------------------------------------------------------- */}
    </div>,
    document.body
    // v1.0.0 --------------------------------------------------------------------------------------->
  );
};

export default SubscriptionCardDetails;
