const express = require("express");
const router = express.Router();
const Contact = require("../models/upinterviewContactUsPage");

// POST: Save contact form
router.post("/", async (req, res) => {
  console.log("📩 [POST /] upinterviewContactUsPage form submission received");

  try {
    // Step 1: Extract data from body
    const { name, email, message } = req.body;
    console.log("🧾 upinterviewContactUsPage Request Body:", req.body);

    // Step 2: Validate required fields
    if (!name || !email || !message) {
      console.warn("⚠️ upinterviewContactUsPage Missing required fields:", { name, email, message });
      return res.status(400).json({ error: "All fields are required" });
    }

    // Step 3: Prepare new contact document
    const newContact = new Contact({ name, email, message });
    console.log("🛠️ upinterviewContactUsPage Prepared new contact document:", newContact);

    // Step 4: Save to database
    await newContact.save();
    console.log("✅ upinterviewContactUsPage Contact saved successfully in database with ID:", newContact._id);

    // Step 5: Send success response
    res.status(201).json({ message: "Contact saved successfully" });
    console.log("📤 upinterviewContactUsPage Response sent: 201 Contact saved successfully");
  } catch (err) {
    // Step 6: Error handling
    console.error("❌ upinterviewContactUsPage Error saving contact:", err.message);
    console.error("🧩 upinterviewContactUsPage Stack Trace:", err.stack);

    res.status(500).json({ error: "Internal server error" });
  } finally {
    console.log("🔚 upinterviewContactUsPage [POST /] Contact form process completed.\n");
  }
});

module.exports = router;
