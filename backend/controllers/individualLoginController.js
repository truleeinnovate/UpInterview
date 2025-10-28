const { Users } = require("../models/Users.js");
const { Contacts } = require("../models/Contacts.js");
const InterviewAvailability = require("../models/InterviewAvailability.js");
const OutsourceInterviewer = require("../models/OutsourceInterviewerRequest.js");
const { generateToken } = require('../utils/jwt');
const Tenant = require("../models/Tenant");
const RolesPermissionObject = require('../models/RolesPermissionObject');
const { getAuthCookieOptions } = require('../utils/cookieUtils');
const { validateIndividualSignup } = require('../validations/IndivindualLoginValidation.js');

exports.individualLogin = async (req, res) => {
  try {
    console.log('[individualLogin] Step 1: Started processing individual login request');
    const {
      userData,
      contactData,
      availabilityData,
      isProfileCompleteStateOrg,
      isInternalInterviewer,
      ownerId,
      tenantData,
      // REMOVED: currentStep from here to avoid const reassignment conflict
    } = req.body;

    console.log('contactData:-', contactData);

    // ADDED: Declare currentStep explicitly from req.body (reliable, with fallback)
    const currentStep = req.body.currentStep || 0;
    console.log('[individualLogin] Using explicit currentStep:', currentStep); // ADDED: Debug log

    // ---------------- STEP VALIDATION ----------------
    // REMOVED: Entire buggy if-else inference block (unnecessary and flawed)
    // Now uses explicit currentStep directly
    const { error } = validateIndividualSignup(currentStep, contactData);
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((err) => err.message),
      });
    }

    let updatedUserData = { ...userData };
    // ---------------- ROLE ASSIGNMENT ----------------
    if (isProfileCompleteStateOrg === false || isProfileCompleteStateOrg === undefined) {
      let role = await RolesPermissionObject.findOne({
        roleName: userData.isFreelancer ? 'Individual_Freelancer' : 'Individual',
        roleType: 'individual'
      }).lean();
      if (!role) throw new Error('Role not found for the specified criteria');
      updatedUserData.roleId = role._id;
    }
    // ---------------- PARALLEL UPDATES ----------------
    const [savedUser, savedContact] = await Promise.all([
      Users.findOneAndUpdate({ _id: ownerId }, updatedUserData, { new: true }),
      Contacts.findOneAndUpdate({ ownerId }, contactData, { new: true })
    ]);
    // ---------------- TENANT UPDATE ----------------
    let savedTenant;
    if (isProfileCompleteStateOrg === undefined && tenantData?.isProfileCompletedForTenant) {
      savedTenant = await Tenant.findOneAndUpdate(
        { ownerId },
        { status: 'submitted' },
        { new: true }
      ).lean();
    }
    // ---------------- AVAILABILITY UPDATE ----------------
    if (availabilityData?.length > 0 && (userData.isFreelancer || isInternalInterviewer)) {
      try {
        const existing = await InterviewAvailability.findOne({ contact: savedContact._id }).lean();
        if (JSON.stringify(existing?.availability) !== JSON.stringify(availabilityData)) {
          await InterviewAvailability.updateOrCreate(savedContact._id, availabilityData);
        }
      } catch (error) {
        console.error('[individualLogin] Error saving availability:', error);
      }
    }
    // ---------------- OUTSOURCE INTERVIEWER ----------------
    if (currentStep === 3 && userData.isFreelancer) {
      // Create a new OutsourceInterviewer document
      const newInterviewer = new OutsourceInterviewer({
        ownerId,
        contactId: savedContact._id,
        requestedRate: savedContact.rates || contactData.rates || { 
          junior: { usd: 0, inr: 0, isVisible: true },
          mid: { usd: 0, inr: 0, isVisible: true },
          senior: { usd: 0, inr: 0, isVisible: true }
        },
        feedback: [{
          givenBy: ownerId,
          rating: 4.5,
          comments: "",
          createdAt: new Date()
        }],
        status: 'underReview',
        createdBy: ownerId,
        currency: 'INR'
      });

      // Save the new document
      await newInterviewer.save();
      console.log('newInterviewer', newInterviewer);
      console.log('[individualLogin] New OutsourceInterviewer created for freelancer on final step');
    }

    // ---------------- TOKEN GENERATION ----------------
    const payload = {
      userId: savedUser._id.toString(),
      tenantId: savedUser.tenantId,
      organization: isProfileCompleteStateOrg === true,
      timestamp: new Date().toISOString(),
      freelancer: userData.isFreelancer
    };
    const token = generateToken(payload);
    // ---------------- RESPONSE ----------------
    res.status(200).json({
      success: true,
      message: "Profile created successfully",
      ownerId,
      contactId: savedContact._id,
      ...(isProfileCompleteStateOrg && { tenantId: savedUser.tenantId }),
      token
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
