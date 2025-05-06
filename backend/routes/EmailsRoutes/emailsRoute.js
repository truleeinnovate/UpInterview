
const express = require('express')
const {afterSubscribePlan,afterSubscribeFreePlan} = require('../../controllers/EmailsController/subscriptionEmailController.js')
const { sendSignUpEmail,forgotPasswordSendEmail} = require('../../controllers/EmailsController/signUpEmailController.js')

const router = express.Router()

router.post('/subscription/paid',afterSubscribePlan)
router.post('/subscription/free',afterSubscribeFreePlan)


router.post('/send-signup-email', sendSignUpEmail);
router.post("/forgot-password", forgotPasswordSendEmail);


module.exports = router