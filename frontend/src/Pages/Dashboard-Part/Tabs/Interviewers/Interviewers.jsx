import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Mail,
    Briefcase,
    Star,
    Users,
    Building,
    Tag as TagIcon
} from 'lucide-react';
import { usePaginatedInterviewers, useToggleInterviewerActive } from '../../../../apiHooks/useInterviewers';
import Toolbar from '../../../../Components/Shared/Toolbar/Toolbar';
import StatusBadge from '../../../../Components/SuperAdminComponents/common/StatusBadge';
import { capitalizeFirstLetter } from '../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter';
import { getEmptyStateMessage } from '../../../../utils/EmptyStateMessage/emptyStateMessage';

// Card Component
const InterviewerCard = ({ interviewer, onEdit, onDelete, onToggleActive, onView }) => {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    // Close menu when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const isActive = interviewer.is_active;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow h-full flex flex-col">
            <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                    {interviewer.avatar_url ? (
                        <img
                            src={interviewer.avatar_url}
                            alt={interviewer.full_name}
                            className="w-12 h-12 rounded-full object-cover border border-gray-100"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
                            {interviewer.full_name?.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div>
                        <h3
                            className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600 truncate max-w-[180px]"
                            onClick={() => onView(interviewer._id)}
                        >
                            {interviewer.full_name}
                        </h3>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${interviewer.interviewer_type === 'internal'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-orange-100 text-orange-700'
                                }`}>
                                {capitalizeFirstLetter(interviewer.interviewer_type)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="relative" ref={menuRef}>
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"
                    >
                        <MoreVertical size={16} />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1">
                            <button
                                onClick={() => { setShowMenu(false); onView(interviewer._id); }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                                View Profile
                            </button>
                            <button
                                onClick={() => { setShowMenu(false); onEdit(interviewer._id); }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => { setShowMenu(false); onToggleActive(interviewer._id, !isActive); }}
                                className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${isActive ? 'text-red-600' : 'text-green-600'}`}
                            >
                                {isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <div className="border-t border-gray-100 my-1"></div>
                            <button
                                onClick={() => { setShowMenu(false); onDelete(interviewer._id); }}
                                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                                Delete
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 space-y-2 mb-4">
                {interviewer.title && (
                    <div className="flex items-center text-sm text-gray-600 gap-2">
                        <Briefcase size={14} className="text-gray-400" />
                        <span className="truncate">{interviewer.title}</span>
                    </div>
                )}

                <div className="flex items-center text-sm text-gray-600 gap-2">
                    <Mail size={14} className="text-gray-400" />
                    <span className="truncate">{interviewer.email}</span>
                </div>

                {(interviewer.department || interviewer.external_company) && (
                    <div className="flex items-center text-sm text-gray-600 gap-2">
                        <Building size={14} className="text-gray-400" />
                        <span className="truncate">
                            {interviewer.interviewer_type === 'internal'
                                ? interviewer.department
                                : interviewer.external_company}
                        </span>
                    </div>
                )}

                {interviewer.team_id && (
                    <div className="flex items-center text-sm text-gray-600 gap-2">
                        <Users size={14} className="text-gray-400" />
                        <span className="truncate">{interviewer.team_id.name}</span>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap gap-1 mb-4 h-12 overflow-hidden">
                {interviewer.tag_ids && interviewer.tag_ids.slice(0, 3).map((tag, idx) => (
                    <span
                        key={idx}
                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                        style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                    >
                        {tag.name}
                    </span>
                ))}
                {interviewer.tag_ids && interviewer.tag_ids.length > 3 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                        +{interviewer.tag_ids.length - 3}
                    </span>
                )}
            </div>

            <div className="border-t border-gray-100 pt-3 mt-auto flex justify-between items-center">
                <div className="flex items-center gap-1">
                    <Star size={14} className="text-yellow-400 fill-current" />
                    <span className="text-sm font-semibold text-gray-700">
                        {interviewer.overall_rating ? interviewer.overall_rating.toFixed(1) : 'N/A'}
                    </span>
                </div>
                <StatusBadge status={isActive ? 'Active' : 'Inactive'} />
            </div>
        </div>
    );
};

const Interviewers = () => {
    const navigate = useNavigate();
    const [view, setView] = useState('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const ITEMS_PER_PAGE = 10;

    // Filters state
    const [filters, setFilters] = useState({
        type: '',
        status: '',
        team: '',
        tag: ''
    });

    const {
        data,
        isLoading,
        isError,
        refetch
    } = usePaginatedInterviewers({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: searchQuery,
        ...filters
    });

    const toggleActiveMutation = useToggleInterviewerActive();

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
        setCurrentPage(0);
    };

    const handleCreate = () => {
        navigate('/interviewers/new');
    };

    const handleEdit = (id) => {
        navigate(`/interviewers/${id}/edit`);
    };

    const handeView = (id) => {
        navigate(`/interviewers/${id}`);
    };

    const handleDelete = (id) => {
        // Implement delete logic with confirmation
        console.log('Delete', id);
    };

    const handleToggleActive = async (id, isActive) => {
        try {
            await toggleActiveMutation.mutateAsync({ id, is_active: isActive });
        } catch (error) {
            console.error('Error toggling status:', error);
        }
    };

    const interviewers = data?.data || [];
    const pagination = data?.pagination || {};

    const emptyStateMessage = getEmptyStateMessage(
        searchQuery.length > 0,
        interviewers.length,
        pagination.totalItems || 0,
        'interviewers'
    );

    return (
        <div className="p-2 sm:p-2">
            {/* Header */}
            <div className="flex sm:flex-col flex-row justify-between items-start sm:items-center gap-4 mb-6 mt-2">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Interviewers</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage your internal and external interview panel members
                    </p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/90 transition-colors shadow-sm"
                >
                    <Plus size={18} />
                    <span>Add Interviewer</span>
                </button>
            </div>

            {/* Toolbar */}
            <div className="mb-6">
                <Toolbar
                    view={view}
                    setView={setView}
                    searchQuery={searchQuery}
                    onSearch={handleSearch}
                    currentPage={currentPage}
                    totalPages={pagination.totalPages || 0}
                    onPrevPage={() => setCurrentPage(p => Math.max(0, p - 1))}
                    onNextPage={() => setCurrentPage(p => p + 1)}
                    dataLength={pagination.totalItems || 0}
                    searchPlaceholder="Search interviewers..."
                    hideViewToggle={true} // Only grid view for now
                />
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            ) : interviewers.length === 0 ? (
                <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100">
                    {emptyStateMessage}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 grid-cols-4 gap-6">
                    {interviewers.map((interviewer) => (
                        <InterviewerCard
                            key={interviewer._id}
                            interviewer={interviewer}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onToggleActive={handleToggleActive}
                            onView={handeView}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Interviewers;
