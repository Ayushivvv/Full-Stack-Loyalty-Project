import React, {useState, useRef, useEffect} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import "./header.scss";
import defaultAvatar from "../../assets/default-profile.png";
import Sidebar from "../sidebar/sidebar";
import { useAuth} from "../../context/AuthContext";

export default function Header({}) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const { user, currentMode, setCurrentMode, getAvailableModes, logout } = useAuth();
  const isLoginPage = location.pathname === "/";
  const availableModes = getAvailableModes(user);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const modeRef = useRef(null);
  const avatarRef = useRef(null);

  const handleLogout = () => {
    setDropdownOpen(null);
    logout();
    navigate("/"); // go back to login page
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        (modeRef.current && !modeRef.current.contains(e.target)) &&
        (avatarRef.current && !avatarRef.current.contains(e.target))
      ) {
        setDropdownOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (type) => {
    setDropdownOpen((prev) => (prev === type ? null : type));
  };

  return (
    <>
      <header className="header">
        <div className="header-left">
          {user && !isLoginPage && (
            <button className="menu-button" onClick={() => setSidebarOpen(!sidebarOpen)} >
              <MenuIcon className="menu-icon" />
            </button>
          )}

          <Link to="/" className="header__logo">
            Loyalty Program
          </Link>
        </div>

        {!isLoginPage && user && (
          <div className="header-right" ref={dropdownRef}>
            <div className="role-dropdown" ref={modeRef}>
              <button
                className="role-dropdown-trigger"
                onClick={() => toggleDropdown("mode")}
              >
                {currentMode ? currentMode.toUpperCase() : "SELECT MODE"}
                <ArrowDropDownIcon className="icon" />
              </button>

              {dropdownOpen === "mode" && (
                <div className="role-dropdown-menu">
                  {availableModes.map((m) => (
                    <div
                      key={m}
                      className={`role-dropdown-item ${
                        m === currentMode ? "active" : ""
                      }`}
                      onClick={() => {
                        setCurrentMode(m);
                        localStorage.setItem("currentMode", m); 
                        setDropdownOpen(null);
                        navigate("/home");
                      }}
                    >
                      {m.toUpperCase()}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="role-dropdown" ref={avatarRef}>
              <img
                src={user?.avatarUrl ? `${import.meta.env.VITE_BACKEND_URL}${user?.avatarUrl}` : defaultAvatar}
                className="header__avatar"
                alt="Profile"
                onClick={() => toggleDropdown("avatar")}
              />
              {dropdownOpen === "avatar" && (
                <div className="role-dropdown-menu">
                  <div
                    className="role-dropdown-item"
                    onClick={() => {
                      navigate("/profile");
                      setDropdownOpen(null);
                    }}
                  >
                    Account Settings
                  </div>
                  <div
                    className="role-dropdown-item"
                    onClick={handleLogout}
                  >
                    Log Out
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
      <Sidebar 
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)} 
      />
    </>
  );
}