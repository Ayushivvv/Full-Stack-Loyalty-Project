// one single container with infromation about the event
import { deleteEvent } from '../../api/eventsApi';
import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const theme = {
    fontPrimary: 'Poppins, sans-serif',
    pinkMain: '#d63384',          // primary pink
    pinkLight: '#f06292',         // accents / focus states
    pinkBg: '#ffe6f2',            // page background
    pinkPaper: '#fff0f7',         // cards, surfaces
    pinkBorder: '#ffc2d6',
    textDark: '#1f2937',          // deep gray for main text
    textPink: '#d63384',

    // Semantic Status Colors (kept distinct from pink for clarity)
    statusGreen: '#059669', // Available
    statusYellow: '#f59e0b', // Started
    statusRed: '#dc2626', // Ended
    statusDarkRed: '#991b1b', // Full
};

// Function to format the start and end times
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
    // If no filters are provided, the event is visible by default
    if (!filters || Object.keys(filters).length === 0) {
        return true;
    }

    const now = new Date();

    // Event Name Filter
    if (filters.eventName && !event.name.toLowerCase().includes(filters.eventName.toLowerCase())) {
        return false;
    }

    // Organizer Name Filter
    if (filters.organizerName && event.organizer && !event.organizer.toLowerCase().includes(filters.organizerName.toLowerCase())) {
        return false;
    }

    // Status Filter ('upcoming', 'started', 'ended', 'all')
    if (filters.status && filters.status !== 'all') {
        const startTime = new Date(event.startTime);
        const endTime = new Date(event.endTime);

        const isFinished = checkEventStatus(event).isEnded;
        const isUpcoming = checkEventStatus(event).isStarted; //startTime > now;
        const isInProgress = startTime <= now && endTime >= now;

        if (filters.status === 'started' && !isInProgress) return false;
        if (filters.status === 'upcoming' && !isUpcoming) return false;

        if (filters.status === 'Finished' && !isFinished) return false;
    }

    // Published Status Filter ('published', 'unpublished', 'all')
    if (filters.published && filters.published !== 'all') {
        const isPublished = event.published === true;
        if (filters.published === 'published' && !isPublished) return false;
        if (filters.published === 'unpublished' && isPublished) return false;
    }

    // If all filters pass, return true (visible)
    return true;
};



const SingleEventCard = ({ event, userRole, filtered = {} }) => {
    const navigate = useNavigate();

    const [isConfirming, setIsConfirming] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false); // State to manage loading/disabling
    const [message, setMessage] = useState(''); // State for success/error messages
    const [isSuccess, setIsSuccess] = useState(false);

    const isVisible = filterEventSingle(event, filtered);

    // If the event does not pass the filter criteria, return null (do not render)
    if (!isVisible) {
        return null;
    }

    // CRITICAL: Destructure 'id' for use in the API call
    const {
        id, // This is the variable name you need to use
        name,
        location,
        startTime,
        endTime,
        capacity,
        numGuests,
        published
    } = event;

    const { isEnded, isStarted, isFull } = checkEventStatus(event);

    const isManagerOrHigher = ['manager', 'superuser', 'organizer'].includes(userRole);
    const formattedTime = formatEventTime(startTime, endTime);

    // Initialize status variables
    let statusText;
    let statusStyle;

    // --- PRIORITY STATUS LOGIC ---
    if (isEnded) {
        // Priority 1: Event has ended (Red)
        statusText = 'ENDED';
        statusStyle = styles.statusEnded;
    } else if (isStarted) {
        // Priority 2: Event is currently running (Yellow)
        statusText = 'STARTED';
        statusStyle = styles.statusStarted;
    } else {
        // Priority 3: Event is upcoming (check capacity)
        if (isFull) {
            statusText = 'EVENT IS FULL';
            statusStyle = styles.capacityFull;
        } else {
            statusText = 'SPOTS AVAILABLE';
            statusStyle = styles.capacityAvailable;
        }
    }
    // --- END PRIORITY STATUS LOGIC ---


    const handleCardClick = () => {
        // Navigates to the detail page using the route defined in App.js: /events/:eventId
        navigate(`/events/${id}`);
    };

    const handleRelocateClick = () => {
        // Reload the page to refresh the events list after deletion
        window.location.reload();
    }

    // Function to trigger the confirmation modal
    const handleDeleteClick = (e) => {
        e.stopPropagation(); // Prevent navigation
        // Reset any previous messages when opening confirmation
        setMessage(''); 
        setIsConfirming(true); // Open confirmation UI
    };

    const handleConfirmDelete = async (e) => {
        e.stopPropagation(); // Prevent navigation
        setIsDeleting(true);
        setMessage('');
        setIsSuccess(false);

        // Check if event ID exists before proceeding
        if (id) {
            try {
                // FIX: Pass the destructured 'id' variable, not the undefined 'eventId'
                await deleteEvent(id); 
                setMessage(`Event ${id} deleted successfully.`);
                setIsSuccess(true);
                setIsConfirming(false); // Close confirmation modal on success
                // NOTE: In a real app, you would likely trigger a re-fetch of the event list 
                // or remove this card from the local state here.
                handleRelocateClick(); // Navigate back to events list after deletion
                console.log(`Event ${id} deleted successfully.`);
                
            } catch (error) {
                // This catches the specific error message thrown by apiCall 
                // after receiving a 400 or 500 status.
                setMessage(`Deletion failed: ${error.message}`);
                setIsSuccess(false);
            } finally {
                 // FIX: Ensure loading state is turned off regardless of success or failure
                 setIsDeleting(false);
            }
        } else {
            console.error("Cannot delete event: ID is missing.");
            setMessage("Deletion failed: Event ID is missing.");
            setIsDeleting(false);
        }
    };

    const handleCancelDelete = (e) => {
        e.stopPropagation(); // Prevent navigation
        setIsConfirming(false); // Close confirmation UI
        setMessage(''); // Clear message if user cancels
    };

        return (
            <div
                className="single-event-card"
                onClick={handleCardClick}
                style={styles.card}
            >

                {isConfirming && (
                    <div style={styles.confirmationOverlay} onClick={(e) => e.stopPropagation()}>
                        <p style={{ margin: 0, fontWeight: '600', color: theme.textDark }}>Confirm deletion of "{name}"?</p>
                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                            <button
                                onClick={handleConfirmDelete}
                                style={styles.confirmButton}
                            >
                                Yes, Delete
                            </button>
                            <button
                                onClick={handleCancelDelete}
                                style={styles.cancelButton}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* NAME and PUBLISHED */}
                <div style={styles.header}>
                    <h3 style={styles.name}>{name}</h3>

                    {/* Managers Only and higher */}
                    {isManagerOrHigher && (
                        <span
                            style={published ? styles.statusPublished : styles.statusUnpublished}
                        >
                            {published ? 'PUBLISHED' : 'UNPUBLISHED'}
                        </span>

                    )}
                </div>


                {/* Delete Button (Manager/Superuser only) - MISSING in previous attempt, now fixed */}
                {isManagerOrHigher && (
                    <button
                        onClick={handleDeleteClick} // Calls the function to show confirmation
                        style={styles.deleteButton}
                        title="Delete Event"
                        aria-label="Delete Event"
                    >
                        {/* Solid red X icon (SVG) */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                        </svg>
                    </button>
                )}


                {/* LOCATION and TIME */}
                <div style={styles.details}>
                    <p style={styles.detailItem}>Location: {location}</p>
                    <p style={styles.detailItem}>Time: {formattedTime}</p>
                    <p style={styles.detailItem}>Capacity: {capacity === null ? '∞' : capacity}</p>
                </div>

                {/* CAPACITY STATUS and Action Button */}
                <div style={styles.footer}>
                    {/* Status Badge uses the dynamically calculated style and text */}
                    <span style={statusStyle}>
                        {statusText}
                    </span>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCardClick();
                        }}
                        // Disable the button if the event has ended
                        style={isEnded ? styles.buttonEnded : styles.buttonActive}
                    // disabled={isEnded}
                    >
                        {isEnded ? 'View Details' : 'View / Register'}
                    </button>
                </div>
            </div>
        );
    };

    export default SingleEventCard;


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

    
    const styles = {
        // Card container styling
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
            position: 'relative', // Needed for confirmation overlay
            // Hover effect for better UX
            '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
            }
        },
        // Overlay for confirmation
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
            transition: 'background-color 0.2s',
            '&:hover': {
                backgroundColor: theme.statusDarkRed,
            }
        },
        cancelButton: {
            padding: '0.5rem 1rem',
            backgroundColor: '#f4f4f4',
            color: theme.textDark,
            fontWeight: '600',
            borderRadius: '0.5rem',
            border: '1px solid #ccc',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            '&:hover': {
                backgroundColor: '#e0e0e0',
            }
        },
        header: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: `1px solid ${theme.pinkBorder}`,
            paddingBottom: '0.5rem',
        },
        headerRight: {
            display: 'flex',
            gap: '0.5rem',
            alignItems: 'center',
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
            whiteSpace: 'nowrap',
        },
        statusUnpublished: {
            fontSize: '0.75rem',
            fontWeight: '600',
            padding: '0.3rem 0.6rem',
            borderRadius: '0.5rem',
            backgroundColor: '#fffbeb',
            color: theme.statusYellow,
            whiteSpace: 'nowrap',
        },
        deleteButton: {
            background: 'none',
            border: 'none',
            padding: '0.25rem',
            cursor: 'pointer',
            color: theme.statusRed, // Solid red X
            transition: 'color 0.2s, transform 0.1s',
            '&:hover': {
                color: theme.statusDarkRed,
                transform: 'scale(1.1)',
            }
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
            transition: 'background-color 0.2s, transform 0.1s',
            boxShadow: `0 4px 8px ${theme.pinkLight}40`,
            zIndex: 5, // Keep button above standard card click area
        },
        buttonEnded: {
            padding: '0.5rem 1rem',
            backgroundColor: '#f4f4f4',
            color: '#6b7280',
            fontWeight: '600',
            borderRadius: '0.5rem',
            border: '1px solid #e5e7eb',
            boxShadow: 'none',
            cursor: 'default',
            zIndex: 5,
        }
    };
