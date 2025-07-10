const { Users } = require("../models/Users.js");
const { Contacts } = require("../models/Contacts.js");
const InterviewAvailability = require("../models/InterviewAvailability.js");
const OutsourceInterviewer = require("../models/OutsourceInterviewerRequest.js");
const { generateToken } = require('../utils/jwt');
const Tenant = require("../models/Tenant");
const RolesPermissionObject = require('../models/RolesPermissionObject');
const { getAuthCookieOptions } = require('../utils/cookieUtils');

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
    let updatedUserData = { ...userData };

    // Only handle role assignment if profile is not complete for organization
    if (isProfileCompleteStateOrg === false || isProfileCompleteStateOrg === undefined) {
      console.log('[individualLogin] Profile not complete for organization - handling role assignment');

      // Find the appropriate role based on freelancer status
      let role;
      console.log("Role", role);

      if (userData.isFreelancer) {
        role = await RolesPermissionObject.findOne({

          roleName: 'Individual_Freelancer',
          roleType: 'individual'
        });
        console.log("role1", role);

      } else {
        role = await RolesPermissionObject.findOne({
          roleName: 'Individual',
          roleType: 'individual'
        });
        console.log("role2", role);

      }

      if (!role) {
        throw new Error('Role not found for the specified criteria');
      }
      // Add roleId to userData only when isProfileCompleteStateOrg is false
      updatedUserData.roleId = role._id;
    }

    // Update User
    savedUser = await Users.findOneAndUpdate(
      { _id: ownerId },
      updatedUserData,
      { new: true }
    );

    // console.log('[individualLogin] Step 3: User updated:', savedUser);

    // Update Contact by ownerId match
    savedContact = await Contacts.findOneAndUpdate(
      { ownerId: ownerId },
      contactData,
      { new: true }
    );
    // console.log('[individualLogin] Step 4: Contact updated:', savedContact);

    // Update Tenant by ownerId match if needed
    if (isProfileCompleteStateOrg === undefined) {
      const updateData = {};

      // If profile is completed, update tenant status to 'active'
      if (tenantData.isProfileCompletedForTenant) {
        updateData.status = 'submitted';
        console.log('[individualLogin] Step 5.1: Updating tenant status to active');
      }

      const tenantExists = await Tenant.findOne({ ownerId });
      // console.log('[individualLogin] 🔍 Does tenant exist:', tenantExists);

      savedTenant = await Tenant.findOneAndUpdate(
        { ownerId: ownerId },
        updateData,
        { new: true }
      );
      // console.log('[individualLogin] Step 5.2: Tenant updated:', savedTenant);
    }

    // Save availability if freelancer or internal interviewer
    if (availabilityData && availabilityData.length > 0 && (userData.isFreelancer || isInternalInterviewer)) {
      try {
        console.log('[individualLogin] Step 7: Saving availability data');

        // Use the updateOrCreate method to save all availability in one document
        await InterviewAvailability.updateOrCreate(savedContact._id, availabilityData);
        console.log('[individualLogin] Step 7.1: Saved availability data');
      } catch (error) {
        console.error('[individualLogin] Error saving availability:', error);
        // Don't fail the whole request if availability save fails
      }
    }

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
      // console.log('[individualLogin] Step 8: Saved outsource interviewer');
    }
    // <-----------------------OutsourceInterviewer------------------------------->
    const payload = {
      userId: savedUser._id.toString(),
      tenantId: savedUser.tenantId,
      organization: isProfileCompleteStateOrg === true,
      timestamp: new Date().toISOString(),
      freelancer: userData.isFreelancer
    };

    const token = generateToken(payload);
    // console.log('[individualLogin] Step 9: Generated token');

    // Set auth token cookie
    res.cookie('authToken', token, getAuthCookieOptions());

    res.status(200).json({
      success: true,
      message: "Profile created successfully",
      ownerId,
      contactId: savedContact._id,
      ...(isProfileCompleteStateOrg && { tenantId: savedUser.tenantId }),
      token: token
    });
    // console.log('[individualLogin] Step 10: Sent response');

  } catch (error) {
    console.error("Error in individual login:", error);
    res.status(500).json({
      success: false,
      message: "Error processing your request",
      error: error.message
    });
  }
};