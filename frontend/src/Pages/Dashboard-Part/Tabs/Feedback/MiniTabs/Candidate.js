

import React from 'react';
import DoughnutChart from './PieChart';

const instructions = [
  "Access the Link: Click the provided link at least 5 minutes before the scheduled time to test your connection.",
  "Prepare Your Setups: Ensure a quiet, well-lit environment with a stable internet connection. Use headphones if possible.",
  "Have Essentials Ready: Keep your resume, ID, and any necessary documents easily accessible.",
  "Join Promptly: Join the call on time and ensure your camera and microphone are working properly.",
]

const CandidateMiniTab = ({roundDetails, interviewDetails,skillsTabData,page,tab}) => {



  const KeyValueRow = ({ label, value }) => (
    <div className="flex items-center w-[45%]">
      <p className="w-[250px]">{label}</p>
      <p className="para-value w-[250px] text-gray-500">{value}</p>
    </div>
  );
  const InstructionsList = ()=>(
    <div  className="candidate-instructions-container flex  border-b-2 border-[#8080808a] ">
      <h3 className="w-[250px] font-bold">Instructions:</h3>
      <ul>
        {instructions.map((instruction,index)=>(
          <li key={index} className="para-value mb-4 list-disc  text-gray-500">
              {instruction}
          </li>
        ))}
      </ul>
      </div>
  )
  const SectionWrapper = ({ title, children }) => (
    <div className="flex flex-col gap-4 pb-4">
      <h3 className="w-[250px] font-bold">{title}</h3>
      {children}
    </div>
  );

  const formatDate = (dateTimeStr) => {
    if (typeof dateTimeStr !== "string") return dateTimeStr;
    const datePart = dateTimeStr.split(" ")[0]; // Extract "21-02-2025"
    const [day, month, year] = datePart.split("-"); // Split into day, month, year
    return `${year}-${month}-${day}`; // Convert to "YYYY-MM-DD"
  };

  return (
    <div className="h-[70vh] flex flex-col gap-4 px-2 py-4" >
        <h2 className="text-black font-bold">Candidate Details:</h2>
      <div    className={`border-b-2 border-[#8080808a] flex ${tab ? "flex-row":"flex-col"} relative`}>
        <div className={`pb-4 flex  flex-wrap gap-6 ${tab ? "flex-row":"flex-col"}`}>
          
          <KeyValueRow label="Candidate Name" value={interviewDetails?.Candidate} />
          
          <KeyValueRow label="Position" value={interviewDetails?.Position} />
          {/* <KeyValueRow label="Interviewers" value="Raju, Ravi, Uma" /> */}
          <KeyValueRow label="Interviewers" value={roundDetails?.interviewers?.map(i=>i.name).join(", ")} />
          {/* <KeyValueRow label="Interviewer ID" value="12345" /> */}
          <KeyValueRow label="Interviewer ID" value={interviewDetails?._id} />
          <KeyValueRow label="Interview Date" value={formatDate(roundDetails?.dateTime)} />
          {/* <KeyValueRow label="Interview Date" value={interviewDetails.} /> */}
          <KeyValueRow label="Interview Type" value={roundDetails?.mode}/>
        </div>
       {!tab && <div style={{ width: "500px",aspectRatio:"1" }} className='absolute right-0 top-[-150px]'>
        <DoughnutChart/>
        </div>}
        </div>
        <InstructionsList instructions={InstructionsList}/>
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