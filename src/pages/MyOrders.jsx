import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchMyOrders = async () => {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                const { data } = await axios.get(`${API_BASE_URL}/api/orders/myorders`, config);
                setOrders(data);
                setLoading(false);
            } catch (error) {
                setError(error.response?.data?.message || error.message);
                setLoading(false);
            }
        };

        if (user) {
            fetchMyOrders();
        }
    }, [user]);

    if (loading) return <div className="container">Loading...</div>;
    if (error) return <div className="container alert alert-danger">{error}</div>;

    return (
        <div className="container my-orders-page">
            <h1>My Orders</h1>
            {orders.length === 0 ? (
                <div className="alert alert-info">You have no orders yet.</div>
            ) : (
                <div className="table-responsive">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>DATE</th>
                                <th>TOTAL</th>
                                <th>PAID</th>
                                <th>DELIVERED</th>
                                <th>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order._id}>
                                    <td>{order._id}</td>
                                    <td>{order.createdAt.substring(0, 10)}</td>
                                    <td>${order.totalPrice}</td>
                                    <td>
                                        {order.isPaid ? (
                                            <span className="badge badge-success">{order.paidAt.substring(0, 10)}</span>
                                        ) : (
                                            <span className={`badge ${order.paymentResult?.status === 'failed' ? 'badge-failed' : 'badge-danger'}`}>
                                                {order.paymentResult?.status === 'failed' ? 'Failed' : 'No'}
                                            </span>
                                        )}
                                    </td>
                                    <td>
                                        {order.isDelivered ? (
                                            <span className="badge badge-success">{order.deliveredAt.substring(0, 10)}</span>
                                        ) : (
                                            <span className="badge badge-danger">No</span>
                                        )}
                                    </td>
                                    <td>
                                        <Link to={`/orders/${order._id}`} className="details-btn">Details</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <style>{`
                .my-orders-page { padding: 4rem 2rem; }
                .my-orders-page h1 { margin-bottom: 2.5rem; font-size: 2rem; }
                .table-responsive { overflow-x: auto; background: var(--bg-card); border-radius: 1rem; box-shadow: var(--shadow); }
                table { width: 100%; border-collapse: collapse; text-align: left; }
                th, td { padding: 1.25rem; border-bottom: 1px solid var(--border); }
                th { background: rgba(0,0,0,0.02); font-weight: 700; color: var(--primary); font-size: 0.9rem; text-transform: uppercase; }
                tr:hover { background: rgba(0,0,0,0.01); }
                .badge { padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.8rem; font-weight: 600; }
                .badge-success { background: #dcfce7; color: #15803d; }
                .badge-danger { background: #fee2e2; color: #b91c1c; }
                .badge-failed { background: #ff4d4f; color: white; }
                .alert-info { background: #e0f2fe; color: #0369a1; padding: 1rem; border-radius: 0.5rem; text-align: center; }
                .details-btn { background: none; border: 1px solid var(--border); padding: 0.4rem 0.8rem; border-radius: 0.25rem; cursor: pointer; font-size: 0.8rem; text-decoration: none; display: inline-block; color: inherit; }
                .details-btn:hover { background: rgba(0,0,0,0.05); }
            `}</style>
        </div>
    );
};

export default MyOrders;
