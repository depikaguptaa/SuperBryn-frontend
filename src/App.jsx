import React, { useState, useCallback, useEffect } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useRoomContext,
  useDataChannel,
  useConnectionState,
  ConnectionState,
} from '@livekit/components-react';
import '@livekit/components-styles';
import './App.css';
import Avatar from './components/Avatar';
import ToolCallDisplay from './components/ToolCallDisplay';
import CallSummary from './components/CallSummary';

// Token server URL - update this for production
const TOKEN_SERVER_URL = import.meta.env.VITE_TOKEN_SERVER_URL || 'http://localhost:8080';

function VoiceAgentRoom({ onCallEnd }) {
  const room = useRoomContext();
  const connectionState = useConnectionState();
  const [toolCalls, setToolCalls] = useState([]);
  const [callSummary, setCallSummary] = useState(null);
  const [isCallActive, setIsCallActive] = useState(true);
  
  // Listen for tool call events from the agent
  const onDataReceived = useCallback((payload, participant, kind, topic) => {
    if (topic === 'tool_calls') {
      try {
        const data = JSON.parse(new TextDecoder().decode(payload));
        
        if (data.type === 'tool_call_start') {
          setToolCalls(prev => [...prev, { ...data, status: 'running' }]);
        } else if (data.type === 'tool_call_end') {
          setToolCalls(prev => 
            prev.map(tc => 
              tc.function === data.function && tc.status === 'running'
                ? { ...tc, status: 'completed', result: data.result }
                : tc
            )
          );
          
          // Check if conversation ended
          if (data.function === 'end_conversation') {
            setCallSummary({
              result: data.result,
              timestamp: new Date().toISOString()
            });
            setIsCallActive(false);
          }
        }
      } catch (e) {
        console.error('Failed to parse tool call data:', e);
      }
    }
  }, []);
  
  useDataChannel('tool_calls', onDataReceived);
  
  const handleEndCall = useCallback(async () => {
    if (room) {
      await room.disconnect();
      setIsCallActive(false);
      onCallEnd?.();
    }
  }, [room, onCallEnd]);
  
  return (
    <div className="voice-agent-room">
      {/* Audio renderer for agent voice */}
      <RoomAudioRenderer />
      
      {/* Main content area */}
      <div className="room-content">
        {/* Avatar section */}
        <div className="avatar-section">
          <Avatar isActive={isCallActive && connectionState === ConnectionState.Connected} />
          
          {/* Connection status */}
          <div className={`connection-status ${connectionState.toLowerCase()}`}>
            {connectionState === ConnectionState.Connected ? (
              <>
                <span className="status-dot"></span>
                Connected - Speak to the AI
              </>
            ) : connectionState === ConnectionState.Connecting ? (
              'Connecting...'
            ) : (
              'Disconnected'
            )}
          </div>
        </div>
        
        {/* Tool calls section */}
        <div className="tools-section">
          <h3>🔧 Agent Actions</h3>
          <ToolCallDisplay toolCalls={toolCalls} />
        </div>
      </div>
      
      {/* Call controls */}
      <div className="call-controls">
        <button 
          className="end-call-button" 
          onClick={handleEndCall}
          disabled={connectionState !== ConnectionState.Connected}
        >
          <span className="icon">📞</span>
          End Call
        </button>
      </div>
      
      {/* Call summary modal */}
      {callSummary && (
        <CallSummary 
          summary={callSummary} 
          toolCalls={toolCalls}
          onClose={() => onCallEnd?.()}
        />
      )}
    </div>
  );
}

function App() {
  const [isInCall, setIsInCall] = useState(false);
  const [token, setToken] = useState(null);
  const [serverUrl, setServerUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const startCall = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Generate a unique identity
      const identity = `user-${Date.now()}`;
      const room = `voice-agent-room-${Date.now()}`;
      
      // Get token from token server
      const response = await fetch(
        `${TOKEN_SERVER_URL}/token?room=${room}&identity=${identity}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to get access token');
      }
      
      const data = await response.json();
      setToken(data.token);
      setServerUrl(data.url);
      setIsInCall(true);
    } catch (err) {
      setError(err.message);
      console.error('Failed to start call:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const endCall = () => {
    setIsInCall(false);
    setToken(null);
  };
  
  if (isInCall && token && serverUrl) {
    return (
      <div className="app">
        <LiveKitRoom
          token={token}
          serverUrl={serverUrl}
          connect={true}
          audio={true}
          video={false}
        >
          <VoiceAgentRoom onCallEnd={endCall} />
        </LiveKitRoom>
      </div>
    );
  }
  
  return (
    <div className="app">
      <div className="landing">
        {/* Hero section */}
        <div className="hero">
          <div className="logo">🎙️</div>
          <h1>AI Voice Assistant</h1>
          <p className="subtitle">
            Book and manage your appointments with our intelligent voice agent
          </p>
        </div>
        
        {/* Features */}
        <div className="features">
          <div className="feature">
            <span className="feature-icon">📅</span>
            <h3>Book Appointments</h3>
            <p>Schedule appointments using natural voice commands</p>
          </div>
          <div className="feature">
            <span className="feature-icon">🔍</span>
            <h3>View Schedule</h3>
            <p>Check your upcoming appointments anytime</p>
          </div>
          <div className="feature">
            <span className="feature-icon">✏️</span>
            <h3>Modify & Cancel</h3>
            <p>Easily change or cancel existing bookings</p>
          </div>
        </div>
        
        {/* Start button */}
        <button 
          className="start-call-button"
          onClick={startCall}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="loading">Connecting...</span>
          ) : (
            <>
              <span className="icon">🎤</span>
              Start Voice Call
            </>
          )}
        </button>
        
        {error && (
          <div className="error">
            <p>⚠️ {error}</p>
            <p className="error-hint">Make sure the backend server is running</p>
          </div>
        )}
        
        {/* Info */}
        <div className="info">
          <p>🔒 Secure • 🎯 Accurate • ⚡ Fast</p>
        </div>
      </div>
    </div>
  );
}

export default App;
