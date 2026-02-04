const mongoose = require("mongoose");
// Global Search Controller - Searches across all entities
// Created for global search feature
const { Candidate } = require("../models/candidate.js");
const { Position } = require("../models/Position/position.js");
const InterviewTemplate = require("../models/InterviewTemplate");
const { Interview } = require("../models/Interview/Interview.js");
const Interviewer = require("../models/Interviewer.js");
const { MockInterview } = require("../models/Mockinterview/mockinterview.js");
const Assessment = require("../models/Assessment/assessmentTemplates.js");
const ScheduledAssessmentSchema = require("../models/Assessment/assessmentsSchema.js");
const { TenantQuestions } = require("../models/tenantQuestions.js");
const FeedbackModel = require("../models/feedback.js");
const SupportUser = require("../models/SupportUser.js");
const { TenantCompany } = require("../models/TenantCompany/TenantCompany.js");
const { CandidateAssessment } = require("../models/Assessment/candidateAssessment.js");
const MyTeams = require("../models/MyTeams.js");
const InterviewerTag = require("../models/InterviewerTag.js");
const Tenant = require("../models/Tenant.js");
const { Contacts } = require("../models/Contacts.js");
const { buildPermissionQuery } = require("../utils/buildPermissionQuery");

/**
 * Build regex pattern based on search mode
 * @param {string} searchTerm - The search term
 * @param {string} mode - 'contains' or 'startsWith'
 * @returns {RegExp}
 */
const buildSearchRegex = (searchTerm, mode) => {
    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (mode === 'startsWith') {
        return new RegExp(`^${escapedTerm}`, 'i');
    }
    return new RegExp(escapedTerm, 'i');
};

/**
 * Search candidates
 */
const searchCandidates = async (regex, tenantId, limit = 10) => {
    try {
        if (!tenantId) return [];
        const query = {
            tenantId: new mongoose.Types.ObjectId(tenantId),
            $or: [
                { FirstName: regex },
                { LastName: regex },
                { Email: regex },
                { Phone: regex }
            ]
        };

        const pipeline = [
            { $match: query },
            { $limit: limit },
            {
                $lookup: {
                    from: "resume",
                    let: { candidateId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$candidateId", "$$candidateId"] },
                                        { $eq: ["$isActive", true] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "activeResume"
                }
            },
            {
                $unwind: {
                    path: "$activeResume",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    FirstName: 1,
                    LastName: 1,
                    Email: 1,
                    Phone: 1,
                    CountryCode: 1,
                    createdAt: 1,
                    HigherQualification: { $ifNull: ["$activeResume.HigherQualification", null] },
                    CurrentExperience: { $ifNull: ["$activeResume.CurrentExperience", null] },
                    skills: { $ifNull: ["$activeResume.skills", []] },
                    ImageData: 1
                }
            }
        ];

        const results = await Candidate.aggregate(pipeline);

        return results.map(item => ({
            ...item,
            _entityType: 'candidates',
            _displayName: `${item.FirstName || ''} ${item.LastName || ''}`.trim(),
            _displaySubtitle: item.Email || ''
        }));
    } catch (error) {
        console.error('Error searching candidates:', error);
        return [];
    }
};

/**
 * Search positions
 */
const searchPositions = async (regex, tenantId, limit = 10) => {
    try {
        const query = {
            tenantId,
            $or: [
                { title: regex },
                { positionCode: regex },
                { 'skills.skill': regex }
            ]
        };
        const results = await Position.find(query).limit(limit).lean();
        return results.map(item => ({
            ...item,
            _entityType: 'positions',
            _displayName: item.title || item.positionCode || '',
            _displaySubtitle: item.positionCode || ''
        }));
    } catch (error) {
        console.error('Error searching positions:', error);
        return [];
    }
};

/**
 * Search interview templates
 */
const searchInterviewTemplates = async (regex, tenantId, limit = 10) => {
    try {
        const query = {
            tenantId,
            $or: [
                { title: regex },
                { interviewTemplateCode: regex },
                { description: regex }
            ]
        };
        const results = await InterviewTemplate.find(query).limit(limit).lean();
        return results.map(item => ({
            ...item,
            _entityType: 'interviewTemplates',
            _displayName: item.title || '',
            _displaySubtitle: item.interviewTemplateCode || ''
        }));
    } catch (error) {
        console.error('Error searching interview templates:', error);
        return [];
    }
};

/**
 * Search interviews
 */
const searchInterviews = async (regex, tenantId, limit = 10) => {
    try {
        // Find matching candidates first
        const candidates = await Candidate.find({
            tenantId,
            $or: [{ FirstName: regex }, { LastName: regex }]
        }).select('_id').lean();

        const candidateIds = candidates.map(c => c._id);

        const query = {
            tenantId,
            $or: [
                { interviewCode: regex },
                { technology: regex },
                { candidateId: { $in: candidateIds } }
            ]
        };

        // Populate candidateId to get name for display
        const results = await Interview.find(query)
            .populate('candidateId', 'FirstName LastName Email')
            .limit(limit)
            .lean();

        return results.map(item => {
            const candidateName = item.candidateId
                ? `${item.candidateId.FirstName || ''} ${item.candidateId.LastName || ''}`.trim()
                : 'Unknown Candidate';

            return {
                ...item,
                _entityType: 'interviews',
                _displayName: item.interviewCode || 'Interview',
                _displaySubtitle: candidateName
            };
        });
    } catch (error) {
        console.error('Error searching interviews:', error);
        return [];
    }
};

/**
 * Search interviewers (via Contacts)
 */
const searchInterviewers = async (regex, tenantId, limit = 10) => {
    try {
        // First find matching contacts
        const contactQuery = {
            tenantId,
            $or: [
                { firstName: regex },
                { lastName: regex },
                { email: regex }
            ]
        };
        const contacts = await Contacts.find(contactQuery).limit(limit).lean();

        // Get interviewers linked to these contacts
        const contactIds = contacts.map(c => c._id);
        const interviewers = await Interviewer.find({
            tenantId,
            contactId: { $in: contactIds }
        }).populate('contactId', 'firstName lastName email').limit(limit).lean();

        return interviewers.map(item => ({
            ...item,
            _entityType: 'interviewers',
            _displayName: item.contactId ? `${item.contactId.firstName || ''} ${item.contactId.lastName || ''}`.trim() : '',
            _displaySubtitle: item.contactId?.email || ''
        }));
    } catch (error) {
        console.error('Error searching interviewers:', error);
        return [];
    }
};

/**
 * Search mock interviews
 */
const searchMockInterviews = async (regex, tenantId, limit = 10) => {
    try {
        const query = {
            tenantId,
            $or: [
                { mockInterviewCode: regex },
                { candidateName: regex },
                { currentRole: regex }
            ]
        };
        const results = await MockInterview.find(query).limit(limit).lean();
        return results.map(item => ({
            ...item,
            _entityType: 'mockInterviews',
            _displayName: item.mockInterviewCode || '',
            _displaySubtitle: item.candidateName || ''
        }));
    } catch (error) {
        console.error('Error searching mock interviews:', error);
        return [];
    }
};

/**
 * Search assessment templates
 */
const searchAssessmentTemplates = async (regex, tenantId, limit = 10) => {
    try {
        const query = {
            tenantId,
            $or: [
                { AssessmentTitle: regex },
                { AssessmentCode: regex }
            ]
        };
        const results = await Assessment.find(query).limit(limit).lean();
        return results.map(item => ({
            ...item,
            _entityType: 'assessmentTemplates',
            _displayName: item.AssessmentTitle || '',
            _displaySubtitle: item.AssessmentCode || ''
        }));
    } catch (error) {
        console.error('Error searching assessment templates:', error);
        return [];
    }
};

/**
 * Search scheduled assessments
 */
const searchScheduledAssessments = async (regex, tenantId, limit = 10) => {
    try {
        // 1. Find candidates matching the search term
        const candidates = await Candidate.find({
            tenantId,
            $or: [{ FirstName: regex }, { LastName: regex }]
        }).select('_id').lean();
        const candidateIds = candidates.map(c => c._id);

        // 2. Find CandidateAssessments for these candidates
        // We get the scheduledAssessmentId from here
        const candidateAssessments = await CandidateAssessment.find({
            candidateId: { $in: candidateIds }
        }).select('scheduledAssessmentId candidateId').lean();

        const scheduledIdsFromCandidates = candidateAssessments.map(ca => ca.scheduledAssessmentId);

        // 3. Find Assessment Templates matching the search term
        const assessments = await Assessment.find({
            tenantId,
            $or: [{ AssessmentTitle: regex }, { AssessmentCode: regex }]
        }).select('_id').lean();
        const assessmentIds = assessments.map(a => a._id);

        // 4. Find ScheduledAssessments matches
        const query = {
            tenantId,
            $or: [
                { _id: { $in: scheduledIdsFromCandidates } },
                { assessmentId: { $in: assessmentIds } },
                { scheduledAssessmentCode: regex }
            ]
        };

        const results = await ScheduledAssessmentSchema.find(query)
            .populate('assessmentId', 'AssessmentTitle AssessmentCode')
            .limit(limit)
            .lean();

        return results.map(item => ({
            ...item,
            _entityType: 'assessments',
            _displayName: item.assessmentId?.AssessmentTitle || 'Assessment',
            _displaySubtitle: item.scheduledAssessmentCode || ''
        }));
    } catch (error) {
        console.error('Error searching scheduled assessments:', error);
        return [];
    }
};

/**
 * Search question bank
 */
const searchQuestionBank = async (regex, tenantId, limit = 10) => {
    try {
        const query = {
            tenantId,
            $or: [
                { questionName: regex },
                { questionText: regex }
            ]
        };
        const results = await TenantQuestions.find(query).limit(limit).lean();
        return results.map(item => ({
            ...item,
            _entityType: 'questionBank',
            _displayName: item.questionName || '',
            _displaySubtitle: item.questionText?.substring(0, 50) || ''
        }));
    } catch (error) {
        console.error('Error searching question bank:', error);
        return [];
    }
};

/**
 * Search feedback
 */
const searchFeedback = async (regex, tenantId, limit = 10) => {
    try {
        // Find matching candidates first
        const candidates = await Candidate.find({
            tenantId,
            $or: [{ FirstName: regex }, { LastName: regex }]
        }).select('_id').lean();

        const candidateIds = candidates.map(c => c._id);

        const query = {
            tenantId,
            $or: [
                { candidateId: { $in: candidateIds } },
                // Note: Interviewer search would need similar lookup if needed
            ]
        };

        const results = await FeedbackModel.find(query)
            .populate('candidateId', 'FirstName LastName')
            .populate('interviewerId', 'firstName lastName email')
            .limit(limit)
            .lean();

        return results.map(item => {
            const candidateName = item.candidateId
                ? `${item.candidateId.FirstName || ''} ${item.candidateId.LastName || ''}`.trim()
                : 'Unknown Candidate';

            // Handle interviewer display name (it might be User or Contact, schema says Contact/User depending on version)
            // Assuming Contact based on previous context or User. Check populate result.
            const interviewerName = item.interviewerId
                ? `${item.interviewerId.firstName || ''} ${item.interviewerId.lastName || ''}`.trim()
                : '';

            return {
                ...item,
                _entityType: 'feedback',
                _displayName: candidateName,
                _displaySubtitle: `${interviewerName} (Feedback)`
            };
        });
    } catch (error) {
        console.error('Error searching feedback:', error);
        return [];
    }
};

/**
 * Search support desk tickets
 */
const searchSupportDesk = async (regex, tenantId, limit = 10) => {
    try {
        const query = {
            tenantId,
            $or: [
                { ticketCode: regex },
                { subject: regex },
                { contact: regex },
                { issueType: regex }
            ]
        };
        const results = await SupportUser.find(query).limit(limit).lean();
        return results.map(item => ({
            ...item,
            _entityType: 'supportDesk',
            _displayName: item.ticketCode || '',
            _displaySubtitle: item.subject || ''
        }));
    } catch (error) {
        console.error('Error searching support desk:', error);
        return [];
    }
};

/**
 * Search companies
 */
const searchCompanies = async (regex, tenantId, limit = 10) => {
    try {
        const query = {
            tenantId,
            $or: [
                { name: regex },
                { industry: regex },
                { primaryContactName: regex },
                { primaryContactEmail: regex }
            ]
        };
        const results = await TenantCompany.find(query).limit(limit).lean();
        return results.map(item => ({
            ...item,
            _entityType: 'companies',
            _displayName: item.name || '',
            _displaySubtitle: item.industry || ''
        }));
    } catch (error) {
        console.error('Error searching companies:', error);
        return [];
    }
};

/**
 * Search my teams
 */
const searchMyTeams = async (regex, tenantId, limit = 10) => {
    try {
        const query = {
            tenantId,
            $or: [
                { name: regex },
                { description: regex },
                { department: regex }
            ]
        };
        const results = await MyTeams.find(query).limit(limit).lean();
        return results.map(item => ({
            ...item,
            _entityType: 'myTeams',
            _displayName: item.name || '',
            _displaySubtitle: item.department || ''
        }));
    } catch (error) {
        console.error('Error searching my teams:', error);
        return [];
    }
};

/**
 * Search interviewer tags
 */
const searchInterviewerTags = async (regex, tenantId, limit = 10) => {
    try {
        const query = {
            tenantId,
            $or: [
                { name: regex },
                { description: regex },
                { category: regex }
            ]
        };
        const results = await InterviewerTag.find(query).limit(limit).lean();
        return results.map(item => ({
            ...item,
            _entityType: 'interviewerTags',
            _displayName: item.name || '',
            _displaySubtitle: item.category || ''
        }));
    } catch (error) {
        console.error('Error searching interviewer tags:', error);
        return [];
    }
};

/**
 * Search tenants (Super Admin only)
 */
const searchTenants = async (regex, limit = 10) => {
    try {
        const query = {
            $or: [
                { company: regex },
                { email: regex },
                { firstName: regex },
                { lastName: regex }
            ]
        };
        const results = await Tenant.find(query).limit(limit).lean();
        return results.map(item => ({
            ...item,
            _entityType: 'tenants',
            _displayName: item.company || `${item.firstName || ''} ${item.lastName || ''}`.trim(),
            _displaySubtitle: item.email || ''
        }));
    } catch (error) {
        console.error('Error searching tenants:', error);
        return [];
    }
};

/**
 * Main global search controller
 */
const globalSearch = async (req, res) => {
    try {
        const { q, mode = 'contains', filter, limit = 10 } = req.query;

        // Validate search query
        if (!q || q.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }

        const searchTerm = q.trim();
        const regex = buildSearchRegex(searchTerm, mode);
        const searchLimit = Math.min(parseInt(limit) || 10, 50);

        // Get auth context from middleware
        const { actingAsTenantId, isSuperAdminOnly } = res.locals.auth || {};
        const tenantId = actingAsTenantId;

        // Define all entity search functions
        const entitySearchFunctions = {
            candidates: () => searchCandidates(regex, tenantId, searchLimit),
            positions: () => searchPositions(regex, tenantId, searchLimit),
            interviewTemplates: () => searchInterviewTemplates(regex, tenantId, searchLimit),
            interviews: () => searchInterviews(regex, tenantId, searchLimit),
            interviewers: () => searchInterviewers(regex, tenantId, searchLimit),
            mockInterviews: () => searchMockInterviews(regex, tenantId, searchLimit),
            assessmentTemplates: () => searchAssessmentTemplates(regex, tenantId, searchLimit),
            assessments: () => searchScheduledAssessments(regex, tenantId, searchLimit),
            questionBank: () => searchQuestionBank(regex, tenantId, searchLimit),
            feedback: () => searchFeedback(regex, tenantId, searchLimit),
            supportDesk: () => searchSupportDesk(regex, tenantId, searchLimit),
            companies: () => searchCompanies(regex, tenantId, searchLimit),
            myTeams: () => searchMyTeams(regex, tenantId, searchLimit),
            interviewerTags: () => searchInterviewerTags(regex, tenantId, searchLimit),
        };

        // Add tenants search for super admin
        if (isSuperAdminOnly) {
            entitySearchFunctions.tenants = () => searchTenants(regex, searchLimit);
        }

        // If filter is specified, only search that entity
        if (filter && entitySearchFunctions[filter]) {
            const results = await entitySearchFunctions[filter]();
            return res.json({
                success: true,
                query: searchTerm,
                mode,
                filter,
                totalCount: results.length,
                results: {
                    [filter]: results
                },
                counts: {
                    [filter]: results.length
                }
            });
        }

        // Search all entities in parallel
        const searchPromises = Object.entries(entitySearchFunctions).map(
            async ([entityType, searchFn]) => {
                try {
                    const results = await searchFn();
                    return { entityType, results, count: results.length };
                } catch (error) {
                    console.error(`Error searching ${entityType}:`, error);
                    return { entityType, results: [], count: 0 };
                }
            }
        );

        const searchResults = await Promise.all(searchPromises);

        // Organize results by entity type
        const results = {};
        const counts = {};
        let totalCount = 0;

        searchResults.forEach(({ entityType, results: entityResults, count }) => {
            if (entityResults.length > 0) {
                results[entityType] = entityResults;
            }
            counts[entityType] = count;
            totalCount += count;
        });

        res.json({
            success: true,
            query: searchTerm,
            mode,
            totalCount,
            results,
            counts
        });

    } catch (error) {
        console.error('Global search error:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while searching',
            error: error.message
        });
    }
};

module.exports = {
    globalSearch
};
