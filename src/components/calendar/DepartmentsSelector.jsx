import { useState, useEffect } from "react";
import { getDepartments } from "../../api/services/departmentService";

const DepartmentsSelector = ({ selectedIds, onChange, onDataLoaded }) => {
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

         // "All" opsiyasini qo'shish
         fetched.unshift({
          id: "all",
          name: "All",
          avatar: null,
          isSelected: selectedIds.includes("all"),
        });
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
          onDataLoaded(fetched.filter((d) => d.id !== "none" && d.id !== "all"));
        }
      })
      .catch((err) => {
        console.error("Failed to fetch departments:", err);
      })
      .finally(() => setLoading(false));
  }, [selectedIds]);

  const toggleDepartment = (id) => {
    let updated;

    if (id === "all") {
      const isCurrentlySelected = departments.find(d => d.id === "all")?.isSelected;
      updated = departments.map((d) => {
        if (d.id === "all") {
          return { ...d, isSelected: !isCurrentlySelected };
        } else if (d.id === "none") {
          return { ...d, isSelected: false };
        } else {
          // Agar "all" tanlanayotgan bo'lsa, barcha departmentlarni tanlash
          return { ...d, isSelected: !isCurrentlySelected };
        }
      });
    } else if (id === "none") {
      updated = departments.map((d) =>
        d.id === "none"
          ? { ...d, isSelected: !d.isSelected }
          : { ...d, isSelected: false }
      );
    } else {
      updated = departments.map((d) => {
        if (d.id === "all") return { ...d, isSelected: false };
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
    const isSelected = dept.isSelected;
    const baseClasses = "w-12 h-12 rounded-full border border-blue-300 flex items-center justify-center font-medium transition-colors duration-200";
    
    if (dept.id === "all") {
      return (
        <div className={`${baseClasses} ${isSelected ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}>
         <img src="/M.png" alt="Department all" className=""/>
        </div>
      );
    }

    if (dept.id === "none") {
      return (
        <div className={`${baseClasses} ${isSelected ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}>
          None
        </div>
      );
    }

    if (!dept.avatar) {
      return (
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-200 ${
          isSelected 
            ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' 
            : 'bg-blue-500 text-white'
        }`}>
          {dept.name?.charAt(0) || "?"}
        </div>
      );
    }

    return (
      <div className={`w-12 h-12 rounded-full transition-colors duration-200 ${
        isSelected ? 'bg-blue-100 p-1' : ''
      }`}>
        <img
          src={dept.avatar}
          alt={`${dept.name} avatar`}
          className={`w-full h-full rounded-full object-cover ${
            isSelected ? 'border-2 border-blue-300' : 'border border-gray-300'
          }`}
        />
      </div>
    );
  };

  if (loading) {
    return <p className="text-gray-500 font-bold">Loading departments...</p>;
  }

  const mainDepartments = departments.filter((d) => d.id !== "none" && d.id !== "all");
  const allDepartment = departments.find((d) => d.id === "all");
  const noneDepartment = departments.find((d) => d.id === "none");

  return (
    <div className="bg-white">
      <div className="flex flex-wrap gap-6 flex-col items-start justify-between">
      

      

        <div className="flex gap-6">
  {/* All option */}
        {allDepartment && (
          <label
            key={allDepartment.id}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <input
              type="checkbox"
              checked={allDepartment.isSelected}
              onChange={() => toggleDepartment(allDepartment.id)}
              className="w-6 h-6 accent-blue-600 hidden"
            />
            {renderAvatar(allDepartment)}
          </label>
        )}
        {/* None option */}
        {noneDepartment && (
          <label
            key={noneDepartment.id}
            className="flex items-center gap-3 cursor-pointer select-none"
          >
            <input
              type="checkbox"
              checked={noneDepartment.isSelected}
              onChange={() => toggleDepartment(noneDepartment.id)}
              className="w-6 h-6 accent-blue-600 hidden"
            />
            {renderAvatar(noneDepartment)}
          </label>
        )}
        </div>
          {/* Main departments */}
        <div className="flex flex-wrap gap-6 items-start">
          {mainDepartments.map((dept) => (
            <label
              key={dept.id}
              className="flex items-center gap-3 cursor-pointer select-none"
            >
              <input
                type="checkbox"
                checked={dept.isSelected}
                onChange={() => toggleDepartment(dept.id)}
                className="w-6 h-6 accent-blue-600 hidden"
              />
              {renderAvatar(dept)}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DepartmentsSelector;

// Xusniddin checkbox selector komponenti
// import { useState, useEffect } from "react";
// import { getDepartments } from "../../api/services/departmentService";

// const DepartmentsSelector = ({ selectedIds, onChange,onDataLoaded }) => {
//   const [departments, setDepartments] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // API dan departamentlarni olish
//   useEffect(() => {
//     getDepartments()
//       .then((data) => {
//         const fetched = data.map((d) => ({
//           id: d.id,
//           name: d.name,
//           avatar: d.photo,
//           isSelected: selectedIds.includes(d.id),
//         }));

//         // "None" opsiyasini qo‘shish
//         fetched.push({
//           id: "none",
//           name: "None",
//           avatar: null,
//           isSelected: selectedIds.includes("none"),
//         });

//         setDepartments(fetched);

//          // 📌 API'dan kelgan datani yuqoriga berish
//       if (onDataLoaded) {
//         onDataLoaded(fetched.filter(d => d.id !== "none"));
//       }
//       })
//       .catch((err) => {
//         console.error("Failed to fetch departments:", err);
//       })
//       .finally(() => setLoading(false));
//   }, [selectedIds]);

//   const toggleDepartment = (id) => {
//     let updated;

//     if (id === "none") {
//       updated = departments.map((d) =>
//         d.id === "none"
//           ? { ...d, isSelected: !d.isSelected }
//           : { ...d, isSelected: false }
//       );
//     } else {
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
//         <div className="w-6 h-6 rounded-full flex items-center justify-center font-medium text-gray-600">
//           None
//         </div>
//       );
//     }

//     if (!dept.avatar) {
//       return (
//         <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
//           {dept.name?.charAt(0) || "?"}
//         </div>
//       );
//     }

//     return (
//       <img
//         src={dept.avatar}
//         alt={`${dept.name} avatar`}
//         className="w-12 h-12 rounded-full object-cover"
//       />
//     );
//   };

//   if (loading) {
//     return <p className="text-gray-500 font-bold">Loading departments...</p>;
//   }

//   const mainDepartments = departments.filter((d) => d.id !== "none");
//   const noneDepartment = departments.find((d) => d.id === "none");

//   return (
//     <div className="bg-white">

//       <div className="flex flex-wrap gap-6 items-start">
//         <div className="grid grid-cols-5 max-md:grid-cols-4 gap-6 items-start">
//           {mainDepartments.map((dept) => (
//             <div key={dept.id} className="flex items-center gap-3">
//               <input
//                 type="checkbox"
//                 checked={dept.isSelected}
//                 onChange={() => toggleDepartment(dept.id)}
//                 className="w-6 h-6 accent-blue-600"
//               />
//               {renderAvatar(dept)}
//             </div>
//           ))}
//         </div>

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
