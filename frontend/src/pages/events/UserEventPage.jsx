import MyEventList from "../../components/events/MyEventList";
import { useMemo} from "react";
import { useAuth } from "../../context/AuthContext";


const UserEventsPage = () => {

    const { currentMode } = useAuth();

    console.log("Current currentMode MAin:", currentMode, "Mode:", currentMode);

    return (
        <div>

            <header>
                <h1>My Events</h1>
                <p >Find events you are RSVP to!</p>

            </header>

            <main>
                {/* Pass the applied filters down to the list component */}
                <MyEventList />
            </main>
        </div>
    );
};

export default UserEventsPage;