import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import EventPoints from '../../components/events/EventPoints';

function ManagerEventPointsPage({ allUsers, executeTransaction }) {
    const { eventId } = useParams();

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Award Points for Event ID: {eventId}</h1>
            <EventPoints allUsers={allUsers} executeTransaction={executeTransaction} />
        </div>
    );
}

export default ManagerEventPointsPage;