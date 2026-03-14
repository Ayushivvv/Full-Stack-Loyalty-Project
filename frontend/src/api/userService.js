
const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const userService = {

  getCurrUser: async (token) => {
    const res = await fetch(`${VITE_BACKEND_URL}/users/me`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Couldn't get current user");
    }

    return await res.json(); // { id, utorid, name, email, birthday, role, points, createdAt, lastLogin, verified, avatarUrl, promotions }
  },

  updateCurrUser: async (formData, token) => {
    const fd = new FormData();

    if (formData.name) fd.append("name", formData.name);
    if (formData.birthday) fd.append("email", formData.email);
    if (formData.birthday) fd.append("birthday", formData.birthday);
    if (formData.avatarUrl) fd.append("avatar", formData.avatarUrl);
    for (const [key, value] of fd.entries()) {
      console.log(key, value);
    }
    console.log("token used: ", token);

    const res = await fetch(`${VITE_BACKEND_URL}/users/me`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: fd,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Couldn't update user data");
    }

    return await res.json(); // { id, utorid, name, email, birthday, role, points, createdAt, lastLogin, verified, avatarUrl }
  },

  registerUser: async (utorid, name, email) => {

    const token = localStorage.getItem("token");

    const res = await fetch(`${VITE_BACKEND_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ utorid, email, name }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw err; // throw whole object to get validation details
    }

    return await res.json(); // { id , utorid, name, email, verified, expiresAt, resetToken }
  },

  getUsers: async (page, rowsPerPage, searchTerm = "", role = "") => {

    const token = localStorage.getItem("token");

    const params = new URLSearchParams({
      page: String(page + 1),
      limit: String(rowsPerPage)
    });
    if (searchTerm) params.set("name", searchTerm);
    if (role) params.set("role", role);

    const res = await fetch(`${VITE_BACKEND_URL}/users?${params.toString()}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || err.message || "Failed to load users");
    }
    return await res.json();
  },

  updateUserById: async (id, mapping) => {
    const token = localStorage.getItem("token");
    const body = Object.fromEntries(mapping);

    const res = await fetch(`${VITE_BACKEND_URL}/users/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Update failed");
    }

  },

  getUserQrCode: async (utorid) => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${VITE_BACKEND_URL}/users/${utorid}/qrcode`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Couldn't get qr token");
    }

    return await res.json(); // { qr }
  }

}
