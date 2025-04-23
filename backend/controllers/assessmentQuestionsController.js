
const AssessmentQuestionsSchema = require('../models/AssessmentQuestions')
const mongoose = require('mongoose');
//created mansoor to get sections by matching assessment id

exports.getByAssessmentId = async (req, res) => {
  console.log('getByAssessmentId called', req.params);

  try {
    const assessmentId = req.params.assessmentId;
    console.log('Received assessmentId:', assessmentId);

    // If assessmentId is an object, extract the _id
    const id = typeof assessmentId === 'object' ? assessmentId._id : assessmentId;
    console.log('Using assessment ID:', id);

    // Validate if assessmentId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid assessment ID format'
      });
    }

    const assessmentQuestions = await AssessmentQuestionsSchema.findOne({
      assessmentId: id
    }).populate('assessmentId', 'name description');

    console.log('Found assessment questions:', assessmentQuestions);

    if (!assessmentQuestions) {
      return res.status(404).json({
        success: false,
        message: 'Assessment questions not found'
      });
    }

    res.status(200).json({
      success: true,
      data: assessmentQuestions
    });
  } catch (error) {
    console.error('Error in getByAssessmentId:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}


// for both post and patch
exports.upsertAssessmentQuestions = async (req, res) => {
  try {
    const { assessmentId, sections } = req.body;

    // Validation
    if (!assessmentId || !Array.isArray(sections)) {
      return res.status(400).json({
        success: false,
        message: 'assessmentId and sections array are required',
      });
    }

    // Transform data (same for create/update)
    const transformedSections = sections.map((section) => ({
      sectionName: section.sectionName,
      passScore: section.passScore || 0,
      totalScore:section.totalScore,
      questions: section.questions.map((question) => ({
        questionId: new mongoose.Types.ObjectId(
          question.questionId || question._id
        ),
        source: question.source || 'system',
        snapshot: {
          ...question.snapshot,
        },
        score:question.score,
        order: question.order || 0,
        customizations: question.customizations || null,
      })),
    }));

    // Upsert operation
    const result = await AssessmentQuestionsSchema.findOneAndUpdate(
      { assessmentId: new mongoose.Types.ObjectId(assessmentId) },
      { $set: { sections: transformedSections } },
      { 
        new: true,
        upsert: true, // Creates if doesn't exist
        runValidators: true 
      }
    );

    res.status(200).json({
      success: true,
      message: 'Assessment questions processed successfully',
      data: result
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      error: error.name
    });
  }
};

exports.getAssessmentQuestionsBasedOnAssessmentId = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({ message: "Invalid assessment ID", success: false });
    }

    const questions = await a.find({ assessmentId: id })
      .sort({ createdAt: -1 })
      .limit(1);

    console.log("questions", questions)
    if (questions.length === 0) {
      return res.status(200).send({
        message: "No question found for the given assessment ID, probably a new assessment",
        order: 1,
        success: true,
      });
    }

    console.log('order=', questions[0].order)

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

exports.deleteAssessmentQuestion = async (req, res) => {
  const { id } = req.params;

  try {

    const deletedDoc = await a.findById(id);

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