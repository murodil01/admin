import { Funnel, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const FilterModal = ({ visible, onClose }) => {
    const [showAllDepartments, setShowAllDepartments] = useState(false);

    const allDepartments = [
        { name: "M Tech Department", icon: "💼" },
        { name: "M Sales Department", icon: "💲" },
        { name: "Marketing Department", icon: "📢" },
        { name: "M Academy Department", icon: "🎓" },
        { name: "Human Resources", icon: "🧑‍💼" },
        { name: "Customer Support", icon: "🎧" },
        { name: "Legal Department", icon: "⚖️" },
    ];

    const visibleDepartments = showAllDepartments ? allDepartments : allDepartments.slice(0, 4);

    return (
        <div className={`fixed inset-0 z-50 bg-black bg-opacity-30 ${visible ? 'flex' : 'hidden'} items-center justify-end`}>
            <div className="bg-white h-full w-[380px] max-w-full p-6 rounded-[24px] shadow-xl overflow-y-auto relative">
                {/* Modal content... */}
            </div>
        </div>
    );
};

export default FilterModal;