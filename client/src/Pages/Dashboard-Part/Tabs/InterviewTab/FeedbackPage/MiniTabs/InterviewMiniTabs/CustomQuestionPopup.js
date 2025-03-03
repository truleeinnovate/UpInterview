import React from "react";

const CustomQuestionPopup = ({
  closePlusPopup,
  onChangeQuestion,
  interviewQuestionErr,
  interviewerQuestion,
  onChangeAnswer,
}) => {
  return (
    <div>
      <Popup
        trigger={
          <button
            onClick={() => {
              console.log("custom popup clicked");
              closePlusPopup();
            }}
            contentStyle={{
              boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
              background: "white",
              display: "block",
            }}
          >
            Custom Questions
          </button>
        }
        nested
        closeOnDocumentClick={false}
      >
        {(closeNestedPopup) => (
          <div className="fixed top-0 right-0  bg-[#8080803a] bottom-0 w-full   h-[100vh] flex justify-end shadow-lg">
            <div className="w-1/2 h-[100%] bg-white flex flex-col justify-between ">
              <div className="bg-[#227a8a] px-4 py-4 text-white flex justify-between">
                <h2 className="font-bold px-2">Add Question</h2>
                <button
                  className="text-xl"
                  onClick={() => {
                    closeNestedPopup();
                    closePlusPopup();
                  }}
                >
                  {closeIcon}
                </button>
              </div>
              <form className="h-[70vh]  m-auto w-[90%] flex flex-col gap-12">
                <div className="flex w-full gap-8">
                  <div className="w-[20%]">
                    <label htmlFor="customQuestion">Question</label>
                    <span className="text-red-500">*</span>
                  </div>

                  <div className="w-[100%] flex flex-col ">
                    <div className="flex justify-between w-[100%] border-b-2 border-solid-gray">
                      <input
                        onChange={(e) => onChangeQuestion(e)}
                        value={interviewerQuestion.question}
                        id="customQuestion"
                        className="w-[80%] outline-none text-gray-500"
                        type="text"
                        placeholder="Enter your question"
                      />

                      <span>{<RxText />}</span>
                      <span>{<IoCodeSlash />}</span>
                    </div>
                    <div>
                      {interviewQuestionErr.question && (
                        <p className="text-red-500">
                          {interviewQuestionErr.question}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex w-full gap-8">
                  <div className="w-[20%]">
                    <label htmlFor="customQuestion">Answer</label>
                    <span className="text-red-500">*</span>
                  </div>
                  <div className="w-[100%] flex flex-col ">
                    <div className="flex flex-col justify-between w-[100%] ">
                      <div className="flex justify-between w-[100%] border-b-2 border-solid-gray">
                        <input
                          onChange={(e) => onChangeAnswer(e)}
                          value={interviewerQuestion.answer}
                          id="customQuestion"
                          className="w-[80%] outline-none text-gray-500"
                          type="text"
                          placeholder="Enter your answer"
                        />

                        <span>{<RxText />}</span>
                        <span>{<IoCodeSlash />}</span>
                      </div>
                      <div>
                        {interviewQuestionErr.answer && (
                          <p className="text-red-500">
                            {interviewQuestionErr.answer}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between gap-8 ">
                  <label className="w-[20%]">Note</label>
                  <div className="w-[80%] relative ">
                    <textarea
                      onChange={(e) =>
                        setInterviewerQuestion((prev) => ({
                          ...prev,
                          notes: e.target.value.slice(0, 250),
                        }))
                      }
                      value={interviewerQuestion.notes}
                      className="text-gray-500 p-3 w-[100%] h-[150px] border-2 rounded-md outline-none border-gray-400"
                      cols={60}
                    ></textarea>
                    <span className="absolute bottom-[8px] right-[8px] text-gray-500">
                      {interviewerQuestion.notes.length}/250
                    </span>
                  </div>
                </div>
              </form>
              <div className="border-t-2 border-gray-500 flex justify-end p-3 gap-4">
                <button
                  className="bg-[#227a8a] text-white px-6 py-2 rounded-md"
                  onClick={() => onClickSaveCustomQuestion(closeNestedPopup)}
                >
                  Save
                </button>
                <button className="bg-[#227a8a] text-white px-6 py-2 rounded-md">
                  Save & Next
                </button>
              </div>
            </div>
          </div>
        )}
      </Popup>
    </div>
  );
};

export default CustomQuestionPopup;
