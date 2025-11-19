// v1.0.0 - Ashok - added sort by _id to get the latest at getLogsSummary controller
const InternalLog = require("../models/InternalLog");

exports.createLog = async (logDetails) => {
  //  console.log("logDetails", logDetails);
  try {
  //  console.log("logDetails", logDetails);
    const log = new InternalLog(logDetails);
    await log.save();
    return log;
  } catch (error) {
    console.error("Error creating log:", error);
    throw error;
  }
};

// Get all logs with search and pagination
exports.getLogs = async (req, res) => {
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
        ],
      };
    }

    const [logs, total] = await Promise.all([
      InternalLog.find(query)
       .sort({ _id : -1 })
        // .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      InternalLog.countDocuments(query),
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
      message: "Error fetching logs",
      error: error.message,
    });
  }
};

// Get log by ID
exports.getLogById = async (req, res) => {
  try {
    const { id } = req.params;
    const log = await InternalLog.findById(id);

    res.status(200).json(log);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching log",
      error: error.message,
    });
  }
};

// Delete log
exports.deleteLog = async (req, res) => {
  try {
    const log = await InternalLog.findByIdAndDelete(req.params.id);
    if (!log) {
      return res.status(404).json({
        success: false,
        message: "Log not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Log deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting log",
      error: error.message,
    });
  }
};

// SUPER ADMIN added by Ashok ------------------------------------->
// SUPER ADMIN added by Venkatesh - Enhanced with pagination and filters
exports.getLogsSummary = async (req, res) => {
  try {
    const {
      page = 0,
      limit = 10,
      search = '',
      status = '',
      severity = '',
      processName = '',
      startDate = '',
      endDate = ''
    } = req.query;

    const skip = parseInt(page) * parseInt(limit);
    const limitNum = parseInt(limit);

    // Build query
    let query = {};

    // Search across multiple fields
    if (search) {
      const safeSearch = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(safeSearch, 'i');
      query.$or = [
        { logId: searchRegex },
        { processName: searchRegex },
        { message: searchRegex },
        { serverName: searchRegex },
        { requestEndPoint: searchRegex }
      ];
    }

    // Filter by status
    if (status) {
      query.status = { $in: status.split(',') };
    }

    // Filter by severity
    if (severity) {
      query.severity = { $in: severity.split(',') };
    }

    // Filter by process name
    if (processName) {
      query.processName = new RegExp(processName, 'i');
    }

    // Date range filter
    if (startDate || endDate) {
      query.timeStamp = {};
      if (startDate) {
        query.timeStamp.$gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        query.timeStamp.$lte = endDateTime;
      }
    }

    // Get total count for pagination
    const total = await InternalLog.countDocuments(query);

    // Fetch paginated logs
    const logs = await InternalLog.find(query)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Calculate summary stats using lightweight counts (avoids heavy aggregation)
    const { status: statusFilter, ...queryWithoutStatus } = query;
    const selectedStatuses = Array.isArray(statusFilter?.$in)
      ? statusFilter.$in
      : (typeof statusFilter === 'string' ? [statusFilter] : null);

    const shouldCount = (s) => !selectedStatuses || selectedStatuses.includes(s);

    const [errorCount, warningCount, successCount] = await Promise.all([
      shouldCount('error')
        ? InternalLog.countDocuments({ ...queryWithoutStatus, status: 'error' })
        : Promise.resolve(0),
      shouldCount('warning')
        ? InternalLog.countDocuments({ ...queryWithoutStatus, status: 'warning' })
        : Promise.resolve(0),
      shouldCount('success')
        ? InternalLog.countDocuments({ ...queryWithoutStatus, status: 'success' })
        : Promise.resolve(0),
    ]);

    const stats = {
      totalLogs: total,
      errorLogs: errorCount,
      warningLogs: warningCount,
      successLogs: successCount,
    };

    res.status(200).json({
      data: logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        hasNext: skip + limitNum < total,
        hasPrev: parseInt(page) > 0,
        itemsPerPage: limitNum
      },
      stats: {
        totalLogs: stats.totalLogs,
        errorLogs: stats.errorLogs,
        warningLogs: stats.warningLogs,
        successLogs: stats.successLogs
      },
      status: true
    });
  } catch (error) {
    console.error("Error fetching log summary:", error);
    res.status(500).json({
      message: "Server error while fetching logs",
      details: error.message,
      status: false
    });
  }
};

// ----------------------------------------------------------------->
