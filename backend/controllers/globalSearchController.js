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
const { Resume } = require("../models/Resume.js");

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
 * Combine permission query with search query properly
 * Handles the case where both queries might have $or clauses
 * @param {Object} permissionQuery - The permission-based query (tenantId/ownerId filters)
 * @param {Array} searchConditions - Array of search conditions for $or
 * @returns {Object} Combined MongoDB query
 */
const combineQueries = (permissionQuery, searchConditions) => {
    const conditions = [];

    // Add permission query conditions
    if (permissionQuery && Object.keys(permissionQuery).length > 0) {
        conditions.push(permissionQuery);
    }

    // Add search conditions as $or
    if (searchConditions && searchConditions.length > 0) {
        conditions.push({ $or: searchConditions });
    }

    // If we have multiple conditions, use $and; otherwise return single condition or empty
    if (conditions.length === 0) {
        return {};
    } else if (conditions.length === 1) {
        return conditions[0];
    } else {
        return { $and: conditions };
    }
};

/**
 * Helper function that applies fallback intersection strategy for CosmosDB compatibility
 * If the combined query returns 0 results, falls back to:
 * 1. Search by text conditions only (ignoring permissions)
 * 2. Filter those results by permission query using _id
 * @param {Mongoose.Model} Model - The Mongoose model to search
 * @param {Object} permissionQuery - Permission-based query conditions
 * @param {Array} searchConditions - Array of search conditions for $or
 * @param {number} limit - Maximum results to return
 * @param {Object} options - Optional: select, populate fields
 * @returns {Array} Search results
 */
const searchWithFallback = async (Model, permissionQuery, searchConditions, limit = 10, options = {}) => {
    const { select = '', populate = null } = options;

    const query = combineQueries(permissionQuery, searchConditions);

    let queryBuilder = Model.find(query).limit(limit);
    if (select) queryBuilder = queryBuilder.select(select);
    if (populate) queryBuilder = queryBuilder.populate(populate);

    let results = await queryBuilder.lean().exec();

    // Fallback strategy for CosmosDB compatibility
    if (results.length === 0 && searchConditions && searchConditions.length > 0) {
        // 1. Find candidates matching search conditions only (ignoring permissions)
        const searchOnlyQuery = { $or: searchConditions };
        const candidateDocs = await Model.find(searchOnlyQuery)
            .select('_id')
            .limit(limit * 5)
            .lean().exec();

        if (candidateDocs.length > 0) {
            const candidateIds = candidateDocs.map(d => d._id);

            // 2. Filter these candidates using the permission query
            const fallbackQuery = {
                $and: [
                    permissionQuery,
                    { _id: { $in: candidateIds } }
                ]
            };

            let fallbackQueryBuilder = Model.find(fallbackQuery).limit(limit);
            if (select) fallbackQueryBuilder = fallbackQueryBuilder.select(select);
            if (populate) fallbackQueryBuilder = fallbackQueryBuilder.populate(populate);

            results = await fallbackQueryBuilder.lean().exec();
        }
    }

    return results;
};

/**
 * Search candidates
 */
const searchCandidates = async (regex, limit = 10, permissionQuery = {}) => {
    try {
        // Find matching resumes for CurrentRole
        const matchingResumes = await Resume.find({
            CurrentRole: regex,
            isActive: true
        }).select('candidateId').lean().exec();

        const resumeCandidateIds = matchingResumes.map(r => r.candidateId);

        //if (!permissionQuery.tenantId && !permissionQuery.ownerId) return [];
        const query = combineQueries(permissionQuery, [
            { FirstName: regex },
            { LastName: regex },
            { Email: regex },
            { Phone: regex },
            { _id: { $in: resumeCandidateIds } }
        ]);

        // Use simple find instead of aggregation with $lookup (CosmosDB compatible)
        const candidates = await Candidate.find(query)
            .select('FirstName LastName Email Phone CountryCode createdAt ImageData')
            .limit(limit)
            .lean().exec();

        // Fetch active resumes for these candidates in a separate query
        const candidateIds = candidates.map(c => c._id);
        const activeResumes = await Resume.find({
            candidateId: { $in: candidateIds },
            isActive: true
        }).select('candidateId CurrentExperience CurrentRole skills').lean().exec();

        // Create a map of candidateId -> resume
        const resumeMap = {};
        activeResumes.forEach(resume => {
            resumeMap[resume.candidateId?.toString()] = resume;
        });

        // Merge resume data with candidates
        return candidates.map(item => {
            const resume = resumeMap[item._id?.toString()] || {};
            return {
                ...item,
                CurrentExperience: resume.CurrentExperience || null,
                CurrentRole: resume.CurrentRole || null,
                skills: resume.skills || [],
                _entityType: 'candidates',
                _displayName: `${item.FirstName || ''} ${item.LastName || ''}`.trim(),
                _displaySubtitle: item.Email || ''
            };
        });
    } catch (error) {
        console.error('Error searching candidates:', error);
        return [];
    }
};

/**
 * Search positions
 */
/**
 * Search positions
 */
const searchPositions = async (regex, limit = 10, permissionQuery = {}) => {
    try {
        const query = combineQueries(permissionQuery, [
            { title: regex },
            { positionCode: regex },
            { 'skills.skill': regex }
        ]);
        // Use lean() and NO populate first to avoid CastError on mixed data string/ObjectId
        const results = await Position.find(query)
            .limit(limit)
            .lean().exec();

        // Manual population to handle "Adobe Inc." string vs ObjectId
        const companyIds = results
            .map(p => p.companyname)
            .filter(id => id && mongoose.isValidObjectId(id));

        let companyMap = {};
        if (companyIds.length > 0) {
            const companies = await TenantCompany.find({ _id: { $in: companyIds } })
                .select('name')
                .lean().exec();
            companies.forEach(c => {
                companyMap[c._id.toString()] = c.name;
            });
        }

        return results.map(item => ({
            ...item,
            _entityType: 'positions',
            _displayName: item.title || item.positionCode || '',
            _displaySubtitle: item.positionCode || '',
            // If it was an ID found in DB, use name. If it was a string (Adobe Inc.), use it directly.
            companyname: companyMap[item.companyname?.toString()] || item.companyname || '-',
            location: item.Location || item.location || '-',
            skills: item.skills?.map(s => s.skill).join(', ') || '-'
        }));
    } catch (error) {
        console.error('Error searching positions:', error);
        return [];
    }
};

/**
 * Search interview templates
 */
const searchInterviewTemplates = async (regex, limit = 10, permissionQuery = {}) => {
    try {
        const searchConditions = [
            { title: regex },
            { interviewTemplateCode: regex },
            { description: regex }
        ];
        const results = await searchWithFallback(InterviewTemplate, permissionQuery, searchConditions, limit);
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
const searchInterviews = async (regex, limit = 10, permissionQuery = {}) => {
    try {
        // Find matching candidates first
        const candidates = await Candidate.find({
            ...permissionQuery,
            $or: [{ FirstName: regex }, { LastName: regex }]
        }).select('_id').lean().exec();

        const candidateIds = candidates.map(c => c._id);

        const query = combineQueries(permissionQuery, [
            { interviewCode: regex },
            { technology: regex },
            { candidateId: { $in: candidateIds } }
        ]);

        // Populate candidateId to get name for display
        const results = await Interview.find(query)
            .populate('candidateId', 'FirstName LastName Email')
            .limit(limit)
            .lean().exec();

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
const searchInterviewers = async (regex, limit = 10, permissionQuery = {}) => {
    try {
        // First find matching contacts
        const contactQuery = combineQueries(permissionQuery, [
            { firstName: regex },
            { lastName: regex },
            { email: regex }
        ]);
        const contacts = await Contacts.find(contactQuery).limit(limit).lean().exec();

        // Get interviewers linked to these contacts
        const contactIds = contacts.map(c => c._id);
        const interviewers = await Interviewer.find({
            ...permissionQuery,
            contactId: { $in: contactIds }
        }).populate('contactId', 'firstName lastName email').limit(limit).lean().exec();

        return interviewers.map(item => ({
            ...item,
            _entityType: 'interviewers',
            _displayName: item.contactId ? `${item.contactId.firstName || ''} ${item.contactId.lastName || ''}`.trim() : '',
            _displaySubtitle: item.contactId?.email || '',
            status: item.is_active ? 'Active' : 'Inactive'
        }));
    } catch (error) {
        console.error('Error searching interviewers:', error);
        return [];
    }
};

/**
 * Search mock interviews
 */
const searchMockInterviews = async (regex, limit = 10, permissionQuery = {}) => {
    try {
        const query = combineQueries(permissionQuery, [
            { mockInterviewCode: regex },
            { candidateName: regex },
            { currentRole: regex }
        ]);
        const results = await MockInterview.find(query).limit(limit).lean().exec();

        if (results.length === 0) {
            // Fallback Intersection Strategy:
            // 1. Find matches ignoring permissions first
            const searchPartQuery = {
                $or: [
                    { mockInterviewCode: regex },
                    { candidateName: regex },
                    { currentRole: regex }
                ]
            };
            const candidateDocs = await MockInterview.find(searchPartQuery)
                .select('_id')
                .limit(limit * 5)
                .lean().exec();

            if (candidateDocs.length > 0) {
                const candidateIds = candidateDocs.map(d => d._id);

                // 2. Filter these candidates using the permission query
                const fallbackQuery = {
                    $and: [
                        permissionQuery,
                        { _id: { $in: candidateIds } }
                    ]
                };

                const fallbackResults = await MockInterview.find(fallbackQuery)
                    .limit(limit)
                    .lean().exec();

                if (fallbackResults.length > 0) {
                    return fallbackResults.map(item => ({
                        ...item,
                        _entityType: 'mockInterviews',
                        _displayName: item.mockInterviewCode || '',
                        _displaySubtitle: item.candidateName || ''
                    }));
                }
            }
        }
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
const searchAssessmentTemplates = async (regex, limit = 10, permissionQuery = {}) => {
    try {
        const searchConditions = [
            { AssessmentTitle: regex },
            { AssessmentCode: regex }
        ];
        const results = await searchWithFallback(Assessment, permissionQuery, searchConditions, limit);
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
const searchScheduledAssessments = async (regex, limit = 10, permissionQuery = {}) => {
    try {
        // 1. Find candidates matching the search term
        const candidates = await Candidate.find({
            ...permissionQuery,
            $or: [{ FirstName: regex }, { LastName: regex }]
        }).select('_id').lean().exec();
        const candidateIds = candidates.map(c => c._id);

        // 2. Find CandidateAssessments for these candidates
        // We get the scheduledAssessmentId from here
        const candidateAssessments = await CandidateAssessment.find({
            candidateId: { $in: candidateIds }
        }).select('scheduledAssessmentId candidateId').lean().exec();

        const scheduledIdsFromCandidates = candidateAssessments.map(ca => ca.scheduledAssessmentId);

        // 3. Find Assessment Templates matching the search term
        const assessments = await Assessment.find({
            ...permissionQuery,
            $or: [{ AssessmentTitle: regex }, { AssessmentCode: regex }]
        }).select('_id').lean().exec();
        const assessmentIds = assessments.map(a => a._id);

        // 4. Find ScheduledAssessments matches
        const query = combineQueries(permissionQuery, [
            { _id: { $in: scheduledIdsFromCandidates } },
            { assessmentId: { $in: assessmentIds } },
            { scheduledAssessmentCode: regex }
        ]);

        const results = await ScheduledAssessmentSchema.find(query)
            .populate('assessmentId', 'AssessmentTitle AssessmentCode')
            .limit(limit)
            .lean().exec();

        const scheduledIds = results.map(r => r._id);

        // Fetch candidates for these assessments
        const candidatesMap = {};
        if (scheduledIds.length > 0) {
            const candidateAssessments = await CandidateAssessment.find({
                scheduledAssessmentId: { $in: scheduledIds }
            })
                .populate('candidateId', 'FirstName LastName Email Phone CountryCode HigherQualification CurrentExperience skills')
                .lean().exec();

            candidateAssessments.forEach(ca => {
                if (!candidatesMap[ca.scheduledAssessmentId]) {
                    candidatesMap[ca.scheduledAssessmentId] = [];
                }
                candidatesMap[ca.scheduledAssessmentId].push(ca);
            });
        }

        return results.map(item => ({
            ...item,
            candidates: candidatesMap[item._id] || [],
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
const searchQuestionBank = async (regex, limit = 10, permissionQuery = {}) => {
    try {
        const searchConditions = [
            { questionName: regex },
            { questionText: regex }
        ];
        const results = await searchWithFallback(TenantQuestions, permissionQuery, searchConditions, limit);
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
const searchFeedback = async (regex, limit = 10, permissionQuery = {}) => {
    try {
        // Find matching candidates first
        const candidates = await Candidate.find({
            ...permissionQuery,
            $or: [{ FirstName: regex }, { LastName: regex }]
        }).select('_id').lean().exec();

        const candidateIds = candidates.map(c => c._id);

        const query = combineQueries(permissionQuery, [
            { candidateId: { $in: candidateIds } },
            // Note: Interviewer search would need similar lookup if needed
        ]);

        const results = await FeedbackModel.find(query)
            .populate('candidateId', 'FirstName LastName')
            .populate('interviewerId', 'firstName lastName email')
            .limit(limit)
            .lean().exec();

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
const searchSupportDesk = async (regex, limit = 10, permissionQuery = {}) => {
    try {
        const query = combineQueries(permissionQuery, [
            { ticketCode: regex },
            { subject: regex },
            { contact: regex },
            { issueType: regex },
            { description: regex },
            { status: regex }
        ]);
        console.log("Support Desk Search Query:", JSON.stringify(query, null, 2));
        const results = await SupportUser.find(query).limit(limit).lean().exec();
        console.log("Support Desk Search Results Count:", results.length);

        if (results.length === 0) {
            console.log("Standard search returned 0. Attempting Fallback Intersection Strategy...");

            // 1. Find candidates matching the text search (ignoring permissions first)
            // We increase limit slightly to allow for permission filtering
            const searchPartQuery = {
                $or: [
                    { ticketCode: regex }, { subject: regex }, { contact: regex },
                    { issueType: regex }, { description: regex }, { status: regex }
                ]
            };
            const candidateDocs = await SupportUser.find(searchPartQuery)
                .select('_id')
                .limit(limit * 5) // Fetch more candidates to filter down
                .lean().exec();

            if (candidateDocs.length > 0) {
                const candidateIds = candidateDocs.map(d => d._id);

                // 2. Filter these candidates using the permission query
                // We construct a query: Permission AND ID in [candidateIds]
                const fallbackQuery = {
                    $and: [
                        permissionQuery,
                        { _id: { $in: candidateIds } }
                    ]
                };

                const fallbackResults = await SupportUser.find(fallbackQuery)
                    .limit(limit)
                    .lean().exec();

                console.log("Fallback Strategy Results Count:", fallbackResults.length);

                if (fallbackResults.length > 0) {
                    return fallbackResults.map(item => ({
                        ...item,
                        _entityType: 'supportDesk',
                        _displayName: item.ticketCode || '',
                        _displaySubtitle: item.subject || ''
                    }));
                }
            }
        }
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
const searchCompanies = async (regex, limit = 10, permissionQuery = {}) => {
    try {
        const searchConditions = [
            { name: regex },
            { industry: regex },
            { primaryContactName: regex },
            { primaryContactEmail: regex }
        ];
        const results = await searchWithFallback(TenantCompany, permissionQuery, searchConditions, limit);
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
const searchMyTeams = async (regex, limit = 10, permissionQuery = {}) => {
    try {
        const searchConditions = [
            { name: regex },
            { description: regex },
            { department: regex }
        ];
        const results = await searchWithFallback(MyTeams, permissionQuery, searchConditions, limit);
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
const searchInterviewerTags = async (regex, limit = 10, permissionQuery = {}) => {
    try {
        const searchConditions = [
            { name: regex },
            { description: regex },
            { category: regex }
        ];
        const results = await searchWithFallback(InterviewerTag, permissionQuery, searchConditions, limit);
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
const searchTenants = async (regex, limit = 10, permissionQuery = {}) => {
    try {
        const searchConditions = [
            { company: regex },
            { email: regex },
            { firstName: regex },
            { lastName: regex }
        ];
        const results = await searchWithFallback(Tenant, permissionQuery, searchConditions, limit);
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
        const { actingAsUserId, actingAsTenantId, isSuperAdminOnly } = res.locals.auth || {};
        const tenantId = actingAsTenantId;

        // Get permission context from res.locals (set by authContextMiddleware)
        const {
            inheritedRoleIds = [],
            effectivePermissions_RoleType,
            effectivePermissions_RoleName,
        } = res.locals;

        // Build permission query dynamically based on user role
        const permissionQuery = await buildPermissionQuery(
            actingAsUserId,
            actingAsTenantId,
            inheritedRoleIds,
            effectivePermissions_RoleType,
            effectivePermissions_RoleName
        );

        console.log('[GlobalSearch] Permission context:', {
            actingAsUserId,
            actingAsTenantId,
            inheritedRoleIds,
            effectivePermissions_RoleType,
            effectivePermissions_RoleName,
            permissionQuery
        });

        // SAFETY: Warn if permission context is incomplete (helps debug Azure issues)
        if (!effectivePermissions_RoleType) {
            console.warn('[GlobalSearch] WARNING: effectivePermissions_RoleType is undefined. Permission filtering may be restricted.');
        }
        if (!actingAsUserId || !actingAsTenantId) {
            console.warn('[GlobalSearch] WARNING: Missing actingAsUserId or actingAsTenantId. Auth context may have failed.');
        }

        // Define all entity search functions with permission query
        const entitySearchFunctions = {
            candidates: () => searchCandidates(regex, searchLimit, permissionQuery),
            positions: () => searchPositions(regex, searchLimit, permissionQuery),
            interviewTemplates: () => searchInterviewTemplates(regex, searchLimit, permissionQuery),
            interviews: () => searchInterviews(regex, searchLimit, permissionQuery),
            interviewers: () => searchInterviewers(regex, searchLimit, permissionQuery),
            mockInterviews: () => searchMockInterviews(regex, searchLimit, permissionQuery),
            assessmentTemplates: () => searchAssessmentTemplates(regex, searchLimit, permissionQuery),
            assessments: () => searchScheduledAssessments(regex, searchLimit, permissionQuery),
            questionBank: () => searchQuestionBank(regex, searchLimit, permissionQuery),
            feedback: () => searchFeedback(regex, searchLimit, permissionQuery),
            supportDesk: () => searchSupportDesk(regex, searchLimit, permissionQuery),
            companies: () => searchCompanies(regex, searchLimit, permissionQuery),
            myTeams: () => searchMyTeams(regex, searchLimit, permissionQuery),
            interviewerTags: () => searchInterviewerTags(regex, searchLimit, permissionQuery),
        };

        // Add tenants search for super admin
        if (isSuperAdminOnly) {
            entitySearchFunctions.tenants = () => searchTenants(regex, searchLimit, permissionQuery);
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
