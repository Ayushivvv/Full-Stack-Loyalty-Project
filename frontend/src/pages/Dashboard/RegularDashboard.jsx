import React, { useEffect, useState } from "react";
import "./RegularDashboard.scss";
import { useAuth } from "../../context/AuthContext";
import { getMyTransactions } from "../../api/transaction";

export default function RegularDashboard() {
  const { user, token, loading: authLoading } = useAuth();

  const [points, setPoints] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  function formatDate(ts) {
    if (!ts) return "Unknown date";

    const iso = ts.replace(" ", "T");

    try {
        return new Date(iso).toISOString().split("T")[0]; 
    } catch {
        return "Invalid date";
    }
  }

function formatAmount(t) {
  if (t.type === "transfer") {
    const amt = t.amount > 0 ? `+${t.amount} pts` : `${t.amount} points`;
    return amt;
  }

  if (t.type === "redemption") {
    return `-${t.redeemed ?? t.amount} points`;
  }

  if (t.type === "purchase") {
    const spent = t.spent ? `-$${t.spent} points` : "";
    const earned = t.earned ? ` +${t.earned} points` : "";
    return spent + "\n" + earned;
  }

  if (t.type === "adjustment") {
    return `${t.amount > 0 ? "+" : ""}${t.amount} points`;
  }

  return t.amount ?? "";
}


  useEffect(() => {
    if (!token || authLoading) return;

    const loadData = async () => {
      try {
        const data = await getMyTransactions();
        setTransactions(data.results || []);
        setPoints(user?.points || 0);
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token, authLoading, user]);

  if (authLoading) return <div className="dashboard">Loading...</div>;

  if (loading) return <div className="dashboard">Loading your dashboard...</div>;
  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-container">

        <h1 className="dashboard-welcome">
          {user?.name ? `Welcome, ${user.name}! 💖` : "Welcome! 💖"}
        </h1>

        <div className="dashboard-top-row">

          <div className="dashboard-card points-card">
            <h2>Your Points</h2>
            <div className="points-value">{points}</div>
          </div>

          <div className="dashboard-card activity-card">
            <h2>Recent Activity</h2>
            <div className="activity-list">
              {transactions.length > 0 ? (
                transactions.slice(0, 5).map((t) => (
                    <div key={t.id} className="activity-item">
                    <span className="activity-type">{t.type}</span>

                    <span className="activity-date">
                        {formatDate(t.date || t.createdAt)}
                    </span>

                    {t.remark && (
                        <span className="activity-ref">{t.remark}</span>
                    )}

                    <span className="activity-amount">{formatAmount(t)}</span>
                    </div>
                ))
                ) : (
                <div className="activity-empty">No recent activity</div>
                )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}