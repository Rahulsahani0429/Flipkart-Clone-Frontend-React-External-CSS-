import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const sessionExpired = params.get('session') === 'expired';
  const redirectTo = params.get('redirect') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate(redirectTo);
    } catch (error) {
      alert(error.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="auth-card-flipkart">
        <div className="auth-left-pane">
          <h2>Login</h2>
          <p>Get access to your Orders, Wishlist and Recommendations</p>
          <div className="auth-img-placeholder">🛒</div>
        </div>
        <div className="auth-right-pane">
          {sessionExpired && (
            <div className="session-banner">
              🔒 Your session expired. Please log in again.
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="form-group-flip">
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                autoComplete="email"
              />
              <label className={email ? 'active' : ''}>Enter Email/Mobile number</label>
            </div>
            <div className="form-group-flip">
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                autoComplete="current-password"
              />
              <label className={password ? 'active' : ''}>Enter Password</label>
            </div>
            <p className="terms-text">By continuing, you agree to Flipkart's Terms of Use and Privacy Policy.</p>
            <button type="submit" className="login-btn-flip">Login</button>
          </form>
          <div className="auth-footer-flip">
            <Link to="/register">New to Flipkart? Create an account</Link>
          </div>
        </div>
      </div>
      <style>{`
        .login-page-wrapper { background: #f1f3f6; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem; }
        .auth-card-flipkart { background: white; width: 100%; max-width: 670px; display: flex; min-height: 520px; border-radius: 2px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        
        .auth-left-pane { background: var(--primary); width: 40%; padding: 2.5rem 2rem; color: white; display: flex; flex-direction: column; justify-content: space-between; }
        .auth-left-pane h2 { font-size: 1.8rem; margin-bottom: 1rem; }
        .auth-left-pane p { font-size: 1.1rem; line-height: 1.5; color: #dbdbdb; }
        .auth-img-placeholder { font-size: 5rem; text-align: center; opacity: 0.3; }

        .auth-right-pane { flex: 1; padding: 3.5rem 2.5rem 1rem; position: relative; display: flex; flex-direction: column; }
        .form-group-flip { position: relative; margin-bottom: 2rem; }
        .form-group-flip input { width: 100%; padding: 0.5rem 0; border: none; border-bottom: 1px solid #e0e0e0; font-size: 1rem; outline: none; background: transparent; }
        .form-group-flip label { position: absolute; left: 0; top: 0.5rem; color: #878787; transition: all 0.2s; pointer-events: none; }
        .form-group-flip input:focus ~ label, .form-group-flip label.active { top: -0.75rem; font-size: 0.75rem; color: var(--primary); }
        .form-group-flip input:focus { border-bottom: 1px solid var(--primary); }

        .terms-text { font-size: 0.75rem; color: #878787; margin-bottom: 1.5rem; line-height: 1.4; }
        .login-btn-flip { width: 100%; background: #fb641b; color: white; border: none; padding: 0.8rem; font-size: 1rem; font-weight: 700; border-radius: 2px; cursor: pointer; box-shadow: 0 2px 4px 0 rgba(0,0,0,0.2); margin-bottom: 1rem; }
        .session-banner { background: #fff3cd; border: 1px solid #ffc107; color: #856404; border-radius: 4px; padding: .6rem .9rem; font-size: .82rem; margin-bottom: 1.25rem; }
        
        .auth-footer-flip { margin-top: auto; text-align: center; padding-bottom: 1rem; }
        .auth-footer-flip a { color: var(--primary); text-decoration: none; font-weight: 700; font-size: 0.9rem; }

        @media (max-width: 600px) {
          .auth-left-pane { display: none; }
          .auth-card-flipkart { max-width: 400px; }
        }
      `}</style>
    </div>
  );
};

export default Login;
