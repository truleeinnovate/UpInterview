const express = require("express");
const router = express.Router();
const {
  registerOrganization,
  loginOrganization,
  resetPassword,
  getOrganizationRequestStatus,
  organizationUserCreation,
  getRolesByTenant,
  getBasedIdOrganizations,
  checkSubdomainAvailability,
  updateSubdomain,
  getOrganizationSubdomain,
  activateSubdomain,
  deactivateSubdomain,
  updateBasedIdOrganizations,
  verifyEmail,
  verifyEmailChange,
  getAllOrganizations, // SUPER ADMIN added by Ashok
  getOrganizationById,
  superAdminLoginAsUser,
  deleteTenantAndAssociatedData,
} = require("../controllers/organizationLoginController");
const loggingService = require("../middleware/loggingService.js");

router.post(
  "/Signup",
  loggingService.internalLoggingMiddleware,
  registerOrganization
);
router.post("/Login", loginOrganization);
router.post("/reset-password", resetPassword);
router.post(
  "/new-user-Creation",
  loggingService.internalLoggingMiddleware,
  organizationUserCreation
);
//users in user creation in users tab
router.get("/roles/:tenantId", getRolesByTenant);

router.get("/organization-details/:id", getBasedIdOrganizations);

router.patch(
  "/organization-details/:id",
  loggingService.internalLoggingMiddleware,
  updateBasedIdOrganizations
);

// Subdomain management routes
router.post(
  "/check-subdomain",
  loggingService.internalLoggingMiddleware,
  checkSubdomainAvailability
);
router.post(
  "/update-subdomain",
  loggingService.internalLoggingMiddleware,
  updateSubdomain
);
router.get("/subdomain/:organizationId", getOrganizationSubdomain);
router.post(
  "/activate-subdomain",
  loggingService.internalLoggingMiddleware,
  activateSubdomain
);
router.post(
  "/deactivate-subdomain",
  loggingService.internalLoggingMiddleware,
  deactivateSubdomain
);

router.get("/verify-email", verifyEmail);
router.get("/verify-user-email", verifyEmailChange);

// SUPER ADMIN all-organizations added by Ashok ------------------------------->
router.get("/all-tenants", getAllOrganizations);
router.get("/:id", getOrganizationById);
router.delete("/:tenantId", deleteTenantAndAssociatedData);

//ashraf

// Super Admin login as user route
router.post(
  "/login-as-user",
  loggingService.internalLoggingMiddleware,
  superAdminLoginAsUser
);
// ---------------------------------------------------------------------------->

// Get organization request status
router.get(
  "/organization-request/:tenantId/:ownerId",
  getOrganizationRequestStatus
);

module.exports = router;
