import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { mockApi } from "../services/mockApi";
import { 
  Utensils, 
  TrendingUp, 
  Trash2, 
  MessageSquare, 
  LogOut, 
  Save, 
  Plus, 
  Check,
  AlertTriangle,
  Users,
  IndianRupee,
  Leaf,
  BarChart3,
  Flame,
  Star,
  Zap,
  Sliders,
  QrCode,
  Search
} from "lucide-react";

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("menu"); // 'menu', 'predictions', 'waste', 'feedbacks'
  const [menu, setMenu] = useState({});
  const [rsvps, setRsvps] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [wasteLogs, setWasteLogs] = useState([]);
  const [bufferPercent, setBufferPercent] = useState(8);

  // QR Code Verification State
  const [qrQuery, setQrQuery] = useState("");
  const [qrResult, setQrResult] = useState(null);
  
  // Waste Form State
  const [wasteDate, setWasteDate] = useState(new Date().toISOString().split('T')[0]);
  const [wasteBreakfast, setWasteBreakfast] = useState(0);
  const [wasteLunch, setWasteLunch] = useState(0);
  const [wasteSnacks, setWasteSnacks] = useState(0);
  const [wasteDinner, setWasteDinner] = useState(0);

  // Success/Error notifications
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  
  const navigate = useNavigate();
  const currentUser = mockApi.getCurrentUser() || { name: "Hostel Admin", id: "demo" };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const menuData = await mockApi.getMenu();
      setMenu(menuData || {});
      const rsvpData = await mockApi.getRSVPs();
      setRsvps(rsvpData || []);
      const fbData = await mockApi.getFeedbacks();
      setFeedbacks(fbData || []);
      const wasteData = await mockApi.getWasteLogs();
      setWasteLogs(wasteData || []);
      const bufData = await mockApi.getBufferPercentage();
      setBufferPercent(bufData || 8);
    } catch (err) {
      console.error("Error loading admin dashboard data:", err);
    }
  };

  const handleBufferChange = async (percent) => {
    await mockApi.setBufferPercentage(percent);
    setBufferPercent(percent);
    showToast(`Kitchen Safety Buffer updated to ${percent}% for unexpected / late diners!`);
  };

  // Menu Edit state
  const handleMenuChange = (meal, field, value) => {
    setMenu(prev => ({
      ...prev,
      [meal]: {
        ...prev[meal],
        [field]: value
      }
    }));
  };

  const handleSaveMenu = async (meal) => {
    try {
      const updatedMenu = { ...menu };
      await mockApi.updateMenu(updatedMenu);
      showToast(`${meal.charAt(0).toUpperCase() + meal.slice(1)} menu updated successfully! Students will see this menu instantly.`);
    } catch (err) {
      setErrorMsg("Failed to update menu.");
    }
  };

  // Wastage Entry handler
  const handleLogWaste = async (e) => {
    e.preventDefault();
    try {
      const log = {
        date: wasteDate,
        breakfast: parseFloat(wasteBreakfast) || 0,
        lunch: parseFloat(wasteLunch) || 0,
        snacks: parseFloat(wasteSnacks) || 0,
        dinner: parseFloat(wasteDinner) || 0
      };
      
      await mockApi.addWasteLog(log);
      loadDashboardData();
      showToast(`Leftover waste values logged for ${wasteDate}!`);
      
      // Reset inputs
      setWasteBreakfast(0);
      setWasteLunch(0);
      setWasteSnacks(0);
      setWasteDinner(0);
    } catch (err) {
      setErrorMsg("Failed to log leftover waste.");
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

  // Calculations for headcounts
  const getRSVPCounts = (meal) => {
    const mealRsvps = rsvps.filter(r => r.meal === meal);
    
    // Assume there are 200 total students in hostel
    const totalStudents = 200;
    const attendingCount = mealRsvps.filter(r => r.status === "attending").length + 120;
    const lateRequestCount = mealRsvps.filter(r => r.status === "late_request").length;
    const skippingCount = mealRsvps.filter(r => r.status === "skipping").length + 20;
    const undecided = totalStudents - attendingCount - lateRequestCount - skippingCount;
    
    // Predicted attendance counts (attending + late requests + 75% of undecided defaults)
    const predictedHeadcount = attendingCount + lateRequestCount + Math.round(undecided * 0.75);

    return {
      attending: attendingCount,
      lateRequest: lateRequestCount,
      skipping: skippingCount,
      undecided,
      predicted: predictedHeadcount
    };
  };

  // Wastage analytics (Rupees/Carbon footprint calculations)
  const getWastageMetrics = () => {
    let totalWasteKg = 0;
    wasteLogs.forEach(log => {
      totalWasteKg += log.breakfast + log.lunch + log.snacks + log.dinner;
    });

    const costPerKg = 120;
    const co2PerKg = 2.5;

    return {
      totalWasteKg: totalWasteKg.toFixed(1),
      avgWastePerDay: (totalWasteKg / (wasteLogs.length || 1)).toFixed(1),
      financialLoss: (totalWasteKg * costPerKg).toLocaleString('en-IN'),
      carbonFootprint: (totalWasteKg * co2PerKg).toFixed(1)
    };
  };

  const metrics = getWastageMetrics();

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <TrendingUp size={20} />
          </div>
          <span className="sidebar-brand">SmartHostel</span>
        </div>

        <nav className="sidebar-menu">
          <button 
            className={`sidebar-link ${activeTab === "menu" ? "active" : ""}`}
            onClick={() => setActiveTab("menu")}
          >
            <Utensils size={18} />
            <span>Menu Manager</span>
          </button>
          
          <button 
            className={`sidebar-link ${activeTab === "predictions" ? "active" : ""}`}
            onClick={() => setActiveTab("predictions")}
          >
            <Users size={18} />
            <span>Predictions & RSVPs</span>
          </button>

          <button 
            className={`sidebar-link ${activeTab === "waste" ? "active" : ""}`}
            onClick={() => setActiveTab("waste")}
          >
            <Trash2 size={18} />
            <span>Waste Monitor</span>
          </button>
          
          <button 
            className={`sidebar-link ${activeTab === "feedbacks" ? "active" : ""}`}
            onClick={() => setActiveTab("feedbacks")}
          >
            <MessageSquare size={18} />
            <span>Student Feedbacks</span>
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile-bar">
            <div className="avatar" style={{ background: "linear-gradient(135deg, #f43f5e, #f59e0b)" }}>
              {currentUser.name ? currentUser.name.charAt(0) : "A"}
            </div>
            <div className="user-info">
              <div className="user-name">{currentUser.name}</div>
              <div className="user-role">Mess Superintendent</div>
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
            <h1 className="welcome-title">Mess Admin Terminal</h1>
            <p className="welcome-subtitle">Manage food preparations, predict quantities, and monitor mess reports.</p>
          </div>
          <div className="header-actions">
            <button className="toggle-btn" onClick={loadDashboardData} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>Refresh Metrics</span>
            </button>
          </div>
        </div>

        {/* Action Notifications */}
        {successMsg && (
          <div className="success-banner">
            <Check size={18} />
            <span>{successMsg}</span>
          </div>
        )}
        
        {errorMsg && (
          <div className="error-message">
            <AlertTriangle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ADMIN STATS SUMMARY CARDS */}
        <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="stat-card glass-panel" style={{ '--glow-color': 'rgba(244, 63, 94, 0.15)', '--icon-color': 'var(--accent-rose)' }}>
            <div className="stat-card-glow"></div>
            <div className="stat-label">Total Surplus Food Waste</div>
            <div className="stat-value-group">
              <div className="stat-value">{metrics.totalWasteKg} kg</div>
              <Trash2 className="stat-icon" size={24} />
            </div>
            <div className="stat-desc">Accumulated over last {wasteLogs.length} logs</div>
          </div>

          <div className="stat-card glass-panel" style={{ '--glow-color': 'rgba(245, 158, 11, 0.15)', '--icon-color': 'var(--accent-amber)' }}>
            <div className="stat-card-glow"></div>
            <div className="stat-label">Emergency Tokens Used</div>
            <div className="stat-value-group">
              <div className="stat-value">{rsvps.filter(r => r.status === "late_request").length} Students</div>
              <Zap className="stat-icon" size={24} />
            </div>
            <div className="stat-desc">Redeemed from 20-Meal Kitchen Buffer</div>
          </div>

          <div className="stat-card glass-panel" style={{ '--glow-color': 'rgba(6, 182, 212, 0.15)', '--icon-color': 'var(--accent-cyan)' }}>
            <div className="stat-card-glow"></div>
            <div className="stat-label">Financial Loss (Surplus)</div>
            <div className="stat-value-group">
              <div className="stat-value">₹{metrics.financialLoss}</div>
              <IndianRupee className="stat-icon" size={24} />
            </div>
            <div className="stat-desc">Cost wasted based on prep loss</div>
          </div>

          <div className="stat-card glass-panel" style={{ '--glow-color': 'rgba(16, 185, 129, 0.15)', '--icon-color': 'var(--accent-emerald)' }}>
            <div className="stat-card-glow"></div>
            <div className="stat-label">CO2 Carbon Footprint</div>
            <div className="stat-value-group">
              <div className="stat-value">{metrics.carbonFootprint} kg</div>
              <Leaf className="stat-icon" size={24} />
            </div>
            <div className="stat-desc">Equivalent environmental emission</div>
          </div>
        </div>

        {/* TAB 1: MENU MANAGER */}
        {activeTab === "menu" && (
          <div className="glass-panel" style={{ padding: "30px" }}>
            <h2 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
              <Utensils size={22} color="var(--primary)" />
              Manage Daily Food Menu
            </h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginBottom: "24px" }}>
              Updating details here publishes the items to all student portals dynamically.
            </p>

            {Object.keys(menu).length === 0 ? (
              <p>Loading menu fields...</p>
            ) : (
              <div className="admin-menu-list">
                {Object.keys(menu).map((meal) => (
                  <div key={meal} className="admin-menu-input-row">
                    <div className="admin-menu-header">
                      <span className={`meal-badge ${meal}`} style={{ textTransform: "capitalize" }}>
                        {meal}
                      </span>
                      <button 
                        className="auth-button" 
                        style={{ padding: "8px 16px", fontSize: "13px", width: "auto" }}
                        onClick={() => handleSaveMenu(meal)}
                      >
                        <Save size={14} />
                        Publish {meal}
                      </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr", gap: "16px", marginTop: "12px" }}>
                      <div className="form-group" style={{ marginBottom: "12px" }}>
                        <label className="form-label">Menu Items (Comma Separated)</label>
                        <input
                          type="text"
                          className="form-input"
                          style={{ paddingLeft: "14px" }}
                          value={menu[meal].items}
                          onChange={(e) => handleMenuChange(meal, "items", e.target.value)}
                        />
                      </div>
                      
                      <div className="form-group" style={{ marginBottom: "12px" }}>
                        <label className="form-label">Calories (kcal)</label>
                        <input
                          type="number"
                          className="form-input"
                          style={{ paddingLeft: "14px" }}
                          value={menu[meal].calories}
                          onChange={(e) => handleMenuChange(meal, "calories", parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                      <div className="form-group" style={{ marginBottom: "0" }}>
                        <label className="form-label">Key Ingredients</label>
                        <input
                          type="text"
                          className="form-input"
                          style={{ paddingLeft: "14px" }}
                          value={menu[meal].ingredients}
                          onChange={(e) => handleMenuChange(meal, "ingredients", e.target.value)}
                        />
                      </div>

                      <div className="form-group" style={{ marginBottom: "0" }}>
                        <label className="form-label">Cut-off Time</label>
                        <input
                          type="text"
                          className="form-input"
                          style={{ paddingLeft: "14px" }}
                          value={menu[meal].cutoffTime || "08:00 AM"}
                          onChange={(e) => handleMenuChange(meal, "cutoffTime", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PREDICTIONS & Attendance RSVPs */}
        {activeTab === "predictions" && (
          <div className="glass-panel" style={{ padding: "30px" }}>
            <div className="flex-space" style={{ marginBottom: "20px" }}>
              <div>
                <h2 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <Users size={22} color="var(--primary)" />
                  Headcount Predictions & Safety Buffer Stock
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "4px" }}>
                  Calculates exact meal weights with a configurable Safety Buffer for last-minute/unplanned diners.
                </p>
              </div>

              {/* Kitchen Buffer Controller */}
              <div className="glass-panel" style={{ padding: "12px 18px", borderRadius: "12px", background: "rgba(99, 102, 241, 0.08)", border: "1px solid rgba(99, 102, 241, 0.3)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "6px" }}>
                  <Sliders size={16} color="var(--accent-amber)" />
                  <span>Kitchen Safety Buffer Margin: {bufferPercent}%</span>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  {[5, 8, 10, 15].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => handleBufferChange(pct)}
                      className={`category-pill-btn ${bufferPercent === pct ? "active" : ""}`}
                      style={{ padding: "4px 10px", fontSize: "12px" }}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Meal Course</th>
                    <th>RSVP Attending</th>
                    <th>Emergency Tokens</th>
                    <th>RSVP Skipping</th>
                    <th style={{ color: "var(--accent-cyan)" }}>Base Headcount</th>
                    <th>Recommended Cook Weight (Base + Buffer)</th>
                  </tr>
                </thead>
                <tbody>
                  {["breakfast", "lunch", "snacks", "dinner"].map((meal) => {
                    const count = getRSVPCounts(meal);
                    const portionFactor = meal === "breakfast" ? 0.25 : meal === "snacks" ? 0.15 : 0.4;
                    
                    const standardPrep = (200 * portionFactor).toFixed(0);
                    const basePrepKg = (count.predicted * portionFactor);
                    const bufferKg = (basePrepKg * (bufferPercent / 100));
                    const totalOptimalPrepKg = (basePrepKg + bufferKg).toFixed(1);

                    return (
                      <tr key={meal}>
                        <td style={{ textTransform: "capitalize", fontWeight: "600" }}>{meal}</td>
                        <td style={{ color: "var(--accent-emerald)" }}>{count.attending} students</td>
                        <td style={{ color: "var(--accent-amber)", fontWeight: "600" }}>
                          {count.lateRequest > 0 ? `${count.lateRequest} Emergency Tokens` : "0 Tokens"}
                        </td>
                        <td style={{ color: "var(--accent-rose)" }}>{count.skipping} students</td>
                        <td style={{ fontWeight: "700", color: "var(--accent-cyan)", fontSize: "15px" }}>
                          {count.predicted} / 200
                        </td>
                        <td>
                          <div>
                            <span style={{ fontWeight: "700", color: "var(--accent-emerald)", fontSize: "15px" }}>
                              {totalOptimalPrepKg} kg
                            </span>
                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}> (Base {basePrepKg.toFixed(1)} + Buffer {bufferKg.toFixed(1)} kg)</span>
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--accent-emerald)" }}>
                            Saved {(standardPrep - totalOptimalPrepKg).toFixed(1)} kg over unoptimized {standardPrep} kg!
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* List of custom student RSVPs in database */}
            <h3 style={{ marginTop: "32px", marginBottom: "16px" }}>Detailed RSVP Log & Gate Verification</h3>
            {rsvps.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>No custom RSVPs entered. Seed list is active.</p>
            ) : (
              <div className="table-responsive" style={{ maxHeight: "250px" }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Meal</th>
                      <th>Selection</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rsvps.slice().reverse().map((r) => (
                      <tr key={r.id}>
                        <td>{r.name}</td>
                        <td style={{ textTransform: "capitalize" }}>{r.meal}</td>
                        <td>
                          <span className={`status-pill ${r.status === "late_request" ? "attending" : r.status}`} style={{
                            background: r.status === "late_request" ? "rgba(245, 158, 11, 0.15)" : undefined,
                            color: r.status === "late_request" ? "var(--accent-amber)" : undefined
                          }}>
                            {r.status === "attending" ? "Attending" : r.status === "late_request" ? "⚡ Emergency Token Used" : "Skipping"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}


        {/* TAB 3: WASTE MONITOR & Logger */}
        {activeTab === "waste" && (
          <div className="admin-grid">
            {/* Waste Entry Form */}
            <div className="glass-panel admin-form-panel">
              <h2 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                <Trash2 size={22} color="var(--primary)" />
                Log Surplus Leftovers
              </h2>
              <p style={{ color: "var(--text-secondary)", fontSize: "13px", marginBottom: "24px" }}>
                Log the weight of edible foods thrown away at the end of each meal schedule.
              </p>

              <form onSubmit={handleLogWaste}>
                <div className="form-group">
                  <label className="form-label">Wastage Log Date</label>
                  <input
                    type="date"
                    className="form-input"
                    style={{ paddingLeft: "14px" }}
                    value={wasteDate}
                    onChange={(e) => setWasteDate(e.target.value)}
                    required
                  />
                </div>

                <div className="waste-input-grid">
                  <div className="form-group">
                    <label className="form-label">Breakfast (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      style={{ paddingLeft: "14px" }}
                      value={wasteBreakfast}
                      onChange={(e) => setWasteBreakfast(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Lunch (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      style={{ paddingLeft: "14px" }}
                      value={wasteLunch}
                      onChange={(e) => setWasteLunch(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Snacks (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      style={{ paddingLeft: "14px" }}
                      value={wasteSnacks}
                      onChange={(e) => setWasteSnacks(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Dinner (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      style={{ paddingLeft: "14px" }}
                      value={wasteDinner}
                      onChange={(e) => setWasteDinner(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button type="submit" className="auth-button">
                  <Plus size={18} />
                  Log Leftovers
                </button>
              </form>
            </div>

            {/* Custom Interactive SVG Wastage Trend Chart */}
            <div className="glass-panel chart-container">
              <div className="chart-header">
                <h3>7-Day Wastage Trend (kg)</h3>
                <BarChart3 size={20} color="var(--primary)" />
              </div>

              {/* Flex-based Custom bar graph */}
              <div className="css-graph-wrapper">
                {wasteLogs.slice(-7).map((log, index) => {
                  const dayWaste = log.breakfast + log.lunch + log.snacks + log.dinner;
                  // Max waste represented as 100kg height
                  const percentHeight = Math.min((dayWaste / 90) * 100, 100);
                  
                  return (
                    <div key={index} className="graph-column">
                      <div className="graph-bar-stack">
                        <div 
                          className="graph-bar-fill" 
                          style={{ height: `${percentHeight}%` }}
                        >
                          <span className="graph-bar-hover-val">{dayWaste.toFixed(0)}</span>
                        </div>
                      </div>
                      <span className="graph-label">
                        {log.date.slice(-5)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: "flex", gap: "16px", justifyContent: "center", fontSize: "11px", color: "var(--text-secondary)", marginTop: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                  <div style={{ width: "10px", height: "10px", background: "linear-gradient(to top, var(--accent-rose), #fb7185)", borderRadius: "2px" }}></div>
                  <span>Total Leftovers (kg)</span>
                </div>
              </div>
            </div>

            {/* Waste Log History Table */}
            <div className="glass-panel" style={{ gridColumn: "1 / -1", padding: "28px" }}>
              <h3>Leftover Log History</h3>
              <div className="table-responsive" style={{ marginTop: "16px" }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Logged Date</th>
                      <th>Breakfast</th>
                      <th>Lunch</th>
                      <th>Snacks</th>
                      <th>Dinner</th>
                      <th style={{ color: "var(--accent-rose)" }}>Daily Total</th>
                      <th>Calculated Losses</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wasteLogs.slice().reverse().map((log, i) => {
                      const dailySum = log.breakfast + log.lunch + log.snacks + log.dinner;
                      return (
                        <tr key={i}>
                          <td style={{ fontWeight: "600" }}>{log.date}</td>
                          <td>{log.breakfast} kg</td>
                          <td>{log.lunch} kg</td>
                          <td>{log.snacks} kg</td>
                          <td>{log.dinner} kg</td>
                          <td style={{ fontWeight: "700", color: "var(--accent-rose)" }}>{dailySum.toFixed(1)} kg</td>
                          <td>
                            <div style={{ fontSize: "13px", color: "var(--accent-rose)" }}>₹{(dailySum * 120).toLocaleString('en-IN')} loss</div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{(dailySum * 2.5).toFixed(1)} kg CO2 emissions</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: STUDENT FEEDBACK INBOX */}
        {activeTab === "feedbacks" && (
          <div className="glass-panel" style={{ padding: "30px" }}>
            <div className="flex-space" style={{ marginBottom: "24px" }}>
              <h2 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <MessageSquare size={22} color="var(--primary)" />
                Student Feedback Inbox
              </h2>
              
              {/* Avg rating calculation */}
              <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '12px' }}>
                <Star size={18} fill="var(--accent-amber)" color="var(--accent-amber)" />
                <span style={{ fontSize: '14px', fontWeight: '600' }}>
                  Average Rating: {(feedbacks.reduce((acc, f) => acc + f.rating, 0) / (feedbacks.length || 1)).toFixed(1)} / 5.0
                </span>
              </div>
            </div>
            {/* QR Code Verification Tool */}
            <div className="glass-panel" style={{ padding: "20px", borderRadius: "14px", marginBottom: "24px", background: "rgba(99, 102, 241, 0.06)", border: "1px solid rgba(99, 102, 241, 0.25)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <QrCode size={20} color="var(--primary)" />
                <h3 style={{ fontSize: "16px", margin: 0 }}>Verify Student Feedback QR Code</h3>
              </div>
              <div style={{ display: "flex", gap: "12px", maxWidth: "600px" }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: "14px" }}
                  placeholder="Paste or scan QR Payload string (e.g. FB-102-LUNCH-4)..."
                  value={qrQuery}
                  onChange={(e) => setQrQuery(e.target.value)}
                />
                <button
                  type="button"
                  className="auth-button"
                  style={{ width: "auto", padding: "0 20px", whiteSpace: "nowrap" }}
                  onClick={() => {
                    if (!qrQuery.trim()) return;
                    const matched = feedbacks.find(f => f.qrPayload && f.qrPayload.toLowerCase().includes(qrQuery.trim().toLowerCase()));
                    if (matched) {
                      setQrResult({ success: true, feedback: matched });
                    } else {
                      setQrResult({ success: false, query: qrQuery });
                    }
                  }}
                >
                  <Search size={16} />
                  <span>Verify Code</span>
                </button>
              </div>

              {qrResult && (
                <div style={{ marginTop: "16px" }}>
                  {qrResult.success ? (
                    <div className="success-banner" style={{ display: "block" }}>
                      <div style={{ fontWeight: "bold", fontSize: "15px", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                        <Check size={18} />
                        <span>VERIFIED MATCH FOUND</span>
                      </div>
                      <div>
                        <strong>Student:</strong> {qrResult.feedback.studentName} (Room {qrResult.feedback.roomNo}) | 
                        <strong> Meal:</strong> {qrResult.feedback.meal.toUpperCase()} | 
                        <strong> Rating:</strong> {qrResult.feedback.rating}/5 ⭐
                      </div>
                      <div style={{ fontStyle: "italic", marginTop: "4px" }}>&quot;{qrResult.feedback.comment}&quot;</div>
                    </div>
                  ) : (
                    <div className="error-message" style={{ display: "block" }}>
                      <div style={{ fontWeight: "bold" }}>❌ NO MATCH FOUND</div>
                      <div>No feedback record matches payload &quot;{qrResult.query}&quot;.</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {feedbacks.length === 0 ? (
              <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>No feedback reports submitted by students yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Time Sent</th>
                      <th>Student Room</th>
                      <th>Meal</th>
                      <th>Category</th>
                      <th>Rating</th>
                      <th style={{ width: "35%" }}>Feedback Message</th>
                      <th>QR Verification</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedbacks.map((fb) => (
                      <tr key={fb.id}>
                        <td>{new Date(fb.date).toLocaleString()}</td>
                        <td>
                          <span style={{ fontWeight: "600" }}>{fb.studentName}</span>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Room {fb.roomNo}</div>
                        </td>
                        <td style={{ textTransform: "capitalize" }}>{fb.meal}</td>
                        <td>
                          <span className="status-pill attending" style={{ color: "var(--primary)", background: "rgba(99, 102, 241, 0.1)" }}>
                            {fb.category}
                          </span>
                        </td>
                        <td>
                          <div className="rating-stars-display">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} size={13} fill={fb.rating >= s ? "currentColor" : "none"} color="var(--accent-amber)" />
                            ))}
                          </div>
                        </td>
                        <td style={{ fontSize: "13px", lineHeight: "1.4" }}>
                          &quot;{fb.comment}&quot;
                        </td>
                        <td style={{ fontFamily: "monospace", fontSize: "11px", color: "var(--accent-cyan)" }}>
                          <button
                            type="button"
                            onClick={() => {
                              setQrQuery(fb.qrPayload);
                              setQrResult({ success: true, feedback: fb });
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
                        <td>
                          <button 
                            className="toggle-btn"
                            style={{ padding: "6px 12px", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}
                            onClick={() => {
                              showToast(`Alert dispatched to Head Cook regarding: ${fb.category} issue on ${fb.meal}!`);
                            }}
                          >
                            <Flame size={12} />
                            <span>Escalate</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
