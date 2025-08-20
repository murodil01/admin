import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { MdCreateNewFolder, MdMoreVert } from 'react-icons/md';
import { FaFolder, FaFile, FaHdd, FaDownload, FaEye } from 'react-icons/fa';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import api from '../../api/base';
import { Permission } from "../../components/Permissions";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../components/constants/roles";

const CategoryDetailsPage = () => {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [showModal, setShowModal] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  const [modalData, setModalData] = useState({ name: '', title: '', file: null, item: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRefs = useRef({});
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [dataLoading, setDataLoading] = useState(true);
  const isLoading = authLoading || dataLoading;

  const fetchCategoryDetails = async () => {
    try {
      setDataLoading(true);
      setError(null);
      const res = await api.get(`/library/categories/${id}/items`);
      const data = res.data;
      console.log('API Response:', data);

      // Calculate category-level statistics
      const foldersCount = (data.folders || []).length;
      const totalFilesCount = (data.folders || []).reduce((sum, folder) => sum + (folder.files_count || 0), 0) +
                             (data.libraries || []).filter(lib => !lib.folder).length;
      const totalFilesSize = (data.folders || []).reduce((sum, folder) => sum + (folder.total_files_size_mb || 0), 0) +
                            (data.libraries || []).reduce((sum, lib) => sum + (lib.file_size_mb || 0), 0);

      setCategory({
        ...data,
        name: data.folders?.[0]?.category?.name || 'Policies', // Fallback to 'Policies' if name is missing
        created_by: data.folders?.[0]?.created_by || data.libraries?.[0]?.created_by || null,
        created_at: data.folders?.[0]?.created_at || data.libraries?.[0]?.created_at || null,
        folders_count: foldersCount,
        total_files_count: totalFilesCount,
        total_files_size: totalFilesSize
      });

      const folders = (data.folders || []).map(f => ({
        ...f,
        type: 'folder',
        file_count: f.files_count || 0,
        folder_size_mb: f.total_files_size_mb || 0
      }));
      const files = (data.libraries || []).map(f => ({
        ...f,
        type: 'file'
      }));

      setItems([...folders, ...files]);
    } catch (err) {
      setError('Ma\'lumotlarni yuklashda xatolik yuz berdi.');
      console.error('Fetch category error:', err.response?.data || err.message);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryDetails();
  }, [id]);

  const handleViewFile = async (file) => {
    try {
      if (file.file) {
        window.open(file.file, '_blank');
      } else {
        setError('Fayl manzili topilmadi');
      }
    } catch (error) {
      setError('Faylni ko\'rishda xatolik yuz berdi');
      console.error('View error:', error);
    }
  };

  const handleDownloadFile = async (item) => {
    try {
      if (typeof item.file === 'string' && item.file.startsWith('http')) {
        const response = await fetch(item.file);
        if (!response.ok) throw new Error('File not found');
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = item.title || 'downloaded_file';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 100);
      } else if (item.id) {
        const response = await api.get(`/library/libraries/${item.id}/download`, {
          responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const a = document.createElement('a');
        a.href = url;
        a.download = item.title || `file_${item.id}`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }, 100);
      } else {
        throw new Error('No valid file source found');
      }
    } catch (error) {
      console.error('Download error:', error);
      setError(error.message || 'Faylni yuklab olishda xatolik yuz berdi');
    }
  };

  const handleAddFolder = async (e) => {
    e.preventDefault();
    if (!modalData.name.trim()) return setError('Papka nomini kiriting');
    try {
      setLoading(true);
      await api.post('/library/folders/', {
        name: modalData.name.trim(),
        category_id: parseInt(id),
        view_options: modalData.view_options || 'public',
      });
      closeModal();
      fetchCategoryDetails();
    } catch (err) {
      setError(err.response?.data?.detail || 'Papka qo\'shishda xatolik yuz berdi');
      console.error('Add folder error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFile = async (e) => {
    e.preventDefault();
    if (!modalData.file) return setError('Faylni tanlang.');
    if (!modalData.title.trim()) return setError('Fayl sarlavhasini kiriting.');
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', modalData.title.trim());
      formData.append('file', modalData.file);
      formData.append('category_id', parseInt(id));
      formData.append('view_options', modalData.view_options || 'public');
      await api.post('/library/libraries/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      closeModal();
      fetchCategoryDetails();
    } catch (err) {
      setError(err.response?.data?.detail || 'Fayl qo\'shishda xatolik yuz berdi.');
      console.error('Add file error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!modalData.item) return setError('Tahrirlanadigan element topilmadi.');
    try {
      setLoading(true);
      const { item, name, title } = modalData;
      const endpoint = item.type === 'folder' ? `/library/folders/${item.id}/` : `/library/libraries/${item.id}/`;
      const data = item.type === 'folder'
        ? { name: name.trim(), category_id: parseInt(id), view_options: item.view_options || 'public' }
        : { title: title.trim(), category_id: parseInt(id), view_options: item.view_options || 'public' };
      await api.patch(endpoint, data);
      closeModal();
      fetchCategoryDetails();
    } catch (err) {
      setError(err.response?.data?.detail || 'Elementni tahrirlashda xatolik yuz berdi.');
      console.error('Edit error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!modalData.item) return setError('O\'chiriladigan element topilmadi.');
    try {
      setLoading(true);
      const { item } = modalData;
      const endpoint = item.type === 'folder' ? `/library/folders/${item.id}/` : `/library/libraries/${item.id}/`;
      await api.delete(endpoint);
      closeModal();
      fetchCategoryDetails();
    } catch (err) {
      setError(err.response?.data?.detail || 'Elementni o\'chirishda xatolik yuz berdi.');
      console.error('Delete error:', err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && dropdownRefs.current[showDropdown]?.contains) {
        if (!dropdownRefs.current[showDropdown].contains(event.target)) {
          setShowDropdown(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showModal) closeModal();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showModal]);

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showModal]);

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

  const StatCard = ({ title, count, icon, color, className }) => (
    <div className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border shadow-sm hover:shadow-md transition-all ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-xs font-semibold text-${color}-600 uppercase`}>{title}</p>
          <p className={`text-lg sm:text-xl font-bold text-${color}-900 mt-1`}>{count ?? '0'}</p>
        </div>
        <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-${color}-100 rounded-full flex items-center justify-center`}>
          {React.cloneElement(icon, { className: `text-${color}-600 w-4 h-4 sm:w-5 sm:h-5` })}
        </div>
      </div>
    </div>
  );

  const Modal = ({ children, onClose }) => (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );

  const ModalHeader = ({ title, onClose }) => (
    <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 rounded-full p-1 transition-colors text-xl"
      >
        ✕
      </button>
    </div>
  );

  const openModal = (type, item = null) => {
    setShowModal(type);
    setShowDropdown(null);
    setModalData({ name: item?.name || item?.title || '', title: item?.title || '', file: null, item });
    setError(null);
  };

  const closeModal = () => {
    setShowModal(null);
    setModalData({ name: '', title: '', file: null, item: null });
    setError(null);
  };

  const toggleDropdown = (itemType, itemId) => {
    const uniqueKey = `${itemType}-${itemId}`;
    setShowDropdown(showDropdown === uniqueKey ? null : uniqueKey);
  };

  return (
    <main className="max-w-7xl mx-auto py-4 sm:py-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-4 w-full">
        <h1 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
          {category?.name || 'M Library'}
        </h1>
        <Permission anyOf={[ROLES.FOUNDER, ROLES.MANAGER, ROLES.HEADS]}>
          <div className="flex flex-row items-center w-full sm:w-auto">
            <button
              onClick={() => openModal('addFolder')}
              className="p-3 sm:p-4 text-gray-800 hover:text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all"
              disabled={loading}
              aria-label="Add folder"
            >
              <MdCreateNewFolder className="w-10 h-10 sm:w-14 sm:h-14" />
            </button>
            <button
              onClick={() => openModal('addFile')}
              className="flex items-center justify-center px-6 py-3 sm:px-8 sm:py-3.5 bg-blue-600 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all w-[70%] sm:w-[170px]"
              disabled={loading}
            >
              <Plus className="w-5 h-5 mr-2" />
              <span>Add File</span>
            </button>
          </div>
        </Permission>
      </div>

      {isLoading && <div className="text-center py-3 sm:py-4 text-gray-500">Loading...</div>}
      {error && !showModal && (
        <p className="text-red-500 bg-red-50 p-2 sm:p-3 rounded-lg text-center text-sm sm:text-base">{error}</p>
      )}

      {category && !isLoading && (
        <div className="p-3 sm:p-4 md:p-6 bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-6">
            {category.image && (
              <div className="flex justify-center lg:justify-start">
                <img
                  src={category.image}
                  alt={category.name || 'Category'}
                  className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 object-cover rounded-lg sm:rounded-xl shadow-sm"
                  loading="lazy"
                />
              </div>
            )}
            <div className="flex-1">
              <div className="mb-3 sm:mb-4 text-center lg:text-left">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">
                  {category.name || 'N/A'}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600">
                  {getCreatorName(category.created_by)} • {formatDate(category.created_at)}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                <StatCard
                  title="Folders"
                  count={category.folders_count}
                  color="indigo"
                  icon={<FaFolder />}
                  className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200"
                />
                <StatCard
                  title="Files"
                  count={category.total_files_count}
                  color="teal"
                  icon={<FaFile />}
                  className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200"
                />
                <StatCard
                  title="Total size"
                  count={
                    category.total_files_size > 1000
                      ? `${(category.total_files_size / 1000).toFixed(1)} GB`
                      : `${category.total_files_size.toFixed(2)} MB`
                  }
                  color="purple"
                  icon={<FaHdd />}
                  className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
        {items.length === 0 && !isLoading && (
          <p className="text-gray-500 text-center py-3 text-sm sm:text-base">
            There are no element in this category.
          </p>
        )}
        {items.map((item) => {
          const uniqueKey = `${item.type}-${item.id}`;
          return (
            <div
              key={uniqueKey}
              className="p-3 sm:p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer"
              onClick={() => {
                if (item.type === 'folder') {
                  navigate(`/library/folders/${item.id}`);
                }
              }}
            >
              <div className="grid grid-cols-12 gap-3 sm:gap-4 items-center">
                <div className="col-span-12 sm:col-span-6 lg:col-span-4 flex items-start gap-3">
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg sm:rounded-xl flex-shrink-0">
                    {item.type === 'folder' ? (
                      <FaFolder className="text-blue-600 w-5 h-5 sm:w-6 sm:h-6" />
                    ) : (
                      <FaFile className="text-blue-600 w-5 h-5 sm:w-6 sm:h-6" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                      {item.name || item.title || 'Untitled'}
                    </h3>
                    {item.type === 'file' && (
                      <div className="flex items-center gap-2 mt-1.5 sm:mt-2 flex-wrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewFile(item);
                          }}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded-md text-xs font-medium transition-all"
                        >
                          <FaEye className="w-3 h-3 flex-shrink-0" />
                          <span className="xs:inline">View</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadFile(item);
                          }}
                          className="flex items-center gap-1 text-green-600 hover:text-green-700 hover:bg-green-50 px-2 py-1 rounded-md text-xs font-medium transition-all"
                        >
                          <FaDownload className="w-3 h-3 flex-shrink-0" />
                          <span className="xs:inline">Download</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

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

                <div className="col-span-6 sm:col-span-3 lg:col-span-3">
                  <div className="flex items-center gap-2 flex-wrap justify-end sm:justify-start">
                    {item.type === 'folder' ? (
                      <>
                        {item.folder_size_mb != null && (
                          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg px-2 py-1 shadow-sm">
                            <p className="text-xs font-semibold text-blue-800 whitespace-nowrap">
                              {(() => {
                                const sizeInMb = item.folder_size_mb;
                                if (sizeInMb > 1) {
                                  return sizeInMb > 1000
                                    ? `${(sizeInMb / 1000).toFixed(1)} GB`
                                    : `${sizeInMb.toFixed(2)} MB`;
                                } else if (sizeInMb > 0.001) {
                                  return `${(sizeInMb * 1000).toFixed(1)} KB`;
                                } else {
                                  return `${(sizeInMb * 1000 * 1000).toFixed(0)} B`;
                                }
                              })()}
                            </p>
                          </div>
                        )}
                        {item.file_count != null && (
                          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg px-2 py-1 shadow-sm">
                            <p className="text-xs font-semibold text-green-800 whitespace-nowrap">
                              {item.file_count} {item.file_count === 1 ? 'file' : 'files'}
                            </p>
                          </div>
                        )}
                      </>
                    ) : (
                      item.file_size_mb != null && (
                        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg px-2 py-1 shadow-sm">
                          <p className="text-xs font-semibold text-blue-800 whitespace-nowrap">
                            {(() => {
                              const sizeInMb = item.file_size_mb;
                              if (sizeInMb > 1) {
                                return sizeInMb > 1000
                                  ? `${(sizeInMb / 1000).toFixed(1)} GB`
                                  : `${sizeInMb.toFixed(2)} MB`;
                              } else if (sizeInMb > 0.001) {
                                return `${(sizeInMb * 1000).toFixed(1)} KB`;
                              } else {
                                return `${(sizeInMb * 1000 * 1000).toFixed(0)} B`;
                              }
                            })()}
                          </p>
                        </div>
                      )
                    )}
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg px-2 py-1 shadow-sm">
                      <p className="text-xs font-semibold text-purple-800 whitespace-nowrap">
                        {formatDate(item.created_at)}
                      </p>
                    </div>
                  </div>
                </div>

                <Permission anyOf={[ROLES.FOUNDER, ROLES.MANAGER, ROLES.HEADS]}>
                  <div className="col-span-12 sm:col-span-12 lg:col-span-2 flex justify-end">
                    <div className="relative" ref={(el) => (dropdownRefs.current[uniqueKey] = el)}>
                      <button
                        className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleDropdown(item.type, item.id);
                        }}
                      >
                        <MdMoreVert className="w-5 h-5" />
                      </button>
                      {showDropdown === uniqueKey && (
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
          );
        })}
      </div>

      <Permission anyOf={[ROLES.FOUNDER, ROLES.MANAGER, ROLES.HEADS]}>
        {showModal === 'addFolder' && (
          <Modal onClose={closeModal}>
            <ModalHeader title="Create New Folder" onClose={closeModal} />
            <form onSubmit={handleAddFolder} className="p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Folder Name</label>
              <input
                type="text"
                value={modalData.name}
                onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                placeholder="Enter folder name..."
                className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none mb-3"
                autoFocus
              />
              <label className="block text-sm font-medium text-gray-700 mb-2">View Options</label>
              <select
                value={modalData.view_options || 'public'}
                onChange={(e) => setModalData({ ...modalData, view_options: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none mb-3"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="chosen">Chosen</option>
              </select>
              {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded-md mb-3">{error}</p>}
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
                  {loading ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          </Modal>
        )}
        {showModal === 'addFile' && (
          <Modal onClose={closeModal}>
            <ModalHeader title="File Upload" onClose={closeModal} />
            <form onSubmit={handleAddFile} className="p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">File Title</label>
              <input
                type="text"
                value={modalData.title}
                onChange={(e) => setModalData({ ...modalData, title: e.target.value })}
                placeholder="Enter file title..."
                className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none mb-3"
                autoFocus
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
                  setModalData({ ...modalData, file });
                }}
                className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none mb-3"
              />
              {modalData.file && <p className="text-sm text-gray-600 mb-3">Selected: {modalData.file.name}</p>}
              <label className="block text-sm font-medium text-gray-700 mb-2">View Options</label>
              <select
                value={modalData.view_options || 'public'}
                onChange={(e) => setModalData({ ...modalData, view_options: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none mb-3"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="chosen">Chosen</option>
              </select>
              {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded-md mb-3">{error}</p>}
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
        {showModal === 'edit' && modalData.item && (
          <Modal onClose={closeModal}>
            <ModalHeader title={`${modalData.item.type === 'folder' ? 'Folder' : 'File'} Edit`} onClose={closeModal} />
            <form onSubmit={handleEdit} className="p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {modalData.item.type === 'folder' ? 'Folder Name' : 'File Title'}
              </label>
              <input
                type="text"
                value={modalData.item.type === 'folder' ? modalData.name : modalData.title}
                onChange={(e) =>
                  setModalData({
                    ...modalData,
                    [modalData.item.type === 'folder' ? 'name' : 'title']: e.target.value,
                  })
                }
                placeholder={modalData.item.type === 'folder' ? 'Enter folder name...' : 'Enter file title...'}
                className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none mb-3"
                autoFocus
              />
              {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded-md mb-3">{error}</p>}
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
        {showModal === 'delete' && modalData.item && (
          <Modal onClose={closeModal}>
            <ModalHeader title={`${modalData.item.type === 'folder' ? 'Folder' : 'File'} Delete`} onClose={closeModal} />
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                Are you sure you want to delete "{modalData.item.name || modalData.item.title}"? This action cannot be undone.
              </p>
              {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded-md mb-4">{error}</p>}
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
      </Permission>
    </main>
  );
};

export default CategoryDetailsPage;