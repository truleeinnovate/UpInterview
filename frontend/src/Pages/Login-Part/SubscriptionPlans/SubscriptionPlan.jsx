import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { config } from '../../../config.js';
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { decodeJwt } from '../../../utils/AuthCookieManager/jwtDecode.js'; // Import the utility
import Cookies from "js-cookie";
const SubscriptionPlan = () => {
  console.log('subscription plan')
  const location = useLocation();
  const isUpgrading = location.state?.isUpgrading || false;

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);

  // Extract user details from token payload
  const userId = tokenPayload?.userId;
  const organization = tokenPayload?.organization?.toString();
  const orgId = tokenPayload?.tenantId;

  const [isAnnual, setIsAnnual] = useState(false);
  const [plans, setPlans] = useState([]);
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const [user] = useState({
    userType: organization === "true" ? "organization" : "individual",
    tenantId: orgId,
    ownerId: userId,
  });

  const navigate = useNavigate();

  const toggleBilling = () => setIsAnnual(!isAnnual);
  const [subscriptionData, setSubscriptionData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch subscription data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userId) {
          throw new Error('User ID not found');
        }
        const Sub_res = await axios.get(`${config.REACT_APP_API_URL}/subscriptions/${userId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`, // Include token in request headers
          },
        });
        const Subscription_data = Sub_res.data.customerSubscription?.[0] || {};
        if (Subscription_data.subscriptionPlanId) {
          setSubscriptionData(Subscription_data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchData();
    }
  }, [userId, authToken]);

  // Fetch subscription plans
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const response = await axios.get(
          `${config.REACT_APP_API_URL}/all-subscription-plans?t=${new Date().getTime()}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`, // Include token in request headers
            },
          }
        );
        const data = response.data;

        const filteredPlans = data.filter(
          (plan) => plan.subscriptionType === user.userType
        );

        const formattedPlans = filteredPlans.map((plan) => {
          const monthlyPricing = plan.pricing.find(
            (p) => p.billingCycle === "monthly"
          );
          const annualPricing = plan.pricing.find(
            (p) => p.billingCycle === "annual"
          );

          const calculateDiscountPercentage = (price, discount) =>
            price && discount ? Math.round((discount / price) * 100) : 0;

          return {
            name: plan.name,
            planId: plan._id,
            monthlyPrice: monthlyPricing?.price || 0,
            annualPrice: annualPricing?.price || 0,
            isDefault: plan.name === "Pro",
            // Add Razorpay plan IDs if available
            razorpayPlanIds: plan.razorpayPlanIds || {},
            features: plan.features.map(
              (feature) => `${feature.name} (${feature.description})`
            ),
            monthlyBadge:
              monthlyPricing?.discountType === "percentage" &&
              monthlyPricing?.discount > 0
                ? `Save ${calculateDiscountPercentage(
                    monthlyPricing.price,
                    monthlyPricing.discount
                  )}%`
                : null,
            annualBadge:
              annualPricing?.discountType === "percentage" &&
              annualPricing?.discount > 0
                ? `Save ${calculateDiscountPercentage(
                    annualPricing.price,
                    annualPricing.discount
                  )}%`
                : null,
            monthlyDiscount:
              monthlyPricing?.discountType === "percentage" &&
              monthlyPricing?.discount > 0
                ? parseInt(monthlyPricing.discount)
                : null,
            annualDiscount:
              annualPricing?.discountType === "percentage" &&
              annualPricing?.discount > 0
                ? parseInt(annualPricing?.discount)
                : null,
          };
        });
        setPlans(formattedPlans);
      } catch (error) {
        console.error("Error fetching subscription plans:", error);
      }
    };

    fetchPlans();
  }, [user.userType, location.pathname, authToken]);


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
        tenantId: user.tenantId,
        ownerId: user.ownerId,
        userType: user.userType,
        membershipType: isAnnual ? "annual" : "monthly",
      },
      totalAmount,
      status: "pending",
    };

    try {
      const subscriptionResponse = await axios.post(
        `${config.REACT_APP_API_URL}/create-customer-subscription`,
        payload
      );

      console.log(
        "Payment and Subscription submitted successfully",
        subscriptionResponse.data
      );
      console.log(organization, plan.name, "organization");
      if ((organization === "false" || !organization) && plan.name === "Base") {
        await axios.post(`${config.REACT_APP_API_URL}/emails/subscriptions/free`, {
          ownerId: user.ownerId,
          tenantId: user.tenantId,
        });

        // If upgrading, navigate to a specific page; otherwise, go to home
        navigate(isUpgrading ? "/SubscriptionDetails" : "/home");
      } else {
        navigate("/payment-details", {
          state: {
            plan: {
              ...plan,
              billingCycle: isAnnual ? "annual" : "monthly",
              user,
              invoiceId: subscriptionResponse?.data?.invoiceId,
            },
            isUpgrading, // Pass the upgrading flag to next page if needed
          },
        });
      }


    } catch (error) {
      console.error("Error submitting subscription:", error);
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
            className={`text-custom-blue ${
              !isAnnual ? "font-semibold text-lg sm:text-sm" : "font-medium sm:text-xs"
            }`}
          >
            Bill Monthly
          </p>
          <div
            onClick={toggleBilling}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
              isAnnual ? "bg-[#217989]" : "bg-[#217989]"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full shadow-md transform transition-all ${
                isAnnual ? "translate-x-6 bg-yellow-500" : "translate-x-0 bg-yellow-500"
              }`}
            ></div>
          </div>
          <p
            className={`text-[#217989] ${
              isAnnual ? "font-semibold text-lg sm:text-sm" : "font-medium sm:text-xs"
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
              className={`shadow-lg rounded-3xl relative transition-transform duration-300 p-5 ${
                isHighlighted(plan)
                  ? "-translate-y-6 z-10 bg-[#217989] text-white"
                  : "bg-white text-[#217989]"
              }`}
              onMouseEnter={() => setHoveredPlan(plan.name)}
              onMouseLeave={() => setHoveredPlan(null)}
            >
              <div className="flex justify-between items-center">
                <h5
                  className={`text-xl sm:text-md font-semibold ${
                    isHighlighted(plan) ? "text-white" : "text-[#217989]"
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
              <button
                onClick={() => submitPlans(plan)}
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
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPlan;