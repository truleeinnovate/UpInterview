import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { decodeJwt } from '../../../../../utils/AuthCookieManager/jwtDecode';
import Cookies from "js-cookie";
import "./subscription-animations.css";
import LoadingButton from "../../../../../Components/LoadingButton";
import { usePositions } from '../../../../../apiHooks/usePositions';

const Subscription = () => {
  console.log('subscription plan')
  const location = useLocation();
  const isUpgrading = location.state?.isUpgrading || false;

  const { isMutationLoading } = usePositions();

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  console.log("tokenPayload ----", tokenPayload);

  // Extract user details from token payload
  const userId = tokenPayload?.userId;
  const organization = tokenPayload?.organization;
  console.log("organization ----", organization);
  const orgId = tokenPayload?.tenantId;


  const [isAnnual, setIsAnnual] = useState(false);
  const [plans, setPlans] = useState([]);
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const [user] = useState({
    userType: organization === true ? "organization" : "individual",
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
            Authorization: `Bearer ${authToken}`,
          },
        });
        const Subscription_data = Sub_res.data.customerSubscription?.[0] || {};
        console.log('Subscription data:', Subscription_data);

        if (Subscription_data.subscriptionPlanId) {
          if (!Subscription_data.paymentMethod) {
            Subscription_data.paymentMethod = 'card';
          }

          setSubscriptionData(Subscription_data);

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
              Authorization: `Bearer ${authToken}`,
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

  const handleCancelSubscription = async () => {
    try {
      setLoading(true);
      setShowCancelModal(false);
      toast.loading('Processing your cancellation request...', { id: 'cancel-toast' });
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

      toast.dismiss('cancel-toast');

      if (response.status === 200) {
        toast.success('Your subscription has been cancelled successfully!');
        toast.loading('Refreshing subscription data...', { id: 'refresh-toast' });
        setTimeout(() => {
          toast.dismiss('refresh-toast');
          window.location.reload();
        }, 4000);
        // send email for subscription cancelled
        // axios.post(`${process.env.REACT_APP_API_URL}/emails/subscription/cancelled`, {
        //   ownerId: user.ownerId,
        //   tenantId: user.tenantId,
        // });
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  const updateSubscriptionPlan = async (plan) => {
    if (!plan || !subscriptionData) return;

    setLoading(true);
    toast.loading('Updating your subscription plan...', { id: 'update-toast' });

    try {
      const selectedMembershipType = isAnnual ? 'annual' : 'monthly';
      const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
      const totalAmount = price;
      const razorpayPlanId = isAnnual ? plan.razorpayPlanIds?.annual : plan.razorpayPlanIds?.monthly;
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/subscription-update/update-subscription-plan`,
        {
          tenantId: user.tenantId,
          ownerId: user.ownerId,
          userId: userId,
          razorpaySubscriptionId: subscriptionData.razorpaySubscriptionId,
          newPlanId: plan.planId,
          membershipType: selectedMembershipType,
          price: price,
          totalAmount: totalAmount,
          razorpayPlanId: razorpayPlanId
        },
        {
          headers: { Authorization: `Bearer ${authToken}` }
        }
      );

      toast.dismiss('update-toast');

      if (response.status === 200 || response.status === 201) {
        toast.success('Your subscription plan has been updated successfully!');
        toast.loading('Refreshing subscription data...', { id: 'refresh-toast' });

        setTimeout(() => {
          toast.dismiss('refresh-toast');
          window.location.reload();
        }, 4000);

        // // send email for subscription updated
        // axios.post(`${process.env.REACT_APP_API_URL}/emails/subscription/updated`, {
        //   ownerId: user.ownerId,
        //   tenantId: user.tenantId,
        // });
      }
    } catch (error) {
      toast.dismiss('update-toast');
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
          ownerId: user.ownerId,
          tenantId: user.tenantId,
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
      <div className="space-y-6 sm:mt-10 md:mt-20">
        {/* Hidden element for Razorpay */}
        <div id="razorpay-card-update" style={{ display: 'none' }}></div>

        <div className="flex-1">
          <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Subscription</h2>
            {subscriptionData && subscriptionData.status === 'active' && ((organization !== "false" || subscriptionData.planName !== "Base")) && (
              <button
                onClick={() => setShowCancelModal(true)}
                className={`bg-custom-blue hover:bg-custom-blue/80 py-2 px-4 rounded-lg text-white`}
              >
                Cancel Subscription
              </button>
            )}
          </div>
        </div>
        <div className="lg:p-7 md:p-4 bg-white rounded-xl relative">
          {/* Billing toggle */}
          <div className="flex justify-between items-start p-4">
            <div>
              <h3 className="text-base sm:text-lg md:text-xl font-medium">{`Current Plan: ${subscriptionData.planName} (${subscriptionData.selectedBillingCycle})`}</h3>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Next billing date: {subscriptionData.nextBillingDate ? new Date(subscriptionData.nextBillingDate).toLocaleDateString() : "N/A"}
              </p>
            </div>
            <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${subscriptionData.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
              {subscriptionData.status ? subscriptionData.status.charAt(0).toUpperCase() + subscriptionData.status.slice(1) : "inactive"}
            </span>
          </div>
        </div>

        {/* Toggle Section */}
        <div className="flex justify-center items-center space-x-2 mb-16">
          <p
            className={`text-custom-blue ${!isAnnual ? "font-semibold text-base sm:text-lg md:text-xl" : "font-medium text-sm sm:text-base md:text-lg"}`}
          >
            Bill Monthly
          </p>
          <div
            onClick={toggleBilling}
            className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${isAnnual ? "bg-[#217989]" : "bg-[#217989]"
              }`}
          >
            <div
              className={`w-4 h-4 rounded-full shadow-md transform transition-all ${isAnnual ? "translate-x-6 bg-white" : "translate-x-0 bg-white"
                }`}
            ></div>
          </div>
          <p
            className={`text-[#217989] ${isAnnual ? "font-semibold text-base sm:text-lg md:text-xl" : "font-medium text-sm sm:text-base md:text-lg"}`}
          >
            Bill Annually
          </p>
        </div>
        {/* Plans Section */}
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`shadow-lg rounded-3xl relative transition-all duration-300 p-6 ${isHighlighted(plan)
                    ? "-translate-y-2 md:-translate-y-4 lg:-translate-y-6 xl:-translate-y-6 2xl:-translate-y-6 z-10 bg-[#217989] text-white transform scale-[1.02]"
                    : "bg-white text-[#217989] hover:shadow-xl hover:-translate-y-1"
                  }`}
                onMouseEnter={() => setHoveredPlan(plan.name)}
                onMouseLeave={() => setHoveredPlan(null)}
                style={{
                  minHeight: '420px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <h5
                    className={`text-xl sm:text-2xl md:text-3xl font-bold ${isHighlighted(plan) ? "text-white" : "text-[#217989]"}`}
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
                <div className="mt-6">
                  <p className="text-2xl sm:text-3xl md:text-4xl font-bold">
                    <span className="text-lg sm:text-xl md:text-2xl">$</span>
                    {isAnnual ? plan.annualPrice : plan.monthlyPrice}
                    <span className="text-sm sm:text-base md:text-lg font-medium"> /{isAnnual ? "year" : "month"}</span>
                  </p>
                </div>
                <LoadingButton
                  onClick={() => submitPlans(plan)}
                  loading={isMutationLoading}
                  className={`w-full font-semibold py-2 sm:py-3 px-2 sm:px-4 rounded-lg text-xs sm:text-sm md:text-base lg:text-lg mt-4 transition-all duration-200   shadow-lg border

                    ${isHighlighted(plan) ? "bg-white hover:bg-white text-black " : "text-black bg-white hover:bg-white shadow-slate-50"}
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
                </LoadingButton>

              </div>
            ))}
          </div>
        </div>

      </div>
      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center right-0 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4 text-custom-blue">Cancel Subscription</h2>
            <p className="mb-4 text-sm sm:text-base text-gray-600">
              Are you sure you want to cancel your <span className="font-medium">{subscriptionData?.planName || 'current'} with {subscriptionData?.membershipType || 'monthly'} </span> subscription?
            </p>
            <p className="mb-6 text-sm sm:text-base text-gray-600">
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
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center right-0 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-xl">
            <h3 className="text-lg sm:text-xl font-bold mb-4">Confirm Subscription Update</h3>
            <div className="mb-4">
              <p className="mb-3 text-sm sm:text-base">You are about to update your subscription to <strong>{selectedPlanForUpgrade?.name} ({isAnnual ? 'Annual' : 'Monthly'})</strong>.</p>

              <div className="bg-blue-50 p-4 rounded-lg mb-3">
                <h4 className="font-bold text-custom-blue text-sm sm:text-base mb-2">Important Information:</h4>
                <ul className="list-disc pl-5 text-custom-blue text-xs sm:text-sm">
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
                className="px-4 py-2 border border-custom-blue text-custom-blue text-sm hover:bg-custom-blue/90 hover:text-white rounded-lg"
                onClick={() => setShowUpgradeConfirmModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/80 transition-colors"
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




