import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import AdminLayout from '../components/AdminLayout';
import { getStatusColor, getStatusLabel, normalizeStatus } from '../utils/statusConfig';
import './AdminStats.css';

const AdminStats = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Filter States
    const [range, setRange] = useState('30d');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            const config = {
                headers: { Authorization: `Bearer ${user.token}` },
                params: { range }
            };

            if (range === 'custom') {
                config.params.from = fromDate;
                config.params.to = toDate;
            }

            const { data: response } = await axios.get(`${API_BASE_URL}/api/admin/stats`, config);
            setData(response);
            setError('');
        } catch (err) {
            console.error('Error fetching stats:', err);
            setError(err.response?.data?.message || 'Failed to fetch statistic data');
        } finally {
            setLoading(false);
        }
    }, [user.token, range, fromDate, toDate]);

    useEffect(() => {
        if (user && user.isAdmin) {
            fetchStats();
        }
    }, [user, range]);

    const handleApplyCustomDate = () => {
        if (fromDate && toDate) fetchStats();
    };

    const exportCSV = (type) => {
        let headers = [];
        let rows = [];
        let filename = `stats_${type}_${new Date().toISOString().split('T')[0]}.csv`;

        if (type === 'daily' && data?.tables?.dailySummary) {
            headers = ['Date', 'Orders', 'Revenue', 'Paid', 'Delivered', 'Cancelled'];
            rows = data.tables.dailySummary.map(r => [r.date, r.orders, r.revenue, r.paidOrders, r.deliveredOrders, r.cancelledOrders]);
        } else if (type === 'customers' && data?.tables?.topCustomers) {
            headers = ['Name', 'Email', 'Orders', 'Spent'];
            rows = data.tables.topCustomers.map(r => [r.name, r.email, r.ordersCount, r.spent]);
        } else if (type === 'products' && data?.charts?.topProducts) {
            headers = ['Product', 'Sold Qty', 'Revenue'];
            rows = data.charts.topProducts.map(r => [r.name, r.soldQty, r.revenue]);
        }

        if (headers.length === 0) return;

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Normalize order funnel data for unique per-bar colors from statusConfig
    const buildFunnelData = (raw) => {
        if (!raw || raw.length === 0) return [];
        const merged = new Map();
        raw.forEach(({ status, count }) => {
            const key = normalizeStatus(status);
            merged.set(key, (merged.get(key) || 0) + count);
        });
        return Array.from(merged.entries()).map(([key, count]) => ({
            status: getStatusLabel(key),
            count,
            color: getStatusColor(key),
        }));
    };

    // Distinct palette for payment methods
    const PAYMENT_METHOD_COLORS = ['#4338ca', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

    if (loading && !data) return <AdminLayout pageTitle="Statistics"><div className="loader-container">Analyzing Data...</div></AdminLayout>;
    if (error) return <AdminLayout pageTitle="Statistics"><div className="error-container">{error}</div></AdminLayout>;

    return (
        <AdminLayout pageTitle="Statistics" pageSubtitle="Deep insights & performance trends">
            <div className="stats-container">

                {/* Header & Filters */}
                <div className="stats-header">
                    <div className="header-left">
                        <h1>Business Intelligence</h1>
                        <p>Insights for {range === 'custom' ? `${fromDate} to ${toDate}` : range}</p>
                    </div>

                    <div className="stats-filters">
                        <div className="filter-group">
                            <span className="filter-label">Range:</span>
                            <select
                                className="select-filter"
                                value={range}
                                onChange={(e) => setRange(e.target.value)}
                            >
                                <option value="7d">Last 7 Days</option>
                                <option value="30d">Last 30 Days</option>
                                <option value="12m">Last 12 Months</option>
                                <option value="custom">Custom Range</option>
                            </select>
                        </div>

                        {range === 'custom' && (
                            <div className="filter-group">
                                <input type="date" className="date-input" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                                <span className="filter-label">to</span>
                                <input type="date" className="date-input" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                                <button className="btn-apply" onClick={handleApplyCustomDate}>Apply</button>
                            </div>
                        )}

                        <div className="export-dropdown">
                            <button className="btn-export" onClick={() => exportCSV('daily')}>
                                📥 Export
                            </button>
                        </div>
                    </div>
                </div>

                {data && (
                    <>
                        {/* KPI Grid */}
                        <div className="stats-kpi-grid">
                            <div className="kpi-card">
                                <span className="kpi-label">Gross Revenue</span>
                                <span className="kpi-value">${data.kpis.grossRevenue.toLocaleString()}</span>
                                <span className="kpi-meta meta-positive">Paid Rate: {data.kpis.paidRate.toFixed(1)}%</span>
                            </div>
                            <div className="kpi-card">
                                <span className="kpi-label">Total Orders</span>
                                <span className="kpi-value">{data.kpis.totalOrders}</span>
                                <span className="kpi-meta meta-neutral">Avg Value: ${data.kpis.avgOrderValue.toFixed(2)}</span>
                            </div>
                            <div className="kpi-card">
                                <span className="kpi-label">AOV</span>
                                <span className="kpi-value">${data.kpis.avgOrderValue.toLocaleString()}</span>
                                <span className="kpi-meta meta-neutral">Avg per paid</span>
                            </div>
                            <div className="kpi-card">
                                <span className="kpi-label">Delivery Rate</span>
                                <span className="kpi-value">{data.kpis.deliveryRate.toFixed(1)}%</span>
                                <span className="kpi-meta meta-positive">Success</span>
                            </div>
                            <div className="kpi-card">
                                <span className="kpi-label">Cancel Rate</span>
                                <span className="kpi-value">{data.kpis.cancelRate.toFixed(1)}%</span>
                                <span className="kpi-meta meta-negative">Drop</span>
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div className="stats-charts-grid">
                            <div className="chart-box">
                                <div className="chart-header">
                                    <h3 className="chart-title">Revenue Performance</h3>
                                </div>
                                <div className="h-400">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={data.charts.revenueTrend.labels.map((l, i) => ({ name: l, value: data.charts.revenueTrend.values[i] }))}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                            <Line type="monotone" dataKey="value" stroke="#4338ca" strokeWidth={3} dot={{ r: 4, fill: '#4338ca' }} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="chart-box">
                                <div className="chart-header">
                                    <h3 className="chart-title">Order Status Funnel</h3>
                                </div>
                                <div className="h-400">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={buildFunnelData(data.charts.orderFunnel)} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
                                            <XAxis type="number" hide />
                                            <YAxis
                                                dataKey="status"
                                                type="category"
                                                axisLine={false}
                                                tickLine={false}
                                                width={90}
                                                tick={{ fontSize: 11, fill: '#374151' }}
                                            />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }}
                                                formatter={(value, name) => [value, 'Orders']}
                                            />
                                            <Bar dataKey="count" radius={[0, 6, 6, 0]} barSize={18}>
                                                {buildFunnelData(data.charts.orderFunnel).map((entry, index) => (
                                                    <Cell key={`bar-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        <div className="bottom-charts">
                            <div className="chart-box">
                                <div className="chart-header">
                                    <h3 className="chart-title">Payment Distribution</h3>
                                </div>
                                <div className="h-300">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={data.charts.paymentMethods}
                                                innerRadius={60}
                                                outerRadius={85}
                                                paddingAngle={4}
                                                dataKey="count"
                                                nameKey="method"
                                            >
                                                {data.charts.paymentMethods.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={PAYMENT_METHOD_COLORS[index % PAYMENT_METHOD_COLORS.length]} strokeWidth={0} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 12 }} />
                                            <Legend
                                                verticalAlign="bottom"
                                                height={36}
                                                iconType="circle"
                                                formatter={(v) => <span style={{ color: '#374151', fontSize: 12 }}>{v}</span>}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="chart-box">
                                <div className="chart-header">
                                    <h3 className="chart-title">Top Product Categories</h3>
                                </div>
                                <div className="h-300">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data.charts.topCategories}>
                                            <XAxis dataKey="category" hide />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                            <Tooltip />
                                            <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="chart-box">
                                <div className="chart-header">
                                    <h3 className="chart-title">Top Products</h3>
                                </div>
                                <div className="h-300">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data.charts.topProducts.slice(0, 5)}>
                                            <XAxis dataKey="name" hide />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                                            <Tooltip />
                                            <Bar dataKey="soldQty" fill="#10b981" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>

                        {/* Tables Section */}
                        <div className="stats-tables-grid">
                            <div className="table-card">
                                <div className="table-header">
                                    <h3 className="table-title">Performance Summary</h3>
                                    <button onClick={() => exportCSV('daily')} style={{ background: 'none', border: 'none', color: '#4338ca', fontWeight: 600, cursor: 'pointer' }}>Download CSV</button>
                                </div>
                                <div className="table-scroll-container">
                                    <table className="custom-table" style={{ minWidth: '560px' }}>
                                        <thead>
                                            <tr>
                                                <th>Date</th>
                                                <th>Orders</th>
                                                <th>Revenue</th>
                                                <th>Success</th>
                                                <th>Cancel</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.tables.dailySummary.map((row, idx) => (
                                                <tr key={idx}>
                                                    <td style={{ whiteSpace: 'nowrap' }}>{row.date}</td>
                                                    <td>{row.orders}</td>
                                                    <td style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>${row.revenue.toLocaleString()}</td>
                                                    <td>{row.deliveredOrders}</td>
                                                    <td>{row.cancelledOrders}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="table-card">
                                <div className="table-header">
                                    <h3 className="table-title">Top Customers</h3>
                                    <button onClick={() => exportCSV('customers')} style={{ background: 'none', border: 'none', color: '#4338ca', fontWeight: 600, cursor: 'pointer' }}>Export</button>
                                </div>
                                <div className="customer-list">
                                    {data.tables.topCustomers.map((cust, idx) => (
                                        <div className="customer-list-item" key={idx}>
                                            <span className="customer-rank">{idx + 1}</span>
                                            <div className="cust-info">
                                                <span className="cust-name">{cust.name}</span>
                                                <span className="cust-email">{cust.email}</span>
                                            </div>
                                            <div className="cust-stats">
                                                <span className="cust-spent">${cust.spent.toLocaleString()}</span>
                                                <span className="cust-orders">{cust.ordersCount} orders</span>
                                            </div>
                                        </div>
                                    ))}
                                    {data.tables.topCustomers.length === 0 && <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No customer data available</p>}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminStats;
