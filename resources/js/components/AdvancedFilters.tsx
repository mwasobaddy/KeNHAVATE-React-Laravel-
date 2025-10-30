import React, { useState } from 'react';
import { X, ChevronDown, Filter } from 'lucide-react';

export interface FilterOption {
    value: string;
    label: string;
}

export interface FilterConfig {
    key: string;
    label: string;
    type: 'select' | 'date' | 'checkbox' | 'number';
    options?: FilterOption[];
    placeholder?: string;
}

interface Props {
    filters: FilterConfig[];
    onFilterChange: (filters: Record<string, any>) => void;
    visible?: boolean;
}

export default function AdvancedFilters({ 
    filters, 
    onFilterChange, 
    visible = true
}: Props) {
    const [selectedFilters, setSelectedFilters] = useState<Record<string, any>>({});

    const handleFilterChange = (filterKey: string, value: any) => {
        const updated = { ...selectedFilters, [filterKey]: value };
        setSelectedFilters(updated);
        if (onFilterChange) {
            onFilterChange(updated);
        }
    };

    const clearFilter = (filterKey: string) => {
        const updated = { ...selectedFilters };
        delete updated[filterKey];
        setSelectedFilters(updated);
        if (onFilterChange) {
            onFilterChange(updated);
        }
    };

    const clearAllFilters = () => {
        setSelectedFilters({});
        if (onFilterChange) {
            onFilterChange({});
        }
    };

    const activeFilterCount = Object.keys(selectedFilters).filter(
        key => selectedFilters[key] && (!Array.isArray(selectedFilters[key]) || selectedFilters[key].length > 0)
    ).length;

    const renderFilterInput = (filter: FilterConfig) => {
        switch (filter.type) {
            case 'select':
                return (
                    <div key={filter.key} className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-medium text-[#231F20] dark:text-[#F8EBD5] mb-1">
                            {filter.label}
                        </label>
                        <div className="relative">
                            <select
                                value={selectedFilters[filter.key] || ''}
                                onChange={(e) => handleFilterChange(filter.key, e.target.value || undefined)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white dark:bg-[#1F2937]/80 text-[#231F20] dark:text-[#F8EBD5] text-sm"
                            >
                                <option value="">All {filter.label}</option>
                                {filter.options?.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                        </div>
                    </div>
                );

            case 'date':
                return (
                    <div key={filter.key} className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-medium text-[#231F20] dark:text-[#F8EBD5] mb-1">
                            {filter.label}
                        </label>
                        <input
                            type="date"
                            value={selectedFilters[filter.key] || ''}
                            onChange={(e) => handleFilterChange(filter.key, e.target.value || undefined)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[#1F2937]/80 text-[#231F20] dark:text-[#F8EBD5] text-sm"
                        />
                    </div>
                );

            case 'number':
                return (
                    <div key={filter.key} className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-medium text-[#231F20] dark:text-[#F8EBD5] mb-1">
                            {filter.label}
                        </label>
                        <input
                            type="number"
                            value={selectedFilters[filter.key] ?? ''}
                            onChange={(e) => handleFilterChange(filter.key, e.target.value ? Number(e.target.value) : undefined)}
                            placeholder={filter.placeholder}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[#1F2937]/80 text-[#231F20] dark:text-[#F8EBD5] text-sm"
                        />
                    </div>
                );

            case 'checkbox':
                return (
                    <div key={filter.key} className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-medium text-[#231F20] dark:text-[#F8EBD5] mb-1">
                            {filter.label}
                        </label>
                        <div className="space-y-2 pt-2">
                            {filter.options?.map((option) => (
                                <label key={option.value} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={selectedFilters[filter.key]?.includes(option.value) || false}
                                        onChange={(e) => {
                                            const current = selectedFilters[filter.key] || [];
                                            const updated = e.target.checked
                                                ? [...current, option.value]
                                                : current.filter((v: string) => v !== option.value);
                                            handleFilterChange(filter.key, updated.length > 0 ? updated : undefined);
                                        }}
                                        className="w-4 h-4 text-blue-600 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                                    />
                                    <span className="ml-2 text-sm text-[#231F20] dark:text-[#F8EBD5]">{option.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="w-full">
            {/* Filter Content */}
            {visible && (
                <>
                    {/* Active Filters Bar */}
                    {activeFilterCount > 0 && (
                        <div className="mb-3 flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium text-[#231F20] dark:text-[#F8EBD5]">
                                Active Filters:
                            </span>
                            {Object.entries(selectedFilters).map(([key, value]) => {
                                const filter = filters.find((f) => f.key === key);
                                if (!filter || !value || (Array.isArray(value) && value.length === 0)) return null;
                                
                                let displayValue = value;
                                if (Array.isArray(value)) {
                                    displayValue = value.map(v => {
                                        const option = filter.options?.find(opt => opt.value === v);
                                        return option ? option.label : v;
                                    }).join(', ');
                                } else if (filter.type === 'select') {
                                    const option = filter.options?.find(opt => opt.value === value);
                                    displayValue = option ? option.label : value;
                                }

                                return (
                                    <span
                                        key={key}
                                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full"
                                    >
                                        {filter.label}: {displayValue}
                                        <button
                                            onClick={() => clearFilter(key)}
                                            className="hover:text-blue-900 dark:hover:text-blue-300"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </span>
                                );
                            })}
                            <button
                                onClick={clearAllFilters}
                                className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline"
                            >
                                Clear All
                            </button>
                        </div>
                    )}

                    {/* Filter Inputs */}
                    <div className="flex flex-wrap gap-3 mt-4">
                        {filters.map((filter) => renderFilterInput(filter))}
                    </div>
                </>
            )}
        </div>
    );
}
