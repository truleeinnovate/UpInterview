
const  Receipt = require("../models/Receiptmodels");

// Create a new receipt
const createReceiptControllers = async (req, res) => {
    try {
        const {
            tenantId,
            ownerId,
            paymentId,
            amount,
            method,
            status
        } = req.body;

        // Validation for required fields
        if (!tenantId || !paymentId || !amount || !method) {
            return res.status(400).json({ error: "Missing required fields: tenantId, paymentId, amount, and method are required." });
        }

        // Validate amount
        if (amount <= 0) {
            return res.status(400).json({ error: "Amount must be greater than zero." });
        }

        // Validate method
        const validMethods = ['credit_card', 'bank_transfer', 'wallet', 'other'];
        if (!validMethods.includes(method)) {
            return res.status(400).json({ error: `Invalid payment method. Accepted methods are: ${validMethods.join(', ')}` });
        }

        // Create and save the receipt
        const newReceipt = new Receipt({
            tenantId,
            ownerId,
            paymentId,
            amount,
            method,
            status: status || 'pending',
            issuedAt: new Date()
        });

        await newReceipt.save();

        res.status(201).json({
            message: "Receipt created successfully.",
            receipt: newReceipt
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error." });
    }
};


// get all data
const generateReceiptControllers = async(req,res) => {

    try {
        const ReciptData = await Receipt.find();

    if (ReciptData.length === 0) {
        return res.status(400).json({ error: "Not Data found." });
    }
    res.status(200).json(ReciptData);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal server error." });
    }

    
}

// generateReceiptControllers
module.exports = {createReceiptControllers,generateReceiptControllers}