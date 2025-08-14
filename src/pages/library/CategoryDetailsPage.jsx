import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const CategoryDetailsPage = () => {
  const { id } = useParams();
  const [category, setCategory] = useState(null);

  useEffect(() => {
    const storedCategory = localStorage.getItem("selectedCategory");

    if (!storedCategory) return;

    const parsedCategory = JSON.parse(storedCategory);

    if (String(parsedCategory.id) === String(id)) {
      setCategory(parsedCategory);
    } else {
      console.warn("ID mos emas. Fallback ishlatish kerak bo‘lishi mumkin.");
    }
  }, [id]);

  if (!category) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">{category.name}</h2>
      
      <img
        src={category.image}
        alt={category.name}
        className="w-40 h-40 object-contain"
      />
      
      <p className="text-gray-600 text-sm mt-2">
        Created at: {category.date}
      </p>
      
      <p className="text-gray-600 text-sm mt-2">
        Departments: {category.department?.join(", ") || "None"}
      </p>
    </div>
  );
};

export default CategoryDetailsPage;
