const { CandidateAssessment } = require("../models/candidateAssessment");
const { generateOTP } = require('../utils/generateOtp')
const Otp = require("../models/Otp");

// exports.updateCandidateAssessment = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Find and update the document, or return 404 if not found
//     const updateResult = await CandidateAssessment.findOneAndUpdate(
//       { _id: id },
//       req.body,
//       { new: true } // This returns the updated document
//     );

//     // If no document was found, return a 404
//     if (!updateResult) {
//       return res.status(404).send({
//         success: false,
//         message: "Candidate assessment not found",
//       });
//     }

//     res.status(200).send({
//       message: "Candidate assessment updated successfully",
//       success: true,
//       updatedAssessment: updateResult, // Send only the updated document
//     });
//   } catch (error) {
//     console.log(
//       "Error in updating candidate assessment status:",
//       error.message
//     );
//     return res.status(500).send({
//       success: false,
//       message: "Failed to update candidate assessment status",
//       error: error.message,
//     });
//   }
// }


// exports.updateAnswersToDb = async (req, res) => {
//   try {
//     const { candidateAssessmentId, sectionIndex, questionId } = req.params;
//     const { SectionName, Answers, passScore, sectionResult, assessmentTotalScore, totalScore, sectionTotalScore } = req.body;
//     const { answer, isCorrect, score, isAnswerLater } = Answers;

//     console.log("Request Body:", req.body);

//     // Check if the CandidateAssessment exists
//     let candidateAssessment = await CandidateAssessment.findById(candidateAssessmentId);

//     if (!candidateAssessment) {
//       return res.status(404).json({ message: 'Candidate assessment not found' });
//     }

//     // Check if the section exists
//     const section = candidateAssessment.sections[sectionIndex];

//     if (!section) {
//       console.log("Section does not exist, creating a new one...");
//       // Add a new section if it doesn't exist
//       candidateAssessment.sections.push({
//         SectionName,
//         Answers: [
//           {
//             questionId,
//             answer,
//             isCorrect,
//             score,
//             isAnswerLater,
//             submittedAt: new Date(),
//           },
//         ],
//         totalScore: sectionTotalScore,
//         passScore,
//         sectionResult,
//       });
//     } else {
//       console.log("Section exists, checking for the answer...");

//       // Check if the answer already exists in the section
//       const answerIndex = section.Answers.findIndex(
//         (ans) => ans.questionId.toString() === questionId
//       );

//       if (answerIndex === -1) {
//         // If the answer doesn't exist, add a new one
//         console.log("Answer does not exist, adding a new one...");
//         section.Answers.push({
//           questionId,
//           answer,
//           isCorrect,
//           score,
//           isAnswerLater,
//           submittedAt: new Date(),
//         });
//       } else {
//         // If the answer exists, update the existing one
//         console.log("Answer exists, updating the existing one...");
//         section.Answers[answerIndex].answer = answer;
//         section.Answers[answerIndex].isCorrect = isCorrect;
//         section.Answers[answerIndex].score = score;
//         section.Answers[answerIndex].isAnswerLater = isAnswerLater;
//         section.Answers[answerIndex].submittedAt = new Date();
//       }

//       // Update section-level fields
//       section.totalScore = sectionTotalScore;
//       section.passScore = passScore;
//       section.sectionResult = sectionResult;
//     }

//     candidateAssessment.totalScore = assessmentTotalScore
//     // Save the updated CandidateAssessment document
//     const updatedAssessment = await candidateAssessment.save();

//     // Send the updated document back to the client
//     res.json(updatedAssessment);
//   } catch (error) {
//     console.error('Error updating assessment:', error);
//     res.status(500).json({ message: 'Internal Server Error', error });
//   }
// }

// exports.autoSaveAnswers = async (req, res) => {
//   try {
//     const { candidateAssessmentId } = req.params;
//     const { remainingTime, lastSelectedSection } = req.body;

//     // Update the CandidateAssessment with the current progress
//     const updatedAssessment = await CandidateAssessment.findByIdAndUpdate(
//       candidateAssessmentId,
//       {
//         $set: req.body
//       },
//       { new: true } // Return the updated document
//     );

//     if (!updatedAssessment) {
//       return res.status(404).json({ message: 'Candidate assessment not found' });
//     }

//     res.json({ message: 'Progress saved successfully', updatedAssessment });
//   } catch (error) {
//     console.error('Error saving progress:', error);
//     res.status(500).json({ message: 'Internal Server Error', error });
//   }
// }






exports.getCandidateAssessmentBasedOnId = async(req,res)=>{
  try {
    const {id}= req.params 
    if (!id){
      console.log("id is missing")
      return res.status(400).send({message:"id is missing"})
    }
    const document = await CandidateAssessment.findById(id) 
    console.log("document",document)
    if (!document){
      console.log("no document found")
      return res.status(400).send({message:`no document found for given candidate assessment id:${id}`})
    }
    return res.status(200).send({
      message:"Retrieved candidate Assessment",
      success:true,
      candidateAssessment:document
    })
  } catch (error) {
    console.log("error in getting candidate assessment details",error)
    res.status(500).send({
      success:false,
      message:"Failed to get candidate assessment details",
      error:error.message
    })
  }
}

exports.verifyOtp =  async (req, res) => {
  const { candidateId, scheduledAssessmentId, otp } = req.body;
  console.log("req body", req.body);
  // Check for missing fields
  if (!candidateId || !scheduledAssessmentId || !otp) {
    return res.status(400).json({
      isValid: false,
      message: "Missing required fields.",
    });
  }

  try {
    // Check if OTP exists in the database
    const storedOtp = await Otp.findOne({ candidateId, scheduledAssessmentId });
    console.log("stored otp", storedOtp);
    if (!storedOtp) {
      return res.status(404).json({
        isValid: false,
        message: "OTP not found. Please request a new one.",
      });
    }

    // Check if OTP has expired
    if (new Date() > storedOtp.expiresAt) {
      await Otp.findByIdAndDelete(storedOtp._id)
      return res.status(410).json({
        isValid: false,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // Validate OTP
    const isValid = String(storedOtp.otp) === String(otp); // Ensure type safety

    if (isValid) {
      // Delete OTP after successful validation
      await Otp.findByIdAndDelete(storedOtp._id);

      return res.status(200).json({
        isValid: true,
        message: "OTP is valid.",
      });
    } else {
      return res.status(400).json({
        isValid: false,
        message: "Invalid OTP.",
      });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);

    return res.status(500).json({
      isValid: false,
      message: "Internal server error. Please try again.",
    });
  }
}
exports.sendOtp = async (req, res) => {
  try {
    const { scheduledAssessmentId, candidateId } = req.params;
    const scheduledAssessment = await CandidateAssessment.findOne({ scheduledAssessmentId, candidateId })
      .populate("candidateId", "Email");
    console.log("scheduled assessment", scheduledAssessment)
    if (!scheduledAssessment) {
      return res.status(400).send({ message: "Assessment not found" });
    }

    const { assessmentLink } = scheduledAssessment;
  
    const otp = generateOTP(candidateId);
    const expiresAt = new Date(Date.now() + 90 * 1000);

    const existingOtpDoc = await Otp.findOne({ scheduledAssessmentId, candidateId });

    if (existingOtpDoc) {
      existingOtpDoc.otp = otp;
      existingOtpDoc.expiresAt = expiresAt;
      await existingOtpDoc.save();
    } else {
      await Otp.create({
        scheduledAssessmentId,
        candidateId,
        otp,
        expiresAt,
      });
    }
    console.log("OTP generated:", otp);
    

    // const candidateEmail = scheduledAssessment.candidateId?.Email;
    // if (!candidateEmail) {
    //   return res.status(400).send({ message: "Candidate email not found" });
    // }

    // const mailOptions = {
    //   from: "ashrafshaik250@gmail.com",
    //   to: candidateEmail,
    //   subject: "Assessment Invitation",
    //   text: `Your OTP is ${otp}, valid for 90 seconds.`,
    // };

    // console.log("Sending email with options:", mailOptions);

    // try {
    //   await transporter.sendMail(mailOptions);
    //   console.log("Email sent successfully to:", candidateEmail);
    // } catch (emailError) {
    //   console.error("Error sending email to:", candidateEmail, emailError);
    //   return res.status(500).send({
    //     message: "Failed to send email",
    //     success: false,
    //     error: emailError.message,
    //   });
    // }

    return res.status(200).send({
      message: "Email sent successfully",
      success: true,
    });

  } catch (error) {
    console.error("Internal Server Error:", error);
    return res.status(500).send({
      message: "Internal server error",
      success: false,
      error: error.message,
    });
  }
}
exports.submitCandidateAssessment = async (req, res) => {
  console.log('Started backend process');
  try {
    const {
      scheduledAssessmentId,
      candidateId,
      status,
      sections,
      totalScore,
      submittedAt,
    } = req.body;

    console.log('Received request body:', {
      scheduledAssessmentId,
      candidateId,
      status,
      sections,
      totalScore,
      submittedAt,
    });

    // Validate required fields (allow 0 for totalScore)
    if (
      scheduledAssessmentId === undefined || scheduledAssessmentId === null ||
      candidateId === undefined || candidateId === null ||
      sections === undefined || sections === null ||
      totalScore === undefined || totalScore === null ||
      submittedAt === undefined || submittedAt === null
    ) {
      console.log('Missing fields:', {
        scheduledAssessmentId: scheduledAssessmentId !== undefined && scheduledAssessmentId !== null,
        candidateId: candidateId !== undefined && candidateId !== null,
        sections: sections !== undefined && sections !== null,
        totalScore: totalScore !== undefined && totalScore !== null,
        submittedAt: submittedAt !== undefined && submittedAt !== null,
      });
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    console.log('Validation passed, searching for candidate assessment...');

    // Find the existing candidate assessment
    let candidateAssessment = await CandidateAssessment.findOne({
      scheduledAssessmentId,
      candidateId,
    });

    if (!candidateAssessment) {
      console.log('No candidate assessment found for:', { scheduledAssessmentId, candidateId });
      return res.status(404).json({
        success: false,
        message: "Candidate assessment not found",
      });
    }

    console.log('Found candidate assessment before update:', candidateAssessment);

    // Update the candidate assessment with submitted data
    candidateAssessment.status = status || 'completed';
    candidateAssessment.sections = sections;
    candidateAssessment.totalScore = totalScore;
    candidateAssessment.submittedAt = submittedAt;
    candidateAssessment.endedAt = new Date();

    // Calculate overall result based on sections
    let overallResult = 'pass';
    let hasFailedSection = false;

    // Check each section's result
    sections.forEach(section => {
      const sectionScore = section.Answers.reduce((total, answer) => {
        const question = section.questions.find(q => q._id.toString() === answer.questionId.toString());
        if (!question) return total;

        const correctAnswer = question.snapshot?.correctAnswer || question.correctAnswer;
        return total + (answer.answer === correctAnswer ? (question.score ?? 0) : 0);
      }, 0);

      if (sectionScore < (section.passScore ?? 0)) {
        hasFailedSection = true;
      }
    });

    // If any section failed, overall result is fail
    if (hasFailedSection) {
      overallResult = 'fail';
    }

    // Update the overall result
    candidateAssessment.overallResult = overallResult;

    console.log('Candidate assessment after update (before save):', candidateAssessment);

    // Save the updated assessment to the database
    const updatedAssessment = await candidateAssessment.save();

    console.log('Updated assessment saved to database:', updatedAssessment);

    return res.status(200).json({
      success: true,
      message: "Assessment submitted successfully",
      data: updatedAssessment,
    });
  } catch (error) {
    console.error("Error submitting candidate assessment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to submit assessment",
      error: error.message,
    });
  }
};