
const express = require('express')
const {afterSubscribePlan,afterSubscribeFreePlan} = require('../../controllers/EmailsController/subscriptionEmailController')
const { sendSignUpEmail,forgotPasswordSendEmail,resendVerification,requestEmailChangeVerification,verifyEmailChange} = require('../../controllers/EmailsController/signUpEmailController')
const { shareAssessment, resendAssessmentLink,sendOtp } = require('../../controllers/EmailsController/assessmentEmailController')
const { sendInterviewRoundEmails, sendOutsourceInterviewRequestEmails } = require('../../controllers/EmailsController/interviewEmailController')

const router = express.Router()

router.post('/subscription/paid',afterSubscribePlan)
router.post('/subscription/free',afterSubscribeFreePlan)


router.post('/send-signup-email', sendSignUpEmail);
router.post("/forgot-password", forgotPasswordSendEmail);


router.post('/resend-verification', resendVerification);

//assessment related

router.post('/share', shareAssessment);// share assessment with candidates
router.post('/resend-link', resendAssessmentLink);// resend assessment link to candidates
router.post('/send-otp/:scheduledAssessmentId/:candidateId/:candidateAssessmentId', sendOtp);

//interview related
router.post('/interview/round-emails', sendInterviewRoundEmails);
router.post('/interview/outsource-request-emails', sendOutsourceInterviewRequestEmails);

//users tab emails

router.post('/auth/request-email-change', requestEmailChangeVerification);
router.get('/auth/verify-email-change', verifyEmailChange);
router.post('/auth/resend-verification', resendVerification);


module.exports = router