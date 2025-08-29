// v1.0.0 - Ashok - To handle bulk imports like .csv file improved careteMaster controller
const { Industry } = require("../../models/MasterSchemas/industries");
const { LocationMaster } = require("../../models/MasterSchemas/LocationMaster");
const { RoleMaster } = require("../../models/MasterSchemas/RoleMaster");
const { Skills } = require("../../models/MasterSchemas/skills");
const {
  TechnologyMaster,
} = require("../../models/MasterSchemas/TechnologyMaster");
const { HigherQualification } = require("../../models/MasterSchemas/higherqualification");
const { University_CollegeName } = require("../../models/MasterSchemas/college");
const { Company } = require("../../models/MasterSchemas/company");

// Map string type → Model
const getModel = (type) => {
  switch (type) {
    case "industries":
      return Industry;
    case "universitycollege":
      return University_CollegeName;
    case "company":
      return Company;
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
// ✅ CREATE
// const createMaster = async (req, res) => {
//   try {
//     const { type } = req.params;
//     const Model = getModel(type);

//     const newDoc = new Model(req.body);
//     await newDoc.save();

//     res.status(201).json(newDoc);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// ✅ CREATE (supports single + bulk via CSV)
const createMaster = async (req, res) => {
  try {
    const { type } = req.params;
    const Model = getModel(type);

    let result;

    if (Array.isArray(req.body)) {
      // Bulk insert (CSV upload)
      result = await Model.insertMany(req.body, { ordered: false });
    } else {
      // Single insert
      const newDoc = new Model(req.body);
      result = await newDoc.save();
    }

    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// v1.0.0 ----------------------------------------------------------->

// ✅ READ (All)
const getMasters = async (req, res) => {
  try {
    const { type } = req.params;
    const Model = getModel(type);

    const data = await Model.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

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

// ✅ UPDATE
const updateMaster = async (req, res) => {
  try {
    const { type, id } = req.params;
    const Model = getModel(type);

    const updated = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

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
  getMasters,
  getMasterById,
  updateMaster,
  deleteMaster,
};
