import React, { useState } from 'react';
import { IoIosCloseCircleOutline } from "react-icons/io";
import { VscFilterFilled } from "react-icons/vsc";
import Switch from 'react-switch';
import { FaAngleDown } from "react-icons/fa6";

const sampleQuestionsList = [
  {
    id: 1,
    question: 'What are the key features of Java?',
    level: 'Easy',
    mandatory: true,
    answer: `Platform independence; Java uses the Java Virtual Machine (JVM) to allow programs to run on platforms to run on any platform without modifications.
    Object-Oriented: Java uses principles like inheritance, encapsulation, polymorphism, and abstraction.
    Robust: Java has strong memory management, exception handling, and garbage collection mechanisms.
    Secure: Features like bytecode verification and a secure runtime environment prevent vulnerabilities.
    Multithreaded: Java supports multithreading, enabling concurrent execution of tasks.
    High Performance: While Java is an interpreted language, the Just-In-Time(JIT) compiler improves performance.`,
    isChecked: true,
  },
  {
    id: 2,
    question: 'What are the key features of Java?',
    level: 'Easy',
    mandatory: false,
    answer: `Platform independence; Java uses the Java Virtual Machine (JVM) to allow programs to run on platforms to run on any platform without modifications.
    Object-Oriented: Java uses principles like inheritance, encapsulation, polymorphism, and abstraction.
    Robust: Java has strong memory management, exception handling, and garbage collection mechanisms.
    Secure: Features like bytecode verification and a secure runtime environment prevent vulnerabilities.
    Multithreaded: Java supports multithreading, enabling concurrent execution of tasks.
    High Performance: While Java is an interpreted language, the Just-In-Time(JIT) compiler improves performance.`,
    isChecked: false,
  },
  {
    id: 3,
    question: 'What are the key features of Java?',
    level: 'Easy',
    mandatory: false,
    answer: `Platform independence; Java uses the Java Virtual Machine (JVM) to allow programs to run on platforms to run on any platform without modifications.
    Object-Oriented: Java uses principles like inheritance, encapsulation, polymorphism, and abstraction.
    Robust: Java has strong memory management, exception handling, and garbage collection mechanisms.
    Secure: Features like bytecode verification and a secure runtime environment prevent vulnerabilities.
    Multithreaded: Java supports multithreading, enabling concurrent execution of tasks.
    High Performance: While Java is an interpreted language, the Just-In-Time(JIT) compiler improves performance.`,
    isChecked: false,
  },
];

const tabsList = [
  {
    id: 1,
    tab: "Suggested Questions"
  },
  {
    id: 2,
    tab: "My Questions List"
  }
]

const SuggestedQuestions = ({ close, closePlusPopup }) => {
  const [questionsList, setQuestionsList] = useState(sampleQuestionsList);
  const [tab, setTab] = useState(1)
  const [filterSkillsList] = useState([
    'Java',
    'HTML',
    'React.js',
    'CSS',
    'MongoDB',
    '1-2 Years',
  ]);

  //   const [selected]
  const [selectedSkill, setSelectedSkill] = useState(null)

  const onClickClose = () => {
    close();
    closePlusPopup();
  };

  const onChangeQuestionStatus = (id) => {
    setQuestionsList((prev) =>
      prev.map((question) =>
        question.id === id
          ? { ...question, mandatory: !question.mandatory }
          : question
      )
    );
  };

  const onClickTab = (id) => {
    setTab(id)
  }

  const onClickQuestionsListSkill = (index) => {
    setSelectedSkill(prev => prev === index ? null : index)
  }

  const onChangeQuestionCheckbox = (id) => {
    setQuestionsList(prev =>
      prev.map(question => question.id === id ? { ...question, isChecked: !question.isChecked } : question)
    )
  }

  const displayData = () => {
    switch (tab) {
      case 1: return ReturnSuggestedQuestionsData()
      case 2: return MyQuestionListData()
    }
  }

  const ReturnSuggestedQuestionsData = () => {
    return (
      <ul className="h-[67vh] p-4 flex flex-col gap-3 overflow-auto">
        {questionsList.map((question) => (
          <li
            key={question.id}
            className="w-full border-[1px] border-[gray] rounded-md"
          >
            <div className="p-b-none flex justify-between border-[gray] border-b-[1px] w-full h-[50px]">
              <div className="flex items-center p-2 w-full">
                <input
                  checked={question.isChecked}
                  type="checkbox"
                  className="mr-[20px] w-5 h-5 cursor-pointer"
                  onChange={() => onChangeQuestionCheckbox(question.id)}
                />
                <h2 className="font-medium">
                  {question.id}. {question.question}
                </h2>
              </div>
              <div className="flex items-center">
                <div className="h-full flex items-center p-2 border-collapse b-none border-[1px] border-l-[gray]">
                  <p className="bg-[#75ea75] px-3 py-1 font-medium b-none rounded-sm">
                    {question.level}
                  </p>
                </div>
                <div className="h-full flex flex-col justify-center items-center p-2 border-[1px] border-collapse b-none border-r-[gray] border-l-[gray]">
                  <span>Mandatory</span>
                  <Switch
                    checked={question.mandatory}
                    onChange={() => onChangeQuestionStatus(question.id)}
                    //   onColor="#4CAF50"
                    //   offColor="#ccc"
                    // onColor='#4DA1A9'
                    onColor='#227a8a'
                    handleDiameter={20}
                    height={20}
                    width={40}
                  />
                </div>

                <div className="p-2">
                  <button className="bg-[#227a8a] px-6 py-1 text-white font-medium rounded-md">
                    Add
                  </button>
                </div>
              </div>
            </div>
            <div className="p-2 ml-[35px] w-[77%]">
              <p className="text-[gray] text-justify">
                <span className="text-[black] font-medium">Answer: </span>
                {question.answer}
              </p>
            </div>
          </li>
        ))}
      </ul>

    );

  }

  const MyQuestionListData = () => {
    return (
      <ul className='flex flex-col  gap-2 p-4'>
        {filterSkillsList.map((skill, index) =>
          <li onClick={() => onClickQuestionsListSkill(index)} key={index} className='cursor-pointer bg-[#227a8a] text-white w-full rounded-md px-4 py-3 flex flex-col justify-between'>
            <div className='flex justify-between'>
              <p>{skill}</p>
              <div className='flex gap-4 items-center'>
                <p>No.of Questions(2)</p>
                <FaAngleDown />
              </div>
            </div>
            {selectedSkill === index && <h1>content</h1>}
          </li>
        )}

      </ul>
    )
  }

  return (
    <div className="fixed bg-[gray] top-0 right-0 bottom-0 w-full flex items-center justify-center">
      <div className="w-[90%] h-[95%] bg-white flex flex-col gap-3">
        {/* header section */}
        <div className="bg-[#227a8a] p-2 flex items-center justify-between text-white">
          <h3 className="font-semibold text-lg">Question Bank</h3>
          <span className="text-[1.2rem] cursor-pointer" onClick={onClickClose}>

            <IoIosCloseCircleOutline />
          </span>
        </div>
        {/* filter section */}
        <ul className='flex justify-between w-full'>
          <div className='flex gap-6 px-4'>
            {tabsList.map(each => <li className={`${tab === each.id ? 'border-b-[3px] border-[#227a8a]' : ""} cursor-pointer`} key={each.id} onClick={() => onClickTab(each.id)}>{each.tab}</li>)}
          </div>
          {tab === 2 && <button className='pr-4 text-[1.1rem] text-[#227a8a]'>Add Question</button>}

        </ul>
        <div className="flex justify-between items-center px-4">
          <div className="flex items-center gap-4">
            <h2 className="font-semibold">Filters applied - </h2>
            <ul className="flex gap-4">
              {filterSkillsList.map((filterItem, index) => (
                <button
                  className="border-[1px] text-[#227a8a] border-[#227a8a] p-2"
                  key={index}
                >
                  {filterItem}
                </button>
              ))}
            </ul>
          </div>
          <div className='border-[1px] border-[black]'>
            <span className="text-[1.5rem] "><VscFilterFilled /></span>
          </div>
        </div>
        <div>
          {displayData()}
        </div>
      </div>
    </div>
  )
};
export default SuggestedQuestions;
