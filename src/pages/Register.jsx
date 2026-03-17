import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password, isAdmin);
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="login-page-wrapper">
      <div className="auth-card-flipkart">
        <div className="auth-left-pane">
          <h2>Looks like you're new here!</h2>
          <p>Sign up with your details to get started</p>
          <div className="auth-img-placeholder">🛍️</div>
        </div>
        <div className="auth-right-pane">
          <form onSubmit={handleSubmit}>
            <div className="form-group-flip">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />

              <label className={name ? "active" : ""}>Enter Full Name</label>
            </div>
            <div className="form-group-flip">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
              <label className={email ? "active" : ""}>
                Enter Email Address
              </label>
            </div>
            <div className="form-group-flip">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              <label className={password ? "active" : ""}>Enter Password</label>
            </div>

            <div className="role-selection">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={isAdmin}
                  onChange={(e) => setIsAdmin(e.target.checked)}
                />
                <span className="checkmark"></span>
                Register as Admin
              </label>
              <p className="role-info">Admins can manage products and orders.</p>
            </div>

            <p className="terms-text">
              By continuing, you agree to Flipkart's Terms of Use and Privacy
              Policy.
            </p>
            <button type="submit" className="login-btn-flip">
              Continue
            </button>
          </form>
          <div className="auth-footer-flip">
            <Link to="/login">Existing User? Log in</Link>
          </div>
        </div>
      </div>
      <style>{`
        .login-page-wrapper { background: #f1f3f6; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem; }
        .auth-card-flipkart { background: white; width: 100%; max-width: 670px; display: flex; min-height: 520px; border-radius: 2px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
        
        .auth-left-pane { background: var(--primary); width: 40%; padding: 2.5rem 2rem; color: white; display: flex; flex-direction: column; justify-content: space-between; }
        .auth-left-pane h2 { font-size: 1.6rem; margin-bottom: 1rem; line-height: 1.3; }
        .auth-left-pane p { font-size: 1.1rem; line-height: 1.5; color: #dbdbdb; }
        .auth-img-placeholder { font-size: 5rem; text-align: center; opacity: 0.3; }

        .auth-right-pane { flex: 1; padding: 3.5rem 2.5rem 1rem; position: relative; display: flex; flex-direction: column; }
        .form-group-flip { position: relative; margin-bottom: 2rem; }
        .form-group-flip input { width: 100%; padding: 0.5rem 0; border: none; border-bottom: 1px solid #e0e0e0; font-size: 1rem; outline: none; background: transparent; }
        .form-group-flip label { position: absolute; left: 0; top: 0.5rem; color: #878787; transition: all 0.2s; pointer-events: none; }
        .form-group-flip input:focus ~ label, .form-group-flip label.active { top: -0.75rem; font-size: 0.75rem; color: var(--primary); }
        .form-group-flip input:focus { border-bottom: 1px solid var(--primary); }

        .terms-text { font-size: 0.75rem; color: #878787; margin-bottom: 1.5rem; line-height: 1.4; }
        .login-btn-flip { background: #fb641b; color: white; border: none; padding: 0.8rem; font-size: 1rem; font-weight: 700; border-radius: 2px; cursor: pointer; box-shadow: 0 2px 4px 0 rgba(0,0,0,0.2); margin-bottom: 1rem; }
        
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

export default Register;
