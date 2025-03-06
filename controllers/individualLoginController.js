const { Users } = require("../models/Users");
const { Contacts } = require("../models/Contacts");
// const { loginSendEmail } = require("./loginEmailCommonController");
const availabilityController = require("./interviewAvailabilityController");
const OutsourceInterviewer = require("../models/OutsourceInterviewersSchema");

exports.individualLogin = async (req, res) => {
  try {
    const { userData, contactData, availabilityData, Freelancer } = req.body;

    // Step 1: Create User Directly in DB
    const newUser = new Users(userData);
    const savedUser = await newUser.save();
    console.log("User successfully created:", savedUser);

    // Step 2: Create Contact and Link to User
    console.log("Saving contact data in DB...");
    const newContact = new Contacts({
      ...contactData,
      ownerId: savedUser._id, // Linking the user ID
    });
    const savedContact = await newContact.save();
    console.log("Contact successfully created:", savedContact._id);

    // Step 3: Save Interview Availability (if applicable)
    if (Freelancer) {
      console.log("Saving interview availability in DB...");

      // Mock request object to match expected structure
      const mockReq = { body: { contact: savedContact._id, days: availabilityData } };

      // Mock response object with a function to capture response data
      const mockRes = {
        status: (code) => ({
          json: (data) => {
            console.log(`Interview availability response:`, data);
          },
        }),
      };

      await availabilityController.createOrUpdateInterviewAvailability(mockReq, mockRes);
      console.log("Interview availability successfully created.");



      // // creating outsource interviewer
      // const newInterviewer = new OutsourceInterviewer({
      //   ownerId: savedUser._id,
      //   contactId: savedContact._id,
      //   requestedRate: {
      //     min: contactData.ExpectedRateMin,
      //     max: contactData.ExpectedRateMax,
      //   },
      //   createdBy: savedUser._id,
      // });

      // creating outsource interviewer with all required fields
      const newInterviewer = new OutsourceInterviewer({
        ownerId: savedUser._id,
        contactId: savedContact._id,
        requestedRate: {
          min: contactData.ExpectedRateMin,
          max: contactData.ExpectedRateMax,
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
    }




    // Step 4: Call Email Sending Controller
    // console.log("Calling email sending controller...");
    // await loginSendEmail({
    //   body: {
    //     email: savedContact.Email,
    //     ownerId: savedUser._id,
    //     name: savedContact.Name,
    //   },
    // }, { json: () => { } }); // Simulating Express response object

    // Step 5: Send Response
    res.status(200).json({
      success: true,
      message: "User created successfully",
      userId: savedUser._id,
      contactId: savedContact._id
    });

  } catch (error) {
    console.error("Error in individual login:", error);
    res.status(500).json({ success: false, message: "Error in individual login", error: error.message });
  }
};
