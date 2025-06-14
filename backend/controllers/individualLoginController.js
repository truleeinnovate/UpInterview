const { Users } = require("../models/Users.js");
const { Contacts } = require("../models/Contacts.js");
const availabilityController = require("./interviewAvailabilityController.js");
const OutsourceInterviewer = require("../models/OutsourceInterviewerRequest.js");
const { generateToken } = require('../utils/jwt');

// exports.individualLogin = async (req, res) => {
//   try {
//     const { userData, contactData, availabilityData } = req.body;

//     // Step 1: Create User in DB
//     const newUser = new Users(userData);
//     const savedUser = await newUser.save();

//     // Step 2: Create Contact and Link to User
//     const newContact = new Contacts({
//       ...contactData,
//       ownerId: savedUser._id,
//     });
//     const savedContact = await newContact.save();

//     // Step 3: Save Interview Availability (if provided)
//     if (availabilityData && availabilityData.length > 0) {

//       const mockReq = { body: { contact: savedContact._id, days: availabilityData } };
//       const mockRes = {
//         status: (code) => ({
//           json: (data) => {
//             console.log(`Interview availability response:`, data);
//           },
//         }),
//       };

//       await availabilityController.createOrUpdateInterviewAvailability(mockReq, mockRes);
//       console.log("Interview availability successfully created.");
//     }

//     // <-----------------------OutsourceInterviewer------------------------------->
// const newInterviewer = new OutsourceInterviewer({
//   ownerId: savedUser._id,
//   contactId: savedContact._id,
//   requestedRate: {
//     hourlyRate: contactData.hourlyRate
//   },
//   finalRate: null,
//   feedback: [{
//     givenBy: savedUser._id,
//     rating: 4.5,
//     comments: "",
//     createdAt: new Date()
//   }],
//   createdBy: savedUser._id,
//   currency: 'USD'
// });

//     const savedInterviewer = await newInterviewer.save();
//     console.log("Outsource Interviewer successfully created:", savedInterviewer._id);
//     // <-----------------------OutsourceInterviewer------------------------------->

//     // Generate JWT
//     const payload = {
//       userId: savedUser._id.toString(),
//       organization: false,
//       timestamp: new Date().toISOString(),
//       freelancer: userData.isFreelancer
//     };
//     const token = generateToken(payload);

//     res.status(200).json({
//       success: true,
//       message: "Profile created successfully",
//       ownerId: savedUser._id,
//       contactId: savedContact._id,
//       tenantId: savedContact.tenantId,
//       token: token
//     });

//   } catch (error) {
//     console.error("Error in individual login:", error);
//     res.status(500).json({ 
//       success: false, 
//       message: "Error processing your request", 
//       error: error.message 
//     });
//   }
// };

exports.individualLogin = async (req, res) => {
  try {

    const { userData, contactData, availabilityData, Freelancer, isProfileCompleteData, isInternalInterviewer } = req.body;

    let savedUser, savedContact;
    let isUpdate = false;

    if (isProfileCompleteData?.isProfileComplete === true && isProfileCompleteData.ownerId && isProfileCompleteData.contactId) {
      isUpdate = true;

      // Update User
      savedUser = await Users.findByIdAndUpdate(
        isProfileCompleteData.ownerId,
        userData,
        { new: true }
      );

      // Update Contact
      savedContact = await Contacts.findByIdAndUpdate(
        isProfileCompleteData.contactId,
        contactData,
        { new: true }
      );
    } else {
      // Create new user
      const newUser = new Users(userData);
      savedUser = await newUser.save();

      // Create new contact
      const newContact = new Contacts({
        ...contactData,
        ownerId: savedUser._id
      });
      savedContact = await newContact.save();
    }

    // Save availability if freelancer or internal interviewer
    if (Freelancer || isInternalInterviewer) {
      const mockReq = { body: { contact: savedContact._id, days: availabilityData } };
      const mockRes = {
        status: (code) => ({
          json: (data) => console.log("Availability response:", data),
        }),
      };
      await availabilityController.createOrUpdateInterviewAvailability(mockReq, mockRes);
    }
    // <-----------------------OutsourceInterviewer------------------------------->

    // Save outsource interviewer if freelancer
    if (Freelancer) {
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
      await newInterviewer.save();
    }
    // <-----------------------OutsourceInterviewer------------------------------->
    const payload = {
      userId: savedUser._id.toString(),
      ...(isProfileCompleteData?.isProfileComplete && { tenantId: savedUser.tenantId }),
      organization: isProfileCompleteData?.isProfileComplete === true,
      timestamp: new Date().toISOString(),
      freelancer: userData.isFreelancer
    };

    const token = generateToken(payload);

    res.status(200).json({
      success: true,
      message: "Profile created successfully",
      ownerId: savedUser._id,
      contactId: savedContact._id,
      ...(isProfileCompleteData?.isProfileComplete && { tenantId: savedUser.tenantId }),
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

//old code i have missed from user coming from user i have missed this is for backup
// exports.individualLogin = async (req, res) => {
//   try {
//     const { userData, contactData, availabilityData, Freelancer, isProfileCompleteData, isInternalInterviewer } = req.body;

//     let savedUser, savedContact;
//     let isUpdate = false;

//     if (isProfileCompleteData?.isProfileComplete === true && isProfileCompleteData.ownerId && isProfileCompleteData.contactId) {
//       isUpdate = true;

//       // Update User
//       savedUser = await Users.findByIdAndUpdate(
//         isProfileCompleteData.ownerId,
//         userData,
//         { new: true }
//       );

//       // Update Contact
//       savedContact = await Contacts.findByIdAndUpdate(
//         isProfileCompleteData.contactId,
//         contactData,
//         { new: true }
//       );
//     } else {
//       // Create new user
//       const newUser = new Users(userData);
//       savedUser = await newUser.save();

//       // Create new contact
//       const newContact = new Contacts({
//         ...contactData,
//         ownerId: savedUser._id
//       });
//       savedContact = await newContact.save();
//     }

//     // Save availability if freelancer or internal interviewer
//     if (Freelancer || isInternalInterviewer) {
//       const mockReq = { body: { contact: savedContact._id, days: availabilityData } };
//       const mockRes = {
//         status: (code) => ({
//           json: (data) => console.log("Availability response:", data),
//         }),
//       };
//       await availabilityController.createOrUpdateInterviewAvailability(mockReq, mockRes);
//     }

//     // Save outsource interviewer if freelancer or internal interviewer
//     if (Freelancer || isInternalInterviewer) {
//       const newInterviewer = new OutsourceInterviewer({
//         ownerId: savedUser._id,
//         contactId: savedContact._id,
//         requestedRate: {
//           min: contactData.ExpectedRateMin,
//           max: contactData.ExpectedRateMax,
//         },
//         finalRate: null,
//         feedback: [{
//           givenBy: savedUser._id,
//           rating: 4.5,
//           comments: "",
//           createdAt: new Date()
//         }],
//         createdBy: savedUser._id,
//         currency: 'USD'
//       });
//       await newInterviewer.save();
//     }

//     // Send email
//     // try {
//     //   await loginSendEmail({
//     //     body: {
//     //       email: savedContact.email,
//     //       ownerId: savedUser._id,
//     //       name: savedContact.Name,
//     //     }
//     //   }, { json: () => {} });
//     // } catch (emailError) {
//     //   console.error("Email sending error:", emailError);
//     //   // Don't fail the whole request if email fails
//     // }

//     res.status(200).json({
//       success: true,
//       message: "Profile created successfully",
//       ownerId: savedUser._id,
//       contactId: savedContact._id,
//       // tenantId: savedContact.tenantId,
//     });

//   } catch (error) {
//     console.error("Error in individual login:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error processing your request",
//       error: error.message
//     });
//   }
// };