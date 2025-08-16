import { Upload, Button, Dropdown } from "antd";
import { Download, MoreVertical } from "lucide-react";
import { useState, useEffect } from "react";
import {
  getControlDataByUserId,
  updateControlData,
  uploadControlDataFile,
  createControlDataForUser,
} from "../../../../api/services/controlDataService";
import { message, Spin } from "antd";
import { useParams } from "react-router-dom";

const Profiles = () => {
  const { id: employeeId } = useParams(); // Get employee ID from URL
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState("");
  const [fileList, setFileList] = useState([]);
  const [isNewRecord, setIsNewRecord] = useState(false);

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
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({
          ...prev,
          passport_picture: file.originFileObj,
          passport_picture_url: e.target.result, // Preview uchun
        }));
      };
      reader.readAsDataURL(file.originFileObj);

      setFileList([{
        uid: file.uid,
        name: file.name,
        status: 'done',
      }]);
      message.success(`${file.name} file uploaded successfully`);
    }
    return false; // Avtomatik yuklashni oldini olish
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      let response;
      if (formData.id) {
        // Mavjud yozuvni yangilash
        response = await updateControlData(formData.id, formData);
        message.success("Ma'lumotlar yangilandi");

        // 2. Rasmni alohida yuklash
        if (formData.passport_picture instanceof File) {
          await uploadControlDataFile(response.id, formData.passport_picture);
          message.success("Passport rasmi saqlandi");

          // Fayl ro'yxatini yangilash
          setFileList([{
            uid: '-1',
            name: 'passport.jpg',
            status: 'done',
            url: URL.createObjectURL(formData.passport_picture),
          }]);
        }
      } else {
        // Yangi yozuvni FAQAT shu user uchun yaratish
        const createResponse = await createControlDataForUser(employeeId, formData);
        response = createResponse;

        if (formData.passport_picture instanceof File) {
          await uploadControlDataFile(createResponse.id, formData.passport_picture);
        }
        setFormData(prev => ({ ...prev, id: response.id }));
        message.success("Yangi yozuv yaratildi");
      }

      setIsEditing(false);
      setIsNewRecord(false);

    } catch (error) {
      console.error('Saqlashda xato:', {
        employeeId,
        error: error.response?.data || error
      });
      message.error(error.response?.data?.message || "Saqlash muvaffaqiyatsiz tugadi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const initEmptyForm = () => {
        setFormData({
          employee: employeeId,
          user_id: employeeId,
          pinfl: "", // Boshlang'ich qiymat
          passport_picture: null
        });
        setIsNewRecord(true);
        setFileList([]);
      };

      try {
        setLoading(true);
        const response = await getControlDataByUserId(employeeId);

        if (Array.isArray(response) && response.length > 0) {

          // To'g'ri foydalanuvchi ma'lumotlarini qidirish
          const employeeData = response.find(item => {
            if (!item.user_info || typeof item.user_info !== 'object') {
              console.warn('Invalid user_info structure:', item);
              return false;
            }
            return item.user_info.id === employeeId;
          });

          if (employeeData) {
            setFormData({
              ...employeeData,
              id: employeeData.id,
              employee: employeeData.user_info.id,
              pinfl: employeeData.printl ? String(employeeData.printl) : "" // API dagi printl -> UI dagi pinfl
            });
            setIsNewRecord(false);

            if (employeeData.passport_picture) {
              setFileList([{
                uid: '-1',
                name: 'passport.jpg',
                status: 'done',
                url: employeeData.passport_picture, // URL string keladi
              }]);
              setFormData(prev => ({
                ...prev,
                passport_picture: employeeData.passport_picture // URL ni saqlab qo'yamiz
              }));
            }
          } else {
            initEmptyForm();
          }
        } else {
          initEmptyForm();
        }
      } catch (err) {
        console.error("Fetch error:", {
          error: err,
          response: err.response?.data
        });
        message.error(err.response?.data?.message || "Ma'lumotlarni yuklashda xato");
        initEmptyForm();
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) {
      fetchData();
    }
  }, [employeeId]);

  if (loading && !formData.id && !isNewRecord) {
    return <Spin size="large" className="flex justify-center mt-10" />;
  }

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

      <h1 className="font-bold text-[18px] text-[#0061fe] mb-6">
        Control Data {isNewRecord && "(New Record)"}
      </h1>

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

                return (
                  <div key={label} className="flex flex-col w-full">
                    <label className="text-[#7D8592] font-bold text-sm mb-1">
                      {label}: {!value && <span className="text-gray-400">(empty)</span>}
                    </label>
                    {isEditing ? (
                      <textarea
                        value={value}
                        onChange={(e) => handleChange(label, e.target.value)}
                        className="w-full h-[94px] rounded-[14px] border border-[#D8E0F0] px-4 pt-4 text-sm text-gray-800 resize-none"
                        placeholder={`Enter ${label}`}
                      />
                    ) : (
                      <div className="w-full min-h-[94px] rounded-[14px] border border-[#D8E0F0] px-4 pt-4 text-sm text-gray-800 bg-gray-50">
                        {value || <span className="text-gray-400">No data</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Passport Section */}
          <div>
            <h1 className="font-bold text-[18px] text-[#0061fe] mb-6">Passport Detail</h1>

            <div className="flex flex-col md:flex-row gap-6 mb-4">
              <div className="flex flex-col gap-2 w-full">
                <label className="text-sm text-[#7D8592] font-bold">Serial Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.serial_number || ""}
                    onChange={(e) => handleChange("Serial Number", e.target.value)}
                    placeholder="AD1114567"
                    className="px-4 border border-[#D8E0F0] h-[48px] rounded-[14px] w-full"
                  />
                ) : (
                  <div className="px-4 border border-[#D8E0F0] h-[48px] rounded-[14px] w-full flex items-center bg-gray-50">
                    {formData.serial_number || <span className="text-gray-400">No data</span>}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 w-full">
                <label className="text-sm text-[#7D8592] font-bold">PINFL</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.pinfl || ""}
                    onChange={(e) => handleChange("PINFL", e.target.value)}
                    placeholder="45245875495734"
                    className="px-4 border border-[#D8E0F0] h-[48px] rounded-[14px] w-full"
                  />
                ) : (
                  <div className="px-4 border border-[#D8E0F0] h-[48px] rounded-[14px] w-full flex items-center bg-gray-50">
                    {formData.pinfl || <span className="text-gray-400">No data</span>}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 text-center">
              <label className="text-sm text-[#7D8592] font-bold">Photo / File</label>
              {isEditing ? (
                <Upload
                  fileList={fileList}
                  beforeUpload={(file) => {
                    // Fayl hajmini tekshirish
                    const isLt5M = file.size / 1024 / 1024 < 5;
                    if (!isLt5M) {
                      message.error('Rasm hajmi 5MB dan kichik bo\'lishi kerak!');
                    }
                    return isLt5M;
                  }}
                  onChange={handleFileUpload}
                  disabled={loading}
                  showUploadList={false}
                  accept="image/*"
                >
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
              ) : (
                <div className="min-h-[60px] flex items-center justify-center">
                  {fileList.length > 0 ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={fileList[0].url}
                        alt="Passport"
                        className="max-h-40 mb-2 rounded"
                      />
                      {!isEditing && (
                        <a
                          href={fileList[0].url}
                          download="passport.jpg"
                          className="text-blue-500 underline flex items-center"
                        >
                          <Download size={16} className="mr-1" />
                          Yuklab olish
                        </a>
                      )}
                    </div>
                  ) : formData.passport_picture ? (
                    <span className="text-gray-500">Rasm yuklangan, lekin ko'rsatilmayapti</span>
                  ) : (
                    <span className="text-gray-400">Rasm yuklanmagan</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end mt-6 gap-4">
              <Button
                onClick={() => {
                  setIsEditing(false);
                  if (isNewRecord) {
                    setFormData({ employee: employeeId });
                    setFileList([]);
                  }
                }}
                style={{
                  borderRadius: "14px",
                  padding: "12px 40px",
                  fontSize: "16px",
                  fontWeight: "500",
                }}
              >
                Cancel
              </Button>
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