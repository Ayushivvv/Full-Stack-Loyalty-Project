// one single container with infromation about the event
import { deleteEvent } from '../../api/eventsApi';
import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const isGuestOfEvent = (event, guest) => {
    if (!guest) return false;
    if (!event?.guests) return false;

    if (Array.isArray(event.guests)) return event.guests.includes(guest);
    if (event.guests instanceof Set) return event.guests.has(guest);

    return false;
};

export const isOrganizerOfEvent = (event, organizer) => {
    if (!organizer) return false;
    if (!event?.organizer) return false;

    if (typeof event.organizer === 'string') return event.organizer === organizer;
    if (Array.isArray(event.organizer)) return event.organizer.includes(organizer);
    if (event.organizer instanceof Set) return event.organizer.has(organizer);

    return false;
};


const theme = {
    fontPrimary: 'Poppins, sans-serif',
    pinkMain: '#d63384',
    pinkLight: '#f06292',
    pinkBg: '#ffe6f2',
    pinkPaper: '#fff0f7',
    pinkBorder: '#ffc2d6',
    textDark: '#1f2937',
    textPink: '#d63384',
    statusGreen: '#059669',
    statusYellow: '#f59e0b',
    statusRed: '#dc2626',
    statusDarkRed: '#991b1b',
};

const formatEventTime = (startTime, endTime) => {
    const start = new Date(startTime);
    const end = new Date(endTime);

    const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    const timeOptions = { hour: 'numeric', minute: '2-digit' };

    const date = start.toLocaleDateString('en-US', dateOptions);
    const startTimeStr = start.toLocaleTimeString('en-US', timeOptions);
    const endTimeStr = end.toLocaleTimeString('en-US', timeOptions);

    return `${date} | ${startTimeStr} - ${endTimeStr}`;
};

const checkEventStatus = (event) => {
    const now = Date.now();
    const start = new Date(event.startTime).getTime();
    const end = new Date(event.endTime).getTime();

    const isEnded = now > end;
    const isStarted = now >= start && now <= end;
    const isFull = event.capacity && event.numGuests >= event.capacity;

    return { isEnded, isStarted, isFull };
};

const filterEventSingle = (event, filters) => {
    if (!filters || Object.keys(filters).length === 0) return true;

    const now = new Date();

    if (filters.eventName && !event.name.toLowerCase().includes(filters.eventName.toLowerCase()))
        return false;

    if (filters.organizerName && event.organizer && !event.organizer.toLowerCase().includes(filters.organizerName.toLowerCase()))
        return false;

    if (filters.status && filters.status !== 'all') {
        const startTime = new Date(event.startTime);
        const endTime = new Date(event.endTime);

        const { isEnded, isStarted } = checkEventStatus(event);
        const isInProgress = startTime <= now && endTime >= now;

        if (filters.status === 'started' && !isInProgress) return false;
        if (filters.status === 'upcoming' && !isStarted) return false;
        if (filters.status === 'Finished' && !isEnded) return false;
    }

    if (filters.published && filters.published !== 'all') {
        const isPublished = event.published === true;
        if (filters.published === 'published' && !isPublished) return false;
        if (filters.published === 'unpublished' && isPublished) return false;
    }

    return true;
};



const FilteredEventCard = ({ event, event, filtered = {} }) => {
    const navigate = useNavigate();
    const [isConfirming, setIsConfirming] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);

    // Apply your existing filter logic next
    const isVisible = filterEventSingle(event, filtered);
    if (!isVisible) return null;


    const {
        id,
        name,
        location,
        startTime,
        endTime,
        capacity,
        numGuests,
        published
    } = event;

    const { isEnded, isStarted, isFull } = checkEventStatus(event);
    // Treat event organizers as manager+ for this event
    const isManagerOrHigher = ['manager', 'superuser'].includes(userRole) || !!userIsOrganizer;
    const formattedTime = formatEventTime(startTime, endTime);

    let statusText;
    let statusStyle;

    if (isEnded) {
        statusText = 'ENDED';
        statusStyle = styles.statusEnded;
    } else if (isStarted) {
        statusText = 'STARTED';
        statusStyle = styles.statusStarted;
    } else {
        if (isFull) {
            statusText = 'EVENT IS FULL';
            statusStyle = styles.capacityFull;
        } else {
            statusText = 'SPOTS AVAILABLE';
            statusStyle = styles.capacityAvailable;
        }
    }

    const handleCardClick = () => navigate(`/events/${id}`);
    const handleRelocateClick = () => window.location.reload();

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        setMessage('');
        setIsConfirming(true);
    };

    const handleConfirmDelete = async (e) => {
        e.stopPropagation();
        setIsDeleting(true);
        setMessage('');
        setIsSuccess(false);

        if (id) {
            try {
                await deleteEvent(id);
                setMessage(`Event ${id} deleted successfully.`);
                setIsSuccess(true);
                setIsConfirming(false);
                handleRelocateClick();
            } catch (error) {
                setMessage(`Deletion failed: ${error.message}`);
                setIsSuccess(false);
            } finally {
                setIsDeleting(false);
            }
        } else {
            setMessage("Deletion failed: Event ID is missing.");
            setIsDeleting(false);
        }
    };

    const handleCancelDelete = (e) => {
        e.stopPropagation();
        setIsConfirming(false);
        setMessage('');
    };

    return (
        <div
            className="single-event-card"
            onClick={handleCardClick}
            style={styles.card}
        >

            {isConfirming && (
                <div style={styles.confirmationOverlay} onClick={(e) => e.stopPropagation()}>
                    <p style={{ margin: 0, fontWeight: '600', color: theme.textDark }}>
                        Confirm deletion of "{name}"?
                    </p>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                        <button onClick={handleConfirmDelete} style={styles.confirmButton}>
                            Yes, Delete
                        </button>
                        <button onClick={handleCancelDelete} style={styles.cancelButton}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            <div style={styles.header}>
                <h3 style={styles.name}>{name}</h3>

                {isManagerOrHigher && (
                    <span style={published ? styles.statusPublished : styles.statusUnpublished}>
                        {published ? 'PUBLISHED' : 'UNPUBLISHED'}
                    </span>
                )}
            </div>

            {isManagerOrHigher && (
                <button
                    onClick={handleDeleteClick}
                    style={styles.deleteButton}
                    title="Delete Event"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor">
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                    </svg>
                </button>
            )}

            <div style={styles.details}>
                <p style={styles.detailItem}>Location: {location}</p>
                <p style={styles.detailItem}>Time: {formattedTime}</p>
                <p style={styles.detailItem}>Capacity: {capacity === null ? '∞' : capacity}</p>
            </div>

            <div style={styles.footer}>
                <span style={statusStyle}>{statusText}</span>

                <button
                    onClick={(e) => { e.stopPropagation(); handleCardClick(); }}
                    style={isEnded ? styles.buttonEnded : styles.buttonActive}
                >
                    {isEnded ? 'View Details' : 'View / Register'}
                </button>
            </div>
        </div>
    );
};

export default FilteredEventCard;


const styles = {
    card: {
        backgroundColor: theme.pinkPaper,
        padding: '1.5rem',
        borderRadius: '0.75rem',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        borderLeft: `4px solid ${theme.pinkMain}`,
        cursor: 'pointer',
        maxWidth: '400px',
        minWidth: '300px',
        margin: '1rem auto',
        fontFamily: theme.fontPrimary,
        transition: 'transform 0.2s ease-in-out',
        position: 'relative',
    },
    confirmationOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: '0.75rem',
        padding: '1rem',
        textAlign: 'center',
        border: `3px solid ${theme.statusRed}`
    },
    confirmButton: {
        padding: '0.5rem 1rem',
        backgroundColor: theme.statusRed,
        color: 'white',
        fontWeight: '600',
        borderRadius: '0.5rem',
        border: 'none',
        cursor: 'pointer',
    },
    cancelButton: {
        padding: '0.5rem 1rem',
        backgroundColor: '#f4f4f4',
        color: theme.textDark,
        fontWeight: '600',
        borderRadius: '0.5rem',
        border: '1px solid #ccc',
        cursor: 'pointer',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottom: `1px solid ${theme.pinkBorder}`,
        paddingBottom: '0.5rem',
    },
    name: {
        fontSize: '1.25rem',
        fontWeight: '700',
        color: theme.textPink,
        margin: 0,
        maxWidth: '70%',
    },
    statusPublished: {
        fontSize: '0.75rem',
        fontWeight: '600',
        padding: '0.3rem 0.6rem',
        borderRadius: '0.5rem',
        backgroundColor: '#d1fae5',
        color: theme.statusGreen,
    },
    statusUnpublished: {
        fontSize: '0.75rem',
        fontWeight: '600',
        padding: '0.3rem 0.6rem',
        borderRadius: '0.5rem',
        backgroundColor: '#fffbeb',
        color: theme.statusYellow,
    },
    deleteButton: {
        background: 'none',
        border: 'none',
        padding: '0.25rem',
        cursor: 'pointer',
        color: theme.statusRed,
    },
    details: {
        fontSize: '0.875rem',
        color: theme.textDark,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.3rem',
    },
    detailItem: { margin: 0 },
    footer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '0.75rem',
        borderTop: `1px solid ${theme.pinkBorder}`,
    },
    statusEnded: {
        fontWeight: '700',
        color: theme.statusRed,
        backgroundColor: '#fef2f2',
        padding: '0.3rem 0.6rem',
        borderRadius: '0.5rem',
        fontSize: '0.75rem',
    },
    statusStarted: {
        fontWeight: '700',
        color: theme.statusYellow,
        backgroundColor: '#fffbeb',
        padding: '0.3rem 0.6rem',
        borderRadius: '0.5rem',
        fontSize: '0.75rem',
    },
    capacityFull: {
        fontWeight: '700',
        color: theme.statusDarkRed,
        backgroundColor: '#fee2e2',
        padding: '0.3rem 0.6rem',
        borderRadius: '0.5rem',
        fontSize: '0.75rem',
    },
    capacityAvailable: {
        fontWeight: '700',
        color: theme.statusGreen,
        backgroundColor: '#d1fae5',
        padding: '0.3rem 0.6rem',
        borderRadius: '0.5rem',
        fontSize: '0.75rem',
    },
    buttonActive: {
        padding: '0.5rem 1rem',
        backgroundColor: theme.pinkMain,
        color: 'white',
        fontWeight: '600',
        borderRadius: '0.5rem',
        border: 'none',
        cursor: 'pointer',
    },
    buttonEnded: {
        padding: '0.5rem 1rem',
        backgroundColor: '#f4f4f4',
        color: '#6b7280',
        fontWeight: '600',
        borderRadius: '0.5rem',
        border: '1px solid #e5e7eb',
        cursor: 'default',
    }
};
