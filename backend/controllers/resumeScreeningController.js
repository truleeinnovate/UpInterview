// v1.2.0 - Resume Screening Controller (Preview-Only Mode)
// For now: Parse + Analyze + Return Results (NO database saves)
// Database saving will be implemented in a separate "Proceed" step later

const { parseResume } = require("../utils/resumeParser");
const { screenResumeWithSystem } = require("../services/resumeScreening/systemScreeningService");
const { screenResumeWithAI } = require("../services/resumeScreening/aiScreeningService");
const { Position } = require("../models/Position/position");

/**
 * Screen one or more resumes (PREVIEW ONLY - No Database Saves)
 * Handles file upload, parsing, and screening analysis.
 * Returns results for display in the frontend table.
 */
exports.screenResume = async (req, res) => {
    try {
        const { positionId, method } = req.body;
        const files = req.files;

        // userId and tenantId from authenticated user (via authContextMiddleware)
        const { actingAsUserId, actingAsTenantId } = res.locals.auth || {};
        const tenantId = actingAsTenantId;

        // Fallback for method if undefined (default to system)
        const methodToUse = method || 'system';

        if (!files || files.length === 0) {
            return res.status(400).json({
                success: false,
                error: "No resume files uploaded",
            });
        }

        if (!positionId) {
            return res.status(400).json({
                success: false,
                error: "Position ID is required",
            });
        }

        // Get Position for screening comparison
        const position = await Position.findById(positionId);
        if (!position) {
            return res.status(404).json({
                success: false,
                error: "Position not found",
            });
        }

        console.log(`Processing ${files.length} resumes with method: ${methodToUse}`);

        const results = [];
        const errors = [];

        // Process each file
        for (const file of files) {
            try {
                // 1. Parse Resume (extract text and data)
                const parsedData = await parseResume(file.buffer, file.originalname);

                if (!parsedData) {
                    errors.push({
                        fileName: file.originalname,
                        error: "Failed to parse resume"
                    });
                    continue;
                }

                // 2. Prepare resume data for screening
                const resumeData = {
                    name: parsedData.name || 'Unknown Candidate',
                    email: parsedData.email || '',
                    phone: parsedData.phone || '',
                    skills: parsedData.skills || [],
                    experience: parsedData.experience || 'Not specified',
                    education: parsedData.education || 'Not specified',
                    rawText: parsedData.fullText || ''
                };

                // 3. Run Screening Analysis (AI or System) - NO DATABASE SAVE
                let screeningResult = {
                    score: 0,
                    skillMatch: 0,
                    matchedSkills: [],
                    missingSkills: [],
                    insights: { strengths: [], concerns: [], summary: '' }
                };

                if (methodToUse === 'ai_assistant' || methodToUse === 'ai_claude') {
                    // AI Screening
                    const aiResult = await screenResumeWithAI(resumeData, position);
                    if (aiResult.success) {
                        screeningResult = {
                            score: aiResult.data.score || 0,
                            skillMatch: aiResult.data.skillMatch || 0,
                            matchedSkills: aiResult.data.matchedSkills || [],
                            missingSkills: aiResult.data.missingSkills || [],
                            insights: {
                                strengths: aiResult.data.strengths || [],
                                concerns: aiResult.data.weaknesses || [],
                                summary: aiResult.data.summary || ''
                            },
                            recommendation: aiResult.data.recommendation || 'REVIEW'
                        };
                    } else {
                        console.warn("AI Screening failed:", aiResult.error);
                        // Fallback to system screening
                        const systemResult = await screenResumeWithSystem(resumeData, position);
                        if (systemResult.success) {
                            screeningResult = {
                                score: systemResult.scoringResult.score || 0,
                                skillMatch: systemResult.scoringResult.skillMatch === 'High' ? 90 :
                                    systemResult.scoringResult.skillMatch === 'Medium' ? 70 : 40,
                                matchedSkills: systemResult.scoringResult.matchedSkills?.map(s => s.skill || s) || [],
                                missingSkills: systemResult.scoringResult.missingRequiredSkills || [],
                                insights: systemResult.insights,
                                recommendation: systemResult.scoringResult.score >= 80 ? 'PROCEED' :
                                    systemResult.scoringResult.score >= 40 ? 'HOLD' : 'REJECT'
                            };
                        }
                    }
                } else {
                    // System Screening (Manual Calculation)
                    const systemResult = await screenResumeWithSystem(resumeData, position);
                    if (systemResult.success) {
                        screeningResult = {
                            score: systemResult.scoringResult.score || 0,
                            skillMatch: systemResult.scoringResult.skillMatch === 'High' ? 90 :
                                systemResult.scoringResult.skillMatch === 'Medium' ? 70 : 40,
                            matchedSkills: systemResult.scoringResult.matchedSkills?.map(s => s.skill || s) || [],
                            missingSkills: systemResult.scoringResult.missingRequiredSkills || [],
                            insights: systemResult.insights,
                            recommendation: systemResult.scoringResult.score >= 80 ? 'PROCEED' :
                                systemResult.scoringResult.score >= 40 ? 'HOLD' : 'REJECT'
                        };
                    } else {
                        screeningResult.insights.summary = systemResult.error || 'Screening could not be completed';
                        screeningResult.insights.concerns.push(systemResult.error || 'Position may not have skills defined');
                    }
                }

                // 4. Build result object for frontend (NO IDs since nothing saved)
                results.push({
                    id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Temporary ID
                    fileName: file.originalname,
                    matchStatus: 'new_candidate', // Always new since not checking DB
                    matchPercentage: screeningResult.score,
                    skillMatch: screeningResult.skillMatch,
                    experienceScore: 0, // Placeholder
                    candidateName: resumeData.name,
                    candidateEmail: resumeData.email,
                    candidatePhone: resumeData.phone,
                    parsedSkills: resumeData.skills, // Skills extracted from resume
                    parsedExperience: resumeData.experience,
                    parsedEducation: resumeData.education,
                    screeningResult: {
                        summary: screeningResult.insights?.summary || '',
                        strengths: screeningResult.insights?.strengths || [],
                        concerns: screeningResult.insights?.concerns || [],
                        matchedSkills: screeningResult.matchedSkills,
                        missingSkills: screeningResult.missingSkills,
                        recommendation: screeningResult.recommendation || 'REVIEW'
                    },
                    // Store raw file buffer for later save (if needed)
                    _fileBuffer: file.buffer.toString('base64'),
                    _originalName: file.originalname,
                    _mimeType: file.mimetype
                });

            } catch (fileError) {
                console.error(`Error processing file ${file.originalname}:`, fileError);
                errors.push({
                    fileName: file.originalname,
                    error: fileError.message
                });
            }
        }

        res.json({
            success: true,
            results,
            errors,
            message: `Analyzed ${results.length} resumes successfully. ${errors.length} errors.`,
            // Flag to indicate this is preview-only (not saved yet)
            previewOnly: true
        });

    } catch (error) {
        console.error("Resume screening error:", error);
        res.status(500).json({
            success: false,
            error: "Internal server error during screening",
        });
    }
};

/**
 * Create candidates from screening results (TO BE IMPLEMENTED LATER)
 * This will be called when user clicks "Proceed" to save the data.
 */
exports.createCandidatesFromScreening = async (req, res) => {
    try {
        const { candidates, positionId } = req.body;

        // TODO: Implement actual saving logic when user requests
        // 1. Create Candidate records
        // 2. Save Resume records
        // 3. Create ScreeningResult records
        // 4. Create Application records

        res.json({
            success: true,
            message: "Save functionality will be implemented in next phase",
            processedCount: candidates?.length || 0
        });
    } catch (error) {
        console.error("Create candidates error:", error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

exports.getScreeningStatus = async (req, res) => {
    res.json({ status: "active", service: "Resume Screening Service v1.2 (Preview Mode)" });
};
