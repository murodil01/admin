import React, { useState } from "react";
import { Plus } from "lucide-react";
import CategoryCard from "../../components/m-library/CategoryCard";
import CreateCategoryModal from "../../components/m-library/CreateCategoryModal";

const LibraryPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([
    {
      id: "1",
      name: "M Tech Department",
      date: "July 30, 2025",
      status: "active",
    },
    {
      id: "2",
      name: "M Tech Department",
      date: "July 30, 2025",
      status: "active",
    },
    {
      id: "3",
      name: "M Tech Department",
      date: "July 30, 2025",
      status: "active",
    },
   
  ]);

  const handleCreateCategory = (name, imageFile, departmentIds) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const newCategory = {
        id: Date.now().toString(),
        name,
        image: reader.result, // base64 string
        department: departmentIds, // YANGI QISM
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }), // Dinamik sana
        status: "active",
      };
      setCategories((prev) => [...prev, newCategory]);
      setIsModalOpen(false);
    };
    reader.readAsDataURL(imageFile);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div>
        <div className="max-w-7xl mx-auto mt-5 md:mt-2">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 space-y-3 sm:space-y-0">
            <div>
              <h1 className="text-xl sm:text-[34px] font-semibold text-black">
                M Library
              </h1>
              {/* <nav className="flex items-center gap-3 text-xs sm:text-sm text-gray-500 mt-1">
              <span className="text-black opacity-60 font-semibold text-[20px]">
              M Library
               </span>
              <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 mx-1 text-black opacity-60" />
              <span className="text-black font-semibold text-[20px]">
                Recently Viewed
              </span>
            </nav> */}
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-8 py-2 sm:py-3 bg-[#0061fe] text-white text-[17px] font-bold rounded-[14px] hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl  mx-auto px-4 sm:px-5 lg:px-[22px] pt-[18px] pb-10 bg-white  shadow-sm border-t border-gray-200">
        <h2 className="text-sm font-bold text-gray-700 pb-1">Category</h2>

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>

      {/* Modal */}
      <CreateCategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateCategory={handleCreateCategory}
      />
    </div>
  );
};

export default LibraryPage;
