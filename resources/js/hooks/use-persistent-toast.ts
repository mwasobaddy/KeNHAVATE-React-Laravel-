import { useEffect } from 'react';
import { toast } from 'react-toastify';

interface PersistentToast {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    timestamp: number;
}

const STORAGE_KEY = 'persistent_toasts';
const TOAST_EXPIRY = 30000; // 30 seconds

export const usePersistentToast = () => {
    // Function to store a toast for persistence
    const storeToast = (type: PersistentToast['type'], message: string) => {
        const storedToasts = getStoredToasts();
        const newToast: PersistentToast = {
            id: Date.now().toString(),
            type,
            message,
            timestamp: Date.now(),
        };

        storedToasts.push(newToast);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(storedToasts));

        // Also show the toast immediately
        showToast(type, message);
    };

    // Function to show a toast
    const showToast = (type: PersistentToast['type'], message: string) => {
        switch (type) {
            case 'success':
                toast.success(message);
                break;
            case 'error':
                toast.error(message);
                break;
            case 'info':
                toast.info(message);
                break;
            case 'warning':
                toast.warning(message);
                break;
        }
    };

    // Function to get stored toasts
    const getStoredToasts = (): PersistentToast[] => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch {
            return [];
        }
    };

    // Function to clear stored toasts
    const clearStoredToasts = () => {
        localStorage.removeItem(STORAGE_KEY);
    };

    // Effect to restore toasts on mount
    useEffect(() => {
        const storedToasts = getStoredToasts();
        const now = Date.now();

        // Filter out expired toasts and show valid ones
        const validToasts = storedToasts.filter(toast => {
            const isExpired = (now - toast.timestamp) > TOAST_EXPIRY;
            if (!isExpired) {
                showToast(toast.type, toast.message);
            }
            return false; // Remove all stored toasts after displaying
        });

        // Clear all stored toasts since we've displayed them
        if (storedToasts.length > 0) {
            clearStoredToasts();
        }
    }, []);

    return {
        success: (message: string) => storeToast('success', message),
        error: (message: string) => storeToast('error', message),
        info: (message: string) => storeToast('info', message),
        warning: (message: string) => storeToast('warning', message),
    };
};