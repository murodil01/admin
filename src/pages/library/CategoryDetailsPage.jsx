import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { MdCreateNewFolder, MdMoreVert } from "react-icons/md";
import { FaFolder, FaFile } from 'react-icons/fa';
import api from '../../api/base';

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

  const fetchCategoryDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/library/categories/${id}`);
      const data = res.data;
      console.log('API ma\'lumotlari:', data);
      setCategory(data);

      const folderItems = (data.folders || []).map(f => ({ ...f, type: 'folder' }));
      const fileItems = (data.libraries || []).map(f => ({ ...f, type: 'file' }));
      console.log('Folder IDs:', folderItems.map(f => f.id));
      console.log('File IDs:', fileItems.map(f => f.id));
      setItems([...folderItems, ...fileItems]);
    } catch (error) {
      console.error('Fetch xatosi:', error.response?.data || error.message);
      setError('Ma\'lumotlarni yuklashda xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryDetails();
  }, [id]);

  const handleAddFolder = async (e) => {
    e.preventDefault();
    console.log('Yuborilayotgan papka nomi:', modalData.name);
    try {
      setLoading(true);
      await api.post('/library/folders/', {
        name: modalData.name,
        category_id: parseInt(id),
        view_options: 'public',
      });
      closeModal();
      fetchCategoryDetails();
    } catch (error) {
      console.error('API xatosi:', error.response?.data || error.message);
      setError('Papka qo\'shishda xatolik yuz berdi: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleAddFile = async (e) => {
    e.preventDefault();
    if (!modalData.file) {
      setError('Iltimos, fayl tanlang.');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', modalData.title);
      formData.append('file', modalData.file);
      formData.append('category_id', parseInt(id));
      formData.append('view_options', 'public');

      await api.post('/library/libraries/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      closeModal();
      fetchCategoryDetails();
    } catch (error) {
      console.error('File qo\'shish xatosi:', error.response?.data || error.message);
      setError('Fayl qo\'shishda xatolik yuz berdi: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!modalData.item) {
      setError('Tahrirlanadigan element topilmadi.');
      return;
    }
    try {
      setLoading(true);
      const { item, name, title } = modalData;
      const endpoint = item.type === 'folder' ? `/library/folders/${item.id}/` : `/library/libraries/${item.id}/`;
      const data = item.type === 'folder'
        ? { name, category_id: parseInt(id), view_options: item.view_options || 'public' }
        : { title, category_id: parseInt(id), view_options: item.view_options || 'public' };
      console.log('PATCH endpoint:', endpoint);
      console.log('PATCH ma\'lumotlari:', data);
      await api.patch(endpoint, data);
      closeModal();
      fetchCategoryDetails();
    } catch (error) {
      console.error('Edit xatosi:', error.response?.data || error.message);
      setError('Elementni tahrirlashda xatolik yuz berdi: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

   const handleDelete = async () => {
    if (!modalData.item) {
      setError('O\'chiriladigan element topilmadi.');
      return;
    }
    try {
      setLoading(true);
      const { item } = modalData;
      const endpoint = item.type === 'folder' ? `/library/folders/${item.id}/` : `/library/libraries/${item.id}/`;
      console.log('DELETE endpoint:', endpoint);
      await api.delete(endpoint);
      closeModal();
      fetchCategoryDetails();
    } catch (error) {
      console.error('Delete xatosi:', error.response?.data || error.message);
      setError('Elementni o\'chirishda xatolik yuz berdi: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown === null) return;

      const ref = dropdownRefs.current[showDropdown];
      if (ref?.current && !ref.current.contains(event.target)) {
        setShowDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && showModal) {
        closeModal();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showModal]);

 
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const StatCard = ({ title, count, color, icon }) => (
    <div className={`bg-gradient-to-br from-${color}-50 to-${color}-100 p-4 rounded-lg border border-${color}-200`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-xs sm:text-sm font-medium text-${color}-600 uppercase tracking-wide`}>{title}</p>
          <p className={`text-xl sm:text-2xl font-bold text-${color}-900 mt-1`}>{count ?? '0'}</p>
        </div>
        <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-${color}-200 rounded-full flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );

  const Modal = ({ children, onClose }) => (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 animate-fadeIn" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );

  const ModalHeader = ({ title, onClose }) => (
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-2 transition-colors"
        disabled={loading}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );


  const openModal = (type, item = null) => {
    console.log('Modal ochilmoqda, type:', type, 'item:', item);
    setShowModal(type);
    setShowDropdown(null);
    setModalData({
      name: item?.name || item?.title || '',
      title: item?.title || '',
      file: null,
      item,
    });
    setError(null);
  };

  const closeModal = () => {
    setShowModal(null);
    setModalData({ name: '', title: '', file: null, item: null });
    setError(null);
  };

  const toggleDropdown = (itemId) => {
    setShowDropdown(showDropdown === itemId ? null : itemId);
  };


  return (
    <main className="max-w-7xl py-4 mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0 px-4 sm:px-0">
        <h1 className="text-2xl sm:text-xl md:text-2xl lg:text-3xl font-semibold text-black">M Library</h1>

        <div className="flex flex-row items-center gap-7 w-full sm:w-auto justify-center sm:justify-end">
          <div
            onClick={() => !loading && openModal('addFolder')}
            className={`inline-flex items-center justify-center w-16 h-12 sm:w-11 sm:h-11 md:w-12 md:h-12 text-gray-800 hover:text-gray-600 transition-colors duration-200 rounded-lg hover:bg-gray-50 ${loading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
          >
            <MdCreateNewFolder className="w-16 h-12 sm:w-12 sm:h-12 md:w-14 md:h-14" />
          </div>

          <button
            onClick={() => openModal('addFile')}
            className="inline-flex items-center justify-center px-6 py-3 sm:px-4 sm:py-2 md:px-5 md:py-2.5 lg:px-6 lg:py-3 bg-[#0061fe] text-white text-sm md:text-base font-semibold rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors duration-200 flex-1 sm:flex-none min-w-[140px] sm:min-w-[120px] md:min-w-[140px] lg:min-w-[160px] disabled:opacity-50"
            disabled={loading}
          >
            <Plus className="w-5 h-5 lg:w-6 lg:h-6 mr-2" />
            <span className="whitespace-nowrap">Add File</span>
          </button>
        </div>
      </div>

      {/* Loading/Error */}
      {loading && <p className="text-gray-500 mt-4 text-center">Ma'lumotlar yuklanmoqda...</p>}
      {error && !showModal && <p className="text-red-500 mt-4 text-center">{error}</p>}

      {/* Category Info */}
      {category && !loading && (
        <div className="mt-6 p-4 sm:p-6 bg-white rounded-xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:scale-[1.01]">
          <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-6">
            {category.image && (
              <div className="flex justify-center lg:justify-start">
                <img
                  src={category.image}
                  alt="Category"
                  className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-44 lg:h-44 object-cover rounded-xl shadow-md"
                />
              </div>
            )}

            <div className="flex-1 w-full">
              <div className="mb-4 text-center lg:text-left">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{category.name || 'N/A'}</h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Created by {category.created_by?.first_name || ''} {category.created_by?.last_name || ''} • {formatDate(category.created_at)}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard
                  title="Folders"
                  count={category.folders_count}
                  color="blue"
                  icon={<FaFolder className="text-blue-500 w-5 h-5 sm:w-6 sm:h-6" />}
                />
                <StatCard
                  title="Files"
                  count={category.total_files_count}
                  color="blue"
                  icon={<FaFile className="text-blue-500 w-5 h-5 sm:w-6 sm:h-6" />}
                />
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200 sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-purple-600 uppercase tracking-wide">Total Size</p>
                      <p className="text-xl sm:text-2xl font-bold text-purple-900 mt-1">
                        {category.total_files_size > 1000
                          ? `${(category.total_files_size / 1000).toFixed(1)} GB`
                          : `${category.total_files_size ?? '0'} MB`}
                      </p>
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-200 rounded-full flex items-center justify-center">💾</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Items List */}
      <div>
        {items.length === 0 && !loading && (
          <p className="text-gray-500 mt-4 text-center">No items available.</p>
        )}
        <div className="mt-4 space-y-3 sm:space-y-4">
          {items.map((item) => {
            if (!dropdownRefs.current[item.id]) {
              dropdownRefs.current[item.id] = React.createRef();
            }

            return (
              <div
                key={`${item.type}-${item.id}`} // Noyob key
                className="p-4 sm:p-5 bg-white rounded-xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:scale-[1.01]"
              >
                {/* Mobile Layout */}
                <div className="block sm:hidden">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 bg-blue-50 rounded-lg`}>
                      {item.type === 'folder' ? (
                        <FaFolder className="text-blue-600 w-5 h-5" />
                      ) : (
                        <FaFile className="text-blue-600 w-5 h-5" />
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 text-base truncate">
                      {item.name || item.title || 'Untitled'}
                    </h3>
                  </div>

                  <div className="text-center mb-4">
                    <p className="text-sm text-gray-600 font-medium">
                      Created by:{' '}
                      <span className="text-gray-900 font-semibold">
                        {item.created_by?.first_name || ''}{' '}
                        {item.created_by?.last_name || ''}
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                      {(item.type === 'file' && item.file_size_mb != null) ||
                        (item.type === 'folder' && item.total_files_size_mb != null) ? (
                        <div className="bg-blue-50 rounded-lg px-2 py-1">
                          <p className="text-xs text-blue-900 font-bold">
                            {item.type === 'file'
                              ? item.file_size_mb > 1000
                                ? `${(item.file_size_mb / 1000).toFixed(1)} GB`
                                : `${item.file_size_mb} MB`
                              : item.total_files_size_mb > 1000
                                ? `${(item.total_files_size_mb / 1000).toFixed(1)} GB`
                                : `${item.total_files_size_mb} MB`}
                          </p>
                        </div>
                      ) : null}
                      {item.type === 'folder' && item.files_count != null && (
                        <div className="bg-green-50 rounded-lg px-2 py-1">
                          <p className="text-xs text-green-900 font-bold">
                            {item.files_count} Files
                          </p>
                        </div>
                      )}
                      <div className="bg-purple-50 rounded-lg px-2 py-1">
                        <p className="text-xs text-purple-900 font-bold">
                          {formatDate(item.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="relative" ref={dropdownRefs.current[item.id]}>
                      <MdMoreVert
                        className="w-6 h-6 text-gray-500 cursor-pointer hover:text-gray-800 hover:bg-gray-100 rounded-full p-1 transition-all duration-200"
                        onClick={() => toggleDropdown(item.id)}
                      />
                      {showDropdown === item.id && (
                        <div className="absolute right-0 top-8 bg-white shadow-xl rounded-lg p-2 flex flex-col space-y-1 z-10 w-24 border border-gray-200">
                          <button
                            className="text-blue-600 hover:bg-blue-50 px-3 py-2 rounded text-sm text-left font-medium transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal('edit', item);
                              setShowDropdown(null);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="text-red-600 hover:bg-red-50 px-3 py-2 rounded text-sm text-left font-medium transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal('delete', item);
                              setShowDropdown(null);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden sm:flex items-center gap-4">
                  <div className="flex items-center gap-4 w-80">
                    <div className={`p-3 bg-blue-50 rounded-xl flex-shrink-0`}>
                      {item.type === 'folder' ? (
                        <FaFolder className="text-blue-600 w-6 h-6" />
                      ) : (
                        <FaFile className="text-blue-600 w-6 h-6" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <h3 className="font-bold text-gray-900 text-lg truncate">
                        {item.name || item.title || 'Untitled'}
                      </h3>
                      <p className="text-sm text-gray-600 font-medium">
                        Created by:{' '}
                        <span className="text-gray-900 font-semibold">
                          {item.created_by?.first_name || ''}{' '}
                          {item.created_by?.last_name || ''}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex-1 text-center"></div>
                  <div className="flex items-center gap-4 min-w-fit">
                    <div className="flex items-center gap-2">
                      {(item.type === 'file' && item.file_size_mb != null) ||
                        (item.type === 'folder' && item.total_files_size_mb != null) ? (
                        <div className="bg-blue-50 rounded-lg px-3 py-2">
                          <p className="text-sm font-bold text-blue-900">
                            {item.type === 'file'
                              ? item.file_size_mb > 1000
                                ? `${(item.file_size_mb / 1000).toFixed(1)} GB`
                                : `${item.file_size_mb} MB`
                              : item.total_files_size_mb > 1000
                                ? `${(item.total_files_size_mb / 1000).toFixed(1)} GB`
                                : `${item.total_files_size_mb} MB`}
                          </p>
                        </div>
                      ) : null}
                      {item.type === 'folder' && item.files_count != null && (
                        <div className templo="bg-green-50 rounded-lg px-3 py-2">
                          <p className="text-sm font-bold text-green-900">
                            {item.files_count} Files
                          </p>
                        </div>
                      )}
                      <div className="bg-purple-50 rounded-lg px-3 py-2">
                        <p className="text-sm font-bold text-purple-900">
                          {formatDate(item.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="relative" ref={dropdownRefs.current[item.id]}>
                      <MdMoreVert
                        className="w-6 h-6 text-gray-500 cursor-pointer hover:text-gray-800 hover:bg-gray-100 rounded-full p-1 transition-all duration-200"
                        onClick={() => toggleDropdown(item.id)}
                      />
                      {showDropdown === item.id && (
                        <div className="absolute right-0 top-8 bg-white shadow-xl rounded-lg p-2 flex flex-col space-y-1 z-10 w-28 border border-gray-200">
                          <button
                            className="text-blue-600 hover:bg-blue-50 px-3 py-2 rounded text-sm text-left font-medium transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal('edit', item);
                              setShowDropdown(null);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="text-red-600 hover:bg-red-50 px-3 py-2 rounded text-sm text-left font-medium transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              openModal('delete', item);
                              setShowDropdown(null);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Folder Modal */}
      {showModal === 'addFolder' && (
        <Modal onClose={closeModal}>
          <ModalHeader title="Create New Folder" onClose={closeModal} />
          <form onSubmit={handleAddFolder} className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Folder Name</label>
              <input
                type="text"
                value={modalData.name}
                onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                placeholder="Enter folder name..."
                className="flex-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded-md">{error}</p>}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition" disabled={loading}>Cancel</button>
              <button type="submit" className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-md transition disabled:opacity-60" disabled={loading}>
                {loading ? "Adding..." : "Add Folder"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add File Modal */}
      {showModal === 'addFile' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6 animate-fadeIn" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border border-dashed border-blue-400 rounded-lg p-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Upload File</h3>
                <p className="text-sm text-gray-500">Select and upload the files of your choice</p>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 transition">✕</button>
            </div>

            <form onSubmit={handleAddFile} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File Title</label>
                <input
                  type="text"
                  value={modalData.title}
                  onChange={(e) => setModalData({ ...modalData, title: e.target.value })}
                  placeholder="Enter file title..."
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                  autoFocus
                />
              </div>

              <div className="border-2 border-dashed border-blue-400 rounded-lg p-8 text-center cursor-pointer hover:bg-blue-50 transition">
                <input
                  type="file"
                  id="file-upload"
                  onChange={(e) => setModalData({ ...modalData, file: e.target.files[0] })}
                  className="hidden"
                  required
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-blue-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 12v-4m0 0l4 4m-4-4l-4 4" />
                  </svg>
                  <p className="text-gray-600">Upload file or drag & drop it here</p>
                  <p className="text-xs text-gray-400 mt-1">JPEG, PNG, PDF, and MP4 formats, up to 50MB</p>
                  <span className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">Browse File</span>
                </label>
              </div>

              {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded-md">{error}</p>}

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition" disabled={loading}>Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-md transition disabled:opacity-60" disabled={loading}>
                  {loading ? "Saving..." : "Save File"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showModal === 'edit' && modalData.item && (
        <Modal onClose={closeModal}>
          <ModalHeader title={`Edit ${modalData.item.type === 'folder' ? 'Folder' : 'File'}`} onClose={closeModal} />
          <form onSubmit={handleEdit} className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                {modalData.item.type === 'folder' ? 'Folder Name' : 'File Title'}
              </label>
              <input
                type="text"
                value={modalData.item.type === 'folder' ? modalData.name : modalData.title}
                onChange={(e) => setModalData({
                  ...modalData,
                  [modalData.item.type === 'folder' ? 'name' : 'title']: e.target.value,
                })}
                placeholder={`Enter ${modalData.item.type === 'folder' ? 'folder name' : 'file title'}...`}
                className="flex-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                required
                autoFocus
              />
            </div>
            {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded-md">{error}</p>}
            <div className="flex justify-end gap-3">
              <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition" disabled={loading}>Cancel</button>
              <button type="submit" className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-md transition disabled:opacity-60" disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Modal */}
      {showModal === 'delete' && modalData.item && (
        <Modal onClose={closeModal}>
          <ModalHeader title={`Delete ${modalData.item.type === 'folder' ? 'Folder' : 'File'}`} onClose={closeModal} />
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete "{modalData.item.name || modalData.item.title}"? This action cannot be undone.
          </p>
          {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded-md mb-4">{error}</p>}
          <div className="flex justify-end gap-3">
            <button type="button" onClick={closeModal} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition" disabled={loading}>Cancel</button>
            <button type="button" onClick={handleDelete} className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-md transition disabled:opacity-60" disabled={loading}>
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
};

export default CategoryDetailsPage;