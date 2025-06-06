// src/utils/interviewUtils.js
import { useCustomContext } from "../Context/Contextfetch";

export const useInterviewerDetails = () => {
  const { groups, interviewers } = useCustomContext();

  const resolveInterviewerDetails = (interviewerIds) => {
    // Handle invalid input cases
    if (!interviewerIds || !Array.isArray(interviewerIds)) return [];

    
    // If interviewers data isn't loaded yet, return array with loading state
    if (!interviewers?.data) {
      return interviewerIds.map(id => ({
        _id: typeof id === 'object' ? id?.$oid || id?._id : id,
        name: 'Loading...',
        type: 'loading'
      }));
    }

    return interviewerIds.map(interviewer => {
      // Case 1: Interviewer is already a full object

      if (interviewer && typeof interviewer === 'object' && interviewer?.name) {
        return {
          _id: interviewer?._id || interviewer?.$oid,
          name: interviewer?.name || 'Unknown Interviewer',
          email: interviewer?.email || '',
          type: 'individual'
        };
      }

      // Extract ID from various possible formats
      const id = interviewer?.$oid || interviewer?._id || interviewer;
      if (!id) {
        return {
          _id: 'unknown',
          name: 'Unknown Interviewer',
          type: 'unknown'
        };
      }

      // Search in interviewers (individuals)
      const individualInterviewer = interviewers.data.find(t => t?.contact?._id === id);
      if (individualInterviewer) {
        const name = [
          individualInterviewer.contact.firstName,
          individualInterviewer.contact.lastName
        ].filter(Boolean).join(' ') || 'Unknown Interviewer';
        
        return {
          _id: individualInterviewer.contact._id,
          name: name,
          email: individualInterviewer.contact.email || '',
          type: individualInterviewer.contact.type || 'individual'
        };
      }

      // Search in groups
      const group = groups?.find(g => g._id === id);
      if (group) {
        return {
          _id: group._id,
          name: group.name || 'Unnamed Group',
          type: 'group',
          numberOfUsers: group.numberOfUsers || 0
        };
      }

      // Final fallback
      return {
        _id: id,
        name: 'Unknown Interviewer',
        type: 'unknown'
      };
    });
  };

  return { resolveInterviewerDetails };
};