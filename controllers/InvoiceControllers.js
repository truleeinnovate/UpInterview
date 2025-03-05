const Invoicemodels = require("../models/Invoicemodels.js");

const  InvoiceController = async (req, res) => {
  try {
    const {
      tenantId,
      type,
      planId,
      subscriptionId,
      totalAmount,
      startDate,
      endDate,
      lineItems,
      comments
    } = req.body;

    // Validation for required fields
    if ( !type || !totalAmount || !startDate || !endDate) {
      return res.status(400).json({ error: "Missing required fields: tenantId, type, totalAmount, startDate, and endDate are required." });
    }

    // Validate subscription-specific fields
    if (type === 'subscription' && (!planId || !subscriptionId)) {
      return res.status(400).json({ error: "Subscription invoices require planId and subscriptionId." });
    }

    // Validate lineItems structure
    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      return res.status(400).json({ error: "Line items must be an array and cannot be empty." });
    }

    lineItems.forEach(item => {
      if (!item.description || !item.amount || item.amount <= 0) {
        return res.status(400).json({ error: "Each line item must have a valid description and amount greater than zero." });
      }
    });



    // Create and save the invoice
    const newInvoice = new Invoicemodels({
      
      tenantId,
      ownerId,
      planId,
      subscriptionId,
      type,
      totalAmount,
      outstandingAmount: totalAmount, 
      status: 'pending', 
      startDate,
      endDate,
      lineItems,
      comments
    });

    await newInvoice.save();

    res.status(201).json({
      message: "Invoice created successfully.",
      invoice: newInvoice
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error." });
  }
};


// get all invoice 
const Get_Invoice_Controllers = async (req, res) => {
  try {
    const invoices = await Invoicemodels.find(); 
    if (invoices.length === 0){
      return  res.status(400).json("have no data found");

    }
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: "Error fetching invoices" });
  }
}


// get invoices based on tenta id 
const getInvoiceBasedonId = async (req, res) => {
  try {
    const { ownerId } = req.params;
    
    // Validate the input early
    if (!ownerId) {
      return res.status(400).json({ message: 'ownerId ID is required.' });
    }

    // Fetch the invoice data for the tenant
    const invoiceData = await Invoicemodels.find({ ownerId });

    // If no invoice data is found, return a success message instead of error
    if (!invoiceData) {
      return res.status(200).json({ message: 'No invoices found for this tenant.' });
    }
    return res.status(200).json({
      invoiceData
    });

  } catch (error) {
   
    console.error('Error fetching invoice or subscription plan:', error);
    return res.status(500).json({ message: 'An error occurred while fetching the invoice and subscription plan.', error });
  }
};




module.exports = {InvoiceController,

  Get_Invoice_Controllers,
  getInvoiceBasedonId
};



