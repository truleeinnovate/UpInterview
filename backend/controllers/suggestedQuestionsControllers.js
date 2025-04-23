const { SuggestedQuestion } = require('../models/SuggestedQuestion');


const createQuestion =async(req,res)=>{
    const {questionText,questionType,isInterviewQuestionOnly,technology,skill,tags,difficultyLevel,correctAnswer,options,hints,isAutoAssessment,autoAssessment,programming,isActive,createdDate,createdBy,modifiedDate,modifiedBy}=req.body 

    try {
        const lastQuestion = await SuggestedQuestion.findOne()
     .sort({createdDate:-1})
     .select("questionNo");
     let nextQuestionNo = 'SUGQ-00000';

if (lastQuestion && lastQuestion.questionNo) {
    const lastNumber = Number(lastQuestion.questionNo.split('-')[1]);

    
    const requiredNumber = lastNumber + 1;

    const totalLength = lastQuestion.questionNo.split('-')[1].length; 
    nextQuestionNo = `SUGQ-${requiredNumber.toString().padStart(totalLength, "0")}`;
}
console.log(nextQuestionNo)
        const suggestionQuestionInstance = await SuggestedQuestion({
            questionNo:nextQuestionNo,
            questionText,
            questionType,
            isInterviewQuestionOnly,
            technology,
            skill,
            tags,
            difficultyLevel,
            // score,
            correctAnswer,
            options,
            hints,
            isAutoAssessment,
            autoAssessment,
            programming,
            isActive,
            createdDate,
            createdBy,
            modifiedDate,
            modifiedBy
        })
     
        console.log(suggestionQuestionInstance)
        await suggestionQuestionInstance.save()
        return res.status(201).send({
            success:true,
            message:"Question Added",
            question:suggestionQuestionInstance
        })
    } catch (error) {
        console.log(error)
        return res.status(500).send({
            success:false,
            message:"Failed to add question",
            error:error.message
        })
    }

}


const getQuestions = async(req,res)=>{
    try {
        const questions = await SuggestedQuestion.find()
        // console.log(questions)
        return res.status(200).send({
            success:true,
            message:"Questions retrieved",
            questions
        })
    } catch (error) {
        console.log('error in getting questions')
        return res.status(500).send({
            success:false,
            message:"Failed to get questions",
            error:error.message
        })
    }
}

module.exports = {createQuestion,getQuestions}