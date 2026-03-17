import React, { useState, useRef, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import './AdminHelp.css';

const AdminHelp = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeAccordion, setActiveAccordion] = useState(null);
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [showSuccessToast, setShowSuccessToast] = useState(false);
    const [activeGuide, setActiveGuide] = useState(null);

    const faqRef = useRef(null);
    const ordersRef = useRef(null);
    const customersRef = useRef(null);
    const reportsRef = useRef(null);

    const faqs = [
        {
            id: 1,
            question: "How do I create/edit products?",
            answer: "Navigate to the Products page from the sidebar. Click 'Add Product' to create a new one, or click the edit icon on an existing product card to update its details like price, stock, and descriptions.",
            category: "Products"
        },
        {
            id: 2,
            question: "How do I change order status (Placed → Processing → Shipped → Delivered)?",
            answer: "Go to the Orders page, click on a specific order to view details. Use the status dropdown to move the order through the workflow. Each status change can trigger customer notifications automatically.",
            category: "Orders"
        },
        {
            id: 3,
            question: "Why payment status is not updating?",
            answer: "Payment status usually updates automatically via webhook. If it fails, check the 'Payments' tab for errors. You can manually update payment status if you've verified the transaction externally.",
            category: "Payments"
        },
        {
            id: 4,
            question: "How to refund/cancel an order?",
            answer: "Within the Order Details page, use the 'Cancel Order' button for unpaid orders. For paid orders, use the 'Refund' action which will revert the payment status and notify the customer.",
            category: "Orders"
        },
        {
            id: 5,
            question: "How to add/remove admin users?",
            answer: "Admins can be managed under 'Settings' > 'User Management'. Only super-admins have the permission to promote regular users to admin status or revoke access.",
            category: "Security"
        },
        {
            id: 6,
            question: "How to export reports (CSV/PDF)?",
            answer: "Visit the Reports page. Select your desired date range and data type (Sales, Products, or Customers). Click the 'Export' button and choose your preferred format (CSV or PDF).",
            category: "Reports"
        },
        {
            id: 7,
            question: "How to handle low stock alerts?",
            answer: "Check the 'Notifications' inbox for low stock alerts. You can also see warning badges on the Dashboard and Product List when inventory falls below the threshold (default: 5 units).",
            category: "Inventory"
        },
        {
            id: 8,
            question: "How to manage shipping details?",
            answer: "Once an order is marked as 'Shipped', you can enter tracking IDs and carrier details in the Order Update section. This information is instantly shared with the customer tracker.",
            category: "Shipping"
        },
        {
            id: 9,
            question: "How to reset password/admin access?",
            answer: "Use the 'Forgot Password' link on the login page to receive a reset token via email. For other admins, you can manually trigger a password reset from the User Management section.",
            category: "Security"
        },
        {
            id: 10,
            question: "How to contact support?",
            answer: "You can use the 'Create Support Ticket' form at the bottom of this page, or reach out directly via email at support@profitpulse.com during our working hours (9 AM - 6 PM).",
            category: "Support"
        }
    ];

    const guides = [
        {
            id: 'g1',
            title: "Orders workflow guide",
            icon: "📦",
            steps: [
                "Review new orders in the 'Dashboard' or 'Orders' page.",
                "Change status to 'Processing' once payment is confirmed.",
                "Pack the items and update status to 'Shipped' with tracking info.",
                "Mark as 'Delivered' once confirmation is received from carrier."
            ]
        },
        {
            id: 'g2',
            title: "Payments & refunds guide",
            icon: "💳",
            steps: [
                "Monitor transaction statuses in the 'Payments' module.",
                "Identify 'Failed' payments and contact customers if necessary.",
                "Processe partial or full refunds through the order management interface.",
                "Verify refund completion in your payment gateway dashboard."
            ]
        },
        {
            id: 'g3',
            title: "Customers management",
            icon: "👥",
            steps: [
                "View customer history and lifetime value in the 'Customers' page.",
                "Manage account statuses (Active, Suspended, Blocked).",
                "Respond to customer inquiries using the message center.",
                "Track customer acquisition sources and retention metrics."
            ]
        },
        {
            id: 'g4',
            title: "Reports & statistics",
            icon: "📊",
            steps: [
                "Use 'Statistics' page for a high-level overview of store performance.",
                "Generate detailed 'Reports' for accounting and inventory planning.",
                "Compare current month data with previous periods to identify trends.",
                "Export data to CSV for custom analysis in Excel or other tools."
            ]
        },
        {
            id: 'g5',
            title: "Notifications guide",
            icon: "🔔",
            steps: [
                "Enable browser notifications to get real-time order alerts.",
                "Check the 'Notifications' inbox for system alerts (low stock, errors).",
                "Clear notifications once they have been addressed.",
                "Configure automated email alerts in the 'Settings' panel."
            ]
        },
        {
            id: 'g6',
            title: "Settings & security",
            icon: "⚙️",
            steps: [
                "Update store information and contact details.",
                "Configure tax rates and shipping zones.",
                "Manage API keys and third-party integrations.",
                "Review audit logs for sensitive admin actions."
            ]
        }
    ];

    const filteredFaqs = faqs.filter(faq =>
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const scrollToSection = (ref) => {
        ref.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleTicketSubmit = (e) => {
        e.preventDefault();
        setShowSuccessToast(true);
        setTimeout(() => {
            setShowSuccessToast(false);
            setShowTicketModal(false);
        }, 3000);
    };

    return (
        <AdminLayout pageTitle="Help & Support" pageSubtitle="Find answers and get assistance">
            <div className="help-container">
                {/* Header Actions */}
                <div className="help-header-actions">
                    <div className="search-faq-container">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search FAQs (e.g. orders, payment)..."
                            className="faq-search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button className="primary-btn-help" onClick={() => setShowTicketModal(true)}>
                        Contact Support
                    </button>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions-row">
                    <div className="action-card" onClick={() => scrollToSection(ordersRef)}>
                        <div className="action-icon">📦</div>
                        <h3>How to manage orders?</h3>
                        <p>Step-by-step workflow for handling sales.</p>
                    </div>
                    <div className="action-card" onClick={() => scrollToSection(faqRef)}>
                        <div className="action-icon">💳</div>
                        <h3>How to update payments?</h3>
                        <p>Guidance on transactions and refunds.</p>
                    </div>
                    <div className="action-card" onClick={() => scrollToSection(customersRef)}>
                        <div className="action-icon">👥</div>
                        <h3>How to manage customers?</h3>
                        <p>Tips for user accounts and queries.</p>
                    </div>
                    <div className="action-card" onClick={() => scrollToSection(reportsRef)}>
                        <div className="action-icon">📊</div>
                        <h3>How to generate reports?</h3>
                        <p>Learn to export sales and product data.</p>
                    </div>
                </div>

                {/* FAQs */}
                <section className="help-section" ref={faqRef}>
                    <div className="section-header">
                        <h2>Frequently Asked Questions</h2>
                        <div className="tip-callout">
                            <span className="tip-bulb">💡</span>
                            <p>Tip: Use the search bar above to filter these questions instantly.</p>
                        </div>
                    </div>

                    <div className="faq-list">
                        {filteredFaqs.length > 0 ? (
                            filteredFaqs.map((faq) => (
                                <div
                                    key={faq.id}
                                    className={`faq-item ${activeAccordion === faq.id ? 'active' : ''}`}
                                    onClick={() => setActiveAccordion(activeAccordion === faq.id ? null : faq.id)}
                                >
                                    <div className="faq-question">
                                        <span>{faq.question}</span>
                                        <span className="accordion-chevron">{activeAccordion === faq.id ? '−' : '+'}</span>
                                    </div>
                                    <div className="faq-answer">
                                        <p>{faq.answer}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-search-state">
                                <p>No FAQs match your search: "<strong>{searchQuery}</strong>"</p>
                                <button className="text-btn" onClick={() => setSearchQuery('')}>Clear search</button>
                            </div>
                        )}
                    </div>
                </section>

                {/* Guides Row */}
                <section className="help-section" ref={ordersRef}>
                    <div className="section-header">
                        <h2>Workflow Guides</h2>
                    </div>
                    <div className="guides-grid">
                        {guides.map((guide) => (
                            <div key={guide.id} className="guide-card" onClick={() => setActiveGuide(guide)}>
                                <div className="guide-icon-box">{guide.icon}</div>
                                <div className="guide-info">
                                    <h3>{guide.title}</h3>
                                    <button className="guide-link">View Steps →</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Support Section */}
                <section className="help-section support-contact-section" ref={customersRef}>
                    <div className="section-header">
                        <h2>Direct Support</h2>
                    </div>
                    <div className="support-cards-row" ref={reportsRef}>
                        <div className="support-contact-card">
                            <div className="s-icon">✉️</div>
                            <div className="s-details">
                                <h4>Email Support</h4>
                                <p>support@profitpulse.com</p>
                            </div>
                        </div>
                        <div className="support-contact-card">
                            <div className="s-icon">📱</div>
                            <div className="s-details">
                                <h4>WhatsApp/Phone</h4>
                                <p>+91-9876543210</p>
                            </div>
                        </div>
                        <div className="support-contact-card">
                            <div className="s-icon">🕒</div>
                            <div className="s-details">
                                <h4>Working Hours</h4>
                                <p>Mon - Sat (9 AM - 6 PM)</p>
                            </div>
                        </div>
                    </div>

                    <div className="ticket-cta-banner">
                        <div className="ticket-cta-content">
                            <h3>Still need help?</h3>
                            <p>Create a support ticket and our team will get back to you within 24 hours.</p>
                        </div>
                        <button className="white-btn" onClick={() => setShowTicketModal(true)}>Create Ticket Now</button>
                    </div>
                </section>

                {/* Ticket Modal */}
                {showTicketModal && (
                    <div className="modal-overlay">
                        <div className="modal-content ticket-modal">
                            <button className="close-modal" onClick={() => setShowTicketModal(false)}>✕</button>
                            <h2>Create Support Ticket</h2>
                            <p className="modal-subtitle">Provide details about the issue you're facing.</p>

                            <form onSubmit={handleTicketSubmit} className="ticket-form">
                                <div className="form-group-help">
                                    <label>Subject</label>
                                    <input type="text" placeholder="e.g. Cannot update order status" required />
                                </div>

                                <div className="form-row-help">
                                    <div className="form-group-help">
                                        <label>Category</label>
                                        <select required>
                                            <option value="orders">Orders</option>
                                            <option value="payments">Payments</option>
                                            <option value="customers">Customers</option>
                                            <option value="reports">Reports</option>
                                            <option value="bug">Technical Bug</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div className="form-group-help">
                                        <label>Priority</label>
                                        <select required>
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group-help">
                                    <label>Message</label>
                                    <textarea rows="4" placeholder="Describe your problem in detail..." required></textarea>
                                </div>

                                <div className="form-group-help">
                                    <label>Attach Screenshot (Optional)</label>
                                    <input type="file" className="file-input-help" />
                                </div>

                                <div className="modal-actions">
                                    <button type="button" className="cancel-btn-help" onClick={() => setShowTicketModal(false)}>Cancel</button>
                                    <button type="submit" className="submit-btn-help">Submit Ticket</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Guide Detail Modal */}
                {activeGuide && (
                    <div className="modal-overlay" onClick={() => setActiveGuide(null)}>
                        <div className="modal-content guide-detail-modal" onClick={e => e.stopPropagation()}>
                            <button className="close-modal" onClick={() => setActiveGuide(null)}>✕</button>
                            <div className="guide-modal-header">
                                <div className="guide-icon-large">{activeGuide.icon}</div>
                                <h2>{activeGuide.title}</h2>
                            </div>
                            <div className="guide-stepper">
                                {activeGuide.steps.map((step, index) => (
                                    <div key={index} className="step-item">
                                        <div className="step-number">{index + 1}</div>
                                        <p>{step}</p>
                                    </div>
                                ))}
                            </div>
                            <button className="primary-btn-help" style={{ width: '100%' }} onClick={() => setActiveGuide(null)}>Got it</button>
                        </div>
                    </div>
                )}

                {/* Success Toast */}
                {showSuccessToast && (
                    <div className="success-toast">
                        <span className="toast-icon">✅</span>
                        <p>Ticket submitted successfully! We'll contact you soon.</p>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminHelp;
