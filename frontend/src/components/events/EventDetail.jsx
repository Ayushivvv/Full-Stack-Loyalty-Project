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
} from "@mui/material";

// show details about the clicked event + RSVP

const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        const dateOptions = { month: 'long', day: 'numeric', year: 'numeric' };
        const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
        
        const datePart = date.toLocaleDateString('en-US', dateOptions);
        const timePart = date.toLocaleTimeString('en-US', timeOptions);
        return `${datePart} at ${timePart}`;
    } catch (e) {
        return 'Invalid Date';
    }
};


const EventDetail = ({ event, user, userRole, onRsvpClick, isGuest, isFull, eventHasEnded, eventHasStarted }) => {
    
    const isManagerOrHigher = ['manager', 'superuser'].includes(userRole);

    
    const isAuthenticated = !!user;// double check
    let buttonText = 'Login to RSVP';
    let buttonDisabled = !isAuthenticated || eventHasEnded || eventHasStarted;
    
    if (isAuthenticated) {
        if (isGuest) {
            buttonText = 'Leave Event';
            buttonDisabled = eventHasEnded;
        } else if (isFull) {
            buttonText = 'Event is Full';
            buttonDisabled = true;
        } else {
            buttonText = 'RSVP / Join Event';
            buttonDisabled = eventHasEnded;
        }
    }
    
    if (eventHasEnded) {
        buttonText = 'Event Ended';
        buttonDisabled = true;
    }
    if (eventHasStarted && !eventHasEnded) {
        buttonText = 'Event In Progress';
    }

    console.log("points", event);

    return (
    <Card sx={{ mt: 3 }}>
      <CardHeader title={event.name} />

      <CardContent>
        {/* Status + Basic Info */}
        <Box mb={2}>
          {isManagerOrHigher && event.published && (
            <Chip
              label="Published"
              color="success"
              size="small"
              sx={{ mb: 1 }}
            />
          )}

          <Typography>
            <strong>Location:</strong> {event.location}
          </Typography>
          <Typography>
            <strong>Guests:</strong> {event.guests?.length || 0} /{" "}
            {event.capacity || "Unlimited"}
          </Typography>
        </Box>

        {/* Details Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
            gap: 3,
            mb: 3,
          }}
        >
          {/* When */}
          <Box>
            <Typography variant="h6">When</Typography>
            <Typography>
              <strong>Start:</strong> {formatDateTime(event.startTime)}
            </Typography>
            <Typography>
              <strong>End:</strong> {formatDateTime(event.endTime)}
            </Typography>
          </Box>

          {/* Location */}
          <Box>
            <Typography variant="h6">Location</Typography>
            <Typography>{event.location}</Typography>
          </Box>

          {/* Organizers */}
          <Box>
            <Typography variant="h6">Organizers</Typography>
            <List dense>
              {event.organizers?.map((o) => (
                <ListItem key={o.utorid} sx={{ py: 0 }}>
                  {o.name || o.utorid}
                </ListItem>
              ))}
            </List>
          </Box>
        </Box>

        {/* Description */}
        <Box mb={3}>
          <Typography variant="h6">Description</Typography>
          <Typography>{event.description || "No description provided."}</Typography>
        </Box>

        {/* RSVP + Info */}
        <Card sx={{ p: 2, backgroundColor: "grey.100" }}>
          <CardContent>
            {isAuthenticated && isGuest && (
              <Typography color="success.main" sx={{ mb: 1 }}>
                ✔ You are registered!
              </Typography>
            )}

            <Typography sx={{ mb: 2 }}>
              Earn up to <strong>{event.pointsRemain} points</strong>!
            </Typography>

            <Button
              variant="contained"
              onClick={onRsvpClick}
              disabled={buttonDisabled}
            >
              {buttonText}
            </Button>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};


export default EventDetail;