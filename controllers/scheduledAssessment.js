const { CandidateAssessment } = require("../models/candidateAssessment");
const Otp = require("../models/Otp");
const scheduledAssessmentsSchema = require("../models/scheduledAssessmentsSchema");


exports.createScheduledAssessment =  async (req, res) => {
  try {
    const scheduledAssessment = await scheduledAssessmentsSchema(req.body);
    await scheduledAssessment.save();
    // console.log('schedule assessment',scheduledAssessment)
    res.status(201).send({
      success: true,
      message: "Assessment Scheduled",
      assessment: scheduledAssessment,
    });
  } catch (error) {
    console.log("error in scheduling assessment", error);
    res.status(500).send({
      message: "Failed to schedule assessment",
      success: false,
      error: error.message,
    });
  }
}

exports.getScheduledAssessmentBasedOnAssessmentId =  async (req, res) => {
    try {
      const { id } = req.params;
      const scheduledAssessment = await scheduledAssessmentsSchema
        .find({ assessmentId: id })
        .populate("createdBy", "Firstname")
        .populate("assessmentId");
      console.log("scheduled assesmne,", scheduledAssessment);
      return res.status(200).send({
        message: "Retrieved scheduled assessments",
        success: true,
        scheduledAssessment,
      });
    } catch (error) {
      console.log("error in getting scheduled assessment from backed", error);
      res.status(500).send({
        message: "Failed to get scheduled assessment",
        success: false,
        error: error.message,
      });
    }
  }

exports.getScheduledAssessmentsListBasedOnId =async (req, res) => {
  try {
    const { id } = req.params;
    const scheduledAssessment = await scheduledAssessmentsSchema
      .findById(id)
      .populate({
        path: "assessmentId",
        populate: { path: "Sections.Questions" },
      });
    // const scheduledAssessment = await scheduledAssessmentsSchema.findById(id).populate('createdBy',"Firstname").populate('assessmentId')
    console.log("scheduled assesmne,", scheduledAssessment);
    return res.status(200).send({
      message: "Retrieved scheduled assessments",
      success: true,
      scheduledAssessment,
    });
  } catch (error) {
    console.log("error in getting scheduled assessment from backed", error);
    res.status(500).send({
      message: "Failed to get scheduled assessment",
      success: false,
      error: error.message,
    });
  }
}

exports.updateScheduleAssessment =  async (req, res) => {
  try {
    const { id } = req.params;
    const updateScheduleAssessment =
      await scheduledAssessmentsSchema.findOneAndUpdate(
        { _id: id },
        req.body,
        { new: true }
      );
    const updateCandidateAssessments = await CandidateAssessment.updateMany(
      { scheduledAssessmentId: id },
      req.body
    );
    res.status(200).send({
      message:
        "scheduled assessment and candidate assessment updated successfully",
      success: true,
    });
  } catch (error) {
    console.log(
      "Failed to update status of scheduled assessment and candidate assessment"
    );
    res.status(500).send({
      message:
        "Failed to update status of scheduled assessment and candidate assessment",
      success: false,
      error: error.message,
    });
  }
}

exports.shareScheduledAssessment =  async (req, res) => {
  try {
    const { scheduledAssessmentId } = req.params;
    const candidateAssessmentDocuments = await CandidateAssessment.find({ scheduledAssessmentId })
      .populate("candidateId", "Email");

    console.log('Candidate assessment documents:', candidateAssessmentDocuments);

    for (let assessment of candidateAssessmentDocuments) {
      const { candidateId, assessmentLink } = assessment;
      const { Email } = candidateId;

      const otp = generateOTP(candidateId._id);
      const expiresAt = new Date(Date.now() + 90 * 1000);

      // Check if an OTP document already exists
      const existingOtpDoc = await Otp.findOne({ scheduledAssessmentId, candidateId: candidateId._id });

      if (existingOtpDoc) {
        // Update the existing OTP document
        existingOtpDoc.otp = otp;
        existingOtpDoc.expiresAt = expiresAt;
        await existingOtpDoc.save();
      } else {
        // Create a new OTP document if not found
        await Otp.create({
          scheduledAssessmentId,
          candidateId: candidateId._id,
          otp,
          expiresAt,
        });
      }

      const mailOptions = {
        from: "ashrafshaik250@gmail.com",
        to: Email,
        // to: "shashankmende88@gmail.com",
        subject: "Assessment Invitation",
        text: `You have been invited to participate in an assessment. Use this link: ${assessmentLink}. Your OTP is ${otp}, valid for 90 seconds.`,
      };

      console.log("Sending email with options:", mailOptions);

      try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully to:", Email);
      } catch (emailError) {
        console.error("Error sending email to:", Email, emailError);
      }
    }

    return res.status(200).send({
      message: "Emails sent successfully",
      success: true,
    });

  } catch (error) {
    res.status(500).send({
      message: "Failed to get candidate assessment documents based on scheduled assessment ID",
      success: false,
      error: error.message,
    });
  }
};
