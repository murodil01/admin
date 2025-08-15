import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { MdCreateNewFolder, MdMoreVert } from 'react-icons/md';
import { FaFolder, FaFile, FaHdd } from 'react-icons/fa';
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
  const navigate = useNavigate();

  const fetchCategoryDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/library/categories/${id}`);
      const data = res.data;
      setCategory(data);
      setItems([
        ...(data.folders || []).map(f => ({ ...f, type: 'folder' })),
        ...(data.libraries || []).map(f => ({ ...f, type: 'file' })),
      ]);
    } catch {
      setError("Ma'lumotlarni yuklashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryDetails();
  }, [id]);

  const handleAddFolder = async (e) => {
    e.preventDefault();
    if (!modalData.name) return setError("Papka nomini kiriting.");
    try {
      setLoading(true);
      await api.post('/library/folders/', {
        name: modalData.name,
        category_id: parseInt(id),
        view_options: 'public',
      });
      closeModal();
      fetchCategoryDetails();
    } catch {
      setError("Papka qo'shishda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFile = async (e) => {
    e.preventDefault();
    if (!modalData.file) return setError("Iltimos, fayl tanlang.");
    if (!modalData.title) return setError("Fayl sarlavhasini kiriting.");
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
    } catch {
      setError("Fayl qo'shishda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!modalData.item) return setError("Tahrirlanadigan element topilmadi.");
    try {
      setLoading(true);
      const { item, name, title } = modalData;
      const endpoint = item.type === 'folder' ? `/library/folders/${item.id}/` : `/library/libraries/${item.id}/`;
      const data = item.type === 'folder'
        ? { name, category_id: parseInt(id), view_options: item.view_options || 'public' }
        : { title, category_id: parseInt(id), view_options: item.view_options || 'public' };
      await api.patch(endpoint, data);
      closeModal();
      fetchCategoryDetails();
    } catch {
      setError("Elementni tahrirlashda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!modalData.item) return setError("O'chiriladigan element topilmadi.");
    try {
      setLoading(true);
      const { item } = modalData;
      const endpoint = item.type === 'folder' ? `/library/folders/${item.id}/` : `/library/libraries/${item.id}/`;
      await api.delete(endpoint);
      closeModal();
      fetchCategoryDetails();
    } catch {
      setError("Elementni o'chirishda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && dropdownRefs.current[showDropdown]?.current && !dropdownRefs.current[showDropdown].current.contains(event.target)) {
        setShowDropdown(null);
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
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showModal]);

  const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';

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
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-auto my-auto">
        {children}
      </div>
    </div>
  );

  const ModalHeader = ({ title, onClose }) => (
    <div className="flex items-center justify-between p-4 border-b">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <button 
        onClick={onClose} 
        className="text-gray-400 hover:text-gray-600 rounded-full p-1 transition-colors"
        aria-label="Close modal"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
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

  const toggleDropdown = (itemId) => setShowDropdown(showDropdown === itemId ? null : itemId);

  return (
    <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">M Library</h1>
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <button
            onClick={() => openModal('addFolder')}
            className="p-2 sm:p-3 text-gray-800 hover:text-gray-600 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-all"
            disabled={loading}
          >
            <MdCreateNewFolder className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
          <button
            onClick={() => openModal('addFile')}
            className="flex items-center px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white text-sm font-semibold rounded-lg sm:rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all min-w-[120px] sm:min-w-[140px]"
            disabled={loading}
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
            <span className="text-xs sm:text-sm">Add File</span>
          </button>
        </div>
      </div>

      {/* Loading and Error States */}
      {loading && <div className="text-center py-3 sm:py-4 text-gray-500">Yuklanmoqda...</div>}
      {error && !showModal && <p className="text-red-500 bg-red-50 p-2 sm:p-3 rounded-lg text-center text-sm sm:text-base">{error}</p>}

      {/* Category Details */}
      {category && !loading && (
        <div className="p-3 sm:p-4 md:p-6 bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-100 active:shadow-md sm:hover:shadow-md transition-all">
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
                  {category.created_by?.first_name || ''} {category.created_by?.last_name || ''} • {formatDate(category.created_at)}
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                <StatCard
                  title="Papkalar"
                  count={category.folders_count}
                  color="indigo"
                  icon={<FaFolder />}
                  className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200"
                />
                <StatCard
                  title="Fayllar"
                  count={category.total_files_count}
                  color="teal"
                  icon={<FaFile />}
                  className="bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200"
                />
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-2 sm:p-4 rounded-lg sm:rounded-xl border border-purple-200 shadow-sm sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-purple-600 uppercase">Umumiy Hajm</p>
                      <p className="text-base sm:text-lg font-bold text-purple-900 mt-1">
                        {category.total_files_size > 1000
                          ? `${(category.total_files_size / 1000).toFixed(1)} GB`
                          : `${category.total_files_size ?? '0'} MB`}
                      </p>
                    </div>
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <FaHdd className="text-purple-600 w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
        {items.length === 0 && !loading && (
          <p className="text-gray-500 text-center py-3 text-sm sm:text-base">Hech qanday element yo'q.</p>
        )}

        {items.map((item) => (
          <div
            key={`${item.type}-${item.id}`}
            className="p-1 sm:p-4 bg-white rounded-lg shadow-sm border border-gray-100 active:shadow-md sm:hover:shadow-md transition-all"
          >
            {/* Mobile Layout */}
            <div className="block sm:hidden">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-50 rounded-lg">
                  {item.type === 'folder' ? (
                    <FaFolder className="text-blue-600 w-4 h-4" />
                  ) : (
                    <FaFile className="text-blue-600 w-4 h-4" />
                  )}
                </div>
                <h3 className="font-bold text-gray-900 text-sm truncate flex-1">{item.name || item.title || 'Nomsiz'}</h3>
                <div className="relative" ref={(ref) => (dropdownRefs.current[item.id] = { current: ref })}>
                  <MdMoreVert
                    className="w-6 h-6 text-gray-500 cursor-pointer active:bg-gray-100 active:scale-95 rounded-full p-1 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDropdown(item.id);
                    }}
                  />
                  {showDropdown === item.id && (
                    <div className="absolute right-0 top-7 bg-white shadow-md rounded-lg p-1 flex flex-col space-y-1 z-10 w-24 border border-gray-200">
                      <button
                        className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded text-xs font-medium text-left"
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal('edit', item);
                        }}
                      >
                        Tahrirlash
                      </button>
                      <button
                        className="text-red-600 hover:bg-red-50 px-2 py-1 rounded text-xs font-medium text-left"
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal('delete', item);
                        }}
                      >
                        O'chirish
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                {item.created_by?.first_name || ''} {item.created_by?.last_name || ''} tomonidan
              </p>
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {(item.type === 'file' && item.file_size_mb != null) ||
                    (item.type === 'folder' && item.total_files_size_mb != null) ? (
                    <div className="bg-blue-50 rounded px-1.5 py-1">
                      <p className="text-[10px] font-semibold text-blue-900">
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
                    <div className="bg-green-50 rounded px-1.5 py-1">
                      <p className="text-[10px] font-semibold text-green-900">{item.files_count} Fayl</p>
                    </div>
                  )}
                  <div className="bg-purple-50 rounded px-1.5 py-1">
                    <p className="text-[10px] font-semibold text-purple-900">{formatDate(item.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden sm:flex items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <div className="p-2 sm:p-3 bg-blue-50 rounded-lg">
                  {item.type === 'folder' ? (
                    <FaFolder className="text-blue-600 w-5 h-5" />
                  ) : (
                    <FaFile className="text-blue-600 w-5 h-5" />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base truncate">{item.name || item.title || 'Nomsiz'}</h3>
                  <p className="text-xs text-gray-600">
                    {item.created_by?.first_name || ''} {item.created_by?.last_name || ''} tomonidan
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                {(item.type === 'file' && item.file_size_mb != null) ||
                  (item.type === 'folder' && item.total_files_size_mb != null) ? (
                  <div className="bg-blue-50 rounded-lg px-2 py-1.5">
                    <p className="text-xs font-semibold text-blue-900">
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
                  <div className="bg-green-50 rounded-lg px-2 py-1.5">
                    <p className="text-xs font-semibold text-green-900">{item.files_count} Fayl</p>
                  </div>
                )}
                <div className="bg-purple-50 rounded-lg px-2 py-1.5">
                  <p className="text-xs font-semibold text-purple-900">{formatDate(item.created_at)}</p>
                </div>
                <div className="relative" ref={(ref) => (dropdownRefs.current[item.id] = { current: ref })}>
                  <MdMoreVert
                    className="w-5 h-5 text-gray-500 cursor-pointer hover:bg-gray-100 rounded-full p-1 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDropdown(item.id);
                    }}
                  />
                  {showDropdown === item.id && (
                    <div className="absolute right-0 top-8 bg-white shadow-md rounded-lg p-1 flex flex-col space-y-1 z-10 w-28 border border-gray-200">
                      <button
                        className="text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded text-xs font-medium text-left"
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal('edit', item);
                        }}
                      >
                        Tahrirlash
                      </button>
                      <button
                        className="text-red-600 hover:bg-red-50 px-3 py-1.5 rounded text-xs font-medium text-left"
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal('delete', item);
                        }}
                      >
                        O'chirish
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Folder Modal */}
      {showModal === 'addFolder' && (
        <Modal onClose={closeModal}>
          <ModalHeader title="Yangi Papka Yaratish" onClose={closeModal} />
          <form onSubmit={handleAddFolder} className="p-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Papka Nomi</label>
            <input
              type="text"
              value={modalData.name}
              onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
              placeholder="Papka nomini kiriting..."
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
                Bekor qilish
              </button>
              <button 
                type="submit" 
                className="px-4 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                disabled={loading}
              >
                {loading ? "Qo'shilmoqda..." : "Qo'shish"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add File Modal */}
      {showModal === 'addFile' && (
        <Modal onClose={closeModal}>
          <ModalHeader title="Fayl Yuklash" onClose={closeModal} />
          <form onSubmit={handleAddFile} className="p-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Fayl Sarlavhasi</label>
            <input
              type="text"
              value={modalData.title}
              onChange={(e) => setModalData({ ...modalData, title: e.target.value })}
              placeholder="Fayl sarlavhasini kiriting..."
              className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none mb-3"
              autoFocus
            />
            
            <div className="border-2 border-dashed border-blue-400 rounded-lg p-4 text-center cursor-pointer hover:bg-blue-50 transition mb-3">
              <input
                type="file"
                id="file-upload"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file && file.size > 50 * 1024 * 1024) {
                    setError("Fayl hajmi 50MB dan kichik bo'lishi kerak!");
                    return;
                  }
                  if (file && !['image/jpeg', 'image/png', 'application/pdf', 'video/mp4'].includes(file.type)) {
                    setError("Faqat JPEG, PNG, PDF yoki MP4 fayllari qabul qilinadi!");
                    return;
                  }
                  setModalData({ ...modalData, file });
                }}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <svg className="w-8 h-8 text-blue-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 12v-4m0 0l4 4m-4-4l-4 4" />
                </svg>
                <p className="text-sm text-gray-600">Faylni yuklang yoki bu yerga sudrab keling</p>
                <p className="text-xs text-gray-400 mt-1">JPEG, PNG, PDF, MP4 formatlari, 50MB gacha</p>
                <span className="mt-3 px-4 py-1.5 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition text-sm">
                  Fayl Tanlash
                </span>
              </label>
            </div>
            
            {modalData.file && <p className="text-sm text-gray-600 mb-3">Tanlangan: {modalData.file.name}</p>}
            {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded-md mb-3">{error}</p>}
            
            <div className="flex justify-end gap-2">
              <button 
                type="button" 
                onClick={closeModal} 
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Bekor qilish
              </button>
              <button 
                type="submit" 
                className="px-4 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                disabled={loading}
              >
                {loading ? "Saqlanmoqda..." : "Saqlash"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {showModal === 'edit' && modalData.item && (
        <Modal onClose={closeModal}>
          <ModalHeader title={`${modalData.item.type === 'folder' ? 'Papka' : 'Fayl'} Tahrirlash`} onClose={closeModal} />
          <form onSubmit={handleEdit} className="p-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {modalData.item.type === 'folder' ? 'Papka Nomi' : 'Fayl Sarlavhasi'}
            </label>
            <input
              type="text"
              value={modalData.item.type === 'folder' ? modalData.name : modalData.title}
              onChange={(e) => setModalData({ ...modalData, [modalData.item.type === 'folder' ? 'name' : 'title']: e.target.value })}
              placeholder={modalData.item.type === 'folder' ? 'Papka nomini kiriting...' : 'Fayl sarlavhasini kiriting...'}
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
                Bekor qilish
              </button>
              <button 
                type="submit" 
                className="px-4 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                disabled={loading}
              >
                {loading ? "Saqlanmoqda..." : "Saqlash"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Modal */}
      {showModal === 'delete' && modalData.item && (
        <Modal onClose={closeModal}>
          <ModalHeader title={`${modalData.item.type === 'folder' ? 'Papka' : 'Fayl'} O'chirish`} onClose={closeModal} />
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-4">
              "{modalData.item.name || modalData.item.title}"ni o'chirishni xohlaysizmi? Bu amalni bekor qilib bo'lmaydi.
            </p>
            {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded-md mb-4">{error}</p>}
            <div className="flex justify-end gap-2">
              <button 
                type="button" 
                onClick={closeModal} 
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
              >
                Bekor qilish
              </button>
              <button 
                type="button" 
                onClick={handleDelete} 
                className="px-4 py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                disabled={loading}
              >
                {loading ? "O'chirilmoqda..." : "O'chirish"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </main>
  );
};

export default CategoryDetailsPage;