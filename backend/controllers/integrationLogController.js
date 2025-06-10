const IntegrationLog = require("../models/IntegrationLogs");

// Create a new integration log entry
// exports.createIntegrationLog = async (req, res) => {
//   try {
//     const {
//       logId,
//       status,
//       errorCode,
//       message,
//       serverName,
//       severity,
//       processName,
//       duration,
//       requestEndPoint,
//       requestMethod,
//       requestBody,
//       responseStatusCode,
//       responseError,
//       responseMessage,
//       integrationName,
//       flowType,
//       dateTime,
//       responseBody,
//     } = req.body;

//     const log = new IntegrationLog({
//       logId,
//       status,
//       errorCode,
//       message,
//       serverName,
//       severity,
//       processName,
//       duration,
//       requestEndPoint,
//       requestMethod,
//       requestBody,
//       responseStatusCode,
//       responseError,
//       responseMessage,
//       integrationName,
//       flowType,
//       dateTime,
//       responseBody,
//     });

//     await log.save();

//     res.status(201).json({
//       success: true,
//       data: log,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Error creating integration log",
//       error: error.message,
//     });
//   }
// };

// SUPER ADMIN added By Ashok
exports.createIntegrationLog = async (req, res) => {
  try {
    // Get total count of existing logs
    const count = await IntegrationLog.countDocuments();

    // Generate logId in the format 00001, 00002, etc.
    const generatedLogId = "LOG_" + String(count + 1).padStart(5, "0");

    const {
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
      logId: generatedLogId,
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
        .sort({ createdAt: -1 })
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

// SUPER ADMIN added by Ashok
exports.getAllIntegrationLogs = async (req, res) => {
  try {
    const logs = await IntegrationLog.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching integration logs",
      error: error.message,
    });
  }
};

// this controller gives log id as LOG_0001, LOG_0002 for testing
// exports.getAllIntegrationLogs = async (req, res) => {
//   try {
//     const logs = await IntegrationLog.find();

//     const data = logs.map((doc, idx) => {
//       const log = doc.toObject(); // convert Mongoose doc to plain JS
//       let id = log.logId;

//       if (!/^LOG_\d{5}$/.test(id)) {
//         const n = parseInt(id, 10);
//         id = !Number.isNaN(n)
//           ? `LOG_${String(n).padStart(5, "0")}`
//           : `LOG_${String(logs.length - idx).padStart(5, "0")}`;
//       }

//       log.logId = id; // overwrite / add the corrected id
//       return log;
//     });

//     res.status(200).json({ success: true, data });
//   } catch (error) {
//     res
//       .status(500)
//       .json({
//         success: false,
//         message: "Error fetching integration logs",
//         error: error.message,
//       });
//   }
// };

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

// Get integration log by ID added by Ashok
exports.getIntegrationById = async (req, res) => {
  try {
    const log = await IntegrationLog.findOne(req.params.integrationId);
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
