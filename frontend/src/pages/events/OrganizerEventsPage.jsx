import OrganizerMyEventList from "../../components/events/OrganizerMyEventList";
import { useAuth } from "../../context/AuthContext";


const OrganizerEventsPage = () => {

    const { currentMode } = useAuth();

    console.log("Current currentMode MAin:", currentMode, "Mode:", currentMode);

    return (
        <div>

            <header>
                <h1>My Events</h1>
                <p >You are an Organizer for the following Events!</p>

            </header>

            <main>
                {/* Pass the applied filters down to the list component */}
                <OrganizerMyEventList />
            </main>
        </div>
    );
};

export default OrganizerEventsPage;