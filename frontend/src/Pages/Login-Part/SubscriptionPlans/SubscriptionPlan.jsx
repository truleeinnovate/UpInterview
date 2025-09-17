import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { config } from '../../../config.js';
import toast from "react-hot-toast";
import { decodeJwt } from '../../../utils/AuthCookieManager/jwtDecode.js';
import Cookies from "js-cookie";
import { useSubscription } from '../../../apiHooks/useSubscription.js';

// Loading Skeleton for Subscription Plans
const SubscriptionPlansSkeleton = () => {
  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-10">
      <div className="skeleton-animation">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {[1, 2, 3].map((plan) => (
            <div
              key={plan}
              className="shadow-lg rounded-3xl bg-white p-6"
              style={{ minHeight: "420px" }}
            >
              {/* Plan header */}
              <div className="flex justify-between items-start mb-4">
                <div className="h-8 bg-gray-200 rounded w-24"></div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>

              {/* Plan features */}
              <div className="flex-grow mt-4 space-y-2">
                {[1, 2, 3, 4, 5].map((feature) => (
                  <div key={feature} className="flex items-start">
                    <div className="h-3 bg-gray-200 rounded w-2 mr-2 mt-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                ))}
              </div>

              {/* Plan price */}
              <div className="mt-6">
                <div className="h-8 bg-gray-200 rounded w-24"></div>
              </div>

              {/* Plan button */}
              <div className="mt-4">
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SubscriptionPlan = () => {
  const authToken = Cookies.get("authToken") || null;
  const [tokenPayload, setTokenPayload] = useState({});
  // subscription data will come from useSubscription()

  const navigate = useNavigate();
  const location = useLocation();
  const isUpgrading = location.state?.isUpgrading || false;
  const { plans, subscriptionData, createCustomerSubscription, isSubscriptionLoading, isPlansLoading } = useSubscription();
  const loading = isSubscriptionLoading || isPlansLoading;
  //console.log("plans ----", plans);
  //console.log("subscriptionData ----", subscriptionData);

  const [isAnnual, setIsAnnual] = useState(false);
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Log lifecycle/auth token changes
  useEffect(() => {
    console.log("🚀 SubscriptionPlan mounted / auth change");
    console.log("Current authToken ----", authToken);
  }, [authToken]);

  // 2. Whenever authToken changes, decode and save payload
  useEffect(() => {
    if (!authToken) {
      console.warn("⚠️ No authToken in cookies yet");
      setTokenPayload({});
    } else {
      const decoded = decodeJwt(authToken);
      console.log("🔎 Decoded Token ----", decoded);
      setTokenPayload(decoded || {});
    }
  }, [authToken]);

  console.log('authToken ----', authToken);
  console.log('tokenPayload ----', tokenPayload);

  const ownerId = tokenPayload?.userId;
  console.log('ownerId 1----', ownerId);
  const organization = tokenPayload?.organization;
  console.log('organization 1----', organization);
  const tenantId = tokenPayload?.tenantId;
  console.log('tenantId 1----', tenantId);

  const [user] = useState({
    userType: organization === true ? "organization" : "individual",
    // tenantId,
    // ownerId,
  });

  const toggleBilling = () => setIsAnnual(!isAnnual);

  const submitPlans = async (plan) => {

    if (!plan) {
      toast.success("No plan is selected");
      return;
    }
    const totalAmount = isAnnual ? plan.annualPrice : plan.monthlyPrice;
    const isFreePlan = (/free/i.test(String(plan?.name)) || ((plan?.monthlyPrice || 0) === 0 && (plan?.annualPrice || 0) === 0));

    const payload = {
      planDetails: {
        subscriptionPlanId: plan.planId,
        monthlyPrice: plan.monthlyPrice,
        annualPrice: plan.annualPrice,
        monthDiscount: plan.monthlyDiscount,
        annualDiscount: plan.annualDiscount,
      },
      userDetails: {
        tenantId,
        ownerId,
        userType: user.userType,
        membershipType: isAnnual ? "annual" : "monthly",
      },
      totalAmount,
      status: user.userType === "individual" && plan.name === "Free" ? "active" : "pending",
    };
    console.log("payload ----", payload);
    try {
      setIsSubmitting(true);
      const subscriptionResponse = await createCustomerSubscription(payload);

      console.log(
        "Payment and Subscription submitted successfully",
        subscriptionResponse
      );
      console.log(organization, plan.name, "organization");
      if (user.userType === "individual" && isFreePlan) {
        // Fire-and-forget emails; do not block navigation
        axios.post(`${config.REACT_APP_API_URL}/emails/subscription/free`, {
          tenantId: tenantId,
          ownerId: ownerId,
        }).catch((err) => console.error('Email error (free):', err));

        axios.post(`${config.REACT_APP_API_URL}/emails/send-signup-email`, {
              tenantId: tenantId,
              ownerId: ownerId,
        }).catch((err) => console.error('Email error (signup):', err));

        // Navigate immediately to home for Free plan
        console.log("Navigating to /home after Free plan activation");
        navigate("/home");
      } else {
        navigate("/payment-details", {
          state: {
            plan: {
              ...plan,
              billingCycle: isAnnual ? "annual" : "monthly",
              user,
              razorpayPlanIds: subscriptionResponse?.razorpayPlanId,
              invoiceId: subscriptionResponse?.invoiceId,
            },
            isUpgrading, // Pass the upgrading flag to next page if needed
          },
        });
      }

    } catch (error) {
      console.error("Error submitting subscription:", error);
    } finally {
      setIsSubmitting(false);
    }

  };

  const isHighlighted = (plan) =>
    hoveredPlan ? hoveredPlan === plan.name : plan.isDefault;

  return (
    <div className="h-full w-full flex justify-center items-center pt-3">
      <div className="flex flex-col sm:px-[7%] px-[15%] md:px-[2%] rounded-lg">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h4 className="text-2xl sm:text-sm font-bold text-custom-blue">
            The Right Plan for {user.userType === "organization" ? "Your Organization" : "You"}
          </h4>
          <p className="text-custom-blue mt-2 sm:text-xs">
            We have several powerful plans to showcase your business and get
            discovered as creative entrepreneurs. Everything you need.
          </p>
        </div>

        {/* Toggle Section */}
        <div className="flex justify-center items-center space-x-2 mb-16">
          <p
            className={`text-custom-blue ${!isAnnual ? "font-semibold text-lg sm:text-sm" : "font-medium sm:text-xs"
              }`}
          >
            Bill Monthly
          </p>
          <div
            onClick={toggleBilling}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${isAnnual ? "bg-[#217989]" : "bg-[#217989]"
              }`}
          >
            <div
              className={`w-4 h-4 rounded-full shadow-md transform transition-all ${isAnnual ? "translate-x-6 bg-yellow-500" : "translate-x-0 bg-yellow-500"
                }`}
            ></div>
          </div>
          <p
            className={`text-[#217989] ${isAnnual ? "font-semibold text-lg sm:text-sm" : "font-medium sm:text-xs"
              }`}
          >
            Bill Annually
          </p>
        </div>

        {/* Plans Section */}
        {loading ? (
          <SubscriptionPlansSkeleton />
        ) : (
        <div className="grid grid-cols-3 sm:grid-cols-1 gap-6 items-stretch sm:mb-5">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`shadow-lg rounded-3xl relative transition-transform duration-300 p-5 h-full flex flex-col ${isHighlighted(plan)
                  ? "-translate-y-2  md:-translate-y-4 lg:-translate-y-6 xl:-translate-y-6 2xl:-translate-y-6 z-10 bg-[#217989] text-white transform scale-[1.02]"
                  : "bg-white text-[#217989] hover:shadow-xl hover:-translate-y-1"
                }`}
              onMouseEnter={() => setHoveredPlan(plan.name)}
              onMouseLeave={() => setHoveredPlan(null)}
            >
              <div className="flex justify-between items-center">

                <h5
                  className={`text-xl sm:text-2xl md:text-3xl font-bold ${isHighlighted(plan) ? "text-white" : "text-[#217989]"
                    }`}
                >
                  {plan.name}
                </h5>
                {isAnnual ? (
                  plan.annualBadge && (
                    <span className="bg-white text-purple-600 font-semibold text-sm py-1 px-2 rounded-md">
                      {plan.annualBadge}
                    </span>
                  )
                ) : (
                  plan.monthlyBadge && (
                    <span className="bg-white text-purple-600 font-semibold text-sm py-1 px-2 rounded-md">
                      {plan.monthlyBadge}
                    </span>
                  )
                )}
              </div>
              <div className="flex-grow mt-4">
              <ul className="space-y-2 text-xs sm:text-sm md:text-base lg:text-lg">
                {plan.features.map((feature, idx) => (
                  
                  <li key={idx} className="flex items-start">
                     <span className="mr-2">•</span>
                     <span>{feature}</span>
                  </li>
                ))}
              </ul>
              </div>
              <div className="mt-auto">
                <p className="text-2xl sm:text-3xl md:text-4xl font-bold mt-4">
                  <span className="text-lg sm:text-xl md:text-2xl">$</span>
                  {isAnnual ? plan.annualPrice : plan.monthlyPrice}
                  <span className="text-lg sm:text-base md:text-lg font-medium"> /{isAnnual ? "annual" : "month"}</span>
                </p>
                <button
                  key={plan._id}
                  onClick={() => submitPlans(plan)}
                  isLoading={subscriptionData.subscriptionPlanId === plan.planId  && isSubmitting}
                  loadingText={subscriptionData.subscriptionPlanId === plan.planId  &&
                    "Processing..."}
                  className={`w-full font-semibold h-11 py-2 mt-4 rounded-lg sm:text-xs
                  ${isHighlighted(plan) ? "bg-white text-custom-blue hover:text-custom-blue " : "text-white bg-custom-blue"}
                  ${subscriptionData.subscriptionPlanId === plan.planId && subscriptionData.status === "active" ? "opacity-50 cursor-not-allowed" : ""}`}
                  disabled={subscriptionData.subscriptionPlanId === plan.planId && subscriptionData.status === "active"}
                >
                  {subscriptionData.subscriptionPlanId === plan.planId && subscriptionData.status === "active"
                    ? "Subscribed"
                    : subscriptionData.subscriptionPlanId === plan.planId && subscriptionData.status === "created"
                      ? "Continue to Payment"
                      : "Choose"}
                </button>
              </div>
            </div>
          ))}
        </div>
        )}

      </div>
    </div>
  );
};

export default SubscriptionPlan;