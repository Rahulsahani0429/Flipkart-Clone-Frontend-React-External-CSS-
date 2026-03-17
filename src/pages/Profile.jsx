import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import Avatar from '../components/Avatar';

const Profile = () => {
    const { user, updateUserInfo } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
        }
    }, [user]);

    // Cleanup object URL on unmount
    useEffect(() => {
        return () => {
            if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        };
    }, [avatarPreview]);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Client-side validation
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            setMessage('Only JPG, JPEG, and PNG images are allowed.');
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setMessage('Image size must be 2MB or less.');
            return;
        }

        setMessage(null);
        setAvatarFile(file);

        // Revoke old preview URL to avoid memory leaks
        if (avatarPreview) URL.revokeObjectURL(avatarPreview);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setMessage('Passwords do not match');
            return;
        }

        setLoading(true);
        setMessage(null);
        setSuccess(false);

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            if (password) formData.append('password', password);
            if (avatarFile) formData.append('avatar', avatarFile);

            const { data } = await axios.put(
                `${API_BASE_URL}/api/auth/profile`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                        // Do NOT set Content-Type — axios sets it automatically
                        // with the correct boundary for multipart/form-data
                    },
                }
            );

            // Flatten data and update context/localStorage
            const userData = { ...data.user, token: data.token || user.token };
            updateUserInfo(userData);

            setSuccess(true);
            setLoading(false);
            setPassword('');
            setConfirmPassword('');
            setAvatarFile(null);
            // avatarPreview stays so user keeps seeing their new image
        } catch (error) {
            setMessage(error.response?.data?.message || error.message);
            setLoading(false);
        }
    };

    // Determine what to show in the preview circle
    const previewSrc = avatarPreview
        ? avatarPreview
        : user?.avatar
        ? (user.avatar.startsWith('http') ? user.avatar : `${API_BASE_URL}${user.avatar}`)
        : null;

    return (
        <div className="container profile-page">
            <div className="profile-card">
                <h2>User Profile</h2>

                {/* ── Avatar Upload Circle ── */}
                <div className="avatar-upload-section">
                    <div
                        className="avatar-upload-circle"
                        onClick={handleAvatarClick}
                        title="Click to change profile photo"
                    >
                        {previewSrc ? (
                            <img src={previewSrc} alt="Profile" className="avatar-preview-img" />
                        ) : (
                            <span className="avatar-placeholder-letter">
                                {(user?.name || 'U')[0].toUpperCase()}
                            </span>
                        )}
                        <div className="avatar-overlay">
                            <span className="camera-icon">📷</span>
                        </div>
                    </div>
                    <p className="avatar-hint">Click to upload profile photo</p>
                    <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                    {avatarFile && (
                        <p className="avatar-selected-name">📎 {avatarFile.name}</p>
                    )}
                </div>

                {message && <div className="alert alert-danger">{message}</div>}
                {success && <div className="alert alert-success">✅ Profile Updated Successfully!</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            placeholder="Enter name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>New Password <span className="optional-label">(optional)</span></label>
                        <input
                            type="password"
                            placeholder="Leave blank to keep current"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            placeholder="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Profile'}
                    </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                    <Link to="/profile/orders" className="btn btn-light" style={{ width: '100%' }}>
                        My Orders
                    </Link>
                </div>
            </div>

            <style>{`
                .profile-page { padding: 4rem 2rem; display: flex; flex-direction: column; align-items: center; }
                .profile-card {
                    background: var(--bg-card);
                    padding: 3rem;
                    border-radius: 1rem;
                    box-shadow: var(--shadow-lg);
                    width: 100%;
                    max-width: 500px;
                }
                .profile-card h2 { margin-bottom: 1.5rem; text-align: center; }

                /* ── Avatar upload ── */
                .avatar-upload-section {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-bottom: 1.8rem;
                    gap: 0.4rem;
                }
                .avatar-upload-circle {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    position: relative;
                    cursor: pointer;
                    overflow: hidden;
                    border: 3px solid var(--primary, #2874f0);
                    box-shadow: 0 4px 16px rgba(40, 116, 240, 0.25);
                    background: #ffe500;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .avatar-upload-circle:hover {
                    transform: scale(1.05);
                    box-shadow: 0 6px 20px rgba(40, 116, 240, 0.4);
                }
                .avatar-preview-img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                }
                .avatar-placeholder-letter {
                    font-size: 2.5rem;
                    font-weight: 800;
                    color: #333;
                    line-height: 1;
                    user-select: none;
                }
                .avatar-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.4);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                    border-radius: 50%;
                }
                .avatar-upload-circle:hover .avatar-overlay { opacity: 1; }
                .camera-icon { font-size: 1.8rem; }
                .avatar-hint {
                    font-size: 0.78rem;
                    color: #888;
                    margin: 0;
                }
                .avatar-selected-name {
                    font-size: 0.78rem;
                    color: var(--primary, #2874f0);
                    margin: 0;
                    max-width: 240px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                /* ── Form ── */
                .form-group { margin-bottom: 1.5rem; }
                .form-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; }
                .optional-label { font-size: 0.78rem; font-weight: 400; color: #888; margin-left: 4px; }
                .form-group input {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    border: 1px solid var(--border);
                    border-radius: 0.5rem;
                    box-sizing: border-box;
                }

                /* ── Alerts ── */
                .alert { padding: 0.9rem 1rem; border-radius: 0.5rem; margin-bottom: 1rem; text-align: center; font-size: 0.9rem; }
                .alert-danger { background: #fee2e2; color: #b91c1c; }
                .alert-success { background: #dcfce7; color: #15803d; }

                @media (max-width: 768px) {
                    .profile-page { padding: 2rem 1rem; }
                    .profile-card { padding: 2rem; }
                    .profile-card h2 { font-size: 1.5rem; }
                }
            `}</style>
        </div>
    );
};

export default Profile;
