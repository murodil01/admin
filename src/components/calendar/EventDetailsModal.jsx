import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { X, Edit2, Calendar, Clock, FileDown, ChevronDown } from "lucide-react";
import { rawDepartments } from "../../utils/department"; // static data uchun

const EventDetailsModal = ({ isOpen, onClose, event, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  useEffect(() => {
    if (event) {
      setEditData({
        ...event,
        notification: event.notification || "", // muhim!
      });
    }
  }, [event]);

  const handleEditClick = () => setIsEditing(true);

  const handleSaveEdit = () => {
    if (editData) {
      onEdit(editData);
      setIsEditing(false);
    }
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
    <div className="fixed inset-0  bg-[#0061fe]/10 backdrop-blur-xs flex items-center justify-center z-50 px-5">
      <div className="relative bg-white rounded-2xl max-w-2xl">
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
                      src="/insert-picture-icon.svg"
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
                          src="/change-image.svg"
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
                <p className="w-full text-sm leading-relaxed">
                  {displayData.description}
                </p>
              </div>
            ) : null}

            {/* File */}
            {/* <div className="mt-4">
              {isEditing ? (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    File
                  </label>
                  <div className="border rounded-lg p-4 bg-gray-50 flex items-center justify-between">
                    {displayData.file ? (
                      <div className="text-sm text-gray-800 break-all">
                        {displayData.file.name}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">No file</div>
                    )}
                    <label className="ml-4 inline-flex items-center gap-2 cursor-pointer text-sm text-blue-600 hover:underline">
                      <svg
                        className="w-5 h-5 text-blue-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8 2a1 1 0 00-1 1v4H5a1 1 0 00-.8 1.6l5 7a1 1 0 001.6 0l5-7A1 1 0 0015 7h-2V3a1 1 0 00-1-1H8z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      Change File
                    </label>
                  </div>
                </>
              ) : (
                displayData.file && (
                  <div className="">
                    <h3 className="font-medium text-gray-900 mb-2">File</h3>
                    <a
                      href={URL.createObjectURL(displayData.file)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline break-all"
                    >
                      {displayData.file.name}
                    </a>
                  </div>
                )
              )}
            </div> */}

            {/* File and Link */}
            <div className="flex max-sm:flex-wrap gap-9 max-sm:gap-4 mt-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  File
                </label>

                {isEditing ? (
                  <label className="flex items-center justify-between gap-2 max-w-60 py-2 px-3 border border-gray-300 rounded-[14px] cursor-pointer hover:bg-blue-50">
                    <span className="text-sm text-gray-800 break-all">
                      {editData?.file ? editData.file.name : "No file selected"}
                    </span>

                    <img
                      src="/folder-sync-icon.svg"
                      alt="folder-change-icon"
                      className="w-7 h-6 text-gray-500 max-sm:size-5"
                    />

                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                ) : displayData.file ? (
                  <a
                    href={URL.createObjectURL(displayData.file)}
                    download={displayData.file.name}
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
                  Department
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {rawDepartments.map((dept) => {
                    const isSelected = editData?.department?.some(
                      (d) => d.id === dept.id
                    );
                    return (
                      <button
                        key={dept.id}
                        type="button"
                        onClick={() =>
                          setEditData((prev) => {
                            const alreadySelected = prev.department?.some(
                              (d) => d.id === dept.id
                            );
                            return {
                              ...prev,
                              department: alreadySelected
                                ? prev.department.filter(
                                    (d) => d.id !== dept.id
                                  ) // toggle off
                                : [...(prev.department || []), dept], // toggle on
                            };
                          })
                        }
                        className={`p-2 border rounded-lg text-xs flex items-center space-x-2 ${
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <img
                          src={dept.avatar}
                          alt={`${dept.name} avatar`}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span>{dept.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : displayData.department?.length ? (
              <div>
                <h3 className="font-bold text-sm text-gray-700 mb-2">
                  Department
                </h3>
                <div className="flex flex-wrap gap-4 items-center w-full pt-4">
                  {displayData.department.map((dept) => (
                    <div
                      key={dept.id}
                      className="flex items-center"
                      // className="flex items-center space-x-1 border px-2 py-1 rounded text-sm text-gray-600"
                    >
                      <img
                        src={dept.avatar}
                        alt={`${dept.name} avatar`}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      {/* <span>{dept.name}</span> */}
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
                    value={editData?.date.toISOString().split("T")[0] || ""}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        date: new Date(e.target.value),
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
                      <option value="Private">Private</option>
                      <option value="Public">Public</option>
                      <option value="Department">Department</option>
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
                <button
                  onClick={handleEditClick}
                  className="px-5 py-2 max-sm:text-sm text-gray-700 border border-gray-300 rounded-[14px] hover:bg-gray-50 flex items-center space-x-2"
                >
                  <span>Edit</span>
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="px-5 py-2  max-sm:text-sm bg-blue-600 text-white rounded-[14px] hover:bg-blue-700"
                >
                  Got it
                </button>
              </>
            )}
          </div>
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
