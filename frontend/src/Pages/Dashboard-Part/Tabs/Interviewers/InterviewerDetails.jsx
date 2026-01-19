import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Pencil,
    Trash2,
    Mail,
    Briefcase,
    Building,
    Calendar,
    Users,
    CreditCard,
    Star
} from 'lucide-react';
import { useInterviewerById, useDeleteInterviewer, useToggleInterviewerActive } from '../../../../apiHooks/useInterviewers';
import StatusBadge from '../../../../Components/SuperAdminComponents/common/StatusBadge';
import { capitalizeFirstLetter } from '../../../../utils/CapitalizeFirstLetter/capitalizeFirstLetter';

const DetailRow = ({ icon: Icon, label, value }) => {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3 p-3">
            <div className="mt-1">
                <Icon size={18} className="text-gray-400" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className="text-base text-gray-900 font-medium">{value}</p>
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

    if (isLoading) {
        return (
            <div className="max-w-5xl mx-auto p-8 animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                <div className="h-64 bg-gray-200 rounded-xl mb-6"></div>
                <div className="grid grid-cols-2 gap-6">
                    <div className="h-48 bg-gray-200 rounded-xl"></div>
                    <div className="h-48 bg-gray-200 rounded-xl"></div>
                </div>
            </div>
        );
    }

    if (isError || !interviewer) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">Error loading interviewer details.</p>
                <button
                    onClick={() => navigate('/interviewers')}
                    className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/interviewers')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            {interviewer.full_name}
                            <StatusBadge status={interviewer.is_active ? 'Active' : 'Inactive'} />
                        </h1>
                        <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${interviewer.interviewer_type === 'internal'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-orange-100 text-orange-700'
                                }`}>
                                {capitalizeFirstLetter(interviewer.interviewer_type)}
                            </span>
                            <span>•</span>
                            <span>{interviewer.email}</span>
                        </p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleToggleActive}
                        className={`px-4 py-2 text-sm font-medium border rounded-lg transition-colors ${interviewer.is_active
                            ? 'border-red-200 text-red-700 hover:bg-red-50'
                            : 'border-green-200 text-green-700 hover:bg-green-50'
                            }`}
                    >
                        {interviewer.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                        onClick={handleEdit}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <Pencil size={18} />
                        <span>Edit</span>
                    </button>
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-100 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Info Card */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Profile Information</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <DetailRow icon={Briefcase} label="Job Title" value={interviewer.title} />
                            <DetailRow
                                icon={Building}
                                label={interviewer.interviewer_type === 'internal' ? 'Department' : 'Company'}
                                value={interviewer.interviewer_type === 'internal' ? interviewer.department : interviewer.external_company}
                            />
                            <DetailRow icon={Mail} label="Email" value={interviewer.email} />
                            <DetailRow
                                icon={Users}
                                label="Assigned Team"
                                value={interviewer.team_id?.name}
                            />
                            {interviewer.user_id && (
                                <div className="col-span-2">
                                    <DetailRow
                                        icon={Users}
                                        label="Linked User Account"
                                        value={`${interviewer.user_id.full_name} (${interviewer.user_id.email})`}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Expertise & Availability</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-2">Tags</p>
                                <div className="flex flex-wrap gap-2">
                                    {interviewer.tag_ids && interviewer.tag_ids.length > 0 ? (
                                        interviewer.tag_ids.map((tag, idx) => (
                                            <span
                                                key={idx}
                                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                                                style={{
                                                    backgroundColor: `${tag.color || '#94a3b8'}20`,
                                                    color: tag.color || '#94a3b8',
                                                    border: `1px solid ${tag.color || '#94a3b8'}40`
                                                }}
                                            >
                                                {tag.name}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-gray-400 italic">No tags assigned</span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                <DetailRow
                                    icon={Calendar}
                                    label="Max Interviews/Week"
                                    value={interviewer.max_interviews_per_week}
                                />

                                {interviewer.interviewer_type === 'external' && (
                                    <>
                                        <DetailRow
                                            icon={CreditCard}
                                            label="Hourly Rate"
                                            value={`$${interviewer.hourly_rate || '0.00'}`}
                                        />
                                        <DetailRow
                                            icon={Calendar}
                                            label="Contract End Date"
                                            value={interviewer.contract_end_date ? new Date(interviewer.contract_end_date).toLocaleDateString() : '-'}
                                        />
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance</h2>

                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center width-20 height-20 rounded-full bg-yellow-50 p-4 mb-2">
                                <span className="text-4xl font-bold text-yellow-500">
                                    {interviewer.overall_rating ? interviewer.overall_rating.toFixed(1) : 'N/A'}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500">Overall Rating</p>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Interviews Conducted</span>
                                <span className="font-semibold">{interviewer.interviews_conducted || 0}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Hire Success</span>
                                <span className="font-semibold">
                                    {interviewer.rating_breakdown?.hire_success_rate ? `${interviewer.rating_breakdown.hire_success_rate}%` : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InterviewerDetails;
