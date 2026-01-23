// v1.3.0 - Resume Screening Controller
// Preview mode: Parse + Analyze + Return Results (NO saves)
// Proceed mode: Save to ScreeningResult + Application schemas

const { parseResume } = require("../utils/resumeParser");
const { screenResumeWithSystem } = require("../services/resumeScreening/systemScreeningService");
const { screenResumeWithAI } = require("../services/resumeScreening/aiScreeningService");
const { Position } = require("../models/Position/position");
const { ScreeningResult } = require("../models/ScreeningResult");
const { Application } = require("../models/Application");
const { Resume } = require("../models/Resume");

/**
 * Screen one or more resumes (PREVIEW ONLY - No Database Saves)
 * Returns results with full metadata for display in the frontend table.
 */
exports.screenResume = async (req, res) => {
    try {
        const { positionId, screeningMethod } = req.body;
        const files = req.files;

        const { actingAsUserId, actingAsTenantId } = res.locals.auth || {};
        const tenantId = actingAsTenantId;
        const userId = actingAsUserId;

        const methodToUse = screeningMethod || 'system';

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

        for (const file of files) {
            try {
                // 1. Parse Resume
                const parsedData = await parseResume(file.buffer, file.originalname);

                if (!parsedData.name && (parsedData.fullText || parsedData.resumeText)) {
                    const text = parsedData.fullText || parsedData.resumeText || '';

                    const lines = text
                        .split('\n')
                        .map(line => line.trim())
                        .filter(line => line.length > 0);

                    if (lines.length > 0) {
                        let possibleName = lines[0];

                        const looksLikeName =
                            possibleName.length >= 5 &&
                            possibleName.length <= 60 &&
                            !possibleName.includes('@') &&
                            !possibleName.match(/^\+?\d/) &&
                            !/\d{9,}/.test(possibleName) &&
                            !possibleName.toLowerCase().includes('resume') &&
                            !possibleName.toLowerCase().includes('cv') &&
                            !possibleName.toLowerCase().match(/^(mr|ms|miss|mrs|dr|prof)/i);

                        if (looksLikeName) {
                            parsedData.name = possibleName;
                            console.log("Name fallback applied (first line):", parsedData.name);
                        }
                        // Optional: second line fallback
                        else if (lines.length >= 2) {
                            possibleName = lines[1];
                            if (possibleName.length >= 5 && possibleName.length <= 50 && !possibleName.includes('@')) {
                                parsedData.name = possibleName;
                                console.log("Name fallback applied (second line):", parsedData.name);
                            }
                        }
                    }

                    // Very last fallback — from filename
                    if (!parsedData.name) {
                        parsedData.name = file.originalname
                            .replace(/\.[^/.]+$/, '')
                            .replace(/_/g, ' ')
                            .trim() || 'Candidate';
                        console.log("Name fallback from filename:", parsedData.name);
                    }
                }

                if (!parsedData) {
                    errors.push({
                        fileName: file.originalname,
                        error: "Failed to parse resume"
                    });
                    continue;
                }

                const resumeData = {
                    name: parsedData.name || 'Unknown Candidate',
                    email: parsedData.email || '',
                    phone: parsedData.phone || '',
                    skills: parsedData.skills || [],
                    experience: parsedData.experience || 'Not specified',
                    education: parsedData.education || 'Not specified',
                    rawText: parsedData.fullText || ''
                };

                // 2. Run Screening Analysis (AI or System)
                let metadata = {
                    score: 0,
                    skillMatch: 0,
                    experienceMatch: 0,
                    matchedSkills: [],
                    missingSkills: [],
                    screeningNotes: '',
                    aiRecommendation: '',
                    strengths: [],
                    concerns: [],
                    summary: '',
                    method: methodToUse
                };

                let recommendation = 'HOLD';

                if (methodToUse === 'ai_assistant' || methodToUse === 'ai_claude') {
                    // AI Screening
                    console.log(`Using AI screening method: ${methodToUse}`);
                    const aiResult = await screenResumeWithAI(resumeData, position);
                    if (aiResult.success) {
                        metadata = {
                            score: aiResult.data.score || 0,
                            skillMatch: aiResult.data.skillMatch || 0,
                            experienceMatch: aiResult.data.experienceMatch || 0,
                            matchedSkills: aiResult.data.matchedSkills || [],
                            missingSkills: aiResult.data.missingSkills || [],
                            screeningNotes: aiResult.data.summary || '',
                            aiRecommendation: aiResult.data.recommendation || 'REVIEW',
                            strengths: aiResult.data.strengths || [],
                            concerns: aiResult.data.weaknesses || [],
                            summary: aiResult.data.summary || '',
                            method: 'AI',

                            // New Parsed Data
                            languages: aiResult.data.languages || [],
                            certifications: aiResult.data.certifications || [],
                            projects: aiResult.data.projects || [],
                            workHistory: aiResult.data.workHistory || [],
                            extractedProfile: aiResult.data.extractedProfile || {}
                        };
                        recommendation = aiResult.data.recommendation === 'PROCEED' ? 'PROCEED' :
                            aiResult.data.recommendation === 'REJECT' ? 'REJECT' : 'HOLD';
                    } else {
                        console.warn("AI Screening failed, falling back to system:", aiResult.error);
                        // Fallback to system
                        const systemResult = await screenResumeWithSystem(resumeData, position);
                        if (systemResult.success) {
                            metadata = buildSystemMetadata(systemResult);
                            recommendation = getRecommendation(metadata.score);
                        }
                    }
                } else {
                    // System Screening
                    const systemResult = await screenResumeWithSystem(resumeData, position);
                    if (systemResult.success) {
                        metadata = buildSystemMetadata(systemResult);
                        recommendation = getRecommendation(metadata.score);
                        // For system, we rely on parsedData, so we don't have a separate extractedProfile
                        metadata.extractedProfile = {};
                    } else {
                        metadata.screeningNotes = systemResult.error || 'Screening could not be completed';
                        metadata.concerns.push(systemResult.error || 'Position may not have skills defined');
                        metadata.extractedProfile = {};
                    }
                }

                // 3. Build result object with full metadata

                // Prioritize AI-extracted profile data if available
                const finalName = metadata.extractedProfile?.name || resumeData.name || file.originalname.replace(/\.[^/.]+$/, ""); // Best effort name
                const finalEmail = metadata.extractedProfile?.email || resumeData.email;
                const finalPhone = metadata.extractedProfile?.phone || resumeData.phone;
                const finalExperience = metadata.extractedProfile?.experienceYears ? `${metadata.extractedProfile.experienceYears} Years` : resumeData.experience;
                const finalEducation = metadata.extractedProfile?.education || resumeData.education;

                results.push({
                    id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    fileName: file.originalname,
                    matchStatus: 'new_candidate',

                    // Screening Scores
                    matchPercentage: metadata.score,
                    skillMatch: metadata.skillMatch,
                    experienceMatch: metadata.experienceMatch,

                    // Candidate Info
                    candidateName: finalName || 'Unknown Candidate',
                    candidateEmail: finalEmail,
                    candidatePhone: finalPhone,
                    candidateCountryCode: metadata.extractedProfile?.countryCode || parsedData.countryCode || null,  // ← add this
                    candidatePhoneNumber: metadata.extractedProfile?.phoneNumber || parsedData.phoneNumber || null,

                    // Parsed Data
                    parsedSkills: resumeData.skills,
                    parsedExperience: finalExperience,
                    parsedEducation: finalEducation,

                    // Screening Details (metadata)
                    screeningResult: {
                        summary: metadata.summary,
                        strengths: metadata.strengths,
                        concerns: metadata.concerns,
                        matchedSkills: metadata.matchedSkills,
                        missingSkills: metadata.missingSkills,
                        recommendation: recommendation,
                        screeningNotes: metadata.screeningNotes,
                        aiRecommendation: metadata.aiRecommendation,
                        method: metadata.method,
                        experience_years: metadata.extractedProfile?.experienceYears || (typeof finalExperience === 'string' ? parseFloat(finalExperience) : 0),
                        education: finalEducation,
                        extracted_skills: metadata.matchedSkills.concat(metadata.missingSkills) // combine for display if needed
                    },

                    // Full metadata object for saving later (includes candidate details)
                    metadata: {
                        ...metadata,
                        candidate: {
                            name: finalName,
                            email: finalEmail,
                            phone: finalPhone,
                            countryCode: metadata.extractedProfile?.countryCode || parsedData.countryCode || null,
                            skills: resumeData.skills,
                            experience: finalExperience,
                            education: finalEducation
                        }
                    },
                    recommendation: recommendation,

                    // Store file data for later save
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
 * Save selected candidates when "Proceed Selected" is clicked
 * Creates: ScreeningResult + Application records
 */
exports.createCandidatesFromScreening = async (req, res) => {
    try {
        const { selectedResults, positionId } = req.body;

        const { actingAsUserId, actingAsTenantId } = res.locals.auth || {};
        const tenantId = actingAsTenantId;
        const userId = actingAsUserId;

        if (!selectedResults || selectedResults.length === 0) {
            return res.status(400).json({
                success: false,
                error: "No results selected"
            });
        }

        if (!positionId) {
            return res.status(400).json({
                success: false,
                error: "Position ID is required"
            });
        }

        if (!tenantId) {
            return res.status(401).json({
                success: false,
                error: "Authentication failed: Tenant ID missing"
            });
        }

        console.log(`Saving ${selectedResults.length} screening results for position ${positionId}`);

        const savedResults = [];
        const savedApplications = [];
        const saveErrors = [];

        for (const result of selectedResults) {
            try {
                // Import Candidate model
                const { Candidate } = require("../models/candidate");

                // 1. Find or Create Candidate
                let candidate = null;

                // Try to find by email first
                if (result.candidateEmail) {
                    candidate = await Candidate.findOne({
                        email: result.candidateEmail.toLowerCase(),
                        tenantId: tenantId
                    });
                }

                if (!candidate) {
                    // Split Name
                    const fullName = result.candidateName || 'Unknown';
                    const nameParts = fullName.trim().split(/\s+/);
                    let firstName = fullName;
                    let lastName = '';

                    if (nameParts.length > 1) {
                        lastName = nameParts.pop(); // Last word is last name
                        firstName = nameParts.join(' '); // Remaining is first name
                    }

                    // Create new candidate
                    candidate = new Candidate({
                        tenantId: tenantId,
                        FirstName: firstName,
                        LastName: lastName,
                        // name: result.candidateName || 'Unknown', // Removed legacy field if strictly using First/Last
                        Email: result.candidateEmail?.toLowerCase() || '',
                        Phone: result.candidatePhone || '',
                        CountryCode: result.candidateCountryCode || '+91',
                        linkedInUrl: result.metadata?.linkedIn || result.candidateLinkedIn || '',
                        source: 'Resume Upload',
                        status: 'New',
                        ownerId: userId,
                        createdBy: userId
                    });
                    await candidate.save();
                    console.log(`Created new candidate: ${candidate._id}`);
                }

                // 2. Create Resume record
                let resume = await Resume.findOne({ candidateId: candidate._id }).sort({ _id: -1 });

                if (!resume) {
                    resume = new Resume({
                        candidateId: candidate._id,
                        fileUrl: 'memory://buffer',
                        resume: {
                            filename: result.fileName,
                            uploadDate: new Date()
                        },
                        skills: result.metadata?.matchedSkills?.map(s => ({
                            skill: s,
                            experience: '0',
                            expertise: 'Beginner'
                        })) || [],

                        // New fields
                        certifications: result.metadata?.certifications || [],
                        languages: result.metadata?.languages || [],
                        projects: result.metadata?.projects || [],

                        // Updated profile data
                        CurrentExperience: result.metadata?.extractedProfile?.experienceYears || 0,
                        HigherQualification: result.metadata?.extractedProfile?.education || '',

                        // Full Rich Metadata
                        parsedJson: result.metadata?.extractedProfile || {},

                        source: 'UPLOAD',
                        isActive: true
                    });
                    await resume.save();
                    console.log(`Created new resume: ${resume._id}`);
                }

                const resumeId = resume._id;
                const candidateId = candidate._id;

                // 2. Create ScreeningResult
                const screeningData = {
                    resumeId: resumeId,
                    positionId: positionId,
                    tenantId: tenantId,
                    metadata: result.metadata || {
                        score: result.matchPercentage || 0,
                        skillMatch: result.skillMatch || 0,
                        experienceMatch: result.experienceMatch || 0,
                        matchedSkills: result.screeningResult?.matchedSkills || [],
                        missingSkills: result.screeningResult?.missingSkills || [],
                        screeningNotes: result.screeningResult?.screeningNotes || '',
                        strengths: result.screeningResult?.strengths || [],
                        concerns: result.screeningResult?.concerns || [],
                        summary: result.screeningResult?.summary || '',
                        method: result.screeningResult?.method || 'SYSTEM'
                    },
                    recommendation: result.recommendation || 'HOLD',
                    screenedBy: result.screeningResult?.method || 'SYSTEM',
                    screenedAt: new Date(),
                    ownerId: userId,
                    createdBy: userId
                };

                // Check if screening result already exists for this resume-position pair
                let screeningResult = await ScreeningResult.findOne({
                    resumeId: resumeId,
                    positionId: positionId
                });

                if (screeningResult) {
                    // Update existing
                    Object.assign(screeningResult, screeningData);
                    await screeningResult.save();
                } else {
                    // Create new
                    screeningResult = new ScreeningResult(screeningData);
                    await screeningResult.save();
                }

                savedResults.push(screeningResult);

                // 3. Create Application
                const applicationData = {
                    tenantId: tenantId,
                    positionId: positionId,
                    candidateId: candidateId,
                    status: 'SCREENED',
                    screeningScore: result.matchPercentage || 0,
                    screeningDecision: result.recommendation || 'HOLD',
                    ownerId: userId,
                    createdBy: userId
                };

                // Check if application already exists
                let application = await Application.findOne({
                    candidateId: candidateId,
                    positionId: positionId
                });

                if (application) {
                    // Update existing
                    application.status = 'SCREENED';
                    application.screeningScore = applicationData.screeningScore;
                    application.screeningDecision = applicationData.screeningDecision;
                    application.updatedBy = userId;
                    await application.save();
                } else {
                    // Create new
                    application = new Application(applicationData);
                    await application.save();
                }

                savedApplications.push(application);

            } catch (saveError) {
                console.error(`Error saving result for ${result.fileName}:`, saveError);
                saveErrors.push({
                    fileName: result.fileName,
                    error: saveError.message
                });
            }
        }

        res.json({
            success: true,
            message: `Saved ${savedResults.length} screening results and ${savedApplications.length} applications.`,
            screeningResults: savedResults.map(sr => ({
                id: sr._id,
                resumeId: sr.resumeId,
                positionId: sr.positionId,
                recommendation: sr.recommendation
            })),
            applications: savedApplications.map(app => ({
                id: app._id,
                applicationNumber: app.applicationNumber,
                candidateId: app.candidateId,
                status: app.status
            })),
            errors: saveErrors
        });

    } catch (error) {
        console.error("Create candidates error:", error);
        res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};

// Helper function to build metadata from system screening result
function buildSystemMetadata(systemResult) {
    const score = systemResult.scoringResult?.score || 0;
    const skillMatchLevel = systemResult.scoringResult?.skillMatch;
    const skillMatchNum = skillMatchLevel === 'High' ? 90 :
        skillMatchLevel === 'Medium' ? 70 : 40;

    return {
        score: score,
        skillMatch: skillMatchNum,
        experienceMatch: 0, // System doesn't calculate experience match yet
        matchedSkills: systemResult.scoringResult?.matchedSkills?.map(s => s.skill || s) || [],
        missingSkills: systemResult.scoringResult?.missingRequiredSkills || [],
        screeningNotes: systemResult.insights?.summary || '',
        aiRecommendation: '',
        strengths: systemResult.insights?.strengths || [],
        concerns: systemResult.insights?.concerns || [],
        summary: systemResult.insights?.summary || '',
        method: 'SYSTEM'
    };
}

// Helper function to determine recommendation based on score
function getRecommendation(score) {
    if (score >= 80) return 'PROCEED';
    if (score >= 40) return 'HOLD';
    return 'REJECT';
}

exports.getScreeningStatus = async (req, res) => {
    res.json({ status: "active", service: "Resume Screening Service v1.3" });
};
