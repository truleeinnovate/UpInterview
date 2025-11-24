export const validateCardFields = (setErrors, formData) => {
  const newErrors = {};

  if (!formData || typeof formData !== "object") {
    setErrors({ general: "Invalid form data." });
    return false;
  }

  const cardNumber = formData.cardNumber.replace(/-/g, "");
  if (!/^\d{16}$/.test(cardNumber))
    newErrors.cardNumber = "Card number must be 16 digits.";

  if (!formData.cardHolderName?.trim())
    newErrors.cardHolderName = "Name is required.";
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.cardexpiry))
    newErrors.cardexpiry = "Expiry must be in MM/YY format.";
  if (!/^\d{3,4}$/.test(formData.cvv))
    newErrors.cvv = "CVV must be 3 or 4 digits.";

  if (formData.country && !formData.country.trim())
    newErrors.country = "Country is required.";
  if (formData.zipCode === "" && formData.zipCode.length < 4) {
    newErrors.zipCode = "Zip code must be at least 4 digits.";
  }

  if ("membershipType" in formData && !formData.membershipType) {
    newErrors.membershipType = "Please select a membership type.";
  }

  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    return false;
  }

  return true;
};

export const handlePaymentInputChange = (
  target,
  paymentData,
  setPaymentData,
  setErrors,
  errors
) => {
  const { name, value } = target;

  if (name === "cardNumber") {
    let formattedValue = value.replace(/\D/g, "");

    if (formattedValue.length > 16) {
      formattedValue = formattedValue.substring(0, 16);
    }

    formattedValue = formattedValue.replace(/(\d{4})(?=\d)/g, "$1-");

    setPaymentData((prevData) => ({
      ...prevData,
      [name]: formattedValue,
    }));
  } else {
    setPaymentData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }

  if (errors[name]) {
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
    }));
  }
};

// handling membership type
export const handleMembershipChange = (
  type,
  setCardDetails,
  pricePerMember,
  planDetails,
  setTotalPaid
) => {
  setCardDetails((prevData) => ({
    ...prevData,
    membershipType: type,
  }));

  updateTotalPaid(type, pricePerMember, planDetails, setTotalPaid);
};

const updateTotalPaid = (
  membershipType,
  pricePerMember,
  planDetails,
  setTotalPaid
) => {
  let total = 0;
  if (membershipType === "monthly") {
    // No discount applied - using full price
    total = parseFloat(pricePerMember.monthly) || 0;
  } else if (membershipType === "annual") {
    // No discount applied - using full price
    total = parseFloat(pricePerMember.annually) || 0;
  }
  setTotalPaid(total.toFixed(2));
};

// for payments amount select
export const handleChange = (e, setpaymentData) => {
  const { name, value } = e.target;
  setpaymentData((prev) => ({
    ...prev,
    [name]: value,
  }));
};

// payment methods
export const paymentMethods = [
  {
    name: "Credit/Debit Card",
    imgSrc: "./credit-card.png",
  },
  {
    name: "UPI",
    imgSrc:
      "https://t3.ftcdn.net/jpg/05/60/50/16/240_F_560501607_x7crxqBWbmbgK2k8zOL0gICbIbK9hP6y.jpg",
  },
  {
    name: "Net Banking",
    imgSrc: "./online-banking.png",
  },
  {
    name: "PayPal",
    imgSrc: "https://cdn-icons-png.flaticon.com/512/962/962856.png",
  },
];
