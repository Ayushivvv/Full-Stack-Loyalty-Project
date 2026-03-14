import { Card, CardContent, CardHeader, TextField, Button, Typography, Box, } from "@mui/material";

import React, { useState, useEffect, useCallback, useMemo} from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { getEventById, joinEvent, leaveEvent, deleteEvent } from '../../api/eventsApi'; 
import { useAuth } from '../../context/AuthContext'; 
import EventDetail from '../../components/events/EventDetail.jsx';

const EventMainPage = () => {
    const { eventId } = useParams();
    const { user, loading: authLoading, currentMode } = useAuth();
    
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showRsvpModal, setShowRsvpModal] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false); 

    // Derived States
    const isAuthenticated = !!user;
    const isGuest = event?.guests?.some(g => g.utorid === user?.utorid);
    const isFull = event?.capacity !== null && event?.guests?.length >= event?.capacity;
    const eventHasStarted = event ? new Date(event.startTime) < new Date() : false;
    const eventHasEnded = event ? new Date(event.endTime) < new Date() : false;
    const isAdmin = useMemo(() => currentMode === 'manager' || currentMode === 'superuser' || currentMode === 'organizer', [currentMode]);

    const navigate = useNavigate();

    // Data Fetching
    const fetchEvent = useCallback(async () => {
        if (!eventId || authLoading) return;

        setLoading(true);
        setError(null);

        try {
            const data = await getEventById(eventId); 
            console.log("Fetched event data:", data);
            setEvent(data);
        } catch (err) {
            console.error("Failed to fetch event:", err);
            setError("Could not load event details");
        } finally {
            setLoading(false);
        }
    }, [eventId, authLoading]);

    useEffect(() => {
        fetchEvent();
    }, [fetchEvent]);

    // Handles the RSVP action
    const handleRsvpAction = async () => {
        setIsJoining(true);
        setError(null);
        
        try {
            if (isGuest) {
                await leaveEvent(eventId);

                setEvent(prev => ({
                    ...prev,
                    guests: prev.guests.filter(g => g.utorid !== user.utorid)
                }));
                setError(`Left the event: ${event.name}`); 

            } else {
                await joinEvent(eventId);

                setEvent(prev => ({
                ...prev,
                guests: [...(prev.guests || []), user]
                }));
                console.log("added as guest", event.guests);
                setError(`Joined the event: ${event.name}`);
            }
            
            setShowRsvpModal(false);
            await fetchEvent(); 

        } catch (err) {
            console.error("Registration error:", err);
            const msg = err.message || `Failed to ${isGuest ? 'leave' : 'join'} the event.`;
            setError(msg);
        } finally {
            setIsJoining(false);
        }
    };
    
    // Function passed to the detail component to trigger the modal
    const handleRsvpClick = () => {
        if (!isAuthenticated) {
            setError("Please log in to RSVP for this event.");
        } else if (eventHasEnded) {
            setError("This event has already ended.");
        } else if (isFull && !isGuest) {
            setError("The event is currently full. Cannot join.");
        } else {
            // Show modal for confirmation
            setShowRsvpModal(true);
        }
    };


    const handleViewClick = () => {
        // Navigate to the view/edit page using the eventId from URL params
        navigate(`/admin/events/${eventId}/view`);
    };

    const handleBackClick = () => {
        navigate(`/events`);
    };

    // Handle delete event with confirmation
    const handleDeleteEvent = async () => {
        setIsDeleting(true);
        setError(null);
        
        try {
            await deleteEvent(eventId);
            setError('Event deleted successfully');
            // Navigate to events list after a brief delay to show the message
            setTimeout(() => {
                navigate('/events');
            }, 1500);
        } catch (err) {
            console.error("Delete error:", err);
            const msg = err.message || 'Failed to delete the event.';
            setError(msg);
            setIsDeleting(false);
        }
    };

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };


    // --- Render Logic (Loading, Error, Main Content) ---

    if (loading || authLoading) {
        return (
            <div>
                <p>Loading event details...</p>
            </div>
        );
    }

    // Dynamic error/success message display
    const isSuccessMessage = error?.startsWith('Successfully');
    const borderClass = isSuccessMessage ? 'border-green-400' : 'border-red-400';
    const bgClass = isSuccessMessage ? 'bg-green-100' : 'bg-red-100';
    const textClass = isSuccessMessage ? 'text-green-700' : 'text-red-700';

    if (!event) {
        return (
            <div>
                <p>Event not found or access denied.</p>
            </div>
        );
    }
    
    // Props object for the EventDetail component
    const eventDetailProps = {
        event,
        user,
        currentMode,
        onRsvpClick: handleRsvpClick,
        isGuest,
        isFull,
        eventHasEnded,
        eventHasStarted
    };

    return (
  <Box sx={{ p: 3 }}>

    {/* Back Button */}
    <Box display="flex" justifyContent="flex-end" mb={2}>
      <Button
        variant="contained"
        color="primary"
        onClick={handleBackClick}
      >
        Back
      </Button>
    </Box>

    {/* Admin Controls */}
    {isAdmin && (
      <Box display="flex" justifyContent="flex-end" gap={2} mb={3}>
        
        <Button
          variant="contained"
          color="primary"
          onClick={handleViewClick}
        >
          View
        </Button>

        <Button
          variant="contained"
          color="warning"
          onClick={() => navigate(`/admin/events/${eventId}/edit`)}
        >
          Edit
        </Button>

        <Button
          variant="contained"
          color="error"
          onClick={handleDeleteClick}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </Button>

      </Box>
    )}

    {/* Delete Modal */}
    {showDeleteModal && (
      <Card sx={{ p: 3, mb: 3 }}>
        <CardHeader title="Confirm Delete" />
        <CardContent>
          <Typography sx={{ mb: 2 }}>
            Do you want to delete the event <strong>{event.name}</strong>?
          </Typography>

          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button
              variant="outlined"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              color="error"
              onClick={handleDeleteEvent}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Yes, Delete"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    )}

    {/* Error / Success Message */}
    {error && (
      <Card
        sx={{
          borderLeft: 4,
          borderColor: isSuccessMessage ? "success.main" : "error.main",
          backgroundColor: isSuccessMessage ? "success.light" : "error.light",
          mb: 3,
        }}
      >
        <CardContent>
          <Typography variant="h6" color={isSuccessMessage ? "success.dark" : "error.dark"}>
            {isSuccessMessage ? "Success!" : "Notice"}
          </Typography>
          <Typography color={isSuccessMessage ? "success.dark" : "error.dark"}>
            {error}
          </Typography>
        </CardContent>
      </Card>
    )}

    {/* Event Details Component */}
    <EventDetail {...eventDetailProps} />

    {/* RSVP Modal */}
    {showRsvpModal && (
      <Card sx={{ p: 3, mt: 3 }}>
        <CardHeader
          title={isGuest ? "Confirm Un-registration" : "Confirm RSVP"}
        />
        <CardContent>
          <Typography sx={{ mb: 2 }}>
            {isGuest
              ? `Are you sure you want to leave "${event.name}"?`
              : `Do you want to join "${event.name}"? You will earn up to ${event.pointsRemain} points.`}
          </Typography>

          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button
              variant="outlined"
              onClick={() => setShowRsvpModal(false)}
              disabled={isJoining}
            >
              Cancel
            </Button>

            <Button
              variant="contained"
              onClick={handleRsvpAction}
              disabled={isJoining}
            >
              {isJoining
                ? "Processing..."
                : isGuest
                ? "Yes, Leave"
                : "Yes, Join"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    )}

  </Box>
);
};

export default EventMainPage;