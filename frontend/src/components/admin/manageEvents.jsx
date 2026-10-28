import React, { useCallback, useEffect, useState } from 'react';
import API from '../../services/api';
import { useParams } from "react-router-dom";
const ManageEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingEventId, setUpdatingEventId] = useState(null);
  const [statusError, setStatusError] = useState('');
  const { clubId } = useParams();

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await API.get(`/clubs/${clubId}/manageevents`);
      setEvents(response.data);
      
    } catch (error) {
      setError('Failed to fetch events');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }, [clubId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);


 const deleteEvent = async (id) => {
  if (window.confirm('Are you sure you want to delete this event? This will also delete all registrations for this event.')) {
    try {
      setLoading(true);
      await API.delete(`/clubs/${clubId}/events/${id}`);
      setEvents(events.filter(event => event.id !== id));
      alert('Event deleted successfully');
    } catch (error) {
      console.error('Error deleting event:', error);
      alert(error.response?.data?.message || 'Failed to delete event');
    } finally {
      setLoading(false);
    }
  }
};

  const updateStatus = async (id, newStatus) => {
    const previousStatus = events.find(event => event.id === id)?.status;
    setStatusError('');
    setUpdatingEventId(id);
    try {
      await API.patch(`/clubs/${clubId}/events/${id}`, { status: newStatus });
      setEvents(currentEvents => currentEvents.map(event =>
        event.id === id ? { ...event, status: newStatus } : event
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      setStatusError(error.response?.data?.error || 'Failed to update event status. Please try again.');
      setEvents(currentEvents => currentEvents.map(event =>
        event.id === id ? { ...event, status: previousStatus } : event
      ));
    } finally {
      setUpdatingEventId(null);
    }
  };

  if (loading) return <div className="text-center p-4">Loading events...</div>;
  if (error) return <div className="text-red-600 p-4">{error}</div>;

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Events</h2>
      {statusError && (
        <div role="alert" className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {statusError}
        </div>
      )}
      <div className="grid gap-6">
        {events.map(event => (
          <div key={event.id} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{event.title}</h3>
                <p className="text-gray-600">{event.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <p><span className="font-medium">Date:</span> {new Date(event.date).toLocaleDateString()}</p>
                  <p><span className="font-medium">Time:</span> {event.time || 'Not specified'}</p>
                  <p><span className="font-medium">Venue:</span> {event.venue}</p>
                  <p><span className="font-medium">Type:</span> {event.event_type}</p>
                  <p>
                    <span className="font-medium">Status:</span>{' '}
                    <span className={`px-2 py-1 rounded ${
                      event.status === 'upcoming' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {event.status}
                    </span>
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <select
                  value={event.status}
                  onChange={(e) => updateStatus(event.id, e.target.value)}
                  disabled={updatingEventId === event.id}
                  className="block w-full p-2 border rounded mb-2"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="past">Past</option>
                </select>
                <button
                  onClick={() => deleteEvent(event.id)}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Delete Event
                </button>

              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ManageEvents;