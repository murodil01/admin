import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { getDepartments } from "../../api/services/departmentService";
import DepartmentsSelector from "./DepartmentsSelector";

const EditEventForm = ({ event, onSave, onCancel }) => {
  const [formData, setFormData] = useState({ ...event });
  const [availableDepartments, setAvailableDepartments] = useState([]);

  // Fetch departments when component mounts
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

    fetchDepartments();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setFormData((prev) => ({ ...prev, image: file }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) setFormData((prev) => ({ ...prev, file }));
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        value={formData.title}
        onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
        placeholder="Event title"
      />

      <textarea
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        value={formData.description || ""}
        onChange={(e) =>
          setFormData((p) => ({ ...p, description: e.target.value }))
        }
        placeholder="Event description"
      />

      <input
        type="date"
        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        value={formData.date?.toISOString?.().split("T")[0]}
        onChange={(e) =>
          setFormData((p) => ({ ...p, date: new Date(e.target.value) }))
        }
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image
        </label>
        <input 
          type="file" 
          accept="image/*"
          onChange={handleImageChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
        {formData.image && (
          <div className="mt-2">
            <img
              src={
                typeof formData.image === "string"
                  ? formData.image
                  : URL.createObjectURL(formData.image)
              }
              alt="Preview"
              className="w-20 h-20 object-cover rounded"
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          File
        </label>
        <input 
          type="file" 
          onChange={handleFileChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
        {formData.file && (
          <div className="mt-2 text-sm text-gray-600">
            Selected: {formData.file.name}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Link
        </label>
        <input
          type="url"
          value={formData.link || ""}
          onChange={(e) => setFormData((p) => ({ ...p, link: e.target.value }))}
          placeholder="https://example.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Departments
        </label>
        <DepartmentsSelector
          selectedIds={
            Array.isArray(formData.department)
              ? formData.department.map((d) => d.id)
              : formData.department?.id ? [formData.department.id] : []
          }
          onChange={(ids) => {
            const selected = availableDepartments.filter((d) => ids.includes(d.id));
            setFormData((prev) => ({
              ...prev,
              department: selected.length === 1 ? selected[0] : selected,
              departments: selected, // also update departments array for consistency
            }));
          }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notification Time
        </label>
        <select
          value={formData.notification || ""}
          onChange={(e) => setFormData((p) => ({ ...p, notification: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">No notification</option>
          <option value="5 minutes before">5 minutes before</option>
          <option value="15 minutes before">15 minutes before</option>
          <option value="30 minutes before">30 minutes before</option>
          <option value="1 hour before">1 hour before</option>
          <option value="1 day before">1 day before</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          View Option
        </label>
        <select
          value={formData.viewOption || "public"}
          onChange={(e) => setFormData((p) => ({ ...p, viewOption: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="public">Public</option>
          <option value="chosen">Chosen</option>
          <option value="private">Private</option>
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onSave(formData)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </div>
  );
};

EditEventForm.propTypes = {
  event: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default EditEventForm;