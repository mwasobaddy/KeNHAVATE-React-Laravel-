import { toast } from 'react-toastify';

interface PersistentToast {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    timestamp: number;
}

const STORAGE_KEY = 'persistent_toasts';

/**
 * Utility function to show persistent toasts that survive page navigation
 */
export const persistentToast = {
    success: (message: string) => {
        storeToast('success', message);
        toast.success(message);
    },

    error: (message: string) => {
        storeToast('error', message);
        toast.error(message);
    },

    info: (message: string) => {
        storeToast('info', message);
        toast.info(message);
    },

    warning: (message: string) => {
        storeToast('warning', message);
        toast.warning(message);
    },
};

/**
 * Store a toast in localStorage for persistence across page navigations
 */
function storeToast(type: PersistentToast['type'], message: string) {
    try {
        const storedToasts = getStoredToasts();
        const newToast: PersistentToast = {
            id: Date.now().toString(),
            type,
            message,
            timestamp: Date.now(),
        };

        storedToasts.push(newToast);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storedToasts));
    } catch (error) {
        console.warn('Failed to store persistent toast:', error);
    }
}

/**
 * Get stored toasts from localStorage
 */
function getStoredToasts(): PersistentToast[] {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

/**
 * Clear all stored toasts (useful for cleanup)
 */
export const clearPersistentToasts = () => {
    localStorage.removeItem(STORAGE_KEY);
};