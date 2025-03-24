import React, { forwardRef, useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import "react-phone-input-2/lib/style.css";

const NewInterviewRequest = forwardRef(({onClose, onOutsideClick }, ref) => {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [skillsData, setSkillsData] = useState(() => {
    const storedSkillsData = localStorage.getItem("skillsData");

    return storedSkillsData ? JSON.parse(storedSkillsData) : [];
  });

  //storeing CandidateData
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phonenumber: "",
    qualification: "",
    college: "",
    position: "",
    experience: "",
    firstname: "",
    image: "",
    skills: [],
    gender: "",
    date: "",
  });

  const [candidateData, setCandidateData] = useState(() => {
    const storecandidateData = localStorage.getItem("candidateData");
    return storecandidateData ? JSON.parse(storecandidateData) : [];
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    // Check if the changed field is 'gender'
    if (name === "gender") {
      localStorage.setItem("gender", value);
    }
  };

  const maxNumber = 10;

  const [images, setImages] = useState([]);
  const onChange = (imageList, addUpdateIndex) => {
    setImages(imageList);
    setFormData((prevState) => ({
      ...prevState,
      image: imageList.length > 0 ? imageList[0].data_url : "",
    }));
  };

  const handlecandidateChange = (e) => {
    const candidate = e.target.value;
    setFormData((prevState) => ({
      ...prevState,
      candidate: candidate,
    }));
  };

  const [errors, setErrors] = useState({});

  const handleSubmit = (e, shouldSchedule) => {
    e.preventDefault();

    const updatedCandidateData = [...candidateData, formData];
    setCandidateData(updatedCandidateData);
    localStorage.setItem("candidateData", JSON.stringify(updatedCandidateData));
    setFormData({
      name: "",
      email: "",
      phonenumber: "",
      qualification: "",
      college: "",
      position: "",
      experience: "",
      image: "",
    });
    onClose();
  };

  // navigate(path);

  const FilteredData = () => {
    return skillsData.filter(
      (user) =>
        user.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.jobdescription &&
          user.jobdescription
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (user.maxexperience &&
          user.maxexperience
            .toLowerCase()
            .includes(searchQuery.toLowerCase())) ||
        (user.skills &&
          user.skills.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (user.additionalnotes &&
          user.additionalnotes
            .toLowerCase()
            .includes(searchQuery.toLowerCase()))
    );
  };

  const filteredData = FilteredData();

  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !event.target.classList.contains("add-new-button")
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // skills table
  const [rows, setRows] = useState([
    { skill: "", experience: "", expertise: "" },
    { skill: "", experience: "", expertise: "" },
    { skill: "", experience: "", expertise: "" },
  ]);
  const [currentRow, setCurrentRow] = useState(0);
  const [currentColumn, setCurrentColumn] = useState(0);
  const [fieldsRequired, setFieldsRequired] = useState(true);

  const updateRows = (newRows) => {
    setRows(newRows);
    localStorage.setItem("rows", JSON.stringify(newRows));
  };

  const handleSelectChange = (event, columnName) => {
    const { textContent } = event.target.options[event.target.selectedIndex];

    const emptyRowIndex = rows.findIndex(
      (row) => row.skill === "" || row.experience === "" || row.expertise === ""
    );
    if (emptyRowIndex === -1) {
      alert(" Please create a new row to add more data.");
      return;
    }

    if (rows.length > 1) {
      setFieldsRequired(false);
    } else {
      setFieldsRequired(true);
    }

    const updatedRows = [...rows];
    updatedRows[currentRow][columnName] = textContent;

    setRows(updatedRows);
    event.target.value = "";

    setCurrentColumn((prevColumn) => {
      const nextColumn = (prevColumn + 1) % 3;
      if (nextColumn === 0) {
        setCurrentRow((prevRow) => prevRow + 1);
      }
      return nextColumn;
    });

    const updatedFormData = { ...formData };
    if (!updatedFormData.skills) {
      updatedFormData.skills = [];
    }
    if (!updatedFormData.skills[currentRow]) {
      updatedFormData.skills[currentRow] = {};
    }
    updatedFormData.skills[currentRow][columnName] = textContent;
    setFormData(updatedFormData);
    updateRows(updatedRows);
  };

  const addRow = () => {
    setRows((prevRows) => [
      ...prevRows,
      { skill: "", experience: "", expertise: "" },
    ]);
  };

  //    date

  const [startDate, setStartDate] = useState(null);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [showTimeInputs, setShowTimeInputs] = useState(false);

  const handleDateChange = (date) => {
    setStartDate(date);
    setShowTimeInputs(true);
  };

  const handleStartTimeChange = (e) => {
    setStartTime(e.target.value);
  };

  const handleEndTimeChange = (e) => {
    setEndTime(e.target.value);
  };

  const [selectedGender, setSelectedGender] = useState("");
  const [showDropdowngender, setShowDropdownGender] = useState(false);
  const genders = ["Male", "Female", "Others"];

  const toggleDropdowngender = () => {
    setShowDropdownGender(!showDropdowngender);
  };

  const handleGenderSelect = (gender) => {
    setSelectedGender(gender);
    setFormData((prevData) => ({
      ...prevData,
      gender: gender,
    }));
    setShowDropdownGender(false);
  };

  const [selectedCollege, setSelectedCollege] = useState("");
  const [showDropdownCollege, setShowDropdownCollege] = useState(false);
  const [containerHeight, setContainerHeight] = useState("");

  const toggleDropdown = () => {
    setShowDropdownCollege(!showDropdownCollege);
  };

  const handleCollegeSelect = (college) => {
    setSelectedCollege(college);
    setContainerHeight("auto"); // Update the selected college state

    // Update the formData state with the selected college
    setFormData((prevFormData) => ({
      ...prevFormData,
      college: college,
    }));

    setShowDropdownCollege(false); // Close the dropdown
  };

  const [selectedQualification, setSelectedQualification] = useState("");
  const [showDropdownQualification, setShowDropdownQualification] =
    useState(false);

  const handleQualificationSelect = (qualification) => {
    setSelectedQualification(qualification.name);
    setFormData((prevData) => ({
      ...prevData,
      qualification: qualification.name, // Update formData with selected qualification
    }));
    setShowDropdownQualification(false);
  };

  const toggleDropdownQualification = () => {
    setShowDropdownQualification(!showDropdownQualification);
  };

  const [textareaValue, setTextareaValue] = useState("");
  const handleChangedescription = (event) => {
    setTextareaValue(event.target.value);
    // Adjust textarea height dynamically based on content
    event.target.style.height = "auto";
    event.target.style.height = event.target.scrollHeight + "px";
  };

  return (
    <div
    ref={ref}
      className="fixed inset-0 bg-black bg-opacity-15 z-50"
    >
      <div
        style={{ width: "40%" }}
        className="fixed inset-y-0 right-0 z-50 bg-white shadow-lg transition-transform duration-5000 transform"
      >
        {/* Header */}
        <div className="fixed top-0 w-full bg-white border-b z-50">
          <div className="flex justify-between items-center p-4">
            <h2 className="text-lg font-bold">New Interview Request</h2>
            <button onClick={onClose} className="focus:outline-none">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="fixed top-16 bottom-16 overflow-auto p-4 w-full text-sm">
          <form className="group" onSubmit={handleSubmit} noValidate>
           
              <div>
                {/* Title */}
                <div className="flex gap-5 mb-5 ">
                  <div>
                    <label
                      htmlFor=" title"
                      className="block font-medium leading-6 text-gray-900 w-36"
                    >
                      Title
                    </label>
                  </div>
                  <div className="flex-grow  border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full">
                    <p className="text-gray-400">Senior Salesforce Developer</p>
                  </div>
                </div>
                {/*Interview Type */}
                <div className="flex gap-5 mb-5">
                  <div>
                    <label
                      htmlFor="name"
                      className="block font-medium leading-6 text-gray-900 w-36"
                    >
                      Interview Type
                    </label>
                  </div>
                  <div className="flex-grow  border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full">
                    <p className="text-gray-400">Face-to-Face</p>
                  </div>
                </div>
                {/*  Position */}
                <div className="flex gap-5 mb-5">
                  <div>
                    <label
                      htmlFor="position"
                      className="block text-sm font-medium leading-6 text-gray-900  w-36"
                    >
                      Position
                    </label>
                  </div>
                  <div className="flex-grow  border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full">
                    <p className="text-gray-400">Senior Salesforce Developer</p>
                  </div>
                </div>
                {/*  Candidate */}
                <div className="flex gap-5 mb-5">
                  <div>
                    <label
                      htmlFor="candidate"
                      className="block font-medium leading-6 text-gray-900  w-36"
                    >
                      Candidate
                    </label>
                  </div>

                  <div className="flex-grow  border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full">
                    <p className="text-gray-400"> Jyothi</p>
                  </div>
                </div>
                {/*dateandtime*/}

                <div className="flex gap-5 mb-5">
                  <div>
                    <label
                      htmlFor="title"
                      className="block mb-2 font-medium text-gray-900 w-36"
                    >
                      Date&Time
                    </label>
                  </div>
                  <div className="flex-grow  border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full">
                    <p className="text-gray-400"> 22/05/2024 11:50 AM</p>
                  </div>
                </div>

                {/*  Duration */}
                <div className="flex gap-5 mb-5">
                  <div>
                    <label
                      htmlFor="title"
                      className="block mb-2 font-medium text-gray-900  w-36"
                    >
                      Duration
                    </label>
                  </div>
                  <div className="flex-grow  border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full">
                    <p className="text-gray-400">60 min</p>
                  </div>
                </div>

                {/* Description/Instructions */}
                <div className="flex gap-5 mb-5">
                  <div>
                    <label
                      htmlFor="jobdescription"
                      className="block mb-2 font-medium text-gray-900  w-36"
                    >
                      Description/Instructions
                    </label>
                  </div>

                  <div className="flex-grow border-b border-gray-300 focus:border-black focus:outline-none mb-5 w-full">
                    <p className="text-gray-400">
                      Prepare for the interview by reviewing the job description
                      and researching the company. Dress appropriately and
                      arrive on time.During the interview, be confident,listen
                      carefully,and provide clear,concise answers.
                    </p>
                  </div>
                </div>
              </div>

           {/* Footer */}
           <div className="footer-buttons flex justify-end">
              <button
                type="submit"
                style={{
                  backgroundColor: "green",
                  color: "white",
                  border: "gray",
                }}
                className="footer-button"
              >
                Accept
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
});

export default NewInterviewRequest;