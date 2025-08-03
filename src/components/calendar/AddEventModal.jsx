import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { X, Upload, Paperclip, ChevronDown } from "lucide-react";
import { departments } from "../../utils/department"; // faqat array kerak, types emas

const AddEventModal = ({ isOpen, onClose, onSave, selectedDate }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: selectedDate || new Date(),
    image: null,
    department: null,
    link: "",
    notification: "Select Time",
    viewOption: "Choose",
  });

  // Formni har safar selectedDate o‘zgarsa sync qilish
  useEffect(() => {
    setFormData((prev) => ({ ...prev, date: selectedDate || new Date() }));
  }, [selectedDate]);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    onSave({
      title: formData.title,
      date: formData.date,
      description: formData.description,
      image: formData.image,
      department: formData.department,
      link: formData.link,
      notification: formData.notification,
      viewOption: formData.viewOption,
    });

    setFormData({
      title: "",
      description: "",
      date: selectedDate || new Date(),
      image: null,
      department: null,
      link: "",
      notification: "Select Time",
      viewOption: "Choose",
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Add Event</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Katy's Birthday"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  View option
                </label>
                <div className="relative">
                <select
                  value={formData.viewOption}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      viewOption: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option>Choose</option>
                  <option>Public</option>
                  <option>Private</option>
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2">
                  <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={formData.date.toISOString().split("T")[0]}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      date: new Date(e.target.value),
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notification time
                </label>
                <div className="relative">
                  <select
                    value={formData.notification}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        notification: e.target.value,
                      }))
                    }
                    className="w-full px-3 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    <option>Select Time</option>
                    <option>5 minutes before</option>
                    <option>15 minutes before</option>
                    <option>30 minutes before</option>
                    <option>1 hour before</option>
                    <option>1 day before</option>
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2">
                  <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Add some description of the event"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {formData.image ? (
                    <div className="space-y-2">
                      <img
                        src={URL.createObjectURL(formData.image)}
                        alt="Preview"
                        className="w-full h-24 object-cover rounded"
                      />
                      <p className="text-sm text-gray-600">
                        {formData.image.name}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                      <p className="text-sm text-gray-600">Upload image</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="mt-2 inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm cursor-pointer hover:bg-gray-50"
                  >
                    <Paperclip className="w-4 h-4 mr-1" />
                    Choose file
                  </label>
                </div>
              </div>

              {/* Dummy file uploader */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <div className="space-y-2">
                    <Paperclip className="w-8 h-8 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-600">Upload file</p>
                    <button
                      type="button"
                      className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
                    >
                      <Paperclip className="w-4 h-4 mr-1" />
                      Choose file
                    </button>
                  </div>
                </div>
              </div>

              {/* Link */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Link
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, link: e.target.value }))
                  }
                  placeholder="Enter a link"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Department buttons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departments
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {departments.map((dept) => (
                    <button
                      key={dept.id}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          department:
                            prev.department?.id === dept.id ? null : dept,
                        }))
                      }
                      className={`p-2 border rounded-lg text-xs flex flex-col items-center space-y-1 transition-colors ${
                        formData.department?.id === dept.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <span className="text-lg">{dept.icon}</span>
                      <span className="text-center leading-tight">
                        {dept.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Submit + Cancel */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Save Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

AddEventModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  selectedDate: PropTypes.instanceOf(Date),
};

export default AddEventModal;
