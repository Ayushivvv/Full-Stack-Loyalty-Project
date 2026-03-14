const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

function buildQueryString(params) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    qs.append(k, v);
  });
  return qs.toString() ? `?${qs.toString()}` : "";
}

export async function getMyTransactions() {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/users/me/transactions`, {
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

export async function getMyTransactionsFiltered(filters = {}) {
  const token = localStorage.getItem("token");

  const params = {
  type: filters.type || undefined,
  page: filters.page || 1,
  limit: filters.limit || 10
};

if (filters.amount && filters.operator) {
  params.amount = Number(filters.amount);
  params.operator = filters.operator;
}

  const qs = buildQueryString(params);

  const res = await fetch(`${API_BASE}/users/me/transactions${qs}`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function createTransfer(recipientId, data) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/users/${recipientId}/transactions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }

  return res.json();
}

export async function processRedemption(transactionId) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/transactions/${transactionId}/processed`,
     {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ processed: true }) 
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }

  return res.json();
}

export async function RegularRedemptionRequest(data){
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/users/me/transactions`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }

  return res.json();

}

export async function getAllTransactions(filters = {} ){
  const token = localStorage.getItem("token");
  const params = {
    name: filters.name,
    type: filters.type,
    suspicious: filters.suspicious,
    amount: filters.amount,
    operator: filters.operator,
    page: filters.page || 1,
    limit: filters.limit || 10
  };

  const qs = buildQueryString(params);
  const res = await fetch(`${API_BASE}/transactions${qs}`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
});
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  return res.json();
}

export async function MarkTransactionSus(transactionId, suspicious) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}/transactions/${transactionId}/suspicious`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({suspicious})
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  return res.json();

}

export async function getTransactionById(id) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/transactions/${id}`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    }
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }

  return res.json();
}

export async function createAdjustment(data) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      userId: data.userId,
      utorid: data.utorid,
      type: "adjustment",
      relatedId: data.relatedId,
      amount: data.amount,
      remark: data.remark
    })
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }

  return res.json();
}

export async function createPurchase(data) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}/transactions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({
      ...data,
      type: "purchase", // force purchase type here
      spent: Number(data.spent),
    })
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.error || result.message || "Failed to create purchase");
  }

  return result;
}
