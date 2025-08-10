import React, { useState, useEffect } from "react";
import { getDepartments } from "../../api/services/departmentService"; 

const DepartmentsSelector = ({ selectedIds, onChange,onDataLoaded }) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // API dan departamentlarni olish
  useEffect(() => {
    getDepartments()
      .then((data) => {
        const fetched = data.map((d) => ({
          id: d.id,
          name: d.name,
          avatar: d.photo,
          isSelected: selectedIds.includes(d.id),
        }));

        // "None" opsiyasini qo‘shish
        fetched.push({
          id: "none",
          name: "None",
          avatar: null,
          isSelected: selectedIds.includes("none"),
        });

        setDepartments(fetched);

         // 📌 API'dan kelgan datani yuqoriga berish
      if (onDataLoaded) {
        onDataLoaded(fetched.filter(d => d.id !== "none")); 
      }
      })
      .catch((err) => {
        console.error("Failed to fetch departments:", err);
      })
      .finally(() => setLoading(false));
  }, [selectedIds]);

  const toggleDepartment = (id) => {
    let updated;

    if (id === "none") {
      updated = departments.map((d) =>
        d.id === "none"
          ? { ...d, isSelected: !d.isSelected }
          : { ...d, isSelected: false }
      );
    } else {
      updated = departments.map((d) => {
        if (d.id === "none") return { ...d, isSelected: false };
        if (d.id === id) return { ...d, isSelected: !d.isSelected };
        return d;
      });
    }

    setDepartments(updated);
    const selected = updated.filter((d) => d.isSelected).map((d) => d.id);
    onChange(selected);
  };

  const renderAvatar = (dept) => {
    if (dept.id === "none") {
      return (
        <div className="w-6 h-6 rounded-full flex items-center justify-center font-medium text-gray-600">
          None
        </div>
      );
    }

    if (!dept.avatar) {
      return (
        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
          {dept.name?.charAt(0) || "?"}
        </div>
      );
    }

    return (
      <img
        src={dept.avatar}
        alt={`${dept.name} avatar`}
        className="w-12 h-12 rounded-full object-cover"
      />
    );
  };

  if (loading) {
    return <p className="text-gray-500">Loading departments...</p>;
  }

  const mainDepartments = departments.filter((d) => d.id !== "none");
  const noneDepartment = departments.find((d) => d.id === "none");

  return (
    <div className="bg-white">
      <h2 className="text-gray-600 text-sm font-bold mb-4">Departments</h2>

      <div className="flex flex-wrap gap-6 items-start">
        <div className="grid grid-cols-5 max-md:grid-cols-4 gap-6 items-start">
          {mainDepartments.map((dept) => (
            <div key={dept.id} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={dept.isSelected}
                onChange={() => toggleDepartment(dept.id)}
                className="w-6 h-6 accent-blue-600"
              />
              {renderAvatar(dept)}
            </div>
          ))}
        </div>

        {noneDepartment && (
          <div key={noneDepartment.id} className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={noneDepartment.isSelected}
              onChange={() => toggleDepartment(noneDepartment.id)}
              className="w-5 h-5 accent-blue-600"
            />
            {renderAvatar(noneDepartment)}
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentsSelector;





// import React, { useState } from "react";
// import { rawDepartments } from "../../utils/department";

// const DepartmentsSelector = ({ selectedIds, onChange }) => {
//   const [departments, setDepartments] = useState(
//     rawDepartments.map((d) => ({ ...d, isSelected: false }))
//   );

//   const toggleDepartment = (id) => {
//     let updated;

//     if (id === "none") {
//       // Faqat None tanlansa, boshqalarni false qilamiz
//       updated = departments.map((d) =>
//         d.id === "none"
//           ? { ...d, isSelected: !d.isSelected }
//           : { ...d, isSelected: false }
//       );
//     } else {
//       // Agar boshqasi tanlansa, None ni false qilamiz
//       updated = departments.map((d) => {
//         if (d.id === "none") return { ...d, isSelected: false };
//         if (d.id === id) return { ...d, isSelected: !d.isSelected };
//         return d;
//       });
//     }

//     setDepartments(updated);
//     const selected = updated.filter((d) => d.isSelected).map((d) => d.id);
//     onChange(selected);
//   };

//   const renderAvatar = (dept) => {
//     if (dept.id === "none") {
//       return (
//         <div className="w-6 h-6 rounded-full  flex items-center justify-center font-medium text-gray-600">
//           None
//         </div>
//       );
//     }

//     if (dept.avatar === "M") {
//       return (
//         <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
//           M
//         </div>
//       );
//     }

//     return (
//       <img
//         src={dept.avatar}
//         alt={`${dept.name} avatar`}
//         className="w-6 h-6 rounded-full object-cover"
//       />
//     );
//   };
//   const mainDepartments = departments.filter((d) => d.id !== "none");
//   const noneDepartment = departments.find((d) => d.id === "none");

//   return (
//     <div className="bg-white">
//       <h2 className="text-gray-600 text-sm font-bold mb-4">Departments</h2>

//       <div className="flex flex-wrap gap-6 items-start">
//         <div className="grid grid-cols-3 gap-6 items-start">
//           {/* 1-3: Asosiy departmentlar */}
//           {mainDepartments.map((dept) => (
//             <div key={dept.id} className="flex items-center gap-3">
//               <input
//                 type="checkbox"
//                 checked={dept.isSelected}
//                 onChange={() => toggleDepartment(dept.id)}
//                 className="w-5 h-5 accent-blue-600"
//               />
//               {renderAvatar(dept)}
//             </div>
//           ))}
//         </div>

//         {/* 4: None ustuni */}
//         {noneDepartment && (
//           <div key={noneDepartment.id} className="flex items-center gap-3">
//             <input
//               type="checkbox"
//               checked={noneDepartment.isSelected}
//               onChange={() => toggleDepartment(noneDepartment.id)}
//               className="w-5 h-5 accent-blue-600"
//             />
//             {renderAvatar(noneDepartment)}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default DepartmentsSelector;
