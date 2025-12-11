import { useState, useEffect } from 'react';
import { AlertTriangle, X, Eye, Users, Monitor, Camera, Clock, User, Shield, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

function ProctoringAlerts({ incidents, onDismiss }) {
  const [visibleIncidents, setVisibleIncidents] = useState([]);

  useEffect(() => {
    if (incidents.length > 0) {
      const latest = incidents[incidents.length - 1];
      setVisibleIncidents(prev => [...prev, { ...latest, id: Date.now() }]);

      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        setVisibleIncidents(prev => prev.filter(i => i.id !== Date.now()));
      }, 5000);
    }
  }, [incidents]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 border-red-500 text-red-800';
      case 'high': return 'bg-orange-100 border-orange-500 text-orange-800';
      case 'medium': return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'low': return 'bg-blue-100 border-blue-500 text-blue-800';
      default: return 'bg-gray-100 border-gray-500 text-gray-800';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'NO_FACE': return <Camera className="w-5 h-5" />;
      case 'MULTIPLE_FACES': return <Users className="w-5 h-5" />;
      case 'LOOKING_AWAY': return <Eye className="w-5 h-5" />;
      case 'TAB_SWITCH':
      case 'WINDOW_BLUR': return <Monitor className="w-5 h-5" />;
      default: return <AlertTriangle className="w-5 h-5" />;
    }
  };

  const handleDismiss = (id) => {
    setVisibleIncidents(prev => prev.filter(i => i.id !== id));
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2 max-w-md">
      {visibleIncidents.map((incident) => (
        <div
          key={incident.id}
          className={`${getSeverityColor(incident.severity)} border-l-4 p-4 rounded-lg shadow-lg animate-slide-in flex items-start gap-3`}
        >
          <div className="mt-0.5">
            {getIcon(incident.type)}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">{incident.message}</p>
            <p className="text-xs mt-1 opacity-75">
              {new Date(incident.timestamp).toLocaleTimeString()}
            </p>
          </div>
          <button
            onClick={() => handleDismiss(incident.id)}
            className="p-1 hover:bg-black hover:bg-opacity-10 rounded transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

function ProctoringPanel({ statistics, incidents, sessionId, participants, localParticipant, interview }) {
  const [sessionInfo, setSessionInfo] = useState(null);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    const loadSessionInfo = async () => {
      if (!sessionId) return;

      const { data } = await supabase
        .from('proctoring_sessions')
        .select('*')
        .eq('id', sessionId)
        .maybeSingle();

      if (data) {
        setSessionInfo(data);
      }
    };

    loadSessionInfo();
  }, [sessionId]);

  const getSeverityCount = (severity) => {
    return incidents.filter(i => i.severity === severity).length;
  };

  const participantsList = participants ? [...participants.values()] : [];
  const candidate = participantsList.find(p => p.displayName !== localParticipant?.displayName);
  const interviewer = localParticipant;

  const getInterviewDuration = () => {
    if (!sessionInfo?.started_at) return 'N/A';
    const start = new Date(sessionInfo.started_at);
    const now = new Date();
    const diffMs = now - start;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just started';
    if (diffMins < 60) return `${diffMins} min`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-4 py-3 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" style={{ color: 'rgb(33, 121, 137)' }} />
            <h3 className="font-semibold text-gray-800">Interview Session</h3>
            {sessionId && (
              <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Active
              </span>
            )}
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 mt-1 text-gray-500" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600 mb-0.5">Candidate</p>
                  <p className="font-medium text-gray-800">{candidate?.displayName || interview.candidate_name}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 mt-1 text-gray-500" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600 mb-0.5">Interviewer</p>
                  <p className="font-medium text-gray-800">{interviewer?.displayName || 'You'}</p>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 mt-1 text-gray-500" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600 mb-0.5">Duration</p>
                  <p className="font-medium text-gray-800">{getInterviewDuration()}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 mt-1 text-gray-500" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600 mb-0.5">Started At</p>
                  <p className="font-medium text-gray-800">
                    {sessionInfo?.started_at
                      ? new Date(sessionInfo.started_at).toLocaleTimeString()
                      : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t">
            <div className="flex items-center gap-3 text-sm">
              <span className="text-gray-600">Position:</span>
              <span className="font-medium text-gray-800">{interview.position}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" style={{ color: 'rgb(33, 121, 137)' }} />
            <h3 className="font-semibold text-gray-800">Proctoring Status</h3>
          </div>
          <div className="flex items-center gap-3">
            {getSeverityCount('critical') > 0 && (
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded">
                {getSeverityCount('critical')} Critical
              </span>
            )}
            {getSeverityCount('high') > 0 && (
              <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded">
                {getSeverityCount('high')} High
              </span>
            )}
            <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </div>
        </button>

        {isExpanded && (
          <div className="p-4 border-t space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-600 mb-1">Tab Switches</p>
                <p className="text-2xl font-bold text-gray-800">{statistics.tabSwitches || 0}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-xs text-gray-600 mb-1">Total Incidents</p>
                <p className="text-2xl font-bold text-gray-800">{incidents.length}</p>
              </div>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              <h4 className="text-sm font-semibold text-gray-700">Recent Incidents</h4>
              {incidents.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">No incidents detected</p>
              ) : (
                incidents.slice(-10).reverse().map((incident, idx) => {
                  const hasUrl = incident.metadata?.url;
                  const isTabSwitchType = incident.incident_type === 'TAB_SWITCH' || incident.incident_type === 'WINDOW_BLUR';

                  // Debug logging
                  if (isTabSwitchType) {
                    console.log('Tab switch incident:', {
                      type: incident.incident_type,
                      hasMetadata: !!incident.metadata,
                      metadata: incident.metadata,
                      hasUrl
                    });
                  }

                  return (
                    <div
                      key={idx}
                      className="bg-gray-50 p-3 rounded text-sm border-l-2"
                      style={{
                        borderColor: incident.severity === 'critical' ? '#ef4444' :
                                    incident.severity === 'high' ? '#f97316' :
                                    incident.severity === 'medium' ? '#eab308' : '#3b82f6'
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{incident.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(incident.timestamp).toLocaleString()}
                          </p>
                          {hasUrl && isTabSwitchType && (
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <p className="text-xs text-gray-600 mb-1">Active URL:</p>
                              <p className="text-xs text-blue-600 break-all font-mono bg-white px-2 py-1 rounded">
                                {incident.metadata.url}
                              </p>
                            </div>
                          )}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          incident.severity === 'critical' ? 'bg-red-100 text-red-800' :
                          incident.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                          incident.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {incident.severity}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { ProctoringAlerts, ProctoringPanel };
