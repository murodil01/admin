import { useState, useEffect } from 'react';
import { Search, X, Calendar, User, Tag, Filter } from 'lucide-react';
import api from '../../../api/base';
import { getMSalesUsers } from '../../../api/services/userService';

const FilterPanel = ({ 
  searchQuery, 
  setSearchQuery, 
  filterBy, 
  setFilterBy, 
  onClose, 
  onReset,
  boardId,
  allLeads
}) => {
  const [statuses, setStatuses] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load filter options
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        setLoading(true);
        
        // Load statuses
        if (boardId) {
          const statusRes = await api.get(`/board/status/${boardId}/`);
          setStatuses(statusRes.data || []);
        }

        // Load users
        const usersRes = await getMSalesUsers();
        setUsers(usersRes.data || []);

      } catch (error) {
        console.error('Failed to load filter options:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFilterOptions();
  }, [boardId]);

  // Get unique sources from leads
  const getUniqueSources = () => {
    const sources = allLeads
      .map(lead => lead.link)
      .filter(Boolean)
      .filter((source, index, arr) => arr.indexOf(source) === index);
    
    return sources.map(source => ({
      value: source,
      label: source.charAt(0).toUpperCase() + source.slice(1)
    }));
  };

  const handleStatusChange = (statusId) => {
    setFilterBy(prev => ({
      ...prev,
      status: statusId || null
    }));
  };

  const handleOwnerChange = (ownerId) => {
    setFilterBy(prev => ({
      ...prev,
      owner: ownerId || null
    }));
  };

  const handleSourceChange = (source) => {
    setFilterBy(prev => ({
      ...prev,
      source: source || null
    }));
  };

  const handleDateRangeChange = (field, value) => {
    setFilterBy(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-center">Loading filters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-blue-600" />
            <h2 className="text-xl font-semibold">Filter Leads</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* Search */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Search size={16} />
              Search
            </label>
            <input
              type="text"
              placeholder="Search by name, phone, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Tag size={16} />
              Status
            </label>
            <select
              value={filterBy.status || ''}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              {statuses?.map(status => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>

          {/* Owner Filter */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <User size={16} />
              Owner
            </label>
            <select
              value={filterBy.owner || ''}
              onChange={(e) => handleOwnerChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Owners</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.fullname || `${user.first_name} ${user.last_name}`.trim() || user.email}
                </option>
              ))}
            </select>
          </div>

          {/* Source Filter */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Tag size={16} />
              Source
            </label>
            <select
              value={filterBy.source || ''}
              onChange={(e) => handleSourceChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Sources</option>
              {getUniqueSources().map(source => (
                <option key={source.value} value={source.value}>
                  {source.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range Filter */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Calendar size={16} />
              Timeline
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">From</label>
                <input
                  type="date"
                  value={filterBy.dateRange?.start || ''}
                  onChange={(e) => handleDateRangeChange('start', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">To</label>
                <input
                  type="date"
                  value={filterBy.dateRange?.end || ''}
                  onChange={(e) => handleDateRangeChange('end', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Filter Summary */}
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Active Filters:</h3>
            <div className="flex flex-wrap gap-2">
              
              {searchQuery && (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')}>
                    <X size={12} />
                  </button>
                </span>
              )}
              
              {filterBy.status && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                  Status: {statuses.find(s => s.id == filterBy.status)?.name}
                  <button onClick={() => handleStatusChange(null)}>
                    <X size={12} />
                  </button>
                </span>
              )}
              
              {filterBy.owner && (
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                  Owner: {users.find(u => u.id == filterBy.owner)?.fullname || 'Unknown'}
                  <button onClick={() => handleOwnerChange(null)}>
                    <X size={12} />
                  </button>
                </span>
              )}
              
              {filterBy.source && (
                <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                  Source: {filterBy.source}
                  <button onClick={() => handleSourceChange(null)}>
                    <X size={12} />
                  </button>
                </span>
              )}
              
              {(filterBy.dateRange?.start || filterBy.dateRange?.end) && (
                <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs flex items-center gap-1">
                  Date: {filterBy.dateRange?.start || '...'} - {filterBy.dateRange?.end || '...'}
                  <button onClick={() => setFilterBy(prev => ({ ...prev, dateRange: null }))}>
                    <X size={12} />
                  </button>
                </span>
              )}
              
              {!searchQuery && !filterBy.status && !filterBy.owner && !filterBy.source && !filterBy.dateRange?.start && !filterBy.dateRange?.end && (
                <span className="text-gray-500 text-xs">No filters applied</span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onReset}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 font-medium"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;