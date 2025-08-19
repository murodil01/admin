import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Search, Filter, Download, MoreHorizontal, Calendar, User, Tag, Clock, CheckCircle2, Circle, AlertCircle, XCircle, GripVertical } from 'lucide-react';

const Table = () => {
  const [tasks, setTasks] = useState([
    { id: 1, task: 'Website Redesign', person: 'Alex Johnson', status: 'Working on it', priority: 'High', deadline: '2025-08-25', progress: 75, team: 'Design' },
    { id: 2, task: 'Mobile App Development', person: 'Sarah Chen', status: 'Done', priority: 'Critical', deadline: '2025-08-20', progress: 100, team: 'Development' },
    { id: 3, task: 'Marketing Campaign', person: 'Mike Wilson', status: 'Stuck', priority: 'Medium', deadline: '2025-08-30', progress: 35, team: 'Marketing' },
    { id: 4, task: 'Database Migration', person: 'Emma Davis', status: 'Not Started', priority: 'Low', deadline: '2025-09-05', progress: 0, team: 'Backend' },
    { id: 5, task: 'User Testing', person: 'Chris Martinez', status: 'Working on it', priority: 'High', deadline: '2025-08-22', progress: 60, team: 'QA' },
    { id: 6, task: 'API Integration', person: 'Lisa Anderson', status: 'Working on it', priority: 'Critical', deadline: '2025-08-21', progress: 85, team: 'Development' },
        { id: 7, task: 'API Integration', person: 'Lisa Anderson', status: 'Working on it', priority: 'Critical', deadline: '2025-08-21', progress: 85, team: 'Development' },
            { id: 8, task: 'API Integration', person: 'Lisa Anderson', status: 'Working on it', priority: 'Critical', deadline: '2025-08-21', progress: 85, team: 'Development' },
                { id: 9, task: 'API Integration', person: 'Lisa Anderson', status: 'Working on it', priority: 'Critical', deadline: '2025-08-21', progress: 85, team: 'Development' },
                    { id: 10, task: 'API Integration', person: 'Lisa Anderson', status: 'Working on it', priority: 'Critical', deadline: '2025-08-21', progress: 85, team: 'Development' },
                        { id: 11, task: 'API Integration', person: 'Lisa Anderson', status: 'Working on it', priority: 'Critical', deadline: '2025-08-21', progress: 85, team: 'Development' },
  ]);

  const [hoveredRow, setHoveredRow] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  const [openStatusDropdown, setOpenStatusDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const statusOptions = [
    { value: 'Done', color: 'bg-green-500', icon: CheckCircle2, lightBg: 'bg-green-50', textColor: 'text-green-700' },
    { value: 'Working on it', color: 'bg-yellow-500', icon: Circle, lightBg: 'bg-yellow-50', textColor: 'text-yellow-700' },
    { value: 'Stuck', color: 'bg-red-500', icon: AlertCircle, lightBg: 'bg-red-50', textColor: 'text-red-700' },
    { value: 'Not Started', color: 'bg-gray-400', icon: XCircle, lightBg: 'bg-gray-50', textColor: 'text-gray-700' }
  ];

  const statusConfig = {
    'Done': { color: 'bg-green-500', icon: CheckCircle2, lightBg: 'bg-green-50', textColor: 'text-green-700' },
    'Working on it': { color: 'bg-yellow-500', icon: Circle, lightBg: 'bg-yellow-50', textColor: 'text-yellow-700' },
    'Stuck': { color: 'bg-red-500', icon: AlertCircle, lightBg: 'bg-red-50', textColor: 'text-red-700' },
    'Not Started': { color: 'bg-gray-400', icon: XCircle, lightBg: 'bg-gray-50', textColor: 'text-gray-700' }
  };

  const priorityConfig = {
    'Critical': { color: 'bg-purple-600', textColor: 'text-purple-600', bgLight: 'bg-purple-100' },
    'High': { color: 'bg-red-500', textColor: 'text-red-600', bgLight: 'bg-red-100' },
    'Medium': { color: 'bg-blue-500', textColor: 'text-blue-600', bgLight: 'bg-blue-100' },
    'Low': { color: 'bg-gray-400', textColor: 'text-gray-600', bgLight: 'bg-gray-100' }
  };

  // Click outside handler for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenStatusDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverItem(index);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedItem === null) return;

    const draggedTask = filteredTasks[draggedItem];
    const newTasks = [...tasks];
    
    // Find the original indices in the tasks array
    const originalDraggedIndex = tasks.findIndex(t => t.id === draggedTask.id);
    const dropTask = filteredTasks[dropIndex];
    const originalDropIndex = tasks.findIndex(t => t.id === dropTask.id);
    
    // Remove dragged item and insert at new position
    const [removed] = newTasks.splice(originalDraggedIndex, 1);
    newTasks.splice(originalDropIndex, 0, removed);
    
    setTasks(newTasks);
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleStatusChange = (taskId, newStatus) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
    setOpenStatusDropdown(null);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredTasks = sortedTasks.filter(task =>
    task.task.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.person.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleRowSelection = (id) => {
    setSelectedRows(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedRows.length === filteredTasks.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredTasks.map(task => task.id));
    }
  };

  return (
    <div className=" w-[1300px] h-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Management Board</h1>
            <p className="text-gray-600">Track, manage and collaborate on all your tasks</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg">
            <Plus className="w-5 h-5" />
            New Task
          </button>
        </div>

        {/* Controls Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search tasks, people, status..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-all">
              <Filter className="w-4 h-4" />
              Filter
            </button>
            <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-all">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Table Container with Horizontal Scroll */}
      <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
        <div className= "overflow-x-auto custom-scrollbar">
          <div className="min-w-[1200px]">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-10" /> {/* Drag handle */}
                <col className="w-12" /> {/* Checkbox */}
                <col className="w-64" /> {/* Task - Fixed */}
                <col className="w-48" /> {/* Person */}
                <col className="w-40" /> {/* Status */}
                <col className="w-32" /> {/* Priority */}
                <col className="w-40" /> {/* Deadline */}
                <col className="w-44" /> {/* Progress */}
                <col className="w-32" /> {/* Team */}
                <col className="w-12" /> {/* Actions */}
              </colgroup>
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="p-2 sticky left-0 bg-gradient-to-r from-gray-50 to-gray-100"></th>
                  <th className="p-4 sticky left-10 bg-gradient-to-r from-gray-50 to-gray-100">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={selectedRows.length === filteredTasks.length && filteredTasks.length > 0}
                      onChange={selectAll}
                    />
                  </th>
                  <th 
                    className="text-left p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors sticky left-[88px] bg-gradient-to-r from-gray-50 to-gray-100 z-20 border-r border-gray-200"
                    onClick={() => handleSort('task')}
                  >
                    <div className="flex items-center gap-2">
                      Task
                      <ChevronDown className={`w-4 h-4 transition-transform ${sortConfig.key === 'task' && sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
                    </div>
                  </th>
                  <th 
                    className="text-left p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('person')}
                  >
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Person
                    </div>
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Circle className="w-4 h-4" />
                      Status
                    </div>
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Priority
                    </div>
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Deadline
                    </div>
                  </th>
                  <th className="text-left p-4 font-semibold text-gray-700">Progress</th>
                  <th className="text-left p-4 font-semibold text-gray-700">Team</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task, index) => {
                  const StatusIcon = statusConfig[task.status].icon;
                  return (
                    <tr
                      key={task.id}
                      className={`border-b border-gray-100 transition-all duration-200 ${
                        hoveredRow === task.id ? 'bg-blue-50 shadow-sm' : ''
                      } ${selectedRows.includes(task.id) ? 'bg-blue-50' : ''} ${
                        dragOverItem === index ? 'bg-blue-100' : ''
                      } ${draggedItem === index ? 'opacity-50' : ''}`}
                      onMouseEnter={() => setHoveredRow(task.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      style={{
                        animation: `slideIn 0.3s ease-out ${index * 0.05}s both`
                      }}
                    >
                      <td 
                        className="p-2 cursor-move sticky left-0 bg-white z-10"
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragEnd={handleDragEnd}
                      >
                        <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                      </td>
                      <td className="p-4 sticky left-10 bg-white ">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={selectedRows.includes(task.id)}
                          onChange={() => toggleRowSelection(task.id)}
                        />
                      </td>
                      <td className="p-4 sticky left-[88px] bg-white border-r border-gray-100">
                        <div className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer transition-colors truncate pr-2">
                          {task.task}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                            {task.person.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-gray-700 truncate">{task.person}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="relative" ref={openStatusDropdown === task.id ? dropdownRef : null}>
                          <button
                            onClick={() => setOpenStatusDropdown(openStatusDropdown === task.id ? null : task.id)}
                            className={`inline-flex items-center gap-3 px-2 py-1 rounded-full ${statusConfig[task.status].lightBg} ${statusConfig[task.status].textColor} text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer`}
                          >
                            <StatusIcon className="w-4 h-4" />
                            {task.status}
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          
                          {openStatusDropdown === task.id && (
                            <div className="absolute top-full mt-1 left-0 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[160px]">
                              {statusOptions.map((option) => {
                                const OptionIcon = option.icon;
                                return (
                                  <button
                                    key={option.value}
                                    onClick={() => handleStatusChange(task.id, option.value)}
                                    className={`w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 ${option.textColor} text-sm`}
                                  >
                                    <OptionIcon className="w-4 h-4" />
                                    {option.value}
                                  </button>
                                );
                              })}            
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${priorityConfig[task.priority].bgLight} ${priorityConfig[task.priority].textColor}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          {new Date(task.deadline).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 ease-out ${
                                task.progress === 100 ? 'bg-green-500' :
                                task.progress >= 75 ? 'bg-blue-500' :
                                task.progress >= 50 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-700 w-12">{task.progress}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                          {task.team}
                        </span>
                      </td>
                      <td className="p-4">
                        <button className="text-gray-400 hover:text-gray-600 transition-colors">
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          height: 8px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
};

export default Table;