import React, { useState } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';

interface FilterOption {
    value: string;
    label: string;
}

interface FilterConfig {
    key: string;
    label: string;
    type: 'select' | 'search' | 'date' | 'checkbox' | 'number';
    options?: FilterOption[];
    placeholder?: string;
}

interface Props {
    filters: FilterConfig[];
    onFilterChange: (filters: Record<string, any>) => void;
}

export default function AdvancedFilters({ filters, onFilterChange }: Props) {
    const [isOpen, setIsOpen] = useState(false);
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
                    <div key={filter.key} className="mb-4">
                        <label className="block text-sm font-medium text-[#231F20] dark:text-[#F8EBD5] mb-2">
                            {filter.label}
                        </label>
                        <div className="relative">
                            <select
                                value={selectedFilters[filter.key] || ''}
                                onChange={(e) => handleFilterChange(filter.key, e.target.value || undefined)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white dark:bg-[#1F2937]/80 text-[#231F20] dark:text-[#F8EBD5]"
                            >
                                <option value="">All {filter.label}</option>
                                {filter.options?.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
                        </div>
                    </div>
                );

            case 'search':
                return (
                    <div key={filter.key} className="mb-4">
                        <label className="block text-sm font-medium text-[#231F20] dark:text-[#F8EBD5] mb-2">
                            {filter.label}
                        </label>
                        <input
                            type="text"
                            value={selectedFilters[filter.key] || ''}
                            onChange={(e) => handleFilterChange(filter.key, e.target.value || undefined)}
                            placeholder={filter.placeholder || `Search ${filter.label.toLowerCase()}...`}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[#1F2937]/80 text-[#231F20] dark:text-[#F8EBD5]"
                        />
                    </div>
                );

            case 'date':
                return (
                    <div key={filter.key} className="mb-4">
                        <label className="block text-sm font-medium text-[#231F20] dark:text-[#F8EBD5] mb-2">
                            {filter.label}
                        </label>
                        <input
                            type="date"
                            value={selectedFilters[filter.key] || ''}
                            onChange={(e) => handleFilterChange(filter.key, e.target.value || undefined)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[#1F2937]/80 text-[#231F20] dark:text-[#F8EBD5]"
                        />
                    </div>
                );

            case 'number':
                return (
                    <div key={filter.key} className="mb-4">
                        <label className="block text-sm font-medium text-[#231F20] dark:text-[#F8EBD5] mb-2">
                            {filter.label}
                        </label>
                        <input
                            type="number"
                            value={selectedFilters[filter.key] ?? ''}
                            onChange={(e) => handleFilterChange(filter.key, e.target.value ? Number(e.target.value) : undefined)}
                            placeholder={filter.placeholder}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-[#1F2937]/80 text-[#231F20] dark:text-[#F8EBD5]"
                        />
                    </div>
                );

            case 'checkbox':
                return (
                    <div key={filter.key} className="mb-4">
                        <label className="block text-sm font-medium text-[#231F20] dark:text-[#F8EBD5] mb-2">
                            {filter.label}
                        </label>
                        <div className="space-y-2">
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
        <div className="relative">
            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#231F20]/90 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
                <Filter className="w-4 h-4 text-[#231F20] dark:text-[#F8EBD5]" />
                <span className="font-medium text-[#231F20] dark:text-[#F8EBD5]">Filters</span>
                {activeFilterCount > 0 && (
                    <span className="bg-blue-600 dark:bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {activeFilterCount}
                    </span>
                )}
            </button>

            {/* Filter Panel */}
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    
                    {/* Filter Panel */}
                    <div className="absolute top-full mt-2 right-0 w-80 bg-white dark:bg-[#231F20]/95 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 backdrop-blur-sm">
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-[#231F20] dark:text-[#F8EBD5]">Filter Options</h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Active Filters */}
                            {activeFilterCount > 0 && (
                                <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-[#231F20] dark:text-[#F8EBD5]">Active Filters</span>
                                        <button
                                            onClick={clearAllFilters}
                                            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
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
                                                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full"
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
                                    </div>
                                </div>
                            )}

                            {/* Filter Inputs */}
                            <div className="max-h-96 overflow-y-auto">
                                {filters.map((filter) => renderFilterInput(filter))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
