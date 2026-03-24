// Toast notification service
let toastCallback = null;

export const setToastCallback = (callback) => {
  toastCallback = callback;
};

export const showToast = (message, type = 'success', duration = 3000) => {
  if (toastCallback) {
    toastCallback({ message, type, duration });
  }
};

export const toast = {
  success: (message, duration = 3000) => showToast(message, 'success', duration),
  error: (message, duration = 4000) => showToast(message, 'error', duration),
  info: (message, duration = 3000) => showToast(message, 'info', duration),
  warning: (message, duration = 3000) => showToast(message, 'warning', duration)
};