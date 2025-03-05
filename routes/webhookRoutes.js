const express = require('express');
const Webhook = require('../models/Webhook'); // Webhook model for storage
const router = express.Router();

// Webhook registration endpoint
router.post('/webhooks/register', async (req, res) => {
    const { callbackUrl, events, secret } = req.body;
    console.log('Received webhook data:', req.body);

    if (!callbackUrl || !events || !Array.isArray(events) || events.length === 0) {
        return res.status(400).json({
            status: 'error',
            message: 'Callback URL and at least one event are required.'
        });
    }

    try {
        const webhook = new Webhook({ 
            callbackUrl, 
            events,
            ...(secret && { secret })
        });
        await webhook.save();

        res.status(201).json({
            status: 'success',
            message: 'Webhook registered successfully.',
            webhookId: webhook._id
        });
    } catch (error) {
        console.error('Error registering webhook:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error. Please try again later.'
        });
    }
});

// Fetch all webhooks
router.get('/webhooks', async (req, res) => {
    try {
        const webhooks = await Webhook.find();
        res.status(200).json(webhooks);
    } catch (error) {
        console.error('Error fetching webhooks:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error. Please try again later.'
        });
    }
});

// Fetch a unique webhook by ID
router.get('/webhooks/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const webhook = await Webhook.findById(id);
        if (webhook) {
            res.status(200).json(webhook);
        } else {
            res.status(404).json({
                status: 'error',
                message: 'Webhook not found.'
            });
        }
    } catch (error) {
        console.error('Error fetching webhook:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error. Please try again later.'
        });
    }
});

// Delete a webhook by ID
router.delete('/webhooks/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await Webhook.findByIdAndDelete(id);
        if (result) {
            res.status(200).json({
                status: 'success',
                message: 'Webhook deleted successfully.'
            });
        } else {
            res.status(404).json({
                status: 'error',
                message: 'Webhook not found.'
            });
        }
    } catch (error) {
        console.error('Error deleting webhook:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error. Please try again later.'
        });
    }
});

module.exports = router;
