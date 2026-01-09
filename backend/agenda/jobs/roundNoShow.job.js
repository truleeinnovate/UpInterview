const { InterviewRounds } = require("../../models/Interview/InterviewRounds");

module.exports = (agenda) => {
  agenda.define("round-no-show", async (job) => {
    const { roundId } = job.attrs.data;

    const round = await InterviewRounds.findById(roundId);
    if (!round) return;

    // 🔐 Double safety
    if (round.status !== "Scheduled") return;

    const participants = round.participants || [];

    const candidateJoined = participants.some(
      (p) => p.role === "Candidate" && p.status === "Joined"
    );
    const interviewerJoined = participants.some(
      (p) => p.role === "Interviewer" && p.status === "Joined"
    );

    if (candidateJoined && interviewerJoined) return;

    let currentAction = "Candidate_NoShow";
    if (!interviewerJoined && candidateJoined) {
      currentAction = "Interviewer_NoShow";
    } else if (!candidateJoined && !interviewerJoined) {
      currentAction = "Both_NoShow";
    }

    await InterviewRounds.findByIdAndUpdate(roundId, {
      status: "NoShow",
      currentAction,
      noShowJobId: null,
    });
  });
};
