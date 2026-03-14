import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEvent } from '../../api/eventsApi';
import { useAuth } from '../../context/AuthContext';


function CreateEventPage() {
  const navigate = useNavigate();

  const { user } = useAuth();
  console.log("Current User:", user);

  // Default event times for easy testing
  const now = new Date();
  const defaultStartTime = new Date(now.getTime() + 60 * 60 * 1000).toISOString().slice(0, 16);
  const defaultEndTime = new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString().slice(0, 16);


  const [eventData, setEventData] = useState({
    name: '',
    description: '',
    location: '',
    startTime: defaultStartTime,
    endTime: defaultEndTime,
    capacity: 10,
    points: 50,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Ensure only managers or higher can access this page
  if (!user || !['manager', 'superuser'].includes(user.role)) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Access Denied</h2>
        <p>You do not have permission to create events.</p>
      </div>
    );
  }



  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let processedValue = value;
    if (name === 'capacity') {
      // Capacity can be null (unlimited) if the input is empty
      processedValue = value === '' ? null : Number(value);
    } else if (name === 'points') {
      processedValue = Number(value);
    }

    setEventData({ ...eventData, [name]: processedValue });
    setError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Prepare data based on the API payload requirements (validateCreateEventPayload)
    const payload = {
      ...eventData,
      // Ensure capacity is null if it's 0, NaN, or < 0
      capacity: (eventData.capacity === 0 || isNaN(eventData.capacity) || eventData.capacity < 0)
        ? null
        : eventData.capacity,
      // Ensure points is a positive integer (min 1)
      points: (eventData.points === 0 || isNaN(eventData.points) || eventData.points < 1)
        ? 1
        : eventData.points,
    };
    console.log("Creating event with payload:", payload);
    

    // Client-side validation check
    if (!payload.name || !payload.description || !payload.location || !payload.startTime || !payload.endTime) {
      setError('Please fill out all required fields (Name, Description, Location, Start/End Time).');
      setLoading(false);
      return;
    }

    const start = new Date(payload.startTime);
    const end = new Date(payload.endTime);
    const oneMinuteInMs = 60000;

    if (start.getTime() >= end.getTime()) {
      setError('Start Time must be strictly before End Time.');
      setLoading(false);
      return;
    }

    // Check if the duration is less than or equal to 1 minute
    const durationMs = end.getTime() - start.getTime();
    if (durationMs <= oneMinuteInMs) {
      setError('Event duration must be longer than 1 minute.');
      setLoading(false);
      return;
    }


    try {
      // 2. Calling the imported 'createEvent' function from the API layer
      console.log("Creating event with payload:", payload);
      const newEvent = await createEvent(payload);

      setSuccessMessage(`Event "${newEvent.name}" created successfully! \n ID: ${newEvent.id}`);

      // Navigate after showing success message
      setTimeout(() => {
        // This is where you'd typically use useNavigate() from 'react-router-dom'
        // navigate(`/admin/events/${newEvent.id}/edit`);
        navigate(`/admin/events/${newEvent.id}/view`);
      }, 1000);

    } catch (err) {
      console.error("Event Creation Error:", err);
      // The API helper already processes the JSON error body into a clean message
      const msg = err.message || 'Failed to create event. Check your input data.';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>

      <h1>Create New Event</h1>

      {/* Success Message Box */}
      {successMessage && (
        <div style={{ border: '1px solid green', padding: '10px', marginBottom: '10px', backgroundColor: '#e9ffe9' }}>
          {successMessage}
        </div>
      )}

      {/* Error Message Box */}
      {error && (
        <div style={{ border: '1px solid red', padding: '10px', marginBottom: '10px', backgroundColor: '#ffe9e9' }}>
          <p style={{ fontWeight: 'bold' }}>Creation Failed:</p> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>

        {/* Name and Location */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>Event Name *</label>
          <input
            id="name"
            type="text"
            name="name"
            value={eventData.name}
            onChange={handleInputChange}
            placeholder="e.g., Annual Hackathon"
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="location" style={{ display: 'block', marginBottom: '5px' }}>Location *</label>
          <input
            id="location"
            type="text"
            name="location"
            value={eventData.location}
            onChange={handleInputChange}
            placeholder="e.g., Bahen Centre 1160 or Online"
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        {/* Start and End Time */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="startTime" style={{ display: 'block', marginBottom: '5px' }}>Start Time *</label>
          <input
            id="startTime"
            type="datetime-local"
            name="startTime"
            value={eventData.startTime}
            onChange={handleInputChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="endTime" style={{ display: 'block', marginBottom: '5px' }}>End Time *</label>
          <input
            id="endTime"
            type="datetime-local"
            name="endTime"
            value={eventData.endTime}
            onChange={handleInputChange}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        {/* Capacity and Points */}
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="capacity" style={{ display: 'block', marginBottom: '5px' }}>Capacity (Max Guests)</label>
          <input
            id="capacity"
            type="number"
            name="capacity"
            value={eventData.capacity === null ? '' : eventData.capacity}
            onChange={handleInputChange}
            min="1"
            placeholder="e.g., 50 (leave blank for unlimited)"
            style={{ width: '100%', padding: '8px' }}
          />
          <small style={{ color: 'gray' }}>Must be a positive integer, or leave blank for unlimited.</small>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="points" style={{ display: 'block', marginBottom: '5px' }}>Points to Award *</label>
          <input
            id="points"
            type="number"
            name="points"
            value={eventData.points}
            onChange={handleInputChange}
            min="1"
            required
            placeholder="e.g., 100"
            style={{ width: '100%', padding: '8px' }}
          />
          <small style={{ color: 'gray' }}>Points must be a positive integer.</small>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="description" style={{ display: 'block', marginBottom: '5px' }}>Description *</label>
          <textarea
            id="description"
            name="description"
            value={eventData.description}
            onChange={handleInputChange}
            placeholder="Provide a detailed description of the event's purpose, agenda, and expectations."
            rows="4"
            required
            style={{ width: '100%', padding: '8px', resize: 'none' }}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '10px 15px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Creating...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
}

export default CreateEventPage;