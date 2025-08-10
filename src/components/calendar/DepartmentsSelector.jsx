import { useState, useEffect } from "react";

const DepartmentsSelector = ({
  departments = [],
  selectedIds = [],
  onChange,
}) => {
  // Ichki state faqat tanlovlarni boshqarish uchun
  const [localDepartments, setLocalDepartments] = useState([]);

  useEffect(() => {
    // departments props o'zgarganda local state ni yangilaymiz
    if (departments.length > 0) {
      const updated = departments.map((d) => ({
        ...d,
        isSelected: selectedIds.includes(d.id),
      }));

      // "none" uchun maxsus holat bo'lsa, uni ham qo'shish mumkin:
      const hasNone = updated.some((d) => d.id === "none");
      if (!hasNone) {
        updated.push({
          id: "none",
          name: "None",
          avatar: "M",
          isSelected: selectedIds.includes("none"),
        });
      }

      setLocalDepartments(updated);
    }
  }, [departments, selectedIds]);

  const toggleDepartment = (id) => {
    let updated;

    if (id === "none") {
      updated = localDepartments.map((d) =>
        d.id === "none"
          ? { ...d, isSelected: !d.isSelected }
          : { ...d, isSelected: false }
      );
    } else {
      updated = localDepartments.map((d) => {
        if (d.id === "none") return { ...d, isSelected: false };
        if (d.id === id) return { ...d, isSelected: !d.isSelected };
        return d;
      });
    }

    setLocalDepartments(updated);
    const selected = updated.filter((d) => d.isSelected).map((d) => d.id);
    onChange(selected);
  };

  const renderAvatar = (dept) => {
    if (dept.id === "none") {
      return (
        <div className="w-6 h-6 rounded-full  flex items-center justify-center font-medium text-gray-600">
          None
        </div>
      );
    }

    if (dept.avatar === "M") {
      return (
        <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
          M
        </div>
      );
    }

    return (
      <img
        src={dept.avatar}
        alt={`${dept.name} avatar`}
        className="w-6 h-6 rounded-full object-cover"
      />
    );
  };

  const mainDepartments = localDepartments.filter((d) => d.id !== "none");
  const noneDepartment = localDepartments.find((d) => d.id === "none");

  return (
    <div className="bg-white ">
      <div className="flex flex-wrap gap-6 items-start ">
        <div className="grid grid-cols-3 gap-6 items-start">
          {mainDepartments.map((dept) => (
            <div key={dept.id} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={dept.isSelected}
                onChange={() => toggleDepartment(dept.id)}
                className="w-5 h-5 accent-blue-600"
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
