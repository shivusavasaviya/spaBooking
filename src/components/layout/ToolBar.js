import React, { useState, useRef, useEffect } from 'react';
import useBooking from '../../store/booking';
import './Toolbar.css';

const STATUS_OPTIONS = [
  { value: '',           label: 'All Status' },
  { value: 'confirmed',  label: 'Confirmed' },
  { value: 'pending',    label: 'Pending' },
  { value: 'completed',  label: 'Completed' },
  { value: 'cancelled',  label: 'Cancelled' },
  { value: 'no-show',    label: 'No Show' },
];

const ToolBar = () => {
  const { filters, setFilters, therapists, loading } = useBooking();
  const [showFilter, setShowFilter]   = useState(false);
  const [searchVal,  setSearchVal]    = useState('');
  const filterRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) {
        setShowFilter(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchVal !== filters.search) {
        setFilters({ search: searchVal });
      }
    }, 400);
    return () => clearTimeout(t);
  }, [searchVal]);

  // Format date for display: "Sat, Aug 16"
  const fmtDisplay = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const shiftDate = (delta) => {
    const d = new Date(filters.date + 'T00:00:00');
    d.setDate(d.getDate() + delta);
    setFilters({ date: d.toISOString().split('T')[0] });
  };

  const goToday = () => setFilters({ date: new Date().toISOString().split('T')[0] });

  const isToday = filters.date === new Date().toISOString().split('T')[0];

  // Count active filters (excluding date/outlet)
  const activeFilterCount = [filters.therapist, filters.service, filters.status]
    .filter(Boolean).length;

  return (
    <div className="tb-root">

      {/* ── LEFT: Outlet + Display stacked ────────────── */}
      <div className="tb-left">
        <div className="tb-outlet-name">
          Liat Towers
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>
        <div className="tb-display-name">
          Display : 15 Min
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m6 9 6 6 6-6"/>
          </svg>
        </div>
      </div>

      {/* ── CENTER: Search bar ─────────────────────────── */}
      <div className="tb-center">
        <div className="tb-search-box">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            ref={searchRef}
            type="text"
            className="tb-search-input"
            placeholder="Search Sales by phone/name"
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
          />
          {searchVal && (
            <button className="tb-search-clear" onClick={() => { setSearchVal(''); setFilters({ search: '' }); }}>
              ×
            </button>
          )}
          {loading && <span className="tb-spinner" />}
        </div>
      </div>

      {/* ── RIGHT ──────────────────────────────────────── */}
      <div className="tb-right">

        {/* Filter button + dropdown */}
        <div className="tb-filter-wrap" ref={filterRef}>
          <button
            className={`tb-btn ${activeFilterCount > 0 ? 'tb-btn-active' : ''}`}
            onClick={() => setShowFilter((v) => !v)}
          >
            Filter
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
              <line x1="11" y1="18" x2="13" y2="18"/>
            </svg>
            {activeFilterCount > 0 && (
              <span className="tb-filter-badge">{activeFilterCount}</span>
            )}
          </button>

          {/* Filter dropdown panel */}
          {showFilter && (
            <div className="tb-filter-panel">
              <div className="tbf-title">Filters</div>

              {/* Therapist filter */}
              <div className="tbf-group">
                <label className="tbf-label">Therapist</label>
                <select
                  className="tbf-select"
                  value={filters.therapist}
                  onChange={(e) => setFilters({ therapist: e.target.value })}
                >
                  <option value="">All Therapists</option>
                  {therapists?.map((t) => (
                    <option key={t.therapist_id || t.id} value={t.therapist_id || t.id}>
                      {t.alias || t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status filter */}
              <div className="tbf-group">
                <label className="tbf-label">Status</label>
                <div className="tbf-status-grid">
                  {STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      className={`tbf-status-btn ${filters.status === opt.value ? 'active' : ''}`}
                      onClick={() => setFilters({ status: opt.value })}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Per page */}
              <div className="tbf-group">
                <label className="tbf-label">Results per page</label>
                <select
                  className="tbf-select"
                  value={filters.per_page}
                  onChange={(e) => setFilters({ per_page: parseInt(e.target.value) })}
                >
                  {[10, 25, 50, 100].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>

              {/* Clear all */}
              {activeFilterCount > 0 && (
                <button
                  className="tbf-clear-btn"
                  onClick={() => {
                    setFilters({ therapist: '', service: '', status: '' });
                    setShowFilter(false);
                  }}
                >
                  Clear all filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Today */}
        <button
          className={`tb-btn ${isToday ? 'tb-btn-today-active' : ''}`}
          onClick={goToday}
        >
          Today
        </button>

        {/* Date navigation */}
        <div className="tb-date-nav">
          <button className="tb-arrow" onClick={() => shiftDate(-1)} title="Previous day">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <span className="tb-date-lbl">{fmtDisplay(filters.date)}</span>
          <button className="tb-arrow" onClick={() => shiftDate(1)} title="Next day">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </div>

        {/* Calendar date picker icon */}
        <div className="tb-cal-wrap" title="Pick a date">
          <input
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({ date: e.target.value })}
            className="tb-date-hidden"
          />
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <path d="M16 2v4M8 2v4M3 10h18"/>
          </svg>
        </div>

        {/* New Booking button */}
        <button
          className="tb-btn-new"
          onClick={() => useBooking.getState().selectBooking(null)}
        >
          + New Booking
        </button>

      </div>
    </div>
  );
};

export default ToolBar;
