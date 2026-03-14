import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import SuccessModal from "../../components/Promotion/SuccessCard";
import { processRedemption } from "../../api/transaction";

export default function CashierRedemptionPage() {
  const [transactionId, setTransactionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [error, setError] = useState("");

  async function handleProcess(e) {
    e.preventDefault();
    setError("");

    if (!transactionId) {
      setError("Transaction ID is required.");
      return;
    }

    try {
      setLoading(true);

      await processRedemption(transactionId);

      setSuccessOpen(true);
      setTransactionId("");

    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to process redemption."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
      <Paper sx={{ p: 4, width: "100%", maxWidth: 600, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={600} mb={3}>
          Process Redemption
        </Typography>

        <form onSubmit={handleProcess}>
          {/* Transaction ID */}
          <TextField
            label="Transaction ID"
            type="number"
            fullWidth
            required
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            placeholder="Enter redemption transaction ID"
            sx={{ mb: 3 }}
          />

          {/* Error message */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Submit button */}
          <Button
            variant="contained"
            fullWidth
            type="submit"
            size="large"
            disabled={loading}
            className="pink-btn"
          >
            {loading ? "Processing..." : "Process Redemption"}
          </Button>
        </form>
      </Paper>

      <SuccessModal
        open={successOpen}
        message="Redemption processed successfully!"
        onClose={() => setSuccessOpen(false)}
      />
    </Box>
  );
}
