import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, LayoutGrid, List, Search, Users, Briefcase, Calendar, Video, FileText, MessageSquare, Building2, UsersRound, Tag, Building, Filter } from 'lucide-react';
import { useGlobalSearch } from '../../hooks/useGlobalSearch';
import '../../Components/Navbar/GlobalSearch/GlobalSearch.css';
import TableView from '../../Components/Shared/Table/TableView';
import { capitalizeFirstLetter } from '../../utils/CapitalizeFirstLetter/capitalizeFirstLetter';

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

// Helper function to highlight matching text
const highlightMatch = (text, query) => {
    if (!query || !text) return text;
    const textStr = String(text);
    try {
        const escapedQuery = query.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedQuery})`, 'gi');
        const parts = textStr.split(regex);
        return parts.map((part, i) =>
            part.toLowerCase() === query.toLowerCase() ? (
                <span key={i} className="bg-yellow-200 text-yellow-900 px-0.5 rounded">{part}</span>
            ) : part
        );
    } catch (e) {
        return text;
    }
};

// Helper function to add spaces before capital letters (e.g., "AIPromptEngineer" -> "AI Prompt Engineer")
const addSpacesToCamelCase = (str) => {
    if (!str || typeof str !== 'string') return str;
    // Add space before uppercase that follows lowercase, and before the last capital in a sequence followed by lowercase
    return str
        .replace(/([a-z])([A-Z])/g, '$1 $2')  // "promptEngineer" -> "prompt Engineer"
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')  // "AIEngineer" -> "AI Engineer"
        .trim();
};

// Define columns for each entity type with clickable first column
const getEntityColumns = (entityType, navigate, highlightText = '') => {
    const config = ENTITY_CONFIG[entityType];
    const handleNavigation = (item) => {
        if (config?.path && item._id) {
            if (entityType === 'assessments') {
                navigate(`${config.path}/${item._id}`, { state: { schedule: item } });
            } else {
                navigate(`${config.path}/${item._id}`);
            }
        }
    };

    // Helper to capitalize and highlight text in custom renders
    const hl = (text) => {
        if (!text || text === '-' || text === 'N/A') return text;
        // Capitalize each word
        const capitalized = String(text).split(' ').map(word => capitalizeFirstLetter(word)).join(' ');
        return highlightMatch(capitalized, highlightText);
    };

    switch (entityType) {
        case 'candidates':
            return [
                {
                    header: 'Candidate Name',
                    key: 'name',
                    render: (_, row) => (
                        <div
                            className="font-medium text-custom-blue cursor-pointer hover:underline"
                            onClick={() => handleNavigation(row)}
                        >
                            {hl(`${row.FirstName || ''} ${row.LastName || ''}`.trim() || 'N/A')}
                        </div>
                    )
                },
                { header: 'Email', key: 'Email', render: (val) => hl(val || '-') },
                { header: 'Phone', key: 'Phone', render: (val) => hl(val || '-') },
                { header: 'Current Role', key: 'CurrentRole', render: (val) => hl(addSpacesToCamelCase(val) || '-') },
                { header: 'Experience', key: 'CurrentExperience', render: (val) => val ? `${val} yrs` : '-' },
            ];

        case 'positions':
            return [
                {
                    header: 'Position Title',
                    key: 'title',
                    render: (_, row) => (
                        <div
                            className="font-medium text-custom-blue cursor-pointer hover:underline"
                            onClick={() => handleNavigation(row)}
                        >
                            {hl(row.title || 'N/A')}
                        </div>
                    )
                },
                { header: 'Code', key: 'positionCode', render: (val) => hl(val || '-') },
                { header: 'Company', key: 'companyname', render: (val) => hl(val || '-') },
                { header: 'Location', key: 'location', render: (val) => hl(val || '-') },
                {
                    header: 'Skills',
                    key: 'skills',
                    render: (val) => (
                        <div className="max-w-[300px] truncate" title={val || '-'}>
                            {hl(val || '-')}
                        </div>
                    )
                },
                { header: 'Status', key: 'status', render: (val) => capitalizeFirstLetter(val) || '-' },
            ];

        case 'interviewTemplates':
            return [
                {
                    header: 'Template Title',
                    key: 'title',
                    render: (_, row) => (
                        <div
                            className="font-medium text-custom-blue cursor-pointer hover:underline"
                            onClick={() => handleNavigation(row)}
                        >
                            {hl(row.title || 'N/A')}
                        </div>
                    )
                },
                { header: 'Code', key: 'interviewTemplateCode', render: (val) => hl(val || '-') },
                { header: 'Description', key: 'description', render: (val) => val?.substring(0, 50) || '-' },
            ];

        case 'interviews':
            return [
                {
                    header: 'Interview Code',
                    key: 'interviewCode',
                    render: (_, row) => (
                        <div
                            className="font-medium text-custom-blue cursor-pointer hover:underline"
                            onClick={() => handleNavigation(row)}
                        >
                            {hl(row.interviewCode || 'N/A')}
                        </div>
                    )
                },
                { header: 'Candidate', key: 'candidateId', render: (val) => val?.FirstName ? hl(`${val.FirstName} ${val.LastName || ''}`) : '-' },
                { header: 'Technology', key: 'technology', render: (val) => hl(val || '-') },
                { header: 'Status', key: 'status', render: (val) => capitalizeFirstLetter(val) || '-' },
            ];

        case 'interviewers':
            return [
                {
                    header: 'Name',
                    key: 'name',
                    render: (_, row) => (
                        <div
                            className="font-medium text-custom-blue cursor-pointer hover:underline"
                            onClick={() => handleNavigation(row)}
                        >
                            {hl(row.contactId ? `${row.contactId.firstName || ''} ${row.contactId.lastName || ''}`.trim() : 'N/A')}
                        </div>
                    )
                },
                { header: 'Email', key: 'email', render: (_, row) => hl(row.contactId?.email || '-') },
                { header: 'Status', key: 'status', render: (val) => capitalizeFirstLetter(val) || '-' },
            ];

        case 'mockInterviews':
            return [
                {
                    header: 'Code',
                    key: 'mockInterviewCode',
                    render: (_, row) => (
                        <div
                            className="font-medium text-custom-blue cursor-pointer hover:underline"
                            onClick={() => handleNavigation(row)}
                        >
                            {hl(row.mockInterviewCode || 'N/A')}
                        </div>
                    )
                },
                { header: 'Candidate', key: 'candidateName', render: (val) => hl(val || '-') },
                { header: 'Role', key: 'currentRole', render: (val) => hl(val || '-') },
            ];

        case 'assessmentTemplates':
            return [
                {
                    header: 'Title',
                    key: 'AssessmentTitle',
                    render: (_, row) => (
                        <div
                            className="font-medium text-custom-blue cursor-pointer hover:underline"
                            onClick={() => handleNavigation(row)}
                        >
                            {hl(row.AssessmentTitle || 'N/A')}
                        </div>
                    )
                },
                { header: 'Code', key: 'AssessmentCode', render: (val) => hl(val || '-') },
                { header: 'Duration', key: 'Duration', render: (val) => val ? `${val} mins` : '-' },
                { header: 'Status', key: 'status', render: (val) => capitalizeFirstLetter(val) || '-' },
            ];

        case 'assessments':
            return [
                {
                    header: 'Assessment',
                    key: 'assessmentId',
                    render: (_, row) => (
                        <div
                            className="font-medium text-custom-blue cursor-pointer hover:underline"
                            onClick={() => handleNavigation(row)}
                        >
                            {hl(row.assessmentId?.AssessmentTitle || row.scheduledAssessmentCode || 'N/A')}
                        </div>
                    )
                },
                { header: 'Code', key: 'scheduledAssessmentCode', render: (val) => hl(val || '-') },
                {
                    header: 'Candidates',
                    key: 'candidates',
                    render: (_, row) => {
                        const names = (row.candidates || [])
                            .map(c => c.candidateId ? `${c.candidateId.FirstName} ${c.candidateId.LastName}` : '')
                            .filter(Boolean)
                            .join(', ');
                        return hl(names || '-');
                    }
                },
                { header: 'Status', key: 'status', render: (val) => capitalizeFirstLetter(val) || '-' },
            ];

        case 'questionBank':
            return [
                {
                    header: 'Question',
                    key: 'questionName',
                    render: (_, row) => (
                        <div
                            className="font-medium text-custom-blue cursor-pointer hover:underline"
                            onClick={() => handleNavigation(row)}
                        >
                            {hl(row.questionName || 'N/A')}
                        </div>
                    )
                },
                { header: 'Text', key: 'questionText', render: (val) => hl(val?.substring(0, 50) || '-') },
            ];

        case 'feedback':
            return [
                {
                    header: 'Candidate',
                    key: 'candidateId',
                    render: (_, row) => (
                        <div
                            className="font-medium text-custom-blue cursor-pointer hover:underline"
                            onClick={() => handleNavigation(row)}
                        >
                            {hl(row.candidateId ? `${row.candidateId.FirstName || ''} ${row.candidateId.LastName || ''}`.trim() : 'N/A')}
                        </div>
                    )
                },
                { header: 'Interviewer', key: 'interviewerId', render: (_, row) => row.interviewerId ? hl(`${row.interviewerId.firstName || ''} ${row.interviewerId.lastName || ''}`.trim()) : '-' },
                { header: 'Rating', key: 'rating', render: (val) => val || '-' },
            ];

        case 'supportDesk':
            return [
                {
                    header: 'Ticket Code',
                    key: 'ticketCode',
                    render: (_, row) => (
                        <div
                            className="font-medium text-custom-blue cursor-pointer hover:underline"
                            onClick={() => handleNavigation(row)}
                        >
                            {hl(row.ticketCode || 'N/A')}
                        </div>
                    )
                },
                { header: 'Subject', key: 'subject', render: (val) => hl(val || '-') },
                { header: 'Contact', key: 'contact', render: (val) => hl(val || '-') },
                { header: 'Issue Type', key: 'issueType', render: (val) => hl(val || '-') },
            ];

        case 'companies':
            return [
                {
                    header: 'Company Name',
                    key: 'name',
                    render: (_, row) => (
                        <div
                            className="font-medium text-custom-blue cursor-pointer hover:underline"
                            onClick={() => handleNavigation(row)}
                        >
                            {hl(row.name || 'N/A')}
                        </div>
                    )
                },
                { header: 'Industry', key: 'industry', render: (val) => hl(val || '-') },
                { header: 'Contact', key: 'primaryContactName', render: (val) => hl(val || '-') },
            ];

        case 'myTeams':
            return [
                {
                    header: 'Team Name',
                    key: 'name',
                    render: (_, row) => (
                        <div
                            className="font-medium text-custom-blue cursor-pointer hover:underline"
                            onClick={() => handleNavigation(row)}
                        >
                            {hl(row.name || 'N/A')}
                        </div>
                    )
                },
                { header: 'Department', key: 'department', render: (val) => hl(val || '-') },
                { header: 'Description', key: 'description', render: (val) => hl(val?.substring(0, 50) || '-') },
            ];

        case 'interviewerTags':
            return [
                {
                    header: 'Tag Name',
                    key: 'name',
                    render: (_, row) => (
                        <div
                            className="font-medium text-custom-blue cursor-pointer hover:underline"
                            onClick={() => handleNavigation(row)}
                        >
                            {hl(row.name || 'N/A')}
                        </div>
                    )
                },
                { header: 'Category', key: 'category', render: (val) => hl(val || '-') },
            ];

        case 'tenants':
            return [
                {
                    header: 'Company',
                    key: 'company',
                    render: (_, row) => (
                        <div
                            className="font-medium text-custom-blue cursor-pointer hover:underline"
                            onClick={() => handleNavigation(row)}
                        >
                            {hl(row.company || 'N/A')}
                        </div>
                    )
                },
                { header: 'Email', key: 'email', render: (val) => hl(val || '-') },
                { header: 'Phone', key: 'phone', render: (val) => hl(val || '-') },
            ];

        default:
            return [
                {
                    header: 'Name',
                    key: '_displayName',
                    render: (_, row) => (
                        <div
                            className="font-medium text-custom-blue cursor-pointer hover:underline"
                            onClick={() => handleNavigation(row)}
                        >
                            {hl(row._displayName || 'N/A')}
                        </div>
                    )
                },
                { header: 'Details', key: '_displaySubtitle', render: (val) => hl(val || '-') },
            ];
    }
};

const GlobalSearchResults = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { globalSearch, loading, results, error } = useGlobalSearch();

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

    // Render content - Table only
    const renderContent = () => {
        if (Object.keys(filteredResults).length === 0) return null;

        return Object.entries(filteredResults).map(([entityType, items]) => {
            const config = ENTITY_CONFIG[entityType];
            const IconComponent = config?.icon || Search;
            const tableColumns = getEntityColumns(entityType, navigate, query);

            return (
                <div key={entityType} className="mb-8 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                        <IconComponent size={20} className="text-custom-blue" />
                        <span className="text-lg font-semibold text-gray-800">{config?.label || entityType}</span>
                        <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">
                            {items.length}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <TableView
                            data={items}
                            columns={tableColumns}
                            actions={[]} // No action buttons
                            autoHeight={true}
                            highlightText={query}
                        />
                    </div>
                </div>
            );
        });
    };

    return (
        <div className="global-search-results-page bg-gray-50 min-h-screen flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0 h-[calc(100vh-64px)] overflow-y-auto sticky top-16">
                <div className="p-4 border-b border-gray-200 font-semibold text-gray-700 text-sm uppercase tracking-wider">
                    Search Results
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

                    {/* View toggle - Table only (Kanban disabled) */}
                    {/* <div className="flex bg-white rounded-lg border border-gray-200 p-1 shadow-sm h-fit">
                        <button
                            className="p-2 rounded-md text-gray-300 cursor-not-allowed"
                            disabled
                            title="Kanban View (Disabled)"
                        >
                            <LayoutGrid size={18} />
                        </button>
                        <button
                            className="p-2 rounded-md bg-custom-blue text-white shadow-sm"
                            title="Table View"
                        >
                            <List size={18} />
                        </button>
                    </div> */}
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

