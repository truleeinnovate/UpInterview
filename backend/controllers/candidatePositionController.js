//<-----v1.0.1---Venkatesh------add permission
const CandidatePosition = require("../models/CandidatePosition.js");
const mongoose = require("mongoose");

const getAllCandidatePositions = async (req, res) => {
  try {
    res.locals.loggedByController = true;
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
      .populate("candidateId")
      .populate("positionId")
      .populate("interviewId");
    res.status(200).json(candidatePositions);
  } catch (error) {
    console.error("Error fetching candidate positions:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const createCandidatePosition = async (req, res, data) => {
  try {
    res.locals.loggedByController = true;
    //<-----v1.0.1---
    // Permission: Tasks.Create (or super admin override)
    //     const canCreate =
    //     await hasPermission(res.locals?.effectivePermissions?.Candidates, 'Create')
    //    //await hasPermission(res.locals?.superAdminPermissions?.Candidates, 'Create')
    //     if (!canCreate) {
    //       return res.status(403).json({ message: 'Forbidden: missing Candidates.Create permission' });
    //     }
    //-----v1.0.1--->

    // const candidatePosition = new CandidatePosition(req.body || data);
    const candidatePosition = new createCandidatePositionService(data);
    // await candidatePosition.save();
    res.status(201).json(candidatePosition);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createCandidatePositionService = async (data) => {
  try {
    const candidatePosition = new CandidatePosition(data);
    return await candidatePosition.save();
  } catch (error) {
    throw new Error(error.message);
  }
};

const getCandidatePositionsByCandidateId = async (req, res) => {
  try {
    res.locals.loggedByController = true;

    const { candidateId } = req.params;

    if (!candidateId) {
      return res
        .status(400)
        .json({ message: "Candidate ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(candidateId)) {
      return res
        .status(400)
        .json({ message: "Invalid candidate ID format" });
    }

    const candidatePositions = await CandidatePosition.aggregate([
      {
        $match: { candidateId: new mongoose.Types.ObjectId(candidateId) },
      },
      {
        $lookup: {
          from: "positions",
          localField: "positionId",
          foreignField: "_id",
          as: "positionDetails",
        },
      },
      {
        $unwind: {
          path: "$positionDetails",
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    const positions = candidatePositions.map((pos) => ({
      positionId: pos.positionId,
      status: pos.status,
      interviewId: pos.interviewId,
      interviewRound: pos.interviewRound,
      interviewFeedback: pos.interviewFeedback,
      offerDetails: pos.offerDetails,
      applicationDate: pos.applicationDate,
      updatedAt: pos.updatedAt,
      positionInfo: pos.positionDetails
        ? {
            title: pos.positionDetails.title || "",
            companyname: pos.positionDetails.companyname || "",
            jobdescription: pos.positionDetails.jobdescription || "",
            minexperience: pos.positionDetails.minexperience || 0,
            maxexperience: pos.positionDetails.maxexperience || 0,
            skills: pos.positionDetails.skills || [],
            additionalnotes: pos.positionDetails.additionalnotes || "",
            rounds: pos.positionDetails.rounds || [],
            createdBy: pos.positionDetails.CreatedBy || "",
            lastModifiedById: pos.positionDetails.LastModifiedById || "",
            ownerId: pos.positionDetails.ownerId || "",
            tenantId: pos.positionDetails.tenantId || "",
            createdDate: pos.positionDetails.createdDate || "",
          }
        : null,
    }));

    return res.status(200).json({ data: positions });
  } catch (error) {
    console.error(
      "Error fetching candidate positions by candidateId:",
      error
    );
    res.status(500).json({
      message: "Error fetching candidate positions",
      error: error.message,
    });
  }
};


module.exports = {
  createCandidatePosition,
  getAllCandidatePositions,
  createCandidatePositionService,
  getCandidatePositionsByCandidateId
};
