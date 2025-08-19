import React, { useEffect, useState } from "react";
import { MoreVertical, Plus } from "lucide-react";
import CreateCategoryModal from "../../components/m-library/CreateCategoryModal";
import api from "../../api/base";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Permission } from "../../components/Permissions";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../components/constants/roles";

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

  const handleCreateCategory = async (name, imageFile) => {
    if (!name.trim()) {
      toast.error("Category name cannot be empty.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("image", imageFile);

      const res = await api.post("/library/categories/", formData);
      setCategories((prev) => [res.data, ...prev]);
      setIsModalOpen(false);
      toast.success("Category created successfully!");
    } catch (error) {
      console.error("Error creating category:", error);
      toast.error("Failed to create category. Please try again.");
    }
  };

  const handleEditCategory = async (id, name, imageFile) => {
    if (!name.trim()) {
      toast.error("Category name cannot be empty.");
      return;
    }
    setLoadingEdit(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      if (imageFile) formData.append("image", imageFile);

      const res = await api.patch(`/library/categories/${id}/`, formData);
      setCategories((prev) =>
        prev.map((cat) => (cat.id === id ? res.data : cat))
      );
      setIsModalOpen(false);
      setEditCategory(null);
      toast.success("Category updated successfully!");
    } catch (error) {
      console.error("Error editing category:", error);
      toast.error("Failed to update category. Please try again.");
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
      </header>

      <CreateCategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditCategory(null);
        }}
        onSave={(data) => {
          editCategory
            ? handleEditCategory(editCategory.id, data.name, data.file)
            : handleCreateCategory(data.name, data.file);
        }}
        initialData={editCategory}
        loading={loadingEdit}
      />

      {confirmOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
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