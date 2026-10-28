import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/login';
import Signup from './components/auth/signup';
import UserDashboard from './components/user/userdashboard';
import AdminDashboard from './components/admin/Admindashboard';
import ManageEvents from './components/admin/manageEvents';
import AddEvent from './components/admin/addevent';
import Register from './components/user/register';
import EventRegistrations from './components/admin/eventregistrations';
import DashboardHome from './components/admin/DashboardHome';
import CreateClub from './components/admin/CreateClub';
import ClubDashboard from './components/admin/ClubDashboard';
import ClubEvents from './components/admin/ClubEvents';
import AdminWinnerPage from './components/admin/AdminWinnerPage';
import Clubs from './components/user/Clubs';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* User Routes */}
      <Route path="/user" element={<UserDashboard />} />
      <Route path="/user/club/:clubId" element={<Clubs />} />
      <Route path="/user/register/:id" element={<Register />} />


      {/* Admin Routes */}
      <Route path="/admin/*" element={<AdminDashboard />}>
        <Route index element={<DashboardHome />} />
        {/* <Route path="manage" element={<ManageEvents />} />
        <Route path="add" element={<AddEvent />} />
        <Route path="registrations" element={<EventRegistrations />} /> */}
        <Route path="create-club" element={<CreateClub/>} />
        
      </Route>
      <Route path="/admin/clubs/:clubId/events/:eventId/winners" element={<AdminWinnerPage />} />
      <Route path="/admin/club/:clubId" element={<ClubDashboard />} />
      <Route path="/admin/club/:clubId/add-event" element={<AddEvent />} />
      <Route path="/admin/club/:clubId/manage-events" element={<ManageEvents />} />
      <Route path="/admin/club/:clubId/registrations" element={<EventRegistrations />} />
      <Route path="/admin/club/:clubId/events" element={<ClubEvents />}/>

    </Routes>
  );
}

export default App;