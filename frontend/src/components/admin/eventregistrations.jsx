import React, { useEffect, useState } from 'react';
import API from '../../services/api';
import { useParams } from "react-router-dom";
const EventRegistrations = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const { clubId } = useParams();
 
  const fetchEvents = async () => {
  try {
    setLoading(true);
    const response = await API.get(`/clubs/${clubId}/events`);
    setEvents(response.data);
  } catch (error) {
    setError('Failed to load events');
  } finally {
    setLoading(false);
  }
};

  

  const fetchEventRegistrations = async (eventId) => {
    try {
      setLoading(true);
      const response = await API.get(`/clubs/${clubId}/events/${eventId}/registrations`)

      setRegistrations(response.data);
      setSelectedEvent(events.find(event => event.id === eventId));
    } catch (error) {
      setError('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-red-600 p-4">{error}</div>;

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Event Registrations</h2>
      
      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {events.map((event) => (
          <div 
            key={event.id}
            className={`p-4 rounded-lg shadow-md cursor-pointer transition-colors ${
              selectedEvent?.id === event.id 
                ? 'bg-indigo-100 border-2 border-indigo-500'
                : 'bg-white hover:bg-gray-50'
            }`}
            onClick={() => fetchEventRegistrations(event.id)}
          >
            <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
            <p className="text-gray-600">Date: {new Date(event.date).toLocaleDateString()}</p>
            <p className="text-gray-600">
              Registrations: {event.registration_count || 0}
            </p>
          </div>
        ))}
      </div>

      {/* Registrations List */}
      {selectedEvent && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">
            Registrations for {selectedEvent.title}
          </h3>
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registration Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {registrations.map((registration) => (
                  <tr key={registration.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{registration.user_name || registration.name || 'Unknown'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{registration.user_email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(registration.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-sm ${
                        registration.status === 'confirmed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {registration.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {registrations.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                      No registrations found for this event
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}
    </div>
  );
};

export default EventRegistrations;