import React, { useMemo, memo, useRef } from 'react';
import useBooking from '../../store/booking';
import BookingBlock from './BookingBlock';
import './CalendarBoard.css';
import { avatarColor, toMins } from '../../utils/helper';

const COL_W = 160;
const ROW_H = 30;
const TOTAL_ROWS = 48;

// Minutes → px top offset
const minsToTop = (mins) => {
  if (isNaN(mins)) return 0;
  return Math.round((mins / 30) * ROW_H);
};
const minsToH = (dur) => Math.max(Math.round((parseInt(dur) || 60) / 30 * ROW_H), ROW_H);

// Flatten booking_item from any API shape
const flattenItems = (bookingList) => {
  if (!Array.isArray(bookingList) || !bookingList.length) return [];
  const items = [];
  bookingList.forEach((booking) => {
    const raw = booking.booking_item;
    let arr = Array.isArray(raw) ? raw
      : raw && typeof raw === 'object' ? Object.values(raw).flat()
        : [];
    arr.forEach((item) => {
      items.push({
        ...item,
        user: booking.user,
        booking_created_at: booking?.booking_created_at,
        source: booking.source,
        status: booking?.status,
        id: item.id || `${booking.id}-${Math.random()}`,
        bookingId: booking.id,
        service: item.service || '',
        startTime: item.startTime || item.start_time || item.start,
        endTime:item.endTime || item?.end_time ,
        duration: item.duration || item.duration_minutes || 60, // Try different possible field names

        therapistId: String(item.therapist_id || item.staff_id || ''),
        therapistName: item.therapist || item.employee || '',
        membership: !!booking.membership || !!item.membership,
        requested: !!item.is_requested_therapist,
        hasCoupon: !!item.voucher_code,
        paymentStatus: booking.payment_status,
      });
    });
  });
  return items;
};

// Build therapist column list
const buildColumns = (therapists, items) => {
  const map = {};
  therapists.forEach((th, i) => {
    const id = String(th.therapist_id ?? th.id ?? i);
    map[id] = { ...th, _id: id, _idx: i };
  });
  items.forEach((item) => {
    if (item.therapistId && !map[item.therapistId]) {
      map[item.therapistId] = {
        _id: item.therapistId, _idx: Object.keys(map).length,
        therapist_id: item.therapistId,
        name: item.therapistName || `Therapist ${item.therapistId}`,
        alias: item.therapistName || '',
        gender: '',
      };
    }
  });
  if (!Object.keys(map).length) {
    map['0'] = { _id: '0', _idx: 0, therapist_id: '0', name: 'Unassigned', alias: 'Unassigned', gender: '' };
  }
  return Object.values(map).sort((a, b) => a._idx - b._idx);
};

const groupItems = (columns, items) => {
  const map = {};
  columns.forEach((c) => { map[c._id] = []; });
  items.forEach((item) => {
    const k = item.therapistId || '0';
    if (map[k] !== undefined) map[k].push(item);
    else if (map['0']) map['0'].push(item);
  });
  Object.keys(map).forEach((k) => {
    map[k].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
  });
  return map;
};

const TIME_SLOTS = Array.from({ length: TOTAL_ROWS }, (_, i) => {
  const totalM = i * 30;
  const h = Math.floor(totalM / 60);
  const m = totalM % 60;
  const hStr = h.toString().padStart(2, '0');
  const mStr = m.toString().padStart(2, '0');
  const ampm = h < 12 ? 'AM' : 'PM';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return {
    label: `${h12.toString().padStart(2, '0')}.${mStr} ${ampm}`,
    isHour: m === 0,
    raw: `${hStr}:${mStr}`,
  };
});


const CalendarBoard = memo(({ therapists = [] }) => {
  const bookings = useBooking((s) => s.bookings);
  const BookingLoading = useBooking((s) => s.BookingLoading);
  const headerRef = useRef(null);
  const bodyRef = useRef(null);

  const onBodyScroll = () => {
    if (headerRef.current && bodyRef.current)
      headerRef.current.scrollLeft = bodyRef.current.scrollLeft;
  };

  const { columns, byTherapist } = useMemo(() => {
    const items = flattenItems(bookings);
    const columns = buildColumns(therapists, items);
    return { columns, byTherapist: groupItems(columns, items) };
  }, [bookings, therapists]);

  const femaleCount = therapists.filter(t => (t.gender || '').toLowerCase().startsWith('f')).length;
  const maleCount = therapists.filter(t => (t.gender || '').toLowerCase().startsWith('m')).length;
  const fmLabel = femaleCount || maleCount ? `${femaleCount}F ${maleCount}M` : '';

  if (BookingLoading) {
    return (
      <div className="cal-loading">
        <div className="cal-loading-spinner" />
        <p className="cal-loading-text">Loading schedule...</p>
      </div>
    );
  }

  const totalH = TOTAL_ROWS * ROW_H;

  return (
    <div className="cal-board">

      {/* ── Column headers ──────────────────────── */}
      <div className="cal-header">
        <div className="cal-time-label">Time</div>

        <div className="cal-th-headers" ref={headerRef}>
          {columns.map((th, idx) => {
            const count = byTherapist[th._id]?.length || 0;
            const color = avatarColor(th);
            const name = th.alias || th.name || '?';

            return (
              <div
                key={th._id}
                className="cal-th-col"
                style={{ minWidth: COL_W, width: COL_W }}
              >
                <div className="cal-th-avatar" style={{ background: color }}>
                  <span className="cal-th-count">{count}</span>
                </div>

                <div className="cal-th-info">
                  <div className="cal-th-name">{name}</div>
                  {th.gender && (
                    <div className="cal-th-gender">{th.gender}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Calendar body ────────────────────────── */}
      <div className="cal-body">

        {/* Fixed time column */}
        <div className="cal-time-col">
          {TIME_SLOTS.map((slot, i) => (
            <div
              key={slot.raw}
              className={`cal-time-slot ${slot.isHour ? '' : 'minor'}`}
              style={{ height: ROW_H }}
            >
              {slot.isHour && (
                <>
                  <div className="cal-time-main">{slot.label}</div>
                  {fmLabel && <div className="cal-time-sub">{fmLabel}</div>}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Scrollable body */}
        <div
          className="cal-scroll-area"
          ref={bodyRef}
          onScroll={onBodyScroll}
        >
          {columns.map((th) => (
            <div
              key={th._id}
              className="cal-th-body-col"
              style={{ minWidth: COL_W, width: COL_W, height: totalH }}
            >
              {/* Background grid lines */}
              {TIME_SLOTS.map((slot, i) => (
                <div
                  key={slot.raw}
                  className={`cal-slot-line ${slot.isHour ? 'hour' : 'half'}`}
                  style={{ top: i * ROW_H, height: ROW_H }}
                />
              ))}

              {/* Booking blocks */}
              {(byTherapist[th._id] || []).map((item) => (
                <BookingBlock
                  key={item.id}
                  booking={item}
                  style={{
                    top: minsToTop(toMins(item.startTime)),
                    height: minsToH(item.duration),
                    left: 3,
                    right: 3,
                    zIndex: 10,
                  }}
                />
              ))}

              {!(byTherapist[th._id]?.length) && (
                <div className="cal-th-empty">No bookings</div>
              )}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
});

CalendarBoard.displayName = 'CalendarBoard';
export default CalendarBoard;
