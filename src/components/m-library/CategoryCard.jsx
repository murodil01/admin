import React from "react";
import PropTypes from "prop-types";
import { MoreVertical, User, Image as ImageIcon } from "lucide-react";
import { rawDepartments } from "../../utils/department";

const CategoryCard = ({ category }) => {
  // Data for the avatars in the footer
  // const avatars = [
  //   { src: "/finance-3.png", alt: "Finance" },
  //   { src: "/finance-3.png", alt: "Finance" },
  //   { src: "/finance-3.png", alt: "Finance" },
  // ];

  return (
    <div className="w-52 bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h3 className="text-base font-semibold text-gray-800">
          {category.name}
        </h3>
        <button className="flex-shrink-0 p-1 -mr-3  text-gray-500 hover:text-gray-600 transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Image Placeholder */}
      <div className="px-4 pb-0">
        {/* <div className=" bg-gray-200 rounded-lg flex items-center justify-center relative"> */}
        <div
          className={`flex justify-center border border-blue-100  ${
            category.image ? "" : "p-2"
          }`}
        >
          {/* <ImageIcon className="w-24 h-22" /> */}
          <img
            className={`${
              category.image
                ? "max-w-full h-auto object-contain"
                : "h-22 w-24 object-contain"
            }`}
            alt={category.name}
            src={category.image || "/insert-picture-icon.svg"}
          />
          {/* <div className="w-6 h-6 bg-white rounded-full absolute translate-x-2 -translate-y-2 flex items-center justify-center">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            </div> */}
          {/* </div> */}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 pt-2.5 pb-3.5">
        {/* <div className="flex items-center space-x-2"> */}
        {/* User Avatar */}
        <div className="w-5 h-5 rounded-full overflow-hidden">
          {/* <User className="w-3 h-3 text-orange-600" /> */}
          <img
            src="https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop&crop=face"
            alt="User avatar"
            className="h-full w-full object-cover"
          />
        </div>
        {/* Date */}
        <span className="font-semibold text-gray-500 text-xs">
          {category.date}
        </span>
        {/* </div> */}
        {/* <div className="flex items-center space-x-1"> */}


     {/* Avatar Group */}
<div className="flex -space-x-2">
  {category.department?.slice(0, 3).map((deptId) => {
    const dept = rawDepartments.find((d) => d.id === deptId);
    if (!dept) return null;

    return (
      <div
        key={dept.id}
        className="w-5 h-5 rounded-full border-2 border-white overflow-hidden flex items-center justify-center bg-gray-200"
      >
        {dept.avatar === "M" ? (
          <span className="text-xs text-white font-bold bg-blue-500 w-full h-full flex items-center justify-center rounded-full">
            M
          </span>
        ) : dept.avatar ? (
          <img
            src={dept.avatar}
            alt={dept.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-[10px] text-gray-600">None</span>
        )}
      </div>
    );
  })}

  {/* Extra department badge */}
  {category.department?.length > 3 && (
    <div className="w-5 h-5 rounded-full border-2 border-white bg-blue-500 text-white text-[10px] font-semibold flex items-center justify-center">
      +{category.department.length - 3}
    </div>
  )}
</div>


        {/* </div> */}
      </div>
    </div>
  );
};

CategoryCard.propTypes = {
  category: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    image: PropTypes.string,
    status: PropTypes.oneOf(["active", "inactive"]).isRequired,
  }).isRequired,
};

export default CategoryCard;

// import React from 'react';
// import PropTypes from 'prop-types';
// import { MoreVertical, User, Image as ImageIcon } from 'lucide-react';

// const CategoryCard = ({ category }) => {
//   return (
//     <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
//       {/* Header */}
//       <div className="flex items-start justify-between p-4 pb-2">
//         <h3 className="text-sm font-medium text-gray-900 leading-tight pr-2">
//           {category.name}
//         </h3>
//         <button className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors">
//           <MoreVertical className="w-4 h-4" />
//         </button>
//       </div>

//       {/* Image Placeholder */}
//       <div className="px-4 pb-4">
//         <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center relative">
//           <div className="text-gray-400">
//             <ImageIcon className="w-8 h-8" />
//             <div className="w-6 h-6 bg-white rounded-full absolute translate-x-2 -translate-y-2 flex items-center justify-center">
//               <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Footer */}
//       <div className="px-4 pb-4 flex items-center justify-between">
//         <div className="flex items-center space-x-2">
//           <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
//             <User className="w-3 h-3 text-orange-600" />
//           </div>
//           <span className="text-xs text-gray-500">{category.date}</span>
//         </div>
//         <div className="flex items-center space-x-1">
//           <div className="flex -space-x-1">
//             {[...Array(3)].map((_, index) => (
//               <div
//                 key={index}
//                 className="w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center"
//               >
//                 <span className="text-xs text-white font-bold">€</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// CategoryCard.propTypes = {
//   category: PropTypes.shape({
//     id: PropTypes.string.isRequired,
//     name: PropTypes.string.isRequired,
//     date: PropTypes.string.isRequired,
//     image: PropTypes.string,
//     status: PropTypes.oneOf(['active', 'inactive']).isRequired,
//   }).isRequired,
// };

// export default CategoryCard;
