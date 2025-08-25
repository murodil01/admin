import { useState, useEffect } from "react";
import { getDepartments } from "../../api/services/departmentService";
import { Permission } from "../../components/Permissions";
import { useAuth } from "../../hooks/useAuth";
import { ROLES } from "../../components/constants/roles";

const DepartmentsSelector = ({ selectedIds, onChange, onDataLoaded }) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  // Combined loading state
  const isLoading = authLoading || loading;

  // Fetch departments from API
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await getDepartments();
        let fetched = data.map((d) => ({
          id: d.id,
          name: d.name,
          avatar: d.photo,
          isSelected: selectedIds.includes(d.id),
        }));

        // Check if user has permission to see "All" and "None" options
        const hasPermission = user && [ROLES.FOUNDER, ROLES.MANAGER].includes(user.role);
        
        if (hasPermission) {
          // Add "All" option at the beginning
          fetched.unshift({
            id: "all",
            name: "All",
            avatar: null,
            isSelected: selectedIds.includes("all"),
          });

          // Add "None" option at the end
          fetched.push({
            id: "none",
            name: "None",
            avatar: null,
            isSelected: selectedIds.includes("none"),
          });
        }

        setDepartments(fetched);

        // Notify parent component with data (excluding special options)
        if (onDataLoaded) {
          const regularDepartments = fetched.filter(
            (d) => d.id !== "none" && d.id !== "all"
          );
          onDataLoaded(regularDepartments);
        }
      } catch (err) {
        console.error("Failed to fetch departments:", err);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchDepartments();
    }
  }, [selectedIds, authLoading, user]);

  const toggleDepartment = (id) => {
    let updated;

    if (id === "all") {
      const isCurrentlySelected = departments.find((d) => d.id === "all")?.isSelected;
      updated = departments.map((d) => {
        if (d.id === "all") {
          return { ...d, isSelected: !isCurrentlySelected };
        } else if (d.id === "none") {
          return { ...d, isSelected: false };
        } else {
          // If "all" is being selected, select all departments
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
        <div
          className={`${baseClasses} ${
            isSelected ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"
          }`}
        >
          <img
            src="/M2.png"
            alt="All Departments"
            className="w-8 h-8 rounded-full object-cover"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling?.remove(); // Remove any existing fallback
              const fallbackSpan = document.createElement("span");
              fallbackSpan.className = `text-sm font-bold ${
                isSelected ? "text-white" : "text-gray-600"
              }`;
              fallbackSpan.textContent = "M";
              e.target.parentNode.appendChild(fallbackSpan);
            }}
          />
        </div>
      );
    }

    if (dept.id === "none") {
      return (
        <div
          className={`${baseClasses} ${
            isSelected
              ? "bg-red-100 text-red-700"
              : "bg-gray-100 text-gray-600"
          } text-xs`}
        >
          None
        </div>
      );
    }

    if (!dept.avatar) {
      return (
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-colors duration-200 ${
            isSelected
              ? "bg-blue-500 text-white border-2 border-blue-300"
              : "bg-gray-200 text-gray-600 border border-gray-300"
          }`}
        >
          {dept.name?.charAt(0)?.toUpperCase() || "?"}
        </div>
      );
    }

    return (
      <div
        className={`w-12 h-12 rounded-full transition-colors duration-200 ${
          isSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""
        }`}
      >
        <img
          src={dept.avatar}
          alt={`${dept.name} avatar`}
          className="w-full h-full rounded-full object-cover border border-gray-300"
        />
      </div>
    );
  };

  if (isLoading) {
    return <p className="text-gray-500 font-bold">Loading departments...</p>;
  }

  const mainDepartments = departments.filter(
    (d) => d.id !== "none" && d.id !== "all"
  );
  const allDepartment = departments.find((d) => d.id === "all");
  const noneDepartment = departments.find((d) => d.id === "none");

  return (
    <div className="bg-white">
      <div className="flex flex-wrap gap-6 flex-col items-start justify-between">
        {/* Special options (All/None) */}
        {(allDepartment || noneDepartment) && (
          <div className="flex gap-6">
            {allDepartment && (
              <label
                key={allDepartment.id}
                className="flex items-center gap-3 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={allDepartment.isSelected}
                  onChange={() => toggleDepartment(allDepartment.id)}
                  className="sr-only"
                />
                {renderAvatar(allDepartment)}
                <span className="text-sm text-gray-700"></span>
              </label>
            )}

            {noneDepartment && (
              <label
                key={noneDepartment.id}
                className="flex items-center gap-3 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={noneDepartment.isSelected}
                  onChange={() => toggleDepartment(noneDepartment.id)}
                  className="sr-only"
                />
                {renderAvatar(noneDepartment)}
                <span className="text-sm text-gray-700"></span>
              </label>
            )}
          </div>
        )}

        {/* Main departments */}
        {mainDepartments.length > 0 && (
          <div className="flex flex-wrap gap-6 items-start">
            {mainDepartments.map((dept) => (
              <label
                key={dept.id}
                className="flex flex-col items-center gap-2 cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={dept.isSelected}
                  onChange={() => toggleDepartment(dept.id)}
                  className="sr-only"
                />
                {renderAvatar(dept)}
                <span className="text-xs text-gray-600 text-center max-w-[60px] truncate">
                  {dept.name}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DepartmentsSelector;