const EnterpriseContact = require("../models/upinterviewEnterpriseContact");

// POST: Save enterprise contact form
const createEnterpriseContact = async (req, res) => {
  try {
    // Step 1: Extract data from body
    const {
      firstName,
      lastName,
      workEmail,
      jobTitle,
      companyName,
      companySize,
      additionalDetails,
    } = req.body;

    // Step 2: Validate required fields
    if (!lastName || !workEmail || !jobTitle || !companyName || !companySize) {
      console.warn("⚠️ upinterviewEnterpriseContact Missing required fields:", {
        firstName,
        lastName,
        workEmail,
        jobTitle,
        companyName,
        companySize,
      });
      return res.status(400).json({
        error: "All required fields must be filled",
        missingFields: {
          lastName: !lastName,
          workEmail: !workEmail,
          jobTitle: !jobTitle,
          companyName: !companyName,
          companySize: !companySize,
        },
      });
    }

    // Step 3: Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(workEmail)) {
      console.warn(
        "⚠️ upinterviewEnterpriseContact Invalid email format:",
        workEmail
      );
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
      additionalDetails: additionalDetails || "",
    });

    // Step 5: Save to database
    await newEnterpriseContact.save();

    // Step 6: Send success response
    res.status(201).json({
      message: "Enterprise contact saved successfully",
      success: true,
      contactId: newEnterpriseContact._id,
    });
  } catch (err) {
    // Step 7: Error handling
    console.error(
      "❌ upinterviewEnterpriseContact Error saving contact:",
      err.message
    );
    console.error("🧩 upinterviewEnterpriseContact Stack Trace:", err.stack);

    res.status(500).json({
      error: "Internal server error",
      success: false,
    });
  } finally {
  }
};

// GET: Fetch all enterprise contact form submissions (with optional pagination/search/filters)
const getAllEnterpriseContacts = async (req, res) => {
  try {
    const hasParams =
      "page" in req.query ||
      "limit" in req.query ||
      "search" in req.query ||
      "companyName" in req.query ||
      "contactPerson" in req.query ||
      "email" in req.query ||
      "status" in req.query ||
      "dateRange.start" in req.query ||
      "dateRange.end" in req.query;

    // Legacy behavior: return full list when no pagination/search/filter params
    if (!hasParams) {
      const contacts = await EnterpriseContact.find().sort({ _id: -1 });
      const formattedContacts = contacts.map((contact) => ({
        _id: contact._id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        workEmail: contact.workEmail,
        jobTitle: contact.jobTitle,
        companyName: contact.companyName,
        companySize: contact.companySize,
        additionalDetails: contact.additionalDetails,
        createdAt: contact.createdAt,
      }));

      return res.status(200).json({
        success: true,
        contacts: formattedContacts,
        total: contacts.length,
      });
    }

    // Parsed params (page is 1-based from UI)
    const pageRaw = parseInt(req.query.page, 10);
    const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
    const limitRaw = parseInt(req.query.limit, 10);
    const limit =
      Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 100) : 10;
    const search = (req.query.search || "").trim();
    const companyName = (req.query.companyName || "").trim();
    const contactPerson = (req.query.contactPerson || "").trim();
    const email = (req.query.email || "").trim();
    const status = (req.query.status || "").trim();
    const start = req.query["dateRange.start"]
      ? new Date(req.query["dateRange.start"])
      : null;
    const end = req.query["dateRange.end"]
      ? new Date(req.query["dateRange.end"] + "T23:59:59.999Z")
      : null;

    // Build aggregation pipeline
    const pipeline = [];

    // Compute helper fields
    pipeline.push({
      $addFields: {
        contactPersonComputed: {
          $trim: {
            input: {
              $concat: [
                { $ifNull: ["$firstName", ""] },
                " ",
                { $ifNull: ["$lastName", ""] },
              ],
            },
          },
        },
        statusComputed: { $ifNull: ["$status", "new"] },
      },
    });

    const match = {};
    // Exact or regex filters
    if (companyName)
      match.companyName = { $regex: new RegExp(companyName, "i") };
    if (email) match.workEmail = { $regex: new RegExp(email, "i") };
    if (status)
      match.statusComputed = { $regex: new RegExp(`^${status}$`, "i") };
    if (start || end) {
      match.createdAt = {};
      if (start) match.createdAt.$gte = start;
      if (end) match.createdAt.$lte = end;
    }
    if (Object.keys(match).length) pipeline.push({ $match: match });

    if (contactPerson) {
      pipeline.push({
        $match: {
          contactPersonComputed: { $regex: new RegExp(contactPerson, "i") },
        },
      });
    }

    if (search) {
      const regex = new RegExp(search, "i");
      pipeline.push({
        $match: {
          $or: [
            { companyName: { $regex: regex } },
            { firstName: { $regex: regex } },
            { lastName: { $regex: regex } },
            { workEmail: { $regex: regex } },
            { jobTitle: { $regex: regex } },
            { companySize: { $regex: regex } },
            { contactPersonComputed: { $regex: regex } },
          ],
        },
      });
    }

    // Sort newest first
    pipeline.push({ $sort: { _id: -1 } });

    // Facet for pagination
    pipeline.push({
      $facet: {
        data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
        totalCount: [{ $count: "count" }],
      },
    });

    const result = await EnterpriseContact.aggregate(pipeline);
    const facet = result?.[0] || { data: [], totalCount: [] };
    const data = facet.data || [];
    const totalItems = facet.totalCount?.[0]?.count || 0;

    return res.status(200).json({
      success: true,
      contacts: data,
      total: totalItems,
    });
  } catch (err) {
    console.error("❌ Error fetching enterprise contacts:", err.message);
    console.error("🧩 Stack Trace:", err.stack);

    res.status(500).json({
      success: false,
      error: "Failed to fetch enterprise contact submissions",
    });
  } finally {
  }
};

module.exports = {
  createEnterpriseContact,
  getAllEnterpriseContacts,
};
