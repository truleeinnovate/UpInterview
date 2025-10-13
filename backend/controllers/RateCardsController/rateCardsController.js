// v1.0.0 - Ashok - changed createRateCard to support bulk creation

const RateCard = require("../../models/RateCards/RateCards");

// Create new RateCard
// v1.0.0 <------------------------------------------------------------------------
// const createRateCard = async (req, res) => {
//   try {
//     const {
//       category,
//       technology,
//       levels,
//       defaultCurrency,
//       isActive,
//     } = req.body;

//     // Create new rate card document
//     const newCard = new RateCard({
//       category,
//       technology,
//       levels,
//       defaultCurrency,
//       isActive,
//     });

//     const savedCard = await newCard.save();

//     res.status(201).json({
//       message: "Rate card created successfully",
//       rateCard: savedCard,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Error creating rate card",
//       error: error.message,
//     });
//   }
// };

const createRateCard = async (req, res) => {
    try {
        if (Array.isArray(req.body.rateCards)) {
            // Bulk insert
            const savedCards = await RateCard.insertMany(req.body.rateCards);
            return res.status(201).json({
                message: `${savedCards.length} rate cards created successfully`,
                rateCards: savedCards,
            });
        } else {
            // Single insert
            const {
                category,
                technology,
                levels,
                defaultCurrency,
                isActive,
                discountMockInterview,
            } = req.body;

            const newCard = new RateCard({
                category,
                technology,
                levels,
                discountMockInterview,
                defaultCurrency,
                isActive,
            });

            const savedCard = await newCard.save();

            return res.status(201).json({
                message: "Rate card created successfully",
                rateCard: savedCard,
            });
        }
    } catch (error) {
        console.error("Error creating rate card:", error);
        res.status(500).json({
            message: "Error creating rate card",
            error: error.message,
        });
    }
};
// v1.0.0 <------------------------------------------------------------------------

// Fetch all RateCards
const getAllRateCards = async (req, res) => {
    try {
        const cards = await RateCard.find();
        res.status(200).json(cards);
    } catch (error) {
        res
            .status(500)
            .json({ message: "Error fetching rate cards", error: error.message });
    }
};

const getRateCardsByTechnology = async (req, res) => {
    console.log("🔥 req.params =", req.params);
    console.log("🔥 req.query =", req.query);
    try {
        const { technology } = req.params;
        if (!technology) {
            return res
                .status(400)
                .json({ message: "Technology parameter is required" });
        }

        const cards = await RateCard.find({
            technology: { $regex: new RegExp(technology, "i") }, // case-insensitive match
            isActive: true,
        });

        if (!cards || cards.length === 0) {
            return res.status(404).json({
                message: `No rate cards found for technology: ${technology}`,
            });
        }

        res.status(200).json(cards);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching rate cards by technology",
            error: error.message,
        });
    }
};

// Fetch one RateCard by ID
const getRateCardById = async (req, res) => {
    try {
        const { id } = req.params;
        const card = await RateCard.findById(id);

        if (!card) return res.status(404).json({ message: "Rate card not found" });
        res.status(200).json(card);
    } catch (error) {
        res
            .status(500)
            .json({ message: "Error fetching rate card", error: error.message });
    }
};

// Update RateCard by ID
const updateRateCard = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedCard = await RateCard.findByIdAndUpdate(id, req.body, {
            new: true,
            runValidators: true,
        });

        if (!updatedCard)
            return res.status(404).json({ message: "Rate card not found" });

        res
            .status(200)
            .json({ message: "Rate card updated successfully", updatedCard });
    } catch (error) {
        res
            .status(500)
            .json({ message: "Error updating rate card", error: error.message });
    }
};

// Delete RateCard by ID
const deleteRateCard = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCard = await RateCard.findByIdAndDelete(id);

        if (!deletedCard)
            return res.status(404).json({ message: "Rate card not found" });

        res.status(200).json({ message: "Rate card deleted successfully" });
    } catch (error) {
        res
            .status(500)
            .json({ message: "Error deleting rate card", error: error.message });
    }
};

module.exports = {
    createRateCard,
    getAllRateCards,
    getRateCardById,
    updateRateCard,
    deleteRateCard,
    getRateCardsByTechnology,
};
