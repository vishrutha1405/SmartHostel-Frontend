import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Server, Zap, X } from "lucide-react";

export function triggerMongoSaveNotification(title, detail, type = "success") {
  window.dispatchEvent(
    new CustomEvent("mongo-data-saved", {
      detail: {
        title: title || "MongoDB Data Stored!",
        detail: detail || "Data saved successfully in database: smarthostel",
        type: type,
        timestamp: new Date().toLocaleTimeString()
      }
    })
  );
}

export default function MongoNotification() {
  const [activeToast, setActiveToast] = useState(null);

  useEffect(() => {
    const handleMongoEvent = (e) => {
      const { title, detail, type = "success", timestamp } = e.detail;
      const newNotification = { title, detail, type, timestamp, id: Date.now() };
      setActiveToast(newNotification);

      // Auto dismiss after 7 seconds
      setTimeout(() => {
        setActiveToast((current) => (current?.id === newNotification.id ? null : current));
      }, 7000);
    };

    window.addEventListener("mongo-data-saved", handleMongoEvent);

    return () => {
      window.removeEventListener("mongo-data-saved", handleMongoEvent);
    };
  }, []);

  if (!activeToast) return null;

  return (
    <div className="mongo-header-container" style={{ position: "fixed", top: 0, right: 0, zIndex: 10000, pointerEvents: "none" }}>
      {/* Floating Animated MongoDB Notification Toast Only */}
      <div className={`mongo-toast-banner animate-slide-down ${activeToast.type || "success"}`} style={{ pointerEvents: "auto" }}>
        <div className="mongo-toast-icon-wrapper">
          {activeToast.type === "error" ? (
            <XCircle size={22} className="mongo-toast-icon error" />
          ) : activeToast.type === "warning" ? (
            <AlertTriangle size={22} className="mongo-toast-icon warning" />
          ) : (
            <Zap size={22} className="mongo-toast-zap" />
          )}
        </div>
        <div className="mongo-toast-content">
          <div className="mongo-toast-header">
            <span className={`mongo-toast-tag ${activeToast.type || "success"}`}>
              {activeToast.type === "error"
                ? "MongoDB Connection Error"
                : activeToast.type === "warning"
                ? "MongoDB Sync Warning"
                : "MongoDB Data Store Confirmed"}
            </span>
            <span className="mongo-toast-time">{activeToast.timestamp}</span>
          </div>
          <h4 className="mongo-toast-title">
            {activeToast.type === "error" ? (
              <XCircle size={16} style={{ color: "#f43f5e", marginRight: "6px" }} />
            ) : activeToast.type === "warning" ? (
              <AlertTriangle size={16} style={{ color: "#f59e0b", marginRight: "6px" }} />
            ) : (
              <CheckCircle2 size={16} style={{ color: "#10b981", marginRight: "6px" }} />
            )}
            {activeToast.title}
          </h4>
          <p className="mongo-toast-detail">{activeToast.detail}</p>
          <div className="mongo-toast-footer">
            <Server size={13} style={{ opacity: 0.8 }} />
            <span>Target: <strong>mongodb://localhost:27017/smarthostel</strong></span>
          </div>
        </div>
        <button className="mongo-toast-close" onClick={() => setActiveToast(null)}>
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
