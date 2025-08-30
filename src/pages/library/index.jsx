import { useEffect, useState, useRef } from "react";
import { MoreVertical, Plus, X, Paperclip, Loader2 } from "lucide-react";
import api from "../../api/base";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Permission } from "../../components/Permissions";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../components/constants/roles";
import { ChevronDown } from "lucide-react";

const CreateCategoryModal = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  loading,
}) => {
  const [categoryName, setCategoryName] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [visibility, setVisibility] = useState("public");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (initialData) {
      setCategoryName(initialData.name || "");
      setImagePreview(initialData.image || null);
      setVisibility(initialData.view_options || "public");
      setSelectedImage(null);
    } else {
      setCategoryName("");
      setSelectedImage(null);
      setImagePreview(null);
      setVisibility("public");
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
    onSave({ name: categoryName, file: selectedImage, visibility });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0D1B42]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div className="flex justify-between p-5 border-b">
          <h2 className="text-lg font-semibold">
            {initialData ? "Edit Category" : "Create Category"}
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Category Name
            </label>
            <input
              required
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              disabled={loading}
              className="w-full px-3 border border-gray-700 py-2 rounded-lg focus:border-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              placeholder="Enter category name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Visibility</label>
            <div className="relative">
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
                disabled={loading}
                className="w-full px-2 pr-8 py-2 border border-gray-700 rounded-lg focus:border-none focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 appearance-none"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
                <option value="chosen">Chosen</option>
              </select>

              {/* Ikon */}
              <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2">
                <ChevronDown className="w-5 h-5 text-gray-500" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Category Image
            </label>
            {!imagePreview ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="w-full flex items-center justify-between px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
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
              <div className="flex justify-center">
                <button
                  type="button"
                  className="text-red-500 text-sm disabled:opacity-50"
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
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {initialData ? "Update Category" : "Add Category"}
          </button>
        </form>
      </div>
    </div>
  );
};

const CategoryCardSkeleton = () => (
  <div className="border rounded-2xl p-4 shadow-sm bg-white flex flex-col animate-pulse">
    <div className="flex items-center justify-between mb-3">
      <div className="h-5 bg-gray-200 rounded w-3/4"></div>
      <div className="w-4 h-4 bg-gray-200 rounded"></div>
    </div>
    <div className="w-full h-[120px] bg-gray-200 rounded-lg mb-3"></div>
    <div className="flex items-center justify-between text-sm">
      <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </div>
  </div>
);

const LibraryPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [menuId, setMenuId] = useState(null);
  const [loading, setLoading] = useState({
    fetch: true,
    create: false,
    edit: false,
    delete: false,
  });
  const [editCategory, setEditCategory] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const fetchCategories = async () => {
    try {
      setLoading((prev) => ({ ...prev, fetch: true }));
      const res = await api.get("/library/categories/");
      setCategories(res.data);
    } catch (error) {
      toast.error("Failed to fetch categories.");
    } finally {
      setLoading((prev) => ({ ...prev, fetch: false }));
    }
  };

  useEffect(() => {
    fetchCategories();
    const closeMenu = (e) => {
      if (!e.target.closest("[data-card-menu]")) setMenuId(null);
    };
    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, []);

  const handleCreateCategory = async (data) => {
    if (!data.name.trim()) {
      toast.error("Category name cannot be empty.");
      return;
    }
    setLoading((prev) => ({ ...prev, create: true }));
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      if (data.file) formData.append("image", data.file);
      formData.append("view_options", data.visibility);
      const res = await api.post("/library/categories/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCategories((prev) => [res.data, ...prev]);
      toast.success("Category created successfully!");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create category."
      );
    } finally {
      setLoading((prev) => ({ ...prev, create: false }));
      setIsModalOpen(false);
    }
  };

  const handleEditCategory = async (id, data) => {
    if (!data.name.trim()) {
      toast.error("Category name cannot be empty.");
      return;
    }
    setLoading((prev) => ({ ...prev, edit: true }));
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("view_options", data.visibility);
      if (data.file) formData.append("image", data.file);
      const res = await api.patch(`/library/categories/${id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? res.data : cat))
      );
      toast.success("Category updated successfully!");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update category."
      );
    } finally {
      setLoading((prev) => ({ ...prev, edit: false }));
      setIsModalOpen(false);
      setEditCategory(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading((prev) => ({ ...prev, delete: true }));
    try {
      await api.delete(`/library/categories/${deleteId}/`);
      setCategories((prev) =>
        prev.filter((category) => category.id !== deleteId)
      );
      toast.success("Category deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete category.");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
      setConfirmOpen(false);
      setDeleteId(null);
    }
  };

  if (loading.fetch || authLoading) {
    return (
      <main className="min-h-screen p-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between pb-4 space-y-2 sm:space-y-0">
            <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-10 bg-gray-200 rounded w-28 animate-pulse"></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, index) => (
              <CategoryCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-7">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 pb-3">
          <h1 className="text-xl sm:text-2xl font-semibold">M Library</h1>
          <Permission anyOf={[ROLES.FOUNDER, ROLES.MANAGER]}>
            <button
              onClick={() => setIsModalOpen(true)}
              disabled={loading.create}
              className="flex items-center justify-center w-full sm:w-auto px-5 py-2 sm:px-6 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 gap-2 text-sm sm:text-base"
            >
              {loading.create ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Add Category
            </button>
          </Permission>
        </div>
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <div className="text-5xl mb-3">📚</div>
            <h2 className="text-lg font-medium">No categories found</h2>
            <p>Create your first category to get started</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((category) => (
              <div
                key={category.id}
                onClick={() => navigate(`/category/${category.id}`)}
                className=" rounded-2xl p-4 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all bg-white flex flex-col relative"
                role="button"
                tabIndex={0}
                onKeyDown={(e) =>
                  e.key === "Enter" && navigate(`/category/${category.id}`)
                }
              >
                <div
                  className="flex items-center justify-between mb-3"
                  data-card-menu
                >
                  <h2 className="text-base font-medium truncate">
                    {category.name}
                  </h2>
                  <Permission anyOf={[ROLES.FOUNDER, ROLES.MANAGER]}>
                    <div className="relative">
                      <MoreVertical
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuId(
                            menuId === category.id ? null : category.id
                          );
                        }}
                        className="text-gray-500 hover:text-gray-700"
                      />
                      {menuId === category.id && (
                        <div className="absolute top-6 right-0 bg-white border shadow-lg rounded-lg w-32 z-10">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditCategory(category);
                              setIsModalOpen(true);
                            }}
                            className="block w-full px-3 py-2 text-left text-sm hover:bg-blue-50 text-blue-600 disabled:opacity-50"
                            disabled={loading.edit}
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteId(category.id);
                              setConfirmOpen(true);
                            }}
                            className="block w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 disabled:opacity-50"
                            disabled={loading.delete}
                          >
                            Delete
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
                    className="w-full h-[120px] object-contain rounded-lg"
                  />
                )}
                <div className="flex items-center justify-between mt-3 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    {category.created_by?.profile_picture && (
                      <img
                        src={category.created_by.profile_picture}
                        alt={`${category.created_by.name}'s profile`}
                        className="w-8 h-8 rounded-full object-cover border"
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
      </div>
      <CreateCategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditCategory(null);
        }}
        onSave={(data) =>
          editCategory
            ? handleEditCategory(editCategory.id, data)
            : handleCreateCategory(data)
        }
        initialData={editCategory}
        loading={editCategory ? loading.edit : loading.create}
      />
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-5 max-w-sm w-full">
            <h3 className="text-base font-medium mb-4">
              Confirm category deletion?
            </h3>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={loading.delete}
                className="px-3 py-2 rounded-lg border hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
                disabled={loading.delete}
              >
                {loading.delete && <Loader2 className="w-4 h-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default LibraryPage;
