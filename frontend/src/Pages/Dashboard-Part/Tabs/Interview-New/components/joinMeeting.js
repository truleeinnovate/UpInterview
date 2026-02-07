//this code only for scheduler join meeting button click sending to join meeting
import CryptoJS from "crypto-js";
import { config } from "../../../../../config";

const SECRET_KEY = "asdnalksm$$@#@cjh#@$abidsduwoa";

export const encryptData = (data) => {
    try {
        if (data === undefined || data === null) return null;

        return CryptoJS.AES.encrypt(
            JSON.stringify(data),
            SECRET_KEY
        ).toString();
    } catch (error) {
        console.error("Error encrypting data:", error);
        return null;
    }
};

export const createJoinMeetingUrl = (round, interviewData) => {
    if (!round?._id || !interviewData?._id || !interviewData?.ownerId) return null;

    let base = config.REACT_APP_API_URL_FRONTEND;

    // Force https if missing protocol (very common mistake in env files)
    if (!base.startsWith('http://') && !base.startsWith('https://')) {
        base = 'https://' + base;
    }

    // Remove trailing slash if present
    base = base.replace(/\/+$/, '');

    const type = "interview";
    const baseUrl = `${base}/join-meeting`;

    const encryptedRoundId = encryptData(round._id);
    const encryptedSchedulerId = encryptData(interviewData._id);
    const encryptedOwnerId = encryptData(interviewData.ownerId);

    if (!encryptedRoundId || !encryptedSchedulerId || !encryptedOwnerId) return null;

    return `${baseUrl}?scheduler=true&round=${encodeURIComponent(encryptedRoundId)}&schedulertoken=${encodeURIComponent(encryptedSchedulerId)}&owner=${encodeURIComponent(encryptedOwnerId)}${type ? `&type=${type}` : ''}`;
};
