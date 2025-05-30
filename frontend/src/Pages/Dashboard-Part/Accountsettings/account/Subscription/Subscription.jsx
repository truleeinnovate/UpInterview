import { CheckIcon } from '@heroicons/react/24/outline'

import React, { useEffect, useState } from "react";
import axios from "axios";
// import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
// import { useCustomContext } from "../../../Context/Contextfetch";
import { useLocation } from "react-router-dom";
// import toast from "react-hot-toast";
import { decodeJwt } from '../../../../../utils/AuthCookieManager/jwtDecode';
import { useCustomContext } from '../../../../../Context/Contextfetch';
import { config } from '../../../../../config';

function Subscription() {
  // const currentPlan = subscriptionPlans.find(plan => plan.id === currentSubscription.planId);
const {currentPlan} = useCustomContext();
    const location = useLocation();
    // const isUpgrading = location.state?.isUpgrading || false;
  
    const authToken = Cookies.get("authToken");
    const tokenPayload = decodeJwt(authToken);
    const userId = tokenPayload.userId;
    const orgId = tokenPayload.tenantId;
    const organization = tokenPayload.organization;
  
  
    const [isAnnual] = useState(false);
    const [plans, setPlans] = useState([]);
  
    // const [hoveredPlan] = useState(null);
    const [user] = useState({
      userType: organization === "true" ? "organization" : "individual",
      tenantId: orgId,
      ownerId: userId
    });

    // const navigate = useNavigate();
  
    // const toggleBilling = () => setIsAnnual(!isAnnual);
    // const [currentPlan, setcurrentPlan] = useState([]);
    // const [loading, setLoading] = useState(true);
    // this will check that that plans is already set or not

    // useEffect(() => {
    //   const fetchData = async () => {
    //     try {
    //       const Sub_res = await axios.get(`${config.REACT_APP_API_URL}/subscriptions/${user.ownerId}`);
    //       const Subscription_data = Sub_res.data.customerSubscription?.[0] || {};
    //       // If subscription exists, set it; otherwise, keep it empty
    //    console.log("Sub_res Sub_res",Subscription_data);


    //       if (Subscription_data.subscriptionPlanId) {
    //         setcurrentPlan(Subscription_data);
    //       }
    //     } catch (error) {
    //       console.error('Error fetching data:', error);
    //     }
    //   };
  
    //   if (userId) {
    //     fetchData();
    //   }
    // }, [userId, user.ownerId]);

    // console.log("currentPlan", currentPlan);
    
  
  
    useEffect(() => {
      const fetchPlans = async () => {
        try {
          // const response = await axios.get(`${config.REACT_APP_API_URL}/all-subscription-plans`);
          const response = await axios.get(
            `${config.REACT_APP_API_URL}/all-subscription-plans?t=${new Date().getTime()}`
          );
          const data = response.data;


          const filteredPlans = data.filter(
            (plan) => plan.subscriptionType === user.userType
          );
 
          console.log("filteredPlans", filteredPlans);
          
  
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
              // isDefault: plan.name === "Pro" ? true : false,
  
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
  
              monthlyDiscount: monthlyPricing?.discountType === "percentage" &&
                monthlyPricing?.discount > 0 ? parseInt(monthlyPricing.discount) : null,
  
              annualDiscount: annualPricing?.discountType === "percentage" &&
                annualPricing?.discount > 0 ? parseInt(annualPricing?.discount) : null
  
            };
          });
          // console.log("Sub_res Sub_res",formattedPlans);
          setPlans(formattedPlans);
        } catch (error) {
          console.error("Error fetching subscription plans:", error);
        }
      };
  
      fetchPlans();
    }, [user.userType, location.pathname]);
  
  
    // const submitPlans = async (plan) => {
  
    //   if (!plan) {
    //     toast.success("No plan is selected");
    //     return;
    //   }
    //   const totalAmount = isAnnual ? plan.annualPrice : plan.monthlyPrice;
  
    //   const payload = {
    //     planDetails: {
    //       subscriptionPlanId: plan.planId,
    //       monthlyPrice: plan.monthlyPrice,
    //       annualPrice: plan.annualPrice,
    //       monthDiscount: plan.monthlyDiscount,
    //       annualDiscount: plan.annualDiscount,
    //     },
    //     userDetails: {
    //       tenantId: user.tenantId,
    //       ownerId: user.ownerId,
    //       userType: user.userType,
    //       membershipType: isAnnual ? "annual" : "monthly",
    //     },
    //     totalAmount,
    //     status: "pending",
    //   };
  
    //   try {
    //     const subscriptionResponse = await axios.post(
    //       `${config.REACT_APP_API_URL}/create-customer-subscription`,
    //       payload
    //     );
  
    //     console.log(
    //       "Payment and Subscription submitted successfully",
    //       subscriptionResponse.data
    //     );
    //     console.log(organization, plan.name, "organization");
    //     if ((organization === "false" || !organization) && plan.name === "Base") {
    //       await axios.post(`${config.REACT_APP_API_URL}/emails/subscription/free`, {
    //         ownerId: user.ownerId,
    //         tenantId: user.tenantId,
    //       });
  
    //       // If upgrading, navigate to a specific page; otherwise, go to home
    //       navigate(isUpgrading ? "/SubscriptionDetails" : "/home");
    //     } else {
    //       navigate("/payment-details", {
    //         state: {
    //           plan: {
    //             ...plan,
    //             billingCycle: isAnnual ? "annual" : "monthly",
    //             user,
    //             invoiceId: subscriptionResponse?.data?.invoiceId,
    //           },
    //           isUpgrading, // Pass the upgrading flag to next page if needed
    //         },
    //       });
    //     }
  
  
    //   } catch (error) {
    //     console.error("Error submitting subscription:", error);
    //   }
  
    // };
  
    // const isHighlighted = (plan) =>
    //   hoveredPlan ? hoveredPlan === plan.name : plan.isDefault;
  
    console.log("setPlans", plans);
    

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Subscription</h2>

      {/* Current Plan */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium">Current Plan: {currentPlan.planName}</h3>
            <p className="text-gray-600 mt-1">
              Next billing date: {new Date(currentPlan.nextBillingDate).toLocaleDateString()}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            currentPlan.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {currentPlan.status ? currentPlan.status.charAt(0).toUpperCase() + currentPlan.status.slice(1) : "inactive"}
          </span>
        </div>
      </div>

      {/* Toggle Section */}
      {/* <div className="flex justify-center items-center space-x-2 mb-16">
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
              className={`w-4 h-4 rounded-full shadow-md transform transition-all ${isAnnual
                ? "translate-x-6 bg-yellow-500"
                : "translate-x-0 bg-yellow-500"
                }`}
            ></div>
          </div>
          <p
            className={`text-[#217989] ${isAnnual ? "font-semibold text-lg sm:text-sm" : "font-medium sm:text-xs"
              }`}
          >
            Bill Annually
          </p>
        </div> */}

           {/* Plans Section */}
          
           <div className="grid grid-cols-1 md:grid-cols-3  lg:grid-cols-3  xl:grid-cols-3  2xl:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.planId}
              className={`bg-white p-6 rounded-lg shadow ${
                plan.planId === currentPlan.subscriptionPlanId ? 'ring-2 ring-custom-blue' : ''
              }`}
              // onMouseEnter={() => setHoveredPlan(plan.name)}
              // onMouseLeave={() => setHoveredPlan(null)}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium">
                  {plan.name}
                </h3>
                {/* {isAnnual
                  ? plan.annualBadge && (
                    <span className="bg-white text-purple-600 font-semibold text-sm py-1 px-2 rounded-md">
                      {plan.annualBadge}
                    </span>
                  )
                  : plan.monthlyBadge && (
                    <span className="bg-white text-purple-600 font-semibold text-sm py-1 px-2 rounded-md">
                      {plan.monthlyBadge}
                    </span>      
                  )} */}

{plan.planId === currentPlan.subscriptionPlanId && (
                <span className="px-3 py-1 bg-blue-50 text-custom-blue rounded-full text-sm">
                  Current Plan
                </span>
              )}
              </div>

              <p className="text-2xl font-bold mt-2">
                <span className="text-xl">$</span>
                {isAnnual ? plan.annualPrice : plan.monthlyPrice}
                <span className="text-gray-500 text-sm"> /{isAnnual ? "annual" : "month"}</span>
              </p>
              {/* <p className="text-2xl font-bold mt-2">
              {typeof plan.price === 'number' ? `$${plan.price}` : plan.price}
              {typeof plan.price === 'number' && <span className="text-gray-500 text-sm">/{plan.billingPeriod}</span>}
            </p> */}

              {/* <ul className="mt-4 flex text-xs flex-col gap-1">
                {plan.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul> */}

<div className="mt-4 space-y-3">
              {Object.entries(plan.features).map(([feature, value]) => (
                <div key={feature} className="flex items-start">
                  <CheckIcon className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-gray-600">
                    {/* {feature.split(/(?=[A-Z])/).join(' ')}: */}
                     {value}
                  </span>
                </div>
              ))}
            </div>

            <button
              className={`w-full mt-6 px-4 py-2 rounded-lg font-medium ${
                plan.planId === currentPlan.subscriptionPlanId
                  ? 'bg-gray-100 text-gray-600 cursor-not-allowed'
                  : 'bg-custom-blue text-white '
              }`}
              disabled={plan.planId === currentPlan.subscriptionPlanId}
            >
              {plan.planId === currentPlan.subscriptionPlanId ? 'Current Plan' : 'Upgrade'}
            </button>
            
              {/* <button
                onClick={() => submitPlans(plan)}
                className={`w-full font-semibold py-2 mt-4 rounded-lg sm:text-xs
        ${isHighlighted(plan) ? "bg-purple-500 text-white" : "text-purple-600 bg-purple-200"}
        ${subscriptionData.subscriptionPlanId === plan.planId ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={subscriptionData.subscriptionPlanId === plan.planId}
              >
                {subscriptionData.subscriptionPlanId === plan.planId ? "Subscribed" : "Choose"}
              </button> */}
            </div>
          ))}
        </div>
     
    </div>
  )
}

export default Subscription;