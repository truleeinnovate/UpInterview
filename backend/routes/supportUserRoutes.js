const express = require("express");
const {
  createTicket,
  getTicket,
  getTicketBasedonId,
  updateTicketById,
  updateSupportTicket,
  getAllTickets, // SUPER ADMIN added by Ashok
  getTicketSummary, // SUPER ADMIN added by Ashok
} = require("../controllers/supportUserController");

const router = express.Router();

router.post("/create-ticket", createTicket);
router.get("/get-tickets", getTicket);
router.get("/get-ticket/:id", getTicketBasedonId);
router.patch("/update-ticket/:id", updateTicketById);
// Update the route to use the correct path
router.patch("/update-ticket/:id/status", updateSupportTicket);

// <---------- SUPER ADMIN added by Ashok ---------------------
router.get("/all-tickets", getAllTickets);
router.get("/support-tickets", getTicketSummary);
// -------------------------------------------->

module.exports = router;
