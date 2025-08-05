import React, { useState } from "react";

const DepartmentsSelector = ({ selectedIds, onChange }) => {
  const [departments, setDepartments] = useState([
    { id: "1", name: "Marketing", avatar: "M", isSelected: true },
    {
      id: "2",
      name: "Sales",
      avatar:
        "https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
      isSelected: false,
    },
    {
      id: "3",
      name: "Engineering",
      avatar:
        "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
      isSelected: false,
    },
    {
      id: "4",
      name: "Design",
      avatar:
        "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
      isSelected: false,
    },
    {
      id: "5",
      name: "Product",
      avatar:
        "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
      isSelected: false,
    },
    {
      id: "6",
      name: "Operations",
      avatar:
        "https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
      isSelected: false,
    },
    {
      id: "7",
      name: "HR",
      avatar:
        "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
      isSelected: false,
    },
    {
      id: "8",
      name: "Finance",
      avatar:
        "https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
      isSelected: false,
    },
    {
      id: "9",
      name: "Legal",
      avatar:
        "https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face",
      isSelected: false,
    },
    {
      id: "none",
      name: "None",
      avatar: null,
      isSelected: false,
    },
  ]);

  const toggleDepartment = (id) => {
    let updated;

    if (id === "none") {
      // Faqat None tanlansa, boshqalarni false qilamiz
      updated = departments.map((d) =>
        d.id === "none"
          ? { ...d, isSelected: !d.isSelected }
          : { ...d, isSelected: false }
      );
    } else {
      // Agar boshqasi tanlansa, None ni false qilamiz
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
  const mainDepartments = departments.filter((d) => d.id !== "none");
  const noneDepartment = departments.find((d) => d.id === "none");

  return (
    <div className="bg-white">
      <h2 className="text-gray-600 text-sm font-bold mb-4">Departments</h2>

      <div className="flex gap-6 items-start">
        <div className="grid grid-cols-3 gap-6 items-start">
          {/* 1-3: Asosiy departmentlar */}
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

        {/* 4: None ustuni */}
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
