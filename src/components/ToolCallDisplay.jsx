import React from 'react';
import './ToolCallDisplay.css';

/**
 * Displays tool calls made by the AI agent in real-time.
 */
function ToolCallDisplay({ toolCalls }) {
    // Map function names to icons
    const functionIcons = {
        identify_user: '👤',
        fetch_slots: '📅',
        book_appointment: '✅',
        retrieve_appointments: '📋',
        cancel_appointment: '❌',
        modify_appointment: '✏️',
        end_conversation: '👋',
    };

    // Format function name for display
    const formatFunctionName = (name) => {
        return name
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    // Format arguments for display
    const formatArguments = (args) => {
        if (!args || Object.keys(args).length === 0) return null;

        return Object.entries(args).map(([key, value]) => (
            <span key={key} className="arg">
                <span className="arg-key">{key}:</span>
                <span className="arg-value">{String(value)}</span>
            </span>
        ));
    };

    if (toolCalls.length === 0) {
        return (
            <div className="tool-call-display empty">
                <div className="empty-state">
                    <span className="empty-icon">🎯</span>
                    <p>Waiting for agent actions...</p>
                    <p className="hint">The agent will perform actions like booking appointments here</p>
                </div>
            </div>
        );
    }

    return (
        <div className="tool-call-display">
            {toolCalls.map((call, index) => (
                <div
                    key={index}
                    className={`tool-call ${call.status}`}
                >
                    <div className="tool-call-header">
                        <span className="tool-icon">
                            {functionIcons[call.function] || '🔧'}
                        </span>
                        <span className="tool-name">
                            {formatFunctionName(call.function)}
                        </span>
                        <span className={`status-badge ${call.status}`}>
                            {call.status === 'running' ? (
                                <>
                                    <span className="spinner"></span>
                                    Running
                                </>
                            ) : (
                                <>
                                    <span className="check">✓</span>
                                    Done
                                </>
                            )}
                        </span>
                    </div>

                    {call.arguments && Object.keys(call.arguments).length > 0 && (
                        <div className="tool-call-args">
                            {formatArguments(call.arguments)}
                        </div>
                    )}

                    {call.status === 'completed' && call.result && (
                        <div className="tool-call-result">
                            <span className="result-label">Result:</span>
                            <span className="result-text">
                                {call.result.length > 100
                                    ? call.result.substring(0, 100) + '...'
                                    : call.result}
                            </span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

export default ToolCallDisplay;
