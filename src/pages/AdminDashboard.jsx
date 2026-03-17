import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import AdminLayout from '../components/AdminLayout';
import Avatar from '../components/Avatar';
import { useSocket } from '../context/SocketContext';
import { getStatusColor, getStatusLabel, normalizeStatus } from '../utils/statusConfig';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data: stats } = await axios.get(`${API_BASE_URL}/api/admin/dashboard`, config);
      setData(stats);
      setError('');
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      if (isInitial) setError(err.response?.data?.message || 'Failed to fetch dashboard statistics');
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [user.token]);

  const socket = useSocket();

  useEffect(() => {
    if (user && user.isAdmin) {
      fetchDashboardData(true);

      // Socket update: refresh on any order change
      if (socket) {
        socket.on('orderUpdated', () => {
          fetchDashboardData();
        });
      }

      // Fallback: Poll every 60 seconds (less frequent if socket is working)
      const interval = setInterval(() => {
        fetchDashboardData();
      }, 60000);

      return () => {
        clearInterval(interval);
        if (socket) socket.off('orderUpdated');
      };
    }
  }, [user, fetchDashboardData, socket]);

  // Normalize & deduplicate status chart data (client-side safety net)
  // Groups any residual duplicates coming from backend into a Map keyed by
  // canonical normalized status, then picks unique colors from statusConfig.
  const buildChartData = (rawStats) => {
    if (!rawStats || rawStats.length === 0) return [{ name: 'No Data', value: 1, color: '#e5e7eb' }];
    const merged = new Map();
    rawStats.forEach(({ name, value }) => {
      const canonical = normalizeStatus(name);
      merged.set(canonical, (merged.get(canonical) || 0) + value);
    });
    return Array.from(merged.entries()).map(([status, count]) => ({
      name: getStatusLabel(status),
      value: count,
      color: getStatusColor(status),
    }));
  };

  const getStatusBadgeClass = (status) => {
    if (!status) return '';
    const s = normalizeStatus(status);
    const map = {
      ORDER_PLACED:     'badge-processing',
      ORDER_CONFIRMED:  'badge-processing',
      PROCESSING:       'badge-processing',
      SHIPPED:          'badge-delivered',
      OUT_FOR_DELIVERY: 'badge-delivered',
      DELIVERED:        'badge-delivered',
      CANCELLED:        'badge-cancelled',
      RETURN_REQUESTED: 'badge-processing',
      RETURNED:         'badge-cancelled',
      REFUNDED:         'badge-paid',
    };
    return map[s] || '';
  };

  if (loading) return <AdminLayout><div className="loader-container">Loading...</div></AdminLayout>;
  if (error) return <AdminLayout><div className="error-container">{error}</div></AdminLayout>;
  if (!data) return <AdminLayout><div className="error-container">No statistics available</div></AdminLayout>;

  return (
    <AdminLayout pageTitle="Dashboard">
      <div className="admin-dashboard-container">
        {/* KPI Cards Section */}
        <div className="dashboard-grid">
          <div className="stat-card">
            <div className="stat-icon-wrapper icon-revenue">💰</div>
            <div className="stat-info">
              <span className="stat-label">Total Revenue</span>
              <span className="stat-value">${data.totalRevenue?.toLocaleString() || 0}</span>
              <span className="stat-growth growth-up">+Real-time</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper icon-orders">🛒</div>
            <div className="stat-info">
              <span className="stat-label">Total Orders</span>
              <span className="stat-value">{data.totalOrders?.toLocaleString() || 0}</span>
              <span className="stat-growth growth-up">+Real-time</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper icon-products">📦</div>
            <div className="stat-info">
              <span className="stat-label">Total Products</span>
              <span className="stat-value">{data.totalProducts || 0}</span>
              <span className="stat-growth growth-up">+Live</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper icon-users">👥</div>
            <div className="stat-info">
              <span className="stat-label">Total Users</span>
              <span className="stat-value">{data.totalUsers?.toLocaleString() || 0}</span>
              <span className="stat-growth growth-up">+Live</span>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="analytics-section">
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Revenue Overview</h3>
              <div className="chart-filters">
                <button className="filter-btn active">7 Days</button>
                <button className="filter-btn">30 Days</button>
                <button className="filter-btn">12 Months</button>
              </div>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.revenueOverview.length > 0 ? data.revenueOverview : [{ name: 'No data', value: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#4338ca" strokeWidth={3} dot={{ r: 4, fill: '#4338ca' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Order Status</h3>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={buildChartData(data.orderStatusStats)}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                    nameKey="name"
                  >
                    {buildChartData(data.orderStatusStats).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name) => [value, name]}
                    contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }}
                  />
                  <Legend
                    iconType="circle"
                    wrapperStyle={{ fontSize: '12px' }}
                    formatter={(value) => <span style={{ color: '#374151' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="recent-orders-section">
          <div className="section-header">
            <h3 className="section-title">Recent Orders</h3>
          </div>
          <div className="table-scroll-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="order-id">#{order._id.substring(order._id.length - 8).toUpperCase()}</td>
                    <td className="customer-info">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Avatar user={order.user} size={32} />
                        {order.user?.name || 'Guest'}
                      </div>
                    </td>
                    <td className="date-cell">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="amount-cell">${order.totalPrice.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(order.paymentStatus)}`}>
                        {order.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadgeClass(order.orderStatus)}`}>
                        {getStatusLabel(normalizeStatus(order.orderStatus))}
                      </span>
                    </td>
                    <td>
                      <Link to={`/admin/orders/${order._id}`} className="btn-view">View</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;


