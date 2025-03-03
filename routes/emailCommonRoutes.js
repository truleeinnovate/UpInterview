
const express = require('express')

const { assessmentSendEmail,customControllerToSendEmail } = require('../controllers/assessmentEmailCommonController.js')
const { loginSendEmail,afterSubscribePlan,afterSubscribeFreePlan} = require('../controllers/loginEmailCommonController.js')


const router = express.Router()

// assessment
router.post('/assessmentSendEmail',assessmentSendEmail)
router.post('/assessmentResendEmail',customControllerToSendEmail)

// login

router.post('/loginSendEmail',loginSendEmail)
router.post('/afterSubscribePlan',afterSubscribePlan)
router.post('/afterSubscribeFreePlan',afterSubscribeFreePlan)



module.exports = router