// Global Search Routes
const express = require("express");
const router = express.Router();
const { globalSearch } = require("../controllers/globalSearchController");
const { permissionMiddleware } = require("../middleware/permissionMiddleware");
const { authContextMiddleware } = require("../middleware/authContext");

/**
 * GET /api/global-search
 * Search across all entities
 * 
 * Query Parameters:
 * - q: Search term (required)
 * - mode: 'contains' or 'startsWith' (default: 'contains')
 * - filter: Entity type to filter (optional)
 * - limit: Max results per entity (default: 10, max: 50)
 */
router.get("/", permissionMiddleware, authContextMiddleware, globalSearch);

module.exports = router;
