import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { mockApi } from "../services/mockApi";
import { User, Mail, Lock, BookOpen, Home, Hash, LogIn, AlertCircle } from "lucide-react";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student"); // 'student' or 'admin'
  const [rollNo, setRollNo] = useState("");
  const [block, setBlock] = useState("A-Block");
  const [roomNo, setRoomNo] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const userData = {
        name,
        email,
        password,
        role,
        rollNo,
        block,
        roomNo
      };

      const result = await mockApi.register(userData);
      setSuccess("⚡ Registration Successful! Data automatically stored in MongoDB (mongodb://localhost:27017)");
      
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card glass-panel" style={{ maxWidth: "520px" }}>
        <div className="auth-header">
          <div className="auth-logo">
            <User size={26} />
          </div>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join the Smart Hostel Waste Reduction Portal</p>
        </div>

        {/* Role Selector Toggle */}
        <div className="role-selector">
          <button
            type="button"
            className={`role-btn ${role === "student" ? "active" : ""}`}
            onClick={() => setRole("student")}
          >
            Register as Student
          </button>
          <button
            type="button"
            className={`role-btn ${role === "admin" ? "active" : ""}`}
            onClick={() => setRole("admin")}
          >
            Register as Admin
          </button>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="success-banner" style={{ marginBottom: "20px" }}>
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-icon-wrapper">
              <User className="input-icon" size={18} />
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Varun Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

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
                placeholder="Choose a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Role specific fields */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-group">
              <label className="form-label">{role === "student" ? "Roll Number" : "Staff ID"}</label>
              <div className="input-icon-wrapper">
                <Hash className="input-icon" size={18} />
                <input
                  type="text"
                  className="form-input"
                  placeholder={role === "student" ? "e.g. 22CSE102" : "e.g. ADM001"}
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Hostel Block</label>
              <div className="input-icon-wrapper">
                <Home className="input-icon" size={18} />
                <select 
                  className="form-input"
                  style={{ paddingLeft: "42px", appearance: "none" }}
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                >
                  <option value="A-Block">A-Block (Kaveri)</option>
                  <option value="B-Block">B-Block (Ganga)</option>
                  <option value="C-Block">C-Block (Yamuna)</option>
                  <option value="Admin Block">Office Block</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{role === "student" ? "Room Number" : "Office Number"}</label>
            <div className="input-icon-wrapper">
              <Home className="input-icon" size={18} />
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 304"
                value={roomNo}
                onChange={(e) => setRoomNo(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? (
              "Registering..."
            ) : (
              <>
                <span>Sign Up</span>
                <LogIn size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="auth-link">
              Sign In here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
