import React, { useState } from "react";
import { QrCode, Check, Copy, ExternalLink } from "lucide-react";

export function QRCodeDisplay({ value, title = "Feedback QR Code", size = 200 }) {
  const [copied, setCopied] = useState(false);

  if (!value) {
    return (
      <div className="qr-placeholder-box" style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "30px",
        borderRadius: "16px",
        background: "rgba(255, 255, 255, 0.03)",
        border: "2px dashed rgba(255, 255, 255, 0.15)",
        color: "var(--text-muted)",
        textAlign: "center",
        minHeight: "220px"
      }}>
        <QrCode size={48} style={{ opacity: 0.4, marginBottom: "12px" }} />
        <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
          Submit review or request meal to generate scannable QR Code
        </span>
      </div>
    );
  }

  // Uses high reliability QR Code generation endpoint with clean resolution
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&margin=10&data=${encodeURIComponent(value)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="real-qr-card" style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "20px",
      background: "rgba(255, 255, 255, 0.04)",
      borderRadius: "20px",
      border: "1px solid rgba(255, 255, 255, 0.12)",
      backdropFilter: "blur(12px)",
      boxShadow: "0 8px 32px rgba(0,0,0,0.3)"
    }}>
      {/* High contrast container so camera easily reads barcode */}
      <div style={{
        padding: "14px",
        background: "#ffffff",
        borderRadius: "16px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
        display: "inline-block",
        position: "relative"
      }}>
        <img
          src={qrImageUrl}
          alt={`QR Code: ${value}`}
          width={size}
          height={size}
          style={{ display: "block", borderRadius: "8px" }}
          onError={(e) => {
            // Fallback if network blocks API image
            e.target.style.display = "none";
            e.target.nextSibling.style.display = "flex";
          }}
        />
        <div style={{
          display: "none",
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          color: "#1e293b",
          fontFamily: "monospace",
          fontSize: "12px",
          padding: "10px",
          textAlign: "center"
        }}>
          <QrCode size={36} color="#6366f1" />
          <div style={{ marginTop: "8px", fontWeight: "bold" }}>{value}</div>
        </div>
      </div>

      <div style={{ marginTop: "16px", textAlign: "center", width: "100%" }}>
        <div style={{
          fontFamily: "monospace",
          fontSize: "12px",
          padding: "8px 12px",
          background: "rgba(99, 102, 241, 0.15)",
          color: "var(--accent-cyan)",
          borderRadius: "8px",
          wordBreak: "break-all",
          border: "1px solid rgba(99, 102, 241, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px"
        }}>
          <span>{value}</span>
          <button
            onClick={handleCopy}
            type="button"
            style={{
              background: "none",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              padding: "2px"
            }}
            title="Copy QR Payload"
          >
            {copied ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
          </button>
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          marginTop: "12px",
          color: "var(--accent-emerald)",
          fontSize: "13px",
          fontWeight: "600"
        }}>
          <Check size={16} />
          <span>Scannable Code Ready for Camera / Barcode Scanner</span>
        </div>
      </div>
    </div>
  );
}
