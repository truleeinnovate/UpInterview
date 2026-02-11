
// Helper to ensure questions exist in SelectedInterviewQuestion collection and return their _ids
const ensureSelectedQuestions = async ({
    questionFeedback,
    interviewRoundId,
    resolvedInterviewId,
    tenantId,
    ownerId,
    interviewerId,
}) => {
    if (!questionFeedback || !Array.isArray(questionFeedback)) return [];

    const processedQuestions = [];

    for (let i = 0; i < questionFeedback.length; i++) {
        const item = questionFeedback[i];
        const rawQuestionId = item.questionId;
        let bankDetails = null;

        // Handle string ID or object
        let identifier = "";
        if (typeof rawQuestionId === "string") {
            identifier = rawQuestionId;
        } else if (rawQuestionId && typeof rawQuestionId === "object") {
            identifier =
                rawQuestionId.questionId || rawQuestionId._id || rawQuestionId.id;
            bankDetails = rawQuestionId;
        }

        if (!identifier) continue;

        // Check if identifier is already a valid SelectedInterviewQuestion ID
        if (mongoose.Types.ObjectId.isValid(identifier)) {
            const existingSelected = await InterviewQuestions.findById(identifier);
            if (existingSelected) {
                processedQuestions.push({
                    ...item,
                    questionId: existingSelected._id // Ensure we use the _id
                });
                continue;
            }
        }

        // Identifer is likely a Bank ID or we couldn't find SelectedQuestion by that ID
        // Try to find by roundId + valid questionId (Bank ID)
        // Note: 'identifier' here is essentially the Bank ID carried from frontend

        // Align ownerId
        const questionOwnerId =
            (interviewerId && interviewerId.toString()) ||
            (ownerId && ownerId.toString()) ||
            "";

        let selectedDoc = await InterviewQuestions.findOne({
            roundId: interviewRoundId,
            questionId: identifier, // Searching by Bank ID
        });

        if (!selectedDoc) {
            // Create new SelectedInterviewQuestion
            const snapshot = bankDetails?.snapshot || bankDetails || {};
            const src =
                bankDetails?.source || snapshot.source || "custom";
            const mand = bankDetails?.mandatory || snapshot.mandatory || "false";

            selectedDoc = new InterviewQuestions({
                interviewId: resolvedInterviewId,
                roundId: interviewRoundId,
                order: i + 1,
                mandatory: mand,
                tenantId: tenantId || "",
                ownerId: questionOwnerId,
                questionId: identifier, // Storing Bank ID here
                source: src,
                snapshot: snapshot,
                addedBy: "interviewer",
            });
            await selectedDoc.save();
        }

        processedQuestions.push({
            ...item,
            questionId: selectedDoc._id, // Use the _id of the SelectedInterviewQuestion
        });
    }

    return processedQuestions;
};
