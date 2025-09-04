import React, { useState, useEffect } from "react";
import api from "../../../api/base"; 
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useMemo } from "react";

const ChiefOfficers = () => {
  const [manager, setManager] = useState(null);
  const [heads, setHeads] = useState([]);

  const professionsData = useMemo(() => ({
    "GM": {
      title: "General Manager",
      description: "The Master Coordinator of Operations. Unifies all departments under one strategy, ensuring flawless execution across the company.Balances vision with discipline, transforming plans into results and systems into momentum.The bridge between high command and frontline execution."},
    "CMO": {
      title: "Chief Marketing Officer",
      description: "Guardian of Growth, and Influence. Commands marketing strategy, creative direction, and public image.Designs campaigns that dominate attention, expand market reach, and forge unshakable client loyalty.The shield and spear of M Company’s influence in every arena."
    },
    "CCO": {
      title: "Chief Creative Officer",
      description: "Architect of vision, branding and storytelling. Leads design, media, and creative direction across all channels.Crafts the imagery, campaigns, and experiences that define M Company’s identity and capture the imagination of markets.",
    },
    "CAO": {
      title: "Chief Academy Officer",
      description: "Responsible for academic programs and training initiatives.",
    },
    "CSO": {
      title: "Chief Sales Officer",
      description: "Commander of sales and client growth. Drives market expansion, secures key partnerships, and engineers revenue dominance.Leads the Sales Agents with precision, building unshakable client trust while capturing new territories for M Company’s advance.",
    },
    "CTO": {
      title: "Chief Technology Officer",
      description: "Architect of technology and innovation at M Company. Guides the long-term technological vision, ensuring every system, platform, and product is built for scale, security, and dominance.Leads product development and IT infrastructure, while pioneering the innovations that will define the company’s future edge.",
    },
    "CFO": {
      title: "Chief Financial Officer",
      description: "Keeper of Capital and Strategy. Master of financial systems, investments, and risk management.Protects wealth, secures cash flow, and builds the financial architecture that ensures M Company’s long-term dominance.",
    },
    "COO": {
      title: "Chief Operating Officer",
      description: "Ensures smooth day-to-day company operations.",
    },
    "CHRO": {
      title: "Chief HR Officer",
      description: "Leads recruitment, employee engagement, and HR strategy.",
    },
    "Falco CEO": {
      title: "Chief Executive Officer",
      description: "Leads Falco, M Company’s experimental and future-focused division.Responsible for scouting, shaping, and accelerating next-generation talent, while testing innovative models that later integrate into the core company structure.Acts as the bridge between visionary ideas and practical execution, ensuring M Company stays ahead of the curve.",
    },
  }), []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/messenger/departments/users/");
      const users = Array.isArray(data) ? data : [];

      setManager(users.find((u) => u.role?.toLowerCase() === "manager") || null);
      setHeads(users.filter((u) => ["head", "heads"].includes(u.role?.toLowerCase())) || []);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Token noto'g'ri yoki muddati tugagan. Qayta login qiling.");
      } else {
        toast.error("Foydalanuvchilarni yuklashda xatolik!");
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <main className="flex flex-col gap-6 sm:gap-8 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 max-w-7xl mx-auto">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      {manager && (
        <section className="flex justify-center mb-8">
          <OfficerCard officer={manager} professionsData={professionsData} />
        </section>
      )}

      <section className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8 mb-8">
        {heads.length > 0 ? (
          heads.map((officer) => (
            <div key={officer.id} className="flex-shrink-0">
              <OfficerCard officer={officer} professionsData={professionsData} />
            </div>
          ))
        ) : (
          <p className="w-full text-center text-gray-500">
            No officers found
          </p>
        )}
      </section>
    </main>
  );
};

const OfficerCard = ({ officer, professionsData }) => {
  const getProfessionInfo = () => {
    if (officer.profession) {
      if (professionsData[officer.profession]) {
        return professionsData[officer.profession];
      }
      
      const upperKey = officer.profession.toUpperCase();
      if (professionsData[upperKey]) {
        return professionsData[upperKey];
      }
      
      const lowerKey = officer.profession.toLowerCase();
      if (professionsData[lowerKey]) {
        return professionsData[lowerKey];
      }
    }

    return {
      title: officer.profession || "Unknown profession",
      description: "No description available for this position."
    };
  };

  const professionInfo = getProfessionInfo();
  

  return (
    <div className="flex flex-col justify-between p-4 bg-white rounded-3xl shadow-md hover:shadow-xl transition duration-300 w-full max-w-[290px] mx-auto h-full">
      <div className="flex flex-col items-center text-center">
        <img
          loading="lazy"
          src={officer.profile_picture || "https://via.placeholder.com/150"}
          alt="Officer"
          className="w-28 h-28 rounded-full object-cover mb-3 border-2 border-gray-200"
        />
        <p className="text-sm text-gray-500 h-5 overflow-hidden">
          {officer.profession ? `${officer.profession}` : "Chief Officer"}
        </p>
        
        <p className="text-lg font-bold h-6 overflow-hidden">
          {professionInfo.title}
        </p>
      </div>

      <div className="mt-5">
        <p className="font-semibold truncate">Name: {officer.full_name || "Unknown"}</p>
        <p className="text-gray-600 text-sm">
          Phone: {officer.phone_number || "Not provided"}
        </p>
      </div>

  <div className="text-sm text-gray-700 mt-3 space-y-1">
  {professionInfo.description
    .split(".")
    .filter((sentence) => sentence.trim() !== "")
    .map((sentence, index) => (
      <p key={index}>{sentence.trim()}.</p>
    ))}
</div>


      <a
        href={
          officer.tg_username
            ? `https://t.me/${officer.tg_username.replace(/^@/, "")}`
            : "#"
        }
        target="_blank"
        rel="noopener noreferrer"
        className="group flex items-center justify-center gap-2 px-5 py-2 mt-4 border border-gray-300 bg-gray-100 rounded-lg text-gray-600 font-medium hover:border-blue-300 hover:bg-white hover:text-blue-600 transition w-full"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 240 240"
          className="w-4 h-4 fill-gray-600 group-hover:fill-blue-600 transition"
        >
          <path d="M120 0C53.7 0 0 53.7 0 120s53.7 120 120 120 120-53.7 120-120S186.3 0 120 0zm57.6 79.2l-17.4 82.2c-1.3 5.9-4.8 7.4-9.7 4.6l-26.8-19.8-12.9 12.4c-1.4 1.4-2.6 2.6-5.3 2.6l1.9-27.1 49.4-44.6c2.2-1.9-.5-3-3.4-1.1l-61 38.4-26.3-8.2c-5.7-1.8-5.8-5.7 1.2-8.4l102.6-39.6c4.7-1.7 8.8 1.1 7.3 8.6z" />
        </svg>
        <span>Message {officer.profession ? `${officer.profession}` : "Chief Officer"} </span>
      </a>
    </div>
  );
};

export default ChiefOfficers;
