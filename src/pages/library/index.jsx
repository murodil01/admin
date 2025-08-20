import React, { useEffect, useState, useRef } from "react";
import { MoreVertical, Plus, X, Paperclip } from "lucide-react";
import api from "../../api/base";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Permission } from "../../components/Permissions";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../components/constants/roles";

// Inline CreateCategoryModal component
const CreateCategoryModal = ({ isOpen, onClose, onSave, initialData }) => {
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
    <div className="fixed inset-0 bg-[#0D1B42]/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full">
        <div className="flex justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {initialData ? 'Edit Category' : 'Create New Category'}
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
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
              className="w-full px-4 py-3 border border-gray-300 rounded-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter category name"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Category Image</label>
            {!imagePreview ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-gray-500 border border-gray-300 rounded-[14px] hover:bg-gray-50"
              >
                Upload image
                <Paperclip className="w-5 h-5" />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </button>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-52 h-auto object-cover rounded-xl border"
                />
                <button
                  type="button"
                  className="text-red-500 text-sm"
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
          <div>
            <label className="block text-sm font-bold mb-2">Visibility</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
              <option value="chosen">Chosen</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={!categoryName.trim() || !imagePreview}
            className="w-full py-3 bg-blue-600 text-white rounded-[14px] hover:bg-blue-700 disabled:opacity-50"
          >
            {initialData ? 'Update Category' : 'Add Category'}
          </button>
        </form>
      </div>
    </div>
  );
};

const LibraryPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [menuId, setMenuId] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();

  const { user, loading: authLoading } = useAuth();
  const [dataLoading, setDataLoading] = useState(true);
  // Yuklash holatini birlashtirish
  const isLoading = authLoading || dataLoading;

  const handleCardClick = (id) => {
    navigate(`/category/${id}`);
  };

  const toggleMenu = (id) => {
    setMenuId((prev) => (prev === id ? null : id));
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get("/library/categories/");
      setCategories(res.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to fetch categories. Please try again.");
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

      // Show specific error message if available
      let errorMessage = "Failed to create category. Please try again.";
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          errorMessage = JSON.stringify(error.response.data);
        } else {
          errorMessage = error.response.data;
        }
      }
      toast.error(errorMessage);
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

  // Function to get visibility badge color
  // const getVisibilityBadgeColor = (visibility) => {
  //   switch (visibility?.toLowerCase()) {
  //     case 'public':
  //       return 'bg-green-100 text-green-800';
  //     case 'private':
  //       return 'bg-red-100 text-red-800';
  //     case 'chosen':
  //       return 'bg-blue-100 text-blue-800';
  //     default:
  //       return 'bg-gray-100 text-gray-800';
  //   }
  // };

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
              className="inline-flex items-center justify-center px-3 py-2 sm:px-6 sm:py-3 bg-[#0061fe] text-white text-sm sm:text-base font-bold rounded-[14px] hover:bg-blue-700 transition-colors whitespace-nowrap"
              aria-label="Add new category"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
              Add Category
            </button>
          </Permission>
        </div>
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
                          className="block w-full px-4 py-2 text-left text-sm hover:bg-blue-50 text-blue-600"
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
                          className="block w-full px-4 py-2 text-left text-sm hover:bg-red-50 text-red-600"
                        >
                          {loadingDelete ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    )}
                  </div>
                </Permission>
              </div>

              {/* Visibility badge */}
              {/* {(category.view_options || category.visibility) && (
                <div className="mb-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVisibilityBadgeColor(category.view_options || category.visibility)}`}>
                    {(category.view_options || category.visibility)?.charAt(0).toUpperCase() + (category.view_options || category.visibility)?.slice(1)}
                  </span>
                </div>
              )} */}

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
        loading={loadingEdit}
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
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
                aria-label="Cancel deletion"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600"
                disabled={loadingDelete}
                aria-label="Confirm deletion"
              >
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