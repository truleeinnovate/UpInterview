import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from "react";
import logo from "../../Images/upinterviewLogo.png";
import { useLocation, useNavigate } from "react-router-dom";
import { evaluate } from 'mathjs';
import axios from "axios";
import toast from "react-hot-toast";
import debounce from 'lodash.debounce';



const AssessmentQuestion = () => {
    const [assessment, setAssessment] = useState(null);        

    const [showMainContent, setShowMainContent] = useState(true);
    const [showPreview, setShowPreview] = useState(false);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [answerLater, setAnswerLater] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();
    const [selectedLanguage, setSelectedLanguage] = useState("");
    
    const [timeSpent, setTimeSpent] = useState(0);
    // console.log("timeSpent", timeSpent);
    
    const [previewMode, setPreviewMode] = useState(false);
    const [answeredQuestionsScore, setAnsweredQuestionsScore] = useState(0);
    const [validationErrors, setValidationErrors] = useState([]);
    const candidateId = location.state?.candidate._id;
    const candidateAssessmentId = location.state?.candidateAssessmentId
    // const {candidateAssessmentDetails,getCandidateAssessmentDetails}=useCustomContext()
    let candidateAssessmentDetails = location.state?.candidateAssessmentDetails

    
    const [newCandidateAssessmentDetails,setNewCandidateAssessmentDetails]= useState(candidateAssessmentDetails)
    // const [isNewAssessment,setIsNewAssessment]= useState(newCandidateAssessmentDetails.sections? false:true)
    const [isNewAssessment,setIsNewAssessment]= useState(true)
    console.log("isNew Assessment",isNewAssessment)
    const assessmentDuration = Number(assessment?.assessmentId?.Duration.split(" ")[0])*60
    console.log("assessment duration",assessmentDuration)

    // const [remainingTime,setRemainingTime]=useState( !isNewAssessment ? newCandidateAssessmentDetails.remainingTime :   assessmentDuration)//1800 seconds
    const [remainingTime,setRemainingTime]=useState(assessmentDuration)//1800 seconds
    console.log("remaining time",remainingTime)
    // let totalTimeAllowed = newCandidateAssessmentDetails.remainingTime || 30*60;
    // const totalTimeAllowed = isNewAssessment ? assessmentDuration : remainingTime
    let totalTimeAllowed = assessmentDuration
    const [selectedSection, setSelectedSection] = useState(  0);
    const remainingTimeRef = useRef(remainingTime); // Ref to store the current value of remainingTime
    
    const [totalScore,setTotalScore]=useState(0)
    const [sectionWiseTotalScore,setSetSectionWiseTotalScore]=useState([])
    const [assessmentTotalScore,setAssessmentTotalScore]= useState(0)
    


  

 

    useEffect(()=>{
        const handlePageLoad = async()=>{
            // alert("page is loaded")
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/candidate-assessment/details/${localStorage.getItem("candidateAssessmentId")}`)
            if (response.data.success){
                setNewCandidateAssessmentDetails(response.data.candidateAssessment)
                setSelectedSection(response.data.candidateAssessment.lastSelectedSection || 0);
                setRemainingTime( assessmentDuration || response.data.candidateAssessment.remainingTime );
                // const [isNewAssessment,setIsNewAssessment]= useState(newCandidateAssessmentDetails.sections? false:true)
                setIsNewAssessment( response.data.candidateAssessment.sections ? false:true)

                // toast.success("progress loaded")
            }

        }

        window.addEventListener("load",handlePageLoad)
        return ()=>window.removeEventListener("load",handlePageLoad)
    },[])


    //before pageload or lost
    useEffect(() => {
        const handleBeforeRefresh = () => {
            const data = JSON.stringify({
                remainingTime: remainingTimeRef.current,
                lastSelectedSection: selectedSection,
            });
            navigator.sendBeacon(
                `${process.env.REACT_APP_API_URL}/candidate-assessment/${candidateAssessmentId}/save-progress`,
                data
            );
        };
        window.addEventListener("beforeunload", handleBeforeRefresh);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeRefresh);
        };
    }, [remainingTimeRef, selectedSection, candidateAssessmentId]);
    
      

    useEffect(() => {
        const assessmentData = location.state?.assessment;
        const existingSections = newCandidateAssessmentDetails?.sections;
    
        console.log("existing sections**********", existingSections);
    
        if (existingSections?.length === 0) {
            if (assessmentData) {
                console.log("Fetched assessment data:", assessmentData);
                setAssessment(assessmentData);
              

    
                // Initialize options, answers, and scores for a new session
                setSelectedOptions(
                    assessmentData.assessmentId.Sections.map((section) =>
                        Array(section.Questions.length).fill("")
                    )
                );
                setAnswerLater(
                    assessmentData.assessmentId.Sections.map((section) =>
                        Array(section.Questions.length).fill(false)
                    )
                );
                setSetSectionWiseTotalScore(
                    Array(assessmentData.assessmentId.Sections.length).fill(0)
                );
            } else {
                console.error("No assessment data found in state");
                navigate("/error");
            }
        } else {
            // Resume session with existing data
            toast.success("Your session resumed..");
    
            setAssessment(assessmentData);
            const assessmentSections = assessmentData.assessmentId.Sections;
    
            // Restore options, ensuring the correct question order
            const restoredOptions = assessmentSections.map((section, sectionIndex) => {
                const isSectionExist = existingSections[sectionIndex];
                console.log("Section index:", sectionIndex, "********", isSectionExist);
    
                if (isSectionExist) {
                    // Map answers to questions by matching `questionId`
                    return section.Questions.map((question) => {
                        const matchingAnswer = isSectionExist.Answers.find(
                            (answer) => answer.questionId === question._id
                        );
    
                        if (matchingAnswer) {
                            // For MCQ type, get the index of the selected option
                            return question.snapshot.questionType === "MCQ"
                                ? question.snapshot.options.indexOf(matchingAnswer.answer)
                                : matchingAnswer.answer;
                        }
                        return ""; // Default to empty for unanswered questions
                    });
                } else {
                    return Array(section.Questions.length).fill("");
                }
            });
    
            setSelectedOptions(restoredOptions);
    
            // Restore "Answer Later" status
            const restoredAnswerLater = assessmentSections.map((section, sectionIndex) => {
                const isSectionExist = existingSections[sectionIndex];
                if (isSectionExist) {
                    return section.Questions.map((question) => {
                        const matchingAnswer = isSectionExist.Answers.find(
                            (answer) => answer.questionId === question._id
                        );
                        return matchingAnswer?.isAnswerLater || false;
                    });
                } else {
                    return Array(section.Questions.length).fill(false);
                }
            });
    
            console.log("restoredAnswerLater", restoredAnswerLater);
            setAnswerLater(restoredAnswerLater);
    
            // Restore scores for each section
            const restoredScores = existingSections.map((section) => section.totalScore || 0);
            setSetSectionWiseTotalScore(restoredScores);
        }
    }, [location.state, navigate, newCandidateAssessmentDetails]);
    


    
    useEffect(() => {
        remainingTimeRef.current = remainingTime;
    }, [remainingTime]);

    //update remaining time
    useEffect(()=>{
        const timer = setInterval(()=>{
            setRemainingTime(prevTime=>{
                if (prevTime <=1 ){
                    // clearInterval(timer)
                    handleTimeout()
                    return 0
                }
                return prevTime - 1
            })
        },1000)
        // alert(`remaining time : ${remainingTime}`)

        return ()=>clearInterval(timer)
    },[])

    const handleTimeout = async () => {
        try {
            await axios.patch(`${process.env.REACT_APP_API_URL}/candidate-assessment/update/${candidateAssessmentId}`, {
                status: "completed",
                endedAt: new Date(),
            });
            navigate("/timeout");
        } catch (error) {
            console.error("Error handling timeout:", error);
        }
    };

    //auto-save
    useEffect(()=>{
        const timerId = setInterval(() => {
            autoSaveProgress();
        }, 15000); // Every 30 seconds
    
        return () => clearInterval(timerId);
    },[remainingTimeRef, selectedSection, candidateAssessmentId])

    const autoSaveProgress = async () => {
        try {
            const progress = {
                remainingTime: remainingTimeRef.current,
                lastSelectedSection: selectedSection,
            };
            await axios.patch(`${process.env.REACT_APP_API_URL}/candidate-assessment/${candidateAssessmentId}/save-progress`, progress);
            console.log("Progress autosaved successfully");
        } catch (error) {
            console.error("Error saving progress:", error);
        }
    };


    const handleRunClick = async () => {
        const question = assessment.Sections[selectedSection].Questions[currentQuestionIndex];
        const code = selectedOptions[selectedSection][currentQuestionIndex];
        const language = selectedLanguage;

        try {
            const response = await fetch('/run-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code, language, testCases: question.ProgrammingDetails[0].testCases }),
            });

            const result = await response.json();
            if (response.ok) {
                console.log('Test cases result:', result);
            }
        } catch (error) {
            console.error('Error running code:', error);
        }
    };

    function isExactMatch(actualAnswer, givenAnswer) {
        if (typeof actualAnswer !== 'string') {
            actualAnswer = String(actualAnswer);
        }
        if (typeof givenAnswer !== 'string') {
            givenAnswer = String(givenAnswer);
        }
        return actualAnswer.trim().toLowerCase() === givenAnswer.trim().toLowerCase();
    }

    function containsMatch(actualAnswer, givenAnswer) {
        if (typeof actualAnswer !== 'string') {
            actualAnswer = String(actualAnswer);
        }
        if (typeof givenAnswer !== 'string') {
            givenAnswer = String(givenAnswer);
        }
        return actualAnswer.trim().toLowerCase().includes(givenAnswer.trim().toLowerCase());
    }

    const calculateScore = useMemo(() => {
        const calculateMCQScore = (section, sectionIndex) => {
            let mcqScore = 0;
            section.Questions.forEach((question, questionIndex) => {
                if (question.QuestionType === "MCQ") {
                    const correctAnswerText = question.Answer;
                    const userAnswerIndex = selectedOptions[sectionIndex][questionIndex];
                    const userAnswerText = question.Options[userAnswerIndex];
                    const isCorrect = userAnswerText === correctAnswerText;
                    console.log(`Section: ${sectionIndex}, Question: ${questionIndex}, MCQ Correct: ${isCorrect}`);
                }
            });
            return mcqScore;
        };

        if (!assessment || !assessment.Sections) {
            return { progressScore: 0 };
        }
        let progressScore = 0;
        assessment.Sections.forEach((section, sectionIndex) => {
            progressScore += calculateMCQScore(section, sectionIndex);

            section.Questions.forEach((question, questionIndex) => {
                if (question.QuestionType !== "MCQ") {
                    // const correctAnswerText = question.Answer;
                    const correctAnswerText = question.snapshot.correctAnswer;
                    const userAnswerText = selectedOptions[sectionIndex][questionIndex];
                    const autoAssessment = question.AutoAssessment;
                    let isCorrect = false;
                    if (autoAssessment && autoAssessment.enabled) {
                        if (autoAssessment.matching === 'Exact') {
                            isCorrect = isExactMatch(correctAnswerText, userAnswerText);
                        } else if (autoAssessment.matching === 'Contains') {
                            isCorrect = containsMatch(correctAnswerText, userAnswerText);
                        }
                    } else {
                        isCorrect = userAnswerText === correctAnswerText;
                    }
                    if (isCorrect) {
                        progressScore += question.snapshot.Score;
                    }
                }
            });
        });
        return { progressScore };
    }, [assessment, selectedOptions]);

    const handleFinishClick = () => {
        setShowMainContent(false);
        setShowPreview(true);
        const score = calculateAnsweredQuestionsScore();
        
        setAnsweredQuestionsScore(score);
    };

    const formatTimeSpent = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSubmit = async () => {
        try {
            const totalQuestions = assessment.assessmentId.Sections.reduce((total, section) => total + section.Questions.length, 0);
            const formattedTimeSpent = formatTimeSpent(timeSpent);

            // Prepare questions data
            const questionsData = assessment.assessmentId.Sections.flatMap((section, sectionIndex) =>
                section.Questions.map((question, questionIndex) => {
                    let givenAnswer = selectedOptions[sectionIndex][questionIndex];
                    const correctAnswer = question.Answer;
                    const score = question.Score;

                    let isCorrect = false;

                    // Determine correctness based on question type
                    switch (question.QuestionType) {
                        case "MCQ":
                            const userAnswerIndex = selectedOptions[sectionIndex][questionIndex];
                            const userAnswerText = question.Options[userAnswerIndex];
                            givenAnswer = userAnswerText; // Set givenAnswer to the text of the selected option
                            isCorrect = userAnswerText === correctAnswer;
                            break;
                        case "Short Text(Single line)":
                        case "Long Text(Paragraph)":
                            if (typeof givenAnswer !== 'string') {
                                givenAnswer = String(givenAnswer);
                            }
                            isCorrect = givenAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
                            break;
                        case "Number":
                            const userAnswerNumber = parseFloat(givenAnswer);
                            const correctAnswerNumber = parseFloat(correctAnswer);
                            isCorrect = userAnswerNumber === correctAnswerNumber;
                            break;
                        case "Boolean":
                            if (typeof givenAnswer !== 'string') {
                                givenAnswer = String(givenAnswer);
                            }
                            isCorrect = givenAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
                            break;
                        default:
                            console.warn(`Unhandled question type: ${question.QuestionType}`);
                            return ""
                    }

                    const marks = isCorrect ? score : 0;

                    
                    console.log({
                        questionId: question._id,
                        correctAnswer,
                        givenAnswer,
                        score,
                        marks
                    });

                    return {
                        questionId: question._id,
                        correctAnswer,
                        givenAnswer,
                        score,
                        marks
                    };
                })
            );

            let totalScore = calculateAnsweredQuestions()       
            const sectionsData = assessment.assessmentId.Sections.map((section, sectionIndex) => {                
                const answeredQuestions = selectedOptions[sectionIndex].filter(option => option !== "").length;
                const totalQuestions = section.Questions.length;
                // const passScore = section.Questions.reduce((total, question) => total + question.snapshot.score, 0);
                const passScore =  assessment.assessmentId.passScoreBy ==="Overall" ? assessment.assessmentId.passScore : section.Questions.reduce((total, question) => total + question.snapshot.score, 0);
                // const totalScore = section.Questions.reduce((total, question) => total + question.snapshot.score, 0);  
                // let totalScore =0            
                    
                return {                    
                    Answers: section.Questions.map((q, index) => {
                        let userAnswer = selectedOptions[sectionIndex][index];                                                                
                        if (typeof userAnswer === "number") {
                            userAnswer = q.snapshot?.options[userAnswer];
                        }
                        const isCorrect = userAnswer === q.snapshot.correctAnswer;
                        // totalScore += isCorrect + q.snapshot.score
                        return {
                            questionId: q._id,
                            answer: userAnswer,
                            isCorrect,
                            score: isCorrect ? q.snapshot.score : 0,
                            isAnswerLater: answerLater[sectionIndex][index],
                            submittedAt: new Date(),
                        };
                    }),
                    totalScore,
                    passScore,
                    sectionResult: totalScore >= passScore ? "pass" : "fail",
                    SectionName: section.SectionName,
                };
                
            });

            // Log the entire questionsData array
            console.log('Questions Data:', questionsData);
            const Assessment = assessment.assessmentId

            const reqBody = {
                // completionTime:new Date(),
                remainingTime:remainingTimeRef.current,
                sections:sectionsData,
                

            }
            console.log("req body=",reqBody)
            // const response = await fetch(`${process.env.REACT_APP_API_URL}/assessmenttest`, {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/candidate-assessment/update/${candidateAssessmentId}`, {
                // method: 'POST',
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                
    
                body:JSON.stringify(reqBody)
            });

            if (response.ok) {
            // if (true) {
                console.log('Score submitted successfully');
                const durationInMs = new Date() - new Date(candidateAssessmentDetails.startedAt)
                const hours = Math.floor(durationInMs/(1000*60*60))
                const minutes = Math.floor((durationInMs%(1000*60*60))/(1000*60))
                
                // navigate('/assessmentsubmit', { state: { assessmentName: Assessment.AssessmentTitle } });
                navigate('/assessmentsubmit', {replace:true, state: { assessmentName: Assessment.AssessmentTitle } });
                await axios.patch(`${process.env.REACT_APP_API_URL}/candidate-assessment/update/${candidateAssessmentId}`,{isActive:false,status:"completed", endedAt:new Date(),completionTime:`${hours}M ${minutes}S`})
            } else {
                console.error('Failed to submit score');
            }
        } catch (error) {
            console.error('Error submitting score:', error);
        }
    };

    const handleQuestionClick = (sectionIndex, questionIndex) => {
    
        setSelectedSection(sectionIndex);
        setCurrentQuestionIndex(questionIndex);
        setShowMainContent(true);
        setShowPreview(false);
        const score = calculateAnsweredQuestionsScore();
        setAnsweredQuestionsScore(score);
    };

    const [assessmentCompleted, setAssessmentCompleted] = useState(false);
    const [hasPreviewed] = useState(false);

    const togglePreviewMode = () => {
        const score = calculateAnsweredQuestionsScore();
        setAnsweredQuestionsScore(score);
        setPreviewMode((prevMode) => !prevMode);
        setShowMainContent((prevMode) => !prevMode);
        setShowPreview((prevMode) => !prevMode);
    };

    useEffect(() => { 
            const timer = setInterval(() => {
            setTimeSpent((prevTimeSpent) => {
                if (prevTimeSpent < totalTimeAllowed) {
                    return prevTimeSpent + 1;
                } else {
                    clearInterval(timer);
                    return prevTimeSpent;
                }
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const calculateAnsweredQuestionsScore = () => {
        let score = 0;
        
        assessment.assessmentId.Sections.forEach((section, sectionIndex) => {
            section.Questions.forEach((question, questionIndex) => {

                if (answerLater[sectionIndex][questionIndex]) {
                    return;
                }
                
                const userAnswerIndex = selectedOptions[sectionIndex][questionIndex];
                 let userAnswerText;
                if (typeof userAnswerIndex !== "string"){
                    
                    userAnswerText = question.snapshot.options[userAnswerIndex];
                    
                }
                else{

                    userAnswerText = userAnswerIndex
                }
                

                let correctAnswerText = question.snapshot.correctAnswer;
        
                try {
                    if (/^[0-9+\-*/().\s]+$/.test(correctAnswerText)) {
                        correctAnswerText = evaluate(correctAnswerText);
                       
                    } else {
                        console.warn(`Skipping evaluation for non-numeric expression: ${correctAnswerText}`);
                    }
                } catch (error) {
                    console.error(`Error evaluating expression for question at section ${sectionIndex}, question ${questionIndex}:`, error);
                }

                let isCorrect = false;
                if (question.snapshot.questionType === "MCQ") {
                    isCorrect = userAnswerText === correctAnswerText;
                    // alert(`mcq: is correct;${isCorrect}`)
                    
                } else if (question.snapshot.questionType === "Number") {
                    const userAnswer = parseFloat(selectedOptions[sectionIndex][questionIndex]);
                    const correctAnswer = parseFloat(correctAnswerText);
                    console.log(`Number Question - User Answer: ${userAnswer}, Correct Answer: ${correctAnswer}`);
                    if (!isNaN(userAnswer) && !isNaN(correctAnswer)) {
                        isCorrect = userAnswer === correctAnswer;
                    } else {
                        console.error(`Invalid number input for question at section ${sectionIndex}, question ${questionIndex}`);
                    }
                } else if (question.snapshot.questionType === "Boolean") {
                    const userAnswer = selectedOptions[sectionIndex][questionIndex].toLowerCase();
                    const correctAnswer = correctAnswerText.toLowerCase();
                    console.log(`Boolean Question - User Answer: ${userAnswer}, Correct Answer: ${correctAnswer}`);
                    isCorrect = userAnswer === correctAnswer;
                } else {
                   
                    // const userAnswerText = selectedOptions[sectionIndex][questionIndex];
                    const autoAssessment = question.AutoAssessment;

                    if (autoAssessment && autoAssessment.enabled) {
                        if (autoAssessment.matching === 'Exact') {
                            isCorrect = isExactMatch(correctAnswerText, userAnswerText);
                        } else if (autoAssessment.matching === 'Contains') {
                            isCorrect = containsMatch(correctAnswerText, userAnswerText);
                        }
                    } else {
                        isCorrect = userAnswerText === correctAnswerText;
                    }
                }
                
                if (isCorrect) {
                    score += question.snapshot.score;
                }
            });
        });
        return score;
    };

    
    useEffect(() => {
        const timeOutEvent = async()=>{
            // const totalTimeAllowed = 30 * 60;
            
        if (timeSpent >= totalTimeAllowed) {
            await axios.patch(`${process.env.REACT_APP_API_URL}/candidate-assessment/update/${candidateAssessmentId}`,{isActive:false,status:"completed",endedAt:new Date()})
            handleSubmit();
            navigate('/timeout');
        }
        }
        timeOutEvent()
    }, [timeSpent, navigate]);


    const handleMCQInputChange = async (optionIndex, questionIndex) => {
        setSelectedOptions(prevSelectedOptions => {
            const newSelectedOptions = [...prevSelectedOptions];
            newSelectedOptions[selectedSection][questionIndex] = optionIndex;
            return newSelectedOptions;
        });
    
        setAnswerLater(prevAnswerLater => {
            const newAnswerLater = [...prevAnswerLater];
            newAnswerLater[selectedSection][questionIndex] = false;
            return newAnswerLater;
        });
    
        setQuestionErrors(prevErrors => {
            const newErrors = [...prevErrors];
            newErrors[questionIndex] = false;
            return newErrors;
        });
    
        const questionId = assessment.assessmentId.Sections[selectedSection].Questions[questionIndex]._id;
        
        try {
            const userSelectedOption = assessment.assessmentId.Sections[selectedSection].Questions[questionIndex].snapshot.options[optionIndex];
            const { correctAnswer, score } = assessment.assessmentId.Sections[selectedSection].Questions[questionIndex].snapshot;
            const { SectionName } = assessment.assessmentId.Sections[selectedSection];
    
            const isCorrect = userSelectedOption === correctAnswer;
    
            // Updating Section-Wise Total Score using Functional Form
            setSetSectionWiseTotalScore(prevScores => {
                const newScores = [...prevScores];
                const previousScore = newScores[selectedSection] || 0;
                // newScores[selectedSection] = previousScore - (isCorrect ? 0 : score) + (isCorrect ? score : 0);
                newScores[selectedSection] = Math.max(0, previousScore + (isCorrect ? score : -score));
                return newScores;
            });
    
            // Updating Total Assessment Score using Functional Form
            setTotalScore(prevTotalScore => {
                return sectionWiseTotalScore.reduce((total, sectionScore) => total + sectionScore, 0);
            });
    
            console.log("correct answer:", correctAnswer, " | user selected option:", userSelectedOption, " | isCorrect:", isCorrect);
    
            const Answers = {
                questionId,
                answer: userSelectedOption,
                isCorrect,
                score: isCorrect ? score : 0,
                isAnswerLater: false
            };
    
            const passScore = assessment.assessmentId.passScoreBy ==="Overall"  ? assessment.assessmentId.passScore :   assessment.assessmentId.Sections[selectedSection].Questions.reduce(
                (total, question) => total + question.snapshot.score, 0
            );
            // alert(`pass Score ${passScore}`)
    
            // Using a callback inside setSetSectionWiseTotalScore to ensure latest state
            setSetSectionWiseTotalScore(prevScores => {
                const updatedSectionTotalScore = prevScores[selectedSection];
    
                // Compute new assessmentTotalScore inside the callback to ensure correct values
                const newAssessmentTotalScore = prevScores.reduce((total, sectionScore) => total + sectionScore, 0);
    
                const reqBody = {
                    SectionName,
                    Answers,
                    sectionTotalScore: updatedSectionTotalScore,
                    assessmentTotalScore: newAssessmentTotalScore,
                    passScore,
                    sectionResult: updatedSectionTotalScore >= passScore ? "pass" : "fail"
                };
    
                console.log("reqBody", reqBody);
    
                // Make API request after state updates are applied
                axios.patch(
                    `${process.env.REACT_APP_API_URL}/candidate-assessment/${candidateAssessmentId}/sections/${selectedSection}/questions/${questionId}`,
                    reqBody
                );
    
                return prevScores; // Return unchanged prevScores as setSetSectionWiseTotalScore needs a return value
            });
            // setSetSectionWiseTotalScore(()=>{
            //     return assessment.assessmentId.Sections.map((section,sectionIndex)=>{
            //         let sectionScore=0;
            //         section.Questions.forEach((question,questionIndex)=>{
            //             const userAnswerIndex = selectedOptions[sectionIndex]?.[questionIndex]
            //             const userAnswerText = typeof userAnswerIndex === "number" ? question.snapshot.options[userAnswerIndex]:userAnswerIndex
            //             const correctAnswerText = question.snapshot.correctAnswer;
            //             const isCorrect = userAnswerText === correctAnswerText 
            //             if (isCorrect){
            //                 sectionScore+= question.snapshot.score 
            //             }
            //         })
            //         return sectionScore
            //     })
            // })
    
        } catch (error) {
            console.error('Error updating answer:', error);
        }
    };
    

    const handlePrevSectionClick = async() => {
        if (selectedSection > 0) {
            setSelectedSection(selectedSection - 1);
            setCurrentQuestionIndex(0);
            await axios.patch(`${process.env.REACT_APP_API_URL}/candidate-assessment/update/${candidateAssessmentId}`,{lastSelectedSection:selectedSection-1})
        }
    };

    const [questionErrors, setQuestionErrors] = useState([]);

    const handleCheckboxChange = async(questionIndex) => {
        setAnswerLater(prevAnswerLater => {
            const newAnswerLater = [...prevAnswerLater];
            newAnswerLater[selectedSection][questionIndex] = !newAnswerLater[selectedSection][questionIndex];
            return newAnswerLater;
        });

        // Clear the error for the current question when the checkbox is checked
        setQuestionErrors(prevErrors => {
            const newErrors = [...prevErrors];
            newErrors[questionIndex] = false;
            return newErrors;
        });

        if (!answerLater[selectedSection][questionIndex]){

        

        const {SectionName}= assessment.assessmentId.Sections[selectedSection]
        const questionId = assessment.assessmentId.Sections[selectedSection].Questions[questionIndex]._id

        const Answers = {
            questionId,
            answer:"",
            isCorrect:null,
            score:0,
            isAnswerLater:true
        }
const passScore = assessment.assessmentId.Sections[selectedSection].Questions.reduce((total, question) => total + question.snapshot.score, 0);
        const reqBody = {
            SectionName,
            Answers,
            totalScore,
            passScore,
            sectionResult:totalScore > passScore ? "pass":'fail'
        }
        console.log("reqBody",reqBody)
            await axios.patch(`${process.env.REACT_APP_API_URL}/candidate-assessment/${candidateAssessmentId}/sections/${selectedSection}/questions/${questionId}`,reqBody)
    }

    



    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const calculateAnsweredQuestions = () => {
        let answeredQuestionsCount = 0;
        selectedOptions.forEach(section => {
            section.forEach(answer => {
                // Check if the answer is not null or undefined
                if (answer !== null && answer !== undefined && answer !== "") {
                    answeredQuestionsCount++;
                }
            });
        });
        return answeredQuestionsCount;
    };

    

    const QuestionHeader = ({ answeredQuestionsCount, totalQuestionsAcrossSections, remainingTime }) => (
        <div className="flex justify-between items-center mb-3">
            <p className="text-2xl font-semibold">Questions</p>
            <div className="flex gap-4 items-center">
                <p>
                    <span className="text-gray-500">Questions: </span>
                    <span className="font-semibold text-xl">{answeredQuestionsCount}/{totalQuestionsAcrossSections}</span>
                </p>
                <p>
                    {/* <span>remaining time:{remainingTime}</span> */}
                    <span className="text-gray-500">Time Remaining: </span>
                    <span className="font-semibold text-lg">{formatTime(remainingTime)}</span>
                </p>
            </div>
        </div>
    );

    const renderQuestion = () => {
        if (!assessment || selectedSection === null) return null;

        const section = assessment.assessmentId.Sections[selectedSection];
        if (!section || !section.Questions || !section.Questions[currentQuestionIndex]) {
            return <p className="text-red-500">Question data is not available.</p>;
        }
        
        const totalQuestionsAcrossSections = assessment.assessmentId.Sections.reduce((total, section) => total + section.Questions.length, 0);

        // const totalTimeAllowed = 30 * 60;
        const remainingTime = totalTimeAllowed - timeSpent;
        const answeredQuestionsCount = calculateAnsweredQuestions();


        const areAllQuestionsAnswered = () => {
            const errors = section.Questions.map((_, questionIndex) => {
                if (answerLater[selectedSection][questionIndex]) {
                    return false;
                }
                return !(selectedOptions[selectedSection][questionIndex] !== null && selectedOptions[selectedSection][questionIndex] !== undefined && selectedOptions[selectedSection][questionIndex] !== "");
            });
            setQuestionErrors(errors);
            return errors.every(error => !error);
        };

        const handleNextSectionClick = async() => {
            if (!areAllQuestionsAnswered()) {
                return;
            }
            if (selectedSection < assessment.assessmentId.Sections.length - 1) {
                setSelectedSection(selectedSection + 1);
                setCurrentQuestionIndex(0);
                // Clear errors when moving to the next section
                setQuestionErrors([]);
                await axios.patch(`${process.env.REACT_APP_API_URL}/candidate-assessment/update/${candidateAssessmentId}`,{lastSelectedSection:selectedSection+1})
            } else {
                handleFinishClick();
                setAssessmentCompleted(true); // Mark assessment as completed
            }
        };

        if (!assessment) {
            return <div>Loading...</div>;
        }


        const handleInputChange = async (value, questionIndex, event) => {
            event?.stopPropagation(); // Prevent event bubbling
        
            // Update state for selected options
            setSelectedOptions((prevSelectedOptions) => {
                const newSelectedOptions = [...prevSelectedOptions];
                newSelectedOptions[selectedSection][questionIndex] = value;
                return newSelectedOptions;
            });
        
            // Uncheck the "Answer at a later time" checkbox
            setAnswerLater((prevAnswerLater) => {
                const newAnswerLater = [...prevAnswerLater];
                newAnswerLater[selectedSection][questionIndex] = false;
                return newAnswerLater;
            });
        
            // Clear the error for the current question
            setQuestionErrors((prevErrors) => {
                const newErrors = [...prevErrors];
                newErrors[questionIndex] = false;
                return newErrors;
            });
        
            // Validate input length
            const { CharLimits = { min: 0, max: 250 } } = assessment.assessmentId.Sections[selectedSection].Questions[questionIndex];
            const { min, max } = CharLimits;
        
            setValidationErrors((prevErrors) => {
                const newErrors = [...prevErrors];
                newErrors[questionIndex] = value.length < min || value.length > max;
                return newErrors;
            });
        
            // Retrieve question details
            const section = assessment.assessmentId.Sections[selectedSection];
            const { SectionName } = section;
            const question = section.Questions[questionIndex];
            const { _id: questionId, snapshot } = question;
        
            const userAnswer = value;
            const { correctAnswer, score } = snapshot;
            const isCorrect = userAnswer === correctAnswer;
        
            const Answers = {
                questionId,
                answer: userAnswer,
                isCorrect,
                score: isCorrect ? score : 0,
                isAnswerLater: false, 
            };
        
            const passScore = assessment.assessmentId.passScoreBy==="Overall" ? assessment.assessmentId.passScore  :  section.Questions.reduce((total, question) => total + question.snapshot.score, 0);
            // const passScore = section.Questions.reduce((total, question) => total + question.snapshot.score, 0);
        
            
            setSetSectionWiseTotalScore((prevScores) => {
                const newScores = [...prevScores];
                newScores[selectedSection] = (prevScores[selectedSection] || 0) + (isCorrect ? score : 0);
        
                
                setTotalScore((prevTotal) => {
                    return newScores.reduce((total, sectionScore) => total + sectionScore, 0);
                });
        
                return newScores;
            });
        
            const reqBody = {
                SectionName,
                Answers,
                totalScore: sectionWiseTotalScore[selectedSection],
                passScore,
                sectionResult: sectionWiseTotalScore[selectedSection] >= passScore ? "pass" : "fail",
            };
        
            
            debouncedUpdate(reqBody, questionId);
        };
        
const debouncedUpdate = debounce(async (reqBody, questionId) => {
    try {
        await axios.patch(
            `${process.env.REACT_APP_API_URL}/candidate-assessment/${candidateAssessmentId}/sections/${selectedSection}/questions/${questionId}`,
            reqBody
        );
    } catch (error) {
        console.error("Error updating assessment:", error);
    }
}, 300);

        return (
            <div className="mt-14 mx-5">
                <QuestionHeader
                    answeredQuestionsCount={answeredQuestionsCount}
                    totalQuestionsAcrossSections={totalQuestionsAcrossSections}
                    remainingTime={remainingTime}
                />
                {/* <div className="grid grid-cols-8 gap-3 border rounded h-[28.5rem]"> */}
                <div className="grid grid-cols-8 gap-3  rounded h-[34rem] my-3">
                    {/* side bar */}
                    <div className="col-span-1">
                        <div className="border border-custom-blue rounded h-full">
                            {assessment.assessmentId.Sections.map((section, index) => {
                                
                                const answeredCount = selectedOptions[index]?.filter(option => option !== null && option !== undefined && option !== "").length;
                                return (
                                    <div
                                        key={index}
                                        className={`flex justify-between px-2 text-sm py-2 ${index === selectedSection ? 'bg-custom-blue text-white' : ''}`}
                                    >
                                        <p className="truncate w-24" title={section.SectionName}>
                                            {section.SectionName} 
                                        </p>
                                        <p>{`${answeredCount}/${section.Questions.length}`}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    {/* main content */}
                    <div className="col-span-7 overflow-y-auto">
                        {section.Questions.map((question, questionIndex) => (
                            <div key={questionIndex} className="bg-white shadow-md rounded px-3 py-1 mb-3  mr-3 border relative">
                                <div className="absolute top-1 right-2 flex items-center">
                                    <input
                                    id={`answer-later-${questionIndex}`}
                                        type="checkbox"
                                        checked={answerLater[selectedSection][questionIndex] || false}
                                        onChange={() => handleCheckboxChange(questionIndex)}
                                        className="mr-2"
                                        disabled={selectedOptions[selectedSection][questionIndex] !== null && selectedOptions[selectedSection][questionIndex] !== undefined && selectedOptions[selectedSection][questionIndex] !== ""}
                                    />
                                    <label htmlFor={`answer-later-${questionIndex}`}>Answer at a later time</label>
                                </div>
                                <p className="font-semibold text-md mb-1">{`${questionIndex + 1}. ${question.snapshot.questionText}`}</p>
                                {question.Hint && (
                                    <p className="text-gray-500 mb-2 text-xs">Hint: {question.Hint}</p>
                                )}
                                {question.snapshot.questionType === "MCQ" && (
                                    <div className="grid grid-cols-2 gap-2 mb-1 text-sm mx-4">
                                        {question.snapshot.options.map((option, index) => (
                                            <div key={index} className="flex items-center ">
                                                <input
                                                id={`${option}-${index}`}
                                                    type="radio"
                                                    // name={`question-${selectedSection}-${questionIndex}`} // Ensure unique name for each question
                                                    value={index}
                                                    className="mr-2"
                                                    onChange={() => handleMCQInputChange(index, questionIndex)} // Pass index instead of option
                                                    checked={selectedOptions[selectedSection][questionIndex] === index} // Check if the index is selected
                                                    required={!answerLater[selectedSection][questionIndex]}
                                                    disabled={answerLater[selectedSection][questionIndex]}
                                                />
                                                <label htmlFor={`${option}-${index}`}>{option}</label>
                                            </div>
                                        ))}
                                    </div>
                                )}

{/* {question.snapshot.questionType === "Short Text" && ( */}
                                {(question.snapshot.questionType === "Short Text(Single line)" || question.snapshot.questionType === "Short Text") && (
                                    <div>
                                        <textarea
                                            className="w-full p-2 border rounded focus:outline-none"
                                            rows={3}
                                            placeholder="Enter your answer here"
                                            value={selectedOptions[selectedSection][questionIndex] || ""}
                                            onChange={(e) => handleInputChange(e.target.value, questionIndex)}
                                            required={!answerLater[selectedSection][questionIndex]}
                                            minLength={question.CharLimits?.min}
                                            maxLength={question.CharLimits}
                                            // maxLength={question.CharLimits?.max}
                                            readOnly={answerLater[selectedSection][questionIndex]}
                                        />
                                        <div className="text-gray-500 text-xs mt-1 flex justify-end">
                                            {selectedOptions[selectedSection][questionIndex]?.length || 0}/{question.CharLimits} char
                                        </div>
                                        {validationErrors[questionIndex] && (
                                            <p className="text-red-500 -mt-5 text-sm">Answer must be between {question.CharLimits} characters.</p>
                                        )}
                                    </div>
                                )}

                                {question.snapshot.questionType === "Long Text" && (
                                    <div>
                                        <textarea
                                            className="w-full p-2 border rounded"
                                            rows={10}
                                            placeholder="Enter your answer here"
                                            value={selectedOptions[selectedSection][questionIndex] || ""}
                                            onChange={(e) => handleInputChange(e.target.value, questionIndex)}
                                            required={!answerLater[selectedSection][questionIndex]}
                                            minLength={question.CharLimits}
                                            maxLength={question.CharLimits}
                                            readOnly={answerLater[selectedSection][questionIndex]}
                                        />
                                        <div className="text-gray-500 text-xs mt-1 flex justify-end">
                                            {selectedOptions[selectedSection][questionIndex]?.length || 0}/{question.CharLimits} char
                                        </div>
                                        {validationErrors[questionIndex] && (
                                            <p className="text-red-500 -mt-5 text-sm">Answer must be between {question.CharLimits} and {question.CharLimits.max} characters.</p>
                                        )}
                                    </div>
                                )}

                                {question.QuestionType === "Programming Questions" && (
                                    <div>
                                        <select
                                            value={selectedLanguage}
                                            onChange={(e) => setSelectedLanguage(e.target.value)}
                                            className="mb-4"
                                        >
                                            <option value="">Select Language</option>
                                            <option value="javascript">JavaScript</option>
                                            <option value="python">Python</option>
                                            <option value="java">Java</option>
                                        </select>
                                        <textarea
                                            className="w-full p-2 border rounded"
                                            rows={15}
                                            placeholder="Enter your code here"
                                            value={selectedOptions[selectedSection][questionIndex] || question.snapshot.ProgrammingDetails?.[0]?.code || ""}
                                            onChange={(e) => handleInputChange(e.target.value, questionIndex)}
                                            required={!answerLater[selectedSection][questionIndex]}
                                            readOnly={answerLater[selectedSection][questionIndex]}
                                        />
                                        <button
                                            className="bg-blue-400 text-black py-1 px-7 rounded hover:bg-blue-500 mt-4"
                                            onClick={handleRunClick}
                                        >
                                            Run
                                        </button>
                                        <button className="bg-blue-400 text-black py-1 px-7 rounded hover:bg-blue-500 mt-4">
                                            Submit
                                        </button>
                                    </div>
                                )}

                                {question.snapshot.questionType === "Number" && (
                                    <input
                                        type="number"
                                        className="w-full p-2 border rounded mb-2"
                                        value={selectedOptions[selectedSection][questionIndex] || ""}
                                        onChange={(e) => handleInputChange(Number(e.target.value) || "", questionIndex)}
                                        required={!answerLater[selectedSection][questionIndex]}
                                        readOnly={answerLater[selectedSection][questionIndex]}
                                    />
                                )}

                                {question.snapshot.questionType === "Boolean" && (
                                    <div className="flex items-center gap-2">
                                        {question.snapshot.correctAnswer.toLowerCase() === "true" || question.snapshot.correctAnswer.toLowerCase() === "false" ? (
                                            <>
                                                <input
                                                    type="radio"
                                                    name={`boolean-question-${selectedSection}-${questionIndex}`}
                                                    value="true"
                                                    onChange={(e) => handleInputChange(e.target.value, questionIndex)}
                                                    checked={selectedOptions[selectedSection][questionIndex] === "true"}
                                                    required={!answerLater[selectedSection][questionIndex]}
                                                    readOnly={answerLater[selectedSection][questionIndex]}
                                                    
                                                />
                                                <label>True</label>
                                                <input
                                                    type="radio"
                                                    name={`boolean-question-${selectedSection}-${questionIndex}`}
                                                    value="false"
                                                    onChange={(e) => handleInputChange(e.target.value, questionIndex)}
                                                    checked={selectedOptions[selectedSection][questionIndex] === "false"}
                                                    required={!answerLater[selectedSection][questionIndex]}
                                                    readOnly={answerLater[selectedSection][questionIndex]}
                                                />
                                                <label>False</label>
                                            </>
                                        ) : (
                                            <>
                                                <input
                                                    type="radio"
                                                    name={`boolean-question-${selectedSection}-${questionIndex}`}
                                                    value="yes"
                                                    onChange={(e) => handleInputChange(e.target.value, questionIndex)}
                                                    checked={selectedOptions[selectedSection][questionIndex] === "yes"}
                                                    required={!answerLater[selectedSection][questionIndex]}
                                                />
                                                <label>Yes</label>
                                                <input
                                                    type="radio"
                                                    name={`boolean-question-${selectedSection}-${questionIndex}`}
                                                    value="no"
                                                    onChange={(e) => handleInputChange(e.target.value, questionIndex)}
                                                    checked={selectedOptions[selectedSection][questionIndex] === "no"}
                                                    required={!answerLater[selectedSection][questionIndex]}
                                                />
                                                <label>No</label>
                                            </>
                                        )}
                                    </div>
                                )}

                                {questionErrors[questionIndex] && !answerLater[selectedSection][questionIndex] && (
                                    <p className="text-red-500 mt-2 text-sm">This question is not answered.</p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="AssessmentTestSubmit">
                    {selectedSection > 0 && (
                        <button className="text-white py-1 px-7 rounded footer-button" onClick={handlePrevSectionClick}>Prev</button>
                    )}
                    {/* mansoor, dont remove this button */}
                    <button></button>
                    <div>
                        <button
                            className="text-white py-1 px-7 rounded mr-3 footer-button"
                            onClick={handleNextSectionClick}
                        >
                            {selectedSection === assessment.assessmentId.Sections.length - 1 ? "Finish" : "Next"}
                        </button>
                        {assessmentCompleted && showMainContent && (
                            <button
                                onClick={togglePreviewMode}
                                className="bg-custom-blue text-white py-1 px-7 rounded mt-4"
                                disabled={hasPreviewed}
                            >
                                Preview
                            </button>
                        )}
                    </div>
                    
                </div>
            </div>
        );
    };

    const renderPreview = ({ assessment, selectedOptions, score, questionScores = [] }) => {
        const totalQuestionsAcrossSections = assessment.assessmentId.Sections.reduce((total, section) => total + section.Questions.length, 0);
        // const totalTimeAllowed = 30 * 60;
        const remainingTime = totalTimeAllowed - timeSpent;
        const answeredQuestionsCount = calculateAnsweredQuestions();

        return (
            <div className="mx-14 mt-14">
                <QuestionHeader
                    answeredQuestionsCount={answeredQuestionsCount}
                    totalQuestionsAcrossSections={totalQuestionsAcrossSections}
                    remainingTime={remainingTime}
                />
                <div className="border p-3 rounded-md">
                    <p className="font-semibold text-lg mb-2">Answered Questions Score: {answeredQuestionsScore}</p>
                </div>
                <div className="border p-3 rounded-md mt-5">
                    {assessment.assessmentId.Sections.map((section, sectionIndex) => (
                        <div key={sectionIndex} >
                            <h3 className="font-semibold text-lg mb-2">{section.SectionName}</h3>
                            <div className="grid grid-cols-2 gap-4 mb-2">
                                {section.Questions.map((question, questionIndex) => {
                                    const questionScore = questionScores[sectionIndex]?.[questionIndex]?.score || 0;
                                    return (
                                        <div
                                            key={questionIndex}
                                            className={`cursor-pointer ${question.QuestionType === "MCQ" ? "col-span-1 " : "col-span-2"}`}
                                            onClick={() => handleQuestionClick(sectionIndex, questionIndex)}
                                        >
                                            <div className="flex">
                                                <p className="font-semibold">{`${questionIndex + 1}.`}</p>
                                                <div className="ml-2">
                                                    {answerLater[sectionIndex][questionIndex] ? (
                                                        <p className="ml-4 text-red-500">Answer at a later time.</p>
                                                    ) : question.snapshot.questionType === "MCQ" ? (
                                                        selectedOptions[sectionIndex][questionIndex] !== null &&
                                                            selectedOptions[sectionIndex][questionIndex] !== undefined ? (
                                                            <p className="ml-4 text-custom-blue">
                                                                {/* {`${String.fromCharCode(97 + selectedOptions[sectionIndex][questionIndex])}) ${question.snapshot.options[selectedOptions[sectionIndex][questionIndex]]}`} */}
                                                                {` ${question.snapshot.options[selectedOptions[sectionIndex][questionIndex]]}`}
                                                            </p>
                                                        ) : (
                                                            <p className="ml-4 text-red-500">Answer at a later time.</p>
                                                        )
                                                    ) : (
                                                        <p className={`ml-4 ${selectedOptions[sectionIndex][questionIndex] ? 'text-custom-blue' : 'text-red-500'}`}>
                                                            {selectedOptions[sectionIndex][questionIndex] || "Answer at a later time"}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="AssessmentTestSubmit">
                    {/* mansoor, dont remove this button */}
                    <button></button>
                    <button
                        className="text-white py-1 px-7 rounded footer-button"
                        onClick={handleSubmit}
                    >
                        Submit
                    </button>
                </div>

            </div>
        );
    
    
    };

    return (
        <div className="container mx-auto">
            <div className="bg-white fixed top-0 w-full z-50">
                <div className="mx-auto">
                    <div className="flex justify-center items-center border-gray-100 py-3 px-10">
                        <img src={logo} alt="Logo" className="w-28" />
                    </div>
                </div>
                
            </div>
         
            {!assessment ? (
                <div>Loading assessment...</div>
            ) : assessment.assessmentId.Sections.length === 0 ? <div className="w-full h-full flex justify-center items-center bg-red-500"><p>No questions in this assessment</p></div>: (
                <>
                    {showMainContent && renderQuestion()}
                    {(showPreview && assessment.assessmentId.Sections) && renderPreview({ assessment, selectedOptions, score: calculateScore })}                                        
                </>
            )}
        </div>

    );
};

export default AssessmentQuestion;