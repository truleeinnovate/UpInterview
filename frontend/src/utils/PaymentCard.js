import CryptoJS from 'crypto-js';

const SECRET_KEY = 'asdnalksm$$@#@cjh#@$abidsduwoa'; 

// Encrypt function
export const encryptData = (data) => {

  try {
    if (data === undefined || data === null) {
      return null;
    }
    return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
    
  } catch (error) {
    console.error('Error encrypting data:', error);
    return null;
  }
  
};

// Decrypt function
export const decryptData = (cipherText) => {
  try {
    if (!cipherText) {
      return null;
    }
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptedData;
  } catch (error) {
    console.error('Error decrypting data:', error);
    return null;
  }
};









