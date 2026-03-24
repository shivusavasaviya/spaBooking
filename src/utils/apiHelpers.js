// Format date for API (YYYY-MM-DD -> DD-MM-YYYY)
export const formatDateForAPI = (date) => {
  if (!date) return '';
  if (date.includes('-')) {
    const parts = date.split('-');
    // If already DD-MM-YYYY, return as is
    if (parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
      return date;
    }
    // Convert YYYY-MM-DD to DD-MM-YYYY
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return date;
};

// Format date for display (DD-MM-YYYY -> YYYY-MM-DD)
export const formatDateForDisplay = (date) => {
  if (!date) return '';
  const parts = date.split('-');
  if (parts[0].length === 4) return date; // Already YYYY-MM-DD
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
};

// Build query params dynamically
export const buildQueryParams = (filters, excludeEmpty = true) => {
  const params = {};
  
  Object.keys(filters).forEach(key => {
    const value = filters[key];
    if (!excludeEmpty || (value !== '' && value !== null && value !== undefined)) {
      if (key === 'date' && value) {
        params.daterange = formatDateForAPI(value);
      } else if (key === 'daterange' && value) {
        params.daterange = value;
      } else if (value !== 'all') {
        params[key] = value;
      }
    }
  });
  
  return params;
};

// Parse API response dynamically
export const parseResponse = (response, path = 'data') => {
  if (!response) return null;
  
  // Handle different response structures
  const paths = path.split('.');
  let data = response;
  
  for (const p of paths) {
    if (data && data[p] !== undefined) {
      data = data[p];
    } else {
      return response.data || response;
    }
  }
  
  return data;
};

// Extract error message from API response
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.message) {
    return error.message;
  }
  return 'An unknown error occurred';
};

export const parseAPIResponse = (response, type = 'default') => {
  if (!response) return [];
  
  // Handle different response structures
  if (response.data?.data) return response.data.data;
  if (response.data) return response.data;
  if (Array.isArray(response)) return response;
  if (response.list?.data) return response.list.data;
  
  return [];
};
export const calculateEndTime = (formData) => {
  const [hours, minutes] = formData.startTime.split(':').map(Number);
  const totalMinutes = (hours * 60) + minutes + parseInt(formData.duration);
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}:00`;
};