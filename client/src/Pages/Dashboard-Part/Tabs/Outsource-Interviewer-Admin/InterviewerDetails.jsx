import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { config } from '../../../../config.js';
import InterviewStatusIndicator from './InterviewStatusIndicator';
import FeedbackStatusChangeModal from './FeedbackStatusChangeModal';
import maleImage from "../../../Dashboard-Part/Images/man.png";
import Availability from '../CommonCode-AllTabs/Availability';
import axios from 'axios';

const InterviewerDetails = ({ selectedInterviewersData, onClose }) => {

  const interviewer = selectedInterviewersData.contactId;

  const [timeZone] = useState(interviewer.TimeZone || "Not Provided");
  const [selectedDuration, setSelectedDuration] = useState(interviewer.PreferredDuration + " mints" || "Not Provided");
  const [activeTab, setActiveTab] = useState('Details');
  const [readyToTakeMockInterview, setReadyToTakeMockInterview] = useState(
    interviewer.IsReadyForMockInterviews === "yes"
  );

  const [feedbackData, setFeedbackData] = useState([]);

  const fetchInterviewers = async () => {
    try {
      const response = await axios.get(`${config.REACT_APP_API_URL}/outsourceInterviewers`);

      console.log('✅ response:', response.data);

      if (!interviewer || !interviewer._id) {
        console.error('❌ No valid interviewer selected');
        return;
      }

      const interviewerId = interviewer._id;

      console.log('✅ interviewer._id:', interviewerId);

      // Filter data where contactId matches the selected interviewer's _id
      const filteredData = response.data.filter(item => item.contactId._id === interviewerId);

      console.log('✅ filteredData:', filteredData);

      if (filteredData.length > 0) {
        setFeedbackData(filteredData || []);
      } else {
        setFeedbackData([]);
      }

    } catch (err) {
      // console.error('❌ Error fetching interviewers:', err);
    }
  };

  useEffect(() => {
    fetchInterviewers();
  }, []);

  const getMappedPolicy = (policy) => {
    switch (policy) {
      case "25%":
        return "25-no-reschedule";
      case "50%":
        return "50-no-reschedule";
      case "100%":
        return "100-no-reschedule";
      case "100% with reschedule":
        return "100-with-reschedule";
      default:
        return ""; // Handle unknown cases
    }
  };

  // const [expertiseLevel, setExpertiseLevel] = useState('mid-level');
  const [noShowPolicy, setNoShowPolicy] = useState(getMappedPolicy(interviewer.NoShowPolicy));

  const [showStatusModal, setShowStatusModal] = useState(false);

  const closeFeedbackPopUp = () => {
    setNewStatus({ status: '', rating: 4.5, comments: '' });
    setShowStatusModal(false);
  }

  // eslint-disable-next-line no-unused-vars
  const [statusLine, setStatusLine] = useState({
    new: true,
    contacted: false,
    inprogress: false,
    selected: false,
    closed: false
  });
  const [feedback, setFeedback] = useState({
    status: 'New',
    rating: 4.5,
    comments: ''
  });

  const [newStatus, setNewStatus] = useState({
    status: '',
    rating: 4.5,
    comments: '',
  });


  const [times, setTimes] = useState({});

  useEffect(() => {
    if (interviewer.availability && interviewer.availability.length > 0) {
      const initialTimes = {};
      interviewer.availability.forEach(availabilityItem => {
        availabilityItem.days.forEach(dayItem => {
          if (!initialTimes[dayItem.day]) {
            initialTimes[dayItem.day] = [];
          }
          dayItem.timeSlots.forEach(slot => {
            initialTimes[dayItem.day].push({
              startTime: slot.startTime,
              endTime: slot.endTime
            });
          });
        });
      });
      setTimes(initialTimes);
    } else {
      setTimes({});
    }
  }, [interviewer.availability]);
  const [hasInterviewExperience, setHasInterviewExperience] = useState(interviewer.InterviewPreviousExperience === "yes");
  const [expertiseLevel, setExpertiseLevel] = useState("");

  useEffect(() => {
    if (hasInterviewExperience && interviewer.InterviewPreviousExperienceYears) {
      const years = parseInt(interviewer.InterviewPreviousExperienceYears, 10);

      // Determine the expertise level based on years of experience
      if (years >= 0 && years <= 1) {
        setExpertiseLevel("junior");
      } else if (years >= 2 && years <= 5) {
        setExpertiseLevel("mid-level");
      } else if (years >= 6 && years <= 8) {
        setExpertiseLevel("senior");
      } else if (years >= 9) {
        setExpertiseLevel("lead");
      }
    }
  }, [hasInterviewExperience, interviewer.InterviewPreviousExperienceYears]);



  const statusOptions = ['Contacted', 'In Progress', 'Active', 'InActive', 'Blacklisted'];

  const updateStatusLine = (status) => {
    const newStatusLine = {
      new: true,
      contacted: false,
      inprogress: false,
      selected: false,
      closed: false,
    };

    switch (status) {
      case 'Contacted':
        newStatusLine.contacted = true;
        break;
      case 'In Progress':
        newStatusLine.contacted = true;
        newStatusLine.inprogress = true;
        break;
      case 'Active/InActive':
        newStatusLine.contacted = true;
        newStatusLine.inprogress = true;
        newStatusLine.selected = true;
        break;
      case 'Blacklisted':
        newStatusLine.contacted = true;
        newStatusLine.inprogress = true;
        newStatusLine.selected = true;
        newStatusLine.closed = true;
        break;
      default:
        break;
    }
    setStatusLine(newStatusLine);
  };

  const handleChangeStatus = () => {
    if (feedbackData?.length > 0) {
      setNewStatus({
        status: feedbackData[0].status || "",
        rating: feedbackData[0].feedback[0].rating || 0,
        comments: feedbackData[0].feedback[0].comments || "",
      });
    }
    setShowStatusModal(true);
  };


  const handleSave = () => {
    if (!newStatus.status) {
      return;
    }
    setFeedback({
      status: newStatus.status,
      rating: newStatus.rating,
      comments: newStatus.comments,
    });
    updateStatusLine(newStatus.status);
    setNewStatus({ status: '', rating: 4.5, comments: '' });
    setShowStatusModal(false);
  };

  // const handleCancel = () => {
  //   setNewStatus({ status: '', rating: 4.5, comments: '' });
  //   setShowStatusModal(false);
  // };

  // Find the interviewer based on the ID
  // const interviewer = interviewers.find(int => int.id === parseInt(id));

  if (!interviewer) {
    return <div>Interviewer not found</div>;
  }


  const options = [
    { label: "Charge 25% without rescheduling", value: "25-no-reschedule" },
    { label: "Charge 50% without rescheduling", value: "50-no-reschedule" },
    { label: "Charge 100% without rescheduling", value: "100-no-reschedule" },
    { label: "Charge 100% with rescheduling option", value: "100-with-reschedule" },
  ];


  return (

    <>
      <div className="min-h-screen grid grid-cols-[250px_1fr] p-3 gap-4">
        {/* Left Profile Card */}
        <div className="flex flex-col h-full items-center p-6 border border-gray-200 rounded-lg">
          <img
            src={interviewer.image || maleImage}
            alt={interviewer.name || "Interviewer"}
            className="w-32 h-32 rounded-full object-cover mb-4"
          />
          <h2 className="text-2xl font-medium text-teal-600 mb-1">{interviewer.Name}</h2>
          <p className="text-gray-700 font-medium mb-1">{interviewer.company}</p>
          <p className="text-gray-700 font-medium">{interviewer.role}</p>
        </div>

        {/* Right Content Section - Changes based on active tab */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <span
              className="text-teal-600 font-bold cursor-pointer"
              onClick={onClose}
            >
              Outsource Interviewers
            </span>

            <span className="text-lg text-gray-400">/</span>
            <span className="text-lg text-gray-400">{interviewer.Name}</span>
          </div>

          {/* Status Timeline */}
          <div className="flex justify-center items-center w-full max-w-4xl mx-auto mb-8 relative">
            <InterviewStatusIndicator currentStatus={feedbackData[0]?.status} />
          </div>


          {/* Navigation Tabs */}
          <div className='flex justify-between items-center mb-2'>
            <div className="flex gap-8 border-none border-gray-200 ">
              {['Details', 'Experience details', 'Availability', 'Feedback'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-1 text-sm font-medium ${activeTab === tab
                    ? 'text-teal-600 border-b-2 border-teal-600'
                    : 'text-gray-500'
                    }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <button
              className="bg-teal-600 text-white px-6 py-2 rounded-md hover:bg-teal-700"
              onClick={handleChangeStatus}
            >
              Change Status
            </button>
          </div>
          <div>

            {activeTab === 'Details' && (
              <>
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-6">Basic Details:</h3>
                  <div className="grid grid-cols-2 gap-y-6">
                    <div className="flex gap-8">
                      <span className="text-gray-700 font-medium w-32">Name</span>
                      <span className="text-gray-600 flex-1">{interviewer.Name}</span>
                    </div>
                    <div className="flex gap-8">
                      <span className="text-gray-700 font-medium w-32">Profile ID</span>
                      <span className="text-gray-600 flex-1">{interviewer.profileId}</span>
                    </div>
                    <div className="flex gap-8">
                      <span className="text-gray-700 font-medium w-32">Email Address</span>
                      <span className="text-gray-600 flex-1">{interviewer.Email}</span>
                    </div>
                    <div className="flex gap-8">
                      <span className="text-gray-700 font-medium w-32">Phone Number</span>
                      <span className="text-gray-600 flex-1">{interviewer.Phone}</span>
                    </div>
                    <div className="flex gap-8">
                      <span className="text-gray-700 font-medium w-32">LinkedIn URL</span>
                      <span className="text-gray-600 flex-1">{interviewer.LinkedinUrl}</span>
                    </div>
                  </div>

                  <hr className="border-gray-200 my-8" />
                  <h3 className="text-lg font-semibold mb-6">Additional Details:</h3>
                  <div className="grid grid-cols-2 gap-y-6">
                    <div className="flex gap-8">
                      <span className="text-gray-700 font-medium w-32">Current Role</span>
                      <span className="text-gray-600 flex-1">{interviewer.CurrentRole}</span>
                    </div>
                    <div className="flex gap-8">
                      <span className="text-gray-700 font-medium w-32">Industry</span>
                      <span className="text-gray-600 flex-1">{interviewer.industry}</span>
                    </div>
                    <div className="flex gap-8">
                      <span className="text-gray-700 font-medium w-32 whitespace-nowrap ">Years of Experience</span>
                      {/* <span className="text-gray-600 flex-1">{interviewer.yearsOfExperience}</span> */}
                    </div>
                    <div className="flex gap-8">
                      <span className="text-gray-700 font-medium w-32">Location</span>
                      <span className="text-gray-600 flex-1">{interviewer.location}</span>
                    </div>
                    <div className="flex gap-8 col-span-2">
                      <span className="text-gray-700 font-medium w-32">Introduction</span>
                      <span className="text-gray-600 flex-1">{interviewer.Introduction}</span>
                    </div>
                    <div className="flex gap-8">
                      <span className="text-gray-700 font-medium w-32">Resume</span>
                      {/* <span className="text-gray-600 flex-1">{interviewer.resume}</span> */}
                    </div>
                  </div>

                  <hr className="border-gray-200 my-8" />
                  <h3 className="text-lg font-semibold mb-6">System Details:</h3>
                  <div className="grid grid-cols-2 gap-y-6">
                    <div className="flex gap-8">
                      <span className="text-gray-700 font-medium w-32">Created By</span>
                      <span className="text-gray-600 flex-1">{interviewer.createdBy}</span>
                    </div>
                    <div className="flex gap-8">
                      <span className="text-gray-700 font-medium w-32">Modified By</span>
                      <span className="text-gray-600 flex-1">{interviewer.updatedAt}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
            {activeTab === 'Experience details' && (
              <>
                <div className="border border-gray-200 rounded-lg p-6">
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-semibold mb-6">Skills and Experience Details:</h3>
                      <div className="space-y-6">
                        <div className="flex gap-20">
                          <span className="text-gray-700 font-medium w-32">Technology</span>
                          <div className="text-gray-600">
                            {interviewer.Technologys?.map((technology, index) => (
                              <div key={index}>{technology}</div>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-20">
                          <span className="text-gray-700 font-medium w-32">Skills</span>
                          <span className="text-gray-600">
                            {interviewer.Skills?.join(", ")}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <p className="text-gray-700 font-medium">Do you have any previous experience conducting interviews?</p>
                          <div className="flex gap-40">
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="experience"
                                disabled
                                checked={hasInterviewExperience}
                                onChange={() => setHasInterviewExperience(true)}
                                className="text-teal-600 focus:ring-teal-500"
                              />
                              <span className="text-gray-600">Yes</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="experience"
                                disabled
                                checked={!hasInterviewExperience}
                                onChange={() => setHasInterviewExperience(false)}
                                className="text-teal-600 focus:ring-teal-500"
                              />
                              <span className="text-gray-600">No</span>
                            </label>
                          </div>
                        </div>

                        {/* Conditionally render expertise level section */}
                        {hasInterviewExperience && (
                          <div className="space-y-2">
                            <p className="text-gray-700 font-medium">Choose your level of expertise (comfort) in conducting interviews</p>
                            <div className="flex gap-16">
                              {[
                                { label: 'Junior (0-1 years)', value: 'junior' },
                                { label: 'Mid-level (2-5 years)', value: 'mid-level' },
                                { label: 'Senior (6-8 years)', value: 'senior' },
                                { label: 'Lead (8+ years)', value: 'lead' }
                              ].map((option) => (
                                <label key={option.value} className="flex items-center gap-2">
                                  <input
                                    type="radio"
                                    name="expertise"
                                    disabled
                                    value={option.value}
                                    checked={expertiseLevel === option.value}
                                    onChange={(e) => setExpertiseLevel(e.target.value)}
                                    className="text-teal-600 focus:ring-teal-500"
                                  />
                                  <span className="text-gray-600 whitespace-nowrap">{option.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>
                    </div>

                    <hr className="border-t border-gray-200" />

                    <div>
                      <h3 className="text-lg font-semibold mb-6">Compensation Details:</h3>
                      <div className="space-y-6">
                        <div className="flex gap-20">
                          <span className="text-gray-700 whitespace-nowrap font-medium w-32">
                            Expected Rate per Hour
                          </span>
                          <span className="text-gray-600">
                            {interviewer.ExpectedRateMin} $ to {interviewer.ExpectedRateMax} $
                          </span>
                        </div>

                        {/* Mock Interview Question */}
                        <div className="space-y-2">
                          <p className="text-gray-700 font-medium">Are you ready to take mock interviews?</p>
                          <div className="flex gap-40">
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="mockInterviews"
                                disabled
                                checked={readyToTakeMockInterview}
                                onChange={() => setReadyToTakeMockInterview(true)}
                                className="text-teal-600 focus:ring-teal-500"
                              />
                              <span className="text-gray-600">Yes</span>
                            </label>
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name="mockInterviews"
                                disabled
                                checked={!readyToTakeMockInterview}
                                onChange={() => setReadyToTakeMockInterview(false)}
                                className="text-teal-600 focus:ring-teal-500"
                              />
                              <span className="text-gray-600">No</span>
                            </label>
                          </div>
                        </div>
                        {/* Show Expected Rate Only if Ready for Mock Interviews */}
                        {readyToTakeMockInterview && (
                          <div className="flex gap-20">
                            <span className="text-gray-700 whitespace-nowrap font-medium w-32">Expected Rate per Hour</span>
                            <span className="text-gray-600">
                              {interviewer.ExpectedRatePerMockInterviewMin} $ to {interviewer.ExpectedRatePerMockInterviewMax} $
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <hr className="border-t border-gray-200" />

                    {readyToTakeMockInterview && (
                      <div>
                        <h3 className="text-lg font-semibold mb-6">No-Show Policy Details:</h3>
                        <div className="space-y-2">
                          <p className="text-gray-700 font-medium">Policy for No-Show Cases</p>
                          <div className="grid grid-cols-2 gap-4">
                            {options.map((option) => (
                              <label key={option.value} className="flex items-center gap-2">
                                <input
                                  type="radio"
                                  name="policy"
                                  disabled
                                  value={option.value}
                                  checked={noShowPolicy === option.value}
                                  onChange={(e) => setNoShowPolicy(e.target.value)}
                                  className="text-teal-600 focus:ring-teal-500"
                                />

                                <span className="text-gray-600">{option.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
            {activeTab === 'Availability' && (
              <>
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-6">Availability:</h3>
                  <div className="grid gap-y-6">

                    {/* Time Zone */}
                    <div className="flex gap-4">
                      <span className="text-gray-700 font-medium w-32">Time Zone</span>
                      <span className="text-gray-600 flex-1">{timeZone}</span>
                    </div>

                    {/* Preferred Interview Duration */}
                    <div className="flex flex-col gap-4">
                      <span className="text-gray-700 font-medium">Preferred Interview Duration</span>
                      <div className="flex gap-4">
                        {['30 mints', '45 mints', '60 mints', '90 mints'].map((duration) => (
                          <button
                            key={duration}
                            disabled
                            onClick={() => setSelectedDuration(duration)}
                            className={`px-4 py-2 rounded border ${selectedDuration === duration
                              ? 'bg-teal-600 text-white border-teal-600'
                              : 'border-gray-300 text-gray-600'
                              }`}
                          >
                            {duration}
                          </button>
                        ))}
                      </div>
                    </div>
                    <Availability
                      from="outsourceInterviewerAdmin"
                      times={times}
                      onTimesChange={setTimes}
                    />
                  </div>
                </div>
              </>
            )}
            {activeTab === 'Feedback' && (
              <>
                <div className="bg-white border min-h-screen border-gray-200 p-6 rounded-lg">
                  <h2 className="text-lg font-medium mb-4">Feedback:</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-x-20">
                      <span className="text-gray-700 font-medium w-24">Status</span>
                      <span className="text-gray-600">{feedbackData[0].status}</span>
                    </div>
                    <div className="flex items-start gap-x-20">
                      <span className="text-gray-700 font-medium w-24">Rating</span>
                      <span className="text-gray-600">{feedbackData[0].feedback[0].rating}</span>
                    </div>
                    <div className="flex items-start gap-x-20">
                      <span className="text-gray-700 font-medium w-24">Notes</span>
                      <span className="text-gray-600">{feedbackData[0].feedback[0].comments}</span>
                    </div>
                  </div>
                </div>
              </>
            )}


          </div>
        </div>
      </div>
      {showStatusModal && (
        <FeedbackStatusChangeModal
          showStatusModal={showStatusModal}
          statusOptions={statusOptions}
          newStatus={newStatus}
          setNewStatus={setNewStatus}
          onClose={closeFeedbackPopUp}
          interviewer={interviewer}
        />
      )}
    </>

  );
};

export default InterviewerDetails;
