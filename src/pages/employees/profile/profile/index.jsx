import { Upload, Button, Dropdown } from "antd";
import { Download, MoreVertical } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import {
  getControlDataByUserId,
  updateControlData,
  createControlDataForUser,
} from "../../../../api/services/controlDataService";
import { message, Spin } from "antd";
import { useParams } from "react-router-dom";

const Profiles = () => {
  const { id: employeeId } = useParams(); // Get employee ID from URL
  const numericEmployeeId = parseInt(employeeId);
  const employeeIdString = employeeId;
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saveMessage, setSaveMessage] = useState("");
  const [fileList, setFileList] = useState([]);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const uploadSuccessShown = useRef(false);

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
    if (key === "edit") {
      handleEdit(); // your edit logic
    } else if (key === "create") {
      setIsEditing(true); // or whatever should happen on create
    }
  };

  const handleFileUpload = (info) => {
    const { file } = info;

    // Reset the success flag when starting a new upload
    if (file.status === 'uploading') {
      uploadSuccessShown.current = false;
    }

    // Handle file selection immediately
    if (file.originFileObj || file) {
      const fileObj = file.originFileObj || file;

      // Validate file type and size
      const isLt10M = fileObj.size / 1024 / 1024 < 10;

      // Only show success message once
      if (file.status === 'done' && !uploadSuccessShown.current) {
        message.success(`${file.name} file uploaded successfully`);
        uploadSuccessShown.current = true;
      }

      // For files that aren't images, we'll store the file object
      // but won't try to create a preview URL
      const isImage = fileObj.type?.startsWith('image/');

      setFormData((prev) => ({
        ...prev,
        passport_picture: fileObj,
        passport_picture_url: isImage ? URL.createObjectURL(fileObj) : null,
        passport_file_name: fileObj.name,
      }));

      setFileList([{
        uid: file.uid,
        name: file.name,
        status: 'done',
        originFileObj: fileObj,
        url: isImage ? URL.createObjectURL(fileObj) : null,
      }]);
    }
    return false;
  };

  // Function to handle image download
  const handleDownloadFile = () => {
    const fileUrl = formData.passport_picture_url || (fileList.length > 0 && fileList[0].url);
    const fileName = formData.passport_file_name || (fileList.length > 0 && fileList[0].name) || "downloaded_file";

    if (!fileUrl) {
      // If we don't have a URL but have a file object, create a download
      if (formData.passport_picture instanceof File) {
        const url = URL.createObjectURL(formData.passport_picture);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return;
      }

      message.error("No file available to download");
      return;
    }

    // Create a temporary anchor element
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setSaveMessage("");

      // Convert PINFL to integer if it exists and is not empty
      let pinflValue = null;

      if(formData.pinfl !== null && formData.pinfl !== undefined && formData.pinfl !== '') {
        const parsedPinfl = parseInt(formData.pinfl, 14);

        // Validate PINFL is a valid number
        if (isNaN(parsedPinfl)) {
          message.error("PINFL must be a valid number");
          return;
        }

        pinflValue = parsedPinfl;
      }

      // ✅ Ensure user_id is always included in formData
      const dataToSave = {
        ...formData,
        pinfl: pinflValue, // Use the converted integer value
        user_id: employeeIdString // Always include user_id
      };

      let response;

      if (!isNewRecord && formData.id) {
        // Update existing record using userId (not control data ID)
        response = await updateControlData(employeeIdString, dataToSave);
        message.success("Data updated successfully");
      } else {
        // Create new record
        response = await createControlDataForUser(employeeIdString, dataToSave);

        // Update local state with the new record info
        setFormData(prev => ({
          ...prev,
          id: response.id || response.data?.id,
          user_id: employeeIdString, // Ensure user_id is stored as string
        }));

        message.success("New data added");
        setIsNewRecord(false);
      }
      setIsEditing(false);
    } catch (error) {
      console.error('Save error:', error);

      // More detailed error handling
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Error in saving data";

      message.error(errorMessage);

      // Log the full error for debugging
      console.error('Full error details:', {
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
        employeeId: employeeIdString
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const initEmptyForm = () => {
        setFormData({
          user_id: employeeIdString,
          accept_reason: '',
          expertise_level: '',
          strengths: '',
          weaknesses: '',
          biography: '',
          trial_period: '',
          work_hours: '',
          contact_type: '',
          assigned_devices: '',
          access_level: '',
          serial_number: '',
          pinfl: null,
          passport_picture: null,
          passport_picture_url: null,
          passport_file_name: null,
        });
        setIsNewRecord(true);
        setFileList([]);
      };

      try {
        setLoading(true);
        const response = await getControlDataByUserId(employeeIdString);

        // Check if we have data
        if (response) {
          let employeeData = null;

          if (Array.isArray(response)) {
            // Find the correct data in array
            employeeData = response.find(item => {
              const itemUserId = String(item?.user_info?.id || item?.user_id || '');
              return itemUserId === employeeIdString;
            });
          } else if (response.id || response.user_id) {
            // Single object response
            employeeData = response;
          }

          if (employeeData) {
            setFormData({
              id: employeeData.id,
              user_id: employeeData.user_id || employeeIdString,
              accept_reason: employeeData.accept_reason || '',
              expertise_level: employeeData.expertise_level || '',
              strengths: employeeData.strengths || '',
              weaknesses: employeeData.weaknesses || '',
              biography: employeeData.biography || '',
              trial_period: employeeData.trial_period || '',
              work_hours: employeeData.work_hours || '',
              contact_type: employeeData.contact_type || '',
              assigned_devices: employeeData.assigned_devices || '',
              access_level: employeeData.access_level || '',
              serial_number: employeeData.serial_number || '',
              pinfl: employeeData.pinfl !== null && employeeData.pinfl !== undefined ? employeeData.pinfl : null,
              passport_picture: employeeData.passport_picture || null,
              passport_picture_url: employeeData.passport_picture || null,
              passport_file_name: employeeData.passport_file_name || null,
            });
            setIsNewRecord(false);

            // Set file list if passport picture exists
            if (employeeData.passport_picture) {
              setFileList([{
                uid: '-1',
                name: 'passport.jpg',
                status: 'done',
                url: employeeData.passport_picture,
              }]);
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
          response: err.response?.data,
          status: err.response?.status,
          employeeId: employeeIdString
        });

        // Check if it's a 404 error (user not found) vs other errors
        if (err.response?.status === 404) {
          initEmptyForm();
        } else {
          const errorMessage = err.response?.data?.message || err.message || "Error fetching data";
          message.error(errorMessage);
          initEmptyForm();
        }
      } finally {
        setLoading(false);
      }
    };

    if (employeeId && typeof employeeId === "string" && employeeId.trim() !== "") {
      fetchData();
    } else {
      console.error("Invalid employee ID:", employeeId);
      message.error("Invalid employee ID");
      setLoading(false);
    }
  }, [employeeId, employeeIdString, numericEmployeeId]);

  if (loading && !formData.id && !isNewRecord) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
            <span className="ml-3 text-gray-600 text-sm sm:text-base">
              Loading control data...
            </span>
          </div>
        </div>
      </div>
    );
  }

  const hasData = !isNewRecord && formData.id;
  const menuItems = hasData ? [{ key: "edit", label: "Edit" }] : [{ key: "create", label: "Create" }];

  // Check if we have a file to display
  const hasFile = formData.passport_picture || (fileList.length > 0);
  const isImageFile = formData.passport_picture_url || (fileList.length > 0 && fileList[0].url);

  return (
    <div className="w-full bg-white shadow rounded-[24px] py-10 px-6 md:px-10 mt-9 relative">
      <div className="absolute top-6 right-6">
        <Dropdown
          menu={{ items: menuItems, onClick: handleMenuClick }}
          placement="bottomRight"
          trigger={["click"]}
          disabled={loading}
        >
          <Button
            icon={<MoreVertical />}
            type="text"
            loading={loading}
          />
        </Dropdown>
      </div>

      <h1 className="font-bold text-[18px] text-[#0061fe] mb-6">
        Control Data {isNewRecord}
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
                    value={formData.pinfl !== null && formData.pinfl !== undefined ? formData.pinfl : ""}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      // If empty string, set to null, otherwise keep as string (will be converted to number on save)
                      handleChange("PINFL", value === "" ? null : value);
                    }}
                    placeholder="45245875495734"
                    className="px-4 border border-[#D8E0F0] h-[48px] rounded-[14px] w-full"
                  />
                ) : (
                  <div className="px-4 border border-[#D8E0F0] h-[48px] rounded-[14px] w-full flex items-center bg-gray-50">
                    {formData.pinfl !== null && formData.pinfl !== undefined ? formData.pinfl : <span className="text-gray-400">No data</span>}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-2 text-center">
              <label className="text-sm text-[#7D8592] font-bold">Photo / File</label>

              {/* Show preview if image exists */}
              {isImageFile && (
                <div className="flex flex-col items-center mb-4">
                  <img
                    src={formData.passport_picture_url || fileList[0]?.url}
                    alt="Passport Preview"
                    className="max-h-40 mb-2 rounded"
                  />
                </div>
              )}

              {/* Show file name if non-image file exists */}
              {hasFile && !isImageFile && (
                <div className="flex flex-col items-center mb-4">
                  <span className="text-sm text-gray-600">
                    File: {formData.passport_file_name || fileList[0]?.name}
                  </span>
                </div>
              )}

              {isEditing ? (
                <Upload
                  fileList={fileList}
                  beforeUpload={(file) => {
                    const isLt10M = file.size / 1024 / 1024 < 10;
                    if (!isLt10M) {
                      message.error('File size must be less than 10MB');
                    }
                    return isLt10M;
                  }}
                  onChange={handleFileUpload}
                  disabled={loading}
                  showUploadList={false}
                  // Removed accept="image/*" to allow all file types
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
                  {hasFile ? (
                    <Button
                      type="primary"
                      icon={<Download />}
                      onClick={handleDownloadFile}
                      style={{
                        background: "#0061fe",
                        borderRadius: "14px",
                        padding: "10px 20px",
                        border: "none",
                        fontSize: "14px",
                        fontWeight: "500",
                      }}
                    >
                      Download
                    </Button>
                  ) : (
                    <span className="text-gray-400">File not uploaded</span>
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
                    // Reset form for new record
                    setFormData({
                      user_id: employeeIdString,
                      accept_reason: '',
                      expertise_level: '',
                      strengths: '',
                      weaknesses: '',
                      biography: '',
                      trial_period: '',
                      work_hours: '',
                      contact_type: '',
                      assigned_devices: '',
                      access_level: '',
                      serial_number: '',
                      pinfl: null,
                      passport_picture: null,
                      passport_picture_url: null,
                      passport_file_name: null,
                    });
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