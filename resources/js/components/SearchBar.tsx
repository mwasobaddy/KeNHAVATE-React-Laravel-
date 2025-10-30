import { useEffect, useState, useRef } from 'react';
import { Filter } from 'lucide-react';

interface Props {
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    debounceMs?: number;
    showFilterToggle?: boolean;
    filterVisible?: boolean;
    onFilterToggle?: () => void;
    activeFilterCount?: number;
}

export default function SearchBar({ 
    value = '', 
    onChange, 
    placeholder = 'Search...', 
    debounceMs = 300,
    showFilterToggle = false,
    filterVisible = false,
    onFilterToggle,
    activeFilterCount = 0
}: Props) {
    const [local, setLocal] = useState(value);
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        setLocal(value);
    }, [value]);

    // Debounce updates but include onChange so the effect remains correct
    useEffect(() => {
        const id = setTimeout(() => onChange(local), debounceMs);
        return () => clearTimeout(id);
    }, [local, debounceMs, onChange]);

    function clear() {
        setLocal('');
        // fire immediate change so parent can react
        onChange('');
        inputRef.current?.focus();
    }

    function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === 'Enter') {
            // immediate search on Enter
            e.preventDefault();
            onChange(local);
        }
    }

    return (
        <div className="flex items-center space-x-2">
            <input
                ref={inputRef}
                type="search"
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={placeholder}
                aria-label="Search items"
                className="flex-1 rounded-lg border border-[#9B9EA4]/30 px-3 py-2 text-sm bg-white/80 dark:bg-[#231F20]/80 text-[#231F20] dark:text-[#F8EBD5] focus:ring-2 focus:ring-[#FFF200]/50 focus:border-[#FFF200] transition-all"
            />

            {showFilterToggle && (
                <button
                    onClick={onFilterToggle}
                    className="relative inline-flex items-center justify-center h-9 px-3 rounded-lg bg-gradient-to-r from-[#FFF200] to-[#F2E600] text-[#231F20] hover:from-[#F2E600] hover:to-[#E6D100] transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 font-medium text-sm"
                >
                    <Filter className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">
                        {filterVisible ? 'Hide' : 'Filters'}
                    </span>
                    {activeFilterCount > 0 && (
                        <span className="ml-1 bg-[#231F20] text-[#FFF200] text-xs px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                            {activeFilterCount}
                        </span>
                    )}
                </button>
            )}

            {local.length > 0 ? (
                <button 
                    aria-label="Clear search" 
                    onClick={clear} 
                    className="inline-flex items-center justify-center h-9 w-9 rounded-md bg-[#FFF200] text-[#231F20] hover:bg-[#F2E600] transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M10 8.586l4.95-4.95a1 1 0 011.414 1.414L11.414 10l4.95 4.95a1 1 0 01-1.414 1.414L10 11.414l-4.95 4.95A1 1 0 013.636 14.95L8.586 10 3.636 5.05A1 1 0 015.05 3.636L10 8.586z" clipRule="evenodd" />
                    </svg>
                </button>
            ) : null}
        </div>
    );
}
