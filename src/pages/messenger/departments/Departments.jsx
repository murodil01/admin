import axios from "axios";
import React, { useState, useEffect } from "react";

const Departments = () => {
  const [users, setUsers] = useState([]);

 const fetchUsers = async (e) => {
  e?.preventDefault();
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get(
      "https://prototype-production-2b67.up.railway.app/messenger/departments/",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("Users fetched successfully:", response.data);
    setUsers(response?.data || []);
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};


  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <section className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {users.map((user, index) => (
        <div
          key={user.id || index}
          className="flex flex-col items-center p-5 bg-white shadow-md rounded-xl 
                 hover:shadow-lg transition-all duration-300 ease-in-out text-center
                 max-w-full"
        >
          <img
            src={user.photo}
            alt={user.name || "Department photo"}
            className="w-full max-w-[300px] h-auto object-cover bg-[#f7f5f2] rounded-[10px]"
          />
          <h3 className="mt-5 text-base sm:text-lg font-semibold text-gray-800 break-words">
            {user.name}
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 break-words mt-1">
            {user.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit."}
          </p>
          <p className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-4 sm:line-clamp-none max-w-[300px] mx-auto">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry.
            Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.
          </p>
          <div className="w-full flex justify-center mt-4">
            <a
              href="https://t.me/frontend_25"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full sm:w-auto gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3
                     bg-blue-600 text-white font-medium rounded-lg shadow-md
                     hover:bg-blue-700 hover:shadow-lg
                     transition-all duration-300 ease-in-out"
            >
              Link to the Group
            </a>
          </div>
        </div>
      ))}
    </section>
  );
};

export default Departments;
