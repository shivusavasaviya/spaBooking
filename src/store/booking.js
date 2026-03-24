import { create } from 'zustand';
import { api } from '../services/axiosService';
import { logger } from '../services/logger';

const today = new Date().toISOString().split('T')[0];

// YYYY-MM-DD → DD-MM-YYYY
const toApiDate = (d) => (d ? d.split('-').reverse().join('-') : '');

const useBooking = create((set, get) => ({
  bookings:        [],
  therapists:      [],
  rooms:           [],
  servicesData:    null,
  customers:       [],
  selectedBooking: null,
  isPanelOpen:     false,
  loading:         false,
  error:           null,

  filters: {
    date:        today,
    therapist:   '',
    service:     '',
    status:      '',
    search:      '',
    outlet:      1,
    outlet_type: 2,
    country:     '196',
    per_page:    50,
  },

  // ── THERAPISTS ─────────────────────────────────────────
  // Try multiple param combos since API may differ
  fetchTherapists: async () => {
    set({ loading: true });
    try {
      const { filters } = get();
      const dateApi = toApiDate(filters.date);

      // Try without availability filter first (more permissive)
      const response = await api.get('/therapists', {
        params: {
          outlet:      filters.outlet,
          outlet_type: filters.outlet_type,
          status:      1,
          service_at:  `${dateApi} 00:00:00`,
          pagination:  0,
          per_page:    100,
        },
      });

      const raw = response.data;

      // Try every possible path
      let list =
        raw?.data?.data?.list?.staffs  ||
        raw?.data?.data?.staffs        ||
        [];

      if (!Array.isArray(list)) list = Object.values(list || {});

      set({ therapists: list, loading: false });
    } catch (err) {
      logger.error('fetchTherapists failed', err);
      set({ error: err.response?.data?.message || err.message, loading: false });
    }
  },

  // ── BOOKINGS ───────────────────────────────────────────
  fetchBookings: async () => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      const dateApi = toApiDate(filters.date);

      const params = {
        pagination: 1,
        per_page:   filters.per_page,
        country:    filters.country,
        outlet:     filters.outlet,
        daterange:  `${dateApi}/${dateApi}`,
        ...(filters.therapist && { therapist:   filters.therapist }),
        ...(filters.service   && { service:     filters.service }),
        ...(filters.status    && { status:      filters.status }),
        ...(filters.search    && { search_text: filters.search }),
      };

      const response = await api.get('/bookings', { params });
      const raw = response.data;
      let list =
        raw?.data?.data?.list?.bookings ||
        raw?.data?.data?.list?.data     ||
        [];

      if (!Array.isArray(list)) list = [];
      set({ bookings: list, loading: false });
    } catch (err) {
      logger.error('fetchBookings failed', err);
      set({ error: err.response?.data?.message || err.message, loading: false });
    }
  },

  // ── ROOMS ──────────────────────────────────────────────
  fetchRooms: async (serviceId = null, duration = 60) => {
    try {
      const { filters } = get();
      const response = await api.get(`/room-bookings/outlet/${filters.outlet}`, {
        params: {
          date:       toApiDate(filters.date),
          panel:      'outlet',
          duration,
          // service_id: serviceId || '',
        },
      });
      const rooms = response.data?.data || response.data?.data?.data || [];
      set({ rooms: Array.isArray(rooms) ? rooms : [] });
    } catch (err) { logger.error('fetchRooms failed', err); }
  },

  // ── SERVICES ───────────────────────────────────────────
  fetchServices: async () => {
    try {
      const { filters } = get();
      const response = await api.get('/service-category', {
        params: {
          outlet_type: filters.outlet_type,
          outlet:      filters.outlet,
          status:      1,
          pagination:  1,
          per_page:    100,
        },
      });
      const raw = response.data?.data?.data || response.data?.data || null;
      set({ servicesData: raw });
    } catch (err) { logger.error('fetchServices failed', err); }
  },

  // ── CUSTOMERS ──────────────────────────────────────────
  fetchCustomers: async (q = '') => {
    try {
      const { filters } = get();
      const response = await api.get('/users', {
        params: { search_text: q, per_page: 50, pagination: 1, outlet: filters.outlet },
      });
      const data = response.data?.data?.data;
      set({ customers: data?.list?.users || [] });
    } catch (err) { logger.error('fetchCustomers failed', err); }
  },

  createCustomer: async (fd) => {
    const r = await api.post('/users/create', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return r;
  },

  // ── CREATE BOOKING ─────────────────────────────────────
  createBooking: async (bookingData) => {
    set({ loading: true });
    try {
      const fd = new FormData();
      const append = (k, v) => fd.append(k, v ?? '');
      append('company',        '1');
      append('outlet',         bookingData.outlet       || '1');
      append('outlet_type',    bookingData.outlet_type  || '1');
      append('booking_type',   bookingData.booking_type || '1');
      append('customer',       bookingData.customer     || '0');
      append('created_by',     localStorage.getItem('userId') || '6');
      append('panel',          'outlet');

      if (bookingData.items?.length) {
        fd.append('items', JSON.stringify(bookingData.items.map((item, i) => ({
          ...item,
          item_number:     i + 1,
          service:         parseInt(item.service)   || null,
          duration:        String(item.duration),
          therapist:       item.therapist ? parseInt(item.therapist) : null,
          price:           String(item.price),
          quantity:        String(item.quantity),
          customer_name:   item.customer_name       || 'Guest',
          user:            'primary',
          pair:            item.pair                || 0,
          room:            item.room ? parseInt(item.room) : null,
          service_request: item.service_request     || '',
          voucher_code:    item.voucher_code        || null,
        }))));
      }

      append('sub_total',      bookingData.sub_total    || '0');
      append('gst_rate',       '9');
      append('grand_total',    bookingData.grand_total  || '0');
      append('currency',       'SGD');
      append('source',         bookingData.source       || 'walkin');
      append('payment_type',   bookingData.payment_type || 'payatstore');
      append('payment_status', '1');
      append('service_at',     bookingData.service_at);
      append('note',           bookingData.note         || '');
      append('membership',     '0');
      append('newsletter',     '0');
      append('voucher_code',   bookingData.voucher_code || '');

      const r = await api.post('/bookings/create', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await get().fetchBookings();
      set({ loading: false });
      return r.data;
    } catch (err) {
      logger.error('createBooking failed', err);
      set({ error: err.response?.data?.message || err.message, loading: false });
      throw err;
    }
  },

  updateBooking: async (id, updates) => {
    set({ loading: true });
    try {
      const fd = new FormData();
      Object.keys(updates).forEach((k) => {
        fd.append(k, k === 'items' && Array.isArray(updates[k])
          ? JSON.stringify(updates[k]) : updates[k]);
      });
      const r = await api.post(`/bookings/${id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await get().fetchBookings();
      set({ loading: false });
      return r.data;
    } catch (err) {
      logger.error('updateBooking failed', err);
      set({ error: err.response?.data?.message || err.message, loading: false });
      throw err;
    }
  },

cancelBooking: async (bookingId, cancelType) => {
  set({ loading: true });
  try {
    const fd = new FormData();
    fd.append('company', '1');
    fd.append('id', bookingId);
    fd.append('type', cancelType);
    fd.append('panel', 'outlet');
    
    const response = await api.post('/bookings/item/cancel', fd, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    await get().fetchBookings();
    set({ loading: false });
    return response.data;
  } catch (err) {
    logger.error('cancelBooking failed', err);
    set({ error: err.response?.data?.message || err.message, loading: false });
    throw err;
  }
},

// Delete Booking
deleteBooking: async (id) => {
  set({ loading: true });
  try {
    await api.delete(`/bookings/destroy/${id}`);
    await get().fetchBookings();
    set({ loading: false });
    logger.info('Booking deleted', id);
  } catch (err) {
    logger.error('deleteBooking failed', err);
    set({ error: err.response?.data?.message || err.message, loading: false });
    throw err;
  }
},



  fetchAllDropdownData: async () => {
    await Promise.allSettled([
      get().fetchTherapists(),
      get().fetchServices(),
      get().fetchRooms(),
    ]);
  },

  setFilters: (newFilters) => {
    set((s) => ({ filters: { ...s.filters, ...newFilters } }));
    const keys = Object.keys(newFilters);
    if (keys.includes('date')) {
      get().fetchBookings();
      get().fetchTherapists();
    } else {
      get().fetchBookings();
    }
  },

  selectBooking: (b) => set({ selectedBooking: b, isPanelOpen: true }),
  closePanel:    ()  => set({ isPanelOpen: false, selectedBooking: null }),
  clearError:    ()  => set({ error: null }),
}));

export default useBooking;
