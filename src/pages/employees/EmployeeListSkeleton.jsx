import { memo } from 'react';

// Skeleton Loading Components
const EmployeeRowSkeleton = memo(({ isMobile = false }) => {
    if (isMobile) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg shadow p-4 lg:hidden">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                        <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-32"></div>
                            <div className="flex items-center gap-2">
                                <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                                <div className="h-5 bg-gray-200 rounded animate-pulse w-12"></div>
                            </div>
                        </div>
                    </div>
                    <div className="w-[18px] h-[18px] bg-gray-200 rounded animate-pulse"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow p-4 hidden lg:grid grid-cols-17 items-center gap-3">
            {/* Member Info - 5 columns */}
            <div className="col-span-5 flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse flex-shrink-0"></div>
                <div className="min-w-0 flex-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-36"></div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                        <div className="h-5 bg-gray-200 rounded animate-pulse w-16"></div>
                    </div>
                </div>
            </div>

            {/* Department - 3 columns */}
            <div className="col-span-3 text-center">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-20 mx-auto"></div>
            </div>

            {/* Phone - 4 columns */}
            <div className="col-span-4 text-center">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-28 mx-auto"></div>
            </div>

            {/* Projects - 2 columns */}
            <div className="col-span-2 text-center">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-6 mx-auto"></div>
            </div>

            {/* Status - 2 columns */}
            <div className="col-span-2 flex justify-center">
                <div className="h-7 bg-gray-200 rounded-lg animate-pulse w-20"></div>
            </div>

            {/* Actions - 1 column */}
            <div className="text-right">
                <div className="w-5 h-5 bg-gray-200 rounded animate-pulse mx-auto"></div>
            </div>
        </div>
    );
});
EmployeeRowSkeleton.displayName = 'EmployeeRowSkeleton';

const EmployeeListSkeleton = memo(({ count = 6 }) => {
    return (
        <div className="bg-gray-50 rounded-2xl shadow">
            <div className="overflow-x-auto p-3">
                <div className="w-full">
                    {/* Table Header */}
                    <div className="hidden lg:grid grid-cols-17 text-gray-500 text-md font-bold py-3 px-4 border-b border-b-gray-200 mb-7 pb-5">
                        <div className="col-span-5">Members</div>
                        <div className="col-span-3 text-center">Department</div>
                        <div className="col-span-4 text-center">Phone number</div>
                        <div className="col-span-2 text-center">Projects</div>
                        <div className="col-span-2 text-center">Status</div>
                        <div className="text-center">Actions</div>
                    </div>

                    {/* Skeleton Rows */}
                    <div className="space-y-3 mt-2" role="list" aria-label="Loading employees">
                        {/* Mobile skeletons */}
                        <div className="lg:hidden space-y-3">
                            {Array.from({ length: count }).map((_, index) => (
                                <EmployeeRowSkeleton key={`mobile-skeleton-${index}`} isMobile />
                            ))}
                        </div>

                        {/* Desktop skeletons */}
                        <div className="hidden lg:block space-y-3">
                            {Array.from({ length: count }).map((_, index) => (
                                <EmployeeRowSkeleton key={`desktop-skeleton-${index}`} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Loading indicator at bottom */}
            <div className="flex justify-center items-center py-8 border-t border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                    <span className="text-gray-600 text-sm">Loading employees...</span>
                </div>
            </div>
        </div>
    );
});
EmployeeListSkeleton.displayName = 'EmployeeListSkeleton';

export default EmployeeListSkeleton;