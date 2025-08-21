import React, { useState, useEffect, useMemo, useCallback } from "react";
import api from "../../../api/base"; // base.js dan axios instansiyani import qilamiz

// Loading skeleton komponenti
const DepartmentSkeleton = () => (
  <div className="flex flex-col items-center p-5 bg-white shadow-md rounded-xl animate-pulse">
    <div className="w-full max-w-[300px] h-48 bg-gray-300 rounded-[10px]"></div>
    <div className="w-3/4 h-5 bg-gray-300 rounded mt-5"></div>
    <div className="w-1/2 h-4 bg-gray-200 rounded mt-2"></div>
    <div className="w-full h-16 bg-gray-200 rounded mt-3"></div>
    <div className="w-full h-10 bg-gray-300 rounded-lg mt-4"></div>
  </div>
);

// Error komponenti
const ErrorState = ({ onRetry }) => (
  <div className="col-span-full flex flex-col items-center justify-center p-8 bg-red-50 rounded-xl">
    <div className="text-red-500 text-6xl mb-4">⚠️</div>
    <h3 className="text-lg font-semibold text-red-700 mb-2">
      Ma'lumotlarni yuklashda xatolik yuz berdi
    </h3>
    <p className="text-red-600 mb-4 text-center">
      Iltimos, internetingizni tekshiring va qayta urinib ko'ring
    </p>
    <button
      onClick={onRetry}
      className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg 
                 hover:bg-red-700 transition-colors duration-200"
    >
      Qayta urinish
    </button>
  </div>
);

// Department card komponenti - React.memo bilan optimizatsiya qilindi
const DepartmentCard = React.memo(({ user }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  return (
    <main className="flex flex-col items-center p-5 bg-white shadow-md rounded-xl 
                   hover:shadow-lg transition-all duration-300 ease-in-out text-center
                   max-w-full transform hover:scale-105">
      <div className="relative w-full max-w-[300px] h-48">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-300 rounded-[10px] animate-pulse"></div>
        )}
        <img
          src={imageError ? "/placeholder-image.jpg" : user.photo}
          alt={user.name || "Department photo"}
          className={`w-full h-full object-cover bg-[#f7f5f2] rounded-[10px] transition-opacity duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy" // Lazy loading qo'shildi
        />
      </div>
      
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
          href={user.link || "https://t.me/frontend_25"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-full sm:w-auto gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3
                     bg-blue-600 text-white font-medium rounded-lg shadow-md
                     hover:bg-blue-700 hover:shadow-lg focus:ring-4 focus:ring-blue-200
                     transition-all duration-300 ease-in-out"
          aria-label={`${user.name} guruhiga o'tish`}
        >
          <span>Link to the Group</span>
          <svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>
      </div>
    </main>
  );
});

DepartmentCard.displayName = 'DepartmentCard';

const Departments = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get("/messenger/departments/");
      console.log("Users fetched successfully:", data);
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError(error.message || "Ma'lumotlarni yuklashda xatolik yuz berdi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Memoized skeleton list - performance uchun
  const skeletonList = useMemo(() => 
    Array.from({ length: 6 }, (_, index) => (
      <DepartmentSkeleton key={`skeleton-${index}`} />
    ))
  , []);

  // Memoized users list - performance uchun
  const usersList = useMemo(() => 
    users.map((user, index) => (
      <DepartmentCard 
        key={user.id || `user-${index}`} 
        user={user} 
      />
    ))
  , [users]);

  // Loading state
  if (loading) {
    return (
      <div className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {skeletonList}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4">
        <div className="grid grid-cols-1 gap-6">
          <ErrorState onRetry={fetchUsers} />
        </div>
      </div>
    );
  }

  // Empty state
  if (!users.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="text-gray-400 text-6xl mb-4">📂</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Hozircha bo'limlar mavjud emas
        </h3>
        <p className="text-gray-500 mb-4">
          Tez orada yangi bo'limlar qo'shiladi
        </p>
        <button
          onClick={fetchUsers}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg 
                     hover:bg-blue-700 transition-colors duration-200"
        >
          Yangilash
        </button>
      </div>
    );
  }

  return (
    <section className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {usersList}
    </section>
  );
};

export default Departments;