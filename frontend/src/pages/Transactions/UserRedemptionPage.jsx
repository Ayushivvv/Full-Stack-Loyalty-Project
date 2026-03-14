import { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Divider
} from "@mui/material";
import SuccessModal from "../../components/Promotion/SuccessCard";
import { RegularRedemptionRequest } from "../../api/transaction";
import { QRCodeCanvas } from "qrcode.react";

import sanitize from "../../../utils/sanitize";

export default function UserRedemptionPage() {
  const [amount, setAmount] = useState("");
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [error, setError] = useState("");

  const [redemptionId, setRedemptionId] = useState(null); 

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!amount || Number(amount) <= 0) {
      setError("Please enter a valid redemption amount!");
      return;
    }

    try {
      setLoading(true);

      const data = {
        type: "redemption",
        amount: parseInt(amount),
        remark: sanitize(remark),
      };

      // ✅ CAPTURE CREATED TRANSACTION
      const createdTransaction = await RegularRedemptionRequest(data);

      // ✅ STORE ID FOR QR CODE
      setRedemptionId(createdTransaction.id);

      setSuccessOpen(true);
      setAmount("");
      setRemark("");

    } catch (err) {
      setError(err.message || "Failed to submit redemption request.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
      <Paper sx={{ p: 4, width: "100%", maxWidth: 600, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={600} mb={3}>
          Redeem Points
        </Typography>

        <form onSubmit={handleSubmit}>
          {/* Amount */}
          <TextField
            label="Amount to Redeem"
            type="number"
            fullWidth
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter points to redeem"
            sx={{ mb: 3 }}
          />

          {/* Remark */}
          <TextField
            label="Remark (Optional)"
            fullWidth
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="Gift card, item, etc."
            sx={{ mb: 3 }}
          />

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            variant="contained"
            size="large"
            fullWidth
            type="submit"
            disabled={loading}
            className="pink-btn"
          >
            {loading ? "Submitting..." : "Submit Redemption"}
          </Button>
        </form>

        {/* ✅ QR CODE DISPLAY AFTER SUCCESS */}
        {redemptionId && (
          <>
            <Divider sx={{ my: 4 }} />

            <Typography variant="h6" align="center" mb={1}>
              Show This QR to the Cashier
            </Typography>

            <Typography
              variant="body2"
              align="center"
              color="text.secondary"
              mb={2}
            >
              Redemption Transaction ID: <b>{redemptionId}</b>
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "center" }}>
  <QRCodeCanvas value={redemptionId.toString()} size={180} />
</Box>

          </>
        )}
      </Paper>

      <SuccessModal
        open={successOpen}
        message="Redemption request submitted!"
        onClose={() => setSuccessOpen(false)}
      />
    </Box>
  );
}
