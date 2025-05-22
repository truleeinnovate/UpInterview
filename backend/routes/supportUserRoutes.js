
const express = require('express');
const { createTicket, getTicket, getTicketBasedonId, updateTicketById, updateSupportTicket} = require('../controllers/supportUserController');

const router = express.Router();

router.post('/create-ticket', createTicket);
router.get('/get-tickets', getTicket);
router.get('/get-ticket/:id', getTicketBasedonId);
router.patch('/update-ticket/:id', updateTicketById);
// Update the route to use the correct path
router.patch('/update-ticket/:id/status', updateSupportTicket);

module.exports = router;