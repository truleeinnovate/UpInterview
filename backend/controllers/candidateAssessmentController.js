const { CandidateAssessment } = require("../models/candidateAssessment");
const nodemailer = require("nodemailer");
const Otp = require("../models/Otp");
const scheduledAssessmentsSchema = require("../models/scheduledAssessmentsSchema");
const { Candidate } = require("../models/candidate");
const CryptoJS = require("crypto-js");
const crypto = require("crypto");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ashrafshaik250@gmail.com",
    pass: "jqez anin fafs gizf",
  },
});



const {generateOTP, encrypt}= require('../utils/generateOtp')


exports.createCandidateAssessment = async (req, res) => {
    try {
      const candidateAssessments = req.body; // Assuming req.body contains an array of assessments
  
      if (
        !Array.isArray(candidateAssessments) ||
        candidateAssessments.length === 0
      ) {
        return res.status(400).send({
          success: false,
          message:
            "Request body must contain a non-empty array of candidate assessments.",
        });
      }
  
      // Use insertMany for bulk insertion
      const insertedDocs = await CandidateAssessment.insertMany(
        candidateAssessments
      );
  
      return res.status(201).send({
        success: true,
        message: "Candidate assessments created successfully.",
        data: insertedDocs,
      });
    } catch (error) {
      console.error("Error in creating candidate assessments:", error);
      return res.status(500).send({
        success: false,
        message: "Failed to create candidate assessments.",
        error: error.message,
      });
    }
  }



exports.getCandidateAssessmentBasedOnScheduledAssessmentId =  async (req, res) => {
  try {
    const { id } = req.params;
    const candidateAssessments = await CandidateAssessment.find({
      scheduledAssessmentId: id,
    }).populate("candidateId")
    // }).populate("candidateId", "FirstName Email CurrentExperience")
    .populate({
      path:"sections",
      populate:{
        path:"Answers",
        populate:{
          path:"questionId"
        }
      }
    })
    
    return res.status(200).send({
      message: "Candidate Assessments Retrieved",
      success: true,
      candidateAssessments,
    });
  } catch (error) {
    console.log("error in getting candidate assessment", error);
    return res.status(500).send({
      success: false,
      message: "Failed to get candidate assessments.",
      error: error.message,
    });
  }
}

exports.updateCandidateAssessment  = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and update the document, or return 404 if not found
    const updateResult = await CandidateAssessment.findOneAndUpdate(
      { _id: id },
      req.body,
      { new: true } // This returns the updated document
    );

    // If no document was found, return a 404
    if (!updateResult) {
      return res.status(404).send({
        success: false,
        message: "Candidate assessment not found",
      });
    }

    res.status(200).send({
      message: "Candidate assessment updated successfully",
      success: true,
      updatedAssessment: updateResult, // Send only the updated document
    });
  } catch (error) {
    console.log(
      "Error in updating candidate assessment status:",
      error.message
    );
    return res.status(500).send({
      success: false,
      message: "Failed to update candidate assessment status",
      error: error.message,
    });
  }
}


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

exports.updateAnswersToDb  =  async (req, res) => {
  try {
    const { candidateAssessmentId, sectionIndex, questionId } = req.params;
    const { SectionName, Answers, passScore, sectionResult,assessmentTotalScore, totalScore,sectionTotalScore } = req.body;
    const { answer, isCorrect, score, isAnswerLater } = Answers;

    console.log("Request Body:", req.body);

    // Check if the CandidateAssessment exists
    let candidateAssessment = await CandidateAssessment.findById(candidateAssessmentId);

    if (!candidateAssessment) {
      return res.status(404).json({ message: 'Candidate assessment not found' });
    }

    // Check if the section exists
    const section = candidateAssessment.sections[sectionIndex];

    if (!section) {
      console.log("Section does not exist, creating a new one...");
      // Add a new section if it doesn't exist
      candidateAssessment.sections.push({
        SectionName,
        Answers: [
          {
            questionId,
            answer,
            isCorrect,
            score,
            isAnswerLater,
            submittedAt: new Date(),
          },
        ],
        totalScore:sectionTotalScore,
        passScore,
        sectionResult,
      });
    } else {
      console.log("Section exists, checking for the answer...");

      // Check if the answer already exists in the section
      const answerIndex = section.Answers.findIndex(
        (ans) => ans.questionId.toString() === questionId
      );

      if (answerIndex === -1) {
        // If the answer doesn't exist, add a new one
        console.log("Answer does not exist, adding a new one...");
        section.Answers.push({
          questionId,
          answer, 
          isCorrect, 
          score,
          isAnswerLater,
          submittedAt: new Date(),
        });
      } else {
        // If the answer exists, update the existing one
        console.log("Answer exists, updating the existing one...");
        section.Answers[answerIndex].answer = answer;
        section.Answers[answerIndex].isCorrect = isCorrect;
        section.Answers[answerIndex].score = score;
        section.Answers[answerIndex].isAnswerLater = isAnswerLater;
        section.Answers[answerIndex].submittedAt = new Date();
      }

      // Update section-level fields
      section.totalScore = sectionTotalScore;
      section.passScore = passScore;
      section.sectionResult = sectionResult;
    }

    candidateAssessment.totalScore = assessmentTotalScore
    // Save the updated CandidateAssessment document
    const updatedAssessment = await candidateAssessment.save();

    // Send the updated document back to the client
    res.json(updatedAssessment);
  } catch (error) {
    console.error('Error updating assessment:', error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
}

exports.autoSaveAnswers = async (req, res) => {
  try {
      const { candidateAssessmentId } = req.params;
      const { remainingTime,lastSelectedSection } = req.body;

      // Update the CandidateAssessment with the current progress
      const updatedAssessment = await CandidateAssessment.findByIdAndUpdate(
          candidateAssessmentId,
          {
              $set: req.body
          },
          { new: true } // Return the updated document
      );

      if (!updatedAssessment) {
          return res.status(404).json({ message: 'Candidate assessment not found' });
      }

      res.json({ message: 'Progress saved successfully', updatedAssessment });
  } catch (error) {
      console.error('Error saving progress:', error);
      res.status(500).json({ message: 'Internal Server Error', error });
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


exports.resendOtp = async (req, res) => {
  const { candidateId, scheduledAssessmentId } = req.body;
console.log("req body",req.body)
  if (!candidateId || !scheduledAssessmentId) {
    return res
      .status(400)
      .json({
        message: "Missing required fields: Email or scheduledAssessmentId",
      });
  }

  try {
    // Check if the scheduled assessment exists
    const assessment = await scheduledAssessmentsSchema.findById(
      scheduledAssessmentId
    );
    if (!assessment) {
      console.error("Assessment not found for ID:", scheduledAssessmentId);
      return res.status(404).json({ message: "Assessment not found" });
    }

    
    const candidate = await Candidate.findOne({_id: candidateId });
    if (!candidate) {
      console.error("Candidate not found for candidateId:", candidateId);
      return res.status(404).json({ message: "Candidate not found" });
    }
    console.log("candidate",candidate)

    
    const otp = generateOTP(candidate._id); 
    
    let updatedOtp = await Otp.findOneAndUpdate(
      { scheduledAssessmentId, candidateId }, // Match both fields
      { otp }, // Update the OTP field
      { new: true } // Return the updated document
    );

    // If no OTP document is found, create a new one
    if (!updatedOtp) {
      console.log("No existing OTP document found. Creating a new one.");
      updatedOtp = await Otp.create({
        scheduledAssessmentId,
        candidateId,
        otp,
        expiresAt: new Date(Date.now() + 90 * 1000),
      });
    }

    // Generate the assessment link
    const link = `http://localhost:3000/assessmenttest?assessmentId=${scheduledAssessmentId}&candidateId=${candidateId}`;

    // Email options
    const mailOptions = {
      from: "ashrafshaik250@gmail.com",
      to: candidate.Email,
      subject: "Assessment Invitation",
      // text: `You have been invited to participate in an assessment. Use this link: ${link}. Your OTP is ${updatedOtp.otp}, valid for 90 seconds.`,
      text: `Your new  OTP is ${updatedOtp.otp}, valid for 90 seconds.`,
    };

    // Send the email
    console.log("Resend OTP:",updatedOtp.otp)
    try {
      await transporter.sendMail(mailOptions);
      console.log("Email sent successfully to:", candidate.Email);
      return res.status(200).json({success:true, message: "Email re-sent successfully" });
    } catch (emailError) {
      console.error("Error sending email to:", candidate.Email, emailError);
      return res
        .status(500)
        .json({ success:false,message: "Failed to send email", error: emailError.message });
    }
  } catch (error) {
    console.error("Error processing resend-link request:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}
//this is not used i have added this code in asssessmentemailcontroller
// exports.sendLinkToCandidate =async (req, res) => {
//   try {
//     const { scheduledAssessmentId, candidateId } = req.params;
//     const scheduledAssessment = await CandidateAssessment.findOne({ scheduledAssessmentId, candidateId })
//       .populate("candidateId", "Email");
// console.log("scheduled assessment",scheduledAssessment)
//     if (!scheduledAssessment) {
//       return res.status(400).send({ message: "Assessment not found" });
//     }

//     const { assessmentLink } = scheduledAssessment;
//     const otp = generateOTP(candidateId);
//     const expiresAt = new Date(Date.now() + 90 * 1000);

//     const existingOtpDoc = await Otp.findOne({ scheduledAssessmentId, candidateId });

//     if (existingOtpDoc) {
//       existingOtpDoc.otp = otp;
//       existingOtpDoc.expiresAt = expiresAt;
//       await existingOtpDoc.save();
//     } else {
//       await Otp.create({
//         scheduledAssessmentId,
//         candidateId,
//         otp,
//         expiresAt,
//       });
//     }

//     const candidateEmail = scheduledAssessment.candidateId?.Email;
//     if (!candidateEmail) {
//       return res.status(400).send({ message: "Candidate email not found" });
//     }

//     const mailOptions = {
//       from: "ashrafshaik250@gmail.com",
//       to: candidateEmail,
//       subject: "Assessment Invitation",
//       text: `You have been invited to participate in an assessment. Use this link: ${assessmentLink}. Your OTP is ${otp}, valid for 90 seconds.`,
//     };

//     console.log("Sending email with options:", mailOptions);

//     try {
//       await transporter.sendMail(mailOptions);
//       console.log("Email sent successfully to:", candidateEmail);
//     } catch (emailError) {
//       console.error("Error sending email to:", candidateEmail, emailError);
//       return res.status(500).send({
//         message: "Failed to send email",
//         success: false,
//         error: emailError.message,
//       });
//     }

//     return res.status(200).send({
//       message: "Email sent successfully",
//       success: true,
//     });

//   } catch (error) {
//     console.error("Internal Server Error:", error);
//     return res.status(500).send({
//       message: "Internal server error",
//       success: false,
//       error: error.message,
//     });
//   }
// }

// exports.sendAssessmentLink = async (req, res) => {
//   const { scheduledAssessmentId, candidateEmails } = req.body;
//   // const notes = "notes text";

//   try {
//     const assessment = await scheduledAssessmentsSchema.findById(
//       scheduledAssessmentId
//     );
//     if (!assessment) {
//       console.error("Assessment not found for ID:", scheduledAssessmentId);
//       return res.status(404).json({ message: "Assessment not found" });
//     }

//     const secretKey = process.env.SECRET_KEY || "test-secret";

//     for (const email of candidateEmails) {
//       const candidate = await Candidate.findOne({ Email: email });
//       if (!candidate) {
//         console.error("Candidate not found for email:", email);
//       }

//       const candidateAssessmentDetails = await CandidateAssessment.findOne({candidateId:candidate._id,scheduledAssessmentId})
//       console.log("candidateAssessmentDetails",candidateAssessmentDetails)

//       const otp = generateOTP(candidate._id);
//       const expiresAt = new Date(Date.now() + 90 * 1000);

//       await Otp.create({
//         scheduledAssessmentId, 
//         candidateId: candidate._id,
//         otp, 
//         expiresAt,
//       });

//       const encryptedId =  encrypt(candidateAssessmentDetails._id.toString(),'test')
//       // const link = `http://localhost:3000/assessmenttest?assessmentId=${scheduledAssessmentId}&candidateId=${candidate._id}&candidateAssessmentId=${candidateAssessmentDetails._id}`;
//       // const link = `http://localhost:3000/assessmenttest?candidateAssessmentId=${candidateAssessmentDetails._id}`;
//       const link = `http://localhost:3000/assessmenttest?candidateAssessmentId=${encryptedId}`;
//       const updateCandidateAssessments = await CandidateAssessment.findByIdAndUpdate(candidateAssessmentDetails._id,{assessmentLink:link},{new:true})
// console.log("updateCandidateAssessments ",updateCandidateAssessments)
//       const mailOptions = {
//         from: "ashrafshaik250@gmail.com",
//         to: email,
//         subject: "Assessment Invitation",
//         text: `You have been invited to participate in an assessment. Use this link: ${link}. Your OTP is ${otp}, valid for 90 seconds.`,
//       };

//       console.log("Sending email with options:", mailOptions);

//       try {
//         await transporter.sendMail(mailOptions);
//         console.log("Email sent successfully to:", email);
//       } catch (emailError) {
//         console.error("Error sending email to:", email, emailError);
//       }
//     }

//     res.status(200).json({ message: "Emails sent successfully" });
//   } catch (error) {
//     console.error("Error sending email:", error);
//     res
//       .status(500)
//       .json({ message: "Error sending email", error: error.message });
//   }
// }

// exports.shareScheduledAssessment = app.post('/resend-link-otp/:scheduledAssessmentId', async (req, res) => {
