import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { MdCreateNewFolder } from "react-icons/md";
import { FaFolder, FaFile } from 'react-icons/fa';
import { MdMoreVert } from 'react-icons/md';
import api from '../../api/base';

const CategoryDetailsPage = () => {
  const { id } = useParams();
  const [category, setCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [activeItemId, setActiveItemId] = useState(null);
  const [showModal, setShowModal] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  const [modalData, setModalData] = useState({ name: '', title: '', file: null, item: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString);
        return 'Invalid Date';
      }
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch (err) {
      console.error('Error formatting date:', dateString, err);
      return 'Invalid Date';
    }
  };

  //  Category va items ma'lumotlarini olish
  const fetchCategoryDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/library/categories/${id}`);
      const data = res.data;
      setCategory(data);
      const folderItems = (data.folders || []).map(f => ({ ...f, type: 'folder' }));
      const fileItems = (data.libraries || []).map(f => ({ ...f, type: 'file' }));
      setItems([...folderItems, ...fileItems]);
    } catch (error) {
      console.error('Error fetching category details:', error.response?.data || error.message);
      setError('Ma\'lumotlarni yuklashda xatolik yuz berdi. Iltimos, qayta urinib ko\'ring.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryDetails();
  }, [id]);

  //  Modal ochish/yopish
  const openModal = (type, item = null) => {
    setShowModal(type);
    setShowDropdown(null); // Close dropdown when opening a modal
    setActiveItemId(item?.id || null);
    setModalData({
      name: item?.name || item?.title || '',
      title: item?.title || '',
      file: null,
      item,
    });
  };

  const closeModal = () => {
    setShowModal(null);
    setActiveItemId(null);
    setModalData({ name: '', title: '', file: null, item: null });
    setError(null);
  };

  //  Dropdown toggle
  const toggleDropdown = (itemId) => {
    if (showDropdown === itemId) {
      setShowDropdown(null);
    } else {
      setShowDropdown(itemId);
      setShowModal(null);
    }
  };

  //  Add Folder
  const handleAddFolder = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const response = await api.post('https://prototype-production-2b67.up.railway.app/library/folders/', {
        name: modalData.name,
        category_id: parseInt(id),
        view_options: 'public',
      });
      console.log('Folder added:', response.data);
      closeModal();
      fetchCategoryDetails();
    } catch (error) {
      console.error('Error adding folder:', error.response?.data || error.message);
      setError(error.response?.data?.message || error.response?.data?.detail || 'Papka qo\'shishda xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  //  Add File
  const handleAddFile = async (e) => {
    e.preventDefault();
    if (!modalData.file) {
      setError('Iltimos, fayl tanlang.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append('title', modalData.title);
      formData.append('file', modalData.file);
      formData.append('category_id', parseInt(id));
      formData.append('view_options', 'public');
      const response = await api.post('https://prototype-production-2b67.up.railway.app/library/libraries/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      console.log('File added:', response.data);
      closeModal();
      fetchCategoryDetails();
    } catch (error) {
      console.error('Error adding file:', error.response?.data || error.message);
      setError(error.response?.data?.message || error.response?.data?.detail || 'Fayl qo\'shishda xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  //  Edit Item
  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const { item, name, title } = modalData;
      let response;
      if (item.type === 'folder') {
        response = await api.patch(`https://prototype-production-2b67.up.railway.app/library/folders/${item.id}/`, { name });
      } else {
        response = await api.patch(`https://prototype-production-2b67.up.railway.app/library/libraries/${item.id}/`, { title });
      }
      console.log('Item edited:', response.data);
      closeModal();
      fetchCategoryDetails();
    } catch (error) {
      console.error('Error editing item:', error.response?.data || error.message);
      setError(error.response?.data?.message || error.response?.data?.detail || 'Elementni tahrirlashda xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  //  Delete Item
  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      const { item } = modalData;
      let response;
      if (item.type === 'folder') {
        response = await api.delete(`https://prototype-production-2b67.up.railway.app/library/folders/${item.id}/`);
      } else {
        response = await api.delete(`https://prototype-production-2b67.up.railway.app/library/libraries/${item.id}/`);
      }
      console.log('Item deleted:', response.data);
      closeModal();
      fetchCategoryDetails();
    } catch (error) {
      console.error('Error deleting item:', error.response?.data || error.message);
      setError(error.response?.data?.message || error.response?.data?.detail || 'Elementni o\'chirishda xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-7xl py-4 mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 space-y-4 sm:space-y-0">
        <h1 className="text-xl sm:text-3xl font-semibold text-black">M Library</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Add Folder Icon */}
          <div
            onClick={() => !loading && openModal('addFolder')}
            className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 text-gray-800 transition-colors duration-200 ${loading ? ' cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <MdCreateNewFolder
              className="w-10 h-10 sm:w-12 sm:h-14" />
          </div>

          {/* Add File Button */}
          <button
            onClick={() => openModal('addFile')}
            className="inline-flex items-center justify-center w-full sm:w-44 px-4 sm:px-6 py-2 sm:py-3 bg-[#0061fe] text-white text-sm sm:text-base font-bold rounded-[14px] hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            <Plus className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
            <span>Add File</span>
          </button>
        </div>
      </div>

      {/* Loading va Error holatlari */}
      {loading && <p className="text-gray-500 mt-4 text-center">Ma'lumotlar yuklanmoqda...</p>}
      {error && !showModal && <p className="text-red-500 mt-4 text-center">{error}</p>}

      {/* Category Info */}
      {category && !loading && !error && (
        <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-6 mt-4 p-4 sm:p-6 bg-white rounded-xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]">
          {category.image && (
            <img
              src={category.image}
              alt="Category"
              className="w-24 h-24 sm:w-40 sm:h-40 object-cover rounded-lg mx-auto sm:mx-0"
            />
          )}
          <div className="flex flex-col w-full space-y-3 sm:space-y-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <p className="text-sm sm:text-base font-bold text-gray-700">
                  Category Name: <span className="text-gray-900">{category.name || 'N/A'}</span>
                </p>
                <p className="text-sm sm:text-base font-bold text-gray-700">
                  Category on: <span className="text-gray-900">{formatDate(category.created_at)}</span>
                </p>
                <p className="text-sm sm:text-base font-medium text-gray-700">
                  Created by:{' '}
                  <span className="text-gray-600">
                    {category.created_by?.first_name || ''} {category.created_by?.last_name || ''}
                  </span>
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm sm:text-base font-bold text-gray-700">
                  Number of folders:{' '}
                  <span className="text-gray-900">{category.folders_count ?? '0'}</span>
                </p>
                <p className="text-sm sm:text-base font-bold text-gray-700">
                  Number of files: <span className="text-gray-900">{category.total_files_count ?? '0'}</span>
                </p>
                <p className="text-sm sm:text-base font-bold text-gray-700">
                  Category size:{' '}
                  <span className="text-gray-900">
                    {category.total_files_size > 1000
                      ? `${(category.total_files_size / 1000).toFixed(2)} GB`
                      : `${category.total_files_size ?? '0'} MB`}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Items List */}
      {/* <h2 className="text-xl font-semibold text-black mt-10">C Items</h2> */}
      {items.length === 0 && !loading && !error && <p className="text-gray-500 mt-4 text-center">No items available.</p>}
      <div className="mt-4 space-y-3 sm:space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-3 sm:p-4 bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              {item.type === 'folder' ? (
                <FaFolder className="text-blue-500 w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <FaFile className="text-blue-500 w-5 h-5 sm:w-6 sm:h-6" />
              )}
              <p className="font-semibold text-gray-900 text-sm sm:text-lg">
                {item.name || item.title || 'Untitled'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <p className="text-xs sm:text-sm text-gray-600">
                Created by: {item.created_by?.first_name || ''}{' '}
                {item.created_by?.last_name || ''}
              </p>
              <div className="text-xs sm:text-sm text-gray-600">
                {item.file_size_mb != null && (
                  <p>
                    Size:{' '}
                    {item.file_size_mb > 1000
                      ? `${(item.file_size_mb / 1000).toFixed(2)} GB`
                      : `${item.file_size_mb} MB`}
                  </p>
                )}
                <p>Created at: {formatDate(item.created_at)}</p>
              </div>
              <div className="relative">
                <MdMoreVert
                  className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 cursor-pointer hover:text-gray-800 transition-colors duration-200"
                  onClick={() => toggleDropdown(item.id)}
                />
                {showDropdown === item.id && (
                  <div className="absolute right-0 top-6 bg-gradient-to-b from-white to-gray-50 shadow-lg rounded-md p-2 flex flex-col space-y-1 z-10 w-20 sm:w-28 transition-all duration-200">
                    <button
                      className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded text-xs sm:text-sm text-left font-medium"
                      onClick={() => openModal('edit', item)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-red-600 hover:bg-red-50 px-2 py-1 rounded text-xs sm:text-sm text-left font-medium"
                      onClick={() => openModal('delete', item)}
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Folder Modal */}
      {showModal === 'addFolder' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 animate-fadeIn">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 ">
              Create New Folder
            </h3>

            <form onSubmit={handleAddFolder} className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                  Folder Name
                </label>
                <input
                  type="text"
                  value={modalData.name}
                  onChange={(e) =>
                    setModalData({ ...modalData, name: e.target.value })
                  }
                  placeholder="Enter folder name..."
                  className="flex-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                />
              </div>

              {error && (
                <p className="text-red-500 text-sm bg-red-50 p-2 rounded-md">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-md transition disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add Folder"}
                </button>
              </div>
            </form>
          </div>
        </div>



      )}

      {/* Add File Modal */}
      {showModal === 'addFile' && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg p-6 animate-fadeIn">
            {/* Header */}
            <div className="flex justify-between items-center border border-dashed border-blue-400 rounded-lg p-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Upload File</h3>
                <p className="text-sm text-gray-500">Select and upload the files of your choice</p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddFile} className="space-y-5">
              {/* File Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File Title
                </label>
                <input
                  type="text"
                  value={modalData.title}
                  onChange={(e) =>
                    setModalData({ ...modalData, title: e.target.value })
                  }
                  placeholder="Enter file title..."
                  className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>

              {/* Drag & Drop File Zone */}
              <div className="border-2 border-dashed border-blue-400 rounded-lg p-8 text-center cursor-pointer hover:bg-blue-50 transition">
                <input
                  type="file"
                  id="file-upload"
                  onChange={(e) =>
                    setModalData({ ...modalData, file: e.target.files[0] })
                  }
                  className="hidden"
                  required
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-10 h-10 text-blue-500 mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M7 16V4m0 0L3 8m4-4l4 4m6 12v-4m0 0l4 4m-4-4l-4 4" />
                  </svg>
                  <p className="text-gray-600">Upload file or drag & drop it here</p>
                  <p className="text-xs text-gray-400 mt-1">
                    JPEG, PNG, PDF, and MP4 formats, up to 50MB
                  </p>
                  <span className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
                    Browse File
                  </span>
                </label>
              </div>

              {/* Error */}
              {error && (
                <p className="text-red-500 text-sm bg-red-50 p-2 rounded-md">
                  {error}
                </p>
              )}

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-md transition disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save File"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


      {/* Edit Item Modal */}
     {showModal === 'edit' && modalData.item && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
    <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 animate-fadeIn">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        Edit {modalData.item.type === 'folder' ? 'Folder' : 'File'}
      </h3>

      <form onSubmit={handleEdit} className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
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
            placeholder={`Enter ${modalData.item.type === 'folder' ? 'folder name' : 'file title'}...`}
            className="flex-1 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            required
          />
        </div>

        {error && (
          <p className="text-red-500 text-sm bg-red-50 p-2 rounded-md">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={closeModal}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-md transition disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  </div>
)}


      {/* Delete Confirmation Modal */}
      {showModal === 'delete' && modalData.item && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
    <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6 animate-fadeIn">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Delete {modalData.item.type === 'folder' ? 'Folder' : 'File'}
      </h3>
      <p className="text-gray-600 mb-6">
        Are you sure you want to delete "
        {modalData.item.name || modalData.item.title}"? This action cannot be undone.
      </p>

      {error && (
        <p className="text-red-500 text-sm bg-red-50 p-2 rounded-md mb-4">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={closeModal}
          className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="px-5 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-md transition disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Deleting..." : "Delete"}
        </button>
      </div>
    </div>
  </div>
)}

    </main>
  );
};

export default CategoryDetailsPage;