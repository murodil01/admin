import { useEffect, useState } from "react";
import {
  Filter,
  Upload as UploadIcon,
  ChevronDown as DropdownArrow,
  ArrowLeft,
  Calendar,
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
  const navigate = useNavigate();

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
    const savedTab = localStorage.getItem("profileTab");
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("profileTab", activeTab);
  }, [activeTab]);

  const handleSave = () => {
    console.log("Saved Birthday:", birthday);
  };

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
      title: "Passport Details",
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
          <div className="w-full xl:w-[430px] bg-white border border-gray-100 rounded-[24px] p-6 shadow-sm">
            <div
              className="flex items-center gap-4 cursor-pointer xl:cursor-default border-b border-[#E4E6E8] pb-5"
              onClick={() =>
                window.innerWidth < 1280 && setShowDetails(!showDetails)
              }
            >
              <img
                src="https://randomuser.me/api/portraits/men/1.jpg"
                alt="Profile"
                className="w-[80px] sm:w-[100px] md:w-[120px] lg:w-[140px] h-[80px] sm:h-[100px] md:h-[120px] lg:h-[140px] rounded-full object-cover ring-4 ring-gray-100"
              />
              <div>
                <h3 className="text-[22px] font-bold text-[#0061fe]">
                  Allayorov Bobujon
                </h3>
                <p className="text-[12px] sm:text-[14px] md:text-[16px] lg:text-[18px] font-normal sm:font-medium md:font-semibold text-[#1F2937] flex items-center gap-2">
                  Backend developer
                  <span className="text-[10px] border border-[#7D8592] px-[2px] py-[2px] rounded-[4px]">
                    Middle
                  </span>
                </p>
              </div>
              <DropdownArrow
                className={`w-5 h-5 text-gray-600 ml-auto xl:hidden transition-transform ${
                  showDetails ? "rotate-180" : ""
                }`}
              />
            </div>

            <div
              className={`mt-6 space-y-6 ${
                showDetails ? "block" : "hidden xl:block"
              }`}
            >
              {SidebarSections.map((section) => (
                <div key={section.title}>
                  <h4 className="text-[#0061fe] text-[18px] font-bold mb-3">
                    {section.title}
                  </h4>
                  <div className="space-y-3">
                    {section.data.map((item) => (
                      <div key={item.label}>
                        <div className="text-sm text-gray-500 mb-1">
                          {item.label}
                        </div>
                        {item.input ? (
                          <div className="relative">
                            <input
                              type="date"
                              name={item.name}
                              value={birthday}
                              onChange={(e) => setBirthday(e.target.value)}
                              className="w-full bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 py-2 text-sm text-gray-800 pr-10"
                            />
                            <Calendar className="absolute right-3 top-2.5 text-gray-400 w-5 h-5 pointer-events-none" />
                          </div>
                        ) : (
                          <div className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl px-4 py-2 text-sm text-gray-800">
                            {item.value}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div>
                <button
                  onClick={handleSave}
                  className="w-full bg-[#0061fe] text-white py-2 rounded-xl text-center text-sm flex items-center justify-center gap-2"
                >
                  <UploadIcon size={16} /> Save edit
                </button>
              </div>
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
