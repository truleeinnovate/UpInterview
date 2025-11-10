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
exports.getLogsSummary = async (req, res) => {
  try {
    // v1.0.0 <---------------------------------------------------------------
    const logs = await InternalLog.find().sort({ _id: -1 });
    // v1.0.0 <---------------------------------------------------------------

    const totalLogs = logs.length;
    const errorLogs = logs.filter((log) => log.status === "error").length;
    const warningLogs = logs.filter((log) => log.status === "warning").length;
    const successLogs = logs.filter((log) => log.status === "success").length;

    res.status(200).json({
      totalLogs,
      errorLogs,
      warningLogs,
      successLogs,
      logs,
    });
  } catch (error) {
    console.error("Error fetching log summary:", error);
    res.status(500).json({
      message: "Server error while fetching logs",
      details: error.message,
    });
  }
};

// ----------------------------------------------------------------->
