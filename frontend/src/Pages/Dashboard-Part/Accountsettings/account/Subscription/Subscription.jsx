import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { decodeJwt } from '../../../../../utils/AuthCookieManager/jwtDecode'; // Import the utility
import Cookies from "js-cookie";
import "./subscription-animations.css";
const Subscription = () => {
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
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpgradeConfirmModal, setShowUpgradeConfirmModal] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState(null);
  

  // Fetch subscription data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userId) {
          throw new Error('User ID not found');
        }
        const Sub_res = await axios.get(`${process.env.REACT_APP_API_URL}/subscriptions/${userId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`, // Include token in request headers
          },
        });
        const Subscription_data = Sub_res.data.customerSubscription?.[0] || {};
        // Log subscription data to debug
        console.log('Subscription data:', Subscription_data);
        
        if (Subscription_data.subscriptionPlanId) {
          // Add paymentMethod property if it doesn't exist
          if (!Subscription_data.paymentMethod) {
            Subscription_data.paymentMethod = 'card'; // Default to card for now
          }
          
          setSubscriptionData(Subscription_data);
          
          // Set toggle mode based on the user's current subscription billing cycle
          if (Subscription_data.selectedBillingCycle === 'annual') {
            setIsAnnual(true);
          } else if (Subscription_data.selectedBillingCycle === 'monthly') {
            setIsAnnual(false);
          }
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
          `${process.env.REACT_APP_API_URL}/all-subscription-plans?t=${new Date().getTime()}`,
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


  // Handle subscription cancellation
  const handleCancelSubscription = async () => {
    try {
      setLoading(true);
      setShowCancelModal(false);
      
      toast.loading('Processing your cancellation request...', { id: 'cancel-toast' });
      
      // More detailed logging for debugging
      console.log('Subscription data for cancellation:', subscriptionData);
      console.log('Subscription ID:', subscriptionData._id);
      console.log('Razorpay Subscription ID:', subscriptionData.razorpaySubscriptionId);
      
      // Send more identifiers to help locate the subscription in the database
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/cancel-subscription`,
        {
          subscriptionId: subscriptionData._id,
          razorpaySubscriptionId: subscriptionData.razorpaySubscriptionId,
          tenantId: user.tenantId,
          ownerId: user.ownerId,
          reason: 'user_requested'
        },
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );
      
      console.log('Cancellation response:', response.data);
      
      toast.dismiss('cancel-toast');
      
      if (response.status === 200) {
        toast.success('Your subscription has been cancelled successfully!');
        
        // Wait for 4 seconds to allow webhook processing before refreshing the page
        console.log('Waiting 4 seconds for webhook processing before refreshing the page...');
        toast.loading('Refreshing subscription data...', { id: 'refresh-toast' });
        
        // Refresh the entire page after 4 seconds
        setTimeout(() => {
          toast.dismiss('refresh-toast');
          window.location.reload();
        }, 4000);
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to directly update subscription plan in Razorpay
  const updateSubscriptionPlan = async (plan) => {
    if (!plan || !subscriptionData) return;
    
    setLoading(true);
    toast.loading('Updating your subscription plan...', { id: 'update-toast' });
    
    try {
      const selectedMembershipType = isAnnual ? 'annual' : 'monthly';
      
      console.log('Updating subscription plan:', {
        userId,
        razorpaySubscriptionId: subscriptionData.razorpaySubscriptionId,
        newPlanId: plan.planId,
        membershipType: selectedMembershipType
      });
      
      // Calculate price and totalAmount
      const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
      const totalAmount = price; // If there's no discount, price = totalAmount
      
      console.log('Sending price and totalAmount:', { price, totalAmount });
      
      // Get the Razorpay plan ID directly from the plan object
      const razorpayPlanId = isAnnual ? plan.razorpayPlanIds?.annual : plan.razorpayPlanIds?.monthly;
      
      console.log('Using Razorpay plan ID:', razorpayPlanId);
      
      // Call the update subscription plan API
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/subscription-update/update-subscription-plan`,
        {
          userId: userId,
          razorpaySubscriptionId: subscriptionData.razorpaySubscriptionId,
          newPlanId: plan.planId,
          membershipType: selectedMembershipType,
          price: price,
          totalAmount: totalAmount,
          razorpayPlanId: razorpayPlanId // Send the razorpayPlanId directly
        },
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );
      
      toast.dismiss('update-toast');
      
      if (response.status === 200 || response.status === 201) {
        toast.success('Your subscription plan has been updated successfully!');
        
        // Wait for 4 seconds to allow webhook processing
        console.log('Waiting 4 seconds for webhook processing before refreshing the page...');
        toast.loading('Refreshing subscription data...', { id: 'refresh-toast' });
        
        // Refresh the page after 4 seconds
        setTimeout(() => {
          toast.dismiss('refresh-toast');
          window.location.reload();
        }, 4000);
      }
    } catch (error) {
      console.error('Error updating subscription plan:', error);
      toast.dismiss('update-toast');
      
      // Enhanced error logging
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      }
      
      // More informative user error message
      const errorMessage = error.response?.data?.message || 'Failed to update subscription plan';
      toast.error(`Subscription update failed: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const submitPlans = async (plan) => {
    if (!plan) {
      toast.success("No plan is selected");
      return;
    }
    
    // Check if user has an active subscription
    if (subscriptionData && subscriptionData.razorpaySubscriptionId && subscriptionData.subscriptionPlanId && subscriptionData.status === 'active') {
      // If it's the same plan and billing cycle, don't do anything
      if (subscriptionData.subscriptionPlanId === plan.planId && 
          subscriptionData.selectedBillingCycle === (isAnnual ? 'annual' : 'monthly')) {
        toast.error("You are already subscribed to this plan");
        return;
      }
      
      // Store the selected plan and show the confirmation modal
      setSelectedPlanForUpgrade(plan);
      setShowUpgradeConfirmModal(true);
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
      status: "created",
    };

    try {
      const subscriptionResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}/create-customer-subscription`,
        payload
      );

      console.log(
        "Payment and Subscription submitted successfully",
        subscriptionResponse.data
      );
      console.log(organization, plan.name, "organization");
      
      // For Base plan with no organization, send the free subscription email
      if ((organization === "false" || !organization) && plan.name === "Base") {
        await axios.post(`${process.env.REACT_APP_API_URL}/emails/subscriptions/free`, {
          ownerId: Cookies.get("userId"),
          tenantId: Cookies.get("organizationId"),
        });
      }
      
      // Always navigate to payment details page for all plans
      navigate("/subscription-payment-details", {
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

    } catch (error) {
      console.error("Error submitting subscription:", error);
    }

  };

  const isHighlighted = (plan) =>
    hoveredPlan ? hoveredPlan === plan.name : plan.isDefault;

  return (
    <>
    <div className="space-y-6">
      {/* Hidden element for Razorpay */}
      <div id="razorpay-card-update" style={{ display: 'none' }}></div>
      
      
      <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Subscription</h2>
      {subscriptionData && subscriptionData.status === 'active' && (
        <button 
          onClick={() => setShowCancelModal(true)}
          className="bg-[#217989] hover:bg-[#175b69] text-white px-4 py-2 rounded-lg text-sm flex items-center transition-all duration-300"
        >
          Cancel Subscription
        </button>
      )}
      {/* Update Card Details Button - Show for any active subscription */}
      {/* {subscriptionData.status === 'active' && (
          <button
            //onClick={updateCardDetails}
            //disabled={updatingCard}
            className="bg-[#217989] hover:bg-[#175b69] text-white px-4 py-2 rounded-lg text-sm flex items-center transition-all duration-300"
          >
            {/* {updatingCard ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                </svg>
                Update Card Details
              </>
            )} */}
            {/* Update Card Details
          </button>
        )} */} 
      </div>
      {/* Current Plan */}
      <div className="lg:p-7 md:p-4 bg-white rounded-xl relative">
        {/* Billing toggle */}
        <div className="flex justify-between items-start p-4">
          <div>
            <h3 className="text-lg font-medium">{`Current Plan: ${subscriptionData.planName} (${subscriptionData.selectedBillingCycle})`}</h3>
            <p className="text-gray-600 mt-1">
              Next billing date: {subscriptionData.nextBillingDate ? new Date(subscriptionData.nextBillingDate).toLocaleDateString() : "N/A"}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            subscriptionData.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
          }`}>
            {subscriptionData.status ? subscriptionData.status.charAt(0).toUpperCase() + subscriptionData.status.slice(1) : "inactive"}
          </span>
        </div>
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
        <div className="grid grid-cols-3 sm:grid-cols-1 sm:space-y-7 gap-4 sm:mb-5 pt-5">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`shadow-lg rounded-3xl relative transition-transform duration-300 p-5 w-[350px] ${
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
                ${subscriptionData.subscriptionPlanId === plan.planId && subscriptionData.selectedBillingCycle === (isAnnual ? "annual" : "monthly") && subscriptionData.status === "active" ? "opacity-50 cursor-not-allowed" : ""}
                ${(() => {
                  // Check if this is an upgrade button
                  if (subscriptionData.subscriptionPlanId) {
                    const currentPlanIndex = plans.findIndex(p => p.planId === subscriptionData.subscriptionPlanId);
                    const thisPlanIndex = plans.findIndex(p => p.planId === plan.planId);
                    if (currentPlanIndex !== -1 && thisPlanIndex > currentPlanIndex && 
                        subscriptionData.selectedBillingCycle === (isAnnual ? "annual" : "monthly")) {
                      return "upgrade-button-animation";
                    }
                  }
                  return "";
                })()}`}
                disabled={subscriptionData.subscriptionPlanId === plan.planId && subscriptionData.selectedBillingCycle === (isAnnual ? "annual" : "monthly") && subscriptionData.status === "active"}
              >
                {subscriptionData.subscriptionPlanId === plan.planId && subscriptionData.selectedBillingCycle === (isAnnual ? "annual" : "monthly") && subscriptionData.status === "active"
              ? "Subscribed"
              : subscriptionData.subscriptionPlanId === plan.planId && subscriptionData.selectedBillingCycle === (isAnnual ? "annual" : "monthly") && subscriptionData.status === "created"
              ? "Continue to Payment"
              : (() => {
                  // Determine if this plan is higher or lower than current plan
                  if (subscriptionData.subscriptionPlanId) {
                    const currentPlanIndex = plans.findIndex(p => p.planId === subscriptionData.subscriptionPlanId);
                    const thisPlanIndex = plans.findIndex(p => p.planId === plan.planId);
                    
                    // Only compare plans when viewing the same billing cycle as the current subscription
                    if (subscriptionData.selectedBillingCycle !== (isAnnual ? "annual" : "monthly")) {
                      return "Choose";
                    }
                    
                    // If current plan index exists and this plan index exists
                    if (currentPlanIndex !== -1 && thisPlanIndex !== -1) {
                      return thisPlanIndex > currentPlanIndex ? "Upgrade" : "Choose";
                    }
                  }
                  return "Choose";
                })()}
              </button>
              
            </div>
          ))}
        </div>
     
    </div>
    {/* Cancel Subscription Modal */}
    {showCancelModal && (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Cancel Subscription</h2>
          <p className="mb-4 text-gray-600">
            Are you sure you want to cancel your <span className="font-medium">{subscriptionData?.planName || 'current'} with {subscriptionData?.membershipType || 'monthly'} </span> subscription?
          </p>
          <p className="mb-6 text-gray-600">
            Your subscription will be cancelled immediately and you will lose access to premium features.
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setShowCancelModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition duration-150"
              disabled={loading}
            >
              Keep Subscription
            </button>
            <button
              onClick={handleCancelSubscription}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-150"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Cancel Subscription'}
            </button>
          </div>
        </div>
      </div>
    )}
    
    {/* Upgrade Confirmation Modal */}
    {showUpgradeConfirmModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
        <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-xl">
          <h3 className="text-xl font-bold mb-4">Confirm Subscription Update</h3>
          <div className="mb-4">
            <p className="mb-3">You are about to update your subscription to <strong>{selectedPlanForUpgrade?.name} ({isAnnual ? 'Annual' : 'Monthly'})</strong>.</p>
            
            <div className="bg-blue-50 p-4 rounded-lg mb-3">
              <h4 className="font-bold text-blue-800 mb-2">Important Information:</h4>
              <ul className="list-disc pl-5 text-blue-800">
                <li className="mb-1">Your subscription plan will be updated immediately</li>
                <li className="mb-1">No immediate payment will be charged</li>
                <li className="mb-1">The new pricing will apply at your next billing cycle</li>
                <li className="mb-1">Your saved payment method will be charged automatically at that time</li>
              </ul>
            </div>
            
            <p className="mb-2">New price: <strong>₹{isAnnual ? selectedPlanForUpgrade?.annualPrice : selectedPlanForUpgrade?.monthlyPrice}</strong> per {isAnnual ? 'year' : 'month'}</p>
            <p>Next billing date: <strong>{subscriptionData?.nextBillingDate ? new Date(subscriptionData.nextBillingDate).toLocaleDateString() : 'Not available'}</strong></p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button 
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
              onClick={() => setShowUpgradeConfirmModal(false)}
            >
              Cancel
            </button>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              onClick={() => {
                setShowUpgradeConfirmModal(false);
                updateSubscriptionPlan(selectedPlanForUpgrade);
              }}
            >
              Confirm Update
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
};

export default Subscription;




