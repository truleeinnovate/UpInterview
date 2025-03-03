const notificationController = require("../controllers/notificationController");

const notificationMiddleware = async (req, res, next) => {
    try {
        if (!req.notificationData || req.notificationData.length === 0) {
            return next();
        }

        // Pass data to notification controller
        req.body.notifications = req.notificationData;
        
        // Call saveNotifications but without passing res
        await notificationController.saveNotifications(req);
        
        next(); // Move to the next middleware
    } catch (error) {
        console.error("Error in notification middleware:", error);
        return res.status(500).json({ success: false, message: "Error processing notification" });
    }
};


module.exports = notificationMiddleware;
