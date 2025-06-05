// src/utils/interviewUtils.js
import { useCustomContext } from "../Context/Contextfetch";

export const useInterviewerDetails = () => {
  const { groups, interviewers } = useCustomContext();

  // console.log("interviewers", interviewers);

  const resolveInterviewerDetails = (interviewerIds) => {
    if (!interviewerIds || !Array.isArray(interviewerIds)) return [];
 
   
    
    return interviewerIds?.map(interviewer => {
      // If interviewer is already a full object (from API response)
      if (interviewer && typeof interviewer === 'object' && interviewer?.name) {
        
        return {
          _id: interviewer?._id || interviewer?.$oid,
          name: interviewer?.name || 'Unknown Interviewer',
          email: interviewer?.email || '',
          type: 'individual'
        };
      }
       console.log("interviewerIds", interviewer);
      // Handle case where interviewer is just an ID object (like {$oid: "..."})
      const id = interviewer?.$oid || interviewer?._id || interviewer;
      
      if (!id) return {
        _id: 'unknown',
        name: 'Unknown Interviewer',
        type: 'unknown'
      };

      // Check teamsData first (individual interviewers)
      const teamMember = interviewers?.data?.find(t => t?.contact?._id === id);
      if (teamMember) {
        return {
          _id: teamMember.contact._id,
          name:   (teamMember.contact.firstName || '') + " " + (teamMember.contact.lastName || '') || 'Unknown Interviewer',
          email: teamMember.contact.email || '',
          type: teamMember.contact.type || ""
        };
      }

      // Check groups (interviewer groups)
      const group = groups?.find(g => g._id === id);
      if (group) {
        return {
          _id: group._id,
          name: group.name || 'Unnamed Group',
          type: 'group',
          numberOfUsers: group.numberOfUsers || 0
        };
      }

      // Fallback for unknown IDs
      return {
        _id: id,
        name: 'Unknown Interviewer',
        type: 'unknown'
      };
    });
  };

  return { resolveInterviewerDetails };
};