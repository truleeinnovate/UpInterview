import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import classNames from 'classnames';
import { Minimize, Expand, X } from 'lucide-react';
import Switch from "react-switch";
import { useCustomContext } from '../../Context/Contextfetch';

const InterviewSlideover = ({ mode }) => {
    const { templates, saveTemplateMutation } = useCustomContext();
    const { id } = useParams();
    const navigate = useNavigate();

    const [isEditMode, setIsEditMode] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [newTemplate, setNewTemplate] = useState({
        templateTitle: '',
        label: '',
        description: '',
        status: 'inactive',
        rounds: []
    });

    useEffect(() => {
        if (id) {
            setIsEditMode(true);
            const foundTemplate = templates.find(tem => tem._id === id);
            if (foundTemplate) {
                setNewTemplate({
                    templateTitle: foundTemplate.templateName || '',
                    label: foundTemplate.label || '',
                    description: foundTemplate.description || '',
                    status: foundTemplate.status || 'inactive',
                    rounds: foundTemplate.rounds || []
                });
            }
        } else {
            setIsEditMode(false);
            setNewTemplate({
                templateTitle: '',
                label: '',
                description: '',
                status: 'inactive',
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
            label,
        }));
    };

    const handleDescriptionChange = (e) => {
        setNewTemplate(prev => ({
            ...prev,
            description: e.target.value,
        }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!newTemplate.templateTitle || newTemplate.description.length < 20) {
            alert('Please fill in all required fields. Description must be at least 20 characters.');
            return;
        }

        try {
            const templateData = {
                templateName: newTemplate.templateTitle,
                label: newTemplate.label,
                description: newTemplate.description,
                status: newTemplate.status,
            };

            const response = await saveTemplateMutation.mutateAsync({
                id,
                templateData,
                isEditMode
            });

            if (response.status === 'success') {
                onClose();
            }
        } catch (error) {
            console.error('Error saving template:', error);
            alert(error.response?.data?.message || 'Failed to save template. Please try again.');
        }
    };

    const onClose = () => {
        if (mode === 'Edit') {
            navigate(`/interview-templates`);
        } else if (mode === 'Template Edit') {
            navigate(`/interview-templates/${id}`);
        } else {
            navigate('/interview-templates');
        }
    };

    const modalClass = classNames(
        'fixed bg-white shadow-2xl border-l border-gray-200 z-50',
        {
            'overflow-y-auto': true,
            'inset-0': isFullScreen,
            'inset-y-0 right-0 w-full lg:w-1/3 xl:w-1/3 2xl:w-1/3': !isFullScreen
        }
    );

    return (
        <Modal
            isOpen={true}
            className={modalClass}
            overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
        >
            <div className={classNames('h-full', { 'max-w-6xl mx-auto px-6': isFullScreen })}>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold">
                            {isEditMode ? 'Edit Template' : 'New Template'}
                        </h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setIsFullScreen(!isFullScreen)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors sm:hidden md:hidden"
                            >
                                {isFullScreen ? <Minimize className="w-5 h-5 text-gray-500" /> : <Expand className="w-5 h-5 text-gray-500" />}
                            </button>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <form id="new-template-form" onSubmit={handleSave} className="flex-1 flex flex-col overflow-y-auto">
                        <div className="px-2 sm:px-6 flex-1">
                            <div className="space-y-6 pt-6 pb-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Template Status
                                    </label>
                                    <div className="flex items-center mt-1">
                                        <Switch
                                            checked={newTemplate.status === 'active'}
                                            onChange={(checked) => {
                                                setNewTemplate(prev => ({
                                                    ...prev,
                                                    status: checked ? 'active' : 'inactive'
                                                }));
                                            }}
                                            onColor="#98e6e6"
                                            offColor="#ccc"
                                            handleDiameter={20}
                                            height={20}
                                            width={45}
                                            onHandleColor="#227a8a"
                                            offHandleColor="#9CA3AF"
                                            checkedIcon={false}
                                            uncheckedIcon={false}
                                        />
                                        <span className="ml-2 text-sm text-gray-700">
                                            {newTemplate.status}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="templateTitle"
                                        placeholder="e.g., Senior Frontend Developer"
                                        value={newTemplate.templateTitle}
                                        onChange={handleTitleChange}
                                        required
                                        className="w-full mt-1 border border-gray-300 rounded-md px-3 py-2 shadow-sm sm:text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
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
                                        value={newTemplate.label}
                                        readOnly
                                        className="w-full mt-1 border rounded-md sm:text-sm shadow-sm px-3 py-2 border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        placeholder="Describe the purpose and structure of this interview template. (Minimum 20 characters required)"
                                        value={newTemplate.description}
                                        onChange={handleDescriptionChange}
                                        rows={4}
                                        minLength={20}
                                        maxLength={300}
                                        required
                                        className={`w-full mt-1 border rounded-md px-3 py-2 shadow-sm sm:text-sm focus:outline-none ${newTemplate.description.length < 20
                                            ? 'focus:ring-red-500 focus:border-red-500'
                                            : 'focus:ring-teal-500 focus:border-teal-500'
                                            }`}
                                    />
                                    <div className="flex justify-between items-center w-full mt-1">
                                        {newTemplate.description.length < 20 && newTemplate.description.length > 0 && (
                                            <span className="text-red-500 text-sm">
                                                {20 - newTemplate.description.length} more characters needed
                                            </span>
                                        )}
                                        <span className="text-sm text-gray-500">{newTemplate.description.length}/300</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-shrink-0 px-4 py-4 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="py-2.5 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="new-template-form"
                                className="inline-flex justify-center py-2.5 px-4 rounded-xl text-sm font-medium text-white bg-custom-blue hover:bg-custom-blue/80"
                            >
                                {isEditMode ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </Modal>
    );
};

export default InterviewSlideover;
