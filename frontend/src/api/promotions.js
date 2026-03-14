const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export async function getPromotions(filters = {}) {
  const token = localStorage.getItem("token");

  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value !== undefined && value !== null) {
      params.append(key, value);
    }
  });

  const queryString = params.toString();
  const url = queryString
    ? `${API_BASE}/promotions?${queryString}`
    : `${API_BASE}/promotions`;

  console.log("Fetching:", url);

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error("Server error: " + error);
  }

  return res.json();
}

export async function getPromotion(id) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/promotions/${id}`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error("Server error: " + error);
  }

  return res.json();
}

export async function updatePromotion(id, data) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/promotions/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error("Server error: " + error);
  }

  return res.json();
}

export async function deletePromotion(id) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/promotions/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error("Server error: " + error);
  }

  return true;
}

export async function createPromotion(data) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/promotions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.error || "Failed to create promotion");
  }

  return result;
}
