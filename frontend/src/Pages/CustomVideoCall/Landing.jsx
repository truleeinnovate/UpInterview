// import React from "react";
// import { Link } from "react-router-dom";
// import { Video, Users, Shield, Zap, ArrowRight } from "lucide-react";
// import "./Landing.css";

// const Landing = () => {
//     return (
//         <div className="landing-container">
//             <div className="landing-header">
//                 <div className="logo">
//                     <Video size={32} />
//                     <span>ZegoCall</span>
//                 </div>
//                 <nav className="nav-links">
//                     <a href="#features">Features</a>
//                     <a href="#about">About</a>
//                     <a href="#contact">Contact</a>
//                 </nav>
//             </div>

//             <div className="hero-section">
//                 <div className="hero-content">
//                     <h1 className="hero-title">
//                         Professional Video Calls
//                         <span className="gradient-text"> Made Simple</span>
//                     </h1>
//                     <p className="hero-description">
//                         Experience crystal-clear video calls with advanced features like screen sharing,
//                         question banks, and real-time feedback. Built with ZegoCloud SDK for maximum reliability.
//                     </p>

//                     <div className="hero-actions">
//                         <Link to="/video-call/join" className="btn btn-primary">
//                             Start Video Call
//                             <ArrowRight size={20} />
//                         </Link>
//                         <button className="btn btn-secondary">
//                             Watch Demo
//                         </button>
//                     </div>

//                     <div className="hero-stats">
//                         <div className="stat">
//                             <Users size={24} />
//                             <div>
//                                 <h3>1000+</h3>
//                                 <p>Active Users</p>
//                             </div>
//                         </div>
//                         <div className="stat">
//                             <Video size={24} />
//                             <div>
//                                 <h3>50K+</h3>
//                                 <p>Calls Made</p>
//                             </div>
//                         </div>
//                         <div className="stat">
//                             <Shield size={24} />
//                             <div>
//                                 <h3>99.9%</h3>
//                                 <p>Uptime</p>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="hero-visual">
//                     <div className="video-preview">
//                         <div className="video-screen">
//                             <div className="video-placeholder">
//                                 <Video size={48} />
//                                 <p>Live Video Call</p>
//                             </div>
//                         </div>
//                         <div className="floating-elements">
//                             <div className="floating-card">
//                                 <Zap size={16} />
//                                 <span>HD Quality</span>
//                             </div>
//                             <div className="floating-card">
//                                 <Shield size={16} />
//                                 <span>Secure</span>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             <div className="features-section" id="features">
//                 <h2 className="section-title">Why Choose Our Platform?</h2>
//                 <div className="features-grid">
//                     <div className="feature-card">
//                         <div className="feature-icon">
//                             <Video size={32} />
//                         </div>
//                         <h3>Custom Video Interface</h3>
//                         <p>Fully customizable video call interface built with ZegoCloud SDK, not limited by UI Kit constraints.</p>
//                     </div>

//                     <div className="feature-card">
//                         <div className="feature-icon">
//                             <Users size={32} />
//                         </div>
//                         <h3>Question Bank Integration</h3>
//                         <p>Access a comprehensive question bank during calls for interviews, training, or educational sessions.</p>
//                     </div>

//                     <div className="feature-card">
//                         <div className="feature-icon">
//                             <Shield size={32} />
//                         </div>
//                         <h3>Real-time Feedback</h3>
//                         <p>Collect instant feedback from participants during video calls with our integrated feedback system.</p>
//                     </div>

//                     <div className="feature-card">
//                         <div className="feature-icon">
//                             <Zap size={32} />
//                         </div>
//                         <h3>Screen Sharing</h3>
//                         <p>Share your screen seamlessly with high-quality streaming and easy controls.</p>
//                     </div>
//                 </div>
//             </div>

//             <div className="cta-section">
//                 <div className="cta-content">
//                     <h2>Ready to Start Your Video Call?</h2>
//                     <p>Join thousands of users who trust our platform for their video communication needs.</p>
//                     <Link to="/video-call/join" className="btn btn-primary btn-large">
//                         Get Started Now
//                         <ArrowRight size={20} />
//                     </Link>
//                 </div>
//             </div>

//             <footer className="landing-footer">
//                 <div className="footer-content">
//                     <div className="footer-section">
//                         <div className="logo">
//                             <Video size={24} />
//                             <span>ZegoCall</span>
//                         </div>
//                         <p>Professional video calls made simple and customizable.</p>
//                     </div>

//                     <div className="footer-section">
//                         <h4>Features</h4>
//                         <ul>
//                             <li>Custom Video Interface</li>
//                             <li>Question Bank</li>
//                             <li>Real-time Feedback</li>
//                             <li>Screen Sharing</li>
//                         </ul>
//                     </div>

//                     <div className="footer-section">
//                         <h4>Support</h4>
//                         <ul>
//                             <li>Documentation</li>
//                             <li>Help Center</li>
//                             <li>Contact Us</li>
//                             <li>Privacy Policy</li>
//                         </ul>
//                     </div>
//                 </div>

//                 <div className="footer-bottom">
//                     <p>&copy; 2024 ZegoCall. Built with ZegoCloud SDK.</p>
//                 </div>
//             </footer>
//         </div>
//     );
// };

// export default Landing;