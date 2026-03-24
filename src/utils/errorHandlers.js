export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    return {
      status: error.response.status,
      message: error.response.data?.message || 'Server error',
      data: error.response.data
    };
  } else if (error.request) {
    // No response
    return {
      status: 0,
      message: 'Network error - no response from server'
    };
  } else {
    // Other errors
    return {
      status: -1,
      message: error.message
    };
  }
};