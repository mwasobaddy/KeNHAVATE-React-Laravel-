import { useState, useEffect } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

interface Props {
    total: number;
    selectedCount: number;
    onSelectAll: (checked: boolean) => void;
    onExport: (format: 'csv' | 'pdf' | 'docx') => void;
    onDeleteSelected: () => void;
}

export default function SelectionToolbar({ total, selectedCount, onSelectAll, onExport, onDeleteSelected }: Props) {
    const [allChecked, setAllChecked] = useState(false);

    useEffect(() => {
        // if everything selected set allChecked true, if none selected false, otherwise indeterminate visually via CSS (or keep false)
        setAllChecked(selectedCount > 0 && selectedCount === total);
    }, [selectedCount, total]);

    function toggleAll(e: React.ChangeEvent<HTMLInputElement>) {
        const checked = e.target.checked;
        setAllChecked(checked);
        onSelectAll(checked);
    }

    return (
        <div className="flex items-center justify-between p-3 border-b border-[#9B9EA4]/20 flex-wrap space-y-4">
            <div className="flex items-center space-x-3">
                <label className="inline-flex items-center">
                    <input aria-label="Select all items" type="checkbox" checked={allChecked} onChange={toggleAll} className="mr-2 h-4 w-4 rounded border-[#9B9EA4]/30" />
                    <span className="text-sm text-[#231F20] dark:text-[#F8EBD5]">Select all</span>
                </label>

                <span className="text-sm text-[#9B9EA4]">{selectedCount} selected</span>
            </div>

            <div className="flex items-center space-x-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="px-3 py-1 bg-purple-600 text-white rounded flex items-center text-sm shadow-sm hover:opacity-95 transition">
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent>
                        <DropdownMenuItem asChild>
                            <button onClick={() => onExport('csv')} className="w-full text-left">CSV</button>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <button onClick={() => onExport('pdf')} className="w-full text-left">PDF</button>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <button onClick={() => onExport('docx')} className="w-full text-left">Word (.docx)</button>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <button onClick={onDeleteSelected} className="px-3 py-1 bg-red-500 text-white rounded text-sm flex items-center shadow-sm hover:bg-red-600 transition">
                    <Trash2 className="h-4 w-4 mr-2" /> Delete selected
                </button>
            </div>
        </div>
    );
}
