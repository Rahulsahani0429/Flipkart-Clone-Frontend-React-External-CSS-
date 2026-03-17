import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import AdminLayout from '../components/AdminLayout';

const ProductEdit = () => {
    const { id: productId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [image, setImage] = useState('');
    const [brand, setBrand] = useState('');
    const [category, setCategory] = useState('');
    const [countInStock, setCountInStock] = useState(0);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const { data } = await axios.get(`${API_BASE_URL}/api/products/${productId}`);
                setName(data.name);
                setPrice(data.price);
                setImage(data.image);
                setBrand(data.brand);
                setCategory(data.category);
                setCountInStock(data.countInStock);
                setDescription(data.description);
            } catch (error) {
                setError(error.response?.data?.message || error.message);
            }
        };

        if (user && user.isAdmin) {
            fetchProduct();
        } else {
            navigate('/login');
        }
    }, [productId, user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`,
                },
            };

            await axios.put(
                `${API_BASE_URL}/api/products/${productId}`,
                { name, price, image, brand, category, countInStock, description },
                config
            );
            setLoading(false);
            navigate('/admin/products');
        } catch (error) {
            setError(error.response?.data?.message || error.message);
            setLoading(false);
        }
    };

    return (
        <AdminLayout>
            <div className="admin-page-header">
                <h1>Edit Product</h1>
                <Link to="/admin/products" className="btn-add" style={{ textDecoration: 'none', background: '#f3f4f6', color: '#374151' }}>
                    Go Back
                </Link>
            </div>
            
            <div className="table-container" style={{ padding: '2rem', maxWidth: '800px' }}>
                {error && <div className="alert alert-danger">{error}</div>}
                
                <form onSubmit={handleSubmit} className="admin-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label>Product Name</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Price ($)</label>
                            <input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Image URL</label>
                        <input type="text" value={image} onChange={(e) => setImage(e.target.value)} required />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Brand</label>
                            <input type="text" value={brand} onChange={(e) => setBrand(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Category</label>
                            <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Count In Stock</label>
                        <input type="number" value={countInStock} onChange={(e) => setCountInStock(Number(e.target.value))} required />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <textarea rows="5" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
                    </div>
                    
                    <button type="submit" className="btn-add" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }} disabled={loading}>
                        {loading ? 'Updating...' : 'Update Product'}
                    </button>
                </form>
            </div>

            <style>{`
                .admin-form .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
                .admin-form .form-group { margin-bottom: 1.5rem; }
                .admin-form label { display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.875rem; color: #4b5563; }
                .admin-form input, .admin-form textarea {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 0.95rem;
                    transition: border-color 0.2s;
                    box-sizing: border-box;
                }
                .admin-form input:focus, .admin-form textarea:focus { border-color: #2874f0; outline: none; }
                .alert-danger { background: #fee2e2; color: #991b1b; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; font-weight: 600; }
                
                @media (max-width: 640px) {
                    .admin-form .form-row { grid-template-columns: 1fr; }
                }
            `}</style>
        </AdminLayout>
    );
};

export default ProductEdit;
