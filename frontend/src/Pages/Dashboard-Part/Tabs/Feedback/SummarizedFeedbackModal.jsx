// <-------v1.0.1-----Venkatesh----------------SummarizedFeedbackModal.jsx

import React, { useRef } from 'react';
import {
  StarIcon,
  DownloadIcon,
  X,
  User,
  Briefcase,
  Video,
  CheckCircle,
  Calendar,
  UserCheck,
  ThumbsUp
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const SummarizedFeedbackModal = ({ open, onClose, data }) => {
  const modalContentRef = useRef(null);

  if (!data) return null;

  const {
    candidate_name,
    candidate_job_title,
    overall_impression,
    recommendation,
    skills = [],
    status,
    interview_mode,
    scheduled_datetime,
    interviewer
  } = data;

  const getStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <StarIcon
          key={i}
          size={16}
          style={{ color: i <= rating ? '#facc15' : '#d1d5db', fill: i <= rating ? '#facc15' : 'none' }}
        />
      );
    }
    return stars;
  };

  const getBadgeColor = (recommendation) => {
    switch (recommendation.toLowerCase()) {
      case 'strongly recommended':
        return '#22c55e';
      case 'recommended':
        return '#4ade80';
      case 'not recommended':
        return '#ef4444';
      case 'neutral':
        return '#fbbf24';
      default:
        return '#9ca3af';
    }
  };

  const handleExportToPDF = async () => {
    const input = modalContentRef.current;
    if (!input) return;
  
    try {
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff", // Prevent grey background
      });
  
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
  
      const imgProps = {
        width: pageWidth - 20,
        height: (canvas.height * (pageWidth - 20)) / canvas.width,
      };
  
      let y = 20;
  
      // Add Title
      pdf.setFontSize(16);
      pdf.text("Feedback Summary", pageWidth / 2, 15, { align: "center" });
  
      if (imgProps.height < pageHeight - y) {
        pdf.addImage(imgData, "PNG", 10, y, imgProps.width, imgProps.height);
      } else {
        let position = y;
        let heightLeft = imgProps.height;
  
        while (heightLeft > 0) {
          pdf.addImage(imgData, "PNG", 10, position, imgProps.width, imgProps.height);
          heightLeft -= pageHeight;
          if (heightLeft > 0) {
            pdf.addPage();
            position = 0;
          }
        }
      }
  
      pdf.save(`Feedback_Summary_${candidate_name}.pdf`);
    } catch (err) {
      console.error("Error exporting PDF:", err);
      alert("Failed to export PDF. Check console.");
    }
  };
  

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-gray-800 bg-opacity-70 flex justify-end items-start z-50 feedback-modal" style={{ height: '100vh' }}>
      <div className="bg-white w-[50%] h-full overflow-y-auto shadow-xl relative flex flex-col">
        <div className="flex justify-between items-center px-4 py-4">
          <h2 className="text-xl font-bold text-[#227a8a]">Feedback Summary for {candidate_name}</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex-1" ref={modalContentRef}>
          {/* Candidate Details */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Candidate Details</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center">
                <User size={18} className="mr-2 text-gray-500" />
                <span className="w-[200px] font-medium text-gray-600">Candidate Name:</span>
                <span className="text-gray-900">{candidate_name}</span>
              </div>
              <div className="flex items-center">
                <Briefcase size={18} className="mr-2 text-gray-500" />
                <span className="w-[200px] font-medium text-gray-600">Job Title:</span>
                <span className="text-gray-900">{candidate_job_title}</span>
              </div>
            </div>
          </div>

          {/* Interview Details */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Interview Details</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center">
                <Video size={18} className="mr-2 text-gray-500" />
                <span className="w-[200px] font-medium text-gray-600">Interview Mode:</span>
                <span className="text-gray-900">{interview_mode}</span>
              </div>
              <div className="flex items-center">
                <CheckCircle size={18} className="mr-2 text-gray-500" />
                <span className="w-[200px] font-medium text-gray-600">Status:</span>
                <span className="text-gray-900 capitalize">{status}</span>
              </div>
              <div className="flex items-center">
                <Calendar size={18} className="mr-2 text-gray-500" />
                <span className="w-[200px] font-medium text-gray-600">Scheduled Date & Time:</span>
                <span className="text-gray-900">{scheduled_datetime}</span>
              </div>
              <div className="flex items-center">
                <UserCheck size={18} className="mr-2 text-gray-500" />
                <span className="w-[200px] font-medium text-gray-600">Interviewer:</span>
                <span className="text-gray-900">{interviewer}</span>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Skill Ratings</h3>
            <div className="mt-2 flex flex-col gap-2">
              {skills.length > 0 ? (
                skills.map((skill, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <span className="capitalize font-medium text-gray-700">{skill.skillName}</span>
                    <div className="flex gap-1">{getStars(skill.rating)}</div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No skill ratings available.</p>
              )}
            </div>
          </div>

          {/* Overall Impression */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-3 text-gray-700">Overall Impression</h3>
            <p className="text-gray-900 leading-relaxed">{overall_impression}</p>
          </div>

          {/* Recommendation */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2">
              <ThumbsUp size={18} className="mr-2 text-gray-500" />
              <span className="w-[200px] font-medium text-gray-600">Recommendation:</span>
              <span
                className="px-2 py-1 rounded text-sm font-medium"
                style={{
                  backgroundColor: `${getBadgeColor(recommendation)}20`,
                  color: getBadgeColor(recommendation)
                }}
              >
                {recommendation}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 flex justify-end gap-3 print-hide">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            Close
          </button>
          <button
            onClick={handleExportToPDF}
            className="px-4 py-2 rounded text-white flex items-center gap-2"
            style={{ backgroundColor: '#227a8a' }}
          >
            <DownloadIcon size={18} />
            Export to PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default SummarizedFeedbackModal;
