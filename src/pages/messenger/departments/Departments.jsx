import M_Tech from '../../../assets/M tech.png';
import { Link } from 'react-router-dom';

const departments = [
    {
        id: "1",
        photo: M_Tech,
        title: "M Tech - CS",
        description: "Computer Science Department offering M.Tech programs in AI, ML and Data Science.",
        group: "#"
    },
    {
        id: "2",
        photo: M_Tech,
        title: "M Tech - ECE",
        description: "Electronics & Communication Engineering - Digital Systems and VLSI specializations.",
        group: "#"
    },
    {
        id: "3",
        photo: M_Tech,
        title: "M Tech - Civil",
        description: "Specializations in Structural Engineering and Environmental Engineering.",
        group: "#"
    },
    {
        id: "4",
        photo: M_Tech,
        title: "M Tech - Mech",
        description: "Mechanical Engineering - Thermal, CAD/CAM and Manufacturing streams.",
        group: "#"
    },
    {
        id: "5",
        photo: M_Tech,
        title: "M Tech - IT",
        description: "Information Technology Department focusing on software and network systems.",
        group: "#"
    },
    {
        id: "6",
        photo: M_Tech,
        title: "M Tech - Chemical",
        description: "Chemical Engineering with process optimization and biochemical focus.",
        group: "#"
    },
];

const Departments = () => {

    return (
        <div className="w-full bg-white p-4 md:p-6 rounded-2xl shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {departments.map((department) => (
                    <div
                        key={department.id}
                        className="max-w-[272px] w-full border border-gray-200 rounded-2xl p-6 flex flex-col justify-between h-[480px] shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex flex-col gap-4 text-center">
                            <img src={department.photo} alt="department_photo" className="w-full h-40 object-cover rounded-xl" />
                            <h4 className="font-bold text-lg">{department.title}</h4>
                            <p className="text-sm text-gray-600">{department.description}</p>
                        </div>
                        <Link
                            to={department.group}
                            className="mt-6 inline-block text-center px-6 py-3 bg-[#0061fe] rounded-2xl shadow-md shadow-blue-200 text-white font-medium"
                        >
                            Link to the group
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Departments;