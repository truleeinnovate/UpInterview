// utils/RolesFormValidation.js

export const validateRolesForm = (formData) => {
    const errors = {};

    if (!formData.roleName) errors.roleName = "Role Name is required";
    if (!formData.reportsToRole) errors.reportsToRole = "Reports To Role is required";
    if (!formData.label) errors.label = "Label is required";

    return errors;
};