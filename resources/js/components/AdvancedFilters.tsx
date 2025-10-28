import React from 'react';

interface Props {
    open: boolean;
    onToggle: () => void;
    onApply: (filters: Record<string, any>) => void;
    status?: string | null;
    minRevisions?: number | null;
    collaboration?: boolean | null;
    onStatusChange?: (status: string | null) => void;
    onMinRevisionsChange?: (minRevisions: number | null) => void;
    onCollaborationChange?: (collaboration: boolean | null) => void;
}

export default function AdvancedFilters({
    open,
    onToggle,
    onApply,
    status = null,
    minRevisions = null,
    collaboration = null,
    onStatusChange,
    onMinRevisionsChange,
    onCollaborationChange
}: Props) {
    if (!open) return null;

    function apply() {
        onApply({ status, minRevisions, collaboration });
    }

    function reset() {
        const resetValues = { status: null, minRevisions: null, collaboration: null };
        onStatusChange?.(null);
        onMinRevisionsChange?.(null);
        onCollaborationChange?.(null);
        onApply({});
    }

    return (
        <div className="p-4 border rounded-lg bg-white/80 dark:bg-[#231F20]/90 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-[#231F20] dark:text-[#F8EBD5]">Advanced filters</h4>
                <button onClick={onToggle} className="text-sm text-[#9B9EA4]">Close</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                    <label className="block text-sm mb-1 text-[#9B9EA4]">Status</label>
                    <select aria-label="Filter by status" className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-[#1F2937]/80 text-[#231F20] dark:text-[#F8EBD5]" value={status ?? ''} onChange={(e) => onStatusChange?.(e.target.value || null)}>
                        <option value="">Any</option>
                        <option value="draft">draft</option>
                        <option value="stage 1 review">stage 1 review</option>
                        <option value="stage 2 review">stage 2 review</option>
                        <option value="stage 1 revise">stage 1 revise</option>
                        <option value="stage 2 revise">stage 2 revise</option>
                        <option value="approved">approved</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm mb-1 text-[#9B9EA4]">Min revisions</label>
                    <input aria-label="Minimum revisions" type="number" value={minRevisions ?? ''} onChange={(e) => onMinRevisionsChange?.(e.target.value ? Number(e.target.value) : null)} className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-[#1F2937]/80 text-[#231F20] dark:text-[#F8EBD5]" />
                </div>

                <div>
                    <label className="block text-sm mb-1 text-[#9B9EA4]">Collaboration</label>
                    <select aria-label="Filter by collaboration" className="w-full border rounded px-2 py-1 text-sm bg-white dark:bg-[#1F2937]/80 text-[#231F20] dark:text-[#F8EBD5]" value={collaboration === null ? '' : collaboration ? '1' : '0'} onChange={(e) => onCollaborationChange?.(e.target.value === '' ? null : e.target.value === '1')}>
                        <option value="">Any</option>
                        <option value="1">Enabled</option>
                        <option value="0">Disabled</option>
                    </select>
                </div>
            </div>

            <div className="mt-4 flex gap-2">
                <button onClick={apply} className="px-3 py-1 bg-gray-950 text-white hover:bg-gray-800 dark:bg-gray-200 dark:text-black hover:dark:bg-gray-400 rounded text-sm font-medium shadow-sm">Apply</button>
                <button onClick={reset} className="px-3 py-1 bg-gray-100 rounded text-sm text-[#231F20]">Reset</button>
            </div>
        </div>
    );
}
