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
    const type = "interview"
    const baseUrl = `${config.REACT_APP_API_URL_FRONTEND}/join-meeting`;

    const encryptedRoundId = encryptData(round._id);
    const encryptedSchedulerId = encryptData(interviewData._id);
    const encryptedSchedulerOwnerId = encryptData(interviewData.ownerId);

    if (!encryptedRoundId || !encryptedSchedulerId || !encryptedSchedulerOwnerId) return null;

    return `${baseUrl}?scheduler=true&round=${encodeURIComponent(encryptedRoundId)}&schedulertoken=${encodeURIComponent(encryptedSchedulerId)}&owner=${encodeURIComponent(encryptedSchedulerOwnerId)}${type ? `&type=${type}` : ''}`;
};
