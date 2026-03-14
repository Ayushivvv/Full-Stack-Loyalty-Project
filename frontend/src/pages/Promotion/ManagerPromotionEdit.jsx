import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";

import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";

import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

import { getPromotion, updatePromotion } from "../../api/promotions";
import SuccessModal from "../../components/Promotion/SuccessCard";
import sanitize from "../../../utils/sanitize";

export default function ManagerPromotionEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [promotion, setPromotion] = useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    type: "",
    startTime: null,
    endTime: null,
    minSpending: "",
    rate: "",
    points: "",
  });

  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const sanitizeFormInputs = (rawForm) => ({
    name: sanitize(rawForm.name),
    description: sanitize(rawForm.description),
    type: sanitize(rawForm.type),
    startTime: rawForm.startTime,
    endTime: rawForm.endTime,
    minSpending: sanitize(rawForm.minSpending),
    rate: sanitize(rawForm.rate),
    points: sanitize(rawForm.points),
  });

  // Load promotion on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getPromotion(id);
        setPromotion(data);

        setForm({
          name: data.name || "",
          description: data.description || "",
          type: data.type || "",
          startTime: data.startTime ? dayjs(data.startTime) : null,
          endTime: data.endTime ? dayjs(data.endTime) : null,
          minSpending: data.minSpending ?? "",
          rate: data.rate ?? "",
          points: data.points ?? "",
        });

        setLoading(false);
      } catch (err) {
        setError("Failed to load promotion.");
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  function onChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Submit edits
  async function handleSave() {
    setError("");

    let sanitizedForm;
    try {
      sanitizedForm = sanitizeFormInputs(form);
    } catch (err) {
      setError(err.message || "Invalid input.");
      return;
    }

    const payload = {};

    // Compare form → original, only send changed fields
    Object.keys(sanitizedForm).forEach((key) => {
      const original = promotion[key];
      const current = sanitizedForm[key];

      if (key === "startTime" || key === "endTime") {
        const originalISO = original ? original : "";
        const currentISO = current ? current.toISOString() : "";

        if (originalISO !== currentISO) {
          payload[key] = current ? current.toISOString() : null;
        }
      } else if (String(original ?? "") !== String(current)) {
        payload[key] = current === "" ? null : current;
      }
    });

    try {
      await updatePromotion(id, payload);
      setShowSuccess(true);
    } catch (err) {
      setError(err.error || "Update failed.");
    }
  }

  if (loading) return <p>Loading...</p>;
  if (!promotion) return <p>Promotion not found.</p>;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
        <Paper sx={{ p: 4, width: "100%", maxWidth: 600, borderRadius: 3 }}>
          <Typography variant="h5" fontWeight={600} mb={3}>
            Edit Promotion
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Name */}
          <TextField
            label="Name"
            name="name"
            fullWidth
            value={form.name}
            onChange={onChange}
            sx={{ mb: 3 }}
          />

          {/* Description */}
          <TextField
            label="Description"
            name="description"
            fullWidth
            multiline
            minRows={2}
            value={form.description}
            onChange={onChange}
            sx={{ mb: 3 }}
          />

          {/* Type */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Type</InputLabel>
            <Select
              name="type"
              value={form.type}
              label="Type"
              onChange={onChange}
            >
              <MenuItem value="automatic">Automatic</MenuItem>
              <MenuItem value="onetime">One-Time</MenuItem>
            </Select>
          </FormControl>

          {/* Start Time */}
          <DateTimePicker
            label="Start Time"
            value={form.startTime}
            onChange={(v) => setForm({ ...form, startTime: v })}
            sx={{ mb: 3, width: "100%" }}
          />

          {/* End Time */}
          <DateTimePicker
            label="End Time"
            value={form.endTime}
            onChange={(v) => setForm({ ...form, endTime: v })}
            sx={{ mb: 3, width: "100%" }}
          />

          {/* Min Spending */}
          <TextField
            label="Minimum Spending ($)"
            type="number"
            name="minSpending"
            fullWidth
            value={form.minSpending}
            onChange={onChange}
            sx={{ mb: 3 }}
          />

          {/* Rate */}
          <TextField
            label="Rate (%)"
            type="number"
            name="rate"
            fullWidth
            value={form.rate}
            onChange={onChange}
            sx={{ mb: 3 }}
          />

          {/* Points */}
          <TextField
            label="Points"
            type="number"
            name="points"
            fullWidth
            value={form.points}
            onChange={onChange}
            sx={{ mb: 3 }}
          />

          {/* Save Button */}
          <Button variant="contained" fullWidth size="large" onClick={handleSave} className="pink-btn">
            Save Changes
          </Button>

          {/* Cancel Button */}
          <Button
            fullWidth
            sx={{ mt: 1 }}
            onClick={() => navigate("/manager/promotions")}
            className="secondary-pink-btn"
          >
            Cancel
          </Button>

          <SuccessModal
            open={showSuccess}
            message="Promotion updated successfully!"
            onClose={() => navigate("/manager/promotions")}
          />
        </Paper>
      </Box>
    </LocalizationProvider>
  );
}
