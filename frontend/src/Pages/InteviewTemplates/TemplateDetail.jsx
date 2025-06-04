import { useState, useEffect } from 'react';

import {  Plus, ArrowLeft, Calendar, Layers, Edit2, LayoutGrid, LayoutList } from 'lucide-react';
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import Breadcrumb from '../Dashboard-Part/Tabs/CommonCode-AllTabs/Breadcrumb';
import SingleRoundView from './SingleRoundView';
import VerticalRoundsView from './VerticalRoundsView';
import InterviewProgress from './InterviewProgress';
import { useInterviewTemplates } from '../../apiHooks/useInterviewTemplates';


const TemplateDetail = () => {
    const { templatesData} = useInterviewTemplates();
  
  const { id } = useParams();
  const navigate = useNavigate();
  const [template, setTemplate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // const [editedTemplate, setEditedTemplate] = useState(null);
  const [roundsViewMode, setRoundsViewMode] = useState('vertical');
  const [activeRound, setActiveRound] = useState(null);

  useEffect(() => {
    const foundTemplate = templatesData.find(tem => tem._id === id)
    console.log("foundTemplate", foundTemplate);
    setIsLoading(true)
    if (foundTemplate && foundTemplate) {
      setTemplate(foundTemplate);
      // Set the first round as active by default
      if (foundTemplate.rounds?.length > 0) {
        setActiveRound(foundTemplate?.rounds[0]._id);
      }
      // setEditedTemplate({
      //   templateName: foundTemplate?.templateName || '',
      //   description: foundTemplate?.description || '',
      //   label: foundTemplate?.label || '',
      //   status: foundTemplate?.status || ''
      // });
      setIsLoading(false);
    } else {
      setTemplate(null); // Ensure position is null if not found
      // setEditedTemplate(null); // Reset rounds to empty array
    }

  }, [id, templatesData]);

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


  const handleAddRound = () => {
    // Since this is a new round, we'll use 'new' as the roundId
    navigate(`/interview-templates/${id}/round/new`);
  }

  const handleEditRound = (round) => {
    navigate(`/interview-templates/${id}/round?roundId=${round._id}&type=${round.roundName}`);
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
            {/* <div className="flex items-center gap-3">
              <button
            onClick={() => navigate(`edit/${template._id}`)}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 text-custom-blue bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors duration-200 text-sm sm:text-base"
              >
                <Edit2 className="h-4 w-4" />
                Edit Template
              </button>
            </div> */}
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

    
      <Outlet />
    </div>
  );
};

export default TemplateDetail;