// v1.0.0 - Ashok - Integration logs not getting on online fixing in v1
const IntegrationLog = require("../models/IntegrationLogs");

// Helper function to create integration log entry (for middleware use)
exports.createIntegrationLogEntry = async (logData) => {
  try {
    const log = new IntegrationLog({
      ...logData,
      timeStamp: new Date(),
    });

    await log.save();
    return log;
  } catch (error) {
    console.error("Error creating integration log entry:", error.message);
    // Don't throw the error to prevent breaking the main flow
    return null;
  }
};

// Create a new integration log entry
exports.createIntegrationLog = async (req, res) => {
  try {
    const {
      logId,
      status,
      errorCode,
      message,
      serverName,
      severity,
      processName,
      duration,
      requestEndPoint,
      requestMethod,
      requestBody,
      responseStatusCode,
      responseError,
      responseMessage,
      integrationName,
      flowType,
      dateTime,
      responseBody,
    } = req.body;

    const log = new IntegrationLog({
      logId,
      status,
      errorCode,
      message,
      serverName,
      severity,
      processName,
      duration,
      requestEndPoint,
      requestMethod,
      requestBody,
      responseStatusCode,
      responseError,
      responseMessage,
      integrationName,
      flowType,
      dateTime,
      responseBody,
    });

    await log.save();

    res.status(201).json({
      success: true,
      data: log,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating integration log",
      error: error.message,
    });
  }
};

// Get all integration logs with search and pagination
exports.getIntegrationLogs = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query = {
        $or: [
          { logId: { $regex: search, $options: "i" } },
          { processName: { $regex: search, $options: "i" } },
          { status: { $regex: search, $options: "i" } },
          { message: { $regex: search, $options: "i" } },
          { serverName: { $regex: search, $options: "i" } },
          { integrationName: { $regex: search, $options: "i" } },
          { flowType: { $regex: search, $options: "i" } },
        ],
      };
    }

    const [logs, total] = await Promise.all([
      IntegrationLog.find(query)
        .sort({ _id: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      IntegrationLog.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: logs,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching integration logs",
      error: error.message,
    });
  }
};

// Get integration log by ID
exports.getIntegrationLogById = async (req, res) => {
  try {
    const log = await IntegrationLog.findOne({ logId: req.params.id });
    if (!log) {
      return res.status(404).json({
        success: false,
        message: "Integration log not found",
      });
    }

    res.status(200).json({
      success: true,
      data: log,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching integration log",
      error: error.message,
    });
  }
};

// Delete integration log
exports.deleteIntegrationLog = async (req, res) => {
  try {
    const log = await IntegrationLog.findOneAndDelete({ logId: req.params.id });
    if (!log) {
      return res.status(404).json({
        success: false,
        message: "Integration log not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Integration log deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting integration log",
      error: error.message,
    });
  }
};

// SUPER ADMIN added by Ashok ----------------------------------->
// v1.0.0 <-------------------------------------------------------
exports.getAllIntegrationLogs = async (req, res) => {
  try {
    const hasParams = (
      'page' in req.query ||
      'limit' in req.query ||
      'search' in req.query ||
      'status' in req.query ||
      'severity' in req.query
    );

    // Legacy behavior: return full list when no pagination/search/filter params
    if (!hasParams) {
      const logs = await IntegrationLog.find().sort({ _id: -1 });
      return res.status(200).json(logs);
    }

    // Parsed params (page 0-based)
    const page = Math.max(parseInt(req.query.page, 10) || 0, 0);
    const limitRaw = parseInt(req.query.limit, 10);
    const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 100) : 10;
    const search = (req.query.search || '').trim();
    const statusCsv = (req.query.status || '').trim();
    const severityCsv = (req.query.severity || '').trim();

    const statuses = statusCsv ? statusCsv.split(',').map(s => s.trim()).filter(Boolean) : [];
    const severities = severityCsv ? severityCsv.split(',').map(s => s.trim()).filter(Boolean) : [];

    // Build pipeline
    const pipeline = [];

    // Apply filters
    const match = {};
    if (statuses.length) {
      match.status = { $in: statuses };
    }
    if (severities.length) {
      match.severity = { $in: severities };
    }
    if (Object.keys(match).length) {
      pipeline.push({ $match: match });
    }

    if (search) {
      const regex = new RegExp(search, 'i');
      pipeline.push({
        $match: {
          $or: [
            { logId: { $regex: regex } },
            { processName: { $regex: regex } },
            { status: { $regex: regex } },
            { message: { $regex: regex } },
            { serverName: { $regex: regex } },
            { integrationName: { $regex: regex } },
            { flowType: { $regex: regex } },
            { requestEndPoint: { $regex: regex } },
            { requestMethod: { $regex: regex } },
            { code: { $regex: regex } },
            { correlationId: { $regex: regex } },
          ]
        }
      });
    }

    // Sort newest first
    pipeline.push({ $sort: { _id: -1 } });

    // Facet for pagination and stats (counts ignore pagination but respect filters/search)
    pipeline.push({
      $facet: {
        data: [
          { $skip: page * limit },
          { $limit: limit },
        ],
        totalCount: [ { $count: 'count' } ],
        statusAgg: [ { $group: { _id: '$status', count: { $sum: 1 } } } ],
        severityAgg: [ { $group: { _id: '$severity', count: { $sum: 1 } } } ],
      }
    });

    const result = await IntegrationLog.aggregate(pipeline);
    const facet = result?.[0] || { data: [], totalCount: [], statusAgg: [], severityAgg: [] };

    const data = facet.data || [];
    const totalItems = facet.totalCount?.[0]?.count || 0;

    // Transform status/severity aggs to maps
    const statusCounts = {};
    for (const s of facet.statusAgg || []) statusCounts[s._id || 'unknown'] = s.count;
    const severityCounts = {};
    for (const s of facet.severityAgg || []) severityCounts[s._id || 'unknown'] = s.count;

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalItems / limit) || 0,
        totalItems,
        hasNext: (page + 1) * limit < totalItems,
        hasPrev: page > 0,
        itemsPerPage: limit,
      },
      stats: {
        byStatus: statusCounts,
        bySeverity: severityCounts,
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching integration logs",
      error: error.message,
    });
  }
};
//v1.0.0 --------------------------------------------------------->

// Get integration log by ID added by Ashok
exports.getIntegrationById = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await IntegrationLog.findById(id);

    res.status(200).json(log);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching integration log",
      error: error.message,
    });
  }
};

// -------------------------------------------------------------->
