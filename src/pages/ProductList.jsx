import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import AdminLayout from '../components/AdminLayout';
import './AdminTables.css';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    const fetchProducts = async () => {
        try {
            const { data } = await axios.get(`${API_BASE_URL}/api/products`);
            setProducts(data);
            setLoading(false);
        } catch (error) {
            setError(error.response?.data?.message || error.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && user.isAdmin) {
            fetchProducts();
        } else {
            navigate('/login');
        }
    }, [user, navigate]);

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                const config = {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                await axios.delete(`${API_BASE_URL}/api/products/${id}`, config);
                fetchProducts();
            } catch (error) {
                alert(error.response?.data?.message || error.message);
            }
        }
    };

    const toggleFeaturedHandler = async (product) => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            await axios.put(`${API_BASE_URL}/api/products/${product._id}`, {
                ...product,
                isFeatured: !product.isFeatured
            }, config);
            fetchProducts();
        } catch (error) {
            alert(error.response?.data?.message || error.message);
        }
    };

    const createProductHandler = async () => {
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };
            const { data } = await axios.post(`${API_BASE_URL}/api/products`, {}, config);
            navigate(`/admin/product/${data.product._id}/edit`);
        } catch (error) {
            alert(error.response?.data?.message || error.message);
        }
    };

    if (loading) return <AdminLayout><div className="loader-container"><div className="loader"></div></div></AdminLayout>;
    if (error) return <AdminLayout><div className="alert alert-danger">{error}</div></AdminLayout>;

    return (
        <AdminLayout>
            <div className="admin-page-header">
                <h1>Products Catalog</h1>
                <button className="btn-add" onClick={createProductHandler}>
                    <span>+</span> Create Product
                </button>
            </div>
            
            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Category</th>
                            <th>Stock</th>
                            <th>Featured</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => (
                            <tr key={product._id}>
                                <td>
                                    <img src={product.image} alt={product.name} style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                                </td>
                                <td>{product.name}</td>
                                <td>${product.price.toFixed(2)}</td>
                                <td>{product.category}</td>
                                <td>
                                    <span className={`stock-badge ${product.countInStock > 0 ? 'stock-in' : 'stock-out'}`}>
                                        {product.countInStock > 0 ? `${product.countInStock} In Stock` : 'Out of Stock'}
                                    </span>
                                </td>
                                <td>
                                    <label className="toggle-switch">
                                        <input 
                                            type="checkbox" 
                                            checked={product.isFeatured} 
                                            onChange={() => toggleFeaturedHandler(product)}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </td>
                                <td>
                                    <div className="action-btns">
                                        <Link to={`/admin/product/${product._id}/edit`} className="icon-btn btn-edit" title="Edit">📝</Link>
                                        <button className="icon-btn btn-delete" onClick={() => deleteHandler(product._id)} title="Delete">🗑️</button>
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

export default ProductList;
