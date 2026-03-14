import React from 'react';

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const authService = {

  generateToken: async (utorid, password) => {

    const res = await fetch(`${VITE_BACKEND_URL}/auth/tokens`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ utorid, password }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Login failed");
    }

    return await res.json(); // { token, expiresAt }
  },

  googleLogin: async (email) => {
    const res = await fetch(`${VITE_BACKEND_URL}/auth/google-login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Login failed");
    }

    return await res.json(); // { token, expiresAt }
  },

  resetPassword: async (utorid, password, resetToken) => {

    const res = await fetch(`${VITE_BACKEND_URL}/auth/resets/${resetToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ utorid, password }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Reset password failed");
    }

    return await res.json(); // { message }

  },

  // sends email for reset
  getResetToken: async (utorid) => {
    const res = await fetch(`${VITE_BACKEND_URL}/auth/resets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ utorid }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to generate password reset token");
    }

    return await res.json(); // { resetToken, expiresAt }
  },

  resetPassword: async (utorid, password, resetToken) => {

    const res = await fetch(`${VITE_BACKEND_URL}/auth/resets/${resetToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ utorid, password }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Reset password failed");
    }

    return await res.json(); // { message }

  },

  // sends email for reset
  getResetToken: async (utorid) => {
    const res = await fetch(`${VITE_BACKEND_URL}/auth/resets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ utorid }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to generate password reset token");
    }

    return await res.json(); // { resetToken, expiresAt }
  },

};