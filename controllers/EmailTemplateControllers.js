const EmailTemplate = require('../models/EmailTemplatemodel.js');


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

module.exports = {postEmailtemplateControllers, getEmailtemplatesControllers};