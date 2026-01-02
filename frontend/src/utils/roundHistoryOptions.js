export const NO_SHOW_OPTIONS = [
  { label: "Did not join on time", value: "did_not_join_on_time" },
  { label: "No response from user", value: "no_response" },
  { label: "Wrong meeting link", value: "wrong_meeting_link" },
  { label: "Technical issue", value: "technical_issue" },
  { label: "Other", value: "other" },
];

export const CANCEL_OPTIONS = [
  { label: "Candidate unavailable", value: "candidate_unavailable" },
  { label: "Interviewer unavailable", value: "interviewer_unavailable" },
  { label: "Technical issues", value: "technical_issues" },
  { label: "Position on hold", value: "position_on_hold" },
  {
    label: "Candidate withdrew application",
    value: "candidate_withdrew_application",
  },
  { label: "Other", value: "other" },
];

// Add this alongside NO_SHOW_OPTIONS, CANCEL_OPTIONS
export const REJECT_OPTIONS = [
  { label: "Poor technical skills", value: "poor_technical_skills" },
  {
    label: "Inadequate problem-solving ability",
    value: "inadequate_problem_solving",
  },
  { label: "Weak communication skills", value: "weak_communication_skills" },
  { label: "Unprofessional behavior", value: "unprofessional_behavior" },
  { label: "Lack of experience", value: "lack_of_experience" },
  { label: "Not a cultural fit", value: "not_a_cultural_fit" },
  {
    label: "Salary expectations too high",
    value: "salary_expectations_too_high",
  },
  { label: "Better candidate selected", value: "better_candidate_selected" },
  { label: "Communication issues", value: "communication_issues" },
  { label: "Other", value: "other" },
];
