// import { useState, useEffect } from "react";
// import { getUsers } from "../../api/services/userService";

// const UsersSelector = ({ selectedDepartmentIds, selectedUserIds, onChange }) => {
//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filteredUsers, setFilteredUsers] = useState([]);

//   // API dan userlarni olish
//   useEffect(() => {
//     getUsers()
//       .then((data) => {
//         const fetchedUsers = data.results.map((user) => ({
//           id: user.id,
//           first_name: user.first_name,
//           last_name: user.last_name,
//           department_id: user.department_id,
//           profile_picture: user.profile_picture,
//           isSelected: selectedUserIds.includes(user.id),
//         }));

//         setUsers(fetchedUsers);
//       })
//       .catch((err) => {
//         console.error("Failed to fetch users:", err);
//       })
//       .finally(() => setLoading(false));
//   }, [selectedUserIds]);

//   // Tanlangan departmentlarga mos userlarni filterlash
//   useEffect(() => {
//     if (selectedDepartmentIds.length === 0 || selectedDepartmentIds.includes("none")) {
//       setFilteredUsers([]);
//       return;
//     }

//     const filtered = users.filter((user) =>
//       selectedDepartmentIds.includes(user.department_id)
//     );
//     setFilteredUsers(filtered);
//   }, [selectedDepartmentIds, users]);

//   const toggleUser = (userId) => {
//     const updatedUsers = users.map((user) =>
//       user.id === userId ? { ...user, isSelected: !user.isSelected } : user
//     );

//     setUsers(updatedUsers);

//     const selected = updatedUsers.filter((user) => user.isSelected).map((user) => user.id);
//     onChange(selected);
//   };

//   const renderAvatar = (user) => {
//     if (user.profile_picture) {
//       return (
//         <img
//           src={user.profile_picture}
//           alt={`${user.first_name} ${user.last_name}`}
//           className="w-8 h-8 rounded-full object-cover"
//         />
//       );
//     }

//     // Profile picture bo'lmasa, harflardan avatar yasash
//     const initials = `${user.first_name?.charAt(0) || ""}${user.last_name?.charAt(0) || ""}`;
//     return (
//       <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-semibold">
//         {initials.toUpperCase()}
//       </div>
//     );
//   };

//   if (loading) {
//     return <p className="text-gray-500 font-medium">Loading users...</p>;
//   }

//   if (selectedDepartmentIds.length === 0 || selectedDepartmentIds.includes("none")) {
//     return (
//       <p className="text-gray-500 font-medium text-center py-4">
//         Please select departments first to see available users
//       </p>
//     );
//   }

//   if (filteredUsers.length === 0) {
//     return (
//       <p className="text-gray-500 font-medium text-center py-4">
//         No users found in selected departments
//       </p>
//     );
//   }

//   return (
//     <div className="bg-white">
//       <div className="space-y-3 max-h-60 overflow-y-auto">
//         {filteredUsers.map((user) => (
//           <label
//             key={user.id}
//             className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer select-none"
//           >
//             <input
//               type="checkbox"
//               checked={user.isSelected}
//               onChange={() => toggleUser(user.id)}
//               className="w-4 h-4 accent-blue-600"
//             />
//             {renderAvatar(user)}
//             <span className="text-gray-800 font-medium">
//               {user.first_name} {user.last_name}
//             </span>
//           </label>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default UsersSelector;