import axios from 'axios';
import { config } from '../config';

/**
 * Validates the format of a Profile ID.
 * profileId is expected to be alphanumeric and can include dots.
 */
export const validateProfileIdFormat = (profileId) => {
    if (!profileId) return "Profile ID is required";
    if (profileId.length < 3) return "Profile ID must be at least 3 characters";
    const regex = /^[a-zA-Z0-9.]+$/;
    if (!regex.test(profileId)) return "Profile ID can only contain letters, numbers, and dots";
    return null;
};

/**
 * Validates the format of a Username (Work Email).
 */
export const validateUsernameFormat = (username) => {
    if (!username) return "Username is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(username)) {
        return "Please enter a valid work email address";
    }

    const personalDomains = [
        "gmail.com", "yahoo.com", "outlook.com", "hotmail.com",
        "aol.com", "icloud.com", "protonmail.com", "mail.com"
    ];
    const domain = username.split("@")[1]?.toLowerCase();
    if (personalDomains.includes(domain)) {
        return "Please use your company email address";
    }

    return null;
};

/**
 * Composite validation for Profile ID (Format + API Check).
 */
export const validateProfileId = async (profileId, checkProfileIdExistsFn) => {
    const formatError = validateProfileIdFormat(profileId);
    if (formatError) return formatError;

    if (checkProfileIdExistsFn) {
        try {
            const exists = await checkProfileIdExistsFn(profileId);
            if (exists) return "Profile ID already taken";
        } catch (err) {
            console.error("Error checking Profile ID:", err);
            return "Error verifying Profile ID";
        }
    }
    return null;
};

/**
 * Composite validation for Username (Format + API Check).
 */
export const validateUsername = async (username, checkUsernameExistsFn) => {
    const formatError = validateUsernameFormat(username);
    if (formatError) return formatError;

    if (checkUsernameExistsFn) {
        try {
            const exists = await checkUsernameExistsFn(username);
            if (exists) return "Username already taken";
        } catch (err) {
            console.error("Error checking Username:", err);
            return "Error verifying Username";
        }
    }
    return null;
};

/**
 * Checks if a Profile ID exists via API.
 */
export const checkProfileIdExists = async (profileId) => {
    try {
        const response = await axios.get(`${config.REACT_APP_API_URL}/users/check-profileId`, {
            params: { profileId }
        });
        return response.data.exists;
    } catch (error) {
        console.error("Error checking profileId existence:", error);
        throw error;
    }
};

/**
 * Checks if a Username exists via API.
 */
export const checkUsernameExists = async (username) => {
    try {
        const response = await axios.get(`${config.REACT_APP_API_URL}/users/check-username`, {
            params: { username }
        });
        return response.data.exists;
    } catch (error) {
        console.error("Error checking username existence:", error);
        throw error;
    }
};
