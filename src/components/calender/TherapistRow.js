import React, { memo } from 'react';
import BookingBlock from './BookingBlock';
import { calculateTop, calculateHeight } from '../../utils/dateUtils';
import { ROW_HEIGHT, THERAPIST_ROW_HEIGHT, TOTAL_ROWS } from '../../utils/constants';

const TherapistRow = memo(({ therapist, bookings, colWidth = 180 }) => {
  return (
    <div style={{
      position: 'relative',
      width: colWidth,
      minWidth: colWidth,
      height: THERAPIST_ROW_HEIGHT,
      flexShrink: 0,
      background: 'white',
      borderRight: '1px solid #efefef',
    }}>
      {/* Background slot lines */}
      {Array.from({ length: TOTAL_ROWS }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          top: i * ROW_HEIGHT,
          left: 0, right: 0,
          height: ROW_HEIGHT,
          borderBottom: `1px solid ${i % 2 === 0 ? '#f0f0f0' : '#f9f9f9'}`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Booking blocks */}
      {bookings.map((booking) => (
        <BookingBlock
          key={`${booking.id}-${booking.bookingId}`}
          booking={booking}
          style={{
            position: 'absolute',
            top:    calculateTop(booking.startTime),
            height: Math.max(calculateHeight(booking.duration), ROW_HEIGHT * 2),
            left: 3,
            right: 3,
            zIndex: 10,
          }}
        />
      ))}

      {bookings.length === 0 && (
        <div style={{
          position: 'absolute', top: 10, left: 0, right: 0,
          textAlign: 'center', fontSize: 10, color: '#e5e7eb',
          pointerEvents: 'none',
        }}>
          No bookings
        </div>
      )}
    </div>
  );
});

TherapistRow.displayName = 'TherapistRow';
export default TherapistRow;
