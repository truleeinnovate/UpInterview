import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Shield, AlertTriangle, TrendingUp, Eye, Users, Monitor, Camera, X } from 'lucide-react';

function ProctoringReport() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('proctoring_sessions')
      .select(`
        *,
        interviews (title, description, scheduled_date)
      `)
      .order('started_at', { ascending: false });

    if (data) {
      setSessions(data);
    }
    setLoading(false);
  };

  const fetchIncidents = async (sessionId) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    const { data } = await supabase
      .from('proctoring_incidents')
      .select('*')
      .eq('interview_id', session.interview_id)
      .order('timestamp', { ascending: false });

    if (data) {
      setIncidents(data);
    }
  };

  const getRiskLevel = (score) => {
    if (score >= 80) return { level: 'Critical', color: 'bg-red-100 text-red-800 border-red-300' };
    if (score >= 50) return { level: 'High', color: 'bg-orange-100 text-orange-800 border-orange-300' };
    if (score >= 25) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
    return { level: 'Low', color: 'bg-green-100 text-green-800 border-green-300' };
  };

  const getSeverityIcon = (type) => {
    switch (type) {
      case 'NO_FACE': return <Camera className="w-4 h-4" />;
      case 'MULTIPLE_FACES': return <Users className="w-4 h-4" />;
      case 'LOOKING_AWAY': return <Eye className="w-4 h-4" />;
      case 'TAB_SWITCH':
      case 'WINDOW_BLUR': return <Monitor className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const formatDuration = (start, end) => {
    if (!end) return 'In Progress';
    const diff = new Date(end) - new Date(start);
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'rgb(33, 121, 137)' }}></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Shield className="w-8 h-8" style={{ color: 'rgb(33, 121, 137)' }} />
          Proctoring Reports
        </h1>
        <p className="text-gray-600 mt-1">Review security incidents and monitoring data from interviews</p>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No proctoring sessions yet</h3>
          <p className="text-gray-600">Proctoring data will appear here after interviews are conducted</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {sessions.map((session) => {
            const risk = getRiskLevel(session.risk_score);
            return (
              <div
                key={session.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-800 mb-1">
                        {session.interviews?.title || 'Interview'}
                      </h3>
                      <p className="text-sm text-gray-600">{session.interviews?.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>
                          Started: {new Date(session.started_at).toLocaleString()}
                        </span>
                        <span>•</span>
                        <span>
                          Duration: {formatDuration(session.started_at, session.ended_at)}
                        </span>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-lg border-2 font-semibold ${risk.color}`}>
                      {risk.level} Risk
                      <div className="text-2xl font-bold text-center mt-1">
                        {session.risk_score}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                    <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                      <p className="text-xs text-red-600 font-medium mb-1">Critical</p>
                      <p className="text-2xl font-bold text-red-700">{session.critical_incidents}</p>
                    </div>
                    <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                      <p className="text-xs text-orange-600 font-medium mb-1">High</p>
                      <p className="text-2xl font-bold text-orange-700">{session.high_incidents}</p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                      <p className="text-xs text-yellow-600 font-medium mb-1">Medium</p>
                      <p className="text-2xl font-bold text-yellow-700">{session.medium_incidents}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="text-xs text-blue-600 font-medium mb-1">Low</p>
                      <p className="text-2xl font-bold text-blue-700">{session.low_incidents}</p>
                    </div>
                    <div className="p-3 rounded-lg border-2" style={{ backgroundColor: 'rgba(33, 121, 137, 0.1)', borderColor: 'rgba(33, 121, 137, 0.3)' }}>
                      <p className="text-xs font-medium mb-1" style={{ color: 'rgb(33, 121, 137)' }}>Tab Switches</p>
                      <p className="text-2xl font-bold" style={{ color: 'rgb(33, 121, 137)' }}>{session.tab_switches}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setSelectedSession(session);
                        fetchIncidents(session.id);
                      }}
                      className="flex-1 text-white px-4 py-2 rounded-lg hover:opacity-90 transition font-medium"
                      style={{ backgroundColor: 'rgb(33, 121, 137)' }}
                    >
                      View Detailed Report
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Report Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                Proctoring Incident Report
              </h2>
              <button
                onClick={() => {
                  setSelectedSession(null);
                  setIncidents([]);
                }}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-800 mb-2">
                  {selectedSession.interviews?.title}
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Started:</span>
                    <span className="ml-2 font-medium">
                      {new Date(selectedSession.started_at).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <span className="ml-2 font-medium">
                      {formatDuration(selectedSession.started_at, selectedSession.ended_at)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total Incidents:</span>
                    <span className="ml-2 font-medium">{selectedSession.total_incidents}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Risk Score:</span>
                    <span className="ml-2 font-medium">{selectedSession.risk_score}/100</span>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Incident Timeline ({incidents.length} incidents)
              </h3>

              {incidents.length === 0 ? (
                <p className="text-center py-8 text-gray-500">No incidents recorded</p>
              ) : (
                <div className="space-y-3">
                  {incidents.map((incident, idx) => (
                    <div
                      key={idx}
                      className="border rounded-lg p-4 border-l-4"
                      style={{
                        borderLeftColor:
                          incident.severity === 'critical' ? '#ef4444' :
                          incident.severity === 'high' ? '#f97316' :
                          incident.severity === 'medium' ? '#eab308' : '#3b82f6'
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded ${
                          incident.severity === 'critical' ? 'bg-red-100 text-red-600' :
                          incident.severity === 'high' ? 'bg-orange-100 text-orange-600' :
                          incident.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {getSeverityIcon(incident.incident_type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-gray-800">{incident.message}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(incident.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded font-medium ${
                              incident.severity === 'critical' ? 'bg-red-100 text-red-800' :
                              incident.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                              incident.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {incident.severity.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-600 mt-2">
                            Type: <span className="font-medium">{incident.incident_type}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProctoringReport;
