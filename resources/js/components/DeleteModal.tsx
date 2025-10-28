import React from 'react';

interface Props {
    open: boolean;
    title?: string;
    body?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onCancel: () => void;
    onConfirm: () => void;
}

export default function DeleteModal({ open, title = 'Confirm delete', body = 'Are you sure you want to delete this item?', confirmLabel = 'Delete', cancelLabel = 'Cancel', onCancel, onConfirm }: Props) {
    if (!open) return null;
    function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
        if (e.key === 'Escape') onCancel();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true" aria-label={title} onKeyDown={onKeyDown} tabIndex={-1}>
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
            <div className="bg-white dark:bg-[#4c4843] rounded-lg p-6 z-10 w-full max-w-lg shadow-lg">
                <h3 className="text-lg font-semibold text-[#231F20] dark:text-[#F8EBD5]">{title}</h3>
                <p className="text-sm text-[#9B9EA4] dark:text-[#9B9EA4] mt-2">{body}</p>

                <div className="mt-4 flex justify-end gap-2">
                    <button onClick={onCancel} className="px-3 py-2 rounded bg-gray-100 text-[#231F20]">{cancelLabel}</button>
                    <button onClick={onConfirm} className="px-3 py-2 rounded bg-red-600 text-white shadow-sm hover:bg-red-700">{confirmLabel}</button>
                </div>
            </div>
        </div>
    );
}
