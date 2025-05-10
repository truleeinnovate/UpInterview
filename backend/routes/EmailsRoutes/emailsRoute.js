
const express = require('express')
const {afterSubscribePlan,afterSubscribeFreePlan} = require('../../controllers/EmailsController/subscriptionEmailController')
const { sendSignUpEmail,forgotPasswordSendEmail} = require('../../controllers/EmailsController/signUpEmailController')
const { shareAssessment, resendAssessmentLink,sendOtp } = require('../../controllers/EmailsController/assessmentEmailController')

const router = express.Router()

router.post('/subscription/paid',afterSubscribePlan)
router.post('/subscription/free',afterSubscribeFreePlan)


router.post('/send-signup-email', sendSignUpEmail);
router.post("/forgot-password", forgotPasswordSendEmail);

//assessment related

router.post('/share', shareAssessment);// share assessment with candidates
router.post('/resend-link', resendAssessmentLink);// resend assessment link to candidates
router.post('/send-otp/:scheduledAssessmentId/:candidateId/:candidateAssessmentId', sendOtp);


module.exports = router