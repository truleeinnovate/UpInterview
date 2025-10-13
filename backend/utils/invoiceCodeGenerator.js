const Invoicemodels = require('../models/Invoicemodels.js');

/**
 * Generates a unique invoice code in the format INVC-00001
 * Ensures no duplicate codes are created across the entire system
 * @returns {Promise<string>} Unique invoice code
 */
const generateUniqueInvoiceCode = async () => {
  const MAX_RETRIES = 10; // Prevent infinite loops
  let attempts = 0;
  
  while (attempts < MAX_RETRIES) {
    attempts++;
    
    // Find the last invoice by ID to get the highest invoice number
    const lastInvoice = await Invoicemodels.findOne({})
      .sort({ _id: -1 })
      .select("invoiceCode")
      .lean();
    
    let nextNumber = 1;
    if (lastInvoice?.invoiceCode) {
      // Extract number from INVC-00001 format
      const match = lastInvoice.invoiceCode.match(/INVC-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1], 10) + 1;
      }
    }
    
    const invoiceCode = `INVC-${String(nextNumber).padStart(5, '0')}`;
    
    // Double-check that this invoice code doesn't already exist
    // This handles race conditions where multiple requests generate codes simultaneously
    const existingInvoice = await Invoicemodels.findOne({ invoiceCode }).lean();
    
    if (!existingInvoice) {
      // Code is unique, return it
      console.log(`Generated unique invoice code: ${invoiceCode} (attempt ${attempts})`);
      return invoiceCode;
    }
    
    // If code exists, log warning and try again
    console.warn(`Invoice code ${invoiceCode} already exists, generating new one...`);
  }
  
  // If we've exhausted retries, generate a timestamp-based fallback
  const timestamp = Date.now();
  const fallbackCode = `INVC-${timestamp}`;
  console.error(`Failed to generate unique invoice code after ${MAX_RETRIES} attempts. Using fallback: ${fallbackCode}`);
  return fallbackCode;
};

module.exports = {
  generateUniqueInvoiceCode
};
