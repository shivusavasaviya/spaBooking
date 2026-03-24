import React, { memo, useCallback } from 'react';
import useBooking from '../../store/booking';

// Status → card background + left border
const STATUS_STYLE = {
  'confirmed':    { bg: '#dbeafe', border: '#93c5fd' },
  'pending':      { bg: '#fef3c7', border: '#fcd34d' },
  'completed':    { bg: '#f0fdf4', border: '#86efac' },
  'cancelled':    { bg: '#fee2e2', border: '#fca5a5' },
  'no-show':      { bg: '#fee2e2', border: '#fca5a5' },
  'noshow':       { bg: '#fee2e2', border: '#fca5a5' },
  'in progress':  { bg: '#fce7f3', border: '#f9a8d4' },
  'inprogress':   { bg: '#fce7f3', border: '#f9a8d4' },
  'checkin':      { bg: '#d1fae5', border: '#6ee7b7' },
  'checked in':   { bg: '#d1fae5', border: '#6ee7b7' },
};
const DEFAULT_STYLE = { bg: '#fce7f3', border: '#f9a8d4' };

// Chip definitions matching Figma exactly
const getChips = (booking) => {
  const chips = [];
  // C — confirmed / checkin
  chips.push({ key: 'c', label: 'C', cls: 'bk-chip-c' });
  // M — membership
  if (booking.membership) chips.push({ key: 'm', label: 'M', cls: 'bk-chip-m' });
  // S — star (requested therapist)
  if (booking.requested) chips.push({ key: 's', label: '★', cls: 'bk-chip-s' });
  // T — therapist assigned
  if (booking.therapistId) chips.push({ key: 't', label: 'T', cls: 'bk-chip-t' });
  // H — room/hall
  if (booking.roomId) chips.push({ key: 'h', label: 'H', cls: 'bk-chip-h' });
  // Note icon
  chips.push({ key: 'n', label: null, cls: 'bk-chip-n', isIcon: true });
  return chips;
};

const NoteIcon = () => (
  <svg width="9" height="9" viewBox="0 0 24 24" fill="none"
    stroke="white" strokeWidth="2.5">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/>
    <line x1="16" y1="13" x2="8" y2="13"/>
    <line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

const BookingBlock = memo(({ booking, style }) => {
  const selectBooking = useBooking((s) => s.selectBooking);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    selectBooking(booking);
  }, [booking, selectBooking]);

  const statusKey =booking.status;
  const s = STATUS_STYLE[statusKey] || DEFAULT_STYLE;
  const chips = getChips(booking);
  return (
    <div
      className="bk-block"
      style={{
        ...style,
        background:  s.bg,
        borderLeft:  `3px solid ${s.border}`,
      }}
      onClick={handleClick}
      title={`${booking.customer_name} — ${booking.service}`}
    >
      {/* Service name */}
      <div className="bk-service">{booking.service || '—'}</div>

      {/* Phone (strikethrough) */}
      {booking.customer_contact && (
        <div className="bk-phone">{booking.customer_contact}</div>
      )}

      {/* Customer name */}
      <div className="bk-name">{booking.customer_name || 'Guest'}</div>

      {/* Icon chips */}
      <div className="bk-chips">
        {chips.map((chip) => (
          <span key={chip.key} className={`bk-chip ${chip.cls}`}>
            {chip.isIcon ? <NoteIcon /> : chip.label}
          </span>
        ))}
      </div>
    </div>
  );
});

BookingBlock.displayName = 'BookingBlock';
export default BookingBlock;
