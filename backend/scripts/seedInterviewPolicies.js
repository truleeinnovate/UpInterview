require("dotenv").config();
const mongoose = require("mongoose");
const { InterviewPolicy } = require("../models/InterviewPolicy");

const MONGODB_URI = process.env.MONGODB_URI;

const connect = async () => {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set in environment");
  }
  await mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 60000,
  });
};

const seed = async () => {
  await connect();

  const policies = [
    {
      policyName: "rescheduled_more_than_24h",
      category: "INTERVIEW",
      type: "RESCHEDULE",
      timeBeforeInterviewMin: 1441,
      timeBeforeInterviewMax: 525600,
      feePercentage: 0,
      interviewerPayoutPercentage: 0,
      platformFeePercentage: 0,
      firstRescheduleFree: true,
      gstIncluded: true,
      status: "Active",
    },
    {
      policyName: "rescheduled_12_to_24h",
      category: "INTERVIEW",
      type: "RESCHEDULE",
      timeBeforeInterviewMin: 720,
      timeBeforeInterviewMax: 1440,
      feePercentage: 25,
      interviewerPayoutPercentage: 25,
      platformFeePercentage: 2.5,
      firstRescheduleFree: true,
      gstIncluded: true,
      status: "Active",
    },
    {
      policyName: "rescheduled_2_to_12h",
      category: "INTERVIEW",
      type: "RESCHEDULE",
      timeBeforeInterviewMin: 120,
      timeBeforeInterviewMax: 719,
      feePercentage: 50,
      interviewerPayoutPercentage: 50,
      platformFeePercentage: 5,
      firstRescheduleFree: false,
      gstIncluded: true,
      status: "Active",
    },
    {
      policyName: "rescheduled_less_than_2h",
      category: "INTERVIEW",
      type: "RESCHEDULE",
      timeBeforeInterviewMin: 0,
      timeBeforeInterviewMax: 119,
      feePercentage: 100,
      interviewerPayoutPercentage: 100,
      platformFeePercentage: 10,
      firstRescheduleFree: false,
      gstIncluded: true,
      status: "Active",
    },
    {
      policyName: "canceled_less_than_2h_no_show",
      category: "INTERVIEW",
      type: "CANCEL",
      timeBeforeInterviewMin: 0,
      timeBeforeInterviewMax: 119,
      feePercentage: 100,
      interviewerPayoutPercentage: 100,
      platformFeePercentage: 10,
      firstRescheduleFree: false,
      gstIncluded: true,
    },
    {
      policyName: "canceled_2_to_12h",
      category: "INTERVIEW",
      type: "CANCEL",
      timeBeforeInterviewMin: 120,
      timeBeforeInterviewMax: 719,
      feePercentage: 50,
      interviewerPayoutPercentage: 50,
      platformFeePercentage: 5,
      firstRescheduleFree: false,
      gstIncluded: true,
    },
    {
      policyName: "canceled_12_to_24h",
      category: "INTERVIEW",
      type: "CANCEL",
      timeBeforeInterviewMin: 720,
      timeBeforeInterviewMax: 1440,
      feePercentage: 25,
      interviewerPayoutPercentage: 25,
      platformFeePercentage: 2.5,
      firstRescheduleFree: false,
      gstIncluded: true,
      status: "Active",
    },
    {
      policyName: "canceled_more_than_24h",
      category: "INTERVIEW",
      type: "CANCEL",
      timeBeforeInterviewMin: 1441,
      timeBeforeInterviewMax: 525600,
      feePercentage: 0,
      interviewerPayoutPercentage: 0,
      platformFeePercentage: 0,
      firstRescheduleFree: false,
      gstIncluded: true,
      status: "Active",
    },
    {
      policyName: "mock_rescheduled_more_than_12h",
      category: "MOCK",
      type: "RESCHEDULE",
      timeBeforeInterviewMin: 721,
      timeBeforeInterviewMax: 525600,
      feePercentage: 0,
      interviewerPayoutPercentage: 0,
      platformFeePercentage: 0,
      firstRescheduleFree: true,
      gstIncluded: true,
      status: "Active",
    },
    {
      policyName: "mock_rescheduled_2_to_12h",
      category: "MOCK",
      type: "RESCHEDULE",
      timeBeforeInterviewMin: 120,
      timeBeforeInterviewMax: 720,
      feePercentage: 25,
      interviewerPayoutPercentage: 25,
      platformFeePercentage: 2.5,
      firstRescheduleFree: false,
      gstIncluded: true,
      status: "Active",
    },
    {
      policyName: "mock_rescheduled_less_than_2h",
      category: "MOCK",
      type: "RESCHEDULE",
      timeBeforeInterviewMin: 0,
      timeBeforeInterviewMax: 119,
      feePercentage: 50,
      interviewerPayoutPercentage: 50,
      platformFeePercentage: 5,
      firstRescheduleFree: false,
      gstIncluded: true,
      status: "Active",
    },
    {
      policyName: "mock_canceled_less_than_2h_no_show",
      category: "MOCK",
      type: "CANCEL",
      timeBeforeInterviewMin: 0,
      timeBeforeInterviewMax: 119,
      feePercentage: 50,
      interviewerPayoutPercentage: 50,
      platformFeePercentage: 5,
      firstRescheduleFree: false,
      gstIncluded: true,
    },
    {
      policyName: "mock_canceled_2_to_12h",
      category: "MOCK",
      type: "CANCEL",
      timeBeforeInterviewMin: 120,
      timeBeforeInterviewMax: 720,
      feePercentage: 25,
      interviewerPayoutPercentage: 25,
      platformFeePercentage: 2.5,
      firstRescheduleFree: false,
      gstIncluded: true,
    },
    {
      policyName: "mock_canceled_more_than_12h",
      category: "MOCK",
      type: "CANCEL",
      timeBeforeInterviewMin: 721,
      timeBeforeInterviewMax: 525600,
      feePercentage: 0,
      interviewerPayoutPercentage: 0,
      platformFeePercentage: 0,
      firstRescheduleFree: false,
      gstIncluded: true,
      status: "Active",
    },
  ];

  for (const p of policies) {
    await InterviewPolicy.updateOne(
      { policyName: p.policyName },
      { $set: p },
      { upsert: true }
    );
  }

  await mongoose.disconnect();
};

seed()
  .then(() => {
    console.log("Interview policies seeded successfully");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Failed to seed interview policies", err);
    process.exit(1);
  });
