const IntegrationLog = require('../models/IntegrationLogs');

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
            responseBody
            
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
            responseBody
            
        });

        await log.save();

        res.status(201).json({
            success: true,
            data: log
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error creating integration log',
            error: error.message
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
                    { logId: { $regex: search, $options: 'i' } },
                    { processName: { $regex: search, $options: 'i' } },
                    { status: { $regex: search, $options: 'i' } },
                    { message: { $regex: search, $options: 'i' } },
                    { serverName: { $regex: search, $options: 'i' } },
                    { integrationName: { $regex: search, $options: 'i' } },
                    { flowType: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const [logs, total] = await Promise.all([
            IntegrationLog.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            IntegrationLog.countDocuments(query)
        ]);

        res.status(200).json({
            success: true,
            data: logs,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching integration logs',
            error: error.message
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
                message: 'Integration log not found'
            });
        }

        res.status(200).json({
            success: true,
            data: log
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching integration log',
            error: error.message
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
                message: 'Integration log not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Integration log deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting integration log',
            error: error.message
        });
    }
};
