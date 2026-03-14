
const API_BASE = import.meta.env.VITE_BACKEND_URL;

// Helper function for API calls
const apiCall = async (endpoint, options = {}) => {

  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API Error');
  }

  return response.status === 204 ? null : response.json();
};

// EVENTS

// Get all events with filters
export const getEvents = async (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.name) params.append('name', filters.name);
  if (filters.location) params.append('location', filters.location);
  
  if (filters.started !== undefined && filters.ended === undefined) {
    params.append('started', String(filters.started));
  } else if (filters.ended !== undefined && filters.started === undefined) {
    params.append('ended', String(filters.ended));
  }
  
  if (filters.published !== undefined) params.append('published', String(filters.published));
  
  if (filters.showFull !== undefined) params.append('showFull', String(filters.showFull));
  
  // pagination
  if (filters.page) params.append('page', String(filters.page));
  if (filters.limit) params.append('limit', String(filters.limit));

  return apiCall(`/events?${params.toString()}`, {
    method: 'GET'
  });
};

// Get single event by ID
export const getEventById = async (eventId) => {
  return apiCall(`/events/${eventId}`);
};

// Create event (manager and higher)
export const createEvent = async (eventData) => {
  return apiCall('/events', {
    method: 'POST',
    body: JSON.stringify(eventData),
  });
};

// Update event (manager and higher)
export const updateEvent = async (eventId, eventData) => {
  return apiCall(`/events/${eventId}`, {
    method: 'PATCH',
    body: JSON.stringify(eventData),
  });
};

// Delete event (manager and higher)
export const deleteEvent = async (eventId) => {
  return apiCall(`/events/${eventId}`, {
    method: 'DELETE',
  });
};

// GUESTS

// Add logged-in user to event
export const joinEvent = async (eventId) => {
  return apiCall(`/events/${eventId}/guests/me`, {
    method: 'POST',
  });
};

// Remove logged-in user from event
export const leaveEvent = async (eventId) => {
  return apiCall(`/events/${eventId}/guests/me`, {
    method: 'DELETE',
  });
};

// Add guest to event (manager and higher)
export const addGuest = async (eventId, utorid) => {
  return apiCall(`/events/${eventId}/guests`, {
    method: 'POST',
    body: JSON.stringify({ utorid }),
  });
};

// Remove guest from event (manager and higher)
export const removeGuest = async (eventId, userId) => {
  return apiCall(`/events/${eventId}/guests/${userId}`, {
    method: 'DELETE',
  });
};

//ORGANIZERS 

// Add organizer to event (manager and higher)
export const addOrganizer = async (eventId, utorid) => {
  return apiCall(`/events/${eventId}/organizers`, {
    method: 'POST',
    body: JSON.stringify({ utorid }),
  });
};

// Remove organizer from event (manager and higher)
export const removeOrganizer = async (eventId, userId) => {
  return apiCall(`/events/${eventId}/organizers/${userId}`, {
    method: 'DELETE',
  });
};

// POINTS/TRANSACTIONS

// Award points for event
export const createRewardTransaction = async (eventId, transactionData) => {
  return apiCall(`/events/${eventId}/transactions`, {
    method: 'POST',
    body: JSON.stringify(transactionData),
  });
};

export default {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  joinEvent,
  leaveEvent,
  addGuest,
  removeGuest,
  addOrganizer,
  removeOrganizer,
  createRewardTransaction,
};