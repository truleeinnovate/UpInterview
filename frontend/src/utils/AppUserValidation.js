// utils/AppUserValidation.js

export const validateUserForm = (userData) => {
    const errors = {};

    if (!userData.FirstName) errors.FirstName = "First Name is required";
    if (!userData.LastName) errors.LastName = "Last Name is required";
    if (!userData.Email) {
        errors.Email = "Email is required";
    } else if (!/^[^\s@]+@gmail\.com$/.test(userData.Email)) {
        errors.Email = "Invalid email address";
    }
    if (!userData.Phone) {
        errors.Phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(userData.Phone)) {
        errors.Phone = "Invalid phone number";
    }
    if (!userData.UserID) errors.UserID = "User ID is required";
    if (!userData.Password) errors.Password = "Password is required";
    if (!userData.Gender) errors.Gender = "Gender is required";
    if (!userData.TimeZone) errors.TimeZone = "Time Zone is required";
    if (!userData.Language) errors.Language = "Language is required";
    if (!userData.LinkedinURL) errors.LinkedinURL = "Linkedin URL is required";
    if (!userData.ProfileId) errors.ProfileId = "Profile is required";
    if (!userData.RoleId) errors.RoleId = "Role is required";

    return errors;
};