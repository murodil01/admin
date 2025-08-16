const EditCardModal = ({ visible, onClose, cardData, onUpdate }) => {
    const { projectId } = useParams();
    const [loading, setLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
  
    // Form state variables
    const [title, setTitle] = React.useState("");
    const [type, setType] = React.useState("");
    const [date, setDate] = React.useState(null);
    const [notification, setNotification] = React.useState("Off");
    const [selectedAssignee, setSelectedAssignee] = React.useState([]);
    const [description, setDescription] = React.useState("");
    const [selectedTags, setSelectedTags] = React.useState([]);
    const [progress, setProgress] = React.useState(0);
  
    // Files state - yetishmayotgan qism
    const [files, setFiles] = React.useState([]);
    const [uploadedFiles, setUploadedFiles] = React.useState([]);
    const [fileUploading, setFileUploading] = React.useState(false);
  
    // API data state
    const [availableUsers, setAvailableUsers] = React.useState([]);
    const [availableTags, setAvailableTags] = React.useState([]);
  
    // Modal ochilganda API dan ma'lumotlarni yuklash
    React.useEffect(() => {
      if (visible && projectId && cardData?.id) {
        loadModalData();
        loadTaskFiles();
      }
    }, [visible, projectId, cardData?.id]);
  
    // Card ma'lumotlarini form ga yuklash
    React.useEffect(() => {
      if (visible && cardData) {
        setTitle(cardData.name || "");
        setType(cardData.tasks_type || "");
        setDate(cardData.deadline ? dayjs(cardData.deadline) : null);
        setNotification(cardData.is_active ? "On" : "Off");
        setSelectedAssignee(cardData.assigned || []);
        setDescription(cardData.description || "");
        setSelectedTags(cardData.tags ? cardData.tags.map((tag) => tag.id) : []);
        setProgress(cardData.progress || 0);
        
        // New files list ni tozalash
        setFiles([]);
      }
    }, [cardData, visible]);
  
    const loadModalData = async () => {
      setLoading(true);
      try {
        const [usersResponse, tagsResponse] = await Promise.all([
          getProjectUsers(projectId),
          getTaskTags(),
        ]);
  
        const formattedUsers = usersResponse.data.map((user) => ({
          value: user.id,
          label: `${user.first_name} ${user.last_name}`,
          email: user.email,
        }));
  
        setAvailableUsers(formattedUsers);
        setAvailableTags(tagsResponse.data);
      } catch (error) {
        console.error("Modal ma'lumotlarini yuklashda xatolik:", error);
        message.error("Ma'lumotlarni yuklashda xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    };
  
    // Task files ni yuklash funksiyasi - YANGI
    const loadTaskFiles = async () => {
      try {
        const response = await axios.get('project/files/');
        
        // Task ID ga mos fayllarni filtrlash
        const taskFiles = response.data.filter(file => file.task === cardData.id);
        setUploadedFiles(taskFiles);
        
        console.log("Yuklangan fayllar:", taskFiles);
      } catch (error) {
        console.error("Fayllarni yuklashda xatolik:", error);
        message.error("Fayllarni yuklashda xatolik yuz berdi");
        setUploadedFiles([]);
      }
    };
  
    // File upload funksiyasi - yangi qo'shilgan
    const uploadFile = async (file, taskId) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('task', taskId); // Task ID ni qo'shish
  
      try {
        // API endpoint: project/files/ (POST)
        const response = await axios.post('project/files/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        return response.data;
      } catch (error) {
        console.error('File upload error:', error);
        throw error;
      }
    };
  
    // Multiple files upload
    const uploadMultipleFiles = async (taskId) => {
      if (files.length === 0) return [];
  
      setFileUploading(true);
      const uploadPromises = files.map(file => uploadFile(file, taskId));
      
      try {
        const uploadResults = await Promise.all(uploadPromises);
        message.success(`${uploadResults.length} ta fayl muvaffaqiyatli yuklandi!`);
        return uploadResults;
      } catch (error) {
        message.error('Ba\'zi fayllar yuklanmadi');
        console.error('Files upload error:', error);
        return [];
      } finally {
        setFileUploading(false);
      }
    };
  
    const handleSave = async () => {
      if (!cardData?.id) {
        message.error("Task ID topilmadi");
        return;
      }
      
      if (!title.trim()) {
        message.error("Task nomi kiritilishi shart");
        return;
      }
  
      setSaveLoading(true);
  
      try {
        // 1. Avval task ni yangilash
        const updateData = {
          name: title.trim(),
          description: description.trim() || null,
          tasks_type: type,
          deadline: date ? date.format("YYYY-MM-DD") : null,
          project: projectId,
          assigned: selectedAssignee.length > 0 ? selectedAssignee : [],
          tags_ids: selectedTags.length > 0 ? selectedTags : [],
          progress: Math.min(100, Math.max(0, progress)),
          is_active: notification === "On",
        };
  
        console.log("Yuborilayotgan ma'lumotlar:", updateData);
        console.log("Project ID:", projectId);
  
        const response = await updateTask(cardData.id, updateData);
        
        // 2. Yangi fayllarni yuklash (agar mavjud bo'lsa)
        let newUploadedFiles = [];
        if (files.length > 0) {
          newUploadedFiles = await uploadMultipleFiles(cardData.id);
        }
  
        message.success("Task muvaffaqiyatli yangilandi!");
  
        // 3. State ni yangilash
        if (response && response.data) {
          const updatedCardData = {
            ...response.data,
            files: [...uploadedFiles, ...newUploadedFiles] // Eski va yangi fayllarni birlashtirish
          };
          onUpdate(updatedCardData);
        } else {
          onUpdate({
            ...cardData,
            ...updateData,
            id: cardData.id,
            files: [...uploadedFiles, ...newUploadedFiles]
          });
        }
  
        onClose();
      } catch (error) {
        console.error("Task yangilashda xatolik:", error);
  
        if (error.response) {
          console.error("Server javobi:", error.response.data);
          console.error("Status:", error.response.status);
  
          const errorMessage =
            error.response.data?.message ||
            error.response.data?.error ||
            error.response.data?.detail ||
            `Server xatolik: ${error.response.status}`;
          message.error(errorMessage);
        } else if (error.request) {
          message.error("Serverga ulanishda xatolik");
        } else {
          message.error("Kutilmagan xatolik yuz berdi");
        }
      } finally {
        setSaveLoading(false);
      }
    };
  
    const toggleTag = (tagId) => {
      setSelectedTags((prev) =>
        prev.includes(tagId)
          ? prev.filter((id) => id !== tagId)
          : [...prev, tagId]
      );
    };
  
    // File delete funksiyasi - YANGILANGAN
    const deleteUploadedFile = async (fileId) => {
      try {
        await axios.delete(`project/files/${fileId}/`);
        setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
        message.success("Fayl o'chirildi");
      } catch (error) {
        message.error("Faylni o'chirishda xatolik");
        console.error("File delete error:", error);
      }
    };
  
    // File download funksiyasi - YANGI
    const downloadFile = (file) => {
      if (file.file) {
        // Faylni yangi tabda ochish yoki download qilish
        window.open(file.file, '_blank');
      } else {
        message.error("Fayl topilmadi");
      }
    };
  
    return (
      <Modal
        open={visible}
        onCancel={onClose}
        footer={null}
        centered
        width={1000}
        title={<h2 className="px-4 text-2xl font-bold text-[#1F2937]">Edit Task</h2>}
        className="custom-modal"
      >
        <div className="px-5 sm:px-4 py-8">
          {loading ? (
            <div className="flex justify-center items-center h-[400px]">
              <Spin size="large" />
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">
              {/* LEFT SIDE */}
              <div className="xl:col-span-3 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-[14px] text-[#7D8592] mb-2 font-bold">
                    Task Title
                  </label>
                  <Input
                    style={{ height: "54px", borderRadius: "14px" }}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter task title"
                  />
                </div>
  
                {/* Type */}
                <div>
                  <label className="block text-[14px] font-bold text-[#7D8592] mb-2">
                    Status
                  </label>
                  <Select
                    className="custom-select w-full"
                    value={type}
                    onChange={setType}
                    style={{ height: "54px" }}
                    options={taskColumns.map((col) => ({
                      value: col.id,
                      label: col.title,
                    }))}
                  />
                </div>
  
                {/* Time, Notification, Assignee */}
                <div className="flex justify-between items-center gap-[20px] flex-wrap">
                  <div>
                    <label className="block text-[14px] font-bold text-[#7D8592] mt-4 mb-2">
                      Due time
                    </label>
                    <DatePicker
                      className="w-full"
                      style={{ borderRadius: "14px", height: "54px" }}
                      value={date}
                      onChange={(date) => setDate(date)}
                    />
                  </div>
  
                  <div>
                    <label className="block text-[14px] font-bold text-[#7D8592] mb-2">
                      Notification
                    </label>
                    <Select
                      className="custom-notif"
                      style={{ height: "54px" }}
                      value={notification}
                      onChange={setNotification}
                      options={[
                        { value: "On", label: "On" },
                        { value: "Off", label: "Off" },
                      ]}
                    />
                  </div>
  
                  <div className="md:col-span-2">
                    <label className="block text-[14px] font-bold text-[#7D8592] mb-2">
                      Assignee
                    </label>
                    <Select
                      showSearch
                      mode="multiple"
                      placeholder="Select assignees"
                      value={selectedAssignee}
                      optionFilterProp="label"
                      className="custom-assigne"
                      style={{ height: "54px" }}
                      onChange={setSelectedAssignee}
                      options={availableUsers}
                      filterOption={(input, option) =>
                        (option?.label ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      notFoundContent={loading ? "Loading..." : "No users found"}
                    />
                  </div>
                </div>
  
                {/* Description */}
                <div>
                  <label className="block text-[14px] font-bold text-[#7D8592] mb-2">
                    Description
                  </label>
                  <TextArea
                    style={{ borderRadius: "14px" }}
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter task description"
                  />
                </div>
  
                {/* Progress */}
                <div>
                  <label className="block text-[14px] font-bold text-[#7D8592] mb-2">
                    Progress (%)
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    style={{ height: "54px", borderRadius: "14px" }}
                    value={progress}
                    onChange={(e) => setProgress(Number(e.target.value))}
                    placeholder="Enter progress percentage"
                  />
                </div>
  
                {/* Tags */}
                <div>
                  <label className="block text-[14px] text-[#7D8592] mb-2 font-bold">
                    Task tags
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {availableTags.map((tag) => (
                      <label
                        key={tag.id}
                        className="flex items-center gap-2 text-[12px] cursor-pointer capitalize font-semi-bold text-gray-400"
                      >
                        <input
                          type="checkbox"
                          checked={selectedTags.includes(tag.id)}
                          onChange={() => toggleTag(tag.id)}
                        />
                        {tag.name}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
  
              {/* RIGHT SIDE */}
              <div className="xl:col-span-2 space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-[14px] font-bold text-[#7D8592] mb-2">
                    Image
                  </label>
                  <Upload
                    style={{ width: "100%" }}
                    showUploadList={true}
                    beforeUpload={(file) => {
                      // Handle image upload separately if needed
                      return false;
                    }}
                  >
                    <Button
                      className="custom-upload-btn"
                      style={{
                        width: "100%",
                        height: "54px",
                        borderRadius: "14px",
                        fontWeight: "500",
                      }}
                    >
                      Upload image
                    </Button>
                  </Upload>
                </div>
  
                {/* Files Section */}
                <div className="mt-4">
                  <label className="block font-bold text-[14px] text-[#7D8592] mb-2">
                    Files
                  </label>
                  
                  {/* Existing uploaded files */}
                  {uploadedFiles.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Yuklangan fayllar:</p>
                      {uploadedFiles.map((file, index) => (
                        <div key={`uploaded-${file.id}`} className="flex items-center gap-2 mb-2 p-2 border rounded-lg bg-green-50">
                          <div className="flex-1">
                            <p className="text-sm font-medium truncate">
                              {file.file ? file.file.split('/').pop() : `File ${index + 1}`}
                            </p>
                            <p className="text-xs text-gray-500">
                              Created: {file.created_at ? new Date(file.created_at).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                          <button
                            onClick={() => downloadFile(file)}
                            className="text-blue-500 hover:text-blue-700 p-1"
                            title="Download file"
                          >
                            <DownloadOutlined />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Bu faylni o\'chirmoqchimisiz?')) {
                                deleteUploadedFile(file.id);
                              }
                            }}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Delete file"
                          >
                            <FiTrash />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
  
                  {/* New files to be uploaded */}
                  {files.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Yangi fayllar (saqlaganda yuklanadi):</p>
                      {files.map((file, index) => (
                        <div key={`new-${index}`} className="flex items-center gap-2 mb-2 p-2 border rounded-lg bg-orange-50">
                          <div className="flex-1">
                            <p className="text-sm font-medium truncate">{file.name}</p>
                            <p className="text-xs text-orange-600">Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                          <span className="text-orange-500 text-xs px-2 py-1 bg-orange-200 rounded">Yangi</span>
                          <button
                            onClick={() =>
                              setFiles((prev) => prev.filter((_, i) => i !== index))
                            }
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove file"
                          >
                            <FiTrash />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
  
                  {/* File upload */}
                  <Upload
                    className="w-full"
                    multiple
                    showUploadList={false}
                    beforeUpload={(file) => {
                      // File size check (10MB limit)
                      if (file.size > 10 * 1024 * 1024) {
                        message.error(`${file.name} faylining hajmi 10MB dan katta!`);
                        return false;
                      }
                      
                      setFiles((prev) => [...prev, file]);
                      return false;
                    }}
                    accept="*/*"
                  >
                    <button 
                      className="text-blue-600 text-[14px] font-bold hover:text-blue-800 transition-colors"
                      disabled={fileUploading}
                    >
                      {fileUploading ? "Uploading..." : "+ add file"}
                    </button>
                  </Upload>
  
                  {/* Files summary */}
                  {(uploadedFiles.length > 0 || files.length > 0) && (
                    <div className="mt-3 p-2 bg-gray-50 rounded text-xs text-gray-600">
                      Jami fayllar: {uploadedFiles.length + files.length} 
                      {files.length > 0 && ` (${files.length} ta yangi)`}
                    </div>
                  )}
                </div>
  
                {/* Buttons */}
                <div className="flex justify-center gap-5 pt-10">
                  <Button
                    onClick={onClose}
                    disabled={saveLoading || fileUploading}
                    style={{
                      width: "140px",
                      height: "48px",
                      fontSize: "17px",
                      fontWeight: "600",
                      borderRadius: "14px",
                      border: "none",
                      transition: "all 0.3s ease",
                      boxShadow: "0 4px 12px rgba(217, 217, 217, 0.5)",
                      color: "#595959",
                      backgroundColor: "#fff",
                    }}
                  >
                    Cancel
                  </Button>
  
                  <Button
                    onClick={handleSave}
                    type="primary"
                    loading={saveLoading}
                    disabled={fileUploading}
                    style={{
                      width: "140px",
                      height: "48px",
                      fontSize: "17px",
                      fontWeight: "600",
                      borderRadius: "14px",
                      boxShadow: "0 4px 12px rgba(24, 144, 255, 0.5)",
                      transition: "box-shadow 0.3s ease",
                    }}
                  >
                    {saveLoading ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    );
  };