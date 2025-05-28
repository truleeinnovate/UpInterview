import React, { useState, useRef, useEffect } from 'react';
import { X, Star, ExternalLink, ChevronDown, ChevronUp, Search, Maximize2, Minimize2, Info, Clock, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../CommonCode-AllTabs/ui/button.jsx';
import InterviewerAvatar from '../../../CommonCode-AllTabs/InterviewerAvatar.jsx';
import InterviewerDetailsModal from '../Internal-Or-Outsource/OutsourceInterviewerDetail.jsx';
import axios from 'axios';
import { config } from '../../../../../../config.js';

const OutsourcedInterviewerCard = ({ interviewer, isSelected, onSelect, onViewDetails }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={`bg-white rounded-lg border ${isSelected ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200'
      } p-4 shadow-sm hover:shadow-md transition-all`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <InterviewerAvatar interviewer={interviewer} size="lg" />
          <div className="ml-3">
            <h3 className="text-base font-medium text-gray-900">{interviewer.name}</h3>
            <p className="text-sm text-gray-500">{interviewer.role}</p>
            <p className="text-xs text-orange-600">{interviewer.company}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span className="ml-1 text-sm font-medium text-gray-700">{interviewer.rating}</span>
          </div>
          <span className="text-sm font-medium text-gray-700">${interviewer.hourlyRate}/hr</span>
        </div>
      </div>

      <div className="mt-3">
        <div className={`text-sm text-gray-600 ${!isExpanded && 'line-clamp-2'}`}>
          {interviewer.introduction}
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-blue-600 hover:text-blue-800 mt-1 flex items-center"
        >
          {isExpanded ? (
            <>
              Show less
              <ChevronUp className="h-3 w-3 ml-1" />
            </>
          ) : (
            <>
              Show more
              <ChevronDown className="h-3 w-3 ml-1" />
            </>
          )}
        </button>
      </div>

      <div className="mt-3">
        <div className="flex flex-wrap gap-1">
          {interviewer.skills.slice(0, 3).map((skillObj, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
            >
              {skillObj.skill} {/* Access the `skill` property */}
            </span>
          ))}
          {interviewer.skills.length > 3 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
              +{interviewer.skills.length - 3} more
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-1 text-gray-400" />
          Avg. response: 2-4 hours
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onViewDetails}
            className="text-blue-600 hover:text-blue-700"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View Details
          </Button>
          <Button
            variant={isSelected ? "destructive" : "default"}
            size="sm"
            onClick={onSelect}
          >
            {isSelected ? 'Remove' : 'Select'}
          </Button>
        </div>
      </div>
    </div>
  );
};

function OutsourcedInterviewerModal({
  onClose,
  dateTime,
  candidateData1,
  onProceed,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [rateRange, setRateRange] = useState([0, 250]); // Default rate range


  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedInterviewer, setSelectedInterviewer] = useState(null);
  const [interviewers, setInterviewers] = useState([]);
  console.log('interviewers:', interviewers);
  const [selectedInterviewersLocal, setSelectedInterviewersLocal] = useState([]);
  const requestSentRef = useRef(false);

  const formatTo12Hour = (isoDate) => {
    const date = new Date(isoDate);
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;
    return `${hours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  useEffect(() => {
    if (!candidateData1 || requestSentRef.current) return;

    const fetchInterviewers = async (candidateSkills, candidateExperience) => {
      console.log('candidateSkills, candidateExperience:', candidateSkills, candidateExperience);
      try {
        console.log("Fetching interviewers from API...");
        const response = await axios.get(`${config.REACT_APP_API_URL}/api/contacts/outsource`);
        console.log("API Response:", response.data);

        const timeToMinutes = (timeStr) => {
          const [time, period] = timeStr.split(' ');
          const [hours, minutes] = time.split(':').map(Number);
          let totalMinutes = (hours % 12) * 60 + minutes;
          if (period === 'PM') totalMinutes += 720;
          return totalMinutes;
        };

        console.log("selected from interview dateTime value:", dateTime);

        // Split dateTime into date and time
        const [datePart, ...timeParts] = dateTime.split(' ');
        const timeRange = timeParts.join(' ');
        console.log("Date Part:", datePart);
        console.log("Time Range:", timeRange);

        const [startTimeStr, endTimeStr] = timeRange.split('-').map(t => t.trim());
        console.log("Start Time String:", startTimeStr);
        console.log("End Time String:", endTimeStr);

        const startTimeMinutes = timeToMinutes(startTimeStr);
        const endTimeMinutes = timeToMinutes(endTimeStr);
        console.log("Start Time in Minutes:", startTimeMinutes);
        console.log("End Time in Minutes:", endTimeMinutes);

        const [day, month, year] = datePart.split('-');
        const interviewDate = new Date(`${year}-${month}-${day}`);
        const interviewDay = interviewDate.toLocaleDateString('en-US', { weekday: 'long' });
        console.log("Interview Date:", interviewDate);
        console.log("Interview Day:", interviewDay);

        const availableInterviewers = response.data.filter(interviewer => {
          console.log("Checking interviewer:", interviewer.name);

          return interviewer.availability?.some(availability => {
            console.log("Availability:", availability);

            return availability.days?.some(day => {
              console.log("Checking day:", day.day, "against", interviewDay);
              if (day.day !== interviewDay) {
                console.log("Day does not match.");
                return false;
              }

              return day.timeSlots?.some(timeSlot => {
                console.log("Checking timeSlot:", timeSlot);

                const formattedStartTime = formatTo12Hour(timeSlot.startTime);
                const formattedEndTime = formatTo12Hour(timeSlot.endTime);

                const availabilityStartMinutes = timeToMinutes(formattedStartTime);
                const availabilityEndMinutes = timeToMinutes(formattedEndTime);

                console.log("Formatted Start Time:", formattedStartTime);
                console.log("Formatted End Time:", formattedEndTime);

                console.log("Availability Start Minutes:", availabilityStartMinutes);
                console.log("Availability End Minutes:", availabilityEndMinutes);

                const isWithinAvailability = (
                  startTimeMinutes >= availabilityStartMinutes &&
                  endTimeMinutes <= availabilityEndMinutes
                );

                console.log("Start Time Minutes:", startTimeMinutes);
                console.log("End Time Minutes:", endTimeMinutes);
                console.log("Is Within Availability:", isWithinAvailability);

                return isWithinAvailability;
              });
            });
          });
        });

        console.log("Available Interviewers after time check:", availableInterviewers);

        // Filter based on skills
        const skillFilteredInterviewers = availableInterviewers.filter((interviewer, index) => {
          console.log(`\n🔍 Checking Interviewer #${index + 1}:`, interviewer.name);
          console.log("👉 Interviewer's Skills:", interviewer.skills);

          if (!candidateSkills || !Array.isArray(candidateSkills)) {
            console.log("⚠️ candidateSkills is invalid or not an array:", candidateSkills);
            return false;
          }

          const matchingSkills = interviewer.skills.filter(interviewerSkill => {
            return candidateSkills.some(candidateSkill => {
              const isMatch = interviewerSkill.skill === candidateSkill.skill;
              console.log(`   🔗 Comparing Skills:`);
              console.log(`      - Interviewer Skill: ${interviewerSkill.skill}`);
              console.log(`      - Candidate Skill: ${candidateSkill.skill}`);
              console.log(`      ✅ Match Status: ${isMatch}`);
              return isMatch;
            });
          });

          console.log("🎯 Matching Skills Found:", matchingSkills);
          const hasMatchingSkills = matchingSkills.length > 0;
          console.log(`✅ ${interviewer.name} Skill Match Status: ${hasMatchingSkills}`);
          return hasMatchingSkills;
        });

        console.log("Skill Filtered Interviewers:", skillFilteredInterviewers);

        // Filter based on experience
        const experienceFilteredInterviewers = skillFilteredInterviewers.filter(interviewer => {
          console.log('interviewer.minexperience, interviewer.maxexperience:', interviewer.minexperience, interviewer.maxexperience);
          if (!interviewer.minexperience || !interviewer.maxexperience) {
            console.log("Skipping due to missing experience range:", interviewer);
            return false;
          }

          const isMatch = (
            candidateExperience >= parseInt(interviewer.minexperience) &&
            candidateExperience <= parseInt(interviewer.maxexperience)
          );

          console.log("Checking experience for interviewer:", interviewer);
          console.log("Candidate Experience:", candidateExperience);
          console.log("Interviewer Experience Range:", interviewer.minexperience, interviewer.maxexperience);
          console.log("Experience Match:", isMatch);

          return isMatch;
        });

        console.log("Experience Filtered Interviewers:", experienceFilteredInterviewers);

        // Set interviewers with safeguard to avoid overwrite
        setInterviewers(prevInterviewers => {
          if (experienceFilteredInterviewers.length > 0 || prevInterviewers.length === 0) {
            return experienceFilteredInterviewers;
          }
          return prevInterviewers;
        });
      } catch (error) {
        console.error("Error fetching interviewers:", error);
      }
    };

    console.log('Fetching interviewers with:', candidateData1.skills, candidateData1.CurrentExperience);
    fetchInterviewers(candidateData1.skills, candidateData1.CurrentExperience);
    requestSentRef.current = true; // Prevent refetching
  }, [candidateData1, dateTime]);

  const handleSelectClick = (interviewer) => {
    console.log("Selected or removed interviewer:", interviewer);

    setSelectedInterviewersLocal((prev) => {
      const isAlreadySelected = prev.some((selected) => selected._id === interviewer._id);

      if (isAlreadySelected) {
        return prev.filter((selected) => selected._id !== interviewer._id);
      } else {
        return [...prev, interviewer];
      }
    });
  };

  const handleProceed = () => {
    console.log("Selected Interviewers:", selectedInterviewersLocal);
    onProceed(selectedInterviewersLocal); // Pass the array of selected interviewers
    onClose();
  };

  const filteredInterviewers = interviewers
    .filter(interviewer => {
      // Ensure interviewer is defined and has an _id
      if (!interviewer || !interviewer._id) {
        console.warn("Invalid interviewer object:", interviewer);
        return false;
      }

      const searchTermLower = searchTerm.toLowerCase();
      return (
        interviewer.name?.toLowerCase().includes(searchTermLower) ||
        interviewer.currentRole?.toLowerCase().includes(searchTermLower) ||
        interviewer.CompanyName?.toLowerCase().includes(searchTermLower) ||
        interviewer.skills?.some(skill => skill.skill?.toLowerCase().includes(searchTermLower))
      );
    })
    .filter(interviewer => {
      const isDefaultRateRange = rateRange[0] === 0 && rateRange[1] === 250;
      if (isDefaultRateRange) {
        return true;
      }
      return interviewer.hourlyRate >= rateRange[0] && interviewer.hourlyRate <= rateRange[1];
    });


  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-end z-50">
        <motion.div
          className={`bg-white h-full shadow-xl overflow-y-scroll ${isFullscreen ? 'w-full' : 'w-full md:w-2/3 lg:w-1/2 xl:w-1/2 2xl:w-1/2'
            }`}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Select Outsourced Interviewers</h2>
              <p className="mt-1 text-sm text-gray-500">
                {selectedInterviewersLocal?.length} interviewer{selectedInterviewersLocal?.length !== 1 ? 's' : ''} selected
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? (
                  <Minimize2 className="h-5 w-5" />
                ) : (
                  <Maximize2 className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-blue-800">Interview Scheduling Policy</h3>
                    <div className="flex items-center text-sm text-blue-700">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>Response: 2-4 hours</span>
                    </div>
                  </div>
                  <div className="text-sm text-blue-700 space-y-1">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span>Interviews are scheduled based on first acceptance</span>
                    </div>
                    <ul className="list-disc list-inside pl-6 text-sm space-y-0.5">
                      <li>Interview requests sent to all selected interviewers</li>
                      <li>First interviewer to accept will conduct the interview</li>
                      <li>Select multiple interviewers to increase availability</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4 mb-6">
              <div className="w-full md:w-auto order-2 md:order-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hourly Rate Range
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={rateRange[0]}
                    onChange={(e) => setRateRange([parseInt(e.target.value), rateRange[1]])}
                    className="w-24 px-2 py-1 border border-gray-300 rounded-md"
                    min="0"
                    max={rateRange[1]}
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    value={rateRange[1]}
                    onChange={(e) => setRateRange([rateRange[0], parseInt(e.target.value)])}
                    className="w-24 px-2 py-1 border border-gray-300 rounded-md"
                    min={rateRange[0]}
                    max="250"
                  />
                </div>
              </div>
              <div className="flex-1 order-1 md:order-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, role, company, or skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className={`grid gap-4 ${isFullscreen
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3'
              : 'grid-cols-1'
              }`}>
              {filteredInterviewers.map(interviewer => {
                // Ensure interviewer is defined before rendering
                if (!interviewer || !interviewer._id) {
                  console.warn("Skipping invalid interviewer:", interviewer);
                  return null;
                }

                return (
                  <OutsourcedInterviewerCard
                    key={interviewer._id} // Use _id as the key
                    interviewer={interviewer}
                    isSelected={selectedInterviewersLocal.some(selected => selected._id === interviewer._id)} // Correctly check if selected
                    onSelect={() => handleSelectClick(interviewer)}
                    onViewDetails={() => setSelectedInterviewer(interviewer)}
                  />
                );
              })}
            </div>


            {filteredInterviewers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No interviewers found matching your criteria.</p>
              </div>
            )}
            {/* Schedule Button */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
              <button
                onClick={handleProceed}
                disabled={selectedInterviewersLocal.length === 0}
                className="w-full bg-custom-blue p-2 rounded-md text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Schedule ({selectedInterviewersLocal.length})
              </button>
            </div>
          </div>
        </motion.div>
      </div>


      <AnimatePresence>
        {selectedInterviewer && (
          <InterviewerDetailsModal
            interviewer={selectedInterviewer}
            onClose={() => setSelectedInterviewer(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default OutsourcedInterviewerModal;