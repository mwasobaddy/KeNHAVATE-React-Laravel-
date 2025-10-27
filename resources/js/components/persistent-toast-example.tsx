// Example usage of persistent toast system
// This demonstrates how toasts persist across page navigation

import { persistentToast } from '@/lib/persistent-toast';

export default function PersistentToastExample() {
    const handleSuccessToast = () => {
        persistentToast.success('This success message will persist across page navigation!');
    };

    const handleErrorToast = () => {
        persistentToast.error('This error message will persist across page navigation!');
    };

    const handleInfoToast = () => {
        persistentToast.info('This info message will persist across page navigation!');
    };

    const handleWarningToast = () => {
        persistentToast.warning('This warning message will persist across page navigation!');
    };

    return (
        <div className="p-6 space-y-4">
            <h2 className="text-xl font-bold">Persistent Toast Demo</h2>
            <p className="text-gray-600">
                Click any button below to show a toast, then navigate to another page.
                The toast will reappear when you return to this page!
            </p>

            <div className="space-x-4">
                <button
                    onClick={handleSuccessToast}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                    Show Success Toast
                </button>

                <button
                    onClick={handleErrorToast}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Show Error Toast
                </button>

                <button
                    onClick={handleInfoToast}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Show Info Toast
                </button>

                <button
                    onClick={handleWarningToast}
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                >
                    Show Warning Toast
                </button>
            </div>
        </div>
    );
}