
const express = require('express')

const { assessmentSendEmail,customControllerToSendEmail } = require('../controllers/assessmentEmailCommonController.js')
const { loginSendEmail,afterSubscribePlan,afterSubscribeFreePlan,forgotPasswordSendEmail} = require('../controllers/loginEmailCommonController.js')


const router = express.Router()

// assessment
router.post('/assessmentSendEmail',assessmentSendEmail)
router.post('/assessmentResendEmail',customControllerToSendEmail)

// signup

router.post('/loginSendEmail',loginSendEmail)
router.post('/afterSubscribePlan',afterSubscribePlan)
router.post('/afterSubscribeFreePlan',afterSubscribeFreePlan)

router.post("/forgot-password", forgotPasswordSendEmail);

module.exports = router