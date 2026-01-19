import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  LiveKitRoom,
  RoomAudioRenderer,
  VideoTrack,
  useRoomContext,
  useDataChannel,
  useConnectionState,
  useRemoteParticipants,
  useTracks,
  ConnectionState,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
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
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Track room connection state manually for reliability
  useEffect(() => {
    if (!room) return;

    const handleConnected = () => {
      console.log('Room connected!');
      setIsConnected(true);
    };
    const handleDisconnected = () => {
      console.log('Room disconnected!');
      setIsConnected(false);
    };

    // Check initial state
    if (room.state === 'connected') {
      setIsConnected(true);
    }

    room.on('connected', handleConnected);
    room.on('disconnected', handleDisconnected);

    return () => {
      room.off('connected', handleConnected);
      room.off('disconnected', handleDisconnected);
    };
  }, [room]);

  // Combine hook state with manual tracking
  const actuallyConnected = isConnected || connectionState === ConnectionState.Connected;

  // Get video tracks from remote participants (Beyond Presence avatar)
  const videoTracks = useTracks([Track.Source.Camera], { onlySubscribed: true });

  // Find the avatar's video track (not the user's)
  const avatarVideoTrack = useMemo(() => {
    return videoTracks.find(track =>
      track.participant?.identity?.includes('bey') ||
      track.participant?.identity?.includes('avatar') ||
      track.participant?.identity?.includes('agent')
    );
  }, [videoTracks]);

  // Detect agent speaking state from audio activity
  const audioTracks = useTracks([Track.Source.Microphone], { onlySubscribed: true });

  useEffect(() => {
    const agentAudio = audioTracks.find(t =>
      t.participant?.identity?.includes('agent') ||
      t.participant?.identity?.includes('bey')
    );

    if (agentAudio?.publication?.track) {
      const track = agentAudio.publication.track;
      const handleSpeaking = () => setIsSpeaking(true);
      const handleNotSpeaking = () => setIsSpeaking(false);

      track.on('audioLevelChanged', (level) => {
        if (level > 0.01) {
          setIsSpeaking(true);
        } else {
          setIsSpeaking(false);
        }
      });
    }
  }, [audioTracks]);

  // Listen for tool call events from the agent
  const onDataReceived = useCallback((payload, participant, kind, topic) => {
    console.log('Data received:', { topic, payload: payload ? 'has data' : 'empty', participant: participant?.identity });

    if (topic === 'tool_calls') {
      try {
        const data = JSON.parse(new TextDecoder().decode(payload));
        console.log('Tool call event:', data);

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
          {/* Show Beyond Presence video if available, otherwise show fallback */}
          {avatarVideoTrack ? (
            <div className="avatar-video-container">
              <VideoTrack trackRef={avatarVideoTrack} />
            </div>
          ) : actuallyConnected ? (
            <div className="avatar-loading">
              <Avatar
                isSpeaking={isSpeaking}
                agentName="AI Assistant"
              />
              <div className="avatar-loading-text">Loading AI Avatar...</div>
            </div>
          ) : (
            <Avatar
              isSpeaking={isSpeaking}
              agentName="AI Assistant"
            />
          )}

          {/* Connection status */}
          <div className={`connection-status ${actuallyConnected ? 'connected' : 'disconnected'}`}>
            {actuallyConnected ? (
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
          disabled={!actuallyConnected}
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
