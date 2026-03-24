import React, { useState } from 'react';
import useBooking from '../../store/booking';
import { toast } from '../../services/toastService';
import ConfirmModal from '../common/ConfirmModal';
import './BookingDetails.css';
import { MdDelete } from "react-icons/md";

// ── Helpers ─────────────────────────
const fmtDate = d =>
  d ? new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '—';

const fmtTime = t => {
  if (!t) return '—';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${m.toString().padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
};

const fmtDateTime = d =>
  d ? new Date(d).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true
  }) : '—';

const STATUS_STYLE = {
  confirmed: { bg: '#f0fdf4', color: '#15803d', dot: '#22c55e' },
  pending: { bg: '#fefce8', color: '#a16207', dot: '#eab308' },
  completed: { bg: '#f0fdf4', color: '#15803d', dot: '#22c55e' },
  cancelled: { bg: '#fef2f2', color: '#b91c1c', dot: '#ef4444' },
  'no-show': { bg: '#fef2f2', color: '#b91c1c', dot: '#ef4444' },
  'in progress': { bg: '#eff6ff', color: '#1d4ed8', dot: '#3b82f6' },
  checkin: { bg: '#f0fdf4', color: '#15803d', dot: '#22c55e' },
};

const BookingDetails = ({ booking, onEdit, onClose }) => {
  const { cancelBooking, deleteBooking } = useBooking();

  const [modal, setModal] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [membership, setMember] = useState(!!booking?.membership);
  const [cancelType, setCancelType] = useState('normal'); 

  if (!booking) return null;

  // ── Extract booking item (clean) ─────────────────
  const items = Array.isArray(booking.booking_item)
    ? booking.booking_item
    : Object.values(booking.booking_item || {}).flat();

  const item = items[0] || {};

  // ── Derived values ───────────────────────────────
  const statusKey = booking.status || 'pending';
  const statusStyle = STATUS_STYLE[statusKey] || STATUS_STYLE.pending;

  const {
    id,
    booking_created_at,
    booking_id,
    customer_name,
    customer_contact,
    therapistName,
    room_name,
    note,
    notes,
    source,
    created_at,
    cancelled_at,
    cancelled_by,
    user
  } = booking;

  const [date, time] = (booking.service_at || '').split(' ');

  const duration = item.duration || booking.duration || '—';
  const serviceName = item.service_name || item.service || booking.service || '—';
  const requests = item.service_request
    ? item.service_request.split(',').map(s => s.trim()).join(', ')
    : '—';

  const startTime = fmtTime(item.start_time || time);


  const handleCancelBooking = async () => {
    setProcessing(true);
    try {
      await cancelBooking(booking_id,cancelType);
      toast.success(`Booking #${id} cancelled successfully`);
      setModal(null);
      onClose?.();
    } catch (err) {
      toast.error(err.message || 'Failed to cancel booking');
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteBooking = async () => {
    setProcessing(true);
    try {
      await deleteBooking(booking_id);
      toast.success(`Booking #${id} deleted successfully`);
      setModal(null);
      onClose?.();
    } catch (err) {
      toast.error(err.message || 'Failed to delete booking');
    } finally {
      setProcessing(false);
    }
  };
  return (
    <div className="bd-wrap">


      <div className="bd-quick-actions">
        <span className="bd-status-badge" >
          <span className="bd-status-dot" style={{ background: statusStyle.dot }} />
          {statusKey}
        </span>
        <button className="bd-view-sale-btn">View Sale</button>
      </div>



      {/* ── Date Time ── */}
      <div className="bd-datetime-row">
        <div className="bd-dt-block">
          <span className="bd-dt-lbl">On</span>
          <span className="bd-dt-val">{fmtDate(date)}</span>
        </div>
        <div className="bd-dt-sep" />
        <div className="bd-dt-block">
          <span className="bd-dt-lbl">At</span>
          <span className="bd-dt-val">{fmtTime(time)}</span>
        </div>
      </div>

      {/* ── Client ── */}
      <div className="bd-client-card">
        <div className="bd-client-av">
          {customer_name?.[0]?.toUpperCase()}
        </div>

        <div className="bd-client-info">
          <div className="bd-client-name">{customer_name || '--'}</div>
          <div className="bd-client-phone">{customer_contact || "--"}</div>
        </div>
        <button
          onClick={() => setModal('delete')}
          title="Delete Booking"
          aria-label="Delete Booking"
          disabled={booking?.status === "Deleted"}
        >
          <MdDelete />
        </button>
      </div>

      {/* ── Membership ── */}
      <div className="bd-membership-row">
        <span className="bd-membership-lbl">Apply membership discount:</span>
        <button className={`bd-toggle ${membership ? 'on' : ''}`} onClick={() => setMember(v => !v)}>
          <span className="bd-toggle-thumb" />
        </button>
      </div>

      {/* ── Service ── */}
      <div className="bd-service-card">
        <div className="bd-service-header">
          <span className="bd-service-dur">{duration} Mins</span>
          <span className="bd-service-name">{serviceName}</span>
        </div>

        <div className="bd-service-row">
          <span className="bd-service-lbl">With:</span>
          <span className="bd-service-val">{therapistName}</span>
        </div>

        <div className="bd-service-row">
          <span className="bd-service-lbl">At:</span>
          <span className="bd-service-val">{startTime}</span>
        </div>

        <div className="bd-service-row">
          <span className="bd-service-lbl">Using:</span>
          <span className="bd-service-val">{room_name}</span>
        </div>

        <div className="bd-service-row">
          <span className="bd-service-lbl">Requests:</span>
          <span className="bd-service-val">{requests}</span>
        </div>
      </div>

      {/* Notes */}
      {(note || notes) && (
        <div className="bd-notes-box">
          <p>{note || notes}</p>
        </div>
      )}

      {/* Timeline */}
      <div className="bd-timeline-section">
        <div className="bd-timeline-title">Booking Details</div>

        {created_at && (
          <div className="bd-timeline-row">
            <span className="bd-tl-lbl">Booked on:</span>
            <span className="bd-tl-val">{fmtDateTime(created_at)}</span>
          </div>
        )}

        {cancelled_at && (
          <div className="bd-timeline-row">
            <span className="bd-tl-lbl">Cancelled on:</span>
            <span className="bd-tl-val">{fmtDateTime(cancelled_at)}</span>
          </div>
        )}

        {cancelled_by && (
          <div className="bd-timeline-row">
            <span className="bd-tl-lbl">Cancelled by:</span>
            <span className="bd-tl-val">{cancelled_by}</span>
          </div>
        )}

        <div className="bd-timeline-row">
          <span className="bd-tl-lbl">Booked On:</span>
          <span className="bd-tl-val">{fmtDateTime(booking_created_at)}</span>
        </div>
        <div className="bd-timeline-row">
          <span className="bd-tl-lbl">Booked By:</span>
          <span className="bd-tl-val">{user?.name}</span>
        </div>
        <div className="bd-timeline-row">
          <span className="bd-tl-lbl">Canceled On:</span>
          <span className="bd-tl-val">{booking?.cancelled_at}</span>
        </div>
        <div className="bd-timeline-row">
          <span className="bd-tl-lbl">Canceled By:</span>
          <span className="bd-tl-val">{booking?.cancelled_by}</span>
        </div>
        <div className="bd-timeline-row">
          <span className="bd-tl-lbl">Source:</span>
          <span className="bd-tl-val">{source}</span>
        </div>

      </div>

      {/* Bottom */}
      {booking?.status !== "Deleted" && booking?.status !== "Cancelled" && <div className="bd-bottom-actions">
        <button className="bd-btn-cancel" onClick={() => setModal('cancel')}>
          Cancel 
        </button>
      </div>}

      {/* Modals */}
      <ConfirmModal
        isOpen={modal === 'cancel'}
        title="Cancel Booking"
        message={`Are you sure you want to cancel booking #${id}?`}
        subMessage="This action cannot be undone."
        confirmText="Yes, Cancel"
        cancelText="No, Keep"
        confirmStyle="danger"
        loading={processing}
        onConfirm={handleCancelBooking}
        onCancel={() => setModal(null)}
        cancelType={cancelType}
        setCancelType={setCancelType}
      />

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={modal === 'delete'}
        title="Delete Booking"
        message={`Are you sure you want to permanently delete booking #${id}?`}
        subMessage="This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="No, Keep"
        confirmStyle="danger"
        loading={processing}
        onConfirm={handleDeleteBooking}
        onCancel={() => setModal(null)}
      />
    </div>
  );
};

export default BookingDetails;