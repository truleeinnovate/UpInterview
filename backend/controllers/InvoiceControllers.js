const Invoice = require("../models/Invoicemodels.js");
const mongoose = require('mongoose');

// GET: Fetch invoices by ownerId or tenantId based on isOrganization query param
const getInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const { isOrganization } = req.query;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid ID format' });
        }

        const queryField = isOrganization === 'true' ? 'tenantId' : 'ownerId';
        const invoices = await Invoice.find({ [queryField]: id })
            .sort({ updatedAt: -1, createdAt: -1 })
            .populate('planId')
            .populate('ownerId');

        if (!invoices || invoices.length === 0) {
            return res.status(404).json({ 
                message: `No invoices found for this ${queryField === 'tenantId' ? 'tenant' : 'owner'}.` 
            });
        }

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

module.exports = { getInvoice };