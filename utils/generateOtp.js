

const CryptoJS = require("crypto-js");
const crypto = require("crypto");

function generateOTP(candidateId, interval = 180)  {
  try {
    const time = Math.floor(Date.now() / 1000 / interval);
    const secret = `${candidateId}${
      process.env.HMAC_SECRET || "default-secret"
    }`;
    const hmac = crypto.createHmac("sha1", secret);
    hmac.update(Buffer.from(time.toString()));
    const hash = hmac.digest("hex");
    const offset = parseInt(hash[hash.length - 1], 16);
    const binary = parseInt(hash.substr(offset * 2, 8), 16) & 0x7fffffff;

    // Generate a 4-digit OTP
    const otp = binary % 10 ** 5;
    return otp.toString().padStart(5, "0"); // Ensures OTP is always 4 digits
  } catch (error) {
    console.error("Error generating OTP:", error);
    throw new Error("Unable to generate OTP");
  }
}



const encrypt = (text, secretKey) => {
  const encrypted = CryptoJS.AES.encrypt(text, secretKey).toString();
  return encodeURIComponent(encrypted); // Make it URL-safe
};


module.exports = {generateOTP,encrypt}