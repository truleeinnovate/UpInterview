import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    User,
    Mail,
    Briefcase,
    Building,
    CreditCard,
    Calendar,
    Tag as TagIcon
} from 'lucide-react';
import {
    useCreateInterviewer,
    useUpdateInterviewer,
    useInterviewerById,
    useAllInterviewers,
    useInterviewerTags
} from '../../../../apiHooks/useInterviewers';
import { usePaginatedTeams } from '../../../../apiHooks/useInterviewerGroups';
import { useUsers } from '../../../../apiHooks/useUsers';
import SidebarPopup from '../../../../Components/Shared/SidebarPopup/SidebarPopup';

const InputField = ({ label, name, value, onChange, error, type = "text", placeholder, required, disabled }) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative rounded-md shadow-sm">
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-custom-blue focus:ring-custom-blue sm:text-sm px-3 py-2 border ${error ? 'border-red-500' : ''} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                placeholder={placeholder}
                disabled={disabled}
                required={required}
            />
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
);

const CreateInterviewer = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        interviewer_type: 'internal',
        title: '',
        department: '',
        external_company: '',
        user_id: '',
        team_id: '',
        is_active: true,
        max_interviews_per_week: 5,
        tag_ids: [],
        hourly_rate: '',
        contract_end_date: ''
    });

    const [errors, setErrors] = useState({});

    // API Hooks
    const createMutation = useCreateInterviewer();
    const updateMutation = useUpdateInterviewer();
    const { data: interviewerData, isLoading: isLoadingInterviewer } = useInterviewerById(id);
    const { data: teamsData } = usePaginatedTeams({ limit: 100 });
    const { data: tagsData } = useInterviewerTags({ active_only: true });
    const { data: usersData } = useUsers();

    // Load data for edit mode
    useEffect(() => {
        if (isEditMode && interviewerData) {
            setFormData({
                full_name: interviewerData.full_name || '',
                email: interviewerData.email || '',
                interviewer_type: interviewerData.interviewer_type || 'internal',
                title: interviewerData.title || '',
                department: interviewerData.department || '',
                external_company: interviewerData.external_company || '',
                user_id: interviewerData.user_id?._id || '',
                team_id: interviewerData.team_id?._id || '',
                is_active: interviewerData.is_active,
                max_interviews_per_week: interviewerData.max_interviews_per_week || 5,
                tag_ids: interviewerData.tag_ids?.map(t => t._id) || [],
                hourly_rate: interviewerData.hourly_rate || '',
                contract_end_date: interviewerData.contract_end_date ? new Date(interviewerData.contract_end_date).toISOString().split('T')[0] : ''
            });
        }
    }, [isEditMode, interviewerData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox' && name === 'tag_ids') {
            const tagId = value;
            const currentTags = [...formData.tag_ids];
            if (checked) {
                setFormData(prev => ({ ...prev, tag_ids: [...currentTags, tagId] }));
            } else {
                setFormData(prev => ({ ...prev, tag_ids: currentTags.filter(id => id !== tagId) }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'number' ? Number(value) : value
            }));
        }

        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            if (isEditMode) {
                await updateMutation.mutateAsync({ id, data: formData });
            } else {
                await createMutation.mutateAsync(formData);
            }
            navigate('/interviewers');
        } catch (error) {
            console.error('Error saving interviewer:', error);
            // Handle error (show toast)
        }
    };

    const teams = teamsData?.data || [];
    const tags = tagsData || [];
    const users = usersData?.data || usersData || [];

    if (isEditMode && isLoadingInterviewer) {
        return <div className="p-8 text-center text-gray-500">Loading interviewer details...</div>;
    }

    return (

        <SidebarPopup
            title={isEditMode ? 'Edit Interviewer' : 'Add New Interviewer'}
            onClose={() => navigate('/interviewers')}
            width="w-[600px]"
        >
            <div className="p-6">
                <p className="text-sm text-gray-500 mb-6">
                    {isEditMode ? 'Update interviewer details and assignments' : 'Create a new interviewer profile'}
                </p>

                <form onSubmit={onSubmit} className="space-y-6">
                    {/* Basic Information Card */}
                    <div className="bg-gray-50 rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <User size={18} className="text-custom-blue" />
                            Basic Information
                        </h2>

                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Interviewer Type
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="interviewer_type"
                                            value="internal"
                                            checked={formData.interviewer_type === 'internal'}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-custom-blue focus:ring-custom-blue"
                                        />
                                        <span className="text-sm text-gray-700">Internal (Employee)</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="interviewer_type"
                                            value="external"
                                            checked={formData.interviewer_type === 'external'}
                                            onChange={handleChange}
                                            className="w-4 h-4 text-custom-blue focus:ring-custom-blue"
                                        />
                                        <span className="text-sm text-gray-700">External</span>
                                    </label>
                                </div>
                            </div>

                            {formData.interviewer_type === 'internal' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Link to User Account
                                    </label>
                                    <select
                                        name="user_id"
                                        value={formData.user_id}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-custom-blue focus:ring-custom-blue sm:text-sm px-3 py-2 border"
                                    >
                                        <option value="">Select a user...</option>
                                        {users.map(user => (
                                            <option key={user._id} value={user._id}>
                                                {user.firstName} {user.lastName} ({user.email})
                                            </option>
                                        ))}
                                    </select>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Linking to a user account allows them to log in and view their interviews.
                                    </p>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <InputField
                                    label="Full Name"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    error={errors.full_name}
                                    required
                                    placeholder="e.g. John Doe"
                                />

                                <InputField
                                    label="Email Address"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    error={errors.email}
                                    type="email"
                                    required
                                    placeholder="e.g. john@example.com"
                                />

                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <InputField
                                    label="Job Title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Senior Eng."
                                />

                                {formData.interviewer_type === 'internal' ? (
                                    <InputField
                                        label="Department"
                                        name="department"
                                        value={formData.department}
                                        onChange={handleChange}
                                        placeholder="e.g. Engineering"
                                    />
                                ) : (
                                    <InputField
                                        label="Company"
                                        name="external_company"
                                        value={formData.external_company}
                                        onChange={handleChange}
                                        placeholder="e.g. Agency Name"
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Professional Details */}
                    <div className="bg-gray-50 rounded-xl p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Briefcase size={18} className="text-custom-blue" />
                            Professional Details
                        </h2>

                        <div className="grid grid-cols-1 gap-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Assign to Team
                                    </label>
                                    <select
                                        name="team_id"
                                        value={formData.team_id}
                                        onChange={handleChange}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-custom-blue focus:ring-custom-blue sm:text-sm px-3 py-2 border"
                                    >
                                        <option value="">Select a team...</option>
                                        {teams.map(team => (
                                            <option key={team._id} value={team._id}>
                                                {team.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <InputField
                                    label="Max Interviews / Week"
                                    name="max_interviews_per_week"
                                    value={formData.max_interviews_per_week}
                                    onChange={handleChange}
                                    type="number"
                                    placeholder="5"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tags (Skills, Levels, etc.)
                                </label>
                                <div className="border rounded-md p-3 min-h-[80px] bg-white">
                                    <div className="flex flex-wrap gap-2">
                                        {tags.map(tag => (
                                            <label
                                                key={tag._id}
                                                className={`inline-flex items-center px-3 py-1 rounded-full text-xs cursor-pointer transition-colors border ${formData.tag_ids.includes(tag._id)
                                                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                                                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    name="tag_ids"
                                                    value={tag._id}
                                                    checked={formData.tag_ids.includes(tag._id)}
                                                    onChange={handleChange}
                                                    className="hidden"
                                                />
                                                {tag.name}
                                            </label>
                                        ))}
                                        {tags.length === 0 && (
                                            <p className="text-sm text-gray-400">No tags available.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {formData.interviewer_type === 'external' && (
                                <>
                                    <div className="border-t border-gray-200 my-2"></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField
                                            label="Hourly Rate"
                                            name="hourly_rate"
                                            value={formData.hourly_rate}
                                            onChange={handleChange}
                                            type="number"
                                            placeholder="0.00"
                                        />

                                        <InputField
                                            label="Contract End Date"
                                            name="contract_end_date"
                                            value={formData.contract_end_date}
                                            onChange={handleChange}
                                            type="date"
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/interviewers')}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createMutation.isLoading || updateMutation.isLoading}
                            className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-custom-blue rounded-lg hover:bg-custom-blue/90 disabled:opacity-50"
                        >
                            <Save size={18} />
                            {isEditMode ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div >
        </SidebarPopup >
    );
};

export default CreateInterviewer;
