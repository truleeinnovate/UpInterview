// v1.0.0 - Venkatesh - Added subscription status check to prevent already-subscribed users from accessing subscription plans page
// v1.0.1 - Ashok - Fixed cards background color and grid layout for md screens
// v1.0.2 - Ashok - fixed contact sales popup open and close

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { config } from "../../../config.js";
import toast from "react-hot-toast";
import { decodeJwt } from "../../../utils/AuthCookieManager/jwtDecode.js";
import Cookies from "js-cookie";
import { useSubscription } from "../../../apiHooks/useSubscription.js";
import { notify } from "../../../services/toastService.js";
import SidebarPopup from "../../../Components/Shared/SidebarPopup/SidebarPopup.jsx";
import ContactSalesForm from "../../../Components/common/EnterpriseContactSalesForm.jsx";
import { validateWorkEmail } from "../../../utils/workEmailValidation.js";

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
  const {
    plans,
    subscriptionData,
    createCustomerSubscription,
    isSubscriptionLoading,
    isPlansLoading,
  } = useSubscription();
  const loading = isSubscriptionLoading || isPlansLoading;
  //console.log("plans ----", plans);
  //console.log("subscriptionData ----", subscriptionData);

  const [isAnnual, setIsAnnual] = useState(false);
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingPlanId, setSubmittingPlanId] = useState(null);

  // 1. Log lifecycle/auth token changes
  // useEffect(() => {
  //   console.log("🚀 SubscriptionPlan mounted / auth change");
  //   console.log("Current authToken ----", authToken);
  // }, [authToken]);

  // 2. Whenever authToken changes, decode and save payload
  useEffect(() => {
    if (!authToken) {
      // console.warn("⚠️ No authToken in cookies yet");
      setTokenPayload({});
    } else {
      const decoded = decodeJwt(authToken);
      // console.log("🔎 Decoded Token ----", decoded);
      setTokenPayload(decoded || {});
    }
  }, [authToken]);

  // console.log('authToken ----', authToken);
  // console.log('tokenPayload ----', tokenPayload);

  const ownerId = tokenPayload?.userId;
  // console.log('ownerId 1----', ownerId);
  const organization = tokenPayload?.organization;
  // console.log('organization 1----', organization);
  const tenantId = tokenPayload?.tenantId;
  // console.log('tenantId 1----', tenantId);

  const [user] = useState({
    userType: organization === true ? "organization" : "individual",
    // tenantId,
    // ownerId,
  });

  // Check if user already has an active subscription and redirect
  useEffect(() => {
    // Skip check if user is explicitly upgrading
    if (isUpgrading) {
      return;
    }

    // Check if subscription data is loaded and user has an active subscription
    if (
      !isSubscriptionLoading &&
      subscriptionData &&
      subscriptionData.status === "active"
    ) {
      // User already has an active subscription, redirect to home
      // console.log('User already has active subscription, redirecting to home...');
      navigate("/home", { replace: true });
    }
  }, [subscriptionData, isSubscriptionLoading, isUpgrading, navigate]);

  const toggleBilling = () => setIsAnnual(!isAnnual);

  const submitPlans = async (plan) => {
    if (!plan) {
      notify.success("No plan is selected");
      return;
    }
    const totalAmount = isAnnual ? plan.annualPrice : plan.monthlyPrice;
    const isFreePlan =
      /free/i.test(String(plan?.name)) ||
      ((plan?.monthlyPrice || 0) === 0 && (plan?.annualPrice || 0) === 0);

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
      status:
        user.userType === "individual" && plan.name === "Free"
          ? "active"
          : "pending",
    };
    // console.log("payload ----", payload);
    try {
      setIsSubmitting(true);
      setSubmittingPlanId(plan.planId);
      const subscriptionResponse = await createCustomerSubscription(payload);

      // console.log(
      //   "Payment and Subscription submitted successfully",
      //   subscriptionResponse
      // );
      // console.log(organization, plan.name, "organization");
      if (user.userType === "individual" && isFreePlan) {
        // Fire-and-forget emails; do not block navigation
        // axios.post(`${config.REACT_APP_API_URL}/emails/subscription/free`, {
        //   tenantId: tenantId,
        //   ownerId: ownerId,
        // }).catch((err) => console.error('Email error (free):', err));

        axios
          .post(`${config.REACT_APP_API_URL}/emails/send-signup-email`, {
            tenantId: tenantId,
            ownerId: ownerId,
          })
          .catch((err) => console.error("Email error (signup):", err));

        // Navigate immediately to home for Free plan
        // console.log("Navigating to /home after Free plan activation");
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
      setSubmittingPlanId(null);
    }
  };

  const isHighlighted = (plan) =>
    hoveredPlan ? hoveredPlan === plan.name : plan.isDefault;

  // <---- contact sales popup code start
  const [isContactSalesOpen, setIsContactSalesOpen] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    jobTitle: "",
    companyName: "",
    companySize: "",
    additionalDetails: "",
  });

  const companySizeOptions = [
    { value: "1-10", label: "1-10" },
    { value: "11-50", label: "11-50" },
    { value: "51-200", label: "51-200" },
    { value: "201-500", label: "201-500" },
    { value: "501-1000", label: "501-1000" },
    { value: "1000+", label: "1000+" },
  ];

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target || e;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";

    // Email validation using validateWorkEmail
    const emailError = validateWorkEmail(formData.email);
    if (emailError) {
      newErrors.email = emailError;
    }

    if (!formData.jobTitle.trim()) newErrors.jobTitle = "Job title is required";
    if (!formData.companyName.trim())
      newErrors.companyName = "Company name is required";
    if (!formData.companySize)
      newErrors.companySize = "Please select company size";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const response = await fetch(
          `${config.REACT_APP_API_URL}/upinterviewEnterpriseContact`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              firstName: formData.firstName,
              lastName: formData.lastName,
              workEmail: formData.email,
              jobTitle: formData.jobTitle,
              companyName: formData.companyName,
              companySize: formData.companySize,
              additionalDetails: formData.additionalDetails || "",
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to submit form");
        }

        // Show success message
        notify.success(
          "Thank you for contacting us! We will get back to you soon."
        );

        // Close the popup and reset form
        setIsContactSalesOpen(false);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          jobTitle: "",
          companyName: "",
          companySize: "",
          additionalDetails: "",
        });
      } catch (error) {
        console.error("Error submitting form:", error);
        notify.error(
          error.message || "Failed to submit form. Please try again."
        );
      }
    }
  };

  const handleContactSales = (e) => {
    e.preventDefault();
    setIsContactSalesOpen(true);
  };

  // contact sales popup code end ---->

  return (
    <div className="h-full w-full flex justify-center items-center pt-3 bg-gray-50">
      <div className="flex flex-col sm:px-[7%] px-[15%] md:px-[2%] rounded-lg">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h4 className="text-2xl sm:text-sm font-bold text-custom-blue">
            The Right Plan for{" "}
            {user.userType === "organization" ? "Your Organization" : "You"}
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
              !isAnnual
                ? "font-semibold text-lg sm:text-sm"
                : "font-medium sm:text-xs"
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
                isAnnual
                  ? "translate-x-6 bg-yellow-500"
                  : "translate-x-0 bg-yellow-500"
              }`}
            ></div>
          </div>
          <p
            className={`text-[#217989] ${
              isAnnual
                ? "font-semibold text-lg sm:text-sm"
                : "font-medium sm:text-xs"
            }`}
          >
            Bill Annually
          </p>
        </div>

        {/* Plans Section */}
        {loading ? (
          <SubscriptionPlansSkeleton />
        ) : (
          <div className="grid sm:grid-cols-1 md:grid-cols-2 grid-cols-3 gap-6 items-stretch mb-5 ">
            {plans.map((plan) => {
              // Get actual price
              const actualPrice = isAnnual
                ? plan.annualPrice
                : plan.monthlyPrice;
              const monthlyPrice = plan.monthlyPrice;

              // Define static higher prices for organizations to show as strikethrough
              const getStaticHigherPrice = (planName, isAnnual) => {
                if (planName === "Starter") {
                  return isAnnual ? 19999 : 1999; // Monthly: 1999, Annual: 19999
                } else if (planName === "Professional" || planName === "Pro") {
                  return isAnnual ? 42999 : 4299; // Monthly: 4299, Annual: 42999
                }
                return actualPrice; // For other plans, use actual price
              };

              const staticHigherPrice = getStaticHigherPrice(
                plan.name,
                isAnnual
              );
              const shouldShowLimitedOffer =
                organization &&
                !isAnnual &&
                (plan.name === "Starter" ||
                  plan.name === "Professional" ||
                  plan.name === "Pro");
              const shouldShowSavings =
                organization &&
                isAnnual &&
                (plan.name === "Starter" ||
                  plan.name === "Professional" ||
                  plan.name === "Pro");

              // Calculate savings for individuals on annual plans
              const individualAnnualSavings =
                !organization && isAnnual && monthlyPrice > 0
                  ? monthlyPrice * 12 - actualPrice
                  : 0;
              const shouldShowIndividualSavings =
                !organization && isAnnual && individualAnnualSavings > 0;

              const savingsAmount = organization
                ? staticHigherPrice - actualPrice
                : individualAnnualSavings;
              const isEnterprise = plan.name === "Enterprise";
              const isFree = plan.name === "Free" || actualPrice === 0;

              return (
                <div
                  key={plan.name}
                  className={`shadow-xl rounded-2xl relative transition-all duration-300 flex flex-col h-full ${
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
                    {((organization &&
                      (plan.name === "Professional" || plan.name === "Pro")) ||
                      (!organization && plan.name === "Premium")) && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-[#217989] text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-md">
                          Most Popular
                        </span>
                      </div>
                    )}
                    {/* Plan Name - Left aligned */}
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
                    <div
                      className="flex-grow"
                      style={{ minHeight: "200px", marginBottom: "16px" }}
                    >
                      <ul className="space-y-2.5 text-sm">
                        {plan.features &&
                          plan.features.map((feature, idx) => (
                            <li key={idx} className="flex items-center">
                              <span
                                className={`mr-2 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                                  isHighlighted(plan)
                                    ? "bg-white/20 text-white"
                                    : "bg-green-100 text-green-600"
                                }`}
                              >
                                <svg
                                  className="w-3 h-3"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </span>
                              <span className="leading-snug">{feature}</span>
                            </li>
                          ))}
                      </ul>
                    </div>

                    {/* Price Section */}
                    <div className="text-start mb-6">
                      {shouldShowLimitedOffer ? (
                        // Monthly plans for organizations - Show strikethrough and Limited-Time Offer
                        <div>
                          <p
                            className={`text-xl sm:text-2xl md:text-3xl font-bold line-through ${
                              isHighlighted(plan)
                                ? "text-white/70"
                                : "text-gray-400"
                            }`}
                          >
                            <span className="text-base sm:text-lg md:text-xl">
                              ₹
                            </span>
                            {staticHigherPrice.toLocaleString("en-IN")}
                          </p>
                          <p
                            className={`text-xs font-medium mt-1 ${
                              isHighlighted(plan)
                                ? "text-white/80"
                                : "text-gray-500"
                            }`}
                          >
                            per month
                          </p>
                          <div className="mt-1">
                            <span
                              className={`inline-block px-3 py-1.5 rounded-md text-xs font-semibold ${
                                isHighlighted(plan)
                                  ? "bg-white/20 text-white"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              Limited-Time Offer: ₹
                              {actualPrice.toLocaleString("en-IN")} / month
                            </span>
                          </div>
                        </div>
                      ) : shouldShowSavings ? (
                        // Annual plans for organizations - Show actual price and savings
                        <div>
                          <p
                            className={`text-xl sm:text-2xl md:text-3xl font-bold ${
                              isHighlighted(plan)
                                ? "text-white"
                                : "text-[#217989]"
                            }`}
                          >
                            <span className="text-base sm:text-lg md:text-xl">
                              ₹
                            </span>
                            {actualPrice.toLocaleString("en-IN")}
                          </p>
                          <p
                            className={`text-xs font-medium mt-1 ${
                              isHighlighted(plan)
                                ? "text-white/80"
                                : "text-gray-600"
                            }`}
                          >
                            per year
                          </p>
                          <div className="mt-1">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${
                                isHighlighted(plan)
                                  ? "bg-green-100/20 text-white border border-white/30"
                                  : "bg-green-50 text-green-700 border border-green-200"
                              }`}
                            >
                              <span className="text-sm">🔥</span>
                              Save ₹{savingsAmount.toLocaleString("en-IN")}/year
                            </span>
                          </div>
                        </div>
                      ) : isEnterprise ? (
                        // Enterprise plan - Show custom pricing
                        <div>
                          <p
                            className={`text-xl sm:text-2xl md:text-3xl font-bold ${
                              isHighlighted(plan)
                                ? "text-white"
                                : "text-[#217989]"
                            }`}
                          >
                            Custom
                          </p>
                          <p
                            className={`text-xs font-medium mt-1 ${
                              isHighlighted(plan)
                                ? "text-white/80"
                                : "text-gray-600"
                            }`}
                          >
                            pricing
                          </p>
                        </div>
                      ) : isFree ? (
                        // Free plan - Show ₹0 forever
                        <div>
                          <p
                            className={`text-xl sm:text-2xl md:text-3xl font-bold ${
                              isHighlighted(plan)
                                ? "text-white"
                                : "text-[#217989]"
                            }`}
                          >
                            <span className="text-base sm:text-lg md:text-xl">
                              ₹
                            </span>
                            0
                          </p>
                          <p
                            className={`text-xs font-medium mt-1 ${
                              isHighlighted(plan)
                                ? "text-white/80"
                                : "text-gray-600"
                            }`}
                          >
                            forever
                          </p>
                        </div>
                      ) : shouldShowIndividualSavings ? (
                        // Individual annual plans - Show price with savings
                        <div>
                          <p
                            className={`text-xl sm:text-2xl md:text-3xl font-bold ${
                              isHighlighted(plan)
                                ? "text-white"
                                : "text-[#217989]"
                            }`}
                          >
                            <span className="text-base sm:text-lg md:text-xl">
                              ₹
                            </span>
                            {actualPrice.toLocaleString("en-IN")}
                          </p>
                          <p
                            className={`text-xs font-medium mt-1 ${
                              isHighlighted(plan)
                                ? "text-white/80"
                                : "text-gray-600"
                            }`}
                          >
                            per year
                          </p>
                          <div className="mt-1">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${
                                isHighlighted(plan)
                                  ? "bg-green-100/20 text-white border border-white/30"
                                  : "bg-green-50 text-green-700 border border-green-200"
                              }`}
                            >
                              Save ₹{savingsAmount.toLocaleString("en-IN")}/year
                            </span>
                          </div>
                        </div>
                      ) : (
                        // Regular pricing for individuals or other cases
                        <div>
                          <p
                            className={`text-xl sm:text-2xl md:text-3xl font-bold ${
                              isHighlighted(plan)
                                ? "text-white"
                                : "text-[#217989]"
                            }`}
                          >
                            <span className="text-base sm:text-lg md:text-xl">
                              ₹
                            </span>
                            {actualPrice.toLocaleString("en-IN")}
                            <span className="text-xs font-medium">
                              {" "}
                              / {isAnnual ? "year" : "month"}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>

                    <button
                      key={plan._id}
                      onClick={
                        isEnterprise
                          ? handleContactSales
                          : () => !isEnterprise && submitPlans(plan)
                      }
                      className={`w-full font-semibold py-2.5 mt-auto rounded-lg text-sm
                ${
                  isHighlighted(plan)
                    ? "bg-white text-custom-blue hover:text-custom-blue "
                    : "text-white bg-custom-blue"
                }
                ${
                  subscriptionData.subscriptionPlanId === plan.planId &&
                  subscriptionData.status === "active"
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
                      disabled={
                        subscriptionData.subscriptionPlanId === plan.planId &&
                        subscriptionData.status === "active"
                      }
                    >
                      {submittingPlanId === plan.planId && isSubmitting ? (
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
                      ) : subscriptionData.subscriptionPlanId === plan.planId &&
                        subscriptionData.status === "active" ? (
                        "Subscribed"
                      ) : subscriptionData.subscriptionPlanId === plan.planId &&
                        subscriptionData.status === "created" ? (
                        "Continue to Payment"
                      ) : (
                        "Choose"
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* contact sale popup */}
      {isContactSalesOpen && (
        <SidebarPopup
          title="Contact Sales"
          onClose={() => setIsContactSalesOpen(false)}
        >
          <div className="p-4">
            <ContactSalesForm
              formData={formData}
              errors={errors}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              isLoading={false}
            />
          </div>
        </SidebarPopup>
      )}
    </div>
  );
};

export default SubscriptionPlan;
