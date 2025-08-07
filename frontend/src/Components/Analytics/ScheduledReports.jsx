import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Mail, Download, Play, Pause, Edit, Trash2, Plus } from 'lucide-react';

const ScheduledReports = ({ isOpen, onClose }) => {
  const [scheduledReports, setScheduledReports] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingReport, setEditingReport] = useState(null);
  const [newReport, setNewReport] = useState({
    name: '',
    type: 'interview',
    frequency: 'weekly',
    dayOfWeek: 1,
    dayOfMonth: 1,
    time: '09:00',
    recipients: '',
    format: 'pdf',
    filters: {
      interviewType: 'all',
      candidateStatus: 'all',
      dateRange: 'last30days'
    },
    isActive: true
  });

  useEffect(() => {
    // Load scheduled reports from localStorage (in real app, this would be from API)
    const saved = localStorage.getItem('scheduledReports');
    if (saved) {
      setScheduledReports(JSON.parse(saved));
    }
  }, []);

  const saveToStorage = (reports) => {
    localStorage.setItem('scheduledReports', JSON.stringify(reports));
  };

  const handleCreateReport = () => {
    const report = {
      ...newReport,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      lastRun: null,
      nextRun: calculateNextRun(newReport),
      recipients: newReport.recipients.split(',').map(email => email.trim()).filter(Boolean)
    };

    const updatedReports = [...scheduledReports, report];
    setScheduledReports(updatedReports);
    saveToStorage(updatedReports);
    
    setShowCreateForm(false);
    setNewReport({
      name: '',
      type: 'interview',
      frequency: 'weekly',
      dayOfWeek: 1,
      dayOfMonth: 1,
      time: '09:00',
      recipients: '',
      format: 'pdf',
      filters: {
        interviewType: 'all',
        candidateStatus: 'all',
        dateRange: 'last30days'
      },
      isActive: true
    });
  };

  const handleUpdateReport = () => {
    const updatedReports = scheduledReports.map(report =>
      report.id === editingReport.id
        ? {
            ...editingReport,
            nextRun: calculateNextRun(editingReport),
            recipients: editingReport.recipients.split(',').map(email => email.trim()).filter(Boolean)
          }
        : report
    );

    setScheduledReports(updatedReports);
    saveToStorage(updatedReports);
    setEditingReport(null);
  };

  const handleDeleteReport = (id) => {
    const updatedReports = scheduledReports.filter(report => report.id !== id);
    setScheduledReports(updatedReports);
    saveToStorage(updatedReports);
  };

  const handleToggleActive = (id) => {
    const updatedReports = scheduledReports.map(report =>
      report.id === id ? { ...report, isActive: !report.isActive } : report
    );
    setScheduledReports(updatedReports);
    saveToStorage(updatedReports);
  };

  const handleRunNow = async (report) => {
    // Simulate running the report
    const updatedReports = scheduledReports.map(r =>
      r.id === report.id
        ? {
            ...r,
            lastRun: new Date().toISOString(),
            nextRun: calculateNextRun(r)
          }
        : r
    );

    setScheduledReports(updatedReports);
    saveToStorage(updatedReports);

    // Show success message (in real app, this would trigger actual report generation)
    alert(`Report "${report.name}" has been generated and sent to recipients.`);
  };

  const calculateNextRun = (report) => {
    const now = new Date();
    const [hours, minutes] = report.time.split(':').map(Number);
    
    let nextRun = new Date();
    nextRun.setHours(hours, minutes, 0, 0);

    if (report.frequency === 'daily') {
      if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
    } else if (report.frequency === 'weekly') {
      const dayDiff = report.dayOfWeek - nextRun.getDay();
      if (dayDiff <= 0 || (dayDiff === 0 && nextRun <= now)) {
        nextRun.setDate(nextRun.getDate() + (dayDiff <= 0 ? 7 + dayDiff : dayDiff));
      } else {
        nextRun.setDate(nextRun.getDate() + dayDiff);
      }
    } else if (report.frequency === 'monthly') {
      nextRun.setDate(report.dayOfMonth);
      if (nextRun <= now) {
        nextRun.setMonth(nextRun.getMonth() + 1);
      }
    }

    return nextRun.toISOString();
  };

  const formatNextRun = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' at ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getDayName = (dayNumber) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber];
  };

  const reportTypes = [
    { value: 'interview', label: 'Interview Reports' },
    { value: 'interviewer', label: 'Interviewer Performance' },
    { value: 'assessment', label: 'Assessment Analytics' },
    { value: 'candidate', label: 'Candidate Pipeline' },
    { value: 'trends', label: 'Trends Analysis' }
  ];

  const frequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' }
  ];

  const formats = [
    { value: 'pdf', label: 'PDF' },
    { value: 'csv', label: 'CSV' },
    { value: 'excel', label: 'Excel' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="w-6 h-6 text-custom-blue" />
              <h2 className="text-xl font-semibold text-custom-blue">Scheduled Reports</h2>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-primary-600"
              >
                <Plus className="w-4 h-4" />
                <span>New Schedule</span>
              </button>
              <button
                onClick={onClose}
                className="text-gray-600 hover:text-gray-800"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Scheduled Reports List */}
          {scheduledReports.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Scheduled Reports</h3>
              <p className="text-gray-500 mb-4">Create your first scheduled report to automate your reporting workflow.</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-custom-blue"
              >
                Create Schedule
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {scheduledReports.map(report => (
                <div key={report.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{report.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          report.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {report.isActive ? 'Active' : 'Paused'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {report.frequency.charAt(0).toUpperCase() + report.frequency.slice(1)}
                            {report.frequency === 'weekly' && ` (${getDayName(report.dayOfWeek)})`}
                            {report.frequency === 'monthly' && ` (${report.dayOfMonth}${report.dayOfMonth === 1 ? 'st' : report.dayOfMonth === 2 ? 'nd' : report.dayOfMonth === 3 ? 'rd' : 'th'})`}
                            {' at ' + report.time}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Mail className="w-4 h-4" />
                          <span>{Array.isArray(report.recipients) ? report.recipients.length : 0} recipients</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Download className="w-4 h-4" />
                          <span>{report.format.toUpperCase()}</span>
                        </div>
                        
                        <div>
                          <span className="text-xs text-gray-500">Next run: </span>
                          <span className="font-medium">{formatNextRun(report.nextRun)}</span>
                        </div>
                      </div>
                      
                      {report.lastRun && (
                        <div className="mt-2 text-xs text-gray-500">
                          Last run: {new Date(report.lastRun).toLocaleString()}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleRunNow(report)}
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg"
                        title="Run Now"
                      >
                        <Play className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleToggleActive(report.id)}
                        className={`p-2 rounded-lg ${
                          report.isActive 
                            ? 'text-warning-600 hover:bg-warning-50' 
                            : 'text-success-600 hover:bg-success-50'
                        }`}
                        title={report.isActive ? 'Pause' : 'Resume'}
                      >
                        {report.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      
                      <button
                        onClick={() => setEditingReport(report)}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteReport(report.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Create/Edit Form */}
          {(showCreateForm || editingReport) && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-60 flex items-center justify-center">
              <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-custom-blue">
                    {editingReport ? 'Edit Scheduled Report' : 'Create Scheduled Report'}
                  </h3>
                </div>
                
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Report Name</label>
                    <input
                      type="text"
                      value={editingReport ? editingReport.name : newReport.name}
                      onChange={(e) => editingReport 
                        ? setEditingReport({...editingReport, name: e.target.value})
                        : setNewReport({...newReport, name: e.target.value})
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter report name..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                      <select
                        value={editingReport ? editingReport.type : newReport.type}
                        onChange={(e) => editingReport 
                          ? setEditingReport({...editingReport, type: e.target.value})
                          : setNewReport({...newReport, type: e.target.value})
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        {reportTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
                      <select
                        value={editingReport ? editingReport.format : newReport.format}
                        onChange={(e) => editingReport 
                          ? setEditingReport({...editingReport, format: e.target.value})
                          : setNewReport({...newReport, format: e.target.value})
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        {formats.map(format => (
                          <option key={format.value} value={format.value}>{format.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                      <select
                        value={editingReport ? editingReport.frequency : newReport.frequency}
                        onChange={(e) => editingReport 
                          ? setEditingReport({...editingReport, frequency: e.target.value})
                          : setNewReport({...newReport, frequency: e.target.value})
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        {frequencies.map(freq => (
                          <option key={freq.value} value={freq.value}>{freq.label}</option>
                        ))}
                      </select>
                    </div>
                    
                    {(editingReport ? editingReport.frequency : newReport.frequency) === 'weekly' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Day of Week</label>
                        <select
                          value={editingReport ? editingReport.dayOfWeek : newReport.dayOfWeek}
                          onChange={(e) => editingReport 
                            ? setEditingReport({...editingReport, dayOfWeek: parseInt(e.target.value)})
                            : setNewReport({...newReport, dayOfWeek: parseInt(e.target.value)})
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                          {[0,1,2,3,4,5,6].map(day => (
                            <option key={day} value={day}>{getDayName(day)}</option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    {(editingReport ? editingReport.frequency : newReport.frequency) === 'monthly' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Day of Month</label>
                        <input
                          type="number"
                          min="1"
                          max="31"
                          value={editingReport ? editingReport.dayOfMonth : newReport.dayOfMonth}
                          onChange={(e) => editingReport 
                            ? setEditingReport({...editingReport, dayOfMonth: parseInt(e.target.value)})
                            : setNewReport({...newReport, dayOfMonth: parseInt(e.target.value)})
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                      <input
                        type="time"
                        value={editingReport ? editingReport.time : newReport.time}
                        onChange={(e) => editingReport 
                          ? setEditingReport({...editingReport, time: e.target.value})
                          : setNewReport({...newReport, time: e.target.value})
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Recipients (comma-separated emails)</label>
                    <textarea
                      value={editingReport ? (Array.isArray(editingReport.recipients) ? editingReport.recipients.join(', ') : editingReport.recipients) : newReport.recipients}
                      onChange={(e) => editingReport 
                        ? setEditingReport({...editingReport, recipients: e.target.value})
                        : setNewReport({...newReport, recipients: e.target.value})
                      }
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="user1@company.com, user2@company.com"
                    />
                  </div>
                </div>
                
                <div className="p-6 border-t border-gray-200 flex items-center justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowCreateForm(false);
                      setEditingReport(null);
                    }}
                    className="px-4 py-2 border border-custom-blue text-custom-blue rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={editingReport ? handleUpdateReport : handleCreateReport}
                    className="px-4 py-2 bg-custom-blue text-white rounded-lg hover:bg-primary-600"
                  >
                    {editingReport ? 'Update Schedule' : 'Create Schedule'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduledReports;