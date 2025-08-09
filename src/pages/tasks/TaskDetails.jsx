import { AiOutlinePaperClip } from "react-icons/ai";
import { FiTrash } from "react-icons/fi";
import { useState } from "react";
import { Button, Modal, Select, DatePicker, Input, Upload, message } from "antd";
import Kanban from "./Kanban";
import memberSearch from "../../assets/icons/memberSearch.svg";

const { TextArea } = Input;

const tagOptions = [
  "service work",
  "training",
  "learning",
  "recruitment",
  "client support",
  "design",
  "planning",
  "event/PR",
  "maintenance",
  "blureaucracy",
  "R&D/Innovation",
  "internal systems",
  "marketing & sales",
];

const assignees = [
  { label: "Jasurbek", value: "jasurbek" },
  { label: "Sardor", value: "sardor" },
  { label: "Malika", value: "malika" },
  { label: "Nodir", value: "nodir" },
]

const TaskDetails = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [notification, setNotification] = useState("Off");
  const [date, setDate] = useState(null);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [image, setImage] = useState(null); // faqat rasm uchun
  const [files, setFiles] = useState([]);   // boshqa fayllar uchun
  const [checklist, setChecklist] = useState([]);
  const [cards, setCards] = useState([]);

  const addCheckItem = () => {
    setChecklist((prev) => [...prev, { text: "", done: false }]);
  };

  const toggleCheckDone = (index) => {
    setChecklist((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, done: !item.done } : item
      )
    );
  };

  const updateCheckText = (index, value) => {
    setChecklist((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, text: value } : item
      )
    );
  };

  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => setIsModalOpen(false);

  const handleSave = () => {
  // Validatsiya
  if (!title.trim()) {
    message.error("Please enter a column title");
    return;
  }
  if (!type) {
    message.error("Please select a type");
    return;
  }

  const completedChecks = checklist.filter(item => item.text.trim() !== "").length;
  const totalChecks = checklist.length;

  const newCard = {
    id: Date.now().toString(),
    title,
    time: date
      ? new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "No due date",
    description,
    assignee: {
      name: selectedAssignee || "Unknown",
      avatar: "bg-blue-500" // Placeholder avatar
    },
    tags,
    checklistProgress: `${completedChecks}/${totalChecks || 0}`,
    column: type,
    files, // Fayllar to‘liq obyekt bo‘lib saqlanadi
  };

  setCards(prev => [...prev, newCard]);
  message.success("Task saved!");

  // Reset form
  setTitle("");
  setType("");
  setNotification("Off");
  setDate(null);
  setSelectedAssignee(null);
  setDescription("");
  setTags([]);
  setFiles([]);
  setChecklist([]);
  setIsModalOpen(false);
};

  const [selectedAssignee, setSelectedAssignee] = useState(null)

  const toggleTag = (tag) => {
    if (tags.includes(tag)) {
      setTags((prev) => prev.filter((t) => t !== tag));
    } else {
      setTags((prev) => [...prev, tag]);
    }
  };

  const handleDelete = () => {
    setTitle("");
    setType("");
    setNotification("Off");
    setDate(null);
    setDescription("");
    setTags([]);
    setFiles([]);
    setChecklist([]);
    message.success("Form reset");
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
        <h3 className="text-[#0A1629] text-[28px] sm:text-[36px] font-bold">task-name</h3>
        <button
          onClick={showModal}
          className="capitalize w-full sm:max-w-[182px] h-11 bg-[#0061fe] rounded-2xl text-white flex items-center justify-center gap-[10px] shadow shadow-blue-300 cursor-pointer"
        >
          <span className="text-[22px]">+</span>
          <span>Add Column</span>
        </button>

        <Modal
          open={isModalOpen}
          onCancel={handleCancel}
          footer={null}
          centered
          width={1000}
          title={<h2 className="px-10 text-2xl font-semibold text-[#1F2937]">Add Column</h2>}
          bodyStyle={{ padding: 0 }}
        >
          <div className="px-6 sm:px-10 py-8">
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">
              {/* LEFT SIDE */}
              <div className="xl:col-span-3 space-y-6">
                <div>
                  <label className="block text-sm text-gray-700 mb-2"><span className="text-bold">Column title</span></label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="name-1" />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">Type</label>
                  <Select
                    className="w-full"
                    value={type}
                    onChange={setType}
                    options={[
                      { value: "assigned", label: "Assigned" },
                      { value: "acknowledged", label: "Acknowledged" },
                      { value: "inProgress", label: "In Progress" },
                      { value: "completed", label: "Completed" },
                      { value: "inReview", label: "In Review" },
                      { value: "rework", label: "Rework" },
                      { value: "dropped", label: "Dropped" },
                      { value: "approved", label: "Approved" },
                    ]}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  {/* Due Time */}
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Due time</label>
                    <DatePicker
                      className="w-full"
                      onChange={(_, dateStr) => setDate(dateStr)}
                    />
                  </div>

                  {/* Notification */}
                  <div className="md:col-span-1">
                    <label className="block text-sm text-gray-700 mb-2">Notification</label>
                    <Select
                      className="w-[100px] h-[44px]"
                      value={notification}
                      onChange={setNotification}
                      options={[
                        { value: "On", label: "On" },
                        { value: "Off", label: "Off" },
                      ]}
                    />
                  </div>

                  {/* Assignee (2 column span) */}
                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-700 mb-2">Assignee</label>
                    <div className="relative">
                      <Select
                        showSearch
                        placeholder="Change assignee"
                        optionFilterProp="label"
                        value={selectedAssignee}
                        onChange={setSelectedAssignee}
                        options={assignees}
                        className="w-full h-[44px] pr-12"
                        filterOption={(input, option) =>
                          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                        }
                      />
                      <span className="absolute inset-y-0 right-7 flex items-center pointer-events-none">
                        <img
                          src={memberSearch}
                          alt="avatar"
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">Description</label>
                  <TextArea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2 font-bold">Task tags</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                    {tagOptions.map((tag) => (
                      <label key={tag} className="flex items-center gap-2 text-[12px] cursor-pointer capitalize font-semi-bold text-gray-400">
                        <input
                          type="checkbox"
                          checked={tags.includes(tag)}
                          onChange={() => toggleTag(tag)}
                        />
                        {tag}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="xl:col-span-2 space-y-6">
                {/* Image upload */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Image</label>
                  <Upload
                    showUploadList={false}
                    beforeUpload={(file) => {
                      const isImage = file.type.startsWith("image/");
                      if (!isImage) {
                        message.error("Only image files are allowed!");
                        return false;
                      }
                      setImage(file); // faqat bitta rasm
                      return false;
                    }}
                  >
                    <Button className="w-full flex items-center justify-between border border-gray-300">
                      <span>Change image</span>
                      <AiOutlinePaperClip className="text-lg" />
                    </Button>
                  </Upload>

                  {/* Image preview */}
                  {image && (
                    <div className="flex items-center gap-2 mt-2">
                      <Input value={image.name} disabled className="flex-1" />
                      <FiTrash
                        className="text-gray-500 cursor-pointer hover:text-red-500"
                        onClick={() => setImage(null)}
                      />
                    </div>
                  )}
                </div>

                {/* Files */}
                <div className="mt-4">
                  <label className="block text-sm text-gray-700 mb-2">Files</label>

                  {/* Uploaded files preview */}
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <Input value={file.name} disabled className="flex-1" />
                      <FiTrash
                        className="text-gray-500 cursor-pointer hover:text-red-500"
                        onClick={() => setFiles((prev) => prev.filter((_, i) => i !== index))}
                      />
                    </div>
                  ))}

                  {/* File Upload */}
                  <Upload
                    multiple
                    showUploadList={false}
                    beforeUpload={(file) => {
                      setFiles((prev) => [...prev, file]); // faqat fayllar
                      return false;
                    }}
                  >
                    <button className="text-blue-600 text-sm">+ add file</button>
                  </Upload>
                </div>

                {/* Checklist */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Check list</label>
                  {checklist.map((check, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      {/* Checkbox bajarilgan/bajarilmagan */}
                      <input
                        type="checkbox"
                        checked={check.done}
                        onChange={() => toggleCheckDone(index)}
                      />
                      {/* Matn */}
                      <Input
                        value={check.text}
                        onChange={(e) => updateCheckText(index, e.target.value)}
                        className="flex-1"
                      />
                      <FiTrash
                        className="text-gray-500 cursor-pointer hover:text-red-500"
                        onClick={() => setChecklist((prev) => prev.filter((_, i) => i !== index))}
                      />
                    </div>
                  ))}
                  <button
                    onClick={addCheckItem}
                    className="text-blue-600 text-sm"
                  >
                    + add new check
                  </button>
                </div>


                {/* Buttons */}
                <div className="flex justify-end gap-5 pt-10">
                  <Button
                    onClick={handleDelete}
                    type="primary" danger>
                    Delete
                  </Button>
                  <Button
                    onClick={handleSave}
                    type="primary">
                    Save
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </div>

      <div className="w-full">
        <div className="w-full pb-4 relative">
          <Kanban cards={cards} setCards={setCards} />
        </div>
      </div>
    </div>
  );
};

export default TaskDetails;