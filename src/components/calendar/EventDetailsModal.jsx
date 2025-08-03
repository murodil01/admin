import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { X, Edit2, Calendar, Clock } from "lucide-react";
import { departments } from "../../utils/department"; // static data uchun

const EventDetailsModal = ({ isOpen, onClose, event, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);

  useEffect(() => {
    if (event) {
      setEditData({ ...event });
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

  if (!isOpen || !event) return null;

  const displayData = isEditing ? editData : event;
  if (!displayData) return null;

  return (
    <div className="fixed inset-0  bg-[#0061fe]/10 backdrop-blur-xs flex items-center justify-center z-50">
      <div className="relative bg-white rounded-lg">
        <div className="p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold w-full">
              {isEditing ? "Edit Event" : displayData.title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 absolute top-2 right-4  hover:bg-gray-100 rounded-lg transition-colors z-20"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {isEditing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  value={editData?.title || ""}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            )}

            <div>
              {isEditing && (
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image
                </label>
              )}
              <div className="border rounded-lg p-4 bg-gray-50">
                {displayData.image ? (
                  <img
                    src={
                      typeof displayData.image === "string"
                        ? displayData.image
                        : URL.createObjectURL(displayData.image)
                    }
                    alt={displayData.title}
                    className="w-full h-32 object-cover rounded"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-200 rounded flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-300 rounded mx-auto mb-2 flex items-center justify-center">
                        <svg
                          className="w-8 h-8 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-500">No image</p>
                    </div>
                  </div>
                )}
                {isEditing && (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mt-2 w-full text-sm"
                  />
                )}
              </div>
            </div>

            {/* Description */}
            {isEditing ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
                />
              </div>
            ) : displayData.description ? (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {displayData.description}
                </p>
              </div>
            ) : null}

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                ) : (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>{displayData.date.toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time
                </label>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{displayData.notification || "No notification"}</span>
                </div>
              </div>
            </div>

            {/* Department */}
            {isEditing ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {departments.map((dept) => (
                    <button
                      key={dept.id}
                      type="button"
                      onClick={() =>
                        setEditData((prev) => ({
                          ...prev,
                          department:
                            prev.department?.id === dept.id ? null : dept,
                        }))
                      }
                      className={`p-2 border rounded-lg text-xs flex items-center space-x-2 ${
                        editData?.department?.id === dept.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <span>{dept.icon}</span>
                      <span>{dept.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : displayData.department ? (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Department</h3>
                <div className="flex items-center space-x-2">
                  <span>{displayData.department.icon}</span>
                  <span className="text-sm text-gray-600">
                    {displayData.department.name}
                  </span>
                </div>
              </div>
            ) : null}

            {/* Link */}
            {(displayData.link || isEditing) && (
              <div>
                {isEditing ? (
                  <>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </>
                ) : (
                  <>
                    <h3 className="font-medium text-gray-900 mb-2">Link</h3>
                    <a
                      href={displayData.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm break-all"
                    >
                      {displayData.link}
                    </a>
                  </>
                )}
              </div>
            )}

            {/* View Mode */}
            {displayData.viewOption && displayData.viewOption !== "Choose" && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">View mode</h3>
                <span className="text-sm text-gray-600">
                  {displayData.viewOption}
                </span>
              </div>
            )}
          </div>

          {/* Footer buttons */}
          <div className="flex justify-end space-x-3 mt-6">
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleEditClick}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
