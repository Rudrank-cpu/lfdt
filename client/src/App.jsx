import React, { useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { Navbar } from './components/common/Navbar';
import { RoleRoute } from './components/common/RoleRoute';
import { CatalogPage } from './pages/CatalogPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { MyRegistrationsPage } from './pages/MyRegistrationsPage';
import { OrganizerDashboardPage } from './pages/OrganizerDashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CreateEventPage } from './pages/CreateEventPage';
import { EditEventPage } from './pages/EditEventPage';
import { AttendeeRosterPage } from './pages/AttendeeRosterPage';
import { MyTicketsPage } from './pages/MyTicketsPage';
import { Footer } from './components/common/Footer';
import { EventFormModal } from './components/organizer/EventFormModal';
import { api } from './api/client';

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const createEventOpenerRef = useRef(null);

  const handleCreateEvent = async (payload) => {
    try {
      await api.createEvent(payload);
      toast.success('Event published successfully!');
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error('Failed to create event: ' + err.message);
    }
  };

  const hideNavbar = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!hideNavbar && (
        <Navbar
          onOpenCreateEvent={() => {
            navigate('/admin/events/new');
          }}
        />
      )}

      <main style={{ flex: 1 }}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<CatalogPage />} />
          <Route path="/events" element={<CatalogPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Viewer Protected Routes */}
          <Route
            path="/my-registrations"
            element={
              <RoleRoute allowedRoles={['VIEWER', 'HEAD']}>
                <MyRegistrationsPage />
              </RoleRoute>
            }
          />
          <Route
            path="/tickets/:id"
            element={
              <RoleRoute allowedRoles={['VIEWER', 'HEAD']}>
                <MyTicketsPage />
              </RoleRoute>
            }
          />

          {/* Head Organizer Protected Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <RoleRoute allowedRoles={['HEAD']}>
                <OrganizerDashboardPage
                  onCreateEventRef={(opener) => {
                    createEventOpenerRef.current = opener;
                  }}
                />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/events/new"
            element={
              <RoleRoute allowedRoles={['HEAD']}>
                <CreateEventPage />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/events/:id/edit"
            element={
              <RoleRoute allowedRoles={['HEAD']}>
                <EditEventPage />
              </RoleRoute>
            }
          />
          <Route
            path="/admin/events/:id/attendees"
            element={
              <RoleRoute allowedRoles={['HEAD']}>
                <AttendeeRosterPage />
              </RoleRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!hideNavbar && <Footer />}

      {/* Global Event Creation Modal */}
      <EventFormModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateEvent}
      />
    </div>
  );
};

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
