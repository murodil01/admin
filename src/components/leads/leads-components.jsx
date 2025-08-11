import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown, Plus, Search, MessageSquare, User, Calendar, Hash, File, Link, FileText, BarChart3, CheckSquare, Calculator } from 'lucide-react';

const CollapsibleTable = () => {
  const [showNewLeadModal, setShowNewLeadModal] = useState(false);
  const [showPersonModal, setShowPersonModal] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const buttonRef = useRef(null);

  const [columns, setColumns] = useState([
    { key: 'name', label: 'Item', span: 4 },
    { key: 'person', label: 'Person', span: 2 },
    { key: 'status', label: 'Status', span: 3 },
    { key: 'date', label: 'Date', span: 2 },
  ]);
  const [draggedColIdx, setDraggedColIdx] = useState(null);

  const handleDragStart = (idx) => setDraggedColIdx(idx);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (idx) => {
    if (draggedColIdx === null || draggedColIdx === idx) return;
    const newCols = [...columns];
    const [removed] = newCols.splice(draggedColIdx, 1);
    newCols.splice(idx, 0, removed);
    setColumns(newCols);
    setDraggedColIdx(null);
  };

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

 
  const handleTopButtonClick = () => {
    setShowNewLeadModal(true);
  };

  return (
    <div className="text-gray-700 w-full max-w-6xl mx-auto rounded-xl ">
      <div className="flex items-center justify-end p-4">
        <button
          onClick={handleTopButtonClick}
          className="bg-[#2563eb] hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors focus:outline-none border-none shadow-none"
          style={{ background: '#2563eb', color: '#fff', border: 'none', boxShadow: 'none' }}
        >
          Yangi Lead
        </button>
      </div>
     
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


      {isExpanded && (
        <div className="bg-white rounded-b-xl">
          <div className="grid grid-cols-13 gap-4 p-4 bg-gray-50 text-sm font-medium border-b border-gray-200 select-none">
            <div className="col-span-1 flex items-center justify-center">
              <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" />
            </div>
            {columns.map((col, idx) => (
              <div
                key={col.key}
                className={`col-span-${col.span} text-gray-700${idx === 0 ? '' : ' cursor-move'}`}
                draggable={idx === 0 ? false : true}
                onDragStart={idx === 0 ? undefined : () => handleDragStart(idx)}
                onDragOver={idx === 0 ? undefined : handleDragOver}
                onDrop={idx === 0 ? undefined : () => handleDrop(idx)}
                style={{ opacity: draggedColIdx === idx ? 0.5 : 1 }}
              >
                {col.label}
              </div>
            ))}
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

    
          {items.map((item) => (
            <div key={item.id} className="grid grid-cols-13 gap-4 p-4 border-b border-gray-100 hover:bg-gray-50">
              <div className="col-span-1 flex items-center justify-center">
                <input type="checkbox" className="form-checkbox h-4 w-4 text-blue-600" />
              </div>
              {columns.map((col) => {
                if (col.key === 'name') {
                  return (
                    <div key={col.key} className="col-span-4 flex items-center gap-3">
                      <span className="text-gray-700">{item.name}</span>
                      <MessageSquare className="w-4 h-4 text-gray-400" />
                    </div>
                  );
                }
                if (col.key === 'person') {
                  return (
                    <div key={col.key} className="col-span-2 flex items-center">
                      {item.person ? (
                        <div
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedPerson(item.person);
                            setShowPersonModal(true);
                          }}
                        >
                          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs text-gray-700">
                            U
                          </div>
                          <span className="text-sm text-gray-700">{item.person}</span>
                        </div>
                      ) : (
                        <div
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedPerson(item.person);
                            setShowPersonModal(true);
                          }}
                        >
                          <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-400" />
                          </div>
                          <span className="text-sm text-gray-500">Guest</span>
                        </div>
                      )}
                    </div>
                  );
                }
                if (col.key === 'status') {
                  return (
                    <div key={col.key} className="col-span-3">
                      {item.status ? (
                        <span className={`${getStatusColor(item.status)} px-3 py-1 rounded text-sm text-white`}>
                          {item.status}
                        </span>
                      ) : (
                        <span className="bg-gray-300 px-3 py-1 rounded text-sm text-gray-500">Pending</span>
                      )}
                    </div>
                  );
                }
                if (col.key === 'date') {
                  const dateValue = item.date ? item.date : new Date().toLocaleString('en-US', { month: 'short', day: 'numeric' });
                  return (
                    <div key={col.key} className="col-span-2">
                      <span className="bg-gray-200 px-3 py-1 rounded text-sm text-gray-700 inline-block">
                        {dateValue}
                      </span>
                    </div>
                  );
                }
                return null;
              })}
              <div className="col-span-1"></div>
            </div>
          ))}

          
          <div className="p-4">
            <button className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add item
            </button>
          </div>
        </div>
      )}

       
      {showPersonModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center   bg-opacity-30"
          onClick={() => setShowPersonModal(false)}
        >
              <div
                className="bg-white rounded-lg shadow-lg p-6 min-w-[350px] max-w-xs relative"
            onClick={e => e.stopPropagation()}
          >
            <input
              type="text"
              placeholder="Search names, roles or teams"
                  className="w-full mb-4 px-3 py-2 rounded border border-gray-300 bg-transparent text-gray-700 placeholder-gray-400 focus:outline-none focus:border-blue-400"
            />
            <div className="text-gray-300 text-sm mb-2">Suggested people</div>
            <div className="flex items-center gap-2 mb-4">
              <img src="https://randomuser.me/api/portraits/men/1.jpg" alt="Zafar Ibragimov" className="w-8 h-8 rounded-full" />
                  <span className="text-gray-900">{selectedPerson || "Unknown"}</span>
            </div>
            <div className="flex items-center gap-2 mb-4 cursor-pointer hover:bg-gray-100 p-2 rounded">
              <span className="text-xl text-gray-400">&#43;</span>
              <span className="text-gray-700">Invite a new member by email</span>
            </div>
            <div className="flex items-center gap-2 mt-6 bg-white px-3 py-2 rounded">
              <span className="text-gray-500">Hold</span>
              <kbd className="bg-white border border-gray-400 text-gray-700 px-2 py-1 rounded mx-1">Ctrl</kbd>
              <span className="text-gray-500">for a multiple selection</span>
              <button className="ml-auto text-gray-400 hover:text-gray-700 text-lg font-bold" onClick={() => setShowPersonModal(false)}>&times;</button>
            </div>
          </div>
        </div>
      )}

 
      {showNewLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-70 shadow  bg-opacity-50">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-700">Yangi Lead</h2>
              <button onClick={() => setShowNewLeadModal(false)} className="text-gray-400 hover:text-gray-700 text-2xl font-bold">&times;</button>
            </div>
            <div className="mb-4">
              <input type="text" placeholder="Lead nomi" className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-400" />
            </div>
            <div className="mb-4">
              <textarea placeholder="Tavsif" className="w-full border border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-blue-400"></textarea>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Saqlash</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollapsibleTable;
