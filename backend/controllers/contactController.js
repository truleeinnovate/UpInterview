const { Contacts } = require("../models/Contacts");
const InterviewAvailability = require("../models/InterviewAvailability");
const { Users } = require("../models/Users");
const mongoose = require("mongoose");
const {
  contactValidationSchema,
  contactPatchSchema,
} = require("../validations/contactValidations");

// Update contact status
const updateContactStatus = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Update Contact Status";

  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      return res
        .status(400)
        .json({ message: "Contact ID and status are required" });
    }

    // Validate status value
    const validStatuses = [
      "new",
      "underReview",
      "approved",
      "rejected",
      "suspended",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const updatedContact = await Contacts.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedContact) {
      return res.status(404).json({ message: "Contact not found" });
    }

    res.locals.logData = {
      tenantId: updatedContact.tenantId?.toString() || "",
      ownerId: updatedContact.ownerId?.toString() || "",
      processName: "Update Contact Status",
      requestBody: req.body,
      status: "success",
      message: "Contact status updated successfully",
      responseBody: updatedContact,
    };

    res.status(200).json({
      success: true,
      message: "Contact status updated successfully",
      data: updatedContact,
    });
  } catch (error) {
    console.error("Error updating contact status:", error);
    res.locals.logData = {
      tenantId: req.body?.tenantId || "",
      ownerId: req.body?.ownerId || "",
      processName: "Update Contact Status",
      requestBody: req.body,
      status: "error",
      message: error.message,
    };

    res.status(500).json({
      success: false,
      message: "Error updating contact status",
      error: error.message,
    });
  }
};

// Mansoor: for fetching the total contacts to the login pages (Individual-4)
const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contacts.find();
    return res.status(200).json(contacts);
  } catch (error) {
    // console.error("Error fetching all contacts:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

// const fetchContacts = async (req, res) => {
//   const contactId = req.params.id;

//   try {
//     const contact = await Contacts.findById(contactId)
//       .populate("availability")
//       .populate({
//         path: "ownerId",
//         select: "firstName lastName email roleId isFreelancer",
//         model: "Users",
//         populate: {
//           path: "roleId",
//           model: "Role",
//           select: "roleName",
//         },
//       })
//       .lean();

//     if (!contact) {
//       return res.status(404).json({ message: "Contact not found" });
//     }

//     // Optional: transform roleName
//     if (contact.ownerId && contact.ownerId.roleId) {
//       contact.owner = {
//         ...contact.ownerId,
//         roleName: contact.ownerId.roleId.roleName,
//       };
//       delete contact.ownerId;
//     }

//     res.status(200).json(contact);
//   } catch (error) {
//     console.error("Error fetching contact:", error);
//     res
//       .status(500)
//       .json({ message: "Error fetching contact", error: error.message });
//   }
// };

const createContact = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Create Contact";

  try {
    const contact = new Contacts(req.body);
    const savedContact = await contact.save();

    res.locals.logData = {
      tenantId: savedContact.tenantId?.toString() || req.body?.tenantId || "",
      ownerId: savedContact.ownerId?.toString() || req.body?.ownerId || "",
      processName: "Create Contact",
      requestBody: req.body,
      status: "success",
      message: "Contact created successfully",
      responseBody: savedContact,
    };

    res.status(201).json(savedContact);
  } catch (error) {
    console.error("Error saving contact:", error);
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Validation Error", details: error.errors });
    }

    res.locals.logData = {
      tenantId: req.body?.tenantId || "",
      ownerId: req.body?.ownerId || "",
      processName: "Create Contact",
      requestBody: req.body,
      status: "error",
      message: error.message,
    };

    res.status(500).json({ message: "Internal Server Error", error });
  }
};

const updateContact = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Update Contact";

  try {
    const { id } = req.params;
    const updatedContact = await Contacts.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    res.locals.logData = {
      tenantId: updatedContact?.tenantId?.toString() || req.body?.tenantId || "",
      ownerId: updatedContact?.ownerId?.toString() || req.body?.ownerId || "",
      processName: "Update Contact",
      requestBody: req.body,
      status: "success",
      message: "Contact updated successfully",
      responseBody: updatedContact,
    };

    res.status(200).json(updatedContact);
  } catch (error) {
    console.error("Error updating contact:", error);

    res.locals.logData = {
      tenantId: req.body?.tenantId || "",
      ownerId: req.body?.ownerId || "",
      processName: "Update Contact",
      requestBody: req.body,
      status: "error",
      message: error.message,
    };

    res
      .status(500)
      .json({ message: "Error updating contact", error: error.message });
  }
};

const getContactsByOwnerId = async (req, res) => {
  try {
    const { ownerId } = req.params;

    if (!ownerId) {
      return res.status(400).json({ message: "Owner ID is required" });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(400).json({ message: "Invalid Owner ID format" });
    }

    const contacts = await Contacts.find({ ownerId })
      .populate("availability")
      .populate({
        path: "ownerId",
        select: "firstName lastName email roleId isFreelancer",
        model: "Users", // Explicitly specify model
        populate: {
          path: "roleId",
          model: "Role", // Explicitly specify model
          select: "roleName",
        },
      });

    res.status(200).json(contacts);
  } catch (error) {
    console.error("Error fetching contacts by ownerId:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// // PATCH endpoint to update contact details
// // router.patch('/contacts/:id',

// const updateContactsDetails =   async (req, res) => {
//     try {
//         const contactId = req.params.id;
//         const updateData = req.body;

//         // Separate availability data if present
//         const { availability, ...contactData } = updateData;

//         if (contactData.timeZone && typeof contactData.timeZone === 'object' && contactData.preferredDuration) {
//             contactData.timeZone = contactData.timeZone || ""; // Store only the 'value' (e.g., 'America/Boise')
//               contactData.preferredDuration = contactData.preferredDuration || ""
//         }

//         // Start a transaction to ensure atomic updates
//         const session = await Contacts.startSession();
//         session.startTransaction();

//         try {
//             // Update contact basic details
//             const updatedContact = await Contacts.findByIdAndUpdate(
//                 contactId,
//                 {
//                     $set: contactData
//                 },
//                 {
//                     new: true,
//                     runValidators: true
//                 }
//             );

//             if (!updatedContact) {
//                 await session.abortTransaction();
//                 return res.status(404).json({ message: 'Contact not found' });
//             }

//              // Handle availability updates if provided
//              if (availability && Array.isArray(availability)) {
//                 // First remove existing availability records for this contact
//                 await Interviewavailability.deleteMany({ contact: contactId }, { session });

//                 // Create new availability records with valid data
//                 const availabilityDocs = availability.map(avail => ({
//                     contact: contactId,
//                     days: avail.days
//                         .filter(day => day && day.day && Array.isArray(day.timeSlots) && day.timeSlots.length > 0)
//                         .map(day => ({
//                             day: day.day,
//                             timeSlots: day.timeSlots
//                                 .filter(slot => slot && slot.startTime && slot.endTime)
//                                 .map(slot => ({
//                                     startTime: slot.startTime,
//                                     endTime: slot.endTime
//                                 }))
//                         }))
//                 }));

//                 // Only insert if there are valid records
//                 if (availabilityDocs.length > 0 && availabilityDocs[0].days.length > 0) {
//                     const insertedAvailability = await Interviewavailability.insertMany(
//                         availabilityDocs,
//                         { session }
//                     );

//                     // Update the contact document with availability references
//                     const availabilityIds = insertedAvailability.map(doc => doc._id);
//                     updatedContact.availability = availabilityIds;
//                     await updatedContact.save({ session });
//                 }
//             }

//             // Fetch the updated contact with populated availability
//             const finalContact = await Contacts.findById(contactId)
//                 .populate('availability')
//                 .lean();

//             await session.commitTransaction();

//             res.status(200).json({
//                 message: 'Contact updated successfully',
//                 data: finalContact
//             });

//         } catch (error) {
//             await session.abortTransaction();
//             throw error;
//         } finally {
//             session.endSession();
//         }

//     } catch (error) {
//         console.error('Error updating contact:', error);
//         res.status(500).json({
//             message: 'Error updating contact',
//             error: error.message
//         });
//     }
// };

// PATCH endpoint to update contact details

// updating single user based on owner ID user for my-profile and user tab by - Ranjith

// const updateContactsDetails = async (req, res) => {
//     try {
//         const contactId = req.params.id;
//         const updateData = req.body;
//         // Separate availability data if present
//         const { availability, ...contactData } = updateData;

//         if (
//             contactData.timeZone &&
//             typeof contactData.timeZone === "object" &&
//             contactData.preferredDuration &&
//             contactData.contactId
//         ) {
//             contactData.timeZone = contactData.timeZone || ""; // Store only the 'value' (e.g., 'America/Boise')
//             (contactData.preferredDuration = contactData.preferredDuration || ""),
//                 (contactData.contactId = contactData.contactId);
//         }

//         // Start a transaction to ensure atomic updates
//         const session = await Contacts.startSession();
//         session.startTransaction();

//         try {
//             // Update contact basic details
//             // const updatedContact = await Contacts.findByIdAndUpdate(
//             const updatedContact = await Contacts.findOneAndUpdate(
//                 { ownerId: contactId },
//                 {
//                     $set: contactData,
//                 },
//                 {
//                     new: true,
//                     runValidators: true,
//                     session,
//                 }
//             );

//             if (!updatedContact) {
//                 await session.abortTransaction();
//                 return res.status(404).json({ message: "Contact not found" });
//             }
//             // 2. Update user schema if relevant fields are in request
//             const userUpdateFields = {};
//             if (contactData.firstName)
//                 userUpdateFields.firstName = contactData.firstName;
//             if (contactData.lastName)
//                 userUpdateFields.lastName = contactData.lastName;
//             if (contactData.profileId)
//                 userUpdateFields.profileId = contactData.profileId;
//             if (contactData.newEmail)
//                 userUpdateFields.newEmail = contactData.newEmail;
//             if (contactData.roleId) userUpdateFields.roleId = contactData.roleId;
//             // if (contactData.email) userUpdateFields.email = contactData.email;

//             // Only update if there's something to update
//             if (Object.keys(userUpdateFields).length > 0 && updatedContact.ownerId) {
//                 await Users.findByIdAndUpdate(
//                     updatedContact.ownerId,
//                     { $set: userUpdateFields },
//                     { session }
//                 );
//             }

//             const avail = availability;

//             // Handle availability updates if provided
//             if (avail && Array.isArray(avail)) {
//                 // First remove existing availability records for this contact
//                 await InterviewAvailability.deleteMany(
//                     { contact: contactData?.contactId },
//                     { session }
//                 );

//                 const availabilityDocs = [];

//                 avail.forEach((item) => {
//                     if (Array.isArray(item.days)) {
//                         item.days.forEach((dayItem) => {
//                             if (
//                                 dayItem &&
//                                 dayItem.day &&
//                                 Array.isArray(dayItem.timeSlots) &&
//                                 dayItem.timeSlots.length > 0
//                             ) {
//                                 const timeSlots = dayItem.timeSlots
//                                     .filter((slot) => slot && slot.startTime && slot.endTime)
//                                     .map((slot) => ({
//                                         startTime: slot.startTime,
//                                         endTime: slot.endTime,
//                                     }));

//                                 if (timeSlots.length > 0) {
//                                     availabilityDocs.push({
//                                         contact: contactData?.contactId,
//                                         day: dayItem.day,
//                                         timeSlots,
//                                     });
//                                 }
//                             }
//                         });
//                     }
//                 });

//                 // Only insert if there are valid records
//                 // if (availabilityDocs.length > 0) {
//                 //   const insertedAvailability = await InterviewAvailability.insertMany(
//                 //     availabilityDocs,
//                 //     { session }
//                 //   );

//                 //   // Update the contact document with availability references
//                 //   const availabilityIds = insertedAvailability.map((doc) => doc._id);
//                 //   updatedContact.availability = availabilityIds;
//                 //   await updatedContact.save({ session });
//                 // }
//                 if (availabilityDocs.length > 0) {
//                     const groupedAvailability = {};

//                     // Group by day for single document structure
//                     availabilityDocs.forEach(({ day, timeSlots }) => {
//                         if (!groupedAvailability[day]) groupedAvailability[day] = [];
//                         groupedAvailability[day] = groupedAvailability[day].concat(timeSlots);
//                     });

//                     const formattedAvailability = Object.entries(groupedAvailability).map(
//                         ([day, timeSlots]) => ({
//                             day,
//                             timeSlots,
//                         })
//                     );

//                     const updatedAvailabilityDoc =
//                         await InterviewAvailability.updateOrCreate(
//                             contactData?.contactId,
//                             formattedAvailability
//                         );

//                     updatedContact.availability = [updatedAvailabilityDoc._id];
//                     await updatedContact.save({ session });
//                 }

//             }

//             // Fetch the updated contact with populated availability
//             // const finalContact = await Contacts.findById(contactId)
//             const finalContact = await Contacts.findOne({ ownerId: contactId })
//                 .populate("availability")
//                 .session(session)
//                 .lean();

//             await session.commitTransaction();

//             res.status(200).json({
//                 status: "success",
//                 message: "Contact updated successfully",
//                 data: finalContact,
//             });
//         } catch (error) {
//             await session.abortTransaction();
//             throw error;
//         } finally {
//             session.endSession();
//         }
//     } catch (error) {
//         console.error("Error updating contact:", error);
//         res.status(500).json({
//             message: "Error updating contact",
//             error: error.message,
//         });
//     }
// };

// PATCH: Update contact details (no sessions, simple logic)

const updateContactsDetails = async (req, res) => {
  // Set up logging context
  res.locals.loggedByController = true;
  res.locals.processName = "Update Contact Details";

  try {
    // Validate input
    const { error } = contactPatchSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      const errors = {};
      error.details.forEach((err) => {
        const field = err.context.key;
        errors[field] = err.message;
      });

      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors,
      });
    }

    // const contactId = req.params.id;
    // const contactId =  req.params.id || req.body.contactId;

    // const contactId = new mongoose.Types.ObjectId(req.params.id || req.body.id || req.body.contactId);

    // FIX: Proper ObjectId handling
    let contactId;
    const idParam = req.params.id || req.body.id || req.body.contactId;
    if (idParam) {
      if (mongoose.Types.ObjectId.isValid(idParam)) {
        contactId = new mongoose.Types.ObjectId(idParam);
      } else {
        return res.status(400).json({
          status: "error",
          message: "Invalid contact ID format",
        });
      }
    } else {
      return res.status(400).json({
        status: "error",
        message: "Contact ID is required",
      });
    }

    const { availability, yearsOfExperience, ...contactData } = req.body;

    const contactFound = await Contacts.findById(contactId).lean();
    if (!contactFound) {
      return res.status(404).json({ message: "Contact not found." });
    }

    // Handle years of experience
    if (yearsOfExperience !== undefined) {
      contactData.yearsOfExperience = Number(yearsOfExperience) || 0;
    }

    // Normalize timeZone
    if (contactData.timeZone && typeof contactData.timeZone === "object") {
      contactData.timeZone = contactData.timeZone.value;
    }

    // Handle rates
    if (contactData.rates) {
      const defaultRate = { usd: 0, inr: 0, isVisible: false };
      const levels = ["junior", "mid", "senior"];
      if (!contactData.rates) contactData.rates = {};

      levels.forEach((level) => {
        if (!contactData.rates[level]) {
          contactData.rates[level] = { ...defaultRate };
        } else {
          contactData.rates[level] = {
            usd: Number(contactData.rates[level].usd) || 0,
            inr: Number(contactData.rates[level].inr) || 0,
            isVisible: Boolean(contactData.rates[level].isVisible),
          };
        }
      });

      const expYears = parseInt(contactData.yearsOfExperience || 0, 10);
      const showJuniorLevel = expYears > 0;
      const showMidLevel = expYears >= 4;
      const showSeniorLevel = expYears >= 7;

      if (contactData.rates.junior.isVisible === undefined)
        contactData.rates.junior.isVisible = showJuniorLevel;
      if (contactData.rates.mid.isVisible === undefined)
        contactData.rates.mid.isVisible = showMidLevel;
      if (contactData.rates.senior.isVisible === undefined)
        contactData.rates.senior.isVisible = showSeniorLevel;
    }

    // Normalize mock interview discount
    if (contactData.mock_interview_discount !== undefined) {
      contactData.mock_interview_discount = String(
        contactData.mock_interview_discount || "0"
      );
    }

    if (contactData.isMockInterviewSelected !== undefined) {
      contactData.isMockInterviewSelected = Boolean(
        contactData.isMockInterviewSelected
      );
    }

    // Compare current vs new data
    const changes = Object.entries(contactData)
      .filter(([key, newValue]) => {
        const oldValue = contactFound[key];
        if (Array.isArray(oldValue) && Array.isArray(newValue)) {
          return JSON.stringify(oldValue) !== JSON.stringify(newValue);
        }
        if (typeof oldValue === "object" && typeof newValue === "object") {
          return JSON.stringify(oldValue) !== JSON.stringify(newValue);
        }
        return oldValue !== newValue;
      })
      .map(([key, newValue]) => ({
        fieldName: key,
        oldValue: contactFound[key],
        newValue,
      }));

    if (changes.length === 0) {
      return res.status(200).json({
        status: "no_changes",
        message: "No changes detected, contact details remain the same",
        data: contactFound,
      });
    }

    // Update Contact
    const updatedContact = await Contacts.findOneAndUpdate(
      { _id: contactId },
      { $set: contactData },
      { new: true, runValidators: true }
    );

    if (!updatedContact) {
      return res.status(404).json({ message: "Contact not found." });
    }

    // Update related user if needed
    const userUpdateFields = {};
    ["firstName", "lastName", "profileId", "newEmail", "roleId"].forEach(
      (key) => {
        if (contactData[key]) userUpdateFields[key] = contactData[key];
      }
    );

    if (Object.keys(userUpdateFields).length && updatedContact.ownerId) {
      await Users.findByIdAndUpdate(updatedContact.ownerId, {
        $set: userUpdateFields,
      });
    }

    // Handle interview availability
    if (Array.isArray(availability)) {
      const reducedAvailability = [];

      availability.forEach((dayGroup) => {
        if (Array.isArray(dayGroup.days)) {
          dayGroup.days.forEach((dayEntry) => {
            const validSlots = (dayEntry.timeSlots || []).filter(
              (slot) =>
                slot.startTime &&
                slot.endTime &&
                slot.startTime !== "unavailable"
            );

            if (validSlots.length) {
              reducedAvailability.push({
                day: dayEntry.day,
                timeSlots: validSlots,
              });
            }
          });
        }
      });

      const merged = Object.entries(
        reducedAvailability.reduce((acc, { day, timeSlots }) => {
          acc[day] = [...(acc[day] || []), ...timeSlots];
          return acc;
        }, {})
      ).map(([day, timeSlots]) => ({ day, timeSlots }));

      const availabilityDoc = await InterviewAvailability.findOneAndUpdate(
        { contact: updatedContact._id },
        { $set: { availability: merged } },
        { new: true, upsert: true }
      );

      updatedContact.availability = [availabilityDoc._id];
      await updatedContact.save();
    }

    const finalContact = await Contacts.findById(updatedContact._id)
      .populate("availability")
      .lean();

    // Build field messages for logs
    const fieldMessages = changes.map(({ fieldName, oldValue, newValue }) => ({
      fieldName,
      message: `${fieldName} updated from '${oldValue}' to '${newValue}'`,
    }));

    // Add activity feed data
    // res.locals.feedData = {
    //     tenantId: contactData?.tenantId || "",
    //     feedType: "update",
    //     action: {
    //         name: "contact_updated",
    //         description: "Contact details were updated",
    //     },
    //     ownerId: contactData?.ownerId || "",
    //     parentId: contactId,
    //     parentObject: "Contacts",
    //     metadata: req.body,
    //     severity: res.statusCode >= 500 ? "high" : "low",
    //     fieldMessage: fieldMessages,
    //     history: changes,
    // };

    // Add log data
    res.locals.logData = {
      tenantId: updatedContact?.tenantId || "",
      ownerId: contactData?.ownerId || "",
      processName: "Update Contact Details",
      requestBody: req.body,
      status: "success",
      message: "Contact updated successfully",
      responseBody: finalContact,
    };

    return res.status(200).json({
      status: "success",
      message: "Contact updated successfully",
      data: finalContact,
    });
  } catch (err) {
    console.error("❌ Error updating contact:", err);

    // Log error details
    res.locals.logData = {
      tenantId: req.body?.tenantId || "",
      ownerId: req.body?.ownerId || "",
      processName: "Update Contact Details",
      requestBody: req.body,
      message: err.message,
      status: "error",
    };

    return res.status(500).json({
      status: "error",
      message: "Failed to update contact",
      error: err.message,
    });
  }
};

// const updateContactsDetails = async (req, res) => {
//     // Set up logging context
//     res.locals.loggedByController = true;
//     res.locals.processName = 'Update Contact Details';
//     try {

//         const { error } = contactPatchSchema.validate(req.body, {
//             abortEarly: false, // show all errors
//         });

//         if (error) {
//             const errors = {};
//             error.details.forEach((err) => {
//                 const field = err.context.key;
//                 errors[field] = err.message;
//             });

//             return res.status(400).json({
//                 status: "error",
//                 message: "Validation failed",
//                 errors,
//             });
//         }

//         const contactId = req.params.id;
//         const { availability, yearsOfExperience, ...contactData } = req.body;

//         const contactFound = await Contacts.findById(contactId);
//         if (!contactFound) {
//             return res.status(404).json({ message: "Contact not found." });
//         }

//         // Add yearsOfExperience to contactData if it exists in the request
//         if (yearsOfExperience !== undefined) {
//             contactData.yearsOfExperience = Number(yearsOfExperience) || 0;
//         }

//         // If timeZone is an object (e.g., { label: "", value: "" }), extract value
//         if (contactData.timeZone && typeof contactData.timeZone === "object") {
//             contactData.timeZone = contactData.timeZone.value;
//         }

//         // Process rates object if provided
//         if (contactData.rates) {
//             // Ensure rates object has proper structure
//             const defaultRate = { usd: 0, inr: 0, isVisible: false };
//             const levels = ['junior', 'mid', 'senior'];

//             // Initialize rates object if not present
//             if (!contactData.rates) contactData.rates = {};

//             // Process each level
//             levels.forEach(level => {
//                 if (!contactData.rates[level]) {
//                     contactData.rates[level] = { ...defaultRate };
//                 } else {
//                     // Ensure all required fields exist and are of correct type
//                     contactData.rates[level] = {
//                         usd: Number(contactData.rates[level].usd) || 0,
//                         inr: Number(contactData.rates[level].inr) || 0,
//                         isVisible: Boolean(contactData.rates[level].isVisible)
//                     };
//                 }
//             });

//             // Set visibility based on years of experience if not explicitly set
//             const expYears = parseInt(contactData.yearsOfExperience || 0, 10);

//             const showJuniorLevel = expYears > 0;
//             const showMidLevel = expYears >= 4;
//             const showSeniorLevel = expYears >= 7;

//             if (contactData.rates.junior.isVisible === undefined) {
//                 contactData.rates.junior.isVisible = showJuniorLevel; // Always show junior
//             }
//             if (contactData.rates.mid.isVisible === undefined) {
//                 contactData.rates.mid.isVisible = showMidLevel; // Show mid if 3+ years
//             }
//             if (contactData.rates.senior.isVisible === undefined) {
//                 contactData.rates.senior.isVisible = showSeniorLevel; // Show senior if 7+ years
//             }
//         }

//         // Process mock interview discount
//         if (contactData.mock_interview_discount !== undefined) {
//             contactData.mock_interview_discount = String(contactData.mock_interview_discount || '0');
//         }

//         // Ensure mock interview selected flag is a boolean
//         if (contactData.isMockInterviewSelected !== undefined) {
//             contactData.isMockInterviewSelected = Boolean(contactData.isMockInterviewSelected);
//         }

//         // Update the contact document by _id (contactId is the document _id)
//         const updatedContact = await Contacts.findOneAndUpdate(
//             { _id: contactId },
//             { $set: contactData },
//             { new: true, runValidators: true }
//         );

//         if (!updatedContact) {
//             return res.status(404).json({ message: "Contact not found." });
//         }

//         // Update related User document if fields exist in request
//         const userUpdateFields = {};
//         ["firstName", "lastName", "profileId", "newEmail", "roleId"].forEach(
//             (key) => {
//                 if (contactData[key]) userUpdateFields[key] = contactData[key];
//             }
//         );

//         if (Object.keys(userUpdateFields).length && updatedContact.ownerId) {
//             // Use the ownerId from the Contact document to update the User
//             await Users.findByIdAndUpdate(updatedContact.ownerId, { $set: userUpdateFields });
//         }

//         // Handle interview availability if provided
//         if (Array.isArray(availability)) {
//             const reducedAvailability = [];

//             availability.forEach((dayGroup) => {
//                 if (Array.isArray(dayGroup.days)) {
//                     dayGroup.days.forEach((dayEntry) => {
//                         const validSlots = (dayEntry.timeSlots || []).filter(
//                             (slot) =>
//                                 slot.startTime &&
//                                 slot.endTime &&
//                                 slot.startTime !== "unavailable"
//                         );

//                         if (validSlots.length) {
//                             reducedAvailability.push({
//                                 day: dayEntry.day,
//                                 timeSlots: validSlots,
//                             });
//                         }
//                     });
//                 }
//             });

//             // Merge slots by day
//             const merged = Object.entries(
//                 reducedAvailability.reduce((acc, { day, timeSlots }) => {
//                     acc[day] = [...(acc[day] || []), ...timeSlots];
//                     return acc;
//                 }, {})
//             ).map(([day, timeSlots]) => ({ day, timeSlots }));

//             const availabilityDoc = await InterviewAvailability.findOneAndUpdate(
//                 { contact: updatedContact._id },
//                 { $set: { availability: merged } },
//                 { new: true, upsert: true }
//             );

//             // Link InterviewAvailability ID to Contact
//             updatedContact.availability = [availabilityDoc._id];
//             await updatedContact.save();
//         }

//         // Final response with populated availability
//         const finalContact = await Contacts.findById(updatedContact._id)
//             .populate("availability")
//             .lean();

//         res.locals.logData = {
//             tenantId: req?.body?.contactData?.tenantId || "",
//             ownerId: req?.body?.contactData?.ownerId || "",
//             processName: 'Update Contact Details',
//             requestBody: req?.body,
//             status: 'success',
//             message: 'Contact updated successfully',
//             responseBody: contactFound,
//             changes: changes,
//         };

//         return res.status(200).json({
//             status: "success",
//             message: "Contact updated successfully",
//             data: finalContact,
//         });
//     } catch (err) {
//         // Error logging - only set logData for actual errors
//         res.locals.logData = {
//             tenantId: req?.body?.contactData?.tenantId,
//             ownerId: req?.body?.contactData?.ownerId,
//             processName: "Update Contact Details",
//             requestBody: req?.body,
//             message: err.message,
//             status: "error",
//         };
//         return res.status(500).json({
//             message: "Failed to update contact",
//             error: err.message,
//         });
//     }
// };

const getUniqueContactsByOwnerId = async (req, res) => {
  try {
    const { ownerId } = req.params;

    if (!ownerId) {
      return res.status(400).json({ message: "Owner ID is required" });
    }

    const contacts = await Contacts.find({ ownerId })
      .populate("availability")
      .populate({
        path: "ownerId",
        select: "firstName lastName email roleId",
        model: "Users",
        populate: {
          path: "roleId",
          model: "Role",
          select: "roleName",
        },
      })
      .lean();

    res.status(200).json(contacts);
  } catch (error) {
    console.error("Error fetching contacts by owner ID:", error);
    res.status(500).json({
      message: "Error fetching contacts by owner ID",
      error: error.message,
    });
  }
};

// SUPER ADMIN added by Ashok ----------------------------------------------->
const getContactsByOrganizationId = async (req, res) => {
  try {
    const { organizationId } = req.params;

    if (!organizationId) {
      return res.status(400).json({ message: "Owner ID is required" });
    }

    const contacts = await Contacts.find({ tenantId: organizationId });

    res.status(200).json(contacts);
  } catch (error) {
    console.error("Error fetching contacts by organization Id:", error);
    res.status(500).json({ message: "Server error" });
  }
};
module.exports = {
  // fetchContacts,
  getAllContacts,
  createContact,
  updateContact,
  getContactsByOwnerId,
  updateContactsDetails,
  getUniqueContactsByOwnerId,
  getContactsByOrganizationId, // SUPER ADMIN added by Ashok
  updateContactStatus,
};
