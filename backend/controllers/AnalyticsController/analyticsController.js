// controllers/AnalyticsController/analyticsController.js
const mongoose = require("mongoose");
const ReportCategory = require("../../models/AnalyticSchemas/reportCategory");
const { ReportTemplate } = require("../../models/AnalyticSchemas/reportSchemas");
const { FilterPreset } = require("../../models/AnalyticSchemas/filterSchemas");
const { ColumnConfiguration } = require("../../models/AnalyticSchemas/columnSchemas");

// Import all models directly (safe & simple)
const {Candidate} = require("../../models/Candidate");
const {Position} = require("../../models/Position/position");
const Interview = require("../../models/Interview/Interview");
const Assessment = require("../../models/Assessment/assessmentsSchema");
const {InterviewRounds} = require("../../models/Interview/InterviewRounds");

const generateReport = async (req, res) => {
  try {
    
    const {
      actingAsTenantId,
    } = res.locals.auth;

    const { templateId } = req.params;
    const tenantId = actingAsTenantId;

    // 1. Get Template
    const template = await ReportTemplate.findOne({
      $or: [
        { _id: templateId, tenantId: null, isSystemTemplate: true },
        { _id: templateId, tenantId }
      ]
    }).lean();

    if (!template) {
      return res.status(404).json({ success: false, message: "Report template not found" });
    }

    const config = template.configuration?.dataSource;
    if (!config?.collections?.length) {
      return res.status(400).json({ success: false, message: "No data source defined" });
    }

    const collectionName = config.collections[0].toLowerCase();

    // 2. MAP COLLECTION NAME → MODEL (direct & fast)
    let Model;
    switch (collectionName) {
      case "candidates":
        Model = Candidate;
        break;
      case "positions":
        Model = Position;
        break;
      case "interviews":
        Model = Interview;
        break;
      case "interviewrounds":
        Model = InterviewRounds;
        break;
      case "assessments":
        Model = Assessment;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: `Unsupported collection: ${config.collections[0]}`
        });
    }

    // 3. Get Tenant-Level Filter Preset (isDefault: true)
    const filterPreset = tenantId ? await FilterPreset.findOne({
      templateId,
      tenantId,
      isDefault: true
    }).lean() : null;

    // 4. Get Tenant-Level Column Config
    const columnConfig = tenantId ? await ColumnConfiguration.findOne({
      templateId,
      tenantId
    }).lean() : null;

    // 5. BUILD FINAL COLUMNS
    let finalColumns = [];

    if (columnConfig?.selectedColumns?.length > 0) {
      finalColumns = columnConfig.selectedColumns
        .filter(col => col.visible !== false)
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(col => ({
          key: col.key,
          label: col.label || col.key,
          width: col.width || "180px"
        }));
    } else {
      // Use template columns
      config.columns?.lockedColumns?.forEach(col => {
        finalColumns.push({
          key: col.key,
          label: col.label,
          width: col.width || "180px"
        });
      });

      config.columns?.defaultColumns?.forEach(col => {
        if (!finalColumns.find(c => c.key === col.key)) {
          finalColumns.push({
            key: col.key,
            label: col.label,
            width: col.width || "160px"
          });
        }
      });
    }

    // 6. BUILD FILTERS
    const activeFilters = filterPreset?.filters || config.filters?.default || {};
    let filterQuery = { tenantId };

    if (activeFilters.dateRange === "last30days") {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      filterQuery.createdAt = { $gte: thirtyDaysAgo };
    }

    // Add more filters here later
    // if (activeFilters.status && activeFilters.status !== "all") filterQuery.status = activeFilters.status;

    // 7. PROJECTION (only fetch needed fields)
    const projection = finalColumns.reduce((acc, col) => {
      acc[col.key] = 1;
      return acc;
    }, {});

    // 8. FETCH DATA
    const data = await Model.find(filterQuery, projection)
      .sort({ createdAt: -1 })
      .limit(1000)
      .lean();

    // 9. SEND RESPONSE
    res.json({
      success: true,
      report: {
        id: template._id,
        label: template.label,
        description: template.description || "",
        generatedAt: new Date().toISOString(),
        totalRecords: data.length,
        source: filterPreset ? "Tenant Preset" : columnConfig ? "Tenant Columns" : "Template Default"
      },
      columns: finalColumns,
      data: data.map(item => ({
        id: item._id,
        ...item
      }))
    });

  } catch (error) {
    console.error("Generate Report Error:", error.message);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


const getReportTemplates = async (req, res) => {
  try {
    // FIX: Use real null, not string "null"
    const tenantId = req.user?.tenantId ?? null;

    // 1. GET ALL CATEGORIES (system + tenant)
    const categories = await ReportCategory.find({
      $or: [
        { tenantId: null, isSystem: true },  // system categories
        { tenantId }                         // tenant-specific
      ]
    })
      .select("_id name label icon color order")
      .sort({ order: 1 })
      .lean();

    const formattedCategories = categories.map(cat => ({
      id: cat._id.toString(),
      name: cat.name,
      label: cat.label,
      icon: cat.icon || "folder",
      color: cat.color || "#6366f1",
    }));

    // 2. GET ALL TEMPLATES (system + tenant)
    const templates = await ReportTemplate.find({
      $or: [
        { tenantId: null, isSystemTemplate: true },
        { tenantId }
      ]
    })
      .populate("category", "_id name label icon color")
      .lean();

    const formattedTemplates = templates.map(t => ({
      id: t._id.toString(),
      name: t.name,
      label: t.label,
      description: t.description || "No description",
      category: t.category ? {
        id: t.category._id.toString(),        // ← This is the key
        name: t.category.name,
        label: t.category.label,
        icon: t.category.icon,
        color: t.category.color,
      } : null,
      configuration: t.configuration,
      status: t.status || "active",
      isSystemTemplate: t.isSystemTemplate || false,
      requiredPlans: t.requiredPlans || []
    }));

    res.json({
      success: true,
      data: {
        categories: formattedCategories,
        templates: formattedTemplates
      }
    });

  } catch (error) {
    console.error("Analytics API Error:", error.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


const saveFilterPreset = async (req, res) => {
  try {
    const { templateId } = req.params;
    const tenantId = req.user.tenantId;
    const { filters, name = "Default View", isDefault = true } = req.body;

    // Upsert: delete old default, insert new
    if (isDefault) {
      await FilterPreset.deleteMany({ templateId, tenantId, isDefault: true });
    }

    const preset = await FilterPreset.findOneAndUpdate(
      { templateId, tenantId },
      { filters, name, isDefault, tenantId, templateId },
      { upsert: true, new: true }
    );

    res.json({ success: true, preset });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const saveColumnConfig = async (req, res) => {
  try {
    const { templateId } = req.params;
    const tenantId = req.user.tenantId;
    const { selectedColumns } = req.body;

    const config = await ColumnConfiguration.findOneAndUpdate(
      { templateId, tenantId },
      { selectedColumns, tenantId, templateId },
      { upsert: true, new: true }
    );

    res.json({ success: true, config });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createTemplate = async (req, res) => {
    try {
        const payload = req.body;

        const template = await ReportTemplate.create(payload);

        return res.status(201).json({
            success: true,
            message: "Report template created successfully",
            data: template,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error creating template",
            error: error.message,
        });
    }
};

const createCategory = async (req, res) => {
    try {
        const payload = req.body;

        const category = await ReportCategory.create(payload);

        return res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error creating category",
            error: error.message,
        });
    }
};

module.exports = { getReportTemplates,generateReport,saveFilterPreset,saveColumnConfig, createCategory, createTemplate };