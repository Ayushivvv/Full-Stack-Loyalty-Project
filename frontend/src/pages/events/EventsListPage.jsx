import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AllEventList from "../../components/events/AllEvents";
import { getEvents } from "../../api/eventsApi";
import { useAuth } from "../../context/AuthContext";
import {
    Box,
    Typography,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Button,
    Stack
} from "@mui/material";

function extractEvents(obj) {
    if (!obj) return [];
    if (Array.isArray(obj)) return obj;

    if (Array.isArray(obj.events)) return obj.events;
    if (Array.isArray(obj.data?.events)) return obj.data.events;
    if (Array.isArray(obj.results)) return obj.results;
    if (Array.isArray(obj.items)) return obj.items;

    const values = Object.values(obj);
    if (values.length && values.some(v => v && (v.id || v.name || v.location))) {
        return values;
    }

    return [];
}

const AllEventsPage = () => {
    const initialFilters = {
        eventName: '',
        organizerName: '',
        status: 'all', // 'all', 'started', 'notStarted', Finished
        location: 'All Locations',
        published: 'published', // 'all', 'published', 'unpublished'
    };

    const [filters, setFilters] = useState(initialFilters);
    const [appliedFilters, setAppliedFilters] = useState(initialFilters);
    const [uniqueLocations, setUniqueLocations] = useState(['All Locations']);
    const { currentMode } = useAuth();

    const navigate = useNavigate();
    const isManagerOrHigher = useMemo(() => currentMode === 'manager' || currentMode === 'superuser', [currentMode]);

    useEffect(() => {
        const fetchLocations = async () => {
            const locationsSet = new Array();
            locationsSet.push('All Locations');
            try {
                const eventsObject = await getEvents();

                const events = extractEvents(eventsObject);
                const locationsSet = Array.from(
                    new Set(
                        events
                            .map(ev => ev?.location?.trim())
                            .filter(Boolean) // remove null/undefined/empty strings
                    )
                );

                if (!locationsSet.includes('All Locations')) {
                    locationsSet.unshift('All Locations');
                }

                const locations = Array.from(locationsSet);

                //console.log("lllllllLocations fetched and processed:", locationsSet, locations);

                setUniqueLocations(locations);

            } catch (error) {
                console.error("Error fetching unique locations:", error);
            }
        };

        fetchLocations();
    }, []);


    const handleFilterChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFilters(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    // Handler for the main Apply Filters button
    const handleApplyFilters = () => {
        // Apply the current state of filters to the state that AllEventList reads
        setAppliedFilters(filters);
        console.log("Applied Filters:", filters);
    };

    // Handler for the Reset Filters button
    const handleResetFilters = () => {
        setFilters(initialFilters);
        setAppliedFilters(initialFilters);
    };



    return (
        <Box p={4}>
            <Box mb={3}>
                <Typography variant="h4" gutterBottom>
                    Upcoming Events
                </Typography>
                <Typography variant="body1">
                    Find events and register to attend.
                </Typography>
            </Box>

            {isManagerOrHigher && (
                <Box mb={4} p={2} border={1} borderColor="grey.300" borderRadius={2} sx={{ backgroundColor: 'white' }}>
                    <Typography variant="h6" gutterBottom>
                        Filter Events
                    </Typography>

                    <Stack spacing={2}>
                        <TextField
                            label="Event Name"
                            name="eventName"
                            value={filters.eventName}
                            onChange={handleFilterChange}
                            placeholder="Search by event title"
                            fullWidth
                        />

                        {/* Location Dropdown */}
                        <FormControl fullWidth>
                            <InputLabel id="location-label">Location</InputLabel>
                            <Select
                                labelId="location-label"
                                name="location"
                                value={filters.location}
                                onChange={handleFilterChange}
                                label="Location"
                            >
                                {uniqueLocations.map(loc => (
                                    <MenuItem key={loc} value={loc}>{loc}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Status Radio Buttons */}
                        <FormControl component="fieldset">
                            <Typography variant="subtitle1" gutterBottom>
                                Event Status
                            </Typography>
                            <RadioGroup
                                row
                                name="status"
                                value={filters.status}
                                onChange={handleFilterChange}
                            >
                                <FormControlLabel value="all" control={<Radio
                                    sx={{
                                        '&.Mui-checked': {
                                            color: '#f06292', // Your desired hex color
                                        },
                                    }}
                                />} label="All" />
                                <FormControlLabel value="started" control={<Radio
                                sx={{
                                        '&.Mui-checked': {
                                            color: '#f06292', // Your desired hex color
                                        },
                                    }} />} label="Started" />
                                <FormControlLabel value="notStarted" control={<Radio
                                sx={{
                                        '&.Mui-checked': {
                                            color: '#f06292', // Your desired hex color
                                        },
                                    }} />} label="Upcoming" />
                                <FormControlLabel value="Finished" control={<Radio
                                sx={{
                                        '&.Mui-checked': {
                                            color: '#f06292', // Your desired hex color
                                        },
                                    }} />} label="Finished" />
                            </RadioGroup>
                        </FormControl>

                        {/* Published Status */}
                        <FormControl component="fieldset">
                            <Typography variant="subtitle1" gutterBottom>
                                Published Status
                            </Typography>
                            <RadioGroup
                                row
                                name="published"
                                value={filters.published}
                                onChange={handleFilterChange}
                            >
                                <FormControlLabel value="all" control={<Radio
                                sx={{
                                        '&.Mui-checked': {
                                            color: '#f06292', // Your desired hex color
                                        },
                                    }} />} label="All" />
                                <FormControlLabel value="published" control={<Radio
                                sx={{
                                        '&.Mui-checked': {
                                            color: '#f06292', // Your desired hex color
                                        },
                                    }} />} label="Published" />
                                <FormControlLabel value="unpublished" control={<Radio
                                sx={{
                                        '&.Mui-checked': {
                                            color: '#f06292', // Your desired hex color
                                        },
                                    }} />} label="Unpublished" />
                            </RadioGroup>
                        </FormControl>

                        {/* Action Buttons */}
                        <Stack direction="row" spacing={2}>
                            <Button variant="outlined" onClick={handleResetFilters} style={{ color: '#f06292', borderColor: '#f06292' }}>Reset</Button>
                            <Button variant="contained" onClick={handleApplyFilters} style={{backgroundColor: '#f06292' }}>Apply Filters</Button>
                        </Stack>
                    </Stack>
                </Box>
            )}

            <Box>
                <AllEventList filters={appliedFilters} />
            </Box>
        </Box>
    );
};

export default AllEventsPage;
