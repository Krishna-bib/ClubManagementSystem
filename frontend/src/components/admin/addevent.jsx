import React, { useState } from 'react';
import API from '../../services/api';
import { useParams } from "react-router-dom";

const AddEvent = () => {
   const { clubId } = useParams(); 
  const emptyEvent = {
    title: '',
    description: '',
    date: '',
    event_type: '',
    venue: '',
    time: '',
    coordinator_name: '',
    sponsors: '',
    status: 'upcoming',
    is_competition: false
  };
  const [eventData, setEventData] = useState(emptyEvent);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
 
  const handleChange = (e) => {
    setEventData({ 
      ...eventData, 
      [e.target.name]: e.target.value 
    });
    setError(''); // Clear error when user makes changes
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const containsLetter = (value) => /\p{L}/u.test(value);
    const title = eventData.title.trim();
    const description = eventData.description.trim();
    const venue = eventData.venue.trim();
    const coordinatorName = eventData.coordinator_name.trim();
    const sponsors = eventData.sponsors.trim();

    if (!containsLetter(title)) {
      setError('Title must contain text and cannot be only numbers.');
      return;
    }
    if (!containsLetter(description)) {
      setError('Description must contain text and cannot be only numbers.');
      return;
    }
    if (!containsLetter(venue)) {
      setError('Venue must contain text and cannot be only numbers.');
      return;
    }
    if (!containsLetter(coordinatorName)) {
      setError('Coordinator name must contain text and cannot be only numbers.');
      return;
    }
    if (sponsors && !containsLetter(sponsors)) {
      setError('Sponsor names must contain text and cannot be only numbers.');
      return;
    }
    const parsedDate = new Date(`${eventData.date}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(eventData.date)
      || Number.isNaN(parsedDate.getTime())
      || parsedDate.toISOString().slice(0, 10) !== eventData.date) {
      setError('Enter a valid event date.');
      return;
    }
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(eventData.time)) {
      setError('Enter a valid event time.');
      return;
    }
    setLoading(true);

    try {
      const response = await API.post(`/clubs/${clubId}/addevents`, {
        ...eventData,
        title,
        description,
        venue,
        coordinator_name: coordinatorName,
        sponsors
      });

      console.log('Event created:', response.data);
      setSuccess('Event added successfully!');
      setEventData(emptyEvent);
    } catch (error) {
      console.error('Failed to add event:', error);
      setError(error.response?.data?.error || 'Failed to add event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6">Add New Event</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            name="title"
            maxLength={255}
            value={eventData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={eventData.description}
            onChange={handleChange}
            required
            maxLength={10000}
            rows="4"
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            name="date"
            value={eventData.date}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            name="event_type"
            value={eventData.event_type}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Type</option>
            <option value="technical">Technical</option>
            <option value="cultural">Cultural</option>
            <option value="sports">Sports</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Venue
          </label>
          <input
            type="text"
            name="venue"
            maxLength={255}
            value={eventData.venue}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            placeholder="Enter event venue"
          />
        </div>
        
      <div>
        <label className="flex items-center gap-2">
       <input
          type="checkbox"
          name="is_competition"
          checked={eventData.is_competition}
          onChange={e => setEventData({...eventData, is_competition: e.target.checked})}
     />
        Is this a Competition?
       </label>

      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Time
        </label>
        <input
          type="time"
          name="time"
          value={eventData.time}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Coordinator Name
        </label>
        <input
          type="text"
          name="coordinator_name"
          maxLength={255}
          value={eventData.coordinator_name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Sponsors
        </label>
        <textarea
          name="sponsors"
          value={eventData.sponsors}
          onChange={handleChange}
          maxLength={255}
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Status
        </label>
        <select
          name="status"
          value={eventData.status}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
        >
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
        </select>
      </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            loading 
              ? 'bg-blue-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Adding Event...' : 'Add Event'}
        </button>
      </form>
    </div>
  );
};

export default AddEvent;