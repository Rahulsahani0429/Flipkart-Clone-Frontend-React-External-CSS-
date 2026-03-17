import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import Avatar from "../components/Avatar";
import api from "../utils/api.js";
import "./AdminCustomerProfile.css";

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n ?? 0);

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "—";

const fmtDateShort = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";

const ORDER_STATUS_COLOR = {
  ORDER_CONFIRMED: { cls: "acp-badge-blue",   label: "Confirmed" },
  PROCESSING:      { cls: "acp-badge-yellow",  label: "Processing" },
  SHIPPED:         { cls: "acp-badge-purple",  label: "Shipped" },
  OUT_FOR_DELIVERY:{ cls: "acp-badge-blue",   label: "Out for Delivery" },
  DELIVERED:       { cls: "acp-badge-green",   label: "Delivered" },
  CANCELLED:       { cls: "acp-badge-red",     label: "Cancelled" },
};

const TL_ICONS = {
  account_created: "🎉",
  order_placed:    "📦",
  payment:         "💳",
  return:          "↩️",
};

// ─── Page ────────────────────────────────────────────────────────────────────
export default function AdminCustomerProfile() {
  const { customerId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/admin/customers/${customerId}`);
        setData(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load customer");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [customerId]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) return (
    <AdminLayout pageTitle="Customer Profile" pageSubtitle="Loading...">
      <div className="acp-skeleton-wrap">
        <div className="acp-skeleton-header" />
        {[1,2,3].map(i => <div key={i} className="acp-skeleton-card" />)}
      </div>
    </AdminLayout>
  );

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) return (
    <AdminLayout pageTitle="Customer Profile" pageSubtitle="Error">
      <div className="acp-error-box">
        <span style={{ fontSize: 48 }}>⚠️</span>
        <p style={{ color: "#6b7280" }}>{error}</p>
        <button className="acp-btn acp-btn-primary" onClick={() => navigate(-1)}>← Go Back</button>
      </div>
    </AdminLayout>
  );

  const { customer, stats, orders, addresses, timeline } = data;

  const statusCls = customer.status === "Active" ? "active" : "blocked";

  return (
    <AdminLayout
      pageTitle={customer.name}
      pageSubtitle="Customer Profile"
    >
      {/* Breadcrumb */}
      <div className="acp-breadcrumb">
        <Link to="/admin/customers">Customers</Link>
        <span>›</span>
        <span>{customer.name}</span>
      </div>

      {/* ── Hero Header ─────────────────────────────────────────────────── */}
      <div className="acp-header-card">
        <button className="acp-back-btn" onClick={() => navigate(-1)}>← Back</button>

        <div className="acp-avatar-wrap">
          <Avatar 
            user={customer} 
            size={120} 
            className="acp-avatar" 
          />
          <span className={`acp-status-dot ${statusCls}`} />
        </div>

        <div className="acp-header-info">
          <h2 className="acp-header-name">{customer.name}</h2>
          <p className="acp-header-email">{customer.email}</p>
          {customer.phone && <p className="acp-header-phone">📞 {customer.phone}</p>}
          <div className="acp-header-badges">
            <span className={`acp-header-badge ${statusCls}`}>{customer.status || "Active"}</span>
            <span className="acp-header-badge since">🗓 Joined {fmtDate(customer.createdAt)}</span>
            {customer.isAdmin && <span className="acp-header-badge since">🛡 Admin</span>}
          </div>
        </div>

        <div className="acp-header-stats">
          <div className="acp-hstat">
            <div className="acp-hstat-val">{stats.totalOrders}</div>
            <div className="acp-hstat-lbl">Orders</div>
          </div>
          <div className="acp-hstat">
            <div className="acp-hstat-val">{fmt(stats.totalSpend)}</div>
            <div className="acp-hstat-lbl">Lifetime Spend</div>
          </div>
          <div className="acp-hstat">
            <div className="acp-hstat-val">{fmt(stats.avgOrderValue)}</div>
            <div className="acp-hstat-lbl">Avg. Order</div>
          </div>
        </div>
      </div>

      {/* ── 5 Stat Cards ────────────────────────────────────────────────── */}
      <div className="acp-stats-grid">
        {[
          { icon: "📦", value: stats.totalOrders,      label: "Total Orders" },
          { icon: "💰", value: fmt(stats.totalSpend),  label: "Lifetime Spend" },
          { icon: "↩️", value: stats.returnedOrders,   label: "Returns" },
          { icon: "🚫", value: stats.cancelledOrders,  label: "Cancelled" },
          { icon: "📊", value: fmt(stats.avgOrderValue),label: "Avg Order Value" },
        ].map((s, i) => (
          <div key={i} className="acp-stat-card">
            <div className="acp-stat-icon">{s.icon}</div>
            <div className="acp-stat-value">{s.value}</div>
            <div className="acp-stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── 2-col layout ────────────────────────────────────────────────── */}
      <div className="acp-layout">

        {/* ====== LEFT ================================================= */}
        <div className="acp-left">

          {/* Order History Table */}
          <div className="acp-card">
            <h3 className="acp-card-title">📋 Order History</h3>
            {orders.length === 0 ? (
              <p className="acp-empty">No orders yet.</p>
            ) : (
              <table className="acp-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => {
                    const sc = ORDER_STATUS_COLOR[o.orderStatus] || { cls: "acp-badge-gray", label: o.orderStatus };
                    const pc = o.isPaid   ? "acp-badge-green"
                             : o.paymentStatus === "FAILED" ? "acp-badge-red"
                             : "acp-badge-yellow";
                    const pl = o.isPaid ? "Paid" : (o.paymentStatus || "Pending");
                    return (
                      <tr key={o._id}>
                        <td>
                          <span className="acp-order-id">
                            #{o._id.toString().slice(-8).toUpperCase()}
                          </span>
                        </td>
                        <td>{fmtDateShort(o.createdAt)}</td>
                        <td><span className={`acp-badge ${pc}`}>{pl}</span></td>
                        <td><span className={`acp-badge ${sc.cls}`}>{sc.label}</span></td>
                        <td><strong>{fmt(o.totalPrice)}</strong></td>
                        <td>
                          <Link
                            to={`/admin/orders/${o._id}`}
                            className="acp-btn-link"
                          >
                            View →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Saved Addresses */}
          <div className="acp-card">
            <h3 className="acp-card-title">📍 Saved Addresses</h3>
            {addresses.length === 0 ? (
              <p className="acp-empty">No saved addresses found.</p>
            ) : (
              <div className="acp-address-list">
                {addresses.map((addr, idx) => (
                  <div key={idx} className="acp-address-item">
                    <div className="acp-address-tag">Shipping Address {idx + 1}</div>
                    {addr.address}, {addr.city}<br />
                    {addr.postalCode}, {addr.country}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ====== RIGHT ================================================ */}
        <div className="acp-right">

          {/* Quick Profile Summary */}
          <div className="acp-card">
            <div className="acp-mini-profile">
              <Avatar 
                user={customer} 
                size={80} 
                className="acp-mini-avatar" 
              />
              <p className="acp-mini-name">{customer.name}</p>
              <p className="acp-mini-email">{customer.email}</p>
            </div>
            <div className="acp-info-rows">
              <div className="acp-info-row">
                <span>Phone</span>
                <span>{customer.phone || "—"}</span>
              </div>
              <div className="acp-info-row">
                <span>Status</span>
                <span>
                  <span className={`acp-badge ${statusCls === "active" ? "acp-badge-green" : "acp-badge-red"}`}>
                    {customer.status || "Active"}
                  </span>
                </span>
              </div>
              <div className="acp-info-row">
                <span>Role</span>
                <span>{customer.isAdmin ? "Admin" : customer.role || "Customer"}</span>
              </div>
              <div className="acp-info-row">
                <span>Member Since</span>
                <span>{fmtDate(customer.createdAt)}</span>
              </div>
              <div className="acp-info-row">
                <span>Last Updated</span>
                <span>{fmtDate(customer.updatedAt)}</span>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="acp-card">
            <h3 className="acp-card-title">⏱ Activity Timeline</h3>
            {timeline.length === 0 ? (
              <p className="acp-empty">No activity found.</p>
            ) : (
              <div className="acp-timeline">
                {timeline.map((ev, idx) => (
                  <div key={idx} className="acp-tl-item">
                    <div className="acp-tl-left">
                      <div className={`acp-tl-dot ${ev.type}`}>
                        {TL_ICONS[ev.type] || "•"}
                      </div>
                      {idx < timeline.length - 1 && <div className="acp-tl-line" />}
                    </div>
                    <div className="acp-tl-content">
                      {ev.orderId ? (
                        <Link to={`/admin/orders/${ev.orderId}`} className="acp-tl-label" style={{ textDecoration: "none", color: "#111827" }}>
                          {ev.label}
                        </Link>
                      ) : (
                        <p className="acp-tl-label">{ev.label}</p>
                      )}
                      <p className="acp-tl-date">{fmtDateShort(ev.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
