const { Users } = require("../models/Users.js");
const { Contacts } = require("../models/Contacts.js");
const InterviewAvailability = require("../models/InterviewAvailability.js");
const OutsourceInterviewer = require("../models/OutsourceInterviewerRequest.js");
const { generateToken } = require('../utils/jwt');
const Tenant = require("../models/Tenant");
const RolesPermissionObject = require('../models/RolesPermissionObject');
const { getAuthCookieOptions } = require('../utils/cookieUtils');
const { validateIndividualSignup } = require('../validations/IndivindualLoginValidation.js');
// const { validateAvailability } = require('../validations/AvailabilityValidation');
// validateIndividualSignup
// exports.individualLogin = async (req, res) => {
//   try {
//     console.log('[individualLogin] Step 1: Started processing individual login request');
//     const { userData, contactData, availabilityData, isProfileCompleteStateOrg, isInternalInterviewer, ownerId, tenantData } = req.body;

//     //     console.log('[individualLogin] Step 2: Extracted user, contact, availability, isProfileCompleteStateOrg, and isInternalInterviewer data');
//     //     console.log('[individualLogin] Step 2.1: userData:', userData);
//     //     console.log('[individualLogin] Step 2.2: contactData:', contactData);
//     //     console.log('[individualLogin] Step 2.3: availabilityData:', availabilityData);
//     //     console.log('[individualLogin] Step 2.4: isProfileCompleteStateOrg:', isProfileCompleteStateOrg);
//     //     console.log('[individualLogin] Step 2.5: tenantData:', tenantData);
//     //     console.log('[individualLogin] Step 2.6: isInternalInterviewer:', isInternalInterviewer);
//     //     console.log('[individualLogin] Step 2.7: ownerId:', ownerId);

//     // console.log("validateIndividualSignup",validateIndividualSignup);

//     // STEP VALIDATION
//     const completionStatus = contactData?.completionStatus || {};
//     let currentStep = 0;

//     if (completionStatus.basicDetails && !completionStatus.additionalDetails || completionStatus.basicDetails && completionStatus.additionalDetails) currentStep = 0;
//     else if (completionStatus.additionalDetails && !completionStatus.interviewDetails || completionStatus.additionalDetails && completionStatus.interviewDetails) currentStep = 1;
//     else if (completionStatus.interviewDetails && !completionStatus.availabilityDetails || completionStatus.interviewDetails && completionStatus.availabilityDetails) currentStep = 2;
//     else if (completionStatus.availabilityDetails) currentStep = 3;

//     const { error } = validateIndividualSignup(currentStep, contactData);
//     console.log("error", error);
//     if (error) {
//       return res.status(400).json({
//         success: false,
//         message: "Validation failed",
//         errors: error.details.map((err) => err.message),
//       });
//     }



//     let savedUser, savedContact, savedTenant;
//     let updatedUserData = { ...userData };

//     // Only handle role assignment if profile is not complete for organization
//     if (isProfileCompleteStateOrg === false || isProfileCompleteStateOrg === undefined) {
//       console.log('[individualLogin] Profile not complete for organization - handling role assignment');

//       // Find the appropriate role based on freelancer status
//       let role;
//       // console.log("Role", role);

//       if (userData.isFreelancer) {
//         role = await RolesPermissionObject.findOne({

//           roleName: 'Individual_Freelancer',
//           roleType: 'individual'
//         }).lean();
//         // console.log("role1", role);

//       } else {
//         role = await RolesPermissionObject.findOne({
//           roleName: 'Individual',
//           roleType: 'individual'
//         }).lean();
//         // console.log("role2", role);

//       }

//       if (!role) {
//         throw new Error('Role not found for the specified criteria');
//       }
//       // Add roleId to userData only when isProfileCompleteStateOrg is false
//       updatedUserData.roleId = role._id;
//     }

//     // Update User
//     savedUser = await Users.findOneAndUpdate(
//       { _id: ownerId },
//       updatedUserData,
//       { new: true }
//     );

//     // console.log('[individualLogin] Step 3: User updated:', savedUser);

//     // Update Contact by ownerId match
//     savedContact = await Contacts.findOneAndUpdate(
//       { ownerId: ownerId },
//       contactData,
//       { new: true }
//     );
//     // console.log('[individualLogin] Step 4: Contact updated:', savedContact);

//     // Update Tenant by ownerId match if needed
//     if (isProfileCompleteStateOrg === undefined) {
//       const updateData = {};

//       // If profile is completed, update tenant status to 'active'
//       if (tenantData.isProfileCompletedForTenant) {
//         updateData.status = 'submitted';
//         console.log('[individualLogin] Step 5.1: Updating tenant status to active');
//       }

//       const tenantExists = await Tenant.findOne({ ownerId });
//       // console.log('[individualLogin] 🔍 Does tenant exist:', tenantExists);

//       savedTenant = await Tenant.findOneAndUpdate(
//         { ownerId: ownerId },
//         updateData,
//         { new: true }
//       );
//       // console.log('[individualLogin] Step 5.2: Tenant updated:', savedTenant);
//     }

//     // Save availability if freelancer or internal interviewer
//     if (availabilityData && availabilityData.length > 0 && (userData.isFreelancer || isInternalInterviewer)) {
//       try {
//         console.log('[individualLogin] Step 7: Saving availability data');

//         // Use the updateOrCreate method to save all availability in one document
//         await InterviewAvailability.updateOrCreate(savedContact._id, availabilityData);
//         console.log('[individualLogin] Step 7.1: Saved availability data');
//       } catch (error) {
//         console.error('[individualLogin] Error saving availability:', error);
//         // Don't fail the whole request if availability save fails
//       }
//     }

//     // Save outsource interviewer if freelancer
//     if (userData.isFreelancer) {
//       const newInterviewer = new OutsourceInterviewer({
//         ownerId: ownerId,
//         contactId: savedContact._id,
//         requestedRate: {
//           hourlyRate: contactData.hourlyRate
//         },
//         finalRate: null,
//         feedback: [{
//           givenBy: ownerId,
//           rating: 4.5,
//           comments: "",
//           createdAt: new Date()
//         }],
//         createdBy: ownerId,
//         currency: 'USD'
//       });
//       await newInterviewer.save();
//       // console.log('[individualLogin] Step 8: Saved outsource interviewer');
//     }
//     // <-----------------------OutsourceInterviewer------------------------------->
//     const payload = {
//       userId: savedUser._id.toString(),
//       tenantId: savedUser.tenantId,
//       organization: isProfileCompleteStateOrg === true,
//       timestamp: new Date().toISOString(),
//       freelancer: userData.isFreelancer
//     };

//     const token = generateToken(payload);
//     // console.log('[individualLogin] Step 9: Generated token');

//     // Note: Auth token will be set by frontend using setAuthCookies()
//     // Backend only returns the token in response, frontend handles cookie setting

//     res.status(200).json({
//       success: true,
//       message: "Profile created successfully",
//       ownerId,
//       contactId: savedContact._id,
//       ...(isProfileCompleteStateOrg && { tenantId: savedUser.tenantId }),
//       token: token
//     });
//     // console.log('[individualLogin] Step 10: Sent response');

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
    console.log('[individualLogin] Step 1: Started processing individual login request');

    const { 
      userData, 
      contactData, 
      availabilityData, 
      isProfileCompleteStateOrg, 
      isInternalInterviewer, 
      ownerId, 
      tenantData 
    } = req.body;

    // ---------------- STEP VALIDATION ----------------
    const completionStatus = contactData?.completionStatus || {};
    let currentStep = 0;

    if (completionStatus.basicDetails && (!completionStatus.additionalDetails || completionStatus.additionalDetails)) currentStep = 0;
    else if (completionStatus.additionalDetails && (!completionStatus.interviewDetails || completionStatus.interviewDetails)) currentStep = 1;
    else if (completionStatus.interviewDetails && (!completionStatus.availabilityDetails || completionStatus.availabilityDetails)) currentStep = 2;
    else if (completionStatus.availabilityDetails) currentStep = 3;

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
      // CHANGE: use .lean() for faster reads, roles rarely change
      let role = await RolesPermissionObject.findOne({
        roleName: userData.isFreelancer ? 'Individual_Freelancer' : 'Individual',
        roleType: 'individual'
      }).lean(); // CHANGE: lean()

      if (!role) throw new Error('Role not found for the specified criteria');
      updatedUserData.roleId = role._id;
    }

    // ---------------- PARALLEL UPDATES ----------------
    // CHANGE: Run user + contact updates in parallel to save time
    const [savedUser, savedContact] = await Promise.all([
      Users.findOneAndUpdate({ _id: ownerId }, updatedUserData, { new: true }),
      Contacts.findOneAndUpdate({ ownerId }, contactData, { new: true })
    ]);

    // ---------------- TENANT UPDATE ----------------
    let savedTenant;
    if (isProfileCompleteStateOrg === undefined && tenantData?.isProfileCompletedForTenant) {
      // CHANGE: only update when needed, use lean()
      savedTenant = await Tenant.findOneAndUpdate(
        { ownerId },
        { status: 'submitted' },
        { new: true }
      ).lean();
    }

    // ---------------- AVAILABILITY UPDATE ----------------
    if (availabilityData?.length > 0 && (userData.isFreelancer || isInternalInterviewer)) {
      try {
        // CHANGE: avoid unnecessary DB writes by comparing existing data
        const existing = await InterviewAvailability.findOne({ contact: savedContact._id }).lean();
        if (JSON.stringify(existing?.availability) !== JSON.stringify(availabilityData)) {
          await InterviewAvailability.updateOrCreate(savedContact._id, availabilityData);
        }
      } catch (error) {
        console.error('[individualLogin] Error saving availability:', error);
        // CHANGE: Fail gracefully, don’t break API
      }
    }

    // ---------------- OUTSOURCE INTERVIEWER ----------------
    if (userData.isFreelancer) {
      // CHANGE: use upsert instead of always inserting → prevents duplicates
      await OutsourceInterviewer.updateOne(
        { ownerId, contactId: savedContact._id },
        {
          $setOnInsert: {
            requestedRate: { hourlyRate: contactData.hourlyRate },
            feedback: [{
              givenBy: ownerId,
              rating: 4.5,
              comments: "",
              createdAt: new Date()
            }],
            status: 'underReview',
            createdBy: ownerId,
            currency: 'USD'
          }
        },
        { upsert: true }
      );
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
