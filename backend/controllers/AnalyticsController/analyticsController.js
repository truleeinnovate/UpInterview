// controllers/AnalyticsController/analyticsController.js
const mongoose = require("mongoose");
const ReportCategory = require("../../models/AnalyticSchemas/reportCategory");
const { ReportTemplate } = require("../../models/AnalyticSchemas/reportSchemas");
const { FilterPreset } = require("../../models/AnalyticSchemas/filterSchemas");
const { ColumnConfiguration } = require("../../models/AnalyticSchemas/columnSchemas");
const { buildPermissionQuery } = require("../../utils/buildPermissionQuery");
// Import all models directly (safe & simple)
const { Candidate } = require("../../models/Candidate");
const { Position } = require("../../models/Position/position");
const { Interview }= require("../../models/Interview/Interview");
const Assessment = require("../../models/Assessment/assessmentsSchema");
const { InterviewRounds } = require("../../models/Interview/InterviewRounds");

// const generateReport = async (req, res) => {
//   try {
//     console.log("========== [REPORT DEBUG START] ==========\n");

//     const { actingAsUserId,
//       actingAsTenantId, } = res.locals.auth;
//     let userId = actingAsUserId;
//     let tenantId = actingAsTenantId;
//     const {
//       effectivePermissions,
//       inheritedRoleIds,
//       effectivePermissions_RoleType,
//       effectivePermissions_RoleName,
//     } = res.locals;
//     const { templateId } = req.params;

//     console.log("[DEBUG] tenantId:", tenantId);
//     console.log("[DEBUG] userId:", userId);
//     console.log("[DEBUG] templateId:", templateId);

//     // 1. Fetch Template
//     const template = await ReportTemplate.findOne({
//       $or: [
//         { _id: templateId, tenantId: null, isSystemTemplate: true },
//         { _id: templateId, tenantId },
//       ],
//     }).lean();

//     console.log("[DEBUG] Fetched Template:", template);

//     if (!template) {
//       return res.status(404).json({ success: false, message: "Report template not found" });
//     }

//     const { dataSource, columns: columnConfig, filters: filterConfig } = template.configuration || {};

//     console.log("[DEBUG] Template configuration:", template.configuration);

//     if (!dataSource?.collections?.length) {
//       return res.status(400).json({ success: false, message: "No data source defined" });
//     }

//     // 2. Resolve Model
//     const collectionName = dataSource.collections[0].toLowerCase();

//     const ModelMap = {
//       candidates: Candidate,
//       positions: Position,
//       interviews: Interview,
//       interviewrounds: InterviewRounds,
//       assessments: Assessment,
//     };
//     const Model = ModelMap[collectionName];

//     console.log("[DEBUG] Collection Name:", collectionName);
//     console.log("[DEBUG] Resolved Model:", Model?.modelName);

//     if (!Model) {
//       return res.status(400).json({ success: false, message: `Unsupported collection: ${collectionName}` });
//     }

//     // 3. Saved Configs
//     const filterPreset = tenantId ? await FilterPreset.findOne({ templateId, tenantId, isDefault: true }).lean() : null;
//     const savedColumnConfig = tenantId ? await ColumnConfiguration.findOne({ templateId, tenantId }).lean() : null;

//     console.log("[DEBUG] Filter Preset:", filterPreset);
//     console.log("[DEBUG] Saved Column Configuration:", savedColumnConfig);

//     // 4. Permission Query
//     const permissionQuery = await buildPermissionQuery(
//       userId,
//       tenantId,
//       effectivePermissions,
//       inheritedRoleIds,
//       effectivePermissions_RoleType,
//       effectivePermissions_RoleName
//     );
//     console.log("[DEBUG] Final Permission Query:", permissionQuery);

//     // 5. Build Columns
//     const lockedColumns = (columnConfig?.lockedColumns || []).map(col => ({
//       key: col.key, label: col.label, width: col.width || "180px", visible: true, locked: true, order: col.order ?? 0,
//     }));

//     console.log("[DEBUG] Locked Columns:", lockedColumns);

//     let finalColumns = [...lockedColumns];

//     if (savedColumnConfig?.selectedColumns?.length > 0) {
//       const userMap = new Map();
//       savedColumnConfig.selectedColumns.forEach(col => {
//         if (col.key && !lockedColumns.some(l => l.key === col.key)) {
//           userMap.set(col.key, {
//             key: col.key,
//             label: col.label || col.key,
//             width: col.width || "180px",
//             visible: col.visible !== false,
//             locked: false,
//             order: col.order ?? 999,
//           });
//         }
//       });
//       finalColumns.push(...userMap.values());
//       console.log("[DEBUG] Columns from Saved User Settings:", [...userMap.values()]);
//     } else {
//       (columnConfig?.default || []).forEach(col => {
//         if (!finalColumns.some(c => c.key === col.key)) {
//           finalColumns.push({
//             key: col.key,
//             label: col.label,
//             width: col.width || "160px",
//             visible: true,
//             locked: false,
//             order: col.order ?? 999
//           });
//         }
//       });
//       console.log("[DEBUG] Columns from Default Template:", columnConfig?.default || []);
//     }

//     finalColumns.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
//     const responseColumns = finalColumns.map(({ order, ...col }) => col);

//     console.log("[DEBUG] Final Columns After Sorting:", responseColumns);

//     // 6. Available Columns
//     const availableColumns = [
//       ...lockedColumns.map(col => ({
//         key: col.key,
//         label: col.label,
//         type: columnConfig?.available?.find(a => a.key === col.key)?.type || "text",
//         locked: true,
//         selected: true,
//       })),
//       ...(columnConfig?.available || []).map(col => {
//         const isVisible = responseColumns.some(c => c.key === col.key && c.visible);
//         return {
//           key: col.key,
//           label: col.label || col.key,
//           type: col.type || "text",
//           locked: false,
//           selected: isVisible,
//         };
//       }),
//     ];
//     const uniqueAvailableColumns = Array.from(new Map(availableColumns.map(c => [c.key, c])).values());

//     console.log("[DEBUG] Available Columns:", uniqueAvailableColumns);

//     // 7. Active Filters
//     let activeFilters = {};

//     if (filterPreset?.filters?.length > 0) {
//       filterPreset.filters.forEach(f => { activeFilters[f.key] = f.value; });
//     } else if (filterConfig?.default) {
//       activeFilters = { ...filterConfig.default };
//     }

//     console.log("[DEBUG] Active Filters:", activeFilters);

//     // 8. Final Query
//     let filterQuery = { ...permissionQuery };

//     // Apply date filters
//     if (activeFilters.dateRange && activeFilters.dateRange !== "all") {
//       const now = new Date();
//       let startDate;

//       switch (activeFilters.dateRange) {
//         case "last7days": startDate = new Date(now.setDate(now.getDate() - 7)); break;
//         case "last30days": startDate = new Date(now.setDate(now.getDate() - 30)); break;
//         case "last90days": startDate = new Date(now.setDate(now.getDate() - 90)); break;
//         case "custom":
//           if (activeFilters.customStartDate) {
//             startDate = new Date(activeFilters.customStartDate);
//             filterQuery.createdAt = { $gte: startDate };
//             if (activeFilters.customEndDate) {
//               filterQuery.createdAt.$lte = new Date(activeFilters.customEndDate);
//             }
//           }
//           break;
//         default:
//           startDate = new Date(now.setDate(now.getDate() - 30));
//       }

//       if (startDate && activeFilters.dateRange !== "custom") {
//         filterQuery.createdAt = { $gte: startDate };
//       }
//     }

//     // Other filters
//     Object.keys(activeFilters).forEach(key => {
//       if (["dateRange", "customStartDate", "customEndDate"].includes(key)) return;

//       const value = activeFilters[key];
//       if (value && value !== "all" && value !== null && value !== undefined) {
//         filterQuery[key] =
//           Array.isArray(value) && value.length > 0
//             ? { $in: value }
//             : value;
//       }
//     });

//     console.log("[DEBUG] Final Filter Query:", filterQuery);

//     // 9. Fetch Data
//     const projection = responseColumns.reduce(
//       (acc, col) => ({ ...acc, [col.key]: 1 }),
//       { _id: 1 }
//     );

//     console.log("[DEBUG] Projection Used:", projection);

//     const data = await Model.find(filterQuery, projection)
//       .sort({ createdAt: -1 })
//       .limit(2000)
//       .lean();

//     console.log("[DEBUG] Data Count:", data.length);
//     console.log("[DEBUG] First 3 raw records:", data.slice(0, 3));

//     const mappedData = data.map(d => ({
//       id: d._id.toString(),
//       ...d
//     }));

//     console.log("[DEBUG] First 3 mapped records:", mappedData.slice(0, 3));

//     // 10. selectedFilters
//     let selectedFilters = filterPreset?.filters?.length > 0
//       ? filterPreset.filters.map(f => ({
//         key: f.key,
//         value: f.value,
//         label: f.label || String(f.value)
//       }))
//       : Object.entries(filterConfig?.default || {})
//         .map(([key, value]) => {
// if (value == null || (Array.isArray(value) && value.length === 0)) return null;

//           const def = filterConfig.available?.find(f => f.key === key);
//           let label = Array.isArray(value) ? value.join(", ") : String(value);

//           if (def?.options) {
//             label = Array.isArray(value)
//               ? value.map(v => def.options.find(o => o.value === v)?.label || v)
//                 .filter(Boolean)
//                 .join(", ")
//               : def.options.find(o => o.value === value)?.label || value;
//           }

//           return { key, value, label };
//         })
//         .filter(Boolean);

//     console.log("[DEBUG] Selected Filters:", selectedFilters);

//     // 11. Response
//     console.log("\n========== [REPORT DEBUG END] ==========\n");

//     res.json({
//       success: true,
//       report: {
//         id: template._id.toString(),
//         label: template.label,
//         description: template.description || "",
//         generatedAt: new Date().toISOString(),
//         totalRecords: mappedData.length,
//         source: filterPreset
//           ? "saved_view"
//           : savedColumnConfig
//             ? "saved_columns"
//             : "template_default",
//       },
//       columns: responseColumns,
//       availableColumns: uniqueAvailableColumns,
//       data: mappedData,
//       selectedFilters,
//       availableFilters: filterConfig?.available || [],
//     });

//   } catch (error) {
//     console.error("[ERROR] Generate Report Error:", error);
//     res.status(500).json({ success: false, message: "Server error", error: error.message });
//   }
// };


const generateReport = async (req, res) => {
  try {
    console.log("========== [REPORT DEBUG START] ==========\n");

    const { actingAsUserId, actingAsTenantId } = res.locals.auth;
    const tenantId = actingAsTenantId;
    const { templateId } = req.params;

    console.log("[DEBUG] tenantId:", tenantId);
    console.log("[DEBUG] templateId:", templateId);

    // 1. Fetch Template
    const template = await ReportTemplate.findOne({
      $or: [
        { _id: templateId, tenantId: null, isSystemTemplate: true },
        { _id: templateId, tenantId },
      ],
    }).lean();

    if (!template) {
      return res.status(404).json({ success: false, message: "Report template not found" });
    }

    const { 
      dataSource, 
      columns: columnConfig, 
      filters: filterConfig,
      kpis: templateKpis = [],     // ← From template
      charts: templateCharts = []   // ← From template
    } = template.configuration || {};

    if (!dataSource?.collections?.length) {
      return res.status(400).json({ success: false, message: "No data source defined" });
    }

    const collectionName = dataSource.collections[0].toLowerCase();
    const ModelMap = {
      candidates: Candidate,
      positions: Position,
      interviews: Interview,
      interviewrounds: InterviewRounds,
      assessments: Assessment,
    };

    const Model = ModelMap[collectionName];
    if (!Model) {
      return res.status(400).json({ success: false, message: `Unsupported collection: ${collectionName}` });
    }

    // 2. Saved Configs (unchanged)
    const filterPreset = tenantId ? await FilterPreset.findOne({ templateId, tenantId, isDefault: true }).lean() : null;
    const savedColumnConfig = tenantId ? await ColumnConfiguration.findOne({ templateId, tenantId }).lean() : null;

    // 3. Build Columns (same logic — perfect)
    const lockedColumns = (columnConfig?.lockedColumns || []).map(col => ({
      key: col.key,
      label: col.label,
      width: col.width || "180px",
      visible: true,
      locked: true,
      order: col.order ?? 0,
    }));

    let finalColumns = [...lockedColumns];

    if (savedColumnConfig?.selectedColumns?.length > 0) {
      const userMap = new Map();
      savedColumnConfig.selectedColumns.forEach(col => {
        if (col.key && !lockedColumns.some(l => l.key === col.key)) {
          userMap.set(col.key, {
            key: col.key,
            label: col.label || col.key,
            width: col.width || "180px",
            visible: col.visible !== false,
            locked: false,
            order: col.order ?? 999,
          });
        }
      });
      finalColumns.push(...userMap.values());
    } else {
      (columnConfig?.default || []).forEach(col => {
        if (!finalColumns.some(c => c.key === col.key)) {
          finalColumns.push({
            key: col.key,
            label: col.label,
            width: col.width || "160px",
            visible: true,
            locked: false,
            order: col.order ?? 999,
          });
        }
      });
    }

    finalColumns.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    const responseColumns = finalColumns.map(({ order, ...col }) => col);

    const availableColumns = [
      ...lockedColumns.map(col => ({
        key: col.key,
        label: col.label,
        type: columnConfig?.available?.find(a => a.key === col.key)?.type || "text",
        locked: true,
        selected: true,
      })),
      ...(columnConfig?.available || []).map(col => {
        const isVisible = responseColumns.some(c => c.key === col.key && c.visible);
        return {
          key: col.key,
          label: col.label || col.key,
          type: col.type || "text",
          locked: false,
          selected: isVisible,
        };
      }),
    ];
    const uniqueAvailableColumns = Array.from(new Map(availableColumns.map(c => [c.key, c])).values());

    // 4. Active Filters
    let activeFilters = filterPreset?.filters?.length > 0
      ? Object.fromEntries(filterPreset.filters.map(f => [f.key, f.value]))
      : { ...filterConfig?.default };

    // 5. Build Filter Query
    let filterQuery = {};
    if (activeFilters.dateRange && activeFilters.dateRange !== "all") {
      const now = new Date();
      let days = 30;
      if (activeFilters.dateRange === "last7days") days = 7;
      if (activeFilters.dateRange === "last90days") days = 90;
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      filterQuery.createdAt = { $gte: startDate };
    }

    Object.keys(activeFilters).forEach(key => {
      if (["dateRange", "customStartDate", "customEndDate"].includes(key)) return;
      const value = activeFilters[key];
      if (value != null && value !== "all" && (!Array.isArray(value) || value.length > 0)) {
        filterQuery[key] = Array.isArray(value) ? { $in: value } : value;
      }
    });

    // 6. DATA FETCH (same as before)
    const projection = responseColumns.reduce((acc, col) => ({ ...acc, [col.key]: 1 }), { _id: 1 });
    let data = [];

    if (collectionName === "interviewrounds") {
      const interviews = await Interview.find(
        { $or: [{ tenantId }, { ownerId: tenantId }] },
        { _id: 1 }
      ).lean();
      const validInterviewIds = interviews.map(i => i._id);

      if (validInterviewIds.length === 0) {
        data = [];
      } else {
        data = await InterviewRounds.find(
          { interviewId: { $in: validInterviewIds }, ...filterQuery },
          projection
        )
          .sort({ createdAt: -1 })
          .limit(2000)
          .lean();
      }
    } else {
      const query = {
        $or: [{ tenantId }, { ownerId: tenantId }],
        ...filterQuery
      };
      data = await Model.find(query, projection)
        .sort({ createdAt: -1 })
        .limit(2000)
        .lean();
    }

    const mappedData = data.map(d => ({ id: d._id.toString(), ...d }));

    // 7. === NEW: CALCULATE KPIs & CHART DATA ===
    const aggregates = {};
    const chartData = {};

    // KPIs: Simple counts & averages
    aggregates.totalPositions = mappedData.length;

    aggregates.openPositions = mappedData.filter(d => 
      ["opened", "open", "active"].includes(d.status?.toLowerCase())
    ).length;

    aggregates.closedPositions = mappedData.filter(d => 
      ["closed", "filled"].includes(d.status?.toLowerCase())
    ).length;

    aggregates.onHoldPositions = mappedData.filter(d => 
      d.status?.toLowerCase() === "hold"
    ).length;

    aggregates.avgSalary = mappedData.reduce((sum, d) => {
      const avg = (Number(d.minSalary || 0) + Number(d.maxSalary || 0)) / 2;
      return sum + avg;
    }, 0) / (mappedData.length || 1);

    // Chart Data
    // 1. Status Breakdown (Pie)
    const statusMap = {};
    mappedData.forEach(d => {
      const status = d.status || "Unknown";
      statusMap[status] = (statusMap[status] || 0) + 1;
    });
    chartData.positionsByStatus = Object.entries(statusMap).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));

    // 2. By Month (Line)
    const monthMap = {};
    mappedData.forEach(d => {
      const date = new Date(d.createdAt);
      const month = date.toLocaleString('default', { month: 'short', year: 'numeric' });
      monthMap[month] = (monthMap[month] || 0) + 1;
    });
    chartData.positionsByMonth = Object.entries(monthMap)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([name, value]) => ({ name, value }));

    // 3. By Location (Bar)
    const locationMap = {};
    mappedData.forEach(d => {
      const loc = d.Location || "Unknown";
      locationMap[loc] = (locationMap[loc] || 0) + 1;
    });
    chartData.positionsByLocation = Object.entries(locationMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, value]) => ({ name, value }));

    // 8. Final Response — NOW WITH KPIs & CHARTS
    res.json({
      success: true,
      report: {
        id: template._id.toString(),
        label: template.label,
        description: template.description || "",
        generatedAt: new Date().toISOString(),
        totalRecords: mappedData.length,
      },
      columns: responseColumns,
      availableColumns: uniqueAvailableColumns,
      data: mappedData,
      availableFilters: filterConfig?.available || [],
      defaultFilters: filterConfig?.default || {},

      // ← NEW: KPIs & Charts
      kpis: templateKpis,           // From template.configuration.kpis
      charts: templateCharts,       // From template.configuration.charts
      aggregates,                   // ← Real values: { totalPositions: 142, ... }
      chartData                     // ← Real chart datasets
    });

    console.log("\n========== [REPORT DEBUG END] ==========\n");

  } catch (error) {
    console.error("[ERROR] Generate Report Error:", error);
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

module.exports = { getReportTemplates, generateReport, saveFilterPreset, saveColumnConfig, createCategory, createTemplate };