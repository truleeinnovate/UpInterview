const Contact = require("../models/upinterviewContactUsPage");

// POST: Save contact form
const createContactUsSubmission = async (req, res) => {
  try {
    // Step 1: Extract data from body
    const { name, email, message } = req.body;

    // Step 2: Validate required fields
    if (!name || !email || !message) {
      console.warn("⚠️ upinterviewContactUsPage Missing required fields:", {
        name,
        email,
        message,
      });
      return res.status(400).json({ error: "All fields are required" });
    }

    // Step 3: Prepare new contact document
    const newContact = new Contact({ name, email, message });

    // Step 4: Save to database
    await newContact.save();

    // Step 5: Send success response
    res.status(201).json({ message: "Contact saved successfully" });
  } catch (err) {
    // Step 6: Error handling
    console.error(
      "❌ upinterviewContactUsPage Error saving contact:",
      err.message
    );
    console.error("🧩 upinterviewContactUsPage Stack Trace:", err.stack);

    res.status(500).json({ error: "Internal server error" });
  } finally {
  }
};

// GET: Fetch all contact form submissions
const getAllContactUsSubmissions = async (req, res) => {
  try {
    const { page, limit, search, startDate, endDate } = req.query;
    const hasParams = Boolean(page || limit || search || startDate || endDate);

    // Legacy behavior: return full list when no params provided
    if (!hasParams) {
      const contacts = await Contact.find().sort({ _id: -1 });

      const formattedContacts = contacts.map((contact) => ({
        _id: contact._id,
        name: contact.name,
        email: contact.email,
        message: contact.message,
        createdAt: contact.createdAt,
      }));

      return res.status(200).json({
        success: true,
        contacts: formattedContacts,
        total: contacts.length,
      });
    }

    // Server-side pagination + filters
    const currentPage = Math.max(parseInt(page) || 1, 1);
    const perPage = Math.max(parseInt(limit) || 10, 1);
    const skip = (currentPage - 1) * perPage;

    const match = {};

    if (search && String(search).trim()) {
      const s = String(search).trim();
      match.$or = [
        { name: { $regex: s, $options: "i" } },
        { email: { $regex: s, $options: "i" } },
        { message: { $regex: s, $options: "i" } },
      ];
    }

    if (startDate || endDate) {
      const range = {};
      if (startDate) range.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        range.$lte = end;
      }
      match.createdAt = range;
    }

    const pipeline = [
      { $match: match },
      { $sort: { _id: -1 } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: perPage }],
          meta: [{ $count: "total" }],
        },
      },
    ];

    const result = await Contact.aggregate(pipeline);
    const data = result?.[0]?.data || [];
    const total = result?.[0]?.meta?.[0]?.total || 0;

    const formattedContacts = data.map((contact) => ({
      _id: contact._id,
      name: contact.name,
      email: contact.email,
      message: contact.message,
      createdAt: contact.createdAt,
    }));

    res.status(200).json({
      success: true,
      contacts: formattedContacts,
      total,
      page: currentPage,
      itemsPerPage: perPage,
    });
  } catch (err) {
    console.error("❌ Error fetching contacts:", err.message);
    console.error("🧩 Stack Trace:", err.stack);

    res.status(500).json({
      success: false,
      error: "Failed to fetch contact submissions",
    });
  } finally {
  }
};

module.exports = {
  createContactUsSubmission,
  getAllContactUsSubmissions,
};
