const express = require('express');
const router = express.Router();

const PaymentCard = require('../models/Carddetails.js');
const { validatePaymentDetails } = require('../utils/ValidationCardPayment.js');
const PaymentGateway = require('../utils/PaymentDateway.js');

const submitPaymentDetails = async (req, res) => {
  
  const { cardDetails } = req.body; 

  // Validate card details
  const errors = validatePaymentDetails(cardDetails);
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    // Simulate payment gateway result
    const gatewayresult = PaymentGateway();

    // Find existing payment record for the tenant
    const existingPayment = await PaymentCard.findOne({
      ownerId: cardDetails.ownerId,
    });

    if (existingPayment) {
      // Check if the card already exists in the tenant's cards array
      const cardIndex = existingPayment.cards.findIndex(
        (card) => card.cardNumber === cardDetails.existingCard || cardDetails.cardNumber
      );

      if (cardIndex !== -1) {
        // If the card exists, update the card details
        existingPayment.cards[cardIndex] = {
          ...existingPayment.cards[cardIndex],
          cardNumber:cardDetails.cardNumber,
          cardHolderName: cardDetails.cardHolderName,
          cardexpiry: cardDetails.cardexpiry,
          cvv: cardDetails.cvv,
          country: cardDetails.country,
          zipCode: cardDetails.zipCode,
          status: 'paid',
          currency: 'USD',
        };

        await existingPayment.save();

        return res.status(200).json({
          message: 'Existing card updated successfully',
          transactionId: gatewayresult.transactionId,
          status: gatewayresult.status,
        });
      } else {
     
        existingPayment.cards.push({
          cardHolderName: cardDetails.cardHolderName,
          cardNumber: cardDetails.cardNumber,
          cardexpiry: cardDetails.cardexpiry,
          cvv: cardDetails.cvv,
          country: cardDetails.country,
          zipCode: cardDetails.zipCode,
          status: 'paid',
          currency: 'USD',
        });

        await existingPayment.save();

        return res.status(200).json({
          message: 'New card added successfully for the tenant',
          transactionId: gatewayresult.transactionId,
          status: gatewayresult.status,
        });
      }
    } else {
      // If no payment record exists for the tenant, create a new one
      const newPayment = new PaymentCard({
        tenantId: cardDetails.tenantId,
        ownerId: cardDetails.ownerId,
        cards: [
          {
            cardHolderName: cardDetails.cardHolderName,
            cardNumber: cardDetails.cardNumber,
            cardexpiry: cardDetails.cardexpiry,
            cvv: cardDetails.cvv,
            country: cardDetails.country,
            zipCode: cardDetails.zipCode,
            status: 'paid',
            currency: 'USD',
          },
        ],
      });

      await newPayment.save();

      return res.status(201).json({
        message: 'Payment details submitted successfully',
        transactionId: gatewayresult.transactionId,
        status: gatewayresult.status,
      });
    }
  } catch (err) {
    console.error('Error saving payment details:', err);
    return res.status(500).json({
      message: 'Error saving payment details',
      error: err.message,
    });
  }
};




const getallPaymentDetails = async(req,res) => {
  
  try {
    
    const {tenantId,ownerId} = req.body
    const cardDetials = await PaymentCard.find({ ownerId: ownerId });

    if (!cardDetials) {
      return res.status(404).json({ message: 'Not found.' });

    } 
    res.status(201).json({
      cardDetials

    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error saving payment details', error: err });
  }
}

// Register routes
router.post('/submit-payment', submitPaymentDetails);
router.post('/get-all-payment-details', getallPaymentDetails);

module.exports = router;
