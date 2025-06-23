const { Contacts } = require('../models/Contacts');
const Interviewavailability = require('../models/InterviewAvailability');
const { Users } = require('../models/Users');

const getAllContacts = async (req, res) => {
    try {
        const contacts = await Contacts.find().populate('availability');
        return res.status(200).json(contacts);
    } catch (error) {
        console.error('Error fetching all contacts:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// const fetchContacts = async (req, res) => {
//     try {
//         const contacts = await Contacts.find().populate('availability')
//         .populate({
//             path: 'ownerId',
//             select: 'firstName lastName email roleId isFreelancer',
//             model: 'Users', // Explicitly specify model
//             populate: {
//                 path: 'roleId',
//                 model: 'Role', // Explicitly specify model
//                 select: 'roleName'
//             }
//         }).lean();

//         //  console.log("contact",contacts);

//         //  const transformedContacts = contacts.map(contact => {



//         //     // If ownerId is populated, extract the roleName
//         //     if (contact.ownerId && contact.ownerId.roleId) {
//         //         return {
//         //             ...contact,
//         //             owner: {
//         //                 ...contact.ownerId,
//         //                 roleName: contact.ownerId.roleId?.roleName
//         //             }
//         //         };
//         //     }
//         //     return contact;
//         // });



//         //   const contacts = await Contacts.find().populate('availability');
//     res.status(200).json(contacts);


//         // console.log("Debugging populated contacts:");
//         // contacts.forEach(contact => {
//         //     if (contact.ownerId) {
//         //         console.log({
//         //             contactId: contact._id,
//         //             ownerId: contact.ownerId._id,
//         //             roleId: contact.ownerId.roleId?._id,
//         //             roleName: contact.ownerId.roleId?.roleName
//         //         });
//         //     }
//         // });

//           // 3. Transform data to ensure roleName is accessible
//         //   const transformedContacts = contacts.map(contact => {
//         //     const contactData = { ...contact };

//         //     if (contactData.ownerId && contactData.ownerId.roleId) {
//         //         contactData.owner = {
//         //             ...contactData.ownerId,
//         //             roleName: contactData.ownerId.roleId.roleName
//         //         };
//         //         delete contactData.ownerId; // Optional cleanup
//         //     }

//         //     return contactData;
//         // });



//         // .populate('ownerId');
//         // res.status(200).json(contacts);
//     } catch (error) {
//         console.error('Error fetching contacts:', error);
//         res.status(500).json({ message: 'Error fetching contacts', error: error.message });
//     }
// };

// const fetchContacts = async (req, res) => {
//     const contactId = req.params.id;

//     try {
//         const contact = await Contacts.findById(contactId)
//             .populate('availability')
//             .populate({
//                 path: 'ownerId',
//                 select: 'firstName lastName email roleId isFreelancer',
//                 model: 'Users',
//                 populate: {
//                     path: 'roleId',
//                     model: 'Role',
//                     select: 'roleName'
//                 }
//             }).lean();

//         if (!contact) {
//             return res.status(404).json({ message: 'Contact not found' });
//         }

//         // Optional: transform roleName
//         if (contact.ownerId && contact.ownerId.roleId) {
//             contact.owner = {
//                 ...contact.ownerId,
//                 roleName: contact.ownerId.roleId.roleName
//             };
//             delete contact.ownerId;
//         }

//         res.status(200).json(contact);
//     } catch (error) {
//         console.error('Error fetching contact:', error);
//         res.status(500).json({ message: 'Error fetching contact', error: error.message });
//     }
// }

const createContact = async (req, res) => {
    try {
        const contact = new Contacts(req.body);
        const savedContact = await contact.save();
        res.status(201).json(savedContact);
    } catch (error) {
        console.error('Error saving contact:', error);
        if (error.name === 'ValidationError') {
            res.status(400).json({ message: 'Validation Error', details: error.errors });
        } else {
            res.status(500).json({ message: 'Internal Server Error', error });
        }
    }
};

const updateContact = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedContact = await Contacts.findByIdAndUpdate(id, req.body, { new: true });
        res.status(200).json(updatedContact);
    } catch (error) {
        console.error('Error updating contact:', error);
        res.status(500).json({ message: 'Error updating contact', error: error.message });
    }
};

const getContactsByOwnerId = async (req, res) => {
    try {
        const { ownerId } = req.params;

        if (!ownerId) {
            return res.status(400).json({ message: 'Owner ID is required' });
        }

        const contacts = await Contacts.find({ ownerId }).populate('availability').populate({
            path: 'ownerId',
            select: 'firstName lastName email roleId isFreelancer',
            model: 'Users', // Explicitly specify model
            populate: {
                path: 'roleId',
                model: 'Role', // Explicitly specify model
                select: 'roleName'
            }
        })

        res.status(200).json(contacts);
    } catch (error) {
        console.error('Error fetching contacts by ownerId:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

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
// router.patch('/contacts/:id',

const updateContactsDetails = async (req, res) => {
    try {
        const contactId = req.params.id;
        const updateData = req.body;
        // Separate availability data if present
        const { availability, ...contactData } = updateData;

        // console.log("updateData", availability,"contactData", contactData);

        if (contactData.timeZone && typeof contactData.timeZone === 'object' && contactData.preferredDuration) {
            contactData.timeZone = contactData.timeZone || ""; // Store only the 'value' (e.g., 'America/Boise')
            contactData.preferredDuration = contactData.preferredDuration || ""
        }


        // Start a transaction to ensure atomic updates
        const session = await Contacts.startSession();
        session.startTransaction();

        try {
            // Update contact basic details
            const updatedContact = await Contacts.findByIdAndUpdate(
                contactId,
                {
                    $set: contactData
                },
                {
                    new: true,
                    runValidators: true
                }
            );


            if (!updatedContact) {
                await session.abortTransaction();
                return res.status(404).json({ message: 'Contact not found' });
            }
            // 2. Update user schema if relevant fields are in request
            const userUpdateFields = {};
            if (contactData.firstName) userUpdateFields.firstName = contactData.firstName;
            if (contactData.lastName) userUpdateFields.lastName = contactData.lastName;
            if (contactData.profileId) userUpdateFields.profileId = contactData.profileId;
            if (contactData.newEmail) userUpdateFields.newEmail = contactData.newEmail;
            // if (contactData.email) userUpdateFields.email = contactData.email;

            // Only update if there's something to update
            if (Object.keys(userUpdateFields).length > 0 && updatedContact.ownerId) {
                await Users.findByIdAndUpdate(
                    updatedContact.ownerId,
                    { $set: userUpdateFields },
                    { session }
                );
            }

            // Handle availability updates if provided
            if (availability && Array.isArray(availability)) {
                // First remove existing availability records for this contact
                await Interviewavailability.deleteMany({ contact: contactId }, { session });

                // Create new availability records with valid data
                const availabilityDocs = availability.map(avail => ({
                    contact: contactId,
                    days: avail.days
                        .filter(day => day && day.day && Array.isArray(day.timeSlots) && day.timeSlots.length > 0)
                        .map(day => ({
                            day: day.day,
                            timeSlots: day.timeSlots
                                .filter(slot => slot && slot.startTime && slot.endTime)
                                .map(slot => ({
                                    startTime: slot.startTime,
                                    endTime: slot.endTime
                                }))
                        }))
                }));

                // Only insert if there are valid records
                if (availabilityDocs.length > 0 && availabilityDocs[0].days.length > 0) {
                    const insertedAvailability = await Interviewavailability.insertMany(
                        availabilityDocs,
                        { session }
                    );

                    // Update the contact document with availability references
                    const availabilityIds = insertedAvailability.map(doc => doc._id);
                    updatedContact.availability = availabilityIds;
                    await updatedContact.save({ session });
                }
            }


            // Fetch the updated contact with populated availability
            const finalContact = await Contacts.findById(contactId)
                .populate('availability')
                .lean();

            await session.commitTransaction();

            // console.log("finalContact", finalContact);

            res.status(200).json({
                status: 'success',
                message: 'Contact updated successfully',
                data: finalContact
            });

        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            session.endSession();
        }

    } catch (error) {
        console.error('Error updating contact:', error);
        res.status(500).json({
            message: 'Error updating contact',
            error: error.message
        });
    }
};

const getUniqueContactsByOwnerId = async (req, res) => {
    try {
        const { ownerId } = req.params;

        if (!ownerId) {
            return res.status(400).json({ message: 'Owner ID is required' });
        }

        const contacts = await Contacts.find({ ownerId })
            .populate('availability')
            .populate({
                path: 'ownerId',
                select: 'firstName lastName email roleId',
                model: 'Users',
                populate: {
                    path: 'roleId',
                    model: 'Role',
                    select: 'roleName'
                }
            })
            .lean();

        res.status(200).json(contacts);
    } catch (error) {
        console.error('Error fetching contacts by owner ID:', error);
        res.status(500).json({ message: 'Error fetching contacts by owner ID', error: error.message });
    }
};

module.exports = {
    // fetchContacts,
    createContact,
    updateContact,
    updateContactsDetails,
    getUniqueContactsByOwnerId,
    getContactsByOwnerId,
    getAllContacts
};