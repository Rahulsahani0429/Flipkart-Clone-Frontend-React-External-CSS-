import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../config';
import AdminLayout from '../components/AdminLayout';
import Avatar from '../components/Avatar';
import { toast } from 'react-toastify';
import { useSocket } from '../context/SocketContext';
import './AdminCustomers.css';

const AdminCustomers = () => {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const { socket } = useSocket();

    // Modal states
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [editData, setEditData] = useState({ name: '', phone: '', role: '', status: '', isAdmin: false });
    const [actionLoading, setActionLoading] = useState(false);

    const fetchCustomers = useCallback(async (isInitial = false) => {
        try {
            if (isInitial) setLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data: response } = await axios.get(`${API_BASE_URL}/api/admin/customers`, config);
            setData(response);
            setError('');
        } catch (err) {
            console.error('Error fetching customers:', err);
            if (isInitial) setError(err.response?.data?.message || 'Failed to fetch customers');
        } finally {
            if (isInitial) setLoading(false);
        }
    }, [user.token]);

    useEffect(() => {
        if (user && user.isAdmin) {
            fetchCustomers(true);

            // Socket listeners for real-time updates
            if (socket) {
                socket.on('customerUpdated', (updatedCustomer) => {
                    setData(prev => {
                        if (!prev) return prev;
                        const updatedCustomers = prev.customers.map(c => 
                            c._id === updatedCustomer._id ? { ...c, ...updatedCustomer } : c
                        );
                        return { ...prev, customers: updatedCustomers };
                    });
                });

                socket.on('customerDeleted', (deletedId) => {
                    setData(prev => {
                        if (!prev) return prev;
                        const remainingCustomers = prev.customers.filter(c => c._id !== deletedId);
                        return { 
                            ...prev, 
                            customers: remainingCustomers,
                            summary: {
                                ...prev.summary,
                                totalCustomers: prev.summary.totalCustomers - 1
                            }
                        };
                    });
                });
            }

            const interval = setInterval(() => {
                fetchCustomers();
            }, 30000);

            return () => {
                clearInterval(interval);
                if (socket) {
                    socket.off('customerUpdated');
                    socket.off('socketDeleted');
                }
            };
        }
    }, [user, fetchCustomers, socket]);

    const filteredCustomers = data?.customers?.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEditClick = (customer) => {
        setSelectedCustomer(customer);
        setEditData({
            name: customer.name,
            phone: customer.phone || '',
            role: customer.isAdmin ? 'Admin' : 'Client',
            status: customer.status || 'Active',
            isAdmin: customer.isAdmin
        });
        setShowEditModal(true);
    };

    const handleDeleteClick = (customer) => {
        setSelectedCustomer(customer);
        setShowDeleteModal(true);
    };

    const handleUpdateCustomer = async (e) => {
        e.preventDefault();
        try {
            setActionLoading(true);
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };
            
            const isAdmin = editData.role === 'Admin';
            await axios.put(`${API_BASE_URL}/api/admin/customers/${selectedCustomer._id}`, {
                ...editData,
                isAdmin
            }, config);
            
            toast.success('Customer updated successfully');
            setShowEditModal(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update customer');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteCustomer = async () => {
        try {
            setActionLoading(true);
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            
            await axios.delete(`${API_BASE_URL}/api/admin/customers/${selectedCustomer._id}`, config);
            
            toast.success('Customer deleted successfully');
            setShowDeleteModal(false);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete customer');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <AdminLayout pageTitle="Customers"><div className="loader-container">Loading...</div></AdminLayout>;
    if (error) return <AdminLayout pageTitle="Customers"><div className="error-container">{error}</div></AdminLayout>;
    if (!data) return <AdminLayout pageTitle="Customers">No data available</AdminLayout>;

    return (
        <AdminLayout pageTitle="Customers" pageSubtitle="Manage all registered users">
            <div className="customers-container">
                {/* Header Section */}
                <div className="customers-header">
                    <div className="header-left">
                        <h1>Customers</h1>
                        <p>Total {data.summary.totalCustomers} registered users</p>
                    </div>
                    <div className="header-right">
                        <div className="search-wrapper">
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <span className="search-icon">🔍</span>
                        </div>
                        <button className="btn-add-customer">
                            <span>+</span> Add Customer
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="customers-summary-grid">
                    <div className="customer-stat-card">
                        <div className="stat-icon-box stat-blue">👥</div>
                        <div className="stat-content">
                            <p>Total Customers</p>
                            <h3>{data.summary.totalCustomers}</h3>
                            <span className="growth-pill positive">+12% this month</span>
                        </div>
                    </div>
                    <div className="customer-stat-card">
                        <div className="stat-icon-box stat-green">✅</div>
                        <div className="stat-content">
                            <p>Active Users</p>
                            <h3>{data.summary.activeUsers}</h3>
                            <span className="growth-pill positive">+5% this month</span>
                        </div>
                    </div>
                    <div className="customer-stat-card">
                        <div className="stat-icon-box stat-red">🚫</div>
                        <div className="stat-content">
                            <p>Blocked Users</p>
                            <h3>{data.summary.blockedUsers}</h3>
                            <span className="growth-pill">0% this month</span>
                        </div>
                    </div>
                    <div className="customer-stat-card">
                        <div className="stat-icon-box stat-purple">✨</div>
                        <div className="stat-content">
                            <p>New This Month</p>
                            <h3>{data.summary.newThisMonth}</h3>
                            <span className="growth-pill positive">+8% this month</span>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="customers-table-wrapper">
                    <div className="table-responsive">
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th>Customer</th>
                                    <th>Phone</th>
                                    <th>Orders</th>
                                    <th>Total Spent</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCustomers.map((customer) => (
                                    <tr key={customer._id}>
                                        <td>
                                            <div className="user-info-cell">
                                                <Avatar 
                                                  user={customer} 
                                                  size={40} 
                                                  showBadge={false} 
                                                  className="customer-avatar-rect" 
                                                />
                                                <div className="user-details">
                                                    <span className="user-name">{customer.name}</span>
                                                    <span className="user-email">{customer.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{customer.phone || '—'}</td>
                                        <td>{customer.totalOrders}</td>
                                        <td>${customer.totalSpent.toFixed(2)}</td>
                                        <td>
                                            <span className={`role-badge ${customer.isAdmin ? 'role-admin' : 'role-client'}`}>
                                                {customer.isAdmin ? 'Admin' : 'Client'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${customer.status === 'Blocked' ? 'status-blocked' : 'status-active'}`}>
                                                {customer.status === 'Blocked' ? 'Blocked' : 'Active'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button 
                                                    className="btn-icon btn-edit" 
                                                    title="Edit"
                                                    onClick={() => handleEditClick(customer)}
                                                >
                                                    ✏️
                                                </button>
                                                <button 
                                                    className="btn-icon btn-delete" 
                                                    title="Delete"
                                                    onClick={() => handleDeleteClick(customer)}
                                                >
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Edit Customer Modal */}
                {showEditModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h2>Edit Customer</h2>
                                <button className="close-btn" onClick={() => setShowEditModal(false)}>×</button>
                            </div>
                            <form onSubmit={handleUpdateCustomer}>
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        value={editData.name}
                                        onChange={(e) => setEditData({...editData, name: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email (Read-only)</label>
                                    <input type="email" value={selectedCustomer?.email} disabled />
                                </div>
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input
                                        type="text"
                                        value={editData.phone}
                                        onChange={(e) => setEditData({...editData, phone: e.target.value})}
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Role</label>
                                        <select 
                                            value={editData.role} 
                                            onChange={(e) => setEditData({...editData, role: e.target.value})}
                                        >
                                            <option value="Client">Client</option>
                                            <option value="Admin">Admin</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Status</label>
                                        <select 
                                            value={editData.status} 
                                            onChange={(e) => setEditData({...editData, status: e.target.value})}
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Blocked">Blocked</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary" disabled={actionLoading}>
                                        {actionLoading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {showDeleteModal && (
                    <div className="modal-overlay">
                        <div className="modal-content modal-delete">
                            <div className="modal-icon-warning">⚠️</div>
                            <h2>Delete Customer?</h2>
                            <p>Are you sure you want to delete <strong>{selectedCustomer?.name}</strong>? This action cannot be undone.</p>
                            <div className="modal-footer">
                                <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                                <button className="btn-danger" onClick={handleDeleteCustomer} disabled={actionLoading}>
                                    {actionLoading ? 'Deleting...' : 'Delete Customer'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminCustomers;
