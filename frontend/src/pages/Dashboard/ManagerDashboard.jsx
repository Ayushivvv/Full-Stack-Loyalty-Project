import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../assets/styles/global.scss";
import "./ManagerDashboard.scss";
import { getPromotions } from "../../api/promotions";
import { getEvents } from "../../api/eventsApi";
import { useAuth } from "../../context/AuthContext";

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
    try {
      const eventsData = await getEvents({});
      const promotionsData = await getPromotions({});

      const promotionsList = Array.isArray(promotionsData)
        ? promotionsData
        : promotionsData.results || [];

      const eventsList = Array.isArray(eventsData)
        ? eventsData
        : eventsData.results || [];

      setPromotions(promotionsList.slice(0, 5));
      setEvents(eventsList.slice(0, 5));
    } catch (err) {
      console.error("Failed to load manager dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  loadData();
}, []);

  if (loading) return <div className="dashboard">Loading...</div>;

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-welcome">{user?.name ? `Welcome, Manager ${user.name}! 💖` : "Welcome, Manager! 💖"}</h1>
        <div className="dashboard-top-row">
          <div
            className="dashboard-card transaction-card"
            onClick={() => navigate("/users")}
          >
            <div className="card-icon">👤</div>
            <h2>User Management</h2>
            <p>Quick access to manage users</p>
          </div>

          <div className="dashboard-card">
            <h2>Recent Events</h2>
            <div className="activity-list">
              {events.length > 0 ? (
                events.map((e) => (
                  <div key={e.id} className="activity-item">
                    <span className="activity-type">{e.name}</span>
                    <span className="activity-date">
                      {(() => {
                        const start = new Date(e.startTime);
                        const end = new Date(e.endTime);
                        const sameDay =
                          start.getFullYear() === end.getFullYear() &&
                          start.getMonth() === end.getMonth() &&
                          start.getDate() === end.getDate();
                        return sameDay
                          ? start.toLocaleDateString()
                          : `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
                      })()}
                    </span>
                    <span className="activity-ref">Location: {e.location}</span>
                    <span className="activity-ref"> Capacity: {e.capacity}</span>
                  </div>
                ))
              ) : (
                <div className="activity-empty">No events yet</div>
              )}
            </div>
            <button
              className="view-all-btn"
              onClick={() => navigate("/events")}
            >
              View All Events
            </button>
          </div>

          <div className="dashboard-card">
            <h2>Recent Promotions</h2>
            <div className="activity-list">
              {promotions.length > 0 ? (
                promotions.map((p) => (
                  <div key={p.id} className="activity-item">
                    <span className="activity-type">{p.name}</span>
                    <span className="activity-date">
                      {(() => {
                        const start = new Date(p.startTime);
                        const end = new Date(p.endTime);
                        const sameDay =
                          start.getFullYear() === end.getFullYear() &&
                          start.getMonth() === end.getMonth() &&
                          start.getDate() === end.getDate();
                        return sameDay
                          ? start.toLocaleDateString()
                          : `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
                      })()}
                    </span>
                    <span className="activity-ref">{p.type}</span>
                    <span className="activity-ref">
                      Minimum Spend: ${p.minSpending}
                    </span>
                  </div>
                ))
              ) : (
                <div className="activity-empty">No promotions yet</div>
              )}
            </div>
            <button
              className="view-all-btn"
              onClick={() => navigate("/promotions")}
            >
              View All Promotions
            </button>
          </div>
        </div>
    </div>
  );
}