const InternalLog = require('../models/InternalLog');

exports.createLog = async (logDetails) => { 
    try { 
        const log = new InternalLog(logDetails); 
        await log.save(); 
        return log; 
    } catch (error) { 
        console.error('Error creating log:', error); 
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
                    { logId: { $regex: search, $options: 'i' } },
                    { processName: { $regex: search, $options: 'i' } },
                    { status: { $regex: search, $options: 'i' } },
                    { message: { $regex: search, $options: 'i' } },
                    { serverName: { $regex: search, $options: 'i' } }
                ]
            };
        }

        const [logs, total] = await Promise.all([
            InternalLog.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            InternalLog.countDocuments(query)
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
            message: 'Error fetching logs',
            error: error.message
        });
    }
};

// Get log by ID
exports.getLogById = async (req, res) => {
    try {
        const log = await InternalLog.findOne({ logId: req.params.id });
        if (!log) {
            return res.status(404).json({
                success: false,
                message: 'Log not found'
            });
        }

        res.status(200).json({
            success: true,
            data: log
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching log',
            error: error.message
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
                message: 'Log not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Log deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting log',
            error: error.message
        });
    }
};
