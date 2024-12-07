// utils/ContactValidation.js
export const validateContactForm = (contactData) => {
    const errors = {};

    if (!contactData || !contactData.Name) errors.Name = "Name is required";
    if (!contactData || !contactData.Email) {
        errors.Email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(contactData.Email)) {
        errors.Email = "Invalid email format";
    }
    if (!contactData || !contactData.Phone) errors.Phone = "Phone is required";
    if (!contactData || !contactData.LinkedinUrl) {
        errors.LinkedinUrl = "LinkedIn URL is required";
    } else if (!/^https?:\/\/(www\.)?linkedin\.com\/.*$/.test(contactData.LinkedinUrl)) {
        errors.LinkedinUrl = "Invalid LinkedIn URL format";
    }
    if (!contactData || !contactData.CurrentRole) errors.CurrentRole = "Current Role is required";
    if (!contactData || !contactData.industry) errors.industry = "Industry is required";
    if (!contactData || !contactData.Experience) errors.Experience = "Experience is required";

    return { formIsValid: Object.keys(errors).length === 0, newErrors: errors };
};

export const getContactErrorMessage = (field, value) => {
    const messages = {
        Name: "Name is required",
        Email: "Email is required",
        Phone: "Phone is required",
        UserId: "User ID is required",
        LinkedinUrl: "LinkedIn URL is required",
        CurrentRole: "Current Role is required",
        industry: "Industry is required",
        Experience: "Experience is required",
    };
    if (!value) {
        return messages[field];
    }
};