import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  TextField,
  Button,
  Typography,
  Box,
} from "@mui/material";
import SuccessModal from "../../components/Promotion/SuccessCard";
import { createTransfer } from "../../api/transaction";
import sanitize from "../../../utils/sanitize";

export default function UserTransferPage() {
  const [form, setForm] = useState({
    recipientId: "",
    amount: "",
    remark: "",
  });

  const [successOpen, setSuccessOpen] = useState(false);
  const [error, setError] = useState("");

  function updateField(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.recipientId || isNaN(form.recipientId)) {
      setError("Recipient ID must be a valid number.");
      return;
    }
    if (!form.amount || form.amount <= 0) {
      setError("Amount must be a positive number.");
      return;
    }

    try {
      const data = {
        type: "transfer",
        amount: Number(form.amount),
        remark: sanitize(form.remark),
      };
      await createTransfer(sanitize(form.recipientId), data);

      setSuccessOpen(true);

      setForm({
        recipientId: "",
        amount: "",
        remark: "",
      });
    } catch (err) {
      setError(err.message || "Transfer failed.");
    }
  }

  return (
    <Box
  sx={{
    display: "flex",
    justifyContent: "center",
    mt: { xs: 2, sm: 6 },
    mb: 4,
    px: { xs: 1.5, sm: 0 },   
  }}
>

      <Card
  sx={{
    width: { xs: "100%", sm: 450 },  
    maxWidth: 450,
    p: 2,
  }}
>

        <CardHeader
          title="Transfer Points"
          sx={{ textAlign: "center", pb: 0 }}
        />

        <CardContent>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Recipient User ID"
              name="recipientId"
              value={form.recipientId}
              onChange={updateField}
              fullWidth
              required
              margin="normal"
            />

            <TextField
              label="Amount to Transfer"
              name="amount"
              type="number"
              value={form.amount}
              onChange={updateField}
              fullWidth
              required
              margin="normal"
              inputProps={{ min: 1 }}
            />

            <TextField
              label="Remark (Optional)"
              name="remark"
              value={form.remark}
              onChange={updateField}
              fullWidth
              margin="normal"
            />

            {error && (
              <Typography
                color="error"
                sx={{ mt: 1, fontSize: "0.9rem" }}
              >
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 3 }}
              className="pink-btn"
            >
              Send Points
            </Button>
          </form>
        </CardContent>
      </Card>

      <SuccessModal
        open={successOpen}
        message="Transfer completed successfully!"
        onClose={() => setSuccessOpen(false)}
      />
    </Box>
  );
}
