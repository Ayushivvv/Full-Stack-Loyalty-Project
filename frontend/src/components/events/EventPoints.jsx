import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Button,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  LinearProgress,
  Alert,
} from '@mui/material';

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getEventById, createRewardTransaction } from '../../api/eventsApi';
import { userService } from '../../api/userService';


async function doesUtoridExist(utorid) {
  try {
    // search by utorid
    const res = await userService.getUsers(0, 20, utorid);

    if (!res?.data?.length) return false;

    return res.data.some(
      (u) => u.utorid.toLowerCase() === utorid.toLowerCase()
    );
  } catch (err) {
    console.error("Error checking UTORID:", err);
    return false;
  }
}


const EventPoints = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [recipientType, setRecipientType] = useState('all');
  const [selectedUtorid, setSelectedUtorid] = useState('');
  const [amount, setAmount] = useState('');
  const [remark, setRemark] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const data = await getEventById(eventId);
        setEvent(data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Failed to load event');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setError(null);

    const amountNum = parseInt(amount, 10);

    if (!amountNum || amountNum <= 0 || !Number.isInteger(amountNum)) {
      setError('Amount must be a positive integer');
      return;
    }

    if (!event) {
      setError('Event not loaded');
      return;
    }
    console.log("Event Points Remaining:", event.pointsRemain);
    if (amountNum > event.pointsRemain) {
      setError(
        `Not enough points remaining. Only ${event.pointsRemain} available.`
      );
      return;
    }

    if (recipientType === 'specific') {
      const trimmed = selectedUtorid.trim();
      if (!trimmed) {
        setError('Please enter a UTORID.');
        return;
      }
      if (!/^[a-zA-Z0-9._-]+$/.test(trimmed)) {
        setError('UTORID contains invalid characters.');
        return;
      }

      const isInGuestList = event.guests?.some(
        (g) => g.utorid?.toLowerCase() === trimmed.toLowerCase()
      );

      if (!isInGuestList) {
        setError(`"${trimmed}" is an INCORRECT UTorID or is not a guest of this event.`);
        return;
      }

    }

    if (recipientType === 'all') {
      const totalGuests = event.numGuests || event.guests?.length || 0;
      const confirmAll = window.confirm(
        `You are awarding ${amountNum} points to ALL ${totalGuests} guests.\n\n` +
        `Total cost: ${amountNum * totalGuests} points.\n\nProceed?`
      );
      if (!confirmAll) return;
    }

    try {
      setSubmitting(true);

      // ENSURE PAYLOAD MATCHES BACKEND EXACTLY
      const transactionData = {
        type: 'event',
        amount: amountNum,
        // omit remark if empty string
        ...(remark.trim() !== '' && { remark: remark.trim() }),
        // null if awarding to all, otherwise trimmed utorid
        utorid:
          recipientType === 'all'
            ? null
            : selectedUtorid.trim()
      };

      await createRewardTransaction(eventId, transactionData);
      console.log("Transaction created successfully", transactionData);

      const updatedEvent = await getEventById(eventId);
      setEvent(updatedEvent);
      console.log("Updated Event Data:", updatedEvent);

      setSuccessMessage(
        recipientType === 'all'
          ? `Successfully awarded ${amountNum} points to all guests!`
          : `Successfully awarded ${amountNum} points to ${selectedUtorid.trim()}!`
      );
      console.log("Points awarded successfully", event.guests);

      setAmount('');
      setRemark('');
      setSelectedUtorid('');
      setRecipientType('all');

    } catch (err) {
      // backend sends JSON error: { error: "..." }
      setError(err.message || 'Failed to award points');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading event...</Typography>
      </Box>
    );
  }

  console.log("Event Data:", event);

  const totalPoints = event.pointsAwarded + event.pointsRemain;
  const pointsPercentage =
    totalPoints === 0 ? 0 : (event.pointsAwarded / totalPoints) * 100;

  const guestCount = event.numGuests || event.guests?.length || 0;
  const projectedCost = amount ? parseInt(amount, 10) * guestCount : 0;

  return (
    <Box sx={{ p: 3 }}>
      {/* Event Info */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title={event.name} />
        <CardContent>
          <Typography><strong>Location:</strong> {event.location}</Typography>
          <Typography><strong>Total Guests:</strong> {guestCount}</Typography>
        </CardContent>
      </Card>

      {/* Points Summary */}
      <Card sx={{ mb: 3 }}>
        <CardHeader title="Points Summary" />
        <CardContent>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography>Total Points: {totalPoints}</Typography>
            <Typography color="text.secondary">Points Awarded: {event.pointsAwarded}</Typography>
            <Typography color="text.secondary">Points Remaining: {event.pointsRemain}</Typography>
          </Box>
          <Box sx={{ width: '100%', mb: 1 }}>
            <LinearProgress variant="determinate" value={pointsPercentage} />
          </Box>
          <Typography variant="body2">{pointsPercentage.toFixed(1)}% awarded</Typography>
        </CardContent>
      </Card>

      {/* Award Points Form */}
      <Card>
        <CardHeader title="Award Points" />
        <CardContent>
          {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Box mb={2}>
              <FormLabel component="legend">Recipient</FormLabel>
              <RadioGroup
                row
                value={recipientType}
                onChange={(e) => setRecipientType(e.target.value)}
              >
                <FormControlLabel value="all" control={<Radio />} label="Award to all guests" />
                <FormControlLabel value="specific" control={<Radio />} label="Award to specific guest" />
              </RadioGroup>
            </Box>

            {recipientType === 'specific' && (
              <Box mb={2}>
                <TextField
                  label="Guest UTORID"
                  value={selectedUtorid}
                  onChange={(e) => setSelectedUtorid(e.target.value)}
                  fullWidth
                  required
                />
              </Box>
            )}

            <Box mb={2}>
              <TextField
                label="Points to Award"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                fullWidth
                required
                inputProps={{ min: 1, max: event.pointsRemain }}
                helperText={`Maximum: ${event.pointsRemain} points`}
              />
              {recipientType === 'all' && amount && (
                <Typography variant="body2" mt={1}>
                  Projected total cost: {projectedCost} points
                </Typography>
              )}
            </Box>

            <Box mb={2}>
              <TextField
                label="Remark (Optional)"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                fullWidth
                multiline
                rows={3}
              />
            </Box>

            <Button
              variant="contained"
              type="submit"
              disabled={submitting || event.pointsRemain === 0}
            >
              {submitting ? 'Awarding Points...' : 'Submit'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default EventPoints;
