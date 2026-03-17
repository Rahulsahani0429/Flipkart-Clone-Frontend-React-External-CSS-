import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Avatar from "../components/Avatar";
import api from "../utils/api.js";
import "./AdminOrderDetail.css";

// ─── Constants ──────────────────────────────────────────────────────────────
const STEPS = [
  { key: "ORDER_PLACED",      label: "Ordered" },
  { key: "ORDER_CONFIRMED",   label: "Confirmed" },
  { key: "PROCESSING",        label: "Processing" },
  { key: "SHIPPED",           label: "Shipped" },
  { key: "OUT_FOR_DELIVERY",  label: "Out for Delivery" },
  { key: "DELIVERED",         label: "Delivered" },
];

const STATUS_OPTIONS = {
  ORDER_CONFIRMED:  "Confirmed",
  PROCESSING:       "Processing",
  SHIPPED:          "Shipped",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED:        "Delivered",
  CANCELLED:        "Cancelled",
};

const STATUS_BADGE = {
  ORDER_PLACED:     { cls: "aod-badge-gray",   label: "Ordered" },
  ORDER_CONFIRMED:  { cls: "aod-badge-blue",   label: "Confirmed" },
  PROCESSING:       { cls: "aod-badge-orange", label: "Processing" },
  SHIPPED:          { cls: "aod-badge-purple", label: "Shipped" },
  OUT_FOR_DELIVERY: { cls: "aod-badge-blue",   label: "Out for Delivery" },
  DELIVERED:        { cls: "aod-badge-green",  label: "Delivered" },
  CANCELLED:        { cls: "aod-badge-red",    label: "Cancelled" },
};

const PAYMENT_BADGE = {
  SUCCESS:  { cls: "aod-badge-green",  label: "Paid" },
  PAID:     { cls: "aod-badge-green",  label: "Paid" },
  PENDING:  { cls: "aod-badge-yellow", label: "Pending" },
  FAILED:   { cls: "aod-badge-red",    label: "Failed" },
  REFUNDED: { cls: "aod-badge-purple", label: "Refunded" },
};

const PAYMENT_ICONS = { Razorpay: "💳", COD: "💵", Stripe: "💳", UPI: "📱" };

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n ?? 0);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const fmtDateShort = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

// Build activity log from order data
function buildActivityLog(order) {
  const events = [];
  events.push({ type: "created", icon: "📦", label: "Order placed", date: order.createdAt });
  if (order.orderStatus === "ORDER_CONFIRMED" || order.orderStatus > 0) {
    events.push({ type: "status", icon: "✅", label: "Order confirmed", date: order.updatedAt });
  }
  if (order.isPaid) {
    events.push({ type: "payment", icon: "💳", label: `Payment received (${fmt(order.totalPrice)})`, date: order.paidAt || order.updatedAt });
  }
  if (order.orderStatus === "SHIPPED") {
    events.push({ type: "status", icon: "🚚", label: "Order shipped", date: order.updatedAt });
  }
  if (order.orderStatus === "DELIVERED") {
    events.push({ type: "status", icon: "🎉", label: "Order delivered", date: order.deliveredAt || order.updatedAt });
  }
  if (order.isCancelled) {
    events.push({ type: "status", icon: "🚫", label: "Order cancelled", date: order.cancelledAt || order.updatedAt });
  }
  if (order.returnStatus && order.returnStatus !== "NONE") {
    events.push({ type: "refund", icon: "↩️", label: `Return requested (${order.returnStatus})`, date: order.returnRequestedAt || order.updatedAt });
  }
  if (order.refundStatus === "PROCESSED") {
    events.push({ type: "refund", icon: "💸", label: "Refund processed", date: order.updatedAt });
  }
  return events.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function AdminOrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [data,           setData]           = useState(null);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState(null);
  const [updating,       setUpdating]       = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [trackingNum,    setTrackingNum]    = useState("");
  const [adminNote,      setAdminNote]      = useState("");
  const [noteSaved,      setNoteSaved]      = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await api.get(`/admin/orders/${orderId}`);
        setData(res.data);
        setSelectedStatus(res.data.order.orderStatus);
        setTrackingNum(res.data.order.trackingNumber || "");
        setAdminNote(res.data.order.adminNote || "");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    })();
  }, [orderId]);

  const handleStatusUpdate = async () => {
    try {
      setUpdating(true);
      const res = await api.put(`/admin/orders/${orderId}/status`, {
        orderStatus: selectedStatus,
        trackingNumber: trackingNum,
      });
      setData((prev) => ({ ...prev, order: res.data }));
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveNote = async () => {
    // Optimistic — backend endpoint or just UI state for now
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  // ── Render: Loading ────────────────────────────────────────────────────────
  if (loading) return (
    <AdminLayout pageTitle="Order Details" pageSubtitle="Loading...">
      <div className="aod-skeleton-wrap">
        <div className="aod-skeleton-header" />
        <div className="aod-skeleton-card" />
        <div className="aod-skeleton-card" />
      </div>
    </AdminLayout>
  );

  // ── Render: Error ──────────────────────────────────────────────────────────
  if (error) return (
    <AdminLayout pageTitle="Order Details" pageSubtitle="Error">
      <div className="aod-error-box">
        <span className="aod-error-icon">⚠️</span>
        <p style={{ color: "#6b7280" }}>{error}</p>
        <button className="aod-btn aod-btn-primary" onClick={() => navigate(-1)}>← Go Back</button>
      </div>
    </AdminLayout>
  );

  const { order, customerStats } = data;
  const isCancelled = order.orderStatus === "CANCELLED";
  const isDelivered = order.orderStatus === "DELIVERED";

  // Status step position — treat ORDER_PLACED as index 0
  const stepKeys = STEPS.map(s => s.key);
  const currentStepIdx = stepKeys.indexOf(order.orderStatus);

  const sb  = STATUS_BADGE[order.orderStatus]  || { cls: "aod-badge-gray", label: order.orderStatus };
  const pb  = order.isPaid
    ? PAYMENT_BADGE["SUCCESS"]
    : PAYMENT_BADGE[order.paymentStatus] || PAYMENT_BADGE["PENDING"];

  const activityLog = buildActivityLog(order);

  return (
    <AdminLayout
      pageTitle={`Order #${order._id.slice(-8).toUpperCase()}`}
      pageSubtitle="Order Management"
    >
      {/* ── Breadcrumb ───────────────────────────────────────────────────── */}
      <div className="aod-breadcrumb">
        <Link to="/admin">Dashboard</Link>
        <span>›</span>
        <Link to="/admin/orders">Orders</Link>
        <span>›</span>
        <span>#{order._id.slice(-8).toUpperCase()}</span>
      </div>

      {/* ── Hero Header ─────────────────────────────────────────────────── */}
      <div className="aod-hero">
        <div className="aod-hero-left">
          <p className="aod-hero-eyebrow">Order Details</p>
          <h2 className="aod-hero-id">#{order._id.slice(-8).toUpperCase()}</h2>
          <div className="aod-hero-meta">
            <span className="aod-hero-date">📅 {fmtDateShort(order.createdAt)}</span>
            <span className={`aod-badge ${sb.cls}`}>{sb.label}</span>
            <span className={`aod-badge ${pb.cls}`}>{pb.label}</span>
          </div>
        </div>

        <div className="aod-hero-actions">
          <button className="aod-btn aod-btn-outline" onClick={() => navigate("/admin/orders")}>
            ← Orders
          </button>
          <button className="aod-btn aod-btn-outline" onClick={() => window.print()}>
            🖨 Print Invoice
          </button>
          {!isCancelled && !isDelivered && (
            <button
              className="aod-btn aod-btn-danger"
              onClick={() => {
                if (window.confirm("Cancel this order?")) {
                  setSelectedStatus("CANCELLED");
                  handleStatusUpdate();
                }
              }}
            >
              🚫 Cancel Order
            </button>
          )}
          {order.isPaid && !isCancelled && (
            <button className="aod-btn aod-btn-success">💸 Refund</button>
          )}
        </div>
      </div>

      {/* ── Stepper ─────────────────────────────────────────────────────── */}
      {isCancelled ? (
        <div className="aod-cancelled-banner">
          <span>🚫</span>
          <div>
            <strong>Order Cancelled</strong>
            <p style={{ margin: "4px 0 0", fontSize: 13, opacity: 0.85 }}>
              This order was cancelled{order.cancelledAt ? ` on ${fmtDateShort(order.cancelledAt)}` : ""}.
            </p>
          </div>
        </div>
      ) : (
        <div className="aod-stepper-card">
          <p className="aod-stepper-title">📦 Order Progress</p>
          <div className="aod-stepper">
            {STEPS.map((step, idx) => {
              const isDone   = currentStepIdx >= 0 && idx <= currentStepIdx;
              const isActive = idx === currentStepIdx;
              const isLast   = idx === STEPS.length - 1;
              return (
                <div key={step.key} className="aod-step">
                  <div className={`aod-step-circle ${isDone ? "done" : ""} ${isActive ? "active" : ""}`}>
                    {isDone ? "✔" : idx + 1}
                  </div>
                  {!isLast && (
                    <div className={`aod-step-connector ${isDone && !isActive ? "done" : ""}`} />
                  )}
                  <span className={`aod-step-label ${isDone ? "done" : ""} ${isActive ? "active" : ""}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── 2-col layout ────────────────────────────────────────────────── */}
      <div className="aod-layout">

        {/* ====== LEFT (70%) ============================================ */}
        <div className="aod-left">

          {/* A. Order Items */}
          <div className="aod-card">
            <h3 className="aod-card-title">🛒 Order Items</h3>
            <div className="aod-items-table">
              <div className="aod-items-head">
                <span>Product</span>
                <span>Qty</span>
                <span>Unit Price</span>
                <span>Subtotal</span>
              </div>
              {order.orderItems.map((item, idx) => (
                <div key={idx} className="aod-item-row">
                  <div className="aod-item-info">
                    <img
                      src={item.image || "https://via.placeholder.com/60"}
                      alt={item.name}
                      className="aod-item-img"
                      onError={(e) => { e.target.src = "https://via.placeholder.com/60"; }}
                    />
                    <div>
                      <p className="aod-item-name">{item.name}</p>
                      {item.product?.sku && <p className="aod-item-sku">SKU: {item.product.sku}</p>}
                      {!item.product?.sku && item.product && (
                        <p className="aod-item-sku">ID: {String(item.product).slice(-8).toUpperCase()}</p>
                      )}
                    </div>
                  </div>
                  <span className="aod-item-qty">× {item.qty}</span>
                  <span className="aod-item-price">{fmt(item.price)}</span>
                  <span className="aod-item-subtotal">{fmt(item.price * item.qty)}</span>
                </div>
              ))}
            </div>

            {/* Price Summary */}
            <div className="aod-price-summary">
              <div className="aod-price-row">
                <span>Items Total</span>
                <span>{fmt(order.itemsPrice)}</span>
              </div>
              <div className="aod-price-row">
                <span>Shipping</span>
                <span>{fmt(order.shippingPrice)}</span>
              </div>
              <div className="aod-price-row">
                <span>Tax (GST)</span>
                <span>{fmt(order.taxPrice)}</span>
              </div>
              {order.discount > 0 && (
                <div className="aod-price-row discount">
                  <span>🏷 Discount</span>
                  <span>−{fmt(order.discount)}</span>
                </div>
              )}
            </div>
            <div className="aod-price-total">
              <strong>Grand Total</strong>
              <strong>{fmt(order.totalPrice)}</strong>
            </div>
          </div>

          {/* B. Activity Log */}
          <div className="aod-card">
            <h3 className="aod-card-title">⏱ Activity Log</h3>
            <div className="aod-activity">
              {activityLog.map((ev, idx) => (
                <div key={idx} className="aod-act-item">
                  <div className="aod-act-left">
                    <div className={`aod-act-dot ${ev.type}`}>{ev.icon}</div>
                    {idx < activityLog.length - 1 && <div className="aod-act-line" />}
                  </div>
                  <div className="aod-act-body">
                    <p className="aod-act-label">{ev.label}</p>
                    <p className="aod-act-date">{fmtDate(ev.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* C. Admin Notes */}
          <div className="aod-card">
            <h3 className="aod-card-title">📝 Admin Notes</h3>
            <textarea
              className="aod-notes-textarea"
              placeholder="Add internal notes about this order..."
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
            />
            <button className="aod-btn aod-btn-outline aod-btn-sm" style={{ marginTop: 8 }} onClick={handleSaveNote}>
              {noteSaved ? "✔ Saved!" : "Save Note"}
            </button>
          </div>
        </div>

        {/* ====== RIGHT (30%) =========================================== */}
        <div className="aod-right">

          {/* D. Customer Information */}
          <div className="aod-card">
            <h3 className="aod-card-title">👤 Customer</h3>
            {order.user ? (
              <>
                <div
                  className="aod-customer-row"
                  onClick={() => navigate(`/admin/customers/${order.user._id}`)}
                >
                  <Avatar 
                    user={order.user} 
                    size={64} 
                    className="aod-customer-avatar" 
                  />
                  <div>
                    <p className="aod-customer-name">{order.user.name}</p>
                    <p className="aod-customer-email">{order.user.email}</p>
                    {order.user.phone && <p className="aod-customer-phone">📞 {order.user.phone}</p>}
                  </div>
                </div>

                {/* Shipping Address */}
                {order.shippingAddress?.address && (
                  <div className="aod-address-box">
                    <div className="aod-address-label">📍 Shipping Address</div>
                    {order.shippingAddress.address}, {order.shippingAddress.city}<br />
                    {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                  </div>
                )}

                {/* Customer Stats */}
                <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
                  <div style={{ flex: 1, background: "#f9fafb", borderRadius: 10, padding: "10px 14px", textAlign: "center", border: "1px solid #f3f4f6" }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "#111827" }}>{customerStats?.totalOrders ?? 0}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Total Orders</div>
                  </div>
                  <div style={{ flex: 1, background: "#f9fafb", borderRadius: 10, padding: "10px 14px", textAlign: "center", border: "1px solid #f3f4f6" }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: "#111827" }}>{fmt(customerStats?.lifetimeSpend)}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Lifetime Spend</div>
                  </div>
                </div>

                <Link
                  to={`/admin/customers/${order.user._id}`}
                  className="aod-btn aod-btn-outline aod-btn-full"
                >
                  View Full Profile →
                </Link>
              </>
            ) : (
              <p style={{ color: "#9ca3af", fontSize: 13 }}>Guest / Deleted user</p>
            )}
          </div>

          {/* E. Update Status & Tracking */}
          <div className="aod-card">
            <h3 className="aod-card-title">🔄 Order Status</h3>

            {/* Current status badge */}
            <div style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 13, color: "#6b7280" }}>Current:</span>
              <span className={`aod-badge ${sb.cls}`}>{sb.label}</span>
            </div>

            {/* Dropdown */}
            <select
              className="aod-select"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              {Object.entries(STATUS_OPTIONS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>

            {/* Tracking Number */}
            <input
              className="aod-tracking-input"
              type="text"
              placeholder="Tracking Number (optional)"
              value={trackingNum}
              onChange={(e) => setTrackingNum(e.target.value)}
            />
            {trackingNum && (
              <a
                href={`https://www.google.com/search?q=${encodeURIComponent(trackingNum)}`}
                target="_blank"
                rel="noreferrer"
                className="aod-btn aod-btn-outline aod-btn-sm"
                style={{ marginBottom: 10, display: "flex" }}
              >
                🔍 Track Package
              </a>
            )}

            <button
              className="aod-btn aod-btn-primary aod-btn-full"
              onClick={handleStatusUpdate}
              disabled={updating || (selectedStatus === order.orderStatus && trackingNum === (order.trackingNumber || ""))}
            >
              {updating ? "Saving..." : "Update Status"}
            </button>
          </div>

          {/* F. Payment Information */}
          <div className="aod-card">
            <h3 className="aod-card-title">💳 Payment</h3>
            <div className="aod-payment-rows">
              <div className="aod-payment-row">
                <span>Method</span>
                <span>{PAYMENT_ICONS[order.paymentMethod] || "💳"} {order.paymentMethod || "—"}</span>
              </div>
              <div className="aod-payment-row">
                <span>Status</span>
                <span className={`aod-badge ${pb.cls}`}>{pb.label}</span>
              </div>
              {order.isPaid && (
                <div className="aod-payment-row">
                  <span>Paid On</span>
                  <span>{fmtDateShort(order.paidAt)}</span>
                </div>
              )}
              {order.razorpay_payment_id && (
                <div className="aod-payment-row">
                  <span>Transaction ID</span>
                  <span className="aod-mono">{order.razorpay_payment_id}</span>
                </div>
              )}
              {order.paymentResult?.id && (
                <div className="aod-payment-row">
                  <span>Gateway Ref</span>
                  <span className="aod-mono">{order.paymentResult.id}</span>
                </div>
              )}
              {order.refund_id && (
                <div className="aod-payment-row">
                  <span>Refund ID</span>
                  <span className="aod-mono">{order.refund_id}</span>
                </div>
              )}
            </div>
          </div>

          {/* G. Return / Refund (if active) */}
          {order.returnStatus && order.returnStatus !== "NONE" && (
            <div className="aod-card">
              <h3 className="aod-card-title">↩️ Return / Refund</h3>
              <div className="aod-payment-rows">
                <div className="aod-payment-row">
                  <span>Return Status</span>
                  <span className="aod-badge aod-badge-yellow">{order.returnStatus}</span>
                </div>
                {order.returnReason && (
                  <div className="aod-payment-row">
                    <span>Reason</span>
                    <span>{order.returnReason}</span>
                  </div>
                )}
                {order.returnRequestedAt && (
                  <div className="aod-payment-row">
                    <span>Requested</span>
                    <span>{fmtDateShort(order.returnRequestedAt)}</span>
                  </div>
                )}
                <div className="aod-payment-row">
                  <span>Refund</span>
                  <span>{order.refundStatus || "Pending"}</span>
                </div>
              </div>
              {order.returnStatus === "REQUESTED" && (
                <div className="aod-return-actions">
                  <button className="aod-btn aod-btn-success aod-half">✔ Approve</button>
                  <button className="aod-btn aod-btn-danger  aod-half">✖ Reject</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
