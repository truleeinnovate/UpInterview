const Invoice = require("../models/Invoicemodels.js");
const mongoose = require('mongoose');
// GET: Fetch invoices by ownerId
// router.get('/get-invoice-by-owner/:ownerId', 
    
const getInvoiceById = async (req, res) => {
  try {
    const { ownerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(400).json({ error: 'Invalid ownerId format' });
    }

    const invoices = await Invoice.find({ ownerId }).sort({ updatedAt: -1, createdAt: -1 })
      .populate('planId')
      .populate('ownerId');

    if (!invoices || invoices.length === 0) {
      return res.status(404).json({ message: 'No invoices found for this owner.' });
    };

    

    res.status(200).json(invoices);
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({ 
      error: 'Server error',
      details: error.message 
    });
  }
};

module.exports = { getInvoiceById };