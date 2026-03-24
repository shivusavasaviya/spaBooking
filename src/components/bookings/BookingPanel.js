import React, { useState, useEffect } from 'react';
import useBooking from '../../store/booking';
import BookingForm from './BookingForm';
import BookingDetails from './BookingDetails';
import LoadingSpinner from '../common/LoadingSpinner';
import { MdModeEditOutline } from "react-icons/md";

const BookingPanel = () => {
  const [mode, setMode] = useState('create');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const {
    selectedBooking,
    isPanelOpen,
    closePanel,
    fetchBookingDetails
  } = useBooking();

  useEffect(() => {
    if (isPanelOpen) {
      if (selectedBooking) {
        setMode('view');
        loadBookingDetails(selectedBooking.id);
      } else {
        setMode('create');
      }
    } else {
      setMode('create');
      setError(null);
    }
  }, [isPanelOpen, selectedBooking]);

  const loadBookingDetails = async (bookingId) => {
    if (!bookingId) return;

    setLoading(true);
    setError(null);
    try {
      if (fetchBookingDetails) {
        await fetchBookingDetails(bookingId);
      }
    } catch (err) {
      setError('Failed to load booking details');
      console.error('Error loading booking details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSuccess = () => {
    if (mode === 'create') {
      closePanel();
    } else {
      setMode('view');
    }
  };

  const handleFormCancel = () => {
    if (mode === 'create') {
      closePanel();
    } else {
      setMode('view');
    }
  };

  const handleEdit = () => {
    setMode('edit');
    setError(null);
  };

  const handleClose = () => {
    setMode('create');
    setError(null);
    closePanel();
  };
  if (!isPanelOpen) return null;

  return (
    <div className="booking-panel">
      <div className="panel-header">
        <h2>
          {mode === 'create' && ' New Booking'}
          {mode === 'view' && ' Appointment'}
          {mode === 'edit' && ' Edit Booking'}
        </h2>
        {mode === 'view' && <div className="bd-top-actions">
          <button className="bd-icon-btn" onClick={() => setMode("edit")} title="Edit"><MdModeEditOutline />
          </button>
          <button onClick={handleClose} className="close-btn" title="Close">×</button>
        </div>}
        {mode !== 'view' && <button onClick={handleClose} className="close-btn" title="Close">×</button>}
      </div>

      <div className="panel-content">
        {error && (
          <div className="error-message">
            <span>{error}</span>
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {loading && <LoadingSpinner />}

        {!loading && mode === 'create' && (
          <BookingForm
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
            setError={setError}
          />
        )}

        {/* View Mode */}
        {!loading && mode === 'view' && selectedBooking && (
          <BookingDetails
            booking={selectedBooking}
            onEdit={handleEdit}
            setError={setError}
          />
        )}

        {!loading && mode === 'edit' && selectedBooking && (
          <BookingForm
            mode={mode}
            booking={selectedBooking}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
            setError={setError}
          />
        )}
      </div>
    </div>
  );
};

export default BookingPanel;