const { Users } = require("../models/Users.js");
const { Contacts } = require("../models/Contacts.js");
const InterviewAvailability = require("../models/InterviewAvailability.js");
const OutsourceInterviewer = require("../models/OutsourceInterviewerRequest.js");
const { generateToken } = require('../utils/jwt');
const Tenant = require("../models/Tenant");

exports.individualLogin = async (req, res) => {
  try {
    console.log('[individualLogin] Step 1: Started processing individual login request');
    const { userData, contactData, availabilityData, isProfileCompleteStateOrg, isInternalInterviewer, ownerId, tenantData } = req.body;

    console.log('[individualLogin] Step 2: Extracted user, contact, availability, isProfileCompleteStateOrg, and isInternalInterviewer data');
    console.log('[individualLogin] Step 2.1: userData:', userData);
    console.log('[individualLogin] Step 2.2: contactData:', contactData);
    console.log('[individualLogin] Step 2.3: availabilityData:', availabilityData);
    console.log('[individualLogin] Step 2.4: isProfileCompleteStateOrg:', isProfileCompleteStateOrg);
    console.log('[individualLogin] Step 2.5: tenantData:', tenantData);
    console.log('[individualLogin] Step 2.6: isInternalInterviewer:', isInternalInterviewer);
    console.log('[individualLogin] Step 2.7: ownerId:', ownerId);

    let savedUser, savedContact, savedTenant;

    // Update User
    savedUser = await Users.findOneAndUpdate(
      { _id: ownerId },
      userData,
      { new: true }
    );

    console.log('[individualLogin] Step 3: User updated:', savedUser);

    // 🔁 Update Contact by ownerId match
    savedContact = await Contacts.findOneAndUpdate(
      { ownerId: ownerId },
      contactData,
      { new: true }
    );
    console.log('[individualLogin] Step 4: Contact updated:', savedContact);

    // 🔁 Update Tenant by ownerId match if needed
    if (isProfileCompleteStateOrg === undefined) {
      const updateData = {};

      // If profile is completed, update tenant status to 'active'
      if (tenantData.isProfileCompletedForTenant) {
        updateData.status = 'submitted';
        console.log('[individualLogin] Step 5.1: Updating tenant status to active');
      }

      const tenantExists = await Tenant.findOne({ ownerId });
      console.log('[individualLogin] 🔍 Does tenant exist:', tenantExists);

      savedTenant = await Tenant.findOneAndUpdate(
        { ownerId: ownerId },
        updateData,
        { new: true }
      );
      console.log('[individualLogin] Step 5.2: Tenant updated:', savedTenant);
    }


    // else {
    //   // Create new user
    //   const newUser = new Users(userData);
    //   savedUser = await newUser.save();
    //   console.log('[individualLogin] Step 5: Created new user with id:', savedUser._id);

    //   // Create new contact
    //   const newContact = new Contacts({
    //     ...contactData,
    //     ownerId: savedUser._id
    //   });
    //   savedContact = await newContact.save();
    //   console.log('[individualLogin] Step 6: Created new contact with id:', savedContact._id);
    // }

    // Save availability if freelancer or internal interviewer
    // if (Freelancer || isInternalInterviewer) {
    //   const mockReq = { body: { contact: savedContact._id, days: availabilityData } };
    //   const mockRes = {
    //     status: (code) => ({
    //       json: (data) => console.log("Availability response:", data),
    //     }),
    //   };
    //   await availabilityController.createOrUpdateInterviewAvailability(mockReq, mockRes);
    //   console.log('[individualLogin] Step 7: Saved availability');
    // }
    // <-----------------------OutsourceInterviewer------------------------------->

    // Save outsource interviewer if freelancer
    if (userData.isFreelancer) {
      const newInterviewer = new OutsourceInterviewer({
        ownerId: ownerId,
        contactId: savedContact._id,
        requestedRate: {
          hourlyRate: contactData.hourlyRate
        },
        finalRate: null,
        feedback: [{
          givenBy: ownerId,
          rating: 4.5,
          comments: "",
          createdAt: new Date()
        }],
        createdBy: ownerId,
        currency: 'USD'
      });
      await newInterviewer.save();
      console.log('[individualLogin] Step 8: Saved outsource interviewer');
    }
    // <-----------------------OutsourceInterviewer------------------------------->
    const payload = {
      userId: savedUser._id.toString(),
      ...(isProfileCompleteStateOrg && { tenantId: savedUser.tenantId }),
      organization: isProfileCompleteStateOrg === true,
      timestamp: new Date().toISOString(),
      freelancer: userData.isFreelancer
    };

    const token = generateToken(payload);
    console.log('[individualLogin] Step 9: Generated token');

    res.status(200).json({
      success: true,
      message: "Profile created successfully",
      ownerId,
      contactId: savedContact._id,
      ...(isProfileCompleteStateOrg && { tenantId: savedUser.tenantId }),
      token: token
    });
    console.log('[individualLogin] Step 10: Sent response');

  } catch (error) {
    console.error("Error in individual login:", error);
    res.status(500).json({
      success: false,
      message: "Error processing your request",
      error: error.message
    });
  }
};