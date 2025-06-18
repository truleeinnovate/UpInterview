const { Users } = require("../models/Users.js");
const { Contacts } = require("../models/Contacts.js");
const InterviewAvailability = require("../models/InterviewAvailability.js");
const OutsourceInterviewer = require("../models/OutsourceInterviewerRequest.js");
const { generateToken } = require('../utils/jwt');
const Tenant = require("../models/Tenant");

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
    const { userData, contactData, availabilityData, Freelancer, isInternalInterviewer,isProfileCompleteData, isUpdate } = req.body;

    // Validate input
    if (!userData || !contactData) {
      return res.status(400).json({
        success: false,
        message: "Missing required user or contact data"
      });
    }

    let savedUser, savedContact;

    if (isUpdate && userData.ownerId && contactData._id) {
      // UPDATE EXISTING RECORDS
      const userUpdate = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        profileId: userData.profileId,
        isFreelancer: userData.isFreelancer,
        isProfileCompleted: userData.isProfileCompleted,
        completionStatus: userData.completionStatus
      };

      savedUser = await Users.findByIdAndUpdate(
        userData.ownerId,
        { $set: userUpdate },
        { new: true }
      );

      if (!savedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      // Clean contact data
      const { availability, ...contactDataWithoutAvailability } = contactData;
      const contactUpdate = {
        ...contactDataWithoutAvailability,
        completionStatus: contactData.completionStatus
      };

      // Remove undefined values
      Object.keys(contactUpdate).forEach(key => {
        if (contactUpdate[key] === undefined) {
          delete contactUpdate[key];
        }
      });

      savedContact = await Contacts.findByIdAndUpdate(
        contactData._id,
        { $set: contactUpdate },
        { new: true }
      );

      const tenant = new Tenant({
        name: `${savedUser.firstName} ${savedUser.lastName}`,
        type: 'individual',
        subdomain: '', // Set as needed, or generate a unique one
        domainEnabled: false,
        owner: savedUser._id,
        email: savedUser.email,
        phone: savedUser.phone,
        country: '', // Set as needed
        timezone: '', // Set as needed
        plan: 'basic',
        planStatus: 'trial',
        status: 'active'
      });
      const savedTenant = await tenant.save();

      if (!savedContact) {
        return res.status(404).json({
          success: false,
          message: "Contact not found"
        });
      }
    } else {
      // CREATE NEW RECORDS
      const newUser = new Users({
        ...userData,
        // completionStatus: userData.completionStatus || {
        //   basicDetails: true,
        //   additionalDetails: false,
        //   interviewDetails: false,
        //   availabilityDetails: false
        // },
        isProfileCompleted: userData.isProfileCompleted || false
      });
      savedUser = await newUser.save();

      const { availability, ...contactDataWithoutAvailability } = contactData;
      const newContact = new Contacts({
        ...contactDataWithoutAvailability,
        ownerId: savedUser._id,
        completionStatus: contactData.completionStatus || {
          basicDetails: true,
          additionalDetails: false,
          interviewDetails: false,
          availabilityDetails: false
        }
      });
      savedContact = await newContact.save();
    }

    // Handle interview-related data for freelancers or internal interviewers
    if ((Freelancer || isInternalInterviewer) && contactData.completionStatus?.interviewDetails) {
      try {
        const interviewUpdate = {};

        // Only include fields that are explicitly provided
        if (contactData.skills !== undefined) interviewUpdate.skills = contactData.skills || [];
        if (contactData.technologies !== undefined) interviewUpdate.technologies = contactData.technologies || [];
        if (contactData.previousInterviewExperience !== undefined) {
          interviewUpdate.previousInterviewExperience = contactData.previousInterviewExperience || '';
        }
        if (contactData.expertiseLevel_ConductingInterviews !== undefined) {
          interviewUpdate.expertiseLevel_ConductingInterviews = contactData.expertiseLevel_ConductingInterviews || '';
        }
        if (contactData.hourlyRate !== undefined) interviewUpdate.hourlyRate = contactData.hourlyRate;
        if (contactData.interviewFormatWeOffer !== undefined) interviewUpdate.InterviewFormatWeOffer = contactData.interviewFormatWeOffer || [];
        if (contactData.expectedRatePerMockInterview !== undefined) interviewUpdate.expectedRatePerMockInterview = contactData.expectedRatePerMockInterview || '';
        if (contactData.noShowPolicy !== undefined) interviewUpdate.noShowPolicy = contactData.noShowPolicy || '';
        if (contactData.bio !== undefined) interviewUpdate.bio = contactData.bio || '';
        if (contactData.professionalTitle !== undefined) interviewUpdate.professionalTitle = contactData.professionalTitle || '';

        // Only update if there are fields to update
        if (Object.keys(interviewUpdate).length > 0) {
          await Contacts.findByIdAndUpdate(
            savedContact._id,
            { $set: interviewUpdate },
            { new: true }
          );
        }
      } catch (error) {
        console.error("Error saving interview data:", error);
        throw new Error("Failed to save interview data: " + error.message);
      }
    }

    // Handle availability data for freelancers or internal interviewers
    if ((Freelancer || isInternalInterviewer) && availabilityData && availabilityData.length > 0) {
      try {
        // Delete existing availability slots if updating
        if (isUpdate) {
          await InterviewAvailability.deleteMany({ contact: savedContact._id });
        }

        // Create new availability slots
        const availabilityDocs = availabilityData
          .filter(dayData => dayData.timeSlots && dayData.timeSlots.length > 0)
          .map(dayData => ({
            contact: savedContact._id,
            day: dayData.day,
            timeSlots: dayData.timeSlots
              .filter(slot => slot.startTime && slot.endTime)
              .map(slot => ({
                startTime: slot.startTime,
                endTime: slot.endTime
              })),
            createdBy: savedUser._id
          }))
          .filter(dayData => dayData.timeSlots.length > 0);

        if (availabilityDocs.length > 0) {
          await InterviewAvailability.insertMany(availabilityDocs);
        }
      } catch (error) {
        console.error("Error saving availability data:", error);
        throw new Error("Failed to save availability data: " + error.message);
      }
    }

    // Handle outsource interviewer for freelancers with hourly rate
    if (Freelancer && contactData.hourlyRate) {
      try {
        const existingInterviewer = await OutsourceInterviewer.findOne({ contactId: savedContact._id });

        if (existingInterviewer) {
          await OutsourceInterviewer.findByIdAndUpdate(
            existingInterviewer._id,
            {
              $set: {
                'requestedRate.hourlyRate': contactData.hourlyRate,
                updatedAt: new Date()
              }
            },
            { new: true }
          );
        } else {
          const newInterviewer = new OutsourceInterviewer({
            ownerId: savedUser._id,
            contactId: savedContact._id,
            requestedRate: {
              hourlyRate: contactData.hourlyRate
            },
            status: 'new',
            createdBy: savedUser._id
          });
          await newInterviewer.save();
        }
      } catch (error) {
        console.error("Error saving outsource interviewer:", error);
      }
    }

    // Generate token
    const payload = {
      userId: savedUser._id.toString(),
      organization: false,
      timestamp: new Date().toISOString(),
      freelancer: userData.isFreelancer
    };
    const token = generateToken(payload);

    res.status(200).json({
      success: true,
      message: isUpdate ? "Profile updated successfully" : "Profile created successfully",
      ownerId: savedUser._id,
      contactId: savedContact._id,
      isUpdate,
      // ...(isProfileCompleteData?.isProfileComplete && { tenantId: savedUser.tenantId }),
      token: token,
      isProfileCompleted: savedUser.isProfileCompleted
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