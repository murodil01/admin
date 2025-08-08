import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const CategoryDetailsPage = () => {
    const { id } = useParams();
  const [category, setCategory] = useState(null);

//   useEffect(() => {
//     const savedCategory = localStorage.getItem("selectedCategory");
//     if (savedCategory) {
//       setCategory(JSON.parse(savedCategory));
//     }
//   }, []);

  useEffect(() => {
    // 1. localStorage'dan olish
    const stored = localStorage.getItem("selectedCategory");

    if (stored) {
      const parsed = JSON.parse(stored);
      // 2. ID mos bo‘lsa, state'ga o‘rnatish
      if (parsed.id === id || parsed.id.toString() === id) {
        setCategory(parsed);
      } else {
        // Agar mos kelmasa — fallback variant, masalan API chaqirish
        console.warn("ID mos emas. Fallback kerak.");
      }
    }
  }, [id]);

  

  if (!category) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">{category.name}</h2>
      <img
        src={category.image}
        alt={category.name}
        className="w-40 h-40 object-contain"
      />
      <p className="text-gray-600 text-sm mt-2">Created at: {category.date}</p>
      <p className="text-gray-600 text-sm mt-2">
        Departments: {category.department?.join(", ") || "None"}
      </p>
    </div>
  );
};

export default CategoryDetailsPage;
