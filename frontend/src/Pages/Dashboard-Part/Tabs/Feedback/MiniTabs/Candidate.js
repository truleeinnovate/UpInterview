import React from 'react';
import DoughnutChart from './PieChart';
import { useCustomContext } from '../../../../../Context/Contextfetch';

const instructions = [
  "Access the Link: Click the provided link at least 5 minutes before the scheduled time to test your connection.",
  "Prepare Your Setups: Ensure a quiet, well-lit environment with a stable internet connection. Use headphones if possible.",
  "Have Essentials Ready: Keep your resume, ID, and any necessary documents easily accessible.",
  "Join Promptly: Join the call on time and ensure your camera and microphone are working properly.",
]

const CandidateMiniTab = ({roundDetails, interviewDetails,skillsTabData,page,tab, candidateData}) => {
  
  // Use candidateData if provided (from Preview), otherwise use context
  const { candidateData: contextCandidateData } = useCustomContext();
  const finalCandidateData = candidateData || contextCandidateData || {};



  const KeyValueRow = ({ label, value }) => (
    <div className="flex items-center w-[45%]">
      <p className="w-[250px]">{label}</p>
      <p className="para-value w-[250px] text-gray-500">{value}</p>
    </div>
  );

  const SectionWrapper = ({ title, children, className = "" }) => (
    <div className={`mb-4 ${className}`}>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <div>{children}</div>
    </div>
  );

  const InstructionsList = ({ instructions }) => (
    <div className="mb-4">
      <h3 className="font-semibold text-lg mb-2">Instructions:</h3>
      <ul className="list-disc list-inside space-y-1">
        {instructions?.map((instruction, index) => (
          <li key={index} className="text-gray-600">{instruction}</li>
        ))}
      </ul>
    </div>
  );
  // Removed duplicate components - using the ones defined above

  const formatDate = (dateTimeStr) => {
    if (typeof dateTimeStr !== "string") return dateTimeStr;
    const datePart = dateTimeStr.split(" ")[0]; // Extract "21-02-2025"
    const [day, month, year] = datePart.split("-"); // Split into day, month, year
    return `${year}-${month}-${day}`; // Convert to "YYYY-MM-DD"
  };

  const calculateCategoryRatings = () => {
    if (!skillsTabData || !skillsTabData.skills || !skillsTabData.skills.skills) {
      return [];
    }
    
    const categoryTotals = {};
    const categoryCounts = {};

    skillsTabData.skills.skills.forEach((skill) => {
      if (skill.category) {
        if (!categoryTotals[skill.category]) {
          categoryTotals[skill.category] = 0;
          categoryCounts[skill.category] = 0;
        }
        categoryTotals[skill.category] += skill.rating;
        categoryCounts[skill.category] += 1;
      }
    });

    return Object.keys(categoryTotals).map((category) => ({
      category,
      averageRating: categoryTotals[category] / categoryCounts[category],
    }));
  };

  const categoryRatings = calculateCategoryRatings();

  return (
    <div className="h-[70vh] flex flex-col gap-4 px-2 py-4" >
        <h2 className="text-black font-bold">Candidate Details:</h2>
      <div    className={`border-b-2 border-[#8080808a] flex ${tab ? "flex-row":"flex-col"} relative`}>
        <div className={`pb-4 flex  flex-wrap gap-6 ${tab ? "flex-row":"flex-col"}`}>
          
          <KeyValueRow label="Candidate Name" value={finalCandidateData?.name || interviewDetails?.Candidate || "N/A"} />
          {/* <KeyValueRow label="Email" value={finalCandidateData?.email || "N/A"} />
          <KeyValueRow label="Phone" value={finalCandidateData?.phone || "N/A"} />
          <KeyValueRow label="Location" value={finalCandidateData?.location || "N/A"} />
          <KeyValueRow label="Experience" value={finalCandidateData?.experience || "N/A"} />
          <KeyValueRow label="Current Role" value={finalCandidateData?.currentRole || "N/A"} />
          <KeyValueRow label="Company" value={finalCandidateData?.companyName || "N/A"} />
          <KeyValueRow label="Skills" value={finalCandidateData?.skillsList || "N/A"} /> */}
          <KeyValueRow label="Position" value={interviewDetails?.Position || "N/A"} />
          <KeyValueRow label="Interviewers" value={roundDetails?.interviewers?.map(i=>i.name).join(", ") || "N/A"} />
          <KeyValueRow label="Interviewer ID" value={interviewDetails?._id || "N/A"} />
          <KeyValueRow label="Interview Date" value={formatDate(roundDetails?.dateTime) || "N/A"} />
          <KeyValueRow label="Interview Type" value={roundDetails?.mode || "N/A"} />
        </div>
       {!tab && categoryRatings.length > 0 ? (
         <div style={{ width: "500px",aspectRatio:"1" }} className='absolute right-0 top-[-150px]'>
           <DoughnutChart data={categoryRatings}/>
         </div>
       ) : (
         !tab && (
           <div className='absolute right-0 top-[-150px] text-center p-4 text-gray-500'>
             No performance data available
           </div>
         )
       )}
        </div>
        <InstructionsList instructions={instructions}/>
        <SectionWrapper title="Question Details:">
        <div className="questions-items-container flex gap-8">
          <KeyValueRow label="Mandatory Questions" value={roundDetails?.questions?.length} />
          <KeyValueRow label="Optional Questions" value="N/A" />
        </div>
      </SectionWrapper>
      </div>
  )
}

export default CandidateMiniTab;