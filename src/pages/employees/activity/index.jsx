// src/components/Activity.jsx
import { useEffect, useState, useCallback, useMemo, memo } from "react";
import { getActivities } from "../../../api/services/activityService";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Pagination } from "antd";

const ActivityCard = memo(({ user }) => {
  const taskStats = useMemo(() => [
    { value: user.active_tasks, label: "Active" },
    { value: user.tasks_in_review, label: "Review" },
    { value: user.completed_tasks, label: "Approved" },
  ], [user.active_tasks, user.tasks_in_review, user.completed_tasks]);

  const handleImageError = useCallback((e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = "/default-avatar.webp";
  }, []);

  return (
    <article className="bg-white rounded-[24px] shadow-md px-2 pt-3 pb-6 flex flex-col gap-3 items-center hover:shadow-lg transition-shadow">
      {/* User Info */}
      <div className="bg-[#E3EDFA] py-4 px-4 flex flex-col items-center gap-2 rounded-[24px] w-full h-43">
        <img
          className="w-[50px] h-[50px] rounded-full object-cover border-2 border-white shadow-sm"
          src={user.profile_picture || "/default-avatar.webp"}
          alt={`${user.first_name} ${user.last_name}`}
          width="50"
          height="50"
          loading="lazy"
          decoding="async"
          onError={handleImageError}
        />
        <h2 className="font-bold text-[16px] text-[#0A1629] text-center">
          {user.first_name || "N/A"} {user.last_name || ""}
        </h2>
        <p className="text-[14px] text-[#0A1629] text-center">
          {user.profession || "No Profession"}
        </p>
        {user.level && user.level !== "none" && (
          <span className="font-semibold text-[12px] text-[#7D8592] px-2 py-1 rounded-lg bg-white">
            {user.level}
          </span>
        )}
      </div>

      <h3 className="font-bold text-[#0A1629]">Tasks</h3>

      {/* Task Stats */}
      <div className="w-full flex items-center justify-between gap-2">
        {taskStats.map(({ value, label }) => (
          <div
            key={label}
            className="rounded-2xl p-3 border-[#E3EDFA] border-2 flex-1 min-h-[80px] flex flex-col justify-center text-center"
          >
            <p className="font-bold text-[26px] text-[#0A1629]">
              {value || 0}
            </p>
            <h3 className="text-[#91929E] text-[12px]">{label}</h3>
          </div>
        ))}
      </div>
    </article>
  );
});

ActivityCard.displayName = 'ActivityCard';

// Memoized SkeletonLoader component
const SkeletonLoader = memo(() => (
  <div className="w-full py-6">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="bg-gray-200 rounded-[24px] p-4 animate-pulse">
          {/* User Info Placeholder */}
          <div className="bg-[#E3EDFA] py-4 px-4 flex flex-col items-center gap-2 rounded-[24px] w-full h-43">
            <div className="w-[50px] h-[100px] bg-gray-300 rounded-full mb-4"></div>
            <div className="w-3/4 h-6 bg-gray-300 rounded mb-2"></div>
            <div className="w-1/2 h-4 bg-gray-300 rounded mb-2"></div>
            <div className="w-1/4 h-4 bg-gray-300 rounded mb-2"></div>
          </div>

          {/* Tasks Section */}
          <h3 className="w-1/2 h-4 flex justify-center items-center bg-gray-300 rounded my-2 mx-auto"></h3>

          {/* Task Stats Placeholders */}
          <div className="w-full flex items-center justify-between gap-2">
            {Array.from({ length: 3 }, (_, j) => (
              <div
                key={j}
                className="rounded-2xl p-3 border-[#E3EDFA] border-2 flex-1 min-h-[80px] flex flex-col justify-center text-center mx-auto"
              >
                <div className="w-1/2 h-6 bg-gray-300 rounded mb-2 flex justify-center mx-auto"></div>
                <div className="w-2/3 h-4 bg-gray-300 rounded mb-2 flex justify-center mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
));

SkeletonLoader.displayName = "SkeletonLoader";

// Memoized ErrorState component
const ErrorState = memo(({ error, onRetry }) => (
  <div className="w-full py-6 text-center">
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 inline-block">
      <p className="text-red-600 font-medium">{error}</p>
      <button
        onClick={onRetry}
        className="mt-2 text-red-700 hover:text-red-800 underline text-sm"
        aria-label="Try loading activities again"
      >
        Try again
      </button>
    </div>
  </div>
));

ErrorState.displayName = 'ErrorState';

// Memoized EmptyState component
const EmptyState = memo(() => (
  <div className="w-full py-12 text-center text-gray-500">
    <svg
      className="w-16 h-16 mx-auto mb-4 text-gray-300"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1}
        d="M20 13V6a2 2 0 00-2-2H6a2
          2 0 00-2 2v7m16 0v5a2 2 0
          01-2 2H6a2 2 0 01-2-2v-5m16
          0h-2M4 13h2m13-8V9a4 4 0
          00-4-4H9a4 4 0 00-4 4v4h14z"
      />
    </svg>
    <h3 className="text-lg font-medium text-gray-900 mb-2">
      No activities found
    </h3>
    <p>Try adjusting your filters to see more results.</p>
  </div>
));

EmptyState.displayName = 'EmptyState';

const Activity = ({ onTotalActivitiesChange, currentFilters }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [activity, setActivity] = useState([]);
  const [totalActivities, setTotalActivities] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoized values
  const currentPage = useMemo(
    () => parseInt(searchParams.get("page_num") || "1", 10),
    [searchParams]
  );
  const itemsPerPage = 12;

  // Stable reference for onTotalActivitiesChange
  const stableOnTotalActivitiesChange = useCallback(
    (count) => {
      if (onTotalActivitiesChange) {
        onTotalActivitiesChange(count);
      }
    },
    [onTotalActivitiesChange]
  );

  // Fetch API with proper dependency array
  const fetchActivities = useCallback(async (page = 1, filters = null) => {
    try {
      setLoading(true);
      setError(null);

      const res = await getActivities(page, filters);
      const activities = res.results || [];

      setActivity(activities);
      setTotalActivities(res.count || 0);
      stableOnTotalActivitiesChange(res.count || 0);
    } catch (err) {
      console.error("Error fetching activities:", err);
      setError("Failed to load activities. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [stableOnTotalActivitiesChange]);

  useEffect(() => {
    fetchActivities(currentPage, currentFilters);
  }, [currentPage, currentFilters, fetchActivities]);

  // Memoized retry handler
  const handleRetry = useCallback(() => {
    fetchActivities(currentPage, currentFilters);
  }, [fetchActivities, currentPage, currentFilters]);

  // Handle page change with debouncing for rapid clicks
  const handlePageChange = useCallback((page) => {
    const params = new URLSearchParams(searchParams);
    params.set("page_num", page);
    navigate(`?${params.toString()}`, { replace: true });
  }, [searchParams, navigate]);

  // Memoized pagination visibility
  const showPagination = useMemo(
    () => totalActivities > itemsPerPage,
    [totalActivities, itemsPerPage]
  );

  // Early returns for different states
  if (loading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={handleRetry} />;
  }

  if (activity.length === 0) {
    return <EmptyState />;
  }

  return (
    <section className="w-full">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-6">
        {activity.map((user) => (
          <ActivityCard key={user.id} user={user} />
        ))}
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex justify-center py-6 border-t border-gray-200">
          <Pagination
            current={currentPage}
            total={totalActivities}
            pageSize={itemsPerPage}
            onChange={handlePageChange}
            showSizeChanger={false}
            showQuickJumper={false}
          />
        </div>
      )}
    </section>
  );
};

export default Activity;