// v1.0.0  -  Ashraf  -  commented expiry date because we dont have expiry date in schedule assessment
// v1.0.1  -  Ashraf  -  assessment sections and question api using from useassessmentscommon code)
// v1.0.2  -  Ashraf  -  called sections function to load data fast
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { UserPlusIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import Candidate from '../../Candidate-Tab/Candidate.jsx';
import ShareAssessment from '../ShareAssessment.jsx';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { decodeJwt } from "../../../../../utils/AuthCookieManager/jwtDecode.js";
import { config } from '../../../../../config.js';
import { useAssessments } from '../../../../../apiHooks/useAssessments.js';

function AssessmentsTab({ assessment }) {
  
  const { fetchScheduledAssessments, fetchAssessmentQuestions } = useAssessments();

  const tokenPayload = decodeJwt(Cookies.get('authToken'));
  // Remove console.log to prevent loops
  // useEffect(() => {
  //   if (assessment) {
  //     console.log('assessment', assessment);
  //   }
  // }, [assessment]);

  const userId = tokenPayload?.userId;
  const organizationId = tokenPayload?.tenantId;

  const [scheduledAssessments, setScheduledAssessments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [openSchedules, setOpenSchedules] = useState({});
  // <---------------------- v1.0.1
  const [hasSections, setHasSections] = useState(false);
  const [checkingSections, setCheckingSections] = useState(false);

  // Check if assessment has sections
  useEffect(() => {
    const checkAssessmentSections = async () => {
      if (assessment?._id) {
        setCheckingSections(true);
        try {
          const { data, error } = await fetchAssessmentQuestions(assessment._id);
          if (!error && data && data.sections) {
            setHasSections(data.sections.length > 0);
          } else {
            setHasSections(false);
          }
        } catch (error) {
          console.error('Error checking assessment sections:', error);
          setHasSections(false);
        } finally {
          setCheckingSections(false);
        }
      }
    };

    checkAssessmentSections();
  }, [assessment?._id]);
  // <---------------------- v1.0.1 >

  useEffect(() => {
    const fetchData = async () => {
      if (assessment?._id) {
        const { data, error } = await fetchScheduledAssessments(assessment._id);
        if (!error) {
          // Ensure we always work with an array, even if the API returns null or a non-array value
          const schedulesArray = Array.isArray(data) ? data : [];
          setScheduledAssessments(schedulesArray);
          const initialOpenState = schedulesArray.reduce((acc, schedule) => {
            acc[schedule._id] = false;
            return acc;
          }, {});
          setOpenSchedules(initialOpenState);
        } else {
          console.error('Failed to fetch scheduled assessments:', error);
          toast.error('Failed to load scheduled assessments');
        }
      }
    };

    fetchData();
  }, [assessment]);


  const handleResendLink = async (candidateAssessmentId) => {
    try {
      if (!candidateAssessmentId) {
        console.error('Missing candidateAssessmentId:', candidateAssessmentId);
        toast.error('Invalid candidate assessment ID');
        return;
      }



      if (!userId || !organizationId) {
        console.error('Missing userId or organizationId:', { userId, organizationId });
        toast.error('User or organization information missing');
        return;
      }

      const response = await axios.post(
        `${config.REACT_APP_API_URL}/emails/resend-link`,
        {
          candidateAssessmentId,
          userId,
          organizationId,
          assessmentId: assessment._id,
        }
      );

      if (response.data.success) {
        toast.success('Assessment link resent successfully');
        // ------------------------------ v1.0.2 >
        fetchAssessmentQuestions();
        fetchScheduledAssessments();
        // ------------------------------ v1.0.2 >
      } else {
        toast.error(response.data.message || 'Failed to resend link');
      }
    } catch (error) {
      console.error('Error resending link:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to resend assessment link');
    }
  };

  const toggleSchedule = (scheduleId) => {
    setOpenSchedules((prev) => ({
      ...prev,
      [scheduleId]: !prev[scheduleId],
    }));
  };

  useEffect(() => {
    if (assessment?._id) {
      fetchScheduledAssessments(assessment._id);
    }
  }, [assessment]);

  if (loading) return <div className="p-4 text-gray-600">Loading Assessments...</div>;

  const formattedCandidates = (candidates) =>
    (Array.isArray(candidates) ? candidates : []).map((candidate) => ({
      id: candidate._id,
      _id: candidate.candidateId._id,
      FirstName: candidate.candidateId?.FirstName || 'Unknown',
      LastName: candidate.candidateId?.LastName || '',
      Email: candidate.candidateId?.Email || 'No email',
      status: candidate.status,
      totalScore: candidate.totalScore,
      endedAt: candidate.endedAt,
      result:
        candidate.status === 'completed'
          ? assessment.passScoreBy === 'Each Section'
            ? 'N/A'
            : candidate.totalScore >= (assessment?.passScore || 0)
              ? 'pass'
              : 'fail'
          : null,
      Phone: candidate.candidateId?.Phone || 'N/A',
      HigherQualification: candidate.candidateId?.HigherQualification || 'N/A',
      CurrentExperience: candidate.candidateId?.CurrentExperience || 'N/A',
      skills: candidate.candidateId?.skills || [],
      ImageData: candidate.candidateId?.ImageData || null,
      assessmentId: assessment._id
    }));


  //  console.log("scheduledAssessments ", scheduledAssessments);

  return (
    <>
    {/* <---------------------- v1.0.1 */}
    <div className="space-y-6">
      <div className="flex justify-end items-center">
        {hasSections && (
          <button
            onClick={() => setIsShareOpen(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-custom-blue rounded-lg hover:bg-custom-blue/90 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <UserPlusIcon className="w-5 h-5 mr-2" />
            New Assessment
          </button>
        )}
      </div>
      {/* <---------------------- v1.0.1 > */}
      <div className="space-y-4">
        {Array.isArray(scheduledAssessments) && scheduledAssessments.length > 0 ? (
          scheduledAssessments.map((schedule) => (
            <div key={schedule._id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div
                className="flex justify-between items-center p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSchedule(schedule._id)}
              >
                <div className='flex gap-2'>
                  <h4 className="text-lg font-semibold text-gray-800">
                    {schedule.order}
                  </h4>
                  <div className="flex items-center space-x-4">
                    {/* // <---------------------- v1.0.0 */}
                    {/* <span className="text-sm text-gray-600">
                      <span className="font-medium">Expiry:</span>{' '}
                      {schedule.expiryAt
                        ? format(new Date(schedule.expiryAt), 'MMM dd, yyyy')
                        : 'N/A'}
                    </span> */}
                    {/* //<---------------------- v1.0.0 */}
                    <span
                      className={`px-2.5 py-1 text-xs font-medium rounded-full ${schedule.status === 'scheduled'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}
                    >
                      {schedule.status.charAt(0).toUpperCase() + schedule.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div>
                  {openSchedules[schedule._id] ? (
                    <ChevronUpIcon className="w-5 h-5 text-gray-500" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                  )}
                </div>
              </div>
              {openSchedules[schedule._id] && (
                <div className="border-t border-gray-200">
                  <div className="overflow-auto max-h-[400px] "> {/* Added padding */}
                    <div className="min-w-[800px] "> {/* Added padding */}
                      <Candidate
                        candidates={formattedCandidates(schedule.candidates)}
                        onResendLink={handleResendLink}
                        isAssessmentView={true}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
              <UserPlusIcon className="h-6 w-6 text-gray-400" />
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-2">No Assessments Scheduled</h3>
            <p className="text-sm text-gray-500 mb-4">
              Get started by sharing this assessment with candidates
            </p>
          </div>
        )}
      </div>
    </div>
    {isShareOpen && (
        <ShareAssessment
          isOpen={isShareOpen}
          onCloseshare={() => setIsShareOpen(false)}
          assessment={assessment}
        // AssessmentTitle={assessment?.AssessmentTitle}
        // assessmentId={assessment._id}
        />
      )}
    </>
  );
}

export default AssessmentsTab;