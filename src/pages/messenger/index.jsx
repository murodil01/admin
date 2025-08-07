import { useState } from "react";
import DepartmentCards from "./departments/Departments";
import ChiefOfficers from "./chief-officers/ChiefOfficers";

const Messenger = () => {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("departments") || "list";
  });

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    localStorage.setItem("departments", tab);
  };

  return (
    <div className="flex flex-col gap-6 px-4 sm:px-6 lg:px-10 xl:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold">Messenger</h2>
        {/* Bottom Tabs */}
        <div className="flex items-center bg-[#DBDBDB] p-[2px] rounded-full w-full sm:w-[300px] md:w-[250px] xl:w-[350px] mx-auto mt-4">
          <button
            onClick={() => handleTabClick("list")}
            className={`py-2 w-1/2 text-sm sm:text-base font-bold rounded-full transition-all duration-200 ${
              activeTab === "list"
                ? "bg-[#0061fe] text-white"
                : "bg-[#DBDBDB] text-gray-800"
            }`}
          >
            Departments
          </button>
          <button
            onClick={() => handleTabClick("activity")}
            className={`py-2 w-1/2 text-sm sm:text-base font-bold rounded-full transition-all duration-200 ${
              activeTab === "activity"
                ? "bg-[#0061fe] text-white"
                : "bg-[#DBDBDB] text-gray-800"
            }`}
          >
            Chief Officers
          </button>
        </div>
        <button className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-[#0061fe] rounded-2xl shadow-md shadow-blue-200 text-white text-sm sm:text-base">
          <span className="text-lg sm:text-xl">+</span>
          <span className="capitalize">Add Chief Officers</span>
        </button>
      </div>

      {/* Dynamic Content */}
      <div className="w-full">
        {activeTab === 'list' ? <DepartmentCards /> : <ChiefOfficers />}
      </div>
    </div>
  );
};

export default Messenger;
