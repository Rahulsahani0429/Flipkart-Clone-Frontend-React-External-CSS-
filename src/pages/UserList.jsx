import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import AdminLayout from '../components/AdminLayout';
import './AdminTables.css';

const UserList = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();

    const fetchUsers = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${currentUser.token}`,
                },
            };
            const { data } = await axios.get(`${API_BASE_URL}/api/auth`, config);
            setUsers(data);
            setLoading(false);
        } catch (error) {
            setError(error.response?.data?.message || error.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (currentUser && currentUser.isAdmin) {
            fetchUsers();
        } else {
            navigate('/login');
        }
    }, [currentUser, navigate]);

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${currentUser.token}`,
                    },
                };
                await axios.delete(`${API_BASE_URL}/api/auth/${id}`, config);
                fetchUsers();
            } catch (error) {
                alert(error.response?.data?.message || error.message);
            }
        }
    };

    const toggleAdminHandler = async (userToUpdate) => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${currentUser.token}`,
                },
            };
            await axios.put(
                `${API_BASE_URL}/api/auth/${userToUpdate._id}`,
                { ...userToUpdate, isAdmin: !userToUpdate.isAdmin },
                config
            );
            fetchUsers();
        } catch (error) {
            alert(error.response?.data?.message || error.message);
        }
    };

    if (loading) return <AdminLayout><div className="loader-container"><div className="loader"></div></div></AdminLayout>;
    if (error) return <AdminLayout><div className="alert alert-danger">{error}</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="admin-page-header">
                <h1>Users Management</h1>
            </div>
            
            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>User ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((u) => (
                            <tr key={u._id}>
                                <td>#{u._id.substring(u._id.length - 8).toUpperCase()}</td>
                                <td>{u.name}</td>
                                <td><a href={`mailto:${u.email}`} style={{ color: '#2563eb', textDecoration: 'none' }}>{u.email}</a></td>
                                <td>
                                    {u.isAdmin ? (
                                        <span className="stock-badge" style={{ background: '#f5f3ff', color: '#7c3aed' }}>Administrator</span>
                                    ) : (
                                        <span className="stock-badge" style={{ background: '#f3f4f6', color: '#6b7280' }}>Client</span>
                                    )}
                                </td>
                                <td>
                                    <div className="action-btns">
                                        <button 
                                            className="icon-btn" 
                                            onClick={() => toggleAdminHandler(u)}
                                            title={u.isAdmin ? "Remove Admin" : "Make Admin"}
                                            style={{ color: '#2563eb' }}
                                        >
                                            {u.isAdmin ? '🔓' : '🛡️'}
                                        </button>
                                        <button 
                                            className="icon-btn btn-delete" 
                                            onClick={() => deleteHandler(u._id)}
                                            disabled={u._id === currentUser._id}
                                            title="Delete User"
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
            <style>{`
                .loader-container { min-height: 50vh; display: flex; align-items: center; justify-content: center; }
                .loader { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #2874f0; border-radius: 50% !important; animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            `}</style>
        </AdminLayout>
    );
};

export default UserList;
