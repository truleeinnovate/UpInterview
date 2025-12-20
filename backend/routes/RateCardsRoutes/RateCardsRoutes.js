const express = require("express");
const router = express.Router();

const loggingService = require("../../middleware/loggingService");

const {
    createRateCard,
    getAllRateCards,
    getRateCardById,
    updateRateCard,
    deleteRateCard,
    getRateCardsByTechnology,
} = require("../../controllers/RateCardsController/rateCardsController");

// Create
router.post("/", loggingService.internalLoggingMiddleware, createRateCard);

// Get all
router.get("/", getAllRateCards);

// Get by technology
router.get("/technology/:technology", getRateCardsByTechnology);

// Get by ID (should come before delete/update if you had conflicts)
router.get("/:id", getRateCardById);

// Update
router.put("/:id", loggingService.internalLoggingMiddleware, updateRateCard);

// Delete
router.delete("/:id", deleteRateCard);

module.exports = router;
