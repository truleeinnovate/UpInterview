const { Users } = require("../models/Users.js");
const { Contacts } = require("../models/Contacts.js");
const InterviewAvailability = require("../models/InterviewAvailability.js");
const OutsourceInterviewer = require("../models/OutsourceInterviewerRequest.js");
const { generateToken } = require("../utils/jwt");
const Tenant = require("../models/Tenant");
const RolesPermissionObject = require("../models/rolesPermissionObject");
const { getAuthCookieOptions } = require("../utils/cookieUtils");
const {
  validateIndividualSignup,
} = require("../validations/IndivindualLoginValidation.js");
const { generateUniqueId } = require("../services/uniqueIdGeneratorService");
const SubscriptionPlan = require("../models/Subscriptionmodels.js");
const CustomerSubscription = require("../models/CustomerSubscriptionmodels.js");
const Wallet = require("../models/WalletTopup.js");
const Usage = require("../models/Usage.js");
const {
  createInvoice,
  createSubscriptionRecord,
} = require("./CustomerSubscriptionInvoiceContollers.js");
const {
  CreateOrGetVideoCallingSettings,
} = require("./VideoCallingSettingControllers/VideoCallingSettingController.js");

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
      isSkip,
    } = req.body;

    const currentStep = req.body.currentStep || 0;

    // ---------------- STEP VALIDATION ----------------
    if (!isSkip) {
      const { error } = validateIndividualSignup(currentStep, contactData, isProfileCompleteStateOrg);
      if (error) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.details.map((err) => err.message),
        });
      }
    }

    // ---------------- UNIQUENESS CHECK ----------------
    if (contactData && contactData.profileId) {
      const existingProfileIdUser = await Users.findOne({
        _id: { $ne: ownerId },
        profileId: contactData.profileId,
      });
      if (existingProfileIdUser) {
        return res.status(400).json({
          success: false,
          message: "Profile ID already taken",
        });
      }
    }

    // ---------------- ROLE ASSIGNMENT & ACTIVATION ----------------
    let updatedUserData = { ...userData };

    // Account Activation for Org Users
    if (isProfileCompleteStateOrg === true) {
      if (isSkip) {
        updatedUserData.isSkipped = true;
        // updatedUserData.status = 'active';
      }

      // If NOT skipping, check if we should mark profile as completed
      if (!isSkip) {
        if (isInternalInterviewer) {
          if (currentStep === 3 || currentStep === 1) {
            updatedUserData.isProfileCompleted = true;
            // updatedUserData.status = 'active';
          }
        }
      }
    }

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

    // ---------------- AUTO FREE PLAN FOR FREELANCERS ----------------
    if (currentStep === 3 && userData.isFreelancer && !isProfileCompleteStateOrg) {
      try {
        // Find the Free individual subscription plan
        const freePlan = await SubscriptionPlan.findOne({
          name: "Free",
          subscriptionType: "individual",
          active: true,
        });

        if (freePlan) {
          // Check if subscription already exists for this user
          const existingSubscription = await CustomerSubscription.findOne({ ownerId });

          if (!existingSubscription) {
            // 1. Create Wallet if not exists
            let wallet = await Wallet.findOne({ ownerId });
            if (!wallet) {
              const walletCode = await generateUniqueId("WLT", Wallet, "walletCode");
              wallet = new Wallet({
                tenantId: savedUser.tenantId,
                ownerId,
                walletCode,
                balance: 0,
                holdAmount: 0,
                transactions: [],
              });
              await wallet.save();
            }

            // 2. Create Invoice (paid, amount 0)
            const invoice = await createInvoice(
              savedUser.tenantId,
              ownerId,
              freePlan.name,
              freePlan._id,
              0, // totalAmount
              { tenantId: savedUser.tenantId, ownerId, userType: "individual", membershipType: "monthly" },
              "paid",
              0 // discount
            );

            // 3. Create Subscription Record (active)
            const subscription = await createSubscriptionRecord(
              { tenantId: savedUser.tenantId, ownerId, userType: "individual", membershipType: "monthly" },
              { subscriptionPlanId: freePlan._id, monthlyPrice: 0, annualPrice: 0 },
              0, // pricing
              0, // discount
              0, // totalAmount
              invoice._id,
              "active"
            );

            // 4. Activate Tenant and set limits from plan features
            const features = freePlan.features || [];
            const tenant = await Tenant.findById(savedUser.tenantId);
            if (tenant) {
              tenant.status = "active";

              const bandwidthFeature = features.find((f) => f?.name === "Bandwidth");
              let bandwidthLimit = bandwidthFeature?.limit ?? tenant.usersBandWidth ?? 0;
              if (bandwidthLimit === "unlimited" || bandwidthLimit === "Unlimited") {
                bandwidthLimit = 0;
              }
              tenant.usersBandWidth = Number(bandwidthLimit) || 0;

              const usersFeature = features.find((f) => f?.name === "Users");
              let usersLimit = usersFeature?.limit ?? tenant.totalUsers ?? 0;
              if (usersLimit === "unlimited" || usersLimit === "Unlimited") {
                usersLimit = 0;
              }
              tenant.totalUsers = Number(usersLimit) || 0;

              await tenant.save();
            }

            // 5. Activate User
            savedUser.status = "active";
            await savedUser.save();

            // 6. Create default Video Calling Settings
            await CreateOrGetVideoCallingSettings(savedUser.tenantId, ownerId);

            // 7. Create Usage record
            const usageAttributes = features
              .filter((f) =>
                ["Assessments", "Internal_Interviews", "Question_Bank_Access", "Bandwidth"].includes(f?.name)
              )
              .map((f) => ({
                entitled: Number(f?.limit) || 0,
                type:
                  f?.name === "Internal_Interviews" ? "Internal Interviews" :
                  f?.name === "Question_Bank_Access" ? "Question Bank Access" :
                  f?.name === "Bandwidth" ? "User Bandwidth" : f?.name,
                utilized: 0,
                remaining: Number(f?.limit) || 0,
              }));

            const endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 1);

            await Usage.findOneAndUpdate(
              { tenantId: savedUser.tenantId, ownerId },
              {
                $setOnInsert: {
                  tenantId: savedUser.tenantId,
                  ownerId,
                  usageAttributes,
                  fromDate: new Date(),
                  toDate: endDate,
                },
              },
              { new: true, upsert: true, setDefaultsOnInsert: true }
            );

            console.log(`[individualLogin] Auto-activated Free plan for freelancer: ${ownerId}`);
          }
        } else {
          console.warn("[individualLogin] No Free plan found for individual subscription type");
        }
      } catch (freePlanErr) {
        console.error("[individualLogin] Error auto-activating Free plan:", freePlanErr);
        // Don't block the user flow if free plan activation fails
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
