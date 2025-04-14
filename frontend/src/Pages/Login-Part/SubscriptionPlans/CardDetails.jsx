import { RiCloseCircleLine } from "react-icons/ri";
import React, { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";
import { config } from '../../../config.js'

import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { handlePaymentInputChange,handleMembershipChange,validateCardFields } from "../../../utils/PaymentpageValidations.js";
// import { useCustomContext } from "../../../Context/Contextfetch";
import toast from "react-hot-toast";

const CardDetails = () => {
 const  tenantId = Cookies.get("organizationId");
 const   ownerId = Cookies.get("userId");


const location = useLocation();
const isUpgrading = location.state?.isUpgrading || false;
//   const {
//     userProfile,
//   } = useCustomContext();
  
    const [cardDetails, setCardDetails] = useState({
        cardHolderName: "",
        cardNumber: "",
        cardexpiry: "",
        cvv: "",
        country: "United States",
        zipCode: "",
        membershipType: "",
        addOn: "",
    });


    const navigate = useNavigate();

    const [totalPaid, setTotalPaid] = useState(0);

    const [errors, setErrors] = useState({});
    const planDetails = useMemo(() => location.state?.plan || {}, [location.state]);
    const [pricePerMember, setPricePerMember] = useState({
        monthly: 0,
        annually: 0,
    });


    useEffect(() => {
        if (planDetails) {
            const { monthlyPrice, annualPrice } = planDetails;

            // Set monthly and annual prices dynamically
            setPricePerMember({
                monthly: monthlyPrice || 0,
                annually: annualPrice || 0,
            });

            // Default selection logic
            const defaultMembershipType = planDetails.billingCycle === "annual" ? "annual" : "monthly";
            setCardDetails((prevData) => ({
                ...prevData,
                membershipType: defaultMembershipType,
            }));
            // Calculate the initial total
            const initialTotal =
                defaultMembershipType === "annual"
                    ? parseInt(annualPrice || 0) - (planDetails.annualDiscount || 0)
                    : parseInt(monthlyPrice || 0) - (planDetails.monthDiscount || 0);

            setTotalPaid(initialTotal);

            setCardDetails((prevDetails) => ({
                ...prevDetails,
                tenantId: tenantId || "",
                ownerId: ownerId || "",
                userType: planDetails.user?.userType || ""
            }));
        }
    }, [planDetails, ownerId, tenantId]);


    const handleSubmit = async (e) => {
        e.preventDefault();

         // Validate card fields
            if (!validateCardFields(setErrors, cardDetails)) {
                return;
            }
        try {
            const updatedCardDetails = {
                ...cardDetails,
                cardNumber: cardDetails.cardNumber.replace(/-/g, "")
            };
              // Send the token to your backend to complete the payment
              const paymentResponse = await axios.post(`${config.REACT_APP_API_URL}/payment/submit`, {
                cardDetails:updatedCardDetails//card creation
        });
            const { message,transactionId, status } = paymentResponse.data;
           
            if (status === "paid") {
                toast.success("Payment successfully compeleted!");

                console.log( "caedssssssssss",{
                    planDetails,
                    cardDetails,
                    status,
                    totalPaid,
                    InvoiceId:planDetails.invoiceId,
                    transactionId
                });
                
                const subscriptionResponse = await axios.post(`${config.REACT_APP_API_URL}/update-customer-subscription`, {//invoice,customer subscription status update and recipt genearte
                    planDetails,
                    cardDetails,
                    status,
                    totalPaid,
                    InvoiceId:planDetails.invoiceId,
                    transactionId

                });
                await axios.post(`${config.REACT_APP_API_URL}/emailCommon/afterSubscribePlan`, {
                    ownerId,
                    tenantId,
                    // ccEmail: "shaikmansoor1200@gmail.com",
                  });  
                  if (isUpgrading) {
                    navigate("/SubscriptionDetails"); // Redirect to upgraded dashboard
                } else {
                    navigate("/home"); // Default navigation
                }

                console.log("Payment and Subscription submitted successfully", subscriptionResponse.data);
            } else if(paymentResponse.data.status === "failed"){
                toast.error("Payment Failed!");
            }
            else {
                console.log("Error submitting payment", message);
            }

        } catch (error) {
            console.error("Error processing payment:", error);
        }
    };


    return (
        <div className="flex  mt-2 flex-col h-full w-full items-center  bg-white">

            <form
                className="w-[70%] sm:w-[90%] md:w-[70%] flex flex-col mb-4 justify-center  h-[70%]  p-5 bg-white border-2 border-gray-300 rounded-md "
                onSubmit={handleSubmit}
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold mb-2">
                        Upgrade to a Basic Membership
                    </h2>
                    <RiCloseCircleLine
                        onClick={() => navigate("/subscription-plans")}
                        className="h-7 w-7" />
                </div>
                <p className="text-gray-500  text-md mb-2">
                    Get all access and an extra 20% off when you subscribe annually
                </p>


                <div className="w-full flex gap-6">

                    <div className="w-9/12 md:w-7/12  sm:w-6/12">

                        {/* Name */}
                        <label className="block mb-1  text-md font-medium text-gray-500">
                            Billed to
                        </label>
                        <input
                            type="text"
                            name="cardHolderName"
                            value={cardDetails.cardHolderName}
                            // name
                            onChange={(e) => handlePaymentInputChange(e.target, cardDetails, setCardDetails, setErrors, errors)}
                               
                            placeholder="Enter Name"
                            className="w-full p-2 mb-1 border rounded-lg focus:outline-none focus:ring-2 "
                        />
                        {errors.cardHolderName && (
                            <span className="text-red-500 text-sm pb-1">{errors.cardHolderName}</span>
                        )}

                        {/* Card Number */}
                        <label className="block  mb-1  text-md font-medium text-gray-500">
                            Card Number
                        </label>
                        <div className="relative w-full">
                            <input
                                type="text"
                                name="cardNumber"
                                value={cardDetails.cardNumber}
                                onChange={(e) => handlePaymentInputChange(e.target, cardDetails, setCardDetails, setErrors, errors)}
                               

                                placeholder='0000-0000-0000-0000'
                                className="w-full p-2 mb-1 border rounded-lg focus:outline-none  pr-12"
                            />
                            <div className="absolute flex top-1/2 transform -translate-y-1/2 right-2">
                                <img alt="VisaCard" className="h-4 w-6 sm:h-2 md:h-6 md:w-10 border " src="https://dwglogo.com/wp-content/uploads/2016/08/Visa-logo-02.png" />
                                <img alt="MasterCard" className="h-4 w-6 sm:h-2 md:h-6 md:w-10 border ms-2" src="https://i.pinimg.com/736x/56/fd/48/56fd486a48ff235156b8773c238f8da9.jpg" />
                                <img alt="Paypal" className="h-4 w-6 sm:h-2 md:h-6 md:w-10 border ms-2" src="https://cdn.pixabay.com/photo/2018/05/08/21/29/paypal-3384015_640.png" />
                            </div>


                        </div>
                        {errors.cardNumber && (
                            <p className="text-red-500 text-sm pb-1">{errors.cardNumber}</p>
                        )}

                        {/* cardexpiry and CVV */}
                        <div className="flex space-x-2 mt-2">
                            <div className="flex w-1/2  flex-col">
                                <input
                                    type="text"
                                    name="cardexpiry"
                                    value={cardDetails.cardexpiry}
                                    onChange={(e) => handlePaymentInputChange(e.target, cardDetails, setCardDetails, setErrors, errors)}
                               
                                    placeholder="MM / YY"
                                    className="p-2 mb-1 border rounded-lg focus:outline-none  "
                                />
                                {errors.cardexpiry && (
                                    <p className="text-red-500 text-sm pb-1">{errors.cardexpiry}</p>
                                )}
                            </div>

                            <div className="flex w-1/2  flex-col">
                                <input
                                    type="text"
                                    name="cvv"
                                    value={cardDetails.cvv}
                                    onChange={(e) => handlePaymentInputChange(e.target, cardDetails, setCardDetails, setErrors, errors)}
                               
                                    placeholder="CVV"
                                    className="p-2 mb-1 border rounded-lg focus:outline-none  "
                                />
                                {errors.cvv && (
                                    <p className="text-red-500 text-sm pb-1">{errors.cvv}</p>
                                )}
                            </div>
                        </div>

                        {/* Country and Zip Code */}
                        <label className="block mb-1  text-md font-medium text-gray-500">
                            Country
                        </label>
                        <input
                            type="text"
                            name="country"
                            value={cardDetails.country}
                            onChange={(e) => handlePaymentInputChange(e.target, cardDetails, setCardDetails, setErrors, errors)}
                               
                            className="w-full p-2 mb-1 border rounded-lg focus:outline-none  "
                        />
                        {errors.country && (
                            <p className="text-red-500 text-sm pb-1">{errors.country}</p>
                        )}
                        <input
                            type="text"
                            name="zipCode"
                            value={cardDetails.zipCode}
                            onChange={(e) => handlePaymentInputChange(e.target, cardDetails, setCardDetails, setErrors, errors)}
                               
                            placeholder="Zip Code"
                            className="w-full p-2 mb-2 border rounded-lg focus:outline-none  "
                        />
                        {errors.zipCode && (
                            <p className="text-red-500 text-sm pb-1">{errors.zipCode}</p>
                        )}

                        <div className="mt-6 mb-4 flex flex-col">
                            <span className="font-semibold text-lg"> {cardDetails.membershipType === "monthly"
                                ? `$${(pricePerMember.monthly - planDetails.monthDiscount || Math.round(pricePerMember.monthly))} / Month / User`
                                : `$${(pricePerMember.annually - planDetails.annualDiscount || Math.round(pricePerMember.annually))} / Annual / User`}
                            </span>

                            <span className="text-blue-400">Details</span>
                        </div>

                    </div>


                    <div className="w-1/2">

                        {/* Membership Type */}
                        <label className="block mb-1  text-lg font-medium text-gray-500">
                            Membership Type
                        </label>
                        

                        <div className="flex flex-col gap-4   mb-4">

                            <div
                                className={`border p-2 flex items-center gap-2 rounded-md bg-gray-50
                                     ${cardDetails.membershipType === "monthly"
                                        ? "border-[#217989]"
                                        : "border-gray-300"
                                    }`}
                                onClick={() => handleMembershipChange("monthly",setCardDetails,pricePerMember,planDetails,setTotalPaid)}
                            >

                                <div className="flex  items-center">
                                    <input
                                        type="radio"
                                        name="membershipType"
                                        value="monthly"
                                        checked={cardDetails.membershipType === "monthly"}
                                        // onChange={(e) => setCardDetails((prevData) => ({ ...prevData, membershipType: e.target.value }))}
                                        readOnly

                                        className="mr-1 h-4 w-5"
                                    />

                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold">Pay Monthly</span>
                                    <span className="text-sm font-medium"> ${pricePerMember.monthly} / Month Per {planDetails.user?.userType === "individual" ? "Member" : "Organization"}</span>
                                </div>
                            </div>


                            <div
                                className={`border p-2 flex justify-between items-center gap-4 rounded-md bg-gray-50 
                                    ${cardDetails.membershipType === "annual"
                                        ? "border-[#217989]"
                                        : "border-gray-300"
                                    }`}
                                onClick={() => handleMembershipChange("annual",setCardDetails,pricePerMember,planDetails,setTotalPaid)}

                            >

                                <div className="flex gap-2  items-center"


                                >
                                    <input
                                        type="radio"
                                        name="membershipType"
                                        value="annual"
                                        checked={cardDetails.membershipType === "annual"}

                                        readOnly
                                        className="mr-1 h-4 w-5"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold">Pay Annually</span>
                                        <span className="text-sm font-medium"> ${Math.round(pricePerMember.annually / 12)} / Month Per {planDetails.user?.userType === "individual" ? "Member" : "Organization"}</span>
                                    </div>

                                </div>

                                <div>
                                    <span className="text-sm font-semibold">{planDetails.annualBadge}</span>
                                </div>


                            </div>

                        </div>

                        {/* Add-on */}
                        <label className="block mb-1 text-lg font-medium text-gray-700">
                            Add-ons
                        </label>
                        <div

                            className={`border p-4 flex   items-center gap-2 rounded-md bg-gray-50 ${cardDetails.addOn === "AI Particle Accelerator" ? "border-[#217989]" : "border-gray-300"
                                }`}
                            onClick={() =>
                                setCardDetails((prevData) => ({
                                    ...prevData,
                                    addOn: prevData.addOn === "AI Particle Accelerator" ? "" : "AI Particle Accelerator",
                                }))
                            }
                        >
                            <div className="flex  items-center mb-4 ">
                                <input
                                    type="radio"
                                    name="addOn"
                                    value="AI Particle Accelerator"
                                    checked={cardDetails.addOn === "AI Particle Accelerator"}
                                    // onChange={(e) => setCardDetails((prevData) => ({ ...prevData, addOn: e.target.value }))}
                                    readOnly
                                    className="mr-2"
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold">AI Particle Accelerator</span>
                                    <span>$20,000,000 / Month Per Member</span>
                                </div>

                                <div className="flex flex-col text-sm">
                                    <span>Unlimited use of AI of Q&A,</span>
                                    <span>Autofill, writer, and more</span>
                                </div>


                            </div>


                        </div>

                        {errors.membershipType && (
                            <p className="text-red-500 text-sm pt-1">{errors.membershipType}</p>
                        )}

                        {/* Submit */}

                        <p className="text-xs md:text-sm text-gray-500 mt-4 m-2">
                            By continuing, {" "}
                            <span className="text-[#217989] ">
                                you agree to our terms and conditions
                            </span>
                            .
                        </p>
                        <button
                            type="submit"
                            className="w-full p-3 bg-[#217989]  text-[#C7EBF2] font-medium rounded-lg "
                        >
                            Pay
                        </button>

                    </div>
                </div>
            </form>

        </div>
    );
};




export default CardDetails