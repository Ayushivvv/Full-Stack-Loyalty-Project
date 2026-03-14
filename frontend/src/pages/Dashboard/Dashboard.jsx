import React from "react";
import { useAuth } from "../../context/AuthContext";
import RegularDashboard from "./RegularDashboard";
import CashierDashboard from "./CashierDashboard";
import ManagerDashboard from "./ManagerDashboard";
import OrganizerDashboard from "./OrganizerDashboard";

export default function Dashboard() {
  const { currentMode } = useAuth();
  console.log(currentMode);
  switch (currentMode) {
    case "cashier":
      return <CashierDashboard />;
    case "manager":
      return <ManagerDashboard />;
    case "superuser":
      return <ManagerDashboard />;
    case "organizer":
      return <OrganizerDashboard />;
    case "regular":
    default:
      return <RegularDashboard />;
  }
}