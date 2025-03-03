import React, {useLayoutEffect,  useState } from "react";
import CandidateMiniTab from "./MiniTabs/Candidate";
import InterviewsMiniTabComponent from "./MiniTabs/Interviews";
import SkillsTabComponent from "./MiniTabs/Skills";
import OverallImpressions from "./MiniTabs/OverallImpressions";
import { useNavigate } from "react-router-dom";
import { useCustomContext } from "../../../../../Context/Contextfetch";
import {ClipLoader} from 'react-spinners'
import { IoMdClose,IoIosCloseCircleOutline } from "react-icons/io";
import { BiSolidUpArrow } from "react-icons/bi";
import { TbArrowsMaximize } from "react-icons/tb";
import { FiMinimize } from "react-icons/fi";

import {
  SchedulerQuestionsValidation,
  validateOverallImpression,
  ValidateSkills,
} from "../../../../../utils/feedbackValidation";

import Popup from "reactjs-popup";
import axios from "axios";
import toast from "react-hot-toast";
import { FaCaretUp } from "react-icons/fa";

const tabsList = [
  {
    id: 1,
    tab: "Candidate",
  },
  {
    id: 2,
    tab: "Interview Questions",
  },
  {
    id: 3,
    tab: "Skills",
  },
  {
    id: 4,
    tab: "Overall Impression",
  },
];

const Feedback = ({ page, closePopup }) => {
  const [tab, setTab] = useState(1);
  const [isFormValid,setIsFormValid]=useState(false)
  const navigate = useNavigate();
  const {popupVisibility,setPopupVisibility,feedbackCloseFlag,setFeedbackCloseFlag}=useCustomContext()
  const {
   setPage,
    feedbackTabErrors,
    setFeedbackTabError,
  } = useCustomContext();

  const [skillsTabData, setSkillsTabData] = useState([
    {
      id: 1,
      category: "Mandatory skills",
      // required:true,
      skillsList: [
        { name: "Apex Programming", rating: 0, note: "", notesBool: false, required: true, error: false },
        { name: "SOQL/SOSL", rating: 0, note: "", notesBool: false, required: true, error: false },
        { name: "API Integration", rating: 0, note: "", notesBool: false, required: true, error: false },
      ],
    },
    {
      id: 2,
      category: "Optional skills",
      // required:false,
      skillsList: [
        { name: "Javascript", rating: 0, note: "", notesBool: false, required: false },
        { name: "Mobile Development", rating: 0, note: "", notesBool: false, required: false, },
        { name: "Salesforce CPQ", rating: 0, note: "", notesBool: false, required: false, },
      ],
    },
    {
      id: 3,
      category: "Technical skills",
      // required:true,
      skillsList: [
        { name: "Coding", rating: 0, note: "", notesBool: false, required: true, error: false },
        { name: "Problem-Solving", rating: 0, note: "", notesBool: false, required: true, error: false },
        { name: "API Integration", rating: 0, note: "", notesBool: false, required: true, error: false },
      ],
    },
    {
      id: 4,
      category: "Communication",
      // required:true,
      skillsList: [{ name: "Mobile Teamwork", rating: 0, note: "", notesBool: false, required: true, error: false }],
    },
  ])


  const [overallImpressionTabData, setOverallImpressionTabData] = useState({
    rating: 0,
    note: "",
    recommendation: "",
    notesBool: false,
    required: true,
    error: false
  })

  const [SchedulerSectionData, setSchedulerSectionData] = useState([
    {
      id: 1,
      question:
        "1.Explain the difference between an interface and an abstract class in Java.",
      answer:
        "An interface in Java is a reference type that can only contain abstract methods(prior to Java 8) and static/final variables.",
      mandatory: true,
      rating: 0,
      note: "",
      isAnswered: "",
      notesBool: false,
      isLiked: "none",
      whyDislike: "",
      error: false,
    },
    {
      id: 2,
      question:
        "2.Explain the difference between an interface and an abstract class in Java.",
      answer:
        "An interface in Java is a reference type that can only contain abstract methods(prior to Java 8) and static/final variables.",
      mandatory: true,
      rating: 0,
      note: "",
      isAnswered: "",
      notesBool: false,
      isLiked: "none",
      whyDislike: "",
      error: false,
    },
    {
      id: 3,
      question:
        "3.Explain the difference between an interface and an abstract class in Java.",
      answer:
        "An interface in Java is a reference type that can only contain abstract methods(prior to Java 8) and static/final variables.",
      mandatory: true,
      rating: 0,
      note: "",
      isAnswered: "",
      notesBool: false,
      isLiked: "none",
      error: false,
      whyDislike: "",
    },
    {
      id: 4,
      question:
        "4.Explain the difference between an interface and an abstract class in Java.",
      answer:
        "An interface in Java is a reference type that can only contain abstract methods(prior to Java 8) and static/final variables.",
      mandatory: false,
      rating: 0,
      note: "",
      isAnswered: "",
      notesBool: false,
      isLiked: "none",
      error: false,
      whyDislike: "",
    },
  ])


  const [customQuestionPopupLoader,setCustomQuestionPopupLoader]=useState(false)

 
  let { interviewQuestion, skills, overallImpression } = feedbackTabErrors;

  useLayoutEffect(()=>{
    setIsFormValid(true)
  },[])

  const areAllValidationsMet = () =>
    interviewQuestion && skills && overallImpression;

  const PrepareFormData = () => {
    const questionFeedback = SchedulerSectionData.map((question) => ({
      questionId: question.id,

      candidateAnswer:{
        answerType:question.isAnswered,
        submittedAnswer:question.answer
      },
      interviewerFeedback:{
        liked:question.isLiked,
        dislikeReason: question.isLiked==="disliked"  ? question.whyDislike:"",
        note:question.note
      },
      
    }));
  
    const skills = skillsTabData.flatMap((category) =>
      category.skillsList
        .filter((skill) => skill.rating > 1)
        .map((skill) => ({
          skillType: category.category,
          skillName: skill.name,
          rating: skill.rating,
          note: skill.note,
        }))
    );
  
    return {
      tenantId:"tenantId-1",
      interviewId:"interview-1",
      candidateId:"candidate-1",
      interviewerId:"interviewerId-1",
      skills: skills,
      questionFeedback,
      generalComments:"general comments",
      overallImpression: {
        overallRating: overallImpressionTabData.rating,
        recommendation: overallImpressionTabData.recommendation,
        note: overallImpressionTabData.note,
      },
    };
  };
  
  const onClickSubmit = async () => {
    const updatedOverallImpression = validateOverallImpression(
      overallImpressionTabData,
      setOverallImpressionTabData
    );

    const isValid = updatedOverallImpression && interviewQuestion && skills;
    setIsFormValid(isValid)
    setFeedbackTabError((prev) => ({
      ...prev,
      overallImpression: updatedOverallImpression,
    }));

    if (!isValid) {
      const alertMessages = [];
      if (!interviewQuestion)
        alertMessages.push("Interview Questions ");
      if (!skills) alertMessages.push("Skills");
      if (!updatedOverallImpression)
        alertMessages.push("Overall Impression");
    } else {
      const data = PrepareFormData();
      console.log('data',data)
      try {
      console.log("form data", data);
      const url = `${process.env.REACT_APP_URL}/feedback/create`;
      const response = await axios.post(url, data);
      console.log("response from frontend", response);
      if (response.data.success) {
        toast.success("Feedback Submitted!")
      }
      else{
        toast.error(response.data.error.message|| "something went wrong")
      }
    } catch (error) {
       toast.error(error.response.statusText || 'something went wrong') 
    }
    }
  };
  const handleValidationForTab = () => {
    if (tab === 2) {
      const isValid = SchedulerQuestionsValidation(
        SchedulerSectionData,
        setSchedulerSectionData
      );
      setFeedbackTabError((prev) => ({ ...prev, interviewQuestion: isValid }));
    } else if (tab === 3) {
      const isValid = ValidateSkills(skillsTabData, setSkillsTabData);
      setFeedbackTabError((prev) => ({ ...prev, skills: isValid }));
    }
  };
  
  const onClickNextButton = () => {
    handleValidationForTab();

    setTab((prev) => prev <= 3 && prev + 1);
  };

  const displayData = () => {
    switch (tab) {
      case 1: return <CandidateMiniTab skillsTabData={skillsTabData} tab={tab} page={page}/>;
      case 2: return <InterviewsMiniTabComponent SchedulerSectionData={SchedulerSectionData} setSchedulerSectionData={setSchedulerSectionData} tab={tab} page={page}  closePopup={closePopup}/>;
      case 3: return <SkillsTabComponent setSkillsTabData={setSkillsTabData}  skillsTabData={skillsTabData} tab={tab} page={page} />;
      case 4:  return <OverallImpressions overallImpressionTabData={overallImpressionTabData} setOverallImpressionTabData={setOverallImpressionTabData}  tab={tab} page={page} />;
      default: return null;
    }
  };

  const onClickMaximizeScreen =()=>{
    setPage("Home");
    setPopupVisibility(true)
  }


  const onClickPreviewButton =()=>{
    navigate("/interview-feedback-preview", { state: { tab: null } })
  }


  const onClickCloseCustomPop =async(closePopup,close)=>{
    setTimeout(()=>{
      close()
      closePopup()
    },0)
  }


  //sections

  const ReturnTabsSection = () => {
    return (
      <ul className="flex items-center gap-8 cursor-pointer py-1 px-8">
        {tabsList.map((EachTab) => (
          <li
            style={{
              borderBottom: tab === EachTab.id ? "2px solid #227a8a" : "",
            }}
            onClick={() => setTab(EachTab.id)}
            key={EachTab.id}
          >
            {EachTab.tab}
          </li>
        ))}
      </ul>
    );
  };

  const PopupConfirmation = () => {
    return (
      <Popup
        trigger={
          <button className="bg-none b-none text-lg"><IoIosCloseCircleOutline/></button>
        }
        arrow={false}
        offsetX={-130}
        closeOnEscape={false}
      >
        {(close) => (
          <div className="mt-3 relative backdrop-blur-md  bg-white text-black w-[300px] rounded-sm shadow-lg text-center p-4">
            <FaCaretUp className="absolute  transform right-0 top-[-17px] text-2xl bg-transparent" />                
            <div className="flex flex-col gap-3 ">
              <h2 className="font-semibold">Are you sure to close the form?</h2>
              <div className="text-center flex gap-4 justify-center">
                <button

                  className="border-[1px] border-gray-900 rounded-sm px-2 font-medium"
                  onClick={() => close()} 
                >
                  No
                </button>
                {customQuestionPopupLoader ? <button className="bg-[#227a8a] text-white px-2 py-1 rounded-md "
                   >
                  
                    <ClipLoader size={20} color="#ffffff" />
                   
                </button> :
                <button className="border-none bg-custom-blue px-2 rounded-sm text-white cursor-pointer font-medium"
                onClick={() => onClickCloseCustomPop(closePopup, close)}
                >Yes</button>}
              </div>
            </div>
          </div>
        )}
      </Popup>
    );
  };
  

  const ValidationMessageFunction =()=>{
    return <div className=" flex  gap-6 items-start mx-8 p-4 border-[1px] rounded-md border-[#8080808b]">
        <div className="rounded-md bg-[#D93025] p-[0.8px]"><IoMdClose className="text-white"/></div>
        <div className="mt-[-5px]">
          <h2 className="font-semibold">Validation Error</h2>
          <p className="text-[gray]">Some required fields are missing . Please complete them before submitting.</p>
        </div>
    </div>
  }


  return (
    <div className={`flex flex-col justify-between gap-2 ${page==="Home"?"h-[89vh]":"h-[100vh]"}  `}    >
      <div className=" px-8 flex items-center justify-between border-b-2 border-[#8080807f]">
        <h1 className=" pt-4  text-[#227a8a] text-xl font-semibold">Interview Feedback</h1>
        <div className="flex gap-8">
          {feedbackCloseFlag &&(
            <div  className="flex gap-8">
              {!popupVisibility ?<button  onClick={onClickMaximizeScreen}><TbArrowsMaximize/></button>:<button onClick={()=>{
                setPopupVisibility(false)
                setPage("Popup")
                }}><FiMinimize/></button> }
              <PopupConfirmation/>
            </div>
          )}
        </div>
      </div>
    { !isFormValid &&  ValidationMessageFunction()}
      <ReturnTabsSection />
      <div  className={`${page==="Home"?"px-8 py-4 ":"p-4"}  border-[#8080807a] mb-8 h-[67vh] overflow-y-auto border-2 border-solid rounded-md mx-8 `} >
        {displayData()}
      </div>
      <div className="next-button--container flex justify-end py-1 pr-8 gap-4 border-t-[1px] border-[gray]">
        {tab === 4 && (
          <>
            <button disabled={!areAllValidationsMet()}  onClick={onClickPreviewButton}  className={`bg-white text-[#227a8a] border-[1px] border-[#227a8a] py-[0.5rem] px-[2rem] rounded-lg ${!areAllValidationsMet() && "cursor-not-allowed"}`}>Preview</button>
            <button  onClick={onClickSubmit} className="bg-[#227a8a] text-white py-[0.5rem] px-[2rem] rounded-lg">Submit</button>
          </>
        )}
        {tab <= 3 && (
          <button  onClick={onClickNextButton}  className="bg-[#227a8a] text-white py-[0.5rem] px-[2rem] rounded-lg">Next</button>
        )}
      </div>
    </div>
  );
};

export default Feedback;
