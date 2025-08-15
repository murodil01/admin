import { Upload, Button, Dropdown } from "antd";
import { Download, MoreVertical } from "lucide-react";
import { useState, useEffect } from "react";
import {
  getControlData,
  updateControlData,
  createControlData,
} from "../../../../api/services/controlDataService";
import { message, Spin } from "antd";

const Profiles = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState("");
  const [fileList, setFileList] = useState([]);

  // ✅ label -> backend field mapping
  const fields = {
    "Acceptance Reason": "accept_reason",
    "Expertise Level": "expertise_level",
    "Strengths": "strengths",
    "Weaknesses": "weaknesses",
    "Biography Summary info": "biography",
    "Trial Period": "trial_period",
    "Work Hours": "work_hours",
    "Contact Type": "contact_type",
    "Assigned Device(s)/Tools": "assigned_devices",
    "Access Level": "access_level",
    "Serial Number": "serial_number",
    "PINFL": "pinfl",
    "Pasport Picture": "passport_picture",
  };

  const handleChange = (label, value) => {
    console.log("Data: ", formData[fields[label]]);
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

  const handleFileUpload = ({ file }) => {
    if (file.status === 'done') {
      setFormData((prev) => ({
        ...prev,
        passport_picture: file.originFileObj,
      }));
      setFileList([file]);
      message.success(`${file.name} file uploaded successfully`);
    }
    return false;
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const hasFile = formData.passport_picture instanceof File;
      const dataToSend = hasFile ? new FormData() : { ...formData };

      if (hasFile) {
        Object.entries(formData).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            dataToSend.append(key, value);
          }
        });
      }

      console.log('Sending data:', dataToSend);

      let response;
      if (formData.id) {
        response = await updateControlData(formData.id, dataToSend, hasFile);
        message.success("Ma'lumotlar muvaffaqiyatli yangilandi");
      } else {
        response = await createControlData(dataToSend, hasFile);
        setFormData({ ...response, id: response.id });
        message.success("Ma'lumotlar muvaffaqiyatli yaratildi");
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Save error:', error.response?.data || error.message);
      message.error(`Saqlashda xatolik: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getControlData();
        console.log('Fetched raw data:', res);

        // results array ichidagi birinchi elementni olish
        if (res?.results?.length > 0) {
          const data = res.results[0];
          console.log('Setting form data:', data);

          setFormData({
            ...data,
            id: data.id
          });

          // Field mapping tekshiruvi
          Object.entries(fields).forEach(([label, field]) => {
            console.log(`Field ${label} (${field}):`, data[field] || 'empty');
          });

          if (data.passport_picture) {
            setFileList([{
              uid: '-1',
              name: 'passport.jpg',
              status: 'done',
              url: data.passport_picture,
            }]);
          }
        }
      } catch (err) {
        console.error("Error fetching control data:", err);
        message.error(`Ma'lumotlarni yuklashda xatolik: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading && !formData.id) return <Spin size="large" className="flex justify-center mt-10" />;

  const menuItems = [{ key: "edit", label: "Edit" }];

  return (
    <div className="w-full bg-white shadow rounded-[24px] py-10 px-6 md:px-10 mt-9 relative">
      <div className="absolute top-6 right-6">
        <Dropdown
          menu={{ items: menuItems, onClick: handleMenuClick }}
          placement="bottomRight"
          trigger={["click"]}
          disabled={loading}
        >
          <Button icon={<MoreVertical />} type="text" loading={loading} />
        </Dropdown>
      </div>

      <h1 className="font-bold text-[18px] text-[#0061fe] mb-6">Control Data</h1>

      {saveMessage && (
        <div className="mb-4 text-green-600 font-semibold">{saveMessage}</div>
      )}

      <Spin spinning={loading}>
        <div className="flex flex-col gap-6">
          {[
            ["Acceptance Reason", "Expertise Level"],
            ["Strengths", "Weaknesses"],
            ["Biography Summary info", "Trial Period"],
            ["Work Hours", "Contact Type"],
            ["Assigned Device(s)/Tools", "Access Level"],
          ].map((row, idx) => (
            <div key={idx} className="flex flex-col md:flex-row gap-6 justify-between">
              {row.map((label) => {
                const fieldName = fields[label];
                const value = formData[fieldName] || "";

                return(
                  <div key={label} className="flex flex-col w-full">
                    <label className="text-[#7D8592] font-bold text-sm mb-1">
                      {label}: {!value && <span className="text-gray-400">(empty)</span>}
                    </label>
                    <textarea
                      disabled={!isEditing}
                      value={formData[fields[label]] || ""}
                      onChange={(e) => handleChange(label, e.target.value)}
                      className="w-full h-[94px] rounded-[14px] border border-[#D8E0F0] px-4 pt-4 text-sm text-gray-800 resize-none"
                      placeholder="(Skills, Loyalty, Opportunity, fit, etc.)"
                    />
                  </div>
                );
              })}
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
              <Upload
                fileList={fileList}
                beforeUpload={() => false}
                onChange={handleFileUpload}
                disabled={!isEditing || loading}
                showUploadList={false}>
                <Button
                  type="primary"
                  icon={<Download />}
                  loading={loading}
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
              {fileList.length > 0 && (
                fileList[0].url ? (
                  <a
                    href={fileList[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline mt-2 inline-block"
                  >
                    View Current Passport
                  </a>
                ) : (
                  <img
                    src={URL.createObjectURL(fileList[0].originFileObj)}
                    alt="Preview"
                    className="mt-2 w-40 rounded mx-auto"
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
                loading={loading}
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
      </Spin>
    </div>
  );
};

export default Profiles;