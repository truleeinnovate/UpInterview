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
const { generateApplicationNumber } = require("../services/uniqueIdGeneratorService");
const { Candidate } = require("../models/candidate");

// ===================== Helper: Find Existing Candidate (Tenant Scoped) =====================
const findExistingCandidate = async ({ email, phone, linkedInUrl, tenantId }) => {
    const orConditions = [];

    if (email) orConditions.push({ Email: email });
    if (phone) orConditions.push({ Phone: phone });
    if (linkedInUrl) orConditions.push({ linkedInUrl });

    if (orConditions.length === 0) return null;

   return Candidate.findOne({
    tenantId,
    $or: [
        email ? { Email: email } : null,
        phone ? { Phone: phone } : null,
        linkedInUrl ? { linkedInUrl } : null
    ].filter(Boolean)
});
};


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

                  // ===================== 2. Existing Candidate Check =====================
                const existingCandidate = await findExistingCandidate({
                    email: resumeData.email,
                    phone: resumeData.phone,
                    linkedInUrl: parsedData.linkedInUrl,
                    tenantId
                });

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

                let extractedProfile = {};

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
                            extractedProfile = systemResult.extractedProfile || {};
                        }
                    }
                } else {
                    // System Screening
                    const systemResult = await screenResumeWithSystem(resumeData, position);
                    if (systemResult.success) {
                        metadata = buildSystemMetadata(systemResult);
                        recommendation = getRecommendation(metadata.score);
                        // For system, we rely on parsedData, so we don't have a separate extractedProfile
                        extractedProfile = systemResult.extractedProfile || {};
                    } else {
                        metadata.screeningNotes = systemResult.error || 'Screening could not be completed';
                        metadata.concerns.push(systemResult.error || 'Position may not have skills defined');
                        extractedProfile = {};
                    }
                }

                // 3. Build result object with full metadata

                // Prioritize AI-extracted profile data if available
                const finalName = extractedProfile?.name || resumeData.name || file.originalname.replace(/\.[^/.]+$/, ""); // Best effort name
                const finalEmail = extractedProfile?.email || resumeData.email;
                const finalPhone = extractedProfile?.phone || resumeData.phone;
                const finalExperience = extractedProfile?.experienceYears ? `${extractedProfile.experienceYears} Years` : resumeData.experience;
                const finalEducation = extractedProfile?.education || resumeData.education;

                results.push({
                    id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    fileName: file.originalname,
                     matchStatus: existingCandidate ? 'existing_candidate' : 'new_candidate',
                     existingCandidateId: existingCandidate?._id || null,
                    // Screening Scores
                    matchPercentage: metadata.score,
                    skillMatch: metadata.skillMatch,
                    experienceMatch: metadata.experienceMatch,

                    // Candidate Info
                    candidateName: finalName || 'Unknown Candidate',
                    candidateEmail: finalEmail,
                    candidatePhone: finalPhone,
                    candidateCountryCode: extractedProfile?.countryCode || parsedData.countryCode || null,  // ← add this
                    candidatePhoneNumber: extractedProfile?.phoneNumber || parsedData.phoneNumber || null,

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
                        experience_years: extractedProfile?.experienceYears || (typeof finalExperience === 'string' ? parseFloat(finalExperience) : 0),
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
                            countryCode: extractedProfile?.countryCode || parsedData.countryCode || null,
                            skills: resumeData.skills,
                            experience: finalExperience,
                            education: finalEducation
                        },
                        extractedProfile: extractedProfile  // Ensure it's included here
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
        console.log("results",results);

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
// this will create candidate after application and screening data also
// exports.createCandidatesFromScreening = async (req, res) => {
//   try {
//     const { selectedResults, positionId } = req.body;

//     const { actingAsUserId, actingAsTenantId } = res.locals.auth || {};
//     const tenantId = actingAsTenantId;
//     const userId = actingAsUserId;

//     if (!Array.isArray(selectedResults) || selectedResults.length === 0) {
//       return res.status(400).json({
//         success: false,
//         error: "No results selected"
//       });
//     }

//     if (!positionId) {
//       return res.status(400).json({
//         success: false,
//         error: "Position ID is required"
//       });
//     }

//     if (!tenantId || !userId) {
//       return res.status(401).json({
//         success: false,
//         error: "Authentication failed: missing tenant or user"
//       });
//     }

//     console.log(`Saving ${selectedResults.length} screening results for position ${positionId}`);

//     const savedScreeningResults = [];
//     const savedApplications = [];
//     const errors = [];

//     const position = await Position.findById(positionId);
//     if (!position) {
//       return res.status(404).json({
//         success: false,
//         error: "Position not found"
//       });
//     }

//     for (const result of selectedResults) {
//       try {
//         // 1. Find or create Candidate
//         let candidate = null;

//         if (result.candidateEmail?.trim()) {
//           candidate = await Candidate.findOne({
//             email: result.candidateEmail.toLowerCase().trim(),
//             tenantId
//           });
//         }

//         if (!candidate) {
//           const fullName = (result.candidateName || "Unknown").trim();
//           const nameParts = fullName.split(/\s+/);
//           const firstName = nameParts[0] || "";
//           const lastName = nameParts.slice(1).join(" ") || "";

//           candidate = new Candidate({
//             tenantId,
//             FirstName: firstName,
//             LastName: lastName,
//             Email: result.candidateEmail?.toLowerCase().trim() || "",
//             Phone: result.candidatePhone || "",
//             CountryCode: result.candidateCountryCode || "+91",
//             source: "Resume Upload",
//             status: "New",
//             ownerId: userId,
//             createdBy: userId
//           });

//           await candidate.save();
//           console.log(`Created candidate: ${candidate._id}`);
//         }

//         // 2. Find or create Resume
//         let resume = await Resume.findOne({ candidateId: candidate._id }).sort({
//           createdAt: -1
//         });

//         if (!resume) {
//           const skillsArray = (result.parsedSkills || []).map((skillName) => ({
//             skill: skillName.trim(),
//             experience: String(result.parsedData?.experienceYears || "0"),
//             expertise: "Beginner"
//           }));

//           resume = new Resume({
//             candidateId: candidate._id,
//             fileUrl: "memory://buffer", // TODO: replace with real cloud URL
//             resume: {
//               filename: result.fileName || "resume.pdf",
//               uploadDate: new Date()
//             },

//             // Normalized fields
//             skills: skillsArray,
//             CurrentExperience: Number(result.parsedExperienceYears) || 0,
//             RelevantExperience: Number(result.parsedExperienceYears) || 0,
//             HigherQualification: result.parsedEducation || "Not specified",

//             languages: result.parsedData?.languages || [],
//             certifications: result.parsedData?.certifications || [],
//             projects: result.parsedData?.projects || [],

//             // === FULL PARSED DATA STORAGE ===
//             parsedJson: result.parsedData || {
//               fullText: "",
//               extractedProfile: {},
//               parsedAt: new Date().toISOString(),
//               parserVersion: result.metadata?.method || "SYSTEM"
//             },

//             // Optional: helps with full-text search
//             searchText: [
//               result.candidateName || "",
//               result.parsedEducation || "",
//               (result.parsedSkills || []).join(" "),
//               result.parsedData?.fullText?.substring(0, 1500) || ""
//             ].filter(Boolean).join(" ").toLowerCase(),

//             source: "UPLOAD",
//             isActive: true,
//             ownerId: userId,
//             tenantId,
//             createdBy: userId
//           });

//           await resume.save();
//           console.log(`Created resume: ${resume._id}`);
//         }

//         const resumeId = resume._id.toString();
//         const candidateId = candidate._id.toString();

//         // 3. Create / Update ScreeningResult
//         const screeningData = {
//           resumeId,
//           positionId,
//           tenantId,
//           metadata: {
//             score: Number(result.matchPercentage) || 0,
//             skillMatch: Number(result.skillMatch) || 0,
//             experienceMatch: Number(result.experienceMatch) || 0,
//             matchedSkills: result.matchedSkills || [],
//             missingSkills: result.missingSkills || [],
//             summary: result.summary || "",
//             strengths: result.strengths || [],
//             concerns: result.concerns || [],
//             method: result.metadata?.method || "SYSTEM"
//           },
//           recommendation: result.recommendation || "HOLD",
//           screenedBy: result.metadata?.method || "SYSTEM",
//           screenedAt: new Date(),
//           ownerId: userId,
//           createdBy: userId
//         };

//         let screeningResult = await ScreeningResult.findOne({
//           resumeId,
//           positionId
//         });

//         if (screeningResult) {
//           Object.assign(screeningResult, screeningData);
//           await screeningResult.save();
//         } else {
//           screeningResult = new ScreeningResult(screeningData);
//           await screeningResult.save();
//         }

//         savedScreeningResults.push(screeningResult);

//         // 4. Create / Update Application
//         let application = await Application.findOne({
//           candidateId,
//           positionId,
//           tenantId
//         });

//         const applicationNumber = await generateApplicationNumber(
//           candidate,
//           position,
//           tenantId
//         );

//         const appData = {
//           applicationNumber,
//           tenantId,
//           positionId,
//           candidateId,
//           status: "SCREENED",
//           screeningScore: Number(result.matchPercentage) || 0,
//           screeningDecision: result.recommendation || "HOLD",
//           ownerId: userId,
//           createdBy: userId
//         };

//         if (application) {
//           Object.assign(application, {
//             status: appData.status,
//             screeningScore: appData.screeningScore,
//             screeningDecision: appData.screeningDecision,
//             updatedBy: userId
//           });
//           await application.save();
//         } else {
//           application = new Application(appData);
//           await application.save();
//         }

//         savedApplications.push(application);
//       } catch (innerError) {
//         console.error(`Error processing ${result.fileName || "unknown"}:`, innerError);
//         errors.push({
//           fileName: result.fileName || "unknown",
//           error: innerError.message
//         });
//       }
//     }

//     return res.json({
//       success: true,
//       message: `Processed ${selectedResults.length} items → ${savedScreeningResults.length} screening results, ${savedApplications.length} applications`,
//       screeningResults: savedScreeningResults.map((sr) => ({
//         id: sr._id,
//         resumeId: sr.resumeId,
//         positionId: sr.positionId,
//         recommendation: sr.recommendation
//       })),
//       applications: savedApplications.map((app) => ({
//         id: app._id,
//         applicationNumber: app.applicationNumber,
//         candidateId: app.candidateId,
//         status: app.status
//       })),
//       errors: errors.length > 0 ? errors : undefined
//     });
//   } catch (error) {
//     console.error("createCandidatesFromScreening error:", error);
//     return res.status(500).json({
//       success: false,
//       error: error.message || "Internal server error"
//     });
//   }
// };

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
