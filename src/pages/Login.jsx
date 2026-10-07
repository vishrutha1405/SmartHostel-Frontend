import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { mockApi } from "../services/mockApi";
import { Mail, Lock, LogIn, AlertCircle, Shield, User } from "lucide-react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student"); 
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const user = mockApi.getCurrentUser();
    if (user) {
      if (user.role === "admin") {
        navigate("/adminupload");
      } else {
        navigate("/details");
      }
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await mockApi.login(email, password);
      const loggedUser = response.data;
      if (loggedUser.role !== role) {
        throw new Error(`This account is registered as a ${loggedUser.role.toUpperCase()}. Please select the correct role above.`);
      }

      if (loggedUser.role === "admin") {
        navigate("/adminupload");
      } else {
        navigate("/details");
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };
  const handlePrefill = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole === "student") {
      setEmail("");
      setPassword("");
    } else {
      setEmail("");
      setPassword("");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card glass-panel">
        <div className="auth-header">
          <div className="auth-logo">
            <LogIn size={26} />
          </div>
          <h2 className="auth-title">Smart Hostel</h2>
          <p className="auth-subtitle">Food Waste Management & Mess Portal</p>
        </div>
        <div className="role-selector">
          <button
            type="button"
            className={`role-btn ${role === "student" ? "active" : ""}`}
            onClick={() => handlePrefill("student")}
          >
            Student Portal
          </button>
          <button
            type="button"
            className={`role-btn ${role === "admin" ? "active" : ""}`}
            onClick={() => handlePrefill("admin")}
          >
            Admin Portal
          </button>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-icon-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                className="form-input"
                placeholder="e.g. student@hostel.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-icon-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? (
              "Securing connection..."
            ) : (
              <>
                <span>Sign In</span>
                <LogIn size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="auth-link">
              Register here
            </Link>
          </p>
          <div 
            style={{ 
              marginTop: '16px', 
              fontSize: '11px', 
              color: 'var(--text-muted)',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
            onClick={() => handlePrefill(role)}
          >
            Click to auto-fill demo credentials
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;