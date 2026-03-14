const express = require('express');
const eventsController = require('../controllers/eventsController.js');
const { requireManagerOrHigher } = require('../middleware/auth');
const router = express.Router();

// add logged in user to event 
router.post('/:eventId/guests/me', eventsController.addLoggedInUserToEvent);

// remove logged in user from event
router.delete('/:eventId/guests/me', eventsController.removeLoggedInUserFromEvent);

// create a point earning event
router.post('/:eventId/transactions', eventsController.createRewardTransactionEvent);

// add guest to event based on the event id
router.post('/:eventId/guests', eventsController.addGuest);

// remove guest from event based on the event id
router.delete('/:eventId/guests/:userId', requireManagerOrHigher, eventsController.removeGuest);

// add organizer to an event based on event id
router.post('/:eventId/organizers', requireManagerOrHigher, eventsController.addOrganizer);
// remove organizer from an event based on event id and user id
router.delete('/:eventId/organizers/:userId', requireManagerOrHigher, eventsController.removeOrganizer);


// get event based on event id
router.get('/:eventId', eventsController.getEventById); // might need two with diff clearances, least specific on top
router.patch('/:eventId', eventsController.patchEvent);
router.delete('/:eventId', requireManagerOrHigher, eventsController.deleteEvent);

// create event
router.post('/', requireManagerOrHigher, eventsController.createEvent);

// get events with optional filters
router.get('/', eventsController.getEvents);

module.exports = router;