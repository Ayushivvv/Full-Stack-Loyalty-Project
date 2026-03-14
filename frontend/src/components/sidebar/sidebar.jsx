import React, { useEffect } from "react";
import "./sidebar.scss";
import { useAuth } from "../../context/AuthContext";
import { List, ListItemButton, ListItemText, Divider } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

export default function Sidebar({ open, onClose }) {
  const { currentMode, logout } = useAuth();
  const sections = sidebarConfig[currentMode] || [];

  const location = useLocation();
  const navigate = useNavigate();

  const handleItemClick = (item) => {
    if (item === "Log Out") {
      logout();
      onClose();
      navigate("/");
      return;
    }

    if (item === "Account Settings") {
      navigate("/profile");
      onClose();
      return;
    }

    if (item === "View and Manage Users" || item === "Register Users") {
      navigate("/users");
      onClose();
      return;
    }

    if (item === "View Transactions") {
      navigate("/manager/transactions");
      onClose();
      return;
    }

    if (item === "View and Manage Promotions") {
      navigate("/manager/promotions");
      onClose();
      return;
    }

    if (item === "Create a Promotion") {
      navigate("/promotions/create");
      onClose();
      return;
    }

    if (item === "Create Transaction") {
      navigate("/cashier/purchase");
      onClose();
      return;
    }

    if (item === "Process Redemption") {
      navigate("/cashier/redemption");
      onClose();
      return;
    }

    if (item === "Browse Promotions") {
      navigate("/promotions");
      onClose();
      return;
    }

    if (item === "My Transactions") {
      navigate("/me/transactions");
      onClose();
      return;
    }

    if (item === "My Events") {
      navigate("/me/events");
      onClose();
      return;
    }

    if (item === "Browse Events" || item === "View and Manage Events") {
      navigate("/events");
      onClose();
      return;
    }

    if (item === "Create Events") {
      navigate("/events/create");
      onClose();
      return;
    }


    if (item === "Browse Events") {
      navigate("/me/transactions");
      onClose();
      return;
    }


    if (item === "Redeem Points") {
      navigate("/me/redemption");
      onClose();
      return;
    }

    if (item === "Transfer Points") {
      navigate("/me/transfer");
      onClose();
      return;
    }

    if (item === "Dashboard") {
      navigate("/home");
      onClose();
      return;
    }

    console.log("Clicked", item);
  };

  useEffect(() => {
    if (open) onClose();
  }, [location.pathname]);

  return (
  <>
    <div
      className={`sidebar-backdrop ${open ? "show" : ""}`}
      onClick={onClose}
    />
    <div className={`sidebar-container ${open ? "open" : ""}`}>
      {sections.map((section) => (
        <div key={section.title || Math.random()}>
          {section.title && <h4 className="sidebar-subtitle">{section.title}</h4>}
          <List>
            {section.items.map((item) => (
              <ListItemButton
                key={item}
                onClick={() => handleItemClick(item)}
              >
                <ListItemText primary={item} />
              </ListItemButton>
            ))}
          </List>
          <Divider sx={{ my: 1.5 }} />
        </div>
      ))}
    </div>
  </>
);
}

const sidebarConfig = {
  regular: [
    {
      title: "My Account",
      items: ["Dashboard", "Transfer Points", "Redeem Points", "My Transactions"],
    },
    {
      title: "Events",
      items: ["Browse Events", "My Events"],
    },
    {
      title: "Promotions",
      items: ["Browse Promotions"],
    },
    {
      title: "",
      items: ["Account Settings", "Log Out"],
    }
  ],

  cashier: [
    {
      title: "My Account",
      items: ["Dashboard"],
    },
    {
      title: "Users",
      items: ["Register Users"],
    },
    {
      title: "Transaction Authorization",
      items: ["Create Transaction", "Process Redemption"],
    },
    {
      title: "",
      items: ["Account Settings", "Log Out"],
    }
  ],

  manager: [
    {
      title: "My Account",
      items: ["Dashboard"],
    },
    {
      title: "Users",
      items: ["View and Manage Users"],
    },
    {
      title: "Transactions",
      items: ["View Transactions"],
    },
    {
      title: "Promotions",
      items: ["View and Manage Promotions", "Create a Promotion"],
    },
    {
      title: "Events",
      items: ["View and Manage Events", "Create Events"],
    },
    {
      title: "",
      items: ["Account Settings", "Log Out"],
    }
  ],

  superuser: [
    {
      title: "My Account",
      items: ["Dashboard"],
    },
    {
      title: "Users",
      items: ["View and Manage Users"]
    },
    {
      title: "",
      items: ["Account Settings", "Log Out"],
    }
  ],

  organizer: [
    {
      title: "My Account",
      items: ["Dashboard"],
    },
    {
      title: "Events",
      items: ["My Events"]
    },
    {
      title: "",
      items: ["Account Settings", "Log Out"],
    }
  ]
};
