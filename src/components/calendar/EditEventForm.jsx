import React, { useState } from "react";
import PropTypes from "prop-types";
import { rawDepartments } from "../../utils/department";
import DepartmentsSelector from "./DepartmentsSelector";

const EditEventForm = ({ event, onSave, onCancel }) => {
  const [formData, setFormData] = useState({ ...event });

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

      <input type="file" onChange={handleImageChange} />

      <input type="file" onChange={handleFileChange} />

      <DepartmentsSelector
        selectedIds={
          Array.isArray(formData.department)
            ? formData.department.map((d) => d.id)
            : [formData.department?.id]
        }
        onChange={(ids) => {
          const selected = rawDepartments.filter((d) => ids.includes(d.id));
          setFormData((prev) => ({
            ...prev,
            department: selected.length === 1 ? selected[0] : selected,
          }));
        }}
      />

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
