import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown, Plus, Search, MessageSquare, User, Calendar, Hash, File, Link, FileText, BarChart3, CheckSquare, Calculator } from 'lucide-react';

const CollapsibleTable = () => {
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  // Button handler example
  const handleTopButtonClick = () => {
    setShowNewLeadModal(true);
  };
  const [isExpanded, setIsExpanded] = useState(false);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const buttonRef = useRef(null);
  
  const items = [
    { id: 1, name: 'New item', person: null, status: null, date: null },
    { id: 2, name: 'Item 1', person: 'User', status: 'Working on it', date: 'Aug 10' },
    { id: 3, name: 'Item 2', person: null, status: 'Done', date: 'Aug 11' },
    { id: 4, name: 'Item 3', person: null, status: null, date: 'Aug 10' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Done':
        return 'bg-green-500';
      case 'Working on it':
        return 'bg-orange-400';
      default:
        return 'bg-gray-400';
    }
  };

  const columnTypes = {
    essentials: [
      { name: 'Status', icon: <div className="w-3 h-3 bg-green-500 rounded-sm"></div>, color: 'bg-green-500' },
      { name: 'Text', icon: <div className="w-3 h-3 bg-orange-400 rounded-sm flex items-center justify-center text-white text-xs font-bold">T</div>, color: 'bg-orange-400' },
      { name: 'People', icon: <User className="w-3 h-3 text-white" />, color: 'bg-blue-400' },
      { name: 'Dropdown', icon: <div className="w-3 h-3 bg-green-500 rounded-sm"></div>, color: 'bg-green-500' },
      { name: 'Date', icon: <Calendar className="w-3 h-3 text-white" />, color: 'bg-purple-500' },
      { name: 'Numbers', icon: <Hash className="w-3 h-3 text-white" />, color: 'bg-yellow-500' }
    ],
    superUseful: [
      { name: 'Files', icon: <File className="w-3 h-3 text-white" />, color: 'bg-red-400' },
      { name: 'Connect...', icon: <Link className="w-3 h-3 text-white" />, color: 'bg-red-400' },
      { name: 'monday Doc', icon: <FileText className="w-3 h-3 text-white" />, color: 'bg-red-400' },
      { name: 'Timeline', icon: <BarChart3 className="w-3 h-3 text-white" />, color: 'bg-purple-500' },
      { name: 'Checkbox', icon: <CheckSquare className="w-3 h-3 text-white" />, color: 'bg-orange-400' },
      { name: 'Formula', icon: <Calculator className="w-3 h-3 text-white" />, color: 'bg-teal-500' }
    ]
  };

  const statusSegments = [
    { color: 'bg-green-500', width: '25%' },
    { color: 'bg-orange-400', width: '25%' },
    { color: 'bg-gray-400', width: '50%' }
  ];

  useEffect(() => {
    if (!showColumnSelector) return;

    const handleClickOutside = (event) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target) &&
          !event.target.closest('.column-selector')) {
        setShowColumnSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showColumnSelector]);

  return (
  <div className="text-gray-700 w-full max-w-6xl mx-auto rounded-xl ">
      {/* Top Blue/White Button */}
      <div className="flex items-center justify-end p-4">
        <button
          onClick={handleTopButtonClick}
          className="bg-[#2563eb] hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors focus:outline-none border-none shadow-none"
          style={{ background: '#2563eb', color: '#fff', border: 'none', boxShadow: 'none' }}
        >
          Yangi Lead
        </button>
      </div>
      {/* Collapsed State */}
      <div 
        className="flex items-center justify-between p-4 bg-[#f1f6fd] cursor-pointer hover:bg-blue-100 transition-colors rounded-t-xl border-b border-blue-100 shadow"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
          <span className="text-gray-700 font-semibold">Leads</span>
          <span className="text-gray-400 text-sm">4 Items</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">Status</span>
          <div className="flex bg-gray-200 rounded h-4 w-32 overflow-hidden">
            {statusSegments.map((segment, index) => (
              <div 
                key={index}
                className={`${segment.color} h-full`} 
                style={{ width: segment.width }}
              ></div>
            ))}
          </div>
        </div>
      </div>

      {/* Expanded State */}
      {isExpanded && (
        <div className="bg-white rounded-b-xl">
          <div className="grid grid-cols-12 gap-4 p-4 bg-gray-50 text-sm font-medium border-b border-gray-200">
            <div className="col-span-4 text-gray-700">Item</div>
            <div className="col-span-2 text-gray-700">Person</div>
            <div className="col-span-3 text-gray-700">Status</div>
            <div className="col-span-2 text-gray-700">Date</div>
            <div className="col-span-1 flex justify-end relative">
             <button
  ref={buttonRef}
  onClick={() => setShowColumnSelector(true)}
  className="w-6 h-6 rounded flex items-center justify-center transition-colors"
  style={{ background: '#2563eb', color: '#fff', border: 'none', boxShadow: 'none' }}
>
                <Plus className="w-4 h-4 text-white" />
</button>
              {showColumnSelector && (
                <div className="absolute top-8 right-0 z-50 bg-white rounded-lg w-96 max-h-96 overflow-y-auto column-selector border border-gray-200 shadow-lg">
                  <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search or describe your column"
                        className="w-full bg-white border border-gray-200 rounded px-10 py-2 text-gray-700 placeholder-gray-400 focus:outline-none focus:border-gray-400"
                      />
                    </div>
                  </div>

                  <div className="p-4">
                    {/* Essentials */}
                    <div className="mb-6">
                      <h3 className="text-gray-400 text-sm mb-3">Essentials</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {columnTypes.essentials.map((column, index) => (
                          <button
                            key={index}
                            className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded text-left"
                            onClick={() => setShowColumnSelector(false)}
                          >
                            <div className={`w-6 h-6 ${column.color} rounded flex items-center justify-center`}>
                              {column.icon}
                            </div>
                            <span className="text-gray-700 text-sm">{column.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Super useful */}
                    <div className="mb-6">
                      <h3 className="text-gray-400 text-sm mb-3">Super useful</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {columnTypes.superUseful.map((column, index) => (
                          <button
                            key={index}
                            className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded text-left"
                            onClick={() => setShowColumnSelector(false)}
                          >
                            <div className={`w-6 h-6 ${column.color} rounded flex items-center justify-center`}>
                              {column.icon}
                            </div>
                            <span className="text-gray-700 text-sm">{column.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <button 
                        className="text-gray-400 text-sm hover:text-gray-700"
                        onClick={() => setShowColumnSelector(false)}
                      >
                        More columns
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Table Rows */}
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50">
              <div className="col-span-4 flex items-center gap-3">
                <span className="text-gray-700">{item.name}</span>
                <MessageSquare className="w-4 h-4 text-gray-400" />
              </div>
              <div className="col-span-2 flex items-center">
                {item.person ? (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-700">
                      U
                    </div>
                    <span className="text-sm text-gray-700">{item.person}</span>
                  </div>
                ) : (
                  <User className="w-6 h-6 text-gray-300" />
                )}
              </div>
              <div className="col-span-3">
                {item.status ? (
                  <span className={`${getStatusColor(item.status)} px-3 py-1 rounded text-sm text-white`}>
                    {item.status}
                  </span>
                ) : (
                  <span className="bg-gray-300 px-3 py-1 rounded text-sm text-gray-500">No status</span>
                )}
              </div>
              <div className="col-span-2 text-gray-700">
                {item.date}
              </div>
              <div className="col-span-1"></div>
            </div>
          ))}

          {/* Add Item Button */}
          <div className="p-4">
            <button className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add item
            </button>
          </div>
        </div>
      )}
      {/* New Lead Modal */}
      {showNewLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center   bg-opacity-70 shadow">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Yangi Lead</h2>
              <button onClick={() => setShowNewLeadModal(false)} className="text-gray-400 hover:text-gray-700 text-2xl font-bold">&times;</button>
            </div>
            <div className="mb-4">
              <input type="text" placeholder="Lead nomi" className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-400" />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNewLeadModal(false)} className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300">Bekor qilish</button>
              <button className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Saqlash</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollapsibleTable;