import { Upload, Button, Dropdown } from "antd";
import { Download, MoreVertical } from "lucide-react";
import { useState, useEffect } from "react";
import {
  getControlData,
  updateControlData,
  createControlData,
} from "../../../../api/services/controlDataService";

const Profiles = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState("");

  // ✅ label -> backend field mapping
  const fields = {
    "Acceptance Reason": "accept_reason",
    "Expertise Level": "expertise_level",
    "Strengths": "strengths",
    "Weaknesses": "weaknesses",
    "Biography Summary info": "biography",
    "Trial Period": "trial_period",
    "Work Hours": "work_hours",
    "Contract Type": "contract_type",
    "Assigned Device(s)/Tools": "assigned_devices",
    "Access Level": "access_level",
    "Serial Number": "serial_number",
    "PINFL": "pinfl",
    "Pasport Rasmi": "passport_picture",
  };

  const handleChange = (label, value) => {
    const apiField = fields[label];
    setFormData((prev) => ({
      ...prev,
      [apiField]: value,
    }));
  };

  const handleEdit = () => setIsEditing(true);

  const handleMenuClick = ({ key }) => {
    if (key === "edit") handleEdit();
  };

  const handleFileUpload = (file) => {
    setFormData((prev) => ({
      ...prev,
      passport_picture: file,
    }));
    return false; // avtomatik uploadni o‘chiradi
  };

  const handleSave = async () => {
    try {
      let hasFile = formData.passport_picture instanceof File;
      let dataToSend;

      if (hasFile) {
        dataToSend = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            dataToSend.append(key, value);
          }
        });
        console.log("Sending FormData:");
        for (let pair of dataToSend.entries()) {
          console.log(pair[0], pair[1]);
        }
      } else {
        dataToSend = { ...formData };
        console.log("Sending JSON:", dataToSend);
      }

      if (formData.id) {
        await updateControlData(formData.id, dataToSend, hasFile);
        setSaveMessage("✅ Ma'lumotlar muvaffaqiyatli yangilandi");
      } else {
        const res = await createControlData(dataToSend, hasFile);
        setFormData(res);
        setSaveMessage("✅ Ma'lumotlar muvaffaqiyatli yaratildi");
      }

      setIsEditing(false);
      setTimeout(() => setSaveMessage(""), 3000);
    } catch (err) {
      console.error("Save error:", err);
      setSaveMessage("❌ Saqlashda xatolik");
      setTimeout(() => setSaveMessage(""), 3000);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getControlData();
        if (res.results?.length) {
          setFormData({ ...res.results[0], id: res.results[0].id });
        }
      } catch (err) {
        console.error("Error fetching control data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;

  const menuItems = [{ key: "edit", label: "Edit" }];

  return (
    <div className="w-full bg-white shadow rounded-[24px] py-10 px-6 md:px-10 mt-9 relative">
      <div className="absolute top-6 right-6">
        <Dropdown
          menu={{ items: menuItems, onClick: handleMenuClick }}
          placement="bottomRight"
          trigger={["click"]}
        >
          <Button icon={<MoreVertical />} type="text" />
        </Dropdown>
      </div>

      <h1 className="font-bold text-[18px] text-[#0061fe] mb-6">Control Data</h1>

      {saveMessage && (
        <div className="mb-4 text-green-600 font-semibold">{saveMessage}</div>
      )}

      <div className="flex flex-col gap-6">
        {[
          ["Acceptance Reason", "Expertise Level"],
          ["Strengths", "Weaknesses"],
          ["Biography Summary info", "Trial Period"],
          ["Work Hours", "Contract Type"],
          ["Assigned Device(s)/Tools", "Access Level"],
        ].map((row, idx) => (
          <div key={idx} className="flex flex-col md:flex-row gap-6 justify-between">
            {row.map((label) => (
              <div key={label} className="flex flex-col w-full">
                <label className="text-[#7D8592] font-bold text-sm mb-1">{label}:</label>
                <textarea
                  disabled={!isEditing}
                  value={formData[fields[label]] || ""}
                  onChange={(e) => handleChange(label, e.target.value)}
                  className="w-full h-[94px] rounded-[14px] border border-[#D8E0F0] px-4 pt-4 text-sm text-gray-800 resize-none"
                  placeholder="(Skills, Loyalty, Opportunity, fit, etc.)"
                />
              </div>
            ))}
          </div>
        ))}

        {/* Passport */}
        <div>
          <h1 className="font-bold text-[18px] text-[#0061fe] mb-6">Passport Detail</h1>

          <div className="flex flex-col md:flex-row gap-6 mb-4">
            <div className="flex flex-col gap-2 w-full">
              <label className="text-sm text-[#7D8592] font-bold">Serial Number</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.serial_number || ""}
                onChange={(e) => handleChange("Serial Number", e.target.value)}
                placeholder="AD1114567"
                className="px-4 border border-[#D8E0F0] h-[48px] rounded-[14px] w-full"
              />
            </div>

            <div className="flex flex-col gap-2 w-full">
              <label className="text-sm text-[#7D8592] font-bold">PINFL</label>
              <input
                type="text"
                disabled={!isEditing}
                value={formData.pinfl || ""}
                onChange={(e) => handleChange("PINFL", e.target.value)}
                placeholder="45245875495734"
                className="px-4 border border-[#D8E0F0] h-[48px] rounded-[14px] w-full"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 text-center">
            <label className="text-sm text-[#7D8592] font-bold">Photo / File</label>
            <Upload beforeUpload={handleFileUpload} disabled={!isEditing}>
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
                Upload
              </Button>
            </Upload>
            {formData.passport_picture && (
              typeof formData.passport_picture === "string" ? (
                <a
                  href={formData.passport_picture}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 underline mt-2"
                >
                  View Current Passport
                </a>
              ) : (
                <img
                  src={URL.createObjectURL(formData.passport_picture)}
                  alt="Preview"
                  className="mt-2 w-40 rounded"
                />
              )
            )}
          </div>
        </div>

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