const EnterpriseContact = require("../models/upinterviewEnterpriseContact");

// POST: Save enterprise contact form
const createEnterpriseContact = async (req, res) => {
  console.log("📩 [POST /] upinterviewEnterpriseContact form submission received");

  try {
    // Step 1: Extract data from body
    const { firstName, lastName, workEmail, jobTitle, companyName, companySize, additionalDetails } = req.body;
    console.log("🧾 upinterviewEnterpriseContact Request Body:", req.body);

    // Step 2: Validate required fields
    if (!lastName || !workEmail || !jobTitle || !companyName || !companySize) {
      console.warn("⚠️ upinterviewEnterpriseContact Missing required fields:", { 
        firstName, lastName, workEmail, jobTitle, companyName, companySize 
      });
      return res.status(400).json({ 
        error: "All required fields must be filled",
        missingFields: {
          lastName: !lastName,
          workEmail: !workEmail,
          jobTitle: !jobTitle,
          companyName: !companyName,
          companySize: !companySize
        }
      });
    }

    // Step 3: Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(workEmail)) {
      console.warn("⚠️ upinterviewEnterpriseContact Invalid email format:", workEmail);
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Step 4: Prepare new enterprise contact document
    const newEnterpriseContact = new EnterpriseContact({ 
      firstName, 
      lastName, 
      workEmail, 
      jobTitle, 
      companyName, 
      companySize, 
      additionalDetails: additionalDetails || "" 
    });
    console.log("🛠️ upinterviewEnterpriseContact Prepared new enterprise contact document:", newEnterpriseContact);

    // Step 5: Save to database
    await newEnterpriseContact.save();
    console.log("✅ upinterviewEnterpriseContact Contact saved successfully in database with ID:", newEnterpriseContact._id);

    // Step 6: Send success response
    res.status(201).json({ 
      message: "Enterprise contact saved successfully",
      success: true,
      contactId: newEnterpriseContact._id
    });
    console.log("📤 upinterviewEnterpriseContact Response sent: 201 Enterprise contact saved successfully");
  } catch (err) {
    // Step 7: Error handling
    console.error("❌ upinterviewEnterpriseContact Error saving contact:", err.message);
    console.error("🧩 upinterviewEnterpriseContact Stack Trace:", err.stack);

    res.status(500).json({ 
      error: "Internal server error",
      success: false
    });
  } finally {
    console.log("🔚 upinterviewEnterpriseContact [POST /] Enterprise contact form process completed.\n");
  }
};

// GET: Fetch all enterprise contact form submissions
const getAllEnterpriseContacts = async (req, res) => {
  console.log("📋 [GET /] Fetching all enterprise contact submissions");

  try {
    // Fetch all enterprise contacts, sorted by newest first
    const contacts = await EnterpriseContact.find().sort({ createdAt: -1 });
    console.log(`✅ Found ${contacts.length} enterprise contact submissions`);

    // Transform data for frontend
    const formattedContacts = contacts.map(contact => ({
      _id: contact._id,
      firstName: contact.firstName,
      lastName: contact.lastName,
      workEmail: contact.workEmail,
      jobTitle: contact.jobTitle,
      companyName: contact.companyName,
      companySize: contact.companySize,
      additionalDetails: contact.additionalDetails,
      createdAt: contact.createdAt
    }));

    res.status(200).json({
      success: true,
      contacts: formattedContacts,
      total: contacts.length
    });
    console.log("📤 Response sent: Enterprise contact data retrieved successfully");
  } catch (err) {
    console.error("❌ Error fetching enterprise contacts:", err.message);
    console.error("🧩 Stack Trace:", err.stack);

    res.status(500).json({
      success: false,
      error: "Failed to fetch enterprise contact submissions"
    });
  } finally {
    console.log("🔚 [GET /] Fetch enterprise contacts process completed.\n");
  }
};

module.exports = {
  createEnterpriseContact,
  getAllEnterpriseContacts
};
