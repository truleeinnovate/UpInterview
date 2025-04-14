const mongoose = require('mongoose');

const formatDateTime = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  let hour = now.getHours();
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12;
  hour = hour ? hour : 12;
  return `${day}/${month}/${year} ${hour}:${minute} ${ampm}`;
};

const mockInterviewSchema = new mongoose.Schema({
  // title: String,
  skills: [
    {
        skill: String,
        experience: String,
        expertise: String,
    },
],
 
  // interviewer: String,
  // duration: String,
  // category: String, 
  // instructions: String,
  jobDescription: String,
  Role:String,
  candidateName: String,
  higherQualification: String,
  currentExperience: String,
  // interviewType: String,
  technology: String,
  // interviewType: String, // instant or schedule later
  // status: String,
  rounds: 
  {
     roundTitle: String,
     interviewMode: String,  
     interviewerType: String, // outsourced default
     duration: String,
     instructions: String,
     interviewType:String,  // instant or schedule later
     interviewers: [
         { type: mongoose.Schema.Types.ObjectId, ref: 'Contacts' }
     ],
     status: String, // draft - if accept - scheduled, if request sent then (request sent)
     dateTime: String,
  },
  resume: String,//in future we have to work on resume saving functionality
  createdDate: { type: String, default: formatDateTime },
  modifiedDate: Date,
  modifiedBy: String,
  createdBy: String,
  createdById: String, 
  lastModifiedById: String,
  ownerId: String,
  tenantId: String,
 
    
});

const MockInterview = mongoose.model('MockInterview', mockInterviewSchema);

module.exports = { MockInterview };
