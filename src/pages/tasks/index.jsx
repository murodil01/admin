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
import dayjs from "dayjs";

const Tasks = ({completed, total}) => {
  const activityData = [
    {
      name: "Rovshan Egamov",
      time: "17 minutes ago",
      initials: "RE",
      color: "bg-blue-900",
    },
    {
      name: "Alisher Rustamov",
      time: "1 hour 24 minutes ago",
      initials: "AR",
      color: "bg-red-800",
    },
    {
      name: "Kamron Turdiyev",
      time: "23 hour 44 minutes ago",
      initials: "KT",
      color: "bg-purple-500",
    },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);

  const [dueDate, setDueDate] = useState(dayjs());

  // const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [checklist, setChecklist] = useState([
    { id: 1, text: 'Header to‘g‘rilash', checked: true },
    { id: 2, text: 'Rang almashtirish', checked: true }
  ]);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const showCardModal = () => {
    setIsCardModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
    setIsCardModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setIsCardModalOpen(false);
  };

  const handleSave = () => {
    // Here you can collect form data, validate, and send it
    console.log("Saving project...");
    console.log("Saving card...");
    setIsModalOpen(false); // Close modal after saving
    setIsCardModalOpen(false); // Close modal after saving
  };

  // function parseTimeToHours(timeStr) {
  //   if (!timeStr) return 0;

  //   const dayMatch = timeStr.match(/(\d+)\s*d/);
  //   const hourMatch = timeStr.match(/(\d+)\s*h/);

  //   const days = dayMatch ? parseInt(dayMatch[1]) : 0;
  //   const hours = hourMatch ? parseInt(hourMatch[1]) : 0;

  //   return days * 24 + hours;
  // }

  const taskColumns = [
    { id: "todo", title: "To Do"},
    { id: "gotIt", title: "Got It"},
    { id: "process", title: "Process"},
    { id: "completed", title: "Completed"},
    { id: "backlog", title: "Backlog"},
  ];

  // const initialChecklist = [
  //   { id: 1, text: "Design mockup", checked: true },
  //   { id: 2, text: "Frontend implementation", checked: false },
  //   { id: 3, text: "Code review", checked: false },
  // ];

  const activeTasks = [
    {
      id: "TS0001245",
      title: "UX sketches",
      time: "4d",
      assignee: { name: "John", avatar: "bg-red-500" },
      column: "todo",
    },
    {
      id: "TS0001245",
      title: "Mind Map",
      time: "2d 4h",
      assignee: { name: "Mike", avatar: "bg-gray-800" },
      column: "gotIt",
    },
    {
      id: "research-reports",
      title: "Research reports",
      time: "2d",
      assignee: { name: "Sarah", avatar: "bg-yellow-600" },
      column: "process",
    },
    {
      id: "research",
      title: "Research",
      time: "4d",
      assignee: { name: "Emma", avatar: "bg-red-500" },
      column: "completed",
    },
    {
      id: "ux-login",
      title: "UX Login + Registration",
      time: "2d",
      assignee: { name: "John", avatar: "bg-red-500" },
      column: "todo",
    },
    {
      id: "presentation",
      title: "Research reports (presentation for client)",
      time: "6h",
      assignee: { name: "Lisa", avatar: "bg-pink-500" },
      column: "process",
    },
    {
      id: "ui-login",
      title: "UI Login + Registration (+ other screens)",
      time: "1d 6h",
      assignee: { name: "John", avatar: "bg-red-500" },
      column: "todo",
    },
  ];

  // const backlogTasks = [
  //   {
  //     id: "animation-buttons",
  //     title: "Animation for buttons",
  //     time: "8h",
  //     priority: "low",
  //     assignee: { name: "Alex", avatar: "bg-blue-500" },
  //   },
  //   {
  //     id: "preloader",
  //     title: "Preloader",
  //     time: "6h",
  //     priority: "low",
  //     assignee: { name: "Mike", avatar: "bg-gray-800" },
  //   },
  //   {
  //     id: "animation-landing",
  //     title: "Animation for Landing page",
  //     time: "8h",
  //     priority: "low",
  //     assignee: { name: "Sarah", avatar: "bg-yellow-600" },
  //   },
  // ];

  const getTasksByColumn = (columnId) => {
    return activeTasks.filter((task) => task.column === columnId);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-[28px]">
        <h3 className="text-[#0A1629] text-[28px] sm:text-[36px] font-bold text-center sm:text-left">
          Tasks
        </h3>
        <button
          onClick={showModal}
          className="capitalize w-full sm:max-w-[182px] py-[13px] px-[22px] bg-[#1F2937] rounded-2xl text-white gap-[10px] flex items-center justify-center cursor-pointer shadow shadow-blue-300"
        >
          <span className="flex items-center text-xl">+</span>
          <span className="">Add Project</span>
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

      <Outlet />

      <div className="relative w-ful">
        <div className="w-full pb-4 overflow-x-auto">
          <div className='flex gap-5 min-w-[600px] sm:min-w-full'>
            {taskColumns.map((column) => (
              <div
                key={column.id}
                className="max-w-[300px] min-w-[250px] shrink-0 rounded-xl p-4 bg-[#E9E8E8] shadow-sm flex flex-col"
              >
                {/* Sticky header for column title */}
                <div className="border-b border-gray-300 pb-2 mb-3 sticky top-0 bg-[#E9E8E8] z-10">
                  <span className="font-semibold text-lg text-gray-800">{column.title}</span>
                </div>

                {/* Scrollable task list area */}
                <div className="space-y-3 pr-1">
                  {getTasksByColumn(column.id).map((task) => (
                    <div key={task.id} className="bg-white rounded-xl shadow p-4 w-full h-[220px] flex flex-col justify-between">
                      {/* Avatar yoki default rasm (bo'lmasa chiqarilmaydi) */}
                      {task.assignee?.avatarUrl ? (
                        <img
                          src={task.assignee.avatarUrl}
                          alt={task.assignee.name}
                          className="w-16 h-16 rounded-full mx-auto mb-3 object-cover"
                        />
                      ) : null}

                      {/* Task title */}
                      <h4 className="text-center text-gray-800 font-semibold">{task.title}</h4>

                      {/* Task info row */}
                      <div className="flex justify-between items-center text-sm text-gray-600 mt-4 px-2">
                        <div className="flex items-center gap-1">
                          <span>🕒</span>
                          <span>Jul 23</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <HiOutlineMenuAlt2 />
                          <BiComment />
                        </div>
                        <div
                          className={`flex items-center gap-1 ${completed === total ? "bg-[#64C064]" : "bg-[#DDDDDD]"
                            } text-white px-2 py-[2px] rounded-md text-xs font-medium`}
                        >
                          <BsCheck2Square />
                          <span>{completed} / {total}</span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add card button */}
                  <button
                    className="mt-2 w-full text-left text-sm text-blue-700 hover:underline cursor-pointer"
                    onClick={showCardModal}
                  >
                    + Add a card
                  </button>

                  <Modal
                    title="Add a card"
                    open={isCardModalOpen}
                    onOk={handleOk}
                    onCancel={handleCancel}
                    width={1196}
                    footer={null}
                  >
                    <div className="grid grid-cols-18 gap-6">
                      {/* Left Panel */}
                      <div className="col-span-10">
                        {/* Actions */}
                        <div className="grid grid-cols-5 mb-4 gap-4">
                          <Button><AiOutlinePlus /> Add</Button>
                          <Button><AiOutlineTags /> Labels</Button>
                          <Button>
                            <MdOutlineChecklist className="bg-black text-white rounded-[3px]" size={14} /> Checklist
                          </Button>
                          <Button><RiUserAddFill /> Members</Button>
                          <Button><ImAttachment /> Attachment</Button>
                        </div>

                        {/* Due Date */}
                        <div className="mt-10 mb-4 flex flex-col gap-[10px]">
                          <label className="font-medium mr-2">Due date:</label>
                          <div className="flex items-center gap-2 max-w-[300px]">
                            <DatePicker
                              showTime
                              value={dueDate}
                              onChange={(value) => setDueDate(value)}
                              format="MMM DD, h:mm A"
                              className="w-[200px]"
                            />
                            <span className="w-[100px] flex items-center justify-center px-[6px] py-[2px] rounded-sm bg-yellow-300 text-xs font-medium">
                              (Due soon)
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="flex flex-col mb-4 gap-[10px]">
                          <label className="flex font-medium mb-1 items-center gap-2">
                            <HiOutlineMenuAlt2 /> <span>Description</span>
                          </label>
                          <textarea
                            placeholder="Add a more detailed description..."
                            className="w-full border-2 border-gray-300 rounded p-2 h-[100px]"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                          />
                        </div>

                        {/* Checklist */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between">
                            <label className="flex items-center gap-1 font-medium mb-1"><BiCheckSquare size={18} /> <span>Checklist</span></label>
                            <div className="flex gap-2 mt-2">
                              <button size="small" className="bg-[#EBEBEB] px-[10px] py-[3px] rounded-sm cursor-pointer hover:bg-[#f4f3f3]">Hide checked items</button>
                              <button size="small" className="bg-[#EBEBEB] px-[10px] py-[3px] rounded-sm cursor-pointer hover:bg-[#f4f3f3]">Delete</button>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mb-3 mt-3">
                            <span className="font-semibold text-sm w-[40px]">100%</span>
                            <div className="flex-1 bg-gray-200 h-2 rounded">
                              <div className="bg-green-500 h-2 rounded w-full" />
                            </div>
                          </div>

                          {checklist.map((item) => (
                            <div key={item.id} className="flex items-center mb-1">
                              <Checkbox checked={item.checked}>{item.text}</Checkbox>
                            </div>
                          ))}
                        </div>

                        <button size="small" className="bg-[#EBEBEB] px-[10px] py-[3px] rounded-sm cursor-pointer hover:bg-[#f4f3f3] font-semibold">Add an item</button>
                      </div>

                      {/* Vertical Separator */}
                      <div className="col-span-1 flex justify-center">
                        <div className="w-px h-full bg-gray-200"></div>
                      </div>

                      {/* Right Panel - Comments and Activity */}
                      <div className="col-span-7 w-full max-w-md rounded bg-white p-4 shadow">
                        <div className="flex justify-between items-center mb-4">
                          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-1"><BiMessageDetail /> <span>Comments and activity</span></h2>
                          <button className="text-sm text-gray-600 hover:underline cursor-pointer">Show details</button>
                        </div>

                        <input
                          type="text"
                          placeholder="Write a comment..."
                          className="w-full p-2 border border-gray-300 rounded mb-4"
                        />

                        <ul className="space-y-4">
                          {activityData.map((item, index) => (
                            <li key={index} className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${item.color}`}>
                                {item.initials}
                              </div>
                              <div>
                                <p className="text-sm text-gray-800 font-medium">
                                  {item.name} <span className="font-normal">added this card to To do</span>
                                </p>
                                <p className="text-xs text-blue-600 hover:underline cursor-pointer">
                                  {item.time}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </Modal>

                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Tasks
