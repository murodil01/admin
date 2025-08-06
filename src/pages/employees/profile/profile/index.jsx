import { Upload, Button, Dropdown, Menu } from "antd";
import { Download, MoreVertical } from "lucide-react";
import { useState } from "react";

const Profiles = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleMenuClick = ({ key }) => {
    if (key === "edit") {
      handleEdit();
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    console.log("Saved data:", formData);
  };

  const menuItems = [
    {
      key: "edit",
      label: "Edit",
    },
  ];

  return (
    <div className="w-full bg-white shadow rounded-[24px] py-10 px-6 md:px-10 mt-9 relative">
      {/* Dropdown - yuqori o‘ng burchakda */}
      <div className="absolute top-6 right-6">
        <Dropdown
          menu={{ items: menuItems, onClick: handleMenuClick }}
          placement="bottomRight"
          trigger={["click"]}
        >
          <Button
            icon={<MoreVertical />}
            type="text"
            style={{
              border: "none",
              boxShadow: "none",
            }}
          />
        </Dropdown>
      </div>

      <h1 className="font-bold text-[18px] text-[#0061fe] mb-6">
        Control Data
      </h1>

      <div className="flex flex-col gap-6">
        {/* Form rows */}
        {[
          ["Acceptance Reason", "Expertise Level"],
          ["Strengths", "Weaknesses"],
          ["Biography Summary info", "Trial Period"],
          ["Work Hours", "Contract Type"],
          ["Assigned Device(s)/Tools", "Access Level"],
        ].map((row, idx) => (
          <div
            key={idx}
            className="flex flex-col md:flex-row gap-6 justify-between"
          >
            {row.map((label) => (
              <div key={label} className="flex flex-col w-full">
                <label className="text-[#7D8592] font-bold text-sm mb-1">
                  {label}:
                </label>
                <textarea
                  disabled={!isEditing}
                  value={formData[label] || ""}
                  onChange={(e) => handleChange(label, e.target.value)}
                  className="w-full h-[94px] rounded-[14px] border border-[#D8E0F0] px-4 pt-4 text-sm text-gray-800 resize-none placeholder:text-start placeholder:text-gray-400 focus:outline-none"
                  placeholder="(Skills, Loyalty, Opportunity, fit, etc.)"
                />
              </div>
            ))}
          </div>
        ))}

        {/* Passport section */}
        <div>
          <h1 className="font-bold text-[18px] text-[#0061fe] mb-6">
            Passport Detail
          </h1>

          <div className="flex flex-col md:flex-row gap-6 mb-4">
            <div className="flex flex-col gap-2 w-full">
              <label className="text-sm text-[#7D8592] font-bold">
                Serial Number
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData["Serial Number"] || ""}
                onChange={(e) => handleChange("Serial Number", e.target.value)}
                placeholder="AD1114567"
                className="px-4 border border-[#D8E0F0] h-[48px] rounded-[14px] w-full focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-2 w-full">
              <label className="text-sm text-[#7D8592] font-bold">PINFL</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData["PINFL"] || ""}
                onChange={(e) => handleChange("PINFL", e.target.value)}
                placeholder="45245875495734"
                className="px-4 border border-[#D8E0F0] h-[48px] rounded-[14px] w-full focus:outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 text-center">
            <label className="text-sm text-[#7D8592] font-bold">
              Photo / File
            </label>
            <Upload disabled={!isEditing}>
              <Button
                type="primary"
                icon={<Download />}
                style={{
                  background: "#0061fe",
                  borderRadius: "14px",
                  padding: "20px 57px",
                  border: "none",
                  fontSize: "18px",
                  fontWeight: "500",
                }}
              >
                Download
              </Button>
            </Upload>
          </div>
        </div>

        {/* Save button - faqat edit rejimida */}
        {isEditing && (
          <div className="flex justify-end mt-6">
            <Button
              type="primary"
              onClick={handleSave}
              style={{
                background: "#0061fe",
                borderRadius: "14px",
                padding: "12px 40px",
                fontSize: "16px",
                fontWeight: "500",
                border: "none",
              }}
            >
              Save
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profiles;
