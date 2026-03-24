import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../services/axiosService';
import './Step1client.css';

const Step1Client = ({ onSelectCustomer, onCreateNew }) => {
  const [searchQuery, setSearchQuery]   = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading]           = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasSearched, setHasSearched]   = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const debounceRef = useRef(null);
  const inputRef    = useRef(null);
  const wrapRef     = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Debounced search — fires only when text exists
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      setHasSearched(false);
      setHighlightIdx(0);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res   = await api.get('/users', {
          params: { search_text: searchQuery.trim(), per_page: 50, pagination: 1 },
        });
        const data  = res.data?.data?.data;
        const users = data?.list?.users || [];
        setSearchResults(users);
        setShowDropdown(true);
        setHasSearched(true);
        setHighlightIdx(0);
      } catch (err) {
        console.error('Search failed:', err);
        setSearchResults([]);
        setShowDropdown(true);
        setHasSearched(true);
      } finally {
        setLoading(false);
      }
    }, 350);
  }, [searchQuery]);

  const handleSelect = (customer) => {
    onSelectCustomer({
      id:    customer.id,
      name:  customer.name,
      phone: customer.contact_number,
      email: customer.email || '',
    });
    setSearchQuery('');
    setShowDropdown(false);
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || !searchResults.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx((i) => Math.min(i + 1, searchResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && searchResults[highlightIdx]) {
      e.preventDefault();
      handleSelect(searchResults[highlightIdx]);
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  // Highlight matched text in name
  const highlightText = (text, query) => {
    if (!query.trim()) return <span>{text}</span>;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return <span>{text}</span>;
    return (
      <span>
        {text.slice(0, idx)}
        <span style={{ color: '#B45309', fontWeight: 700 }}>{text.slice(idx, idx + query.length)}</span>
        {text.slice(idx + query.length)}
      </span>
    );
  };

  return (
    <div className="s1-wrap">

      {/* ── Outlet row ──────────────────────── */}
      <div className="s1-outlet-row">
        <span className="s1-outlet-lbl">Outlet</span>
        <span className="s1-outlet-val">Liat Towers</span>
      </div>

      {/* ── On / At row ─────────────────────── */}
      <div className="s1-datetime-row">
        <div className="s1-dt-block">
          <span className="s1-dt-lbl">On</span>
          <input
            type="date"
            className="s1-dt-input"
            defaultValue={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div className="s1-dt-divider" />
        <div className="s1-dt-block">
          <span className="s1-dt-lbl">At</span>
          <input type="time" className="s1-dt-input" defaultValue="09:30" />
        </div>
      </div>

      {/* ── Search field + dropdown ──────────── */}
      <div className="s1-search-section" ref={wrapRef}>
        <div className={`s1-field ${showDropdown ? 's1-field-open' : ''}`}>
          {/* Search icon */}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="#9ca3af" strokeWidth="2" style={{ flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>

          <input
            ref={inputRef}
            type="text"
            className="s1-field-input"
            placeholder="Search or create client"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            autoComplete="off"
          />

          {/* Spinner */}
          {loading && <span className="s1-field-spinner" />}

          {/* Clear × */}
          {searchQuery && !loading && (
            <button
              type="button"
              className="s1-field-clear"
              onClick={() => {
                setSearchQuery('');
                setShowDropdown(false);
                inputRef.current?.focus();
              }}
            >
              ×
            </button>
          )}

          {/* + Create icon */}
          <button
            type="button"
            className="s1-field-plus"
            onClick={onCreateNew}
            title="Create new client"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v8M8 12h8"/>
            </svg>
          </button>
        </div>

        {/* ── Dropdown list ────────────────── */}
        {showDropdown && searchResults.length > 0 && (
          <div className="s1-dropdown">
            {searchResults.map((c, i) => (
              <div
                key={c.id}
                className={`s1-row ${i === highlightIdx ? 's1-row-hl' : ''}`}
                onMouseEnter={() => setHighlightIdx(i)}
                onClick={() => handleSelect(c)}
              >
                <div className="s1-row-name">
                  {highlightText(c.name + (c.lastname ? ` ${c.lastname}` : ''), searchQuery)}
                </div>
                <div className="s1-row-phone">{c.contact_number}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── No results ───────────────────── */}
        {showDropdown && hasSearched && !loading &&
          searchQuery.trim() && searchResults.length === 0 && (
          <div className="s1-dropdown">
            <div className="s1-no-result-msg">
              No client found for "<strong>{searchQuery}</strong>"
            </div>
            <div
              className="s1-row s1-row-create"
              onClick={onCreateNew}
            >
              <div className="s1-row-name">+ Create "{searchQuery}"</div>
              <div className="s1-row-phone">Register as new client</div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default Step1Client;





