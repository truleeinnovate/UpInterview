import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { config } from '../../../config.js';
import toast from "react-hot-toast";
import { decodeJwt } from '../../../utils/AuthCookieManager/jwtDecode.js';
import Cookies from "js-cookie";
import LoadingButton from "../../../Components/LoadingButton.jsx";
import { useSubscription } from '../../../apiHooks/useSubscription.js';

const SubscriptionPlan = () => {
  const authToken = Cookies.get("authToken") || null;
  const [tokenPayload, setTokenPayload] = useState({});
  // subscription data will come from useSubscription()

  const navigate = useNavigate();
  const location = useLocation();
  const isUpgrading = location.state?.isUpgrading || false;
  const { plans, subscriptionData, createCustomerSubscription } = useSubscription();
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
      status: user.userType === "individual" && plan.name === "Base" ? "active" : "pending",
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
      if ((organization === "false" || !organization) && plan.name === "Base") {
        await axios.post(`${config.REACT_APP_API_URL}/emails/subscription/free`, {
          ownerId: user.ownerId,
          tenantId: user.tenantId,
        });

        axios.post(`${config.REACT_APP_API_URL}/emails/send-signup-email`, {
              tenantId: tenantId,
              ownerId: ownerId,
        }).catch((err) => console.error('Email error:', err));

        // If upgrading, navigate to a specific page; otherwise, go to home
        navigate(isUpgrading ? "/SubscriptionDetails" : "/home");
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
        <div className="grid grid-cols-3 sm:grid-cols-1 sm:space-y-7 gap-4 sm:mb-5">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`shadow-lg rounded-3xl relative transition-transform duration-300 p-5 ${isHighlighted(plan)
                  ? "-translate-y-6 z-10 bg-[#217989] text-white"
                  : "bg-white text-[#217989]"
                }`}
              onMouseEnter={() => setHoveredPlan(plan.name)}
              onMouseLeave={() => setHoveredPlan(null)}
            >
              <div className="flex justify-between items-center">
                <h5
                  className={`text-xl sm:text-md font-semibold ${isHighlighted(plan) ? "text-white" : "text-[#217989]"
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
              <ul className="mt-4 flex text-xs flex-col gap-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
              <p className="text-3xl sm:text-xl font-bold mt-4">
                <span className="text-xl">$</span>
                {isAnnual ? plan.annualPrice : plan.monthlyPrice}
                <span className="text-lg font-medium"> /{isAnnual ? "annual" : "month"}</span>
              </p>
              <LoadingButton
                onClick={() => submitPlans(plan)}
                isLoading={isSubmitting}
                loadingText="Processing..."
                className={`w-full font-semibold py-2 mt-4 rounded-lg sm:text-xs
                ${isHighlighted(plan) ? "bg-purple-500 text-white" : "text-purple-600 bg-purple-200"}
                ${subscriptionData.subscriptionPlanId === plan.planId && subscriptionData.status === "active" ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={subscriptionData.subscriptionPlanId === plan.planId && subscriptionData.status === "active"}
              >
                {subscriptionData.subscriptionPlanId === plan.planId && subscriptionData.status === "active"
                  ? "Subscribed"
                  : subscriptionData.subscriptionPlanId === plan.planId && subscriptionData.status === "created"
                    ? "Continue to Payment"
                    : "Choose"}
              </LoadingButton>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlan;