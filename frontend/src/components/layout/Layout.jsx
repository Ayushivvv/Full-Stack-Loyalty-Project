import React, { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "../header/header.jsx";
import Sidebar from "../sidebar/sidebar.jsx";
import { useAuth } from "../../context/AuthContext.jsx";

export default function Layout() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Auto-close sidebar on route change
  useEffect(() => {
    if (sidebarOpen) setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Header with hamburger */}
      <Header
        isLoggedIn={!!user}
        onSidebarToggle={() => setSidebarOpen((o) => !o)}
      />

      {/* Sidebar */}
      {user && (
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <main style={{ paddingTop: "64px", paddingBottom: "64px" }}>
        <Outlet />
      </main>
    </>
  );
}
