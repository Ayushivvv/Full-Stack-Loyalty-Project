import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createAdjustment, getTransactionById  } from "../../api/transaction";
import sanitize from "../../../utils/sanitize";

export default function ManagerAdjustmentPage() {
  const { id } = useParams(); // related transaction id
  const navigate = useNavigate();

  const [amount, setAmount] = useState("");
  const [utorid, setUtorid] = useState("");
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadTransaction() {
      try {
        const tx = await getTransactionById(id);
        setUtorid(tx.utorid);
      } catch (err) {
        setError("Failed to load parent transaction");
      }
    }

    loadTransaction();
  }, [id]);
    
  async function handleSubmit() {
    setError("");
    setSuccess("");

    if (!utorid || !amount) {
      setError("Utorid and amount are required");
      return;
    }

    try {
      setLoading(true);

      await createAdjustment({
        utorid,  
        relatedId: Number(id),
        amount: Number(amount),
        remark: sanitize(remark)
      });

      setSuccess("Adjustment created successfully");

      setTimeout(() => {
        navigate(`/manager/transactions/${id}`);
      }, 1200);

    } catch (err) {
      setError(err.message || "Failed to create adjustment");
    } finally {
      setLoading(false);
    }
  }

  
return (
  <div
    style={{maxWidth: "420px",margin: "80px auto",padding: "30px",background: "#f9f9f9",borderRadius: "10px",boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
    }}
  >
    <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
      Create Adjustment
    </h2>

    <p style={{ textAlign: "center", marginBottom: "30px" }}>
      For Transaction #{id}
    </p>

    <label>UtorID</label>
    <input
      value={utorid}
      disabled
      style={{width: "93%",padding: "10px",marginBottom: "16px"
      }}
    />

    <label>Adjustment Amount (± points)</label>
    <input
      type="number"
      value={amount}
      onChange={(e) => setAmount(e.target.value)}
      style={{ width: "93%",padding: "10px",marginBottom: "16px"
      }}
    />

    <label>Remark</label>
    <textarea
      value={remark}
      onChange={(e) => setRemark(e.target.value)}
      rows={3}
      style={{width: "93%",padding: "12px",marginBottom: "20px"
      }}
    />

    {/* SUBMIT */}
    <button
      onClick={handleSubmit}
      disabled={loading}
      style={{
        width: "100%", padding: "12px", background: "#4CAF50",color: "white",border: "none", borderRadius: "6px",fontWeight: "bold",cursor: "pointer"
      }}
    >
      {loading ? "Creating..." : "Create Adjustment"}
    </button>

    {/* MESSAGES */}
    {success && (
      <p style={{ color: "green", textAlign: "center", marginTop: "15px" }}>
        {success}
      </p>
    )}
    {error && (
      <p style={{ color: "red", textAlign: "center", marginTop: "15px" }}>
        {error}
      </p>
    )}
  </div>)}