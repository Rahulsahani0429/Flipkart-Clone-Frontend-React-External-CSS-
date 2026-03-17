import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import OrderTracker from '../components/OrderTracker';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-toastify';
import { getStatusLabel, normalizeStatus } from '../utils/statusConfig';
import './OrderDetails.css';


const OrderDetails = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const socket = useSocket();
    
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [returnReason, setReturnReason] = useState("");
    const [submittingReturn, setSubmittingReturn] = useState(false);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.get(`${API_BASE_URL}/api/orders/${orderId}`, config);
            setOrder(data);
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load order details');
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && orderId) {
            fetchOrder();
        }
    }, [orderId, user]);

    useEffect(() => {
        if (socket && orderId) {
            setLoading(true);
            // Request order details via socket
            socket.emit('getOrderDetails', orderId);

            const handleOrderDetails = (response) => {
                if (response.success) {
                    setOrder(response.data);
                    setError('');
                } else {
                    setError(response.message || 'Failed to load order details');
                }
                setLoading(false);
            };

            socket.on('orderDetailsResponse', handleOrderDetails);

            socket.on('orderUpdated', (updatedOrder) => {
                if (updatedOrder._id === orderId) {
                    setOrder(prev => ({ ...prev, ...updatedOrder }));
                    if (updatedOrder.orderStatus !== order?.orderStatus) {
                        toast.info(`Your order status has been updated to: ${updatedOrder.orderStatus}`);
                    }
                    if (updatedOrder.receiptSent && !order?.receiptSent) {
                        toast.success('Your payment receipt has been sent!');
                    }
                }
            });

            return () => {
                socket.off('orderDetailsResponse', handleOrderDetails);
                socket.off('orderUpdated');
            };
        }
    }, [socket, orderId]);

    const handleCancelOrder = async () => {
        try {
            setCancelling(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            await axios.post(`${API_BASE_URL}/api/user/orders/${orderId}/cancel`, {}, config);
            toast.success('Cancellation request processed. Check your email for updates.');
            setShowCancelModal(false);
            fetchOrder();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to cancel order');
        } finally {
            setCancelling(false);
        }
    };

    const handleReturnProduct = async () => {
        if (!returnReason) {
            toast.error("Please select a reason for return");
            return;
        }
        setSubmittingReturn(true);
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.post(`${API_BASE_URL}/api/user/orders/${orderId}/return`, { reason: returnReason }, config);
            setOrder(data);
            toast.success("Return request submitted successfully. Check your email for updates.");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to submit return request");
        } finally {
            setSubmittingReturn(false);
        }
    };

    const handleDownloadInvoice = async () => {
        try {
            setDownloading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
                responseType: 'blob',
            };
            const { data } = await axios.get(`${API_BASE_URL}/api/orders/${orderId}/invoice`, config);
            
            // Create a blob URL and trigger download
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Invoice-${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            
            toast.success('Invoice downloaded successfully');
        } catch (err) {
            console.error('Invoice download error:', err);
            // Since responseType is blob, the error message might be hidden in the blob
            if (err.response && err.response.data instanceof Blob) {
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const errorData = JSON.parse(reader.result);
                        toast.error(errorData.message || 'Unable to download invoice. Please try again.');
                    } catch (e) {
                        // Not JSON, probably HTML 404
                        toast.error('Unable to download invoice. (Server returned 404/Error)');
                    }
                };
                reader.readAsText(err.response.data);
            } else {
                toast.error(err.response?.data?.message || 'Unable to download invoice. Please try again.');
            }
        } finally {
            setDownloading(false);
        }
    };

    if (loading) return (
        <div className="details-loader-container">
            <div className="details-spinner"></div>
            <p>Loading Order Details...</p>
        </div>
    );

    if (error) return (
        <div className="details-error-container">
            <div className="error-card">
                <h2>Error</h2>
                <p>{error}</p>
                <button onClick={() => navigate('/profile/orders')} className="details-back-btn">Go to My Orders</button>
            </div>
        </div>
    );

    if (!order || order.orderItems.length === 0) return (
        <div className="details-error-container">
            <div className="error-card">
                <h2>No items found</h2>
                <p>No items found in this order.</p>
                <button onClick={() => navigate('/profile/orders')} className="details-back-btn">Go to Orders</button>
            </div>
        </div>
    );

    const isDelivered = order.orderStatus === 'DELIVERED' || order.isDelivered;
    const deliveryDate = order.deliveredAt ? new Date(order.deliveredAt) : null;
    const hoursSinceDelivery = deliveryDate ? (new Date() - deliveryDate) / (1000 * 60 * 60) : 0;
    
    const canCancel = order.orderStatus !== 'CANCELLED' && 
                      order.cancellationStatus === 'NONE' &&
                      (order.orderStatus !== 'DELIVERED' || hoursSinceDelivery <= 24);

    const isRequestOnly = order.orderStatus === 'SHIPPED' || order.orderStatus === 'OUT_FOR_DELIVERY';

    return (
        <div className="order-details-wrapper">
            <div className="order-details-container">
                <div className="details-header">
                    <button onClick={() => navigate(-1)} className="back-link">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width: '20px', verticalAlign: 'middle'}}><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                        &nbsp;Back
                    </button>
                    <h1>Order Details</h1>
                </div>

                <div className="details-main-content">
                    <div className="details-left-side">
                        {/* Tracker Section */}
                        <div className="details-card tracker-card">
                            <div className="card-header">
                                <h3 className="delivery-status">
                                    {order.orderStatus === 'CANCELLED' || normalizeStatus(order.orderStatus) === 'CANCELLED' ? (
                                        <span className="cancelled-text">Status: Cancelled</span>
                                    ) : normalizeStatus(order.orderStatus) === 'DELIVERED' ? (
                                        `Expected Delivery: Delivered ✓`
                                    ) : order.expectedDelivery ? (
                                        `Expected Delivery: ${new Date(order.expectedDelivery).toLocaleDateString('en-GB')}`
                                    ) : (
                                        `Status: ${getStatusLabel(normalizeStatus(order.orderStatus))}`
                                    )}
                                </h3>
                                <div className="order-id-capsule">
                                    <span className="id-label">ID:</span>
                                    <span className="id-value">#{order._id}</span>
                                </div>
                            </div>
                            <div className="tracker-inner-padding">
                                {order.orderStatus === 'CANCELLED' ? (
                                    <div className="cancelled-badge-large">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                                        ORDER CANCELLED
                                    </div>
                                ) : (
                                    <OrderTracker 
                                        order={order}
                                        status={order.orderStatus || 'ORDER_CONFIRMED'} 
                                        isCancelled={order.orderStatus === 'CANCELLED'} 
                                    />
                                )}
                            </div>
                        </div>

                        {/* Shipment Section */}
                        <div className="details-card shipment-card">
                            <div className="card-header">
                                <h3>Shipment Details</h3>
                                <span className="item-count">{order.orderItems.length} Items</span>
                            </div>
                            <div className="shipment-items">
                                {order.orderItems.map((item, index) => (
                                    <div key={index} className="shipment-item">
                                        <div className="item-img-box">
                                            <img src={item.image} alt={item.name} />
                                        </div>
                                        <div className="item-info">
                                            <h4 className="item-name">{item.name}</h4>
                                            <div className="item-meta">
                                                <p><span className="meta-label">Seller:</span> {item.seller || 'Squid-Game Shop'}</p>
                                                <p><span className="meta-label">Qty:</span> {item.qty}</p>
                                            </div>
                                            <div className="item-price-val">
                                                ${item.price.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Refund/Return Details Section */}
                        {(order.orderStatus === 'CANCELLED' || order.returnStatus !== 'NONE') && order.isPaid && (
                            <div className="details-card refund-card">
                                <div className="card-header">
                                    <h3>Refund Information</h3>
                                    <span className={`status-pill ${order.paymentStatus === 'REFUNDED' ? 'is-success' : 'is-pending'}`}>
                                        {order.paymentStatus === 'REFUNDED' ? 'Refund Processed' : 'Refund Pending'}
                                    </span>
                                </div>
                                <div className="refund-body">
                                    <div className="detail-row">
                                        <span>Refund Amount:</span>
                                        <strong>${order.totalPrice.toFixed(2)}</strong>
                                    </div>
                                    <div className="detail-row">
                                        <span>Refund Method:</span>
                                        <span>Original Payment Method ({order.paymentMethod})</span>
                                    </div>
                                    <div className="detail-row">
                                        <span>Status:</span>
                                        <span>{order.paymentStatus === 'REFUNDED' ? 'Success' : 'Processing'}</span>
                                    </div>
                                    {order.refund_id && (
                                        <div className="detail-row">
                                            <span>Refund ID:</span>
                                            <span style={{fontSize: '0.8rem'}}>{order.refund_id}</span>
                                        </div>
                                    )}
                                    <div className="refund-actions" style={{marginTop: '1.5rem'}}>
                                        <button className="reorder-btn" onClick={() => navigate('/shop')}>Reorder</button>
                                        <button className="contact-support-btn" onClick={() => window.location.href = 'mailto:support@example.com'}>Contact Support</button>
                                    </div>
                                    <p className="refund-note">
                                        {order.paymentStatus === 'REFUNDED' 
                                            ? 'The amount has been credited to your account. It may take 5-7 business days to reflect in your statement.'
                                            : 'Your refund will be initiated within 24-48 hours once the cancellation/return is finalized.'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Address Section */}
                        <div className="details-card address-card">
                            <div className="card-header">
                                <h3>Shipping Address</h3>
                            </div>
                            <div className="address-content">
                                <p className="shipping-user-name">{user.name}</p>
                                <p className="address-line">{order.shippingAddress.address}</p>
                                <p className="address-line">{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                                <p className="address-line">{order.shippingAddress.country}</p>
                            </div>
                        </div>
                    </div>

                    <div className="details-right-side">
                        {/* Price Details Card */}
                        <div className="details-card price-summary-card">
                            <div className="card-header">
                                <h3>Price Details</h3>
                            </div>
                            <div className="price-body">
                                <div className="detail-row">
                                    <span>Items Total</span>
                                    <span>${order.itemsPrice.toFixed(2)}</span>
                                </div>
                                <div className="detail-row">
                                    <span>Shipping Fee</span>
                                    <span className={order.shippingPrice === 0 ? 'free-shipping' : ''}>
                                        {order.shippingPrice === 0 ? 'FREE' : `$${order.shippingPrice.toFixed(2)}`}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span>Tax</span>
                                    <span>${order.taxPrice.toFixed(2)}</span>
                                </div>
                                {order.discount > 0 && (
                                    <div className="detail-row discount">
                                        <span>Discount</span>
                                        <span>-${order.discount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="divider"></div>
                                <div className="total-highlight-row">
                                    <span>Final Total</span>
                                    <span>${order.totalPrice.toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="price-footer">
                                <button 
                                    onClick={handleDownloadInvoice} 
                                    className="invoice-download-btn"
                                    disabled={downloading}
                                >
                                    {downloading ? (
                                        <div className="btn-spinner-sm"></div>
                                    ) : (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width: '16px', marginRight: '8px'}}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                    )}
                                    {downloading ? 'Downloading...' : 'Download Invoice'}
                                </button>
                                <button 
                                    onClick={() => navigate(`/track-shipment/${order._id}`)} 
                                    className="track-shipment-btn"
                                    disabled={!['SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(order.orderStatus)}
                                    title={
                                        order.orderStatus === 'ORDER_CONFIRMED' ? 'Tracking will be available once your order is processed.' :
                                        order.orderStatus === 'PROCESSING' ? 'Preparing your shipment.' :
                                        ''
                                    }
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width: '16px', marginRight: '8px'}}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                    Track Shipment
                                </button>
                            </div>
                        </div>

                        {/* Payment Info */}
                        <div className="details-card payment-details-card">
                            <div className="card-header">
                                <h3>Payment Info</h3>
                            </div>
                            <div className="payment-body">
                                <div className="pay-item">
                                    <span className="pay-label">Method:</span>
                                    <span className="pay-val">{order.paymentMethod}</span>
                                </div>
                                {order.razorpay_payment_id && (
                                    <div className="pay-item">
                                        <span className="pay-label">Ref ID:</span>
                                        <span className="pay-val" style={{fontSize: '0.8rem'}}>{order.razorpay_payment_id}</span>
                                    </div>
                                )}
                                <div className="pay-item">
                                    <span className="pay-label">Status:</span>
                                    {(() => {
                                        const status = order.paymentStatus || (order.isPaid ? 'SUCCESS' : 'PENDING');
                                        let statusClass = 'is-pending';
                                        if (status === 'SUCCESS') statusClass = 'is-success';
                                        if (status === 'FAILED') statusClass = 'is-failed';
                                        if (status === 'REFUNDED') statusClass = 'is-refunded';
                                        
                                        return (
                                            <span className={`status-pill ${statusClass}`}>
                                                {status}
                                            </span>
                                        );
                                    })()}
                                </div>
                                {order.paymentStatus === 'SUCCESS' && <p className="paid-timestamp">Paid on {new Date(order.paidAt).toLocaleDateString('en-GB')}</p>}
                                {order.receiptSent && (
                                    <div className="receipt-sent-info">
                                        <div className="pay-item">
                                            <span className="pay-label">Receipt:</span>
                                            <span className="receipt-badge-sent">SENT</span>
                                        </div>
                                        <p className="sent-timestamp">Sent at: {new Date(order.receiptSentAt).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' })}</p>
                                    </div>
                                )}
                                {order.paymentNotes && (
                                    <div className="payment-notes-box">
                                        <p className="notes-label">Internal Notes:</p>
                                        <p className="notes-text">{order.paymentNotes}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Return Options Card */}
                        {/* Return / Cancellation Options Card */}
                        <div className="details-card options-card">
                            <div className="card-header">
                                <h3>Return / Cancellation Options</h3>
                            </div>
                            <div className="options-body">
                                {order.orderStatus === 'CANCELLED' ? (
                                    <div className="options-cancelled-badge">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width: '20px', marginRight: '8px'}}><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
                                        Order Cancelled
                                    </div>
                                ) : (
                                    <>
                                        {canCancel && (
                                            <div className="option-action-block">
                                                <button 
                                                    onClick={() => setShowCancelModal(true)} 
                                                    className={`option-btn ${isRequestOnly || order.orderStatus === 'DELIVERED' ? 'orange' : 'red'}`}
                                                >
                                                    {isRequestOnly || order.orderStatus === 'DELIVERED' ? 'Request Cancellation' : 'Cancel Order'}
                                                </button>
                                                {order.orderStatus === 'DELIVERED' && (
                                                    <p className="option-helper-text">* Available within 24 hours of delivery</p>
                                                )}
                                                {order.orderStatus === 'OUT_FOR_DELIVERY' && (
                                                    <p className="option-helper-text">Cancellation may convert to Return after delivery.</p>
                                                )}
                                            </div>
                                        )}

                                        {order.cancellationStatus === 'REQUESTED' && (
                                            <div className="option-pending-info">
                                                Cancellation Requested – Waiting for seller confirmation
                                            </div>
                                        )}

                                        {isDelivered && hoursSinceDelivery > 24 && order.returnStatus === 'NONE' && (
                                            <div className="option-action-block">
                                                <button 
                                                    className="option-btn blue"
                                                    disabled={submittingReturn}
                                                    onClick={() => {
                                                        const reason = prompt("Please enter reason for return:", "Damaged Product");
                                                        if (reason) {
                                                            setReturnReason(reason);
                                                            handleReturnProduct();
                                                        }
                                                    }}
                                                >
                                                    {submittingReturn ? "Processing..." : "Return Product"}
                                                </button>
                                                <p className="option-helper-text">Return your order within 10 days for full refund</p>
                                            </div>
                                        )}

                                        {order.returnStatus && order.returnStatus !== 'NONE' && (
                                            <div className="return-mini-status">
                                                <span className={`status-pill status-${order.returnStatus.toLowerCase()}`}>
                                                    Return {order.returnStatus.charAt(0)?.toUpperCase() + order.returnStatus.slice(1).toLowerCase()}
                                                </span>
                                                <p className="return-reason-text">Reason: {order.returnReason}</p>
                                            </div>
                                        )}

                                        {(!canCancel && order.orderStatus !== 'DELIVERED' && order.cancellationStatus === 'NONE') && (
                                            <p className="options-empty-msg">No actions available at this stage.</p>
                                        )}

                                        {isDelivered && hoursSinceDelivery <= 24 && (
                                            <p className="option-note">Not satisfied with your product? Return will be available after 24 hours of delivery.</p>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancel Modal */}
            {showCancelModal && (
                <div className="details-modal-overlay">
                    <div className="details-modal-content">
                        <h3>Cancel Order?</h3>
                        <p>Are you sure you want to cancel this order? This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button disabled={cancelling} onClick={handleCancelOrder} className="confirm-cancel-btn">
                                {cancelling ? 'Cancelling...' : 'Yes, Cancel'}
                            </button>
                            <button disabled={cancelling} onClick={() => setShowCancelModal(false)} className="keep-order-btn">No, Keep Order</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderDetails;
