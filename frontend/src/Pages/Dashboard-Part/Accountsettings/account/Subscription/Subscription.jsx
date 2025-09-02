// ----- v1.0.0 ----- Venkatesh----update LoadingButton colors
// v1.0.1 - Ashok - fixed z-index issue when popup is open

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
// v1.0.1 <---------------------------------------------
import { createPortal } from "react-dom";
// v1.0.1 --------------------------------------------->
import toast from "react-hot-toast";
import { decodeJwt } from "../../../../../utils/AuthCookieManager/jwtDecode";
import Cookies from "js-cookie";
import "./subscription-animations.css";
import { usePositions } from "../../../../../apiHooks/usePositions";
import { usePermissions } from "../../../../../Context/PermissionsContext";
import { usePermissionCheck } from "../../../../../utils/permissionUtils";

// Loading Skeleton for Current Plan Section
const CurrentPlanSkeleton = () => {
  return (
    <div className="lg:p-7 md:p-4 bg-white rounded-xl relative">
      <div className="skeleton-animation">
        <div className="flex justify-between items-start p-4">
          <div className="flex-1">
            <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>
  );
};

// Loading Skeleton for Billing Toggle
const BillingToggleSkeleton = () => {
  return (
    <div className="flex justify-center items-center space-x-2 mb-16">
      <div className="skeleton-animation">
        <div className="h-6 bg-gray-200 rounded w-24"></div>
        <div className="w-12 h-6 bg-gray-200 rounded-full mt-2"></div>
        <div className="h-6 bg-gray-200 rounded w-24 mt-2"></div>
      </div>
    </div>
  );
};

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

const Subscription = () => {
  const { checkPermission, isInitialized } = usePermissionCheck();
  const { effectivePermissions } = usePermissions();
  const location = useLocation();
  const isUpgrading = location.state?.isUpgrading || false;
  const { isMutationLoading } = usePositions();
  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);
  const userId = tokenPayload?.userId;
  const organization = tokenPayload?.organization;
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
  const [showDowngradeConfirmModal, setShowDowngradeConfirmModal] = useState(false);
  const [selectedPlanForDowngrade, setSelectedPlanForDowngrade] = useState(null);
  const [loadingPlanId, setLoadingPlanId] = useState(null);

  // Fetch subscription data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userId) {
          throw new Error("User ID not found");
        }
        const Sub_res = await axios.get(
          `${process.env.REACT_APP_API_URL}/subscriptions/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );
        const Subscription_data = Sub_res.data.customerSubscription?.[0] || {};
        console.log("Subscription data:", Subscription_data);

        if (Subscription_data.subscriptionPlanId) {
          if (!Subscription_data.paymentMethod) {
            Subscription_data.paymentMethod = "card";
          }

          setSubscriptionData(Subscription_data);

          if (Subscription_data.selectedBillingCycle === "annual") {
            setIsAnnual(true);
          } else if (Subscription_data.selectedBillingCycle === "monthly") {
            setIsAnnual(false);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
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
          `${
            process.env.REACT_APP_API_URL
          }/all-subscription-plans?t=${new Date().getTime()}`,
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
      toast.loading("Processing your cancellation request...", {
        id: "cancel-toast",
      });
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/cancel-subscription`,
        {
          subscriptionId: subscriptionData._id,
          razorpaySubscriptionId: subscriptionData.razorpaySubscriptionId,
          tenantId: user.tenantId,
          ownerId: user.ownerId,
          reason: "user_requested",
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      toast.dismiss("cancel-toast");

      if (response.status === 200) {
        toast.success("Your subscription has been cancelled successfully!");
        toast.loading("Refreshing subscription data...", {
          id: "refresh-toast",
        });
        setTimeout(() => {
          toast.dismiss("refresh-toast");
          window.location.reload();
        }, 4000);
        // send email for subscription cancelled
        // axios.post(`${process.env.REACT_APP_API_URL}/emails/subscription/cancelled`, {
        //   ownerId: user.ownerId,
        //   tenantId: user.tenantId,
        // });
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error(
        error.response?.data?.message || "Failed to cancel subscription"
      );
    } finally {
      setLoading(false);
    }
  };

  const updateSubscriptionPlan = async (plan) => {
    try {
      setLoading(true);
      toast.loading("Updating your subscription plan...", {
        id: "update-toast",
      });
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/subscription-update/update-subscription-plan`,
        {
          subscriptionId: subscriptionData._id,
          razorpaySubscriptionId: subscriptionData.razorpaySubscriptionId,
          newPlanId: plan.planId,
          newBillingCycle: isAnnual ? "annual" : "monthly",
          tenantId: user.tenantId,
          ownerId: user.ownerId,
        },
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      toast.dismiss("update-toast");

      if (response.status === 200) {
        toast.success("Your subscription plan has been updated successfully!");
        toast.loading("Refreshing subscription data...", {
          id: "refresh-toast",
        });
        setTimeout(() => {
          toast.dismiss("refresh-toast");
          window.location.reload();
        }, 4000);
      }
    } catch (error) {
      console.error("Error updating subscription plan:", error);
      toast.error(
        error.response?.data?.message || "Failed to update subscription plan"
      );
    } finally {
      setLoading(false);
    }
  };

  const submitPlans = async (plan) => {
    setLoadingPlanId(plan.planId);
    try {
      if (
        subscriptionData.subscriptionPlanId === plan.planId &&
        subscriptionData.selectedBillingCycle ===
          (isAnnual ? "annual" : "monthly") &&
        subscriptionData.status === "active"
      ) {
        return; // Already subscribed to this plan
      }

      if (
        subscriptionData.subscriptionPlanId === plan.planId &&
        subscriptionData.selectedBillingCycle ===
          (isAnnual ? "annual" : "monthly") &&
        subscriptionData.status === "created"
      ) {
        // Continue to payment for existing subscription
        navigate("/account-settings/subscription/card-details", {
          state: {
            plan: {
              ...plan,
              billingCycle: isAnnual ? "annual" : "monthly",
              user: user,
              invoiceId: subscriptionData.invoiceId,
              razorpayPlanIds: subscriptionData.razorpayPlanId,
            },
            isUpgrading: false,
          },
        });
        return;
      }

      // Check if this is an upgrade
      if (subscriptionData.subscriptionPlanId) {
        const currentPlanIndex = plans.findIndex(
          (p) => p.planId === subscriptionData.subscriptionPlanId
        );
        const thisPlanIndex = plans.findIndex((p) => p.planId === plan.planId);
        const viewingCycle = isAnnual ? "annual" : "monthly";
        const currentCycle = subscriptionData.selectedBillingCycle;
        const isSamePlan =
          subscriptionData.subscriptionPlanId === plan.planId;

        // Treat monthly -> annual on the same plan as an upgrade
        if ((isSamePlan || !isSamePlan) && currentCycle === "monthly" && viewingCycle === "annual") {
          setSelectedPlanForUpgrade(plan);
          setShowUpgradeConfirmModal(true);
          return;
        }

        // Treat annual -> monthly on the same plan as a downgrade
        if ((isSamePlan || !isSamePlan) && currentCycle === "annual" && viewingCycle === "monthly") {
          setSelectedPlanForDowngrade(plan);
          setShowDowngradeConfirmModal(true);
          return;
        }

        if (
          currentPlanIndex !== -1 &&
          thisPlanIndex > currentPlanIndex &&
          subscriptionData.selectedBillingCycle ===
            viewingCycle
        ) {
          // This is an upgrade
          setSelectedPlanForUpgrade(plan);
          setShowUpgradeConfirmModal(true);
          return;
        }

        // This is a downgrade within the same billing cycle (lower tier)
        if (
          currentPlanIndex !== -1 &&
          thisPlanIndex < currentPlanIndex &&
          subscriptionData.selectedBillingCycle === viewingCycle
        ) {
          setSelectedPlanForDowngrade(plan);
          setShowDowngradeConfirmModal(true);
          return;
        }
      }

      // New subscription or different billing cycle
      navigate("/account-settings/subscription/card-details", {
        state: {
          plan: {
            ...plan,
            billingCycle: isAnnual ? "annual" : "monthly",
            user: user,
            invoiceId: subscriptionData.invoiceId,
            razorpayPlanIds: subscriptionData.razorpayPlanId,
          },
          isUpgrading: false,
        },
      });
    } catch (error) {
      console.error("Error submitting plan:", error);
      toast.error("Failed to process plan selection");
    } finally {
      setLoadingPlanId(null);
    }
  };

  const isHighlighted = (plan) =>
    hoveredPlan ? hoveredPlan === plan.name : plan.isDefault;

  return (
    <>
      <div className="space-y-6 sm:mt-10 md:mt-20">
        {/* Hidden element for Razorpay */}
        <div id="razorpay-card-update" style={{ display: "none" }}></div>

        {/* Header Section - Always visible */}
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Subscription</h2>
            {!loading &&
              subscriptionData &&
              subscriptionData.status === "active" &&
              (organization !== "false" ||
                subscriptionData.planName !== "Base") && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className={`bg-custom-blue hover:bg-custom-blue/80 py-2 px-4 rounded-lg text-white`}
                >
                  Cancel Subscription
                </button>
              )}
          </div>
        </div>

        {/* Current Plan Section */}
        {loading ? (
          <CurrentPlanSkeleton />
        ) : (
          <div className="lg:p-7 md:p-4 bg-white rounded-xl relative">
            {/* Billing toggle */}
            <div className="flex justify-between items-start p-4">
              <div>
                <h3 className="text-base sm:text-lg md:text-xl font-medium">{`Current Plan: ${subscriptionData.planName} (${subscriptionData.selectedBillingCycle})`}</h3>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  Next billing date:{" "}
                  {subscriptionData.nextBillingDate
                    ? new Date(
                        subscriptionData.nextBillingDate
                      ).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              <span
                className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${
                  subscriptionData.status === "active"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {subscriptionData.status
                  ? subscriptionData.status.charAt(0).toUpperCase() +
                    subscriptionData.status.slice(1)
                  : "inactive"}
              </span>
            </div>
          </div>
        )}

        {/* Toggle Section */}
        {loading ? (
          <BillingToggleSkeleton />
        ) : (
          <div className="flex justify-center items-center space-x-2 mb-16">
            <p
              className={`text-custom-blue ${
                !isAnnual
                  ? "font-semibold text-base sm:text-lg md:text-xl"
                  : "font-medium text-sm sm:text-base md:text-lg"
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
                  isAnnual ? "translate-x-6 bg-white" : "translate-x-0 bg-white"
                }`}
              ></div>
            </div>
            <p
              className={`text-[#217989] ${
                isAnnual
                  ? "font-semibold text-base sm:text-lg md:text-xl"
                  : "font-medium text-sm sm:text-base md:text-lg"
              }`}
            >
              Bill Annually
            </p>
          </div>
        )}

        {/* Plans Section */}
        {loading ? (
          <SubscriptionPlansSkeleton />
        ) : (
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 pt-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`shadow-lg rounded-3xl relative transition-all duration-300 p-6 ${
                    isHighlighted(plan)
                      ? "-translate-y-2 md:-translate-y-4 lg:-translate-y-6 xl:-translate-y-6 2xl:-translate-y-6 z-10 bg-[#217989] text-white transform scale-[1.02]"
                      : "bg-white text-[#217989] hover:shadow-xl hover:-translate-y-1"
                  }`}
                  onMouseEnter={() => setHoveredPlan(plan.name)}
                  onMouseLeave={() => setHoveredPlan(null)}
                  style={{
                    minHeight: "420px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h5
                      className={`text-xl sm:text-2xl md:text-3xl font-bold ${
                        isHighlighted(plan) ? "text-white" : "text-[#217989]"
                      }`}
                    >
                      {plan.name}
                    </h5>
                    {isAnnual
                      ? plan.annualBadge && (
                          <span className="bg-white text-purple-600 font-semibold text-sm py-1 px-2 rounded-md">
                            {plan.annualBadge}
                          </span>
                        )
                      : plan.monthlyBadge && (
                          <span className="bg-white text-purple-600 font-semibold text-sm py-1 px-2 rounded-md">
                            {plan.monthlyBadge}
                          </span>
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
                      <span className="text-sm sm:text-base md:text-lg font-medium">
                        {" "}
                        /{isAnnual ? "year" : "month"}
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={() => submitPlans(plan)}
                    className={`w-full font-semibold py-2 mt-4 rounded-lg sm:text-xs
                ${
                  isHighlighted(plan)
                    ? "bg-white text-custom-blue"
                    : "text-white bg-custom-blue"
                }
                ${
                  subscriptionData.subscriptionPlanId === plan.planId &&
                  subscriptionData.selectedBillingCycle ===
                    (isAnnual ? "annual" : "monthly") &&
                  subscriptionData.status === "active"
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }
                ${(() => {
                  // Check if this is an upgrade button
                  if (subscriptionData.subscriptionPlanId) {
                    const viewingCycle = isAnnual ? "annual" : "monthly";
                    const isSamePlan =
                      subscriptionData.subscriptionPlanId === plan.planId;
                    // Monthly -> Annual on the same plan should show upgrade animation
                    if (
                      (isSamePlan || !isSamePlan) &&
                      subscriptionData.selectedBillingCycle === "monthly" &&
                      viewingCycle === "annual"
                    ) {
                      return "upgrade-button-animation";
                    }
                    const currentPlanIndex = plans.findIndex(
                      (p) => p.planId === subscriptionData.subscriptionPlanId
                    );
                    const thisPlanIndex = plans.findIndex(
                      (p) => p.planId === plan.planId
                    );
                    if (
                      currentPlanIndex !== -1 &&
                      thisPlanIndex > currentPlanIndex &&
                      subscriptionData.selectedBillingCycle ===
                        viewingCycle
                    ) {
                      return "upgrade-button-animation";
                    }
                  }
                  return "";
                })()}`}
                    disabled={
                      subscriptionData.subscriptionPlanId === plan.planId &&
                      subscriptionData.selectedBillingCycle ===
                        (isAnnual ? "annual" : "monthly") &&
                      subscriptionData.status === "active"
                    }
                  >
                    {loadingPlanId === plan.planId ? (
                      <span className="flex items-center justify-center">
                        <svg
                          className="animate-spin h-5 w-5 mr-2"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                            fill="none"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Processing...
                      </span>
                    ) : subscriptionData.subscriptionPlanId === plan.planId &&
                      subscriptionData.selectedBillingCycle ===
                        (isAnnual ? "annual" : "monthly") &&
                      subscriptionData.status === "active" ? (
                      "Subscribed"
                    ) : subscriptionData.subscriptionPlanId === plan.planId &&
                      subscriptionData.selectedBillingCycle ===
                        (isAnnual ? "annual" : "monthly") &&
                      subscriptionData.status === "created" ? (
                      "Continue to Payment"
                    ) : (
                      (() => {
                        // Determine if this plan is higher or lower than current plan
                        if (subscriptionData.subscriptionPlanId) {
                          const viewingCycle = isAnnual ? "annual" : "monthly";
                          const currentCycle =
                            subscriptionData.selectedBillingCycle;
                          const isSamePlan =
                            subscriptionData.subscriptionPlanId ===
                            plan.planId;

                          // Show Upgrade/Downgrade when switching billing cycle on the same plan
                          if ((isSamePlan || !isSamePlan) && currentCycle !== viewingCycle) {
                            return currentCycle === "monthly" && viewingCycle === "annual"
                              ? "Upgrade"
                              : "Downgrade";
                          }
                          
                          const currentPlanIndex = plans.findIndex(
                            (p) =>
                              p.planId === subscriptionData.subscriptionPlanId
                          );
                          const thisPlanIndex = plans.findIndex(
                            (p) => p.planId === plan.planId
                          );

                          // Only compare plans when viewing the same billing cycle as the current subscription
                          // if (
                          //   subscriptionData.selectedBillingCycle !==
                          //   (isAnnual ? "annual" : "monthly")
                          // ) {
                          //   return "Choose";
                          // }

                          // If current plan index exists and this plan index exists
                          if (currentPlanIndex !== -1 && thisPlanIndex !== -1) {
                            return thisPlanIndex > currentPlanIndex
                              ? "Upgrade"
                              : "Downgrade";
                          }
                        }
                        return "Choose";
                      })()
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Cancel Subscription Modal */}
      {/* v1.0.1 <---------------------------------------------------------------------- */}
      {/* {showCancelModal && (
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
      )} */}
      {showCancelModal &&
        createPortal(
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
              <h2 className="text-xl font-semibold mb-4 text-custom-blue">
                Cancel Subscription
              </h2>
              <p className="mb-4 text-sm sm:text-base text-gray-600">
                Are you sure you want to cancel your{" "}
                <span className="font-medium">
                  {subscriptionData?.planName || "current"} with{" "}
                  {subscriptionData?.membershipType || "monthly"}
                </span>{" "}
                subscription?
              </p>
              <p className="mb-6 text-sm sm:text-base text-gray-600">
                Your subscription will be cancelled immediately and you will
                lose access to premium features.
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
                  {loading ? "Processing..." : "Cancel Subscription"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      {/* v1.0.1 ----------------------------------------------------------------------> */}
      {/* Upgrade Confirmation Modal */}
      {showUpgradeConfirmModal && selectedPlanForUpgrade && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center right-0 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4 text-custom-blue">
              Upgrade Subscription
            </h2>
            <p className="mb-4 text-sm sm:text-base text-gray-600">
              Are you sure you want to upgrade to{" "}
              <span className="font-medium">{selectedPlanForUpgrade.name}</span>
              ?
            </p>
            <p className="mb-6 text-sm sm:text-base text-gray-600">
            Your current subscription will be cancelled automatically and a new subscription will be created with the selected plan and billing cycle with the difference in price.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowUpgradeConfirmModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition duration-150"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowUpgradeConfirmModal(false);
                  updateSubscriptionPlan(selectedPlanForUpgrade);
                }}
                className="px-4 py-2 bg-custom-blue text-white rounded-md hover:bg-custom-blue/80 transition duration-150"
              >
                Upgrade
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Downgrade Confirmation Modal */}
      {showDowngradeConfirmModal && selectedPlanForDowngrade && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center right-0 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-semibold mb-4 text-custom-blue">
              Downgrade Subscription
            </h2>
            <p className="mb-4 text-sm sm:text-base text-gray-600">
              Are you sure you want to downgrade to{" "}
              <span className="font-medium">{selectedPlanForDowngrade.name}</span>
              ?
            </p>
            <p className="mb-6 text-sm sm:text-base text-gray-600">
              Your current subscription will be cancelled automatically and a new subscription will be created with the selected plan and billing cycle with the difference in price.
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDowngradeConfirmModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition duration-150"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowDowngradeConfirmModal(false);
                  updateSubscriptionPlan(selectedPlanForDowngrade);
                }}
                className="px-4 py-2 bg-custom-blue text-white rounded-md hover:bg-custom-blue/80 transition duration-150"
              >
                Downgrade
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Subscription;
