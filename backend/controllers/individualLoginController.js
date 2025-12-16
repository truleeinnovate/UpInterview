const { Users } = require("../models/Users.js");
const { Contacts } = require("../models/Contacts.js");
const InterviewAvailability = require("../models/InterviewAvailability.js");
const OutsourceInterviewer = require("../models/OutsourceInterviewerRequest.js");
const { generateToken } = require("../utils/jwt");
const Tenant = require("../models/Tenant");
const RolesPermissionObject = require("../models/RolesPermissionObject");
const { getAuthCookieOptions } = require("../utils/cookieUtils");
const {
  validateIndividualSignup,
} = require("../validations/IndivindualLoginValidation.js");
const { generateUniqueId } = require("../services/uniqueIdGeneratorService");

exports.individualLogin = async (req, res) => {
  try {
    const {
      userData,
      contactData,
      availabilityData,
      isProfileCompleteStateOrg,
      isInternalInterviewer,
      ownerId,
      tenantData,
    } = req.body;

    const currentStep = req.body.currentStep || 0;

    // ---------------- STEP VALIDATION ----------------
    const { error } = validateIndividualSignup(currentStep, contactData);
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.details.map((err) => err.message),
      });
    }

    // ---------------- ROLE ASSIGNMENT ----------------
    let updatedUserData = { ...userData };
    if (
      isProfileCompleteStateOrg === false ||
      isProfileCompleteStateOrg === undefined
    ) {
      let role = await RolesPermissionObject.findOne({
        roleName: userData.isFreelancer
          ? "Individual_Freelancer"
          : "Individual",
        roleType: "individual",
      }).lean();
      if (!role) throw new Error("Role not found for the specified criteria");
      updatedUserData.roleId = role._id;
    }

    // ---------------- PARALLEL UPDATES ----------------
    const [savedUser, savedContact] = await Promise.all([
      Users.findOneAndUpdate({ _id: ownerId }, updatedUserData, { new: true }),
      Contacts.findOneAndUpdate({ ownerId }, contactData, { new: true }),
    ]);

    // ---------------- TENANT UPDATE ----------------
    let savedTenant;
    if (
      isProfileCompleteStateOrg === undefined &&
      tenantData?.isProfileCompletedForTenant
    ) {
      savedTenant = await Tenant.findOneAndUpdate(
        { ownerId },
        { status: "submitted" },
        { new: true }
      ).lean();
    }

    // ---------------- AVAILABILITY UPDATE ----------------
    let savedAvailability = null;
    if (
      availabilityData?.length > 0 &&
      (userData.isFreelancer || isInternalInterviewer)
    ) {
      try {
        const existing = await InterviewAvailability.findOne({
          contact: savedContact._id,
        }).lean();
        if (
          JSON.stringify(existing?.availability) !==
          JSON.stringify(availabilityData)
        ) {
          savedAvailability = await InterviewAvailability.updateOrCreate(
            savedContact._id,
            availabilityData
          );
        } else {
          savedAvailability = existing;
        }
      } catch (error) {
        console.error("[individualLogin] Error saving availability:", error);
      }
    }

    // ---------------- OUTSOURCE INTERVIEWER ----------------
let newInterviewer = null;

if (currentStep === 3 && userData.isFreelancer) {
  // 🔹 Check if already exists for this owner
  const existingInterviewer = await OutsourceInterviewer.findOne({
    ownerId,
  }).lean();

  if (!existingInterviewer) {
    const outsourceRequestCode = await generateUniqueId(
      "OINT",
      OutsourceInterviewer,
      "outsourceRequestCode"
    );

    newInterviewer = new OutsourceInterviewer({
      outsourceRequestCode,
      ownerId,
      contactId: savedContact._id,
      requestedRate:
        savedContact.rates ||
        contactData.rates || {
          junior: { usd: 0, inr: 0, isVisible: true },
          mid: { usd: 0, inr: 0, isVisible: true },
          senior: { usd: 0, inr: 0, isVisible: true },
        },
      feedback: [
        {
          givenBy: ownerId,
          rating: 4.5,
          comments: "",
          createdAt: new Date(),
        },
      ],
      status: "underReview",
      createdBy: ownerId,
      currency: "INR",
    });

    await newInterviewer.save();
  } else {
    // 🔹 Skip creation if already exists
    newInterviewer = existingInterviewer;
  }
}


    // ---------------- TOKEN GENERATION ----------------
    const payload = {
      userId: savedUser._id.toString(),
      tenantId: savedUser.tenantId,
      organization: isProfileCompleteStateOrg === true,
      timestamp: new Date().toISOString(),
      freelancer: userData.isFreelancer,
    };
    const token = generateToken(payload);

    // ---------------- COMPLETE RESPONSE ----------------
    const apiResponse = {
      success: true,
      message: "Profile created successfully",
      ownerId,
      contactId: savedContact._id,
      tenantId: savedUser.tenantId,
      tenant: savedTenant,
      user: savedUser,
      contact: savedContact,
      ...(userData.isFreelancer && { availability: savedAvailability }),
      ...(userData.isFreelancer && { outsourceInterviewer: newInterviewer }),
      timestamp: new Date().toISOString(),
    };

    // ---------------- LOGGING ----------------
    if (
      (userData.isFreelancer && currentStep === 3) || // freelancers at step 3
      (!userData.isFreelancer && currentStep === 1) // non-freelancers at step 1
    ) {
      res.locals.loggedByController = true;
      res.locals.processName = "Create Individual";
      res.locals.logData = {
        tenantId: savedUser.tenantId || savedTenant?._id,
        ownerId: savedUser._id,
        processName: "Create Individual",
        requestBody: req.body,
        message: "Individual created successfully",
        status: "success",
        responseBody: JSON.parse(JSON.stringify(apiResponse)), // ✅ safe clone
      };
    }

    // ---------------- RESPONSE ----------------
    res.status(200).json({
      success: true,
      message: "Profile created successfully",
      ownerId,
      contactId: savedContact._id,
      // ...(isProfileCompleteStateOrg && { tenantId: savedUser.tenantId }),
      tenantId: savedUser.tenantId,
      token,
    });
  } catch (error) {
    console.error("Error in individual login:", error);

    res.locals.logData = {
      tenantId: req.body.tenantId,
      ownerId: req.body.ownerId,
      processName: "Create Individual",
      requestBody: req.body,
      message: error.message,
      status: "error",
      responseError: JSON.stringify({
        message: error.message,
        stack: error.stack,
      }), // ✅ fix cast error
    };

    return res.status(500).json({
      success: false,
      message: "Error processing your request",
      error: error.message,
    });
  }
};
