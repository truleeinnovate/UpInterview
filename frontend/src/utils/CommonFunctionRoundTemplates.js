// src/utils/interviewUtils.js
import { useCustomContext } from "../Context/Contextfetch";

export const useInterviewerDetails = () => {
  const { groups, teamsData } = useCustomContext();

  const resolveInterviewerDetails = (interviewers) => {
    if (!interviewers || !Array.isArray(interviewers)) return [];

    // console.log("interviewers", interviewers);
    

    return interviewers?.map(interviewer => {
      // If interviewer is already a full object (from API response)
      if (interviewer && typeof interviewer === 'object' && interviewer?.name) {
        return {
          _id: interviewer?._id || interviewer?.$oid,
          name: interviewer?.name || 'Unknown Interviewer',
          email: interviewer?.email || '',
          type: 'individual'
        };
      }
      
      // Handle case where interviewer is just an ID object (like {$oid: "..."})
      const id = interviewer?.$oid || interviewer?._id || interviewer;
      
      if (!id) return {
        _id: 'unknown',
        name: 'Unknown Interviewer',
        type: 'unknown'
      };

      // Check teamsData first (individual interviewers)
      const teamMember = teamsData?.find(t => t?.contactId?._id === id);
      if (teamMember) {
        return {
          _id: teamMember.contactId._id,
          name: teamMember.contactId.name || 'Unknown Interviewer',
          email: teamMember.contactId.email || '',
          type: 'individual'
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