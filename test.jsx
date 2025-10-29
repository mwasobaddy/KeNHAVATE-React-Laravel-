import React, { useState } from 'react';
import { Filter, X, ChevronDown } from 'lucide-react';

const FilterComponent = ({ filters = [], onFilterChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({});

  const handleFilterChange = (filterKey, value) => {
    const updated = { ...selectedFilters, [filterKey]: value };
    setSelectedFilters(updated);
    if (onFilterChange) {
      onFilterChange(updated);
    }
  };

  const clearFilter = (filterKey) => {
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

  const activeFilterCount = Object.keys(selectedFilters).length;

  const renderFilterInput = (filter) => {
    switch (filter.type) {
      case 'select':
        return (
          <div key={filter.key} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {filter.label}
            </label>
            <div className="relative">
              <select
                value={selectedFilters[filter.key] || ''}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value="">All {filter.label}</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        );

      case 'search':
        return (
          <div key={filter.key} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {filter.label}
            </label>
            <input
              type="text"
              value={selectedFilters[filter.key] || ''}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              placeholder={filter.placeholder || `Search ${filter.label.toLowerCase()}...`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        );

      case 'date':
        return (
          <div key={filter.key} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {filter.label}
            </label>
            <input
              type="date"
              value={selectedFilters[filter.key] || ''}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        );

      case 'checkbox':
        return (
          <div key={filter.key} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {filter.label}
            </label>
            <div className="space-y-2">
              {filter.options.map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedFilters[filter.key]?.includes(option.value) || false}
                    onChange={(e) => {
                      const current = selectedFilters[filter.key] || [];
                      const updated = e.target.checked
                        ? [...current, option.value]
                        : current.filter((v) => v !== option.value);
                      handleFilterChange(filter.key, updated.length > 0 ? updated : undefined);
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option.label}</span>
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
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Filter className="w-4 h-4" />
        <span className="font-medium">Filters</span>
        {activeFilterCount > 0 && (
          <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Filter Panel */}
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filter Options</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Active Filters */}
            {activeFilterCount > 0 && (
              <div className="mb-4 pb-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Active Filters</span>
                  <button
                    onClick={clearAllFilters}
                    className="text-xs text-blue-600 hover:text-blue-700"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(selectedFilters).map(([key, value]) => {
                    const filter = filters.find((f) => f.key === key);
                    if (!filter || !value || (Array.isArray(value) && value.length === 0)) return null;
                    return (
                      <span
                        key={key}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                      >
                        {filter.label}: {Array.isArray(value) ? value.join(', ') : value}
                        <button
                          onClick={() => clearFilter(key)}
                          className="hover:text-blue-900"
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
      )}
    </div>
  );
};

// Example Usage
const ExampleUsage = () => {
  const [appliedFilters, setAppliedFilters] = useState({});

  // Example filters for Users page
  const userFilters = [
    {
      key: 'accountStatus',
      label: 'Account Status',
      type: 'select',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'suspended', label: 'Suspended' }
      ]
    },
    {
      key: 'role',
      label: 'User Role',
      type: 'checkbox',
      options: [
        { value: 'admin', label: 'Admin' },
        { value: 'user', label: 'User' },
        { value: 'guest', label: 'Guest' }
      ]
    },
    {
      key: 'search',
      label: 'Search',
      type: 'search',
      placeholder: 'Search by name or email...'
    },
    {
      key: 'createdDate',
      label: 'Created After',
      type: 'date'
    }
  ];

  // Example filters for Orders page
  const orderFilters = [
    {
      key: 'orderStatus',
      label: 'Order Status',
      type: 'select',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'processing', label: 'Processing' },
        { value: 'completed', label: 'Completed' },
        { value: 'cancelled', label: 'Cancelled' }
      ]
    },
    {
      key: 'orderDate',
      label: 'Order Date',
      type: 'date'
    }
  ];

  const [currentFilters, setCurrentFilters] = useState(userFilters);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Users Page</h1>
            <div className="flex gap-4">
              <button
                onClick={() => setCurrentFilters(userFilters)}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Switch to User Filters
              </button>
              <button
                onClick={() => setCurrentFilters(orderFilters)}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Switch to Order Filters
              </button>
              <FilterComponent
                filters={currentFilters}
                onFilterChange={setAppliedFilters}
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Applied Filters:</h3>
            <pre className="text-sm text-gray-600">
              {JSON.stringify(appliedFilters, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExampleUsage;