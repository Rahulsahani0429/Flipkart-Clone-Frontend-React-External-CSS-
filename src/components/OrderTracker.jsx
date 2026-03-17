import React from 'react';
import { normalizeStatus, STATUS_LABELS, STATUS_STEPS } from '../utils/statusConfig';
import './OrderTracker.css';

/**
 * OrderTracker – horizontal progress stepper used on Order Details page.
 *
 * Reads the canonical status via normalizeStatus() so mixed-case legacy
 * strings ("Shipped", "shipped", "SHIPPED") all resolve to the same step.
 * Step order is derived from STATUS_STEPS in statusConfig so it is always
 * consistent with any other status-aware component in the app.
 */
const OrderTracker = ({ order, status, isCancelled }) => {
    // Canonical enum key from whatever raw string the API returns
    const normalizedStatus = normalizeStatus(status);

    // Only show steps relevant to the forward progress (exclude terminal
    // states CANCELLED / RETURN_REQUESTED / RETURNED / REFUNDED which are
    // handled separately in the parent).
    const FORWARD_STEPS = [
        'ORDER_PLACED',
        'ORDER_CONFIRMED',
        'PROCESSING',
        'SHIPPED',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
    ];

    // Per-step timestamps pulled from the order object
    const STEP_TIMESTAMPS = {
        ORDER_PLACED:     order?.createdAt,
        ORDER_CONFIRMED:  order?.confirmedAt || order?.createdAt,
        PROCESSING:       order?.processingAt,
        SHIPPED:          order?.shippedAt,
        OUT_FOR_DELIVERY: order?.outForDeliveryAt,
        DELIVERED:        order?.deliveredAt,
    };

    // Derive current step index from the normalized status
    const currentStep = FORWARD_STEPS.indexOf(
        FORWARD_STEPS.includes(normalizedStatus) ? normalizedStatus : 'ORDER_PLACED'
    );

    return (
        <div className={`order-tracker-new ${isCancelled ? 'is-cancelled' : ''}`}>
            <div className="tracker-line-container">
                <div className="tracker-line-bg"></div>
                {!isCancelled && (
                    <div
                        className="tracker-line-progress"
                        style={{ width: `${(currentStep / (FORWARD_STEPS.length - 1)) * 100}%` }}
                    ></div>
                )}

                {FORWARD_STEPS.map((stepKey, index) => {
                    const isCompleted = index < currentStep && !isCancelled;
                    const isActive    = index === currentStep && !isCancelled;
                    const isFuture    = index > currentStep || isCancelled;
                    const isDeliveredStep = stepKey === 'DELIVERED';
                    const timestamp   = STEP_TIMESTAMPS[stepKey];

                    return (
                        <div
                            key={stepKey}
                            className={`tracker-node ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} ${isFuture ? 'future' : ''}`}
                        >
                            <div className="node-circle">
                                {isCompleted ? (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                ) : isDeliveredStep && !isActive ? (
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                                    </svg>
                                ) : isActive ? (
                                    <div className="active-pulse"></div>
                                ) : null}
                            </div>
                            <div className="node-info">
                                <span className="node-label">{STATUS_LABELS[stepKey]}</span>
                                {timestamp && (
                                    <span className="node-time">
                                        {new Date(timestamp).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderTracker;
