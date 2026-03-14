import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEventById, updateEvent } from "../../api/eventsApi";

// GLOBAL COLORS + FONT  
import "../../assets/styles/global.scss";

import { 
    Card, 
    CardContent, 
    CardHeader, 
    TextField, 
    Button, 
    Typography, 
    Box,
    FormControlLabel,
    Checkbox,
    Grid,
    Divider
} from "@mui/material";

// Convert to yyyy-MM-ddTHH:mm 
function toInputFormat(date) {
    const pad = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

const ToastNotification = ({ message, type, onClose }) => {
    if (!message) return null;

    const background = type === "error" ? "#d63384" : "#f28ab2";

    return (
        <Box
            sx={{
                position: "fixed",
                bottom: 24,
                right: 24,
                px: 3,
                py: 2,
                bgcolor: background,
                color: "white",
                borderRadius: 2,
                boxShadow: 4,
                zIndex: 2000,
                animation: "fadeInUp 0.25s ease-out",
                fontWeight: 600
            }}
        >
            {message}
        </Box>
    );
};

function EventEditPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        location: "",
        startTime: "",
        endTime: "",
        capacity: "",
        points: "",
        published: false,
    });

    const [originalFormData, setOriginalFormData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const data = await getEventById(eventId);

                const startDate = new Date(data.startTime);
                const endDate = new Date(data.endTime);

                const prepared = {
                    ...data,
                    capacity: data.capacity === null ? "" : String(data.capacity),
                    points: data.pointsRemain ?? "0",
                    startTime: toInputFormat(startDate),
                    endTime: toInputFormat(endDate),
                };

                setFormData(prepared);
                setOriginalFormData(prepared);
            } catch (err) {
                setError(err.message || "Failed to load event data.");
            } finally {
                setLoading(false);
            }
        };

        if (eventId) fetchEvent();
    }, [eventId]);

    const areFormsEqual = (a, b) => {
        if (!b) return false;
        return Object.keys(a).every((k) => a[k] === b[k]);
    };

    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
        setError(null);
        setSuccess(false);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        const totalPoints = formData.points ? Number(formData.pointsRemain) : 0;
        const capacityValue = formData.capacity ? Number(formData.capacity) : null;

        const payload = {
            name: formData.name,
            description: formData.description,
            location: formData.location,
            startTime: new Date(formData.startTime).toISOString(),
            endTime: new Date(formData.endTime).toISOString(),
            capacity: capacityValue,
            points: totalPoints,
            published: formData.published,
        };

        if (originalFormData && areFormsEqual(formData, originalFormData)) {
            setSuccess(true);
            setSaving(false);
            setTimeout(() => navigate(`/events/${eventId}`), 1500);
            return;
        }

        const start = new Date(payload.startTime);
        const end = new Date(payload.endTime);

        if (!payload.name || !payload.description || !payload.location)
            return setError("Fill all required fields"), setSaving(false);

        if (start.getTime() >= end.getTime()) {
            setError("Start Time must be before End Time.");
            setSaving(false);
            return;
        }

        if (end.getTime() - start.getTime() <= 60000) {
            setError("Event must last longer than one minute.");
            setSaving(false);
            return;
        }

        try {
            await updateEvent(eventId, payload);
            setSuccess(true);
            setTimeout(() => navigate(`/events/${eventId}`), 1500);
        } catch (err) {
            setError(err.message || "Failed to save changes.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Typography sx={{ p: 4, textAlign: "center", color: "#d63384" }}>
                Loading event data for <b>{eventId}</b>…
            </Typography>
        );
    }

    return (
        <Card
            sx={{
                maxWidth: 900,
                mx: "auto",
                mt: 5,
                mb: 5,
                borderRadius: 4,
                boxShadow: 6,
                border: "1px solid rgba(214,51,132,0.25)"
            }}
        >
            <CardHeader
                title={
                    <Typography variant="h4" sx={{ color: "#d63384", fontWeight: 800 }}>
                        Edit Event: {formData.name}
                    </Typography>
                }
            />

            <CardContent>
                {/* Navigation Buttons */}
                <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
                    <Button
                        variant="contained"
                        onClick={() => navigate(`/events`)}
                        className="pink-btn"
                        sx={{ px: 3, py: 1.5 }}
                    >
                        All Events
                    </Button>

                    <Button
                        variant="outlined"
                        onClick={() => navigate(`/events/${eventId}`)}
                        className="secondary-pink-btn"
                        sx={{ px: 3, py: 1.5 }}
                    >
                        Back
                    </Button>
                </Box>

                <Divider sx={{ mb: 4 }} />

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        {/* NAME */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Event Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </Grid>

                        {/* DESCRIPTION */}
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                            />
                        </Grid>

                        {/* LOCATION + POINTS */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Points Value"
                                name="points"
                                value={Number(formData.points)}
                                onChange={handleChange}
                                required
                            />
                        </Grid>

                        {/* DATE/TIME */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="datetime-local"
                                label="Start Time"
                                name="startTime"
                                value={formData.startTime}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="datetime-local"
                                label="End Time"
                                name="endTime"
                                value={formData.endTime}
                                onChange={handleChange}
                                InputLabelProps={{ shrink: true }}
                                required
                            />
                        </Grid>

                        {/* CAPACITY + PUBLISHED */}
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="number"
                                label="Capacity (blank = unlimited)"
                                name="capacity"
                                value={formData.capacity}
                                onChange={handleChange}
                            />
                        </Grid>

                        <Grid item xs={12} md={6} sx={{ display: "flex", alignItems: "center" }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        name="published"
                                        checked={formData.published}
                                        onChange={handleChange}
                                        sx={{ color: "#d63384", "&.Mui-checked": { color: "#d63384" } }}
                                    />
                                }
                                label="Publish Event (visible to users)"
                            />
                        </Grid>

                        {/* ACTION BUTTONS */}
                        <Grid item xs={12} sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
                            <Button
                                variant="outlined"
                                className="secondary-pink-btn"
                                onClick={() => navigate(`/events/${eventId}`)}
                                disabled={saving}
                                sx={{ px: 4, py: 1.5 }}
                            >
                                Cancel / Back
                            </Button>

                            <Button
                                type="submit"
                                variant="contained"
                                className="pink-btn"
                                disabled={saving}
                                sx={{ px: 4, py: 1.5, fontWeight: 700 }}
                            >
                                {saving ? "Saving..." : "Save Updates"}
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </CardContent>

            <ToastNotification message={error} type="error" onClose={() => setError(null)} />
            <ToastNotification
                message={success ? "Event updated successfully!" : null}
                type="success"
                onClose={() => setSuccess(false)}
            />
        </Card>
    );
}

export default EventEditPage;
