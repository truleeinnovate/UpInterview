const { Contacts } = require("../models/Contacts");
const InterviewAvailability = require("../models/InterviewAvailability");
const { Users } = require("../models/Users");
const mongoose = require("mongoose");
const { contactValidationSchema, contactPatchSchema } = require("../validations/contactValidations");

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
    try {
        const contact = new Contacts(req.body);
        const savedContact = await contact.save();
        res.status(201).json(savedContact);
    } catch (error) {
        console.error("Error saving contact:", error);
        if (error.name === "ValidationError") {
            res
                .status(400)
                .json({ message: "Validation Error", details: error.errors });
        } else {
            res.status(500).json({ message: "Internal Server Error", error });
        }
    }
};

const updateContact = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedContact = await Contacts.findByIdAndUpdate(id, req.body, {
            new: true,
        });
        res.status(200).json(updatedContact);
    } catch (error) {
        console.error("Error updating contact:", error);
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

//         console.log("contactId", contactId);

//         // Separate availability data if present
//         const { availability, ...contactData } = updateData;

//         // console.log("updateData", availability,"contactData", contactData);

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

//             // console.log("finalContact", finalContact);

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

//         // console.log("updateData", availability,"contactData", contactData);

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
//             console.log("avail", avail,contactData);

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

//             // console.log("finalContact", finalContact);

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
    try {

        const { error } = contactPatchSchema.validate(req.body, {
            abortEarly: false, // show all errors
        });
        console.log("error", error);

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

        const contactId = req.params.id;
        const { availability, yearsOfExperience, ...contactData } = req.body;

        console.log("contactData", req.body);

        // If timeZone is an object (e.g., { label: "", value: "" }), extract value
        if (contactData.timeZone && typeof contactData.timeZone === "object") {
            contactData.timeZone = contactData.timeZone.value;
        }

        // Process rates object if provided
        if (contactData.rates) {
            // Ensure rates object has proper structure
            const defaultRate = { usd: 0, inr: 0, isVisible: false };
            const levels = ['junior', 'mid', 'senior'];

            // Initialize rates object if not present
            if (!contactData.rates) contactData.rates = {};

            // Process each level
            levels.forEach(level => {
                if (!contactData.rates[level]) {
                    contactData.rates[level] = { ...defaultRate };
                } else {
                    // Ensure all required fields exist and are of correct type
                    contactData.rates[level] = {
                        usd: Number(contactData.rates[level].usd) || 0,
                        inr: Number(contactData.rates[level].inr) || 0,
                        isVisible: Boolean(contactData.rates[level].isVisible)
                    };
                }
            });

            // Set visibility based on years of experience if not explicitly set
            const expYears = parseInt(yearsOfExperience || contactData.yearsOfExperience || 0, 10);

            if (contactData.rates.junior.isVisible === undefined) {
                contactData.rates.junior.isVisible = expYears <= 3; // Always show junior
            }
            if (contactData.rates.mid.isVisible === undefined) {
                contactData.rates.mid.isVisible = expYears > 3 && expYears <= 6; // Show mid if 3+ years
            }
            if (contactData.rates.senior.isVisible === undefined) {
                contactData.rates.senior.isVisible = expYears > 6; // Show senior if 7+ years
            }
        }

        // Process mock interview discount
        if (contactData.mock_interview_discount !== undefined) {
            contactData.mock_interview_discount = String(contactData.mock_interview_discount || '0');
        }

        // Ensure mock interview selected flag is a boolean
        if (contactData.isMockInterviewSelected !== undefined) {
            contactData.isMockInterviewSelected = Boolean(contactData.isMockInterviewSelected);
        }

        // Update the contact document based on ownerId (contactId)
        const updatedContact = await Contacts.findOneAndUpdate(
            { ownerId: contactId },
            { $set: contactData },
            { new: true, runValidators: true }
        );

        if (!updatedContact) {
            return res.status(404).json({ message: "Contact not found." });
        }

        // Update related User document if fields exist in request
        const userUpdateFields = {};
        ["firstName", "lastName", "profileId", "newEmail", "roleId"].forEach(
            (key) => {
                if (contactData[key]) userUpdateFields[key] = contactData[key];
            }
        );

        if (Object.keys(userUpdateFields).length) {
            await Users.findByIdAndUpdate(contactId, { $set: userUpdateFields });
        }

        // Handle interview availability if provided
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

            // Merge slots by day
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

            // Link InterviewAvailability ID to Contact
            updatedContact.availability = [availabilityDoc._id];
            await updatedContact.save();
        }

        // Final response with populated availability
        const finalContact = await Contacts.findById(updatedContact._id)
            .populate("availability")
            .lean();

        return res.status(200).json({
            status: "success",
            message: "Contact updated successfully",
            data: finalContact,
        });
    } catch (err) {
        console.error("Error updating contact:", err);
        return res.status(500).json({
            message: "Failed to update contact",
            error: err.message,
        });
    }
};

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

// ---------------------------------------------------------------------------->

module.exports = {
    // fetchContacts,
    createContact,
    updateContact,
    updateContactsDetails,
    getUniqueContactsByOwnerId,
    getContactsByOwnerId,
    getAllContacts,
    getContactsByOrganizationId,
};
