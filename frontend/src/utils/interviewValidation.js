export const validateInterviewData = (selectedCandidate, rounds, interviewType) => {
    const errors = {};

    if (!selectedCandidate) {
        errors.Candidate = "Candidate is required";
    }

    const isAnyRoundFilled = rounds.some(round => isRoundFullyFilled(round, interviewType));
    const roundsError = !isAnyRoundFilled ? "Please fill at least one round to schedule." : "";

    return { errors, roundsError, isAnyRoundFilled };
};

export const isRoundFullyFilled = (round, interviewType) => {
    if (interviewType === '/outsourceinterview') {
        return round && round.mode && round.duration && round.dateTime;
    }
    return round && round.mode && round.duration && round.dateTime && round.interviewers && round.status !== 'Taken Externally';
};