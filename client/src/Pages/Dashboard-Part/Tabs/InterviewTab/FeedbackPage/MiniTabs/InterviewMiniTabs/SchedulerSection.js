import React, { useState, useRef, useCallback } from "react";
import { FaAngleDown, FaAngleUp } from "react-icons/fa";
import Popup from "reactjs-popup";
import { useCustomContext } from "../../../../../../../Context/Contextfetch";
import { SlLike } from "react-icons/sl";
import { SlDislike } from "react-icons/sl";
import { IoIosCloseCircleOutline } from "react-icons/io";
const dislikeOptions = [
  { value: "Not Skill-related", label: "Not Skill-related" },
  { value: "Wrong experience level", label: "Wrong experience level" },
  { value: "Job role mismatch", label: "Job role mismatch" },
  { value: "Unclear question", label: "Unclear question" },
  { value: "Incorrect answer", label: "Incorrect answer" },
  { value: "Too difficult", label: "Too difficult" },
  { value: "Too basic", label: "Too basic" },
];

const SchedulerSectionComponent = ({setSchedulerSectionData,SchedulerSectionData, tab }) => {

  const {page}= useCustomContext()
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [dislikeQuestionId, setDislikeQuestionId] = useState("");
  const questionRef = useRef();

  const onChangeRadioInput = (questionId, value) => {
    setSchedulerSectionData((prev) =>
      prev.map((question) =>
        question.id === questionId
          ? { ...question, isAnswered: value, error: false }
          : question
      )
    );
  };
  const onChangeDislikeRadioInput = (questionId, value) => {
    setSchedulerSectionData((prev) =>
      prev.map((question) => {
        if (question.id === questionId) {
          return { ...question, whyDislike: value, isLiked: false };
        }
        return question;
      })
    );
  };

  const handleDislikeToggle = (id) => {
    setDislikeQuestionId((prev) => (prev === id ? null : id));
    setSchedulerSectionData((prev) =>
      prev.map((q) => (q.id === id ? { ...q, isLiked: "disliked" } : q))
    );
  };

  const handleLikeToggle = useCallback((id) => {
    setSchedulerSectionData((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, isLiked: "liked" } : q
      )
    );
    if (dislikeQuestionId === id) setDislikeQuestionId(null);
  }, [dislikeQuestionId]);

  const onClickAddNote = useCallback((id) => {
    setSchedulerSectionData((prev) =>
      prev.map((q) => (q.id === id ? { ...q, notesBool: !q.notesBool } : q))
    );
  },[setSchedulerSectionData]);

  const onClickDeleteNote =useCallback((id) => {
    setSchedulerSectionData((prev) =>
      prev.map((q) => (q.id === id ? { ...q, notesBool: false, note: "" } : q))
    );
  },[setSchedulerSectionData])

  const onChangeInterviewQuestionNotes = (questionId, notes) => {
    setSchedulerSectionData((prev) =>
      prev.map((question) =>
        question.id === questionId ? { ...question, note: notes } : question
      )
    );
  };

  const onClickQuestionItem =(question)=>{
    selectedQuestion === question.id
    ? setSelectedQuestion(null)
    : setSelectedQuestion(question.id);
  }

  //sections
  const DisLikeSection = React.memo(({ each }) => {
    return (
      <div className="border border-gray-500 w-full p-3 rounded-md">
        <div className="flex justify-between w-full mb-4">
          <h1>Tell us more :</h1>
          <button onClick={() => setDislikeQuestionId(null)}><IoIosCloseCircleOutline/></button>
        </div>
        <ul className="flex flex-wrap gap-3">
          {dislikeOptions.map((option) => (
            <li key={option.value} className="flex items-center gap-x-2 w-[30%]">
              <input
                onChange={(e) => onChangeDislikeRadioInput(each.id, e.target.value)}
                name={`dislike-input-${each.id}`}
                checked={each.whyDislike === option.value}
                id={`${option.value.toLowerCase().replace(/ /g, "-")}-${each.id}`}
                type="radio"
                value={option.value}
              />
              <label
                className="cursor-pointer"
                htmlFor={`${option.value.toLowerCase().replace(/ /g, "-")}-${each.id}`}
              >
                {option.label}
              </label>
            </li>
          ))}
        </ul>

      </div>
    );
  });
  

  const SharePopupSection = () => {
    return (
      <Popup
        trigger={<button className="text-[#227a8a] font-bold">Share</button>}
        arrow={true}
        on={"hover"}
        position={"top center"}
        offsetY={5}
        arrowStyle={{
          color: "gray", 
        }}
      >
        <p className="bg-[gray] text-xs text-white px-2 p-1 rounded-md">
          share with candidate
        </p>
      </Popup>
    );
  };

  const RadioGroupInput = React.memo(({ each }) => {
    return (
      <div className="flex rounded-md">
        <p className="w-[200px] font-bold text-gray-700">
          Response Type {each.mandatory && <span className="text-[red]">*</span>}
        </p>
        <div
  className={`w-full flex gap-x-8 gap-y-2 ${
    page === "Home" ? "flex-row" : "flex-col"
  }`}>
  {["Not Answered", "Partially Answered", "Fully Answered"].map((option) => (
    <span key={option} className="flex items-center gap-2">
      <input
        checked={each.isAnswered === option}
        value={option}
        name={`isAnswered-${each.id}`} 
        type="radio"
        id={`isAnswered-${each.id}-${option}`}
        onChange={(e) => onChangeRadioInput(each.id, e.target.value)}
        className="whitespace-nowrap"
      />
      <label
        htmlFor={`isAnswered-${each.id}-${option}`}
        className="cursor-pointer"
      >
        {option}
      </label>
    </span>
  ))}
</div>

      </div>
    );
  });

  return (
    <div className="">
      <div className="flex items-start gap-4 mt-4">
        <p> <b>Note:</b> </p>
        <p className="para-value text-gray-500">  This question was selected by the organizer during scheduling. Questions marked in <span className="font-bold text-[red]">Red</span> are mandatory and must be answered by the candidates, while questions marked in{" "}<span className="font-bold text-green-600">Green</span> are optional.</p>
      </div>
      <ul className="h-[45vh] overflow-auto pr-4 flex flex-col gap-4 mt-4">
        {SchedulerSectionData.map((each) => (
          <li className={`rounded-md w-full   cursor-pointer border-[1px] ${each.mandatory ? "border-[red]":" border-[green]"}`} ref={questionRef}key={each.id}>
            <div  className="px-2 pt-3 pb-3 flex items-center justify-between cursor-pointer transition-transform duration-300s ease-in-out"onClick={()=>onClickQuestionItem(each)}  >
              <p >{each.question}</p>
              <span> {selectedQuestion === each.id ? <FaAngleUp /> : <FaAngleDown />}</span>
            </div>
            {selectedQuestion === each.id && (
              <div className="p-2 pb-2" >
                <p className="para-value text-gray-500">{each.answer}</p>
                <div className="w-full flex  justify-between items-start my-4 gap-8">
                  <RadioGroupInput each={each} />

                  <div className="flex  items-center gap-4 ">
                    {!each.notesBool && (
                      <button
                        className={`${page==="Home"?"py-[0.2rem] px-[0.8rem]":"p-1 "} question-add-note-button cursor-pointer font-bold  text-[#227a8a] bg-transparent rounded-[0.3rem] shadow-[0_0.2px_1px_0.1px_#227a8a] border border-[#227a8a]`}
                        onClick={() => onClickAddNote(each.id)}
                      >
                        Add a Note
                      </button>
                    )}
                    {each.notesBool && (
                      <button
                      onClick={()=>onClickDeleteNote(each.id)}
                      className={`${page==="Home"?"py-[0.2rem] px-[0.8rem]":"p-1 "} question-add-note-button cursor-pointer font-bold  text-[#227a8a] bg-transparent rounded-[0.3rem] shadow-[0_0.2px_1px_0.1px_#227a8a] border border-[#227a8a]`}>
                        Delete Note
                      </button>
                    )}
                    <SharePopupSection />
                    <span
                      className={`${
                        each.isLiked ==="liked" ? "text-green-700" : ""
                      } transition-transform hover:scale-110 duration-300 ease-in-out`}
                      onClick={() => handleLikeToggle(each.id)}
                    >
                      <SlLike/>
                    </span>
                    <span
                      className={`${
                        each.isLiked==="disliked" ? "text-red-500" : ""
                      } transition-transform hover:scale-110 duration-300 ease-in-out`}
                      style={{ cursor: "pointer" }}
                      onClick={() => handleDislikeToggle(each.id)}
                    >
                      <SlDislike/>
                    </span>
                  </div>
                </div>
                {each.notesBool ? (
  page === "Home" ? (
    <div className="flex justify-start mt-4">
      <label htmlFor="note-input" className="w-[200px]">Note</label>
      <div className="w-full relative mr-5 rounded-md h-[80px]">
        <input
          className="w-full outline-none b-none border border-gray-500 p-2 rounded-md"
          id="note-input"
          type="text"
          value={each.note}
          onChange={(e) =>
            onChangeInterviewQuestionNotes(
              each.id,
              e.target.value.slice(0, 250)
            )
          }
          placeholder="Add your note here"
        />
        <span className="absolute right-[1rem] bottom-[0.2rem]  text-gray-500">
          {each.note?.length || 0}/250
        </span>
      </div>
    </div>
  ) : page === "Popup" ? (
    <div className="flex justify-start mt-4">
    <label htmlFor="note-input" className="w-[200px]">
      Note
    </label>
    <div className="w-full relative mr-5 rounded-md h-[100px]">
      <textarea
      rows="3"
        className="w-full outline-none b-none border border-gray-500 p-2 rounded-md"
        id="note-input"
        type="text"
        value={each.note}
        onChange={(e) =>
          onChangeInterviewQuestionNotes(
            each.id,
            e.target.value.slice(0, 250)
          )
        }
        placeholder="Add your note here"
      ></textarea>
      <span className="absolute right-[1rem] bottom-[0.2rem]  text-gray-500">
        {each.note?.length || 0}/250
      </span>
    </div>
  </div>
  ) : null 
) : null}

                {dislikeQuestionId === each.id && (
                  <DisLikeSection each={each} />
                )}
              </div>
            )}
            {each.error && (
              <p className="text-red-500 text-sm">
                This mandatory question must be answered.
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default React.memo(SchedulerSectionComponent)
