import SingleEventCard from "../../components/events/SingleEvent";
import { getEvents, getEventById } from "../../api/eventsApi";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";


const MyEventList = ({ userMode}) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const { user, loading: authLoading, currentMode } = useAuth();
    
    const isLoading = loading || authLoading;

    const loadEvents = useCallback(async () => {
        // if (authLoading || !user) {
        //     if (!authLoading) setLoading(false);
        //     return;
        // }

        setLoading(true);
        setError(null);

        try {
            const initialData = await getEvents();

            // Extract IDs from the response structure
            const allEventIds = (initialData?.results ?? (Array.isArray(initialData) ? initialData : []))
                .map(event => event.id)
                .filter(id => id !== undefined);

            if (allEventIds.length === 0) {
                setEvents([]);
                setLoading(false);
                return;
            }

            console.log("THE IDS:", allEventIds);

            // 2. Fetch full management details for ALL event IDs (using the privileged API call).
            const detailedEventsPromises = allEventIds.map(eventId =>
                getEventById(eventId)
            );

            console.log("All events", detailedEventsPromises)

            // Fetch all details in parallel
            const allDetailedEvents = await Promise.all(detailedEventsPromises);

            console.log("the detailed events", allDetailedEvents)

            // 3. Filter the detailed events to find which ones the current user organizes.
            const guestEvents = allDetailedEvents.filter(event => {

                // Use .some() to check if AT LEAST ONE organizer matches the current user
                return event.guests?.some(guest => {
                    if (!guest) return false;
                    if (!user) return false;

                    const guestUtorid = guest.utorid;
                    const guestId = guest.id;

                    return guestUtorid === user.utorid || guestId === user.id;
                });

            });
            console.log(guestEvents)
            setEvents(guestEvents);

        } catch (err) {
            console.error("Failed to load events:", err);
            setError(err.message || "Could not retrieve the event list.");
        } finally {
            setLoading(false);
        }
    }, [user, authLoading]);
    
    useEffect(() => {
        loadEvents();
    }, [loadEvents]); 

    
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
        <div style={layoutStyles.eventGrid}>
            {events.map((event) => (
                <SingleEventCard
                    key={event.id}
                    event={event}
                    userRole={currentMode}
                    filtered={events}
                />
            ))}
        </div>

    );
};

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


export default MyEventList;