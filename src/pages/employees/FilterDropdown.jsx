// src/components/FilterDropdown.jsx
import { useEffect, useState, useRef } from "react";
import { HiOutlineFilter } from "react-icons/hi";
import { createPortal } from "react-dom";
import { getDepartments } from "../../api/services/departmentService";

const FilterDropdown = ({ onFilter }) => {
    const [open, setOpen] = useState(false); // desktop dropdown
    const [mobileOpen, setMobileOpen] = useState(false); // mobile bottom sheet
    const [departments, setDepartments] = useState([]);
    const [selectedDept, setSelectedDept] = useState(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const res = await getDepartments();
                // flexible handling in case service returns { data: [...] } or [...]
                const list =
                    Array.isArray(res) ? res : res?.data || res?.results || [];
                setDepartments(list);
            } catch (err) {
                console.error("Error fetching departments:", err);
            }
        };
        fetchDepartments();
    }, []);

    // Close desktop dropdown when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        document.addEventListener("touchstart", handler);
        return () => {
            document.removeEventListener("mousedown", handler);
            document.removeEventListener("touchstart", handler);
        };
    }, []);

    // Lock body scroll when mobile sheet open
    useEffect(() => {
        if (mobileOpen) {
            const prev = document.body.style.overflow;
            document.body.style.overflow = "hidden";
            return () => {
                document.body.style.overflow = prev;
            };
        }
    }, [mobileOpen]);

    const handleSelect = (deptId) => {
        setSelectedDept(deptId);
        onFilter?.(deptId);
        setOpen(false);
        setMobileOpen(false);
    };

    // MOBILE bottom sheet (render into body to avoid stacking/transform bugs)
    const MobileSheet = () =>
        createPortal(
            <div
                className="fixed inset-0 z-[9999] flex flex-col justify-end"
                aria-hidden={!mobileOpen}
            >
                {/* overlay */}
                <div
                    className="absolute inset-0 bg-black/40"
                    onClick={() => setMobileOpen(false)}
                    style={{ touchAction: "manipulation" }}
                />
                {/* sheet */}
                <div className="relative bg-white rounded-t-2xl p-4 max-h-[70vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold">Filter by Department</h3>
                        <button
                            type="button"
                            onClick={() => setMobileOpen(false)}
                            className="text-gray-600 px-2 py-1"
                        >
                            ✕
                        </button>
                    </div>

                    <ul>
                        {departments.map((dept) => (
                            <li
                                key={dept.id ?? dept.value ?? dept.name}
                                onClick={() => handleSelect(dept.id ?? dept.value)}
                                className={`px-4 py-3 border-b cursor-pointer hover:bg-gray-100 ${selectedDept === (dept.id ?? dept.value)
                                        ? "bg-blue-50 text-blue-600 font-medium"
                                        : ""
                                    }`}
                            >
                                {dept.name}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>,
            document.body
        );

    return (
        <>
            {/* DESKTOP button + dropdown */}
            <div className="relative hidden lg:block" ref={dropdownRef}>
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    className="px-4 py-3 bg-white rounded-lg shadow flex items-center gap-2 hover:bg-gray-50 cursor-pointer z-50"
                    aria-haspopup="menu"
                    aria-expanded={open}
                >
                    <HiOutlineFilter size={20} />
                </button>

                {open && (
                    <div className="absolute right-0 mt-2 w-60 bg-white shadow-lg rounded-xl border border-gray-200 z-50">
                        <ul className="max-h-64 overflow-y-auto">
                            {departments.map((dept) => (
                                <li
                                    key={dept.id ?? dept.value ?? dept.name}
                                    onClick={() => handleSelect(dept.id ?? dept.value)}
                                    className={`px-4 py-2 cursor-pointer hover:bg-gray-100 ${selectedDept === (dept.id ?? dept.value)
                                            ? "bg-blue-50 text-blue-600 font-medium"
                                            : ""
                                        }`}
                                >
                                    {dept.name}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* MOBILE floating button */}
            <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="lg:hidden fixed bottom-6 left-6 w-14 h-14 rounded-full bg-[#0061fe] text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform z-[9999]"
                aria-label="Open filter"
            >
                <HiOutlineFilter size={22} />
            </button>

            {/* render mobile sheet via portal */}
            {mobileOpen && <MobileSheet />}
        </>
    );
};

export default FilterDropdown;