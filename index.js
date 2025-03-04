// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const connectDB = require('./db.js');
// // const bcrypt = require('bcrypt');
// const { Candidate } = require('./models/candidate.js');
// const { Position} = require('./models/position.js');
// const TeamMember = require('./models/TeamMembers.js');
// const  Assessment = require('./models/assessment.js');
// const Interview = require('./models/Interview.js');
// const { HigherQualification } = require('./models/higherqualification.js');
// const { University_CollegeName } = require('./models/college.js')
// const { Skills } = require('./models/skills.js');
// const { Company } = require('./models/company.js');
// const { Location } = require('./models/locations.js');
// const { Industry } = require('./models/industries.js');
// const { TenantQuestions  } = require('./models/myQuestionList.js');
// const {MockInterview} = require('./models/mockinterview.js');
// const bodyParser = require('body-parser');
// const { Contacts } = require('./models/Contacts.js')
// const { Users } = require("./models/Users.js")
// const nodemailer = require('nodemailer'); 
// const multer = require('multer'); 
// const { TechnologyMaster} = require('./models/TechnologyMaster.js');
// const { RoleMaster } = require('./models/RoleMaster.js');
// const { LocationMaster } = require('./models/LocationMaster.js');
// const Tabs = require('./models/Tabs.js');
// const Objects = require('./models/Objects.js');
// const Profile = require('./models/Profile.js');
// const Role = require('./models/RolesData.js');
// const SharingSettings = require('./models/SharingSettings');
// const path = require('path');
// const fs = require('fs');
// const SharingRule = require('./models/SharingRules.js');
// const { Organization } = require('./models/Organization.js');
// const Plan = require('./models/Plan.js');
// // const OrganizationPlansData = require('./models/OrganizationPlansData.js');
// // const OrganizationInvoice = require('./models/OrganizationInvoice');
// // const OrganizationInvoiceLines = require('./models/OrganizationInvoiceLines');
// // const OrganizationPayment = require('./models/OrganizationPayment');
// // const OrganizationPaymentCardDetails = require('./models/OrganizationPaymentCardDetails');
// const SharingRulesObject = require('./models/SharingRulesObject');
// const Task = require('./models/task.js');
// const jwt = require('jsonwebtoken');
// const { exec } = require('child_process');
// const cors = require('cors');
// const suggestedQuestionRouter = require('./routes/suggestedQuestionRoute.js')
// const { InterviewQuestion } = require('./models/InterviewQuestion.js');
// const app = express();
// app.use(express.json());
// app.use(bodyParser.json());
// // app.use(cookieParser());for cookies
// app.use(cors({
//   origin: (origin, callback) => {
//     if (!origin || process.env.CORS_ORIGIN.split(',').includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   },
//   credentials: true,
// }));
// connectDB();
// const WebSocket = require('ws');
// const wss = new WebSocket.Server({ port: process.env.WS_PORT || 8080 });

// const SECRET_KEY = 'vpaas-magic-cookie-019af5b8e9c74f42a44947ee0c08572d';
// const TOKEN_EXPIRATION = '1h';
// app.get('/generate-token', (req, res) => {
//   const payload = {
//   };
//   const token = jwt.sign(payload, SECRET_KEY, { expiresIn: TOKEN_EXPIRATION });
//   res.json({ token });
// });

// wss.on('connection', (ws) => {
//   ws.on('message', (message) => {
//     try {
//       const data = JSON.parse(message);
//     } catch (error) {
//       console.error('Error handling message:', error);
//       ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
//     }
//   });
//   ws.on('error', (error) => {
//   });
//   ws.on('close', () => {

//   });
// });

// const broadcastImageData = async (type, id) => {
//   let updatedDocument;
//   switch (type) {
//     case 'candidate':
//       updatedDocument = await Candidate.findById(id);
//       break;
//     case 'team':
//       updatedDocument = await Team.findById(id);
//       break;
//     case 'user':
//       updatedDocument = await Users.findById(id);
//       break;
//     case 'contact':
//       updatedDocument = await Contacts.findById(id);
//       break;
//     default:
//       return;
//   }
//   // if (updatedDocument) {
//   //   broadcastData('image', { type, data: updatedDocument });
//   // }
// };

// // Serve static files from the React app in production
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, './client/build')));

//   // Handle any other requests and serve the React app 
//   app.get('*', (req, res) => {
//     res.sendFile(path.join(__dirname, './client/build', 'index.html'));
//   });
// } 
 
// // // Define a route for the root path
// // app.get('/', (req, res) => {
// //   res.send('Welcome to the Interview App!');
// // });

// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     if (!fs.existsSync('uploads')) {
//       fs.mkdirSync('uploads');
//     }
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname));
//   }
// });

// const upload = multer({ storage: storage });

// // Routes
// app.post('/upload', upload.single('image'), async (req, res) => {
//   try {
//     const { file, body } = req;
//     if (!file && !body.imageUrl) {
//       return res.status(400).send('No file uploaded.');
//     }

//     let updatedDocument;
//     const imageData = file ? {
//       filename: file.filename,
//       path: file.path,
//       contentType: file.mimetype,
//     } : {
//       filename: 'linkedin_image',
//       path: body.imageUrl,
//       contentType: 'image/jpeg',
//     }; 

//     if (body.type === 'candidate') {
//       updatedDocument = await Candidate.findByIdAndUpdate(body.id, { ImageData: imageData }, { new: true });
//     } else if (body.type === 'team') {
//       updatedDocument = await Team.findByIdAndUpdate(body.id, { ImageData: imageData }, { new: true });
//     } else if (body.type === 'user') {
//       updatedDocument = await Users.findByIdAndUpdate(body.id, { ImageData: imageData }, { new: true });
//     } else if (body.type === 'contact') {
//       updatedDocument = await Contacts.findByIdAndUpdate(body.id, { ImageData: imageData }, { new: true });
//     } else {
//       return res.status(400).send('Invalid type.');
//     }

//     if (!updatedDocument) {
//       return res.status(404).send('Document not found.');
//     }

//     res.json({
//       ...updatedDocument.toObject(),
//       imageUrl: `http://localhost:3000/${updatedDocument.ImageData.path.replace(/\\/g, '/')}`
//     });

//     broadcastImageData(body.type, body.id); // Broadcast image data update
//   } catch (error) {
//     console.error('Error uploading image:', error);
//     res.status(500).send('Server error');
//   }
// }); 


// app.delete('/candidate/:id/image', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const candidate = await Candidate.findById(id);
//     if (!candidate) {
//       return res.status(404).send('Candidate not found.');
//     }

//     candidate.ImageData = undefined;
//     await candidate.save();

//     if (candidate.ImageData && candidate.ImageData.path) {
//       fs.unlink(candidate.ImageData.path, (err) => {
//         if (err) {
//           console.error('Error deleting image file:', err);
//         }
//       });
//     }

//     res.status(200).send('Image deleted successfully.');
//     broadcastImageData('candidate', id); // Broadcast image data update
//   } catch (error) {
//     console.error('Error deleting image:', error);
//     res.status(500).send('Server error');
//   }
// });

// app.delete('/team/:id/image', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const team = await Team.findById(id);
//     if (!team) {
//       return res.status(404).send('Team not found.');
//     }

//     const imagePath = team.ImageData?.path;
//     team.ImageData = undefined;
//     await team.save();

//     if (imagePath) {
//       fs.unlink(imagePath, (err) => {
//         if (err) {
//           console.error('Error deleting image file:', err);
//         }
//       });
//     }

//     res.status(200).send('Image deleted successfully.');
//     broadcastImageData('team', id); // Broadcast image data update
//   } catch (error) {
//     console.error('Error deleting image:', error);
//     res.status(500).send('Server error');
//   }
// });
// app.get('/images/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const candidate = await Candidate.findById(id);
//     const team = await Team.findById(id);
//     const user = await Users.findById(id);
//     const contact = await Contacts.findById(id);

//     const image = candidate?.ImageData || team?.ImageData || user?.ImageData || contact?.ImageData;

//     if (image) {
//       res.sendFile(path.resolve(__dirname, image.path));
//     } else {
//       res.status(404).send('Image not found');
//     }
//   } catch (error) {
//     console.error('Error fetching image:', error);
//     res.status(500).send('Server error');
//   }
// });

// // ------------------------------  video call start ------------------------------
// const http = require('http');

// // const socketIo = require('socket.io');

// // const server = http.createServer(app);
// // const PORT = process.env.PORT || 3000;
// // const io = require('socket.io')(3001, { cors: true });



// // const rooms = {};

// // io.on('connection', (socket) => {
// //   socket.on('join-room', (roomId, userId, userName) => {
// //     const isAdmin = !rooms[roomId];
// //     if (!rooms[roomId]) {
// //       rooms[roomId] = { admin: userId, participants: [] };
// //     }
// //     rooms[roomId].participants.push({ userId, userName, muted: false, videoOn: false });
// //     socket.join(roomId);
// //     socket.broadcast.to(roomId).emit('user-connected', { userId, userName, isAdmin: false });
// //     socket.emit('admin-status', { userId, isAdmin });
// //     io.to(roomId).emit('participant-list', rooms[roomId].participants);
// //     socket.on('toggle-mic', (userId, muted) => {
// //       if (rooms[roomId]) {
// //         const participant = rooms[roomId].participants.find(p => p.userId === userId);
// //         if (participant) {
// //           participant.muted = muted;
// //           io.to(roomId).emit('participant-list', rooms[roomId].participants);
// //         }
// //       }
// //     });
// //     socket.on('toggle-video', (userId, videoOn) => {
// //       if (rooms[roomId]) {
// //         const participant = rooms[roomId].participants.find(p => p.userId === userId);
// //         if (participant) {
// //           participant.videoOn = videoOn;
// //           io.to(roomId).emit('participant-list', rooms[roomId].participants);
// //         }
// //       }
// //     });

// //     socket.on('send-message', ({ roomId, userName, message }) => {
// //       const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
// //       const msg = { sender: userName, text: message, time };
// //       io.to(roomId).emit('receive-message', msg);
// //     });

// //     socket.on('disconnect', () => {
// //       if (rooms[roomId] && rooms[roomId].admin === userId) {
// //         io.to(roomId).emit('end-call');
// //         delete rooms[roomId];
// //       } else {
// //         socket.broadcast.to(roomId).emit('user-disconnected', userId);
// //         if (rooms[roomId]) {
// //           rooms[roomId].participants = rooms[roomId].participants.filter(participant => participant.userId !== userId);
// //           io.to(roomId).emit('participant-list', rooms[roomId].participants);
// //         }
// //       }
// //     });

// //     socket.on('sending-signal', (payload) => {
// //       io.to(payload.userToSignal).emit('receiving-signal', { signal: payload.signal, callerID: payload.callerID });
// //     });

// //     socket.on('returning-signal', (payload) => {
// //       io.to(payload.callerID).emit('receiving-returned-signal', { signal: payload.signal, id: socket.id });
// //     });
// //   });
// // });

// // server.listen(PORT, () => {
// //   console.log(`Server is running on port ${PORT}`);
// // });


// // ------------------------------  video call end ------------------------------


// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


// // locations data
// app.get('/locations', async (req, res) => {
//   try {
//     const LocationNames = await LocationMaster.find({}, 'LocationName TimeZone');
//     res.json(LocationNames);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });
// const candidateRoutes = require('./routes/candidateRoutes');
// app.use('/candidate', candidateRoutes);

// const positionRoutes = require('./routes/positionRoutes'); 
// app.use('/position', positionRoutes);  
// // postion end
// // app.get('/assessment', async (req, res) => {
// //   try {
// //     const assessments = await Assessment.find();
// //     res.json(assessments);
// //   } catch (error) {
// //     res.status(500).json({ message: 'Error fetching assessments', error });
// //   }
// // });

// // app.post('/assessment', async (req, res) => {
// //   try {
// //     const {
// //       AssessmentTitle,
// //       AssessmentType,
// //       Position,
// //       Duration,
// //       DifficultyLevel,
// //       NumberOfQuestions,
// //       ExpiryDate,
// //       Sections,
// //       CandidateDetails,
// //       Instructions,
// //       AdditionalNotes,
// //       CreatedBy,
// //       OwnerId,
// //       orgId,
// //       totalScore,
// //       passScore
// //     } = req.body;

// //     const newAssessmentData = {
// //       AssessmentTitle,
// //       AssessmentType,
// //       Position,
// //       Duration,
// //       DifficultyLevel,
// //       NumberOfQuestions,
// //       ExpiryDate,
// //       Instructions,
// //       AdditionalNotes,
// //       CreatedBy,
// //       OwnerId,
// //       orgId,
// //       totalScore,
// //       passScore
// //     };

// //     if (Sections && Sections.length > 0) {
// //       newAssessmentData.Sections = Sections.map(section => ({
// //         ...section,
// //         Questions: section.Questions.map(question => {
// //           const baseQuestion = {
// //             Question: question.Question,
// //             QuestionType: question.QuestionType,
// //             DifficultyLevel: question.DifficultyLevel,
// //             Score: question.Score,
// //             Answer: question.Answer,
// //             Hint: question.Hint || null,
// //             CharLimits: question.CharLimits,
// //           };

// //           if (question.QuestionType === 'MCQ' && question.Options && question.Options.length > 0) {
// //             baseQuestion.Options = question.Options;
// //           }

// //           if (question.QuestionType === 'Programming Questions' && question.ProgrammingDetails && question.ProgrammingDetails.length > 0) {
// //             baseQuestion.ProgrammingDetails = question.ProgrammingDetails;
// //           }

// //           if ((question.QuestionType === 'Short Text(Single line)' || question.QuestionType === 'Long Text(Paragraph)') && question.AutoAssessment?.enabled) {
// //             baseQuestion.AutoAssessment = {
// //               enabled: question.AutoAssessment.enabled,
// //               matching: question.AutoAssessment.matching
// //             };
// //           }

// //           return baseQuestion;
// //         })
// //       }));
// //     }

// //     if (CandidateDetails && (CandidateDetails.includePosition || CandidateDetails.includePhone || CandidateDetails.includeSkills)) {
// //       newAssessmentData.CandidateDetails = CandidateDetails;
// //     }

// //     const assessment = new Assessment(newAssessmentData);
// //     await assessment.save();
// //     res.status(201).json(assessment);
// //   } catch (error) {
// //     res.status(400).json({ error: error.message });
// //   }
// // });

// // app.post('/assessment/:assessmentId/section', async (req, res) => {
// //   try {
// //     const { assessmentId } = req.params;
// //     const assessment = await Assessment.findById(assessmentId);
// //     if (!assessment) {
// //       return res.status(404).json({ error: 'Assessment not found' });
// //     }

// //     // Ensure Sections is initialized as an array
// //     if (!Array.isArray(assessment.Sections)) {
// //       assessment.Sections = [];
// //     }

// //     const section = req.body;
// //     const existingSectionNames = new Set(assessment.Sections.map(s => s.SectionName));
// //     if (!existingSectionNames.has(section.SectionName)) {
// //       assessment.Sections.push(section);
// //       await assessment.save();
// //       console.log("Section added to assessment:", section);
// //     } else {
// //       console.log("Section already exists:", section.SectionName);
// //     }

// //     const newSection = assessment.Sections[assessment.Sections.length - 1];
// //     res.status(201).json(newSection);
// //   } catch (error) {
// //     console.error("Error adding section:", error);
// //     res.status(400).json({ error: error.message });
// //   }
// // });


// // app.post('/assessment/:assessmentId/section/:sectionId/question', async (req, res) => {
// //   try {
// //     const { assessmentId, sectionId } = req.params;
// //     const assessment = await Assessment.findById(assessmentId);
// //     if (!assessment) {
// //       return res.status(404).json({ error: 'Assessment not found' });
// //     }
// //     const section = assessment.Sections.id(sectionId);
// //     if (!section) {
// //       return res.status(404).json({ error: 'Section not found' });
// //     }
// //     const question = req.body;
// //     section.Questions.push({
// //       ...question,
// //       Options: question.Options || [],
// //       ProgrammingDetails: question.ProgrammingDetails || null
// //     });
// //     await assessment.save();
// //     res.status(201).json(question);
// //   } catch (error) {
// //     res.status(400).json({ error: error.message });
// //   }
// // });

// // app.put('/assessment/:id', async (req, res) => {
// //   const { id } = req.params;
// //   const { AssessmentTitle, AssessmentType, Position, Duration, DifficultyLevel, NumberOfQuestions, ExpiryDate, Sections, ModifiedBy, ModifiedDate, CandidateDetails, Instructions, AdditionalNotes } = req.body;

// //   try {
// //     const updatedAssessment = await Assessment.findByIdAndUpdate(
// //       id,
// //       {
// //         AssessmentTitle,
// //         AssessmentType,
// //         Position,
// //         Duration,
// //         DifficultyLevel,
// //         NumberOfQuestions,
// //         ExpiryDate,
// //         CandidateDetails,
// //         Instructions,
// //         AdditionalNotes,
// //         Sections,
// //         ModifiedBy,
// //         ModifiedDate,
// //       },
// //       { new: true }
// //     );

// //     if (!updatedAssessment) {
// //       return res.status(404).json({ message: "Assessment not found." });
// //     }

// //     // Create a history record
// //     // const assessmentHistory = new AssessmentHistory({
// //     //   assessmentId: updatedAssessment._id,
// //     //   AssessmentTitle,
// //     //   AssessmentType,
// //     //   Position,
// //     //   Duration,
// //     //   CandidateDetails,
// //     //   Instructions,
// //     //   AdditionalNotes,
// //     //   DifficultyLevel,
// //     //   NumberOfQuestions,
// //     //   ExpiryDate,
// //     //   Sections,
// //     //   ModifiedBy,
// //     // });

// //     // await assessmentHistory.save();

// //     res.status(200).json(updatedAssessment);
// //     const assessments = await Assessment.find({ OwnerId });
// //     // broadcastData('assessment', assessments);
// //   } catch (err) {
// //     res.status(400).json({ message: err.message });
// //   }
// // });

// // app.post('/update-candidates', async (req, res) => {
// //   const { assessmentId, candidateIds } = req.body;
// //   try {
// //     const assessment = await Assessment.findByIdAndUpdate(
// //       assessmentId,
// //       { $addToSet: { CandidateIds: { $each: candidateIds } } },
// //       { new: true }
// //     );
// //     res.status(200).json(assessment);

// //   } catch (error) {
// //     res.status(500).json({ error: 'Error updating candidate IDs' });
// //   }
// // });
// // app.get('/candidate/:candidateId', async (req, res) => {
// //   const { candidateId } = req.params;
// //   try {
// //     const candidate = await Candidate.findById(candidateId);
// //     res.status(200).json(candidate);
// //   } catch (error) {
// //     res.status(500).json({ error: 'Error fetching candidate data' });
// //   }
// // });

// // // for assessment test
// // app.get('/assessment/:assessmentId/sections', async (req, res) => {
// //   try {
// //     const { assessmentId } = req.params;
// //     const assessment = await Assessment.findById(assessmentId).populate('Sections');
// //     if (!assessment) {
// //       return res.status(404).json({ error: 'Assessment not found' });
// //     }
// //     res.status(200).json(assessment.Sections);
// //   } catch (error) {
// //     res.status(400).json({ error: error.message });
// //   }
// // });

// // app.get('/assessment/:assessmentId/questions', async (req, res) => {
// //   try {
// //     const { assessmentId } = req.params;
// //     const assessment = await Assessment.findById(assessmentId).populate('Sections.Questions');
// //     if (!assessment) {
// //       return res.status(404).json({ error: 'Assessment not found' });
// //     }
// //     const questions = assessment.Sections.flatMap(section => section.Questions);
// //     res.status(200).json(questions);
// //   } catch (error) {
// //     res.status(400).json({ error: error.message });
// //   }
// // });


// // qualitfication
// app.get('/qualification', async (req, res) => {
//   try {
//     const higherqualifications = await HigherQualification.find({}, 'QualificationName');
//     res.json(higherqualifications);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });


// app.get('/universitycollege', async (req, res) => {
//   try {
//     const universityCollegeNames = await University_CollegeName.find({}, 'University_CollegeName');
//     res.json(universityCollegeNames);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// app.get('/skills', async (req, res) => {
//   try {
//     const skills = await Skills.find({});
//     res.json(skills);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });


// app.use('/suggested-questions',suggestedQuestionRouter)

// // company data
// app.get('/company', async (req, res) => {
//   try {
//     const CompanyNames = await Company.find({});
//     res.json(CompanyNames);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // locations data
// app.get('/locations', async (req, res) => {
//   try {
//     const LocationNames = await LocationMaster.find({});
//     res.json(LocationNames);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // Industry data
// app.get('/industries', async (req, res) => {
//   try {
//     const IndustryNames = await Industry.find({});
//     res.json(IndustryNames);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// //role
// app.get('/roles', async (req, res) => {
//   try {
//     const roles = await RoleMaster.find({});
//     res.json(roles);

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// app.get('/technology', async (req, res) => {
//   try {
//     const technology = await TechnologyMaster.find({});
//     res.json(technology);

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// app.post('/newquestion', async (req, res) => {
//   try {
//       const newquestion = new TenantQuestions(req.body); // Directly use req.body
//       const question = await newquestion.save();
//       const questions = await TenantQuestions.find({ ownerId: req.body.ownerId }); // Ensure you filter correctly
//       res.status(201).json(question);
//   } catch (err) {
//       res.status(400).json({ message: err.message });
//   }
// });

// // this code to get rounds data from interviews we use post in some cases to get data
// app.post('/fetch-rounds-from-view', async (req, res) => {
//   const { roundIds } = req.body;
//   try {
//     const rounds = await ScheduleRounds.find({ _id: { $in: roundIds } });
//     res.json(rounds);
//   } catch (error) {
//     console.error('Error fetching rounds:', error);
//     res.status(500).json({ message: 'Error fetching rounds', error });
//   }
// });

// //notifications
// const notificationRoutes = require('./routes/notificationRoutes');
// app.use('/notification', notificationRoutes);
// // mock interview
// const mockInterviewRoutes = require('./routes/mockinterviewRoutes.js'); 
// app.use('/', mockInterviewRoutes);


// app.post('/fetch-content', (req, res) => {
//   const { sections } = req.body;
//   const content = sections.map(section => ({
//     title: `Content for ${section}`,
//     body: `This is the body content for section ${section}.`
//   }));
//   res.json(content);
// });

// // const transporter = nodemailer.createTransport({
// //   service: 'gmail',
// //   auth: {
// //     user: 'ashrafshaik250@gmail.com',
// //     pass: 'jqez anin fafs gizf'
// //   }
// // });

// // app.post('/send-assessment-link', async (req, res) => {
// //   const { candidateEmails, assessmentId, notes, sections, questions } = req.body;

// //   // Log the incoming request data
// //   console.log('Received request to send assessment link:', {
// //     candidateEmails,
// //     assessmentId,
// //     notes,
// //     sections,
// //     questions
// //   });

// //   try {
// //     const assessment = await Assessment.findById(assessmentId);

// //     // Log if the assessment is not found
// //     if (!assessment) {
// //       console.error('Assessment not found for ID:', assessmentId);
// //       return res.status(404).json({ message: 'Assessment not found' });
// //     }

// //     // Iterate over candidate emails and send individual links
// //     for (const email of candidateEmails) {
// //       const candidate = await Candidate.findOne({ Email: email });
// //       if (!candidate) {
// //         console.error('Candidate not found for email:', email);
// //         continue;
// //       }

// //       const link = `http://localhost:3000/assessmenttest?assessmentId=${assessmentId}&candidateId=${candidate._id}`;
// //       const mailOptions = {
// //         from: 'ashrafshaik250@gmail.com',
// //         to: email,
// //         subject: 'Assessment Invitation',
// //         text: `You have been invited to participate in an assessment. Please follow this link: ${link}\n\nNotes: ${notes}\n\nSections: ${JSON.stringify(sections)}\n\nQuestions: ${JSON.stringify(questions)}`
// //       };

// //       // Log the mail options before sending
// //       console.log('Sending email with options:', mailOptions);

// //       await transporter.sendMail(mailOptions);

// //       // Log success message
// //       console.log('Email sent successfully to:', email);
// //     }

// //     res.status(200).json({ message: 'Emails sent successfully' });
// //   } catch (error) {
// //     // Log the error details
// //     console.error('Error sending email:', error);
// //     res.status(500).json({ message: 'Error sending email', error: error.message });
// //   }
// // });

// // app.get('/assessment-details/:assessmentId', async (req, res) => {
// //   try {
// //     const { assessmentId } = req.params;
// //     const assessment = await Assessment.findById(assessmentId).populate('Sections.Questions');
// //     if (!assessment) {
// //       return res.status(404).json({ error: 'Assessment not found' });
// //     }
// //     res.status(200).json(assessment);
// //   } catch (error) {
// //     res.status(400).json({ error: error.message });
// //   }
// // });

// // app.get('/candidate/:candidateId', async (req, res) => {
// //   const { candidateId } = req.params;
// //   try {
// //     const candidate = await Candidate.findById(candidateId);
// //     if (!candidate) {
// //       return res.status(404).json({ message: 'Candidate not found' });
// //     }
// //     res.status(200).json(candidate);
// //   } catch (error) {
// //     console.error('Error fetching candidate data:', error);
// //     res.status(500).json({ error: 'Error fetching candidate data', message: error.message });
// //   }
// // });

// // app.get('/check-userid/:userid', async (req, res) => {
// //   const { userid } = req.params;
// //   const existingContact = await Contacts.findOne({ UserId: userid });
// //   res.json({ exists: !!existingContact });
// // });

// app.get('/check-email/:email', async (req, res) => {
//   const { email } = req.params;
//   const existingContact = await Contacts.findOne({ Email: email });
//   res.json({ exists: !!existingContact });
// });


// app.get('/contacts', async (req, res) => {
//   try {
//     const contacts = await Contacts.find().populate('availability');
//     res.status(200).json(contacts);
//   } catch (error) {
//     console.error('Error fetching contacts:', error);
//     res.status(500).json({ message: 'Error fetching contacts', error: error.message });
//   }
// });

// app.get('/contacts/:userId', async (req, res) => {
//   try {
//     const userId = req.params.userId; // Keep it as a string
//     console.log("Requested User ID:", userId); 

//     const contact = await Contacts.findOne({ OwnerId: userId }); // Compare as string
//     if (!contact) {
//       return res.status(404).json({ message: 'Contact not found' });
//     }

//     res.json(contact);
//   } catch (err) {
//     console.error('Error fetching contact:', err);
//     res.status(500).json({ message: err.message });
//   }
// });


// app.get('/contacts/:userId/details', async (req, res) => {
//   try {
//     const contact = await Contacts.findOne({ OwnerId: req.params.userId }).populate('availability');
//     if (!contact) {
//       return res.status(404).json({ message: 'Contact not found' });
//     }
//     res.json(contact);
//   } catch (err) {
//     console.error('Error fetching contact details:', err);
//     res.status(500).json({ message: err.message });
//   }
// });

// app.post('/contacts', async (req, res) => {
//   console.log('Received data:', req.body);
//   const contact = new Contacts(req.body);
//   try {
//     const savedContact = await contact.save();
//     res.status(201).json(savedContact);
//   } catch (error) {
//     if (error.name === 'ValidationError') {
//       console.error('Validation error:', error.errors);
//       return res.status(400).json({ message: 'Validation error', errors: error.errors });
//     }
//     console.error('Error saving contact:', error);
//     res.status(400).send('Error saving contact: ' + error.message);
//   }
// });

// app.put('/contacts/:userId/availability', async (req, res) => {
//   const { userId } = req.params;
//   const { availability, TimeZone, PreferredDuration } = req.body;

//   try {
//     const contact = await Contacts.findOne({ OwnerId: userId }).populate('availability');
//     if (!contact) {
//       return res.status(404).json({ message: 'Contact not found' });
//     }

//     let availabilityDoc;
//     if (contact.availability) {
//       // Update existing availability document
//       availabilityDoc = await LoginAvailability.findById(contact.availability);
//       if (!availabilityDoc) {
//         return res.status(404).json({ message: 'Availability not found' });
//       }
//     } else {
//       // Create new availability document
//       availabilityDoc = new LoginAvailability({ contact: contact._id });
//       contact.availability = availabilityDoc._id;
//     }

//     // Update or add days and time slots
//     for (const updatedAvail of availability) {
//       const existingDay = availabilityDoc.days.find(day => day.day === updatedAvail.day);
//       if (existingDay) {
//         existingDay.timeSlots = updatedAvail.timeSlots;
//       } else {
//         availabilityDoc.days.push({
//           day: updatedAvail.day,
//           timeSlots: updatedAvail.timeSlots,
//         });
//       }
//     }

//     await availabilityDoc.save();

//     // Update TimeZone and PreferredDuration in the Contacts model
//     contact.TimeZone = TimeZone;
//     contact.PreferredDuration = PreferredDuration;

//     await contact.save();

//     res.status(200).json(contact);
//   } catch (error) {
//     console.error('Error updating availability:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// app.put('/updateuser', async (req, res) => {
//   const { _id, UserId, ...newUserData } = req.body;

//   try {
//     const existingUser = await Users.findOne({ $or: [{ _id }, { UserId }] });

//     if (!existingUser) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const userHistory = new UserHistory({
//       user: existingUser._id,
//       Name: existingUser.Name,
//       Firstname: existingUser.Firstname,
//       CountryCode: existingUser.CountryCode,
//       UserId: existingUser.UserId,
//       Email: existingUser.Email,
//       Phone: existingUser.Phone,
//       LinkedinUrl: existingUser.LinkedinUrl,
//       Gender: existingUser.Gender,
//       ImageData: existingUser.ImageData,
//       CreatedDate: existingUser.CreatedDate,
//       OwnerId: existingUser.OwnerId,
//       ModifiedDate: existingUser.ModifiedDate,
//       ModifiedBy: existingUser.ModifiedBy,
//       updatedAt: new Date()
//     });

//     await userHistory.save();

//     const updatedUser = await Users.findByIdAndUpdate(
//       existingUser._id,
//       { ...newUserData, ModifiedDate: new Date() },
//       { new: true }
//     );

//     res.json(updatedUser);
//   } catch (err) {
//     console.error('Error updating user:', err);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// // GET User by ID


// app.get('/users', async (req, res) => {
//   try {
//     const users = await Users.find();
//     res.status(200).json(users);
//   } catch (error) {
//     console.error('Error fetching users:', error);
//     res.status(500).json({ message: 'Error fetching users', error: error.message });
//   }
// });


// // app.get('/users/:sub', async (req, res) => {
// //   try {
// //     const user = await Users.findOne({ sub: req.params.sub });
// //     if (user) {
// //       res.status(200).json(user);
// //     } else {
// //       res.status(404).json({ message: 'User not found' });
// //     }
// //   } catch (error) {
// //     console.error('Error fetching user:', error);
// //     res.status(500).json({ message: 'Server error' });
// //   }
// // });

// // app.post('/users', async (req, res) => {
// //   const { Email, UserId, ...otherData } = req.body;
// //   try {
// //     const existingUser = await Users.findOne({ $or: [{ Email }, { UserId }] });
// //     if (existingUser) {
// //       return res.status(400).json({ message: 'User with this Email or UserId already exists' });
// //     }

// //     const newUser = new Users({ Email, UserId, ...otherData });
// //     const savedUser = await newUser.save();
// //     res.status(201).json(savedUser);
// //   } catch (err) {
// //     console.error('Error creating user:', err.message);
// //     if (err.name === 'ValidationError') {
// //       return res.status(400).json({ message: err.message });
// //     }
// //     res.status(500).json({ message: 'Server error' });
// //   }
// // });

// app.post('/users', async (req, res) => {
//   try {
//     const user = new Users(req.body);
//     const savedUser = await user.save();
//     res.status(201).json(savedUser);
//   } catch (error) {
//     console.error('Error saving user:', error);
//     if (error.name === 'ValidationError') {
//       res.status(400).json({ message: 'Validation Error', details: error.errors });
//     } else {
//       res.status(500).json({ message: 'Internal Server Error', error });
//     }
//   }
// });


// app.get('/getUsersByRoleId', async (req, res) => {
//   const { organizationId, roleId } = req.query;
//   try {
//     // Build the query object
//     const query = { organizationId };
//     if (roleId) {
//       query.RoleId = { $in: Array.isArray(roleId) ? roleId : [roleId] };
//     }
//     // Fetch users based on the query
//     const users = await Users.find(query);
//     res.status(200).json(users);
//   } catch (error) {
//     console.error('Error fetching users by organization and role:', error);
//     res.status(500).json({ message: 'Internal server error', error: error.message });
//   }
// });

// // these gets for sharing rules page

// app.get('/api/users/organization/:organizationId', async (req, res) => {
//   const { organizationId } = req.params;
//   try {
//     const users = await Users.find({ organizationId });
//     res.status(200).json(users);
//   } catch (error) {
//     console.error('Error fetching users by organization:', error);
//     res.status(500).json({ message: 'Internal server error', error: error.message });
//   }
// });

// app.get('/api/rolesdata/:organizationId', async (req, res) => {
//   const { organizationId } = req.params;
//   try {
//     const roles = await Role.find({ organizationId }).populate('reportsToRoleId');
//     if (!roles || roles.length === 0) {
//       return res.status(404).json({ message: 'No roles found for this organization' });
//     }
//     res.status(200).json(roles);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching roles', error: error.message });
//   }
// });

// app.put('/updateuser', async (req, res) => {
//   const { _id, UserId, ...newUserData } = req.body;

//   try {
//     const existingUser = await Users.findOne({ $or: [{ _id }, { UserId }] });

//     if (!existingUser) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     const userHistory = new UserHistory({
//       user: existingUser._id,
//       Name: existingUser.Name,
//       Firstname: existingUser.Firstname,
//       CountryCode: existingUser.CountryCode,
//       UserId: existingUser.UserId,
//       Email: existingUser.Email,
//       Phone: existingUser.Phone,
//       LinkedinUrl: existingUser.LinkedinUrl,
//       Gender: existingUser.Gender,
//       ImageData: existingUser.ImageData,
//       CreatedDate: existingUser.CreatedDate,
//       OwnerId: existingUser.OwnerId,
//       ModifiedDate: existingUser.ModifiedDate,
//       ModifiedBy: existingUser.ModifiedBy,
//       updatedAt: new Date()
//     });

//     await userHistory.save();

//     const updatedUser = await Users.findByIdAndUpdate(
//       existingUser._id,
//       { ...newUserData, ModifiedDate: new Date() },
//       { new: true }
//     );

//     res.json(updatedUser);
//   } catch (err) {
//     console.error('Error updating user:', err);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });



// // GET User by ID
// app.get('/auth/users/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const user = await Users.findById(id);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     res.json(user);
//   } catch (error) {
//     console.error('Error fetching user:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// app.put('/user/:id', async (req, res) => {
//   const userId = req.params.id;
//   const { name, email, role } = req.body;
//   try {
//     const updatedUser = await Users.findByIdAndUpdate(userId, { name, email, role }, { new: true });
//     if (!updatedUser) {
//       return res.status(404).json({ message: "User not found." });
//     }
//     res.status(200).json(updatedUser);
//     // broadcastData('user', updatedUser);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// app.delete('/users/:id/image', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const user = await Users.findById(id);
//     if (!user) {
//       return res.status(404).send('User not found.');
//     }

//     const imagePath = user.ImageData?.path;
//     user.ImageData = undefined;
//     await user.save();

//     if (imagePath) {
//       fs.unlink(imagePath, (err) => {
//         if (err) {
//           console.error('Error deleting image file:', err);
//         }
//       });
//     }

//     res.status(200).send('Image deleted successfully.');
//   } catch (error) {
//     console.error('Error deleting image:', error);
//     res.status(500).send('Server error');
//   }
// });

// // locations master data
// app.get('/locations', async (req, res) => {
//   try {
//     const LocationNames = await LocationMaster.find({}, 'LocationName');
//     res.json(LocationNames);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // Industry data
// app.get('/industries', async (req, res) => {
//   try {
//     const IndustryNames = await Industry.find({}, 'IndustryName');
//     res.json(IndustryNames);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// //role master
// app.get('/roles', async (req, res) => {
//   try {
//     const roles = await RoleMaster.find({}, 'RoleName');
//     res.json(roles);

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

// // technology master
// app.get('/technology', async (req, res) => {
//   try {
//     const technology = await TechnologyMaster.find({}, 'TechnologyMasterName');
//     res.json(technology);

//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });
// app.post('/run-code', async (req, res) => {
//   const { code, language, testCases } = req.body;

//   // This is a simplified example. You need to handle different languages and their respective compilers/interpreters.
//   const runCode = (code, input) => {
//     return new Promise((resolve, reject) => {
//       exec(`echo "${input}" | ${language} -c "${code}"`, (error, stdout, stderr) => {
//         if (error) {
//           reject(stderr);
//         } else {
//           resolve(stdout);
//         }
//       });
//     });
//   };

//   try {
//     const results = await Promise.all(testCases.map(async (testCase) => {
//       const output = await runCode(code, testCase.input);
//       return {
//         ...testCase,
//         actualOutput: output.trim(),
//         passed: output.trim() === testCase.output,
//       };
//     }));

//     res.status(200).json(results);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// });


// app.post('/rolesdata', async (req, res) => {
//   const { roleName, reportsToRoleId, description, organizationId } = req.body;

//   const newRole = new Role({
//     roleName,
//     reportsToRoleId,
//     description,
//     organizationId,
//   });

//   try {
//     const savedRole = await newRole.save();
//     res.status(201).json(savedRole);
//   } catch (error) {
//     res.status(500).json({ message: 'Error saving role', error: error.message });
//   }
// });

// app.get('/rolesdata/:id', async (req, res) => {
//   const { id } = req.params;
//   try {
//     const role = await Role.findById(id);
//     if (!role) {
//       return res.status(404).json({ message: 'Role not found' });
//     }
//     res.status(200).json(role);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching role', error: error.message });
//   }
// });

// app.get('/rolesdata', async (req, res) => {
//   const { organizationId } = req.query; // Use query parameters
//   try {
//     const roles = await Role.find({ organizationId }).populate('reportsToRoleId');
//     if (!roles || roles.length === 0) {
//       return res.status(404).json({ message: 'No roles found for this organization' });
//     }
//     res.status(200).json(roles);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching roles', error: error.message });
//   }
// });

// app.put('/roles/update-organization-id', async (req, res) => {
//   const { organizationId } = req.body;

//   try {
//     const updatedRoles = await Role.updateMany(
//       { organizationId: { $exists: false } },
//       { $set: { organizationId } }
//     );
//     res.status(200).json(updatedRoles);
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating roles with organization ID', error: error.message });
//   }
// });

// app.get('/api/tabs', async (req, res) => {
//   try {
//     const tabs = await Tabs.findOne({});
//     res.json(tabs);
//   } catch (err) {
//     res.status(500).json({ message: 'Error fetching tabs data', error: err.message });
//   }
// });

// // Fetch objects data
// app.get('/api/objects', async (req, res) => {
//   try {
//     const objects = await Objects.findOne({});
//     res.json(objects);
//   } catch (err) {
//     res.status(500).json({ message: 'Error fetching objects data', error: err.message });
//   }
// });
// //sharing rule object name ftech
// app.get('/sharing-rules-objects', async (req, res) => {
//   try {
//     const sharingRulesObjects = await SharingRulesObject.find();
//     res.status(200).json(sharingRulesObjects);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching sharing rules objects', error: error.message });
//   }
// });

// app.get('/api/profiles/:profileId', async (req, res) => {
//   const { profileId } = req.params;
//   try {
//     const profile = await Profile.findById(profileId);
//     if (!profile) {
//       return res.status(404).json({ message: 'Profile not found' });
//     }
//     res.status(200).json(profile);
//   } catch (error) {
//     console.error('Error fetching profile:', error);
//     res.status(500).json({ message: error.message });
//   }
// });

// app.get('/api/profiles/organization/:organizationId', async (req, res) => {
//   const { organizationId } = req.params;
//   try {
//     const profiles = await Profile.find({ organizationId });
//     res.status(200).json(profiles);
//   } catch (error) {
//     console.error('Error fetching profiles:', error);
//     res.status(500).json({ message: error.message });
//   }
// });

// app.post('/api/profiles', async (req, res) => {
//   const { label, Name, Description, Tabs, Objects, organizationId } = req.body;

//   const newProfile = new Profile({
//     label,
//     Name,
//     Description,
//     Tabs,
//     Objects,
//     organizationId
//   });

//   try {
//     const savedProfile = await newProfile.save();
//     res.status(201).json(savedProfile);
//   } catch (error) {
//     console.error('Error saving profile:', error);
//     res.status(400).json({ message: error.message });
//   }
// });  

// // for individual

// app.get('/profiles/individualProfile', async (req, res) => {
//   try {
//       const profile = await Profile.find({ "individual": true });
//       if (!profile) {
//           return res.status(404).json({ message: 'No individual profile found' });
//       }
//       res.json(profile);
//   } catch (error) {
//       console.error('Error fetching individual profile:', error);
//       res.status(500).json({ message: 'Server error' });
//   }
// });

// app.get('/sharingSettings/individual', async (req, res) => {
//   try {
//       const sharingSetting = await SharingSettings.find({ individual: true });
//       if (!sharingSetting) {
//           return res.status(404).json({ message: 'No individual sharing setting found' });
//       }
//       res.status(200).json(sharingSetting);
//   } catch (error) {
//       console.error('Error fetching individual sharing setting:', error);
//       res.status(500).json({ message: 'Server error', error: error.message });
//   }
// });



// app.put('/api/profiles/:id', async (req, res) => {
//   const { id } = req.params;
//   const { label, Name, Description, Tabs, Objects } = req.body;

//   try {
//     const updatedProfile = await Profile.findByIdAndUpdate(
//       id,
//       { label, Name, Description, Tabs, Objects },
//       { new: true }
//     );
//     if (!updatedProfile) {
//       return res.status(404).json({ message: 'Profile not found' });
//     }
//     res.status(200).json(updatedProfile);
//   } catch (error) {
//     console.error('Error updating profile:', error);
//     res.status(400).json({ message: error.message });
//   }
// });


// app.post('/api/sharing-settings', async (req, res) => {
//   const { Name, organizationId, accessBody } = req.body;

//   const newSharingSettings = new SharingSettings({
//     Name,
//     organizationId,
//     accessBody
//   });

//   try {
//     const savedSettings = await newSharingSettings.save();
//     res.status(201).json(savedSettings);
//   } catch (error) {
//     res.status(500).json({ message: 'Error saving sharing settings', error: error.message });
//   }
// });

// app.get('/api/sharing-settings', async (req, res) => {
//   try {
//     const sharingSettings = await SharingSettings.find();
//     res.status(200).json(sharingSettings);
//   } catch (error) {
//     res.status(500).json({ message: 'Error fetching sharing settings', error: error.message });
//   }
// });

// app.put('/api/sharing-settings/:id', async (req, res) => {
//   try {
//     const updatedSharingSettings = await SharingSettings.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true }
//     );
//     if (!updatedSharingSettings) {
//       return res.status(404).json({ message: 'Sharing settings not found' });
//     }
//     res.json(updatedSharingSettings);
//   } catch (error) {
//     console.error('Error updating sharing settings:', error);
//     res.status(500).json({ message: 'Error updating sharing settings', error: error.message });
//   }
// });


// // New profile route
// app.get('/api/profiles/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const profile = await Profile.findById(id);
//     if (!profile) {
//       return res.status(404).json({ message: 'Profile not found' });
//     }
//     res.json(profile);
//   } catch (error) {
//     console.error('Error fetching profile:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// // New role route
// app.get('/api/roles/:id', async (req, res) => {
//   try {
//     const { id } = req.params;
//     const role = await Role.findById(id);
//     if (!role) {
//       return res.status(404).json({ message: 'Role not found' });
//     }
//     res.json(role);
//   } catch (error) {
//     console.error('Error fetching role:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// app.get('/organization/user/:userId', async (req, res) => {
//   try {
//     const organization = await Organization.findOne({ user: req.params.userId })
//       .populate('user')  // Optionally populate related data
//       .populate('contact');

//     if (!organization) {
//       return res.status(404).json({ message: 'Organization not found' });
//     }

//     res.status(200).json(organization);
//   } catch (error) {
//     console.error('Error fetching organization:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// app.post('/organization/free', async (req, res) => {
//   try {
//     // Save pricing plan data with default plan as 'free'
//     const pricing = new Plan({ plan: 'free' });
//     await pricing.save();

//     res.status(201).json(pricing);
//   } catch (error) {
//     console.error('Error saving free plan:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });


// const saltRounds = 10;
// app.post('/organization', async (req, res) => {
//   const { firstName, lastName, Email, Phone, username, jobTitle, company, employees, country, password, Role, Profile, ProfileId, RoleId } = req.body;

//   try {
//     // Check if email already exists
//     const existingOrganization = await Organization.findOne({ Email });
//     if (existingOrganization) {
//       return res.status(400).json({ message: 'Email already registered' });
//     }

//     // Hash the password
//     // const hashedPassword = await bcrypt.hash(password, saltRounds);

//     // Create a new organization
//     const organization = new Organization({
//       firstName,
//       lastName,
//       Email,
//       Phone,
//       username,
//       jobTitle,
//       company,
//       employees,
//       country,
//       password: hashedPassword,
//     });

//     const savedOrganization = await organization.save();

//     // Create a new user
//     const newUser = new Users({
//       Name: `${firstName} ${lastName}`,
//       Firstname: firstName,
//       Email,
//       UserId: username,
//       Phone,
//       organizationId: savedOrganization._id,
//       sub: 'dfbd',
//       RoleId,
//       ProfileId,
//       password: hashedPassword,
//     });

//     const savedUser = await newUser.save();

//     newUser.sub = savedUser._id;
//     await newUser.save();

//     // Create a new contact
//     const contact = new Contacts({
//       Name: `${firstName} ${lastName}`,
//       Firstname: firstName,
//       Email,
//       Phone,
//       UserId: username,
//       CurrentRole: jobTitle,
//       company,
//       employees,
//       CountryCode: country,
//       user: savedUser._id,
//     });

//     const savedContact = await contact.save();

//     res.status(201).json({ organization: savedOrganization, contact: savedContact, user: savedUser });
//   } catch (error) {
//     res.status(500).json({ message: 'Internal server error', error: error.message });
//   }
// });

// // route for login from admin page
// app.post('/organization/login', async (req, res) => {
//   const { Email, password } = req.body;

//   try {
//     // Case-insensitive email search
//     const user = await Users.findOne({ Email: new RegExp(`^${Email}$`, 'i') });
//     if (!user) {
//       return res.status(400).json({ message: 'Invalid email or password' });
//     }

//     // const isPasswordValid = await bcrypt.compare(password, user.password);
//     // if (!isPasswordValid) {
//     //   return res.status(400).json({ message: 'Invalid email or password' });
//     // }

//     // Add this line to include userId and organizationId in the response
//     res.status(200).json({ message: 'Login successful', userId: user._id, organizationId: user.organizationId });
//   } catch (error) {
//     console.error('Error during login:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// // app.post('/organization/invoice', async (req, res) => {
// //   const { invoice, invoiceLines, payment, cardDetails } = req.body;

// //   try {
// //     const newInvoice = new OrganizationInvoice(invoice);
// //     await newInvoice.save();

// //     for (const line of invoiceLines) {
// //       const newLine = new OrganizationInvoiceLines({ ...line, invoiceId: newInvoice._id });
// //       await newLine.save();
// //     }

// //     const newPayment = new OrganizationPayment({ ...payment, invoiceId: newInvoice._id });
// //     await newPayment.save();

// //     const newCardDetails = new OrganizationPaymentCardDetails(cardDetails);
// //     await newCardDetails.save();

// //     res.status(201).json({ message: 'Invoice and payment details saved successfully' });
// //   } catch (error) {
// //     console.error('Error saving invoice and payment details:', error);
// //     res.status(500).json({ message: 'Internal server error' });
// //   }
// // });


// // app.get('/api/plans', async (req, res) => {
// //   try {
// //     const plans = await OrganizationPlansData.find();
// //     res.status(200).json(plans);
// //   } catch (error) {
// //     console.error('Error fetching plans:', error);
// //     res.status(500).json({ message: 'Internal server error' });
// //   }
// // });

// app.post('/api/sharing-rules', async (req, res) => {
//   const { label, name, objectName, ruleType, recordsOwnedBy, recordsOwnedById, shareWith, shareWithId, access, description, orgId } = req.body;

//   const newSharingRule = new SharingRule({
//     label,
//     name,
//     objectName,
//     ruleType,
//     recordsOwnedBy,
//     recordsOwnedById,
//     shareWith,
//     shareWithId,
//     access,
//     description,
//     orgId
//   });

//   try {
//     const savedRule = await newSharingRule.save();
//     res.status(201).json(savedRule);
//   } catch (error) {
//     console.error('Error saving sharing rule:', error); // Log the error
//     res.status(500).json({ message: 'Error saving sharing rule', error: error.message });
//   }
// });



// app.get('/api/from/sharing-rules', async (req, res) => {
//   const { orgId } = req.query; // Get the organization ID from query parameters

//   try {
//     // Query the database for sharing rules with the specified organization ID
//     const sharingRules = await SharingRule.find({ orgId });

//     // Return the sharing rules as a JSON response
//     res.status(200).json(sharingRules);
//   } catch (error) {
//     console.error('Error fetching sharing rules:', error);
//     res.status(500).json({ message: 'Internal server error', error: error.message });
//   }
// });
// // this sharing rule fetch used in datautils function
// app.get('/api/sharing-rules', async (req, res) => {
//   const { orgId, objectName, shareWithId } = req.query;

//   // Ensure shareWithId is an array
//   const shareWithIdArray = Array.isArray(shareWithId) ? shareWithId : [shareWithId];

//   try {
//     // Validate required parameters
//     if (!objectName || !shareWithIdArray.length) {
//       return res.status(400).json({ message: 'Missing required query parameters' });
//     }

//     // Query the database for sharing rules
//     const sharingRules = await SharingRule.find({
//       orgId,
//       objectName,
//       shareWithId: { $in: shareWithIdArray }
//     });

//     res.status(200).json(sharingRules);
//   } catch (error) {
//     console.error('Error fetching sharing rules:', error);
//     res.status(500).json({ message: 'Internal server error', error: error.message });
//   }
// });

// // this is common code for datautils
// const modelMapping = {
//   'candidate': Candidate,
//   'position': Position,
//   'team': TeamMember,
//   'assessment': Assessment,
//   'interview': Interview,
//   'mockinterview': MockInterview,
//   'users': Users,
//   'rolesdata': Role,
//   'profiles': Profile,
//   'tenentquestions': TenantQuestions
// };

// app.get('/api/:model', async (req, res) => {
//   const { model } = req.params;
//   const { tenantId, ownerId } = req.query;

//   // Get the correct model based on the endpoint
//   const DataModel = modelMapping[model.toLowerCase()];

//   if (!DataModel) {
//       return res.status(400).json({ message: 'Invalid model' });
//   }

//   if (!ownerId) {
//     return res.status(200).json([]);  }

//   try {
//       let query = DataModel.find(tenantId ? { tenantId } : { ownerId });

//       // Handle specific models with additional population
//       switch (model.toLowerCase()) {

//           case 'team':
//               query = query
//                   .populate('contactId')
//                   .populate({
//                       path: 'contactId',
//                       populate: {
//                           path: 'availability',
//                           model: 'Interviewavailability'
//                       }
//                   });
//               break;

//           case 'tenentquestions':
//               const questions = await TenantQuestions.find()
//                   .populate({
//                       path: 'suggestedQuestionId',
//                       model: 'suggestedQuestions',
//                   })
//                   .populate({
//                     path: 'tenantListId',
//                     model: 'TenantQuestionsListNames',
//                     select: 'label name ownerId tenantId',
//                   })
//                   .exec();

//               // Group questions by label
//               const groupedQuestions = questions.reduce((acc, question) => {
//                 // Fetch either custom or suggested question based on `isCustom`
//                 const questionData = question.isCustom
//                   ? question // Use the question data directly if custom
//                   : question.suggestedQuestionId;
        
//                 // If there's no data, skip
//                 if (!questionData) return acc;
        
//                 // Use labels from tenantListId to group questions
//                 question.tenantListId.forEach((list) => {
//                   const label = list.label;
//                   if (!acc[label]) {
//                     acc[label] = [];
//                   }
//                   acc[label].push({
//                     ...questionData._doc, // Adding question details
//                     label, // Add label to the question data
//                     listId: list._id, // Add the list ID
//                   });
//                 });
        
//                 return acc;
//               }, {});

//               return res.status(200).json(groupedQuestions);

//           case 'interview':
//               query = query.populate('rounds');
//               break;
//       }

//       const data = await query.exec();
//       // If no data is found, return an empty array instead of an error
//       if (!data || data.length === 0) {
//         return res.status(200).json([]);
//     }
//       res.status(200).json(data);
//   } catch (error) {
//       console.error(`Error fetching data for ${model}:, error`);
//       res.status(500).json({ message: 'Internal server error', error });
//   }
// });




// // this is common code for fetchorganizationdata

// const modelMappingOrganization = {
//   'users': Users,
//   'rolesdata': Role,
//   'profiles': Profile,
//   'sharing-rules': SharingRule,
//   'sharing-settings': SharingSettings,
// };

// // Generic endpoint to fetch organization-specific data
// app.get('/api/organization/:model', async (req, res) => {
//   const { model } = req.params;
//   const { organizationId } = req.query;

//   const DataModel = modelMappingOrganization[model];

//   if (!DataModel) {
//     return res.status(400).json({ message: 'Invalid model' });
//   }

//   try {
//     if (!organizationId) {
//       return res.status(400).json({ message: 'organizationId is required' });
//     }

//     const data = await DataModel.find({ organizationId });

//     if (!data || data.length === 0) {
//       return res.status(404).json({ message: `No data found for model: ${model}` });
//     }

//     res.status(200).json(data);
//   } catch (error) {
//     // console.error(`Error fetching data for ${model}:`, error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });


// // Ensure these routes are defined in your server file
// app.get('/tasks', async (req, res) => {
//   try {
//     const tasks = await Task.find();
//     res.json(tasks);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// app.post('/tasks', async (req, res) => {
//   const { title, assignedTo, priority, status, relatedTo, dueDate, comments } = req.body;
//   const task = new Task({
//     title,
//     assignedTo,
//     priority,
//     status,
//     relatedTo,
//     dueDate,
//     comments,
//   });

//   try {
//     const newTask = await task.save();
//     res.status(201).json(newTask);
//   } catch (err) {
//     res.status(400).json({ message: err.message });
//   }
// });

// // app.post('/fetch-rounds', async (req, res) => {
// //   const { roundIds } = req.body;
// //   try {
// //     const rounds = await ScheduleRounds.find({ _id: { $in: roundIds } });
// //     const roundsMap = rounds.reduce((acc, round) => {
// //       acc[round._id] = round;
// //       return acc;
// //     }, {});
// //     res.json(roundsMap);
// //   } catch (error) {
// //     console.error('Error fetching rounds:', error);
// //     res.status(500).json({ message: 'Error fetching rounds', error });
// //   }
// // });

// app.get('/api/outsource-interview', async (req, res) => {
//   try {
//     const interviews = await Interview.find({ type: 'outsource' });
//     res.json(interviews);
//   } catch (error) {
//     console.error('Error fetching outsource interviews:', error);
//     res.status(500).json({ message: 'Error fetching outsource interviews' });
//   }
// });

// app.get('/api/questions/:skill', async (req, res) => {
//   try {
//     const skill = req.params.skill;
//     const questions = await AssessmentDefaultQuestion.find({ skill });
//     res.status(200).json(questions);
//   } catch (error) {
//     console.error('Error fetching questions:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// // my work to add in ashraf's code ( MANSOOR )

// // const ConnectedApp = require('./models/connectedapp');
// const ConnectedApp = require('./models/ConnectedApp1.js');
// const generateRandomString = require('./utils/generateRandomString.js');
// const { handleRequest: handleCandidateRequest, getCandidatesByRef, updateCandidateByRef } = require('./utils/candidateApiHelper.js');
// const { handleRequest: handlePositionRequest, getPositionByRef, updatePositionByRef } = require('./utils/positionApiHelper.js');
// const { getAccessToken, renewAccessToken } = require('./utils/accessTokenHelper.js');

// // CONNECTED APPS
// // get all connected apps to ui
// app.get('/connected-apps', async (req, res) => {
//   try {
//     const apps = await ConnectedApp.find();
//     res.status(200).json(apps);
//   } catch (error) {
//     console.error('Error fetching apps:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });
// // get connected app by id in ui
// app.get('/connected-apps/:id', async (req, res) => {
//   try {
//     const app = await ConnectedApp.findById(req.params.id);
//     if (!app) {
//       return res.status(404).json({ error: 'App not found' });
//     }
//     res.status(200).json(app);
//   } catch (error) {
//     console.error('Error fetching app:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });
// // api for creating connected apps from our UI
// app.post('/connected-apps', async (req, res) => {
//   const { appName, description, redirectUrls, originUrls, scope } = req.body;

//   if (!appName || !redirectUrls || !originUrls || !scope) {
//     return res.status(400).json({ error: 'Missing required fields' });
//   }

//   const clientId = generateRandomString(16);
//   const clientSecret = generateRandomString(32);
//   const accessToken = generateRandomString(32);
//   const expiry = new Date(Date.now() + 3600 * 1000);

//   const newConnectedApp = new ConnectedApp({
//     appName,
//     description,
//     redirectUrls,
//     originUrls,
//     scope,
//     clientId,
//     clientSecret,
//     accessToken,
//     expiry
//   });

//   try {
//     const savedApp = await newConnectedApp.save();
//     res.status(201).json({
//       clientId: savedApp.clientId,
//       clientSecret: savedApp.clientSecret,
//       accessToken: savedApp.accessToken,
//       expiresIn: 3600
//     });
//   } catch (error) {
//     console.error('Error saving app:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });
// // for updating the form of connected apps in our ui
// app.put('/connected-apps/:id', async (req, res) => {
//   const { appName, description, redirectUrls, originUrls, scope } = req.body;

//   if (!appName || !redirectUrls || !originUrls || !scope) {
//     return res.status(400).json({ error: 'Missing required fields' });
//   }

//   try {
//     const updatedApp = await ConnectedApp.findByIdAndUpdate(
//       req.params.id,
//       { appName, description, redirectUrls, originUrls, scope },
//       { new: true }
//     );

//     if (!updatedApp) {
//       return res.status(404).json({ error: 'App not found' });
//     }

//     res.status(200).json(updatedApp);
//   } catch (error) {
//     console.error('Error updating app:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });
// // api for refreshing the token of connected apps in our ui
// app.put('/connected-apps/:id/refresh-token', async (req, res) => {
//   const { id } = req.params;
//   const newAccessToken = generateRandomString(32);
//   const newExpiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

//   try {
//     const updatedApp = await ConnectedApp.findByIdAndUpdate(
//       id,
//       { accessToken: newAccessToken, expiry: newExpiryDate },
//       { new: true }
//     );

//     if (!updatedApp) {
//       return res.status(404).json({ error: 'App not found' });
//     }

//     res.status(200).json({ accessToken: newAccessToken, expiry: newExpiryDate });
//   } catch (error) {
//     console.error('Error refreshing token:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });



// // ACCESS TOKEN
// // New route to get access token by clientId
// app.get('/api/accessToken/get', async (req, res) => {
//   const { clientId } = req.query;
//   try {
//     const tokenData = await getAccessToken(clientId);
//     res.status(200).json(tokenData);
//   } catch (error) {
//     res.status(404).json({ error: error.message });
//   }
// });
// // New route to renew access token by clientId and clientSecret
// app.put('/api/accessToken/renew', async (req, res) => {
//   const { clientId, clientSecret } = req.body;
//   try {
//     const tokenData = await renewAccessToken(clientId, clientSecret);
//     res.status(200).json(tokenData);
//   } catch (error) {
//     res.status(404).json({ error: error.message });
//   }
// });



// // CANDIDATE
// // firing the api from the outside to create candidate in our db
// app.post('/api/candidate/create', (req, res) => {
//   handleCandidateRequest(req, res, Candidate, [
//     'FirstName', 'LastName', 'Email', 'Phone', 'Date_Of_Birth', 'Gender', 'HigherQualification', 'UniversityCollege', 'CurrentExperience', 'skills', 'scope', 'userId'
//   ]);
// });
// app.get('/api/candidate/get', getCandidatesByRef);
// app.put('/api/candidate/update', updateCandidateByRef);



// // POSITION
// // firing the api from the outside to create position in our db
// app.post('/api/position/create', (req, res) => {
//   handlePositionRequest(req, res, Position, [
//     'title', 'companyname', 'jobdescription', 'minexperience', 'maxexperience', 'skills', 'additionalnotes', 'rounds', 'CreatedBy', 'orgId', 'userId'
//   ]);
// });
// app.get('/api/position/get', getPositionByRef);
// app.put('/api/position/update', updatePositionByRef);

// app.put('/roles/:id', async (req, res) => {
//   const { id } = req.params;
//   const { RoleName, ModifiedBy } = req.body;

//   try {
//     const updatedRole = await RoleMaster.findByIdAndUpdate(
//       id,
//       { RoleName },
//       { new: true }
//     );

//     if (!updatedRole) {
//       return res.status(404).json({ message: 'Role not found' });
//     }

//     // Create a history record
//     const roleHistory = new RoleMasterHistory({
//       roleMasterId: updatedRole._id,
//       RoleName,
//       ModifiedBy,
//     });

//     await roleHistory.save();

//     res.status(200).json(updatedRole);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// }); 

// // users
// app.put('/users/:id', async (req, res) => {
//   const { id } = req.params;
//   const { Name, Firstname, CountryCode, UserId, Email, Phone, LinkedinUrl, Gender, isFreelancer, ImageData, ModifiedBy } = req.body;

//   try {
//     const updatedUser = await Users.findByIdAndUpdate(
//       id,
//       { Name, Firstname, CountryCode, UserId, Email, Phone, LinkedinUrl, Gender, isFreelancer, ImageData },
//       { new: true }
//     );

//     if (!updatedUser) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     res.status(200).json(updatedUser);
//   } catch (error) {
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// // contact
// app.put('/contacts/:id', async (req, res) => {
//   const { id } = req.params;
//   const { Name, Firstname, CountryCode, UserId, Email, Phone, LinkedinUrl, Gender, ImageData, CurrentRole, industry, Experience, location, Introduction, Technology, Skill, experienceYears, previousExperience, expertiseLevel, ModifiedBy } = req.body;

//   try {
//     const updatedContact = await Contacts.findByIdAndUpdate(
//       id,
//       { Name, Firstname, CountryCode, UserId, Email, Phone, LinkedinUrl, Gender, ImageData, CurrentRole, industry, Experience, location, Introduction, Technology, Skill, experienceYears, previousExperience, expertiseLevel },
//       { new: true }
//     );

//     if (!updatedContact) {
//       return res.status(404).json({ message: 'Contact not found' });
//     }

//     // Create a history record
//     const contactHistory = new ContactHistory({
//       contactId: updatedContact._id,
//       Name,
//       Firstname,
//       CountryCode,
//       UserId,
//       Email,
//       Phone,
//       LinkedinUrl,
//       Gender,
//       ImageData,
//       CurrentRole,
//       industry,
//       Experience,
//       location,
//       Introduction,
//       Technology,
//       Skill,
//       experienceYears,
//       previousExperience,
//       expertiseLevel,
//       ModifiedBy,
//     });

//     await contactHistory.save();

//     res.status(200).json(updatedContact);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// });

// // organization
// app.put('/organization/user/:userId', async (req, res) => {
//   const { firstName, lastName, email, phone, username, jobTitle, company, employees, country, password, ModifiedBy } = req.body;

//   try {
//     const organization = await Organization.findOne({ user: req.params.userId });

//     if (!organization) {
//       return res.status(404).json({ message: 'Organization not found' });
//     }

//     const updatedOrganization = await Organization.findByIdAndUpdate(
//       organization._id,
//       { firstName, lastName, email, phone, username, jobTitle, company, employees, country, password },
//       { new: true }
//     );

//     if (!updatedOrganization) {
//       return res.status(404).json({ message: 'Organization not found' });
//     }

//     // Create a history record
//     const organizationHistory = new OrganizationHistory({
//       organizationId: updatedOrganization._id,
//       firstName,
//       lastName,
//       email,
//       phone,
//       username,
//       jobTitle,
//       company,
//       employees,
//       country,
//       ModifiedBy,
//     });

//     await organizationHistory.save();

//     res.status(200).json(updatedOrganization);
//   } catch (error) {
//     console.error('Error updating organization:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });

// // app.get('/assessment/:assessmentId/details', async (req, res) => {
// //   try {
// //     const { assessmentId } = req.params;
// //     const assessment = await Assessment.findById(assessmentId).populate('Sections.Questions');
// //     if (!assessment) {
// //       return res.status(404).json({ error: 'Assessment not found' });
// //     }
// //     res.status(200).json(assessment);
// //   } catch (error) {
// //     res.status(400).json({ error: error.message });
// //   }
// // });

// // const AssessmentTest = require('./models/AssessmentTest');

// // app.post('/assessmenttest', async (req, res) => {
// //   const {
// //     assessmentId,
// //     answeredQuestionsScore,
// //     totalScore,
// //     passScore,
// //     candidateId,
// //     answeredQuestions,
// //     totalQuestions,
// //     timeSpent,
// //     questions,
// //     sections
// //   } = req.body;

// //   try {
// //     const assessmentTest = new AssessmentTest({
// //       assessmentId,
// //       answeredQuestionsScore,
// //       totalScore,
// //       passScore,
// //       candidateId,
// //       answeredQuestions,
// //       totalQuestions,
// //       timeSpent,
// //       questions,
// //       sections
// //     });
// //     await assessmentTest.save();
// //     res.status(201).json({ message: 'Assessment test result saved successfully' });
// //   } catch (error) {
// //     res.status(500).json({ error: 'Error saving assessment test result', message: error.message });
// //   }
// // });

// // app.get('/assessmenttest/results/:assessmentId', async (req, res) => {
// //   const { assessmentId } = req.params;

// //   try {
// //     const assessmentTests = await AssessmentTest.find({ assessmentId }).lean();
// //     if (assessmentTests.length > 0) {
// //       res.status(200).json(assessmentTests);
// //     } else {
// //       res.status(404).json({ message: 'No assessment tests found for this assessment' });
// //     }
// //   } catch (error) {
// //     res.status(500).json({ error: 'Error fetching assessment test results', message: error.message });
// //   }
// // });


// // app.put('/assessment/:assessmentId/section/:sectionId/question/:questionId', async (req, res) => {
// //   const { assessmentId, sectionId, questionId } = req.params;
// //   const { Question, QuestionType, DifficultyLevel, Score, Answer, Options, ProgrammingDetails } = req.body;

// //   try {
// //     const assessment = await Assessment.findById(assessmentId);
// //     if (!assessment) {
// //       return res.status(404).json({ error: 'Assessment not found' });
// //     }

// //     const section = assessment.Sections.id(sectionId);
// //     if (!section) {
// //       return res.status(404).json({ error: 'Section not found' });
// //     }

// //     const question = section.Questions.id(questionId);
// //     if (!question) {
// //       return res.status(404).json({ error: 'Question not found' });
// //     }

// //     question.Question = Question;
// //     question.QuestionType = QuestionType;
// //     question.DifficultyLevel = DifficultyLevel;
// //     question.Score = Score;
// //     question.Answer = Answer;
// //     question.Options = Options;
// //     question.ProgrammingDetails = ProgrammingDetails;

// //     await assessment.save();
// //     return res.status(200).json(question); // Ensure this is the only response sent
// //   } catch (error) {
// //     console.error('Error updating question:', error);
// //     if (!res.headersSent) {
// //       return res.status(400).json({ error: error.message });
// //     }
// //   }
// // });
// // app.put('/assessment/:assessmentId/section/:sectionId', async (req, res) => {
// //   const { assessmentId, sectionId } = req.params;
// //   const updatedSectionData = req.body;

// //   try {
// //     const assessment = await Assessment.findById(assessmentId);
// //     if (!assessment) {
// //       return res.status(404).json({ error: 'Assessment not found' });
// //     }

// //     const section = assessment.Sections.id(sectionId);
// //     if (!section) {
// //       return res.status(404).json({ error: 'Section not found' });
// //     }

// //     // Update section fields
// //     Object.assign(section, updatedSectionData);

// //     await assessment.save();
// //     res.status(200).json(section);
// //   } catch (error) {
// //     res.status(400).json({ error: error.message });
// //   }
// // });


// // app.delete('/assessment/:assessmentId/section/:sectionId', async (req, res) => {
// //   const { assessmentId, sectionId } = req.params;

// //   try {
// //     const assessment = await Assessment.findById(assessmentId);
// //     if (!assessment) {
// //       return res.status(404).json({ error: 'Assessment not found' });
// //     }

// //     // Find the index of the section to be removed
// //     const sectionIndex = assessment.Sections.findIndex(
// //       section => section._id.toString() === sectionId
// //     );

// //     if (sectionIndex === -1) {
// //       return res.status(404).json({ error: 'Section not found' });
// //     }

// //     // Remove the section from the array
// //     assessment.Sections.splice(sectionIndex, 1);

// //     // Save the updated assessment
// //     await assessment.save();
// //     res.status(200).json({ message: 'Section deleted successfully' });
// //   } catch (error) {
// //     console.error('Error in DELETE /assessment/:assessmentId/section/:sectionId:', error);
// //     res.status(400).json({ error: error.message });
// //   }
// // });

// // app.delete('/assessment/:assessmentId/section/:sectionId/question/:questionId', async (req, res) => {
// //   const { assessmentId, sectionId, questionId } = req.params;

// //   try {
// //     const assessment = await Assessment.findById(assessmentId);
// //     if (!assessment) {
// //       return res.status(404).json({ error: 'Assessment not found' });
// //     }

// //     const section = assessment.Sections.id(sectionId);
// //     if (!section) {
// //       return res.status(404).json({ error: 'Section not found' });
// //     }

// //     const questionIndex = section.Questions.findIndex(q => q._id.toString() === questionId);
// //     if (questionIndex === -1) {
// //       return res.status(404).json({ error: 'Question not found' });
// //     }

// //     section.Questions.splice(questionIndex, 1);

// //     await assessment.save();
// //     res.status(200).json({ message: 'Question deleted successfully' });
// //   } catch (error) {
// //     console.error('Error in DELETE /assessment/:assessmentId/section/:sectionId/question/:questionId:', error);
// //     res.status(400).json({ error: error.message });
// //   }
// // });
// const feedbackRouter = require('./routes/feedbackRoute')
// const interviewQuestionsRoute = require('./routes/interviewQuestions.js')
// const TenentQuestionsListNamesRoute = require('./routes/TenentQuestionsListNames.js')

// app.use('/interview-questions',interviewQuestionsRoute)
// app.use('/tenant-list',TenentQuestionsListNamesRoute)
// app.use('/feedback',feedbackRouter)


// // internal logs
// const internalLogRoutes = require('./routes/internalLogRoutes');
// app.use('/internal-logs', internalLogRoutes);

// // integration logs
// const integrationLogRoutes = require('./routes/integrationLogRoutes');
// app.use('/api/integration-logs', integrationLogRoutes);

// // feeds

// const historyFeedsRoutes = require('./routes/feedsRoutes');
// app.use('/feeds', historyFeedsRoutes); 

// // question bank

// const MyQuestionListRoutes = require('./routes/MyQuestionListRoutes.js');
// app.use('/', MyQuestionListRoutes);

// // web hooks
// const webhookRoutes = require('./routes/webhookRoutes');
// app.use('/api', webhookRoutes);

// // support

// const supportUserRoutes = require('./routes/supportUserRoutes')
// app.use('/api', supportUserRoutes);

// // Report backend

// const reportRoutes = require('./routes/reportRoutes');
// app.use('/api/reports', reportRoutes);


// // receipt routes
// const ReceiptRoutes = require("./routes/ReceiptRoutes.js");
// app.use('/',ReceiptRoutes)
 
 
// // subscription routes
// const SubscriptionRouter = require("./routes/SubscriptionRoutes.js");
// app.use('/',SubscriptionRouter);
 
// // payment for subscription plans
// const Cardrouter = require("./routes/Carddetailsroutes.js");
// app.use('/',Cardrouter);
 
// const CustomerSubscriptionRouter = require("./routes/CustomerSubscriptionRoutes.js");
// app.use('/',CustomerSubscriptionRouter)
 
 
// // wallet routes
// const WalletRouter = require("./routes/WallettopupRoutes.js");
// app.use('/',WalletRouter)

// // invoice routes
// const InvoiceRouter = require("./routes/InvoiceRoutes.js");
// app.use('/',InvoiceRouter);
 
  
  
// // Email TemplateRouter
// const EmailTemplateRouter = require("./routes/EmailTemplateRoutes.js");
// app.use('/',EmailTemplateRouter);
 

// // assessment tab

// const AssessmentRouter = require('./routes/assessment.js')

// app.use('/assessment',AssessmentRouter)

// // assessment test 

// const scheduledAssessmentRouter = require("./routes/scheduledAssessment.js")
// app.use('/schedule-assessment',scheduledAssessmentRouter)

// //candidate assessment schema

// const candidateAssessmentRouter = require('./routes/candidateAssessment.js')
// app.use('/candidate-assessment',candidateAssessmentRouter)


// // sending email common code for all
// const emailCommonRouter = require('./routes/emailCommonRoutes.js')
// app.use('/emailCommon',emailCommonRouter) 
// // individual login

// const individualLoginRoutes = require("./routes/individualLoginRoutes");
// app.use("/Individual", individualLoginRoutes);

// // organization
// const organizationRoutes = require('./routes/organizationLoginRoutes.js');
// app.use('/Organization', organizationRoutes);

// const EmailTemplate = require('./models/EmailTemplatemodel.js'); 

// // Create a new email template
// app.post('/createEmail', async (req, res) => {
//     try {
//         const {
//             tenantId,
//             systemTemplateId,
//             name,
//             subject,
//             body,
//             placeholders,
//             category,
//             isActive,
//             isSystemTemplate
//         } = req.body;

//         // Create a new email template document
//         const newTemplate = new EmailTemplate({
//             tenantId,
//             systemTemplateId,
//             name,
//             subject,
//             body,
//             placeholders,
//             category,
//             isActive,
//             isSystemTemplate
//         });

//         // Save to the database
//         await newTemplate.save();

//         res.status(201).json({ message: 'Email template created successfully', data: newTemplate });
//     } catch (error) {
//         res.status(500).json({ message: 'Error creating email template', error: error.message });
//     }
// });


// const teamRoutes = require('./routes/teamRoutes');
// app.use('/teammember', teamRoutes);
// const InterviewRoutes = require('./routes/interviewRoutes.js')
// app.use('/interview', InterviewRoutes);
// const interviewAvailabilityRoutes = require('./routes/interviewAvailabilityRoutes');
// app.use('/interviewavailability', interviewAvailabilityRoutes);
// const outsourceInterviewRequestRoutes = require('./routes/outsourceInterviewRequestRoutes.js');
// app.use('/interviewrequest', outsourceInterviewRequestRoutes);
// const candidatePositionRoutes = require('./routes/candidatePositionRoutes.js');
// app.use('/candidateposition', candidatePositionRoutes);

// // interview

// app.get('/interview-questions/:interviewId', async (req, res) => {
//   try {
//       const { interviewId } = req.params;

//       // Fetch questions related to the interview ID
//       const questions = await InterviewQuestion.find({ interviewId });

//       if (!questions || questions.length === 0) {
//           return res.status(404).json({ success: false, message: 'No questions found' });
//       }

//       res.status(200).json({ success: true, data: questions });
//   } catch (error) {
//       res.status(500).json({ success: false, message: 'Failed to fetch questions' });
//   }
// });

// app.post('/interview-questions/add-question', async (req, res) => {
//   try {
//       const { interviewId, questionId, source, snapshot, order, customizations, mandatory } = req.body;

//       // Create a new question instance
//       const newQuestion = new InterviewQuestion({
//           interviewId,
//           questionId,
//           source,
//           snapshot,
//           order,
//           customizations,
//           mandatory
//       });

//       // Save the question to the database
//       const savedQuestion = await newQuestion.save();

//       // Log the newly created question's ID
//       // console.log('New Question ID:', savedQuestion._id);

//       // Send a success response, including the new record's ID
//       res.status(200).json({ success: true, message: 'Question added successfully', recordId: savedQuestion._id });
//   } catch (error) {
//       // console.error('Error adding question:', error);
//       res.status(500).json({ success: false, message: 'Failed to add question' });
//   }
// });

// const outsourceInterviewerRoutes = require('./routes/outsourceInterviewerRoutes');
// app.use('/outsourceInterviewers', outsourceInterviewerRoutes);





// const connectDB = require('./db.js');
// connectDB();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
app.use(cors());
 
const port = process.env.PORT || 5000;
const mongoUri = process.env.MONGO_URI;
 
console.log('Mongo URI:', mongoUri)
const corsOptions = {
  origin: ['https://www.app.upinterview.io', 'https://purple-sand-0e5d43e00.4.azurestaticapps.net'],
  credentials: true,
};

mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

 
app.use(cors(corsOptions));

// mongoose.connect(mongoUri, {
//   serverSelectionTimeoutMS: 5000,
// })
//   .then(() => console.log('Connected to MongoDB'))
//   .catch(err => console.error('Could not connect to MongoDB', err));
 
app.get('/', (req, res) => {
    res.send('Hello World!');
});
 
app.get('/api/message', (req, res) => {
    res.json({ message: 'Hello from the backend!' });
});

app.get('/api/db-status', (req, res) => {
  const status = mongoose.connection.readyState === 1 ? 'Connected to MongoDB' : 'Not connected to MongoDB';
  console.log('Database connection status:', status);
  res.json({ status });
});

 
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// higher qualification
 
app.get('/qualification', async (req, res) => {
  try {
    const higherqualifications = await HigherQualification.find({}, 'QualificationName');
    res.json(higherqualifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
 
// colleges
 
app.get('/universitycollege', async (req, res) => {
  try {
    const universityCollegeNames = await University_CollegeName.find({}, 'University_CollegeName');
    res.json(universityCollegeNames);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
 
// Skills
 
app.get('/skills', async (req, res) => {
  try {
    const skills = await Skills.find({});
    res.json(skills);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// organization
const organizationRoutes = require('./routes/organizationLoginRoutes.js');
app.use('/Organization', organizationRoutes);
