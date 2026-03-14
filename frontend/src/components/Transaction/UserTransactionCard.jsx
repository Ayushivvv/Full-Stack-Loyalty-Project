export default function TransactionCard({ transaction }) {
  const typeStyles = {
    purchase: { bg: "#a4c9e4ff", badge: "#1E88E5" },
    redemption: { bg: "#facfddff", badge: "#C2185B" },
    adjustment: { bg: "#f6e3c5ff", badge: "#EF6C00" },
    transfer: { bg: "#d1f4d4ff", badge: "#2E7D32" },
    event: { bg: "#dfd0f6ff", badge: "#5E35B1" }
  };

  const style = typeStyles[transaction.type] || {
    bg: "#f9f9f9",
    badge: "#555"
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "350px",
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
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.12)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.08)";
      }}
    >
      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>
          Transaction #{transaction.id}
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
            letterSpacing: "0.5px"
          }}
        >
          {transaction.type}
        </span>
      </div>

      {/* AMOUNT */}
<div
  style={{
    fontSize: "22px",
    fontWeight: 800,
    marginTop: "4px"
  }}
>
  {transaction.type === "purchase" && (
    `-$${transaction.amount}`
  )}

  {transaction.type === "redemption" && (
    `+${transaction.amount} pts`
  )}

  {transaction.type === "transfer" && (
    transaction.amount < 0
      ? `-$${Math.abs(transaction.amount)}`
      : `+$${transaction.amount}`
  )}

  {transaction.type === "adjustment" && (
    `${transaction.amount > 0 ? "+" : "-"}${Math.abs(transaction.amount)} pts`
  )}

  {transaction.type === "event" && (
    `+${transaction.amount} pts`
  )}
</div>


      {/* DETAILS */}
      <div style={{ fontSize: "14px", color: "#444" }}>
        {transaction.remark && (
          <p style={{ margin: 0 }}>
            <b>Remark:</b> {transaction.remark}
          </p>
        )}
      </div>

      {/* WARNING */}
      {transaction.suspicious && (
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
            gap: "6px"
          }}
        >
          ⚠ Marked Suspicious
        </div>
      )}
    </div>
  );
}
