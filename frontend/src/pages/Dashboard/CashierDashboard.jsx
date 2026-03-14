import React from "react";
import { useNavigate } from "react-router-dom"; 
import ReceiptIcon from "@mui/icons-material/Receipt";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import "../../assets/styles/global.scss";
import "./CashierDashboard.scss";
import { FaCashRegister, FaGift } from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";

export default function CashierDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-welcome">{user?.name ? `Welcome, Cashier ${user.name}! 💖` : "Welcome, Cashier! 💖"}</h1>

      <div className="dashboard-top-row">
        {/* Create Transaction */}
        <div
          className="transaction-card"
          onClick={() => navigate("/cashier/purchase")}
        >
          <div className="card-icon">
            <FaCashRegister />
          </div>
          <h2>Create Purchase</h2>
          <p>Log a purchase and award points ✨</p>
        </div>

        {/* Redeem Points */}
        <div
          className="transaction-card"
          onClick={() => navigate("/cashier/redemption")}
        >
          <div className="card-icon">
            <FaGift />
          </div>
          <h2>Process Redemption</h2>
          <p>Apply customer rewards with a smile 🎁</p>
        </div>
      </div>
    </div>
  );
}