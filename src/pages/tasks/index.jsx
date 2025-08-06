import { BiMessageDetail } from "react-icons/bi";
import { BiCheckSquare } from "react-icons/bi";
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import { AiOutlineTags } from "react-icons/ai";
import { MdOutlineChecklist } from "react-icons/md";
import { AiOutlinePlus } from "react-icons/ai";
import { ImAttachment } from "react-icons/im";
import { RiUserAddFill } from "react-icons/ri";
import { BsCheck2Square } from "react-icons/bs";
import { BiComment } from "react-icons/bi";
import { BiLink } from "react-icons/bi";
import { AiOutlinePaperClip } from "react-icons/ai";
import { useState } from "react";
import { Button, Modal, Select, DatePicker, Input, Checkbox } from 'antd';
import { Outlet } from "react-router-dom";
// import dayjs from "dayjs";
// import assigned from "../../assets/icons/assigned.svg"
// import acknowledged from "../../assets/icons/acknowledged.svg"
// import inProgress from "../../assets/icons/inProgress.svg"
// import completedIcon from "../../assets/icons/completed.svg"
// import inReview from "../../assets/icons/inReview.svg"
// import rework from "../../assets/icons/rework.svg"
// import dropped from "../../assets/icons/dropped.svg"
// import approved from "../../assets/icons/approved.svg"
import Kanban from "./Kanban";

const Tasks = (
  // {completed, total}
) => {
  // const activityData = [
  //   {
  //     name: "Rovshan Egamov",
  //     time: "17 minutes ago",
  //     initials: "RE",
  //     color: "bg-blue-900",
  //   },
  //   {
  //     name: "Alisher Rustamov",
  //     time: "1 hour 24 minutes ago",
  //     initials: "AR",
  //     color: "bg-red-800",
  //   },
  //   {
  //     name: "Kamron Turdiyev",
  //     time: "23 hour 44 minutes ago",
  //     initials: "KT",
  //     color: "bg-purple-500",
  //   },
  // ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  // const [dueDate, setDueDate] = useState(dayjs());
  const [projectName, setProjectName] = useState('');

  // const [title, setTitle] = useState('');
  // const [description, setDescription] = useState('');
  // const [checklist, setChecklist] = useState([
  //   { id: 1, text: 'Header to‘g‘rilash', checked: true },
  //   { id: 2, text: 'Rang almashtirish', checked: true }
  // ]);

  const showModal = () => {
    setIsModalOpen(true);
  };

  // const showCardModal = () => {
  //   setIsCardModalOpen(true);
  // };

  // const handleOk = () => {
  //   setIsModalOpen(false);
  //   setIsCardModalOpen(false);
  // };

  const handleCancel = () => {
    setIsModalOpen(false);
    // setIsCardModalOpen(false);
  };

  const handleSave = () => {
    // Here you can collect form data, validate, and send it
    console.log("Saving project...");
    console.log("Saving card...");
    setIsModalOpen(false); // Close modal after saving
    // setIsCardModalOpen(false); // Close modal after saving
  };

  // const toggleChecklistItem = (id) => {
  //   setChecklist(prev =>
  //     prev.map(item =>
  //       item.id === id ? { ...item, checked: !item.checked } : item
  //     )
  //   );
  // };

  // const addChecklistItem = () => {
  //   const newItem = {
  //     id: Date.now(),
  //     text: "New task",
  //     checked: false,
  //   };
  //   setChecklist([...checklist, newItem]);
  // };

  // const progress =
  //   checklist.length === 0
  //     ? 0
  //     : Math.round((checklist.filter(item => item.checked).length / checklist.length) * 100);


  // const taskColumns = [
  //   { id: "assigned", title: "Assigned", color: "bg-[#DCE8FF]", icon: <img src={assigned} alt="" /> },
  //   { id: "acknowledged", title: "Acknowledged", color: "bg-[#D5F6D7]", icon: <img src={acknowledged} alt="" /> },
  //   { id: "inProgress", title: "In Progress", color: "bg-[#FAF6E1]", icon: <img src={inProgress} alt="" /> },
  //   { id: "completed", title: "Completed", color: "bg-[#F4EBF9]", icon: <img src={completedIcon} alt="" /> },
  //   { id: "inReview", title: "In Review", color: "bg-[#FFF0E0]", icon: <img src={inReview} alt="" /> },
  //   { id: "rework", title: "Rework", color: "bg-[#E2C7A9]", icon: <img src={rework} alt="" /> },
  //   { id: "dropped", title: "Dropped", color: "bg-[#FFDADA]", icon: <img src={dropped} alt="" /> },
  //   { id: "approved", title: "Approved", color: "bg-[#C2FFCF]", icon: <img src={approved} alt="" /> },
  // ];

  // const activeTasks = [
  //   {
  //     id: "TS0001245",
  //     title: "UX sketches",
  //     time: "4d",
  //     assignee: { name: "John", avatar: "bg-red-500" },
  //     column: "assigned",
  //   },
  //   {
  //     id: "TS0001245",
  //     title: "Mind Map",
  //     time: "2d 4h",
  //     assignee: { name: "Mike", avatar: "bg-gray-800" },
  //     column: "acknowledged",
  //   },
  //   {
  //     id: "research-reports",
  //     title: "Research reports",
  //     time: "2d",
  //     assignee: { name: "Sarah", avatar: "bg-yellow-600" },
  //     column: "inProgress",
  //   },
  //   {
  //     id: "research",
  //     title: "Research",
  //     time: "4d",
  //     assignee: { name: "Emma", avatar: "bg-red-500" },
  //     column: "completed",
  //   },
  //   {
  //     id: "ux-login",
  //     title: "UX Login + Registration",
  //     time: "2d",
  //     assignee: { name: "John", avatar: "bg-red-500" },
  //     column: "inReview",
  //   },
  //   {
  //     id: "presentation",
  //     title: "Research reports (presentation for client)",
  //     time: "6h",
  //     assignee: { name: "Lisa", avatar: "bg-pink-500" },
  //     column: "rework",
  //   },
  //   {
  //     id: "ui-login",
  //     title: "UI Login + Registration (+ other screens)",
  //     time: "1d 6h",
  //     assignee: { name: "John", avatar: "bg-red-500" },
  //     column: "dropped",
  //   },
  // ];

  // const getTasksByColumn = (columnId) => {
  //   return activeTasks.filter((task) => task.column === columnId);
  // };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-[28px]">
        <h3 className="text-[#0A1629] text-[28px] sm:text-[36px] font-bold text-center sm:text-left">
          Tasks
        </h3>
        <button
          onClick={showModal}
          className="capitalize w-full sm:max-w-[182px] h-11 bg-[#0061fe] rounded-2xl text-white gap-[10px] flex items-center justify-center cursor-pointer shadow shadow-blue-300"
        >
          <span className="flex items-center text-[22px]">+</span>
          <span className="">Add New File</span>
        </button>

        <Modal
          title={<h2 className="px-10 text-2xl font-semibold text-[#1F2937]">Add Project</h2>}
          open={isModalOpen}
          onCancel={handleCancel}
          footer={null}
          centered
          width={1000}
          bodyStyle={{ padding: 0 }}
          wrapClassName="custom-modal-wrapper"
        >
          <div className="px-6 sm:px-10 py-8">
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">

              {/* LEFT SIDE - FORM */}
              <div className="xl:col-span-[3] space-y-6">
                {/* Project Name */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Project Name</label>
                  <input
                    type="text"
                    placeholder="Project Name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={projectName} onChange={(e) => setProjectName(e.target.value)}
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Starts</label>
                    <DatePicker className="w-full border border-gray-300 rounded-lg px-4 py-3" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">Deadline</label>
                    <DatePicker className="w-full border border-gray-300 rounded-lg px-4 py-3" />
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Priority</label>
                  <Select
                    defaultValue="Medium"
                    options={[
                      { value: "Low", label: "Low" },
                      { value: "Medium", label: "Medium" },
                      { value: "High", label: "High" },
                    ]}
                    className="w-full"
                    popupClassName="rounded-lg"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Description</label>
                  <textarea
                    rows={4}
                    placeholder="Brief summary of the project..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* RIGHT SIDE - IMAGE SELECTOR */}
              <div className="border border-gray-200 rounded-2xl p-6 col-span-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Select image</h3>
                <p className="text-sm text-gray-500 mb-5">
                  Select or upload an avatar for the project (available formats: jpg, png)
                </p>

                <div className="grid grid-cols-4 gap-3">
                  {[...Array(11)].map((_, i) => (
                    <div
                      key={i}
                      className="w-14 h-14 rounded-lg border border-gray-300 flex items-center justify-center hover:ring-2 hover:ring-blue-400 transition cursor-pointer"
                    >
                      <img
                        src={`/img/avatar-${i + 1}.png`}
                        alt={`avatar-${i + 1}`}
                        className="w-6 h-6 object-contain"
                      />
                    </div>
                  ))}
                </div>
                {/* Upload */}
                <div className="mt-5 flex gap-3">
                  {/* Upload from Computer */}
                  <label className="flex items-center gap-2 p-[10px] bg-[#e3ebf8] text-white text-sm font-medium rounded-lg hover:opacity-80 transition cursor-pointer">
                    <AiOutlinePaperClip color="#6D5DD3" size={24} />
                    <input
                      type="file"
                      accept=".jpg, .jpeg, .png"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const imageUrl = URL.createObjectURL(file);
                          console.log('Uploaded file image URL:', imageUrl);
                          // Use the URL in your app state
                        }
                      }}
                    />
                  </label>

                  {/* Upload from Link */}
                  <button
                    type="button"
                    className="flex items-center gap-2 p-[10px] bg-[#e3ebf8] text-gray-800 text-sm font-medium rounded-lg hover:opacity-80 transition cursor-pointer"
                    onClick={() => {
                      const url = prompt("Enter image URL:");
                      if (url) {
                        console.log('Image URL entered:', url);
                        // Use the URL in your app state
                      }
                    }}
                  >
                    <BiLink color="#15C0E6" size={24} />
                  </button>
                </div>
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex justify-end pt-10">
              <Button
                type="primary"
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-6 py-3 rounded-lg"
              >
                Save Project
              </Button>
            </div>
          </div>
        </Modal>
      </div>

      {/* <Outlet /> */}

      <div className="w-full">
        <div className="w-full pb-4 relative">
          <Kanban />
        </div>
      </div>
    </div>
  )
}

export default Tasks;