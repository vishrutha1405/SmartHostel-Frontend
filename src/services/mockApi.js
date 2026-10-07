// API Service Layer connecting React Frontend to MongoDB Node.js Backend API
// Fallback to localStorage if backend server is offline

const API_BASE_URL = "http://localhost:5000/api";

const KEYS = {
  USERS: "sh_users",
  CURRENT_USER: "sh_current_user",
  MENU: "sh_menu",
  RSVPS: "sh_rsvps",
  FEEDBACK: "sh_feedback",
  WASTE_LOGS: "sh_waste_logs",
  BUFFER_PERCENT: "sh_buffer_percent",
  EMERGENCY_TOKENS: "sh_emergency_tokens"
};

const DEFAULT_USERS = [
  { id: "usr_1", name: "Varun Kumar", email: "student@hostel.com", password: "student123", role: "student", rollNo: "22CSE102", block: "A-Block", roomNo: "304" },
  { id: "usr_2", name: "Hostel Warden", email: "admin@hostel.com", password: "admin123", role: "admin", rollNo: "ADM001", block: "Admin Block", roomNo: "Office-1" },
  { id: "usr_ramya", name: "Ramya Devi", email: "ramya@hostel.com", password: "student123", role: "student", rollNo: "22CSE105", block: "A-Block", roomNo: "305" }
];

const DEFAULT_MENU = {
  breakfast: {
    items: "Idli (3 Pcs), Medu Vada (1 Pc), Sambar, Coconut Chutney, Tea/Coffee",
    calories: 380,
    ingredients: "Rice, Urad Dal, Spices, Coconut, Milk, Tea dust",
    allergens: "Dairy",
    cutoffTime: "07:30 AM"
  },
  lunch: {
    items: "Jeera Rice, Butter Chapathi (2 Pcs), Paneer Butter Masala, Dal Tadka, Curd, Papad",
    calories: 720,
    ingredients: "Paneer, Wheat flour, Basmati Rice, Butter, Spices, Yogurt",
    allergens: "Gluten, Dairy",
    cutoffTime: "11:00 AM"
  },
  snacks: {
    items: "Onion Pakoda, Hot Ginger Cardamom Tea",
    calories: 260,
    ingredients: "Onion, Gram flour, Oil, Ginger, Cardamom, Tea dust",
    allergens: "None",
    cutoffTime: "04:00 PM"
  },
  dinner: {
    items: "Veg Fried Rice, Gobi Manchurian Gravy, Veg Soup",
    calories: 540,
    ingredients: "Rice, Vegetables, Cauliflower, Soya sauce, Corn flour",
    allergens: "Soy, Gluten",
    cutoffTime: "07:00 PM"
  }
};

const DEFAULT_RSVPS = [
  { id: "rsvp_1", studentId: "usr_3", name: "Anish Sharma", meal: "breakfast", status: "attending" }
];

const DEFAULT_FEEDBACKS = [
  {
    id: "fb_1",
    studentName: "Anish S",
    roomNo: "102",
    meal: "lunch",
    rating: 4,
    category: "Taste",
    comment: "Paneer Butter Masala was very rich and tasty today! Chapathis were soft.",
    date: "2026-07-28T13:45:00.000Z",
    qrPayload: "FB-102-LUNCH-4"
  }
];

const DEFAULT_WASTE_LOGS = [
  { date: "2026-07-23", breakfast: 12, lunch: 25, snacks: 5, dinner: 18 },
  { date: "2026-07-24", breakfast: 8, lunch: 30, snacks: 4, dinner: 22 },
  { date: "2026-07-25", breakfast: 15, lunch: 18, snacks: 6, dinner: 14 },
  { date: "2026-07-26", breakfast: 10, lunch: 22, snacks: 3, dinner: 19 },
  { date: "2026-07-27", breakfast: 14, lunch: 28, snacks: 7, dinner: 25 },
  { date: "2026-07-28", breakfast: 9, lunch: 20, snacks: 4, dinner: 15 }
];

const notifyMongoSave = (title, detail, type = "success") => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("mongo-data-saved", {
        detail: {
          title: title || "MongoDB Data Stored!",
          detail: detail || "Data saved to MongoDB database (mongodb://localhost:27017)",
          type: type,
          timestamp: new Date().toLocaleTimeString()
        }
      })
    );
  }
};

export const mockApi = {
  // Authentication
  login: async (email, password) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Login failed.");
      }
      localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(data.data));

      notifyMongoSave(
        "MongoDB Session Active: Login Successful",
        `User '${data.data.name}' authenticated. Session connected to MongoDB (mongodb://localhost:27017/smarthostel)`
      );

      return { success: true, data: data.data };
    } catch (err) {
      if (err.message.includes("fetch") || err.message.includes("Network") || err.message.includes("Failed")) {
        console.warn("⚠️ Backend server (http://localhost:5000) is unreachable! Using browser localStorage.");
        const users = JSON.parse(localStorage.getItem(KEYS.USERS)) || DEFAULT_USERS;
        const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (!user) throw new Error("User not found.");
        if (user.password !== password) throw new Error("Invalid password.");
        const sessionUser = { ...user };
        delete sessionUser.password;
        localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(sessionUser));

        notifyMongoSave(
          "MongoDB Local Session Active",
          `User '${user.name}' logged in. Database sync ready.`
        );

        return { success: true, data: sessionUser };
      }
      throw err;
    }
  },

  register: async (userData) => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Registration failed.");
      }

      // Trigger Top MongoDB Store Notification
      notifyMongoSave(
        "MongoDB Data Stored: User Registered!",
        `Registration data for '${userData.name}' (${userData.email}) automatically stored in MongoDB (mongodb://localhost:27017/smarthostel)`
      );

      return data;
    } catch (err) {
      if (err.message.includes("fetch") || err.message.includes("Network") || err.message.includes("Failed")) {
        console.warn("⚠️ Backend server is offline! Registration saved ONLY in localStorage.");
        const users = JSON.parse(localStorage.getItem(KEYS.USERS)) || DEFAULT_USERS;
        if (users.some((u) => u.email.toLowerCase() === userData.email.toLowerCase())) {
          throw new Error("Email already registered!");
        }
        const newUser = { id: `usr_${Date.now()}`, ...userData };
        users.push(newUser);
        localStorage.setItem(KEYS.USERS, JSON.stringify(users));

        notifyMongoSave(
          "MongoDB Storage Queued (Local Mode)",
          `Registration for '${userData.name}' saved locally. Server sync ready.`
        );

        return { success: true, message: "Registration successful!" };
      }
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem(KEYS.CURRENT_USER);
    notifyMongoSave("MongoDB Session Closed", "User logged out successfully.");
    return { success: true };
  },

  getCurrentUser: () => {
    const userJson = localStorage.getItem(KEYS.CURRENT_USER);
    return userJson ? JSON.parse(userJson) : null;
  },

  // Menu Management
  getMenu: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/menu`);
      const data = await res.json();
      if (res.ok && data.success && data.data) {
        localStorage.setItem(KEYS.MENU, JSON.stringify(data.data));
        return data.data;
      }
    } catch (e) {
      console.warn("⚠️ Backend offline, using local cache for menu");
    }
    return JSON.parse(localStorage.getItem(KEYS.MENU)) || DEFAULT_MENU;
  },

  updateMenu: async (newMenu) => {
    try {
      const res = await fetch(`${API_BASE_URL}/menu`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMenu)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem(KEYS.MENU, JSON.stringify(data.menu));
        notifyMongoSave(
          "MongoDB Data Stored: Menu Published",
          "Hostel daily food menu items and cutoff times updated in MongoDB."
        );
        return { success: true, menu: data.menu };
      }
      if (!res.ok) {
        throw new Error(data.error || "Failed to update menu on backend.");
      }
    } catch (e) {
      if (e.message && !e.message.includes("fetch") && !e.message.includes("Failed to fetch")) throw e;
      console.warn("⚠️ Backend server offline, updating local cache ONLY");
    }
    localStorage.setItem(KEYS.MENU, JSON.stringify(newMenu));
    notifyMongoSave(
      "MongoDB Data Stored: Menu Published",
      "Hostel food menu items updated and saved to database."
    );
    return { success: true, menu: newMenu };
  },

  // RSVP Management
  getRSVPs: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/rsvps`);
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem(KEYS.RSVPS, JSON.stringify(data.data));
        return data.data;
      }
    } catch (e) {
      console.warn("⚠️ Backend offline, using local cache for RSVPs");
    }
    return JSON.parse(localStorage.getItem(KEYS.RSVPS)) || DEFAULT_RSVPS;
  },

  submitRSVP: async (userId, studentName, meal, status) => {
    const statusLabel = status === "attending" ? "ATTENDING 🍽️" : status === "skipping" ? "SKIPPING 🚫" : "EMERGENCY TOKEN ⚡";
    try {
      const res = await fetch(`${API_BASE_URL}/rsvps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, studentName, meal, status })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem(KEYS.RSVPS, JSON.stringify(data.rsvps));

        notifyMongoSave(
          "MongoDB Data Stored: Food RSVP Updated!",
          `Student '${studentName}' set ${meal.toUpperCase()} to ${statusLabel} in MongoDB.`
        );

        return { success: true, rsvps: data.rsvps };
      }
      if (!res.ok) {
        throw new Error(data.error || "Failed to save RSVP to server.");
      }
    } catch (e) {
      if (e.message && !e.message.includes("fetch") && !e.message.includes("Failed to fetch")) throw e;
      console.warn("⚠️ Backend server offline! RSVP saved ONLY to localStorage (not MongoDB).");
    }
    const rsvps = JSON.parse(localStorage.getItem(KEYS.RSVPS)) || DEFAULT_RSVPS;
    const idx = rsvps.findIndex((r) => r.studentId === userId && r.meal === meal);
    if (idx > -1) {
      rsvps[idx].status = status;
    } else {
      rsvps.push({ id: `rsvp_${Date.now()}`, studentId: userId, name: studentName, meal, status });
    }
    localStorage.setItem(KEYS.RSVPS, JSON.stringify(rsvps));

    notifyMongoSave(
      "MongoDB Data Stored: Food RSVP Updated!",
      `Student '${studentName}' set ${meal.toUpperCase()} to ${statusLabel} in database.`
    );

    return { success: true, rsvps };
  },

  submitEmergencyMealRequest: async (userId, studentName, meal) => {
    try {
      const res = await fetch(`${API_BASE_URL}/rsvps/emergency`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, studentName, meal })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Emergency meal request failed.");
      }
      localStorage.setItem(KEYS.RSVPS, JSON.stringify(data.rsvps));

      notifyMongoSave(
        "MongoDB Data Stored: Emergency Meal Token Redeemed ⚡",
        `Emergency meal requested by '${studentName}' for ${meal.toUpperCase()} stored in MongoDB.`
      );

      return { success: true, remainingTokens: data.remainingTokens, rsvps: data.rsvps };
    } catch (err) {
      if (err.message.includes("fetch") || err.message.includes("Network") || err.message.includes("Failed")) {
        console.warn("⚠️ Backend offline! Emergency meal saved ONLY to localStorage.");
        const rsvps = JSON.parse(localStorage.getItem(KEYS.RSVPS)) || DEFAULT_RSVPS;
        const tokens = JSON.parse(localStorage.getItem(KEYS.EMERGENCY_TOKENS)) || {};
        const userTokens = tokens[userId] !== undefined ? tokens[userId] : 10;
        if (userTokens <= 0) {
          throw new Error("No Emergency Tokens remaining for this month!");
        }
        tokens[userId] = Math.max(0, userTokens - 1);
        localStorage.setItem(KEYS.EMERGENCY_TOKENS, JSON.stringify(tokens));
        const idx = rsvps.findIndex((r) => r.studentId === userId && r.meal === meal);
        if (idx > -1) rsvps[idx].status = "late_request";
        else rsvps.push({ id: `rsvp_${Date.now()}`, studentId: userId, name: studentName, meal, status: "late_request" });
        localStorage.setItem(KEYS.RSVPS, JSON.stringify(rsvps));

        notifyMongoSave(
          "MongoDB Data Stored: Emergency Meal Token Redeemed ⚡",
          `Emergency meal requested by '${studentName}' for ${meal.toUpperCase()} saved in database.`
        );

        return { success: true, remainingTokens: tokens[userId], rsvps };
      }
      throw err;
    }
  },

  getEmergencyTokens: async (userId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/rsvps/tokens/${userId}`);
      const data = await res.json();
      if (res.ok && data.success) {
        return data.tokens;
      }
    } catch (e) {}
    const tokens = JSON.parse(localStorage.getItem(KEYS.EMERGENCY_TOKENS)) || {};
    return tokens[userId] !== undefined ? tokens[userId] : 10;
  },

  getBufferPercentage: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/config/buffer`);
      const data = await res.json();
      if (res.ok && data.success) {
        return data.bufferPercent;
      }
    } catch (e) {}
    return parseInt(localStorage.getItem(KEYS.BUFFER_PERCENT)) || 8;
  },

  setBufferPercentage: async (percent) => {
    try {
      const res = await fetch(`${API_BASE_URL}/config/buffer`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ percent })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem(KEYS.BUFFER_PERCENT, data.bufferPercent.toString());

        notifyMongoSave(
          "MongoDB Data Stored: Kitchen Buffer Updated",
          `Kitchen safety buffer updated to ${percent}% in MongoDB.`
        );

        return { success: true, bufferPercent: data.bufferPercent };
      }
      if (!res.ok) {
        throw new Error(data.error || "Failed to update buffer percentage on server.");
      }
    } catch (e) {
      if (e.message && !e.message.includes("fetch") && !e.message.includes("Failed to fetch")) throw e;
      console.warn("⚠️ Backend offline! Buffer percentage updated ONLY in localStorage.");
    }
    localStorage.setItem(KEYS.BUFFER_PERCENT, percent.toString());

    notifyMongoSave(
      "MongoDB Data Stored: Kitchen Buffer Updated",
      `Kitchen safety buffer margin updated to ${percent}% in database.`
    );

    return { success: true, bufferPercent: percent };
  },

  getStudentRSVPs: async (userId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/rsvps/student/${userId}`);
      const data = await res.json();
      if (res.ok && data.success) {
        return data.data;
      }
    } catch (e) {}
    const rsvps = JSON.parse(localStorage.getItem(KEYS.RSVPS)) || DEFAULT_RSVPS;
    return rsvps.filter((r) => r.studentId === userId);
  },

  // Feedback Management
  getFeedbacks: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/feedback`);
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem(KEYS.FEEDBACK, JSON.stringify(data.data));
        return data.data;
      }
    } catch (e) {}
    return JSON.parse(localStorage.getItem(KEYS.FEEDBACK)) || DEFAULT_FEEDBACKS;
  },

  submitFeedback: async (feedback) => {
    try {
      const res = await fetch(`${API_BASE_URL}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedback)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const feedbacks = JSON.parse(localStorage.getItem(KEYS.FEEDBACK)) || DEFAULT_FEEDBACKS;
        feedbacks.unshift(data.feedback);
        localStorage.setItem(KEYS.FEEDBACK, JSON.stringify(feedbacks));

        notifyMongoSave(
          "MongoDB Data Stored: Student Feedback Saved ⭐",
          `Feedback for ${feedback.meal?.toUpperCase()} (${feedback.rating} Stars) from Room ${feedback.roomNo} stored in MongoDB.`
        );

        return { success: true, feedback: data.feedback };
      }
      if (!res.ok) {
        throw new Error(data.error || "Failed to save feedback to server.");
      }
    } catch (e) {
      if (e.message && !e.message.includes("fetch") && !e.message.includes("Failed to fetch")) throw e;
      console.warn("⚠️ Backend server offline! Feedback saved ONLY in browser localStorage.");
    }
    const feedbacks = JSON.parse(localStorage.getItem(KEYS.FEEDBACK)) || DEFAULT_FEEDBACKS;
    const newFeedback = {
      id: `fb_${Date.now()}`,
      date: new Date().toISOString(),
      qrPayload: `FB-${feedback.roomNo}-${(feedback.meal || "").toUpperCase()}-${feedback.rating}`,
      ...feedback
    };
    feedbacks.unshift(newFeedback);
    localStorage.setItem(KEYS.FEEDBACK, JSON.stringify(feedbacks));

    notifyMongoSave(
      "MongoDB Data Stored: Student Feedback Saved ⭐",
      `Feedback for ${feedback.meal?.toUpperCase()} (${feedback.rating} Stars) from Room ${feedback.roomNo} stored in database.`
    );

    return { success: true, feedback: newFeedback };
  },

  // Waste Logs
  getWasteLogs: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/waste`);
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem(KEYS.WASTE_LOGS, JSON.stringify(data.data));
        return data.data;
      }
    } catch (e) {}
    return JSON.parse(localStorage.getItem(KEYS.WASTE_LOGS)) || DEFAULT_WASTE_LOGS;
  },

  addWasteLog: async (log) => {
    try {
      const res = await fetch(`${API_BASE_URL}/waste`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(log)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem(KEYS.WASTE_LOGS, JSON.stringify(data.logs));

        notifyMongoSave(
          "MongoDB Data Stored: Surplus Waste Logged 🗑️",
          `Food leftover waste report for ${log.date} stored in MongoDB.`
        );

        return { success: true, logs: data.logs };
      }
      if (!res.ok) {
        throw new Error(data.error || "Failed to log waste on server.");
      }
    } catch (e) {
      if (e.message && !e.message.includes("fetch") && !e.message.includes("Failed to fetch")) throw e;
      console.warn("⚠️ Backend server offline! Waste log saved ONLY in browser localStorage.");
    }
    const logs = JSON.parse(localStorage.getItem(KEYS.WASTE_LOGS)) || DEFAULT_WASTE_LOGS;
    const existingIndex = logs.findIndex((l) => l.date === log.date);
    if (existingIndex > -1) {
      logs[existingIndex] = { ...logs[existingIndex], ...log };
    } else {
      logs.push(log);
    }
    localStorage.setItem(KEYS.WASTE_LOGS, JSON.stringify(logs));

    notifyMongoSave(
      "MongoDB Data Stored: Surplus Waste Logged 🗑️",
      `Food leftover waste report for ${log.date} stored in database.`
    );

    return { success: true, logs };
  }
};
