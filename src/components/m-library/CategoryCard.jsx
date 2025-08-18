import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaFile, FaEye, FaDownload } from 'react-icons/fa';
import { MdMoreVert } from 'react-icons/md';
import { Plus } from 'lucide-react';
import api from '../../api/base';

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

  // Folder ma'lumotlarini olish
  const fetchFolderDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/library/folders/${id}/`);
      setFolder(res.data); // API dan kelgan folder ma'lumotini saqlaymiz
    } catch (err) {
      setError("Folder ma'lumotini olishda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolderDetails();
  }, [id]);


  // Folder ichidagi fayllarni olish
  const fetchFolderFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/library/folders/${id}/items/`);
      setFiles(res.data.libraries || []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Folder ichidagi fayllarni olishda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolderFiles();
  }, [id]);

  // Click outside handler for dropdown
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

  const toggleDropdown = (itemId) =>
    setShowDropdown(showDropdown === itemId ? null : itemId);

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

  // Fayl qo'shish
  const handleAddFile = async (e) => {
    e.preventDefault();
    if (!modalData.file) return setError("Fayl tanlanmadi.");
    if (!modalData.title.trim()) return setError("Sarlavha bo'sh bo'lishi mumkin emas.");

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('title', modalData.title.trim());
      formData.append('file', modalData.file);
      formData.append('folder_id', parseInt(id));

      const response = await api.post('/library/libraries/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      console.log("Add response:", response.data);
      closeModal();
      fetchFolderFiles();
    } catch (err) {
      console.error("Add file error:", err.response?.data || err.message);
      setError("Fayl qo'shishda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  // Faylni tahrirlash - har xil usullarni sinash
  const handleEdit = async (e) => {
    e.preventDefault();
    if (!modalData.item) return setError("Tahrirlanadigan fayl topilmadi.");
    if (!modalData.title.trim()) return setError("Sarlavha bo'sh bo'lishi mumkin emas.");

    try {
      setLoading(true);

      console.log("Edit urinishi:", {
        itemId: modalData.item.id,
        newTitle: modalData.title.trim(),
        oldTitle: modalData.item.title,
      });

      // 1-usul: PATCH faqat title bilan
      try {
        const response = await api.patch(`/library/libraries/${modalData.item.id}/`, {
          title: modalData.title.trim(),
        });
        console.log("PATCH muvaffaqiyatli:", response.data);
        closeModal();
        fetchFolderFiles();
        return;
      } catch (patchErr) {
        console.log("PATCH ishlamadi, PUT ni sinab ko'ramiz:", patchErr.response?.data);
      }

      // 2-usul: PUT bilan folder_id ham qo'shib
      try {
        const response = await api.put(`/library/libraries/${modalData.item.id}/`, {
          title: modalData.title.trim(),
          folder_id: parseInt(id),
        });
        console.log("PUT muvaffaqiyatli:", response.data);
        closeModal();
        fetchFolderFiles();
        return;
      } catch (putErr) {
        console.log("PUT ham ishlamadi:", putErr.response?.data);
      }

      // 3-usul: FormData bilan
      try {
        const formData = new FormData();
        formData.append('title', modalData.title.trim());

        const response = await api.patch(`/library/libraries/${modalData.item.id}/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        console.log("FormData PATCH muvaffaqiyatli:", response.data);
        closeModal();
        fetchFolderFiles();
        return;
      } catch (formErr) {
        console.log("FormData PATCH ham ishlamadi:", formErr.response?.data);
      }

      // Hech qaysi usul ishlamadi
      setError("Hech qaysi tahrirlash usuli ishlamadi. Server bilan aloqa qiling.");

    } catch (err) {
      console.error("Umumiy edit xatolik:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });

      let errorMessage = "Faylni tahrirlashda xatolik";
      if (err.response?.data) {
        if (typeof err.response.data === 'object') {
          errorMessage += `: ${JSON.stringify(err.response.data)}`;
        } else {
          errorMessage += `: ${err.response.data}`;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Faylni o'chirish
  const handleDelete = async () => {
    if (!modalData.item) return setError("O'chiriladigan fayl topilmadi.");
    try {
      setLoading(true);
      await api.delete(`/library/libraries/${modalData.item.id}/`);
      closeModal();
      fetchFolderFiles();
    } catch (err) {
      console.error("Delete error:", err.response?.data || err.message);
      setError("Faylni o'chirishda xatolik yuz berdi.");
    } finally {
      setLoading(false);
    }
  };

  // Faylni ko'rish
  const handleViewFile = (item) => {
    if (item.file) {
      window.open(item.file, '_blank');
    }
  };

  // Faylni yuklab olish
  const handleDownloadFile = async (item) => {
    try {
      const response = await fetch(item.file);
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
      console.error("Download error:", err);
      setError("Faylni yuklab olishda xatolik yuz berdi.");
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
    if (!created_by) return 'Noma\'lum';
    const firstName = created_by.first_name || '';
    const lastName = created_by.last_name || '';
    return `${firstName} ${lastName}`.trim() || 'Noma\'lum';
  };

  return (
    <main className="max-w-7xl mx-auto py-4 sm:py-6">
      <div className="flex flex-row items-center justify-between mb-4 gap-1 sm:gap- w-full">
        <h1 className="text-base sm:text-lg font-bold text-gray-900 truncate">
          {folder?.name || "Folder nomi"}
        </h1>
        <button
          onClick={() => openModal('add')}
          className="flex items-center px-11 sm:px-11 py-2 sm:py-3 bg-blue-600 text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-blue-700 transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
          Add File
        </button>
      </div>

      {loading && (
        <div className="text-center py-3 sm:py-4 text-gray-500">Yuklanmoqda...</div>
      )}
      {error && (
        <p className="text-red-500 bg-red-50 p-2 sm:p-3 rounded-lg text-center text-sm sm:text-base">
          {error}
        </p>
      )}

      <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
        {files.length === 0 && !loading && (
          <p className="text-gray-500 text-center py-3 text-sm sm:text-base">
            Folderda fayl yo'q.
          </p>
        )}

        {files.map((item) => (
          <div
            key={item.id}
            className="p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-200 transition-all duration-200"
          >
            <div className="grid grid-cols-12 gap-6 items-center">
              {/* File Icon and Name - Col 1 */}
              <div className="col-span-12 sm:col-span-4 flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex-shrink-0 shadow-sm">
                  <FaFile className="text-blue-600 w-8 h-8" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 text-base truncate mb-2">
                    {item.title || 'Nomsiz'}
                  </h3>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleViewFile(item)}
                      className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1 rounded-md text-xs font-medium transition-all"
                      title="Faylni ko'rish"
                    >
                      <FaEye className="w-3 h-3" />
                      Ko'rish
                    </button>
                    <button
                      onClick={() => handleDownloadFile(item)}
                      className="flex items-center gap-1.5 text-green-600 hover:text-green-700 hover:bg-green-50 px-2 py-1 rounded-md text-xs font-medium transition-all"
                      title="Faylni yuklab olish"
                    >
                      <FaDownload className="w-3 h-3" />
                      Yuklab olish
                    </button>
                  </div>
                </div>
              </div>

              {/* Creator - Col 2 */}
              <div className="col-span-12 sm:col-span-3 flex  sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span className="text-xs text-gray-400 font-medium">Created by:</span>
                <p className="text-sm text-gray-700 font-semibold truncate">{getCreatorName(item.created_by)}</p>
              </div>
              {/* File Size and Date - Col 3 */}
              <div className="col-span-10 sm:col-span-4">
                <div className="flex flex-col justify-center h-full">
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.file_size_mb != null && (
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg px-2.5 py-1.5 shadow-sm border border-blue-200">
                        <p className="text-xs font-bold text-blue-800">
                          {item.file_size_mb > 1000
                            ? `${(item.file_size_mb / 1000).toFixed(1)} GB`
                            : `${item.file_size_mb} MB`}
                        </p>
                      </div>
                    )}
                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg px-2.5 py-1.5 shadow-sm border border-purple-200">
                      <p className="text-xs font-bold text-purple-800">
                        {formatDate(item.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions - Col 4 */}
              <div className="col-span-2 sm:col-span-1">
                <div className="flex justify-end">
                  <div
                    className="relative"
                    ref={(ref) => (dropdownRefs.current[item.id] = { current: ref })}
                  >
                    <button
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleDropdown(item.id);
                      }}
                      title="Harakatlar"
                    >
                      <MdMoreVert className="w-5 h-5" />
                    </button>
                    {showDropdown === item.id && (
                      <div className="absolute right-0 top-9 bg-white shadow-xl rounded-xl py-2 flex flex-col z-[1000] w-32 border border-gray-200 overflow-hidden">
                        <button
                          className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 px-4 py-2.5 text-sm font-medium text-left transition-all duration-200 flex items-center gap-2"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openModal('edit', item);
                          }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </button>
                        <div className="h-px bg-gray-100 mx-2"></div>
                        <button
                          className="text-red-600 hover:bg-red-50 hover:text-red-700 px-4 py-2.5 text-sm font-medium text-left transition-all duration-200 flex items-center gap-2"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openModal('delete', item);
                          }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showModal === 'add' && (
        <Modal title="Fayl Yuklash" onClose={closeModal}>
          <form onSubmit={handleAddFile} className="p-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fayl Sarlavhasi
            </label>
            <input
              type="text"
              value={modalData.title}
              onChange={(e) =>
                setModalData({ ...modalData, title: e.target.value })
              }
              placeholder="Fayl sarlavhasini kiriting..."
              className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none mb-3"
              autoFocus
              required
            />
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fayl Tanlang
            </label>
            <input
              type="file"
              onChange={(e) =>
                setModalData({ ...modalData, file: e.target.files[0] })
              }
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
                Bekor qilish
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                disabled={loading}
              >
                {loading ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {showModal === 'edit' && modalData.item && (
        <Modal title="Faylni Tahrirlash" onClose={closeModal}>
          <form onSubmit={handleEdit} className="p-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fayl Sarlavhasi
            </label>
            <input
              type="text"
              value={modalData.title}
              onChange={(e) =>
                setModalData({ ...modalData, title: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none mb-3"
              autoFocus
              required
            />
            <div className="bg-gray-50 p-3 rounded-lg mb-3">
              <p className="text-sm text-gray-600">
                <strong>Joriy fayl:</strong> {modalData.item.title}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Faqat sarlavhani o'zgartirishingiz mumkin. Fayl almashtirish uchun yangi fayl qo'shing.
              </p>
            </div>
            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
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
                {loading ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Modal */}
      {showModal === 'delete' && modalData.item && (
        <Modal title="Faylni O'chirish" onClose={closeModal}>
          <div className="p-4">
            <p className="text-sm text-gray-600 mb-4">
              "{modalData.item.title}" faylini o'chirishni xohlaysizmi? Bu amalni
              bekor qilib bo'lmaydi.
            </p>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
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