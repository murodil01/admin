import React, { useState, useEffect } from "react";
import { Permission } from "../../components/Permissions";
import { ROLES } from "../../components/constants/roles";
import PropTypes from "prop-types";
import {
  X,
  Edit2,
  Calendar,
  Clock,
  FileDown,
  ChevronDown,
  Trash2,
} from "lucide-react";
import { getDepartments } from "../../api/services/departmentService";
import {
  toLocalDateInputValue,
  fromLocalDateInputValue,
} from "../../utils/dateUtils";
const EventDetailsModal = ({ isOpen, onClose, event, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (event) {
      setEditData({
        ...event,
        notification: event.notification || "", // muhim!
      });
    }
  }, [event]);

  // Fetch departments when modal opens for editing
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const departments = await getDepartments();
        setAvailableDepartments(
          departments.map((dept) => ({
            id: dept.id,
            name: dept.name,
            avatar: dept.photo || "/default-avatar.png",
            description: dept.description,
            head: dept.head,
          }))
        );
      } catch (error) {
        console.error("Failed to fetch departments:", error);
      }
    };

    if (isOpen && isEditing) {
      fetchDepartments();
    }
  }, [isOpen, isEditing]);

  const handleEditClick = () => setIsEditing(true);

  const handleSaveEdit = () => {
    if (editData) {
      onEdit(editData);
      setIsEditing(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete(event.id);
    setShowDeleteConfirm(false);
    onClose();
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file && editData) {
      setEditData({ ...editData, image: file });
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && editData) {
      setEditData((prev) => ({ ...prev, file }));
    }
  };

  if (!isOpen || !event) return null;

  const displayData = isEditing ? editData : event;
  if (!displayData) return null;

  return (
    <div className="fixed inset-0  bg-[#0D1B42]/40 backdrop-blur-xs flex items-center justify-center z-50 px-5">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full">
        <div className="p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold w-full">
              {isEditing ? "Edit Event" : displayData.title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 absolute top-2 right-4  bg-gray-100 rounded-lg transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {isEditing && (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  value={editData?.title || ""}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-[14px]"
                />
              </div>
            )}

            {/* Image */}
            <div className="w-full mx-auto max-w-sm max-sm:max-w-5/6">
              {isEditing && (
                <label className="block text-sm font-bold text-gray-600 mb-2">
                  Image
                </label>
              )}

              <div className="w-full items-center border border-[#D8E0F0] rounded-2xl max-sm:px-6 py-5 px-10">
                {displayData.image ? (
                  <img
                    src={
                      typeof displayData.image === "string"
                        ? displayData.image
                        : URL.createObjectURL(displayData.image)
                    }
                    alt={displayData.title}
                    className="w-full object-cover rounded-2xl"
                  />
                ) : (
                  <div className="w-28 flex items-center justify-center mx-auto">
                    <img
                      src="/insert-picture-icon.png"
                      alt="picture-placeholder"
                      className="mx-auto rounded-2xl"
                    />
                  </div>
                )}
                {isEditing && (
                  <div className="mt-2">
                    <label className="block w-full text-sm text-center py-3 max-sm:py-2 border border-gray-300 rounded-[14px] cursor-pointer hover:bg-gray-100 transition">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <div className="flex items-center justify-center gap-2 text-base max-sm:text-sm max-sm:gap-1 text-gray-700">
                        Change Image
                        <img
                          src="/change-image-icon.svg"
                          alt="change-image-logo"
                          className="w-6 h-6 max-sm:size-5 text-gray-500"
                        />
                      </div>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {isEditing ? (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-4">
                  Description
                </label>
                <textarea
                  value={editData?.description || ""}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full px-3 py-2 max-sm:text-sm  border border-gray-300 rounded-[14px] resize-none"
                />
              </div>
            ) : displayData.description ? (
              <div>
                <h3 className="font-bold text-sm text-gray-700 mb-2">
                  Description
                </h3>
                <p className="w-full text-sm leading-relaxed whitespace-pre-wrap">
                  {displayData.description}
                </p>
              </div>
            ) : null}

            {/* File and Link */}
            <div className="flex max-sm:flex-wrap gap-9 max-sm:gap-4 mt-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  File
                </label>

                {isEditing ? (
                  <label className="flex items-center justify-between gap-2 max-w-60 py-2 px-3 border border-gray-300 rounded-[14px] cursor-pointer hover:bg-blue-50">
                    <span className="text-sm text-gray-800 break-all truncate">
                      {editData?.file
                        ? typeof editData.file === "string"
                          ? "File selected"
                          : editData.file.name ||
                            editData.file.file_name ||
                            "File selected"
                        : "No file selected"}
                    </span>

                    <img
                      src="/folder-sync-icon.svg"
                      alt="folder-change-icon"
                      className="w-7 h-6 text-gray-500 max-sm:size-5"
                    />
                    {/* <ImageUpIcon
                          className="w-5 h-5 max-sm:size-5 opacity-75"
                        /> */}

                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                ) : displayData.file ? (
                  <a
                    // ✅ To'g'ri usul
                    //   href={
                    //     typeof displayData.file === "string"
                    //       ? displayData.file // API dan kelgan URL
                    //       : URL.createObjectURL(displayData.file) // Frontend File obyekti
                    //   }
                    //   download={displayData.file.title}
                    //   className="flex items-center px-4 py-3 max-sm:py-2 gap-2 w-full max-w-56 border border-gray-300 rounded-[14px] bg-white hover:bg-gray-100 hover:text-gray-900"
                    // >
                    //   <span className="truncate min-w-[150px] text-sm text-gray-800">
                    //     {displayData.file}
                    //   </span>
                    //   <FileDown className="w-5 h-5 shrink-0" />
                    // </a>

                    href={displayData.file || displayData.file.downloadUrl}
                    download={displayData.file.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-4 py-3 max-sm:py-2 gap-2 w-full max-w-56 border border-gray-300 rounded-[14px] bg-white hover:bg-gray-100 hover:text-gray-900"
                  >
                    <span className="truncate max-w-[150px] text-sm text-gray-800">
                      {displayData.file.name}
                    </span>
                    <FileDown className="w-5 h-5 shrink-0" />
                  </a>
                ) : (
                  <div className="text-gray-500">No file</div>
                )}
              </div>

              {/* Link */}
              {(displayData.link || isEditing) && (
                <div>
                  {isEditing ? (
                    <>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Link
                      </label>
                      <input
                        type="url"
                        value={editData?.link || ""}
                        onChange={(e) =>
                          setEditData((prev) => ({
                            ...prev,
                            link: e.target.value,
                          }))
                        }
                        className="inline-block w-full max-w-72 max-sm:max-w-full py-2 px-3 max-sm:text-sm border border-gray-300 rounded-[14px]"
                      />
                    </>
                  ) : (
                    <>
                      <h3 className="font-bold text-sm text-gray-700 mb-2">
                        Link
                      </h3>
                      <a
                        href={displayData.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block w-full max-w-60 text-blue-600 hover:text-blue-800 text-sm truncate"
                      >
                        {displayData.link}
                      </a>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Department */}
            {isEditing ? (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Departments
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {availableDepartments.map((dept) => {
                    const isSelected = editData?.departments?.some(
                      (d) => d.id === dept.id
                    );
                    return (
                      <button
                        key={dept.id}
                        type="button"
                        onClick={() =>
                          setEditData((prev) => {
                            const alreadySelected = prev.departments?.some(
                              (d) => d.id === dept.id
                            );
                            return {
                              ...prev,
                              departments: alreadySelected
                                ? prev.departments.filter(
                                    (d) => d.id !== dept.id
                                  ) // toggle off
                                : [...(prev.departments || []), dept], // toggle on
                            };
                          })
                        }
                        className={`p-2 border rounded-lg text-xs flex items-center space-x-2  ${
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <img
                          src={dept.avatar}
                          alt={`${dept.name} avatar`}
                          className="w-6 h-6 rounded-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                            const fallback = document.createElement("div");
                            fallback.className =
                              "w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-600";
                            fallback.textContent =
                              dept.name?.charAt(0)?.toUpperCase() || "?";
                            e.target.parentNode.insertBefore(
                              fallback,
                              e.target
                            );
                          }}
                        />
                        <span>{dept.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : displayData.departments?.length ? (
              <div>
                <h3 className="font-bold text-sm text-gray-700 mb-2">
                  Departments
                </h3>
                <div className="flex flex-wrap gap-4 items-center w-full pt-4">
                  {displayData.departments.map((dept) => (
                    <div key={dept.id} className="flex items-center">
                      <img
                        src={dept.photo}
                        alt={`${dept.name} avatar`}
                        className="w-6 h-6 rounded-full object-cover border border-blue-300"
                        onError={(e) => {
                          e.target.style.display = "none";
                          const fallback = document.createElement("div");
                          fallback.className =
                            "w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-gray-600";
                          fallback.textContent =
                            dept.name?.charAt(0)?.toUpperCase() || "?";
                          e.target.parentNode.insertBefore(fallback, e.target);
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Date and Time */}
            <div className="max-w-full flex justify-between flex-wrap gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Date
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    value={toLocalDateInputValue(editData?.date) || ""}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        date: fromLocalDateInputValue(e.target.value),
                      }))
                    }
                    className="w-full p-3 max-sm:text-sm border border-gray-300 rounded-[14px]"
                  />
                ) : (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{displayData.date.toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Notification Before */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Notification before
                </label>
                {isEditing ? (
                  <div className="relative">
                    <select
                      value={editData.notification}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          notification: e.target.value,
                        }))
                      }
                      className="w-full pr-9 p-3 max-sm:pr-8 max-sm:text-sm border border-gray-300 rounded-[14px] appearance-none"
                    >
                      <option value="">No notification</option>
                      <option value="5 minutes before">5 minutes before</option>
                      <option value="15 minutes before">
                        15 minutes before
                      </option>
                      <option value="30 minutes before">
                        30 minutes before
                      </option>
                      <option value="1 hour before">1 hour before</option>
                      <option value="1 day before">1 day before</option>
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{displayData.notification || "No notification"}</span>
                  </div>
                )}
              </div>

              {/* View Mode */}
              {isEditing ? (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    View mode
                  </label>
                  <div className="relative">
                    <select
                      value={editData.viewOption || "Choose"}
                      onChange={(e) =>
                        setEditData((prev) => ({
                          ...prev,
                          viewOption: e.target.value,
                        }))
                      }
                      className="w-full pr-9 p-3 max-sm:pr-8 max-sm:text-sm border border-gray-300 rounded-[14px] appearance-none"
                    >
                      <option value="Choose" disabled>
                        Choose
                      </option>
                      <option value="public">Public</option>
                      <option value="chosen">Chosen</option>
                      <option value="private">Private</option>
                    </select>
                    <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2">
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ) : (
                displayData.viewOption &&
                displayData.viewOption !== "Choose" && (
                  <div>
                    <h3 className="font-bold text-gray-700 mb-2">View mode</h3>
                    <span className="text-sm text-gray-600">
                      {displayData.viewOption}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex justify-end space-x-3 mt-6">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2 max-sm:text-sm text-gray-700 border border-gray-300 rounded-[14px] hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-5 py-2 max-sm:text-sm bg-blue-600 text-white rounded-[14px] hover:bg-blue-700"
                >
                  Save edit
                </button>
              </>
            ) : (
              <>
                <Permission anyOf={[ROLES.FOUNDER, ROLES.MANAGER, ROLES.HEADS]}>
                  <button
                    onClick={handleEditClick}
                    className="px-5 py-2  max-[420px]:px-3  max-[420px]:py-2 max-sm:text-sm text-gray-700 border border-gray-300 rounded-[14px] hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <span className=" max-[420px]:text-xs">Edit</span>
                    <Edit2 className="w-4 h-4" />
                  </button>
                </Permission>
                <Permission anyOf={[ROLES.FOUNDER, ROLES.MANAGER, ROLES.HEADS]}>
                  <button
                    onClick={handleDeleteClick}
                    className="px-5 py-2 max-[420px]:px-3  max-[420px]:py-2 max-sm:text-sm text-red-600 border border-red-300 rounded-[14px] hover:bg-red-50 flex items-center space-x-2"
                  >
                    <span className=" max-[420px]:text-xs">Delete</span>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </Permission>

                <button
                  onClick={onClose}
                  className="px-5 py-2  max-[420px]:px-3  max-[420px]:py-2 max-sm:text-sm bg-blue-600 text-white rounded-[14px] hover:bg-blue-700"
                >
                  <span className=" max-[420px]:text-xs">Got it</span>
                </button>
              </>
            )}
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
              <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">Delete Event</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete "{event.title}"? This action
                  cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={handleCancelDelete}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-[14px] hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-[14px] hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

EventDetailsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  event: PropTypes.object,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default EventDetailsModal;
