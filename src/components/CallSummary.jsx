import React from 'react';
import './CallSummary.css';

/**
 * Displays the call summary at the end of a conversation.
 * Shows appointments booked, preferences mentioned, and optional cost breakdown.
 */
function CallSummary({ summary, toolCalls, onClose }) {
    // Extract relevant information from tool calls
    const bookedAppointments = toolCalls.filter(
        tc => tc.function === 'book_appointment' && tc.status === 'completed'
    );

    const cancelledAppointments = toolCalls.filter(
        tc => tc.function === 'cancel_appointment' && tc.status === 'completed'
    );

    const modifiedAppointments = toolCalls.filter(
        tc => tc.function === 'modify_appointment' && tc.status === 'completed'
    );

    // Calculate estimated costs (bonus feature)
    const calculateCosts = () => {
        // Estimated costs per service (approximate free tier usage)
        const costs = {
            deepgram: { description: 'Speech-to-Text', rate: '$0.0043/min', usage: '~2 min', cost: 0.0086 },
            cartesia: { description: 'Text-to-Speech', rate: '~100 characters', usage: '~500 chars', cost: 0 },
            openrouter: { description: 'LLM (Llama 3.3)', rate: 'Free tier', usage: '~1000 tokens', cost: 0 },
            livekit: { description: 'Voice Infrastructure', rate: 'Free tier', usage: '~2 min', cost: 0 },
        };

        const totalCost = Object.values(costs).reduce((sum, item) => sum + item.cost, 0);

        return { breakdown: costs, total: totalCost };
    };

    const costData = calculateCosts();

    return (
        <div className="call-summary-overlay">
            <div className="call-summary-modal">
                <div className="summary-header">
                    <span className="summary-icon">📋</span>
                    <h2>Call Summary</h2>
                </div>

                <div className="summary-content">
                    {/* Call duration and timestamp */}
                    <div className="summary-meta">
                        <span className="timestamp">
                            📅 {new Date(summary.timestamp).toLocaleString()}
                        </span>
                    </div>

                    {/* Actions taken */}
                    <div className="summary-section">
                        <h3>📌 Actions Taken</h3>

                        {bookedAppointments.length > 0 && (
                            <div className="action-group success">
                                <h4>✅ Booked Appointments ({bookedAppointments.length})</h4>
                                <ul>
                                    {bookedAppointments.map((apt, index) => (
                                        <li key={index}>
                                            <strong>{apt.arguments?.date}</strong> at <strong>{apt.arguments?.time}</strong>
                                            {apt.arguments?.description && (
                                                <span className="description"> - {apt.arguments.description}</span>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {cancelledAppointments.length > 0 && (
                            <div className="action-group warning">
                                <h4>❌ Cancelled Appointments ({cancelledAppointments.length})</h4>
                                <ul>
                                    {cancelledAppointments.map((apt, index) => (
                                        <li key={index}>
                                            Appointment ID: {apt.arguments?.appointment_id}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {modifiedAppointments.length > 0 && (
                            <div className="action-group info">
                                <h4>✏️ Modified Appointments ({modifiedAppointments.length})</h4>
                                <ul>
                                    {modifiedAppointments.map((apt, index) => (
                                        <li key={index}>
                                            Rescheduled to: {apt.arguments?.new_date} at {apt.arguments?.new_time}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {bookedAppointments.length === 0 &&
                            cancelledAppointments.length === 0 &&
                            modifiedAppointments.length === 0 && (
                                <p className="no-actions">No appointment changes were made during this call.</p>
                            )}
                    </div>

                    {/* Total tool calls */}
                    <div className="summary-section">
                        <h3>🔧 Total Actions: {toolCalls.length}</h3>
                    </div>

                    {/* Cost breakdown (bonus) */}
                    <div className="summary-section cost-section">
                        <h3>💰 Estimated Cost Breakdown</h3>
                        <div className="cost-table">
                            {Object.entries(costData.breakdown).map(([key, item]) => (
                                <div key={key} className="cost-row">
                                    <span className="cost-service">{item.description}</span>
                                    <span className="cost-usage">{item.usage}</span>
                                    <span className="cost-amount">
                                        {item.cost === 0 ? 'Free' : `$${item.cost.toFixed(4)}`}
                                    </span>
                                </div>
                            ))}
                            <div className="cost-row total">
                                <span className="cost-service">Total</span>
                                <span className="cost-usage"></span>
                                <span className="cost-amount">
                                    ~${costData.total.toFixed(4)}
                                </span>
                            </div>
                        </div>
                        <p className="cost-note">
                            * Costs are estimates based on average usage. Actual costs may vary.
                        </p>
                    </div>
                </div>

                <div className="summary-footer">
                    <button className="close-button" onClick={onClose}>
                        Close & Return Home
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CallSummary;
