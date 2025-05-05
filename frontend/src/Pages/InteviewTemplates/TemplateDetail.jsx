import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Plus, ArrowLeft, Calendar, Layers, Edit2, LayoutGrid, LayoutList } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import Breadcrumb from '../Dashboard-Part/Tabs/CommonCode-AllTabs/Breadcrumb';
import SingleRoundView from './SingleRoundView';
import VerticalRoundsView from './VerticalRoundsView';
import InterviewProgress from './InterviewProgress';
import Cookies from "js-cookie";


const TemplateDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedTemplate, setEditedTemplate] = useState(null);
  const [roundsViewMode, setRoundsViewMode] = useState('vertical');
  const [activeRound, setActiveRound] = useState(null);

  const organizationId = Cookies.get("organizationId");

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/interviewTemplates/${id}`,
          {
            params: {
              tenantId: organizationId
            }
          }
        );
        if (response.data && response.data.data) {
          setTemplate(response.data.data);
          // Set the first round as active by default
          if (response.data.data.rounds?.length > 0) {
            setActiveRound(response.data.data.rounds[0]._id);
          }
          setEditedTemplate({
            templateName: response.data.data.templateName || '',
            description: response.data.data.description || '',
            label: response.data.data.label || '',
            status: response.data.data.status || ''
          });
        }
      } catch (error) {
        console.error('Error fetching template:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTemplate();
  }, [id]);

  const formatRelativeDate = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    // Check if it's today
    if (date.toDateString() === now.toDateString()) {
      return 'Today';
    }

    // Check if it's yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    // Days ago (up to 30 days)
    if (diffDays < 30) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    }

    // Months ago (up to 12 months)
    if (diffMonths < 12) {
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
    }

    // Years ago
    return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedTemplate(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'templateName' && { label: value.trim().replace(/\s+/g, "_").toUpperCase() })
    }));
  };

  const handleSubmit = async () => {
    if (!editedTemplate.templateName || !editedTemplate.label) {
      alert('Template name and label are required.');
      return;
    }

    try {
      // Prepare update data while preserving required fields
      const updateData = {
        templateName: editedTemplate.templateName,
        label: editedTemplate.label,
        description: editedTemplate.description || '',
        status: editedTemplate.status || 'active',
        tenantId: template.tenantId || "670286b86ebcb318dab2f676",
        createdBy: template.createdBy || "670286b86ebcb318dab2f676",
        rounds: template.rounds || [], // Preserve existing rounds
        updatedAt: new Date().toISOString()
      };

      const response = await axios.patch(`${process.env.REACT_APP_API_URL}/interviewTemplates/${id}`, updateData);

      if (response.data && response.data.success) {
        setIsEditModalOpen(false);
        // Update the local template state with new data
        setTemplate(response.data.data);
      } else {
        throw new Error(response.data?.message || 'Failed to update template');
      }
    } catch (error) {
      console.error('Error updating template:', error);
      alert(error.response?.data?.message || error.message || 'Failed to update template. Please try again.');
    }
  };


  const handleAddRound = () => {
    // Since this is a new round, we'll use 'new' as the roundId
    navigate(`/interview-templates/${id}/rounds`);
  }

  const handleEditRound = (round) => {
    navigate(`/interview-templates/${id}/rounds?roundId=${round._id}&type=${round.roundName}`);
  }

  // Create breadcrumb items with status
  const breadcrumbItems = [
    {
      label: 'Interview Templates',
      path: '/interview-templates'
    },
    {
      label: template?.templateName || 'Template',
      path: `/interview-templates/${id}`,
      status: template?.status
    }
  ];

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-custom-blue"></div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-900 mb-2">Template not found</h2>
          <button
            onClick={() => navigate('/interview-templates')}
            className="text-custom-blue hover:text-custom-blue/80"
          >
            Go back to templates
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">

        <div className="max-w-6xl sm:max-w-5xl md:max-w-4xl lg:max-w-5xl mx-auto py-6">
          {/* Header */}
          <div className="flex flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
            <button
              onClick={() => navigate('/interview-templates')}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              <span className="text-sm sm:text-base">Back to templates</span>
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 text-custom-blue bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors duration-200 text-sm sm:text-base"
              >
                <Edit2 className="h-4 w-4" />
                Edit Template
              </button>
              <button
                onClick={() => navigate('/interview-templates')}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
          </div>

          <Breadcrumb items={breadcrumbItems} />

          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200/80 p-4 sm:p-6 md:p-8 mb-4 sm:mb-6 md:mb-8 mt-4">
            <div className="flex sm:flex-col flex-row sm:items-start justify-between gap-4 sm:gap-0">
              <div className="flex-1">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Interview Details
                </h3>
                <h1 className="text-2xl sm:text-3xl font-semibold bg-gradient-to-r from-custom-blue to-custom-blue/80 bg-clip-text text-transparent mb-2 sm:mb-3">
                  {template.templateName}
                </h1>
                <p className="text-gray-600 mb-4 sm:mb-6 text-base sm:text-lg">{template.description}</p>
                <div className="grid sm:grid-cols-1 grid-cols-2 gap-3 sm:gap-6">
                  <div className="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 rounded sm:rounded-xl">
                    <Calendar className="h-5 w-5 text-custom-blue" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Modified</p>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">{formatRelativeDate(template.updatedAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 sm:p-4 bg-gray-50 rounded sm:rounded-xl">
                    <Layers className="h-5 w-5 text-custom-blue" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Rounds</p>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">{template.rounds?.length || 0}</p>
                    </div>
                  </div>
                </div>
              </div>
              <span className={`inline-flex h-8 items-center px-2.5 sm:px-3 py-1 sm:py-1.5 rounded text-xs sm:text-sm font-medium ${template.status === 'active'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                  : template.status === 'draft'
                    ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                    : 'bg-slate-50 text-slate-700 border border-slate-200/60'
                }`}>
                {template.status.charAt(0).toUpperCase() + template.status.slice(1)}
              </span>
            </div>
          </div>

          {/* Interview Rounds Section */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200/80 p-4 sm:p-6 md:p-8">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Interview Rounds</h2>
              <div className='flex items-center gap-2'>
                {template.rounds?.length !== 0 &&
                  (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          if (roundsViewMode === 'vertical') {
                            setRoundsViewMode('horizontal');
                            if (template.rounds?.length > 0) {
                              setActiveRound(template.rounds[0]._id);
                            }
                          } else {
                            setRoundsViewMode('vertical');
                            setActiveRound(null);
                          }
                        }}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-blue"
                      >
                        {roundsViewMode === 'vertical' ? (
                          <>
                            <LayoutGrid className="h-4 w-4 mr-1" />
                            Horizontal View
                          </>
                        ) : (
                          <>
                            <LayoutList className="h-4 w-4 mr-1" />
                            Vertical View
                          </>
                        )}
                      </button>

                      {/* {interview.status === 'In Progress' && allRoundsCompleted && (
                  <button
                      onClick={() => setShowFinalFeedbackModal(true)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                      <FileText className="h-4 w-4 mr-1" />
                      Add Final Feedback
                  </button>
                  )} */}


                      <button
                        onClick={handleAddRound}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-custom-blue hover:bg-custom-blue/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-custom-blue"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Round
                      </button>
                    </div>
                  )}
              </div>
            </div>

            {template.rounds.length > 0 && (
              <InterviewProgress
                rounds={template.rounds}
              //interviewId={template._id}
              //currentRoundId={activeRound || undefined}
              //viewMode={roundsViewMode}
              // onSelectRound={handleSelectRound}
              />
            )}

            {template.rounds?.length > 0 ? (
              <div className="mt-6">
                {roundsViewMode === 'horizontal' ? (
                  <SingleRoundView
                    rounds={template.rounds}
                    //interviewId={template._id}
                    currentRoundId={activeRound || template.rounds[0]._id}
                    onEditRound={handleEditRound}
                    onChangeRound={setActiveRound}
                  />
                ) : (
                  <VerticalRoundsView
                    rounds={template.rounds}
                    onEditRound={handleEditRound}
                  />
                )}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">No rounds added yet.</p>

                <button
                  onClick={handleAddRound}
                  className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-custom-blue focus:outline-none focus:ring-2 focus:ring-offset-2 "
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add First Round
                </button>

              </div>
            )}
          </div>
        </div>


      </div>

      {/* Edit Template Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
              <h3 className="text-lg sm:text-xl font-medium text-gray-900">Edit Template</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-4 sm:px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="templateName" className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    id="templateName"
                    name="templateName"
                    value={editedTemplate.templateName}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-custom-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="label" className="block text-sm font-medium text-gray-700 mb-1">
                    Label
                  </label>
                  <input
                    type="text"
                    id="label"
                    name="label"
                    value={editedTemplate.label}
                    readOnly
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg sm:rounded-xl"
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={4}
                    value={editedTemplate.description}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-custom-blue focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={editedTemplate.status}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-custom-blue focus:border-transparent bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-3 sm:px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg sm:rounded-xl hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="px-3 sm:px-4 py-2 text-sm text-white bg-custom-blue rounded-lg sm:rounded-xl hover:bg-custom-blue/80"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateDetail;