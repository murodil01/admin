import React, { useState, useEffect } from "react";
import api from "../../../api/base"; // axios instance
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ChiefOfficers = () => {
  const [manager, setManager] = useState(null);
  const [heads, setHeads] = useState([]);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get("/messenger/departments/users/");
      const users = Array.isArray(data) ? data : [];

      setManager(users.find((u) => u.role?.toLowerCase() === "manager") || null);
      setHeads(users.filter((u) => ["head", "heads"].includes(u.role?.toLowerCase())) || []);
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error("Token noto‘g‘ri yoki muddati tugagan. Qayta login qiling.");
      } else {
        toast.error("Foydalanuvchilarni yuklashda xatolik!");
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <main className="flex flex-col gap-6 sm:gap-8 px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12 max-w-7xl mx-auto py-6 sm:py-8">
      {/* Toast container */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      {/* Manager card */}
      {manager && (
        <section className="flex justify-center mb-8">
          <OfficerCard officer={manager} />
        </section>
      )}

      {/* Heads list */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8">
        {heads.length > 0 ? (
          heads.map((officer) => <OfficerCard key={officer.id} officer={officer} />)
        ) : (
          <p className="col-span-full text-center text-gray-500">
            No officers found
          </p>
        )}
      </section>
    </main>
  );
};

// Reusable Officer card
const OfficerCard = ({ officer }) => {
  return (
    <div className="flex flex-col justify-between p-4 bg-white rounded-3xl shadow-md hover:shadow-xl transition duration-300 w-full max-w-[320px] mx-auto h-full">
      <div className="flex flex-col items-center text-center">
        <img
          src={officer.profile_picture || "https://via.placeholder.com/150"}
          alt={officer.full_name || "Officer"}
          className="w-28 h-28 rounded-full object-cover mb-3 border-2 border-gray-200"
        />
        <p className="text-lg font-bold h-6 overflow-hidden">
          {officer.profession || "Unknown profession"}
        </p>
        <p className="text-sm text-gray-500 h-5 overflow-hidden">
          {officer.position || "Department Head"}
        </p>
      </div>

      <div className="mt-5">
        <p className="font-semibold truncate">{officer.full_name || "Unknown"}</p>
        <p className="text-gray-600 text-sm">
          Phone: {officer.phone_number || "Not provided"}
        </p>
      </div>

      <div className="text-sm text-gray-700 mt-3">
        {officer.description ||
          "Lorem Ipsum is simply dummy text of the printing and typesetting industry."}
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
        <span>Message</span>
      </a>
    </div>
  );
};

export default ChiefOfficers;
