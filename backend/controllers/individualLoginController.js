const { Users } = require("../models/Users.js");
const { Contacts } = require("../models/Contacts.js");
const availabilityController = require("./interviewAvailabilityController.js");
const { loginSendEmail } = require("./loginEmailCommonController.js");
const OutsourceInterviewer = require("../models/OutsourceInterviewersSchema.js");
const { generateToken } = require('../utils/jwt');

exports.individualLogin = async (req, res) => {
  try {
    const { userData, contactData, availabilityData } = req.body;

    // Step 1: Create User in DB
    const newUser = new Users(userData);
    const savedUser = await newUser.save();
    console.log("User successfully created:", savedUser);

    // Step 2: Create Contact and Link to User
    console.log("Saving contact data in DB...");
    const newContact = new Contacts({
      ...contactData,
      ownerId: savedUser._id,
    });
    const savedContact = await newContact.save();
    console.log("Contact successfully created:", savedContact);

    // Step 3: Save Interview Availability (if provided)
    if (availabilityData && availabilityData.length > 0) {
      console.log("Saving interview availability in DB...");

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


    // Step 4: Send Email
    console.log("Sending email to user...");
    await loginSendEmail({
      body: {
        email: savedContact.email,
        ownerId: savedUser._id,
        name: savedContact.name,
      },
    }, { json: () => { } });
    console.log("Email successfully sent.");

    // Generate JWT
    const payload = {
      userId: savedUser._id.toString(),
      organization: false,
      timestamp: new Date().toISOString(),
    };
    const token = generateToken(payload);

    // Step 5: Send Response
    res.status(200).json({
      success: true,
      message: "User, Contact, Availability, and Email processed successfully",
      userId: savedUser._id,
      contactId: savedContact._id,
      token
    });

  } catch (error) {
    console.error("Error in individual login:", error);
    res.status(500).json({
      success: false,
      message: "Error in individual login",
      error: error.message,
    });
  }
};