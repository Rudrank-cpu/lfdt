import React, { useState, useRef, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { CatalogPage } from './pages/CatalogPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { MyRegistrationsPage } from './pages/MyRegistrationsPage';
import { OrganizerDashboardPage } from './pages/OrganizerDashboardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { EventFormModal } from './components/organizer/EventFormModal';
import { api } from './api/client';

const AppRoutes = () => {
  const { isAuthenticated, isHead } = useAuth();
  const [currentView, setCurrentView] = useState('catalog');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const createEventOpenerRef = useRef(null);

  const navigate = useCallback((view) => {
    // Guard protected routes
    if (view === 'my-registrations' && !isAuthenticated) {
      setCurrentView('login');
      return;
    }
    if (view === 'organizer-dashboard' && !isHead) {
      setCurrentView('catalog');
      return;
    }
    setCurrentView(view);
    setSelectedEvent(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [isAuthenticated, isHead]);

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setCurrentView('event-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewEventFromBookings = async (partialEvent) => {
    try {
      const fullEvent = await api.getEvent(partialEvent.id);
      setSelectedEvent(fullEvent);
      setCurrentView('event-detail');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      navigate('catalog');
    }
  };

  const handleCreateEvent = async (payload) => {
    await api.createEvent(payload);
    navigate('organizer-dashboard');
  };

  const renderPage = () => {
    switch (currentView) {
      case 'catalog':
        return <CatalogPage onSelectEvent={handleSelectEvent} />;
      case 'event-detail':
        return selectedEvent
          ? <EventDetailPage event={selectedEvent} onBack={() => navigate('catalog')} />
          : <CatalogPage onSelectEvent={handleSelectEvent} />;
      case 'my-registrations':
        return <MyRegistrationsPage onViewEvent={handleViewEventFromBookings} />;
      case 'organizer-dashboard':
        return (
          <OrganizerDashboardPage
            onCreateEventRef={(opener) => { createEventOpenerRef.current = opener; }}
          />
        );
      case 'login':
        return <LoginPage onNavigate={navigate} />;
      case 'register':
        return <RegisterPage onNavigate={navigate} />;
      default:
        return <CatalogPage onSelectEvent={handleSelectEvent} />;
    }
  };

  // Don't show Navbar on auth pages
  const hideNavbar = currentView === 'login' || currentView === 'register';

  return (
    <div>
      {!hideNavbar && (
        <Navbar
          onNavigate={navigate}
          currentView={currentView}
          onOpenCreateEvent={() => {
            if (createEventOpenerRef.current) {
              createEventOpenerRef.current();
            } else {
              setShowCreateModal(true);
            }
          }}
        />
      )}
      <main>{renderPage()}</main>

      {/* Global Create Event Modal (for Navbar button when not on dashboard) */}
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
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
