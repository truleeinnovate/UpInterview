import { useState, useEffect, useRef } from 'react';
import { Download, MessageSquare, User, Briefcase, Mic, MicOff } from 'lucide-react';

export function TranscriptViewer({ transcripts, interimTranscript, isTranscribing, onToggleTranscription }) {
  const transcriptEndRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    if (autoScroll && transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcripts, interimTranscript, autoScroll]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setAutoScroll(isAtBottom);
  };

  const exportTranscript = () => {
    const text = transcripts
      .map(t => `[${new Date(t.spoken_at).toLocaleTimeString()}] ${t.speaker_name} (${t.speaker_role}): ${t.text}`)
      .join('\n\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `interview-transcript-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">Live Transcript</h3>
          <span className="px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
            {transcripts.length} messages
          </span>
          {isTranscribing && (
            <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-red-700 bg-red-100 rounded-full">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
              Recording
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTranscription}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
              isTranscribing
                ? 'text-red-600 bg-red-50 hover:bg-red-100'
                : 'text-green-600 bg-green-50 hover:bg-green-100'
            }`}
          >
            {isTranscribing ? (
              <>
                <MicOff className="w-4 h-4" />
                Stop
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                Start
              </>
            )}
          </button>
          <button
            onClick={exportTranscript}
            disabled={transcripts.length === 0}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
        onScroll={handleScroll}
      >
        {transcripts.length === 0 && !interimTranscript && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
            <MessageSquare className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-sm">
              {isTranscribing
                ? 'Listening... Start speaking to see transcript'
                : 'Click "Start" to begin transcription'}
            </p>
            <p className="text-xs mt-1">
              {isTranscribing
                ? 'Speech is being transcribed in real-time'
                : 'Transcription uses your browser\'s built-in speech recognition'}
            </p>
          </div>
        )}

        {transcripts.map((transcript, index) => (
          <div key={transcript.id || index} className="flex gap-3 animate-fadeIn">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              transcript.speaker_role === 'interviewer'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-green-100 text-green-600'
            }`}>
              {transcript.speaker_role === 'interviewer' ? (
                <Briefcase className="w-4 h-4" />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                <span className={`font-medium text-sm ${
                  transcript.speaker_role === 'interviewer' ? 'text-blue-900' : 'text-green-900'
                }`}>
                  {transcript.speaker_name}
                </span>
                <span className="text-xs text-gray-400">
                  {formatTime(transcript.spoken_at)}
                </span>
                {transcript.confidence < 0.8 && (
                  <span className="text-xs text-amber-600" title={`Confidence: ${Math.round(transcript.confidence * 100)}%`}>
                    Low confidence
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {transcript.text}
              </p>
            </div>
          </div>
        ))}

        {interimTranscript && (
          <div className="flex gap-3 opacity-60">
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
              interimTranscript.speaker_role === 'interviewer'
                ? 'bg-blue-100 text-blue-600'
                : 'bg-green-100 text-green-600'
            }`}>
              {interimTranscript.speaker_role === 'interviewer' ? (
                <Briefcase className="w-4 h-4" />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-1">
                <span className={`font-medium text-sm ${
                  interimTranscript.speaker_role === 'interviewer' ? 'text-blue-900' : 'text-green-900'
                }`}>
                  {interimTranscript.speaker_name}
                </span>
                <span className="text-xs text-gray-400">Speaking...</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed italic">
                {interimTranscript.text}
              </p>
            </div>
          </div>
        )}

        <div ref={transcriptEndRef} />
      </div>

      {!autoScroll && (
        <div className="px-4 py-2 border-t bg-gray-50">
          <button
            onClick={() => {
              setAutoScroll(true);
              transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Scroll to bottom
          </button>
        </div>
      )}
    </div>
  );
}
