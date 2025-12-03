// v1.0.0 - Ashok - modified - column management logic

// controllers/AnalyticsController/analyticsController.js
const mongoose = require("mongoose");
const ReportCategory = require("../../models/AnalyticSchemas/reportCategory");
const {
  ReportTemplate,TenantReportAccess
} = require("../../models/AnalyticSchemas/reportSchemas");
const { FilterPreset } = require("../../models/AnalyticSchemas/filterSchemas");
const {
  ColumnConfiguration,
} = require("../../models/AnalyticSchemas/columnSchemas");
const { buildPermissionQuery } = require("../../utils/buildPermissionQuery");
// Import all models directly (safe & simple)
const { Candidate } = require("../../models/Candidate");
const { Position } = require("../../models/Position/position");
const { Interview } = require("../../models/Interview/Interview");
const Assessment = require("../../models/Assessment/assessmentsSchema");
const { InterviewRounds } = require("../../models/Interview/InterviewRounds");
const RolesPermissionObject = require('../../models/rolesPermissionObject');

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
    console.log("========== [REPORT GENERATION START] ==========\n");

    const { actingAsUserId, actingAsTenantId } = res.locals.auth;
    const { templateId } = req.params;

    console.log("[INFO] User ID:", actingAsUserId);
    console.log("[INFO] Tenant ID:", actingAsTenantId);
    console.log("[INFO] Template ID:", templateId);

    // 1. FETCH TEMPLATE
    const template = await ReportTemplate.findOne({
      $or: [
        { _id: templateId, tenantId: null, isSystemTemplate: true },
        { _id: templateId, tenantId: actingAsTenantId },
      ],
    }).lean();

    if (!template) {
      console.log("[ERROR] Template not found");
      return res
        .status(404)
        .json({ success: false, message: "Report template not found" });
    }

    console.log("[SUCCESS] Template:", template.label);

    const {
      dataSource,
      columns: columnConfig,
      filters: filterConfig = {},
      kpis: templateKpis = [],
      charts: templateCharts = [],
    } = template.configuration || {};

    if (!dataSource?.collections?.length) {
      return res
        .status(400)
        .json({ success: false, message: "No data source defined" });
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
      return res
        .status(400)
        .json({
          success: false,
          message: `Unsupported collection: ${collectionName}`,
        });
    }

    // 2. FETCH LATEST FILTER PRESET (ONLY 1 QUERY)
    let filterPreset = null;

    if (actingAsTenantId) {
      filterPreset = await FilterPreset.findOne({
        templateId,
        tenantId: actingAsTenantId,
      })
        .sort({ updatedAt: -1 })
        .lean();

      if (filterPreset) {
        console.log(
          `[FILTERS] Using latest saved preset: "${filterPreset.name}"`
        );
      } else {
        console.log("[FILTERS] No saved preset → using template defaults");
      }
    }

    // 3. SAVED COLUMN CONFIG
    const savedColumnConfig = actingAsTenantId
      ? await ColumnConfiguration.findOne({
          templateId,
          tenantId: actingAsTenantId,
        }).lean()
      : null;

    // 4. BUILD COLUMNS
    const lockedColumns = (columnConfig?.lockedColumns || []).map((col) => ({
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
      savedColumnConfig.selectedColumns.forEach((col) => {
        if (col.key && !lockedColumns.some((l) => l.key === col.key)) {
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
      (columnConfig?.default || []).forEach((col) => {
        if (!finalColumns.some((c) => c.key === col.key)) {
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
    const responseColumns = finalColumns.map(({ order, ...rest }) => rest);

    // 5. AVAILABLE COLUMNS
    const availableColumns = [
      ...lockedColumns.map((col) => ({
        key: col.key,
        label: col.label,
        type:
          columnConfig?.available?.find((a) => a.key === col.key)?.type ||
          "text",
        locked: true,
        selected: true,
      })),
      ...(columnConfig?.available || []).map((col) => {
        const isVisible = responseColumns.some(
          (c) => c.key === col.key && c.visible
        );
        return {
          key: col.key,
          label: col.label || col.key,
          type: col.type || "text",
          locked: false,
          selected: isVisible,
        };
      }),
    ];

    const uniqueAvailableColumns = Array.from(
      new Map(availableColumns.map((c) => [c.key, c])).values()
    );

    // 6. ACTIVE FILTERS — PRESET WINS
    let activeFilters = {};

    if (filterPreset?.filters?.length > 0) {
      const firstFilter = filterPreset.filters[0];

      // OLD FORMAT: flat object { dateRange: "...", status: "..." }
      if (firstFilter && !firstFilter.key && !firstFilter.value) {
        activeFilters = { ...firstFilter };
        console.log(
          "[FILTERS] Applied saved filters (old format) →",
          activeFilters
        );
      }
      // NEW FORMAT: array of { key, value }
      else {
         activeFilters = Object.fromEntries(
    filterPreset.filters.map(f => [f.key, f.value])
  );
        console.log("[FILTERS] Applied saved filters (new format) →", activeFilters);
      }
    } else {
      activeFilters = { ...(filterConfig?.default || {}) };
      console.log("[FILTERS] Using template defaults →", activeFilters);
    }

    // 7. PERMISSIONS — DYNAMIC & SECURE
    const permissionQuery = await buildPermissionQuery(
      actingAsUserId,
      actingAsTenantId,
      res.locals.inheritedRoleIds || [],
      res.locals.effectivePermissions_RoleType,
      res.locals.effectivePermissions_RoleName
    );

    console.log(
      "[PERMISSIONS] Query →",
      JSON.stringify(permissionQuery, null, 2)
    );

    // 8. FINAL QUERY
    let finalQuery = { ...permissionQuery };

    if (activeFilters.dateRange && activeFilters.dateRange !== "all") {
      const daysMap = { last7days: 7, last30days: 30, last90days: 90 };
      const days = daysMap[activeFilters.dateRange] || 30;
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      startDate.setHours(0, 0, 0, 0);
      finalQuery.createdAt = { $gte: startDate };
    }

   Object.keys(activeFilters).forEach(key => {
  if (["dateRange", "customStartDate", "customEndDate"].includes(key)) return;
  const value = activeFilters[key];
  if (value != null && value !== "all" && (!Array.isArray(value) || value.length > 0)) {
    finalQuery[key] = Array.isArray(value) ? { $in: value } : value;
  }
});


    console.log("[QUERY] Final Query →", JSON.stringify(finalQuery, null, 2));

    // 9. PROJECTION
    const projection = responseColumns.reduce(
      (acc, col) => ({ ...acc, [col.key]: 1 }),
      { _id: 1, createdAt: 1 }
    );

    // 10. FETCH DATA — FULLY SECURE (permissionQuery applied)
    let rawData = [];

    if (collectionName === "interviewrounds") {
      const interviews = await Interview.find(permissionQuery, {
        _id: 1,
      }).lean();
      const interviewIds = interviews.map((i) => i._id);
      if (interviewIds.length > 0) {
        rawData = await InterviewRounds.find(
          { interviewId: { $in: interviewIds }, ...finalQuery },
          projection
        )
          .limit(2000)
          .lean();
      }
    } else {
      rawData = await Model.find(
        { ...permissionQuery, ...finalQuery }, // SECURE: permissionQuery included
        projection
      )
        .limit(2000)
        .lean();
    }

    console.log(`[DATA] Fetched ${rawData.length} records`);

    const sortedData = rawData.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    const mappedData = sortedData.map((d) => ({ id: d._id.toString(), ...d }));

    // 11. KPI + CHARTS
    const aggregates = {
      totalPositions: mappedData.length,
      openPositions: mappedData.filter((d) =>
        ["opened", "open", "active"].includes(d.status?.toLowerCase())
      ).length,
      closedPositions: mappedData.filter((d) =>
        ["closed", "filled"].includes(d.status?.toLowerCase())
      ).length,
      onHoldPositions: mappedData.filter(
        (d) => d.status?.toLowerCase() === "hold"
      ).length,
      avgSalary:
        mappedData.reduce(
          (sum, d) =>
            sum + (Number(d.minSalary || 0) + Number(d.maxSalary || 0)) / 2,
          0
        ) / (mappedData.length || 1),
    };

    const chartData = {
      positionsByStatus: Object.entries(
        mappedData.reduce((m, d) => {
          m[d.status || "Unknown"] = (m[d.status || "Unknown"] || 0) + 1;
          return m;
        }, {})
      ).map(([name, value]) => ({ name, value })),

      positionsByMonth: Object.entries(
        mappedData.reduce((m, d) => {
          const month = new Date(d.createdAt).toLocaleString("default", {
            month: "short",
            year: "numeric",
          });
          m[month] = (m[month] || 0) + 1;
          return m;
        }, {})
      ).map(([name, value]) => ({ name, value })),

      positionsByLocation: Object.entries(
        mappedData.reduce((m, d) => {
          m[d.Location || "Unknown"] = (m[d.Location || "Unknown"] || 0) + 1;
          return m;
        }, {})
      )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, value]) => ({ name, value })),
    };

    // 12. FINAL RESPONSE — UX PERFECT
    console.log(
      "[SUCCESS] Report generated successfully\n========== [END] ==========\n"
    );

    return res.json({
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
      // SAVED DEFAULT FILTERS (for "Reset" button)
      defaultFilters:
        filterPreset?.filters?.length > 0
          ? Object.fromEntries(
              filterPreset.filters.map((f) => [f.key, f.value])
            )
          : filterConfig?.default || {},

      kpis: templateKpis,
      charts: templateCharts,
      aggregates,
      chartData,
    });
  } catch (error) {
    console.error("[FATAL ERROR] Generate Report Failed:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

const getReportTemplates = async (req, res) => {
  try {
    const { actingAsTenantId } = res.locals.auth;
    const tenantId = actingAsTenantId || null;

    /* -----------------------------------------------
     * 1) GET CATEGORIES (System + Tenant-Specific)
     * --------------------------------------------- */
    let categories = await ReportCategory.find({
      $or: [{ tenantId: null, isSystem: true }, { tenantId }],
    })
      .select("_id name label icon color order")
      .lean();

    // Sort in JS instead of Mongo (Cosmos safe)
    categories = categories.sort((a, b) => (a.order || 0) - (b.order || 0));

    const formattedCategories = categories.map((cat) => ({
      id: cat._id.toString(),
      name: cat.name,
      label: cat.label,
      icon: cat.icon || "folder",
      color: cat.color || "#6366f1",
    }));

    /* -----------------------------------------------
     * 2) GET TEMPLATES (System + Tenant)
     *    FIX: Prevent Azure crashes by ensuring
     *    category must be a valid ObjectId OR null.
     * --------------------------------------------- */
    const templates = await ReportTemplate.find({
      $or: [{ tenantId: null, isSystemTemplate: true }, { tenantId }],
      // Prevent Azure CastErrors from bad category values
      $and: [
        {
          $or: [
            { category: { $exists: false } },
            { category: null },
            { category: { $type: "objectId" } },
          ],
        },
      ],
    })
      .populate({
        path: "category",
        select: "_id name label icon color",
        // FIX: If category does not exist, skip instead of error
        match: { _id: { $exists: true } },
      })
      .lean();

    const formattedTemplates = templates.map((t) => ({
      id: t._id.toString(),
      name: t.name,
      label: t.label,
      description: t.description || "No description available",

      category: t.category
        ? {
            id: t.category._id.toString(),
            name: t.category.name,
            label: t.category.label,
            icon: t.category.icon,
            color: t.category.color,
          }
        : null, // ← AZURE SAFE

      configuration: t.configuration || {},
      status: t.status || "active",
      isSystemTemplate: !!t.isSystemTemplate,
      requiredPlans: t.requiredPlans || [],
    }));

    /* -----------------------------------------------
     * RESPONSE
     * --------------------------------------------- */
    return res.json({
      success: true,
      data: {
        categories: formattedCategories,
        templates: formattedTemplates,
      },
    });
  } catch (error) {
    console.error("GET REPORT TEMPLATES ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error fetching templates",
      error: error.message,
    });
  }
};

const saveFilterPreset = async (req, res) => {
  try {
    const { templateId } = req.params;
    const tenantId = res.locals.auth.actingAsTenantId;
    const {
      filters: incomingFilters,
      name = "Default View",
      isDefault = true,
    } = req.body;

    if (!templateId || !tenantId) {
      return res.status(400).json({
        success: false,
        message: "Missing templateId or tenantId",
      });
    }

    // === STEP 1: NORMALIZE FILTERS TO CORRECT FORMAT ===
    let normalizedFilters = [];

    if (incomingFilters) {
      // Case 1: Already correct format → array of { key, value }
      if (Array.isArray(incomingFilters)) {
        normalizedFilters = incomingFilters.filter(
          (f) => f.key && f.value != null
        );
      }
      // Case 2: Old flat object format → { dateRange: "...", status: "draft" }
      else if (
        typeof incomingFilters === "object" &&
        incomingFilters !== null
      ) {
        normalizedFilters = Object.entries(incomingFilters)
          .filter(
            ([key, value]) => value != null && value !== "" && value !== "all"
          )
          .map(([key, value]) => ({
            key,
            value: Array.isArray(value) ? value : value, // preserve arrays (multiselect)
          }));
      }
    }

    // === STEP 2: If isDefault → delete all previous defaults for this template ===
    if (isDefault) {
      await FilterPreset.deleteMany({
        templateId,
        tenantId,
        isDefault: true,
      });
    }

    // === STEP 3: Save the new preset (upsert) ===
    const preset = await FilterPreset.findOneAndUpdate(
      { templateId, tenantId },
      {
        templateId,
        tenantId,
        name: name.trim(),
        filters: normalizedFilters,
        isDefault,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`[FILTER PRESET] Saved "${name}" for template ${templateId}`);

    return res.json({
      success: true,
      message: "Filter preset saved successfully",
      preset: {
        id: preset._id,
        name: preset.name,
        filters: preset.filters,
        isDefault: preset.isDefault,
        updatedAt: preset.updatedAt,
      },
    });
  } catch (error) {
    console.error("[ERROR] Save Filter Preset Failed:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save filter preset",
      error: error.message,
    });
  }
};

const saveColumnConfig = async (req, res) => {
  try {
    // const { templateId } = req.params;
    // const tenantId = req.user.tenantId;
    const { templateId } = req.params;
    const tenantId = res.locals.auth.actingAsTenantId;
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
//sharing report apis

const getReportAccess = async (req, res) => {
  try {
    const { templateId } = req.params;
    const tenantId = res.locals.auth.actingAsTenantId;

    const accessDoc = await TenantReportAccess.findOne({ tenantId, templateId })
      .populate("access.users", "firstName lastName email status")
      // Remove .populate("access.roles") — it doesn't work with string IDs
      .lean();

    if (!accessDoc) {
      return res.json({
        success: true,
        access: { roles: [], users: [] },
      });
    }

    // Manually map roles — since they're stored as strings
    const roleIds = accessDoc.access.roles || [];
    const populatedRoles = roleIds.length > 0
      ? await RolesPermissionObject.find({ _id: { $in: roleIds } }).select("label name").lean()
      : [];

    return res.json({
      success: true,
      access: {
        roles: populatedRoles.map(r => ({
          _id: r._id.toString(),
          name: r.label || r.name || "Unknown Role"
        })),
        users: (accessDoc.access.users || []).map(u => ({
          _id: u._id.toString(),
          name: `${u.firstName || ""} ${u.lastName || ""}`.trim(),
          email: u.email,
        })),
      },
      sharedBy: accessDoc.sharedBy,
      sharedAt: accessDoc.sharedAt,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false });
  }
};

const shareReport = async (req, res) => {
  try {
    const { templateId } = req.params;
    const tenantId = res.locals.auth.actingAsTenantId;
    const sharedBy = res.locals.auth.actingAsUserId;

    const { roleIds = [], userIds = [] } = req.body;

    if (roleIds.length === 0 && userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select at least one role or user",
      });
    }

    // Upsert access (replace previous sharing for this template)
    const accessDoc = await TenantReportAccess.findOneAndUpdate(
      { tenantId, templateId },
      {
        tenantId,
        templateId,
        "access.roles": roleIds.map(id => new mongoose.Types.ObjectId(id)),
        "access.users": userIds.map(id => new mongoose.Types.ObjectId(id)),
        sharedBy,
        sharedAt: new Date(),
        "lastGenerated.at": null,
        "lastGenerated.by": null,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.json({
      success: true,
      message: "Report shared successfully",
      data: {
        sharedWith: {
          roles: roleIds,
          users: userIds,
        },
        sharedAt: accessDoc.sharedAt,
      },
    });
  } catch (error) {
    console.error("[ERROR] Share Report Failed:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to share report",
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

module.exports = {
  getReportTemplates,
  generateReport,
  saveFilterPreset,
  saveColumnConfig,
  getReportAccess,
  shareReport,
  createCategory,
  createTemplate,
};
