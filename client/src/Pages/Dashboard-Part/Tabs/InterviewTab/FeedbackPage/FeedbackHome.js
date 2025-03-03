import React, { useEffect } from "react";
// import Header from "../../../../../components/Navbar/Header/Header";
import Feedback from "./Feedback";
import { useCustomContext } from "../../../../../Context/Contextfetch";

const FeedbackHome = () => {
  const { page,setPage,feedbackCloseFlag,setFeedbackCloseFlag }=useCustomContext()


  useEffect(() => {
    document.title = "Job Portal - Interview Feedback";
    setPage("Home") 
    setFeedbackCloseFlag(false)
  }, []);

  return (
    <div>
      {/* <Header /> */}
      <div className="lg:text-md">
     <Feedback page={page} />
     </div>
    </div>
  );
};

export default FeedbackHome;
