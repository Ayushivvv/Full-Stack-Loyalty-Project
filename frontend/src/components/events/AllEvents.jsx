// fetch all the events

import { Box } from "@mui/material";
import TablePagination from "@mui/material/TablePagination";

import React, { useState, useEffect, useCallback } from 'react';
import SingleEventCard from './SingleEvent';
import { getEvents } from '../../api/eventsApi';
import { useAuth } from '../../context/AuthContext';


const filterEvents = (events, filters) => {
    const now = new Date();

    return events.filter(event => {

        if (filters.eventName && !event.name.toLowerCase().includes(filters.eventName.toLowerCase())) {
            return false;
        }

        if (filters.organizerName && !event.organizer.toLowerCase().includes(filters.organizerName.toLowerCase())) {
            return false;
        }

        if (filters.location !== 'All Locations' && event.location !== filters.location) {
            return false;
        }

        if (filters.status !== 'all') {
            const startTime = new Date(event.startTime);
            const endTime = new Date(event.endTime);

            const isFinished = endTime < now;
            const isUpcoming = startTime > now;
            const isInProgress = startTime <= now && endTime >= now;

            if (filters.status === 'started') {
                // 'Started' now only refers to 'In Progress'
                if (!isInProgress) return false;
            }

            if (filters.status === 'notStarted') {
                // 'notStarted' refers to 'Upcoming'
                if (!isUpcoming) return false;
            }

            if (filters.status === 'Finished') {
                // 'ended' status to 'Finished'
                if (!isFinished) return false;
            }
        }

        if (filters.published !== 'all') {
            const isPublished = event.published === true;
            if (filters.published === 'published' && !isPublished) {
                return false;
            }
            if (filters.published === 'unpublished' && isPublished) {
                return false;
            }
        }

        return true;
    });
};



const AllEventList = ({ filters }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const { currentMode, loading: authLoading } = useAuth();

    const isLoading = loading || authLoading;

    const [page, setPage] = useState(0);     // MUI uses 0-indexed
    const [limit, setLimit] = useState(10);  // backend default
    const [totalCount, setTotalCount] = useState(0);


    const loadEvents = useCallback(async () => {
        if (authLoading) return;

        setLoading(true);
        setError(null);

        try {
            const data = await getEvents();

            console.log("fetched events", data);
            // Normalize to an array: prefer data.results, fall back to array-shaped responses
            const rawEvents = Array.isArray(data?.results) ? data.results : [];
            
            console.log("raw events", rawEvents);

            // Managers/superusers can apply the filter UI
            if (currentMode === 'manager' || currentMode === 'superuser') {
                const filteredEvents = filterEvents(rawEvents, filters);
                setEvents(filteredEvents);
            } else {
                // Non-managers (regular users) should only see published events
                const publishedEvents = rawEvents.filter(event => event.published === true);
                setEvents(publishedEvents);
                // setEvents(rawEvents)
            }


        } catch (err) {
            console.error("Failed to load events:", err);
            setError(err.message || "Could not retrieve the event list.");
        } finally {
            setLoading(false);
        }
    }, [ filters, currentMode, authLoading]);

    useEffect(() => {
        loadEvents();
    }, [loadEvents, filters]);

    
    if (isLoading) {
        return (
            <div>
                <p>Loading events...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <p className="font-bold">Error:</p> {error}
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div>
                <p>No events found matching your criteria.</p>
            </div>
        );
    }
    return (
        <>
            <div style={layoutStyles.eventGrid}>
                {events.map((event) => (
                    <SingleEventCard
                        key={event.id}
                        event={event}
                        userRole={currentMode}
                        filtered={filters}
                    />
                ))}
            </div>
        </>
    )
};

export default AllEventList;

const layoutStyles = {
    eventGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem',
        width: '100%',
        padding: '1rem 0',

        // Center the grid on large displays
        maxWidth: '1400px',
        margin: '0 auto',

        // Smooth responsiveness
        transition: 'grid-template-columns 0.2s ease-in-out',
    },
};
