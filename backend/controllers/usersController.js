const { Users } = require('../models/Users');
const Role = require('../models/RolesData');
const { Contacts } = require('../models/Contacts');
const InterviewAvailability = require('../models/InterviewAvailability');
const mongoose = require('mongoose');
const { format, parse, parseISO } = require('date-fns');

// Controller to fetch all users with populated tenantId
const getUsers = async (req, res) => {
  try {
    const users = await Users.find().populate('tenantId'); // Populate tenantId with Organization data
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// GET /api/users/owner/:ownerId
// const getUniqueUserByOwnerId = async (req, res) => {
//   try {
//     const { ownerId } = req.params;
//     // Find user by ownerId
//     const user = await Users.findOne({ _id: ownerId });

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found for the given ownerId'
//       });
//     }

//     res.status(200).json({
//       success: true,
//       data: user
//     });
//   } catch (error) {
//     console.error('❌ [getUniqueUserByOwnerId] Error:', error.message, error.stack);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error'
//     });
//   }
// };



// ashraf's modified code which is using in the home availability interviewers
// // Helper function to determine availability and next available time
// const getAvailabilityInfo = async (availabilityIds) => {
//   if (!availabilityIds || availabilityIds.length === 0) {
//     return { availability: 'Unknown', nextAvailable: 'Unknown' };
//   }

//   // Fetch availability data
//   const availabilityData = await Interviewavailability.find({
//     _id: { $in: availabilityIds },
//   }).lean();

//   // Current date and time (in IST, as per context: May 27, 2025, 12:21 PM IST)
//   const now = new Date('2025-05-27T12:21:00+05:30');
//   const today = now.toLocaleString('en-US', { weekday: 'long', timeZone: 'Asia/Kolkata' });

//   // Filter valid time slots (exclude invalid dates like 1970-01-01)
//   const validTimeSlots = [];
//   for (const avail of availabilityData) {
//     for (const day of avail.days) {
//       for (const slot of day.timeSlots) {
//         const startTime = new Date(slot.startTime);
//         const endTime = new Date(slot.endTime);

//         // Skip invalid or placeholder dates (1970-01-01)
//         if (startTime.getFullYear() === 1970) {
//           continue;
//         }

//         // Adjust the slot's date to the next occurrence of the day
//         const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
//         const currentDayIndex = daysOfWeek.indexOf(today);
//         const slotDayIndex = daysOfWeek.indexOf(day.day);
//         let daysUntilNext = slotDayIndex - currentDayIndex;
//         if (daysUntilNext < 0) {
//           daysUntilNext += 7; // Move to next week
//         } else if (daysUntilNext === 0 && startTime.getHours() * 60 + startTime.getMinutes() < now.getHours() * 60 + now.getMinutes()) {
//           daysUntilNext += 7; // If today's slot is in the past, move to next week
//         }

//         const slotDate = new Date(now);
//         slotDate.setDate(now.getDate() + daysUntilNext);
//         slotDate.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);

//         validTimeSlots.push({
//           day: day.day,
//           startTime: slotDate,
//           formattedTime: startTime.toLocaleTimeString('en-US', {
//             hour: 'numeric',
//             minute: '2-digit',
//             hour12: true,
//             timeZone: 'Asia/Kolkata',
//           }),
//         });
//       }
//     }
//   }

//   // Sort time slots by date to find the earliest
//   validTimeSlots.sort((a, b) => a.startTime - b.startTime);

//   // Determine availability and next available time
//   const hasAvailableSlots = validTimeSlots.length > 0;
//   let nextAvailable = 'Unknown';
//   if (hasAvailableSlots) {
//     const nextSlot = validTimeSlots[0];
//     const isToday = nextSlot.startTime.toDateString() === now.toDateString();
//     nextAvailable = isToday
//       ? `Today, ${nextSlot.formattedTime}`
//       : `${nextSlot.day}, ${nextSlot.formattedTime}`;
//   }

//   return {
//     availability: hasAvailableSlots ? 'Available' : 'Busy',
//     nextAvailable,
//   };
// };

// // Controller to fetch interviewers
// const getInterviewers = async (req, res) => {
//   try {
//     const { tenantId } = req.params;
//     console.log('✅ [getInterviewers] Called with tenantId:', tenantId);

//     // Validate tenantId
//     if (!tenantId || tenantId === 'undefined') {
//       console.error('❌ [getInterviewers] Missing or invalid tenantId:', tenantId);
//       return res.status(400).json({ error: 'Tenant ID is required' });
//     }
//     if (!mongoose.isValidObjectId(tenantId)) {
//       console.error('❌ [getInterviewers] Invalid tenantId format:', tenantId);
//       return res.status(400).json({ error: 'Invalid Tenant ID format' });
//     }

//     // Fetch external interviewers
//     const externalUsers = await Users.find({ isFreelancer: true }).lean();
//     console.log('✅ [getInterviewers] External users fetched:', externalUsers.length);

//     // Fetch internal roles
//     const internalRoles = await Role.find({
//       roleName: "Internal_Interviewer",
//       tenantId,
//     }).select('_id').lean();
//     console.log('✅ [getInterviewers] Internal roles fetched:', internalRoles.length, internalRoles);

//     const internalRoleIds = internalRoles.map((role) => role._id.toString());
//     console.log('✅ [getInterviewers] Internal role IDs:', internalRoleIds);

//     // Fetch internal interviewers
//     const internalUsers = await Users.find({
//       roleId: { $in: internalRoleIds },
//       tenantId,
//     }).lean();
//     console.log('✅ [getInterviewers] Internal users fetched:', internalUsers.length, internalUsers);

//     // Combine all users
//     const allUsers = [...internalUsers, ...externalUsers];
//     console.log('✅ [getInterviewers] Total users:', allUsers.length);

//     // Fetch contacts
//     const contacts = await Contacts.find({
//       ownerId: { $in: allUsers.map((user) => user._id) },
//     }).lean();
//     console.log('✅ [getInterviewers] Contacts fetched:', contacts.length);

//     // Fetch availabilities
//     const contactIds = contacts.map((contact) => contact._id);
//     const availabilities = await Interviewavailability.find({
//       contact: { $in: contactIds },
//     }).lean();
//     console.log('✅ [getInterviewers] Availabilities fetched:', availabilities.length);

//     // Map contacts to availability
//     const contactAvailabilityMap = {};
//     availabilities.forEach((avail) => {
//       contactAvailabilityMap[avail.contact.toString()] = avail;
//     });
//     console.log('✅ [getInterviewers] Contact availability map:', contactAvailabilityMap.length);

//     // Construct the final interviewers array
//     const interviewers = await Promise.all(
//       allUsers.map(async (user) => {
//         const contact = contacts.find(
//           (c) => c.ownerId.toString() === user._id.toString()
//         );

//         const availabilityIds = contact?.availability || [];
//         const { availability, nextAvailable } = await getAvailabilityInfo(availabilityIds);

//         const isInternal = internalUsers.some(
//           (u) => u._id.toString() === user._id.toString()
//         );
//         const type = isInternal ? 'Internal' : 'External';

//         return {
//           id: user._id.toString(),
//           name: contact
//             ? `${contact.firstName} ${contact.lastName}`
//             : `${user.firstName} ${user.lastName}`,
//           role: contact?.currentRole || (isInternal ? 'Internal Interviewer' : 'Freelance Interviewer'),
//           specialization: contact?.expertiseLevel || 'Unknown',
//           rating: 4.8, // Placeholder; replace with actual data if available
//           completedInterviews: contact?.PreviousExperienceConductingInterviewsYears
//             ? parseInt(contact.PreviousExperienceConductingInterviewsYears) * 50
//             : 50,
//           availability,
//           nextAvailable,
//           type,
//           department: isInternal ? 'Engineering' : undefined,
//           company: !isInternal ? contact?.industry || 'Freelancer' : undefined,
//           location: contact?.location || 'Unknown',
//           image:
//             contact?.imageData?.path,
//         };
//       })
//     );

//     console.log('✅ [getInterviewers] Final interviewers prepared:', interviewers.length);
//     res.json(interviewers);
//   } catch (error) {
//     console.error('❌ [getInterviewers] Error fetching interviewers:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

const convertTo12HourFormat = (time24) => {
  if (!time24) return '';

  try {
    let date;

    if (typeof time24 === 'string') {
      if (time24.includes('T') && time24.includes('Z')) {
        date = parseISO(time24);
        if (isNaN(date)) {
          throw new Error(`Invalid ISO date: ${time24}`);
        }
      } else if (time24.match(/^\d{1,2}:\d{2}\s?(AM|PM)$/i)) {
        date = parse(time24, 'h:mm a', new Date());
        if (isNaN(date)) {
          throw new Error(`Invalid 12-hour format: ${time24}`);
        }
      } else if (time24.match(/^\d{2}:\d{2}$/)) {
        date = parse(time24, 'HH:mm', new Date());
        if (isNaN(date)) {
          throw new Error(`Invalid 24-hour format: ${time24}`);
        }
      } else {
        throw new Error(`Unrecognized time format: ${time24}`);
      }
    } else if (time24 instanceof Date && !isNaN(time24)) {
      date = time24;
    } else {
      throw new Error(`Unsupported input type: ${time24}`);
    }

    return format(date, 'h:mm a');
  } catch (error) {
    console.error('Error converting time:', error.message);
    return time24 || '';
  }
};

const getInterviewers = async (req, res) => {
  try {
    const { tenantId } = req.params;

    // Validate tenantId
    if (!tenantId || tenantId === 'undefined') {
      return res.status(400).json({ error: 'Tenant ID is required' });
    }

    if (!mongoose.isValidObjectId(tenantId)) {
      return res.status(400).json({ error: 'Invalid Tenant ID format' });
    }

    // Fetch external interviewers
    const externalUsers = await Users.find({ isFreelancer: true }).lean();
    // console.log('✅ [getInterviewers] External users fetched:', externalUsers.length);

    const internalRoles = await Role.find({
      roleName: 'Internal_Interviewer',
      tenantId,
    }).select('_id').lean();

    const internalRoleIds = internalRoles.map((role) => role._id.toString());

    // Fetch internal interviewers
    const internalUsers = await Users.find({
      roleId: internalRoleIds,
    }).lean();
    // console.log('✅ [getInterviewers] Internal users fetched:', internalUsers.length); //internal

    // Function to process users - modified to skip availability for internal users
    const processUsers = async (users, type) => {
      if (!users.length) return [];

      const userIds = users.map(user => user._id);

      // Fetch contacts for all users
      const contacts = await Contacts.find({ ownerId: { $in: userIds } }).lean();
      // console.log(`✅ [getInterviewers] ${type} contacts fetched:`, contacts.length);

      if (type === 'internal') {
        // For internal users, just return the contact info without availability
        return contacts.map(contact => {
          const user = users.find(u => u._id.toString() === contact.ownerId?.toString()) || {};
          return {
            _id: contact._id,
            contact: {
              ...contact,
              ownerId: user._id,
              email: user.email,
              isFreelancer: 'false'
            },
            type: 'internal',
            days: [],
            nextAvailable: null,
            __v: 0
          };
        });
      }

      // For external users, include availability
      const contactIds = contacts.map(contact => contact._id);
      const availabilities = await InterviewAvailability.find({
        contact: { $in: contactIds }
      }).populate('contact').lean();

      // console.log(`✅ [getInterviewers] External availabilities fetched:`, availabilities.length);

      return availabilities.map(availability => {
        const contact = availability.contact || {};
        const ownerId = contact.ownerId?.toString();
        const user = users.find(u => u._id.toString() === ownerId) || {};

        const nextSlot = availability.days?.find(day =>
          day.timeSlots?.length > 0
        )?.timeSlots[0];

        return {
          _id: availability._id,
          contact: {
            ...contact,
            ownerId: user._id,
            email: user.email,
            isFreelancer: 'true'
          },
          type: 'external',
          days: availability.days?.map(day => ({
            day: day.day,
            timeSlots: day.timeSlots?.map(slot => ({
              startTime: convertTo12HourFormat(slot.startTime),
              endTime: convertTo12HourFormat(slot.endTime)
            })) || []
          })) || [],
          nextAvailable: nextSlot ? {
            day: nextSlot.day,
            startTime: convertTo12HourFormat(nextSlot.startTime),
            endTime: convertTo12HourFormat(nextSlot.endTime)
          } : null,
          __v: availability.__v
        };
      });
    };

    // Process both internal and external users in parallel
    const [internalResults, externalResults] = await Promise.all([
      processUsers(internalUsers, 'internal'),
      processUsers(externalUsers, 'external')
    ]);

    // Combine results
    const allResults = [...internalResults, ...externalResults];
    // console.log('✅ [getInterviewers] Total records:', allResults.length);

    return res.json({
      success: true,
      data: allResults
    });

    // // Combine all users
    // const allUsers = [...internalUsers, ...externalUsers];
    // console.log('✅ [getInterviewers] Total users:', allUsers.length);

    // // Fetch contacts
    // const userIds = allUsers.map((user) => user._id);
    // const contacts = await Contacts.find({ ownerId: { $in: userIds } }).lean();
    // console.log('✅ [getInterviewers] Contacts fetched:', contacts.length);

    // // Fetch availabilities and populate contact
    // const contactIds = contacts.map(contact => contact._id);
    // const availabilities = await InterviewAvailability.find({
    //   contact: { $in: contactIds }
    // })
    //   .populate('contact')
    //   .lean();
    // console.log('✅ [getInterviewers] Availabilities fetched:', availabilities.length);

    // // Create sets of user IDs for quick lookup
    // const externalUserIds = new Set(externalUsers.map(user => user._id.toString()));
    // const internalUserIds = new Set(internalUsers.map(user => user._id.toString()));

    // // Format availabilities for response and console logging
    // const formattedAvailabilities = availabilities.map(availability => {
    //   const contactOwnerId = availability.contact?.ownerId?.toString();
    //   const type = externalUserIds.has(contactOwnerId)
    //     ? 'external'
    //     : internalUserIds.has(contactOwnerId)
    //       ? 'internal'
    //       : 'unknown'; // Fallback in case ownerId doesn't match

    //   const formatted = {
    //     _id: availability._id,
    //     contact: availability.contact,
    //     type, // Add type field
    //     days: availability.days && Array.isArray(availability.days)
    //       ? availability.days.map(day => ({
    //         day: day.day || 'Unknown',
    //         timeSlots: day.timeSlots && Array.isArray(day.timeSlots)
    //           ? day.timeSlots.map(slot => ({
    //             startTime: slot.startTime ? convertTo12HourFormat(slot.startTime) : '',
    //             endTime: slot.endTime ? convertTo12HourFormat(slot.endTime) : ''
    //           }))
    //           : []
    //       }))
    //       : [],
    //     __v: availability.__v
    //   };
    //   return formatted;
    // });

    // // Log formatted availabilities
    // console.log('✅ [getInterviewers] Formatted availabilities:');
    // formattedAvailabilities.forEach((availability, index) => {
    //   // console.log(`Availability ${index + 1}:`, JSON.stringify(availability, null, 2));
    // });

    // return res.json({
    //   success: true,
    //   data: formattedAvailabilities
    // });
  } catch (error) {
    console.error('❌ [getInterviewers] Error fetching interviewers:', error.message, error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PATCH /api/users/:id/status
const UpdateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: "Invalid status value." });
    }

    const updatedUser = await Users.findByIdAndUpdate(
      userId,
      { status, modifiedBy: req.body.modifiedBy || 'system' },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating status:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};


const getUsersByTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;

    if (!tenantId) {
      return res.status(400).json({ message: 'Invalid tenant ID' });
    }

    const users = await Users.find({ tenantId })
    .populate({ path: 'roleId', select: '_id label roleName status' })
    .lean();
    if (!users || users.length === 0) {
      return res.status(200).json([]);
    }

    const [contacts, roles] = await Promise.all([
      Contacts.find({ tenantId }).lean(),
      Role.find({ tenantId }).lean() // ✅ Fix: using correct field
    ]);

    const roleMap = roles.reduce((acc, role) => {
      acc[role._id.toString()] = role;
      return acc;
    }, {});

    const contactMap = contacts.reduce((acc, contact) => {
      if (contact.ownerId) {
        acc[contact.ownerId.toString()] = contact;
      }
      return acc;
    }, {});


    const combinedUsers = users.map(user => {
      const contact = contactMap[user._id.toString()] || {};
      const role = user.roleId ? roleMap[user.roleId] : {};

      return {
        _id: user._id,
        contactId: contact._id || '',
        isEmailVerified:user.isEmailVerified || false,
        firstName: contact.firstName || '',
        lastName: contact.lastName || '',
        email: user.email || '',
        newEmail: user.newEmail || '',
        countryCode: contact.countryCode || '',
        gender: contact.gender || '',
        phone: contact.phone || '',
        status: user.status || '',

        // <<<<<<< Ranjith
        roleId: user?.roleId?.roleId || '',
        roleName: user?.roleId?.roleName || '',
        label: user?.roleId?.label || '',
        // =======
        //         roleId: users.roleId || '',
        //         roleName: users.roleName || '',
        //         label: users.label || '',
        // >>>>>>> main
        imageData: contact.imageData || null,
        createdAt: user.createdAt || contact.createdAt,
        status: user.status || '',
        updatedAt: user.updatedAt || contact.updatedAt,
        profileId: contact.profileId || '',
        linkedinUrl: contact.linkedinUrl || '',
        portfolioUrl: contact.portfolioUrl || '',
        hourlyRate: contact.hourlyRate || '',
        currentRole: contact.currentRole || '',
        industry: contact.industry || '',
        experienceYears: contact.experienceYears || '',
        location: contact.location || '',
        resumePdf: contact.resumePdf || '',
        coverLetter: contact.coverLetter || '',
        coverLetterDescription: contact.coverLetterdescription || '',
        professionalTitle: contact.professionalTitle || '',
        bio: contact.bio || '',
        interviewFormatWeOffer: contact.InterviewFormatWeOffer || [],
        noShowPolicy: contact.NoShowPolicy || '',
        previousExperienceConductingInterviews: contact.PreviousExperienceConductingInterviews || '',
        previousExperienceConductingInterviewsYears: contact.PreviousExperienceConductingInterviewsYears || '',
        expertiseLevelConductingInterviews: contact.ExpertiseLevel_ConductingInterviews || '',
        technologies: contact.technologies || [],
        skills: contact.skills || [],
        timeZone: contact.timeZone || '',
        preferredDuration: contact.preferredDuration || '',
        availability: contact.availability || [],
        dateOfBirth: contact.dateOfBirth || '',
      };
    });

    res.status(200).json(combinedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



const getUniqueUserByOwnerId = async (req, res) => {
  try {
    const { ownerId } = req.params;

    if (!ownerId) {
      return res.status(400).json({ message: 'Invalid owner ID' });
    }

    // Fetch users with minimal fields

    // const users = await Users.findOne({ _id: ownerId }, '_id  label roleName status').lean();

    // Fetch user and populate role
    const users = await Users.findOne({ _id: ownerId })
      .populate({ path: 'roleId', select: '_id label roleName status' })
      .lean();


    // console.log("users -------------------", users);

//     const users = await Users.find({ tenantId })
//       .select('_id roleId label status profileId firstName lastName email newEmail')
//       .populate({
//         path: 'roleId',
//         select: 'label roleName',
//         model: 'Role',
//         options: { lean: true }
//       })
//       .lean()
//       .catch(err => {
//         console.error('Error populating roleId:', err);
//         return Users.find({ tenantId }).lean(); // fallback without population
//       });
//     console.log("users -------------------", users);


    if (!users) {
      return res.status(200).json({});
    }

    // Fetch contacts and roles in parallel
    // const [contact] = await Promise.all([
    //   Contacts.findOne({ ownerId: ownerId })
    //     .populate({ path: 'availability', model: 'Interviewavailability', select: 'day -_id timeSlots' })
    //     .lean(),
    // ]);
    const contact = await Contacts.findOne({ ownerId })
      .populate({
        path: 'availability',
        // model: 'InterviewAvailability',
         model: 'InterviewAvailability', // Make sure the casing is correct
    select: 'availability.day availability.timeSlots',
        // select: 'day timeSlots -_id',
        // select: 'availability',
        select: 'availability.day availability.timeSlots',
      })
      // .populate("availability")
      .lean();

      // console.log("contact contact",contact);
      


    // Combine user data, pulling most fields from Contacts
    const combinedUser = {
      _id: users._id,
      roleId: users?.roleId?._id || '' ,
      roleLabel: users?.roleId?.label || '',
      roleName: users?.roleId?.roleName || '',
      contactId: contact._id || '',
      firstName: contact.firstName || '',
      lastName: contact.lastName || '',
      email: contact.email || '',
      countryCode: contact.countryCode || '',
      gender: contact.gender || '',
      phone: contact.phone || '',
      imageData: contact.imageData || null,
      createdAt: users.createdAt || contact.createdAt,
      status: users.status || '',
      updatedAt: users.updatedAt || contact.updatedAt,
      profileId: contact.profileId || '',
      linkedinUrl: contact.linkedinUrl || '',
      portfolioUrl: contact.portfolioUrl || '',
      hourlyRate: contact.hourlyRate || '',
      currentRole: contact.currentRole || '',
      industry: contact.industry || '',
      experienceYears: contact.experienceYears || '',
      location: contact.location || '',
      resumePdf: contact.resumePdf || '',
      coverLetter: contact.coverLetter || '',
      coverLetterdescription: contact.coverLetterdescription || '',
      professionalTitle: contact.professionalTitle || '',
      bio: contact.bio || '',
      interviewFormatWeOffer: contact.InterviewFormatWeOffer || [],
      noShowPolicy: contact.NoShowPolicy || '',
      previousExperienceConductingInterviews: contact.PreviousExperienceConductingInterviews || '',
      previousExperienceConductingInterviewsYears: contact.PreviousExperienceConductingInterviewsYears || '',
      expertiseLevelConductingInterviews: contact.ExpertiseLevel_ConductingInterviews || '',
      technologies: contact.technologies || [],
      skills: contact.skills || [],
      timeZone: contact.timeZone || '',
      preferredDuration: contact.preferredDuration || '',
      availability: contact.availability || [],
      dateOfBirth: contact.dateOfBirth || '',

    };

    // console.log("combinedUser",combinedUser);


    res.status(200).json(combinedUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getUsers, UpdateUser, getInterviewers, getUsersByTenant,
  getUniqueUserByOwnerId
};