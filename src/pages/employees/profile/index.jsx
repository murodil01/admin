import { useEffect, useState } from "react";
import {
  Filter,
  Upload as UploadIcon,
  ChevronDown as DropdownArrow,
  ArrowLeft,
  Calendar,
  MoreVertical,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Projects from "./projects";
import Notes from "./notes";
import Profiles from "./profile";

const Profile = () => {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("profileTab") || "Profile";
  });

  const [birthday, setBirthday] = useState("1996-05-19");
  const [showDetails, setShowDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showEditDropdown, setShowEditDropdown] = useState(false);
  const navigate = useNavigate();

  const handleSave = () => {
    console.log("Saved Birthday:", birthday);
    setIsEditing(false);
  };

  useEffect(() => {
    const savedTab = localStorage.getItem("profileTab");
    if (savedTab) setActiveTab(savedTab);
  }, []);

  useEffect(() => {
    localStorage.setItem("profileTab", activeTab);
  }, [activeTab]);

  const SidebarSections = [
    {
      title: "Main Info",
      data: [
        { label: "Department", value: "M Technologies" },
        { label: "Status", value: "Working" },
      ],
    },
    {
      title: "Contact Info",
      data: [
        { label: "Mobile Number", value: "+998 94 123 45-67" },
        { label: "Telegram username", value: "@boburallayorov" },
      ],
    },
    {
      data: [
        { label: "Email", value: "evanyates@gmail.com" },
        { label: "Join Date", value: "2025-05-01" },
        {
          label: "Birthday Date",
          input: true,
          name: "birthday",
          value: birthday,
        },
      ],
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "Profile":
        return <Profiles />;
      case "Projects":
        return <Projects />;
      case "Notes":
        return <Notes />;
      default:
        return null;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.getElementById("edit-dropdown");
      const button = document.getElementById("edit-button");
      if (
        dropdown &&
        !dropdown.contains(event.target) &&
        button &&
        !button.contains(event.target)
      ) {
        setShowEditDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen">
      <div className="py-6">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate("/employees")}
            className="flex justify-center rounded-[14px] items-center gap-2 text-[16px] font-bold text-[#1F2937] hover:text-[#6b82a8] shadow bg-white w-[133px] h-[48px]"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
        </div>

        <div className="flex flex-col xl:flex-row gap-6">
          {/* SIDEBAR */}
          <div className="w-full xl:w-[430px] bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm relative">
            {/* Edit icon */}
            <div className="absolute top-5 right-5 z-10">
              <button
                id="edit-button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowEditDropdown((prev) => !prev);
                }}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {showEditDropdown && (
                <div
                  id="edit-dropdown"
                  className="absolute top-full right-0 mt-2 z-20 bg-white border border-gray-200 rounded-md shadow-md w-28"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                      setShowEditDropdown(false);
                    }}
                    className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            {/* Profile section */}
            <div
              className="flex items-center border-b border-[#E4E6E8] pb-5 cursor-pointer"
              onClick={() =>
                window.innerWidth < 1280 && setShowDetails(!showDetails)
              }
            >
              <img
                src="https://randomuser.me/api/portraits/men/1.jpg"
                alt="Profile"
                className="w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] md:w-[120px] md:h-[120px] lg:w-[140px] lg:h-[140px] rounded-full object-cover ring-4 ring-gray-100"
              />
              <div className="ml-4 flex flex-col">
                <h3 className="md:text-[22px] text-[18px] font-bold text-[#0061fe] whitespace-nowrap">
                  Allayorov Bobujon
                </h3>
                <p className="text-[14px] md:text-[16px] lg:text-[18px] font-medium text-[#1F2937] flex items-center gap-2">
                  Backend developer
                  <span className="text-[10px] border border-[#7D8592] px-[2px] py-[2px] rounded-[4px]">
                    Middle
                  </span>
                </p>
              </div>

              {/* Dropdown icon */}
              <DropdownArrow
                className={`hidden w-5 h-5 text-gray-600 xl:hidden ml-auto transition-transform ${
                  showDetails ? "rotate-180" : ""
                }`}
              />
            </div>

            {/* Content info */}
            <div
              className={`mt-6 space-y-8 ${
                showDetails ? "block" : "hidden xl:block"
              }`}
            >
              {SidebarSections.map((section, index) => (
                <div key={index}>
                  {section.title && (
                    <h4 className="text-[#0061fe] text-[18px] font-bold mb-4">
                      {section.title}
                    </h4>
                  )}
                  <div className="space-y-7">
                    {section.data.map((item, idx) => (
                      <div key={idx}>
                        <div className="text-[14px] text-[#7D8592] font-bold mb-3">
                          {item.label}
                        </div>
                        {item.input ? (
                          isEditing ? (
                            <div className="relative">
                              <input
                                type="date"
                                name={item.name}
                                value={birthday}
                                onChange={(e) => setBirthday(e.target.value)}
                                className="w-full h-[48px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 py-2 font-normal text-[14px] text-[#7D8592] pr-10"
                              />
                              <Calendar className="absolute right-3 top-2.5 text-gray-400 w-5 h-5 pointer-events-none" />
                            </div>
                          ) : (
                            <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 py-2 text-[14px] font-normal text-[#7D8592]">
                              {item.value}
                            </div>
                          )
                        ) : (
                          <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 py-2 text-[14px] font-normal text-[#7D8592]">
                            {item.value}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {isEditing && (
                <div>
                  <button
                    onClick={handleSave}
                    className="w-full h-[48px] bg-[#0061fe] text-white py-2 rounded-xl text-center text-sm flex items-center justify-center gap-2"
                  >
                    <UploadIcon size={16} /> Save edit
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="flex-1">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 gap-4">
              <div className="flex flex-wrap sm:flex-nowrap bg-[#E3EDFA] rounded-full p-1 w-full sm:w-auto">
                {["Profile", "Projects", "Notes"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 sm:flex-none px-4 sm:px-6 md:px-8 lg:px-[56px] py-2 md:py-[9px] text-xs sm:text-sm md:text-base font-medium rounded-full transition-all duration-200 ${
                      activeTab === tab
                        ? "bg-[#0061fe] text-white shadow-sm"
                        : "text-[#0061fe] hover:bg-gray-200"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <button className="hidden sm:flex p-2 sm:p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50">
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
            </div>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
