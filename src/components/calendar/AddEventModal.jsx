import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { X, Paperclip, ChevronDown, FileUp } from "lucide-react";
import { getDepartments } from "../../api/services/departmentService";
import DepartmentsSelector from "./DepartmentsSelector";
import { toLocalDateInputValue, fromLocalDateInputValue } from '../../utils/dateUtils';

const AddEventModal = ({ isOpen, onClose, onSave, selectedDate }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: selectedDate || new Date(),
    image: null,
    file: null,
    departments: [], // departments array
    link: "",
    notification: "Select Time",
    viewOption: "chosen",
  });
  const [availableDepartments, setAvailableDepartments] = useState([]);
   // Fetch departments when modal opens
   useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const departments = await getDepartments();
        setAvailableDepartments(departments.map(dept => ({
          id: dept.id,
          name: dept.name,
          avatar: dept.photo || '/default-avatar.png',
          description: dept.description,
          head: dept.head
        })));
      } catch (error) {
        console.error('Failed to fetch departments:', error);
      }
    };

    if (isOpen) {
      fetchDepartments();
    }
  }, [isOpen]);

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
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        file: file,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
     // Department tanlanganligini tekshirish
  if (!formData.departments || formData.departments.length === 0) {
    alert('Kamida bitta department tanlash shart!');
    return;
  }

    onSave({
      title: formData.title,
      date: formData.date,
      description: formData.description,
      image: formData.image,
      department: formData.departments,
      file: formData.file,
      link: formData.link,
      notification: formData.notification,
      viewOption: formData.viewOption,
    });

    setFormData({
      title: "",
      description: "",
      date: selectedDate || new Date(),
      image: null,
      file: null,
      departments: [],
      link: "",
      notification: "Select Time",
      viewOption: "chosen",
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#0D1B42]/40 backdrop-blur-xs flex items-center justify-center z-50 px-5">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Add Event</h2>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-[60%_37%] gap-6 max-sm:grid-cols-1">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  placeholder="Katy's Birthday"
                  className="w-full px-3 py-2 border border-gray-300 rounded-[14px] focus:ring-2 focus:ring-blue-500  focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm  font-bold text-gray-600 mb-2">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-[14px] focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    <option value="chosen">Chosen</option>
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                  <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4 max-w-full">
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={toLocalDateInputValue(formData.date)}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        date: fromLocalDateInputValue(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-[14px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-2">
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
                      className="w-full px-3 pr-10 py-2 border border-gray-300 rounded-[14px] focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
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
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-[14px] focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Image Upload */}
              {/* <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">
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
              </div> */}
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">
                  Image
                </label>

                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />

                  <label
                    htmlFor="image-upload"
                    className="flex items-center justify-between w-full px-4 py-2 border border-gray-300 rounded-[14px] text-gray-500 cursor-pointer hover:bg-gray-50 transition"
                  >
                    <span className="w-full truncate mr-2">
                      {formData.image ? formData.image.name : "Upload image"}
                    </span>
                    <Paperclip className="w-6 h-6 text-gray-400" />
                  </label>
                </div>
              </div>

              {/* Dummy file uploader */}
              {/* <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">
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
              </div> */}
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">
                  File
                </label>

                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />

                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-between w-full px-4 py-2 border border-gray-300 rounded-[14px] text-gray-500 cursor-pointer hover:bg-gray-50 transition"
                  >
                    <span className="w-full truncate mr-2">
                      {formData.file ? formData.file.name : "Upload file"}
                    </span>
                    <FileUp className="w-6 h-6 text-gray-400" />
                  </label>
                </div>
              </div>

              {/* Link */}
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">
                  Link
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, link: e.target.value }))
                  }
                  placeholder="Enter a link"
                  className="w-full px-3 py-2 border border-gray-300 rounded-[14px] focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Department buttons */}
              <DepartmentsSelector
                 selectedIds={
                  Array.isArray(formData.departments) 
                    ? formData.departments.map(d => d.id)
                    : []
                }
                onChange={(ids) => {
                  const selectedDepartments = availableDepartments.filter((d) =>
                    ids.includes(d.id)
                  );
                  setFormData((prev) => ({
                    ...prev,
                    // department:
                    //   selectedDepartments.length === 1
                    //     ? selectedDepartments[0] // 1 ta bo‘lsa object sifatida
                    //     : selectedDepartments, // ko‘p bo‘lsa array sifatida

                    departments: selectedDepartments,

                  }));
                }}
              />
            </div>
          </div>

          {/* Submit + Cancel */}
          <div className="flex justify-end space-x-3 mt-11">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-[14px] hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-[14px] hover:bg-blue-700 transition-colors"
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