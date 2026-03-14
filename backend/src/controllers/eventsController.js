const express = require("express");
const eventService = require("../services/eventsService");
const userService = require("../services/userService");

function endBeforeStart(startTime, endTime) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return !(start < end); // deals with invalid dates as well
}

function isValidCapacity(capacity) {
  return capacity === null || (Number.isInteger(capacity) && capacity > 0);
}

function isValidPoints(points) {
  return Number.isInteger(points) && points > 0;
}

function validateCreateEventPayload({ name, description, location, startTime, endTime, capacity, points }) {

  const errors = [];

  if (!name || !description || !location) errors.push("missing required fields");

  if (endBeforeStart(startTime, endTime)) errors.push("startTime must be before endTime");

  if (!isValidCapacity(capacity)) {
    errors.push("capacity must be a positive integer or null");
  }

  if (!isValidPoints(points)) errors.push("points must be a positive integer");

  return errors;
}

const createEvent = async (req, res, next) => {
  try {
    // check if payload is empty
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Missing request body" });
    }

    // check if payload is valid 
    errors = validateCreateEventPayload(req.body)
    if (errors.length > 0) {
      console.log(errors);
      return res.status(400).json({"error": "Bad Request"});
    }

    const event = await eventService.createEvent(req.body);

    return res.status(201).json({
      "id": event.id, 
      "name": event.name, 
      "description": event.description, 
      "location": event.location, 
      "startTime": event.startTime, 
      "endTime": event.endTime, 
      "capacity": event.capacity, 
      "pointsRemain": event.pointsRemain, 
      "pointsAwarded": event.pointsAwarded, 
      "published": event.published, 
      "organizers": event.organizers || [], 
      "guests": event.guests || []
    });
  }
  catch (err) {
    next(err);
  }
};

const getEventById = async (req, res, next) => {
  try {
    const eventId = req.params.eventId;
    const isPublished = await eventService.isEventPublished(eventId);
    const eventExists = await eventService.eventExists(eventId);
    
    if (!eventExists) {
      return res.status(404).json({ error: "Event not found" });
    }
    // regular users can't see unpublished events
    if ( req.auth.role === 'regular' &&  isPublished === false) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    const event = await eventService.getEventById(eventId, req.auth.utorid, req.auth.role);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    return res.status(200).json(event);
  }
  catch (err) {
    next(err);
  }

};

const addOrganizer = async (req, res, next) => {
  try {
    const eventId = req.params.eventId;
    const utorid = req.body.utorid;

    if ( eventId === undefined || utorid === undefined || Object.keys(req.body).length > 1 || await eventService.isGuest(eventId, utorid)) {
      return res.status(400).json({ error: 'Bad Request'});
    }

    // if user or event is not valid
    const user = await userService.getUserByUtorid(utorid);
    const eventExists = await eventService.eventExists(eventId);

    if (!eventExists) {
      return res.status(404).json({ error: 'Event not found'});
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found'});
    }

    // if event is over
    if (await eventService.isEventOver(eventId)) {
      return res.status(410).json({ error: 'Event is over'});
    }

    const event = await eventService.addOrganizer(eventId, utorid);

    return res.status(201).json({
      "id": event.id, 
      "name": event.name,
      "location": event.location,
      "organizers": event.organizers || []
    });


  } catch (err) {
    next(err);
  }
};

const removeOrganizer = async (req, res, next) => {

  try {
    const eventId = Number(req.params.eventId);
    const userId = Number(req.params.userId);

    if ( eventId === undefined || userId === undefined ) {
      return res.status(400).json({ error: 'Bad Request'});
    }

    if (!Number.isInteger(eventId) || eventId <= 0) {
      return res.status(400).json({ error: "Bad Request: Invalid event id" });
    }
    if (!Number.isInteger(userId) || userId <= 0) {
      return res.status(400).json({ error: "Bad Request: Invalid user id" });
    }
    // if user or event is not valid
    const user = await userService.getUserById(userId, req.auth.role);
    const eventExists = await eventService.eventExists(eventId);

    if (!eventExists) {
      return res.status(404).json({ error: 'Event not found'});
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found'});
    }

    await eventService.removeOrganizer(eventId, userId);
    return res.status(204).json({});

  }
  catch (err) {
    next(err);
  }
};

const addGuest = async (req, res, next) => {

  try {
    const eventId = req.params.eventId;
    const utorid = req.body.utorid;

    // check for proper payload
    if ( eventId === undefined || utorid === undefined || Object.keys(req.body).length > 1) {
      return res.status(400).json({ error: 'Bad Request'});
    }

    // if user or event is not valid
    const user = await userService.getUserByUtorid(utorid);
    const eventExists = await eventService.eventExists(eventId);
    const isCurrUserOrganizer = await eventService.isOrganizer(eventId, req.auth.utorid);

    if (!eventExists) {
      return res.status(404).json({ error: 'Event not found'});
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found'});
    }

    // if user is already a guest or organizer of the event
    if (await eventService.isGuest(eventId, utorid) || await eventService.isOrganizer(eventId, utorid)) {
      return res.status(400).json({ error: 'Bad Request: User is already a guest or organizer of the event'});
    }

    if (req.auth.role === 'regular' && req.auth.role === 'cashier') {
      if (isCurrUserOrganizer) {
        return res.status(403).json({ error: 'You do not have permission to add this guest'});
      }
    }

    // if event is over
    if (await eventService.isEventOver(eventId)) {
      return res.status(410).json({ error: 'Event is over'});
    }

    if (await eventService.isEventFull(eventId)) {
      return res.status(410).json({ error: 'Event is full'});
    }

    const event = await eventService.addGuest(eventId, utorid);

    return res.status(201).json(event);

  } catch (err) {
    next(err);
  }
};

const removeGuest = async (req, res, next) => {
  try {
    const eventId = req.params.eventId;
    const userId = req.params.userId;

    if ( eventId === undefined || userId === undefined ) {
      return res.status(400).json({ error: 'Bad Request'});
    }
    // check for valid eventId and userId
    if (!Number.isInteger(Number(eventId)) || Number(eventId) <= 0) {
      return res.status(400).json({ error: "Bad Request: Invalid event id" });
    }
    if (!Number.isInteger(Number(userId)) || Number(userId) <= 0) {
      return res.status(400).json({ error: "Bad Request: Invalid user id" });
    }

    // if user or event is not valid
    const user = await userService.getUserById(userId, req.auth.role);
    const eventExists = await eventService.eventExists(eventId);

    if (!eventExists) {
      return res.status(404).json({ error: 'Event not found'});
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found'});
    }
    
    await eventService.removeGuest(Number(eventId), Number(userId));
    return res.status(204).json({});

  }
  catch (err) {
    next(err);
  }
};

const patchEvent = async (req, res, next) => {
  try {
    const eventId = Number(req.params.eventId);
    if (!Number.isInteger(eventId) || eventId <= 0) {
      return res.status(400).json({ error: 'Invalid event id.' });
    }

    // Only allow these fields to be patched
    const {
      name,
      description,
      location,
      startTime,
      endTime,
      capacity,
      points,
      published
    } = req.body || {};

    const utorid = req.auth.utorid;
    const role = req.auth.role;

    const originalEvent = await eventService.getEventById(eventId, utorid, role);
    if (!originalEvent) {
      return res.status(404).json({ error: 'Event not found.' });
    }

    // check for 400 errors --> payload validity
    if (capacity !== undefined) {
      if (capacity === null) {
        // pass
      }
      else if (!isValidCapacity(capacity) || capacity < originalEvent.numGuests) {
        return res.status(400).json({ error: 'Invalid capacity.' });
      }
    }

    if (startTime != null && endTime != null && endBeforeStart(startTime, endTime)) {
      return res.status(400).json({ error: 'startTime must be before endTime.' });
    }
    
    let newPointsRemain;
    if (points != null) {
      // check points validity and if enough points remain
      const pointsAwarded = await eventService.getPointsAwarded( eventId );
      newPointsRemain = Number(points) - pointsAwarded;

      if (!isValidPoints(points) || newPointsRemain < 0 ) {
        return res.status(400).json({ error: 'Invalid points.' });
      }
    }

    if (new Date(originalEvent.startTime) < new Date()) {
      if (name != null || description != null || location != null || startTime != null || capacity != null) {
        return res.status(400).json({ error: 'Event has already started and cannot be modified.' });
      }
    }

    if ( startTime !== null && new Date(startTime) < new Date()) {
      return res.status(400).json({ error: 'startTime cannot be in the past.' });
    }

    if (new Date(originalEvent.endTime) < new Date() && endTime != null) {
      return res.status(400).json({ error: 'Event has already ended and cannot be modified.' });
    }

    const isManagerPlus = role === 'manager' || role === 'superuser';
    const isOrganizer = await eventService.isOrganizer(eventId, utorid);

    // must be manager or organizer
    if (!(isManagerPlus || isOrganizer)) {
      return res.status(403).json({ error: 'Insufficient permissions: requires manager+ or organizer for this event' });
    }

    // points/published may only be set by manager+
    if (('points' in req.body || 'published' in req.body) && !isManagerPlus) {
      return res.status(403).json({ error: 'Only manager may update points or published' });
    }

    // published can only be set to true
    if ('published' in req.body && req.body.published !== true && req.body.published != null) {
      return res.status(400).json({ error: 'published can only be set to true' });
    } 

    const updatedEventData = {};

    if (name !== undefined && name !== null) updatedEventData.name = name;
    if (description !== undefined && description !== null) updatedEventData.description = description;
    if (location !== undefined && location !== null) updatedEventData.location = location;
    if (startTime !== undefined && startTime !== null) updatedEventData.startTime = startTime;
    if (endTime !== undefined && endTime !== null) updatedEventData.endTime = endTime;
    if (capacity !== undefined && capacity !== null) updatedEventData.capacity = capacity;
    if (points !== undefined && points !== null) {
      updatedEventData.points = points;
      updatedEventData.pointsRemain = newPointsRemain;
    };
    if (published !== undefined && published !== null) updatedEventData.published = published;

    const updatedEvent = await eventService.patchEvent(eventId, role, updatedEventData);
    return res.status(200).json(updatedEvent);
  }
  catch (err) {
    next(err);
  }
};

const deleteEvent = async (req, res, next) => {

  try {
    const eventId = Number(req.params.eventId);
    if (!Number.isInteger(eventId) || eventId <= 0) {
      return res.status(400).json({ error: 'Invalid event id.' });
    }

    if (await eventService.isEventPublished(eventId) ) {
      return res.status(400).json({ error: 'Cannot delete published event.' });
    }

    await eventService.deleteEvent(eventId);
    return res.status(204).json({});

  } catch (err) {
    next(err);
  }
}

const parseBool = (val) => {
  if (val === undefined) return undefined;
  if (val === true || val === false) return val;
  if (typeof val === 'string') {
    const v = val.toLowerCase();
    if (v === 'true') return true;
    if (v === 'false') return false;
  }
  return undefined;
};

const getEvents = async (req, res, next) => {
  try {

    // parse payload
    const {
      name,
      location,
      started: startedRaw,
      ended: endedRaw,
      published: publishedRaw,
      showFull: showFullRaw,
      page: pageRaw,
      limit: limitRaw,
    } = req.query || {};

    // ensure only started or ended
    if ('started' in req.query && 'ended' in req.query) {
      return res.status(400).json({ error: 'Bad Request: specified both start and ended.'});
    }

    // limit and page must be positive integers
    if ( (limitRaw !== undefined && (isNaN(limitRaw) || parseInt(limitRaw, 10) <= 0)) ||
         (pageRaw !== undefined && (isNaN(pageRaw) || parseInt(pageRaw, 10) <= 0)) ) {
      return res.status(400).json({ error: 'Bad Request: limit and page must be positive integers.'});
    }

    const started = parseBool(startedRaw);
    const ended = parseBool(endedRaw);
    const showFull = parseBool(showFullRaw) ?? false;
    const published = parseBool(publishedRaw); // managers only
    const page = Math.max(1, parseInt(pageRaw ?? '1', 10) || 1); // default of 1
    const limit = Math.min(100, Math.max(1, parseInt(limitRaw ?? '10', 10) || 10)); // default of 10

    managerView = req.auth.role === 'manager' || req.auth.role === 'superuser' ? true : false;

    const filters = {
      name,
      location,
      started: 'started' in req.query ? started : undefined,
      ended: 'ended' in req.query ? ended : undefined,
      published: managerView && 'published' in req.query ? published : undefined,
      showFull,
    };

    pagination = {
      page,
      limit,
    };

    const events = await eventService.getEvents({ filters: filters, managerView: managerView, pagination: pagination });

    return res.status(200).json(events);
  }
  catch (err) {
    next(err);
  }
};

const addLoggedInUserToEvent = async (req, res, next) => {

  const eventId = req.params.eventId;
  const utorid = req.auth.utorid;

  try {

    // check if event exists
    const originalEvent = await eventService.getEventById(eventId, utorid, req.auth.role);
    if (!originalEvent) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    // if user is already a guest
    if (await eventService.isGuest(eventId, utorid)) {
      return res.status(400).json({ error: 'User is already a guest of the event.' });
    }
    // if event is over or full
    if (await eventService.isEventOver(eventId)) {
      return res.status(410).json({ error: 'Event is over.' });
    }
    if (await eventService.isEventFull(eventId)) {
      return res.status(410).json({ error: 'Event is full.' });
    }

    const event = await eventService.addGuest(eventId, utorid);

    const response = {
      ...event, 
      description: originalEvent.description,
      published: originalEvent.published
    }

    return res.status(201).json(response);
  }
  catch (err) {
    next(err);
  }
}

const removeLoggedInUserFromEvent = async (req, res, next) => {

  const eventId = req.params.eventId;
  const utorid = req.auth.utorid;

  try {
    const user = await userService.getUserByUtorid(utorid);

    // check if event exists
    const eventExists = await eventService.eventExists(eventId);
    if (!eventExists) {
      return res.status(404).json({ error: 'Event not found.' });
    }
    // if user is not a guest
    if (!await eventService.isGuest(eventId, utorid)) {
      return res.status(400).json({ error: 'User is not a guest of the event.' });
    }
    // if event is over
    if (await eventService.isEventOver(eventId)) {
      return res.status(410).json({ error: 'Event is over.' });
    }
    await eventService.removeGuest(eventId, user.id);
    return res.status(204).json({});
  }
  catch (err) {
    next(err);
  }
};

const createRewardTransactionEvent = async ( req, res, next) => {

  try {

    const role = req.auth.role;
    const utorid = req.auth.utorid;
    const eventId = req.params.eventId;
    const transactionData = req.body;

    // check if logged in  user is manager or higher or organizer
    if ( role !== 'manager' && role !== 'superuser' && !await eventService.isOrganizer(eventId, utorid) ) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // valid payload
    if ( transactionData.type === undefined || transactionData.amount === undefined) {
      return res.status(400).json({ error: 'Bad Request'});
    }

    // make sure type is event and amount is positive integer
    if ( transactionData.type !== 'event' || transactionData.amount < 1 ) {
      return res.status(400).json({ error: 'Bad Request'});
    }


    // if utorid is not a guest of the event
    if ( transactionData.utorid != null && !await eventService.isGuest(eventId, transactionData.utorid) ) {
      return res.status(400).json({ error: 'Bad Request: utorid is not a guest of the event'});
    }

    // if remaining points is less than amount
    const remainingPoints = await eventService.getRemainingPoints(eventId);
    if ( remainingPoints < transactionData.amount ) {
      return res.status(400).json({ error: 'Bad Request: not enough remaining points in event'});
    }

    const response = await eventService.createRewardTransactionEvent( eventId, transactionData, utorid );

    return res.status(201).json(response);
  }
  catch (err) {
    next(err);
  }

};

module.exports = {
  createEvent,
  getEventById,
  addOrganizer,
  addGuest,
  removeOrganizer,
  removeGuest,
  patchEvent,
  deleteEvent,
  getEvents,
  addLoggedInUserToEvent,
  removeLoggedInUserFromEvent,
  createRewardTransactionEvent
}
