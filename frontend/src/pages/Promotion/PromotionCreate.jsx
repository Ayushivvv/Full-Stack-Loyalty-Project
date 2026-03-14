import { useState } from "react";
import dayjs from "dayjs";
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
} from "@mui/material";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

import SuccessModal from "../../components/Promotion/SuccessCard";
import { createPromotion } from "../../api/promotions";
import sanitize from "../../../utils/sanitize";

export default function PromotionCreate() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "automatic",
    startTime: null,
    endTime: null,
    minSpending: 0,
    rate: 0,
    points: 0,
  });

  const [successOpen, setSuccessOpen] = useState(false);

  function updateField(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const payload = {
        name: sanitize(form.name),
        description: sanitize(form.description),
        type: form.type,
        minSpending: Number(form.minSpending),
        rate: Number(form.rate),
        points: Number(form.points),
        startTime: form.startTime?.toISOString(),
        endTime: form.endTime?.toISOString(),
      };
      await createPromotion(payload);
      setSuccessOpen(true);
    } catch (err) {
      alert("Error: " + err.message);
    }
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
        <Paper sx={{ p: 4, width: "100%", maxWidth: 600, borderRadius: 3 }}>
          <Typography variant="h5" fontWeight={600} mb={3}>
            Create Promotion
          </Typography>

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <TextField
              label="Promotion Name"
              name="name"
              fullWidth
              required
              value={form.name}
              onChange={updateField}
              sx={{ mb: 3 }}
            />

            {/* Description */}
            <TextField
              label="Description"
              name="description"
              fullWidth
              required
              value={form.description}
              onChange={updateField}
              sx={{ mb: 3 }}
            />

            {/* Points */}
            <TextField
              label="Points"
              type="number"
              name="points"
              fullWidth
              value={form.points}
              onChange={updateField}
              sx={{ mb: 3 }}
            />

            {/* Min Spending */}
            <TextField
              label="Minimum Spending ($)"
              type="number"
              name="minSpending"
              fullWidth
              value={form.minSpending}
              onChange={updateField}
              sx={{ mb: 3 }}
            />

            {/* Rate */}
            <TextField
              label="Rate (%)"
              type="number"
              name="rate"
              fullWidth
              value={form.rate}
              onChange={updateField}
              sx={{ mb: 3 }}
            />

            {/* Type */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Type</InputLabel>
              <Select
                name="type"
                value={form.type}
                label="Type"
                onChange={updateField}
              >
                <MenuItem value="automatic">Automatic</MenuItem>
                <MenuItem value="onetime">One-Time</MenuItem>
              </Select>
            </FormControl>

            {/* Start Time Picker */}
            <DateTimePicker
              label="Start Time"
              value={form.startTime}
              onChange={(newValue) =>
                setForm({ ...form, startTime: newValue })
              }
              sx={{ mb: 3, width: "100%" }}
            />

            {/* End Time Picker */}
            <DateTimePicker
              label="End Time"
              value={form.endTime}
              onChange={(newValue) =>
                setForm({ ...form, endTime: newValue })
              }
              sx={{ mb: 3, width: "100%" }}
            />

            {/* Submit */}
            <Button variant="contained" fullWidth size="large" type="submit" className="pink-btn">
              Create Promotion
            </Button>
          </form>
        </Paper>

        <SuccessModal
          open={successOpen}
          message="Promotion created successfully!"
          onClose={() => {
            setSuccessOpen(false);
            window.location.href = "/manager/promotions";
          }}
        />
      </Box>
    </LocalizationProvider>
  );
}
