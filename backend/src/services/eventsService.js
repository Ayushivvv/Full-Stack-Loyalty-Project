const {PrismaClient} = require('@prisma/client');
// const { get, patch } = require('../routes/events');
// const { guid } = require('zod/v4');
// const { response } = require('express');
const prisma = new PrismaClient();

// create event
const createEvent = async (eventData) => {

  const event = await prisma.event.create({
    data: {
      name: eventData.name,
      description: eventData.description,
      location: eventData.location,
      startTime: new Date(eventData.startTime),
      endTime: new Date(eventData.endTime),
      capacity: eventData.capacity ?? null,
      points: eventData.points,
      pointsRemain: eventData.points,
    },
    select: {
      id : true, 
      name: true, 
      description: true, 
      location: true, 
      startTime: true, 
      endTime: true, 
      capacity: true, 
      pointsRemain: true, 
      pointsAwarded: true, 
      published: true, 
    },
  });

  const response = {
    id : event.id, 
    name: event.name, 
    description: event.description, 
    location: event.location, 
    startTime: event.startTime, 
    endTime: event.endTime, 
    capacity: event.capacity, 
    pointsRemain: event.pointsRemain, 
    pointsAwarded: event.pointsAwarded, 
    published: event.published, 
    organizers: event.organizers,
    guests: event.guests
  }

  return response;
}

function buildEventFilters( filters, managerView ) {
  const where = {};

  // text filters
  if (filters.name) {
    where.name = { contains: filters.name, mode: 'insensitive' };
  }
  if (filters.location) {
    where.location = { contains: filters.location, mode: 'insensitive' };
  }

  // time filters
  const now = new Date();

  if (filters.started !== undefined) {
    where.startTime = filters.started ? { lte: now } : { gt: now };
  }
  if (filters.ended !== undefined) {
    where.endTime = filters.ended ? { lte: now } : { gt: now };
  }

  // visibility
  if (managerView) {
    if (filters.published !== undefined) where.published = filters.published;
  } else {
    where.published = true;
  }

  return where;
}

function mapEventRow( e, managerView ) {
  
  const base = {
    id: e.id,
    name: e.name,
    location: e.location,
    startTime: e.startTime,
    endTime: e.endTime,
    capacity: e.capacity,
    numGuests: e._count.guests || 0,
  };
  if (managerView) {
    return {
      ...base,
      pointsRemain: e.pointsRemain,
      pointsAwarded: e.pointsAwarded,
      published: e.published,
    };
  }
  return base;
}

// get all events
const getEvents = async ({filters, managerView, pagination}) => {

  const where = buildEventFilters(filters, managerView);

  // pull rows that satisfy filters
  const rows = await prisma.event.findMany({
    where: where,
    orderBy: { startTime: 'asc' },
    select: {
      id: true,
      name: true,
      location: true,
      startTime: true,
      endTime: true,
      capacity: true,
      pointsRemain: true,
      pointsAwarded: true,
      published: true,
      guests: true,
      organizers: true,
      _count: { select: { guests: true } },
    },
  });

  //console.log(rows);

  // filter for events that are full
  const afterFull = rows.filter((e) => {
    if (filters.showFull) return true;

    const numGuests = e._count.guests || 0;
    const cap = e.capacity;

    // unlimited capacity --> event is never full
    if (cap === null) return true;

    return numGuests < cap;
  });

  //console.log(afterFull.length);

  // pagination
  const count = afterFull.length;

  const { page, limit } = pagination;
  const startIdx = (page - 1) * limit;
  const endIdx = startIdx + limit;
  //const pageSlice = afterFull.slice(startIdx, endIdx);

  //console.log(pageSlice);

  const results = afterFull.map((e) => mapEventRow(e, managerView));

  return { count, results };
};

// patch event
const patchEvent = async ( eventId, role, eventData ) => {

  let event;

  if ( role === 'manager' || role === 'superuser' ) {

    event = await prisma.event.update({
      where: { id: Number(eventId) },
      data: eventData,
      select: {
        id : true,
        name: true,
        description: true,
        location: true,
        startTime: true,
        endTime: true,
        capacity: true,
        points: true,
        pointsRemain: true,
        pointsAwarded: true,
        published: true,
      }
    });

  }
  else {

    event = await prisma.event.update({
      where: { id: Number(eventId) },
      data: {
        name: eventData.name,
        description: eventData.description,
        location: eventData.location,
        startTime: eventData.startTime ? new Date(eventData.startTime) : undefined,
        endTime: eventData.endTime ? new Date(eventData.endTime) : undefined,
        capacity: eventData.capacity != null ? eventData.capacity : undefined,
      },
      select: {
        id : true,
        name: true,
        description: true,
        location: true,
        startTime: true,
        endTime: true,
        capacity: true,
      }
    });
  }
  
  const response = {
    id : event.id,
    name: event.name,
    location: event.location,
  }

    if (eventData.description !== undefined && eventData.description !== null)
      response.description = event.description;

    if (eventData.startTime !== undefined && eventData.startTime !== null)
      response.startTime = event.startTime;

    if (eventData.endTime !== undefined && eventData.endTime !== null)
      response.endTime = event.endTime;

    if ("capacity" in eventData)
      response.capacity = event.capacity;

    if (eventData.points !== undefined && eventData.points !== null)
      response.pointsRemain = event.pointsRemain;
      response.pointsAwarded = event.pointsAwarded;

    if (eventData.published !== undefined && eventData.published !== null)
      response.published = event.published;

  return response;
};

const deleteEvent = async ( eventId ) => {
  
  await prisma.event.deleteMany({
    where: { id: Number(eventId) }
  });

  return;
};

// get event based on event id
const getEventById = async ( eventId, utorid, role ) => {

  if ( role === 'manager' || role === 'superuser' || await isOrganizer( eventId, utorid ) ) {

    const event = await prisma.event.findUnique({
      where: { id: Number(eventId) },
      select: {
        id : true,
        name: true,
        location: true,
        description: true,
        startTime: true,
        endTime: true,
        capacity: true,
        organizers: true,
        numGuests: true,
        guests: true,
        pointsRemain: true,
        pointsAwarded: true,
        published: true
      }
    });

    return event;
  }

  const event = await prisma.event.findUnique({
    where: { id: Number(eventId) },
    select: {
      id : true,
      name: true,
      location: true,
      description: true,
      startTime: true,
      endTime: true,
      capacity: true,
      organizers: true,
      numGuests: true,
    }
  });

  return event;
};


const isEventPublished = async ( eventId ) => {
  
  const event = await prisma.event.findUnique({
    where: { id: Number(eventId) },
    select: {
      published: true
    }
  });

  return event != null ? event.published : false;
}

// check if user is guest of event
const isGuest = async ( eventId, utorid ) => {
  
  const event = await prisma.event.findUnique({
    where: { id: Number(eventId) },
    select: {
      guests: {
        where: { utorid: utorid }
      }
    }
  });

  return event?.guests.length > 0; 
};

// add organizer to an event based on event id
const addOrganizer = async ( eventId, utorid ) => {

  const event = await prisma.event.update({
    where: { id: Number(eventId) },
    data: {
      organizers: {
        connect: { utorid: utorid }
      }
    },
    select: {
      id : true,
      name: true,
      location: true,
      organizers: true
    }
  })

  return event;
};

// check if event exists
const eventExists = async ( eventId ) => {
  
  const event = await prisma.event.findUnique({
    where: { id: Number(eventId) },
    select: {
      id: true
    }
  });

  return event !== null; 
};

// check if user is organizer of event
const isOrganizer = async ( eventId, utorid ) => {
  
  const event = await prisma.event.findUnique({
    where: { id: Number(eventId) },
    select: {
      organizers: {
        where: { utorid: utorid }
      }
    }
  });

  return event.organizers.length > 0; 
};

// check if event is over
const isEventOver = async ( eventId ) => {
  const event = await prisma.event.findUnique({
    where: { id: Number(eventId) },
    select: {
      endTime: true
    }
  });
  const now = new Date();
  return event.endTime < now;
}

// remove organizer from an event based on event id and user id
const removeOrganizer = async ( eventId, id ) => {

  await prisma.event.update({
    where: { id: Number(eventId) },
    data: {
      organizers: {
        disconnect: { id }, // removes the relation link
      },
    }
  });

  return;
};


// add guest to event based on the event id
const addGuest = async ( eventId, utorid ) => {

  return prisma.$transaction(async (prisma) => {

    // get user info
    const user = await prisma.user.findUnique({
      where: { utorid: utorid },
      select: {
        id: true,
        utorid: true,
        name: true,
      }
    });

    // update event to add guest
    const event = await prisma.event.update({
      where: { id: Number(eventId) },
      data: {
        guests: {
          connect: { id: Number(user.id) }
        }
      },
    })

    // get updated event with incremented numGuests
    const updatedEvent = await prisma.event.update({
      where: { id: Number(eventId) },
      data: { numGuests: { increment: 1 } },
      select: { id: true, 
                name: true, 
                location: true, 
                numGuests: true 
              },
    });

    return { ...updatedEvent, guestAdded: user  };

  });

  
};

//remove guest from event based on the event id
const removeGuest = async ( eventId, id ) => {

  await prisma.event.update({
    where: { id: Number(eventId) },
    data: {
      guests: {
        disconnect: { id }, // removes the relation link
      },
    }
  });

  return;
};

const isEventFull = async ( eventId ) => {
  
  const event = await prisma.event.findUnique({
    where: { id: Number(eventId) },
    select: {
      capacity: true,
      _count: {
        select: { guests: true }
      }
    }
  });

  if ( event.capacity == null ) {
    return false;
  }

  return event._count.guests >= event.capacity;
};

// create new reward transaction event, note that utorid is the logged in user creating the transaction
const createRewardTransactionEvent = async ( eventId, transactionData, utorid ) => {

  const amount = transactionData.amount;

  // if payload utorid is null, divide points to all guests
  if ( transactionData.utorid == null) {

    const guests = await prisma.event.findUnique({
      where: { id: Number(eventId) },
      select: {
        guests: true
      }
    });

    // const awarded = Math.floor(amount / guests.guests.length);
    const awarded = Math.floor(amount);

    const responses = [];

    for ( const guest of guests.guests ) {
      const res = await createRewardTransaction( eventId, transactionData, utorid, amount, guest, awarded );
      responses.push(res);
    }

    return responses;
  }

  const guest = await prisma.user.findUnique({
    where: { utorid: transactionData.utorid }
  });

  const response = await createRewardTransaction( eventId, transactionData, utorid, amount, guest, amount );

  return response;

};

const createRewardTransaction = async ( eventId, transactionData, creator, amount, guest, awarded ) => {

  const transaction = await prisma.$transaction(async (prisma) => {
      
        const created = await prisma.transaction.create({
          data: {
            utorid: guest.utorid,
            relatedId: Number(eventId),
            amount: amount,
            type: transactionData.type,
            remark: transactionData.remark,
            awarded: awarded,
            author: {
              connect: { utorid: creator }
            }
          },
          select: {
            id: true,
            utorid: true,
            relatedId: true,
            awarded: true,
            type: true,
            relatedId: true,
            remark: true,
            createdBy: true,
          }
        });

        // decrement pointsRemain in event
        await prisma.event.update({
          where: { id: Number(eventId) },
          data: {
            pointsRemain: { decrement: awarded },
            pointsAwarded: { increment: awarded }
          }
        });

        // add to users points
        await prisma.user.update({
          where: { utorid: guest.utorid },
          data: {
            points: { increment: awarded }
          }
        });

        return created;
    });

    const response = {
      id: transaction.id,
      recipient: transaction.utorid,
      awarded: transaction.awarded,
      type: transaction.type,
      relatedId: transaction.relatedId,
      remark: transaction.remark,
      createdBy: transaction.createdBy,
    }

    return response;
};

const getRemainingPoints = async ( eventId ) => {
  const event = await prisma.event.findUnique({
    where: { id: Number(eventId) },
    select: {
      pointsRemain: true
    }
  });
  
  return event.pointsRemain;
};

const getPointsAwarded = async ( eventId ) => {
  const event = await prisma.event.findUnique({
    where: { id: Number(eventId) },
    select: {
      pointsAwarded: true
    }
  });

  return event.pointsAwarded
}


module.exports = {
  createEvent,
  getEvents,
  patchEvent,
  deleteEvent,
  addOrganizer,
  removeOrganizer,
  addGuest,
  removeGuest,
  getEventById,
  createRewardTransactionEvent,
  isGuest,
  isEventOver, 
  isOrganizer,
  isEventPublished,
  eventExists,
  isEventFull,
  getRemainingPoints,
  getPointsAwarded
}