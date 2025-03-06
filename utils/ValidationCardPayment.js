

 const validatePaymentDetails = (cardDetails) => {
    // Add validation for card details (e.g., check if required fields are filled)
    const errors = {};
    if (!cardDetails.cardHolderName) errors.cardHolderName = "Name is required";
    if (!cardDetails.cardNumber) errors.cardNumber = "Card Number is required";
    if (!cardDetails.cardexpiry) errors.cardexpiry = "Card Expiry is required";
    if (!cardDetails.cvv) errors.cvv = "CVV is required";
    return errors;
  };

  


  module.exports = {validatePaymentDetails}