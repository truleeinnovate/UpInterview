const { InterviewRounds } = require("../../models/Interview/InterviewRounds");

module.exports = (agenda) => {
  agenda.define("round-no-show", async (job) => {
    const { roundId } = job.attrs.data;

    console.log("\n[NoShow-Job] ========== round-no-show JOB FIRED ==========");
    console.log("[NoShow-Job] roundId:", roundId);

    const round = await InterviewRounds.findById(roundId);
    if (!round) {
      console.log("[NoShow-Job] ❌ Round not found in DB, exiting");
      return;
    }

    if (round.roundTitle === "Assessment" && round?.assessmentId) {
      console.log("[NoShow-Job] ❌ Round title is Assessment, exiting");
      return;
    }

    console.log("[NoShow-Job] Round found:", round._id, "| status:", round.status, "| interviewerType:", round.interviewerType);

    // 🔐 Double safety — must be Scheduled or Rescheduled (matches scheduler guard)
    if (!["Scheduled", "Rescheduled"].includes(round.status)) {
      console.log("[NoShow-Job] ❌ Status is", round.status, "(not Scheduled/Rescheduled) → skipping no-show");
      return;
    }

    const participants = round.participants || [];
    console.log("[NoShow-Job] Participants count:", participants.length);
    console.log("[NoShow-Job] Participants:", JSON.stringify(participants));

    const candidateJoined = participants.some(
      (p) => p.role === "Candidate" && p.status === "Joined"
    );
    const interviewerJoined = participants.some(
      (p) => p.role === "Interviewer" && p.status === "Joined"
    );

    console.log("[NoShow-Job] candidateJoined:", candidateJoined, "| interviewerJoined:", interviewerJoined);

    if (candidateJoined && interviewerJoined) {
      console.log("[NoShow-Job] ✅ Both joined, no no-show needed → exiting");
      return;
    }

    let currentAction = round.status;
    // if (!interviewerJoined && candidateJoined) {
    //   currentAction = round.status;
    // } else if (!candidateJoined && !interviewerJoined) {
    //   currentAction = round.status;
    // }

    console.log("[NoShow-Job] 🚨 Marking round as NoShow | currentAction:", currentAction);

    await InterviewRounds.findByIdAndUpdate(roundId, {
      status: "NoShow",
      currentAction,
      noShowJobId: null,
    });

    console.log("[NoShow-Job] ✅ Round updated to NoShow successfully");
    console.log("[NoShow-Job] ========== round-no-show JOB COMPLETE ==========\n");
  });
};

