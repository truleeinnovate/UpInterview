const express = require('express');

const { postEmailtemplateControllers, getEmailtemplatesControllers} = require('../controllers/EmailTemplateControllers.js');

const EmailTemplateRouter = express.Router();

EmailTemplateRouter.post('/templates', postEmailtemplateControllers);

EmailTemplateRouter.get('/get-templates',getEmailtemplatesControllers);



module.exports = EmailTemplateRouter;
