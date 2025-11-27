// controllers/AnalyticsController/analyticsController.js
const mongoose = require("mongoose");
const ReportCategory = require("../../models/AnalyticSchemas/reportCategory");
const { ReportTemplate } = require("../../models/AnalyticSchemas/reportSchemas");

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
      templateId: t.templateId || t.name,
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

const generateReport = async (req, res) => {
  try {
    const { templateId } = req.params;
    const tenantId = req.user?.tenantId ?? null;

    // 1. Find the template
    const template = await ReportTemplate.findOne({
      $or: [
        { _id: templateId, tenantId: null, isSystemTemplate: true },
        { _id: templateId, tenantId }
      ]
    })
      .populate("category")
      .lean();

    if (!template) {
      return res.status(404).json({
        success: false,
        message: "Report template not found"
      });
    }

    const config = template.configuration?.dataSource;
    if (!config?.collections?.length) {
      return res.status(400).json({
        success: false,
        message: "No data source defined in template"
      });
    }

    const collectionName = config.collections[0]; // e.g., "candidates"
    const Model = mongoose.models[collectionName.charAt(0).toUpperCase() + collectionName.slice(1)];

    if (!Model) {
      return res.status(400).json({
        success: false,
        message: `Collection ${collectionName} not found`
      });
    }

    // 2. Build final column list
    const finalColumns = [];

    // Priority 1: Locked columns (must show)
    config.columns?.lockedColumns?.forEach(col => {
      finalColumns.push({
        key: col.key,
        label: col.label,
        width: col.width || "180px",
        type: col.type || "text"
      });
    });

    // Priority 2: Default columns
    config.columns?.defaultColumns?.forEach(col => {
      if (!finalColumns.find(c => c.key === col.key)) {
        finalColumns.push({
          key: col.key,
          label: col.label,
          width: col.width || "160px",
          type: col.type || "text"
        });
      }
    });

    // Priority 3: Fallback from available if needed
    if (finalColumns.length < 3) {
      config.columns?.availableColumns?.slice(0, 5).forEach(col => {
        if (!finalColumns.find(c => c.key === col.key)) {
          finalColumns.push({
            key: col.key,
            label: col.label,
            width: "150px",
            type: col.type || "text"
          });
        }
      });
    }

    // 3. Build MongoDB projection (only fetch needed fields)
    const projection = {};
    finalColumns.forEach(col => {
      projection[col.key] = 1;
    });

    // 4. Build filters from template (e.g., last30days)
    let filterQuery = { tenantId };

    const defaultFilters = config.filters?.defaultFilters || {};
    const now = new Date();

    if (defaultFilters.dateRange === "last30days") {
      const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
      filterQuery.createdAt = { $gte: thirtyDaysAgo };
    }

    // Add more filters here later (status, technology, etc.)

    // 5. Fetch real data
    const data = await Model.find(filterQuery, projection)
      .sort({ createdAt: -1 })
      .limit(1000) // safety limit
      .lean();

    // 6. Format response
    const result = {
      success: true,
      report: {
        id: template._id,
        label: template.label,
        description: template.description || "",
        generatedAt: new Date().toISOString(),
        totalRecords: data.length
      },
      columns: finalColumns,
      data: data.map(item => ({
        id: item._id.toString(),
        ...item
      }))
    };

    res.json(result);

  } catch (error) {
    console.error("Generate Report Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate report",
      error: error.message
    });
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

module.exports = { getReportTemplates,generateReport, createCategory, createTemplate };