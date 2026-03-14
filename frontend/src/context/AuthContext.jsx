import React, { createContext, useContext, useEffect, useState} from 'react';
import { authService } from "../api/authService.js";
import { userService } from "../api/userService.js";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const FRONTEND_URL = import.meta.env.FRONTEND_URL || "http://localhost:5173";
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentMode, setCurrentMode] = useState("regular");

  const getAvailableModes = (user) => {
    if(!user) return [];
    const modes = ["regular"];

    if(["cashier", "manager", "superuser"].includes(user.role)) {
      modes.push("cashier");
    }

    if(["manager", "superuser"].includes(user.role)) {
      modes.push("manager")
    }

    if(user.role === "superuser") {
      modes.push("superuser");
    }

    if (user.isOrganizer) {
      modes.push("organizer");
    }

    return modes;
  }


  // load user info on refresh
  useEffect(() => {

    // get token from local storage
    const token = localStorage.getItem("token");
    const mode = localStorage.getItem("currentMode") || "regular"; // default regular

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    setToken(token);

    // get user
    const loadUser = async () => {
      try {
        const user = await userService.getCurrUser(token);
        setUser(user);
        console.log("Loading user...", user);

        const availableModes = getAvailableModes(user);

        if (mode && availableModes.includes(mode)) {
          setCurrentMode(mode);
        } else {
          setCurrentMode("regular");
          localStorage.setItem("currentMode", "regular");
        }                            
      }
      catch (err) {
        // logout on error
        localStorage.removeItem("token");
        localStorage.removeItem("currentMode");
        setUser(null);
        setToken(null);
        console.log("Logged out due to error");
      }
      finally {
        setLoading(false);
      }
    };
    loadUser();

  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentMode");
    setUser(null);
    setToken(null);
    setCurrentMode(null);
    console.log("Logged out");
  };

  const updateMode = (mode) => {
    setCurrentMode(mode);
    localStorage.setItem("currentMode", mode);
  }

  const login = async (utorid, password) => {
    try {
      const res = await authService.generateToken(utorid, password);

      // set token in local storage
      localStorage.setItem("token", res.token);
      setToken(res.token);

      // get user 
      const user = await userService.getCurrUser(res.token);
      setUser(user);

      setCurrentMode("regular");
      localStorage.setItem("currentMode", "regular");
      console.log("Logged in")

      return null;
    }
    catch (err) {
      console.log("Failed to login");
      return err.message || "Server error";
    }
  };

  const loginWithGoogle = async () => {

    const redirectTo = `${FRONTEND_URL}/auth/tokens`;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectTo,
      },
    });

    if (error) console.error(error);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        loading, 
        supabase,
        login, 
        logout, 
        currentMode, 
        setCurrentMode: updateMode, 
        getAvailableModes,
        loginWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
