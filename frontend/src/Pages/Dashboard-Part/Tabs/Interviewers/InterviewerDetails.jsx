import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Pencil,
    Trash2,
    Mail,
    Briefcase,
    Building,
    Calendar,
    Users,
    CreditCard,
    Star,
    Power
} from 'lucide-react';
import SidebarPopup from '../../../../Components/Shared/SidebarPopup/SidebarPopup';
import { useInterviewerById, useDeleteInterviewer, useToggleInterviewerActive } from '../../../../apiHooks/useInterviewers';
import { capitalizeFirstLetter } from '../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter';

// Helper for Grid Items
const GridItem = ({ icon: Icon, label, value }) => {
    if (!value) return null;
    return (
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-500 border border-gray-100">
                <Icon size={20} />
            </div>
            <div>
                <p className="text-xs font-medium text-gray-500 mb-0.5">{label}</p>
                <p className="text-base font-semibold text-gray-900">{value}</p>
            </div>
        </div>
    );
};

export const InterviewerDetailsContent = ({ interviewer }) => {
    // Get display values
    let displayEmail = interviewer.email;
    let displayName = interviewer.full_name;

    if (interviewer.interviewer_type === 'internal' && interviewer.user_id && typeof interviewer.user_id === 'object') {
        const user = interviewer.user_id;
        if (user.firstName || user.lastName) {
            displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        }
        if (user.email) displayEmail = user.email;
    }

    return (
        <div className="p-1 pb-20">
            <div className="space-y-6 pt-4 px-2">
                {/* Contact Information Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-6">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                        <GridItem
                            icon={Mail}
                            label="Email Address"
                            value={displayEmail}
                        />
                        <GridItem
                            icon={Users}
                            label="Assigned Team"
                            value={interviewer.team_id?.name || 'No Team Assigned'}
                        />
                        {interviewer.user_id && (
                            <GridItem
                                icon={CreditCard}
                                label="Linked Account"
                                value={`${displayName}`}
                            />
                        )}
                    </div>
                </div>

                {/* Professional Details Card */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-6">Professional Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                        <GridItem
                            icon={interviewer.interviewer_type === 'internal' ? Building : Briefcase}
                            label={interviewer.interviewer_type === 'internal' ? 'Department' : 'Company'}
                            value={interviewer.interviewer_type === 'internal' ? interviewer.department : interviewer.external_company}
                        />

                        <GridItem
                            icon={Star}
                            label="Overall Rating"
                            value={interviewer.user_id.rating ? `${interviewer.user_id.rating.toFixed(1)} / 5.0` : 'N/A'}
                        />

                        <GridItem
                            icon={Calendar}
                            label="Availability"
                            value={`${interviewer.max_interviews_per_week} Interviews/Week`}
                        />

                        {interviewer.interviewer_type === 'external' && (
                            <GridItem icon={CreditCard} label="Hourly Rate" value={`$${interviewer.hourly_rate}`} />
                        )}
                    </div>

                    {/* Tags Section */}
                    {interviewer.tag_ids && interviewer.tag_ids.length > 0 && (
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <p className="text-xs font-medium text-gray-500 mb-3">Expertise & Skills</p>
                            <div className="flex flex-wrap gap-2">
                                {interviewer.tag_ids.map((tag, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-50 text-gray-700 border border-gray-200"
                                    >
                                        {tag.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const InterviewerDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: interviewer, isLoading, isError } = useInterviewerById(id);
    const deleteMutation = useDeleteInterviewer();
    const toggleActiveMutation = useToggleInterviewerActive();

    const handleEdit = () => {
        navigate(`/interviewers/${id}/edit`);
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this interviewer?')) {
            await deleteMutation.mutateAsync(id);
            navigate('/interviewers');
        }
    };

    const handleToggleActive = async () => {
        if (interviewer) {
            await toggleActiveMutation.mutateAsync({
                id,
                is_active: !interviewer.is_active
            });
        }
    };

    if (isLoading) return null; // Or a loading spinner handled by SidebarPopup content if strictly needed, but null prevents flash

    if (isError || !interviewer) return null; // Error handling usually at page level or retry

    // Prepare Header Elements
    let displayName = interviewer.full_name;
    let displayEmail = interviewer.email;
    if (interviewer.interviewer_type === 'internal' && interviewer.user_id && typeof interviewer.user_id === 'object') {
        const user = interviewer.user_id;
        if (user.firstName || user.lastName) {
            displayName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
        }
        if (user.email) displayEmail = user.email;
    }

    const titleRight = (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ml-2 ${interviewer.is_active
            ? 'bg-green-50 text-green-700 border-green-200'
            : 'bg-gray-100 text-gray-600 border-gray-200'
            }`}>
            {interviewer.is_active ? 'Active' : 'Inactive'}
        </span>
    );

    const subTitle = (
        <span className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${interviewer.interviewer_type === 'internal'
                ? 'bg-purple-50 text-purple-700 border border-purple-100'
                : 'bg-orange-50 text-orange-700 border border-orange-100'
                }`}>
                {capitalizeFirstLetter(interviewer.interviewer_type)}
            </span>
            <span className="text-gray-300">•</span>
            <span>{displayEmail || '-'}</span>
        </span>
    );


    return (
        <SidebarPopup
            isOpen={true}
            onClose={() => navigate('/interviewers')}
            width="w-full sm:w-[500px] md:w-[600px] lg:w-[700px]"
            title={displayName || 'Unknown'}
            titleRight={titleRight}
            subTitle={subTitle}
            showEdit={true}
            onEdit={handleEdit}
            id={id}
        >
            <InterviewerDetailsContent interviewer={interviewer} />
        </SidebarPopup>
    );
};

export default InterviewerDetails;
