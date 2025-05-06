const EmailTemplate = require('../models/EmailTemplatemodel.js');
const EmailConfiguration = require('../models/EmailConfiguration');

// this controller we will use to get email templates for assessment,interviews
const postEmailtemplateControllers =  async (req, res) => {
  const { name, subject, body } = req.body;

  try {
    const newTemplate = new EmailTemplate({ name, subject, body,category:"interview" });
    await newTemplate.save();
    res.status(201).json(newTemplate);
    
  } catch (error) {
    console.error(err);
    res.status(500).json({ error: "Internal server error." });
  }
 
}



const getEmailtemplatesControllers = async (req, res) => {

  try {
    const templates = await EmailTemplate.find();
  res.json(templates);
  } catch (error) {
    console.error(err);
    res.status(500).json({ error: "Internal server error." });
  }
  
}

// email configuration

const saveEmailConfiguration = async (req, res) => {
  try {
    const { tenantId, ownerId, ...emailConfig } = req.body;

    if (!tenantId || !ownerId) {
      return res.status(400).json({ error: 'tenantId and ownerId are required' });
    }

    // Try to find existing config for this tenant and owner
    const config = await EmailConfiguration.findOne({ tenantId, ownerId });

    if (config) {
      // Update existing configuration
      const updatedConfig = await EmailConfiguration.findByIdAndUpdate(
        config._id,
        { ...emailConfig, tenantId, ownerId }, 
        { new: true, runValidators: true }
      );
      return res.status(200).json(updatedConfig);
    } else {
      // Create new configuration
      const newConfig = new EmailConfiguration({ ...emailConfig, tenantId, ownerId });
      await newConfig.save();
      return res.status(201).json(newConfig);
    }
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

// Get current email configuration
const getEmailConfiguration = async (req, res) => {
  try {
    const { tenantId, ownerId } = req.query;

    if (!tenantId || !ownerId) {
      return res.status(400).json({ error: 'tenantId and ownerId are required' });
    }

    const config = await EmailConfiguration.findOne({ tenantId, ownerId });
    if (!config) {
      return res.status(404).json({ message: 'Email configuration not found' });
    }
    return res.status(200).json(config);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateEmailTemplateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;
 
    const updatedTemplate = await EmailTemplate.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    );
 
    if (!updatedTemplate) {
      return res.status(404).json({ message: 'Template not found' });
    }
 
    res.status(200).json(updatedTemplate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {postEmailtemplateControllers, getEmailtemplatesControllers, saveEmailConfiguration,
  getEmailConfiguration,updateEmailTemplateStatus};