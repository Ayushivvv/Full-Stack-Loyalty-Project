import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getTransactionById,
  MarkTransactionSus,
} from "../../api/transaction";

import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Divider,
} from "@mui/material";

export default function TransactionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTransaction() {
    try {
      setLoading(true);
      const data = await getTransactionById(id);
      setTransaction(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function toggleSuspicious() {
    try {
      await MarkTransactionSus(transaction.id, !transaction.suspicious);
      loadTransaction();
    } catch (err) {
      alert("Failed to update suspicious");
    }
  }

  useEffect(() => {
    loadTransaction();
  }, [id]);

  if (loading) return <Box p={3}>Loading...</Box>;
  if (error)
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );

  return (
    <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
      <Paper sx={{ p: 4, width: "100%", maxWidth: 600, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={600} mb={2}>
          Transaction Detail
        </Typography>

        <Divider sx={{ mb: 2 }} />

        {/* Fields */}
        <Typography><b>ID:</b> {transaction.id}</Typography>
        <Typography><b>Utorid:</b> {transaction.utorid}</Typography>
        <Typography><b>Type:</b> {transaction.type}</Typography>
        <Typography><b>Amount:</b> {transaction.amount}</Typography>
        <Typography><b>Processed:</b> {transaction.processed ? "Yes" : "No"}</Typography>
        <Typography><b>Suspicious:</b> {transaction.suspicious ? "Yes" : "No"}</Typography>
        <Typography><b>Created By:</b> {transaction.createdBy}</Typography>
        <Typography>
          <b>Processed By:</b> {transaction.processedBy || "—"}
        </Typography>
        <Typography>
          <b>Remark:</b> {transaction.remark || "—"}
        </Typography>

        {/* Action Buttons */}
        {transaction.type === "purchase" && (
          <>
            <Button
              variant="outlined"
              className="secondary-pink-btn"
              fullWidth
              sx={{ mt: 3 }}
              onClick={toggleSuspicious}
            >
              {transaction.suspicious ? "Unflag" : "Mark as Suspicious"}
            </Button>

            <Button
              variant="contained"
              className="pink-btn"
              fullWidth
              sx={{ mt: 1 }}
              onClick={() =>
                navigate(`/manager/transactions/${transaction.id}/adjustment`)
              }
            >
              Create Adjustment
            </Button>
          </>
        )}

        <Button
          fullWidth
          sx={{ mt: 2 }}
          onClick={() => navigate("/manager/transactions")}
          className="secondary-pink-btn"
        >
          Back
        </Button>
      </Paper>
    </Box>
  );
}
