import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import { decodeJwt } from '../../../../utils/AuthCookieManager/jwtDecode';
import {
    useCreateInterviewer,
    useUpdateInterviewer,
    useInterviewerById,
} from '../../../../apiHooks/useInterviewers';
import {
    useInterviewerTags
} from '../../../../apiHooks/InterviewerTags/useInterviewerTags';
import { usePaginatedTeams, useUpdateTeam } from '../../../../apiHooks/useInterviewerGroups';
import useInterviewersHook from '../../../../hooks/useInterviewers';
import { notify } from '../../../../services/toastService';

// Common Form Components
import SidebarPopup from '../../../../Components/Shared/SidebarPopup/SidebarPopup';
import InfoGuide from '../CommonCode-AllTabs/InfoCards';
import InputField from '../../../../Components/FormFields/InputField';
import DropdownWithSearchField from '../../../../Components/FormFields/DropdownWithSearchField';

const CreateInterviewer = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    // Get tenant from token
    const authToken = Cookies.get('authToken');
    const tokenPayload = decodeJwt(authToken);
    const tenantId = tokenPayload?.tenantId;
    const ownerId = tokenPayload?.userId;

    // Form state
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        interviewer_type: 'internal',
        title: '',
        department: '',
        external_company: '',
        user_id: '', // This will store contact._id
        team_id: '',
        is_active: true,
        max_interviews_per_week: 5,
        tag_ids: [],
        hourly_rate: '',
        contract_end_date: ''
    });

    // Selected user data
    const [selectedUserData, setSelectedUserData] = useState(null);

    // Team validation state
    const [userAlreadyInTeam, setUserAlreadyInTeam] = useState(false);
    const [selectedTeamData, setSelectedTeamData] = useState(null);

    const [errors, setErrors] = useState({});

    // API Hooks
    const createMutation = useCreateInterviewer();
    const updateMutation = useUpdateInterviewer();
    const updateTeamMutation = useUpdateTeam();
    const { data: interviewerData, isLoading: isLoadingInterviewer } = useInterviewerById(id);
    const { teams, isLoading: teamsLoading } = usePaginatedTeams({ limit: 100 });
    const { data: tagsData } = useInterviewerTags({ active_only: true });

    // Use the hook to get internal users
    const { interviewers: internalUsers, loading: usersLoading } = useInterviewersHook();

    const teamsArray = teams || [];
    const tags = tagsData || [];

    // Load data for edit mode
    useEffect(() => {
        if (isEditMode && interviewerData) {
            console.log('Edit mode - interviewerData:', interviewerData);

            // Get the user_id value - could be object with _id or just string
            let userId = interviewerData.user_id?._id || interviewerData.user_id || '';

            // If user_id is null but we have email, try to find matching user
            if (!userId && interviewerData.email && internalUsers.length > 0) {
                const matchingUser = internalUsers.find(u =>
                    u?.contact?.Email?.toLowerCase() === interviewerData.email.toLowerCase() ||
                    u?.contact?.email?.toLowerCase() === interviewerData.email.toLowerCase()
                );
                if (matchingUser) {
                    userId = matchingUser.contact?._id || matchingUser._id;
                    console.log('Found user by email match:', matchingUser);
                }
            }

            console.log('Edit mode - resolved userId:', userId);

            setFormData({
                full_name: interviewerData.full_name || '',
                email: interviewerData.email || '',
                interviewer_type: interviewerData.interviewer_type || 'internal',
                title: interviewerData.title || '',
                department: interviewerData.department || '',
                external_company: interviewerData.external_company || '',
                user_id: userId,
                team_id: interviewerData.team_id?._id || interviewerData.team_id || '',
                is_active: interviewerData.is_active !== undefined ? interviewerData.is_active : true,
                max_interviews_per_week: interviewerData.max_interviews_per_week || 5,
                tag_ids: interviewerData.tag_ids?.map(t => t._id || t) || [],
                hourly_rate: interviewerData.hourly_rate || '',
                contract_end_date: interviewerData.contract_end_date ? new Date(interviewerData.contract_end_date).toISOString().split('T')[0] : ''
            });

            // If user is linked, find and set user data
            if (userId && internalUsers.length > 0) {
                console.log('Looking for user in internalUsers. Available contacts:',
                    internalUsers.map(u => ({ contact_id: u?.contact?._id, _id: u?._id }))
                );

                const linkedUser = internalUsers.find(u =>
                    (u?.contact?._id === userId) || (u?._id === userId)
                );

                console.log('Found linkedUser:', linkedUser);
                if (linkedUser) {
                    setSelectedUserData(linkedUser);
                }
            }
        }
    }, [isEditMode, interviewerData, internalUsers]);

    // Update selected user data when user_id changes
    useEffect(() => {
        if (formData.user_id && formData.interviewer_type === 'internal') {
            // Handle case where user_id might be an object (if fetched from backend) or string (if selected from dropdown)
            const userId = typeof formData.user_id === 'object' ? formData.user_id._id : formData.user_id;

            const selectedUser = internalUsers.find(u =>
                (u?.contact?._id === userId) || (u?._id === userId)
            );
            if (selectedUser) {
                setSelectedUserData(selectedUser);
                const contact = selectedUser.contact || selectedUser;
                const fullName = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
                setFormData(prev => ({
                    ...prev,
                    full_name: fullName || prev.full_name,
                    email: contact.Email || contact.email || prev.email
                }));
            }
        } else if (!formData.user_id && formData.interviewer_type === 'internal') {
            setSelectedUserData(null);
            if (!isEditMode) {
                setFormData(prev => ({
                    ...prev,
                    full_name: '',
                    email: ''
                }));
            }
        }
    }, [formData.user_id, formData.interviewer_type, internalUsers, isEditMode]);

    // Check if user is already in selected team
    useEffect(() => {
        if (formData.team_id && formData.user_id) {
            const selectedTeam = teamsArray.find(t => t._id === formData.team_id);
            setSelectedTeamData(selectedTeam);

            if (selectedTeam) {
                // Check if user's contact._id is in team's member_ids
                const memberIds = selectedTeam.member_ids || [];
                const isInTeam = memberIds.some(memberId => {
                    const memberIdStr = memberId?._id || memberId;
                    return memberIdStr === formData.user_id;
                });
                setUserAlreadyInTeam(isInTeam);
            }
        } else {
            setUserAlreadyInTeam(false);
            setSelectedTeamData(null);
        }
    }, [formData.team_id, formData.user_id, teamsArray]);

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

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};

        // For internal type, only user_id is required
        if (formData.interviewer_type === 'internal' && !formData.user_id) {
            newErrors.user_id = 'Please select a user account';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            // Build payload - only save user_id, not email/name (those come from user)
            const payload = {
                user_id: formData.user_id,
                interviewer_type: formData.interviewer_type,
                team_id: formData.team_id || null,
                is_active: formData.is_active,
                max_interviews_per_week: formData.max_interviews_per_week,
                tag_ids: formData.tag_ids,
                tenantId,
                ownerId
            };

            // If team is selected and user is NOT already in team, add user to team
            if (formData.team_id && !userAlreadyInTeam && selectedTeamData) {
                const currentMembers = (selectedTeamData.member_ids || []).map(m => m?._id || m);
                const updatedMembers = [...currentMembers, formData.user_id];

                await updateTeamMutation.mutateAsync({
                    teamId: formData.team_id,
                    teamData: {
                        ...selectedTeamData,
                        member_ids: updatedMembers
                    }
                });
            }

            if (isEditMode) {
                await updateMutation.mutateAsync({ id, data: payload });
                notify.success('Interviewer updated successfully');
            } else {
                await createMutation.mutateAsync(payload);
                notify.success('Interviewer created successfully');
            }
            navigate('/interviewers');
        } catch (error) {
            console.error('Error saving interviewer:', error);
            notify.error(error.response?.data?.message || 'Failed to save interviewer');
        }
    };

    const handleClose = () => {
        navigate('/interviewers');
    };

    const teamOptions = teamsArray.map(team => ({ value: team._id, label: team.name }));

    // Build user options - store contact._id as value
    const userOptions = internalUsers
        .filter(user => user.type === 'internal' || user.roleLabel === 'Admin')
        .map(user => ({
            value: user?.contact?._id || user?._id, // Store contact._id
            label: `${user?.contact?.firstName || ''} ${user?.contact?.lastName || ''}`.trim() || user?.contact?.Email || 'Unknown',
            email: user?.contact?.Email || '',
            currentRole: user?.contact?.CurrentRole || user?.roleLabel || ''
        }))
        .filter(opt => opt.value);

    const isUserLinked = formData.interviewer_type === 'internal' && formData.user_id && selectedUserData;

    if (isEditMode && isLoadingInterviewer) {
        return (
            <SidebarPopup title="Loading..." onClose={handleClose}>
                <div className="p-8 text-center text-gray-500">Loading interviewer details...</div>
            </SidebarPopup>
        );
    }

    return (
        <SidebarPopup
            title={isEditMode ? 'Edit Interviewer' : 'Add New Interviewer'}
            onClose={handleClose}
        >
            <InfoGuide
                title="Interviewer Profile Guidelines"
                items={[
                    <><span className="font-medium">Internal:</span> Select an existing user to add as interviewer</>,
                    <><span className="font-medium">Team:</span> Assign to teams for better organization</>,
                    <><span className="font-medium">Tags:</span> Add skill tags to match with candidates</>,
                ]}
            />

            <div className="sm:p-0 p-4 mb-10">
                <div className="space-y-4">
                    <div className='flex items-center justify-between'>
                        <h4 className="text-lg font-semibold text-gray-800">Basic Information</h4>
                        {/* Active Toggle */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Active</span>
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.is_active ? 'bg-custom-blue' : 'bg-gray-300'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>
                    {/* Interviewer Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Interviewer Type
                        </label>
                        <div className="flex gap-6">
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
                            <label className="flex items-center gap-2 cursor-not-allowed opacity-50">
                                <input
                                    type="radio"
                                    name="interviewer_type"
                                    value="external"
                                    disabled
                                    className="w-4 h-4 text-gray-400"
                                />
                                <span className="text-sm text-gray-400">External (Coming Soon)</span>
                            </label>
                        </div>
                    </div>

                    {/* Link to User Account */}
                    {formData.interviewer_type === 'internal' && (
                        <DropdownWithSearchField
                            value={formData.user_id}
                            options={userOptions}
                            onChange={handleChange}
                            label="Link to User Account"
                            name="user_id"
                            placeholder={usersLoading ? "Loading users..." : "Select a user..."}
                            required
                            error={errors.user_id}
                        />
                    )}

                    {/* User Details - Read Only */}
                    {isUserLinked && (() => {
                        const contact = selectedUserData?.contact || selectedUserData;
                        return (
                            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                                <p className="text-sm text-gray-500 mb-2">User details (read-only)</p>
                                <div className="grid grid-cols-2 sm:grid-cols-1 gap-4">
                                    <InputField
                                        value={contact?.firstName || ''}
                                        label="First Name"
                                        name="firstName"
                                        disabled
                                        readOnly
                                    />
                                    <InputField
                                        value={contact?.lastName || ''}
                                        label="Last Name"
                                        name="lastName"
                                        disabled
                                        readOnly
                                    />
                                </div>
                                <InputField
                                    value={contact?.Email || contact?.email || ''}
                                    label="Email"
                                    name="userEmail"
                                    disabled
                                    readOnly
                                />
                                {(contact?.CurrentRole || selectedUserData?.roleLabel) && (
                                    <InputField
                                        value={contact?.CurrentRole || selectedUserData?.roleLabel || ''}
                                        label="Current Role"
                                        name="currentRole"
                                        disabled
                                        readOnly
                                    />
                                )}
                            </div>
                        );
                    })()}

                    {/* Professional Details */}
                    <h4 className="text-lg font-semibold text-gray-800 pt-4">Professional Details</h4>

                    <div className="grid grid-cols-2 sm:grid-cols-1 gap-6">
                        <div>
                            <DropdownWithSearchField
                                value={formData.team_id}
                                options={teamOptions}
                                onChange={handleChange}
                                label="Assign to Team"
                                name="team_id"
                                placeholder="Select a team..."
                            />
                            {/* Team membership status message */}
                            {formData.team_id && formData.user_id && (
                                <div className={`mt-2 p-2 rounded text-sm ${userAlreadyInTeam
                                    ? 'bg-green-50 text-green-700 border border-green-200'
                                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                                    }`}>
                                    {userAlreadyInTeam
                                        ? '✓ User is already a member of this team'
                                        : '+ User will be added to this team when saved'
                                    }
                                </div>
                            )}
                        </div>
                        <InputField
                            value={formData.max_interviews_per_week}
                            onChange={handleChange}
                            label="Max Interviews / Week"
                            name="max_interviews_per_week"
                            type="number"
                            placeholder="5"
                        />
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tags (Skills, Levels, etc.)
                        </label>
                        <div className="border rounded-lg p-4 bg-gray-50 min-h-[80px]">
                            <div className="flex flex-wrap gap-2">
                                {tags.map(tag => (
                                    <label
                                        key={tag._id}
                                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm cursor-pointer transition-colors border ${formData.tag_ids.includes(tag._id)
                                            ? 'bg-blue-50 border-blue-200 text-blue-700'
                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
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

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-3 pt-6">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="text-sm font-semibold px-6 py-2.5 text-gray-700 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={createMutation.isLoading || updateMutation.isLoading}
                            className="text-sm font-semibold px-6 py-2.5 bg-custom-blue text-white rounded-lg hover:bg-custom-blue/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {(createMutation.isLoading || updateMutation.isLoading) && (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            )}
                            {isEditMode ? 'Update Interviewer' : 'Create Interviewer'}
                        </button>
                    </div>
                </div>
            </div>
        </SidebarPopup>
    );
};

export default CreateInterviewer;
