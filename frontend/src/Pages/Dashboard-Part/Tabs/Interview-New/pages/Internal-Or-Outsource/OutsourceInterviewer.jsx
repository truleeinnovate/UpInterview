// v1.0.0  -  Ashraf  -  header border-b removed
import React, { useState, useRef, useEffect } from 'react';
import { X, Star, ExternalLink, ChevronDown, ChevronUp, Search, Minimize, Info, Clock, Users, Expand } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../CommonCode-AllTabs/ui/button.jsx';
import InterviewerAvatar from '../../../CommonCode-AllTabs/InterviewerAvatar.jsx';
import InterviewerDetailsModal from '../Internal-Or-Outsource/OutsourceInterviewerDetail.jsx';
import { useCustomContext } from '../../../../../../Context/Contextfetch.js';

const OutsourcedInterviewerCard = ({ interviewer, isSelected, onSelect, onViewDetails, navigatedfrom }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const fullName = interviewer?.contact?.firstName || interviewer?.contact?.Name || "Unnamed";
  const professionalTitle = interviewer?.contact?.professionalTitle || interviewer?.contact?.CurrentRole || "Interviewer";
  const company = interviewer?.contact?.industry || "Freelancer";
  const hourlyRate = interviewer?.contact?.hourlyRate || "not provided";
  const rating = interviewer?.contact?.rating || "4.5";
  const introduction = interviewer?.contact?.introduction || "No introduction provided.";
  const skillsArray = interviewer?.contact?.skills ?? [];
  const avgResponseTime = interviewer?.contact?.avgResponseTime || "not provided";

  return (
    <div className={`bg-white rounded-lg border ${isSelected ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200'} p-4 shadow-sm hover:shadow-md transition-all`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <InterviewerAvatar interviewer={interviewer} size="lg" />
          <div className="ml-3">
            <h3 className="text-base font-medium text-gray-900">{fullName}</h3>
            <p className="text-sm text-gray-500 truncate max-w-[200px]" title={professionalTitle}>
              {professionalTitle.length > 15 ? `${professionalTitle.substring(0, 15)}...` : professionalTitle}
            </p>
            <p className="text-xs text-orange-600">{company}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span className="ml-1 text-sm font-medium text-gray-700">{rating}</span>
          </div>
          <span className="text-sm font-medium text-gray-700">${hourlyRate}/hr</span>
        </div>
      </div>

      <div className="mt-3">
        <div className={`text-sm text-gray-600 ${!isExpanded && 'line-clamp-2'}`}>{introduction}</div>
        <button onClick={() => setIsExpanded(!isExpanded)} className="text-xs text-custom-blue hover:text-custom-blue/80 mt-1 flex items-center">
          {isExpanded ? <>Show less <ChevronUp className="h-3 w-3 ml-1" /></> : <>Show more <ChevronDown className="h-3 w-3 ml-1" /></>}
        </button>
      </div>

      <div className="mt-3">
        <div className="flex flex-wrap gap-1">
          {skillsArray.slice(0, 3).map((skill, index) => (
            <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
              {typeof skill === "string" ? skill : skill?.skill || "Skill"}
            </span>
          ))}
          {skillsArray.length > 3 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
              +{skillsArray.length - 3} more
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="h-4 w-4 mr-1 text-gray-400" /> Avg. response: {avgResponseTime}
        </div>
        {navigatedfrom !== 'dashboard' && (
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={onViewDetails} className="text-custom-blue hover:text-custom-blue/80">
              <ExternalLink className="h-3 w-3 mr-1" /> View Details
            </Button>
            <Button variant={isSelected ? "destructive" : "customblue"} size="sm" onClick={onSelect}>
              {isSelected ? 'Remove' : 'Select'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

function OutsourcedInterviewerModal({
  onClose,
  dateTime,
  positionData,
  onProceed,
  skills,
  navigatedfrom
}) {

  const { interviewers } = useCustomContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [rateRange, setRateRange] = useState([0, 250]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedInterviewer, setSelectedInterviewer] = useState(null);
  const [selectedInterviewersLocal, setSelectedInterviewersLocal] = useState([]);
  const requestSentRef = useRef(false);
  const [filteredInterviewers, setFilteredInterviewers] = useState([]);
  const [baseInterviewers, setBaseInterviewers] = useState([]);

  // Fetch and filter interviewers based on skills and availability
  useEffect(() => {
    if (navigatedfrom !== 'dashboard' && navigatedfrom !== 'mock-interview' && (!positionData || requestSentRef.current)) {
      return;
    }
    // <-------------------  this position data we will select in interview form
    // console.log('positionData:', positionData);
    // console.log('dateTime:', dateTime);
    // this position data we will select in interview form -------------------------->
    const fetchInterviewers = async (positionSkills, positionMinExperience, positionMaxExperience) => {
      // console.log('positionSkills:', positionSkills);
      // console.log('positionMinExperience:', positionMinExperience);
      // console.log('positionMaxExperience:', positionMaxExperience);
      try {
        // console.log("Fetching interviewers from context...");
        const response = interviewers;
        // <------------------- this is the interviewers data from context to show them in the form
        console.log("Interviewers from context:", response);
        // ---------------------->

        const externalInterviewers = response.data.filter(interviewer => interviewer.type === 'external');
        console.log("External Interviewers:", externalInterviewers);

        if (navigatedfrom === "dashboard" || navigatedfrom === "mock-interview") {
          console.log(`Navigated from ${navigatedfrom} – using all external interviewers with skill matching.`);

          const skillFilteredInterviewers = externalInterviewers.filter(interviewer => {
            const interviewerSkills = interviewer.contact?.Skills || [];
            // console.log(`Checking interviewer: ${interviewer.contact?.UserName || 'Unknown'}`);
            // console.log("Interviewer's Skills:", interviewerSkills);
            // console.log("Required Skills:", skills);

            // If no skills are required, show all interviewers
            if (!skills || !Array.isArray(skills) || skills.length === 0) {
              // console.log("No skills to match against, including all interviewers");
              return true;
            }
            
            if (interviewerSkills.length === 0) {
              // console.log("Interviewer has no skills, excluding");
              return false;
          }

            // Convert all skills to lowercase for case-insensitive comparison
            const interviewerSkillsLower = interviewerSkills.map(skill => skill.toLowerCase());

            // Check if any of the required skills match the interviewer's skills
            const hasMatchingSkill = skills.some(requiredSkill => {
              // Get the skill name and convert to lowercase
              const requiredSkillName = requiredSkill.skill?.toLowerCase();
              if (!requiredSkillName) return false;

              return interviewerSkillsLower.includes(requiredSkillName);
            });

            // console.log(`✅ ${interviewer.contact?.UserName || 'Unknown'} Skill Match Status: ${hasMatchingSkill}`);
            return hasMatchingSkill;

            // if (!skills || !Array.isArray(skills) || skills.length === 0) {
            //   console.log("No skills to match against, including all interviewers");
            //   return true;
            // }

            // const hasMatchingSkill = skills.some(skillObj =>
            //   interviewerSkills.some(interviewerSkill =>
            //     interviewerSkill.toLowerCase() === skillObj.skill.toLowerCase()
            //   )
            // );
            // console.log("hasMatchingSkill:", hasMatchingSkill);

            // console.log(`✅ ${interviewer.contact?.UserName || 'Unknown'} Skill Match Status: ${hasMatchingSkill}`);
            // return hasMatchingSkill;
            // return true;
          });

          // console.log("Skill Filtered External Interviewers:", skillFilteredInterviewers);
          setBaseInterviewers(skillFilteredInterviewers);
          setFilteredInterviewers(skillFilteredInterviewers);
          return;
        }

        const timeToMinutes = (timeStr) => {
          const [time, period] = timeStr.split(' ');
          const [hours, minutes] = time.split(':').map(Number);
          let totalMinutes = (hours % 12) * 60 + minutes;
          if (period === 'PM') totalMinutes += 720;
          return totalMinutes;
        };

        // console.log("changing dateTime format :", dateTime);

        const [datePart, ...timeParts] = dateTime.split(' ');
        const timeRange = timeParts.join(' ');
        // console.log("Date Part:", datePart);
        // console.log("Time Range:", timeRange);

        const [startTimeStr, endTimeStr] = timeRange.split('-').map(t => t.trim());
        // console.log("Start Time String:", startTimeStr);
        // console.log("End Time String:", endTimeStr);

        const startTimeMinutes = timeToMinutes(startTimeStr);
        const endTimeMinutes = timeToMinutes(endTimeStr);
        console.log("Interviewer Start Time in Minutes:", startTimeMinutes);
        console.log("Interviewer End Time in Minutes:", endTimeMinutes);

        const [day, month, year] = datePart.split('-');
        const interviewDate = new Date(`${year}-${month}-${day}`);
        const interviewDayFull = interviewDate.toLocaleDateString('en-US', { weekday: 'long' });
        const interviewDayShort = interviewDayFull.substring(0, 3);
        console.log("Interviewer Day (Full):", interviewDayFull);
        console.log("Interviewer Day (Short):", interviewDayShort);

        const availableInterviewers = externalInterviewers.filter(externalInterviewer => {
          console.log("externalInterviewer:", externalInterviewer);
          console.log("Checking externalInterviewer:", externalInterviewer.contact?.firstName + " " + externalInterviewer.contact?.lastName || 'Unknown');

          console.log("externalInterviewer days:", externalInterviewer.days);
          return externalInterviewer.days?.some(day => {
            console.log("externalInterviewer Checking day:", day.day, "against", interviewDayFull, "or", interviewDayShort);
            // Check if the day matches either the full or short form
            const dayMatches = day.day === interviewDayFull || day.day === interviewDayShort;
            console.log("externalInterviewer Day matches:", dayMatches);
            if (!dayMatches) {
              console.log("externalInterviewer Day does not match.");
              return false;
            }

            return day.timeSlots?.some(timeSlot => {
              console.log("externalInterviewer Checking timeSlot:", timeSlot);

              const formattedStartTime = timeSlot.startTime;
              const formattedEndTime = timeSlot.endTime;

              const availabilityStartMinutes = timeToMinutes(formattedStartTime);
              const availabilityEndMinutes = timeToMinutes(formattedEndTime);

              console.log("externalInterviewer Formatted Start Time:", formattedStartTime);
              console.log("externalInterviewer Formatted End Time:", formattedEndTime);
              console.log("externalInterviewer Availability Start Minutes:", availabilityStartMinutes);
              console.log("externalInterviewer Availability End Minutes:", availabilityEndMinutes);

              const isWithinAvailability = (
                startTimeMinutes >= availabilityStartMinutes &&
                endTimeMinutes <= availabilityEndMinutes
              );

              console.log("externalInterviewer Start Time Minutes:", startTimeMinutes);
              console.log("externalInterviewer End Time Minutes:", endTimeMinutes);
              console.log("externalInterviewer Is Within Availability:", isWithinAvailability);

              return isWithinAvailability;
            });
          });
        });

        console.log("externalInterviewer Available External Interviewers after time check:", availableInterviewers);

        // const experienceFilteredInterviewers = availableInterviewers.filter(interviewer => {
        //   const interviewerMinExp = parseInt(interviewer.contact?.minexperience || '0');
        //   const interviewerMaxExp = parseInt(interviewer.contact?.maxexperience || '0');
        //   const minExp = positionData?.minexperience || 0;
        //   const maxExp = positionData?.maxexperience || Infinity;

        //   console.log(`Interviewer: ${interviewer.contact?.firstName + " " + interviewer.contact?.lastName || 'Unknown'}, Experience: ${interviewerMinExp}-${interviewerMaxExp} years, Required: ${minExp}-${maxExp} years`);

        //   return interviewerMinExp >= minExp && interviewerMaxExp <= maxExp;
        // });

        // console.log("Experience Filtered External Interviewers:", experienceFilteredInterviewers);

        const skillFilteredInterviewers = availableInterviewers.filter((interviewer, index) => {
          console.log(`\n🔍 Checking Interviewer #${index + 1}:`, interviewer.contact?.UserName || 'Unknown');
          console.log("👉 Interviewer's Skills:", interviewer.contact?.skills || []);

          if (!positionSkills || !Array.isArray(positionSkills)) {
            console.log("⚠️ positionSkills is invalid or not an array:", positionSkills);
            return false;
          }

          const interviewerSkills = interviewer.contact?.skills || [];
          console.log("Interviewer's Skills 1:", interviewerSkills);
          console.log("Position Skills 1:", positionSkills);

          const matchingSkills = interviewerSkills.filter(interviewerSkill =>
            positionSkills.some(positionSkill =>
              positionSkill.skill.toLowerCase() === interviewerSkill.toLowerCase()
            )
          );

          console.log("🎯 Matching Skills Found:", matchingSkills);
          const hasMatchingSkills = matchingSkills.length > 0;
          console.log(`✅ ${interviewer.contact?.UserName || 'Unknown'} Skill Match Status: ${hasMatchingSkills}`);
          return hasMatchingSkills;
        });

        console.log("Skill Filtered External Interviewers:", skillFilteredInterviewers);

        setBaseInterviewers(skillFilteredInterviewers);
        // setBaseInterviewers(externalInterviewers);
        setFilteredInterviewers(skillFilteredInterviewers);
        // setFilteredInterviewers(externalInterviewers);
      } catch (error) {
        console.error("Error processing interviewers:", error);
      }
    };

    // console.log('Fetching interviewers with:', positionData?.skills, positionData?.CurrentExperience);
    fetchInterviewers(positionData?.skills, positionData?.minexperience, positionData?.maxexperience);
    requestSentRef.current = true;
  }, [positionData, dateTime, navigatedfrom, interviewers]);

  // Filter interviewers based on search term and rate range
  useEffect(() => {
    const filtered = baseInterviewers.filter(interviewer => {
      const fullName = interviewer?.contact?.firstName || interviewer?.contact?.Name || "";
      const professionalTitle = interviewer?.contact?.professionalTitle || interviewer?.contact?.CurrentRole || "";
      const company = interviewer?.contact?.industry || "";
      const skills = interviewer?.contact?.skills || [];
      const hourlyRate = parseFloat(interviewer?.contact?.hourlyRate) || 0;

      const searchMatch = searchTerm.trim() === '' ||
        fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        professionalTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));

      const rateMatch = hourlyRate >= rateRange[0] && hourlyRate <= rateRange[1];

      return searchMatch && rateMatch;
    });

    setFilteredInterviewers(filtered);
  }, [searchTerm, rateRange, baseInterviewers]);

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
    onProceed(selectedInterviewersLocal);
    onClose();
  };

  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-end z-50">
        <motion.div
          className={`bg-white h-full shadow-xl flex flex-col ${isFullscreen ? 'w-full' : 'w-full md:w-2/3 lg:w-1/2 xl:w-1/2 2xl:w-1/2'}`}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {/* Fixed Header */}
          {/* <------------------------------- v1.0.0  */}
          <div className="flex justify-between items-center px-5 py-4 bg-white z-10">
          {/* ------------------------------ v1.0.0 > */}
            <div>
              <h2 className="text-2xl font-semibold text-custom-blue">Select Outsourced Interviewers</h2>
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
                  <Minimize className="w-5 h-5 text-gray-500" />
                ) : (
                  <Expand className="w-5 h-5 text-gray-500" />
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

          {/* Fixed Search and Info Section */}
          {/* <------------------------------- v1.0.0  */}
          <div className="px-6 py-4 bg-white z-10">
          {/* ------------------------------ v1.0.0 > */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start space-x-3 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                <Info className="h-5 w-5 text-custom-blue flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-custom-blue">Interview Scheduling Policy</h3>
                    {isOpen ? (
                      <ChevronUp className="h-5 w-5 text-custom-blue" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-custom-blue" />
                    )}
                  </div>
                </div>
              </div>

              {isOpen && (
                <div className="mt-3 ml-8 space-y-2">
                  <div className="flex items-center text-sm text-custom-blue">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>Response: 2-4 hours</span>
                  </div>
                  <div className="text-sm text-custom-blue space-y-1">
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
              )}
            </div>

            <div className="flex md:flex-row md:items-end md:space-x-4 md:space-y-0 justify-between pt-4">
              <div className="flex items-center gap-x-2">
                <label className="block text-sm font-medium text-gray-700 mb-1 md:mb-2">
                  Hourly Rate Range
                </label>
                <div className="flex items-center space-x-1.5">
                  <input
                    type="number"
                    value={rateRange[0]}
                    onChange={(e) => setRateRange([parseInt(e.target.value) || 0, rateRange[1]])}
                    className="px-2 py-2 border border-gray-300 rounded-md"
                    min="0"
                    max={rateRange[1]}
                  />
                  <span className="text-gray-500">-</span>
                  <input
                    type="number"
                    value={rateRange[1]}
                    onChange={(e) => setRateRange([rateRange[0], parseInt(e.target.value) || 250])}
                    className="px-2 py-2 border border-gray-300 rounded-md"
                    min={rateRange[0]}
                    max="250"
                  />
                </div>
              </div>

              <div className="w-[30%]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, role, company, or skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Data Section */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className={`grid gap-4 ${isFullscreen ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-3' : 'grid-cols-1'}`}>
              {filteredInterviewers.map((interviewer) => (
                <OutsourcedInterviewerCard
                  key={interviewer._id}
                  interviewer={interviewer}
                  // isSelected={selectedInterviewersLocal.some(sel => sel._id === interviewer._id)}
                  isSelected={selectedInterviewer?._id === interviewer._id}
                  onSelect={() => handleSelectClick(interviewer)}
                  onViewDetails={() => setSelectedInterviewer(interviewer)}
                  navigatedfrom={navigatedfrom}
                />
              ))}
            </div>
            {filteredInterviewers.length === 0 && (
              <div className={`text-gray-500 ${isFullscreen ? 'min-h-full flex items-center justify-center -mt-10' : 'flex items-center justify-center h-full -mt-8'}`}>
                <p>No available interviewers found for the selected criteria.</p>
              </div>
            )}
          </div>

          {/* Fixed Footer (Hidden when navigatedfrom is 'dashboard') */}
          {navigatedfrom !== 'dashboard' && (
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 flex justify-end">
              <button
                onClick={handleProceed}
                disabled={selectedInterviewersLocal.length === 0}
                className="bg-custom-blue px-4 py-2 rounded-md text-white hover:bg-custom-blue/90 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Schedule ({selectedInterviewersLocal.length})
              </button>
            </div>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedInterviewer && navigatedfrom !== 'dashboard' && (
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