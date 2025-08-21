const express = require("express");
const router = express.Router();

const {
  createRateCard,
  getAllRateCards,
  getRateCardById,
  updateRateCard,
  deleteRateCard,
} = require("../../controllers/RateCardsController/rateCardsController");

// Create
router.post("/", createRateCard);

// Get all
router.get("/", getAllRateCards);

// Get by ID (should come before delete/update if you had conflicts)
router.get("/:id", getRateCardById);

// Update
router.put("/:id", updateRateCard);

// Delete
router.delete("/:id", deleteRateCard);

module.exports = router;
