import { useEffect, useState } from "react";
import { getActivities } from "../../../api/services/activityService";
import { useNavigate, useSearchParams } from "react-router-dom";

const Activity = () => {
  const [searchParams] = useSearchParams();
  const [activity, setActivity] = useState([]);
  const [totalActivities, setTotalActivities] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Get current page from URL
  const currentPage = parseInt(searchParams.get('page_num') || '1', 10);

  const fetchActivities = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getActivities(page);
      setActivity(res.results || []);
      setTotalActivities(res.count || 0);
    } catch (err) {
      console.error("Error fetching activities:", err);
      setError("Failed to load activities. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Only fetch when searchParams change
  useEffect(() => {
    fetchActivities(currentPage);
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    // Only update URL - the useEffect will handle fetching
    const params = new URLSearchParams(searchParams);
    params.set('page_num', newPage);
    navigate(`?${params.toString()}`, { replace: true });
  };

  // Calculate pagination info
  const itemsPerPage = 20; // Adjust based on your API
  const totalPages = Math.ceil(totalActivities / itemsPerPage);

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[25px] w-full py-6">
        {activity.map((user) => (
          <div
            key={user.id}
            className="bg-white rounded-[24px] shadow-md px-[8px] pt-[10px] pb-[25px] flex flex-col gap-[10px] justify-center items-center"
          >
            {/* User Info */}
            <div className="bg-[#E3EDFA] py-4 px-4 flex flex-col items-center gap-2 rounded-[24px] w-full">
              <img
                className="w-[50px] h-[50px] rounded-full object-cover"
                src={user.profile_picture}
                alt={user.first_name}
              />
              <h1 className="font-bold text-[16px] text-[#0A1629]">
                {user.first_name} {user.last_name}
              </h1>
              <p className="font-[400] text-[14px] text-[#0A1629]">
                {user.profession}
              </p>
              <span
                className={`font-semibold text-[12px] text-[#7D8592] px-2 py-[2px] rounded-lg
    ${user.level === "none" ? "bg-[#E3EDFA]" : "bg-white"}`}
              >
                {user.level === "none" ? "\u00A0" : user.level}
              </span>
            </div>

            <h3 className="font-bold">Tasks</h3>

            {/* Task Stats */}
            <div className="w-full">
              <div className="flex items-center justify-between text-center w-full">
                <div className="rounded-2xl p-3 border-[#E3EDFA] border-2 w-[80px] h-[80px]">
                  <p className="font-bold text-[26px] text-[#0A1629]">
                    {user.active_tasks}
                  </p>
                  <h3 className="text-[#91929E] text-[12px] font-[400]">
                    Active
                  </h3>
                </div>
                <div className="rounded-2xl p-3 border-[#E3EDFA] border-2 w-[80px] h-[80px]">
                  <p className="font-bold text-[26px] text-[#0A1629]">
                    {user.tasks_in_review}
                  </p>
                  <h3 className="text-[#91929E] text-[12px] font-[400]">
                    Review
                  </h3>
                </div>
                <div className="rounded-2xl p-3 border-[#E3EDFA] border-2 w-[80px] h-[80px]">
                  <p className="font-bold text-[26px] text-[#0A1629]">
                    {user.completed_tasks}
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

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <span className="px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Activity;