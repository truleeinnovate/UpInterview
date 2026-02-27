// Filter tabs based on interview type
export const getFilteredTabsList = (effectiveInterviewType) => {
    const allTabs = [
        { id: 1, tab: "Feedback" },
        { id: 2, tab: "Interview Questions" },
        { id: 3, tab: "Candidate" },
        { id: 4, tab: "Position" },
    ];
    // Hide Position tab for mock interviews
    if (effectiveInterviewType === "mockinterview" || effectiveInterviewType === true) {
        return allTabs.filter(tab => tab.tab !== "Position");
    }

    return allTabs;
};