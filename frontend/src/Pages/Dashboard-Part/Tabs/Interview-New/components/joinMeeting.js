//this code only for scheduler join meeting button click sending to join meeting
import CryptoJS from "crypto-js";
import { config } from "../../../../../config";
import AuthCookieManager, {
    getAuthToken,
} from "../../../../../utils/AuthCookieManager/AuthCookieManager";
import { decodeJwt } from "../../../../../utils/AuthCookieManager/jwtDecode";

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

export const createJoinMeetingUrl = (round, interviewData, contactId = null, type) => {
    const authToken = getAuthToken(); // Use validated token getter
    const tokenPayload = decodeJwt(authToken);
    const ownerId = tokenPayload?.userId;
    if (!round?._id || !interviewData?._id || !ownerId) return null;

    // console.log("type interviewData", type, interviewData)
    let base = config.REACT_APP_API_URL_FRONTEND;

    // Force https if missing protocol (very common mistake in env files)
    if (!base.startsWith('http://') && !base.startsWith('https://')) {
        base = 'https://' + base;
    }

    // Remove trailing slash if present
    base = base.replace(/\/+$/, '');

    // const type = "interview";
    const baseUrl = `${base}/join-meeting`;

    const encryptedRoundId = encryptData(round._id);
    const encryptedContactId = encryptData(contactId);
    const encryptedOwnerId = encryptData(ownerId);

    if (!encryptedRoundId || !encryptedOwnerId) return null;
    // NEW: Prioritize joinAs over type for interviewer case
    if (round.joinAs === "interviewer") {
        // Interviewer URL (works for both real & mock)
        return `${baseUrl}?interviewer=true&round=${encodeURIComponent(encryptedRoundId)}&interviewertoken=${encodeURIComponent(encryptedContactId)}&owner=${encodeURIComponent(encryptedOwnerId)}${type ? `&type=${type}` : ''}`;
    }

    // Scheduler / Candidate cases (fallback)
    if (type === "mockinterview") {
        // Mock candidate URL
        return `${baseUrl}?candidate=true&round=${encodeURIComponent(encryptedRoundId)}${type ? `&type=${type}` : ''}`;
    }

    if (type === "interview") {
        // Real interview scheduler URL
        return `${baseUrl}?scheduler=true&round=${encodeURIComponent(encryptedRoundId)}&schedulertoken=${encodeURIComponent(encryptedContactId)}&owner=${encodeURIComponent(encryptedOwnerId)}${type ? `&type=${type}` : ''}`;
    }

    return null; // fallback if nothing matches
};
