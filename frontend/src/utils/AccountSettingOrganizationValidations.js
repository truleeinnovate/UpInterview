// v1.0.0 - Ashok - Phone number has * as mandatory field but previously it's not so fixed that issue

// validations/companyValidation.js
export const validateCompanyProfile = (formData) => {
    const errors = {};

    // Helper function to safely access and trim a field
    const safeTrim = (value) => (typeof value === 'string' ? value.trim() : '');

    // Required fields validation
    if (!safeTrim(formData.company)) errors.company = "Company name is required";
    if (!safeTrim(formData.industry)) errors.industry = "Industry is required";
    if (!safeTrim(formData.employees)) errors.employees = "Company size is required";
    if (!safeTrim(formData.country)) errors.country = "Country is required";
    if (!safeTrim(formData.website)) errors.website = "Website is required";
    if (!safeTrim(formData.firstName)) errors.firstName = "First name is required";
    if (!safeTrim(formData.lastName)) errors.lastName = "Last name is required";
    if (!safeTrim(formData.email)) errors.email = "Email is required"; // Fixed capitalization (Email -> email)
    if (!safeTrim(formData.jobTitle)) errors.jobTitle = "Job title is required";
    // v1.0.0 <---------------------------------------------------------------------
    if (!safeTrim(formData.phone)) errors.phone = "Phone number is required";
    // v1.0.0 --------------------------------------------------------------------->

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
        errors.email = "Invalid email format";
    }

    // Phone format validation (basic check for 10-15 digits)
    const phoneRegex = /^\d{10,15}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
        errors.phone = "Phone must be 10-15 digits";
    }

    // Website URL validation
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (formData.website && !urlRegex.test(formData.website)) {
        errors.website = "Invalid website URL";
    }

    // Social media URL validation (basic check)
    const socialRegex = /^(https?:\/\/)?([\w.-]+)(\.[\w]{2,6})([/\w .-]*)*\/?$/;
    if (formData.socialMedia?.linkedin && !socialRegex.test(formData.socialMedia.linkedin)) {
        errors.linkedin = "Invalid LinkedIn URL";
    }
    if (formData.socialMedia?.twitter && !socialRegex.test(formData.socialMedia.twitter)) {
        errors.twitter = "Invalid Twitter URL";
    }
    if (formData.socialMedia?.facebook && !socialRegex.test(formData.socialMedia.facebook)) {
        errors.facebook = "Invalid Facebook URL";
    }

    // In your validateCompanyProfile function
    // const phoneRegex = /^\d{10}$/;

    // Headquarters phone validation
    if (formData.headquarters.phone && !phoneRegex.test(formData.headquarters.phone)) {
        errors.headquarters = errors.headquarters || {};
        errors.headquarters.phone = "Phone must be exactly 10 digits";
    }

    // Regional office phone validation
    if (formData.regionalOffice.phone && !phoneRegex.test(formData.regionalOffice.phone)) {
        errors.regionalOffice = errors.regionalOffice || {};
        errors.regionalOffice.phone = "Phone must be exactly 10 digits";
    }

    return errors;
};