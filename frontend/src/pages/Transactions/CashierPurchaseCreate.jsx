import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
} from "@mui/material";
import SuccessModal from "../../components/Promotion/SuccessCard";
import { getPromotions } from "../../api/promotions";
import { createPurchase } from "../../api/transaction";
import sanitize from "../../../utils/sanitize";

export default function CashierPurchaseCreate() {
  const [form, setForm] = useState({
    utorid: "",
    spent: "",
    remark: "",
    promotionIds: []
  });

  const [promotions, setPromotions] = useState([]);
  const [successOpen, setSuccessOpen] = useState(false);

  useEffect(() => {
    async function loadPromotions() {
      try {
        const data = await getPromotions();
        setPromotions(data.results || data);
      } catch (err) {
        console.error(err);
      }
    }
    loadPromotions();
  }, []);

  const handleSelectPromotions = (event) => {
    setForm({
      ...form,
      promotionIds: event.target.value
    });
  };

async function handleSubmit(e) {
  e.preventDefault();

  const payload = {
    utorid: sanitize(form.utorid),
    spent: form.spent,
    promotionIds: form.promotionIds,
    remark: sanitize(form.remark)
  };

  try {
    await createPurchase(payload);
    setSuccessOpen(true);

    setForm({
      utorid: "",
      spent: "",
      remark: "",
      promotionIds: []
    });
  } catch (err) {
    alert("Error: " + err.message);
  }
}


  return (
    <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
      <Paper sx={{ p: 4, width: "100%", maxWidth: 600, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={600} mb={3}>
          Create Purchase
        </Typography>

        <form onSubmit={handleSubmit}>
          {/* UTORID */}
          <TextField
            label="Customer UTORid"
            fullWidth
            required
            value={form.utorid}
            onChange={(e) => setForm({ ...form, utorid: e.target.value })}
            sx={{ mb: 3 }}
          />

          {/* Amount */}
          <TextField
            label="Amount Spent ($)"
            type="number"
            required
            fullWidth
            value={form.spent}
            onChange={(e) => setForm({ ...form, spent: e.target.value })}
            inputProps={{ min: 0, step: 0.01 }}
            sx={{ mb: 3 }}
          />

          {/* Promotions Multi Select */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Apply Promotions</InputLabel>
            <Select
              multiple
              label="Apply Promotions"
              value={form.promotionIds}
              onChange={handleSelectPromotions}
              renderValue={(selected) => {
                if (selected.length === 0) return "None";
                return `${selected.length} selected`;
              }}
            >
              {promotions.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  <Checkbox checked={form.promotionIds.includes(p.id)} />
                  <ListItemText primary={`#${p.id} – ${p.name}`} />
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Remark */}
          <TextField
            label="Remark (Optional)"
            fullWidth
            value={form.remark}
            onChange={(e) => setForm({ ...form, remark: e.target.value })}
            sx={{ mb: 3 }}
          />

          {/* Submit Button */}
          <Button variant="contained" fullWidth type="submit" size="large" className="pink-btn">
            Submit Purchase
          </Button>
        </form>
      </Paper>

      <SuccessModal
        open={successOpen}
        message="Purchase created successfully!"
        onClose={() => setSuccessOpen(false)}
      />
    </Box>
  );
}
