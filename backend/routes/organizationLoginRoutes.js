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
} = require("../controllers/organizationLoginController");

router.post("/Signup", registerOrganization);
router.post("/Login", loginOrganization);
router.post("/reset-password", resetPassword);
router.post("/new-user-Creation", organizationUserCreation);
//users in user creation in users tab
router.get("/roles/:tenantId", getRolesByTenant);

router.get("/organization-details/:id", getBasedIdOrganizations);

router.patch("/organization-details/:id", updateBasedIdOrganizations);

// Subdomain management routes
router.post("/check-subdomain", checkSubdomainAvailability);
router.post("/update-subdomain", updateSubdomain);
router.get("/subdomain/:organizationId", getOrganizationSubdomain);
router.post("/activate-subdomain", activateSubdomain);
router.post("/deactivate-subdomain", deactivateSubdomain);

router.get("/verify-email", verifyEmail);
router.get("/verify-user-email", verifyEmailChange);

// SUPER ADMIN all-organizations added by Ashok ------------------------------->
router.get("/all-organizations", getAllOrganizations);
router.get("/:id", getOrganizationById);

//ashraf

// Super Admin login as user route
router.post("/login-as-user", superAdminLoginAsUser);
// ---------------------------------------------------------------------------->

// Get organization request status
router.get("/organization-request/:tenantId/:ownerId", getOrganizationRequestStatus);

module.exports = router;
