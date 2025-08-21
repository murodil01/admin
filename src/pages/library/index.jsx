import React, { useEffect, useState, useRef } from "react";
import { MoreVertical, Plus, X, Paperclip, Loader2 } from "lucide-react";
import api from "../../api/base";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Permission } from "../../components/Permissions";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../components/constants/roles";

const CreateCategoryModal = ({ isOpen, onClose, onSave, initialData, loading }) => {
  const [categoryName, setCategoryName] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [visibility, setVisibility] = useState('public');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setCategoryName(initialData.name || '');
      setImagePreview(initialData.image || null);
      setVisibility(initialData.view_options || initialData.visibility || 'public');
      setSelectedImage(null);
    } else {
      setCategoryName('');
      setSelectedImage(null);
      setImagePreview(null);
      setVisibility('public');
    }
  }, [initialData, isOpen]);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!categoryName.trim() || (!selectedImage && !imagePreview)) return;

    onSave({
      name: categoryName,
      file: selectedImage || null,
      visibility: visibility
    });

    handleClose();
  };

  const handleClose = () => {
    setCategoryName('');
    setSelectedImage(null);
    setImagePreview(null);
    setVisibility('public');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <main className="fixed inset-0 bg-[#0D1B42]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full">
        <div className="flex justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {initialData ? 'Edit Category' : 'Create New Category'}
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600" disabled={loading}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2">Category Name</label>
            <input
              required
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter category name"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Visibility</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="chosen">Chosen</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Category Image</label>
            {!imagePreview ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-gray-500 border border-gray-300 rounded-[14px] hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Upload image
                <Paperclip className="w-5 h-5" />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={loading}
                  className="hidden"
                />
              </button>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  className="text-red-500 cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                >
                  Remove Image
                </button>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={!categoryName.trim() || !imagePreview || loading}
            className="w-full py-3 bg-blue-600 cursor-pointer text-white rounded-[14px] hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading 
              ? (initialData ? 'Updating...' : 'Creating...') 
              : (initialData ? 'Update Category' : 'Add Category')
            }
          </button>
        </form>
      </div>
    </main>
  );
};

// Loading Skeleton Component
const CategoryCardSkeleton = () => (
  <div className="border border-gray-200 rounded-2xl p-5 shadow-sm bg-white flex flex-col animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      <div className="w-5 h-5 bg-gray-200 rounded"></div>
    </div>
    <div className="w-full h-[150px] bg-gray-200 rounded-xl mb-4"></div>
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
      </div>
      <div className="h-4 bg-gray-200 rounded w-20"></div>
    </div>
  </div>
);

const LibraryPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [menuId, setMenuId] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [loadingCreate, setLoadingCreate] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();

  const { user, loading: authLoading } = useAuth();
  const [dataLoading, setDataLoading] = useState(true);
  const isLoading = authLoading || dataLoading;

  const handleCardClick = (id) => {
    navigate(`/category/${id}`);
  };

  const toggleMenu = (id) => {
    setMenuId((prev) => (prev === id ? null : id));
  };

  const fetchCategories = async () => {
    try {
      setDataLoading(true);
      const res = await api.get("/library/categories/");
      setCategories(res.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories. Please try again.");
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    const closeOnOutside = (e) => {
      if (!e.target.closest("[data-card-menu]")) setMenuId(null);
    };
    document.addEventListener("click", closeOnOutside);
    return () => document.removeEventListener("click", closeOnOutside);
  }, []);

  const handleCreateCategory = async (data) => {
    if (!data.name.trim()) {
      toast.error("Category name cannot be empty.");
      return;
    }
    
    setLoadingCreate(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.file) {
        formData.append("image", data.file);
      }
      formData.append("view_options", data.visibility);

      console.log("Sending data:", {
        name: data.name,
        visibility: data.visibility,
        file: data.file ? data.file.name : 'No file'
      });

      const res = await api.post("/library/categories/", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      setCategories((prev) => [res.data, ...prev]);
      setIsModalOpen(false);
      toast.success("Category created successfully!");
    } catch (error) {
      console.error("Error creating category:", error);
      console.error("Error details:", error.response?.data);
      console.error("Error status:", error.response?.status);

      let errorMessage = "Failed to create category. Please try again.";
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          errorMessage = JSON.stringify(error.response.data);
        } else {
          errorMessage = error.response.data;
        }
      }
      toast.error(errorMessage);
    } finally {
      setLoadingCreate(false);
    }
  };

  const handleEditCategory = async (id, data) => {
    if (!data.name.trim()) {
      toast.error("Category name cannot be empty.");
      return;
    }
    setLoadingEdit(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("view_options", data.visibility);
      if (data.file) formData.append("image", data.file);

      const res = await api.patch(`/library/categories/${id}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? res.data : cat))
      );
      setIsModalOpen(false);
      setEditCategory(null);
      toast.success("Category updated successfully!");
    } catch (error) {
      console.error("Error editing category:", error);
      console.error("Error details:", error.response?.data);

      let errorMessage = "Failed to update category. Please try again.";
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          errorMessage = JSON.stringify(error.response.data);
        } else {
          errorMessage = error.response.data;
        }
      }
      toast.error(errorMessage);
    } finally {
      setLoadingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoadingDelete(true);
    try {
      await api.delete(`/library/categories/${deleteId}/`);
      setCategories((prev) =>
        prev.filter((category) => category.id !== deleteId)
      );
      setMenuId(null);
      toast.success("Category deleted successfully!");
    } catch (error) {
      console.error("Error deleting category:", error);
      toast.error("Failed to delete category. Please try again.");
    } finally {
      setLoadingDelete(false);
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  // Loading state for initial page load
  if (isLoading) {
    return (
      <main className="min-h-screen">
        <header className="max-w-7xl mx-auto mt-5 md:mt-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 space-y-3 sm:space-y-0">
            <div className="h-8 sm:h-10 bg-gray-200 rounded w-40 animate-pulse"></div>
            <div className="h-10 sm:h-12 bg-gray-200 rounded w-32 animate-pulse"></div>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, index) => (
              <CategoryCardSkeleton key={index} />
            ))}
          </div>
        </header>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <header className="max-w-7xl mx-auto mt-5 md:mt-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 space-y-3 sm:space-y-0">
          <h1 className="text-xl sm:text-[34px] font-semibold text-black">M Library</h1>
          <Permission anyOf={[ROLES.FOUNDER, ROLES.MANAGER]}>
            <button
              onClick={() => {
                setEditCategory(null);
                setIsModalOpen(true);
              }}
              disabled={loadingCreate}
              className="cursor-pointer inline-flex items-center justify-center px-3 py-2 sm:px-6 sm:py-3 bg-[#0061fe] text-white text-sm sm:text-base font-bold rounded-[14px] hover:bg-blue-700 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed gap-2"
              aria-label="Add new category"
            >
              {loadingCreate ? (
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
              )}
              {loadingCreate ? 'Creating...' : 'Add Category'}
            </button>
          </Permission>
        </div>
        
        {dataLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, index) => (
              <CategoryCardSkeleton key={index} />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-xl font-semibold mb-2">No categories yet</h2>
            <p className="text-center">Start by creating your first category</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => handleCardClick(category.id)}
                className="border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-200 bg-white flex flex-col relative"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && handleCardClick(category.id)}
              >
                <div className="flex items-center justify-between mb-4" data-card-menu>
                  <h2 className="text-lg font-semibold truncate">{category.name}</h2>
                  <Permission anyOf={[ROLES.FOUNDER, ROLES.MANAGER]}>
                    <div className="relative">
                      <MoreVertical
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMenu(category.id);
                        }}
                        className="cursor-pointer text-gray-500 hover:text-gray-700"
                        aria-label={`More options for ${category.name}`}
                      />
                      {menuId === category.id && (
                        <div className="absolute top-8 right-0 bg-white border border-gray-200 shadow-lg rounded-lg z-50 w-36 overflow-hidden">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditCategory(category);
                              setIsModalOpen(true);
                              setMenuId(null);
                            }}
                            className="block w-full cursor-pointer px-4 py-2 text-left text-sm hover:bg-blue-50 text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loadingEdit}
                          >
                            {loadingEdit ? "Editing..." : "Edit"}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteId(category.id);
                              setConfirmOpen(true);
                            }}
                            disabled={loadingDelete}
                            className="block w-full cursor-pointer px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {loadingDelete ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      )}
                    </div>
                  </Permission>
                </div>
                {category.image && (
                  <img
                    src={category.image}
                    alt={`${category.name} image`}
                    className="border border-blue-200 rounded-xl w-full h-[150px] object-cover"
                  />
                )}
                <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    {category.created_by?.profile_picture && (
                      <img
                        src={category.created_by?.profile_picture}
                        alt={`${category.created_by?.name}'s profile`}
                        className="w-10 h-10 rounded-full object-cover border border-gray-300"
                      />
                    )}
                  </div>
                  <p>
                    {new Date(category.created_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </header>

      <CreateCategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditCategory(null);
        }}
        onSave={(data) => {
          editCategory
            ? handleEditCategory(editCategory.id, data)
            : handleCreateCategory(data);
        }}
        initialData={editCategory}
        loading={editCategory ? loadingEdit : loadingCreate}
      />
      
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Are you sure you want to delete this category?
            </h3>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={loadingDelete}
                className="px-4 cursor-pointer py-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Cancel deletion"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg cursor-pointer bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={loadingDelete}
                aria-label="Confirm deletion"
              >
                {loadingDelete && <Loader2 className="w-4 h-4 animate-spin" />}
                {loadingDelete ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default LibraryPage;