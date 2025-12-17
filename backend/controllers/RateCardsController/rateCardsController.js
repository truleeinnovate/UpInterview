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
  // Mark that logging will be handled by this controller
  // res.locals.loggedByController = true;
  // res.locals.processName = "Create Rate Card";

  try {
    if (Array.isArray(req.body.rateCards)) {
      // Bulk insert
      const savedCards = await RateCard.insertMany(req.body.rateCards);
      
      // Structured internal log for successful bulk create
      // res.locals.logData = {
      //   tenantId: req.body?.tenantId || "",
      //   ownerId: req.body?.ownerId || "",
      //   processName: "Create Rate Card",
      //   requestBody: req.body,
      //   status: "success",
      //   message: `${savedCards.length} rate cards created successfully`,
      //   responseBody: savedCards,
      // };

      return res.status(201).json({
        message: `${savedCards.length} rate cards created successfully`,
        rateCards: savedCards,
      });
    } else {
      // Single insert
      const {
        category,
        // technology,
        roleName,
        levels,
        defaultCurrency,
        isActive,
        discountMockInterview,
      } = req.body;

      const newCard = new RateCard({
        category,
        // technology,
        roleName,
        levels,
        discountMockInterview,
        defaultCurrency,
        isActive,
      });

      const savedCard = await newCard.save();

      // Structured internal log for successful single create
      // res.locals.logData = {
      //   tenantId: req.body?.tenantId || "",
      //   ownerId: req.body?.ownerId || "",
      //   processName: "Create Rate Card",
      //   requestBody: req.body,
      //   status: "success",
      //   message: "Rate card created successfully",
      //   responseBody: savedCard,
      // };

      return res.status(201).json({
        message: "Rate card created successfully",
        rateCard: savedCard,
      });
    }
  } catch (error) {
    console.error("Error creating rate card:", error);
    // Structured internal log for error case
    // res.locals.logData = {
    //   tenantId: req.body?.tenantId || "",
    //   ownerId: req.body?.ownerId || "",
    //   processName: "Create Rate Card",
    //   requestBody: req.body,
    //   status: "error",
    //   message: error.message,
    // };

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
  try {
    const { technology: slug } = req.params;
    if (!slug) {
      return res.status(400).json({ message: "Name parameter is required" });
    }

    // Exact match on the slug only (case-insensitive via collation, no other conditions)
    const cards = await RateCard.find({
      name: slug, // Sole filter: match the name/slug directly
    }).collation({ locale: "en", strength: 2 });

    if (!cards || cards.length === 0) {
      return res.status(404).json({
        message: `No rate cards found for name: ${slug}`,
      });
    }

    res.status(200).json(cards);
  } catch (error) {
    console.error("Error fetching rate cards by name:", error);
    res.status(500).json({
      message: "Error fetching rate cards by name",
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
  // Mark that logging will be handled by this controller
  // res.locals.loggedByController = true;
  // res.locals.processName = "Update Rate Card";

  try {
    const { id } = req.params;
    const updatedCard = await RateCard.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedCard)
      return res.status(404).json({ message: "Rate card not found" });

    // Structured internal log for successful update
    // res.locals.logData = {
    //   tenantId: req.body?.tenantId || "",
    //   ownerId: req.body?.ownerId || "",
    //   processName: "Update Rate Card",
    //   requestBody: req.body,
    //   status: "success",
    //   message: "Rate card updated successfully",
    //   responseBody: updatedCard,
    // };

    res
      .status(200)
      .json({ message: "Rate card updated successfully", updatedCard });
  } catch (error) {
    // Structured internal log for error case
    // res.locals.logData = {
    //   tenantId: req.body?.tenantId || "",
    //   ownerId: req.body?.ownerId || "",
    //   processName: "Update Rate Card",
    //   requestBody: req.body,
    //   status: "error",
    //   message: error.message,
    // };

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
