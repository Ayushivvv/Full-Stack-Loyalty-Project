import React from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import "./OrganizerDashboard.scss";
import { CalendarHeart} from "lucide-react";

const OrganizerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="organizer-dashboard">
      <header className="od-header">
        <h1>Welcome, {user?.name ? `Organizer ${user.name}` : "Organizer"}! 💖</h1>
        <p>Here’s a quick glance at your events and tools.</p>
      </header>

      <div className="od-quick-links">
        <Link to="/organizer/events" className="od-card">
          <div className="icon-row">
            <CalendarHeart size={28} />
            <h2>Manage My Events</h2>
          </div>
          <p>Create, edit, and monitor your events.</p>
        </Link>
      </div>
    </div>
  );
};

export default OrganizerDashboard;