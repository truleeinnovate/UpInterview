const express = require('express');

const { postEmailtemplateControllers, getEmailtemplatesControllers,saveEmailConfiguration, getEmailConfiguration,updateEmailTemplateStatus} = require('../controllers/EmailTemplateControllers.js');

const EmailTemplateRouter = express.Router();

EmailTemplateRouter.post('/templates', postEmailtemplateControllers);

EmailTemplateRouter.get('/get-templates',getEmailtemplatesControllers);
// email configuration
EmailTemplateRouter.post('/email-settings', saveEmailConfiguration);
EmailTemplateRouter.get('/email-settings', getEmailConfiguration);
EmailTemplateRouter.patch('/templates/:id/status', updateEmailTemplateStatus);

module.exports = EmailTemplateRouter;
