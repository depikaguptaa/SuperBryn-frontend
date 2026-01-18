import React, { useState, useEffect, useRef } from 'react';
import './Avatar.css';

/**
 * Avatar component that displays the Beyond Presence avatar
 * or a fallback animated avatar when Beyond Presence is not available.
 */
function Avatar({ isActive }) {
    const [useBeyondPresence, setUseBeyondPresence] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const audioContextRef = useRef(null);
    const analyserRef = useRef(null);

    // Beyond Presence API key from environment
    const beyondPresenceApiKey = import.meta.env.VITE_BEYOND_PRESENCE_API_KEY;

    useEffect(() => {
        // Check if Beyond Presence is configured
        if (beyondPresenceApiKey && beyondPresenceApiKey !== 'your_beyond_presence_key') {
            setUseBeyondPresence(true);
        }
    }, [beyondPresenceApiKey]);

    // Simulate speaking detection based on audio output
    useEffect(() => {
        if (!isActive) {
            setIsSpeaking(false);
            return;
        }

        // Simple animation toggle for demo
        // In production, this would analyze actual audio levels
        const interval = setInterval(() => {
            setIsSpeaking(prev => Math.random() > 0.3);
        }, 200);

        return () => clearInterval(interval);
    }, [isActive]);

    // Fallback animated avatar
    const FallbackAvatar = () => (
        <div className={`fallback-avatar ${isActive ? 'active' : ''} ${isSpeaking ? 'speaking' : ''}`}>
            <div className="avatar-circle">
                <div className="avatar-face">
                    <div className="eyes">
                        <div className="eye left"></div>
                        <div className="eye right"></div>
                    </div>
                    <div className={`mouth ${isSpeaking ? 'speaking' : ''}`}></div>
                </div>
                <div className="avatar-glow"></div>
            </div>
            <div className="sound-waves">
                {[...Array(5)].map((_, i) => (
                    <div
                        key={i}
                        className={`wave ${isSpeaking ? 'active' : ''}`}
                        style={{ animationDelay: `${i * 0.1}s` }}
                    />
                ))}
            </div>
        </div>
    );

    // Beyond Presence iframe avatar
    const BeyondPresenceAvatar = () => (
        <div className="beyond-presence-container">
            <iframe
                src={`https://widget.beyondpresence.ai/avatar?api_key=${beyondPresenceApiKey}`}
                title="AI Avatar"
                className="beyond-presence-iframe"
                allow="microphone; camera"
                frameBorder="0"
            />
        </div>
    );

    return (
        <div className="avatar-container">
            {useBeyondPresence ? <BeyondPresenceAvatar /> : <FallbackAvatar />}
            {!useBeyondPresence && (
                <div className="avatar-label">AI Assistant</div>
            )}
        </div>
    );
}

export default Avatar;
