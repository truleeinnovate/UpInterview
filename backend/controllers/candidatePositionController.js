//<-----v1.0.1---Venkatesh------add permission
const CandidatePosition = require('../models/CandidatePosition.js');

const getAllCandidatePositions = async (req, res) => {
    try {
        res.locals.loggedByController = true;
        //console.log("effectivePermissions",res.locals?.effectivePermissions)
        //<-----v1.0.1---
        // Permission: Tasks.Create (or super admin override)
    //     const canCreate =
    //     await hasPermission(res.locals?.effectivePermissions?.Candidates, 'View')
    //    //await hasPermission(res.locals?.superAdminPermissions?.Candidates, 'View')
    //     if (!canCreate) {
    //       return res.status(403).json({ message: 'Forbidden: missing Candidates.View permission' });
    //     }
        //-----v1.0.1--->

        const candidatePositions = await CandidatePosition.find()
            .populate('candidateId')
            .populate('positionId')
            .populate('interviewId');
        res.status(200).json(candidatePositions);
    } catch (error) {
        console.error("Error fetching candidate positions:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const createCandidatePosition = async (req, res) => {
    try {
        res.locals.loggedByController = true;
        //console.log("effectivePermissions",res.locals?.effectivePermissions)
        //<-----v1.0.1---
        // Permission: Tasks.Create (or super admin override)
    //     const canCreate =
    //     await hasPermission(res.locals?.effectivePermissions?.Candidates, 'Create')
    //    //await hasPermission(res.locals?.superAdminPermissions?.Candidates, 'Create')
    //     if (!canCreate) {
    //       return res.status(403).json({ message: 'Forbidden: missing Candidates.Create permission' });
    //     }
        //-----v1.0.1--->

        const candidatePosition = new CandidatePosition(req.body);
        await candidatePosition.save();
        res.status(201).json(candidatePosition);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createCandidatePosition, getAllCandidatePositions };