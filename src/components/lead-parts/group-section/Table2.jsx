// import { useState, useEffect } from "react";
// import {
//   ChevronDown,
//   CheckCircle2,
//   Circle,
//   AlertCircle,
//   XCircle,
//   GripVertical,
// } from "lucide-react";
// import {
//   getLeads,
//   updateLeads,
//   createLeads,
// } from "../../../api/services/leadsService";
// import ReactDatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css";

// const Table = () => {
//   const [hoveredRow, setHoveredRow] = useState(null);

//   const [selectedRows, setSelectedRows] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
//   const [draggedItem, setDraggedItem] = useState(null);
//   const [dragOverItem, setDragOverItem] = useState(null);
//   const [openStatusDropdown, setOpenStatusDropdown] = useState(null);
//   const [apiLeads, setApiLeads] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const [statusOptions, setStatusOptions] = useState([]);

//   const statusConfig = {
//     Done: {
//       color: "bg-green-500",
//       icon: CheckCircle2,
//       lightBg: "bg-green-50",
//       textColor: "text-green-700",
//     },
//     "Working on it": {
//       color: "bg-yellow-500",
//       icon: Circle,
//       lightBg: "bg-yellow-50",
//       textColor: "text-yellow-700",
//     },
//     Stuck: {
//       color: "bg-red-500",
//       icon: AlertCircle,
//       lightBg: "bg-red-50",
//       textColor: "text-red-700",
//     },
//     "Not Started": {
//       color: "bg-gray-400",
//       icon: XCircle,
//       lightBg: "bg-gray-50",
//       textColor: "text-gray-700",
//     },
//     "No Status": {
//       color: "bg-gray-300",
//       icon: Circle,
//       lightBg: "bg-gray-50",
//       textColor: "text-gray-500",
//     },
//   };

//   const convertApiLeadsToTasks = (leads) => {
//     return leads.map((lead, index) => ({
//       id: lead.id,
//       task: lead.name || `Lead ${index + 1}`,
//       person: lead.person_detail?.fullname || "Unknown Person",
//       status: lead.status?.name || lead.status || "No Status",
//       priority:
//         lead.potential_value > 50
//           ? "High"
//           : lead.potential_value > 20
//           ? "Medium"
//           : "Low",
//       deadline: lead.last_interaction || "2025-08-30",
//       progress: lead.potential_value || 0,
//       team: lead.link || "General",
//       phone: lead.phone,
//       notes: lead.notes,
//       source: "api",
//     }));
//   };

//   // Load all leads from API
//   const loadLeadsFromAPI = async (groupId = null) => {
//     try {
//       setLoading(true);
//       console.log("🔍 Loading leads from API...");

//       const response = await getLeads(groupId);
//       console.log("✅ API Response:", response);

//       if (response.data && Array.isArray(response.data)) {
//         setApiLeads(response.data);
//         console.log(`📊 Loaded ${response.data.length} leads from API`);

//         // Extract unique status options from API data
//         const apiStatusOptions = response.data
//           .filter((lead) => lead.status && lead.status.name)
//           .map((lead) => ({
//             id: lead.status.id,
//             value: lead.status.name,
//             icon: getStatusIcon(lead.status.name),
//             lightBg: getStatusLightBg(lead.status.name),
//             textColor: getStatusTextColor(lead.status.name),
//           }))
//           .filter(
//             (status, index, self) =>
//               self.findIndex((s) => s.value === status.value) === index // Remove duplicates
//           );

//         if (apiStatusOptions.length > 0) {
//           console.log("📊 Status options from API:", apiStatusOptions);
//           // Merge with default status options
//           setStatusOptions([...statusOptions, ...apiStatusOptions]);
//         }
//       }
//     } catch (error) {
//       console.error("❌ Error loading leads:", {
//         status: error.response?.status,
//         statusText: error.response?.statusText,
//         url: error.config?.url,
//         data: error.response?.data,
//         message: error.message,
//       });

//       if (error.response?.status === 404) {
//         console.log(
//           "💡 API endpoint not found. Check your API server and endpoints."
//         );
//       } else if (error.response?.status === 401) {
//         console.log("🔐 Authentication required");
//       } else {
//         console.log("🌐 Network error or server unavailable");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Helper functions to get status styling
//   const getStatusIcon = (statusName) => {
//     if (!statusName) return Circle;
//     const name = statusName.toLowerCase();
//     if (name.includes("done") || name.includes("complete")) return CheckCircle2;
//     if (name.includes("working") || name.includes("progress")) return Circle;
//     if (name.includes("stuck") || name.includes("blocked")) return AlertCircle;
//     return XCircle;
//   };

//   const getStatusLightBg = (statusName) => {
//     if (!statusName) return "bg-gray-50";
//     const name = statusName.toLowerCase();
//     if (name.includes("done") || name.includes("complete"))
//       return "bg-green-50";
//     if (name.includes("working") || name.includes("progress"))
//       return "bg-yellow-50";
//     if (name.includes("stuck") || name.includes("blocked")) return "bg-red-50";
//     return "bg-gray-50";
//   };

//   const getStatusTextColor = (statusName) => {
//     if (!statusName) return "text-gray-500";
//     const name = statusName.toLowerCase();
//     if (name.includes("done") || name.includes("complete"))
//       return "text-green-700";
//     if (name.includes("working") || name.includes("progress"))
//       return "text-yellow-700";
//     if (name.includes("stuck") || name.includes("blocked"))
//       return "text-red-700";
//     return "text-gray-700";
//   };

//   // Load data on component mount
//   useEffect(() => {
//     loadLeadsFromAPI();
//   }, []);

//   // Click outside handler for dropdown
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (!event.target.closest(".status-dropdown-container")) {
//         setOpenStatusDropdown(null);
//       }
//     };

//     if (openStatusDropdown !== null) {
//       document.addEventListener("mousedown", handleClickOutside);
//       return () =>
//         document.removeEventListener("mousedown", handleClickOutside);
//     }
//   }, [openStatusDropdown]);

//   // Only use API data
//   const displayTasks = convertApiLeadsToTasks(apiLeads);

//   const handleDragStart = (e, index) => {
//     setDraggedItem(index);
//     e.dataTransfer.effectAllowed = "move";
//   };

//   const handleDragOver = (e, index) => {
//     e.preventDefault();
//     e.dataTransfer.dropEffect = "move";
//     setDragOverItem(index);
//   };

//   const handleDragEnd = () => {
//     setDraggedItem(null);
//     setDragOverItem(null);
//   };

//   const handleDrop = (e, dropIndex) => {
//     e.preventDefault();
//     if (draggedItem === null) return;

//     const draggedTask = filteredTasks[draggedItem];
//     const newTasks = [...displayTasks];

//     const originalDraggedIndex = displayTasks.findIndex(
//       (t) => t.id === draggedTask.id
//     );
//     const dropTask = filteredTasks[dropIndex];
//     const originalDropIndex = displayTasks.findIndex(
//       (t) => t.id === dropTask.id
//     );

//     const [removed] = newTasks.splice(originalDraggedIndex, 1);
//     newTasks.splice(originalDropIndex, 0, removed);

//     setApiLeads(newTasks);
//     setDraggedItem(null);
//     setDragOverItem(null);
//   };

//   const handleStatusChange = async (taskId, newStatus) => {
//     try {
//       // Update API data
//       setApiLeads(
//         apiLeads.map((lead) =>
//           lead.id === taskId ? { ...lead, status: { name: newStatus } } : lead
//         )
//       );

//       // Update on server
//       await updateLeads(taskId, { status: newStatus });
//       console.log("✅ Status updated on server");

//       setOpenStatusDropdown(null);
//     } catch (error) {
//       console.error("❌ Error updating status:", error);
//     }
//   };

//   const handleSort = (key) => {
//     let direction = "asc";
//     if (sortConfig.key === key && sortConfig.direction === "asc") {
//       direction = "desc";
//     }
//     setSortConfig({ key, direction });
//   };

//   const sortedTasks = [...displayTasks].sort((a, b) => {
//     if (!sortConfig.key) return 0;

//     const aValue = a[sortConfig.key];
//     const bValue = b[sortConfig.key];

//     if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
//     if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
//     return 0;
//   });

//   const filteredTasks = sortedTasks.filter(
//     (task) =>
//       (task.task &&
//         task.task.toLowerCase().includes(searchTerm.toLowerCase())) ||
//       (task.person &&
//         task.person.toLowerCase().includes(searchTerm.toLowerCase())) ||
//       (task.status &&
//         task.status.toLowerCase().includes(searchTerm.toLowerCase())) ||
//       (task.phone && task.phone.includes(searchTerm))
//   );

//   const toggleRowSelection = (id) => {
//     setSelectedRows((prev) =>
//       prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
//     );
//   };

//   const selectAll = () => {
//     if (selectedRows.length === filteredTasks.length) {
//       setSelectedRows([]);
//     } else {
//       setSelectedRows(filteredTasks.map((task) => task.id));
//     }
//   };

//   const handleChange = (id, field, value) => {
//     setTasks((prevTasks) =>
//       prevTasks.map((task) =>
//         task.id === id ? { ...task, [field]: value } : task
//       )
//     );
//   };

//   return (
//     <div className="h-auto md:min-w-[95%]">
//       {/* Table Container with Horizontal Scroll */}
//       <div className="bg-white rounded-b-xl shadow-xl border border-gray-200 overflow-hidden">
//         <div className="overflow-x-auto custom-scrollbar">
//           <div className="min-w-[1200px]">
//             <table className="w-full table-fixed">
//               <colgroup>
//                 <col className="w-10" />
//                 <col className="w-12" />
//                 <col className="w-50" />
//                 <col className="w-50" />
//                 <col className="w-50" />
//                 <col className="w-45" />
//                 <col className="w-40" />
//                 <col className="w-44" />
//                 <col className="w-40" />
//                 <col className="w-40" />
//                 <col className="w-15" />
//               </colgroup>
//               <thead>
//                 <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
//                   <th className="p-2 sticky left-0 bg-gradient-to-r from-gray-50 to-gray-100 z-20"></th>
//                   <th className="p-4 sticky left-10 bg-gradient-to-r from-gray-50 to-gray-100 z-20">
//                     <input
//                       type="checkbox"
//                       className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                       checked={
//                         selectedRows.length === filteredTasks.length &&
//                         filteredTasks.length > 0
//                       }
//                       onChange={selectAll}
//                     />
//                   </th>
//                   <th
//                     className="text-left p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors sticky left-[88px] bg-gradient-to-r from-gray-50 to-gray-100 z-20 border-r border-gray-200"
//                     onClick={() => handleSort("task")}
//                   >
//                     <div className="flex justify-center items-center gap-2">
//                       Leads
//                       <ChevronDown
//                         className={`w-4 h-4 transition-transform ${
//                           sortConfig.key === "task" &&
//                           sortConfig.direction === "desc"
//                             ? "rotate-180"
//                             : ""
//                         }`}
//                       />
//                     </div>
//                   </th>

//                   <th
//                     className="text-left p-4 border-r border-gray-200 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
//                     onClick={() => handleSort("person")}
//                   >
//                     <div className="flex justify-center items-center gap-2">
//                       Phone Number
//                     </div>
//                   </th>

//                   <th className="text-center p-4 font-semibold text-gray-700 border-r border-gray-200">
//                     <div className="flex justify-center items-center gap-2">
//                       Owner
//                     </div>
//                   </th>

//                   <th className="text-center p-4 font-semibold text-gray-700 border-r border-gray-200">
//                     <div className="flex justify-center items-center gap-2">
//                       Source
//                     </div>
//                   </th>

//                   <th className="text-center p-4 font-semibold text-gray-700 border-r border-gray-200">
//                     <div className="flex justify-center items-center gap-2">
//                       Status
//                     </div>
//                   </th>

//                   <th className="text-center p-4 font-semibold text-gray-700 border-r border-gray-200">
//                     Potential Value
//                   </th>

//                   <th className="text-center p-4 font-semibold text-gray-700 border-r border-gray-200">
//                     Notes
//                   </th>

//                   <th className="text-center p-4 font-semibold text-gray-700 border-r border-gray-200">
//                     Timeline
//                   </th>

//                   <th className="text-center p-4 font-semibold text-gray-700 border-r border-gray-200">
//                     +
//                   </th>
//                 </tr>
//               </thead>

//               <tbody>
//                 {filteredTasks.map((task, index) => {
//                   const StatusIcon = statusConfig[task.status]?.icon || Circle;
//                   return (
//                     <tr
//                       key={task.id}
//                       className={`border-b border-gray-100 transition-all duration-200 ${
//                         hoveredRow === task.id ? "bg-blue-50 shadow-sm" : ""
//                       } ${selectedRows.includes(task.id) ? "bg-blue-50" : ""} ${
//                         dragOverItem === index ? "bg-blue-100" : ""
//                       } ${draggedItem === index ? "opacity-50" : ""} ${
//                         openStatusDropdown === task.id ? "relative z-50" : ""
//                       }`}
//                       onMouseEnter={() => setHoveredRow(task.id)}
//                       onMouseLeave={() => setHoveredRow(null)}
//                       onDragOver={(e) => handleDragOver(e, index)}
//                       onDrop={(e) => handleDrop(e, index)}
//                       style={{
//                         animation: `slideIn 0.3s ease-out ${
//                           index * 0.05
//                         }s both`,
//                       }}
//                     >
//                       <td
//                         className="p-2 cursor-move sticky left-0 bg-white z-10"
//                         draggable
//                         onDragStart={(e) => handleDragStart(e, index)}
//                         onDragEnd={handleDragEnd}
//                       >
//                         <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600" />
//                       </td>

//                       <td className="p-4 sticky left-10 bg-white z-10">
//                         <input
//                           type="checkbox"
//                           className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                           checked={selectedRows.includes(task.id)}
//                           onChange={() => toggleRowSelection(task.id)}
//                         />
//                       </td>

//                       <td className="p-4 sticky left-[88px] bg-white z-10 border-r border-gray-100">
//                         <input
//                           type="text"
//                           value={task.task}
//                           onChange={(e) =>
//                             handleChange(task.id, "task", e.target.value)
//                           }
//                           className="font-medium text-gray-900 hover:text-blue-600 cursor-text transition-colors truncate pr-2 border-none outline-none bg-transparent w-full text-center"
//                         />
//                       </td>

//                       <td className="p-4 border-r border-gray-200">
//                         <div className="flex justify-center items-center gap-2 text-gray-600">
//                           <input
//                             type="tel"
//                             value={task.phone || ""}
//                             placeholder="No phone"
//                             onChange={(e) =>
//                               handleChange(task.id, e.target.value)
//                             }
//                             className="hover:text-blue-600 transition-colors border-none outline-none bg-transparent text-center"
//                           />
//                         </div>
//                       </td>

//                       <td className="p-4 border-r border-gray-200">
//                         <div className="flex items-center gap-2">
//                           <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
//                             {task.person
//                               .split(" ")
//                               .map((n) => n[0])
//                               .join("")}
//                           </div>
//                           <span className="text-gray-700 truncate">
//                             {task.person}
//                           </span>
//                         </div>
//                       </td>

//                       <td className="p-4 border-r border-gray-200">
//                         <span className="flex justify-center  px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
//                           {task.team}
//                         </span>
//                       </td>

//                       {/* STATUS CELL - Bu yerda asosiy o'zgartirish */}
//                       <td
//                         className={`p-4 border-r border-gray-200 ${
//                           openStatusDropdown === task.id
//                             ? "relative z-[100] bg-transparent"
//                             : ""
//                         }`}
//                       >
//                         <div className="relative status-dropdown-container">
//                           <button
//                             onClick={(e) => {
//                               e.preventDefault();
//                               e.stopPropagation();
//                               setOpenStatusDropdown(
//                                 openStatusDropdown === task.id ? null : task.id
//                               );
//                             }}
//                             className={`inline-flex items-center gap-3 px-2 py-1 rounded-full ${
//                               statusConfig[task.status]?.lightBg || "bg-gray-50"
//                             } ${
//                               statusConfig[task.status]?.textColor ||
//                               "text-gray-500"
//                             } text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer`}
//                           >
//                             <StatusIcon className="w-4 h-4" />
//                             {task.status}
//                             <ChevronDown className="w-3 h-3" />
//                           </button>

//                           {openStatusDropdown === task.id && (
//                             <div className="absolute top-full mt-1 left-0 bg-white rounded-lg shadow-2xl border border-gray-200 py-1 z-[1000] min-w-[160px]">
//                               {statusOptions.map((option) => {
//                                 const OptionIcon = option.icon;
//                                 return (
//                                   <button
//                                     key={option.id || option.value}
//                                     onClick={(e) => {
//                                       e.preventDefault();
//                                       e.stopPropagation();
//                                       handleStatusChange(task.id, option.value);
//                                     }}
//                                     className={`w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 ${option.textColor} text-sm transition-colors z-[1001]`}
//                                   >
//                                     <OptionIcon className="w-4 h-4" />
//                                     {option.value}
//                                   </button>
//                                 );
//                               })}
//                             </div>
//                           )}
//                         </div>
//                       </td>

//                       <td className="p-4 border-r flex justify-center border-gray-200">
//                         <input
//                           type="number"
//                           value={task.progress || 0}
//                           onChange={(e) =>
//                             handleChange(task.id, "progress", e.target.value)
//                           }
//                           className="px-3 py-1 rounded-full text-sm font-medium text-center border-none outline-none bg-transparent w-20
//                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
//                         />
//                       </td>

//                       <td className="p-4 border-r border-gray-200">
//                         <div>
//                           <input
//                             type="text"
//                             value={task.notes || ""}
//                             placeholder="No notes"
//                             onChange={(e) =>
//                               handleChange(task.id, "notes", e.target.value)
//                             }
//                             className="text-[16px] text-gray-500 mt-1 truncate text-center border-none outline-none bg-transparent w-full"
//                           />
//                         </div>
//                       </td>

//                       <td className="p-4 border-r border-gray-200">
//                         <div className="flex justify-center items-center gap-2">
//                           <ReactDatePicker
//                             selected={
//                               task.timeline ? new Date(task.timeline[0]) : null
//                             }
//                             onChange={(dates) =>
//                               handleChange(task.id, "timeline", dates)
//                             }
//                             startDate={
//                               task.timeline_start
//                                 ? new Date(task.timeline_start[0])
//                                 : null
//                             }
//                             endDate={
//                               task.timeline_end
//                                 ? new Date(task.timeline_end[1])
//                                 : null
//                             }
//                             selectsRange
//                             isClearable
//                             placeholderText="TimeLine"
//                             className="text-sm font-medium text-gray-700 border-none outline-none text-center"
//                           />
//                         </div>
//                       </td>

//                       <td className="p-4 border-r border-gray-200"></td>
//                     </tr>
//                   );
//                 })}
//                 <tr>
//                   <td colSpan={12} className="pl-30 py-3">
//                     <button className=" text-gray-700 transition">
//                       + Add new lead
//                     </button>
//                   </td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       <style>{`
//         @keyframes slideIn {
//           from {
//             opacity: 0;
//             transform: translateY(10px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

//         .custom-scrollbar::-webkit-scrollbar {
//           height: 8px;
//         }

//         .custom-scrollbar::-webkit-scrollbar-track {
//           background: #f1f1f1;
//           border-radius: 10px;
//         }

//         .custom-scrollbar::-webkit-scrollbar-thumb {
//           background: #888;
//           border-radius: 10px;
//         }

//         .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//           background: #555;
//         }

//         /* Dropdown menu uchun qo'shimcha stillar */
//         .status-dropdown-container {
//           position: relative;
//         }

//         /* Table overflow konteyneriga qo'shimcha stil */
//         .overflow-x-auto {
//           position: relative;
//           z-index: 1;
//         }

//         /* Dropdown ochiq bo'lganda parent row uchun */
//         tbody tr.relative.z-50 {
//           position: relative !important;
//           z-index: 50 !important;
//         }

//         /* Dropdown menu uchun eng yuqori z-index */
//         .status-dropdown-container > div {
//           position: absolute !important;
//           z-index: 1000 !important;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Table;

// import React, { useState, useRef, useEffect } from 'react';
// import { ChevronDown, Plus, Search, Filter, Download, MoreHorizontal, Calendar, User, Tag, Clock, CheckCircle2, Circle, AlertCircle, XCircle, GripVertical, Phone } from 'lucide-react';
// // Updated import path to match your API structure
// import { getLeadsById, getLeads, updateLeads } from '../../../api/services/leadsService';

// const Table = () => {
//   const [hoveredRow, setHoveredRow] = useState(null);

//   const [selectedRows, setSelectedRows] = useState([]);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
//   const [draggedItem, setDraggedItem] = useState(null);
//   const [dragOverItem, setDragOverItem] = useState(null);
//   const [openStatusDropdown, setOpenStatusDropdown] = useState(null);
//   const [apiLeads, setApiLeads] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [statusOptions, setStatusOptions] = useState([
//     { value: 'Done', color: 'bg-green-500', icon: CheckCircle2, lightBg: 'bg-green-50', textColor: 'text-green-700' },
//     { value: 'Working on it', color: 'bg-yellow-500', icon: Circle, lightBg: 'bg-yellow-50', textColor: 'text-yellow-700' },
//     { value: 'Stuck', color: 'bg-red-500', icon: AlertCircle, lightBg: 'bg-red-50', textColor: 'text-red-700' },
//     { value: 'Not Started', color: 'bg-gray-400', icon: XCircle, lightBg: 'bg-gray-50', textColor: 'text-gray-700' },
//     { value: 'No Status', color: 'bg-gray-300', icon: Circle, lightBg: 'bg-gray-50', textColor: 'text-gray-500' }
//   ]);

//   const statusConfig = {
//     'Done': { color: 'bg-green-500', icon: CheckCircle2, lightBg: 'bg-green-50', textColor: 'text-green-700' },
//     'Working on it': { color: 'bg-yellow-500', icon: Circle, lightBg: 'bg-yellow-50', textColor: 'text-yellow-700' },
//     'Stuck': { color: 'bg-red-500', icon: AlertCircle, lightBg: 'bg-red-50', textColor: 'text-red-700' },
//     'Not Started': { color: 'bg-gray-400', icon: XCircle, lightBg: 'bg-gray-50', textColor: 'text-gray-700' },
//     'No Status': { color: 'bg-gray-300', icon: Circle, lightBg: 'bg-gray-50', textColor: 'text-gray-500' }
//   };

//   const priorityConfig = {
//     'Critical': { color: 'bg-purple-600', textColor: 'text-purple-600', bgLight: 'bg-purple-100' },
//     'High': { color: 'bg-red-500', textColor: 'text-red-600', bgLight: 'bg-red-100' },
//     'Medium': { color: 'bg-blue-500', textColor: 'text-blue-600', bgLight: 'bg-blue-100' },
//     'Low': { color: 'bg-gray-400', textColor: 'text-gray-600', bgLight: 'bg-gray-100' }
//   };

//   // Convert API leads to task format
//   const convertApiLeadsToTasks = (leads) => {
//     return leads.map((lead, index) => ({
//       id: lead.id,
//       task: lead.name || `Lead ${index + 1}`,
//       person: lead.person_detail?.fullname || 'Unknown Person',
//       status: lead.status?.name || lead.status || 'No Status',
//       priority: lead.potential_value > 50 ? 'High' : lead.potential_value > 20 ? 'Medium' : 'Low',
//       deadline: lead.last_interaction || '2025-08-30',
//       progress: lead.potential_value || 0,
//       team: lead.link || 'General',
//       phone: lead.phone,
//       notes: lead.notes,
//       source: 'api'
//     }));
//   };

//   // Load all leads from API
//   const loadLeadsFromAPI = async (groupId = null) => {
//     try {
//       setLoading(true);
//       console.log('🔍 Loading leads from API...');

//       const response = await getLeads(groupId);
//       console.log('✅ API Response:', response);

//       if (response.data && Array.isArray(response.data)) {
//         setApiLeads(response.data);
//         console.log(`📊 Loaded ${response.data.length} leads from API`);

//         // Extract unique status options from API data
//         const apiStatusOptions = response.data
//           .filter(lead => lead.status && lead.status.name)
//           .map(lead => ({
//             id: lead.status.id,
//             value: lead.status.name,
//             icon: getStatusIcon(lead.status.name),
//             lightBg: getStatusLightBg(lead.status.name),
//             textColor: getStatusTextColor(lead.status.name)
//           }))
//           .filter((status, index, self) =>
//             self.findIndex(s => s.value === status.value) === index // Remove duplicates
//           );

//         if (apiStatusOptions.length > 0) {
//           console.log('📊 Status options from API:', apiStatusOptions);
//           // Merge with default status options
//           setStatusOptions([...statusOptions, ...apiStatusOptions]);
//         }
//       }
//     } catch (error) {
//       console.error('❌ Error loading leads:', {
//         status: error.response?.status,
//         statusText: error.response?.statusText,
//         url: error.config?.url,
//         data: error.response?.data,
//         message: error.message
//       });

//       if (error.response?.status === 404) {
//         console.log('💡 API endpoint not found. Check your API server and endpoints.');
//       } else if (error.response?.status === 401) {
//         console.log('🔐 Authentication required');
//       } else {
//         console.log('🌐 Network error or server unavailable');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Helper functions to get status styling
//   const getStatusIcon = (statusName) => {
//     if (!statusName) return Circle;
//     const name = statusName.toLowerCase();
//     if (name.includes('done') || name.includes('complete')) return CheckCircle2;
//     if (name.includes('working') || name.includes('progress')) return Circle;
//     if (name.includes('stuck') || name.includes('blocked')) return AlertCircle;
//     return XCircle;
//   };

//   const getStatusLightBg = (statusName) => {
//     if (!statusName) return 'bg-gray-50';
//     const name = statusName.toLowerCase();
//     if (name.includes('done') || name.includes('complete')) return 'bg-green-50';
//     if (name.includes('working') || name.includes('progress')) return 'bg-yellow-50';
//     if (name.includes('stuck') || name.includes('blocked')) return 'bg-red-50';
//     return 'bg-gray-50';
//   };

//   const getStatusTextColor = (statusName) => {
//     if (!statusName) return 'text-gray-500';
//     const name = statusName.toLowerCase();
//     if (name.includes('done') || name.includes('complete')) return 'text-green-700';
//     if (name.includes('working') || name.includes('progress')) return 'text-yellow-700';
//     if (name.includes('stuck') || name.includes('blocked')) return 'text-red-700';
//     return 'text-gray-700';
//   };

//   // Load data on component mount
//   useEffect(() => {
//     loadLeadsFromAPI();
//   }, []);

//   // Click outside handler for dropdown
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (!event.target.closest('.status-dropdown-container')) {
//         setOpenStatusDropdown(null);
//       }
//     };

//     if (openStatusDropdown !== null) {
//       document.addEventListener('mousedown', handleClickOutside);
//       return () => document.removeEventListener('mousedown', handleClickOutside);
//     }
//   }, [openStatusDropdown]);

//   // Only use API data
//   const displayTasks = convertApiLeadsToTasks(apiLeads);

//   const handleDragStart = (e, index) => {
//     setDraggedItem(index);
//     e.dataTransfer.effectAllowed = 'move';
//   };

//   const handleDragOver = (e, index) => {
//     e.preventDefault();
//     e.dataTransfer.dropEffect = 'move';
//     setDragOverItem(index);
//   };

//   const handleDragEnd = () => {
//     setDraggedItem(null);
//     setDragOverItem(null);
//   };

//   const handleDrop = (e, dropIndex) => {
//     e.preventDefault();
//     if (draggedItem === null) return;

//     const draggedTask = filteredTasks[draggedItem];
//     const newTasks = [...displayTasks];

//     const originalDraggedIndex = displayTasks.findIndex(t => t.id === draggedTask.id);
//     const dropTask = filteredTasks[dropIndex];
//     const originalDropIndex = displayTasks.findIndex(t => t.id === dropTask.id);

//     const [removed] = newTasks.splice(originalDraggedIndex, 1);
//     newTasks.splice(originalDropIndex, 0, removed);

//     setApiLeads(newTasks);
//     setDraggedItem(null);
//     setDragOverItem(null);
//   };

//   const handleStatusChange = async (taskId, newStatus) => {
//     try {
//       // Update API data
//       setApiLeads(apiLeads.map(lead =>
//         lead.id === taskId ? { ...lead, status: { name: newStatus } } : lead
//       ));

//       // Update on server
//       await updateLeads(taskId, { status: newStatus });
//       console.log('✅ Status updated on server');

//       setOpenStatusDropdown(null);
//     } catch (error) {
//       console.error('❌ Error updating status:', error);
//     }
//   };

//   const handleSort = (key) => {
//     let direction = 'asc';
//     if (sortConfig.key === key && sortConfig.direction === 'asc') {
//       direction = 'desc';
//     }
//     setSortConfig({ key, direction });
//   };

//   const sortedTasks = [...displayTasks].sort((a, b) => {
//     if (!sortConfig.key) return 0;

//     const aValue = a[sortConfig.key];
//     const bValue = b[sortConfig.key];

//     if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
//     if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
//     return 0;
//   });

//   const filteredTasks = sortedTasks.filter(task =>
//     (task.task && task.task.toLowerCase().includes(searchTerm.toLowerCase())) ||
//     (task.person && task.person.toLowerCase().includes(searchTerm.toLowerCase())) ||
//     (task.status && task.status.toLowerCase().includes(searchTerm.toLowerCase())) ||
//     (task.phone && task.phone.includes(searchTerm))
//   );

//   const toggleRowSelection = (id) => {
//     setSelectedRows(prev =>
//       prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
//     );
//   };

//   const selectAll = () => {
//     if (selectedRows.length === filteredTasks.length) {
//       setSelectedRows([]);
//     } else {
//       setSelectedRows(filteredTasks.map(task => task.id));
//     }
//   };

//   return (
//     <div className="h-auto  md:min-w-[95%]">

//       {/* <div className="mb-8">
//         <div className="flex items-center justify-between mb-6">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900 mb-2">Leads Management Board</h1>
//             {loading && <p className="text-blue-600 text-sm">🔄 Loading data from API...</p>}

//           </div>
//           <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all transform hover:scale-105 shadow-lg">
//             <Plus className="w-5 h-5" />
//             New Lead
//           </button>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
//           <div className="flex items-center gap-4 flex-wrap">
//             <div className="flex-1 min-w-64">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                 <input
//                   type="text"
//                   placeholder="Search leads, people, phone..."
//                   className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//               </div>
//             </div>
//             <button
//               onClick={() => loadLeadsFromAPI()}
//               disabled={loading}
//               className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-all disabled:opacity-50"
//             >
//               🔄 Refresh API
//             </button>
//             <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-all">
//               <Filter className="w-4 h-4" />
//               Filter
//             </button>
//             <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2 transition-all">
//               <Download className="w-4 h-4" />
//               Export
//             </button>
//           </div>
//         </div>
//       </div> */}

//       {/* Table Container with Horizontal Scroll */}
//       <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
//         <div className="overflow-x-auto custom-scrollbar">
//           <div className="min-w-[1200px]">
//             <table className="w-full table-fixed">
//               <colgroup>
//                 <col className="w-10" />
//                 <col className="w-12" />
//                 <col className="w-50" />
//                 <col className="w-50" />
//                 <col className="w-35" />
//                 <col className="w-45" />
//                 <col className="w-40" />
//                 <col className="w-44" />
//                 <col className="w-40" />
//                 <col className='w-20' />
//                 <col className="w-15" />
//               </colgroup>
//               <thead>
//                 <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
//                   <th className="p-2 sticky left-0 bg-gradient-to-r from-gray-50 to-gray-100 z-20"></th>
//                   <th className="p-4 sticky left-10 bg-gradient-to-r from-gray-50 to-gray-100 z-20">
//                     <input
//                       type="checkbox"
//                       className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                       checked={selectedRows.length === filteredTasks.length && filteredTasks.length > 0}
//                       onChange={selectAll}
//                     />
//                   </th>
//                   <th
//                     className="text-left p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors sticky left-[88px] bg-gradient-to-r from-gray-50 to-gray-100 z-20 border-r border-gray-200"
//                     onClick={() => handleSort('task')}
//                   >
//                     <div className="flex items-center gap-2">
//                       Leads
//                       <ChevronDown className={`w-4 h-4 transition-transform ${sortConfig.key === 'task' && sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} />
//                     </div>
//                   </th>
//                   <th
//                     className="text-left p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
//                     onClick={() => handleSort('person')}
//                   >
//                     <div className="flex items-center gap-2">
//                       <User className="w-4 h-4" />
//                       Phone Number
//                     </div>
//                   </th>
//                   <th className="text-left p-4 font-semibold text-gray-700">
//                     <div className="flex items-center gap-2">
//                       <Circle className="w-4 h-4" />
//                       Source
//                     </div>
//                   </th>
//                   <th className="text-left p-4 font-semibold text-gray-700">
//                     <div className="flex items-center gap-2">
//                       <Tag className="w-4 h-4" />
//                       Owner
//                     </div>
//                   </th>
//                   <th className="text-left p-4 font-semibold text-gray-700">
//                     <div className="flex items-center gap-2">
//                       <Phone className="w-4 h-4" />
//                       Status
//                     </div>
//                   </th>
//                   <th className="text-left p-4 font-semibold text-gray-700">
//                     Potential Value
//                   </th>
//                   <th className="text-left p-4 font-semibold text-gray-700">
//                     Potential value
//                   </th>
//                   <th>
//                     Notes
//                   </th>
//                   <th className="p-4"></th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {filteredTasks.map((task, index) => {
//                   const StatusIcon = statusConfig[task.status]?.icon || Circle;
//                   return (
//                     <tr
//                       key={task.id}
//                       className={`border-b border-gray-100 transition-all duration-200 ${
//                         hoveredRow === task.id ? 'bg-blue-50 shadow-sm' : ''
//                       } ${selectedRows.includes(task.id) ? 'bg-blue-50' : ''} ${
//                         dragOverItem === index ? 'bg-blue-100' : ''
//                       } ${draggedItem === index ? 'opacity-50' : ''}`}
//                       onMouseEnter={() => setHoveredRow(task.id)}
//                       onMouseLeave={() => setHoveredRow(null)}
//                       onDragOver={(e) => handleDragOver(e, index)}
//                       onDrop={(e) => handleDrop(e, index)}
//                       style={{
//                         animation: `slideIn 0.3s ease-out ${index * 0.05}s both`
//                       }}
//                     >
//                       <td
//                         className="p-2 cursor-move sticky left-0 bg-white z-10"
//                         draggable
//                         onDragStart={(e) => handleDragStart(e, index)}
//                         onDragEnd={handleDragEnd}
//                       >
//                         <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600" />
//                       </td>

//                       <td className="p-4 sticky left-10 bg-white z-10">
//                         <input
//                           type="checkbox"
//                           className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
//                           checked={selectedRows.includes(task.id)}
//                           onChange={() => toggleRowSelection(task.id)}
//                         />
//                       </td>

//                       <td className="p-4 sticky left-[88px] bg-white z-10 border-r border-gray-100">
//                         <div className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer transition-colors truncate pr-2">
//                           {task.task}
//                           {/* <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">API</span> */}
//                         </div>

//                       </td>
//                         <td className="p-4">
//                         <div className="flex items-center gap-2 text-gray-600">
//                           <Phone className="w-4 h-4" />
//                           <a href={`tel:${task.phone}`} className="hover:text-blue-600 transition-colors">
//                             {task.phone || 'No phone'}
//                           </a>
//                         </div>
//                       </td>
//                        <td className="p-4">
//                         <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
//                           {task.team}
//                         </span>
//                       </td>
//                       <td className="p-4">
//                         <div className="flex items-center gap-2">
//                           <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
//                             {task.person.split(' ').map(n => n[0]).join('')}
//                           </div>
//                           <span className="text-gray-700 truncate">{task.person}</span>
//                         </div>
//                       </td>
//                       <td className={`p-4 ${openStatusDropdown === task.id ? 'relative z-[1002] bg-transparent' : ''}`}>
//                         <div className="relative status-dropdown-container">
//                           <button
//                             onClick={(e) => {
//                               e.preventDefault();
//                               e.stopPropagation();
//                               setOpenStatusDropdown(openStatusDropdown === task.id ? null : task.id);
//                             }}
//                             className={`inline-flex items-center gap-3 px-2 py-1 rounded-full ${statusConfig[task.status]?.lightBg || 'bg-gray-50'} ${statusConfig[task.status]?.textColor || 'text-gray-500'} text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer`}
//                           >
//                             <StatusIcon className="w-4 h-4" />
//                             {task.status}
//                             <ChevronDown className="w-3 h-3" />
//                           </button>

//                           {openStatusDropdown === task.id && (
//                             <div className="absolute top-full mt-1 left-0 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[1007] min-w-[160px]">
//                               {statusOptions.map((option) => {
//                                 const OptionIcon = option.icon;
//                                 return (
//                                   <button
//                                     key={option.id || option.value}
//                                     onClick={(e) => {
//                                       e.preventDefault();
//                                       e.stopPropagation();
//                                       handleStatusChange(task.id, option.value);
//                                     }}
//                                     className={`w-full text-left px-3 py-2 !z-50 hover:bg-gray-50 flex items-center gap-2 ${option.textColor} text-sm transition-colors`}
//                                   >
//                                     <OptionIcon className="w-4 h-4" />
//                                     {option.value}
//                                   </button>
//                                 );
//                               })}
//                             </div>
//                           )}
//                         </div>
//                       </td>
//                       <td className="p-4">
//                         <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
//                           task.progress > 50 ? 'bg-green-100 text-green-600' :
//                           task.progress > 20 ? 'bg-yellow-100 text-yellow-600' :
//                           'bg-red-100 text-red-600'
//                         }`}>
//                           ${task.progress || 0}
//                         </span>
//                       </td>

//                       <td className="p-4">
//                         <div className="flex items-center gap-2">
//                           <span className="text-sm font-medium text-gray-700">
//                             ${task.progress || 0}
//                           </span>
//                           <div className="w-16 bg-gray-200 rounded-full h-2">
//                             <div
//                               className="h-full bg-green-500 rounded-full transition-all duration-300"
//                               style={{ width: `${Math.min((task.progress || 0) / 100 * 100, 100)}%` }}
//                             />
//                           </div>
//                         </div>
//                       </td>
//                       <td>
//                         <div className='ml-5' >
//                            {task.notes && (
//                           <div className="text-xs text-gray-500 mt-1 truncate">{task.notes}</div>
//                         )}
//                         </div>
//                       </td>

//                       <td className="p-4">
//                         <button className="text-gray-400 hover:text-gray-600 transition-colors">
//                           <MoreHorizontal className="w-5 h-5" />
//                         </button>
//                       </td>
//                     </tr>
//                   );
//                 })}
//               </tbody>
//             </table>
//           </div>
//         </div>
//       </div>

//       <style jsx>{`
//         @keyframes slideIn {
//           from {
//             opacity: 0;
//             transform: translateY(10px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

//         .custom-scrollbar::-webkit-scrollbar {
//           height: 8px;
//         }

//         .custom-scrollbar::-webkit-scrollbar-track {
//           background: #f1f1f1;
//           border-radius: 10px;
//         }

//         .custom-scrollbar::-webkit-scrollbar-thumb {
//           background: #888;
//           border-radius: 10px;
//         }

//         .custom-scrollbar::-webkit-scrollbar-thumb:hover {
//           background: #555;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Table;

import { useState, useEffect } from "react";
import {
  ChevronDown,
  CheckCircle2,
  Circle,
  AlertCircle,
  XCircle,
  GripVertical,
} from "lucide-react";
import {
  getLeads,
  updateLeads,
  createLeads,
} from "../../../api/services/leadsService";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const LinkDropdown = ({ value, onChange, onSave, onCancel }) => {
  const linkOptions = [
    { value: "", label: "Select Link Type" },
    { value: "ad", label: "Ad" },
    { value: "outreach", label: "Outreach" },
    { value: "referral", label: "Referral" },
    { value: "event", label: "Event" },
  ];

  const handleChange = (e) => {
    onChange(e.target.value);
    onSave();
  };

  return (
    <select
      value={value || ""}
      onChange={handleChange}
      onBlur={onSave}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSave();
        if (e.key === "Escape") onCancel();
      }}
      className="w-full h-full text-center focus:outline-none border-none appearance-none bg-transparent"
    >
      {linkOptions.map((option) => (
        <option
          key={option.value}
          value={option.value}
          className="bg-white text-black"
        >
          {option.label}
        </option>
      ))}
    </select>
  );
};

const PersonDropdown = ({ value, onChange, onSave, groupId, leadId }) => {
  const [personOptions, setPersonOptions] = useState([]);

  useEffect(() => {
    const fetchPersons = async () => {
      try {
        const res = await getLeads();
        const options = res.data
          .filter((lead) => lead.person_detail)
          .map((lead) => ({
            id: lead.person_detail.id,
            name: lead.person_detail.fullname || "Unnamed Person",
            img: (() => {
              const picture = lead.person_detail.profile_picture;

              if (!picture) return null;

              // Get the URL string
              const url = typeof picture === "string" ? picture : picture?.url;

              if (!url) return null;

              // If it's already a full URL, return as is
              if (url.startsWith("http://") || url.startsWith("https://")) {
                return url;
              }

              // Prepend base URL for relative paths
              return `https://prototype-production-2b67.up.railway.app${url}`;
            })(),
          }));
        setPersonOptions(options);
      } catch (err) {
        console.error("Failed to fetch persons:", err);
      }
    };
    fetchPersons();
  }, []);

  const handleChange = async (selectedId) => {
    const selectedPerson =
      personOptions.find((p) => p.id === selectedId) || null;

    onChange(selectedPerson); // localItems ga to‘liq obyekt

    if (groupId && leadId) {
      try {
        await updateLeads(groupId, leadId, { person_detail: selectedPerson });
      } catch (err) {
        console.error("Failed to update person_detail:", err);
      }
    }

    onSave(); // editingni yakunlash
  };

  return (
    <Select
      value={value?.id || undefined}
      onChange={handleChange}
      onBlur={onSave}
      placeholder="Select Person"
      style={{ width: "100%", border: "none" }}
      className="ant-select-borderless custom-selectt"
      optionLabelProp="label"
    >
      {personOptions.map((person) => (
        <Select.Option
          key={person.id}
          value={person.id}
          label={person.name}
          style={{ border: "none" }}
        >
          <div className="flex items-center gap-2">
            {person.img && <Avatar size={24} src={person.img} />}
            <span>{person.name}</span>
          </div>
        </Select.Option>
      ))}
    </Select>
  );
};

const Table = () => {
  const [hoveredRow, setHoveredRow] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  const [openStatusDropdown, setOpenStatusDropdown] = useState(null);
  const [apiLeads, setApiLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusOptions, setStatusOptions] = useState([]);
  const [isAddingLead, setIsAddingLead] = useState(false);
  const [newLeadTitle, setNewLeadTitle] = useState("");

  const statusConfig = {
    Done: {
      color: "bg-green-500",
      icon: CheckCircle2,
      lightBg: "bg-green-50",
      textColor: "text-green-700",
    },
    "Working on it": {
      color: "bg-yellow-500",
      icon: Circle,
      lightBg: "bg-yellow-50",
      textColor: "text-yellow-700",
    },
    Stuck: {
      color: "bg-red-500",
      icon: AlertCircle,
      lightBg: "bg-red-50",
      textColor: "text-red-700",
    },
    "Not Started": {
      color: "bg-gray-400",
      icon: XCircle,
      lightBg: "bg-gray-50",
      textColor: "text-gray-700",
    },
    "No Status": {
      color: "bg-gray-300",
      icon: Circle,
      lightBg: "bg-gray-50",
      textColor: "text-gray-500",
    },
  };

  const convertApiLeadsToTasks = (leads) => {
    return leads.map((lead, index) => ({
      id: lead.id,
      task: lead.name || `Lead ${index + 1}`,
      person: lead.person_detail?.fullname || "Unknown Person",
      status: lead.status?.name || lead.status || "No Status",
      priority:
        lead.potential_value > 50
          ? "High"
          : lead.potential_value > 20
          ? "Medium"
          : "Low",
      deadline: lead.last_interaction || "2025-08-30",
      progress: lead.potential_value || 0,
      team: lead.link || "General",
      phone: lead.phone || "",
      notes: lead.notes || "",
      source: "api",
    }));
  };

  const loadLeadsFromAPI = async (groupId = null) => {
    try {
      setLoading(true);
      console.log("🔍 Loading leads from API...");
      const response = await getLeads(groupId);
      console.log("✅ API Response:", response);

      if (response.data && Array.isArray(response.data)) {
        setApiLeads(response.data);
        console.log(`📊 Loaded ${response.data.length} leads from API`);

        const apiStatusOptions = response.data
          .filter((lead) => lead.status && lead.status.name)
          .map((lead) => ({
            id: lead.status.id,
            value: lead.status.name,
            icon: getStatusIcon(lead.status.name),
            lightBg: getStatusLightBg(lead.status.name),
            textColor: getStatusTextColor(lead.status.name),
          }))
          .filter(
            (status, index, self) =>
              self.findIndex((s) => s.value === status.value) === index
          );

        if (apiStatusOptions.length > 0) {
          console.log("📊 Status options from API:", apiStatusOptions);
          setStatusOptions([...statusOptions, ...apiStatusOptions]);
        }
      }
    } catch (error) {
      console.error("❌ Error loading leads:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        data: error.response?.data,
        message: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (statusName) => {
    if (!statusName) return Circle;
    const name = statusName.toLowerCase();
    if (name.includes("done") || name.includes("complete")) return CheckCircle2;
    if (name.includes("working") || name.includes("progress")) return Circle;
    if (name.includes("stuck") || name.includes("blocked")) return AlertCircle;
    return XCircle;
  };

  const getStatusLightBg = (statusName) => {
    if (!statusName) return "bg-gray-50";
    const name = statusName.toLowerCase();
    if (name.includes("done") || name.includes("complete"))
      return "bg-green-50";
    if (name.includes("working") || name.includes("progress"))
      return "bg-yellow-50";
    if (name.includes("stuck") || name.includes("blocked")) return "bg-red-50";
    return "bg-gray-50";
  };

  const getStatusTextColor = (statusName) => {
    if (!statusName) return "text-gray-500";
    const name = statusName.toLowerCase();
    if (name.includes("done") || name.includes("complete"))
      return "text-green-700";
    if (name.includes("working") || name.includes("progress"))
      return "text-yellow-700";
    if (name.includes("stuck") || name.includes("blocked"))
      return "text-red-700";
    return "text-gray-700";
  };

  useEffect(() => {
    loadLeadsFromAPI();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".status-dropdown-container")) {
        setOpenStatusDropdown(null);
      }
    };

    if (openStatusDropdown !== null) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [openStatusDropdown]);

  const displayTasks = convertApiLeadsToTasks(apiLeads);

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
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
    const newTasks = [...displayTasks];
    const originalDraggedIndex = displayTasks.findIndex(
      (t) => t.id === draggedTask.id
    );
    const dropTask = filteredTasks[dropIndex];
    const originalDropIndex = displayTasks.findIndex(
      (t) => t.id === dropTask.id
    );

    const [removed] = newTasks.splice(originalDraggedIndex, 1);
    newTasks.splice(originalDropIndex, 0, removed);

    setApiLeads(newTasks);
    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      setApiLeads(
        apiLeads.map((lead) =>
          lead.id === taskId ? { ...lead, status: { name: newStatus } } : lead
        )
      );
      await updateLeads(taskId, { status: newStatus });
      console.log("✅ Status updated on server");
      setOpenStatusDropdown(null);
    } catch (error) {
      console.error("❌ Error updating status:", error);
    }
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedTasks = [...displayTasks].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const filteredTasks = sortedTasks.filter(
    (task) =>
      (task.task &&
        task.task.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.person &&
        task.person.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.status &&
        task.status.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.phone && task.phone.includes(searchTerm))
  );

  const toggleRowSelection = (id) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedRows.length === filteredTasks.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredTasks.map((task) => task.id));
    }
  };

  const handleChange = (id, field, value) => {
    setApiLeads((prevLeads) =>
      prevLeads.map((lead) =>
        lead.id === id ? { ...lead, [field]: value } : lead
      )
    );
  };

  const handleAddLead = async (e) => {
    if (e.key !== "Enter" || !newLeadTitle.trim()) return;

    try {
      setLoading(true);
      const newLead = {
        name: newLeadTitle,
        status: { name: "Not Started" },
        person_detail: { fullname: "Unknown Person" },
        potential_value: 0,
        last_interaction: new Date().toISOString().split("T")[0],
        link: "General",
        phone: "",
        notes: "",
      };

      await createLeads(newLead);
      console.log("✅ New lead created");
      await loadLeadsFromAPI();
      setNewLeadTitle("");
      setIsAddingLead(false);
    } catch (error) {
      console.error("❌ Error creating lead:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-auto md:min-w-[95%]">
      <div className="bg-white rounded-b-xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <div className="min-w-[1200px]">
            <table className="w-full table-fixed">
              <colgroup>
                <col className="w-10" />
                <col className="w-12" />
                <col className="w-50" />
                <col className="w-50" />
                <col className="w-50" />
                <col className="w-45" />
                <col className="w-40" />
                <col className="w-44" />
                <col className="w-40" />
                <col className="w-40" />
                <col className="w-15" />
              </colgroup>
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="p-2 sticky left-0 bg-gradient-to-r from-gray-50 to-gray-100 z-20"></th>
                  <th className="p-4 sticky left-10 bg-gradient-to-r from-gray-50 to-gray-100 z-20">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={
                        selectedRows.length === filteredTasks.length &&
                        filteredTasks.length > 0
                      }
                      onChange={selectAll}
                    />
                  </th>
                  <th
                    className="text-left p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors sticky left-[88px] bg-gradient-to-r from-gray-50 to-gray-100 z-20 border-r border-gray-200"
                    onClick={() => handleSort("task")}
                  >
                    <div className="flex justify-center items-center gap-2">
                      Leads
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          sortConfig.key === "task" &&
                          sortConfig.direction === "desc"
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </div>
                  </th>
                  <th
                    className="text-left p-4 border-r border-gray-200 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("person")}
                  >
                    <div className="flex justify-center items-center gap-2">
                      Phone Number
                    </div>
                  </th>
                  <th className="text-center p-4 font-semibold text-gray-700 border-r border-gray-200">
                    <div className="flex justify-center items-center gap-2">
                      Owner
                    </div>
                  </th>
                  <th className="text-center p-4 font-semibold text-gray-700 border-r border-gray-200">
                    <div className="flex justify-center items-center gap-2">
                      Source
                    </div>
                  </th>
                  <th className="text-center p-4 font-semibold text-gray-700 border-r border-gray-200">
                    <div className="flex justify-center items-center gap-2">
                      Status
                    </div>
                  </th>
                  <th className="text-center p-4 font-semibold text-gray-700 border-r border-gray-200">
                    Potential Value
                  </th>
                  <th className="text-center p-4 font-semibold text-gray-700 border-r border-gray-200">
                    Notes
                  </th>
                  <th className="text-center p-4 font-semibold text-gray-700 border-r border-gray-200">
                    Timeline
                  </th>
                  <th className="text-center p-4 font-semibold text-gray-700 border-r border-gray-200">
                    +
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task, index) => {
                  const StatusIcon = statusConfig[task.status]?.icon || Circle;
                  return (
                    <tr
                      key={task.id}
                      className={`border-b border-gray-100 transition-all duration-200 ${
                        hoveredRow === task.id ? "bg-blue-50 shadow-sm" : ""
                      } ${selectedRows.includes(task.id) ? "bg-blue-50" : ""} ${
                        dragOverItem === index ? "bg-blue-100" : ""
                      } ${draggedItem === index ? "opacity-50" : ""} ${
                        openStatusDropdown === task.id ? "relative z-50" : ""
                      }`}
                      onMouseEnter={() => setHoveredRow(task.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      style={{
                        animation: `slideIn 0.3s ease-out ${
                          index * 0.05
                        }s both`,
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
                      <td className="p-4 sticky left-10 bg-white z-10">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          checked={selectedRows.includes(task.id)}
                          onChange={() => toggleRowSelection(task.id)}
                        />
                      </td>
                      <td className="p-4 sticky left-[88px] bg-white z-10 border-r border-gray-100">
                        <input
                          type="text"
                          value={task.task}
                          onChange={(e) =>
                            handleChange(task.id, "task", e.target.value)
                          }
                          className="font-medium text-gray-900 hover:text-blue-600 cursor-text transition-colors truncate pr-2 border-none outline-none bg-transparent w-full text-center"
                        />
                      </td>
                      <td className="p-4 border-r border-gray-200">
                        <div className="flex justify-center items-center gap-2 text-gray-600">
                          <input
                            type="tel"
                            value={task.phone || ""}
                            placeholder="No phone"
                            onChange={(e) =>
                              handleChange(task.id, "phone", e.target.value)
                            }
                            className="hover:text-blue-600 transition-colors border-none outline-none bg-transparent text-center"
                          />
                        </div>
                      </td>
                      <td className="p-4 border-r border-gray-200">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                            {task.person
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <span className="text-gray-700 truncate">
                            {task.person}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 border-r border-gray-200">
                        <span className="flex justify-center px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                          {task.team}
                        </span>
                      </td>
                      <td
                        className={`p-4 border-r border-gray-200 ${
                          openStatusDropdown === task.id
                            ? "relative z-[100] bg-transparent"
                            : ""
                        }`}
                      >
                        <div className="relative status-dropdown-container">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setOpenStatusDropdown(
                                openStatusDropdown === task.id ? null : task.id
                              );
                            }}
                            className={`inline-flex items-center gap-3 px-2 py-1 rounded-full ${
                              statusConfig[task.status]?.lightBg || "bg-gray-50"
                            } ${
                              statusConfig[task.status]?.textColor ||
                              "text-gray-500"
                            } text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer`}
                          >
                            <StatusIcon className="w-4 h-4" />
                            {task.status}
                            <ChevronDown className="w-3 h-3" />
                          </button>
                          {openStatusDropdown === task.id && (
                            <div className="absolute top-full mt-1 left-0 bg-white rounded-lg shadow-2xl border border-gray-200 py-1 z-[1000] min-w-[160px]">
                              {statusOptions.map((option) => {
                                const OptionIcon = option.icon;
                                return (
                                  <button
                                    key={option.id || option.value}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleStatusChange(task.id, option.value);
                                    }}
                                    className={`w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 ${option.textColor} text-sm transition-colors z-[1001]`}
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
                      <td className="p-4 border-r flex justify-center border-gray-200">
                        <input
                          type="number"
                          value={task.progress || 0}
                          onChange={(e) =>
                            handleChange(task.id, "progress", e.target.value)
                          }
                          className="px-3 py-1 rounded-full text-sm font-medium text-center border-none outline-none bg-transparent w-20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                      </td>
                      <td className="p-4 border-r border-gray-200">
                        <div>
                          <input
                            type="text"
                            value={task.notes || ""}
                            placeholder="No notes"
                            onChange={(e) =>
                              handleChange(task.id, "notes", e.target.value)
                            }
                            className="text-[16px] text-gray-500 mt-1 truncate text-center border-none outline-none bg-transparent w-full"
                          />
                        </div>
                      </td>
                      <td className="p-4 border-r border-gray-200">
                        <div className="flex justify-center items-center gap-2">
                          <ReactDatePicker
                            selected={
                              task.deadline ? new Date(task.deadline) : null
                            }
                            onChange={(date) =>
                              handleChange(task.id, "deadline", date)
                            }
                            placeholderText="Timeline"
                            className="text-sm font-medium text-gray-700 border-none outline-none text-center"
                          />
                        </div>
                      </td>
                      <td className="p-4 border-r border-gray-200"></td>
                    </tr>
                  );
                })}
                <tr className="border-b border-gray-100">
                  <td className="p-2 sticky left-0 bg-white z-10"></td>
                  <td className="p-4 sticky left-10 bg-white z-10">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      disabled
                    />
                  </td>
                  <td className="p-4 sticky left-[88px] bg-white z-10 border-r border-gray-100">
                    {isAddingLead ? (
                      <input
                        type="text"
                        value={newLeadTitle}
                        onChange={(e) => setNewLeadTitle(e.target.value)}
                        onKeyPress={handleAddLead}
                        placeholder="Enter lead title"
                        className="font-medium text-gray-900 hover:text-blue-600 cursor-text transition-colors truncate pr-2 border-none outline-none bg-transparent w-full text-center"
                        autoFocus
                        onBlur={() => {
                          if (!newLeadTitle.trim()) setIsAddingLead(false);
                        }}
                      />
                    ) : (
                      <button
                        onClick={() => setIsAddingLead(true)}
                        className="font-medium text-gray-700 transition-colors w-full text-center"
                      >
                        + Add new lead
                      </button>
                    )}
                  </td>
                  <td className="p-4 border-r border-gray-200">
                    <div className="flex justify-center items-center gap-2 text-gray-600">
                      <input
                        type="tel"
                        value=""
                        placeholder="No phone"
                        disabled
                        className="text-gray-400 transition-colors border-none outline-none bg-transparent text-center"
                      />
                    </div>
                  </td>
                  <td className="p-4 border-r border-gray-200">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        ?
                      </div>
                      <span className="text-gray-400 truncate">
                        Unknown Person
                      </span>
                    </div>
                  </td>
                  <td className="p-4 border-r border-gray-200">
                    <span className="flex justify-center px-3 py-1 bg-gray-100 text-gray-400 rounded-lg text-sm">
                      General
                    </span>
                  </td>
                  <td className="p-4 border-r border-gray-200">
                    <div className="inline-flex items-center gap-3 px-2 py-1 rounded-full bg-gray-50 text-gray-400 text-sm font-medium">
                      <Circle className="w-4 h-4" />
                      No Status
                    </div>
                  </td>
                  <td className="p-4 border-r flex justify-center border-gray-200">
                    <input
                      type="number"
                      value="0"
                      disabled
                      className="px-3 py-1 rounded-full text-sm font-medium text-center border-none outline-none bg-transparent w-20 text-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </td>
                  <td className="p-4 border-r border-gray-200">
                    <div>
                      <input
                        type="text"
                        value=""
                        placeholder="No notes"
                        disabled
                        className="text-[16px] text-gray-400 mt-1 truncate text-center border-none outline-none bg-transparent w-full"
                      />
                    </div>
                  </td>
                  <td className="p-4 border-r border-gray-200">
                    <div className="flex justify-center items-center gap-2">
                      <ReactDatePicker
                        selected={null}
                        placeholderText="Timeline"
                        disabled
                        className="text-sm font-medium text-gray-400 border-none outline-none text-center"
                      />
                    </div>
                  </td>
                  <td className="p-4 border-r border-gray-200"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
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

        .status-dropdown-container {
          position: relative;
        }

        .overflow-x-auto {
          position: relative;
          z-index: 1;
        }

        tbody tr.relative.z-50 {
          position: relative !important;
          z-index: 50 !important;
        }

        .status-dropdown-container > div {
          position: absolute !important;
          z-index: 1000 !important;
        }
      `}</style>
    </div>
  );
};

export default Table;