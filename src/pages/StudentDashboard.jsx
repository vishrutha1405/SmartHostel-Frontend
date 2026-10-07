import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { mockApi } from "../services/mockApi";
import { QRCodeDisplay } from "../components/QRCodeDisplay";
import { 
  Calendar, 
  MessageSquare, 
  LogOut, 
  Utensils, 
  QrCode, 
  Star, 
  Clock, 
  Check, 
  X, 
  Leaf,
  ShieldCheck,
  UserCheck,
  Award,
  AlertCircle,
  Zap,
  AlertTriangle
} from "lucide-react";

function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("meals"); // 'meals' or 'feedback'
  const [menu, setMenu] = useState({});
  const [selectedMealTab, setSelectedMealTab] = useState("breakfast");
  const [studentRSVPs, setStudentRSVPs] = useState([]);
  const [emergencyTokens, setEmergencyTokens] = useState(2);
  
  // Feedback Form State
  const [fbMeal, setFbMeal] = useState("breakfast");
  const [fbRating, setFbRating] = useState(5);
  const [fbCategory, setFbCategory] = useState("Taste");
  const [fbComment, setFbComment] = useState("");
  const [fbHistory, setFbHistory] = useState([]);
  const [latestQR, setLatestQR] = useState(null);
  
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  const navigate = useNavigate();
  const currentUser = mockApi.getCurrentUser() || { name: "Student", id: "demo" };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const menuData = await mockApi.getMenu();
      setMenu(menuData || {});
      
      const rsvpData = await mockApi.getStudentRSVPs(currentUser.id);
      setStudentRSVPs(rsvpData || []);

      const tok = await mockApi.getEmergencyTokens(currentUser.id);
      setEmergencyTokens(tok ?? 10);

      const fbList = await mockApi.getFeedbacks();
      const myFb = (fbList || []).filter(f => f.studentName === currentUser.name);
      setFbHistory(myFb);
    } catch (err) {
      console.error("Error loading student dashboard data:", err);
    }
  };

  const loadRSVPs = async () => {
    const data = await mockApi.getStudentRSVPs(currentUser.id);
    setStudentRSVPs(data || []);
    const tok = await mockApi.getEmergencyTokens(currentUser.id);
    setEmergencyTokens(tok ?? 10);
  };

  const loadFeedbackHistory = async () => {
    const fbList = await mockApi.getFeedbacks();
    const myFb = (fbList || []).filter(f => f.studentName === currentUser.name);
    setFbHistory(myFb);
  };

  const handleRSVPToggle = async (meal, status) => {
    await mockApi.submitRSVP(currentUser.id, currentUser.name, meal, status);
    await loadRSVPs();
    showToast(`RSVP updated: You are ${status} ${meal}.`);
  };

  const handleEmergencyRequest = async (meal) => {
    try {
      await mockApi.submitEmergencyMealRequest(currentUser.id, currentUser.name, meal);
      await loadRSVPs();
      showToast(`⚡ Emergency Meal Token Redeemed! Mess kitchen alerted for your ${meal} meal.`);
    } catch (err) {
      setErrorMsg(err.message || "Failed to redeem Emergency Token.");
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!fbComment.trim()) {
      setErrorMsg("Please add a comment before submitting.");
      return;
    }

    try {
      const result = await mockApi.submitFeedback({
        studentName: currentUser.name,
        roomNo: currentUser.roomNo,
        meal: fbMeal,
        rating: fbRating,
        category: fbCategory,
        comment: fbComment
      });

      setLatestQR(result.feedback.qrPayload);
      setFbComment("");
      loadFeedbackHistory();
      showToast("Thank you! Feedback submitted. QR Code generated below.");
    } catch (err) {
      setErrorMsg("Failed to submit feedback.");
    }
  };

  const showToast = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg("");
    }, 4500);
  };

  const handleLogout = () => {
    mockApi.logout();
    navigate("/login");
  };

  // Get RSVP Status for a specific meal
  const getRSVPStatus = (meal) => {
    const found = studentRSVPs.find(r => r.meal === meal);
    return found ? found.status : "pending";
  };

  // Eco points calculation: 15 points for skip, 5 for attending, -10 for emergency late requests
  const calculateEcoPoints = () => {
    let points = 50; // base points
    studentRSVPs.forEach(r => {
      if (r.status === "skipping") points += 15;
      if (r.status === "attending") points += 5;
      if (r.status === "late_request") points -= 10;
    });
    points += fbHistory.length * 10;
    return Math.max(0, points);
  };

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Utensils size={20} />
          </div>
          <span className="sidebar-brand">SmartHostel</span>
        </div>

        <nav className="sidebar-menu">
          <button 
            className={`sidebar-link ${activeTab === "meals" ? "active" : ""}`}
            onClick={() => setActiveTab("meals")}
          >
            <Calendar size={18} />
            <span>Meal Details</span>
          </button>
          
          <button 
            className={`sidebar-link ${activeTab === "feedback" ? "active" : ""}`}
            onClick={() => setActiveTab("feedback")}
          >
            <MessageSquare size={18} />
            <span>Mess Feedback</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-bar">
            <div className="avatar">
              {currentUser.name ? currentUser.name.charAt(0) : "S"}
            </div>
            <div className="user-info">
              <div className="user-name">{currentUser.name}</div>
              <div className="user-role">Room {currentUser.roomNo} | {currentUser.block}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Dashboard Content */}
      <main className="dashboard-content">
        <div className="dashboard-header-panel">
          <div>
            <h1 className="welcome-title">Vanakkam, {currentUser.name}!</h1>
            <p className="welcome-subtitle">Plan your meals & help reduce food waste in the hostel mess.</p>
          </div>
          <div className="header-actions" style={{ gap: '12px' }}>
            <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '12px' }}>
              <Zap size={18} color="var(--accent-amber)" />
              <span style={{ fontSize: '13px', fontWeight: '600' }}>Emergency Meal Tokens: {emergencyTokens}/10</span>
            </div>
            <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '12px' }}>
              <Leaf size={18} color="var(--accent-emerald)" />
              <span style={{ fontSize: '13px', fontWeight: '600' }}>Hostel Eco-Points: {calculateEcoPoints()}</span>
            </div>
          </div>
        </div>

        {/* Global Notifications */}
        {successMsg && (
          <div className="success-banner">
            <Check size={18} />
            <span>{successMsg}</span>
          </div>
        )}
        
        {errorMsg && (
          <div className="error-message">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STATS OVERVIEW */}
        <div className="stat-grid">
          <div className="stat-card glass-panel" style={{ '--glow-color': 'rgba(6, 182, 212, 0.15)', '--icon-color': 'var(--accent-cyan)' }}>
            <div className="stat-card-glow"></div>
            <div className="stat-label">RSVP Status (Today)</div>
            <div className="stat-value-group">
              <div className="stat-value">
                {studentRSVPs.filter(r => r.status === "attending" || r.status === "late_request").length}/4
              </div>
              <Utensils className="stat-icon" size={24} />
            </div>
            <div className="stat-desc">Meals RSVP'd to attend</div>
          </div>

          <div className="stat-card glass-panel" style={{ '--glow-color': 'rgba(245, 158, 11, 0.15)', '--icon-color': 'var(--accent-amber)' }}>
            <div className="stat-card-glow"></div>
            <div className="stat-label">Emergency Buffer Tokens</div>
            <div className="stat-value-group">
              <div className="stat-value">{emergencyTokens} Tokens</div>
              <Zap className="stat-icon" size={24} />
            </div>
            <div className="stat-desc">Available for last-minute meals</div>
          </div>

          <div className="stat-card glass-panel" style={{ '--glow-color': 'rgba(16, 185, 129, 0.15)', '--icon-color': 'var(--accent-emerald)' }}>
            <div className="stat-card-glow"></div>
            <div className="stat-label">Wastage Points Saved</div>
            <div className="stat-value-group">
              <div className="stat-value">
                {studentRSVPs.filter(r => r.status === "skipping").length * 5} kg
              </div>
              <Leaf className="stat-icon" size={24} />
            </div>
            <div className="stat-desc">Food waste prevented by skipping</div>
          </div>
        </div>

        {/* TAB 1: MEAL DETAILS */}
        {activeTab === "meals" && (
          <div className="glass-panel" style={{ padding: "30px" }}>
            <h2 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <Calendar size={22} color="var(--primary)" />
              Daily Mess Menu & RSVP Planner
            </h2>
            
            {/* Meal Time Tab Navigation */}
            <div className="tab-navigation">
              {["breakfast", "lunch", "snacks", "dinner"].map((meal) => (
                <button
                  key={meal}
                  className={`tab-btn ${selectedMealTab === meal ? "active" : ""}`}
                  onClick={() => setSelectedMealTab(meal)}
                  style={{ textTransform: "capitalize" }}
                >
                  {meal}
                </button>
              ))}
            </div>

            {menu[selectedMealTab] ? (
              <div className="menu-grid">
                {/* Menu Details Card */}
                <div className="glass-panel menu-card" style={{ background: "rgba(0, 0, 0, 0.2)" }}>
                  <div>
                    <div className="menu-card-header">
                      <span className={`meal-badge ${selectedMealTab}`}>
                        {selectedMealTab}
                      </span>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <div className="calorie-meter">
                          <Clock size={15} color="var(--accent-cyan)" />
                          <span style={{ fontSize: '12px', color: 'var(--accent-cyan)' }}>Cut-off: {menu[selectedMealTab].cutoffTime || "08:00 AM"}</span>
                        </div>
                        <div className="calorie-meter">
                          <Award size={16} />
                          <span>{menu[selectedMealTab].calories} kcal</span>
                        </div>
                      </div>
                    </div>

                    <div className="menu-items-details">
                      <h3 className="menu-food-title">
                        {menu[selectedMealTab].items}
                      </h3>
                      
                      <div className="menu-info-row">
                        <span className="menu-info-label">Ingredients: </span>
                        <span className="menu-info-value">{menu[selectedMealTab].ingredients}</span>
                      </div>

                      <div className="menu-info-row">
                        <span className="menu-info-label">Allergen Info: </span>
                        <span className="menu-info-value" style={{ color: "var(--accent-amber)" }}>
                          {menu[selectedMealTab].allergens}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* RSVP Toggle switches */}
                  <div className="rsvp-control-panel">
                    <div className="rsvp-status-text">
                      Your Attendance RSVP:{" "}
                      <span style={{ 
                        fontWeight: '700',
                        color: getRSVPStatus(selectedMealTab) === "attending" ? "var(--accent-emerald)" : 
                               getRSVPStatus(selectedMealTab) === "skipping" ? "var(--accent-rose)" : 
                               getRSVPStatus(selectedMealTab) === "late_request" ? "var(--accent-amber)" : "var(--text-secondary)"
                      }}>
                        {getRSVPStatus(selectedMealTab) === "late_request" ? "Attending (Emergency Token Used)" : getRSVPStatus(selectedMealTab)}
                      </span>
                    </div>
                    
                    <div className="rsvp-options">
                      <button
                        className={`rsvp-option-btn attending ${getRSVPStatus(selectedMealTab) === "attending" ? "active" : ""}`}
                        onClick={() => handleRSVPToggle(selectedMealTab, "attending")}
                      >
                        Going to Mess
                      </button>
                      <button
                        className={`rsvp-option-btn skipping ${getRSVPStatus(selectedMealTab) === "skipping" ? "active" : ""}`}
                        onClick={() => handleRSVPToggle(selectedMealTab, "skipping")}
                      >
                        Skipping Meal
                      </button>
                    </div>

                    {/* Last Minute / Emergency Food Request Trigger */}
                    {getRSVPStatus(selectedMealTab) === "skipping" && (
                      <div style={{ marginTop: "14px", background: "rgba(245, 158, 11, 0.08)", border: "1px dashed rgba(245, 158, 11, 0.4)", borderRadius: "10px", padding: "12px" }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--accent-amber)', marginBottom: '8px', fontWeight: '600' }}>
                          <AlertTriangle size={15} />
                          <span>Changed your mind? Need food last minute?</span>
                        </div>
                        <button
                          className="auth-button"
                          style={{ padding: "8px 12px", fontSize: "12px", background: "linear-gradient(135deg, #f59e0b, #d97706)" }}
                          onClick={() => handleEmergencyRequest(selectedMealTab)}
                        >
                          <Zap size={14} />
                          Request Last-Minute Meal (1 Token)
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Waste Saving Tips / Graphic Box */}
                <div className="glass-panel" style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "center", background: "linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(16, 185, 129, 0.02) 100%)" }}>
                  <Leaf size={32} color="var(--accent-emerald)" style={{ marginBottom: "16px" }} />
                  <h3 style={{ marginBottom: "8px" }}>Why RSVP & Buffer Tokens work?</h3>
                  <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "16px", lineHeight: "1.6" }}>
                    By informing the mess in advance if you skip, the kitchen avoids over-cooking. If you unexpectedly need food last minute, use your <strong>Emergency Token</strong>! The kitchen maintains an 8% buffer stock specifically for emergency tokens to prevent food shortage.
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--accent-cyan)", fontWeight: "600" }}>
                    <ShieldCheck size={18} />
                    <span>Every planned skip saves ~350g food; Buffer Tokens keep emergency food ready!</span>
                  </div>
                </div>
              </div>
            ) : (
              <p>Loading meal data...</p>
            )}
          </div>
        )}

        {/* TAB 2: MESS FEEDBACK & QR CODE */}
        {activeTab === "feedback" && (
          <div className="feedback-grid">
            {/* Feedback Input Form */}
            <div className="glass-panel feedback-form-panel">
              <h2 style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px" }}>
                <MessageSquare size={22} color="var(--primary)" />
                Mess Review Form
              </h2>

              <form onSubmit={handleFeedbackSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label className="form-label">Select Meal</label>
                    <select 
                      className="form-input" 
                      style={{ paddingLeft: "14px" }}
                      value={fbMeal}
                      onChange={(e) => setFbMeal(e.target.value)}
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="snacks">Snacks</option>
                      <option value="dinner">Dinner</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Review Category</label>
                    <div className="category-pills">
                      {["Taste", "Cleanliness", "Quantity", "Service"].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          className={`category-pill-btn ${fbCategory === cat ? "active" : ""}`}
                          onClick={() => setFbCategory(cat)}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <div className="star-selector">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`star-icon-btn ${fbRating >= star ? "selected" : ""}`}
                        onClick={() => setFbRating(star)}
                      >
                        <Star size={28} fill={fbRating >= star ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Detailed Comments</label>
                  <textarea
                    rows="4"
                    className="form-input"
                    style={{ paddingLeft: "14px", resize: "none" }}
                    placeholder="Provide details about food taste, cook quality, or service..."
                    value={fbComment}
                    onChange={(e) => setFbComment(e.target.value)}
                    required
                  ></textarea>
                </div>

                <button type="submit" className="auth-button">
                  <QrCode size={18} />
                  Submit Feedback & Get QR Code
                </button>
              </form>
            </div>

            {/* QR Code Presentation Box */}
            <div className="glass-panel qr-preview-panel">
              <h2 style={{ marginBottom: "8px" }}>Your Feedback QR</h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "16px" }}>
                Present this QR code at the mess dining hall scanner to verify your feedback.
              </p>

              <QRCodeDisplay value={latestQR} title="Hostel Feedback QR" size={190} />
            </div>

            {/* Past Feedback History Section */}
            <div className="glass-panel" style={{ gridColumn: "1 / -1", padding: "28px" }}>
              <h3 style={{ marginBottom: "20px" }}>Your Feedback History</h3>
              
              {fbHistory.length === 0 ? (
                <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>No feedbacks logged yet. Rate a meal above!</p>
              ) : (
                <div className="table-responsive">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Meal</th>
                        <th>Category</th>
                        <th>Rating</th>
                        <th>Comments</th>
                        <th>QR Code Payload</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fbHistory.map((fb) => (
                        <tr key={fb.id}>
                          <td>{new Date(fb.date).toLocaleDateString()}</td>
                          <td style={{ textTransform: "capitalize" }}>{fb.meal}</td>
                          <td>
                            <span className="status-pill attending" style={{ color: "var(--primary)", background: "rgba(99, 102, 241, 0.1)" }}>
                              {fb.category}
                            </span>
                          </td>
                          <td>
                            <div className="rating-stars-display">
                              {[1,2,3,4,5].map(s => (
                                <Star key={s} size={14} fill={fb.rating >= s ? "currentColor" : "none"} />
                              ))}
                            </div>
                          </td>
                          <td style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {fb.comment}
                          </td>
                          <td style={{ fontFamily: "monospace", fontSize: "12px", color: "var(--accent-cyan)" }}>
                            <button
                              type="button"
                              onClick={() => {
                                setLatestQR(fb.qrPayload);
                                showToast(`Loaded QR code for ${fb.meal} review!`);
                              }}
                              style={{
                                background: "rgba(99, 102, 241, 0.15)",
                                border: "1px solid rgba(99, 102, 241, 0.4)",
                                color: "var(--accent-cyan)",
                                padding: "4px 8px",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "11px",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                            >
                              <QrCode size={12} />
                              <span>{fb.qrPayload}</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default StudentDashboard;
