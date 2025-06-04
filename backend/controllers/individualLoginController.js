const { Users } = require("../models/Users.js");
const { Contacts } = require("../models/Contacts.js");
const availabilityController = require("./interviewAvailabilityController.js");
const { loginSendEmail } = require("./loginEmailCommonController.js");
const OutsourceInterviewer = require("../models/OutsourceInterviewerRequest.js");
const { generateToken } = require('../utils/jwt');

exports.individualLogin = async (req, res) => {
  try {
    const { userData, contactData, availabilityData } = req.body;

    // Step 1: Create User in DB
    const newUser = new Users(userData);
    const savedUser = await newUser.save();

    // Step 2: Create Contact and Link to User
    const newContact = new Contacts({
      ...contactData,
      ownerId: savedUser._id,
    });
    const savedContact = await newContact.save();

    // Step 3: Save Interview Availability (if provided)
    if (availabilityData && availabilityData.length > 0) {

      const mockReq = { body: { contact: savedContact._id, days: availabilityData } };
      const mockRes = {
        status: (code) => ({
          json: (data) => {
            console.log(`Interview availability response:`, data);
          },
        }),
      };

      await availabilityController.createOrUpdateInterviewAvailability(mockReq, mockRes);
      console.log("Interview availability successfully created.");
    }

    // <-----------------------OutsourceInterviewer------------------------------->
    const newInterviewer = new OutsourceInterviewer({
      ownerId: savedUser._id,
      contactId: savedContact._id,
      requestedRate: {
        hourlyRate: contactData.hourlyRate
      },
      finalRate: null,
      feedback: [{
        givenBy: savedUser._id,
        rating: 4.5,
        comments: "",
        createdAt: new Date()
      }],
      createdBy: savedUser._id,
      currency: 'USD'
    });

    const savedInterviewer = await newInterviewer.save();
    console.log("Outsource Interviewer successfully created:", savedInterviewer._id);
    // <-----------------------OutsourceInterviewer------------------------------->

    // Generate JWT
    const payload = {
      userId: savedUser._id.toString(),
      organization: false,
      timestamp: new Date().toISOString(),
    };
    const token = generateToken(payload);

    res.status(200).json({
      success: true,
      message: "Profile created successfully",
      ownerId: savedUser._id,
      contactId: savedContact._id,
      tenantId: savedContact.tenantId,
      token: token
    });

  } catch (error) {
    console.error("Error in individual login:", error);
    res.status(500).json({ 
      success: false, 
      message: "Error processing your request", 
      error: error.message 
    });
  }
};