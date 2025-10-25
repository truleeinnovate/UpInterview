// ----- v1.0.0 ----- Venkatesh----update LoadingButton colors
// v1.0.1 - Ashok - fixed z-index issue when popup is open
// v1.0.2 - Ashok - Improved responsiveness
// v1.0.3 - Ashok - made alignment of cards in small screens

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
// v1.0.1 <---------------------------------------------
import { createPortal } from "react-dom";
// v1.0.1 --------------------------------------------->
import toast from "react-hot-toast";
import "./subscription-animations.css";
import { useSubscription } from "../../../../../apiHooks/useSubscription";
import { usePermissions } from "../../../../../Context/PermissionsContext";
import { usePermissionCheck } from "../../../../../utils/permissionUtils";
import { notify } from "../../../../../services/toastService";

// Helper function to format date as dd-mm-yy
const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "N/A";
  
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yy = String(date.getFullYear()).slice(-2);
  
  return `${dd}-${mm}-${yy}`;
};

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
    // v1.0.2 <-----------------------------------------------------------------
    <div className="mb-16">
      <div className="flex justify-center items-center gap-2 skeleton-animation">
    {/*  v1.0.2 <-----------------------------------------------------------------> */}
        <div className="h-6 bg-gray-200 rounded w-24"></div>
        <div className="w-12 h-6 bg-gray-200 rounded-full"></div>
        <div className="h-6 bg-gray-200 rounded w-24"></div>
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
  const {
    subscriptionData,
    plans,
    isSubscriptionLoading,
    isPlansLoading,
    isMutationLoading,
    updateSubscriptionPlan,
    cancelSubscription,
    createCustomerSubscription,
    ownerId,
    tenantId,
    organization,
    userType,
    refetchSubscription,
    refetchPlans,
  } = useSubscription();
  console.log("subscriptionData",subscriptionData);
  const [isAnnual, setIsAnnual] = useState(false);
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const user = { userType, tenantId, ownerId };
  const navigate = useNavigate();
  const toggleBilling = () => setIsAnnual(!isAnnual);
  const loading = isSubscriptionLoading || isPlansLoading;
  const isBusy = isMutationLoading;
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpgradeConfirmModal, setShowUpgradeConfirmModal] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState(null);
  const [showDowngradeConfirmModal, setShowDowngradeConfirmModal] =
    useState(false);
  const [selectedPlanForDowngrade, setSelectedPlanForDowngrade] =
    useState(null);
  const [loadingPlanId, setLoadingPlanId] = useState(null);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [selectedPlanForRenewal, setSelectedPlanForRenewal] = useState(null);

  // Check if subscription is expired
  const isSubscriptionExpired = subscriptionData?.status === "expired";

  // Helper to get numeric price for a plan given billing cycle
  const getPlanPrice = (plan, cycle) => {
    const raw = cycle === "annual" ? plan?.annualPrice : plan?.monthlyPrice;
    const num = typeof raw === "string" ? parseFloat(raw) : raw;
    return Number.isFinite(num) ? num : null;
  };

  // Sync billing toggle with subscription data
  useEffect(() => {
    if (subscriptionData?.selectedBillingCycle === "annual") {
      setIsAnnual(true);
    } else if (subscriptionData?.selectedBillingCycle === "monthly") {
      setIsAnnual(false);
    }
  }, [subscriptionData?.selectedBillingCycle]);

  // Plans are provided by useSubscription hook

  const handleCancelSubscription = async () => {
    try {
      setShowCancelModal(false);
      await cancelSubscription({ reason: "user_requested" });
      // Force immediate data refresh so UI reflects cancelled status without manual reload
      await refetchSubscription();
      await refetchPlans();
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error(
        error?.response?.data?.message || "Failed to cancel subscription",
        { duration: 5000 }
      );
    }
  };

  const handleUpdateSubscriptionPlan = async (plan) => {
    try {
      await updateSubscriptionPlan({
        planId: plan.planId,  // Now planId is the ObjectId from useSubscription
        billingCycle: isAnnual ? "annual" : "monthly",
      });
    } catch (error) {
      console.error("Error updating subscription plan:", error);
      toast.error(
        error?.response?.data?.message || "Failed to update subscription plan"
      );
    }
  };

  const submitPlans = async (plan) => {
    setLoadingPlanId(plan.planId);
    try {
      const viewingCycle = isAnnual ? "annual" : "monthly";
      const selectedPrice = getPlanPrice(plan, viewingCycle);
      const isFreePlan = Number(selectedPrice) === 0;

      if (
        subscriptionData.subscriptionPlanId === plan.planId &&
        subscriptionData.selectedBillingCycle === viewingCycle &&
        subscriptionData.status === "active"
      ) {
        return; // Already subscribed to this plan
      }

      // Handle Free Plan - Create/Update directly with active status
      if (isFreePlan) {
        const payload = {
          planDetails: {
            subscriptionPlanId: plan.planId,
            monthlyPrice: plan.monthlyPrice,
            annualPrice: plan.annualPrice,
            monthDiscount: plan.monthlyDiscount || 0,
            annualDiscount: plan.annualDiscount || 0,
          },
          userDetails: {
            tenantId,
            ownerId,
            membershipType: viewingCycle,
            userType,
          },
          status: "active", // Set to active for free plans
          totalAmount: 0,
        };
        
        await createCustomerSubscription(payload);
        toast.success("Free plan activated successfully!");
        await refetchSubscription();
        await refetchPlans();
        return;
      }

      if (
        subscriptionData.subscriptionPlanId === plan.planId &&
        subscriptionData.selectedBillingCycle === viewingCycle &&
        subscriptionData.status === "created"
      ) {
        // Continue to payment for existing subscription
        navigate("/account-settings/subscription/card-details", {
          state: {
            plan: {
              ...plan,
              billingCycle: viewingCycle,
              user: user,
              invoiceId: subscriptionData.invoiceId,
              razorpayPlanIds: plan.razorpayPlanIds,
            },
            isUpgrading: false,
          },
        });
        return;
      }

      // If there's no active Razorpay subscription (e.g. on Free plan or cancelled subscription), create a new subscription
      const hasRazorpaySubscription = Boolean(subscriptionData?.razorpaySubscriptionId);
      const isSubscriptionCancelled = subscriptionData?.status === "cancelled";
      if (!hasRazorpaySubscription || isSubscriptionCancelled) {
        navigate("/account-settings/subscription/card-details", {
          state: {
            plan: {
              ...plan,
              billingCycle: viewingCycle,
              user: user,
              razorpayPlanIds: plan.razorpayPlanIds,
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
        const isSamePlan = subscriptionData.subscriptionPlanId === plan.planId;

        // Treat monthly -> annual on the same plan as an upgrade
        if (
          (isSamePlan || !isSamePlan) &&
          currentCycle === "monthly" &&
          viewingCycle === "annual"
        ) {
          setSelectedPlanForUpgrade(plan);
          setShowUpgradeConfirmModal(true);
          return;
        }

        // Treat annual -> monthly on the same plan as a downgrade
        if (
          (isSamePlan || !isSamePlan) &&
          currentCycle === "annual" &&
          viewingCycle === "monthly"
        ) {
          setSelectedPlanForDowngrade(plan);
          setShowDowngradeConfirmModal(true);
          return;
        }

        // Within the same billing cycle, compare plan price first (fallback to index)
        if (
          subscriptionData.selectedBillingCycle === viewingCycle &&
          currentPlanIndex !== -1 &&
          thisPlanIndex !== -1
        ) {
          const currentPlan = plans[currentPlanIndex];
          const currentPrice = getPlanPrice(currentPlan, viewingCycle);
          const thisPrice = getPlanPrice(plan, viewingCycle);

          if (currentPrice != null && thisPrice != null) {
            if (thisPrice > currentPrice) {
              setSelectedPlanForUpgrade(plan);
              setShowUpgradeConfirmModal(true);
              return;
            } else if (thisPrice < currentPrice) {
              setSelectedPlanForDowngrade(plan);
              setShowDowngradeConfirmModal(true);
              return;
            }
          }

          // Fallback to index comparison (or equal price)
          if (thisPlanIndex > currentPlanIndex) {
            setSelectedPlanForUpgrade(plan);
            setShowUpgradeConfirmModal(true);
            return;
          }
          if (thisPlanIndex < currentPlanIndex) {
            setSelectedPlanForDowngrade(plan);
            setShowDowngradeConfirmModal(true);
            return;
          }
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
            razorpayPlanIds: plan.razorpayPlanIds,
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

  // Handle subscription renewal
  const handleRenewalConfirm = async () => {
    if (!selectedPlanForRenewal) return;
    
    try {
      setShowRenewalModal(false);
      await submitPlans(selectedPlanForRenewal);
      notify.success("🎉 Subscription renewed successfully!");
    } catch (error) {
      console.error("Renewal error:", error);
      toast.error("Failed to renew subscription. Please try again.");
    }
  };

  // Handle plan selection for renewal
  const handleRenewalPlanSelection = (plan) => {
    setSelectedPlanForRenewal(plan);
    setShowRenewalModal(true);
  };

  return (
    <>
      {/* v1.0.2 <--------------------------------------------------- */}
      <div className="space-y-6 sm:mt-10 sm:mx-2 md:mt-20">
        {/* v1.0.2 <--------------------------------------------------- */}
        {/* Hidden element for Razorpay */}
        <div id="razorpay-card-update" style={{ display: "none" }}></div>

        {/* Header Section - Always visible */}
        <div className="flex-1">
          <div className="flex justify-between items-center">
            {/* v1.0.2 <--------------------------------------------------- */}
            <h2 className="sm:text-xl text-2xl font-bold">Subscription</h2>
            {/* v1.0.2 ---------------------------------------------------> */}

            {!loading &&
              subscriptionData &&
              (subscriptionData.status === "active" || isSubscriptionExpired) &&
              subscriptionData.planName !== "Free" && (
                <button
                  onClick={() => isSubscriptionExpired ? setShowRenewalModal(true) : setShowCancelModal(true)}
                  className={`${
                    isSubscriptionExpired 
                      ? 'bg-green-600 hover:bg-green-700 animate-pulse' 
                      : 'bg-custom-blue hover:bg-custom-blue/80'
                  } py-2 px-4 rounded-lg text-white transition-all duration-300 font-semibold`}
                >
                  {isSubscriptionExpired ? "🔄 Renew Subscription" : "Cancel Subscription"}
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
                {/* v1.0.2 <------------------------------------------------------- */}
                <h3 className="text-base sm:text-sm md:text-xl font-medium">{`Current Plan: ${subscriptionData?.planName ? subscriptionData?.planName : "Plan Name Not Available"} (${subscriptionData?.selectedBillingCycle ? subscriptionData?.selectedBillingCycle : "Billing Cycle Not Available"})`}</h3>
                <p className="text-gray-600 mt-1 sm:text-sm md:text-base lg:text-base xl:text-base 2xl:text-base">
                  {/* v1.0.2 <------------------------------------------------------- */}
                  {isSubscriptionExpired ? (
                    <>
                      <span className="text-red-600 font-semibold">⚠️ Subscription Expired</span> on {subscriptionData.endDate ? formatDate(subscriptionData.endDate) : "N/A"}
                    </>
                  ) : (
                    <>
                      Next billing date:{" "}
                      {subscriptionData.nextBillingDate
                        ? formatDate(subscriptionData.nextBillingDate)
                        : "N/A"}
                    </>
                  )}
                </p>
              </div>
              <span
                className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${
                  subscriptionData.status === "active"
                    ? "bg-green-100 text-green-800"
                    : subscriptionData.status === "expired"
                      ? "bg-red-100 text-red-800 animate-pulse"
                      : subscriptionData.status === "cancelled"
                        ? "bg-gray-100 text-gray-800"
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
          <div className="w-full px-4 sm:px-6 lg:px-8 pt-8">
            {/* v1.0.3 <--------------------------------------------------------------------------------------------- */}
            <div className="grid grid-cols-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* v1.0.3 ---------------------------------------------------------------------------------------------> */}
              {plans.map((plan) => {
                // Get actual price
                const actualPrice = isAnnual ? plan.annualPrice : plan.monthlyPrice;
                const monthlyPrice = plan.monthlyPrice;
                
                // Define static higher prices for organizations to show as strikethrough
                const getStaticHigherPrice = (planName, isAnnual) => {
                  if (planName === 'Starter') {
                    return isAnnual ? 19999 : 1999; // Monthly: 1999, Annual: 19999
                  } else if (planName === 'Professional' || planName === 'Pro') {
                    return isAnnual ? 42999 : 4299; // Monthly: 4299, Annual: 42999
                  }
                  return actualPrice; // For other plans, use actual price
                };

                const staticHigherPrice = getStaticHigherPrice(plan.name, isAnnual);
                const shouldShowLimitedOffer = organization && !isAnnual &&
                  (plan.name === 'Starter' || plan.name === 'Professional' || plan.name === 'Pro');
                const shouldShowSavings = organization && isAnnual &&
                  (plan.name === 'Starter' || plan.name === 'Professional' || plan.name === 'Pro');
                
                // Calculate savings for individuals on annual plans
                const individualAnnualSavings = !organization && isAnnual && monthlyPrice > 0 ? 
                  (monthlyPrice * 12 - actualPrice) : 0;
                const shouldShowIndividualSavings = !organization && isAnnual && individualAnnualSavings > 0;
                
                const savingsAmount = organization ? (staticHigherPrice - actualPrice) : individualAnnualSavings;
                const isEnterprise = plan.name === 'Enterprise';
                const isFree = plan.name === 'Free' || actualPrice === 0;

                return (
                  <div
                    key={plan.name}
                    className={`shadow-lg rounded-2xl relative transition-all duration-300 flex flex-col h-full ${
                      isHighlighted(plan)
                        ? "-translate-y-2 md:-translate-y-3 z-10 bg-[#217989] text-white transform scale-[1.02]"
                        : "bg-white text-[#217989] hover:shadow-xl hover:-translate-y-1"
                    }`}
                    onMouseEnter={() => setHoveredPlan(plan.name)}
                    onMouseLeave={() => setHoveredPlan(null)}
                    style={{ minHeight: "500px" }}
                  >
                    <div className="p-5 flex flex-col h-full">
                    {/* Most Popular Badge - Professional for orgs, Premium for individuals */}
                    {((organization && (plan.name === 'Professional' || plan.name === 'Pro')) || 
                      (!organization && plan.name === 'Premium')) && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-[#217989] text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-md">
                          Most Popular
                        </span>
                      </div>
                    )}

                    {/* Plan Name - Centered */}
                    <div className="text-start mb-4">
                      <h5
                        className={`text-xl md:text-2xl font-bold ${
                          isHighlighted(plan) ? "text-white" : "text-[#217989]"
                        }`}
                      >
                        {plan?.name ? plan?.name : "Plan Name Not Available"}
                      </h5>
                    </div>

                    

                    {/* Features List */}
                    <div className="flex-grow" style={{ minHeight: "200px", marginBottom: "16px" }}>
                      <ul className="space-y-2.5 text-sm">
                        {plan.features && plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center">
                            <span className={`mr-2 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                              isHighlighted(plan) 
                                ? "bg-white/20 text-white" 
                                : "bg-green-100 text-green-600"
                            }`}>
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                              </svg>
                            </span>
                            <span className="leading-snug">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Price Section */}
                    <div className="text-start mb-4">
                      {shouldShowLimitedOffer ? (
                        // Monthly plans for organizations - Show strikethrough and Limited-Time Offer
                        <div>
                          <p className={`text-xl sm:text-2xl md:text-3xl font-bold line-through ${
                            isHighlighted(plan) ? "text-white/70" : "text-gray-400"
                          }`}>
                            <span className="text-base sm:text-lg md:text-xl">₹</span>
                            {staticHigherPrice.toLocaleString('en-IN')}
                          </p>
                          <p className={`text-xs font-medium mt-1 ${
                            isHighlighted(plan) ? "text-white/80" : "text-gray-500"
                          }`}>
                            per month
                          </p>
                          <div className="mt-1">
                            <span className={`inline-block px-3 py-1.5 rounded-md text-xs font-semibold ${
                              isHighlighted(plan) 
                                ? "bg-white/20 text-white" 
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                              Limited-Time Offer: ₹{actualPrice.toLocaleString('en-IN')} / month
                            </span>
                          </div>
                        </div>
                      ) : shouldShowSavings ? (
                        // Annual plans for organizations - Show actual price and savings
                        <div>
                          <p className={`text-xl sm:text-2xl md:text-3xl font-bold ${
                            isHighlighted(plan) ? "text-white" : "text-[#217989]"
                          }`}>
                            <span className="text-base sm:text-lg md:text-xl">₹</span>
                            {actualPrice.toLocaleString('en-IN')}
                          </p>
                          <p className={`text-xs font-medium mt-1 ${
                            isHighlighted(plan) ? "text-white/80" : "text-gray-600"
                          }`}>
                            per year
                          </p>
                          <div className="mt-1">
                            <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${
                              isHighlighted(plan) 
                                ? "bg-green-100/20 text-white border border-white/30" 
                                : "bg-green-50 text-green-700 border border-green-200"
                            }`}>
                              <span className="text-sm">🔥</span>
                              Save ₹{savingsAmount.toLocaleString('en-IN')}/year
                            </span>
                          </div>
                        </div>
                      ) : isEnterprise ? (
                        // Enterprise plan - Show custom pricing
                        <div>
                          <p className={`text-xl sm:text-2xl md:text-3xl font-bold ${
                            isHighlighted(plan) ? "text-white" : "text-[#217989]"
                          }`}>
                            Custom
                          </p>
                          <p className={`text-xs font-medium mt-1 ${
                            isHighlighted(plan) ? "text-white/80" : "text-gray-600"
                          }`}>
                            pricing
                          </p>
                        </div>
                      ) : isFree ? (
                        // Free plan - Show ₹0 forever
                        <div>
                          <p className={`text-xl sm:text-2xl md:text-3xl font-bold ${
                            isHighlighted(plan) ? "text-white" : "text-[#217989]"
                          }`}>
                            <span className="text-base sm:text-lg md:text-xl">₹</span>
                            0
                          </p>
                          <p className={`text-xs font-medium mt-1 ${
                            isHighlighted(plan) ? "text-white/80" : "text-gray-600"
                          }`}>
                            forever
                          </p>
                        </div>
                      ) : shouldShowIndividualSavings ? (
                        // Individual annual plans - Show price with savings
                        <div>
                          <p className={`text-xl sm:text-2xl md:text-3xl font-bold ${
                            isHighlighted(plan) ? "text-white" : "text-[#217989]"
                          }`}>
                            <span className="text-base sm:text-lg md:text-xl">₹</span>
                            {actualPrice.toLocaleString('en-IN')}
                          </p>
                          <p className={`text-xs font-medium mt-1 ${
                            isHighlighted(plan) ? "text-white/80" : "text-gray-600"
                          }`}>
                            per year
                          </p>
                          <div className="mt-1">
                            <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${
                              isHighlighted(plan) 
                                ? "bg-green-100/20 text-white border border-white/30" 
                                : "bg-green-50 text-green-700 border border-green-200"
                            }`}>
                              Save ₹{savingsAmount.toLocaleString('en-IN')}/year
                            </span>
                          </div>
                        </div>
                      ) : (
                        // Regular pricing for individuals or other cases
                        <div>
                          <p className={`text-xl sm:text-2xl md:text-3xl font-bold ${
                            isHighlighted(plan) ? "text-white" : "text-[#217989]"
                          }`}>
                            <span className="text-base sm:text-lg md:text-xl">₹</span>
                            {actualPrice.toLocaleString('en-IN')}
                            <span className="text-xs font-medium">
                              {" "}
                              / {isAnnual ? "year" : "month"}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Button Section */}
                    <button
                      onClick={() => !isEnterprise && (isSubscriptionExpired ? handleRenewalPlanSelection(plan) : submitPlans(plan))}
                      className={`w-full font-semibold py-2.5 mt-auto rounded-lg text-sm
                ${
                  isHighlighted(plan)
                    ? "bg-white text-custom-blue"
                    : isSubscriptionExpired 
                      ? "text-white bg-green-600 hover:bg-green-700 animate-pulse"
                      : "text-white bg-custom-blue"
                }
                ${
                  isEnterprise
                    ? "opacity-50 cursor-not-allowed"
                    : subscriptionData.subscriptionPlanId === plan.planId &&
                      subscriptionData.selectedBillingCycle ===
                        (isAnnual ? "annual" : "monthly") &&
                      subscriptionData.status === "active"
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                }
                ${(() => {
                  // Check if this is an upgrade button - No animation for Enterprise or cancelled subscriptions
                  if (isEnterprise || subscriptionData.status === "cancelled") return "";
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
                      subscriptionData.selectedBillingCycle === viewingCycle &&
                      currentPlanIndex !== -1 &&
                      thisPlanIndex !== -1
                    ) {
                      const currentPlan = plans[currentPlanIndex];
                      const currentPrice = getPlanPrice(
                        currentPlan,
                        viewingCycle
                      );
                      const thisPrice = getPlanPrice(plan, viewingCycle);
                      if (currentPrice != null && thisPrice != null) {
                        if (thisPrice > currentPrice) {
                          return "upgrade-button-animation";
                        }
                      }
                      if (thisPlanIndex > currentPlanIndex) {
                        return "upgrade-button-animation";
                      }
                    }
                  }
                  return "";
                })()}`}
                    disabled={
                      isEnterprise ||
                      (subscriptionData.subscriptionPlanId === plan.planId &&
                      subscriptionData.selectedBillingCycle ===
                        (isAnnual ? "annual" : "monthly") &&
                      subscriptionData.status === "active")
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
                    ) : isEnterprise ? (
                      "Contact Sales"
                    ) : isSubscriptionExpired ? (
                      "🔄 Renew"
                    ) : subscriptionData.status === "cancelled" ? (
                      "Choose"
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
                        // Don't show upgrade/downgrade if subscription is cancelled
                        if (subscriptionData.subscriptionPlanId && subscriptionData.status !== "cancelled") {
                          const viewingCycle = isAnnual ? "annual" : "monthly";
                          const currentCycle =
                            subscriptionData.selectedBillingCycle;
                          const isSamePlan =
                            subscriptionData.subscriptionPlanId === plan.planId;

                          // Show Upgrade/Downgrade when switching billing cycle on the same plan
                          if (
                            (isSamePlan || !isSamePlan) &&
                            currentCycle !== viewingCycle
                          ) {
                            return currentCycle === "monthly" &&
                              viewingCycle === "annual"
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

                          // If current plan index exists and this plan index exists
                          if (currentPlanIndex !== -1 && thisPlanIndex !== -1) {
                            const currentPlan = plans[currentPlanIndex];
                            const currentPrice = getPlanPrice(
                              currentPlan,
                              viewingCycle
                            );
                            const thisPrice = getPlanPrice(plan, viewingCycle);
                            if (
                              currentPrice != null &&
                              thisPrice != null &&
                              thisPrice !== currentPrice
                            ) {
                              return thisPrice > currentPrice
                                ? "Upgrade"
                                : "Downgrade";
                            }
                            if (thisPlanIndex > currentPlanIndex) return "Upgrade";
                            if (thisPlanIndex < currentPlanIndex)
                              return "Downgrade";
                          }
                        }
                        return "Choose";
                      })()
                    )}
                    </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {/* Cancel Subscription Modal */}

      {showCancelModal &&
        createPortal(
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
            {/* v1.0.2 <------------------------------------------------------------- */}
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full m-4">
            {/* v1.0.2 <------------------------------------------------------------- */}
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
      {/* v1.0.2 <---------------------------------------------------------------------- */}
      {showUpgradeConfirmModal &&
        selectedPlanForUpgrade &&
        createPortal(
          <div className="fixed inset-0 bg-gray-500 bg-opacity-70 flex justify-center items-center right-0 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full m-4">
              <h2 className="sm:text-lg text-xl font-semibold mb-4 text-custom-blue">
                Upgrade Subscription
              </h2>
              <p className="mb-4 sm:text-sm md:text-base lg:text-base xl:text-base 2xl:text-base text-gray-600">
                Are you sure you want to upgrade to{" "}
                <span className="font-medium">
                  {selectedPlanForUpgrade.name}
                </span>
                ?
              </p>
              <p className="mb-6 sm:text-sm md:text-base lg:text-base xl:text-base 2xl:text-base text-gray-600">
                Your current subscription will be cancelled automatically and a
                new subscription will be created with the selected plan and
                billing cycle with the difference in price.
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
                    handleUpdateSubscriptionPlan(selectedPlanForUpgrade);
                  }}
                  className="px-4 py-2 bg-custom-blue text-white rounded-md hover:bg-custom-blue/80 transition duration-150"
                >
                  Upgrade
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      {/* v1.0.2 ----------------------------------------------------------------------> */}

      {/* v1.0.2 <---------------------------------------------------------------------- */}
      {/* Downgrade Confirmation Modal */}
      {showDowngradeConfirmModal &&
        selectedPlanForDowngrade &&
        createPortal(
          <div className="fixed inset-0 bg-gray-500 bg-opacity-70 flex justify-center items-center right-0 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full m-4">
              <h2 className="sm:text-lg text-xl font-semibold mb-4 text-custom-blue">
                Downgrade Subscription
              </h2>
              <p className="mb-4 sm:text-sm md:text-base lg:text-base xl:text-base 2xl:text-base text-gray-600">
                Are you sure you want to downgrade to{" "}
                <span className="font-medium">
                  {selectedPlanForDowngrade.name}
                </span>
                ?
              </p>
              <p className="mb-6 sm:text-sm md:text-base lg:text-base xl:text-base 2xl:text-base text-gray-600">
                Your current subscription will be cancelled automatically and a
                new subscription will be created with the selected plan and
                billing cycle with the difference in price.
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
                    handleUpdateSubscriptionPlan(selectedPlanForDowngrade);
                  }}
                  className="px-4 py-2 bg-custom-blue text-white rounded-md hover:bg-custom-blue/80 transition duration-150"
                >
                  Downgrade
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      
      {/* Renewal Subscription Modal */}
      {showRenewalModal &&
        createPortal(
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full m-4 animate-slide-in">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 rounded-full p-3 mr-3 animate-pulse">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-custom-blue">
                  Renew Your Subscription
                </h2>
              </div>
              
              {selectedPlanForRenewal ? (
                <>
                  <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-700 mb-2">
                      You're about to renew:
                    </p>
                    <p className="font-semibold text-lg text-green-700">
                      {selectedPlanForRenewal.name} Plan
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {isAnnual ? "Annual" : "Monthly"} billing - ₹
                      {isAnnual 
                        ? selectedPlanForRenewal.annualPrice?.toLocaleString('en-IN')
                        : selectedPlanForRenewal.monthlyPrice?.toLocaleString('en-IN')
                      }
                      /{isAnnual ? "year" : "month"}
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-sm text-gray-600">
                      ✨ Your subscription will be activated immediately after successful payment.
                    </p>
                  </div>
                  
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={() => {
                        setShowRenewalModal(false);
                        setSelectedPlanForRenewal(null);
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition duration-150"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRenewalConfirm}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition duration-150 flex items-center animate-pulse"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          🔄 Renew Now
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-600 mb-4">Please select a plan from below to renew your subscription.</p>
                  <button
                    onClick={() => setShowRenewalModal(false)}
                    className="px-4 py-2 bg-custom-blue text-white rounded-md hover:bg-custom-blue/80 transition duration-150"
                  >
                    Select a Plan
                  </button>
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
      {/* v1.0.2 ----------------------------------------------------------------------> */}
    </>
  );
};

export default Subscription;
