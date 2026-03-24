import { Suspense, useEffect, useState } from 'react';
import { loginApi } from './services/api';
import './styles/App.css';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';
import useBooking from './store/booking';
import CalendarBoard from './components/calender/CalendarBoard';
import BookingPanel from './components/bookings/BookingPanel';
import Header from './components/layout/Header';
import ToolBar from './components/layout/ToolBar';
import { setToastCallback } from './services/toastService';
import Toast from './components/common/Toast';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginError, setLoginError]           = useState(false);
  const [toast, setToast]                     = useState(null);

  const {
    fetchBookings, fetchTherapists,
    therapists, bookings,
    filters, error, clearError, loading,
  } = useBooking();

  useEffect(() => {
    setToastCallback(({ message, type, duration }) =>
      setToast({ message, type, duration })
    );
  }, []);

  useEffect(() => { doLogin(); }, []);

  const doLogin = async () => {
    try {
      setLoginError(false);
      await loginApi();
      setIsAuthenticated(true);
    } catch {
      setIsAuthenticated(false);
      setLoginError(true);
    }
  };

  // Fetch on auth + whenever date changes
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchBookings();
    fetchTherapists();
  }, [isAuthenticated, filters.date]);


  if (loginError) {
    return (
      <div className="login-error">
        <h2>Login Failed</h2>
        <p>Unable to connect. Please try again.</p>
        <button onClick={doLogin}>Retry</button>
      </div>
    );
  }

  if (!isAuthenticated) return <LoadingSpinner message="Authenticating..." />;

  return (
    <ErrorBoundary>
      <div className="app">
        <div className="toast-container">
          {toast && (
            <Toast
              message={toast.message}
              type={toast.type}
              duration={toast.duration}
              onClose={() => setToast(null)}
            />
          )}
        </div>

        <Header />
        <ToolBar />

        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={clearError}>×</button>
          </div>
        )}

        <main className="main-content">
          <div className="calendar-container">
            <Suspense fallback={<LoadingSpinner />}>
              <CalendarBoard therapists={therapists} date={filters.date} />
            </Suspense>
          </div>
        </main>

        <BookingPanel />
      </div>
    </ErrorBoundary>
  );
}

export default App;