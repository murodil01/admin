import React, { useState, useEffect, useCallback } from "react";
import api from "../../../api/base"; 

const DepartmentSkeleton = () => (
  <div className="flex flex-col items-center p-5 bg-white shadow-md rounded-xl animate-pulse">
    <div className="w-full max-w-[300px] h-48 bg-gray-300 rounded-[10px]"></div>
    <div className="w-3/4 h-5 bg-gray-300 rounded mt-5"></div>
    <div className="w-1/2 h-4 bg-gray-200 rounded mt-2"></div>
    <div className="w-full h-16 bg-gray-200 rounded mt-3"></div>
    <div className="w-full h-10 bg-gray-300 rounded-lg mt-4"></div>
  </div>
);

const ErrorState = ({ onRetry }) => (
  <div className="col-span-full flex flex-col items-center justify-center p-8 bg-red-50 rounded-xl">
    <div className="text-red-500 text-6xl mb-4">⚠️</div>
    <h3 className="text-lg font-semibold text-red-700 mb-2">
      An error occurred while loading data
    </h3>
    <p className="text-red-600 mb-4 text-center">
      Please check your internet connection and try again
    </p>
    <button
      onClick={onRetry}
      className="px-6 py-2 bg-red-600 text-white font-medium rounded-lg 
                 hover:bg-red-700 transition-colors duration-200"
    >
      Retry
    </button>
  </div>
);

const DepartmentCard = React.memo(({ user }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const imageUrl = user?.photo || "/placeholder-image.jpg";

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  if (!user) {
    return (
      <div className="flex flex-col items-center p-5 bg-white shadow-md rounded-xl">
        <div className="text-gray-400 text-4xl mb-2">❓</div>
        <p className="text-gray-500">No data found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-5 bg-white shadow-md rounded-xl hover:shadow-lg transition-all duration-300 text-center max-w-full transform hover:scale-105">
      <div className="relative w-full max-w-[300px] h-48">
        {!imageLoaded && (
          <div className="absolute inset-0 bg-gray-300 rounded-[10px] animate-pulse"></div>
        )}
        <img
          src={imageError ? "/placeholder-image.jpg" : imageUrl}
          alt={user.name || "Department photo"}
          className={`w-full h-full object-cover bg-[#f7f5f2] rounded-[10px] transition-opacity duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
        />
      </div>
      
      <h3 className="mt-5 text-base sm:text-lg font-semibold text-gray-800 break-words">
        {user.name || "Unknown department"}
      </h3>
      
      <p className="mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed line-clamp-4 sm:line-clamp-none max-w-[300px] mx-auto">
        {user.description || "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla ac erat at dui viverra dapibus."}
      </p>

      <div className="w-full flex justify-center mt-4">
        <a
          href={user.link || "#"}
          target={user.link ? "_blank" : "_self"}
          rel={user.link ? "noopener noreferrer" : ""}
          className="flex items-center justify-center w-full sm:w-auto gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg focus:ring-4 focus:ring-blue-200 transition-all duration-300"
          aria-label={`Go to ${user.name || "Department"} group`}
          onClick={!user.link ? (e) => e.preventDefault() : undefined}
        >
          <span>{user.link ? "Go to group" : "No link available"}</span>
          {user.link && (
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
          )}
        </a>
      </div>
    </div>
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
      
      const { data } = await api.get("messenger/departments/");
      
      if (Array.isArray(data)) {
        setUsers(data);
      } else if (data && Array.isArray(data.results)) {
        setUsers(data.results);
      } else {
        setUsers([]);
      }
      
    } catch (err) {
      console.error("Error loading departments:", err);
      
      let errorMessage = "An error occurred while fetching data";
      
      if (err.response) {
        if (err.response.status === 404) {
          errorMessage = "Data not found";
        } else if (err.response.status >= 500) {
          errorMessage = "Server error. Please try again later";
        } else {
          errorMessage = err.response.data?.message || "Server error";
        }
      } else if (err.request) {
        errorMessage = "Network error. Please check your connection";
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (loading) {
    return (
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <DepartmentSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return <ErrorState onRetry={fetchUsers} />;
  }

  if (!users.length) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="text-gray-400 text-6xl mb-4">📂</div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          No departments available yet
        </h3>
        <p className="text-gray-500 mb-4">New departments will be added soon</p>
        <button
          onClick={fetchUsers}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg 
                     hover:bg-blue-700 transition-colors duration-200"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {users.map((user, index) => (
        <DepartmentCard 
          key={user?.id || `department-${index}`} 
          user={user} 
        />
      ))}
    </section>
  );
};

export default Departments;
