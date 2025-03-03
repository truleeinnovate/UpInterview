const Assessment = require("../models/assessment");
const AssessmentQuestionsSchema= require('../models/AssessmentQuestions')
const { isValidObjectId } = require('mongoose');

exports.newAssessment = async (req, res) => {
    try {
      const {
        AssessmentTitle,
        AssessmentType,
        NumberOfQuestions,
        Position,
        DifficultyLevel,
        Duration,
        ExpiryDate,
        Sections,
        CandidateDetails,
        Instructions,
        AdditionalNotes,
        CreatedBy,
        OwnerId,
        orgId,
        totalScore,
        passScore
      } = req.body;
  
      const newAssessmentData = {
        AssessmentTitle,
        AssessmentType,
        Position,
        Duration,
        DifficultyLevel,
        NumberOfQuestions,
        ExpiryDate,
        Instructions,
        AdditionalNotes,
        CreatedBy,
        OwnerId,
        orgId,
        totalScore,
        passScore
      };
  
      if (Sections && Sections.length > 0) {
        newAssessmentData.Sections = Sections.map(section => ({
          ...section,
          Questions: section.Questions.map(question => {
            const baseQuestion = {
              Question: question.Question,
              QuestionType: question.QuestionType,
              DifficultyLevel: question.DifficultyLevel,
              Score: question.Score,
              Answer: question.Answer,
              Hint: question.Hint || null,
              CharLimits: question.CharLimits,
            };
  
            if (question.QuestionType === 'MCQ' && question.Options && question.Options.length > 0) {
              baseQuestion.Options = question.Options;
            }
  
            if (question.QuestionType === 'Programming Questions' && question.ProgrammingDetails && question.ProgrammingDetails.length > 0) {
              baseQuestion.ProgrammingDetails = question.ProgrammingDetails;
            }
  
            if ((question.QuestionType === 'Short Text(Single line)' || question.QuestionType === 'Long Text(Paragraph)') && question.AutoAssessment?.enabled) {
              baseQuestion.AutoAssessment = {
                enabled: question.AutoAssessment.enabled,
                matching: question.AutoAssessment.matching
              };
            }
  
            return baseQuestion;
          })
        }));
      }
  
      if (CandidateDetails && (CandidateDetails.includePosition || CandidateDetails.includePhone || CandidateDetails.includeSkills)) {
        newAssessmentData.CandidateDetails = CandidateDetails;
      }
  console.log("newAssessmentData",newAssessmentData)
      const assessment = new Assessment(newAssessmentData);
      console.log('assessment',assessment)
      await assessment.save();
      res.status(201).json(assessment);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

exports.updateAssessment = async (req, res) => {
    try {
      const { id } = req.params;
      console.log("requ body",req.body)
  
      // Validate the ID
      if (!isValidObjectId(id)) {
        return res.status(400).json({ error: "Invalid ID format." });
      }
  
  
      
      const updatedAssessment = await Assessment.findByIdAndUpdate(
        id,
        req.body,
        
      );
  
      if (!updatedAssessment) {
        return res.status(404).json({ error: "Assessment not found." });
      }
  
      res.status(200).json({ message: "Updated successfully.", data: updatedAssessment });
    } catch (error) {
      console.error("Error updating assessment:", error);
      res.status(500).json({ error: error.message });
    }
  }

//assessment questions

exports.addAssessmentQuestion = async(req,res)=>{
  try {
    const question = await AssessmentQuestionsSchema(req.body)
    await question.save()
    return res.status(201).send({
      success:true,
      message:"Question added",
      question
    })
  } catch (error) {
    console.log('error in adding question to assessment questions schema',error)
    return res.status(500).send({
      success:false,
      message:"Failed to add question",
      error:error.message,
    })
  }
}

exports.getAssessmentQuestionsBasedOnAssessmentId  = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid assessment ID", success: false });
    }

    const questions = await AssessmentQuestionsSchema.find({ assessmentId: id })
      .sort({ createdAt: -1 })
      .limit(1);

    console.log("questions",questions)
    if (questions.length === 0) {
      return res.status(200).send({
        message: "No question found for the given assessment ID, probably a new assessment",
        order: 1,
        success: true,
      });
    }

    console.log('order=',questions[0].order)

    // Respond with the next order

    return res.status(200).send({
      message: "Questions found",
      order: questions[0].order + 1,
      success: true,
    });
  } catch (error) {
    // Error handling
    res.status(500).send({
      message: "Failed to get assessment questions based on assessment ID",
      success: false,
      error: error.message,
    });
  }
}

exports.deleteAssessmentQuestion =  async (req, res) => {
    const { id } = req.params;
  
    try {
      
      const deletedDoc = await AssessmentQuestionsSchema.findById(id);
  
      if (!deletedDoc) {
        return res.status(404).send({
          message: "Document not found",
          success: false,
        });
      }
  
      const { order, assessmentId } = deletedDoc;
  
      
      await AssessmentQuestionsSchema.findByIdAndDelete(id);
  
      
      await AssessmentQuestionsSchema.updateMany(
        { assessmentId: assessmentId, order: { $gt: order } }, // Filter for subsequent documents
        { $inc: { order: -1 } } // Decrement the order
      );
  
  
      res.status(200).send({
        message: "Document deleted and order updated successfully",
        success: true,
      });
    } catch (error) {
      res.status(500).send({
        message: "Failed to delete the document and update order",
        success: false,
        error: error.message,
      });
    }
  }


  exports.updateAssessmentQuestion = async (req, res) => {
    const updatedQuestions = req.body; // Expecting an array of { questionId, order }
  
    try {
      // Loop through the updated questions and update their orders in the database
      const updatePromises = updatedQuestions.map(({ questionId, order }) =>
        AssessmentQuestionsSchema.findByIdAndUpdate(questionId, { order })
      );
  
      await Promise.all(updatePromises);
  
      res.status(200).json({
        message: "Question orders updated successfully.",
      });
    } catch (error) {
      console.error("Error updating question orders:", error);
      res.status(500).json({
        message: "Failed to update question orders.",
      });
    }
  }

  exports.getAssessmentDetailsBasedOnAssessmentId = async (req, res) => {
    try {
      const { assessmentId } = req.params;
      const assessment = await Assessment.findById(assessmentId).populate(
        "Sections.Questions"
      );
      if (!assessment) {
        return res.status(404).json({ error: "Assessment not found" });
      }
      res.status(200).json(assessment);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }