import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
    getCandidateColumns, getCandidateActions,
    getPositionColumns, getPositionActions,
    getInterviewColumns, getInterviewActions,
    getInterviewerColumns, getInterviewerActions,
    getInterviewTemplateColumns, getInterviewTemplateActions,
    getMockInterviewColumns, getMockInterviewActions,
    getAssessmentTemplateColumns, getAssessmentTemplateActions,
    getScheduleAssessmentColumns, getScheduleAssessmentActions,
    getQuestionColumns, getQuestionActions,
    getFeedbackColumns, getFeedbackActions,
    getSupportTicketColumns, getSupportTicketActions,
    getCompanyColumns, getCompanyActions,
    getTeamColumns, getTeamActions,
    getTagColumns, getTagActions,
    getTenantColumns, getTenantActions
} from '../../utils/tableConfig.jsx';
import { ArrowLeft, LayoutGrid, List, Search, Users, Briefcase, Calendar, Video, FileText, MessageSquare, Building2, UsersRound, Tag, Building, Eye, Filter } from 'lucide-react';
import { useGlobalSearch } from '../../hooks/useGlobalSearch';
import '../../Components/Navbar/GlobalSearch/GlobalSearch.css';
import CandidateKanban from '../Dashboard-Part/Tabs/Candidate-Tab/CandidateKanban';
import TableView from '../../Components/Shared/Table/TableView';

// Entity configuration for display
const ENTITY_CONFIG = {
    candidates: { label: 'Candidates', singular: 'Candidate', icon: Users, path: '/candidates/view-details' },
    positions: { label: 'Positions', singular: 'Position', icon: Briefcase, path: '/positions/view-details' },
    interviewTemplates: { label: 'Interview Templates', singular: 'Interview Template', icon: FileText, path: '/interview-templates' },
    interviews: { label: 'Interviews', singular: 'Interview', icon: Calendar, path: '/interviews' },
    interviewers: { label: 'Interviewers', singular: 'Interviewer', icon: UsersRound, path: '/interviewers' },
    mockInterviews: { label: 'Mock Interviews', singular: 'Mock Interview', icon: Video, path: '/mock-interviews-details' },
    assessmentTemplates: { label: 'Assessment Templates', singular: 'Assessment Template', icon: FileText, path: '/assessment-template-details' },
    assessments: { label: 'Assessments', singular: 'Assessment', icon: Calendar, path: '/assessment' },
    questionBank: { label: 'Question Bank', singular: 'Question', icon: MessageSquare, path: '/question-bank' },
    feedback: { label: 'Feedback', singular: 'Feedback', icon: MessageSquare, path: '/feedback/view' },
    supportDesk: { label: 'Support Desk', singular: 'Support Ticket', icon: MessageSquare, path: '/support-desk' },
    companies: { label: 'Companies', singular: 'Company', icon: Building2, path: '/companies/view' },
    myTeams: { label: 'My Teams', singular: 'Team', icon: UsersRound, path: '/my-teams/team-details' },
    interviewerTags: { label: 'Interviewer Tags', singular: 'Tag', icon: Tag, path: '/interviewer-tags/tag-details' },
    tenants: { label: 'Tenants', singular: 'Tenant', icon: Building, path: '/tenants' },
};

const GlobalSearchResults = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { globalSearch, loading, results, error } = useGlobalSearch();

    const [viewMode, setViewMode] = useState('kanban');
    const [activeFilter, setActiveFilter] = useState('all');

    const query = searchParams.get('q') || '';
    const mode = searchParams.get('mode') || 'contains';

    // Perform search on mount and when params change
    useEffect(() => {
        if (query) {
            globalSearch({ query, mode, limit: 20 });
        }
    }, [query, mode, globalSearch]);

    // Calculate filtered results
    const filteredResults = useMemo(() => {
        if (!results?.results) return {};
        if (activeFilter === 'all') return results.results;
        return results.results[activeFilter] ? { [activeFilter]: results.results[activeFilter] } : {};
    }, [results, activeFilter]);

    // Get entity filters with counts - show ALL entities, even with 0 count
    const entityFilters = useMemo(() => {
        const counts = results?.counts || {};
        return Object.entries(ENTITY_CONFIG).map(([entityType, config]) => ({
            entityType,
            count: counts[entityType] || 0,
            ...config
        }));
    }, [results]);

    // Transform data for common components
    const transformData = (entityType, items) => {
        const config = ENTITY_CONFIG[entityType];
        return items.map(item => ({
            ...item,
            // Map to CandidateKanban expected fields
            firstName: item._displayName || 'Unnamed',
            currentRole: item._displaySubtitle || '',
            title: item._displayName, // Fallback
            // Add entity type for context
            entityType,
            entityLabel: config?.label || entityType
        }));
    };

    // Render content based on view mode
    const renderContent = () => {
        if (Object.keys(filteredResults).length === 0) return null;

        return Object.entries(filteredResults).map(([entityType, items]) => {
            const config = ENTITY_CONFIG[entityType];
            const IconComponent = config?.icon || Search;
            const transformedItems = transformData(entityType, items);

            // v2.0.0 Refactor to use shared table config
            let tableColumns = [];
            let tableActions = [];

            if (entityType === 'candidates') {
                tableColumns = getCandidateColumns(navigate, {});
                tableActions = getCandidateActions(navigate, { permissions: { Candidates: { View: true, Edit: true } } });
            } else if (entityType === 'positions') {
                const allColumns = getPositionColumns(navigate);
                // Reduce columns for Global Search view to prevent overflow
                tableColumns = allColumns.filter(col =>
                    !['jobDescription', 'createdAt', 'rounds', 'experience'].includes(col.key)
                );
                tableActions = getPositionActions(navigate, { View: true, Edit: true });
            } else if (entityType === 'interviews') {
                tableColumns = getInterviewColumns(navigate);
                tableActions = getInterviewActions(navigate, { View: true, Edit: true });
            } else if (entityType === 'interviewers') {
                tableColumns = getInterviewerColumns(navigate, { permissions: { Interviewers: { View: true, Edit: true } } });
                tableActions = getInterviewerActions(navigate, { permissions: { Interviewers: { View: true, Edit: true, Delete: true } } });
            } else if (entityType === 'interviewTemplates') {
                tableColumns = getInterviewTemplateColumns(navigate);
                tableActions = getInterviewTemplateActions(navigate, { permissions: { InterviewTemplates: { View: true, Edit: true, Create: true, Delete: true } } });
            } else if (entityType === 'mockInterviews') {
                tableColumns = getMockInterviewColumns(navigate);
                tableActions = getMockInterviewActions(navigate, { permissions: { MockInterviews: { View: true, Edit: true } } });
            } else if (entityType === 'assessmentTemplates') {
                tableColumns = getAssessmentTemplateColumns(navigate);
                tableActions = getAssessmentTemplateActions(navigate, { permissions: { AssessmentTemplates: { View: true, Edit: true, Delete: true } } });
            } else if (entityType === 'assessments') {
                tableColumns = getScheduleAssessmentColumns(navigate);
                tableActions = getScheduleAssessmentActions(navigate, { permissions: { View: true } });
            } else if (entityType === 'questionBank') {
                tableColumns = getQuestionColumns(navigate);
                tableActions = getQuestionActions(navigate, { permissions: { QuestionBank: { View: true, Edit: true, Delete: true } } });
            } else if (entityType === 'feedback') {
                tableColumns = getFeedbackColumns(navigate);
                tableActions = getFeedbackActions(navigate);
            } else if (entityType === 'supportDesk') {
                tableColumns = getSupportTicketColumns(navigate, { roleNames: { effectiveRole: 'Admin' } }); // Adjust role as needed
                tableActions = getSupportTicketActions(navigate, { roleNames: { effectiveRole: 'Admin' } });
            } else if (entityType === 'companies') {
                tableColumns = getCompanyColumns(navigate);
                tableActions = getCompanyActions(navigate, { permissions: { Companies: { View: true, Edit: true, Delete: true } } });
            } else if (entityType === 'myTeams') {
                tableColumns = getTeamColumns(navigate);
                tableActions = getTeamActions(navigate, { permissions: { InterviewerTags: { View: true, Edit: true } } });
            } else if (entityType === 'interviewerTags') {
                tableColumns = getTagColumns(navigate);
                tableActions = getTagActions(navigate, { permissions: { InterviewerTags: { View: true, Edit: true, Delete: true } } });
            } else if (entityType === 'tenants') {
                tableColumns = getTenantColumns(navigate, { superAdminPermissions: { Tenants: { View: true, Edit: true, Delete: true } } });
                tableActions = getTenantActions(navigate, { superAdminPermissions: { Tenants: { View: true, Edit: true, Delete: true } } });
            } else {
                // Fallback / Generic Columns
                tableColumns = [
                    {
                        header: 'Name',
                        key: 'firstName',
                        render: (_, row) => (
                            <div className="font-medium text-gray-900 cursor-pointer" onClick={() => handleItemClick(row, entityType)}>
                                {row.firstName}
                            </div>
                        )
                    },
                    {
                        header: 'Details',
                        key: 'currentRole',
                        render: (_, row) => <span className="text-gray-500">{row.currentRole || '-'}</span>
                    },
                    {
                        header: 'Type',
                        key: 'entityLabel',
                        render: (_, row) => (
                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-medium">
                                {row.entityLabel}
                            </span>
                        )
                    }
                ];
            }
            // Define columns for CandidateKanban (body content)
            const kanbanColumns = [
                {
                    key: 'entityLabel',
                    header: 'Type',
                    render: (value) => (
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs font-medium">
                            {value}
                        </span>
                    )
                }
            ];

            const handleItemClick = (item, type) => {
                const path = ENTITY_CONFIG[type]?.path;
                if (path) {
                    navigate(`${path}/${item._id}`);
                }
            };

            return (
                <div key={entityType} className="mb-8 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                        <IconComponent size={20} className="text-custom-blue" />
                        <span className="text-lg font-semibold text-gray-800">{config?.label || entityType}</span>
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">
                            {items.length}
                        </span>
                    </div>

                    {viewMode === 'kanban' ? (
                        <CandidateKanban
                            data={transformedItems}
                            columns={kanbanColumns}
                            KanbanTitle={config?.singular || config?.label}
                            highlightText={query}
                            renderActions={(item) => (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleItemClick(item, entityType);
                                    }}
                                    className="p-1 hover:bg-gray-100 rounded-full text-custom-blue"
                                    title="View Details"
                                >
                                    <Eye size={16} />
                                </button>
                            )}
                            autoHeight={true}
                        />

                    ) : (
                        <TableView
                            data={transformedItems}
                            columns={tableColumns}
                            actions={tableActions}
                            autoHeight={true}
                            highlightText={query}
                        />

                    )}
                </div>
            );
        });
    };

    return (
        <div className="global-search-results-page bg-gray-50 min-h-screen flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 h-[calc(100vh-64px)] overflow-y-auto sticky top-16">
                <div className="p-4 border-b border-gray-200 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                    Filter Results
                </div>

                <div className="py-2">
                    <div
                        className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${activeFilter === 'all'
                            ? 'bg-custom-blue text-white rounded-lg mx-2'
                            : 'text-gray-600 hover:bg-gray-50'
                            }`}
                        onClick={() => setActiveFilter('all')}
                    >
                        <div className="flex items-center gap-3">
                            <Filter size={16} className={activeFilter === 'all' ? 'text-white' : 'text-gray-500'} />
                            <span className="font-medium text-sm">All Results</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${activeFilter === 'all' ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                            {results?.totalCount || 0}
                        </span>
                    </div>


                    {entityFilters.map(({ entityType, label, count, icon: Icon }) => {
                        const isDisabled = count === 0;
                        const isActive = activeFilter === entityType;
                        return (
                            <div
                                key={entityType}
                                className={`flex items-center justify-between px-4 py-3 transition-colors ${isDisabled
                                    ? 'opacity-50 cursor-not-allowed bg-gray-50'
                                    : isActive
                                        ? 'bg-custom-blue text-white cursor-pointer'
                                        : 'text-gray-600 hover:bg-gray-50 cursor-pointer'
                                    }`}
                                onClick={() => !isDisabled && setActiveFilter(entityType)}
                            >
                                <div className="flex items-center gap-3">
                                    {Icon && <Icon size={16} className={isActive && !isDisabled ? 'text-white' : isDisabled ? 'text-gray-400' : ''} />}
                                    <span className={`font-medium text-sm ${isDisabled ? 'text-gray-400' : ''}`}>{label}</span>
                                </div>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${isDisabled
                                    ? 'bg-gray-100 text-gray-400'
                                    : isActive
                                        ? 'bg-white/20 text-white'
                                        : 'bg-gray-100 text-gray-500'
                                    }`}>
                                    {count}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 overflow-y-auto h-[calc(100vh-64px)]">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <Link to="/home" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-2 transition-colors">
                            <ArrowLeft size={16} />
                            Back to Dashboard
                        </Link>
                        <h1 className="text-2xl font-bold text-gray-900">Search Results</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Found {results?.totalCount || 0} results for "<span className="font-medium text-gray-900">{query}</span>" ({mode})
                        </p>
                    </div>

                    <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm h-fit">
                        <button
                            className={`p-2 rounded-md transition-all ${viewMode === 'kanban' ? 'bg-custom-blue text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setViewMode('kanban')}
                            title="Kanban View"
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            className={`p-2 rounded-md transition-all ${viewMode === 'table' ? 'bg-custom-blue text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setViewMode('table')}
                            title="Table View"
                        >
                            <List size={18} />
                        </button>
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-200 border-t-custom-blue"></div>
                        <p className="mt-4 text-gray-500 font-medium">Searching across all records...</p>
                    </div>
                )}

                {/* Error State */}
                {error && !loading && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <div className="text-red-500 font-semibold mb-2">Search Error</div>
                        <div className="text-red-600 text-sm">{error}</div>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 px-4 py-2 bg-white border border-red-200 text-red-600 rounded-md text-sm hover:bg-red-50 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* No Results */}
                {!loading && !error && results?.totalCount === 0 && (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="text-gray-400" size={32} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Found</h3>
                        <p className="text-gray-500 max-w-xs mx-auto">
                            We couldn't find any matches for "{query}". Try checking for typos or using different keywords.
                        </p>
                    </div>
                )}

                {/* Results */}
                {!loading && !error && results?.totalCount > 0 && (
                    <div className="space-y-6">
                        {renderContent()}
                    </div>
                )}
            </main>
        </div>
    );
};

export default GlobalSearchResults;
