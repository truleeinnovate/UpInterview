// v1.0.0 - Ashok - To handle bulk imports like .csv file improved careteMaster controller
// v1.0.1 - Ashok - Removed get masters controller which is not in use
// v1.0.2 - Ashok - Removed tenantId from create master

const { Industry } = require("../../models/MasterSchemas/industries");
const { LocationMaster } = require("../../models/MasterSchemas/LocationMaster");
const { RoleMaster } = require("../../models/MasterSchemas/RoleMaster");
const { Skills } = require("../../models/MasterSchemas/skills");
const {
  TechnologyMaster,
} = require("../../models/MasterSchemas/TechnologyMaster");
const {
  HigherQualification,
} = require("../../models/MasterSchemas/higherqualification");
const {
  University_CollegeName,
} = require("../../models/MasterSchemas/college");
const { Company } = require("../../models/MasterSchemas/company");
const {
  CategoryQuestionsMaster,
} = require("../../models/MasterSchemas/CategoryQuestionsMaster");

// Map string type → Model
const getModel = (type) => {
  switch (type) {
    case "industries":
      return Industry;
    case "universitycollege":
      return University_CollegeName;
    case "company":
      return Company;
    case "category":
      return CategoryQuestionsMaster;
    case "qualification":
      return HigherQualification;
    case "locations":
      return LocationMaster;
    case "roles":
      return RoleMaster;
    case "skills":
      return Skills;
    case "technology":
      return TechnologyMaster;
    default:
      throw new Error("Invalid master type");
  }
};

// v1.0.0 <-----------------------------------------------------------

// v1.0.1 <---------------------------------------------------------------------
// v1.0.2 <--------------------------------------------------------------------------------
// ✅ CREATE (supports single + bulk via CSV)
// const createMaster = async (req, res) => {
//   try {
//     const { type } = req.params;
//     const Model = getModel(type);

//     let result;
//     if (Array.isArray(req.body)) {
//       // Bulk insert (CSV upload)
//       result = await Model.insertMany(req.body, { ordered: false });

//         // Feed data for bulk creation
//         res.locals.feedData = {
//           tenantId: req.body[0]?.tenantId || null,
//           feedType: 'bulk_create',
//           action: {
//             name: 'master_bulk_created',
//             description: `${result.length} ${type} records created via bulk upload`,
//           },
//           ownerId: req.body[0]?.ownerId || null,
//           parentId: null,
//           parentObject: 'MasterData',
//           metadata: {
//             type: type,
//             count: result.length,
//             isBulk: true
//           },
//           severity: res.statusCode >= 500 ? 'high' : 'low',
//           fieldMessage: [{
//             fieldName: 'bulk_upload',
//             message: `Bulk upload of ${result.length} ${type} records completed successfully`
//           }],
//           history: [{
//             fieldName: 'bulk_creation',
//             oldValue: null,
//             newValue: `${result.length} ${type} records created`
//           }]
//         };

//     } else {
//       // Single insert
//       const newDoc = new Model(req.body);
//       result = await newDoc.save();
//       console.log("result",result);

//        // Feed data for single creation
//       let r = res.locals.feedData = {
//         tenantId: req.body?.tenantId || null,
//         feedType: 'info',
//         action: {
//           name: `${type}_created`,
//           description: `${type} was created`,
//         },
//         ownerId: req.body?.ownerId || null,
//         parentId: result._id,
//         parentObject: 'MasterData',
//         metadata:req.body,
//         severity: res.statusCode >= 500 ? 'high' : 'low',
//         message: `${type} was created successfully`,
//         // history: [{
//         //   fieldName: 'creation',
//         //   oldValue: null,
//         //   newValue: result
//         // }]
//       };
//       console.log("result",r);

//     }

//     res.status(201).json(result);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

const createMaster = async (req, res) => {
  try {
    const { type } = req.params;
    const Model = getModel(type);

    let result;
    if (Array.isArray(req.body)) {
      // Add createdBy = ownerId for each object in bulk insert
      const bulkData = req.body.map((item) => ({
        ...item,
        createdBy: item.ownerId || null,
        updatedBy: item.ownerId || null,
      }));

      // Bulk insert (CSV upload)
      result = await Model.insertMany(bulkData, { ordered: false });

      // Feed data for bulk creation
      // res.locals.feedData = {
      //   feedType: "bulk_create",
      //   action: {
      //     name: "master_bulk_created",
      //     description: `${result.length} ${type} records created via bulk upload`,
      //   },
      //   ownerId: req.body[0]?.ownerId || null,
      //   parentId: null,
      //   parentObject: "MasterData",
      //   metadata: {
      //     type: type,
      //     count: result.length,
      //     isBulk: true,
      //   },
      //   severity: res.statusCode >= 500 ? "high" : "low",
      //   fieldMessage: [
      //     {
      //       fieldName: "bulk_upload",
      //       message: `Bulk upload of ${result.length} ${type} records completed successfully`,
      //     },
      //   ],
      //   history: [
      //     {
      //       fieldName: "bulk_creation",
      //       oldValue: null,
      //       newValue: `${result.length} ${type} records created`,
      //     },
      //   ],
      // };
    } else {
      // Single insert
      const data = {
        ...req.body,
        createdBy: req.body?.ownerId || null,
        updatedBy: req.body?.ownerId || null,
      };

      const newDoc = new Model(data);
      result = await newDoc.save();

      // Feed data for single creation
      // res.locals.feedData = {
      //   feedType: "info",
      //   action: {
      //     name: `${type}_created`,
      //     description: `${type} was created`,
      //   },
      //   ownerId: req.body?.ownerId || null,
      //   parentId: result._id,
      //   parentObject: "MasterData",
      //   metadata: data,
      //   severity: res.statusCode >= 500 ? "high" : "low",
      //   message: `${type} was created successfully`,
      // };
    }

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
// v1.0.2 -------------------------------------------------------------------------------->
// v1.0.1 --------------------------------------------------------------------->
// v1.0.0 ----------------------------------------------------------->

// ✅ READ (One)
const getMasterById = async (req, res) => {
  try {
    const { type, id } = req.params;

    const Model = getModel(type);

    const doc = await Model.findById(id);
    if (!doc) return res.status(404).json({ error: "Not found" });

    res.json(doc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// MASTER ROUTE: GET /master-data/:type
// Supports: search, pagination, filtering, sorting + FULL POPULATION
const getAllMasters = async (req, res) => {
  try {
    const { type } = req.params;

    const {
      page = 1,
      limit = 10,
      search = "",
      status, // for category (isActive) or others with status field
      sortBy = "createdAt",
      sortOrder = "desc",
      pageType,
    } = req.query;

    if (pageType !== "adminPortal") {
      const Model = getModel(type);
      if (!Model) {
        return res.status(400).json({ error: "Invalid master type" });
      }

      // Build dynamic search across relevant fields
      const searchQuery = search
        ? {
            $or: [
              { name: { $regex: search, $options: "i" } },
              { IndustryName: { $regex: search, $options: "i" } },
              { TechnologyMasterName: { $regex: search, $options: "i" } },
              { SkillName: { $regex: search, $options: "i" } },
              { LocationName: { $regex: search, $options: "i" } },
              { RoleName: { $regex: search, $options: "i" } },
              { QualificationName: { $regex: search, $options: "i" } },
              { University_CollegeName: { $regex: search, $options: "i" } },
              { CompanyName: { $regex: search, $options: "i" } },
              { CategoryName: { $regex: search, $options: "i" } },
              { Category: { $regex: search, $options: "i" } }, // for technology
            ].filter(Boolean),
          }
        : {};

      // Handle status filter (especially for category → isActive)
      const filterQuery = {};
      if (status) {
        const statuses = status.split(",").map((s) => s.trim().toLowerCase());
        if (path === "category") {
          filterQuery.isActive = {
            $in: statuses.map((s) => s === "active" || s === "true"),
          };
        } else if (Model.schema.path("status")) {
          filterQuery.status = { $in: statuses };
        }
      }

      const finalQuery = { ...searchQuery, ...filterQuery };

      // Count total matching documents
      const total = await Model.countDocuments(finalQuery);

      // Fetch with population + pagination + sorting
      const data = await Model.find(finalQuery)
        .populate("ownerId", "firstName lastName email -password")
        .populate("createdBy", "firstName lastName email -password")
        .populate("updatedBy", "firstName lastName email -password")
        .sort({ [sortBy]: sortOrder === "desc" ? -1 : 1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .lean();

      res.json({
        data,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit) || 1,
          totalItems: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
          limit: parseInt(limit),
        },
      });
    } else {
      const Model = await getModel(type)
        .find({})
        .populate("ownerId", "firstName lastName email -password")
        .populate("createdBy", "firstName lastName email -password")
        .populate("updatedBy", "firstName lastName email -password")
        .lean();
      res.json(Model);
    }
  } catch (error) {
    console.error(`Error fetching ${req.params.type}:`, error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ UPDATE
const updateMaster = async (req, res) => {
  try {
    const { type, id } = req.params;
    const Model = getModel(type);

    // v1.0.1 <---------------------------------------------
    const updateData = {
      ...req.body,
      updatedBy: req.body?.ownerId || null,
    };

    const updated = await Model.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
    // v1.0.1 --------------------------------------------->

    if (!updated) return res.status(404).json({ error: "Not found" });

    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// ✅ DELETE
const deleteMaster = async (req, res) => {
  try {
    const { type, id } = req.params;
    const Model = getModel(type);

    const deleted = await Model.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Not found" });

    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createMaster,
  getMasterById,
  getAllMasters,
  updateMaster,
  deleteMaster,
};
