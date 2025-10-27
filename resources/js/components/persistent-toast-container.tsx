import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface PersistentToast {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
    timestamp: number;
}

const STORAGE_KEY = 'persistent_toasts';
const TOAST_EXPIRY = 30000; // 30 seconds

export default function PersistentToastContainer() {
    useEffect(() => {
        // Check for stored toasts on mount
        const restoreToasts = () => {
            try {
                const stored = localStorage.getItem(STORAGE_KEY);
                if (!stored) return;

                const storedToasts: PersistentToast[] = JSON.parse(stored);
                const now = Date.now();

                // Import toast dynamically to avoid circular dependency
                import('react-toastify').then(({ toast }) => {
                    // Filter out expired toasts and show valid ones
                    storedToasts.forEach(storedToast => {
                        const isExpired = (now - storedToast.timestamp) > TOAST_EXPIRY;

                        if (!isExpired) {
                            // Show the toast
                            switch (storedToast.type) {
                                case 'success':
                                    toast.success(storedToast.message);
                                    break;
                                case 'error':
                                    toast.error(storedToast.message);
                                    break;
                                case 'info':
                                    toast.info(storedToast.message);
                                    break;
                                case 'warning':
                                    toast.warning(storedToast.message);
                                    break;
                            }
                        }
                    });

                    // Clear stored toasts after displaying
                    localStorage.removeItem(STORAGE_KEY);
                });
            } catch (error) {
                console.warn('Failed to restore persistent toasts:', error);
                // Clear potentially corrupted data
                localStorage.removeItem(STORAGE_KEY);
            }
        };

        restoreToasts();
    }, []);

    return (
        <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
        />
    );
}