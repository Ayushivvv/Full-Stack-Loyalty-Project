import React from 'react';

export default function PromotionCard({ promo }) {
  const typeStyles = {
    automatic: { bg: "#d8a1c9ff", badge: "#d63384" },
    "one-time": { bg: "#c6a0acff", badge: "#942753ff" },
  };

  const style = typeStyles[promo.type] || { bg: "#f9f9f9", badge: "#555" };

  return (
    <div
      style={{
        width: "350px",
        borderRadius: "14px",
        padding: "18px",
        background: style.bg,
        boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        border: "1px solid rgba(0,0,0,0.05)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)";
      }}
    >
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>
          {promo.name}
        </h3>
        <span
          style={{
            background: style.badge,
            color: "white",
            padding: "4px 10px",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {promo.type}
        </span>
      </div>

      {/* DESCRIPTION */}
      {promo.description && (
        <p style={{ margin: "4px 0", fontSize: "14px", color: "#444" }}>
          {promo.description}
        </p>
      )}

      {/* DETAILS */}
      <div style={{ fontSize: "14px", color: "#444", display: "flex", flexDirection: "column", gap: "4px" }}>
        <p style={{ margin: 0 }}>
          <b>Points:</b> {promo.points}
        </p>
        <p style={{ margin: 0 }}>
          <b>Min Spending:</b> ${promo.minSpending}
        </p>
        <p style={{ margin: 0 }}>
          <b>Start:</b> {new Date(promo.startTime).toLocaleString()}
        </p>
        <p style={{ margin: 0 }}>
          <b>End:</b> {new Date(promo.endTime).toLocaleString()}
        </p>
      </div>

      {/* OPTIONAL WARNING / INFO */}
      {promo.suspicious && (
        <div
          style={{
            marginTop: "8px",
            padding: "8px 12px",
            background: "#FFEBEE",
            color: "#C62828",
            borderRadius: "8px",
            fontWeight: 600,
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          ⚠ Marked Suspicious
        </div>
      )}
    </div>
  );
}
