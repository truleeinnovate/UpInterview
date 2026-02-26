// v1.0.0  -  Ashraf  - fixed internal interviews getting issue
const { Users } = require("../models/Users");
const Role = require("../models/RolesData");
const { Contacts } = require("../models/Contacts");
const InterviewAvailability = require("../models/InterviewAvailability");
const mongoose = require("mongoose");
const { format, parse, parseISO } = require("date-fns");
const RolesPermissionObject = require("../models/rolesPermissionObject");
const { RoleMaster } = require("../models/MasterSchemas/RoleMaster");
const { handleApiError } = require("../utils/errorHandler");

// // Controller to fetch all users with populated tenantId
// const getUsers = async (req, res) => {
//     try {
//         const users = await Users.find().populate("tenantId"); // Populate tenantId with Organization data
//         res.status(200).json(users);
//     } catch (error) {
//         console.error("Error fetching users:", error);
//         res.status(500).json({ error: "Failed to fetch users" });
//     }
// };

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
  if (!time24) return "";

  try {
    let date;

    if (typeof time24 === "string") {
      if (time24.includes("T") && time24.includes("Z")) {
        date = parseISO(time24);
        if (isNaN(date)) {
          throw new Error(`Invalid ISO date: ${time24}`);
        }
      } else if (time24.match(/^\d{1,2}:\d{2}\s?(AM|PM)$/i)) {
        date = parse(time24, "h:mm a", new Date());
        if (isNaN(date)) {
          throw new Error(`Invalid 12-hour format: ${time24}`);
        }
      } else if (time24.match(/^\d{2}:\d{2}$/)) {
        date = parse(time24, "HH:mm", new Date());
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

    return format(date, "h:mm a");
  } catch (error) {
    console.error("Error converting time:", error.message);
    return time24 || "";
  }
};

const getInterviewers = async (req, res) => {
  try {
    const { tenantId } = req.params;

    // Validate tenantId
    if (!tenantId || tenantId === "undefined") {
      return res.status(400).json({ error: "Tenant ID is required" });
    }

    if (!mongoose.isValidObjectId(tenantId)) {
      return res.status(400).json({ error: "Invalid Tenant ID format" });
    }

    // Fetch external interviewers
    const externalUsers = await Users.find({ isFreelancer: true }).lean();
    // console.log('✅ [getInterviewers] External users fetched:', externalUsers.length);

    // <------------------------------- v1.0.0
    const internalRoles = await RolesPermissionObject.find({
      roleType: "organization",
      // tenantId,
    })
      .select("_id label")
      .lean();
    // ------------------------------ v1.0.0 >

    const internalRoleIds = internalRoles.map((role) => role._id.toString());

    // Fetch internal interviewers
    const internalUsers = await Users.find({
      roleId: internalRoleIds,
      // <------------------------------- v1.0.0
      tenantId,
      // ------------------------------ v1.0.0 >
    })
      .populate({ path: "roleId", select: "label roleName" })
      .lean();
    // console.log('✅ [getInterviewers] Internal users fetched:', internalUsers.length); //internal

    // Function to process users - modified to skip availability for internal users
    const processUsers = async (users, type) => {
      if (!users.length) return [];

      const userIds = users.map((user) => user._id);

      // Fetch contacts for all users
      const contacts = await Contacts.find({
        ownerId: { $in: userIds },
      }).lean();
      // console.log(`✅ [getInterviewers] ${type} contacts fetched:`, contacts.length);

      if (type === "internal") {
        // For internal users, just return the contact info without availability
        return contacts.map((contact) => {
          const user =
            users.find(
              (u) => u._id.toString() === contact.ownerId?.toString()
            ) || {};
          return {
            _id: contact._id,
            contact: {
              ...contact,
              ownerId: user._id,
              email: user.email,
              isFreelancer: "false",
            },

            roleLabel: user?.roleId?.label || "",
            roleName: user?.roleId?.roleName || "",

            type: "internal",

            days: [],
            nextAvailable: null,
            __v: 0,
          };
        });
      }

      // For external users, include availability
      const contactIds = contacts.map((contact) => contact._id);
      const availabilities = await InterviewAvailability.find({
        contact: { $in: contactIds },
      })
        .populate("contact")
        .lean();

      // Fetch all roles (used to map currentRole → role data)
      const roleMasters = await RoleMaster.find({})
        .select("roleName roleLabel roleCategory")
        .lean();

      return availabilities.map((availability) => {
        const contact = availability.contact || {};
        const ownerId = contact.ownerId?.toString();
        const user = users.find((u) => u._id.toString() === ownerId) || {};

        // const role = roleMasters
        //   .find({
        //     roleName: contact?.currentRole,
        //   })
        //   .lean();

        // Find role using contact.currentRole
        const matchedRole =
          roleMasters.find(
            (r) => r.roleName === contact.currentRole
            // ||
            //   r.roleLabel === contact.currentRole
          ) || {};

        // Get the first available time slot for nextAvailable
        let nextAvailable = null;
        const daysWithSlots = [];

        // Process each day's availability
        if (
          availability.availability &&
          Array.isArray(availability.availability)
        ) {
          availability.availability.forEach((dayData) => {
            if (dayData.timeSlots && dayData.timeSlots.length > 0) {
              // Add to days array
              daysWithSlots.push({
                day: dayData.day,
                timeSlots: dayData.timeSlots.map((slot) => ({
                  startTime: convertTo12HourFormat(slot.startTime),
                  endTime: convertTo12HourFormat(slot.endTime),
                })),
              });

              // Set nextAvailable to the first available slot if not set
              if (!nextAvailable && dayData.timeSlots[0]) {
                nextAvailable = {
                  day: dayData.day,
                  startTime: convertTo12HourFormat(
                    dayData.timeSlots[0].startTime
                  ),
                  endTime: convertTo12HourFormat(dayData.timeSlots[0].endTime),
                };
              }
            }
          });
        }

        return {
          _id: availability._id,
          contact: {
            ...contact,
            // 🔽 role data from RoleMaster
            // roleName: matchedRole.roleName || "",
            roleLabel: matchedRole.roleLabel || "",
            ownerId: user._id,
            email: user.email,
            isFreelancer: "true",
          },
          type: "external",
          days: daysWithSlots,
          nextAvailable: nextAvailable,
          __v: availability.__v,
        };
      });
    };

    // Process both internal and external users in parallel
    const [internalResults, externalResults] = await Promise.all([
      processUsers(internalUsers, "internal"),
      processUsers(externalUsers, "external"),
    ]);

    // Combine results
    const allResults = [...internalResults, ...externalResults];

    return res.json({
      success: true,
      data: allResults,
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
    console.error(
      "❌ [getInterviewers] Error fetching interviewers:",
      error.message,
      error.stack
    );
    return handleApiError(res, error, "Login User");
  }
};

// PATCH /api/users/:id/status
const UpdateUser = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = "Update User Status";

  try {
    const userId = req.params.id;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value." });
    }

    const updatedUser = await Users.findByIdAndUpdate(
      userId,
      { status, modifiedBy: req.body.modifiedBy || "system" },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found." });
    }

    res.locals.logData = {
      tenantId: updatedUser.tenantId || req.body?.tenantId || "",
      ownerId: updatedUser._id?.toString() || req.body?.ownerId || "",
      processName: "Update User Status",
      requestBody: req.body,
      status: "success",
      message: `User status updated to ${status}`,
      responseBody: updatedUser,
    };

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating status:", error);

    res.locals.logData = {
      tenantId: req.body?.tenantId || "",
      ownerId: req.params?.id || req.body?.ownerId || "",
      processName: "Update User Status",
      requestBody: req.body,
      status: "error",
      message: error.message,
    };

    return handleApiError(res, error, "Update User");
  }
};

// const getSuperAdminUsers = async (req, res) => {
//   try {
//     const internalRoles = await RolesPermissionObject.find({
//       roleType: "internal",
//     })
//       .lean()
//       .select("_id label roleName roleType");

//     // Extract role IDs as both ObjectId and string for flexibility
//     const roleIds = internalRoles.map((role) => role._id);
//     const roleIdStrings = roleIds.map((id) => id.toString());
//     if (roleIds.length === 0) {
//       return res.status(200).json([]);
//     }

//     // Step 2: Fetch users with roleId in the list (try both ObjectId and string)
//     const superAdminUsers = await Users.find({
//       $or: [
//         { roleId: { $in: roleIds } }, // Match ObjectId
//         { roleId: { $in: roleIdStrings } }, // Match string
//       ],
//     })
//       .lean()
//       .select("firstName lastName email phone status roleId imageData gender");

//     // Step 3: Map users to include role label and roleName
//     const filteredUsers = superAdminUsers
//       .map((user) => {
//         // Find the corresponding role for this user
//         const roleIdStr = user.roleId ? user.roleId.toString() : null;
//         const role = internalRoles.find((r) => r._id.toString() === roleIdStr);
//         if (!role) {
//           return null;
//         }
//         const enrichedUser = {
//           ...user,
//           label: role.label || "Unknown",
//           roleName: role.roleName || "Unknown",
//         };
//         return enrichedUser;
//       })
//       .filter((user) => user !== null); // Remove users with no matching role
//     res.status(200).json(filteredUsers);
//   } catch (error) {
//     console.error("Error in getSuperAdminUsers:", {
//       message: error.message,
//       stack: error.stack,
//       errorDetails: error,
//     });
//     res.status(500).json({
//       message: "Server error while fetching super admin users",
//       error: error.message,
//     });
//   }
// };

// const getSuperAdminUsers = async (req, res) => {
//   try {
//     const { search = "", role = "", page = 0, limit = 10 } = req.query;

//     const internalRoles = await RolesPermissionObject.find({
//       roleType: "internal",
//     })
//       .lean()
//       .select("_id label roleName roleType");

//     //       const superAdminUsers = await Users.find({
//     //   $or: [
//     //     { roleId: { $in: roleIds } }, // Match ObjectId
//     //     { roleId: { $in: roleIdStrings } }, // Match string
//     //   ],
//     // })
//     //   .lean()
//     //   .select("firstName lastName email phone status roleId imageData gender");

//     // Extract role IDs as both ObjectId and string for flexibility
//     const roleIds = internalRoles.map((role) => role._id);
//     const roleIdStrings = roleIds.map((id) => id.toString());

//     if (roleIds.length === 0) {
//       return res.status(200).json({
//         users: [],
//         pagination: {
//           totalCount: 0,
//           totalPages: 0,
//           currentPage: parseInt(page),
//           hasNext: false,
//           hasPrev: false,
//         },
//       });
//     }

//     // Build query
//     let query = {
//       $or: [{ roleId: { $in: roleIds } }, { roleId: { $in: roleIdStrings } }],
//     };

//     // Add search filter
//     if (search) {
//       const searchRegex = new RegExp(search, "i");
//       query.$and = [
//         {
//           $or: [
//             { firstName: searchRegex },
//             { lastName: searchRegex },
//             { email: searchRegex },
//             { phone: searchRegex },
//           ],
//         },
//       ];
//     }

//     // Add role filter
//     if (role) {
//       const roleLabels = role.split(",");
//       const filteredRoles = internalRoles.filter((r) =>
//         roleLabels.includes(r.label)
//       );
//       const filteredRoleIds = filteredRoles.map((r) => r._id);
//       const filteredRoleIdStrings = filteredRoleIds.map((id) => id.toString());

//       query.$or = [
//         { roleId: { $in: filteredRoleIds } },
//         { roleId: { $in: filteredRoleIdStrings } },
//       ];
//     }

//     // Calculate pagination
//     const pageNum = Math.max(1, parseInt(page) || 1);
//     const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
//     const skip = (pageNum - 1) * limitNum;

//     // Get total count for pagination
//     const totalCount = await Users.countDocuments(query);

//     // Fetch users with pagination
//     const superAdminUsers = await Users.find(query)
//       .sort({ _id: -1 }) // Sort by newest first instead of client-side reverse
//       .skip(skip)
//       .limit(limitNum)
//       .lean()
//       .select(
//         "firstName lastName email phone status roleId imageData gender createdAt"
//       );

//     // Map users to include role label and roleName
//     const filteredUsers = superAdminUsers
//       .map((user) => {
//         const roleIdStr = user.roleId ? user.roleId.toString() : null;
//         const role = internalRoles.find((r) => r._id.toString() === roleIdStr);
//         if (!role) {
//           return null;
//         }
//         const enrichedUser = {
//           ...user,
//           label: role.label || "Unknown",
//           roleName: role.roleName || "Unknown",
//         };
//         return enrichedUser;
//       })
//       .filter((user) => user !== null);

//     // Calculate pagination info
//     const totalPages = Math.ceil(totalCount / limitNum);

//     res.status(200).json({
//       users: filteredUsers,
//       pagination: {
//         totalCount,
//         totalPages,
//         currentPage: pageNum,
//         hasNext: pageNum < totalPages,
//         hasPrev: pageNum > 1,
//       },
//     });
//   } catch (error) {
//     console.error("Error in getSuperAdminUsers:", {
//       message: error.message,
//       stack: error.stack,
//       errorDetails: error,
//     });
//     res.status(500).json({
//       message: "Server error while fetching super admin users",
//       error: error.message,
//     });
//   }
// };

const getSuperAdminUsers = async (req, res) => {
  try {
    const { search = "", role = "", page = 1, limit = 10 } = req.query;

    // ------------------------------------------------------------
    // 1. GET INTERNAL ROLES
    // ------------------------------------------------------------
    const internalRoles = await RolesPermissionObject.find({
      roleType: "internal",
    })
      .lean()
      .select("_id label roleName roleType");

    if (!internalRoles.length) {
      return res.status(200).json({
        users: [],
        pagination: {
          totalCount: 0,
          totalPages: 0,
          currentPage: parseInt(page),
          hasNext: false,
          hasPrev: false,
        },
      });
    }

    const roleIds = internalRoles.map((r) => r._id.toString());

    // ------------------------------------------------------------
    // 2. BUILD USER QUERY
    // ------------------------------------------------------------
    let query = {
      roleId: { $in: roleIds },
    };

    // SEARCH FILTER
    if (search) {
      const searchRegex = new RegExp(search, "i");
      query.$and = [
        {
          $or: [
            { firstName: searchRegex },
            { lastName: searchRegex },
            { email: searchRegex },
          ],
        },
      ];
    }

    // ROLE FILTER
    if (role) {
      const labels = role.split(",");
      const selectedRoleIds = internalRoles
        .filter((r) => labels.includes(r.label))
        .map((r) => r._id.toString());

      query.roleId = { $in: selectedRoleIds };
    }

    // ------------------------------------------------------------
    // 3. PAGINATION
    // ------------------------------------------------------------
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const totalCount = await Users.countDocuments(query);

    // ------------------------------------------------------------
    // 4. FETCH USERS
    // ------------------------------------------------------------
    const users = await Users.find(query)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean()
      .select("firstName lastName email status roleId profileId createdAt");

    // const profileIds = users.map((u) => u.profileId).filter(Boolean);
    const userIds = users.map((u) => u._id.toString());

    // ------------------------------------------------------------
    // 5. FETCH CONTACT DATA
    // ------------------------------------------------------------
    const contacts = await Contacts.find({
      ownerId: { $in: userIds },
    })
      .lean()
      .select(
        "ownerId profileId phone countryCode gender imageData linkedinUrl portfolioUrl " +
        "location introduction professionalTitle bio roleId"
      );

    // MAP CONTACT INFO BY OWNER ID (align with getUniqueUserByOwnerId)
    const contactMap = {};
    contacts.forEach((c) => {
      contactMap[c.ownerId?.toString()] = c;
    });

    // ------------------------------------------------------------
    // 6. MERGE USER + CONTACT + ROLE DETAILS
    // ------------------------------------------------------------
    const finalUsers = users.map((user) => {
      const contact = contactMap[user._id.toString()] || {};

      // role priority:
      // → If contact has roleId → use that
      // → else use user.roleId
      const finalRoleId = contact.roleId
        ? contact.roleId.toString()
        : user.roleId?.toString();

      const roleDetails = internalRoles.find(
        (r) => r._id.toString() === finalRoleId
      );

      return {
        ...user,

        // CONTACT FIELDS
        phone: contact.phone || "",
        countryCode: contact.countryCode || "",
        gender: contact.gender || "",
        imageData: contact.imageData || null,
        linkedinUrl: contact.linkedinUrl || "",
        portfolioUrl: contact.portfolioUrl || "",
        location: contact.location || "",
        introduction: contact.introduction || "",
        professionalTitle: contact.professionalTitle || "",
        bio: contact.bio || "",

        // ROLE FIELDS
        roleId: finalRoleId,
        label: roleDetails ? roleDetails.label : "Unknown",
        roleName: roleDetails ? roleDetails.roleName : "Unknown",
      };
    });

    const totalPages = Math.ceil(totalCount / limitNum);

    // ------------------------------------------------------------
    // 7. SEND RESPONSE
    // ------------------------------------------------------------
    return res.status(200).json({
      users: finalUsers,
      pagination: {
        totalCount,
        totalPages,
        currentPage: pageNum,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    return handleApiError(res, error, "Fetch Super Admin Users");
  }
};

// const getUsersByTenant = async (req, res) => {
//     try {
//         const { tenantId } = req.params;

//         // Validate tenantId
//         if (!mongoose.Types.ObjectId.isValid(tenantId)) {
//             return res.status(400).json({ message: 'Invalid tenantId format' });
//         }

//         // const users = await Users.find({ tenantId })
//         // .populate({ path: 'roleId', select: '_id label roleName status' })
//         // .lean();

//         const users = await Users.find({ tenantId })
//             .populate({
//                 path: 'roleId',
//                 select: '_id label roleName status' // Only fetch needed fields
//             })
//             .lean();

//         if (!users || users.length === 0) {
//             return res.status(200).json([]);
//         }

//         const [contacts, roles] = await Promise.all([
//             Contacts.find({ tenantId }).lean(),
//             Role.find({ tenantId }).lean(), // ✅ Fix: using correct field
//         ]);

//         const roleMap = roles.reduce((acc, role) => {
//             acc[role._id.toString()] = role;
//             return acc;
//         }, {});

//         const contactMap = contacts.reduce((acc, contact) => {
//             if (contact.ownerId) {
//                 acc[contact.ownerId.toString()] = contact;
//             }
//             return acc;
//         }, {});

//         const combinedUsers = users.map((user) => {
//             const contact = contactMap[user._id.toString()] || {};
//             // const role = user.roleId ? roleMap[user.roleId] : {};
//             const role = user.roleId || {};
//             // console.log("user",role);

//             return {
//                 _id: user._id,
//                 contactId: contact._id || '',
//                 isEmailVerified: user.isEmailVerified || false,
//                 firstName: contact.firstName || '',
//                 lastName: contact.lastName || '',
//                 email: user.email || '',
//                 newEmail: user.newEmail || '',
//                 countryCode: contact.countryCode || '',
//                 gender: contact.gender || '',
//                 phone: contact.phone || '',
//                 status: user.status || '',
//                 // <<<<<<< Ranjith
//                 yearsOfExperience: contact?.yearsOfExperience || '',
//                 roleId: role?._id || '',
//                 roleName: role?.roleName || '',
//                 label: role?.label || '',
//                 imageData: contact.imageData || null,
//                 createdAt: user.createdAt || contact.createdAt,
//                 status: user.status || "",
//                 updatedAt: user.updatedAt || contact.updatedAt,
//                 profileId: contact.profileId || "",
//                 linkedinUrl: contact.linkedinUrl || "",
//                 portfolioUrl: contact.portfolioUrl || "",
//                 currentRole: contact.currentRole || "",
//                 industry: contact.industry || "",
//                 experienceYears: contact.experienceYears || "",
//                 location: contact.location || "",
//                 resumePdf: contact.resumePdf || "",
//                 coverLetter: contact.coverLetter || "",
//                 professionalTitle: contact.professionalTitle || "",
//                 bio: contact.bio || "",
//                 interviewFormatWeOffer: contact.InterviewFormatWeOffer || [],
//                 previousExperienceConductingInterviews:
//                     contact.PreviousExperienceConductingInterviews || "",
//                 previousExperienceConductingInterviewsYears:
//                     contact.PreviousExperienceConductingInterviewsYears || "",
//                 technologies: contact.technologies || [],
//                 skills: contact.skills || [],
//                 timeZone: contact.timeZone || "",
//                 preferredDuration: contact.preferredDuration || "",
//                 availability: contact.availability || [],
//                 dateOfBirth: contact.dateOfBirth || "",
//             };
//         });

//         res.status(200).json(combinedUsers);
//     } catch (error) {
//         console.error("Error fetching users:", error);
//         res.status(500).json({ message: "Internal server error" });
//     }
// };

const getUsersByTenant = async (req, res) => {
  try {
    const { tenantId } = req.params;

    // Validate tenantId
    if (!mongoose.Types.ObjectId.isValid(tenantId)) {
      return res.status(400).json({ message: "Invalid tenantId format" });
    }

    const {
      page = 1,
      limit = 10,
      search = "",
      role = "",
      status = "",
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    // Build base query
    let baseQuery = { tenantId: new mongoose.Types.ObjectId(tenantId) };

    // Get users with population
    let usersQuery = Users.find(baseQuery)
      .populate({
        path: "roleId",
        select: "_id label roleName status",
      })
      .lean();

    // Execute base query to get all users for this tenant
    const allUsers = await usersQuery;

    if (!allUsers || allUsers.length === 0) {
      return res.status(200).json({
        users: [],
        pagination: {
          currentPage: pageNum,
          totalPages: 0,
          totalUsers: 0,
          hasNext: false,
          hasPrev: false,
          limit: limitNum,
        },
      });
    }

    // Get contacts and roles
    const [contacts, roles] = await Promise.all([
      Contacts.find({ tenantId }).lean(),
      Role.find({ tenantId }).lean(),
    ]);

    // Create maps
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

    // Combine users with contacts and roles (like your previous API)
    let combinedUsers = allUsers.map((user) => {
      const contact = contactMap[user._id.toString()] || {};
      const role = user.roleId || {};

      return {
        _id: user._id,
        contactId: contact._id || "",
        isEmailVerified: user.isEmailVerified || false,
        firstName: contact.firstName || "",
        lastName: contact.lastName || "",
        email: user.email || "",
        newEmail: user.newEmail || "",
        countryCode: contact.countryCode || "",
        gender: contact.gender || "",
        phone: contact.phone || "",
        status: user.status || "",
        yearsOfExperience: contact?.yearsOfExperience || "",
        roleId: role?._id || "",
        roleName: role?.roleName || "",
        label: role?.label || "",
        imageData: contact.imageData || null,
        createdAt: user.createdAt || contact.createdAt,
        updatedAt: user.updatedAt || contact.updatedAt,
        profileId: contact.profileId || "",
        linkedinUrl: contact.linkedinUrl || "",
        portfolioUrl: contact.portfolioUrl || "",
        currentRole: contact.currentRole || "",
        industry: contact.industry || "",
        experienceYears: contact.experienceYears || "",
        location: contact.location || "",
        resumePdf: contact.resumePdf || "",
        coverLetter: contact.coverLetter || "",
        professionalTitle: contact.professionalTitle || "",
        bio: contact.bio || "",
        interviewFormatWeOffer: contact.InterviewFormatWeOffer || [],
        previousExperienceConductingInterviews:
          contact.PreviousExperienceConductingInterviews || "",
        previousExperienceConductingInterviewsYears:
          contact.PreviousExperienceConductingInterviewsYears || "",
        // technologies: contact.technologies || [],
        skills: contact.skills || [],
        timeZone: contact.timeZone || "",
        preferredDuration: contact.preferredDuration || "",
        availability: contact.availability || [],
        dateOfBirth: contact.dateOfBirth || "",
      };
    });

    // Apply search filter
    if (search.trim()) {
      const searchLower = search.trim().toLowerCase();
      combinedUsers = combinedUsers.filter((user) => {
        const searchFields = [
          user.firstName,
          user.lastName,
          user.email,
          user.phone,
          user.label,
          user.roleName,
        ].filter((field) => field !== null && field !== undefined);

        return searchFields.some((field) =>
          field.toString().toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply role filter
    if (role) {
      const rolesFilter = role
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean);
      if (rolesFilter.length > 0) {
        combinedUsers = combinedUsers.filter((user) =>
          rolesFilter.includes(user.label)
        );
      }
    }

    // Apply status filter
    if (status) {
      combinedUsers = combinedUsers.filter((user) => user.status === status);
    }

    // Apply sorting
    combinedUsers.sort((a, b) => {
      const aValue = a[sortBy] || "";
      const bValue = b[sortBy] || "";

      if (sortOrder === "desc") {
        return bValue.toString().localeCompare(aValue.toString());
      } else {
        return aValue.toString().localeCompare(bValue.toString());
      }
    });

    // Get total count after filtering
    const totalCount = combinedUsers.length;

    // Apply pagination
    const paginatedUsers = combinedUsers.slice(skip, skip + limitNum);

    res.status(200).json({
      users: paginatedUsers,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalUsers: totalCount,
        hasNext: pageNum < Math.ceil(totalCount / limitNum),
        hasPrev: pageNum > 1,
        limit: limitNum,
      },
    });
  } catch (error) {
    return handleApiError(res, error, "Fetch Users");
  }
};
const getUniqueUserByOwnerId = async (req, res) => {
  try {
    const { ownerId } = req.params;

    if (!ownerId || ownerId === "undefined") {
      return res.status(400).json({ message: "Invalid owner ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(400).json({ message: "Invalid ObjectId format" });
    }

    // Fetch user and populate role
    const users = await Users.findOne({ _id: ownerId })
      .populate({ path: "roleId", select: "_id label roleName status" })
      .populate({
        path: "tenantId",
        select: "company industry jobTitle location status type",
      })
      .lean();

    // Fetch user and populate availability (use latest contact by _id)
    const contact = await Contacts.findOne({ ownerId })
      .sort({ _id: -1 })
      .populate({
        path: "availability",
        // model: 'InterviewAvailability',
        model: "InterviewAvailability", // Make sure the casing is correct
        select: "availability.day availability.timeSlots _id",
        // select: 'day timeSlots -_id',
        // select: 'availability',
        select: "availability.day availability.timeSlots",
      })
      // .populate("availability")
      .lean();

    const role = await RoleMaster.findOne({
      roleName: contact.currentRole,
    }).lean();
    // console.log("role", role);

    // Combine user data, pulling most fields from Contacts
    const combinedUser = {
      _id: users._id,
      roleId: users?.roleId?._id || "",
      roleLabel: users?.roleId?.label || "",
      roleName: users?.roleId?.roleName || "",
      contactId: contact._id || "",
      yearsOfExperience: contact?.yearsOfExperience || "",
      firstName: contact.firstName || "",
      lastName: contact.lastName || "",
      email: users.email || "",
      newEmail: users.newEmail || "",
      isEmailVerified: users.isEmailVerified || false,
      countryCode: contact.countryCode || "",
      gender: contact.gender || "",
      phone: contact.phone || "",
      imageData: contact.imageData || null,
      createdAt: users.createdAt || contact.createdAt,
      status: users.status || "",
      updatedAt: users.updatedAt || contact.updatedAt,
      profileId: contact.profileId || "",
      linkedinUrl: contact.linkedinUrl || "",
      portfolioUrl: contact.portfolioUrl || "",
      currentRole: contact.currentRole || "",
      currentRoleLabel: role?.roleLabel || "",
      industry: contact.industry || "",
      company: contact.company || "",
      experienceYears: contact.experienceYears || "",
      location: contact.location || "",
      universityCollege: contact.universityCollege || "",
      higherQualification: contact.higherQualification || "",
      resume: contact.resume || "",
      coverLetter: contact.coverLetter || "",
      professionalTitle: contact.professionalTitle || "",
      bio: contact.bio || "",
      interviewFormatWeOffer: contact.InterviewFormatWeOffer || [],
      previousExperienceConductingInterviews:
        contact.PreviousExperienceConductingInterviews || "",
      previousExperienceConductingInterviewsYears:
        contact.PreviousExperienceConductingInterviewsYears || "",
      // technologies: contact.technologies || [],
      skills: contact.skills || [],
      timeZone: contact.timeZone || "",
      preferredDuration: contact.preferredDuration || "",
      availability: contact.availability || [],
      dateOfBirth: contact.dateOfBirth || "",
      mock_interview_discount: contact.mock_interview_discount || "",
      isMockInterviewSelected: contact.isMockInterviewSelected || false,
      rates: contact.rates || null,
    };

    res.status(200).json(combinedUser);
  } catch (error) {
    return handleApiError(res, error, "Get User By Id");
  }
};

// SUPER ADMIN added by Ashok ---------------------------------->
const getPlatformUsers = async (req, res) => {
  try {
    const now = new Date();

    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Get total user count
    const totalUsers = await Users.countDocuments();

    // Count new users this month
    const usersThisMonth = await Users.countDocuments({
      createdAt: { $gte: startOfCurrentMonth },
    });

    // Count new users last month
    const usersLastMonth = await Users.countDocuments({
      createdAt: { $gte: startOfLastMonth, $lt: startOfCurrentMonth },
    });

    // Calculate trend
    let trend = "neutral";
    let trendValue = "0%";

    if (usersLastMonth > 0) {
      const change = ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100;
      trend = change > 0 ? "up" : change < 0 ? "down" : "neutral";
      trendValue = `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`;
    } else if (usersThisMonth > 0) {
      trend = "up";
      trendValue = "+100%";
    }

    // Send response
    res.status(200).json({
      metric: {
        title: "Platform Users",
        value: totalUsers.toLocaleString(),
        description: "Total registered users",
        trend,
        trendValue,
      },
    });
  } catch (error) {
    return handleApiError(res, error, "Fetch Platform Users");
  }
};
// ------------------------------------------------------------->

module.exports = {
  // getUsers,
  UpdateUser,
  getInterviewers,
  getUsersByTenant,
  getUniqueUserByOwnerId,
  getPlatformUsers,
  getSuperAdminUsers,
};
