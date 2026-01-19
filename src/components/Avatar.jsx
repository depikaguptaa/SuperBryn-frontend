import { useState, useEffect } from 'react';
import './Avatar.css';

/**
 * Avatar Component
 * Shows an animated avatar that reacts to the agent's speaking state.
 * Uses a simple animated design as fallback.
 */
export default function Avatar({ isSpeaking = false, agentName = 'AI Assistant' }) {
    const [wavesActive, setWavesActive] = useState([false, false, false, false, false]);

    // Animate waves when speaking
    useEffect(() => {
        if (!isSpeaking) {
            setWavesActive([false, false, false, false, false]);
            return;
        }

        const interval = setInterval(() => {
            setWavesActive([
                Math.random() > 0.3,
                Math.random() > 0.3,
                Math.random() > 0.3,
                Math.random() > 0.3,
                Math.random() > 0.3,
            ]);
        }, 150);

        return () => clearInterval(interval);
    }, [isSpeaking]);

    return (
        <div className="avatar-container">
            <div className={`fallback-avatar ${isSpeaking ? 'speaking' : ''}`}>
                {/* Ripple effect when speaking */}
                <div className="avatar-glow" />
                <div className="avatar-glow" style={{ animationDelay: '0.5s' }} />

                {/* Main avatar circle with microphone icon */}
                <div className="avatar-circle" />

                {/* Sound wave visualization */}
                <div className="sound-waves">
                    {wavesActive.map((active, i) => (
                        <div
                            key={i}
                            className={`wave ${active ? 'active' : ''}`}
                        />
                    ))}
                </div>
            </div>

            <span className="avatar-label">{agentName}</span>
        </div>
    );
}
