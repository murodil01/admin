import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaFile, FaEye, FaDownload } from 'react-icons/fa';
import { MdMoreVert } from 'react-icons/md';
import { FiEdit2, FiTrash2 } from 'react-icons/fi'; // Added missing imports
import { Plus } from 'lucide-react';
import api from '../../api/base';
import { Permission } from "../../components/Permissions";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../components/constants/roles";

const CategoryCard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  const [showModal, setShowModal] = useState(null);
  const [modalData, setModalData] = useState({ title: '', file: null, item: null });
  const dropdownRefs = useRef({});
  const [folder, setFolder] = useState(null);

  const { user, loading: authLoading } = useAuth();
  const [dataLoading, setDataLoading] = useState(true);
  // Yuklash holatini birlashtirish
  const isLoading = authLoading || dataLoading;


  // Fetch folder details
  const fetchFolderDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/library/folders/${id}/`);
      setFolder(res.data);
    } catch (err) {
      setError('Failed to fetch folder details. Please try again.');
      console.error('Fetch folder error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolderDetails();
  }, [id]);

  // Fetch folder files
  const fetchFolderFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/library/folders/${id}/items/`);
      setFiles(res.data.libraries || []);
    } catch (err) {
      setError('Failed to fetch files. Please try again.');
      console.error('Fetch files error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolderFiles();
  }, [id]);

  // Handle click outside for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && dropdownRefs.current[showDropdown]?.current) {
        if (!dropdownRefs.current[showDropdown].current.contains(event.target)) {
          setShowDropdown(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const toggleDropdown = (itemId) => setShowDropdown(showDropdown === itemId ? null : itemId);

  const openModal = (type, item = null) => {
    setShowModal(type);
    setShowDropdown(null);
    setModalData({
      title: item?.title || '',
      file: null,
      item,
    });
    setError(null);
  };

  const closeModal = () => {
    setShowModal(null);
    setModalData({ title: '', file: null, item: null });
    setError(null);
  };

  // Add file
  const handleAddFile = async (e) => {
    e.preventDefault();
    if (!modalData.file) return setError('Please select a file.');
    if (!modalData.title.trim()) return setError('Title cannot be empty.');

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', modalData.title.trim());
      formData.append('file', modalData.file);
      formData.append('folder_id', parseInt(id));

      await api.post('/library/libraries/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      closeModal();
      fetchFolderFiles();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add file. Please try again.');
      console.error('Add file error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Edit file
  const handleEdit = async (e) => {
    e.preventDefault();
    if (!modalData.item) return setError('No file selected for editing.');
    if (!modalData.title.trim()) return setError('Title cannot be empty.');

    try {
      setLoading(true);
      await api.patch(`/library/libraries/${modalData.item.id}/`, {
        title: modalData.title.trim(),
        folder_id: parseInt(id), // Include folder_id to ensure consistency
      });
      closeModal();
      fetchFolderFiles();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update file. Please try again.');
      console.error('Edit file error:', {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete file
  const handleDelete = async () => {
    if (!modalData.item) return setError('No file selected for deletion.');
    try {
      setLoading(true);
      await api.delete(`/library/libraries/${modalData.item.id}/`);
      closeModal();
      fetchFolderFiles();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete file. Please try again.');
      console.error('Delete file error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // View file
  const handleViewFile = (item) => {
    if (item.file) {
      window.open(item.file, '_blank');
    } else {
      setError('File URL not available.');
    }
  };

  // Download file
  const handleDownloadFile = async (item) => {
    try {
      const response = await fetch(item.file);
      if (!response.ok) throw new Error('Failed to fetch file.');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.title || 'file';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError('Failed to download file. Please try again.');
      console.error('Download error:', err);
    }
  };

  const formatDate = (dateString) =>
    dateString
      ? new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
      : 'N/A';

  const getCreatorName = (created_by) => {
    if (!created_by) return 'Unknown';
    const firstName = created_by.first_name || '';
    const lastName = created_by.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'Unknown';
  };

  return (
    <main className="max-w-7xl mx-auto py-4 sm:py-6">
      <div className="flex flex-row items-center justify-between mb-4 gap-1 sm:gap- w-full">
        <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate">
          {folder?.name || 'Folder name'}
        </h1>
        <Permission anyOf={[ROLES.FOUNDER, ROLES.MANAGER, ROLES.HEADS]}>
          <button
            onClick={() => openModal('add')}
            className="flex items-center px-11 sm:px-11 py-2 sm:py-3 bg-blue-600 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all whitespace-nowrap"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
            Add File
          </button>
        </Permission>
      </div>

      {loading && <div className="text-center py-3 sm:py-4 text-gray-500">Loading...</div>}
      {error && (
        <p className="text-red-500 bg-red-50 p-2 sm:p-3 rounded-lg text-center text-sm sm:text-base">
          {error}
        </p>
      )}

      <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
        {files.length === 0 && !loading && (
          <p className="text-gray-500 text-center py-3 text-sm sm:text-base">
            No files in this folder.
          </p>
        )}

        {files.map((item) => (
          <div
            key={item.id}
            className="p-3 sm:p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all duration-200"
          >
            <div className="grid grid-cols-12 gap-3 sm:gap-4 items-center">
              {/* File Icon and Name */}
              <div className="col-span-12 sm:col-span-6 lg:col-span-4 flex items-start gap-3">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg sm:rounded-xl flex-shrink-0">
                  <FaFile className="text-blue-600 w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                    {item.title || 'Untitled'}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 sm:mt-2 flex-wrap">
                    <button
                      onClick={() => handleViewFile(item)}
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded-md text-xs font-medium transition-all"
                    >
                      <FaEye className="w-3 h-3 flex-shrink-0" />
                      <span className="xs:inline">View</span>
                    </button>
                    <button
                      onClick={() => handleDownloadFile(item)}
                      className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 px-2 py-1 rounded-md text-xs font-medium transition-all"
                    >
                      <FaDownload className="w-3 h-3 flex-shrink-0" />
                      <span className="xs:inline">Download</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Creator Information */}
              <div className="col-span-6 sm:col-span-3 lg:col-span-3">
                <div className="bg-gray-50 rounded-lg px-2.5 py-1.5 w-full">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="text-xs text-gray-500 font-medium flex-shrink-0 hidden sm:inline">
                      Created by:
                    </span>
                    <span className="text-xs text-gray-500 font-medium flex-shrink-0 sm:hidden">By:</span>
                    <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">
                      {getCreatorName(item.created_by)}
                    </p>
                  </div>
                </div>
              </div>

              {/* File Size and Date */}
              <div className="col-span-6 sm:col-span-3 lg:col-span-3">
                <div className="flex items-center gap-2 flex-wrap justify-end sm:justify-start">
                  {item.file_size_mb != null && (
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg px-2 py-1 shadow-sm">
                      <p className="text-xs font-semibold text-blue-800 whitespace-nowrap">
                        {(() => {
                          const sizeInMb = item.file_size_mb;
                          if (sizeInMb > 1) {
                            return sizeInMb > 1000
                              ? `${(sizeInMb / 1000).toFixed(1)} GB`
                              : `${sizeInMb.toFixed(1)} MB`;
                          } else if (sizeInMb > 0.001) {
                            return `${(sizeInMb * 1000).toFixed(1)} KB`;
                          } else {
                            return `${(sizeInMb * 1000 * 1000).toFixed(0)} B`;
                          }
                        })()}
                      </p>
                    </div>
                  )}
                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg px-2 py-1 shadow-sm">
                    <p className="text-xs font-semibold text-purple-800 whitespace-nowrap">
                      {formatDate(item.created_at)}
                    </p>
                  </div>
                </div>
              </div>


              {/* Actions Dropdown */}
              <Permission anyOf={[ROLES.FOUNDER, ROLES.MANAGER, ROLES.HEADS]}>
                <div className="col-span-12 sm:col-span-12 lg:col-span-2 flex justify-end">
                  <div className="relative" ref={(ref) => (dropdownRefs.current[item.id] = { current: ref })}>
                    <button
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleDropdown(item.id);
                      }}
                    >
                      <MdMoreVert className="w-5 h-5" />
                    </button>

                    {showDropdown === item.id && (
                      <div className="absolute right-0 top-9 bg-white shadow-lg rounded-lg py-1 flex flex-col z-50 w-36 border border-gray-200">
                        <button
                          className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openModal('edit', item);
                          }}
                        >
                          <FiEdit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 flex items-center gap-2"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openModal('delete', item);
                          }}
                        >
                          <FiTrash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Permission>

            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showModal === 'add' && (
        <Modal title="File Upload" onClose={closeModal}>
          <form onSubmit={handleAddFile} className="p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">File Title</label>
            <input
              type="text"
              value={modalData.title}
              onChange={(e) => setModalData({ ...modalData, title: e.target.value })}
              placeholder="Enter file title..."
              className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none mb-3"
              autoFocus
              required
            />
            <label className="block text-sm font-medium text-gray-700 mb-1">Select File</label>
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file && file.size > 50 * 1024 * 1024) {
                  setError("Fayl hajmi 50MB dan kichik bo'lishi kerak!");
                  return;
                }
                if (
                  file &&
                  ![
                    "image/jpeg",
                    "image/png",
                    "application/pdf",
                    "video/mp4",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    "application/vnd.ms-excel",
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "application/vnd.ms-powerpoint",
                    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                    "application/zip",
                    "application/x-zip-compressed",
                  ].includes(file.type)
                ) {
                  setError(
                    "Faqat JPEG, PNG, PDF, MP4, Word (.doc, .docx), Excel (.xls, .xlsx), PowerPoint (.ppt, .pptx) yoki ZIP fayllari qabul qilinadi!"
                  );
                  return;
                }
                setModalData({ ...modalData, file });
              }}
              className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none mb-3"
              required
            />
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {showModal === 'edit' && modalData.item && (
        <Modal title="Edit File" onClose={closeModal}>
          <form onSubmit={handleEdit} className="p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">File Title</label>
            <input
              type="text"
              value={modalData.title}
              onChange={(e) => setModalData({ ...modalData, title: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none mb-3"
              autoFocus
              required
            />
            <div className="bg-gray-50 p-3 rounded-lg mb-3">
              <p className="text-sm text-gray-600">
                <strong>Current file:</strong> {modalData.item.title}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                You can only change the title. Upload a new file to replace the current one.
              </p>
            </div>
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Modal */}
      {showModal === 'delete' && modalData.item && (
        <Modal title="Delete File" onClose={closeModal}>
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to delete "{modalData.item.title}"? This action cannot be undone.
            </p>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </main>
  );
};

// Modal component
const Modal = ({ title, children, onClose }) => (
  <div
    className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
    onClick={(e) => e.target === e.currentTarget && onClose()}
  >
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 rounded-full p-1 transition-colors text-xl"
        >
          ✕
        </button>
      </div>
      {children}
    </div>
  </div>
);

export default CategoryCard;