import toast from 'react-hot-toast';

// Track active toasts to prevent duplicates
const activeToasts = new Set();
const lastErrorTime = new Map();
const ERROR_COOLDOWN = 3000; // 3 seconds between similar errors

// Backend connection state
let backendConnectionStatus = {
  isOnline: true,
  lastChecked: null,
  connectionErrorShown: false
};

// Default toast styles
const defaultStyles = {
  success: {
    duration: 3000,
    style: {
      background: '#10B981',
      color: '#fff',
      padding: '12px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      maxWidth: '400px',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#10B981',
    },
  },
  error: {
    duration: 4000,
    style: {
      background: '#EF4444',
      color: '#fff',
      padding: '12px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      maxWidth: '400px',
    },
    iconTheme: {
      primary: '#fff',
      secondary: '#EF4444',
    },
  },
  loading: {
    style: {
      background: '#3B82F6',
      color: '#fff',
      padding: '12px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '500',
      maxWidth: '400px',
    },
  }
};

// Check if error is a connection/backend error
const isConnectionError = (error) => {
  if (!error) return false;
  
  const errorMessage = error.message || error.toString().toLowerCase();
  const statusCode = error.response?.status;
  
  return (
    !error.response || // Network error
    statusCode >= 500 || // Server errors
    statusCode === 0 || // No connection
    errorMessage.includes('network error') ||
    errorMessage.includes('failed to fetch') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('no response from server')
  );
};

// Get user-friendly error message
const getErrorMessage = (error) => {
  if (isConnectionError(error)) {
    return 'Unable to connect to server. Please check if the backend is running.';
  }
  
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};

// Create unique toast ID
const createToastId = (type, message) => {
  return `${type}-${message.substring(0, 50).replace(/\s+/g, '-')}`;
};

// Check if we should show this toast (rate limiting)
const shouldShowToast = (type, message) => {
  const toastId = createToastId(type, message);
  const now = Date.now();
  
  // For connection errors, show only one per session until resolved
  if (type === 'connection-error') {
    if (backendConnectionStatus.connectionErrorShown) {
      return false;
    }
    backendConnectionStatus.connectionErrorShown = true;
    return true;
  }
  
  // Rate limiting for other errors
  if (type === 'error') {
    const lastTime = lastErrorTime.get(toastId);
    if (lastTime && (now - lastTime) < ERROR_COOLDOWN) {
      return false;
    }
    lastErrorTime.set(toastId, now);
  }
  
  // Prevent duplicate active toasts
  if (activeToasts.has(toastId)) {
    return false;
  }
  
  return true;
};

// Enhanced toast manager
class ToastManager {
  success(message, options = {}) {
    const toastId = createToastId('success', message);
    
    if (!shouldShowToast('success', message)) {
      return null;
    }
    
    activeToasts.add(toastId);
    
    const toastResult = toast.success(message, {
      ...defaultStyles.success,
      ...options,
      onClose: () => {
        activeToasts.delete(toastId);
        options.onClose?.();
      }
    });
    
    // Auto-remove from tracking after duration
    setTimeout(() => {
      activeToasts.delete(toastId);
    }, options.duration || defaultStyles.success.duration);
    
    return toastResult;
  }
  
  error(error, customMessage = null, options = {}) {
    const message = customMessage || getErrorMessage(error);
    const isConnError = isConnectionError(error);
    const type = isConnError ? 'connection-error' : 'error';
    
    if (!shouldShowToast(type, message)) {
      return null;
    }
    
    const toastId = createToastId(type, message);
    activeToasts.add(toastId);
    
    // Special handling for connection errors
    if (isConnError) {
      const connectionMessage = '🔌 Backend Connection Lost\n\nPlease start the backend server and try again.';
      
      const toastResult = toast.error(connectionMessage, {
        ...defaultStyles.error,
        duration: 6000, // Longer duration for connection errors
        ...options,
        onClose: () => {
          activeToasts.delete(toastId);
          backendConnectionStatus.connectionErrorShown = false; // Allow showing again
          options.onClose?.();
        }
      });
      
      setTimeout(() => {
        activeToasts.delete(toastId);
        backendConnectionStatus.connectionErrorShown = false;
      }, 6000);
      
      return toastResult;
    }
    
    // Regular error handling
    const toastResult = toast.error(message, {
      ...defaultStyles.error,
      ...options,
      onClose: () => {
        activeToasts.delete(toastId);
        options.onClose?.();
      }
    });
    
    setTimeout(() => {
      activeToasts.delete(toastId);
    }, options.duration || defaultStyles.error.duration);
    
    return toastResult;
  }
  
  loading(message, options = {}) {
    const toastId = createToastId('loading', message);
    
    // Don't prevent duplicate loading toasts as they're usually manually managed
    activeToasts.add(toastId);
    
    const toastResult = toast.loading(message, {
      ...defaultStyles.loading,
      ...options
    });
    
    // Create a custom dismiss function that cleans up tracking
    const originalDismiss = () => {
      toast.dismiss(toastResult);
      activeToasts.delete(toastId);
    };
    
    return {
      ...toastResult,
      dismiss: originalDismiss,
      id: toastResult
    };
  }
  
  dismiss(toastId) {
    if (toastId?.id) {
      toast.dismiss(toastId.id);
    } else {
      toast.dismiss(toastId);
    }
  }
  
  // Method to clear connection error state (call when backend comes back online)
  clearConnectionError() {
    backendConnectionStatus.connectionErrorShown = false;
    backendConnectionStatus.isOnline = true;
  }
  
  // Method to manually set backend status
  setBackendStatus(isOnline) {
    backendConnectionStatus.isOnline = isOnline;
    if (isOnline) {
      this.clearConnectionError();
    }
  }
  
  // Clear all active toasts
  clearAll() {
    toast.dismiss();
    activeToasts.clear();
  }
  
  // Get backend status
  getBackendStatus() {
    return backendConnectionStatus;
  }
}

// Create singleton instance
const toastManager = new ToastManager();

export default toastManager;

// Export individual methods for backward compatibility
export const { success: showSuccess, error: showError, loading: showLoading, dismiss, clearAll } = toastManager; 