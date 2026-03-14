import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById, addGuest, removeGuest, addOrganizer, removeOrganizer } from '../../api/eventsApi';
import { useAuth } from '../../context/AuthContext';

import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Button,
  Chip,
  List,
  ListItem,
  TextField,
} from "@mui/material";


// -----------------------------------------------------
// 1. Guest Management (MUI-Styled)
// -----------------------------------------------------
function GuestManagement({ eventId, currentGuests, onGuestListUpdate }) {
    const [newGuestUtorid, setNewGuestUtorid] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleAddGuest = async (e) => {
        e.preventDefault();
        const utorid = newGuestUtorid.trim();
        if (!utorid) return;

        if (currentGuests.some(g => g.utorid === utorid)) {
            setError(`User ${utorid} is already a guest.`);
            return;
        }

        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const newUser = await addGuest(eventId, utorid);
            const updatedList = [...currentGuests, newUser];
            onGuestListUpdate(updatedList);
            setNewGuestUtorid('');
            setSuccessMessage(`Guest '${utorid}' added successfully.`);
            window.location.reload();
        } catch (err) {
            setError(err.message || `Failed to add guest: ${utorid}`);
        } finally {
            setLoading(false);
            setTimeout(() => setSuccessMessage(null), 2000);
        }
    };

    const handleRemoveGuest = async (userId, utorid) => {
        if (!window.confirm(`Are you sure you want to remove guest ${utorid} (ID: ${userId})?`)) {
            return;
        }

        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            await removeGuest(Number(eventId), Number(userId));

            const updatedList = currentGuests.filter(g => g.id !== userId);
            onGuestListUpdate(updatedList);
            setSuccessMessage(`Guest '${utorid}' removed successfully.`);
        } catch (err) {
            setError(err.message || `Failed to remove guest: ${utorid}`);
        } finally {
            setLoading(false);
            setTimeout(() => setSuccessMessage(null), 2000);
        }
    };


    return (
        <Card sx={{ border: "1px solid #f06292", background: "#fff0f6", borderRadius: 3 }}>
            <CardHeader
                title={
                    <Typography variant="h6" sx={{ color: "#d63384" }}>
                        Guest List ({currentGuests.length})
                    </Typography>
                }
            />

            <CardContent>

                {error && (
                    <Box sx={{ color: "red", mb: 2, border: "1px solid red", p: 1, borderRadius: 1 }}>
                        Error: {error}
                    </Box>
                )}

                {successMessage && (
                    <Box sx={{ color: "green", mb: 2, border: "1px solid green", p: 1, borderRadius: 1 }}>
                        {successMessage}
                    </Box>
                )}

                {/* Add Guest */}
                <Box component="form" onSubmit={handleAddGuest} sx={{ display: "flex", gap: 2, mb: 3 }}>
                    <TextField
                        label="Enter Utorid"
                        variant="outlined"
                        fullWidth
                        value={newGuestUtorid}
                        onChange={(e) => {
                            setNewGuestUtorid(e.target.value);
                            setError(null);
                        }}
                        required
                    />
                    <Button
                        variant="contained"
                        disabled={loading || !newGuestUtorid.trim()}
                        className="pink-btn"
                        type="submit"
                    >
                        {loading ? "Adding..." : "Add"}
                    </Button>
                </Box>

                {/* Guest List */}
                <List sx={{ maxHeight: 300, overflowY: "auto", border: "1px solid #eee", borderRadius: 2 }}>
                    {currentGuests.map((guest) => (
                        <ListItem
                            key={guest.id}
                            secondaryAction={
                                <Button
                                    size="small"
                                    color="error"
                                    variant="contained"
                                    disabled={loading}
                                    onClick={() => handleRemoveGuest(guest.id, guest.utorid)}
                                >
                                    Remove
                                </Button>
                            }
                        >
                            <Typography>
                                {guest.name} ({guest.utorid}) — ID: {guest.id}
                            </Typography>
                        </ListItem>
                    ))}

                    {currentGuests.length === 0 && (
                        <ListItem>
                            <Typography sx={{ color: "gray", textAlign: "center", width: "100%" }}>
                                No guests registered yet.
                            </Typography>
                        </ListItem>
                    )}
                </List>

            </CardContent>
        </Card>
    );
}



// -----------------------------------------------------
// 2. Organizer Management (MUI-Styled)
// -----------------------------------------------------
function OrganizerManagement({ eventId, currentOrganizers, onOrganizerListUpdate }) {
    const { user } = useAuth();
    const [newOrganizerUtorid, setNewOrganizerUtorid] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleAddOrganizer = async (e) => {
        e.preventDefault();
        const utorid = newOrganizerUtorid.trim();
        if (!utorid) return;

        if (currentOrganizers.some(o => o.utorid === utorid)) {
            setError(`User ${utorid} is already an organizer.`);
            return;
        }

        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const newUser = await addOrganizer(eventId, utorid);
            const updatedList = [...currentOrganizers, newUser];
            onOrganizerListUpdate(updatedList);

            setNewOrganizerUtorid('');
            setSuccessMessage(`Organizer '${utorid}' added successfully.`);
            window.location.reload();

        } catch (err) {
            setError(err.message || `Failed to add organizer: ${utorid}`);
        } finally {
            setLoading(false);
            setTimeout(() => setSuccessMessage(null), 2000);
        }
    };

    const handleRemoveOrganizer = async (userId, utorid) => {
        if (currentOrganizers.length === 1) {
            setError('Cannot remove the last organizer. The event must have at least one organizer.');
            return;
        }

        if (!window.confirm(`Are you sure you want to remove organizer ${utorid} (ID: ${userId})?`)) {
            return;
        }

        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            await removeOrganizer(eventId, Number(userId));

            const updatedList = currentOrganizers.filter(o => o.id !== userId);
            onOrganizerListUpdate(updatedList);
            setSuccessMessage(`Organizer '${utorid}' removed successfully.`);
            window.location.reload();

        } catch (err) {
            setError(err.message || `Failed to remove organizer: ${utorid}`);
        } finally {
            setLoading(false);
            setTimeout(() => setSuccessMessage(null), 2000);
        }
    };


    return (
        <Card sx={{ border: "1px solid #28a745", background: "#ebfaed", borderRadius: 3 }}>
            <CardHeader
                title={
                    <Typography variant="h6" sx={{ color: "#28a745" }}>
                        Organizer List ({currentOrganizers.length})
                    </Typography>
                }
            />

            <CardContent>

                {error && (
                    <Box sx={{ color: "red", mb: 2, border: "1px solid red", p: 1, borderRadius: 1 }}>
                        Error: {error}
                    </Box>
                )}

                {successMessage && (
                    <Box sx={{ color: "green", mb: 2, border: "1px solid green", p: 1, borderRadius: 1 }}>
                        {successMessage}
                    </Box>
                )}

                {/* Add Organizer */}
                <Box component="form" onSubmit={handleAddOrganizer} sx={{ display: "flex", gap: 2, mb: 3 }}>
                    <TextField
                        label="Enter Utorid"
                        variant="outlined"
                        fullWidth
                        value={newOrganizerUtorid}
                        onChange={(e) => {
                            setNewOrganizerUtorid(e.target.value);
                            setError(null);
                        }}
                        required
                    />
                    <Button
                        variant="contained"
                        color="success"
                        disabled={loading || !newOrganizerUtorid.trim()}
                        type="submit"
                    >
                        {loading ? "Adding..." : "Add"}
                    </Button>
                </Box>

                {/* Organizer List */}
                <List sx={{ maxHeight: 300, overflowY: "auto", border: "1px solid #eee", borderRadius: 2 }}>
                    {currentOrganizers.map((organizer) => (
                        <ListItem
                            key={organizer.id}
                            secondaryAction={
                                <Button
                                    size="small"
                                    color="error"
                                    variant="contained"
                                    disabled={loading || currentOrganizers.length === 1}
                                    onClick={() => handleRemoveOrganizer(organizer.id, organizer.utorid)}
                                >
                                    Remove
                                </Button>
                            }
                        >
                            <Typography>
                                {organizer.name} ({organizer.utorid}) — ID: {organizer.id}
                                {user.utorid === organizer.utorid && (
                                    <Chip label="You" size="small" color="primary" sx={{ ml: 1 }} />
                                )}
                            </Typography>
                        </ListItem>
                    ))}
                </List>

            </CardContent>
        </Card>
    );
}



// -----------------------------------------------------
// Helper
// -----------------------------------------------------
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
};



// -----------------------------------------------------
// Main Event View Page (kept untouched except styling)
// -----------------------------------------------------
function EventViewPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const hasAdminAccess = user && ['manager', 'superuser'].includes(user.role);

    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchEvent = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getEventById(eventId);
            setEvent(data);
        } catch (err) {
            setError(err.message || 'Failed to fetch event details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (eventId && (user && ['manager', 'superuser'].includes(user.role))) {
            fetchEvent();
        }
    }, [eventId, user?.role]);


    if (!hasAdminAccess) {
        return (
            <Box sx={{ p: 4 }}>
                <Typography variant="h4">Access Denied</Typography>
                <Typography>You must have manager or superuser privileges.</Typography>
            </Box>
        );
    }

    const handleUpdateList = (key, updated) => {
        setEvent(prev => ({ ...prev, [key]: updated }));
    };

    if (loading) return <Typography>Loading event {eventId}...</Typography>;
    if (error) return <Typography>Error: {error}</Typography>;
    if (!event) return <Typography>No event found.</Typography>;

    return (
        <Box>

            {/* Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <Button onClick={() => navigate(`/events`)} variant="contained" className="pink-btn">
                    All Events
                </Button>

                <Button onClick={() => navigate(`/events/${eventId}`)} variant="contained" className="pink-btn">
                    Back
                </Button>

                <Button onClick={() => navigate(`/admin/events/${eventId}/edit`)} variant="contained" className="pink-btn">
                    Edit
                </Button>

                <Button
                    onClick={() => navigate(`/admin/events/${eventId}/awardpoints`)}
                    variant="contained"
                    color="success"
                >
                    Award Points
                </Button>
            </Box>


            {/* Title */}
            <Typography variant="h4" sx={{ mb: 3, pb: 1, borderBottom: "2px solid #ddd" }}>
                Event Administration: {event.name}
            </Typography>


            {/* Event Details Card */}
            <Card sx={{ mb: 5 }}>
                <CardHeader title="Event Details" />
                <CardContent>
                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 2 }}>
                        <Typography><strong>ID:</strong> {event.id}</Typography>
                        <Typography><strong>Location:</strong> {event.location}</Typography>
                        <Typography><strong>Capacity:</strong> {event.capacity ?? "Unlimited"}</Typography>
                        <Typography><strong>Starts:</strong> {formatDate(event.startTime)}</Typography>
                        <Typography><strong>Ends:</strong> {formatDate(event.endTime)}</Typography>

                        <Typography>
                            <strong>Guests:</strong> {event.guests.length} / {event.capacity ?? "∞"}
                        </Typography>

                        <Typography><strong>Points:</strong> {event.pointsRemain}</Typography>

                        <Typography component="div">
                            <strong>Published:</strong>{" "}
                            <Chip label={event.published ? "Yes" : "No"} color={event.published ? "success" : "error"} size="small"/>
                        </Typography>
                    </Box>

                    <Box sx={{ mt: 3 }}>
                        <Typography variant="h6">Description</Typography>
                        <Typography sx={{ mt: 1 }}>{event.description}</Typography>
                    </Box>
                </CardContent>
            </Card>


            {/* Grid: Guests & Organizers */}
            <Box sx={{ display: "grid", gridTemplateColumns: { lg: "1fr 1fr" }, gap: 4 }}>
                <GuestManagement
                    eventId={eventId}
                    currentGuests={event.guests || []}
                    onGuestListUpdate={(updated) => handleUpdateList("guests", updated)}
                />

                <OrganizerManagement
                    eventId={eventId}
                    currentOrganizers={event.organizers}
                    onOrganizerListUpdate={(updated) => handleUpdateList("organizers", updated)}
                />
            </Box>

            <Typography sx={{ mt: 5, textAlign: "center", color: "gray" }}>
                Administration Panel for Event ID {eventId}
            </Typography>
        </Box>
    );
}

export default EventViewPage;
