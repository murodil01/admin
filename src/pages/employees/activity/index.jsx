// src/components/Activity.jsx
import { useEffect, useState } from "react";
import { getActivities } from "../../../api/services/activityService";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Pagination } from "antd";

const Activity = ({ onTotalActivitiesChange, currentFilters }) => {
  const [searchParams] = useSearchParams();
  const [activity, setActivity] = useState([]);
  const [totalActivities, setTotalActivities] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Get current page from URL
  const currentPage = parseInt(searchParams.get("page_num") || "1", 10);
  const itemsPerPage = 12;

  const fetchActivities = async (page = 1, filters = null) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getActivities(page, filters);
      const activities = res.results || [];

      setActivity(activities);
      setTotalActivities(res.count || 0);

      // Notify parent component about the total count
      if (onTotalActivitiesChange) {
        onTotalActivitiesChange(res.count || 0);
      }
    } catch (err) {
      console.error("Error fetching activities:", err);
      setError("Failed to load activities. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch activities whenever page changes or filters change
  useEffect(() => {
    fetchActivities(currentPage, currentFilters);
  }, [currentPage, currentFilters]);

  // Handle page change (update search params)
  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set("page_num", page);
    navigate(`?${params.toString()}`, { replace: true });
  };

  if (loading) {
    return (
      <div className="w-full py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[25px]">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="bg-gray-200 rounded-[24px] h-[300px] animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-6 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 inline-block">
          <p className="text-red-600 font-medium">{error}</p>
          <button
            onClick={() => fetchActivities(currentPage, currentFilters)}
            className="mt-2 text-red-700 hover:text-red-800 underline text-sm"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (activity.length === 0) {
    return (
      <div className="w-full py-12 text-center">
        <div className="text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V9a4 4 0 00-4-4H9a4 4 0 00-4 4v4h14z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No activities found</h3>
          <p className="text-gray-500">Try adjusting your filters to see more results.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[25px] w-full py-6">
        {activity.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-[24px] shadow-md px-[8px] pt-[10px] pb-[25px] flex flex-col gap-[10px] justify-center items-center hover:shadow-lg transition-shadow duration-200"
          >
            {/* User Info */}
            <div className="bg-[#E3EDFA] py-4 px-4 flex flex-col items-center gap-2 rounded-[24px] w-full">
              <img
                className="w-[50px] h-[50px] rounded-full object-cover border-2 border-white shadow-sm"
                src={user.profile_picture || '/default-avatar.png'}
                alt={`${user.first_name} ${user.last_name}`}
                onError={(e) => {
                  e.target.src = '/default-avatar.png';
                }}
              />
              <h1 className="font-bold text-[16px] text-[#0A1629] text-center">
                {user.first_name || 'N/A'} {user.last_name || ''}
              </h1>
              <p className="font-[400] text-[14px] text-[#0A1629] text-center">
                {user.profession || 'No Profession'}
              </p>
              <span
                className={`font-semibold text-[12px] text-[#7D8592] px-2 py-[2px] rounded-lg min-h-[20px]
                  ${user.level && user.level !== "none" ? "bg-white" : "bg-[#E3EDFA]"}`}
              >
                {user.level && user.level !== "none" ? user.level : "\u00A0"}
              </span>
            </div>

            <h3 className="font-bold text-[#0A1629]">Tasks</h3>

            {/* Task Stats */}
            <div className="w-full">
              <div className="flex items-center justify-between text-center w-full gap-2">
                <div className="rounded-2xl p-3 border-[#E3EDFA] border-2 flex-1 min-h-[80px] flex flex-col justify-center">
                  <p className="font-bold text-[26px] text-[#0A1629]">
                    {user.active_tasks || 0}
                  </p>
                  <h3 className="text-[#91929E] text-[12px] font-[400]">
                    Active
                  </h3>
                </div>
                <div className="rounded-2xl p-3 border-[#E3EDFA] border-2 flex-1 min-h-[80px] flex flex-col justify-center">
                  <p className="font-bold text-[26px] text-[#0A1629]">
                    {user.tasks_in_review || 0}
                  </p>
                  <h3 className="text-[#91929E] text-[12px] font-[400]">
                    Review
                  </h3>
                </div>
                <div className="rounded-2xl p-3 border-[#E3EDFA] border-2 flex-1 min-h-[80px] flex flex-col justify-center">
                  <p className="font-bold text-[26px] text-[#0A1629]">
                    {user.completed_tasks || 0}
                  </p>
                  <h3 className="text-[#91929E] text-[12px] font-[400]">
                    Approved
                  </h3>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalActivities > itemsPerPage && (
        <div className="flex justify-center py-6 border-t border-gray-200">
          <div className="text-center">
            <Pagination
              current={currentPage}
              total={totalActivities}
              pageSize={itemsPerPage}
              onChange={handlePageChange}
              showSizeChanger={false}
              showQuickJumper={false}
              className="custom-pagination"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Activity;