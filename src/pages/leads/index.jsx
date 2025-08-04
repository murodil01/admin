import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Edit3,
  Plus,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  X,
  Type,
  Building2,
  Phone,
  CircleArrowDown,
} from "lucide-react";

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLeads, setSelectedLeads] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [isMobileView, setIsMobileView] = useState(false);

  const leadsPerPage = 10;

  // Sample data - in a real app, this would come from an API
  const sampleLeads = [
    {
      id: 1,
      name: "Amy Jordan",
      email: "info@salesforce.com",
      title: "UI/UX Designer",
      company: "Lee Enterprise, Inc",
      phone: "1 (800) 667-6389",
      status: "Pending",
      avatar:
        "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "michael@techcorp.com",
      title: "Product Manager",
      company: "TechCorp Solutions",
      phone: "1 (800) 555-0123",
      status: "Qualified",
      avatar:
        "https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
    },
    {
      id: 3,
      name: "Sarah Williams",
      email: "sarah@innovate.com",
      title: "Marketing Director",
      company: "Innovate Labs",
      phone: "1 (800) 555-0456",
      status: "Contacted",
      avatar:
        "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
    },
    {
      id: 4,
      name: "David Thompson",
      email: "david@startupx.com",
      title: "CTO",
      company: "StartupX",
      phone: "1 (800) 555-0789",
      status: "Pending",
      avatar:
        "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
    },
    {
      id: 5,
      name: "Emily Rodriguez",
      email: "emily@designstudio.com",
      title: "Creative Director",
      company: "Design Studio Pro",
      phone: "1 (800) 555-0321",
      status: "Qualified",
      avatar:
        "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
    },
  ];

  useEffect(() => {
    // Initialize with sample data
    const extendedLeads = [];
    for (let i = 0; i < 25; i++) {
      const baseLead = sampleLeads[i % sampleLeads.length];
      extendedLeads.push({
        ...baseLead,
        id: i + 1,
        name: i === 0 ? baseLead.name : `${baseLead.name} ${i + 1}`,
      });
    }
    setLeads(extendedLeads);
    setFilteredLeads(extendedLeads);
  }, []);

  // Check for mobile view
  useEffect(() => {
    const checkMobileView = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    checkMobileView();
    window.addEventListener("resize", checkMobileView);

    return () => window.removeEventListener("resize", checkMobileView);
  }, []);

  // Search functionality
  useEffect(() => {
    let filtered = leads;

    if (searchTerm) {
      filtered = leads.filter(
        (lead) =>
          lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          lead.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((lead) => lead.status === filterStatus);
    }

    setFilteredLeads(filtered);
    setCurrentPage(1);
  }, [searchTerm, filterStatus, leads]);

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage);
  const startIndex = (currentPage - 1) * leadsPerPage;
  const currentLeads = filteredLeads.slice(
    startIndex,
    startIndex + leadsPerPage
  );

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedLeads(currentLeads.map((lead) => lead.id));
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectLead = (leadId, checked) => {
    if (checked) {
      setSelectedLeads((prev) => [...prev, leadId]);
    } else {
      setSelectedLeads((prev) => prev.filter((id) => id !== leadId));
    }
  };

  const handleAddLead = (newLead) => {
    const lead = {
      ...newLead,
      id: leads.length + 1,
      avatar:
        "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop",
    };
    setLeads((prev) => [lead, ...prev]);
    setShowAddModal(false);
  };

  const handleEditLead = (updatedLead) => {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === updatedLead.id ? updatedLead : lead))
    );
    setShowEditModal(false);
    setEditingLead(null);
  };

  const handleDeleteLead = (leadId) => {
    setLeads((prev) => prev.filter((lead) => lead.id !== leadId));
    setSelectedLeads((prev) => prev.filter((id) => id !== leadId));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-purple-100 text-purple-800";
      case "Qualified":
        return "bg-green-100 text-green-800";
      case "Contacted":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const LeadModal = ({ isOpen, onClose, onSubmit, lead = null, title }) => {
    const [formData, setFormData] = useState({
      name: lead?.name || "",
      email: lead?.email || "",
      title: lead?.title || "",
      company: lead?.company || "",
      phone: lead?.phone || "",
      status: lead?.status || "Pending",
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(lead ? { ...lead, ...formData } : formData);
    };

    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 backdrop-blur-xs bg-opacity-2 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md mx-4">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">{title}</h2>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      company: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, status: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                >
                  <option value="Pending">Pending</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Contacted">Contacted</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm sm:text-base"
              >
                {lead ? "Update" : "Add"} Lead
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Mobile Card Component
  const MobileLeadCard = ({ lead }) => (
    <div className="bg-white border border-gray-200 rounded-[14px] p-4 mb-3 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={selectedLeads.includes(lead.id)}
            onChange={(e) => handleSelectLead(lead.id, e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
          />
          <img
            src={lead.avatar}
            alt={lead.name}
            className="w-10 h-10 rounded-full mr-3"
          />
          <div>
            <div className="text-sm font-medium text-gray-900">{lead.name}</div>
            <div className="text-xs text-gray-500">{lead.email}</div>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() =>
              setActiveDropdown(activeDropdown === lead.id ? null : lead.id)
            }
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          {activeDropdown === lead.id && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
              <div className="py-1">
                <button
                  onClick={() => {
                    setEditingLead(lead);
                    setShowEditModal(true);
                    setActiveDropdown(null);
                  }}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    handleDeleteLead(lead.id);
                    setActiveDropdown(null);
                  }}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Title:</span>
          <span className="text-sm text-gray-900">{lead.title}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Company:</span>
          <span className="text-sm text-gray-900">{lead.company}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Phone:</span>
          <span className="text-sm text-gray-900">{lead.phone}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Status:</span>
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
              lead.status
            )}`}
          >
            {lead.status}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div>
        <div className="max-w-7xl mx-auto mt-5 md:mt-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 space-y-3 sm:space-y-0">
            <div>
              <h1 className="text-xl sm:text-[34px] font-semibold text-black">
                Leads
              </h1>
              <nav className="flex items-center gap-3 text-xs sm:text-sm text-gray-500 mt-1">
                <span className="text-black opacity-60 font-semibold text-[20px]">
                  Leads
                </span>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 mx-1 text-black opacity-60" />
                <span className="text-black font-semibold text-[20px]">
                  Recently Viewed
                </span>
              </nav>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-9 py-2 sm:py-3 bg-[#0061fe] text-white text-[17px] font-bold rounded-[14px] hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto mt-5">
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-t-lg sm:rounded-t-[24px] shadow-sm border-t border-gray-200">
          <div className="p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between space-y-3 sm:space-y-0">
              <div className="flex-1 max-w-full sm:max-w-md">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="md:w-[254px] w-full pl-10 pr-4 py-2 sm:py-2.5 border border-gray-300 rounded-[14px] focus:outline-none text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="relative flex-1 sm:flex-none">
                  <button
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className="w-full h-[45.6px] sm:w-auto inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-[14px] text-sm text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </button>
                  {showFilterDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                      <div className="py-1">
                        {["all", "Pending", "Qualified", "Contacted"].map(
                          (status) => (
                            <button
                              key={status}
                              onClick={() => {
                                setFilterStatus(status);
                                setShowFilterDropdown(false);
                              }}
                              className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                                filterStatus === status
                                  ? "bg-blue-50 text-blue-700"
                                  : "text-gray-700"
                              }`}
                            >
                              {status === "all" ? "All Status" : status}
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button className="hidden h-[45.6px] sm:inline-flex items-center px-3 py-2 border border-gray-300 rounded-[14px] text-sm text-gray-700 bg-white hover:bg-gray-50">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Table View */}
        {!isMobileView && (
          <div className="bg-white rounded-b-lg sm:rounded-b-[24px] shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="w-12 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={
                          selectedLeads.length === currentLeads.length &&
                          currentLeads.length > 0
                        }
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name • Email
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Type size={16} />
                        Title
                      </div>
                    </th>

                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} />
                        Company
                      </div>
                    </th>

                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <Phone size={16} />
                        Phone
                      </div>
                    </th>

                    <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        <CircleArrowDown size={16} />
                        Status
                      </div>
                    </th>

                    <th className="w-12 px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedLeads.includes(lead.id)}
                          onChange={(e) =>
                            handleSelectLead(lead.id, e.target.checked)
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <img
                            src={lead.avatar}
                            alt={lead.name}
                            className="w-8 h-8 rounded-full mr-3"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {lead.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {lead.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {lead.title}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {lead.company}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {lead.phone}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            lead.status
                          )}`}
                        >
                          {lead.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="relative">
                          <button
                            onClick={() =>
                              setActiveDropdown(
                                activeDropdown === lead.id ? null : lead.id
                              )
                            }
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          {activeDropdown === lead.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => {
                                    setEditingLead(lead);
                                    setShowEditModal(true);
                                    setActiveDropdown(null);
                                  }}
                                  className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  <Edit3 className="w-4 h-4 mr-2" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    handleDeleteLead(lead.id);
                                    setActiveDropdown(null);
                                  }}
                                  className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                  <X className="w-4 h-4 mr-2" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Mobile Card View */}
        {isMobileView && (
          <div className="space-y-3">
            {/* Select All for Mobile */}
            <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={
                    selectedLeads.length === currentLeads.length &&
                    currentLeads.length > 0
                  }
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                />
                <span className="text-sm text-gray-700">Select All</span>
              </div>
              <span className="text-xs text-gray-500">
                {selectedLeads.length} selected
              </span>
            </div>

            {/* Lead Cards */}
            {currentLeads.map((lead) => (
              <MobileLeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="bg-white border-t border-gray-200 rounded-b-[24px] px-4 py-3 mt-0">
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0">
            <div className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
              Showing {startIndex + 1} to{" "}
              {Math.min(startIndex + leadsPerPage, filteredLeads.length)} of{" "}
              {filteredLeads.length} results
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                const pageNum =
                  Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                if (pageNum > totalPages) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-[7px] ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <LeadModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddLead}
        title="Add New Lead"
      />

      <LeadModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingLead(null);
        }}
        onSubmit={handleEditLead}
        lead={editingLead}
        title="Edit Lead"
      />
    </div>
  );
};

export default Leads;

/*import { DotLottieReact } from "@lottiefiles/dotlottie-react";

const Leads = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-[70vh] text-center px-4 py-10 sm:py-16">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4">
        Feature Coming Soon Leads
      </h1>

      <p className="text-gray-600 text-sm sm:text-base md:text-lg max-w-xl">
        This section is currently under development. We appreciate your patience
        while we work to bring this feature to life.
      </p>

      <DotLottieReact
        src="https://lottie.host/490acce8-7833-4e33-b3f2-9903dc15fb15/rVridJRK6u.lottie"
        loop
        autoplay
        className="w-full max-w-[400px] sm:max-w-[500px] md:max-w-[600px]"
      />
    </div>
  );
};

export default Leads;*/
