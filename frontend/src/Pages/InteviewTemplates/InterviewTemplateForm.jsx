import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { useCustomContext } from '../../Context/Contextfetch';
import { decodeJwt } from "../../utils/AuthCookieManager/jwtDecode.js";
import Cookies from 'js-cookie';

const InterviewSlideover = ({ mode }) => {
    const tokenPayload = decodeJwt(Cookies.get('authToken'));
    const userId = tokenPayload?.userId;
    const tenantId = tokenPayload?.tenantId;

    const { templates, saveTemplateMutation } = useCustomContext();
    const { id } = useParams();
    const navigate = useNavigate();
    // const location = useLocation();
    const [isEditMode, setIsEditMode] = useState(false);
    const [newTemplate, setNewTemplate] = useState({
        templateTitle: '',
        label: '',
        description: '',
        status: 'active',
        rounds: []
    });
    // Get the previous path from navigation state
    // const fromPath = location.state?.from || '/interview-templates';

    useEffect(() => {
        if (id) {
            setIsEditMode(true);
            const foundTemplate = templates.find(tem => tem._id === id);
            if (foundTemplate) {
                setNewTemplate({
                    templateTitle: foundTemplate.templateName || '',
                    label: foundTemplate.label || '',
                    description: foundTemplate.description || '',
                    status: foundTemplate.status || 'active',
                    rounds: foundTemplate.rounds || []
                });
            }
        } else {
            setIsEditMode(false);
            setNewTemplate({
                templateTitle: '',
                label: '',
                description: '',
                status: 'active',
                rounds: []
            });
        }
    }, [id, templates]);

    const handleTitleChange = (e) => {
        const value = e.target.value;
        const sanitizedValue = value.replace(/[^a-zA-Z0-9_ ]/g, '');
        const label = sanitizedValue.trim().replace(/\s+/g, '_');
        setNewTemplate(prev => ({
            ...prev,
            templateTitle: sanitizedValue,
            label: label,
        }));
    };

    const handleDescriptionChange = (e) => {
        setNewTemplate(prev => ({
            ...prev,
            description: e.target.value,
        }));
    };

    const handleStatusChange = (e) => {
        setNewTemplate(prev => ({
            ...prev,
            status: e.target.value,
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!newTemplate.templateTitle || !newTemplate.description || newTemplate.description.length < 20) {
            alert('Please fill in all required fields. Description must be at least 20 characters.');
            return;
        }

        try {
            const templateData = {
                templateName: newTemplate.templateTitle,
                label: newTemplate.label,
                description: newTemplate.description,
                status: newTemplate.status,
                // rounds: newTemplate.rounds.map(round => {
                //     const roundData = {
                //         roundName: round.roundName,
                //         interviewType: round.interviewType,
                //         instructions: round.instructions || '',
                //         interviewMode: round.interviewMode || '',
                //         interviewDuration: round.interviewDuration,
                //     };
                //     if (round.interviewType === 'Technical') {
                //         roundData.interviewerType = round.interviewerType || '';
                //         roundData.selectedInterviewersType = round.selectedInterviewersType || '';
                //         roundData.selectedInterviewers = round.selectedInterviewers || [];
                //         roundData.interviewers = round.interviewers?.length > 0
                //             ? round.interviewers.map(interviewer => ({
                //                 interviewerId: interviewer.interviewerId,
                //                 interviewerName: interviewer.interviewerName,
                //             }))
                //             : [];
                //         roundData.interviewerGroupId = round.interviewerGroupId || null;
                //         roundData.minimumInterviewers = round.minimumInterviewers || '1';
                //         roundData.questions = round.questions || [];
                //     } else if (round.interviewType === 'Assessment') {
                //         roundData.assessmentTemplate = round.assessmentTemplate || '';
                //         roundData.assessmentQuestions = round.assessmentQuestions || [];
                //     }
                //     return roundData;
                // }),
            };


            // if (isEditMode) {
            //     response = await axios.patch(
            //         `${process.env.REACT_APP_API_URL}/interviewTemplates/${id}`, {
            //         tenantId,
            //         templateData,
            //     }
            //     );
            // } else {
            //     response = await axios.post(
            //         `${process.env.REACT_APP_API_URL}/interviewTemplates`,
            //         { ...templateData, tenantId, }
            //     );
            // }
            // console.log("response data ", response.data);

            let response = await saveTemplateMutation.mutateAsync({
                id,
                templateData,
                isEditMode
            });

            console.log("response", response);
            

            if (response.status === 'success') {
                onClose()
                // navigate(fromPath);
            }
        } catch (error) {
            console.error('Error saving template:', error);
            alert(error.response?.data?.message || 'Failed to save template. Please try again.');
        }
    };

    const onClose = () => {
        switch (mode) {
            case 'Edit':
                navigate(`/interview-templates`);
                break;
            case 'Template Edit':
                navigate(`/interview-templates/${id}`);
                break;
            default: // Create mode
                navigate('/interview-templates');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-50 flex justify-end">
            <div className="bg-white sm:w-full md:w-1/2 lg:w-1/2 w-1/3 rounded-l-xl h-full flex flex-col">
                <div className="sticky rounded-tl-xl top-0 z-10 w-full flex justify-between items-center px-5 py-6 border-b-2 bg-gradient-to-r">
                    <h2 className="text-2xl font-semibold">
                        {isEditMode ? 'Edit Template' : 'New Template'}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <FaTimes />
                    </button>
                </div>
                <form id="new-template-form" onSubmit={handleSave} className="flex-1 flex flex-col overflow-y-auto">
                    <div className="px-4 sm:px-6 flex-1">
                        <div className="space-y-6 pt-6 pb-5">
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                    Title<span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="templateTitle"
                                    placeholder="e.g., Senior Front end Developer"
                                    value={newTemplate.templateTitle}
                                    onChange={handleTitleChange}
                                    required
                                    className="w-full mt-1 block border border-gray-300 rounded-md px-3 py-2 shadow-sm sm:text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="label" className="block text-sm font-medium text-gray-700">
                                    Label <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="label"
                                    name="label"
                                    placeholder="e.g., Senior_Front_End_Developer"
                                    value={newTemplate.label}
                                    readOnly
                                    className="w-full mt-1 block border rounded-md sm:text-sm shadow-sm px-3 py-2 border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    id="description"
                                    placeholder="Describe the purpose and structure of this interview template. (Minimum 20 characters required)"
                                    value={newTemplate.description}
                                    onChange={handleDescriptionChange}
                                    rows="4"
                                    minLength={20}
                                    maxLength={300}
                                    required
                                    className={`w-full mt-1 block border border-gray-300 rounded-md sm:text-sm shadow-sm px-3 py-2 focus:outline-none ${newTemplate.description.length < 20 ? 'border-gray-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-teal-500 focus:border-teal-500'
                                        }`}
                                />
                                <div className="flex justify-between items-center w-full">
                                    <div className="flex-grow">
                                        {newTemplate.description.length < 20 && newTemplate.description.length > 0 && (
                                            <span className="text-red-500 text-sm">
                                                Minimum 20 characters required ({20 - newTemplate.description.length} more needed)
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-sm text-gray-500">{newTemplate.description.length}/300</span>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    id="status"
                                    name="status"
                                    value={newTemplate.status}
                                    onChange={handleStatusChange}
                                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-custom-blue focus:border-transparent bg-white"
                                >
                                    <option value="active">Active</option>
                                    <option value="draft">Draft</option>
                                    <option value="archived">Archived</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="flex-shrink-0 px-4 py-4 flex justify-end gap-3">
                        <button
                            type="button"
                            className="py-2.5 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="new-template-form"
                            className="inline-flex justify-center py-2.5 px-4 border border-transparent shadow-sm text-sm font-medium rounded-xl text-white bg-custom-blue hover:bg-custom-blue/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                        >
                            {isEditMode ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InterviewSlideover;