//<----v1.0.0-----Venkatesh-----backend via TanStack Query added
// v1.0.1 - Ashok - Removed border left and set outline as none
// v1.0.2 - Ashok - Changed logo url from local to cloud storage url
// v1.0.3 - Ashok - Ashok - Improved responsiveness and added common code to popup
// v1.0.4 - Replaced toast notifications with common notify service

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Cookies from "js-cookie";
import { notify } from "../../../../../services/toastService";
import { decodeJwt } from "../../../../../utils/AuthCookieManager/jwtDecode.js";
import { useUserProfile } from "../../../../../apiHooks/useUsers.js";
// import logo from "../../../../../Pages/Dashboard-Part/Images/upinterviewLogo.webp";
import {
  useVerifyWalletPayment,
  useCreateWalletOrder,
} from "../../../../../apiHooks/useWallet.js";
// v1.0.3 <------------------------------------------------------------------
import SidebarPopup from "../../../../../Components/Shared/SidebarPopup/SidebarPopup.jsx";
import InputField from "../../../../../Components/FormFields/InputField.jsx";
import { useScrollLock } from "../../../../../apiHooks/scrollHook/useScrollLock.js";
import { Button } from "../../../../../Components/Buttons/Button.jsx";
// v1.0.3 ------------------------------------------------------------------>

export function WalletTopupPopup({ onClose, onTopup }) {
  useScrollLock();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  const location = useLocation()

  const mode = location?.state
  const modeState = mode?.mode
  // console.log("mode", mode)

  const authToken = Cookies.get("authToken");
  const tokenPayload = decodeJwt(authToken);

  const tenantId = tokenPayload?.tenantId;
  const ownerId = tokenPayload?.userId;
  //<----v1.0.0-----
  const verifyWalletPayment = useVerifyWalletPayment();
  const createWalletOrder = useCreateWalletOrder();
  //----v1.0.0----->

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const { userProfile } = useUserProfile(); //<----v1.0.0-----

  const [userDetails, setUserProfile] = useState([]);

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
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        notify.error("Failed to fetch user profile data");
      }
    };

    fetchUserProfile();
  }, [ownerId, userProfile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);

    try {
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error("Please enter a valid amount");
      }

      if (!ownerId) {
        throw new Error("User not logged in");
      }

      //<----v1.0.0-----
      // Create order from backend via TanStack Query
      const orderData = await createWalletOrder.mutateAsync({
        amount: parseFloat(amount),
        currency: "INR",
        ownerId: ownerId,
        tenantId: tenantId || "default",
      });

      const { orderId, key_id } = orderData;

      if (!window.Razorpay) {
        setError("Payment service is unavailable. Please refresh and try again.");
        setIsProcessing(false);
        return;
      }

      // Guard flag: if payment.failed fires, prevent handler from crediting
      // On live Razorpay (dev/prod), BOTH handler and payment.failed can fire
      // for the same payment. This flag prevents double-processing.
      let paymentFailed = false;

      // Initialize Razorpay payment
      const options = {
        key: key_id,
        amount: parseFloat(amount) * 100, // Amount in paisa
        currency: "INR",
        name: "UpInterview",
        // v1.0.2 <--------------------------------------------------------------------------------
        // image: logo,
        image:
          "https://res.cloudinary.com/dnlrzixy8/image/upload/v1756099243/upinterviewLogo_ng1wit.webp",
        // v1.0.2 --------------------------------------------------------------------------------->
        description: "Wallet Top-up",
        order_id: orderId,
        handler: async function (response) {
          // If payment.failed already fired for this payment, do NOT credit
          if (paymentFailed) {
            console.warn("[WALLET] handler fired after payment.failed — skipping credit");
            setIsProcessing(false);
            return;
          }

          try {

            // Verify payment with backend via TanStack Query mutation
            const verification = await verifyWalletPayment.mutateAsync({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              ownerId: ownerId,
              tenantId: tenantId || "default",
              amount: parseFloat(amount),
              description: "Wallet Top-up via Razorpay",
            });

            if (verification?.success) {

              if (modeState) {
                navigate(-1)

              } else {

                if (typeof onTopup === "function") {
                  onTopup({
                    amount: parseFloat(amount),
                    paymentMethod: "credit_card",
                    type: "credited",
                    transactionId: response.razorpay_payment_id,
                    timestamp: new Date(),
                  });
                }
              }

              notify.success("Wallet top-up successful!");
              if (typeof onClose === "function") {
                onClose();
              } else {
                navigate("/wallet");
              }
            } else {
              // Payment was not captured — backend recorded failed transaction without crediting wallet
              setError(
                verification?.message ||
                "Payment was not captured. Your wallet has not been credited. Please try again."
              );
              setIsProcessing(false);
            }
          } catch (error) {
            console.error("Payment verification failed:", error);

            // More detailed error feedback
            if (error.response) {
              // The request was made and the server responded with a status code
              // that falls out of the range of 2xx
              console.error("Server error data:", error.response.data);
              setError(
                `Payment verification failed: ${error.response.data.error || "Server error"
                }`
              );
            } else if (error.request) {
              // The request was made but no response was received
              setError("Payment verification failed: No response from server");
            } else {
              // Something happened in setting up the request that triggered an Error
              setError(`Payment verification failed: ${error.message}`);
            }
            setIsProcessing(false);
          }
        },
        prefill: {
          name: userDetails?.name || "",
          email: userDetails?.email || "",
          contact: userDetails?.phone || "",
        },
        theme: {
          color: "#3B82F6", // Blue color that matches UI
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", async function (response) {
        // Set flag FIRST to prevent handler from crediting
        paymentFailed = true;

        console.error("Razorpay payment failed:", response);
        const description =
          response?.error?.description || response?.error?.reason;

        // Record the failed payment attempt in backend for audit trail
        // No signature is sent, so backend will record as failed without crediting
        try {
          await verifyWalletPayment.mutateAsync({
            razorpay_order_id: response?.error?.metadata?.order_id,
            razorpay_payment_id: response?.error?.metadata?.payment_id || "",
            razorpay_signature: "", // Empty = backend treats as failed payment recording
            ownerId: ownerId,
            tenantId: tenantId || "default",
            amount: parseFloat(amount),
            description: `Wallet Top-up failed – ${description || "Payment failed"}`,
          });
        } catch (err) {
          // Don't block UI — the user already sees the error
          console.warn("Could not record failed payment:", err);
        }

        setError(
          description ||
          "Payment failed. Please try again or use a different payment method."
        );
        setIsProcessing(false);
      });
      razorpay.open();
    } catch (error) {
      console.error("Top-up failed:", error);
      const errorMsg = error.response?.data?.error || error.message || "Top-up failed";
      const maxAmount = error.response?.data?.maxAmount;
      if (maxAmount) {
        setError(`${errorMsg} Maximum top-up amount is ₹${maxAmount.toLocaleString("en-IN")}.`);
      } else {
        setError(errorMsg);
      }
      setIsProcessing(false);
    }
  };

  const predefinedAmounts = [1000, 2000, 5000, 10000];



  // Determine if this is a standalone page (no onClose = opened in new tab)
  const isStandalonePage = !onClose;

  const formContent = (
    <div className="flex flex-col h-full pb-6">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <form id="topup-form" onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Amount
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              {predefinedAmounts.map((presetAmount) => (
                <button
                  key={presetAmount}
                  type="button"
                  onClick={() => setAmount(presetAmount.toString())}
                  className={`p-4 text-center border rounded-lg hover:border-custom-blue ${amount === presetAmount.toString()
                    ? "border-custom-blue bg-blue-50"
                    : "border-gray-200"
                    }`}
                >
                  ₹{presetAmount.toLocaleString()}
                </button>
              ))}
            </div>
            <div className="mt-4">
              <InputField
                label="Custom Amount (INR)"
                type="number"
                name="customAmount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
                step="0.01"
                required
                className="pl-2"
              />

            </div>
          </div>

          <div className="pt-4">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                {error}
              </div>
            )}
            <div className="mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount</span>
                <span className="font-medium">
                  ₹{parseFloat(amount || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Processing Fee</span>
                <span className="font-medium">₹0.00</span>
              </div>
              <div className="flex justify-between text-base font-medium mt-2 pt-2 border-t">
                <span>Total</span>
                <span>₹{parseFloat(amount || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Fixed footer button */}
      <div className="bg-white px-2 py-3 flex justify-end">
        <Button
          type="submit"
          form="topup-form"
          disabled={!amount || isProcessing}
          className="bg-custom-blue text-white rounded-md hover:bg-custom-blue/80 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isProcessing ? "Processing..." : "Top Up Now"}
        </Button>
      </div>
    </div>
  );

  // When opened as standalone page (new tab), render full-width page layout
  if (isStandalonePage) {
    return (
      <div className="min-h-screen flex flex-col bg-white shadow px-[8%] pt-6 rounded-md pb-8">
        {/* Header */}
        <div className="bg-gray-50 shadow-sm px-6 py-4">
          <h2 className="text-2xl font-semibold text-custom-blue">
            Wallet Top-up
          </h2>
        </div>
        {/* Full-width content */}
        <div className="flex-1 bg-gray-50 overflow-y-auto px-6 py-6">
          <form id="topup-form" onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Amount
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                {predefinedAmounts.map((presetAmount) => (
                  <button
                    key={presetAmount}
                    type="button"
                    onClick={() => setAmount(presetAmount.toString())}
                    className={`p-4 text-center border rounded-lg hover:border-custom-blue ${amount === presetAmount.toString()
                      ? "border-custom-blue bg-blue-50"
                      : "border-gray-200"
                      }`}
                  >
                    ₹{presetAmount.toLocaleString()}
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <InputField
                  label="Custom Amount (INR)"
                  type="number"
                  name="customAmount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="1"
                  step="0.01"
                  required
                  className="pl-2"
                />
              </div>
            </div>

            <div className="pt-4">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
                  {error}
                </div>
              )}
              <div className="mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-medium">
                    ₹{parseFloat(amount || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Processing Fee</span>
                  <span className="font-medium">₹0.00</span>
                </div>
                <div className="flex justify-between text-base font-medium mt-2 pt-2 border-t">
                  <span>Total</span>
                  <span>₹{parseFloat(amount || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </form>
        </div>
        {/* Fixed bottom button */}
        <div className="bg-gray-50 px-6 pt-3 pb-8 flex justify-end">
          <button
            type="submit"
            form="topup-form"
            disabled={!amount || isProcessing}
            className="w-32 px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/80 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isProcessing ? "Processing..." : "Top Up Now"}
          </button>
        </div>
      </div>
    );
  }

  // When used as popup (with onClose), keep existing SidebarPopup behavior
  return (
    // v1.0.3 <-----------------------------------------------------
    <SidebarPopup title="Wallet Top-up" onClose={onClose}>
      {formContent}
    </SidebarPopup>
    // v1.0.3 ----------------------------------------------------->
  );
}
